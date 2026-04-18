"""
routers/agent.py — AI Agent orchestration endpoints
Handles natural-language treasury commands, strategy recommendations,
and autonomous execution approvals.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, status
from pydantic import BaseModel, Field
from typing import Optional, List
import logging

from services.ai_orchestrator import AIOrchestrator

logger = logging.getLogger(__name__)
router = APIRouter()
orchestrator = AIOrchestrator()


# ── Schemas ───────────────────────────────────────────────────────────────────

class AgentCommandRequest(BaseModel):
    command: str = Field(..., description="Natural language treasury command", min_length=3)
    context: Optional[dict] = Field(default=None, description="Optional extra context for the agent")
    dry_run: bool = Field(default=False, description="Simulate without executing on-chain")

class AgentCommandResponse(BaseModel):
    request_id: str
    status: str
    intent: str
    actions: List[dict]
    estimated_gas: Optional[int]
    dry_run: bool
    message: str

class StrategyRequest(BaseModel):
    risk_profile: str = Field(..., description="conservative | balanced | aggressive")
    time_horizon_days: int = Field(default=30, ge=1, le=365)
    assets: Optional[List[str]] = Field(default=None, description="Specific assets to consider")

class StrategyResponse(BaseModel):
    strategy_id: str
    risk_profile: str
    recommended_allocations: List[dict]
    projected_apy: float
    confidence_score: float
    reasoning: str

class ExecutionApprovalRequest(BaseModel):
    request_id: str
    approved: bool
    approver_address: str

class AgentStatusResponse(BaseModel):
    agent_id: str
    status: str
    pending_actions: int
    last_execution: Optional[str]
    total_managed_usd: float


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post(
    "/command",
    response_model=AgentCommandResponse,
    status_code=status.HTTP_200_OK,
    summary="Send a natural language command to the AI treasury agent",
)
async def send_agent_command(
    payload: AgentCommandRequest,
    background_tasks: BackgroundTasks,
):
    """
    Parse a natural-language instruction (e.g. 'Rebalance 20% of HBAR into stablecoin yield')
    and translate it into validated on-chain actions via the AI orchestrator.
    """
    try:
        result = await orchestrator.process_command(
            command=payload.command,
            context=payload.context or {},
            dry_run=payload.dry_run,
        )

        if not payload.dry_run and result.get("actions"):
            background_tasks.add_task(
                orchestrator.queue_execution,
                request_id=result["request_id"],
                actions=result["actions"],
            )

        return AgentCommandResponse(**result)

    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("Agent command processing failed")
        raise HTTPException(status_code=500, detail="Agent processing error")


@router.post(
    "/strategy",
    response_model=StrategyResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate an AI-driven treasury strategy",
)
async def generate_strategy(payload: StrategyRequest):
    """
    Generate a yield and allocation strategy based on the risk profile
    and current on-chain market conditions.
    """
    try:
        strategy = await orchestrator.generate_strategy(
            risk_profile=payload.risk_profile,
            time_horizon_days=payload.time_horizon_days,
            assets=payload.assets,
        )
        return StrategyResponse(**strategy)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        logger.exception("Strategy generation failed")
        raise HTTPException(status_code=500, detail="Strategy generation error")


@router.post(
    "/approve",
    status_code=status.HTTP_200_OK,
    summary="Approve or reject a pending agent execution",
)
async def approve_execution(
    payload: ExecutionApprovalRequest,
    background_tasks: BackgroundTasks,
):
    """
    Human-in-the-loop approval gate. Approve or reject an agent-queued
    on-chain action before it is submitted.
    """
    try:
        result = await orchestrator.handle_approval(
            request_id=payload.request_id,
            approved=payload.approved,
            approver=payload.approver_address,
        )
        if payload.approved and result.get("ready"):
            background_tasks.add_task(
                orchestrator.execute_approved,
                request_id=payload.request_id,
            )
        return {"request_id": payload.request_id, "approved": payload.approved, "status": result.get("status")}
    except KeyError:
        raise HTTPException(status_code=404, detail="Request ID not found")
    except Exception:
        logger.exception("Approval handling failed")
        raise HTTPException(status_code=500, detail="Approval processing error")


@router.get(
    "/status",
    response_model=AgentStatusResponse,
    summary="Get current AI agent status",
)
async def get_agent_status():
    """Return the agent's current operational status and high-level stats."""
    try:
        status_data = await orchestrator.get_status()
        return AgentStatusResponse(**status_data)
    except Exception:
        logger.exception("Status fetch failed")
        raise HTTPException(status_code=500, detail="Unable to fetch agent status")


@router.get(
    "/history",
    summary="Get agent execution history",
)
async def get_execution_history(limit: int = 20, offset: int = 0):
    """Paginated list of past agent executions."""
    try:
        history = await orchestrator.get_execution_history(limit=limit, offset=offset)
        return {"executions": history, "limit": limit, "offset": offset}
    except Exception:
        logger.exception("History fetch failed")
        raise HTTPException(status_code=500, detail="Unable to fetch history")