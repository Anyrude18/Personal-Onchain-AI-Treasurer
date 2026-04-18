"""
services/audit.py — Audit Ledger Service
Indexes AuditLedger.sol on-chain events, enriches them with
USD gas costs, actor labels, and compliance flags,
and exposes query / reporting / alert interfaces.
"""

from __future__ import annotations

import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────

# Known actor labels (contract addresses → human names)
ACTOR_LABELS: Dict[str, str] = {
    "0.0.1000": "TreasurerProxy",
    "0.0.1001": "YieldRouter",
    "0.0.1002": "SubscriptionVault",
    "0.0.1003": "BudgetGuard",
    "0.0.1004": "AuditLedger",
    "0.0.2000": "Treasury EOA",
}

# Compliance flag rules
COMPLIANCE_RULES = [
    ("OVER_BUDGET",       lambda e: e.get("gas_cost_usd", 0) > 50),
    ("LARGE_TX",          lambda e: e.get("parameters", {}).get("amount", 0) > 10_000),
    ("UNVERIFIED_ACTOR",  lambda e: e.get("actor") not in ACTOR_LABELS),
    ("HIGH_GAS",          lambda e: e.get("gas_used", 0) > 300_000),
    ("SUSPICIOUS_DEST",   lambda e: e.get("parameters", {}).get("recipient", "") in _blocked_addresses),
]

_blocked_addresses: set = set()


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id(prefix: str = "entry") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def _compute_flags(entry: Dict[str, Any]) -> List[str]:
    return [name for name, check in COMPLIANCE_RULES if check(entry)]


def _risk_score(flags: List[str]) -> int:
    """Simple weighted risk score 0-100."""
    weights = {
        "OVER_BUDGET":      20,
        "LARGE_TX":         20,
        "UNVERIFIED_ACTOR": 30,
        "HIGH_GAS":         15,
        "SUSPICIOUS_DEST":  50,
    }
    return min(100, sum(weights.get(f, 10) for f in flags))


def _gas_to_usd(gas_used: int, hbar_price: float = 0.085) -> float:
    """
    Approximate gas cost in USD.
    On Hedera, each gas unit costs ~0.000_082 HBAR (approximate mainnet rate).
    """
    hbar_per_gas = 0.000_082
    return round(gas_used * hbar_per_gas * hbar_price, 4)


# ── In-memory store (replace with TimescaleDB / PostgreSQL in production) ────
_entries:      List[Dict[str, Any]]       = []
_alert_rules:  Dict[str, Dict[str, Any]]  = {}
_alerts:       List[Dict[str, Any]]       = []


# ── Service ───────────────────────────────────────────────────────────────────

