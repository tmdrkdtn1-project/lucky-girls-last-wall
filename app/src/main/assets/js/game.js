(()=> {
'use strict';

const COLS=18, ROWS=10, CELL_COUNT=COLS*ROWS;
const route=[[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[6,4],[6,3],[7,3],[8,3],[9,3],[10,3],[10,4],[10,5],[11,5],[12,5],[13,5],[14,5],[15,5],[16,5],[17,5],[18,5]];
const castleC=new Set(['17,4','18,4','17,6','18,6']);
const routeSet=new Set(route.map(p=>p.join(',')));
const TILE_ROWS=[
  'WWTTXDDDDDTTTTTTTT',
  'TWTTDDDDDDXTTTTTTT',
  'DDDDDPPPPPDDDDDDDD',
  'DDDDDPDDDPDDDDDDCC',
  'SPPPPPDDDPPPPPPPGO',
  'DDXDDDDTDDDXDDXDCC',
  'DDDDDDTTTDDDDDDDDD',
  'TTTTTTTTTTTTTTTTTT',
  'WWTTTTTTTTTTTTTTTT',
  'TWTTTTTTTTTTTTTTTT'
];
const cells=[], units=new Map(), enemies=[];
let gold=500,wave=1,gHp=100,oHp=120,running=true,speed=1,last=performance.now(),spawnClock=0,waveClock=0,nextEnemyId=1,selected=null,heroCount=0;
const WAVE_DURATION=30;
const BASIC_UNITS={
  knight:{id:'knight',name:'견습기사',short:'검',cost:80,atk:12,range:2.0,rate:0.85,upgrade:'knight2'},
  archer:{id:'archer',name:'견습궁병',short:'궁',cost:90,atk:10,range:3.5,rate:1.05,upgrade:'archer2'},
  mage:{id:'mage',name:'마법사',short:'마',cost:110,atk:17,range:3.0,rate:0.65,upgrade:'mage2'},
  engineer:{id:'engineer',name:'공병',short:'공',cost:100,atk:14,range:2.5,rate:0.75,upgrade:'engineer2'}
};
const UPGRADED={
  knight2:{id:'knight2',name:'기사단',short:'기',cost:120,atk:23,range:2.2,rate:1.0,base:'knight'},
  archer2:{id:'archer2',name:'저격병',short:'저',cost:130,atk:22,range:4.4,rate:0.9,base:'archer'},
  mage2:{id:'mage2',name:'대현자',short:'현',cost:160,atk:31,range:3.5,rate:0.72,base:'mage'},
  engineer2:{id:'engineer2',name:'폭파공병',short:'폭',cost:145,atk:27,range:3.0,rate:0.78,base:'engineer'}
};
/* Temporary input-flow recipe only. Replace with canonical hero-combo table later. */
const HERO_RECIPES=[{id:'ARIA_TEST',name:'아리아',materials:['knight','archer','mage'],atk:55,range:3.7,rate:1.25,status:'PROTOTYPE_INPUT_TEST_ONLY'}];

const $=id=>document.getElementById(id);
const grid=$('grid'), unitLayer=$('unitLayer'), enemyLayer=$('enemyLayer'), bottom=$('bottomUI'), actions=$('actions'), title=$('contextTitle');

function tileKey(x,y){return x+','+y}
function cellIndex(x,y){return (y-1)*COLS+(x-1)}
function codeFor(x,y){
  return TILE_ROWS[y-1][x-1];
}
function buildGrid(){
  for(let y=1;y<=ROWS;y++) for(let x=1;x<=COLS;x++){
    const code=codeFor(x,y), el=document.createElement('div');
    el.className='cell '+code.toLowerCase()+(code==='D'||code==='C'?' deployable':'');
    el.dataset.x=x;el.dataset.y=y;el.dataset.code=code;
    el.innerHTML='<span class="coord">'+x+','+y+'</span><span class="tileLabel">'+code+'</span>';
    el.addEventListener('click',ev=>{ev.stopPropagation();onCellTap(x,y)});
    cells[cellIndex(x,y)]={x,y,code,el};
    grid.insertBefore(el,unitLayer);
  }
  if(cells.length!==CELL_COUNT)throw new Error('18x10 grid build failed');
}
function posPct(x,y){return {left:((x-.5)/COLS*100)+'%',top:((y-.5)/ROWS*100)+'%'}}
function selectCell(x,y){
  clearSelection(false);
  selected={type:'cell',x,y};
  cells[cellIndex(x,y)].el.classList.add('selected');
  renderBottomForEmpty(x,y);
}
function selectUnit(u){
  clearSelection(false);
  selected={type:'unit',id:u.id};
  cells[cellIndex(u.x,u.y)].el.classList.add('selected');
  const combo=comboForUnit(u);
  if(combo)renderBottomForCombo(u,combo); else renderBottomForUnit(u);
}
function clearSelection(hide=true){
  document.querySelectorAll('.cell.selected').forEach(e=>e.classList.remove('selected'));
  selected=null;
  if(hide)bottom.classList.remove('on');
}
function onCellTap(x,y){
  const cell=cells[cellIndex(x,y)];
  const u=units.get(tileKey(x,y));
  if(u){selectUnit(u);return}
  if(cell.code==='D'||cell.code==='C'){selectCell(x,y);return}
  clearSelection(true);
}
function showBottom(text){
  title.textContent=text;actions.innerHTML='';bottom.classList.add('on');
}
function actionButton(name,desc,fn,hero=false,disabled=false){
  const b=document.createElement('button');b.className='action'+(hero?' heroAction':'');
  b.innerHTML='<b>'+name+'</b><small>'+desc+'</small>';b.disabled=disabled;b.onclick=fn;actions.appendChild(b);
}
function renderBottomForEmpty(x,y){
  showBottom('빈 배치칸 '+x+','+y+' · 기본 아군 배치');
  Object.values(BASIC_UNITS).forEach(t=>actionButton(t.name,t.cost+'G · ATK '+t.atk,()=>placeUnit(x,y,t),false,gold<t.cost));
}
function renderBottomForUnit(u){
  const t=BASIC_UNITS[u.type]||UPGRADED[u.type];
  showBottom(t.name+' · '+u.x+','+u.y);
  if(BASIC_UNITS[u.type]){
    const up=UPGRADED[t.upgrade];
    actionButton('업그레이드 → '+up.name,up.cost+'G · ATK '+up.atk,()=>upgradeUnit(u,up),false,gold<up.cost);
  }
  const candidates=Object.values(UPGRADED).filter(v=>v.id!==u.type);
  candidates.slice(0,3).forEach(v=>actionButton('상위 유닛 교체',v.name+' · '+v.cost+'G',()=>replaceUnit(u,v),false,gold<v.cost));
  actionButton('판매','배치 비용 일부 회수',()=>sellUnit(u));
}
function renderBottomForCombo(u,recipe){
  const t=BASIC_UNITS[u.type]||UPGRADED[u.type];
  showBottom(t.name+' · 영웅 조합 가능');
  actionButton('★ '+recipe.name+' 조합','재료 3체 소모 · 선택 위치에 영웅 배치',()=>summonHeroFromRecipe(u,recipe),true,false);
  if(BASIC_UNITS[u.type]){
    const up=UPGRADED[t.upgrade];
    actionButton('일반 업그레이드',up.name+' · '+up.cost+'G',()=>upgradeUnit(u,up),false,gold<up.cost);
  }
}
function placeUnit(x,y,t){
  if(units.has(tileKey(x,y))||gold<t.cost)return;
  gold-=t.cost;
  const u={id:'u'+Date.now()+Math.random(),x,y,type:t.id,lastShot:0};
  units.set(tileKey(x,y),u);
  cells[cellIndex(x,y)].el.classList.add('occupied');
  renderUnits();syncHUD();updateComboHighlights();clearSelection(true);toast(t.name+' 배치');
}
function upgradeUnit(u,t){
  if(gold<t.cost)return;
  gold-=t.cost;u.type=t.id;renderUnits();syncHUD();updateComboHighlights();clearSelection(true);toast(t.name+' 업그레이드');
}
function replaceUnit(u,t){
  if(gold<t.cost)return;
  gold-=t.cost;u.type=t.id;renderUnits();syncHUD();updateComboHighlights();clearSelection(true);toast(t.name+' 교체');
}
function sellUnit(u){
  const t=BASIC_UNITS[u.type]||UPGRADED[u.type]; gold+=Math.round((t?.cost||80)*.5);
  units.delete(tileKey(u.x,u.y));cells[cellIndex(u.x,u.y)].el.classList.remove('occupied');
  renderUnits();syncHUD();updateComboHighlights();clearSelection(true);toast('판매 완료');
}
function recipeMaterials(recipe){
  const picked=[];
  for(const type of recipe.materials){
    const found=[...units.values()].find(u=>u.type===type&&!picked.includes(u));
    if(!found)return null;picked.push(found);
  }
  return picked;
}
function comboForUnit(u){
  for(const r of HERO_RECIPES){
    const mats=recipeMaterials(r);
    if(mats&&mats.some(m=>m.id===u.id))return r;
  }
  return null;
}
function updateComboHighlights(){
  document.querySelectorAll('.cell.combo').forEach(e=>e.classList.remove('combo'));
  HERO_RECIPES.forEach(r=>{
    const mats=recipeMaterials(r);
    if(mats)mats.forEach(m=>cells[cellIndex(m.x,m.y)].el.classList.add('combo'));
  });
}
function summonHeroFromRecipe(selectedMaterial,recipe){
  if(heroCount>=5){toast('영웅 슬롯 5/5');return}
  const mats=recipeMaterials(recipe);if(!mats)return;
  const sx=selectedMaterial.x,sy=selectedMaterial.y;
  mats.forEach(m=>{units.delete(tileKey(m.x,m.y));cells[cellIndex(m.x,m.y)].el.classList.remove('occupied')});
  const h={id:'h'+Date.now(),x:sx,y:sy,type:'hero_aria',hero:recipe.name,atk:recipe.atk,range:recipe.range,rate:recipe.rate,lastShot:0};
  units.set(tileKey(sx,sy),h);cells[cellIndex(sx,sy)].el.classList.add('occupied');heroCount++;
  renderUnits();updateComboHighlights();clearSelection(true);toast(recipe.name+' 조합 완료');
}
function renderUnits(){
  unitLayer.innerHTML='';
  for(const u of units.values()){
    const t=u.type==='hero_aria'?{short:'아'}:(BASIC_UNITS[u.type]||UPGRADED[u.type]);
    const d=document.createElement('div');d.className='unitToken '+(u.type==='hero_aria'?'hero':UPGRADED[u.type]?'upgraded':'basic');
    const p=posPct(u.x,u.y);d.style.left=p.left;d.style.top=p.top;d.textContent=t.short;unitLayer.appendChild(d);
  }
}
function spawnEnemy(boss=false){
  const hp=boss?260+wave*35:48+wave*12;
  enemies.push({id:nextEnemyId++,pathPos:0,hp,maxHp:hp,speed:boss?.32:.62+wave*.015,lastStructureHit:0,boss});
}
function waveSpawnInterval(){return Math.max(.62,1.35-wave*.06)}
function updateEnemies(dt,now){
  spawnClock+=dt;
  const isBossWave=wave===10;
  const limit=isBossWave?1:10+wave*2;
  const spawned=enemies.filter(e=>e.spawnWave===wave).length; // legacy-safe, actual per-wave counter below
  if(!updateEnemies.spawned)updateEnemies.spawned={};
  updateEnemies.spawned[wave]=updateEnemies.spawned[wave]||0;
  if(spawnClock>=waveSpawnInterval()&&updateEnemies.spawned[wave]<limit){
    spawnClock=0;spawnEnemy(isBossWave&&updateEnemies.spawned[wave]===0);
    enemies[enemies.length-1].spawnWave=wave;updateEnemies.spawned[wave]++;
  }
  const gateNormals=enemies.filter(e=>e.hp>0&&!e.boss&&e.pathPos>=route.length-2).slice(0,3);
  const gateBoss=enemies.find(e=>e.hp>0&&e.boss&&e.pathPos>=route.length-2);
  for(const e of enemies){
    if(e.hp<=0)continue;
    if(e.pathPos<route.length-2){
      e.pathPos=Math.min(route.length-2,e.pathPos+e.speed*dt);
    }else{
      const allowed=e.boss ? e===gateBoss : gateNormals.includes(e);
      if(!allowed)continue;
      const hitGap=e.boss?2.2:1.5;
      if(now-e.lastStructureHit>=hitGap){
        e.lastStructureHit=now;
        const dmg=e.boss?40:10;
        if(gHp>0)gHp=Math.max(0,gHp-dmg);
        else oHp=Math.max(0,oHp-dmg);
        if(oHp<=0)running=false;
      }
    }
  }
}
function unitStats(u){
  if(u.type==='hero_aria')return {atk:u.atk,range:u.range,rate:u.rate};
  const t=BASIC_UNITS[u.type]||UPGRADED[u.type];return {atk:t.atk,range:t.range,rate:t.rate};
}
function enemyXY(e){
  const a=route[Math.floor(e.pathPos)], b=route[Math.min(route.length-1,Math.floor(e.pathPos)+1)],f=e.pathPos-Math.floor(e.pathPos);
  return {x:a[0]+(b[0]-a[0])*f,y:a[1]+(b[1]-a[1])*f};
}
function updateUnits(now){
  for(const u of units.values()){
    const s=unitStats(u);if(now-u.lastShot<1/s.rate)continue;
    let target=null,best=999;
    for(const e of enemies){if(e.hp<=0)continue;const p=enemyXY(e),dist=Math.hypot(p.x-u.x,p.y-u.y);if(dist<=s.range&&dist<best){best=dist;target=e}}
    if(target){target.hp-=s.atk;u.lastShot=now;if(target.hp<=0){gold+=target.boss?180:12;toast(target.boss?'보스 처치 +180G':'+12G')}}
  }
}
function renderEnemies(){
  enemyLayer.innerHTML='';
  for(const e of enemies){if(e.hp<=0)continue;const pxy=enemyXY(e),p=posPct(pxy.x,pxy.y),d=document.createElement('div');
    d.className='enemyToken'+(e.boss?' boss':'');d.style.left=p.left;d.style.top=p.top;d.textContent=e.boss?'B':'E';
    d.innerHTML+='<span class="hpbar"><i style="width:'+Math.max(0,e.hp/e.maxHp*100)+'%"></i></span>';enemyLayer.appendChild(d)}
}
function advanceWave(){
  wave++;
  if(wave>10){running=false;toast('STAGE 1 TD 테스트 클리어');return}
  waveClock=0;spawnClock=0;
}
function loop(ts){
  const raw=Math.min(.05,(ts-last)/1000);last=ts;
  if(running){
    const dt=raw*speed;waveClock+=dt;
    updateEnemies(dt,ts/1000);updateUnits(ts/1000);
    if(waveClock>=WAVE_DURATION)advanceWave();
    enemies.splice(0,enemies.length,...enemies.filter(e=>e.hp>0&&!(e.pathPos>=route.length-2&&oHp<=0)));
    renderEnemies();syncHUD();
  }
  requestAnimationFrame(loop);
}
function syncHUD(){$('gold').textContent=gold;$('wave').textContent=Math.min(wave,10);$('gHp').textContent=gHp;$('oHp').textContent=oHp}
function toast(msg){const t=$('toast');t.textContent=msg;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',850)}
$('closeBottom').onclick=()=>clearSelection(true);
$('battlefield').addEventListener('click',()=>clearSelection(true));
$('speed').onclick=()=>{speed=speed===1?2:speed===2?3:1;$('speed').textContent='×'+speed};
$('pause').onclick=()=>{running=!running;$('pause').textContent=running?'Ⅱ':'▶'};
buildGrid();renderUnits();syncHUD();updateComboHighlights();requestAnimationFrame(loop);

window.__LG_STAGE1_TEST__={
  grid:()=>({cols:COLS,rows:ROWS,cells:cells.length}),
  state:()=>({wave,gold,gHp,oHp,units:[...units.values()],enemies:enemies.length,bottomVisible:bottom.classList.contains('on')}),
  select:(x,y)=>onCellTap(x,y),
  place:(x,y,type)=>placeUnit(x,y,BASIC_UNITS[type]),
  route:()=>route.slice(),
  standard:'LG_STAGE1_PLAYABLE_INTERACTION_STANDARD_V1'
};
})();
