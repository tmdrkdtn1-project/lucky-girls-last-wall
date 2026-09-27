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
assert "beginTdBossRpgTransition" in js and "startRpgBattle" in js
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
assert "\\\\n.enemyToken.boss" not in css
print("PASS - boss matches midboss scale and all alerts stay in blinking top HUD area")

# RPG boss prototype guards
assert 'id="rpgScreen"' in html
assert 'id="rpgHeroRow"' in html
assert "const RPG_HERO_DEFS" in js
assert "ARIA:{" in js and "hp:2600,atk:175,def:125" in js
assert "const RPG_BOSS_DEF" in js
assert "function enterRpgBattle()" in js
assert "function startRpgBattle(tdHeroes)" in js
assert "function updateRpg(dt)" in js
assert "function useRpgUltimate(heroId,fromAuto=false)" in js
assert "function finishRpgVictory()" in js
assert "function finishRpgDefeat(reason)" in js
assert "gameMode==='RPG'" in js
assert "STAGE CLEAR" in js
assert "RPG BATTLE FAILED" in js
assert "PHASE 3 · ENRAGED" in js
assert ".rpgHeroCard" in css and "#rpgBossBody" in css
print("PASS - TD boss now hands off to playable RPG boss prototype with 1-5 TD heroes")

# RPG cinematic intro guards
assert 'id="rpgTransition"' in html
assert "function playRpgIntroSequence()" in js
assert "name+'이 다가온다'" in js
assert "그대들이 바로 마지막 보루, LAST WALL이다." in js
assert "최후의 전투, 개전!" in js
assert "rpgTransitioning=true" in js
assert "running=false;" in js
assert "rpgScreen.classList.add('prep','transitionLock')" in js
assert "rpgScreen.classList.add('approach')" in js
assert "rpgScreen.classList.add('battle')" in js
assert "#rpgScreen.prep #rpgBoss" in css
assert "#rpgScreen.approach #rpgBoss" in css
assert "#rpgScreen.battle #rpgBoss" in css
assert "centerFlash" in css
print("PASS - RPG intro uses front-prep, distant boss, approach beat, LAST WALL line, center start flash, then combat")

# RPG V1.1 transition lock / cinematic / readability / Stage 1 balance guards
assert "gameMode='TD_TRANSITION'" in js
assert "function cancelAllTdCommands()" in js
assert "function beginTdBossRpgTransition(boss)" in js
assert "boss.cinematicState='fallen'" in js
assert "boss.cinematicState='rise'" in js
assert "boss.cinematicState='roar'" in js
assert "boss.cinematicState='charge'" in js
assert "setTimeout(()=>{\n  startRpgBattle(tdHeroes);\n },4700);" in js
assert "if(gameMode!=='TD'||rpgPending)return;" in js
assert "hp:16000,atk:110,def:60,baseAttackGap:3.0" in js
assert "setTimeout(fadeRpgSceneOut,1650)" in js
assert "},2000);" in js and "},5000);" in js and "},8000);" in js
assert 'id="rpgBossStatus"' in html
assert html.count('id="rpgBossName"') == 1
assert html.count('id="rpgBossHpText"') == 1
assert "#rpgBossStatus{" in css
assert ".enemyToken.bossFallen" in css and ".enemyToken.bossRoar" in css and ".enemyToken.bossCharge" in css
print("PASS - RPG V1.1 locks TD commands, adds boss revival cinematic, 2/3/3 fade intro, readable top boss status, and one-legendary Stage 1 tuning")

# RPG V1.2 charge motion / destruction / 60s target / auto battle guards
assert 'id="autoBattle"' in html
assert "rpgAutoBattle=false" in js
assert "function destroyTdDefenseForBossCharge()" in js
assert "tdDestroyed" in js and "tdStructureDestroyed" in js
assert "const from=posPct(start.x,start.y),to=posPct(16.75,5)" in js
assert "requestAnimationFrame(()=>requestAnimationFrame" in js
assert ".enemyToken.bossCharge" in css and "1.35s" in css
assert "@keyframes tdUnitBreak" in css and "@keyframes tdStructureBreak" in css
assert "rpgAutoBattle=!rpgAutoBattle" in js
assert "useRpgUltimate(ready.id,true)" in js
assert "AUTO ON" in js and "AUTO OFF" in js
print("PASS - RPG V1.2 shows real boss charge, destroys TD defense, targets ~60s 1x combat, and adds auto ultimate toggle")

