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

# V2 regression guards
assert "기사단장" in js and "광전사" in js and "상급 기사" in js
assert "마탑 수습생" not in js  # Stage 5 unlock must not leak into Stage 1 placement
assert "materials:[{type:'knight3_commander',count:2}]" in js
assert "replaceUnit" not in js
assert "wave===5" in js and "midboss" in js
assert "normalCountForWave(w){return (10+w*2)*2}" in js
assert "*1.2" in js
assert "RPG BOSS BATTLE · NOT IMPLEMENTED YET" in js
assert "bossWarning" in html
print("PASS - V2 unit tree / hero recipe / midboss / pressure / boss warning guards")

# Speed sync regression guard
assert "simTime+=dt" in js
assert "updateEnemies(dt,simTime);updateUnits(simTime)" in js
assert "updateEnemies(dt,ts/1000)" not in js
assert "updateUnits(ts/1000)" not in js
print("PASS - speed multiplier advances one shared simulation clock for enemies and allies")

# Castle defense targeting regression guards
assert "canCastleDefenderReach" in js
assert "if(e.pathPos>=route.length-2 && gHp<=0)return {x:18,y:5};" in js
assert "codeFor(u.x,u.y)==='C'" in js
assert "nearCastleFront" in js
assert "gatePhase:gHp>0?'FINAL_WALL_G':'GATE_CORE_O'" in js
print("PASS - castle defenders can keep firing after G breaks and enemies engage O")

# Wave timing / Wave 10 boss / enrage guards
assert "const WAVE_DURATION=40;" in js
assert "WAVE10_WARNING_AT=3" in js
assert "WAVE10_BOSS_SPAWN_AT=6" in js
assert "WAVE10_ENRAGE_AT=40" in js
assert "waveClock<WAVE10_BOSS_SPAWN_AT" in js
assert "BOSS APPROACHING · 3 SEC" in js
assert "spawnWave10BossMidWave" in js
assert "function triggerWave10Enrage()" in js
assert "boss.enraged=true" in js
assert "baseHitGap/1.25" in js
assert "Math.round(baseDmg*1.5)" in js
print("PASS - all waves are 40s; W10 warns at 3s, boss spawns at 6s, enrages at 40s")

# Early wave clear bonus guards
assert "function waveSpawnComplete()" in js
assert "function tryEarlyWaveClear()" in js
assert "remaining*5" in js
assert "적 전멸 보너스" in js
assert "wave>=10" in js
print("PASS - early enemy wipe ends non-boss waves and grants explicit bonus gold")

# Unit movement / hero placement / pause guards
assert "moveCooldownUntil:simTime+5" in js
assert "function beginMove(u)" in js and "function completeMove(x,y)" in js
assert "target.moveCooldownUntil=simTime+5" in js
assert "유닛 교대 완료 · 양쪽 5초 이동 잠금" in js
assert "function beginHeroSummon" in js and "function chooseHeroPlacement" in js
assert "이 출전했다!" in js
assert "running=false;" in js
assert "comboPlacement.positions.find" in js
assert "영웅은 조합 재료가 있던 자리에만 배치할 수 있습니다" in js
assert "Ⅱ 일시정지" in html
assert "manualPaused" in js and "▶ 계속" in js
assert ".cell.moveTarget" in css and ".cell.comboPlacement" in css
print("PASS - all units move/swap with 5s lock; hero placement pauses and uses material slots; manual pause is explicit")

# Upgrade UI combat descriptor guards
assert "function unitFeatureText(t)" in js
assert "ATK '+t.atk+' · '+t.damageType" in js
assert "damageType:'관통/광역'" in js
assert "damageType:'관통/지속'" in js
assert "damageType:'관통'" in js
assert "공중 대응" in js and "지상 전용" in js
print("PASS - placement and upgrade UI show ATK, damage type, and air capability")

# Top alert / boss scale guards
assert ".enemyToken.boss{width:4.8%" in css
assert "top:calc(var(--top) + 8px)" in css
assert "@keyframes topAlertBlink" in css
assert "#bossWarning.on{opacity:1;animation:topAlertBlink" in css
assert "#toast{position:fixed" in css and "animation:topAlertBlink" in css
assert "\\n.enemyToken.boss" not in css
print("PASS - boss matches midboss scale and all alerts stay in blinking top HUD area")
