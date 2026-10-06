from __future__ import annotations

import json
from typing import Any

from balance_lab_v1 import DEFAULT_LIMITS
from stage2_normal02_balance_extension_v1 import decide_foundation_candidate


def run_closed_loop(
    planning_contract: dict[str, Any],
    candidates: list[dict[str, Any]],
) -> dict[str, Any]:
    by_round: dict[int, list[dict[str, Any]]] = {}
    for row in candidates:
        round_index = int(row.get("round") or 1)
        by_round.setdefault(round_index, []).append(row)

    if len(by_round) > DEFAULT_LIMITS["max_rounds"]:
        return {
            "schema": "lucky_girls.closed_loop.stage2_normal02.result.v1",
            "status": "MASTER_DECISION_REQUIRED",
            "reason": "MAX_ROUNDS_EXCEEDED",
            "canonical_promotion": False,
            "history": [],
        }

    for rows in by_round.values():
        if len(rows) > DEFAULT_LIMITS["max_candidates_per_round"]:
            return {
                "schema": "lucky_girls.closed_loop.stage2_normal02.result.v1",
                "status": "MASTER_DECISION_REQUIRED",
                "reason": "MAX_CANDIDATES_PER_ROUND_EXCEEDED",
                "canonical_promotion": False,
                "history": [],
            }

    history: list[dict[str, Any]] = []
    for round_index in sorted(by_round):
        for row in by_round[round_index]:
            candidate = row.get("candidate") or {}
            runs = row.get("runs") or []
            decision = decide_foundation_candidate(candidate, runs, planning_contract)
            entry = {
                "round": round_index,
                "candidate_id": decision.candidate_id,
                "game_build_decision": decision.decision,
                "reasons": list(decision.reasons),
                "canonical_promotion": False,
                "planning_return": (
                    "REVIEW_FOUNDATION_CANDIDATE"
                    if decision.decision == "FOUNDATION_PASS_PLANNING_REVIEW_REQUIRED"
                    else (
                        "AUTHOR_ONE_BOUNDED_REVISION"
                        if decision.decision == "REVISE_ONCE"
                        else "ESCALATE_TO_MASTER"
                    )
                ),
            }
            history.append(entry)

            if decision.decision == "FOUNDATION_PASS_PLANNING_REVIEW_REQUIRED":
                return {
                    "schema": "lucky_girls.closed_loop.stage2_normal02.result.v1",
                    "status": "PLANNING_REVIEW_REQUIRED",
                    "selected_candidate": decision.candidate_id,
                    "completed_rounds": round_index,
                    "history": history,
                    "canonical_promotion": False,
                    "next_owner": "PLANNING",
                }

            if decision.decision == "MASTER_DECISION_REQUIRED":
                return {
                    "schema": "lucky_girls.closed_loop.stage2_normal02.result.v1",
                    "status": "MASTER_DECISION_REQUIRED",
                    "selected_candidate": None,
                    "completed_rounds": round_index,
                    "history": history,
                    "canonical_promotion": False,
                    "next_owner": "MASTER",
                }

    return {
        "schema": "lucky_girls.closed_loop.stage2_normal02.result.v1",
        "status": "MASTER_DECISION_REQUIRED",
        "reason": "BOUNDED_LOOP_EXHAUSTED_WITHOUT_PASS",
        "selected_candidate": None,
        "completed_rounds": len(by_round),
        "history": history,
        "canonical_promotion": False,
        "next_owner": "MASTER",
    }


def self_test() -> dict[str, Any]:
    planning_contract = {
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
    base_candidate = {
        "stage_id": "NORMAL_02",
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

    failing_runs = [
        {
            "seed": seed,
            "validated_fixture": True,
            "runtime_errors": 0,
            "gate_core_hp_end": 80,
            "w5_ttk_sec": 24,
            "w10_td_boss_ttk_sec": 65,
            "gold_earned": 500,
            "gold_spent": 420,
            "td_end_hero_count": 2,
            "rpg_transition_event": "PLUMBING_PASS",
        }
        for seed in [101, 102, 103, 104]
    ]
    passing_runs = [
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
            (201, 95, 24, 46),
            (202, 90, 26, 50),
            (203, 85, 28, 54),
            (204, 80, 30, 58),
        ]
    ]

    c1 = dict(base_candidate)
    c1.update({"candidate_id": "C1", "iteration": 1})
    c2 = dict(base_candidate)
    c2.update({"candidate_id": "C2", "iteration": 2})

    result = run_closed_loop(
        planning_contract,
        [
            {"round": 1, "candidate": c1, "runs": failing_runs},
            {"round": 2, "candidate": c2, "runs": passing_runs},
        ],
    )
    assert result["status"] == "PLANNING_REVIEW_REQUIRED"
    assert result["selected_candidate"] == "C2"
    assert len(result["history"]) == 2
    assert result["history"][0]["game_build_decision"] == "REVISE_ONCE"
    assert result["history"][1]["game_build_decision"] == "FOUNDATION_PASS_PLANNING_REVIEW_REQUIRED"
    assert result["canonical_promotion"] is False
    assert result["next_owner"] == "PLANNING"

    too_many_rounds = run_closed_loop(
        planning_contract,
        [
            {"round": 1, "candidate": c1, "runs": failing_runs},
            {"round": 2, "candidate": c1, "runs": failing_runs},
            {"round": 3, "candidate": c1, "runs": failing_runs},
            {"round": 4, "candidate": c1, "runs": failing_runs},
        ],
    )
    assert too_many_rounds["status"] == "MASTER_DECISION_REQUIRED"
    assert too_many_rounds["reason"] == "MAX_ROUNDS_EXCEEDED"

    return {
        "status": "PASS",
        "bounded_rounds": DEFAULT_LIMITS["max_rounds"],
        "bounded_candidates_per_round": DEFAULT_LIMITS["max_candidates_per_round"],
        "one_revision_then_pass_flow": "PASS",
        "planning_return_required": True,
        "canonical_auto_promotion": False,
    }


if __name__ == "__main__":
    print(json.dumps(self_test(), ensure_ascii=False, indent=2))