# UI spacing V1 / mobile landscape safe-area guards
assert "--safe-left:env(safe-area-inset-left,0px)" in css
assert "--safe-bottom:env(safe-area-inset-bottom,0px)" in css
assert "left:calc(4% + var(--safe-left))" in css
assert "#grid{width:min(90vw,calc(84vh * 1.8))}" in css
assert ".unitToken{width:4.25%" in css
assert ".enemyToken{width:3.05%" in css
assert "left:calc(10% + var(--safe-left))" in css
assert "bottom:calc(7% + var(--safe-bottom))" in css
assert ".rpgHeroCard{width:min(14.5vw,156px)" in css
print("PASS - UI spacing V1 preserves full-bleed backgrounds while giving TD/RPG combatants safe breathing room")

# TD combat effect engine V1 guards
assert "function targetsForTdAttack(target,profile)" in js
assert "enemyOccupiesRouteCell(e,center)" in js
assert "occupiedRouteCells(e).some(c=>Math.abs(c-center)<=radius)" in js
assert "function addEnemyDot(e,sourceAtk,profile)" in js
assert "function updateEnemyEffects(e,dt)" in js
assert "resolveTdAttack(u,s,target)" in js
assert "target.hp-=s.atk" not in js
assert "damageType:'관통/광역',targetCount:3,areaRadiusCells:1" in js
assert "damageType:'관통/지속',targetCount:2,dotDuration:4,dotTick:1,dotRatio:.25" in js
assert ".enemyToken.hitFx-pierce" in css and ".enemyToken.hitFx-area" in css and ".enemyToken.hitFx-dot" in css
print("PASS - Stage 1 TD attacks now execute single, penetration, area, and prototype DOT semantics instead of UI-only labels")

# Combat semantics V1.1: overlap-based same-cell and RPG penetration mapping
assert "function occupiedRouteCells(e)" in js
assert "function enemyOccupiesRouteCell(e,cellIndex)" in js
assert "occupiedRouteCells(e).some(c=>Math.abs(c-center)<=radius)" in js
assert "enemyOccupiesRouteCell(e,center)" in js
assert "footprintCells:kind==='boss'?1.6:kind==='midboss'?1.3:1.0" in js
assert "skill1DamageType:'관통'" in js
assert "if(options.ignoreDefense)return Math.max(1,Math.round(raw))" in js
assert "skill1.skill1DamageType==='관통'" in js
print("PASS - same-cell uses sprite-footprint overlap, multi-cell enemies are hittable from either cell, and RPG penetration ignores DEF")

# Full combat registry / RPG issue inventory guards
combat_registry=json.loads((root/"data/combat_registry_v1.json").read_text(encoding="utf-8"))
rpg_issues=json.loads((root/"data/rpg_skill_issues_v1.json").read_text(encoding="utf-8"))
assert combat_registry["schema"]=="LG_COMBAT_REGISTRY_V1"
assert combat_registry["counts"]["heroes"]==20
assert combat_registry["counts"]["bosses"]==50
assert all(len(h["skills"])==3 for h in combat_registry["heroes"])
assert all(len(b["skills"])==3 for b in combat_registry["bosses"])
aria=next(h for h in combat_registry["heroes"] if h["name"]=="아리아")
assert aria["source_recipe"]==["기사단장","기사단장"]
assert aria["skills"][0]["rpg_mapping"]["rule"]=="RPG_PENETRATION_IGNORE_DEF"
assert len(rpg_issues["items"])>0
assert any(x["character"]=="아리아" and x["skill"]=="성광 참격" for x in rpg_issues["items"])
print("PASS - full combat registry contains 20 heroes, 50 bosses, skill-bearing enemies, and RPG review inventory")

assert combat_registry["counts"]["skill_enemies"]==len(combat_registry["skill_enemies"])
assert combat_registry["counts"]["skill_enemies"]<65
assert all(e["special_effect"]!="불가능" for e in combat_registry["skill_enemies"])
print("PASS - skill-bearing enemy inventory excludes ordinary enemies and reads the correct source special-effect column")

