"""
services/budget_engine.py — Budget Engine Service
Manages budget rules in sync with BudgetGuard.sol:
  - CRUD for spending policies
  - Real-time utilization tracking
  - Pre-execution spend simulation
  - Period-reset scheduling
"""

from __future__ import annotations

import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

# ── Period helpers ────────────────────────────────────────────────────────────
PERIOD_SECONDS: Dict[str, int] = {
    "daily":   86_400,
    "weekly":  604_800,
    "monthly": 2_592_000,   # 30 days
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id(prefix: str = "rule") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"


def _period_boundaries(period_type: str, period_seconds: Optional[int] = None):
    """Return (period_start, period_end) ISO strings for the current period."""
    now = datetime.now(timezone.utc)
    secs = period_seconds if period_type == "custom" and period_seconds else PERIOD_SECONDS.get(period_type, 86_400)
    # Anchor period start to Unix epoch multiples for determinism
    epoch_secs = int(now.timestamp())
    period_start_secs = (epoch_secs // secs) * secs
    period_start = datetime.fromtimestamp(period_start_secs, tz=timezone.utc)
    period_end   = period_start + timedelta(seconds=secs)
    return period_start.isoformat(), period_end.isoformat()


# ── In-memory store (replace with PostgreSQL in production) ──────────────────
_rules:   Dict[str, Dict[str, Any]]   = {}
_spends:  List[Dict[str, Any]]        = []


# ── Service ───────────────────────────────────────────────────────────────────

class BudgetEngine:
    """
    Manages budget rules and spend tracking, mirroring the state
    of BudgetGuard.sol. All public methods are async for FastAPI compatibility.
    """

    # ── Rules CRUD ────────────────────────────────────────────────────────────

    async def list_rules(
        self,
        active_only: bool = False,
        token: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        rules = list(_rules.values())
        if active_only:
            rules = [r for r in rules if r.get("active")]
        if token:
            rules = [r for r in rules if r.get("token", "").upper() == token.upper()]
        return rules

    async def create_rule(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Persist a new budget rule and (TODO) broadcast to BudgetGuard.sol."""
        self._validate_rule(data)

        rule_id = _new_id("rule")
        now     = _now_iso()

        period_secs = PERIOD_SECONDS.get(data["period_type"]) or data.get("period_seconds")
        if data["period_type"] == "custom" and not period_secs:
            raise ValueError("period_seconds is required when period_type is 'custom'")

        rule: Dict[str, Any] = {
            **data,
            "rule_id":       rule_id,
            "created_at":    now,
            "updated_at":    now,
            "on_chain_id":   None,   # Populated after contract tx confirms
            "period_seconds": period_secs,
        }
        rule.setdefault("active", True)
        _rules[rule_id] = rule

        logger.info("Budget rule created | rule_id=%s | token=%s | limit=%s",
                    rule_id, rule.get("token"), rule.get("max_spend_per_period"))

        # TODO: call BudgetGuard.sol → addRule(...)
        return rule

    async def update_rule(
        self,
        rule_id: str,
        data: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """Update an existing rule on-chain and in the local store."""
        if rule_id not in _rules:
            return None

        self._validate_rule(data)
        _rules[rule_id].update({**data, "updated_at": _now_iso()})
        logger.info("Budget rule updated | rule_id=%s", rule_id)

        # TODO: call BudgetGuard.sol → updateRule(on_chain_id, ...)
        return _rules[rule_id]

    async def deactivate_rule(self, rule_id: str) -> bool:
        """Soft-delete: mark rule inactive and pause it on-chain."""
        if rule_id not in _rules:
            return False

        _rules[rule_id]["active"]     = False
        _rules[rule_id]["updated_at"] = _now_iso()
        logger.info("Budget rule deactivated | rule_id=%s", rule_id)

        # TODO: call BudgetGuard.sol → pauseRule(on_chain_id)
        return True

    # ── Utilization ───────────────────────────────────────────────────────────

    async def get_utilization(
        self,
        token: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Compute current-period utilization for all (optionally filtered) rules."""
        rules = await self.list_rules(active_only=True, token=token)
        return [await self._compute_utilization(r) for r in rules]

    async def get_rule_utilization(self, rule_id: str) -> Optional[Dict[str, Any]]:
        rule = _rules.get(rule_id)
        if not rule:
            return None
        return await self._compute_utilization(rule)

    async def _compute_utilization(self, rule: Dict[str, Any]) -> Dict[str, Any]:
        rule_id      = rule["rule_id"]
        period_type  = rule.get("period_type", "daily")
        period_secs  = rule.get("period_seconds")
        start_iso, end_iso = _period_boundaries(period_type, period_secs)

        # Sum spends within the current period for this rule
        period_spends = [
            s for s in _spends
            if s["rule_id"] == rule_id
            and start_iso <= s["timestamp"] <= end_iso
        ]
        spent = sum(s["amount"] for s in period_spends)
        limit = rule.get("max_spend_per_period", 0)
        remaining     = max(0.0, limit - spent)
        utilization   = round(spent / limit * 100, 2) if limit else 0.0

        if utilization >= 100:
            status = "exceeded"
        elif utilization >= 80:
            status = "warning"
        else:
            status = "ok"

        return {
            "rule_id":          rule_id,
            "rule_name":        rule.get("name", ""),
            "token":            rule.get("token", ""),
            "period_start":     start_iso,
            "period_end":       end_iso,
            "budget_limit":     limit,
            "spent":            round(spent, 4),
            "remaining":        round(remaining, 4),
            "utilization_pct":  utilization,
            "status":           status,
        }

    # ── Simulation ────────────────────────────────────────────────────────────

    async def simulate_spend(
        self,
        amount: float,
        token: str,
        recipient: str,
    ) -> Dict[str, Any]:
        """
        Simulate whether a proposed spend would be allowed under all active rules.
        Returns a SimulationResult-compatible dict.
        """
        active_rules = await self.list_rules(active_only=True, token=token)
        triggered:  List[str] = []
        blocked_by: Optional[str] = None
        warnings:   List[str] = []

        for rule in active_rules:
            util = await self._compute_utilization(rule)
            remaining = util["remaining"]

            # Check whitelist
            whitelist = rule.get("recipient_whitelist") or []
            if whitelist and recipient not in whitelist:
                warnings.append(f"Rule '{rule['name']}': recipient not in whitelist")

            # Check spend limit
            if amount > remaining:
                triggered.append(rule["rule_id"])
                if not blocked_by:
                    blocked_by = rule["rule_id"]

            elif remaining - amount < rule["max_spend_per_period"] * 0.20:
                warnings.append(
                    f"Rule '{rule['name']}': spend would leave < 20 % of budget remaining"
                )

        would_pass = blocked_by is None
        remaining_after = 0.0
        if active_rules:
            first_util = await self._compute_utilization(active_rules[0])
            remaining_after = max(0.0, first_util["remaining"] - amount) if would_pass else first_util["remaining"]

        return {
            "would_pass":       would_pass,
            "triggered_rules":  triggered,
            "blocked_by":       blocked_by,
            "remaining_after":  round(remaining_after, 4),
            "warnings":         warnings,
        }

    # ── Summary ───────────────────────────────────────────────────────────────

    async def get_summary(self) -> Dict[str, Any]:
        """Dashboard-level summary of overall budget health."""
        all_util = await self.get_utilization()
        exceeded = [u["rule_id"] for u in all_util if u["status"] == "exceeded"]
        warning  = [u["rule_id"] for u in all_util if u["status"] == "warning"]

        total_budget = sum(
            _rules[u["rule_id"]].get("max_spend_per_period", 0)
            for u in all_util
        )
        total_spent = sum(u["spent"] for u in all_util)

        return {
            "total_rules":      len(_rules),
            "active_rules":     len([r for r in _rules.values() if r.get("active")]),
            "total_budget_usd": round(total_budget, 2),
            "total_spent_usd":  round(total_spent, 2),
            "exceeded_rules":   exceeded,
            "warning_rules":    warning,
        }

    # ── Spend history ─────────────────────────────────────────────────────────

    async def get_spend_history(
        self,
        rule_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        records = list(reversed(_spends))
        if rule_id:
            records = [r for r in records if r["rule_id"] == rule_id]
        return records[offset: offset + limit]

    async def record_spend(
        self,
        rule_id: str,
        token: str,
        amount: float,
        usd_value: float,
        recipient: str,
        tx_hash: str,
        approved_by: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Called by the on-chain event listener when BudgetGuard emits a SpendRecorded event.
        """
        record: Dict[str, Any] = {
            "record_id":   _new_id("spend"),
            "rule_id":     rule_id,
            "token":       token,
            "amount":      amount,
            "usd_value":   usd_value,
            "recipient":   recipient,
            "tx_hash":     tx_hash,
            "timestamp":   _now_iso(),
            "approved_by": approved_by or [],
        }
        _spends.append(record)
        logger.info("Spend recorded | rule_id=%s | amount=%s %s | tx=%s",
                    rule_id, amount, token, tx_hash)
        return record

    # ── Validation ────────────────────────────────────────────────────────────

    @staticmethod
    def _validate_rule(data: Dict[str, Any]) -> None:
        required = {"name", "token", "max_spend_per_period", "period_type"}
        missing  = required - set(data.keys())
        if missing:
            raise ValueError(f"Missing required fields: {missing}")

        valid_periods = {"daily", "weekly", "monthly", "custom"}
        if data["period_type"] not in valid_periods:
            raise ValueError(f"period_type must be one of {valid_periods}")

        if data["max_spend_per_period"] <= 0:
            raise ValueError("max_spend_per_period must be > 0")