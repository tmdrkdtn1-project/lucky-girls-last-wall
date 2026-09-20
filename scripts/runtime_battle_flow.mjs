import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
const pageErrors=[]; page.on('pageerror',e=>pageErrors.push(String(e)));
await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>!!window.__LG_TEST__);
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
let tick0=(await page.evaluate(()=>__LG_TEST__.snapshot())).tick; await page.waitForTimeout(2500); let later=await page.evaluate(()=>__LG_TEST__.snapshot()); assert.ok(later.tick>tick0); assert.equal(later.running,true); assert.equal(later.timerAlive,true);
await page.evaluate(()=>__LG_TEST__.fund(0)); await page.waitForTimeout(550); let fail=await page.evaluate(()=>__LG_TEST__.summon()); assert.equal(fail.ok,false); assert.equal(fail.cooldown,false);
// Sustained rapid-input stress: 30 attempts, only cooldown-eligible summons may succeed.
await page.evaluate(()=>__LG_TEST__.fund(100000));
let stressStart=await page.evaluate(()=>__LG_TEST__.snapshot());
for(let i=0;i<30;i++){ await page.evaluate(()=>__LG_TEST__.summon()); await page.waitForTimeout(25); }
await page.waitForTimeout(1200);
let stressEnd=await page.evaluate(()=>__LG_TEST__.snapshot());
assert.equal(stressEnd.running,true); assert.equal(stressEnd.timerAlive,true); assert.ok(stressEnd.tick>=stressStart.tick);
// Repeated speed toggles must not kill or duplicate the persistent scheduler.
for(let i=0;i<12;i++) await page.evaluate(()=>__LG_TEST__.speed());
await page.waitForTimeout(2400);
let speedEnd=await page.evaluate(()=>__LG_TEST__.snapshot());
assert.equal(speedEnd.running,true); assert.equal(speedEnd.timerAlive,true); assert.ok(speedEnd.tick>stressEnd.tick);
assert.deepEqual(pageErrors,[]);
console.log('PASS - Chromium battle prep/start/summon cooldown/swap/speed/tick + rapid-input stress');
await browser.close();