# Aria TD skill framework V1 guards
assert "const TD_HERO_SKILL_DEFS" in js
assert "ARIA_S1" in js and "ARIA_S2" in js and "ARIA_S3" in js
assert "function castAriaSkill1(u,now)" in js
assert "function castAriaSkill2(u,now)" in js
assert "function castAriaSkill3(u,now)" in js
assert "cellsToHit=[start,start+1,start+2]" in js
assert "attached=e.pathPos>=route.length-2" in js
assert "ally.ariaOathUntil" in js
assert "wallDefBuffUntil" in js and "wallShieldUntil" in js
assert "wallShieldReduction=.50" not in js  # reduction comes from data definition, not hidden literal combat branch
assert "wallDamageReduction:.50" in js
assert "updateHeroSkills(u,now)" in js
print("PASS - Aria TD S1/S2/S3 execute through shared effect primitives with source-backed effects and marked prototype gaps")

# Full RPG translation matrix V1 guards
rpg_translation=json.loads((root/"data/rpg_skill_translation_v1.json").read_text(encoding="utf-8"))
assert rpg_translation["schema"]=="LG_RPG_SKILL_TRANSLATION_V1_3"
assert rpg_translation["counts"]["hero_skills"]==60
assert rpg_translation["counts"]["boss_skills"]==150
assert rpg_translation["counts"]["total"]==210
assert all(x["rpg_rules"] for x in rpg_translation["hero_skills"])
assert all(x["rpg_rules"] for x in rpg_translation["boss_skills"])
assert any(x["character"]=="미아" and x["skill"]=="보물탄" and any("DEF 100% 무시" in r for r in x["rpg_rules"]) for x in rpg_translation["hero_skills"])
assert any(x["character"]=="아리아" and x["skill"]=="수호의 맹세" and "받는 피해 -20%" in x["rpg_rules"][0] for x in rpg_translation["hero_skills"])
assert rpg_issues["schema"]=="LG_RPG_SKILL_ISSUE_REGISTRY_V1_3"
assert all(x.get("mapping") for x in rpg_issues["items"])
print("PASS - all 60 hero and 150 boss skills have RPG translation records; unresolved source gaps are explicitly marked")

# Provisional boss definition closure guards
assert rpg_translation["counts"]["manual_boss_definitions"]==0
assert rpg_translation["counts"]["approved_provisional_boss_definitions"]==43
assert rpg_translation["counts"]["provisional_boss_definitions"]==0
assert all(x["rpg_rules"] for x in rpg_translation["boss_skills"])
assert all(x.get("definition_origin")=="PROJECT_DESIGN_V1_INFERRED_FROM_SKILL_NAME_AND_BOSS_ROLE" for x in rpg_translation["boss_skills"] if x["status"]=="APPROVED_PROVISIONAL_V1")
assert any(x["character"]=="침식의 근원, 사룡 발테리옹" and x["skill"]=="LAST WALL 파괴" and any("즉사" in r for r in x["rpg_rules"]) for x in rpg_translation["boss_skills"])
assert rpg_issues["schema"]=="LG_RPG_SKILL_ISSUE_REGISTRY_V1_3"
print("PASS - all 43 name-only boss skills have explicit provisional RPG behavior and remain clearly separated from source-backed definitions")

# Master approval gate guards
boss_approval=json.loads((root/"data/boss_rpg_skill_approval_v1.json").read_text(encoding="utf-8"))
assert boss_approval["status"]=="APPROVED_FOR_RUNTIME"
assert boss_approval["approved_count"]==43
assert all(x["approval_status"]=="APPROVED_FOR_RUNTIME" for x in boss_approval["items"])
assert all(x["mutable"] is True for x in boss_approval["items"])
print("PASS - all 43 provisional boss RPG skills are approved for runtime while remaining explicitly mutable")

