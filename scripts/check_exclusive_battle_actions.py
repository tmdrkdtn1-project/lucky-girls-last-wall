from pathlib import Path
import sys
html=Path("app/src/main/assets/index.html").read_text(encoding="utf-8")
checks={
 "summon core guarded":"function performSummon(){if(paused||currentScreen!=='battle'||activeBattleModal())return;" in html,
 "summon cooldown active":"summonCooldown" in html and "summonCooldownTimer=setTimeout" in html and "500)" in html,
 "exclusive guard exists":"function battleExclusiveBlocked()" in html,
 "merge guarded":"function performMerge(){if(battleExclusiveBlocked())return;" in html,
 "luck guarded":"function performLuck(){if(battleExclusiveBlocked())return;" in html,
 "modal prepares pointer":"function prepareExclusiveBattleModal(){resetBattlePointerState();paused=true" in html,
 "duplicate modal validator":"function validateExclusiveModalState()" in html,
 "leave clears overlays":"document.querySelectorAll('.pauseOverlay,.result#mergeGroupChoice" in html,
}
bad=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(("PASS" if v else "FAIL")+" - "+k)
if bad:
 print("Exclusive battle action regression: "+", ".join(bad),file=sys.stderr);sys.exit(1)
