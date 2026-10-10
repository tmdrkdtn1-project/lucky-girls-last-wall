from __future__ import annotations
import http.server,json,queue,subprocess,threading,shutil,tempfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
WT=HERE.parents[1]
ASSETS=WT/'app/src/main/assets'
CHROME=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('chromium-browser')
SEEDS=[11,22,33,44]
JS=r"""
window.__S2RPG_ERR=[];
window.addEventListener('error',e=>window.__S2RPG_ERR.push(String(e.error||e.message||e)));
window.addEventListener('unhandledrejection',e=>window.__S2RPG_ERR.push(String(e.reason||e)));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
window.addEventListener('load',async()=>{
 const q=window.__LG_STAGE1_TEST__,seed=Number(new URLSearchParams(location.search).get('seed')||11),out={seed,mode:'COMPONENT_REAL_PATH_FIXTURE'};
 try{
  Math.random=rng(seed);await q.priorityC.startStage2RpgDiagnostic(['ARIA'],4);
  const summon=q.luckyRoulette.freeSummon('LEGENDARY',1);out.summon=summon;
  if(!summon||summon.summoned[0]!=='ARIA')throw new Error('ARIA_FIXTURE_SUMMON_FAILED');
  q.startRpg();
  for(let i=0;i<100;i++){const s=q.state();if(s.rpg&&!s.rpg.transitioning)break;await sleep(100)}
  let s=q.state();out.start={rpg:s.rpg,bossSource:q.priorityC.rpgBossSource(),telemetry:q.priorityC.telemetry()};
  let firstDefeat=null;
  for(let i=0;i<3000;i++){q.priorityC.stepRpg(.05);s=q.state();if(firstDefeat===null&&s.rpg&&s.rpg.heroes.some(h=>h.ko))firstDefeat=s.rpg.rpgSimTime;if(s.rpg&&s.rpg.result)break}
  s=q.state();out.end={rpg:s.rpg,telemetry:q.priorityC.telemetry(),diagnostic:(q.priorityC.rpgDiagnostic?q.priorityC.rpgDiagnostic():null)};
  out.firstHeroDefeatSec=firstDefeat;out.runtimeErrors=window.__S2RPG_ERR.slice();
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
 js=ASSETS/'qa_stage2_rpg_component.js';html=ASSETS/'qa_stage2_rpg_component.html'
 js.write_text(JS,encoding='utf-8');src=(ASSETS/'index.html').read_text(encoding='utf-8');needle='<script src="js/game.js"></script>'
 if needle not in src:raise RuntimeError('INDEX_SCRIPT_MARKER_MISSING')
 html.write_text(src.replace(needle,needle+'\n<script src="qa_stage2_rpg_component.js"></script>',1),encoding='utf-8')
 if not CHROME:raise RuntimeError('CHROME_NOT_AVAILABLE_ON_CI')
 srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),lambda *a,**kw:H(*a,directory=str(ASSETS),**kw));threading.Thread(target=srv.serve_forever,daemon=True).start();runs=[]
 try:
  for seed in SEEDS:
   profile=tempfile.mkdtemp(prefix='lg_rpg_ci_'+str(seed)+'_')
   cmd=[str(CHROME),'--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-component-update','--disk-cache-size=1',f'--user-data-dir={profile}',f'http://127.0.0.1:{srv.server_address[1]}/qa_stage2_rpg_component.html?seed={seed}']
   p=subprocess.Popen(cmd,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
   try:runs.append(H.q.get(timeout=90))
   finally:
    try:p.wait(timeout=8)
    except subprocess.TimeoutExpired:p.terminate()
    shutil.rmtree(profile,ignore_errors=True)
  summary={'runCount':len(runs),'runtimeErrors':sum(len(r.get('runtimeErrors',[])) for r in runs),'victories':sum((r.get('end',{}).get('rpg') or {}).get('result')=='VICTORY' for r in runs),'durations':[(r.get('end',{}).get('rpg') or {}).get('rpgSimTime') for r in runs],'firstHeroDefeatSec':[r.get('firstHeroDefeatSec') for r in runs],'partyAliveEnd':[sum(not h.get('ko') and h.get('hp',0)>0 for h in ((r.get('end',{}).get('rpg') or {}).get('heroes') or [])) for r in runs],'bossHpConfigured':[r.get('start',{}).get('bossSource',{}).get('hp') for r in runs],'bossHpFirstObserved':[(r.get('start',{}).get('rpg') or {}).get('bossHp') for r in runs],'bossHpEnd':[(r.get('end',{}).get('rpg') or {}).get('bossHp') for r in runs],'bossAtk':[(r.get('start',{}).get('rpg') or {}).get('bossAtk') for r in runs]}
  summary['bandPass']=summary['runtimeErrors']==0 and summary['victories']==4 and all(isinstance(x,(int,float)) and 16<=x<=24 for x in summary['durations']) and all(x is None or x>=25 for x in summary['firstHeroDefeatSec'])
  out={'schema':'lucky_girls.normal02_rpg.component_real_path_fixture.v1','candidate':'RPG_A','runs':runs,'summary':summary}
  (HERE/'normal02_rpg_a_component_result.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(summary,ensure_ascii=False,indent=2))
  if not summary['bandPass']:raise AssertionError('NORMAL02_RPG_BROWSER_4_SEED_GATE_FAILED')
 finally:
  srv.shutdown();srv.server_close()
  for p in (js,html):
   if p.exists():p.unlink()
if __name__=='__main__':main()