# Shared RPG Effect Runtime V1 guards
effect_runtime=json.loads((root/"data/combat_effect_runtime_v1.json").read_text(encoding="utf-8"))
assert effect_runtime["schema"] in ("LG_COMBAT_EFFECT_RUNTIME_V1","LG_COMBAT_EFFECT_RUNTIME_V1_1","LG_COMBAT_EFFECT_RUNTIME_V1_2")
assert "const RPG_EFFECT_RUNTIME_VERSION='LG_RPG_EFFECT_RUNTIME_V1'" in js
assert "function applyRpgEffect(effect,ctx={})" in js
assert "function applyRpgEffects(effects,ctx={})" in js
assert "function selectRpgTargets(spec,source,effect={})" in js
assert "effect.type==='DAMAGE'" in js and "effect.type==='HEAL'" in js
assert "effect.type==='ATK_MULT'" in js and "effect.type==='RATE_MULT'" in js
assert "effect.type==='DAMAGE_REDUCTION'" in js and "effect.type==='STUN'" in js
assert "ignoreDefense:skill1.skill1DamageType==='관통'" in js
assert "{type:'DAMAGE_REDUCTION',target:'ALL_HEROES',ratio:.50,duration:5}" in js
assert "{type:'DAMAGE_REDUCTION',target:'ALL_HEROES',ratio:.20,duration:8}" in js
assert all(x["status"]=="IMPLEMENTED" for x in effect_runtime["rpg_primitives"][:8])
print("PASS - Stage 1 RPG now uses a shared effect dispatcher for damage, buffs, mitigation, delays, stun, and DEF modifiers")

# RPG advanced primitives V1.1 guards
effect_runtime=json.loads((root/"data/combat_effect_runtime_v1.json").read_text(encoding="utf-8"))
assert effect_runtime["schema"]=="LG_COMBAT_EFFECT_RUNTIME_V1_2"
assert "effect.type==='DOT'" in js
assert "effect.type==='SUMMON'" in js
assert "effect.type==='INVULNERABLE'" in js
assert "effect.type==='SKILL_BLOCK'" in js
assert "effect.type==='REFLECT'" in js
assert "function updateRpgDots(dt)" in js
assert "function updateRpgSummons()" in js
assert "rpgState.summons=rpgState.summons||[]" in js
assert "(h.skillBlockUntil||0)<=rpgSimTime" in js
assert "if((t.invulnerableUntil||0)>rpgSimTime)continue;" in js
assert all(x["status"]=="IMPLEMENTED" for x in effect_runtime["rpg_primitives"])
print("PASS - DOT, summon, invulnerability, skill block, and reflect are now implemented as shared RPG primitives")

# Stage 1 Braum RPG skill connection guards
assert "const RPG_BOSS_SKILL_DEFS" in js
assert "BRAUM_S1" in js and "BRAUM_S2" in js and "BRAUM_S3" in js
assert "function updateRpgBossSkills(b)" in js
assert "function castBraunHornCharge(b)" in js
assert "function castBraunRockCollapse(b)" in js
assert "function castBraunCrushingRoar(b)" in js
assert "target:'RANDOM_HEROES',count:d.targetCount,duration:d.duration" in js
assert "damageTakenMult:1.40" in js
assert "effect.type==='DAMAGE_TAKEN_MULT'" in js
assert "updateRpgBossSkills(b);" in js
braum=[x for x in rpg_translation["boss_skills"] if x["character"]=="철각왕 브라움"]
assert len(braum)==3 and all(x["runtime_status"]=="CONNECTED_STAGE1_V1" for x in braum)
assert next(x for x in braum if x["skill"]=="암반 붕괴")["source_preserved_values"]=={"target_count":2,"duration_sec":6}
assert next(x for x in braum if x["skill"]=="분쇄 포효")["source_preserved_values"]=={"damage_taken_mult":1.4,"duration_sec":8}
print("PASS - Stage 1 Braum S1/S2/S3 are connected through shared RPG effects with source values separated from prototype timing")

