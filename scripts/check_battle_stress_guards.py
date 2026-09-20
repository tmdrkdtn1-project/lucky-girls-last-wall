from pathlib import Path
import sys
html=Path("app/src/main/assets/index.html").read_text(encoding="utf-8")
checks={
 "state invariant validator":"function validateBattleState(repair=true)" in html,
 "tick validates state":"timer=setInterval(()=>{if(!running)return;validateBattleState(true);" in html,
 "summon validates state":"validateBattleState(true);scheduleBattleRender()" in html,
 "transient fx cap":"function trimTransientFx(host,limit=56)" in html,
 "fx overflow guard":"function validateBattleFx()" in html,
 "render validates fx":"validateBattleFx()" in html,
 "new run clears transient fx":"document.querySelectorAll('.combatTransient').forEach(x=>x.remove())" in html,
}
bad=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(("PASS" if v else "FAIL")+" - "+k)
if bad:
 print("Battle stress guard regression: "+", ".join(bad),file=sys.stderr);sys.exit(1)
