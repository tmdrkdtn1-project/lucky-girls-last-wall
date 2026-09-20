from pathlib import Path
import sys
html=Path("app/src/main/assets/index.html").read_text(encoding="utf-8")
checks={
 "pointerdown fast action":"function bindFastAction(el,fn)" in html and "el.onpointerdown" in html,
 "summon atomic function":"function performSummon()" in html,
 "summon render batching":"scheduleBattleRender()" in html and "requestAnimationFrame" in html,
 "no direct summon onclick":"$('summon').onclick=()=>{" not in html,
 "summon slot reserved before mutation":"let slot=firstEmptySlot();" in html,
 "modal guard":"activeBattleModal()" in html,
 "fx batching":"summonFxQueued" in html,
}
bad=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(("PASS" if v else "FAIL")+" - "+k)
if bad:
 print("Fast input regression: "+", ".join(bad),file=sys.stderr);sys.exit(1)