class AuditService:
    """
    Indexes, enriches, and serves on-chain audit events.
    Designed to be fed by an event listener that subscribes to AuditLedger.sol.
    """

    # ── Ingestion (called by event listener) ──────────────────────────────────

    async def ingest_event(self, raw_event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enrich a raw AuditLedger event and persist it.
        Call this from your Hedera SDK event subscriber whenever
        AuditLedger emits an ActionRecorded event.
        """
        gas_used    = raw_event.get("gas_used", 0)
        gas_cost    = _gas_to_usd(gas_used)
        actor       = raw_event.get("actor", "")
        actor_label = ACTOR_LABELS.get(actor)

        entry: Dict[str, Any] = {
            "entry_id":        _new_id("entry"),
            "tx_hash":         raw_event.get("tx_hash", ""),
            "block_number":    raw_event.get("block_number", 0),
            "timestamp":       raw_event.get("timestamp", _now_iso()),
            "actor":           actor,
            "actor_label":     actor_label,
            "action":          raw_event.get("action", "UNKNOWN"),
            "target_contract": raw_event.get("target_contract", ""),
            "parameters":      raw_event.get("parameters", {}),
            "gas_used":        gas_used,
            "gas_cost_usd":    gas_cost,
        }

        entry["compliance_flags"] = _compute_flags(entry)
        entry["risk_score"]       = _risk_score(entry["compliance_flags"])

        _entries.append(entry)
        logger.info("Audit entry ingested | entry_id=%s | action=%s | risk=%d",
                    entry["entry_id"], entry["action"], entry["risk_score"])

        # Fire alert checks
        await self._check_alerts(entry)
        return entry

    # ── Query ─────────────────────────────────────────────────────────────────

    async def list_entries(
        self,
        limit:        int = 50,
        offset:       int = 0,
        action:       Optional[str] = None,
        actor:        Optional[str] = None,
        from_ts:      Optional[str] = None,
        to_ts:        Optional[str] = None,
        flagged_only: bool = False,
    ) -> Dict[str, Any]:
        entries = list(reversed(_entries))

        if action:
            entries = [e for e in entries if e["action"] == action.upper()]
        if actor:
            entries = [e for e in entries if e["actor"] == actor]
        if from_ts:
            entries = [e for e in entries if e["timestamp"] >= from_ts]
        if to_ts:
            entries = [e for e in entries if e["timestamp"] <= to_ts]
        if flagged_only:
            entries = [e for e in entries if e["compliance_flags"]]

        total = len(entries)
        return {
            "total":   total,
            "limit":   limit,
            "offset":  offset,
            "entries": entries[offset: offset + limit],
        }

    async def get_entry(self, entry_id: str) -> Optional[Dict[str, Any]]:
        return next((e for e in _entries if e["entry_id"] == entry_id), None)

    async def get_entry_by_tx(self, tx_hash: str) -> Optional[Dict[str, Any]]:
        return next((e for e in _entries if e["tx_hash"] == tx_hash), None)

    # ── Compliance report ─────────────────────────────────────────────────────

    async def generate_compliance_report(
        self,
        from_ts: str,
        to_ts:   str,
    ) -> Dict[str, Any]:
        """Generate an aggregated compliance report for the specified period."""
        result = await self.list_entries(
            limit=10_000, offset=0, from_ts=from_ts, to_ts=to_ts
        )
        period_entries = result["entries"]

        flagged = [e for e in period_entries if e["compliance_flags"]]

        flag_breakdown: Dict[str, int] = {}
        for e in flagged:
            for f in e["compliance_flags"]:
                flag_breakdown[f] = flag_breakdown.get(f, 0) + 1

        # High-risk actors (risk_score > 50)
        actor_risk: Dict[str, int] = {}
        for e in period_entries:
            actor_risk[e["actor"]] = max(actor_risk.get(e["actor"], 0), e["risk_score"])
        high_risk_actors = [
            {"actor": a, "risk_score": s, "label": ACTOR_LABELS.get(a)}
            for a, s in actor_risk.items() if s > 50
        ]

        total_gas_usd = sum(e["gas_cost_usd"] for e in period_entries)

        return {
            "period_start":          from_ts,
            "period_end":            to_ts,
            "total_transactions":    len(period_entries),
            "flagged_transactions":  len(flagged),
            "flag_breakdown":        flag_breakdown,
            "high_risk_actors":      sorted(high_risk_actors, key=lambda x: -x["risk_score"]),
            "total_gas_cost_usd":    round(total_gas_usd, 4),
            "summary": (
                f"{len(flagged)} of {len(period_entries)} transactions flagged. "
                f"Total gas cost: ${total_gas_usd:.2f}."
            ),
        }

    # ── Alert rules ───────────────────────────────────────────────────────────

    async def create_alert_rule(self, rule_data: Dict[str, Any]) -> Dict[str, Any]:
        rule_id = _new_id("rule")
        rule_data["rule_id"] = rule_id
        rule_data.setdefault("enabled", True)
        _alert_rules[rule_id] = rule_data
        logger.info("Alert rule created | rule_id=%s | name=%s", rule_id, rule_data.get("name"))
        return rule_data

    async def get_alerts(
        self,
        limit:    int = 20,
        severity: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        alerts = list(reversed(_alerts))
        if severity:
            alerts = [a for a in alerts if a["severity"] == severity]
        return alerts[:limit]

    async def _check_alerts(self, entry: Dict[str, Any]) -> None:
        """Evaluate all active alert rules against a new entry and fire matches."""
        for rule in _alert_rules.values():
            if not rule.get("enabled"):
                continue
            condition = rule.get("condition", "")
            try:
                # Safe eval within a restricted namespace
                ns = {
                    "gas_cost_usd": entry["gas_cost_usd"],
                    "gas_used":     entry["gas_used"],
                    "risk_score":   entry["risk_score"],
                    "flags_count":  len(entry["compliance_flags"]),
                }
                if eval(condition, {"__builtins__": {}}, ns):  # noqa: S307
                    alert = {
                        "alert_id":    _new_id("alert"),
                        "rule_id":     rule["rule_id"],
                        "rule_name":   rule.get("name", ""),
                        "triggered_at": _now_iso(),
                        "entry_id":    entry["entry_id"],
                        "tx_hash":     entry["tx_hash"],
                        "severity":    rule.get("severity", "medium"),
                        "details":     f"Condition '{condition}' matched entry {entry['entry_id']}",
                    }
                    _alerts.append(alert)
                    logger.warning("Alert fired | rule=%s | entry=%s | severity=%s",
                                   rule["rule_id"], entry["entry_id"], alert["severity"])
                    webhook = rule.get("notify_webhook")
                    if webhook:
                        # TODO: dispatch async HTTP POST to webhook URL
                        pass
            except Exception as exc:
                logger.error("Alert condition eval failed | rule_id=%s | error=%s",
                             rule.get("rule_id"), exc)

    # ── Export ────────────────────────────────────────────────────────────────

    async def export(
        self,
        from_ts: str,
        to_ts:   str,
        fmt:     str = "csv",
    ) -> Dict[str, str]:
        """
        Trigger an export job and return a (mock) pre-signed URL.
        In production this would stream to S3 / IPFS and return a real URL.
        """
        export_id = _new_id("export")
        expires   = datetime.now(timezone.utc).isoformat()
        url = f"https://storage.example.com/audit-exports/{export_id}.{fmt}?expires={expires}"
        logger.info("Audit export requested | id=%s | format=%s | %s → %s",
                    export_id, fmt, from_ts, to_ts)
        return {"url": url, "expires_at": expires}