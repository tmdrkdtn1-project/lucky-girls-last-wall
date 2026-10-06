from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from balance_lab_v1 import self_test as balance_v1_self_test, validate_experiment_contract
from golden_runner_v1 import self_test as golden_v1_self_test
from stage2_normal02_balance_extension_v1 import (
    build_experiment_contract,
    decide_foundation_candidate,
    evaluate_foundation_runs,
    load_json,
    self_test as stage2_self_test,
    validate_candidate,
    validate_planning_contract,
)
from closed_loop_stage2_v1 import run_closed_loop, self_test as closed_loop_self_test

EXPECTED_PLANNING_SHA256 = "46a67bfe7c16d4092d0b87335ab1d0ed128703775e6e6fea7046d7bdbbc83781"


def project_root() -> Path:
    return HERE.parents[3]


def planning_contract_path() -> Path:
    return (
        project_root()
        / "02_JOBS"
        / "ADMIN_BRIDGE"
        / "PLANNING"
        / "STAGE2_NORMAL02_TD_FOUNDATION_CANDIDATE_V1.json"
    )


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def good_candidate(candidate_id: str, iteration: int) -> dict:
    return {
        "candidate_id": candidate_id,
        "stage_id": "NORMAL_02",
        "iteration": iteration,
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
        "changes": {
            "geometry": 0,
            "wave_composition": 0,
            "spawn_count": 0,
        },
    }


def passing_runs(seed_base: int = 300) -> list[dict]:
    rows = [
        (1, 96, 24, 46),
        (2, 91, 26, 50),
        (3, 86, 28, 54),
        (4, 81, 30, 58),
    ]
    return [
        {
            "seed": seed_base + offset,
            "validated_fixture": True,
            "runtime_errors": 0,
            "gate_core_hp_end": gate,
            "final_wall_hp_end": 0,
            "w5_ttk_sec": w5,
            "w10_td_boss_ttk_sec": w10,
            "gold_earned": 620 + offset,
            "gold_spent": 510 + offset,
            "build_actions": 10 + offset,
            "upgrade_actions": 5 + offset,
            "td_end_hero_count": 2,
            "td_end_hero_ids": ["KARIN", "RUBY"],
            "rpg_transition_event": "PLUMBING_PASS",
        }
        for offset, gate, w5, w10 in rows
    ]


def failing_runs() -> list[dict]:
    rows = passing_runs(400)
    for row in rows:
        row["w10_td_boss_ttk_sec"] = 66
    return rows


def main() -> None:
    planning_path = planning_contract_path()
    assert planning_path.exists()
    assert sha256_file(planning_path) == EXPECTED_PLANNING_SHA256

    planning = load_json(planning_path)
    assert validate_planning_contract(planning) == []

    experiment = build_experiment_contract(planning)
    assert validate_experiment_contract(experiment) == []
    assert experiment["max_rounds"] == 3
    assert experiment["max_candidates_per_round"] == 4
    assert experiment["canonical_auto_promotion"] is False

    candidate = good_candidate("NORMAL02_FOUNDATION_A", 1)
    assert validate_candidate(candidate) == []

    result = evaluate_foundation_runs(passing_runs(), planning)
    assert result["pass"] is True
    assert result["run_count"] == 4
    assert result["validated_fixture_count"] == 4
    assert result["balance_claim_allowed"] is False

    decision = decide_foundation_candidate(candidate, passing_runs(), planning)
    assert decision.decision == "FOUNDATION_PASS_PLANNING_REVIEW_REQUIRED"
    assert decision.canonical_promotion is False

    bad_stats = good_candidate("BAD_STATS", 1)
    bad_stats["source_base_stats_changed"] = True
    bad_decision = decide_foundation_candidate(bad_stats, passing_runs(), planning)
    assert bad_decision.decision == "MASTER_DECISION_REQUIRED"
    assert "SOURCE_BASE_STAT_MUTATION_FORBIDDEN" in bad_decision.reasons

    c1 = good_candidate("NORMAL02_FOUNDATION_R1", 1)
    c2 = good_candidate("NORMAL02_FOUNDATION_R2", 2)
    loop = run_closed_loop(
        planning,
        [
            {"round": 1, "candidate": c1, "runs": failing_runs()},
            {"round": 2, "candidate": c2, "runs": passing_runs(500)},
        ],
    )
    assert loop["status"] == "PLANNING_REVIEW_REQUIRED"
    assert loop["selected_candidate"] == "NORMAL02_FOUNDATION_R2"
    assert loop["history"][0]["game_build_decision"] == "REVISE_ONCE"
    assert loop["history"][1]["game_build_decision"] == "FOUNDATION_PASS_PLANNING_REVIEW_REQUIRED"
    assert loop["canonical_promotion"] is False
    assert loop["next_owner"] == "PLANNING"

    assert balance_v1_self_test()["status"] == "PASS"
    assert golden_v1_self_test(HERE / "golden_scenarios_v1.json")["status"] == "PASS"
    assert stage2_self_test()["status"] == "PASS"
    assert closed_loop_self_test()["status"] == "PASS"

    summary = {
        "status": "PASS",
        "planning_contract_sha256": EXPECTED_PLANNING_SHA256,
        "stage2_balance_lab_extension": "PASS",
        "four_run_validated_fixture": "PASS",
        "closed_loop": {
            "round1": "REVISE_ONCE",
            "round2": "FOUNDATION_PASS_PLANNING_REVIEW_REQUIRED",
            "next_owner": "PLANNING",
        },
        "legacy_balance_lab_v1": "PASS",
        "legacy_golden_v1": "PASS",
        "canonical_promotion": False,
        "production_mutation": False,
        "physical_android_qa": "NOT_RUN",
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
