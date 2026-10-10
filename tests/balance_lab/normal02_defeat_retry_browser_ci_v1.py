from __future__ import annotations
import http.server,json,queue,subprocess,threading,shutil,tempfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
WT=HERE.parents[1]
ASSETS=WT/'app/src/main/assets'
CHROME=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('chromium-browser')
SEEDS=[11]
JS=r"""
window.__S2RPG_ERR=[];
window.addEventListener('error',e=>window.__S2RPG_ERR.push(String(e.error||e.message||e)));
window.addEventListener('unhandledrejection',e=>window.__S2RPG_ERR.push(String(e.reason||e)));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
window.addEventListener('load',async()=>{
 const q=window.__LG_STAGE1_TEST__,seed=Number(new URLSearchParams(location.search).get('seed')||11),out={seed,mode:'DEFEAT_RETRY_NO_REWARD'};
 try{
  q.release.setForTest({growthCurrency:230,firstClearGranted:true,clearCount:1,lastReward:230});out.before=q.release.state();
  Math.random=rng(seed);await q.priorityC.startStage2RpgDiagnostic(['SERA'],4);
  const summon=q.luckyRoulette.freeSummon('LEGENDARY',1);out.summon=summon;
  if(!summon||summon.summoned[0]!=='SERA')throw new Error('SERA_FIXTURE_SUMMON_FAILED');
  q.startRpg();
  for(let i=0;i<100;i++){const s=q.state();if(s.rpg&&!s.rpg.transitioning)break;await sleep(100)}
  let s=q.state();out.start={rpg:s.rpg,bossSource:q.priorityC.rpgBossSource(),telemetry:q.priorityC.telemetry()};
  let firstDefeat=null;
  for(let i=0;i<3000;i++){q.priorityC.stepRpg(.05);s=q.state();if(firstDefeat===null&&s.rpg&&s.rpg.heroes.some(h=>h.ko))firstDefeat=s.rpg.rpgSimTime;if(s.rpg&&s.rpg.result)break}
  s=q.state();out.end={rpg:s.rpg,telemetry:q.priorityC.telemetry(),diagnostic:(q.priorityC.rpgDiagnostic?q.priorityC.rpgDiagnostic():null)};
  out.firstHeroDefeatSec=firstDefeat;out.afterDefeat=q.release.state();out.releaseEligible=q.release.eligible();
  await sleep(1100);out.resultTitle=document.getElementById('resultTitle').textContent;
  out.resultNextDisplay=document.getElementById('resultNext').style.display;
  document.getElementById('resultRetry').click();await sleep(200);
  out.afterRetry=q.release.state();out.retryGameMode=q.state().gameMode;out.retryWave=q.state().wave;out.selectedStage=q.profile().selectedMap.stageId;
  out.runtimeErrors=window.__S2RPG_ERR.slice();
 }catch(e){out.runtimeErrors=window.__S2RPG_ERR.concat(String(e&&e.stack||e))}
 await fetch('/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(out)});
 document.title='S2RPG_DONE';
});
"""
class H(http.server.SimpleHTTPRequestHandler):
 q=queue.Queue()
 def log_message(self,*a):pass
 def do_POST(self):
  if self.path!='/result':self.send_response(404);self.end_headers();return
  n=int(self.headers.get('Content-Length','0'));self.q.put(json.loads(self.rfile.read(n).decode()));self.send_response(200);self.end_headers();self.wfile.write(b'ok')
def main():
 js=ASSETS/'qa_stage2_defeat_retry.js';html=ASSETS/'qa_stage2_defeat_retry.html'
 js.write_text(JS,encoding='utf-8');src=(ASSETS/'index.html').read_text(encoding='utf-8');needle='<script src="js/game.js"></script>'
 if needle not in src:raise RuntimeError('INDEX_SCRIPT_MARKER_MISSING')
 html.write_text(src.replace(needle,needle+'\n<script src="qa_stage2_defeat_retry.js"></script>',1),encoding='utf-8')
 if not CHROME:raise RuntimeError('CHROME_NOT_AVAILABLE_ON_CI')
 srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),lambda *a,**kw:H(*a,directory=str(ASSETS),**kw));threading.Thread(target=srv.serve_forever,daemon=True).start();runs=[]
 try:
  for seed in SEEDS:
   profile=tempfile.mkdtemp(prefix='lg_defeat_ci_'+str(seed)+'_')
   cmd=[str(CHROME),'--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-component-update','--disk-cache-size=1',f'--user-data-dir={profile}',f'http://127.0.0.1:{srv.server_address[1]}/qa_stage2_defeat_retry.html?seed={seed}']
   p=subprocess.Popen(cmd,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
   try:runs.append(H.q.get(timeout=90))
   finally:
    try:p.wait(timeout=8)
    except subprocess.TimeoutExpired:p.terminate()
    shutil.rmtree(profile,ignore_errors=True)
  expected={'growthCurrency':230,'firstClearGranted':True,'clearCount':1,'lastReward':230}
  row=runs[0] if runs else {}
  summary={
   'runCount':len(runs),
   'runtimeErrors':sum(len(r.get('runtimeErrors',[])) for r in runs),
   'defeats':sum((r.get('end',{}).get('rpg') or {}).get('result')=='DEFEAT' for r in runs),
   'sameBeforeAfterDefeat':row.get('before')==expected and row.get('afterDefeat')==expected,
   'sameAfterRetry':row.get('afterRetry')==expected,
   'retryStage':'NORMAL_02'==row.get('selectedStage'),
   'retryReset':row.get('retryGameMode')=='TD' and row.get('retryWave')==1,
   'nextHidden':row.get('resultTitle')=='DEFEAT' and row.get('resultNextDisplay')=='none',
   'releaseEligible':row.get('releaseEligible'),
   'summonedSera':(row.get('summon') or {}).get('summoned')==['SERA']
  }
  summary['pass']=summary['runtimeErrors']==0 and summary['runCount']==1 and summary['defeats']==1 and all(summary[key] for key in ['sameBeforeAfterDefeat','sameAfterRetry','retryStage','retryReset','nextHidden','summonedSera']) and not summary['releaseEligible']
  out={'schema':'lucky_girls.normal02.defeat_retry_browser_ci.v1','runs':runs,'summary':summary}
  (HERE/'normal02_defeat_retry_ci_result.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  print(json.dumps(summary,ensure_ascii=False,indent=2))
  if not summary['pass']:raise AssertionError('NORMAL02_DEFEAT_RETRY_REWARD_GUARD_FAILED')
 finally:
  srv.shutdown();srv.server_close()
  for p in (js,html):
   if p.exists():p.unlink()
if __name__=='__main__':main()
