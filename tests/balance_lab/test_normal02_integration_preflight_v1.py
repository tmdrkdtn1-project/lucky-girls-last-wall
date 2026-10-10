"""NORMAL_02 RPG integration safeguards; safe to run before the RPG patch lands.

This preflight deliberately checks release locks and frozen TD only. It does
not claim RPG component, Android or end-to-end qualification.
Run: python tests/balance_lab/test_normal02_integration_preflight_v1.py
"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[2]
assets = ROOT / "app" / "src" / "main" / "assets"
stage = json.loads((assets / "data" / "stage02.json").read_text(encoding="utf-8"))
hierarchy = json.loads((assets / "data" / "map_hierarchy_v1.json").read_text(encoding="utf-8"))
js = (assets / "js" / "game.js").read_text(encoding="utf-8")
html = (assets / "index.html").read_text(encoding="utf-8")

assert stage["identity"]["stage_id"] == "NORMAL_02"
assert stage["identity"]["status"] == "IMPLEMENTED_LOCKED"
assert stage["identity"]["player_exposed"] is False
foundation = stage["td_foundation"]
assert foundation["profile_id"] == "G"
assert foundation["test_only"] is True
assert foundation["player_exposed"] is False
assert foundation["encounter_multipliers"] == {
    "midboss_hp_x": 0.475,
    "td_boss_hp_x": 0.8,
    "structure_damage_x": 0.9,
}
assert foundation["spawn_count_total_per_wave"] == {
    "1": 25, "2": 29, "3": 33, "4": 37, "5": 42,
    "6": 45, "7": 49, "8": 54, "9": 57, "10": 32,
}
world = next(x for x in hierarchy["worlds"] if x["id"] == "WORLD_01")
local_map = next(x for x in world["local_maps"] if x["id"] == "LOCAL_WEST")
stages = local_map["normal"]["stages"]
s2 = next(x for x in stages if x["id"] == "NORMAL_02")
assert s2["status"] == "IMPLEMENTED_LOCKED"
assert s2["player_exposed"] is False
assert s2["td_profile"] == "STAGE2_G"
assert "playerExposed:false,tdProfile:'STAGE2_G'" in js
assert 'data-stage="2" disabled' in html
assert "activeMapSelection.stageId==='NORMAL_01'&&partySize===1?STAGE1_RPG_SOLO_BOSS_DAMAGE_X:1" in js
assert any(
    x["id"] == "NORMAL_03"
    and x["status"] == "DATA_CONFIRMED_RUNTIME_PENDING"
    and x["data_path"] is None
    for x in stages
)
print("PASS - NORMAL_02 preflight frozen TD / Stage1 solo RPG / player locks")
