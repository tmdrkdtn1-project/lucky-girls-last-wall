from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from balance_lab_v1 import DEFAULT_LIMITS, SEED_POLICY, aggregate_trials, self_test as balance_self_test, validate_trial
from golden_runner_v1 import self_test as golden_self_test


def main() -> None:
    assert SEED_POLICY == {"smoke": 4, "candidate_compare": 16, "promotion_min": 32}
    assert DEFAULT_LIMITS == {"max_rounds": 3, "max_candidates_per_round": 4}

    b = balance_self_test()
    assert b["status"] == "PASS"

    contract = json.loads((HERE / "golden_scenarios_v1.json").read_text(encoding="utf-8"))
    assert len(contract["scenarios"]) == 7
    assert contract["p0_regression_blocks_promotion"] is True

    g = golden_self_test(HERE / "golden_scenarios_v1.json")
    assert g["status"] == "PASS"
    assert g["p0_fail_blocks_promotion"] is True
    assert g["p0_not_run_blocks_promotion"] is True

    direct = {
        "scenario_id": "S",
        "candidate_id": "C",
        "mode": "REAL_PATH",
        "seed": 1,
        "victory": True,
        "legal_path": True,
        "direct_injection": True,
    }
    assert "DIRECT_INJECTION_FORBIDDEN" in validate_trial(direct)

    one = [{
        "scenario_id": "S",
        "candidate_id": "C",
        "mode": "REAL_PATH",
        "seed": 1,
        "victory": True,
        "legal_path": True,
        "direct_injection": False,
        "battle_duration_sec": 50,
    }]
    agg = aggregate_trials(one)
    assert agg["statistical_conclusion_allowed"] is False
    assert agg["seed_evidence_class"] == "INSUFFICIENT_SEEDED_EVIDENCE"

    print("PASS - Balance Lab V1 bounded contract, seed policy, metrics aggregation, REAL_PATH/CORE_SIM separation")
    print("PASS - Golden Scenarios V1 seven-scenario contract and P0 promotion block semantics")
    print("PASS - one-run conclusion and production direct-injection guards")


if __name__ == "__main__":
    main()
