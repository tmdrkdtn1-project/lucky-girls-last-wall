from __future__ import annotations
import http.server,json,queue,subprocess,threading,shutil,tempfile
from pathlib import Path
HERE=Path(__file__).resolve().parent;WT=HERE.parents[1];ASSETS=WT/'app/src/main/assets'
CHROME=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('chromium-browser');SEEDS=[11,22,33,44]
JS=r"""
window.__S2INT_ERR=[];
window.addEventListener('error',e=>window.__S2INT_ERR.push(String(e.error||e.message||e)));
window.addEventListener('unhandledrejection',e=>window.__S2INT_ERR.push(String(e.reason||e)));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
window.addEventListener('load',async()=>{
 const q=window.__LG_STAGE1_TEST__,seed=Number(new URLSearchParams(location.search).get('seed')||11),out={seed,mode:'INTEGRATION_REAL_PATH'};
 try{
  Math.random=rng(seed);const stage=await (await fetch('data/stage02.json')).json(),pol=stage.td_foundation.deterministic_policy;
  await q.priorityC.startStage2IntegrationDiagnostic(4);
  for(const [type,x,y] of pol.placements)q.place(x,y,type);
  const done=new Set();let crafted=false,craftAt=null,tdSteps=0;
  for(let step=0;step<260000;step++){tdSteps=step;let st=q.state(),defs=q.unitDefs();
   for(let i=0;i<pol.upgrade_plan.length;i++){if(done.has(i))continue;const [x,y,fr,to]=pol.upgrade_plan[i],u=st.units.find(v=>v.x===x&&v.y===y);if(u&&u.type===to){done.add(i);continue}if(u&&u.type===fr&&defs[to]&&st.gold>=defs[to].cost){if(q.priorityC.upgrade(x,y,to))done.add(i);break}}
   const boss=q.priorityC.tdBossState();
   if(!crafted&&st.wave===10&&boss&&boss.hp<=boss.maxHp*.20){crafted=q.craftHero('RUBY');if(crafted)craftAt={wave:st.wave,bossHp:boss.hp,bossMaxHp:boss.maxHp,simTime:st.simTime}}
   q.priorityC.stepTd(.05);q.priorityC.forceAdvanceAfterEarlyClear();st=q.state();
   if(st.rpgPending||st.gameMode==='TD_TRANSITION'||st.gameMode==='RPG')break;
  }
  out.tdSteps=tdSteps;out.crafted=crafted;out.craftAt=craftAt;out.tdEndTelemetry=q.priorityC.telemetry();out.tdEndState=q.state();
  for(let i=0;i<180;i++){const s=q.state();if(s.rpg&&!s.rpg.transitioning)break;await sleep(100)}
  let s=q.state();out.rpgStart={state:s.rpg,telemetry:q.priorityC.telemetry()};let firstDefeat=null;
  for(let i=0;i<3000;i++){q.priorityC.stepRpg(.05);s=q.state();if(firstDefeat===null&&s.rpg&&s.rpg.heroes.some(h=>h.ko))firstDefeat=s.rpg.rpgSimTime;if(s.rpg&&s.rpg.result)break}
  out.rpgEnd={state:q.state().rpg,telemetry:q.priorityC.telemetry(),diagnostic:(q.priorityC.rpgDiagnostic?q.priorityC.rpgDiagnostic():null)};out.firstHeroDefeatSec=firstDefeat;out.runtimeErrors=window.__S2INT_ERR.slice();
 }catch(e){out.runtimeErrors=window.__S2INT_ERR.concat(String(e&&e.stack||e))}
 await fetch('/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(out)});document.title='S2INT_DONE';
});
"""
class H(http.server.SimpleHTTPRequestHandler):
 q=queue.Queue()
 def log_message(self,*a):pass
 def do_POST(self):
  if self.path!='/result':self.send_response(404);self.end_headers();return
  n=int(self.headers.get('Content-Length','0'));self.q.put(json.loads(self.rfile.read(n).decode()));self.send_response(200);self.end_headers();self.wfile.write(b'ok')
def main():
 js=ASSETS/'qa_stage2_rpg_integration.js';html=ASSETS/'qa_stage2_rpg_integration.html';js.write_text(JS,encoding='utf-8')
 src=(ASSETS/'index.html').read_text(encoding='utf-8');needle='<script src="js/game.js"></script>';html.write_text(src.replace(needle,needle+'\n<script src="qa_stage2_rpg_integration.js"></script>',1),encoding='utf-8')
 if not CHROME:raise RuntimeError('CHROME_NOT_AVAILABLE_ON_CI')
 srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),lambda *a,**kw:H(*a,directory=str(ASSETS),**kw));threading.Thread(target=srv.serve_forever,daemon=True).start();runs=[]
 try:
  for seed in SEEDS:
   profile=tempfile.mkdtemp(prefix='lg_td_rpg_ci_'+str(seed)+'_')
   cmd=[str(CHROME),'--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-component-update','--disk-cache-size=1',f'--user-data-dir={profile}',f'http://127.0.0.1:{srv.server_address[1]}/qa_stage2_rpg_integration.html?seed={seed}']
   p=subprocess.Popen(cmd,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
   try:runs.append(H.q.get(timeout=120))
   finally:
    try:p.wait(timeout=8)
    except subprocess.TimeoutExpired:p.terminate()
    shutil.rmtree(profile,ignore_errors=True)
  summary={'runCount':len(runs),'runtimeErrors':sum(len(r.get('runtimeErrors',[])) for r in runs),'craftedRuby':sum(bool(r.get('crafted')) for r in runs),'tdTransitionRuns':sum(bool((r.get('rpgEnd',{}).get('telemetry') or {}).get('rpg_transition')) for r in runs),'partyMatchRuns':sum((r.get('rpgEnd',{}).get('telemetry') or {}).get('td_end_hero_ids')==(r.get('rpgEnd',{}).get('telemetry') or {}).get('rpg_party_ids') and bool((r.get('rpgEnd',{}).get('telemetry') or {}).get('td_end_hero_ids')) for r in runs),'victories':sum((r.get('rpgEnd',{}).get('state') or {}).get('result')=='VICTORY' for r in runs),'rpgDurations':[(r.get('rpgEnd',{}).get('state') or {}).get('rpgSimTime') for r in runs],'tdHeroIds':[(r.get('rpgEnd',{}).get('telemetry') or {}).get('td_end_hero_ids') for r in runs],'rpgPartyIds':[(r.get('rpgEnd',{}).get('telemetry') or {}).get('rpg_party_ids') for r in runs],'gateHpAtTdEnd':[(r.get('tdEndTelemetry') or {}).get('gate_hp_at_td_end') for r in runs]}
  summary['integrationPass']=summary['runtimeErrors']==0 and summary['craftedRuby']==4 and summary['tdTransitionRuns']==4 and summary['partyMatchRuns']==4 and summary['victories']==4 and all(isinstance(x,(int,float)) and x>0 for x in summary['gateHpAtTdEnd'])
  out={'schema':'lucky_girls.normal02.td_rpg.integration_real_path.v1','runs':runs,'summary':summary};(HERE/'normal02_td_rpg_integration_result.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(summary,ensure_ascii=False,indent=2))
  if not summary['integrationPass']:
   print(json.dumps({'failedRuns':runs},ensure_ascii=False,indent=2))
   raise AssertionError('NORMAL02_TD_RPG_BROWSER_4_SEED_GATE_FAILED')
 finally:
  srv.shutdown();srv.server_close()
  for p in (js,html):
   if p.exists():p.unlink()
if __name__=='__main__':main()
