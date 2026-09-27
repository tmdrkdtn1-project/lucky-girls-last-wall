from pathlib import Path
import json
root=Path("app/src/main/assets")
html=(root/"index.html").read_text(encoding="utf-8")
css=(root/"css/game.css").read_text(encoding="utf-8")
js=(root/"js/game.js").read_text(encoding="utf-8")
stage=json.loads((root/"data/stage01.json").read_text(encoding="utf-8"))
manifest=Path("app/src/main/AndroidManifest.xml").read_text(encoding="utf-8")
activity=Path("app/src/main/java/com/luckygirls/lastwall/MainActivity.kt").read_text(encoding="utf-8")
assert stage["grid"]=={"cols":18,"rows":10,"total":180}
assert len(stage["tile_rows"])==10 and all(len(r)==18 for r in stage["tile_rows"])
assert stage["castle"]["G"]==[[17,5]] and stage["castle"]["O"]==[[18,5]]
assert stage["B_default_present"] is False
for token in ["renderBottomForEmpty","renderBottomForUnit","renderBottomForCombo","updateComboHighlights","CELL_COUNT=COLS*ROWS"]:
    assert token in js, token
assert "#topHUD{position:fixed" in css
assert "#bottomUI" in css and "display:none" in css
assert 'android:screenOrientation="landscape"' in manifest
assert 'file:///android_asset/index.html' in activity
print("PASS - clean Stage 1 baseline")
