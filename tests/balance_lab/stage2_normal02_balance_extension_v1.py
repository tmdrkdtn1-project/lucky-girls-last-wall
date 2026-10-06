from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import json
from typing import Any

from balance_lab_v1 import DEFAULT_LIMITS, distribution, validate_experiment_contract

STAGE_ID = "NORMAL_02"
FOUNDATION_MIN_RUNS = 4
MAX_ADJUSTMENT_PCT = 10.0
ALLOWED_ADJUSTMENTS = {"geometry", "wave_composition", "spawn_count"}


@dataclass(frozen=True)
class FoundationDecision:
    candidate_id: str
    decision: str
    reasons: tuple[str, ...]
    canonical_promotion: bool = False


def load_json(path: str | Path) -> dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def validate_planning_contract(contract: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    authority = contract.get("authority_lock") or {}
    execution = contract.get("execution") or {}
    candidate = contract.get("planning_candidate") or {}

    if contract.get("status") != "PLANNING_PROPOSAL_TEST_ONLY":
        errors.append("PLANNING_TEST_ONLY_STATUS_REQUIRED")
    if authority.get("stage_id") != STAGE_ID:
        errors.append("NORMAL_02_AUTHORITY_REQUIRED")
    if candidate.get("authority_level") != "TEST_ONLY_NOT_CANON":
        errors.append("TEST_ONLY_CANDIDATE_REQUIRED")
    if execution.get("production_main_mutation") is not False:
        errors.append("PRODUCTION_MAIN_MUTATION_FORBIDDEN")
    if execution.get("player_production_unlock") is not False:
        errors.append("PLAYER_PRODUCTION_UNLOCK_FORBIDDEN")
    if int(execution.get("minimum_runs") or 0) < FOUNDATION_MIN_RUNS:
        errors.append("FOUR_RUN_MINIMUM_REQUIRED")
    if int(execution.get("candidate_iterations") or 0) > 2:
        errors.append("CANDIDATE_ITERATION_BOUND_EXCEEDED")
    if "Automatic canonical promotion" not in (contract.get("forbidden") or []):
        errors.append("AUTO_PROMOTION_GUARD_REQUIRED")
    return errors


def build_experiment_contract(planning_contract: dict[str, Any]) -> dict[str, Any]:
    bands = planning_contract.get("target_observation_bands") or {}
    return {
        "experiment_id": "STAGE2_NORMAL02_TD_FOUNDATION_V1",
        "target_kpis": [
            "gate_core_hp_end",
            "runtime_errors",
            "w5_ttk_sec",
            "w10_td_boss_ttk_sec",
            "rpg_transition_event",
        ],
        "hypothesis": (
            "A source-backed TEST_ONLY NORMAL_02 TD foundation can satisfy the "
            "PLANNING observation bands without changing source enemy/boss base stats."
        ),
        "candidate_ranges": {
            "route_length_cells": [22, 28],
            "turns_min": 2,
            "choke_zones_min": 3,
            "candidate_adjustment_pct": [-MAX_ADJUSTMENT_PCT, MAX_ADJUSTMENT_PCT],
        },
        "allowed_scope": [
            "tests/balance_lab",
            "workroom/game_build TEST_ONLY fixture/candidate data",
        ],
        "forbidden_scope": [
            "canonical main",
            "source enemy/boss base stats",
            "player-facing Stage2 unlock",
            "Stage2 RPG balance",
            "production rewards/recipes/dialogue",
        ],
        "max_candidates_per_round": DEFAULT_LIMITS["max_candidates_per_round"],
        "max_rounds": DEFAULT_LIMITS["max_rounds"],
        "evaluation_metrics": [
            "gate_core_hp_end",
            "runtime_errors",
            "w5_ttk_sec",
            "w10_td_boss_ttk_sec",
            "rpg_transition_event",
        ],
        "thresholds": {
            "gate_core_hp_end": bands.get("gate_core_at_td_end"),
            "runtime_errors": bands.get("runtime_errors"),
            "w5_ttk_sec": bands.get("wave5_ttk_sec"),
            "w10_td_boss_ttk_sec": bands.get("wave10_td_boss_ttk_sec"),
        },
        "regression_requirements": [
            "Stage1 Golden remains green",
            "tests/check_stage1.py ALL PASS",
            "NORMAL_02 V2_A solo helper remains 1.00",
        ],
        "escalation_conditions": [
            "candidate iteration bound exhausted",
            "scope violation",
            "Golden P0 regression",
            "canonical integration required",
        ],
        "canonical_auto_promotion": False,
    }


def validate_candidate(candidate: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    geometry = candidate.get("geometry") or {}
    changes = candidate.get("changes") or {}

    if candidate.get("stage_id") != STAGE_ID:
        errors.append("NORMAL_02_CANDIDATE_REQUIRED")
    if candidate.get("test_only") is not True:
        errors.append("TEST_ONLY_FLAG_REQUIRED")
    if candidate.get("production_exposed") is True:
        errors.append("PRODUCTION_EXPOSURE_FORBIDDEN")
    if candidate.get("source_base_stats_changed") is True:
        errors.append("SOURCE_BASE_STAT_MUTATION_FORBIDDEN")

    if geometry.get("grid") != "18x10":
        errors.append("GRID_18X10_REQUIRED")
    route_length = int(geometry.get("route_length_cells") or 0)
    if route_length < 22 or route_length > 28:
        errors.append("ROUTE_LENGTH_OUT_OF_BOUNDS")
    if int(geometry.get("turns") or 0) < 2:
        errors.append("TWO_TURNS_REQUIRED")
    if int(geometry.get("choke_zones") or 0) < 3:
        errors.append("THREE_CHOKE_ZONES_REQUIRED")
    if geometry.get("route_build_overlap") is True:
        errors.append("ROUTE_BUILD_OVERLAP_FORBIDDEN")
    if geometry.get("isolated_build_islands") is True:
        errors.append("ISOLATED_BUILD_ISLAND_FORBIDDEN")

    for scope, delta in changes.items():
        if scope not in ALLOWED_ADJUSTMENTS:
            errors.append(f"ADJUSTMENT_SCOPE_FORBIDDEN:{scope}")
            continue
        try:
            delta_value = abs(float(delta))
        except (TypeError, ValueError):
            errors.append(f"INVALID_ADJUSTMENT_DELTA:{scope}")
            continue
        if delta_value > MAX_ADJUSTMENT_PCT:
            errors.append(f"ADJUSTMENT_EXCEEDS_10_PERCENT:{scope}")
    return errors


def _band_ok(value: float | int | None, band: Any) -> bool:
    if value is None:
        return False
    if isinstance(band, list) and len(band) == 2:
        return float(band[0]) <= float(value) <= float(band[1])
    return value == band


def evaluate_foundation_runs(
    runs: list[dict[str, Any]],
    planning_contract: dict[str, Any],
) -> dict[str, Any]:
    bands = planning_contract.get("target_observation_bands") or {}
    valid_runs = [r for r in runs if r.get("validated_fixture") is True]
    failures: list[str] = []

    if len(runs) < FOUNDATION_MIN_RUNS:
        failures.append("FOUR_RUN_MINIMUM_NOT_MET")
    if len(valid_runs) != len(runs):
        failures.append("UNVALIDATED_FIXTURE_PRESENT")

    runtime_ok = bool(runs) and all(int(r.get("runtime_errors") or 0) == 0 for r in runs)
    gate_ok = bool(runs) and all(float(r.get("gate_core_hp_end") or 0) > 0 for r in runs)
    w5_ok = bool(runs) and all(
        _band_ok(r.get("w5_ttk_sec"), bands.get("wave5_ttk_sec")) for r in runs
    )
    w10_ok = bool(runs) and all(
        _band_ok(r.get("w10_td_boss_ttk_sec"), bands.get("wave10_td_boss_ttk_sec"))
        for r in runs
    )
    transition_ok = bool(runs) and all(
        r.get("rpg_transition_event") in {"OBSERVED", "PLUMBING_PASS"} for r in runs
    )

    if not runtime_ok:
        failures.append("RUNTIME_ERRORS_PRESENT")
    if not gate_ok:
        failures.append("GATE_CORE_DEPLETED")
    if not w5_ok:
        failures.append("W5_TTK_OUT_OF_BAND")
    if not w10_ok:
        failures.append("W10_TTK_OUT_OF_BAND")
    if not transition_ok:
        failures.append("RPG_TRANSITION_PLUMBING_NOT_OBSERVED")

    return {
        "schema": "lucky_girls.balance_lab.stage2_normal02_foundation_result.v1",
        "run_count": len(runs),
        "validated_fixture_count": len(valid_runs),
        "pass": not failures,
        "failures": failures,
        "metrics": {
            "gate_core_hp_end": distribution(r.get("gate_core_hp_end") for r in runs),
            "w5_ttk_sec": distribution(r.get("w5_ttk_sec") for r in runs),
            "w10_td_boss_ttk_sec": distribution(
                r.get("w10_td_boss_ttk_sec") for r in runs
            ),
            "gold_earned": distribution(r.get("gold_earned") for r in runs),
            "gold_spent": distribution(r.get("gold_spent") for r in runs),
            "td_end_hero_count": distribution(r.get("td_end_hero_count") for r in runs),
        },
        "runtime_errors_total": sum(int(r.get("runtime_errors") or 0) for r in runs),
        "transition_success_rate": (
            sum(
                1
                for r in runs
                if r.get("rpg_transition_event") in {"OBSERVED", "PLUMBING_PASS"}
            )
            / len(runs)
            if runs
            else None
        ),
        "balance_claim_allowed": False,
        "note": (
            "Foundation fixture evidence validates the Stage2 TD harness/contract only. "
            "It does not authorize Stage2 RPG balance or canonical promotion."
        ),
    }


def decide_foundation_candidate(
    candidate: dict[str, Any],
    runs: list[dict[str, Any]],
    planning_contract: dict[str, Any],
) -> FoundationDecision:
    reasons = validate_planning_contract(planning_contract)
    experiment = build_experiment_contract(planning_contract)
    reasons.extend(validate_experiment_contract(experiment))
    reasons.extend(validate_candidate(candidate))
    result = evaluate_foundation_runs(runs, planning_contract)
    reasons.extend(result["failures"])

    if not reasons:
        decision = "FOUNDATION_PASS_PLANNING_REVIEW_REQUIRED"
    elif int(candidate.get("iteration") or 1) < 2 and not any(
        reason.startswith("SOURCE_BASE_STAT_MUTATION")
        or reason.startswith("PRODUCTION_")
        or reason.startswith("ADJUSTMENT_SCOPE_FORBIDDEN")
        for reason in reasons
    ):
        decision = "REVISE_ONCE"
    else:
        decision = "MASTER_DECISION_REQUIRED"

    return FoundationDecision(
        candidate_id=str(candidate.get("candidate_id") or "UNKNOWN"),
        decision=decision,
        reasons=tuple(reasons),
        canonical_promotion=False,
    )


def self_test() -> dict[str, Any]:
    fixture_contract = {
        "status": "PLANNING_PROPOSAL_TEST_ONLY",
        "authority_lock": {"stage_id": "NORMAL_02"},
        "planning_candidate": {"authority_level": "TEST_ONLY_NOT_CANON"},
        "execution": {
            "production_main_mutation": False,
            "player_production_unlock": False,
            "minimum_runs": 4,
            "candidate_iterations": 2,
        },
        "forbidden": ["Automatic canonical promotion"],
        "target_observation_bands": {
            "gate_core_at_td_end": ">0",
            "runtime_errors": 0,
            "wave5_ttk_sec": [20, 35],
            "wave10_td_boss_ttk_sec": [40, 60],
        },
    }
    candidate = {
        "candidate_id": "SELF_TEST_A",
        "stage_id": "NORMAL_02",
        "iteration": 1,
        "test_only": True,
        "production_exposed": False,
        "source_base_stats_changed": False,
        "geometry": {
            "grid": "18x10",
            "route_length_cells": 25,
            "turns": 3,
            "choke_zones": 3,
            "route_build_overlap": False,
            "isolated_build_islands": False,
        },
        "changes": {"geometry": 0, "wave_composition": 0, "spawn_count": 0},
    }
    runs = [
        {
            "seed": seed,
            "validated_fixture": True,
            "runtime_errors": 0,
            "gate_core_hp_end": gate,
            "w5_ttk_sec": w5,
            "w10_td_boss_ttk_sec": w10,
            "gold_earned": 500 + seed,
            "gold_spent": 420 + seed,
            "td_end_hero_count": 2,
            "rpg_transition_event": "PLUMBING_PASS",
        }
        for seed, gate, w5, w10 in [
            (101, 100, 24, 46),
            (102, 95, 26, 50),
            (103, 90, 28, 54),
            (104, 85, 30, 58),
        ]
    ]
    assert validate_planning_contract(fixture_contract) == []
    assert validate_experiment_contract(build_experiment_contract(fixture_contract)) == []
    assert validate_candidate(candidate) == []
    result = evaluate_foundation_runs(runs, fixture_contract)
    assert result["pass"] is True
    decision = decide_foundation_candidate(candidate, runs, fixture_contract)
    assert decision.decision == "FOUNDATION_PASS_PLANNING_REVIEW_REQUIRED"
    assert decision.canonical_promotion is False

    bad = dict(candidate)
    bad["source_base_stats_changed"] = True
    bad_decision = decide_foundation_candidate(bad, runs, fixture_contract)
    assert bad_decision.decision == "MASTER_DECISION_REQUIRED"

    return {
        "status": "PASS",
        "stage2_contract_guard": "PASS",
        "geometry_guard": "PASS",
        "four_run_fixture_guard": "PASS",
        "target_band_evaluation": "PASS",
        "source_stat_mutation_guard": "PASS",
        "canonical_auto_promotion": False,
    }


if __name__ == "__main__":
    print(json.dumps(self_test(), ensure_ascii=False, indent=2))
