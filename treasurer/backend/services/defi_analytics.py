"""
services/defi_analytics.py — DeFi Analytics Service
Fetches and aggregates on-chain portfolio data from Hedera:
  - Token balances via Mirror Node REST API
  - SaucerSwap LP positions
  - HBAR staking positions
  - Price feeds (CoinGecko / Pyth Network)
  - Rebalancing signal computation
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

import httpx

logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
HEDERA_MIRROR_BASE   = "https://mainnet-public.mirrornode.hedera.com/api/v1"
COINGECKO_BASE       = "https://api.coingecko.com/api/v3"
SAUCERSWAP_API_BASE  = "https://api.saucerswap.finance"
HTTP_TIMEOUT         = 15.0

# CoinGecko token IDs for Hedera-native assets
TOKEN_COINGECKO_IDS: Dict[str, str] = {
    "HBAR":  "hedera-hashgraph",
    "SAUCE": "saucerswap",
    "USDC":  "usd-coin",
    "WBTC":  "wrapped-bitcoin",
    "WETH":  "weth",
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Service ───────────────────────────────────────────────────────────────────

class DeFiAnalytics:
    """
    Aggregates DeFi data from Hedera Mirror Node, SaucerSwap API,
    and price oracles. All public methods are async.
    """

    def __init__(self):
        self._http = httpx.AsyncClient(timeout=HTTP_TIMEOUT)

    # ── Internal HTTP helpers ─────────────────────────────────────────────────

    async def _get(self, url: str, params: Optional[dict] = None) -> dict:
        """GET with basic error handling."""
        try:
            resp = await self._http.get(url, params=params)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as exc:
            logger.error("HTTP error %s: %s", exc.response.status_code, url)
            raise
        except httpx.RequestError as exc:
            logger.error("Request error: %s | %s", exc, url)
            raise

    # ── Price feeds ───────────────────────────────────────────────────────────

    async def get_token_prices(
        self,
        symbols: Optional[List[str]] = None,
    ) -> Dict[str, float]:
        """
        Fetch USD prices for requested token symbols.
        Falls back to static mock prices when the API is unavailable.
        """
        target_symbols = symbols if symbols else list(TOKEN_COINGECKO_IDS.keys())
        ids = [TOKEN_COINGECKO_IDS[s] for s in target_symbols if s in TOKEN_COINGECKO_IDS]

        if not ids:
            return {}

        try:
            data = await self._get(
                f"{COINGECKO_BASE}/simple/price",
                params={"ids": ",".join(ids), "vs_currencies": "usd"},
            )
            result: Dict[str, float] = {}
            for symbol in target_symbols:
                cg_id = TOKEN_COINGECKO_IDS.get(symbol)
                if cg_id and cg_id in data:
                    result[symbol] = data[cg_id]["usd"]
            return result
        except Exception:
            logger.warning("Price API unavailable — returning mock prices")
            return {"HBAR": 0.085, "SAUCE": 0.032, "USDC": 1.00, "WBTC": 68500.0, "WETH": 3420.0}

    # ── Token balances ────────────────────────────────────────────────────────

    async def _get_token_balances(self, address: str) -> List[dict]:
        """Fetch HTS token balances for an account from the Mirror Node."""
        try:
            data = await self._get(
                f"{HEDERA_MIRROR_BASE}/accounts/{address}/tokens",
                params={"limit": 100},
            )
            return data.get("tokens", [])
        except Exception:
            logger.warning("Mirror Node unavailable — returning mock balances")
            return [
                {"token_id": "0.0.731861", "symbol": "HBAR",  "balance": 100_000,  "decimals": 8},
                {"token_id": "0.0.731888", "symbol": "USDC",  "balance": 50_000,   "decimals": 6},
                {"token_id": "0.0.731901", "symbol": "SAUCE", "balance": 25_000,   "decimals": 6},
            ]

    # ── Portfolio snapshot ────────────────────────────────────────────────────

    async def get_portfolio_snapshot(self, treasury_address: str) -> dict:
        """
        Build a full portfolio snapshot: balances + USD values + protocol attribution.
        """
        balances, prices = await asyncio.gather(
            self._get_token_balances(treasury_address),
            self.get_token_prices(),
        )

        positions = []
        total_usd = 0.0

        for b in balances:
            symbol   = b.get("symbol", "UNKNOWN")
            decimals = b.get("decimals", 8)
            raw_bal  = b.get("balance", 0)
            balance  = raw_bal / (10 ** decimals)
            price    = prices.get(symbol, 0.0)
            usd_val  = balance * price

            positions.append({
                "token_symbol":   symbol,
                "token_address":  b.get("token_id", ""),
                "balance":        balance,
                "usd_value":      round(usd_val, 2),
                "allocation_pct": 0.0,  # filled after total is computed
                "protocol":       None,
                "apy":            None,
            })
            total_usd += usd_val

        for pos in positions:
            pos["allocation_pct"] = (
                round(pos["usd_value"] / total_usd * 100, 2) if total_usd else 0.0
            )

        return {
            "treasury_address": treasury_address,
            "total_usd_value":  round(total_usd, 2),
            "positions":        positions,
            "timestamp":        _now_iso(),
            "chain":            "hedera",
        }

    # ── Yield summary ─────────────────────────────────────────────────────────

    async def get_yield_summary(self, treasury_address: str) -> dict:
        """Aggregate all yield positions and compute a blended APY."""
        # TODO: fetch live data from SaucerSwap & HBAR staking contracts
        sources = [
            {
                "protocol":        "SaucerSwap",
                "strategy":        "LP HBAR/USDC",
                "token":           "HBAR",
                "deposited_usd":   12_000.0,
                "earned_usd":      380.5,
                "apy":             12.7,
                "lock_period_days": 0,
            },
            {
                "protocol":        "HBAR Staking",
                "strategy":        "Validator Delegation",
                "token":           "HBAR",
                "deposited_usd":   30_000.0,
                "earned_usd":      720.0,
                "apy":             5.2,
                "lock_period_days": 0,
            },
            {
                "protocol":        "SaucerSwap",
                "strategy":        "SAUCE Single-Sided",
                "token":           "SAUCE",
                "deposited_usd":   5_000.0,
                "earned_usd":      215.0,
                "apy":             18.7,
                "lock_period_days": 7,
            },
        ]

        total_deposited = sum(s["deposited_usd"] for s in sources)
        total_earned    = sum(s["earned_usd"]    for s in sources)
        blended_apy     = (
            sum(s["deposited_usd"] * s["apy"] for s in sources) / total_deposited
            if total_deposited else 0.0
        )

        return {
            "total_deposited_usd": round(total_deposited, 2),
            "total_earned_usd":    round(total_earned, 2),
            "blended_apy":         round(blended_apy, 2),
            "sources":             sources,
        }

    # ── Rebalance signals ─────────────────────────────────────────────────────

    async def compute_rebalance_signals(
        self,
        treasury_address: str,
        tolerance_pct: float = 5.0,
    ) -> dict:
        """
        Compare current allocations against target policy allocations
        and return actionable rebalancing signals.
        """
        snapshot = await self.get_portfolio_snapshot(treasury_address)
        current: Dict[str, float] = {
            p["token_symbol"]: p["allocation_pct"]
            for p in snapshot["positions"]
        }

        # TODO: pull targets from BudgetGuard.sol or a config store
        target: Dict[str, float] = {"HBAR": 40.0, "USDC": 35.0, "SAUCE": 15.0, "WBTC": 10.0}

        signals = []
        needs_rebalance = False

        for token, target_pct in target.items():
            cur_pct = current.get(token, 0.0)
            delta   = target_pct - cur_pct
            if abs(delta) > tolerance_pct:
                needs_rebalance = True
                urgency = "high" if abs(delta) > 15 else "medium"
            else:
                urgency = "low"

            signals.append({
                "token":                  token,
                "current_allocation_pct": round(cur_pct, 2),
                "target_allocation_pct":  target_pct,
                "delta_pct":              round(delta, 2),
                "action":                 "buy" if delta > 0 else ("sell" if delta < 0 else "hold"),
                "urgency":                urgency,
            })

        return {
            "needs_rebalance":        needs_rebalance,
            "signals":                signals,
            "estimated_slippage_pct": 0.3,
            "recommended_route":      "SaucerSwapAdapter → TreasurerProxy",
        }

    # ── Liquidity positions ───────────────────────────────────────────────────

    async def get_liquidity_positions(self, treasury_address: str) -> List[dict]:
        """Fetch active SaucerSwap LP positions."""
        try:
            data = await self._get(
                f"{SAUCERSWAP_API_BASE}/v1/positions/{treasury_address}"
            )
            return data.get("positions", [])
        except Exception:
            logger.warning("SaucerSwap API unavailable — returning mock LP data")
            return [
                {
                    "pool_id":        "0.0.731922",
                    "token_a":        "HBAR",
                    "token_b":        "USDC",
                    "liquidity_usd":  12_000.0,
                    "fee_tier_bps":   30,
                    "earned_fees_usd": 380.5,
                    "il_usd":         -45.2,
                    "net_pnl_usd":    335.3,
                }
            ]

    # ── Staking positions ─────────────────────────────────────────────────────

    async def get_staking_positions(self, treasury_address: str) -> List[dict]:
        """Fetch HBAR staking positions from the Mirror Node."""
        try:
            data = await self._get(
                f"{HEDERA_MIRROR_BASE}/accounts/{treasury_address}"
            )
            staking_info = data.get("staking_info", {})
            if not staking_info:
                return []

            prices = await self.get_token_prices(["HBAR"])
            hbar_price = prices.get("HBAR", 0.085)

            staked_hbar = staking_info.get("staked_to_me", 0) / 1e8
            return [
                {
                    "validator_id":          staking_info.get("staked_node_id", "0.0.3"),
                    "staked_hbar":            staked_hbar,
                    "staked_usd":             round(staked_hbar * hbar_price, 2),
                    "pending_rewards_hbar":   staking_info.get("pending_reward", 0) / 1e8,
                    "apy":                    5.2,
                    "unlock_epoch":           None,
                }
            ]
        except Exception:
            logger.warning("Staking info unavailable — returning mock data")
            return [
                {
                    "validator_id":         "0.0.3",
                    "staked_hbar":           30_000.0,
                    "staked_usd":            2_550.0,
                    "pending_rewards_hbar":  145.6,
                    "apy":                   5.2,
                    "unlock_epoch":          None,
                }
            ]

    # ── Performance history ───────────────────────────────────────────────────

    async def get_performance_history(
        self,
        treasury_address: str,
        days: int = 30,
    ) -> dict:
        """
        Return time-series portfolio performance.
        In production this would query a TimescaleDB / InfluxDB time-series store.
        """
        now   = datetime.now(timezone.utc)
        start = now - timedelta(days=days)

        # Synthetic time-series — replace with real data store
        series = []
        base_value = 95_000.0
        for i in range(days + 1):
            ts    = start + timedelta(days=i)
            drift = (i / days) * 8_000.0 + (i % 7) * 200 - 100
            series.append({
                "timestamp":        ts.isoformat(),
                "portfolio_usd":    round(base_value + drift, 2),
                "cumulative_yield": round(drift * 0.4, 2),
            })

        return {
            "treasury_address": treasury_address,
            "period_days":      days,
            "from":             start.isoformat(),
            "to":               now.isoformat(),
            "series":           series,
            "total_return_pct": round((series[-1]["portfolio_usd"] - base_value) / base_value * 100, 2),
        }

    async def aclose(self) -> None:
        await self._http.aclose()