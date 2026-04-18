"""
routers/budget.py — Budget policy management endpoints
CRUD for budget rules stored in BudgetGuard.sol,
real-time spend tracking, and policy simulation.
"""

from fastapi import APIRouter, HTTPException, Path, Query, status
from pydantic import BaseModel, Field
from typing import Optional, List
import logging

from services.budget_engine import BudgetEngine

logger = logging.getLogger(__name__)
router = APIRouter()
engine = BudgetEngine()


# ── Schemas ───────────────────────────────────────────────────────────────────

class BudgetRule(BaseModel):
    rule_id: Optional[str] = None
    name: str = Field(..., description="Human-readable rule name")
    token: str = Field(..., description="Token symbol or address")
    max_spend_per_period: float = Field(..., gt=0)
    period_type: str = Field(..., description="daily | weekly | monthly | custom")
    period_seconds: Optional[int] = Field(default=None, description="Required when period_type=custom")
    recipient_whitelist: Optional[List[str]] = Field(default=None)
    requires_multisig: bool = False
    min_approvals: int = Field(default=1, ge=1)
    active: bool = True

class BudgetRuleResponse(BudgetRule):
    rule_id: str
    created_at: str
    updated_at: str
    on_chain_id: Optional[str]    # BudgetGuard contract rule ID

class SpendRecord(BaseModel):
    record_id: str
    rule_id: str
    token: str
    amount: float
    usd_value: float
    recipient: str
    tx_hash: str
    timestamp: str
    approved_by: List[str]

class BudgetUtilization(BaseModel):
    rule_id: str
    rule_name: str
    token: str
    period_start: str
    period_end: str
    budget_limit: float
    spent: float
    remaining: float
    utilization_pct: float
    status: str      # "ok" | "warning" | "exceeded"

class PolicySimulation(BaseModel):
    proposed_spend: float
    token: str
    recipient: str

class SimulationResult(BaseModel):
    would_pass: bool
    triggered_rules: List[str]
    blocked_by: Optional[str]
    remaining_after: float
    warnings: List[str]

class BudgetSummary(BaseModel):
    total_rules: int
    active_rules: int
    total_budget_usd: float
    total_spent_usd: float
    exceeded_rules: List[str]
    warning_rules: List[str]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get(
    "/rules",
    response_model=List[BudgetRuleResponse],
    summary="List all budget rules",
)
async def list_rules(
    active_only: bool = Query(default=False),
    token: Optional[str] = Query(default=None),
):
    """Return all budget rules, optionally filtered by status or token."""
    try:
        rules = await engine.list_rules(active_only=active_only, token=token)
        return [BudgetRuleResponse(**r) for r in rules]
    except Exception:
        logger.exception("Rule listing failed")
        raise HTTPException(status_code=500, detail="Failed to list budget rules")


@router.post(
    "/rules",
    response_model=BudgetRuleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new budget rule",
)
async def create_rule(rule: BudgetRule):
    """
    Create a budget rule and propagate it to BudgetGuard.sol on-chain.
    Returns the created rule including its on-chain ID.
    """
    try:
        created = await engine.create_rule(rule.dict())
        return BudgetRuleResponse(**created)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        logger.exception("Rule creation failed")
        raise HTTPException(status_code=500, detail="Failed to create budget rule")


@router.put(
    "/rules/{rule_id}",
    response_model=BudgetRuleResponse,
    summary="Update an existing budget rule",
)
async def update_rule(
    rule_id: str = Path(...),
    rule: BudgetRule = ...,
):
    """Update a budget rule on-chain and in the off-chain index."""
    try:
        updated = await engine.update_rule(rule_id=rule_id, data=rule.dict())
        if not updated:
            raise HTTPException(status_code=404, detail="Rule not found")
        return BudgetRuleResponse(**updated)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        logger.exception("Rule update failed")
        raise HTTPException(status_code=500, detail="Failed to update budget rule")


@router.delete(
    "/rules/{rule_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Deactivate a budget rule",
)
async def delete_rule(rule_id: str = Path(...)):
    """Soft-delete (deactivate) a budget rule. On-chain rule is paused, not removed."""
    try:
        success = await engine.deactivate_rule(rule_id)
        if not success:
            raise HTTPException(status_code=404, detail="Rule not found")
    except HTTPException:
        raise
    except Exception:
        logger.exception("Rule deletion failed")
        raise HTTPException(status_code=500, detail="Failed to deactivate budget rule")


@router.get(
    "/utilization",
    response_model=List[BudgetUtilization],
    summary="Current budget utilization for all active rules",
)
async def get_utilization(token: Optional[str] = Query(default=None)):
    """
    Return real-time budget utilization metrics — how much has been spent
    in the current period vs. the configured limit.
    """
    try:
        util = await engine.get_utilization(token=token)
        return [BudgetUtilization(**u) for u in util]
    except Exception:
        logger.exception("Utilization fetch failed")
        raise HTTPException(status_code=500, detail="Failed to fetch utilization")


@router.get(
    "/utilization/{rule_id}",
    response_model=BudgetUtilization,
    summary="Utilization for a specific rule",
)
async def get_rule_utilization(rule_id: str = Path(...)):
    """Detailed utilization for one specific budget rule."""
    try:
        util = await engine.get_rule_utilization(rule_id)
        if not util:
            raise HTTPException(status_code=404, detail="Rule not found")
        return BudgetUtilization(**util)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Rule utilization fetch failed")
        raise HTTPException(status_code=500, detail="Failed to fetch rule utilization")


@router.post(
    "/simulate",
    response_model=SimulationResult,
    summary="Simulate whether a proposed spend would pass budget rules",
)
async def simulate_spend(payload: PolicySimulation):
    """
    Dry-run a proposed spend against all active BudgetGuard rules
    without actually executing it. Useful for pre-flight checks.
    """
    try:
        result = await engine.simulate_spend(
            amount=payload.proposed_spend,
            token=payload.token,
            recipient=payload.recipient,
        )
        return SimulationResult(**result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        logger.exception("Policy simulation failed")
        raise HTTPException(status_code=500, detail="Simulation error")


@router.get(
    "/summary",
    response_model=BudgetSummary,
    summary="High-level budget health summary",
)
async def get_budget_summary():
    """Return a dashboard-level summary of overall budget health."""
    try:
        summary = await engine.get_summary()
        return BudgetSummary(**summary)
    except Exception:
        logger.exception("Budget summary failed")
        raise HTTPException(status_code=500, detail="Failed to fetch budget summary")


@router.get(
    "/spend-history",
    response_model=List[SpendRecord],
    summary="Historical spend records",
)
async def get_spend_history(
    rule_id: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    """Paginated list of on-chain spend events recorded by BudgetGuard."""
    try:
        records = await engine.get_spend_history(
            rule_id=rule_id,
            limit=limit,
            offset=offset,
        )
        return [SpendRecord(**r) for r in records]
    except Exception:
        logger.exception("Spend history fetch failed")
        raise HTTPException(status_code=500, detail="Failed to fetch spend history")