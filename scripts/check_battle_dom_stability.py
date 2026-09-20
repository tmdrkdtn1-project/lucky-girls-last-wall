from pathlib import Path
import sys
html=Path("app/src/main/assets/index.html").read_text(encoding="utf-8")
checks={
 "persistent 16-slot pool":"function ensureGridSlots()" in html and "g._slots&&g._slots.length===16" in html,
 "no grid rebuild in render":"$('grid').innerHTML=''" not in html[html.find("function render(){"):html.find("function unitInfo(")],
 "persistent enemy pool":"function ensureSwarmPool()" in html and "host._pool&&host._pool.length===24" in html,
 "pointer recovery":"function resetBattlePointerState()" in html,
 "global pointer cancel":"window.addEventListener('pointercancel'" in html,
 "visibility recovery":"document.addEventListener('visibilitychange'" in html,
 "dom cardinality diagnostic":"function validateBattleDom()" in html,
}
bad=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(("PASS" if v else "FAIL")+" - "+k)
if bad:
 print("Battle DOM stability regression: "+", ".join(bad),file=sys.stderr);sys.exit(1)
