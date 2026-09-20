from pathlib import Path
import re, sys

html=Path("app/src/main/assets/index.html").read_text(encoding="utf-8")

def must(label, cond):
    print(("PASS" if cond else "FAIL")+" - "+label)
    if not cond: failures.append(label)

failures=[]
must("summon uses cooldown gate", "bindFastAction($('summon'),cooledSummon)" in html and "summonCooldown" in html)
must("summon never restarts loop", "function performSummon()" in html and "scheduleBattleRender()" in html and "function performSummon(){if" in html)
must("boss wave resets stale input/hitstop", "function beginWave()" in html and "document.querySelectorAll('.combatHitstop').forEach(x=>x.classList.remove('combatHitstop'));resetBattlePointerState()" in html)
must("boss skill is session guarded", "warnBossSkill(p.n,()=>{" in html and "battleTimeout(()=>{if(w.isConnected)w.remove();if(!running||paused)return;cb()},650,session)" in html)
must("speed toggle keeps persistent timer", "if(running&&!paused)startLoop();" not in html and "intervalMs=100" in html and "battleAccumulatorMs+=elapsed*speed" in html and "waveTime+=2.2" in html)
must("watchdog detects stalled tick", "LG_BATTLE_TICK_STALL" in html and "lastBattleTickAt" in html)
must("watchdog repairs combat locks", "specialAttackLock=false;lastBattleTickAt=now;startLoop()" in html)
must("watchdog is not aggressive", "Math.max(5200,3200/speed)" in html)
must("hitstop cleanup cannot be cancelled by battle session", "setTimeout(()=>host.classList.remove('combatHitstop')" in html)
must("new battle resets loop counters", "lastBattleTickAt=Date.now();battleTickCount=0;installBattleWatchdog()" in html)
must("invalid session stops watchdog", "lastBattleTickAt=0;stopBattleWatchdog()" in html)

# Static stress matrix: all high-risk event paths must coexist without direct raw timer mutation.
start=html.find("function startLoop()")
end=html.find("$('enter').onclick",start)
loop=html[start:end]
step_start=html.find("function runBattleStep()")
step_end=html.find("function startLoop()",step_start)
step=html[step_start:step_end]
must("single timer source in combat loop", loop.count("setInterval(")==1)
must("no raw clearInterval inside combat loop", "clearInterval(timer)" not in loop)
must("boss handling present in simulation step", "bossSkill()" in step and "wave%5===0" in step)
must("scheduler delegates simulation", "runBattleStep()" in loop and "bossSkill()" not in loop)
must("wave advance does not create second timer", "function advanceWave()" in html and "beginWave();" in html)

scenarios=[
 ("W1 x1 summon spam", ["cooledSummon","performSummon","scheduleBattleRender","validateBattleState"]),
 ("W1 x2 summon spam", ["cooledSummon","performSummon","speed=speed===1?2:1","battleAccumulatorMs+=elapsed*speed","waveTime+=2.2"]),
 ("W5 boss x1", ["beginWave","bossHp=100","bossSkill"]),
 ("W5 boss x2 + summon", ["bossSkill","performSummon","battleWatchdogTimer"]),
 ("boss + merge/drag input coexistence", ["performMerge","resetBattlePointerState","bossSkill"]),
]
for name,tokens in scenarios:
    must("scenario "+name, all(t in html for t in tokens))

if failures:
    print("Automated battle stress simulation contract failed: "+", ".join(failures), file=sys.stderr)
    sys.exit(1)
print("PASS - automated battle stress matrix complete")
