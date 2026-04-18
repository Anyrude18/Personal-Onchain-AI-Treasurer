"""
services/ai_orchestrator.py — AI Agent Orchestration Service
Parses natural-language treasury commands, generates strategies,
manages an approval queue, and dispatches on-chain transactions via
the TreasurerProxy contract.
"""

from __future__ import annotations

import uuid
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)


# ── Intent constants ──────────────────────────────────────────────────────────
INTENT_REBALANCE    = "REBALANCE"
INTENT_STAKE        = "STAKE"
INTENT_UNSTAKE      = "UNSTAKE"
INTENT_SWAP         = "SWAP"
INTENT_YIELD_ROUTE  = "YIELD_ROUTE"
INTENT_WITHDRAW     = "WITHDRAW"
INTENT_UNKNOWN      = "UNKNOWN"

RISK_PROFILES       = ("conservative", "balanced", "aggressive")


# ── In-memory state (replace with Redis/DB in production) ────────────────────
_pending_queue: Dict[str, Dict[str, Any]] = {}
_execution_history: List[Dict[str, Any]] = []


# ── Helpers ───────────────────────────────────────────────────────────────────

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id(prefix: str = "req") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def _parse_intent(command: str) -> str:
    """
    Lightweight keyword-based intent classifier.
    In production replace with an LLM-powered intent parser or
    a fine-tuned classifier.
    """
    cmd = command.lower()
    if any(kw in cmd for kw in ("rebalance", "reallocate", "redistribute")):
        return INTENT_REBALANCE
    if any(kw in cmd for kw in ("stake", "staking", "delegate")):
        return INTENT_STAKE
    if any(kw in cmd for kw in ("unstake", "undelegat", "withdraw stake")):
        return INTENT_UNSTAKE
    if any(kw in cmd for kw in ("swap", "exchange", "convert", "trade")):
        return INTENT_SWAP
    if any(kw in cmd for kw in ("yield", "farm", "liquidity", "lp", "deploy")):
        return INTENT_YIELD_ROUTE
    if any(kw in cmd for kw in ("withdraw", "pull", "retrieve")):
        return INTENT_WITHDRAW
    return INTENT_UNKNOWN


def _build_actions_for_intent(intent: str, command: str, context: dict) -> List[dict]:
    """
    Translate parsed intent into a list of structured on-chain action objects.
    Each action maps to a contract call on TreasurerProxy / YieldRouter / etc.
    """
    base: List[dict] = []

    if intent == INTENT_REBALANCE:
        base = [
            {
                "contract": "TreasurerProxy",
                "function": "rebalancePortfolio",
                "params": {"strategy": context.get("strategy", "balanced")},
                "estimated_gas": 250_000,
            }
        ]
    elif intent == INTENT_STAKE:
        base = [
            {
                "contract": "HBARStakingAdapter",
                "function": "stake",
                "params": {
                    "amount": context.get("amount", 0),
                    "validator": context.get("validator", ""),
                },
                "estimated_gas": 120_000,
            }
        ]
    elif intent == INTENT_UNSTAKE:
        base = [
            {
                "contract": "HBARStakingAdapter",
                "function": "unstake",
                "params": {"amount": context.get("amount", 0)},
                "estimated_gas": 100_000,
            }
        ]
    elif intent == INTENT_SWAP:
        base = [
            {
                "contract": "SaucerSwapAdapter",
                "function": "swapExactTokensForTokens",
                "params": {
                    "tokenIn":  context.get("token_in", "HBAR"),
                    "tokenOut": context.get("token_out", "USDC"),
                    "amountIn": context.get("amount", 0),
                    "slippage": context.get("slippage_bps", 50),
                },
                "estimated_gas": 200_000,
            }
        ]
    elif intent == INTENT_YIELD_ROUTE:
        base = [
            {
                "contract": "YieldRouter",
                "function": "routeYield",
                "params": {
                    "protocol": context.get("protocol", "saucerswap"),
                    "amount":   context.get("amount", 0),
                    "token":    context.get("token", "HBAR"),
                },
                "estimated_gas": 180_000,
            }
        ]
    elif intent == INTENT_WITHDRAW:
        base = [
            {
                "contract": "TreasurerProxy",
                "function": "withdraw",
                "params": {
                    "token":     context.get("token", "HBAR"),
                    "amount":    context.get("amount", 0),
                    "recipient": context.get("recipient", ""),
                },
                "estimated_gas": 90_000,
            }
        ]

    return base


# ── Service Class ─────────────────────────────────────────────────────────────

