from pathlib import Path
import sys
html=Path("app/src/main/assets/index.html").read_text(encoding="utf-8")
checks={
 "central stop helper":"function stopBattleLoop()" in html and "timer=null" in html,
 "pause keeps heartbeat":"function openPauseMenu()" in html and "paused=true;$('pause').textContent='▶'" in html,
 "pause does not clear timer":"function openPauseMenu(){if(activeBattleModal())return;resetBattlePointerState();paused=true;if(timer)clearInterval(timer)" not in html,
 "resume avoids duplicate loop":"if(running&&!timer)startLoop()" in html,
 "speed guarded":"if(currentScreen!=='battle'||activeBattleModal())return;speed=speed===1?2:1" in html,
 "speed restart serialized":"if(running&&!paused)startLoop()" in html,
 "new run stops old loop":"$('start').addEventListener('click',()=>{stopBattleLoop();beginBattleSession();" in html,
 "loop diagnostic":"function validateBattleLoop()" in html,
}
bad=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(("PASS" if v else "FAIL")+" - "+k)
if bad:
 print("Pause/speed loop regression: "+", ".join(bad),file=sys.stderr);sys.exit(1)
