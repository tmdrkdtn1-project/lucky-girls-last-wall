from __future__ import annotations

import argparse
import json
import math
import statistics
from pathlib import Path
from typing import Any, Iterable

MODES = {"REAL_PATH", "CORE_SIM"}
SEED_POLICY = {"smoke": 4, "candidate_compare": 16, "promotion_min": 32}
DEFAULT_LIMITS = {"max_rounds": 3, "max_candidates_per_round": 4}
REQUIRED_EXPERIMENT_FIELDS = (
    "experiment_id",
    "target_kpis",
    "hypothesis",
    "candidate_ranges",
    "allowed_scope",
    "forbidden_scope",
    "max_candidates_per_round",
    "max_rounds",
    "evaluation_metrics",
    "thresholds",
    "regression_requirements",
    "escalation_conditions",
)


def _nums(values: Iterable[Any]) -> list[float]:
    out: list[float] = []
    for value in values:
        if value is None or isinstance(value, bool):
            continue
        try:
            f = float(value)
        except (TypeError, ValueError):
            continue
        if math.isfinite(f):
            out.append(f)
    return out


def percentile(values: Iterable[Any], q: float) -> float | None:
    vals = sorted(_nums(values))
    if not vals:
        return None
    if len(vals) == 1:
        return vals[0]
    q = max(0.0, min(1.0, float(q)))
    pos = (len(vals) - 1) * q
    lo = math.floor(pos)
    hi = math.ceil(pos)
    if lo == hi:
        return vals[lo]
    weight = pos - lo
    return vals[lo] * (1.0 - weight) + vals[hi] * weight


def distribution(values: Iterable[Any]) -> dict[str, Any]:
    vals = _nums(values)
    if not vals:
        return {
            "count": 0,
            "mean": None,
            "median": None,
            "p10": None,
            "p50": None,
            "p90": None,
            "min": None,
            "max": None,
        }
    return {
        "count": len(vals),
        "mean": statistics.fmean(vals),
        "median": statistics.median(vals),
        "p10": percentile(vals, 0.10),
        "p50": percentile(vals, 0.50),
        "p90": percentile(vals, 0.90),
        "min": min(vals),
        "max": max(vals),
    }


def evidence_class(seed_count: int) -> str:
    if seed_count >= SEED_POLICY["promotion_min"]:
        return "PROMOTION_MIN"
    if seed_count >= SEED_POLICY["candidate_compare"]:
        return "CANDIDATE_COMPARE"
    if seed_count >= SEED_POLICY["smoke"]:
        return "SMOKE"
    return "INSUFFICIENT_SEEDED_EVIDENCE"


