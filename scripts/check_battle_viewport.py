from pathlib import Path
import sys
html=Path("app/src/main/assets/index.html").read_text(encoding="utf-8")
checks={
 "battle uses 100dvh":"#battle.screen{box-sizing:border-box;height:100dvh" in html,
 "battle overflow hidden":"max-height:100dvh;overflow:hidden" in html,
 "battle grid layout":"#battle.screen.on{display:grid;grid-template-rows:" in html,
 "board 4x4 fixed rows":"grid-template-rows:repeat(4,minmax(0,1fr))" in html,
 "no-scroll class":"battleNoScroll" in html,
 "compact battle message":"class=\"battleMessage\" id=\"msg\"" in html,
 "viewport safety":"function validateBattleViewport()" in html,
}
bad=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(("PASS" if v else "FAIL")+" - "+k)
if bad:
 print("Battle viewport regression: "+", ".join(bad),file=sys.stderr);sys.exit(1)
