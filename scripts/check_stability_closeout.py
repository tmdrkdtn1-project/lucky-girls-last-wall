from pathlib import Path
import sys
html=Path("app/src/main/assets/index.html").read_text(encoding="utf-8")
start=html.find("function startLoop()")
end=html.find("$('enter').onclick",start)
loop=html[start:end] if start>=0 and end>=0 else ""
checks={
 "no raw timer clear in battle loop":"clearInterval(timer)" not in loop,
 "terminal clear uses stop helper":"running=false;stopBattleLoop()" in loop,
 "stage clear is session guarded":"battleTimeout(clearStage,450)" in loop,
 "defeat is session guarded":"battleTimeout(()=>result(false),500)" in loop,
 "single interval source":"},intervalMs)}" in loop,
 "lane cleanup session guarded":"battleTimeout(()=>{if(lines[lane])" in html,
 "hitstop cleanup independent fail-safe":"setTimeout(()=>host.querySelectorAll('.combatHitstop').forEach(x=>x.classList.remove('combatHitstop'))" in html,
 "stability snapshot":"function battleStabilitySnapshot()" in html,
 "heartbeat result invariant":"validateResultState();" in loop,
}
bad=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(("PASS" if v else "FAIL")+" - "+k)
if bad:
 print("2.55 stability closeout regression: "+", ".join(bad),file=sys.stderr);sys.exit(1)
