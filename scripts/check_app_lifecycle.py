from pathlib import Path
import sys
html=Path("app/src/main/assets/index.html").read_text(encoding="utf-8")
checks={
 "background handler":"function handleAppHidden()" in html,
 "foreground handler":"function handleAppVisible()" in html,
 "auto pause only active battle":"appAutoPaused=!!(running&&!paused&&!activeBattleModal())" in html,
 "deadline freeze":"function shiftBattleDeadlines(delta)" in html and "u.skillCd[k]+=delta" in html,
 "visibility hooks":"document.addEventListener('visibilitychange'" in html,
 "focus recovery":"window.addEventListener('focus'" in html,
 "foreground validates state":"validateBattleState(true);validateBattleSession();validateBattleDom();validateBattleFx();" in html,
 "resume preserves modal":"appAutoPaused&&running&&!activeBattleModal()" in html,
 "new session clears lifecycle":"appBackgroundAt=0;appAutoPaused=false" in html,
}
bad=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(("PASS" if v else "FAIL")+" - "+k)
if bad:
 print("App lifecycle regression: "+", ".join(bad),file=sys.stderr);sys.exit(1)
