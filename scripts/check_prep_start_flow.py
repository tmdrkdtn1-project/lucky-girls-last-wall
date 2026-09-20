from pathlib import Path
import sys

h=Path("app/src/main/assets/index.html").read_text(encoding="utf-8")
checks={
 "prep start button exists": 'id="prepStart"' in h,
 "prep start requires deployment": "prepDeployCount()<1" in h and "toast('출전 영웅을 1명 이상 배치하세요.')" in h and "$('start').click()" in h,
 "prep deployment cap exists": "count>=5" in h and "prepDeployCount()" in h,
 "prep units are free": "paid:0" in h,
 "prep back handler exists": "$('prepBack').onclick=()=>goBackFlow()" in h,
 "prep roster handler exists": "$('prepRosterEdit').onclick=" in h,
 "hidden start handler exists": "$('start').addEventListener('click',()=>{" in h,
 "prepared launch preserves units": "if(currentScreen!=='battlePrep')units=Array(16).fill(null)" in h,
 "battle screen transition exists": "normalizeBoard();show('battle');enemySkin();" in h,
 "battle loop starts": "render();startLoop()" in h,
}
bad=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(("PASS" if v else "FAIL")+" - "+k)
if bad:
 print("Battle prep start-flow contract failed: "+", ".join(bad),file=sys.stderr)
 sys.exit(1)
print("PASS - battle prep start flow connected")
