"""
routers/audit.py — Immutable audit ledger endpoints
Read-only interface into on-chain AuditLedger.sol events plus
off-chain enrichment (gas cost, actor labels, compliance flags).
"""

from fastapi import APIRouter, HTTPException, Query, Path, status
from pydantic import BaseModel, Field
from typing import Optional, List
import logging

from services.audit import AuditService

logger = logging.getLogger(__name__)
router = APIRouter()
audit_svc = AuditService()


# ── Schemas ───────────────────────────────────────────────────────────────────

class AuditEntry(BaseModel):
    entry_id: str
    tx_hash: str
    block_number: int
    timestamp: str
    actor: str                    # EOA or contract address
    actor_label: Optional[str]    # human-readable label if known
    action: str                   # e.g. "YIELD_ROUTE", "BUDGET_UPDATE", "SWAP"
    target_contract: str
    parameters: dict
    gas_used: int
    gas_cost_usd: float
    compliance_flags: List[str]   # e.g. ["OVER_BUDGET", "UNVERIFIED_ACTOR"]
    risk_score: int               # 0-100

class AuditListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    entries: List[AuditEntry]

class ComplianceReport(BaseModel):
    period_start: str
    period_end: str
    total_transactions: int
    flagged_transactions: int
    flag_breakdown: dict
    high_risk_actors: List[dict]
    total_gas_cost_usd: float
    summary: str

class AlertRule(BaseModel):
    rule_id: Optional[str]
    name: str
    condition: str        # e.g. "gas_cost_usd > 50"
    severity: str         # "low" | "medium" | "high" | "critical"
    notify_webhook: Optional[str]
    enabled: bool = True

class AuditAlert(BaseModel):
    alert_id: str
    rule_id: str
    rule_name: str
    triggered_at: str
    entry_id: str
    tx_hash: str
    severity: str
    details: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get(
    "/entries",
    response_model=AuditListResponse,
    summary="Paginated audit log entries",
)
async def list_audit_entries(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    action: Optional[str] = Query(default=None, description="Filter by action type"),
    actor: Optional[str] = Query(default=None, description="Filter by actor address"),
    from_ts: Optional[str] = Query(default=None, description="ISO 8601 start timestamp"),
    to_ts: Optional[str] = Query(default=None, description="ISO 8601 end timestamp"),
    flagged_only: bool = Query(default=False, description="Return only compliance-flagged entries"),
):
    """
    Retrieve paginated on-chain audit events enriched with USD gas costs,
    actor labels, and compliance flags.
    """
    try:
        result = await audit_svc.list_entries(
            limit=limit,
            offset=offset,
            action=action,
            actor=actor,
            from_ts=from_ts,
            to_ts=to_ts,
            flagged_only=flagged_only,
        )
        return AuditListResponse(**result)
    except Exception:
        logger.exception("Audit list failed")
        raise HTTPException(status_code=500, detail="Failed to fetch audit entries")


@router.get(
    "/entries/{entry_id}",
    response_model=AuditEntry,
    summary="Single audit entry detail",
)
async def get_audit_entry(
    entry_id: str = Path(..., description="Audit entry ID"),
):
    """Fetch a single enriched audit entry by its unique ID."""
    try:
        entry = await audit_svc.get_entry(entry_id)
        if not entry:
            raise HTTPException(status_code=404, detail="Audit entry not found")
        return AuditEntry(**entry)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Entry fetch failed")
        raise HTTPException(status_code=500, detail="Failed to fetch audit entry")


@router.get(
    "/compliance/report",
    response_model=ComplianceReport,
    summary="Compliance summary report for a time period",
)
async def get_compliance_report(
    from_ts: str = Query(..., description="ISO 8601 start timestamp"),
    to_ts: str = Query(..., description="ISO 8601 end timestamp"),
):
    """
    Generate a compliance report covering flagged transactions, high-risk actors,
    and aggregate gas expenditure for the specified period.
    """
    try:
        report = await audit_svc.generate_compliance_report(
            from_ts=from_ts,
            to_ts=to_ts,
        )
        return ComplianceReport(**report)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        logger.exception("Compliance report generation failed")
        raise HTTPException(status_code=500, detail="Failed to generate compliance report")


@router.get(
    "/tx/{tx_hash}",
    response_model=AuditEntry,
    summary="Audit entry by transaction hash",
)
async def get_entry_by_tx(tx_hash: str):
    """Retrieve the audit entry associated with a specific transaction hash."""
    try:
        entry = await audit_svc.get_entry_by_tx(tx_hash)
        if not entry:
            raise HTTPException(status_code=404, detail="Transaction not found in audit log")
        return AuditEntry(**entry)
    except HTTPException:
        raise
    except Exception:
        logger.exception("TX lookup failed")
        raise HTTPException(status_code=500, detail="Failed to fetch audit entry")


@router.post(
    "/alerts/rules",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new alert rule",
)
async def create_alert_rule(rule: AlertRule):
    """Register a new alert rule that fires when an audit condition is met."""
    try:
        created = await audit_svc.create_alert_rule(rule.dict())
        return {"rule_id": created["rule_id"], "status": "created"}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        logger.exception("Alert rule creation failed")
        raise HTTPException(status_code=500, detail="Failed to create alert rule")


@router.get(
    "/alerts",
    response_model=List[AuditAlert],
    summary="Recent triggered alerts",
)
async def get_alerts(
    limit: int = Query(default=20, ge=1, le=200),
    severity: Optional[str] = Query(default=None),
):
    """List recently triggered audit alerts."""
    try:
        alerts = await audit_svc.get_alerts(limit=limit, severity=severity)
        return [AuditAlert(**a) for a in alerts]
    except Exception:
        logger.exception("Alert fetch failed")
        raise HTTPException(status_code=500, detail="Failed to fetch alerts")


@router.get(
    "/export",
    summary="Export audit log as CSV (returns download URL)",
)
async def export_audit_log(
    from_ts: str = Query(...),
    to_ts: str = Query(...),
    format: str = Query(default="csv", regex="^(csv|json)$"),
):
    """Trigger an off-chain export job and return a pre-signed download URL."""
    try:
        export = await audit_svc.export(from_ts=from_ts, to_ts=to_ts, fmt=format)
        return {"download_url": export["url"], "expires_at": export["expires_at"]}
    except Exception:
        logger.exception("Audit export failed")
        raise HTTPException(status_code=500, detail="Failed to export audit log")