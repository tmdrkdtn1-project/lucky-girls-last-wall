# Balance Lab V1 / Golden Scenarios V1

Test-only scaffold for MAINDEV-GAMEBUILD-BALANCELAB-GOLDEN-V1-20261004.

## Boundaries

- REAL_PATH uses full legal gameplay paths.
- CORE_SIM is test-harness-only and requires a validated fixture.
- No production direct/test-only injection.
- No automatic canonical promotion.
- One-run balance conclusions are forbidden.
- PLANNING owns target KPI/band semantics.
- P0 Golden regression blocks promotion.
- Physical Android QA remains separate.

## Commands

python tests/balance_lab/balance_lab_v1.py self-test
python tests/balance_lab/golden_runner_v1.py --self-test
python tests/balance_lab/test_balance_lab_v1.py

The Wave5 V2 reuse output is explicitly marked non-seeded and cannot be used as promotion evidence.