class AIOrchestrator:
    """
    Core AI orchestration service.
    Coordinates intent parsing, action building, approval queuing,
    and on-chain execution via TreasurerProxy.
    """

    # ── Command processing ────────────────────────────────────────────────────

    async def process_command(
        self,
        command: str,
        context: Dict[str, Any],
        dry_run: bool = False,
    ) -> Dict[str, Any]:
        """
        Parse a natural-language command and return structured actions.
        If dry_run=True the actions are NOT queued for execution.
        """
        intent = _parse_intent(command)
        if intent == INTENT_UNKNOWN:
            raise ValueError(
                f"Could not determine a treasury action from: '{command}'. "
                "Please be more specific (e.g. 'stake 500 HBAR with validator 0.0.12345')."
            )

        actions = _build_actions_for_intent(intent, command, context)
        total_gas = sum(a.get("estimated_gas", 0) for a in actions)
        request_id = _new_id("req")

        record: Dict[str, Any] = {
            "request_id": request_id,
            "status": "dry_run" if dry_run else "pending_approval",
            "intent": intent,
            "actions": actions,
            "estimated_gas": total_gas,
            "dry_run": dry_run,
            "message": (
                f"Dry run: {len(actions)} action(s) identified."
                if dry_run
                else f"{len(actions)} action(s) queued for approval."
            ),
            "created_at": _now_iso(),
        }

        if not dry_run:
            _pending_queue[request_id] = record

        logger.info("Command processed | request_id=%s | intent=%s | dry_run=%s",
                    request_id, intent, dry_run)
        return record

    # ── Strategy generation ───────────────────────────────────────────────────

    async def generate_strategy(
        self,
        risk_profile: str,
        time_horizon_days: int,
        assets: Optional[List[str]],
    ) -> Dict[str, Any]:
        """
        Generate a recommended allocation + yield strategy.
        In production this would call an LLM or ML model with live market data.
        """
        if risk_profile not in RISK_PROFILES:
            raise ValueError(f"Invalid risk profile. Choose from: {RISK_PROFILES}")

        # Deterministic placeholder allocations — replace with ML model output.
        allocations = {
            "conservative": [
                {"token": "USDC", "target_pct": 50, "protocol": "hbar_staking", "expected_apy": 4.5},
                {"token": "HBAR", "target_pct": 35, "protocol": "hbar_staking",  "expected_apy": 5.2},
                {"token": "WBTC", "target_pct": 15, "protocol": "saucerswap_lp", "expected_apy": 8.1},
            ],
            "balanced": [
                {"token": "HBAR",  "target_pct": 40, "protocol": "saucerswap_lp", "expected_apy": 9.3},
                {"token": "USDC",  "target_pct": 30, "protocol": "hbar_staking",  "expected_apy": 4.5},
                {"token": "SAUCE", "target_pct": 20, "protocol": "saucerswap_lp", "expected_apy": 18.7},
                {"token": "WETH",  "target_pct": 10, "protocol": "saucerswap_lp", "expected_apy": 7.4},
            ],
            "aggressive": [
                {"token": "SAUCE", "target_pct": 40, "protocol": "saucerswap_lp", "expected_apy": 24.1},
                {"token": "HBAR",  "target_pct": 35, "protocol": "saucerswap_lp", "expected_apy": 12.8},
                {"token": "WBTC",  "target_pct": 15, "protocol": "saucerswap_lp", "expected_apy": 9.6},
                {"token": "USDC",  "target_pct": 10, "protocol": "hbar_staking",  "expected_apy": 4.5},
            ],
        }[risk_profile]

        if assets:
            allocations = [a for a in allocations if a["token"] in assets]

        blended_apy = (
            sum(a["target_pct"] * a["expected_apy"] for a in allocations) / 100
            if allocations else 0.0
        )

        return {
            "strategy_id": _new_id("strat"),
            "risk_profile": risk_profile,
            "recommended_allocations": allocations,
            "projected_apy": round(blended_apy, 2),
            "confidence_score": {"conservative": 0.91, "balanced": 0.84, "aggressive": 0.72}[risk_profile],
            "reasoning": (
                f"Based on {time_horizon_days}-day horizon with {risk_profile} risk profile. "
                "Allocations optimized for blended yield while respecting drawdown constraints."
            ),
        }

    # ── Approval handling ────────────────────────────────────────────────────

    async def handle_approval(
        self,
        request_id: str,
        approved: bool,
        approver: str,
    ) -> Dict[str, Any]:
        """Update a queued execution request with the approver's decision."""
        record = _pending_queue.get(request_id)
        if not record:
            raise KeyError(f"Request {request_id} not found in pending queue")

        record["approved_by"] = approver
        record["approved_at"] = _now_iso()
        record["status"] = "approved" if approved else "rejected"

        if not approved:
            _pending_queue.pop(request_id, None)
            _execution_history.append(record)

        logger.info("Approval | request_id=%s | approved=%s | approver=%s",
                    request_id, approved, approver)
        return {"status": record["status"], "ready": approved}

    # ── Execution ─────────────────────────────────────────────────────────────

    async def queue_execution(
        self,
        request_id: str,
        actions: List[Dict[str, Any]],
    ) -> None:
        """Background task: enqueue actions for the on-chain dispatcher."""
        logger.info("Queuing %d action(s) for request_id=%s", len(actions), request_id)
        # TODO: push to a job queue (Celery / Redis Streams) that calls TreasurerProxy
        await asyncio.sleep(0)   # yield to event loop

    async def execute_approved(self, request_id: str) -> None:
        """Background task: submit an approved request's actions on-chain."""
        record = _pending_queue.pop(request_id, None)
        if not record:
            logger.warning("execute_approved: request_id=%s not found", request_id)
            return

        record["status"] = "executing"
        logger.info("Executing on-chain | request_id=%s | actions=%d",
                    request_id, len(record["actions"]))

        # TODO: sign + submit each action via Hedera SDK / ethers.js bridge
        await asyncio.sleep(0)

        record["status"] = "completed"
        record["completed_at"] = _now_iso()
        _execution_history.append(record)
        logger.info("Execution complete | request_id=%s", request_id)

    # ── Status & history ──────────────────────────────────────────────────────

    async def get_status(self) -> Dict[str, Any]:
        """Return current agent health and counters."""
        return {
            "agent_id": "treasury-agent-v1",
            "status": "active",
            "pending_actions": len(_pending_queue),
            "last_execution": (
                _execution_history[-1].get("completed_at")
                if _execution_history else None
            ),
            "total_managed_usd": 0.0,   # TODO: sum from portfolio service
        }

    async def get_execution_history(
        self,
        limit: int = 20,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """Return paginated execution history (newest first)."""
        reversed_history = list(reversed(_execution_history))
        return reversed_history[offset: offset + limit]