from pathlib import Path

html=Path("app/src/main/assets/stage1_playable.html").read_text(encoding="utf-8")
manifest=Path("app/src/main/AndroidManifest.xml").read_text(encoding="utf-8")
activity=Path("app/src/main/java/com/luckygirls/lastwall/MainActivity.kt").read_text(encoding="utf-8")

required=[
    "const COLS=18, ROWS=10, CELL_COUNT=COLS*ROWS",
    "cells.length!==CELL_COUNT",
    "renderBottomForEmpty",
    "renderBottomForUnit",
    "renderBottomForCombo",
    "updateComboHighlights",
    "bottom.classList.remove('on')",
    "position:fixed;z-index:50",
    "STAGE 1",
    "G <span id=\"gHp\"",
    "O <span id=\"oHp\"",
    "window.__LG_STAGE1_TEST__"
]
for token in required:
    assert token in html, token

assert 'android:screenOrientation="landscape"' in manifest
assert 'stage1_playable.html' in activity
assert "SCREEN_ORIENTATION_LANDSCAPE" in activity

print("PASS - Stage 1 playable baseline: 18x10/180 cells, contextual bottom UI, fixed top HUD, landscape")
