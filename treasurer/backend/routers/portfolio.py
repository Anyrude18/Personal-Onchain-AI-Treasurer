"""
routers/portfolio.py — Portfolio analytics & DeFi position endpoints
Surfaces on-chain treasury positions, yield sources, rebalancing signals,
and SaucerSwap / HBAR-staking analytics via the DeFi analytics service.
"""

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field
from typing import Optional, List
import logging

from services.defi_analytics import DeFiAnalytics

logger = logging.getLogger(__name__)
router = APIRouter()
analytics = DeFiAnalytics()


# ── Schemas ───────────────────────────────────────────────────────────────────

class TokenPosition(BaseModel):
    token_symbol: str
    token_address: str
    balance: float
    usd_value: float
    allocation_pct: float
    protocol: Optional[str]
    apy: Optional[float]

class PortfolioSnapshot(BaseModel):
    treasury_address: str
    total_usd_value: float
    positions: List[TokenPosition]
    timestamp: str
    chain: str = "hedera"

class YieldSource(BaseModel):
    protocol: str
    strategy: str
    token: str
    deposited_usd: float
    earned_usd: float
    apy: float
    lock_period_days: int

class YieldSummary(BaseModel):
    total_deposited_usd: float
    total_earned_usd: float
    blended_apy: float
    sources: List[YieldSource]

class RebalanceSignal(BaseModel):
    token: str
    current_allocation_pct: float
    target_allocation_pct: float
    delta_pct: float
    action: str          # "buy" | "sell" | "hold"
    urgency: str         # "low" | "medium" | "high"

class RebalanceReport(BaseModel):
    needs_rebalance: bool
    signals: List[RebalanceSignal]
    estimated_slippage_pct: float
    recommended_route: str

class LiquidityPosition(BaseModel):
    pool_id: str
    token_a: str
    token_b: str
    liquidity_usd: float
    fee_tier_bps: int
    earned_fees_usd: float
    il_usd: float          # impermanent loss
    net_pnl_usd: float

class StakingPosition(BaseModel):
    validator_id: str
    staked_hbar: float
    staked_usd: float
    pending_rewards_hbar: float
    apy: float
    unlock_epoch: Optional[int]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get(
    "/snapshot/{treasury_address}",
    response_model=PortfolioSnapshot,
    summary="Full treasury portfolio snapshot",
)
async def get_portfolio_snapshot(treasury_address: str):
    """
    Fetch a real-time snapshot of all token balances held by the treasury proxy,
    including USD valuations and protocol attributions.
    """
    try:
        snapshot = await analytics.get_portfolio_snapshot(treasury_address)
        return PortfolioSnapshot(**snapshot)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        logger.exception("Portfolio snapshot failed")
        raise HTTPException(status_code=500, detail="Failed to fetch portfolio snapshot")


@router.get(
    "/yield/{treasury_address}",
    response_model=YieldSummary,
    summary="Yield positions and earnings",
)
async def get_yield_summary(treasury_address: str):
    """
    Aggregate yield farming / staking positions across all protocols
    (SaucerSwap LP, HBAR staking, etc.) and return blended APY.
    """
    try:
        summary = await analytics.get_yield_summary(treasury_address)
        return YieldSummary(**summary)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        logger.exception("Yield summary failed")
        raise HTTPException(status_code=500, detail="Failed to fetch yield summary")


@router.get(
    "/rebalance/{treasury_address}",
    response_model=RebalanceReport,
    summary="Rebalancing signals based on target allocations",
)
async def get_rebalance_signals(
    treasury_address: str,
    tolerance_pct: float = Query(default=5.0, ge=0.1, le=50.0, description="Drift tolerance before flagging"),
):
    """
    Compare current allocations against the target policy stored in BudgetGuard
    and return actionable rebalancing signals.
    """
    try:
        report = await analytics.compute_rebalance_signals(
            treasury_address=treasury_address,
            tolerance_pct=tolerance_pct,
        )
        return RebalanceReport(**report)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        logger.exception("Rebalance signal computation failed")
        raise HTTPException(status_code=500, detail="Failed to compute rebalance signals")


@router.get(
    "/liquidity/{treasury_address}",
    response_model=List[LiquidityPosition],
    summary="SaucerSwap liquidity positions",
)
async def get_liquidity_positions(treasury_address: str):
    """Return all active SaucerSwap LP positions with fee earnings and IL tracking."""
    try:
        positions = await analytics.get_liquidity_positions(treasury_address)
        return [LiquidityPosition(**p) for p in positions]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        logger.exception("Liquidity positions fetch failed")
        raise HTTPException(status_code=500, detail="Failed to fetch liquidity positions")


@router.get(
    "/staking/{treasury_address}",
    response_model=List[StakingPosition],
    summary="HBAR staking positions",
)
async def get_staking_positions(treasury_address: str):
    """Return all active HBAR staking positions across validators."""
    try:
        positions = await analytics.get_staking_positions(treasury_address)
        return [StakingPosition(**p) for p in positions]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        logger.exception("Staking positions fetch failed")
        raise HTTPException(status_code=500, detail="Failed to fetch staking positions")


@router.get(
    "/performance/{treasury_address}",
    summary="Historical portfolio performance",
)
async def get_performance(
    treasury_address: str,
    days: int = Query(default=30, ge=1, le=365),
):
    """
    Return time-series portfolio value, cumulative yield, and drawdown
    for the requested historical window.
    """
    try:
        perf = await analytics.get_performance_history(
            treasury_address=treasury_address,
            days=days,
        )
        return perf
    except Exception:
        logger.exception("Performance history fetch failed")
        raise HTTPException(status_code=500, detail="Failed to fetch performance history")


@router.get(
    "/prices",
    summary="Current token prices (USD)",
)
async def get_token_prices(
    tokens: Optional[str] = Query(default=None, description="Comma-separated token symbols"),
):
    """Fetch latest USD prices for tracked treasury tokens."""
    try:
        symbols = [t.strip().upper() for t in tokens.split(",")] if tokens else []
        prices = await analytics.get_token_prices(symbols)
        return {"prices": prices}
    except Exception:
        logger.exception("Price fetch failed")
        raise HTTPException(status_code=500, detail="Failed to fetch token prices")