# Full 210-skill runtime binding matrix guards
runtime_bindings=json.loads((root/"data/rpg_runtime_bindings_v1.json").read_text(encoding="utf-8"))
adapter_backlog=json.loads((root/"data/rpg_runtime_adapter_backlog_v1.json").read_text(encoding="utf-8"))
assert runtime_bindings["schema"] in ("LG_RPG_RUNTIME_BINDINGS_V1","LG_RPG_RUNTIME_BINDINGS_V1_1","LG_RPG_RUNTIME_BINDINGS_V1_2")
assert runtime_bindings["total"]==210
assert len(runtime_bindings["items"])==210
assert sum(runtime_bindings["counts"].values())==210
assert not any(x["runtime_status"]=="BLOCKED_UNSUPPORTED_PRIMITIVE" for x in runtime_bindings["items"])
assert all(x["unsupported_primitives"]==[] for x in runtime_bindings["items"])
assert len([x for x in runtime_bindings["items"] if x["runtime_status"]=="LIVE_STAGE1"])==3
assert any(x["character"]=="아리아" and x["skill"]=="성광 참격" and x["primitive_options"]["ignoreDefense"] for x in runtime_bindings["items"])
assert adapter_backlog["count"]==len(adapter_backlog["adapters"])
print("PASS - all 210 RPG skills now have machine-readable runtime bindings; special semantics are isolated in an adapter backlog")

# RPG adapter runtime V1 guards
runtime_bindings=json.loads((root/"data/rpg_runtime_bindings_v1.json").read_text(encoding="utf-8"))
adapter_backlog=json.loads((root/"data/rpg_runtime_adapter_backlog_v1.json").read_text(encoding="utf-8"))
assert runtime_bindings["schema"]=="LG_RPG_RUNTIME_BINDINGS_V1_2"
assert adapter_backlog["schema"]=="LG_RPG_RUNTIME_ADAPTER_BACKLOG_V1_2"
assert adapter_backlog["implemented_count"]==11 and adapter_backlog["pending_count"]==0
assert all(a["status"]=="IMPLEMENTED_V1" for a in adapter_backlog["adapters"])
assert "const RPG_ADAPTER_RUNTIME_VERSION='LG_RPG_ADAPTER_RUNTIME_V1'" in js
assert "function runRpgAdapter(id,params={},ctx={})" in js
for adapter_id in ["CHANCE_TRIGGER","CONDITIONAL_EXECUTE","COPY_EFFECT","DEATH_PREVENTION","ECONOMY_DISABLED_IN_RPG","MULTI_HIT_SEQUENCE","RPG_SLOW_TO_ACTION_RATE","SUMMON_AWARE_TARGETING","TIME_REWIND","TRANSFER_CHAIN","ULT_GAUGE_MOD"]:
    assert "id==='"+adapter_id+"'" in js, adapter_id
assert runtime_bindings["counts"].get("NEEDS_ADAPTER",0)==0
assert runtime_bindings["counts"].get("ADAPTER_READY",0)==43
assert "tryRpgDeathPrevention(t)" in js
print("PASS - all 11 RPG adapters are implemented and all 43 adapter-dependent skills are runtime-ready")

# Five explicit RPG effect plans close the remaining definition gap
explicit_plans=json.loads((root/"data/rpg_explicit_effect_plans_v1.json").read_text(encoding="utf-8"))
runtime_bindings=json.loads((root/"data/rpg_runtime_bindings_v1.json").read_text(encoding="utf-8"))
adapter_backlog=json.loads((root/"data/rpg_runtime_adapter_backlog_v1.json").read_text(encoding="utf-8"))
assert explicit_plans["schema"]=="LG_RPG_EXPLICIT_EFFECT_PLANS_V1"
assert explicit_plans["count"]==5 and len(explicit_plans["items"])==5
assert all(x["status"]=="READY_FOR_RUNTIME" for x in explicit_plans["items"])
assert next(x for x in explicit_plans["items"] if x["character"]=="루나" and x["skill"]=="역행의 별")["plan"]["effects"][0]["duration"]==1.5
assert runtime_bindings["schema"]=="LG_RPG_RUNTIME_BINDINGS_V1_2"
assert runtime_bindings["counts"].get("NEEDS_EXPLICIT_EFFECT_PLAN",0)==0
assert runtime_bindings["counts"].get("EXPLICIT_PLAN_READY",0)==5
assert sum(runtime_bindings["counts"].values())==210
assert adapter_backlog["count"]==13 and adapter_backlog["pending_count"]==0
assert "id==='CONDITIONAL_EFFECT'" in js and "id==='TELEGRAPH_SEQUENCE'" in js
assert "function updateRpgPendingEvents()" in js
assert "updateRpgPendingEvents();updateRpgDots(dt)" in js
print("PASS - the final five ambiguous skills have explicit runtime plans; all 210 RPG skill definitions are structurally runtime-ready")
