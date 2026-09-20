from pathlib import Path
import sys
html=Path("app/src/main/assets/index.html").read_text(encoding="utf-8")
checks={
 "state invariant validator":"function validateBattleState(repair=true)" in html,
 "tick validates state":"function startLoop()" in html and "validateBattleState(true);" in html,
 "summon validates state":"function performSummon()" in html and "validateBattleState(true);scheduleBattleRender()" in html,
 "transient fx cap":"function trimTransientFx(host,limit=56)" in html,
 "fx overflow guard":"function validateBattleFx()" in html,
 "render validates fx":"validateBattleFx()" in html,
 "new run clears transient fx":"document.querySelectorAll('.combatTransient').forEach(x=>x.remove())" in html,
 "battle watchdog installed":"function installBattleWatchdog()" in html and "LG_BATTLE_TICK_STALL" in html,
 "watchdog repairs stalled loop":"specialAttackLock=false;lastBattleTickAt=now;startLoop()" in html,
 "boss wave clears stale hitstop":"function beginWave()" in html and "document.querySelectorAll('.combatHitstop').forEach(x=>x.classList.remove('combatHitstop'));resetBattlePointerState()" in html,
 "hitstop cleanup independent":"setTimeout(()=>host.classList.remove('combatHitstop')" in html,
}
bad=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(("PASS" if v else "FAIL")+" - "+k)
if bad:
 print("Battle stress guard regression: "+", ".join(bad),file=sys.stderr);sys.exit(1)
