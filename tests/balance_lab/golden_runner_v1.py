from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def load_json(path: str | Path) -> dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def _metric_ok(value: Any, rule: dict[str, Any]) -> bool:
    if "equals" in rule and value != rule["equals"]:
        return False
    if value is None:
        return False
    if "min" in rule and value < rule["min"]:
        return False
    if "max" in rule and value > rule["max"]:
        return False
    return True


def evaluate_scenario(scenario: dict[str, Any], evidence: dict[str, Any] | None) -> dict[str, Any]:
    if evidence is None:
        status = "NOT_RUN"
        failures = ["EVIDENCE_MISSING"]
    else:
        checks = evidence.get("checks") or {}
        metrics = evidence.get("metrics") or {}
        failures = []
        for invariant in scenario.get("required_invariants", []):
            if checks.get(invariant) is not True:
                failures.append(f"INVARIANT:{invariant}")
        for metric, rule in (scenario.get("tolerance_bands") or {}).items():
            if not _metric_ok(metrics.get(metric), rule):
                failures.append(f"TOLERANCE:{metric}")
        status = "PASS" if not failures else "FAIL"

    severity = scenario.get("severity", "P1")
    promotion_blocking = severity == "P0" and status != "PASS"
    return {
        "id": scenario["id"],
        "severity": severity,
        "status": status,
        "failures": failures,
        "promotion_blocking": promotion_blocking,
    }


def evaluate_matrix(contract: dict[str, Any], evidence_bundle: dict[str, Any]) -> dict[str, Any]:
    evidence_map = evidence_bundle.get("scenarios") or {}
    rows = [
        evaluate_scenario(scenario, evidence_map.get(scenario["id"]))
        for scenario in contract.get("scenarios", [])
    ]
    p0_blocking = [r["id"] for r in rows if r["promotion_blocking"]]
    return {
        "schema": "lucky_girls.golden_scenarios.result.v1",
        "scenario_count": len(rows),
        "pass_count": sum(r["status"] == "PASS" for r in rows),
        "fail_count": sum(r["status"] == "FAIL" for r in rows),
        "not_run_count": sum(r["status"] == "NOT_RUN" for r in rows),
        "p0_blocking_scenarios": p0_blocking,
        "promotion_gate": "BLOCKED" if p0_blocking else "PASS",
        "results": rows,
    }


def self_test(contract_path: str | Path) -> dict[str, Any]:
    contract = load_json(contract_path)
    first_p0 = next(s for s in contract["scenarios"] if s["severity"] == "P0")
    all_true = {k: True for k in first_p0.get("required_invariants", [])}
    evidence = {"scenarios": {first_p0["id"]: {"checks": all_true, "metrics": {}}}}
    row = evaluate_scenario(first_p0, evidence["scenarios"][first_p0["id"]])
    assert row["status"] == "PASS"
    assert row["promotion_blocking"] is False

    bad_checks = dict(all_true)
    if bad_checks:
        bad_checks[next(iter(bad_checks))] = False
    bad = evaluate_scenario(first_p0, {"checks": bad_checks, "metrics": {}})
    assert bad["status"] == "FAIL"
    assert bad["promotion_blocking"] is True

    matrix = evaluate_matrix(contract, evidence)
    assert matrix["promotion_gate"] == "BLOCKED"

    return {
        "status": "PASS",
        "p0_fail_blocks_promotion": True,
        "p0_not_run_blocks_promotion": True,
        "scenario_count": len(contract["scenarios"]),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--contract", default=str(Path(__file__).with_name("golden_scenarios_v1.json")))
    parser.add_argument("--evidence")
    parser.add_argument("--output")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        result = self_test(args.contract)
    else:
        if not args.evidence:
            raise SystemExit("--evidence is required without --self-test")
        result = evaluate_matrix(load_json(args.contract), load_json(args.evidence))

    text = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        Path(args.output).parent.mkdir(parents=True, exist_ok=True)
        Path(args.output).write_text(text + "\n", encoding="utf-8")
    print(text)


if __name__ == "__main__":
    main()
