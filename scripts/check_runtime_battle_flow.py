from pathlib import Path
import sys
h=Path("app/src/main/assets/index.html").read_text(encoding="utf-8")
checks={
 "runtime prep entry": "prep:(mode='normal',stage=1)=>" in h,
 "runtime prep start click": "prepStart:()=>{$('prepStart').click();return currentScreen}" in h,
 "snapshot exposes screen": "screen:currentScreen" in h,
 "runtime funding hook": "fund:(v=100000)=>" in h,
 "summon reports success": "ok:summonCount>before" in h,
 "500ms summon cooldown": "summonCooldownTimer=setTimeout" in h and "},500)" in h,
 "prep start wired": "$('prepStart').onclick=()=>{$('start').click()}" in h,
 "battle transition": "normalizeBoard();show('battle');enemySkin();" in h,
 "battle loop starts": "render();startLoop()" in h,
 "speed toggle": "speed=speed===1?2:1" in h,
 "formation swap": "swap:(a,b)=>swapFormation(a,b)" in h,
}
bad=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(("PASS" if v else "FAIL")+" - "+k)
if bad:
 print("Runtime battle-flow surface failed: "+", ".join(bad),file=sys.stderr);sys.exit(1)
print("PASS - runtime battle flow surface")
