from __future__ import annotations
import http.server,json,queue,subprocess,threading,shutil,tempfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
WT=HERE.parents[1]
ASSETS=WT/'app/src/main/assets'
CHROME=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('chromium-browser')
PROFILE=tempfile.mkdtemp(prefix='lg_release_ci_')
JS=r"""
window.__S2REL_ERR=[];
window.addEventListener('error',e=>window.__S2REL_ERR.push(String(e.error||e.message||e)));
window.addEventListener('unhandledrejection',e=>window.__S2REL_ERR.push(String(e.reason||e)));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
window.addEventListener('load',async()=>{
 const q=window.__LG_STAGE1_TEST__,params=new URLSearchParams(location.search),seed=Number(params.get('seed')||11),reset=params.get('reset')==='1',out={seed,reset};
 try{
  if(reset)q.release.resetForTest();
  out.before=q.release.state();
  Math.random=rng(seed);const stage=await (await fetch('data/stage02.json')).json(),pol=stage.td_foundation.deterministic_policy;
  await q.priorityC.startStage2IntegrationDiagnostic(4);
  for(const [type,x,y] of pol.placements)q.place(x,y,type);
  const done=new Set();let crafted=false;
  for(let step=0;step<260000;step++){let st=q.state(),defs=q.unitDefs();
   for(let i=0;i<pol.upgrade_plan.length;i++){if(done.has(i))continue;const [x,y,fr,to]=pol.upgrade_plan[i],u=st.units.find(v=>v.x===x&&v.y===y);if(u&&u.type===to){done.add(i);continue}if(u&&u.type===fr&&defs[to]&&st.gold>=defs[to].cost){if(q.priorityC.upgrade(x,y,to))done.add(i);break}}
   const boss=q.priorityC.tdBossState();
   if(!crafted&&st.wave===10&&boss&&boss.hp<=boss.maxHp*.20)crafted=q.craftHero('RUBY');
   q.priorityC.stepTd(.05);q.priorityC.forceAdvanceAfterEarlyClear();st=q.state();
   if(st.rpgPending||st.gameMode==='TD_TRANSITION'||st.gameMode==='RPG')break;
  }
  out.crafted=crafted;
  for(let i=0;i<180;i++){const s=q.state();if(s.rpg&&!s.rpg.transitioning)break;await sleep(100)}
  let s=q.state();
  for(let i=0;i<3000;i++){q.priorityC.stepRpg(.05);s=q.state();if(s.rpg&&s.rpg.result)break}
  out.rpgResult=(q.state().rpg||{}).result;out.telemetry=q.priorityC.telemetry();out.releaseEligible=q.release.eligible();out.after=q.release.state();out.runtimeErrors=window.__S2REL_ERR.slice();
 }catch(e){out.runtimeErrors=window.__S2REL_ERR.concat(String(e&&e.stack||e))}
 await fetch('/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(out)});document.title='S2REL_DONE';
});
"""
class H(http.server.SimpleHTTPRequestHandler):
 q=queue.Queue()
 def log_message(self,*a): pass
 def do_POST(self):
  if self.path!='/result': self.send_response(404);self.end_headers();return
  n=int(self.headers.get('Content-Length','0'));self.q.put(json.loads(self.rfile.read(n).decode()));self.send_response(200);self.end_headers();self.wfile.write(b'ok')
def run_once(port,reset):
 cmd=[str(CHROME),'--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-component-update','--disk-cache-size=1',f'--user-data-dir={PROFILE}',f'http://127.0.0.1:{port}/qa_stage2_release.html?seed=11&reset={1 if reset else 0}']
 p=subprocess.Popen(cmd,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 try:return H.q.get(timeout=150)
 finally:
  try:p.wait(timeout=8)
  except subprocess.TimeoutExpired:p.terminate()
def main():
 if not CHROME:raise RuntimeError('CHROME_NOT_AVAILABLE_ON_CI')
 js=ASSETS/'qa_stage2_release.js';html=ASSETS/'qa_stage2_release.html'
 js.write_text(JS,encoding='utf-8')
 src=(ASSETS/'index.html').read_text(encoding='utf-8');needle='<script src="js/game.js"></script>'
 html.write_text(src.replace(needle,needle+'\n<script src="qa_stage2_release.js"></script>',1),encoding='utf-8')
 srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),lambda *a,**kw:H(*a,directory=str(ASSETS),**kw));threading.Thread(target=srv.serve_forever,daemon=True).start()
 try:
  first=run_once(srv.server_address[1],True);second=run_once(srv.server_address[1],False)
  assert not first['runtimeErrors'] and not second['runtimeErrors']
  assert first['crafted'] and second['crafted']
  assert first['rpgResult']=='VICTORY' and second['rpgResult']=='VICTORY'
  assert first['releaseEligible'] and second['releaseEligible']
  assert first['before']=={'growthCurrency':0,'firstClearGranted':False,'clearCount':0,'lastReward':0}
  assert first['after']['growthCurrency']==230 and first['after']['firstClearGranted'] is True and first['after']['clearCount']==1 and first['after']['lastReward']==230
  assert second['before']['growthCurrency']==230 and second['before']['firstClearGranted'] is True and second['before']['clearCount']==1
  assert second['after']['growthCurrency']==390 and second['after']['clearCount']==2 and second['after']['lastReward']==160
  out={'schema':'lucky_girls.normal02.release_idempotency.v1','status':'PASS','first_clear':first,'repeat_clear':second,'summary':{'first_reward':230,'repeat_reward':160,'total_after_two':390,'runtimeErrors':0,'integrated_only':True,'player_unlock':False,'normal03_auto_entry':False}}
  (HERE/'normal02_release_idempotency_result.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  print(json.dumps(out['summary'],ensure_ascii=False,indent=2))
 finally:
  srv.shutdown();srv.server_close()
  for p in (js,html):
   if p.exists():p.unlink()
  shutil.rmtree(PROFILE,ignore_errors=True)
if __name__=='__main__':main()
