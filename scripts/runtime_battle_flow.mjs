import fs from 'node:fs';
const GLOBAL_TIMEOUT=setTimeout(()=>{console.error('TIMEOUT - runtime battle flow exceeded 150s');process.exit(124)},150000);
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
const pageErrors=[],consoleErrors=[];
page.on('pageerror',e=>{pageErrors.push(String(e));publishState({phase:'pageerror',pageErrors:pageErrors.slice(-8),consoleErrors:consoleErrors.slice(-8)})});
page.on('console',m=>{if(m.type()==='error'||m.type()==='warning'){consoleErrors.push(m.type()+': '+m.text());if(consoleErrors.length>24)consoleErrors.shift()}});
page.on('crash',()=>publishState({phase:'page-crash',pageErrors:pageErrors.slice(-8),consoleErrors:consoleErrors.slice(-8)}));
browser.on('disconnected',()=>publishState({phase:'browser-disconnected',pageErrors:pageErrors.slice(-8),consoleErrors:consoleErrors.slice(-8)}));
let lastMarker='boot',lastBattleDiag=null,battleDiagTail=[];
const stateFile='/tmp/lg-runtime-state.json';
await page.exposeFunction('__lgNodeDiag',entry=>{
  lastBattleDiag=entry;
  battleDiagTail.push(entry);
  if(battleDiagTail.length>24)battleDiagTail.shift();
  try{fs.writeFileSync(stateFile,JSON.stringify({lastMarker,time:new Date().toISOString(),phase:'browser-live-diag',lastBattleDiag,battleDiagTail}))}catch(_){}
});
await page.addInitScript(()=>{
  window.__LG_NODE_DIAG__=entry=>window.__lgNodeDiag(entry).catch(()=>{});
});
const mark=name=>{lastMarker=name;try{fs.writeFileSync(stateFile,JSON.stringify({lastMarker,time:new Date().toISOString()}))}catch(_){}console.log('[RUNTIME]',new Date().toISOString(),name)};
const publishState=(extra={})=>{try{fs.writeFileSync(stateFile,JSON.stringify({lastMarker,time:new Date().toISOString(),lastBattleDiag,battleDiagTail,...extra}))}catch(_){}};
process.on('exit',code=>{if(code!==0)publishState({exitCode:code,lastMarker})});
process.on('uncaughtException',err=>{publishState({fatal:String(err&&err.stack||err)});console.error(err);process.exit(1)});
process.on('unhandledRejection',err=>{publishState({fatal:String(err&&err.stack||err)});console.error(err);process.exit(1)});
const guarded=async(name,fn,ms=15000)=>{
 mark(name+':start');
 let timer;
 try{
  const value=await Promise.race([fn(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('TIMEOUT '+name)),ms)})]);
  mark(name+':ok'); return value;
 }catch(err){
  publishState({phase:'guard-failure',guard:name,lastMarker,fatal:String(err&&err.stack||err)});
  throw err;
 }finally{clearTimeout(timer)}
};
await guarded('page.goto',()=>page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'}));
await guarded('test-api-ready',()=>page.waitForFunction(()=>!!window.__LG_TEST__));
assert.equal(await page.evaluate(()=>__LG_TEST__.prep('normal',1)),'battlePrep');
assert.equal(await page.evaluate(()=>__LG_TEST__.prepStart()),'battlePrep');
let placed=await page.evaluate(()=>__LG_TEST__.prepPlace(0,0));
assert.equal(placed.count,1);
assert.ok(placed.units[0]);
assert.equal(await page.locator('#prepDeployCount').textContent(),'1 / 5');
assert.equal(await page.evaluate(()=>__LG_TEST__.prepStart()),'battle');
let s=await page.evaluate(()=>__LG_TEST__.snapshot()); assert.equal(s.running,true); assert.equal(s.timerAlive,true); assert.equal(s.wave,1);
await page.evaluate(()=>__LG_TEST__.fund(100000));
let first=await page.evaluate(()=>__LG_TEST__.summon()); assert.equal(first.ok,true); assert.equal(first.cooldown,true);
for(let i=0;i<12;i++){let x=await page.evaluate(()=>__LG_TEST__.summon()); assert.equal(x.ok,false);}
await page.waitForTimeout(550);
let second=await page.evaluate(()=>__LG_TEST__.summon()); assert.equal(second.ok,true); assert.equal(second.count,first.count+1);
await page.waitForTimeout(550);
let before=await page.evaluate(()=>__LG_TEST__.units()); let occupied=before.map((u,i)=>u?i:-1).filter(i=>i>=0); assert.ok(occupied.length>=2);
await page.evaluate(([a,b])=>__LG_TEST__.swap(a,b),occupied); let after=await page.evaluate(()=>__LG_TEST__.units()); assert.equal(after[occupied[0]].name,before[occupied[1]].name); assert.equal(after[occupied[1]].name,before[occupied[0]].name);
assert.equal(await page.evaluate(()=>__LG_TEST__.speed()),2);
let tick0=(await page.evaluate(()=>__LG_TEST__.snapshot())).tick; mark('idle-speed2-wait'); await page.waitForTimeout(2500); let later=await guarded('snapshot-after-idle',()=>page.evaluate(()=>__LG_TEST__.snapshot())); assert.ok(later.tick>tick0); assert.equal(later.running,true); assert.equal(later.timerAlive,true);
await page.evaluate(()=>__LG_TEST__.fund(0)); await page.waitForTimeout(550); let fail=await page.evaluate(()=>__LG_TEST__.summon()); assert.equal(fail.ok,false); assert.equal(fail.cooldown,false);
// Sustained rapid-input stress: 30 attempts, only cooldown-eligible summons may succeed.
await page.evaluate(()=>__LG_TEST__.fund(100000));
let stressStart=await page.evaluate(()=>__LG_TEST__.snapshot());
mark('rapid-summon:start');
for(let i=0;i<30;i++){ await guarded('rapid-summon-'+i,()=>page.evaluate(()=>__LG_TEST__.summon()),5000); await page.waitForTimeout(25); }
mark('rapid-summon:end');
await page.waitForTimeout(1200);
let stressEnd=await guarded('snapshot-after-rapid',()=>page.evaluate(()=>__LG_TEST__.snapshot()));
assert.equal(stressEnd.running,true); assert.equal(stressEnd.timerAlive,true); assert.ok(stressEnd.tick>=stressStart.tick);
// Repeated speed toggles must not kill or duplicate the persistent scheduler.
mark('speed-toggle:start');
for(let i=0;i<12;i++) await guarded('speed-toggle-'+i,()=>page.evaluate(()=>__LG_TEST__.speed()),5000);
mark('speed-toggle:end');
await page.waitForTimeout(2400);
let speedEnd=await guarded('snapshot-after-speed-stress',()=>page.evaluate(()=>__LG_TEST__.snapshot()));
assert.equal(speedEnd.running,true); assert.equal(speedEnd.timerAlive,true); assert.ok(speedEnd.tick>stressEnd.tick);
// Extended idle soak: exercise battle/VFX/render paths without user input.
mark('idle-soak:start');
let soak0=await guarded('idle-soak-before',()=>page.evaluate(()=>__LG_TEST__.snapshot()));
let soakPrev=soak0,soakTicks=[soak0.tick],soakSeries=[{sec:0,...soak0}];
for(let sec=10;sec<=60;sec+=10){
  await page.waitForTimeout(10000);
  let snap=await guarded('idle-soak-'+sec+'s',()=>page.evaluate(()=>__LG_TEST__.snapshot()),5000);
  if(!(snap.running===true&&snap.timerAlive===true&&snap.tick>soakPrev.tick)){
    publishState({phase:'idle-soak',sec,previous:soakPrev,current:snap});
    throw new Error('IDLE_SOAK_LIVENESS '+sec+'s');
  }
  soakTicks.push(snap.tick); soakSeries.push({sec,...snap}); publishState({phase:'idle-soak-progress',sec,soakSeries}); soakPrev=snap;
}
let soak1=soakPrev;
let deltas=soakTicks.slice(1).map((v,i)=>v-soakTicks[i]);
console.log('[SOAK_TICKS]',JSON.stringify({ticks:soakTicks,deltas}));
publishState({phase:'idle-soak-complete',soakSeries,deltas});
if(!deltas.every(d=>d>=3)){publishState({phase:'idle-cadence',ticks:soakTicks,deltas});throw new Error('IDLE_SOAK_CADENCE '+JSON.stringify(deltas))}
console.log('[SOAK_DOM]',JSON.stringify({start:soak0.domNodes,end:soak1.domNodes,fxStart:soak0.transientFx,fxEnd:soak1.transientFx}));
if(!(soak1.domNodes-soak0.domNodes<80)){publishState({phase:'dom-growth',start:soak0,end:soak1});throw new Error('IDLE_SOAK_DOM_GROWTH '+(soak1.domNodes-soak0.domNodes))}
if(!(soak1.transientFx<=72)){publishState({phase:'fx-overflow',start:soak0,end:soak1});throw new Error('IDLE_SOAK_FX_OVERFLOW '+soak1.transientFx)}
mark('idle-soak:end');
// Post-soak recovery: interactions must still respond after one minute of autonomous combat.
let postSpeed=await guarded('post-soak-speed',()=>page.evaluate(()=>__LG_TEST__.speed()),5000);
assert.ok(postSpeed===1||postSpeed===2);
await guarded('post-soak-summon',()=>page.evaluate(()=>__LG_TEST__.summon()),5000);
let postSoak=await guarded('post-soak-snapshot',()=>page.evaluate(()=>__LG_TEST__.snapshot()),5000);
assert.equal(postSoak.running,true); assert.equal(postSoak.timerAlive,true);
// Diagnostic persistence must survive a reload, matching the real-device freeze/restart workflow.
let savedDiag=await guarded('diag-saved-before-reload',()=>page.evaluate(()=>__LG_DIAG__.saved()),5000);
assert.ok(savedDiag.length>0);
await guarded('diagnostic-reload',()=>page.reload({waitUntil:'domcontentloaded'}),15000);
await guarded('diagnostic-api-after-reload',()=>page.waitForFunction(()=>!!window.__LG_DIAG__),10000);
let reloadedDiag=await guarded('diag-saved-after-reload',()=>page.evaluate(()=>__LG_DIAG__.saved()),5000);
assert.ok(reloadedDiag.length>0);
assert.deepEqual(pageErrors,[]);
console.log('PASS - Chromium battle prep/start/summon cooldown/swap/speed/tick + rapid-input stress');
await browser.close();
clearTimeout(GLOBAL_TIMEOUT);