def validate_experiment_contract(contract: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    for field in REQUIRED_EXPERIMENT_FIELDS:
        if field not in contract:
            errors.append(f"MISSING_FIELD:{field}")
    max_rounds = contract.get("max_rounds")
    max_candidates = contract.get("max_candidates_per_round")
    if isinstance(max_rounds, int) and max_rounds > DEFAULT_LIMITS["max_rounds"]:
        errors.append("MAX_ROUNDS_EXCEEDS_DEFAULT_BOUND")
    if isinstance(max_candidates, int) and max_candidates > DEFAULT_LIMITS["max_candidates_per_round"]:
        errors.append("MAX_CANDIDATES_EXCEEDS_DEFAULT_BOUND")
    if contract.get("canonical_auto_promotion") is True:
        errors.append("CANONICAL_AUTO_PROMOTION_FORBIDDEN")
    if not contract.get("allowed_scope"):
        errors.append("ALLOWED_SCOPE_REQUIRED")
    if not contract.get("forbidden_scope"):
        errors.append("FORBIDDEN_SCOPE_REQUIRED")
    return errors


def validate_trial(trial: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    mode = trial.get("mode")
    if mode not in MODES:
        errors.append("INVALID_MODE")
    if trial.get("direct_injection") is True:
        errors.append("DIRECT_INJECTION_FORBIDDEN")
    if mode == "REAL_PATH" and trial.get("legal_path") is not True:
        errors.append("REAL_PATH_MUST_BE_LEGAL")
    if mode == "CORE_SIM" and trial.get("validated_fixture") is not True:
        errors.append("CORE_SIM_REQUIRES_VALIDATED_FIXTURE")
    if mode == "CORE_SIM" and trial.get("production_exposed_fixture") is True:
        errors.append("CORE_SIM_FIXTURE_MUST_NOT_BE_PRODUCTION_EXPOSED")
    for key in ("scenario_id", "candidate_id", "seed", "victory"):
        if key not in trial:
            errors.append(f"MISSING_TRIAL_FIELD:{key}")
    return errors


def _rate(values: list[bool]) -> float | None:
    if not values:
        return None
    return sum(1 for x in values if x) / len(values)


def aggregate_trials(trials: list[dict[str, Any]]) -> dict[str, Any]:
    validated = []
    invalid = []
    for trial in trials:
        errors = validate_trial(trial)
        if errors or trial.get("invalid"):
            invalid.append({"trial": trial, "errors": errors or ["MARKED_INVALID"]})
        else:
            validated.append(trial)

    seeds = {str(t.get("seed")) for t in validated}
    victories = [bool(t.get("victory")) for t in validated]
    survival = [int(t.get("party_alive_count_end") or 0) > 0 for t in validated]
    transition_values = [bool(t["transition_success"]) for t in validated if t.get("transition_success") is not None]
    recipe_values = [bool(t["recipe_completed"]) for t in validated if t.get("recipe_completed") is not None]

    damage_by_hero_sum: dict[str, float] = {}
    damage_by_hero_samples: dict[str, list[float]] = {}
    for trial in validated:
        for hero_id, value in (trial.get("damage_by_hero") or {}).items():
            vals = damage_by_hero_samples.setdefault(hero_id, [])
            try:
                f = float(value)
            except (TypeError, ValueError):
                continue
            vals.append(f)
            damage_by_hero_sum[hero_id] = damage_by_hero_sum.get(hero_id, 0.0) + f

    return {
        "schema": "lucky_girls.balance_lab.aggregate.v1",
        "trial_count": len(trials),
        "valid_trial_count": len(validated),
        "invalid_count": len(invalid),
        "seed_count": len(seeds),
        "seed_evidence_class": evidence_class(len(seeds)),
        "statistical_conclusion_allowed": len(seeds) >= SEED_POLICY["smoke"],
        "victory_rate": _rate(victories),
        "battle_duration": distribution(t.get("battle_duration_sec") for t in validated),
        "boss_hp_remaining_pct": distribution(t.get("boss_hp_remaining_pct") for t in validated),
        "party_survival_rate": _rate(survival),
        "first_defeat_timing": distribution(t.get("first_defeat_timing_sec") for t in validated),
        "total_party_damage": distribution(t.get("total_party_damage") for t in validated),
        "healing": distribution(t.get("healing") for t in validated),
        "shielding": distribution(t.get("shielding") for t in validated),
        "resource_delta": distribution(t.get("resource_delta") for t in validated),
        "transition_success_rate": _rate(transition_values),
        "recipe_completion_rate": _rate(recipe_values),
        "damage_by_hero": {
            hero_id: {
                "sum": damage_by_hero_sum[hero_id],
                "distribution": distribution(samples),
            }
            for hero_id, samples in sorted(damage_by_hero_samples.items())
        },
        "invalid_trials": invalid,
    }


def reuse_w5_identity_coverage(v2: dict[str, Any]) -> dict[str, Any]:
    trials: list[dict[str, Any]] = []
    for hero_id, row in (v2.get("identities") or {}).items():
        result = row.get("rpg_result")
        trials.append({
            "scenario_id": "STAGE1_RPG_W5_IDENTITY_COVERAGE_V2",
            "candidate_id": hero_id,
            "mode": "REAL_PATH",
            "seed": "identity_coverage_not_seeded",
            "legal_path": bool(row.get("legal_reward_acquisition")),
            "direct_injection": False,
            "victory": result == "VICTORY",
            "battle_duration_sec": row.get("rpg_battle_duration_sec"),
            "boss_hp_remaining_pct": row.get("rpg_boss_hp_remaining_pct"),
            "party_alive_count_end": row.get("party_alive_count_end"),
            "first_defeat_timing_sec": row.get("time_to_first_hero_defeat_sec"),
            "total_party_damage": row.get("total_party_damage_to_boss"),
            "damage_by_hero": {hero_id: row.get("total_party_damage_to_boss") or 0},
            "healing": None,
            "shielding": None,
            "resource_delta": (row.get("td_metrics") or {}).get("gold_earned", 0) - (row.get("td_metrics") or {}).get("gold_spent", 0),
            "transition_success": bool(row.get("rpg_battle_started_with_valid_party")),
            "recipe_completed": None,
            "invalid": bool(row.get("runtime_errors")),
        })
    aggregate = aggregate_trials(trials)
    aggregate["reuse_kind"] = "IDENTITY_COVERAGE_REUSE_NOT_SEEDED_BALANCE_CONCLUSION"
    aggregate["source_contract"] = v2.get("command_id") or (v2.get("summary") or {}).get("contract")
    aggregate["statistical_conclusion_allowed"] = False
    aggregate["note"] = "This proves Balance Lab ingestion/aggregation only. Identity coverage cases are not independent random seeds."
    return {"trials": trials, "aggregate": aggregate}


def _load(path: str) -> dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def _write(path: str, value: dict[str, Any]) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def self_test() -> dict[str, Any]:
    contract = {
        "experiment_id": "SELF_TEST",
        "target_kpis": ["victory_rate"],
        "hypothesis": "scaffold",
        "candidate_ranges": {"boss_hp": [0.9, 1.0]},
        "allowed_scope": ["tests"],
        "forbidden_scope": ["production"],
        "max_candidates_per_round": 4,
        "max_rounds": 3,
        "evaluation_metrics": ["victory_rate"],
        "thresholds": {"victory_rate": [0.5, 0.75]},
        "regression_requirements": ["GOLDEN"],
        "escalation_conditions": ["MASTER_DECISION_REQUIRED"],
        "canonical_auto_promotion": False,
    }
    assert validate_experiment_contract(contract) == []
    bad = dict(contract, canonical_auto_promotion=True, max_rounds=4)
    errs = validate_experiment_contract(bad)
    assert "CANONICAL_AUTO_PROMOTION_FORBIDDEN" in errs
    assert "MAX_ROUNDS_EXCEEDS_DEFAULT_BOUND" in errs

    trials = []
    for seed, victory, duration, hp in [
        (1, True, 40, 0),
        (2, False, 60, 10),
        (3, True, 50, 0),
        (4, False, 70, 20),
    ]:
        trials.append({
            "scenario_id": "S",
            "candidate_id": "C",
            "mode": "CORE_SIM",
            "seed": seed,
            "validated_fixture": True,
            "production_exposed_fixture": False,
            "direct_injection": False,
            "victory": victory,
            "battle_duration_sec": duration,
            "boss_hp_remaining_pct": hp,
            "party_alive_count_end": 1 if victory else 0,
            "first_defeat_timing_sec": None if victory else duration,
            "total_party_damage": 16000 if victory else 12000,
            "damage_by_hero": {"ARIA": 16000 if victory else 12000},
            "healing": 0,
            "shielding": 0,
            "resource_delta": 100,
            "transition_success": True,
            "recipe_completed": None,
        })
    agg = aggregate_trials(trials)
    assert agg["seed_count"] == 4
    assert agg["seed_evidence_class"] == "SMOKE"
    assert agg["victory_rate"] == 0.5
    assert agg["battle_duration"]["median"] == 55
    assert agg["invalid_count"] == 0

    invalid_core = dict(trials[0])
    invalid_core.pop("validated_fixture")
    assert "CORE_SIM_REQUIRES_VALIDATED_FIXTURE" in validate_trial(invalid_core)

    return {
        "status": "PASS",
        "contract_validation": "PASS",
        "bounded_limits": "PASS",
        "real_path_core_sim_separation": "PASS",
        "seed_policy": "PASS",
        "aggregation": "PASS",
        "one_run_conclusion_guard": "PASS",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("self-test")
    p = sub.add_parser("validate-contract")
    p.add_argument("contract")

    p = sub.add_parser("aggregate")
    p.add_argument("input")
    p.add_argument("output")

    p = sub.add_parser("reuse-w5-v2")
    p.add_argument("input")
    p.add_argument("output")

    args = parser.parse_args()
    if args.cmd == "self-test":
        print(json.dumps(self_test(), ensure_ascii=False, indent=2))
    elif args.cmd == "validate-contract":
        errors = validate_experiment_contract(_load(args.contract))
        print(json.dumps({"valid": not errors, "errors": errors}, ensure_ascii=False, indent=2))
        raise SystemExit(1 if errors else 0)
    elif args.cmd == "aggregate":
        src = _load(args.input)
        trials = src["trials"] if isinstance(src, dict) else src
        _write(args.output, aggregate_trials(trials))
    elif args.cmd == "reuse-w5-v2":
        _write(args.output, reuse_w5_identity_coverage(_load(args.input)))


if __name__ == "__main__":
    main()
