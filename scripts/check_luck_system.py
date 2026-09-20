from pathlib import Path
import sys
html=Path("app/src/main/assets/index.html").read_text(encoding="utf-8")
checks={
 "luck damage helper":"const luckPowerMult=()" in html and "*.001" in html,
 "luck gold helper":"const luckGoldMult=()" in html and "*.002" in html,
 "luck damage applied":"*luckPowerMult()" in html,
 "luck gold applied":"killGold*luckGoldMult()" in html,
 "luck button explains bonus":"const luckBonusText=()" in html,
 "jackpot still requires 100":"if(luck<100)" in html and "luck=0;let r=Math.random();" in html,
}
bad=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(("PASS" if v else "FAIL")+" - "+k)
if bad:
 print("LUCK regression: "+", ".join(bad),file=sys.stderr);sys.exit(1)
