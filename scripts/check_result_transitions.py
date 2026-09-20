from pathlib import Path
import sys
html=Path("app/src/main/assets/index.html").read_text(encoding="utf-8")
checks={
 "shared runtime cleanup":"function cleanupBattleRuntimeUI()" in html,
 "result cleans runtime":"paused=true;stopBattleLoop();cleanupBattleRuntimeUI();" in html,
 "retry cleans runtime":"invalidateBattleSession();cleanupBattleRuntimeUI();x.remove();paused=false;$('start').click()" in html,
 "home cleans runtime":"invalidateBattleSession();cleanupBattleRuntimeUI();x.remove();paused=false;show('home')" in html,
 "exit cleans runtime":"stopBattleLoop();cleanupBattleRuntimeUI();paused=false;renderBattlePrep()" in html,
 "new run cleans runtime":"stopBattleLoop();cleanupBattleRuntimeUI();beginBattleSession();" in html,
 "ended battle does not resume from overlay":"wasPause&&currentScreen==='battle'&&running" in html,
 "result conflict diagnostic":"function validateResultState()" in html,
}
bad=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(("PASS" if v else "FAIL")+" - "+k)
if bad:
 print("Result transition regression: "+", ".join(bad),file=sys.stderr);sys.exit(1)
