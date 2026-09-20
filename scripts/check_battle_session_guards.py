from pathlib import Path
import sys
html=Path("app/src/main/assets/index.html").read_text(encoding="utf-8")
checks={
 "battle session id":"battleSessionId=0" in html,
 "guarded timeout":"function battleTimeout(fn,ms,session=battleSessionId)" in html,
 "new run epoch":"$('start').addEventListener('click',()=>{stopBattleLoop();cleanupBattleRuntimeUI();beginBattleSession();" in html,
 "leave invalidates":"function leaveBattleToPrep(){running=false;invalidateBattleSession();stopBattleLoop();" in html,
 "boss warning guarded":"function warnBossSkill(name,cb){let session=battleSessionId" in html and "battleTimeout(" in html,
 "enemy telegraph guarded":"function telegraphRows(rows,label,cb)" in html and "let session=battleSessionId" in html,
 "defeat transition guarded":"battleTimeout(()=>result(false),500)" in html,
 "clear transition guarded":"battleTimeout(clearStage,450)" in html,
 "restart invalidates":"pauseRestart" in html and "invalidateBattleSession()" in html,
}
bad=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(("PASS" if v else "FAIL")+" - "+k)
if bad:
 print("Battle session regression: "+", ".join(bad),file=sys.stderr);sys.exit(1)
