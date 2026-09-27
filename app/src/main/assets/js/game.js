(()=> {
'use strict';

const COLS=18, ROWS=10, CELL_COUNT=COLS*ROWS;
const WAVE_DURATION=30;
const route=[[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[6,4],[6,3],[7,3],[8,3],[9,3],[10,3],[10,4],[10,5],[11,5],[12,5],[13,5],[14,5],[15,5],[16,5],[17,5],[18,5]];
const TILE_ROWS=[
 'WWTTXDDDDDTTTTTTTT','TWTTDDDDDDXTTTTTTT','DDDDDPPPPPDDDDDDDD','DDDDDPDDDPDDDDDDCC',
 'SPPPPPDDDPPPPPPPGO','DDXDDDDTDDDXDDXDCC','DDDDDDTTTDDDDDDDDD','TTTTTTTTTTTTTTTTTT',
 'WWTTTTTTTTTTTTTTTT','TWTTTTTTTTTTTTTTTT'
];

const UNIT_DEFS={
 watchtower:{id:'watchtower',family:'WATCHTOWER',tier:1,name:'감시탑',short:'탑',cost:80,atk:15,range:3.0,rate:.80,next:['watchtower2']},
 watchtower2:{id:'watchtower2',family:'WATCHTOWER',tier:2,name:'강화 감시탑',short:'강',cost:120,atk:25,range:4.0,rate:.95,next:['watchtower3_sniper','watchtower3_rapid','watchtower3_pierce']},
 watchtower3_sniper:{id:'watchtower3_sniper',family:'WATCHTOWER',tier:3,name:'저격 감시탑',short:'저탑',cost:165,atk:42,range:6.0,rate:.55,next:[]},
 watchtower3_rapid:{id:'watchtower3_rapid',family:'WATCHTOWER',tier:3,name:'연사 감시탑',short:'연탑',cost:165,atk:24,range:4.0,rate:1.65,next:[]},
 watchtower3_pierce:{id:'watchtower3_pierce',family:'WATCHTOWER',tier:3,name:'관통 감시탑',short:'관탑',cost:165,atk:34,range:4.0,rate:.90,next:[]},

 knight1:{id:'knight1',family:'KNIGHT',tier:1,name:'견습 기사',short:'견',cost:80,atk:18,range:1.3,rate:.90,next:['knight2']},
 knight2:{id:'knight2',family:'KNIGHT',tier:2,name:'상급 기사',short:'상',cost:120,atk:28,range:1.4,rate:1.00,next:['knight3_commander','knight3_berserker']},
 knight3_commander:{id:'knight3_commander',family:'KNIGHT',tier:3,name:'기사단장',short:'단',cost:170,atk:42,range:1.7,rate:1.05,next:[]},
 knight3_berserker:{id:'knight3_berserker',family:'KNIGHT',tier:3,name:'광전사',short:'광',cost:170,atk:36,range:1.8,rate:1.45,next:[]},

 archer1:{id:'archer1',family:'ARCHER',tier:1,name:'견습 궁수',short:'견궁',cost:90,atk:16,range:3.0,rate:.95,next:['archer2']},
 archer2:{id:'archer2',family:'ARCHER',tier:2,name:'저격수',short:'저',cost:130,atk:28,range:5.0,rate:.72,next:['archer3_crossbow','archer3_rapid']},
 archer3_crossbow:{id:'archer3_crossbow',family:'ARCHER',tier:3,name:'석궁수',short:'석',cost:180,atk:38,range:4.0,rate:.78,next:[]},
 archer3_rapid:{id:'archer3_rapid',family:'ARCHER',tier:3,name:'연사궁병',short:'연',cost:180,atk:24,range:4.0,rate:1.60,next:[]},

 lancer1:{id:'lancer1',family:'LANCER',tier:1,name:'투창병',short:'투',cost:100,atk:22,range:2.0,rate:.82,next:['lancer2']},
 lancer2:{id:'lancer2',family:'LANCER',tier:2,name:'프리 랜서',short:'프',cost:145,atk:30,range:3.0,rate:.92,next:['lancer3_elite','lancer3_magic']},
 lancer3_elite:{id:'lancer3_elite',family:'LANCER',tier:3,name:'엘리트 랜서',short:'엘',cost:195,atk:42,range:3.0,rate:1.00,next:[]},
 lancer3_magic:{id:'lancer3_magic',family:'LANCER',tier:3,name:'마창병',short:'마창',cost:195,atk:34,range:4.0,rate:1.05,next:[]}
};
const STAGE1_BASE_IDS=['watchtower','knight1','archer1','lancer1'];

const HERO_RECIPES=[
 {id:'ARIA',name:'아리아',rarity:'LEGENDARY',materials:[{type:'knight3_commander',count:2}],atk:72,range:3.0,rate:1.20}
];

const cells=[], units=new Map(), enemies=[];
let gold=500,wave=1,gHp=100,oHp=120,running=true,speed=1,last=performance.now(),simTime=0;
let spawnClock=0,waveClock=0,nextEnemyId=1,selected=null,heroCount=0,waveSpawned=0,specialSpawned=false,rpgPending=false;

const $=id=>document.getElementById(id);
const grid=$('grid'), unitLayer=$('unitLayer'), enemyLayer=$('enemyLayer'), bottom=$('bottomUI'), actions=$('actions'), title=$('contextTitle');

function tileKey(x,y){return x+','+y}
function cellIndex(x,y){return (y-1)*COLS+(x-1)}
function codeFor(x,y){return TILE_ROWS[y-1][x-1]}
function posPct(x,y){return {left:((x-.5)/COLS*100)+'%',top:((y-.5)/ROWS*100)+'%'}}

function buildGrid(){
 for(let y=1;y<=ROWS;y++) for(let x=1;x<=COLS;x++){
  const code=codeFor(x,y),el=document.createElement('div');
  el.className='cell '+code.toLowerCase()+(code==='D'||code==='C'?' deployable':'');
  el.dataset.x=x;el.dataset.y=y;el.dataset.code=code;
  el.innerHTML='<span class="coord">'+x+','+y+'</span><span class="tileLabel">'+code+'</span>';
  el.addEventListener('click',ev=>{ev.stopPropagation();onCellTap(x,y)});
  cells[cellIndex(x,y)]={x,y,code,el};
  grid.insertBefore(el,unitLayer);
 }
 if(cells.length!==CELL_COUNT)throw new Error('18x10 grid build failed');
}

function clearSelection(hide=true){
 document.querySelectorAll('.cell.selected').forEach(e=>e.classList.remove('selected'));
 selected=null;
 if(hide)bottom.classList.remove('on');
}
function onCellTap(x,y){
 const cell=cells[cellIndex(x,y)],u=units.get(tileKey(x,y));
 if(u){selectUnit(u);return}
 if(cell.code==='D'||cell.code==='C'){selectCell(x,y);return}
 clearSelection(true);
}
function selectCell(x,y){
 clearSelection(false);selected={type:'cell',x,y};cells[cellIndex(x,y)].el.classList.add('selected');renderBottomForEmpty(x,y);
}
function selectUnit(u){
 clearSelection(false);selected={type:'unit',id:u.id};cells[cellIndex(u.x,u.y)].el.classList.add('selected');
 const combo=comboForUnit(u);if(combo)renderBottomForCombo(u,combo);else renderBottomForUnit(u);
}
function showBottom(text){title.textContent=text;actions.innerHTML='';bottom.classList.add('on')}
function actionButton(name,desc,fn,hero=false,disabled=false){
 const b=document.createElement('button');b.className='action'+(hero?' heroAction':'');b.innerHTML='<b>'+name+'</b><small>'+desc+'</small>';
 b.disabled=disabled;b.onclick=fn;actions.appendChild(b);
}

function renderBottomForEmpty(x,y){
 showBottom('빈 배치칸 '+x+','+y+' · 기본 아군 배치');
 STAGE1_BASE_IDS.map(id=>UNIT_DEFS[id]).forEach(t=>actionButton(t.name,t.cost+'G · ATK '+t.atk,()=>placeUnit(x,y,t),false,gold<t.cost));
}
function renderBottomForUnit(u){
 if(u.type==='hero_aria'){showBottom('전설 영웅 · 아리아');actionButton('이동','영웅 이동은 다음 알파 단계에서 연결',()=>toast('이동 시스템 준비 중'),false,true);return}
 const t=UNIT_DEFS[u.type];showBottom(t.name+' · '+u.x+','+u.y+' · T'+t.tier);
 if(t.next.length){
  t.next.map(id=>UNIT_DEFS[id]).forEach(n=>actionButton('업그레이드 → '+n.name,n.cost+'G · 같은 '+t.family+' 계열',()=>upgradeUnit(u,n),false,gold<n.cost));
 }else{
  actionButton('최종 전문화','이 유닛은 현재 최종 단계',()=>{},false,true);
 }
 actionButton('판매','구매/업그레이드 누적비용의 일부 회수',()=>sellUnit(u));
}
function renderBottomForCombo(u,recipe){
 const t=UNIT_DEFS[u.type];showBottom(t.name+' · 전설 조합 가능');
 actionButton('★ '+recipe.name+' 조합','기사단장 2명 소모 · 선택한 기사단장 위치에 배치',()=>summonHeroFromRecipe(u,recipe),true,false);
 actionButton('유닛 정보',t.name+' · KNIGHT T3',()=>{},false,true);
 actionButton('판매','현재 유닛 판매',()=>sellUnit(u));
}
function placeUnit(x,y,t){
 if(units.has(tileKey(x,y))||gold<t.cost)return;
 gold-=t.cost;units.set(tileKey(x,y),{id:'u'+Date.now()+Math.random(),x,y,type:t.id,lastShot:0,spent:t.cost});
 cells[cellIndex(x,y)].el.classList.add('occupied');postUnitChange();toast(t.name+' 배치');
}
function upgradeUnit(u,next){
 const cur=UNIT_DEFS[u.type];
 if(!cur||!cur.next.includes(next.id)){toast('같은 계열 업그레이드만 가능합니다');return}
 if(gold<next.cost)return;
 gold-=next.cost;u.type=next.id;u.spent=(u.spent||0)+next.cost;postUnitChange();toast(next.name+' 업그레이드');
}
function sellUnit(u){
 if(u.type==='hero_aria'){toast('전설 영웅 판매는 현재 잠금');return}
 gold+=Math.max(1,Math.round((u.spent||UNIT_DEFS[u.type].cost)*.35));
 units.delete(tileKey(u.x,u.y));cells[cellIndex(u.x,u.y)].el.classList.remove('occupied');postUnitChange();toast('판매 완료');
}
function postUnitChange(){renderUnits();syncHUD();updateComboHighlights();clearSelection(true)}

function recipeMaterials(recipe){
 const picked=[];
 for(const req of recipe.materials){
  const pool=[...units.values()].filter(u=>u.type===req.type&&!picked.includes(u));
  if(pool.length<req.count)return null;
  picked.push(...pool.slice(0,req.count));
 }
 return picked;
}
function comboForUnit(u){
 for(const r of HERO_RECIPES){const mats=recipeMaterials(r);if(mats&&mats.some(m=>m.id===u.id))return r}
 return null;
}
function updateComboHighlights(){
 document.querySelectorAll('.cell.combo').forEach(e=>e.classList.remove('combo'));
 HERO_RECIPES.forEach(r=>{const mats=recipeMaterials(r);if(mats)mats.forEach(m=>cells[cellIndex(m.x,m.y)].el.classList.add('combo'))});
}
function summonHeroFromRecipe(selectedMaterial,recipe){
 if(heroCount>=5){toast('영웅 슬롯 5/5');return}
 const mats=recipeMaterials(recipe);if(!mats||!mats.some(m=>m.id===selectedMaterial.id))return;
 const sx=selectedMaterial.x,sy=selectedMaterial.y;
 mats.forEach(m=>{units.delete(tileKey(m.x,m.y));cells[cellIndex(m.x,m.y)].el.classList.remove('occupied')});
 units.set(tileKey(sx,sy),{id:'h'+Date.now(),x:sx,y:sy,type:'hero_aria',hero:'아리아',atk:recipe.atk,range:recipe.range,rate:recipe.rate,lastShot:0,spent:0});
 cells[cellIndex(sx,sy)].el.classList.add('occupied');heroCount++;postUnitChange();toast('전설 영웅 아리아 조합 완료');
}

function renderUnits(){
 unitLayer.innerHTML='';
 for(const u of units.values()){
  const hero=u.type==='hero_aria';const t=hero?{short:'아'}:UNIT_DEFS[u.type];
  const d=document.createElement('div');d.className='unitToken '+(hero?'hero':t.tier===3?'tier3':t.tier===2?'tier2':'basic');
  const p=posPct(u.x,u.y);d.style.left=p.left;d.style.top=p.top;d.textContent=t.short;unitLayer.appendChild(d);
 }
}

function normalCountForWave(w){return (10+w*2)*2}
function normalHpForWave(w){return Math.round((48+w*12)*1.2)}
function waveSpawnInterval(){
 const count=normalCountForWave(wave);return Math.max(.34,(WAVE_DURATION-3)/Math.max(1,count));
}
function spawnEnemy(kind='normal'){
 let hp,speedMult=1,label='E';
 if(kind==='midboss'){hp=Math.round(normalHpForWave(wave)*5.5);speedMult=.72;label='M'}
 else if(kind==='boss'){hp=Math.round(normalHpForWave(wave)*9);speedMult=.62;label='B'}
 else hp=normalHpForWave(wave);
 enemies.push({id:nextEnemyId++,kind,label,pathPos:0,hp,maxHp:hp,speed:(.62+wave*.015)*speedMult,lastStructureHit:0});
}
function showWarning(text,sub='',hold=1400){
 const box=$('bossWarning');$('bossWarningTitle').textContent=text;$('bossWarningSub').textContent=sub;box.classList.add('on');
 clearTimeout(showWarning.t);showWarning.t=setTimeout(()=>box.classList.remove('on'),hold);
}
function startWaveNotice(){
 if(wave===5)showWarning('⚠ WARNING','MID BOSS · WAVE 5');
 if(wave===10)showWarning('⚠ BOSS','FINAL TD BOSS · WAVE 10',1700);
}
function updateSpawning(dt){
 spawnClock+=dt;
 if(wave===10){
  // Fallback guard: Wave 10 must always contain exactly one TD boss.
  spawnWave10BossNow();
  return;
 }
 const limit=normalCountForWave(wave);
 if(spawnClock>=waveSpawnInterval()&&waveSpawned<limit){
  spawnClock=0;spawnEnemy('normal');waveSpawned++;
 }
 if(wave===5&&!specialSpawned&&waveClock>=7){
  spawnEnemy('midboss');specialSpawned=true;
 }
}
function enemyXY(e){
 // After Final Wall G breaks, structure-engaged enemies visually/targetably advance to Gate Core O.
 if(e.pathPos>=route.length-2 && gHp<=0)return {x:18,y:5};
 const a=route[Math.floor(e.pathPos)],b=route[Math.min(route.length-1,Math.floor(e.pathPos)+1)],f=e.pathPos-Math.floor(e.pathPos);
 return {x:a[0]+(b[0]-a[0])*f,y:a[1]+(b[1]-a[1])*f};
}
function canCastleDefenderReach(u,e,baseRange){
 const p=enemyXY(e),dist=Math.hypot(p.x-u.x,p.y-u.y);
 if(dist<=baseRange)return true;
 if(e.pathPos<route.length-2)return false;
 // Units deployed on castle C cells always retain line-of-fire against enemies hitting G/O.
 if(codeFor(u.x,u.y)==='C')return true;
 // Front-line defenders immediately in front of the castle get a small gate-defense reach assist.
 const nearCastleFront=(u.x>=15&&u.x<=16&&u.y>=4&&u.y<=6);
 return nearCastleFront&&dist<=Math.max(baseRange,2.25);
}
function updateEnemies(dt,now){
 updateSpawning(dt);
 const gateNormals=enemies.filter(e=>e.hp>0&&e.kind==='normal'&&e.pathPos>=route.length-2).slice(0,3);
 const gateSpecial=enemies.find(e=>e.hp>0&&e.kind!=='normal'&&e.pathPos>=route.length-2);
 for(const e of enemies){
  if(e.hp<=0)continue;
  if(e.pathPos<route.length-2){e.pathPos=Math.min(route.length-2,e.pathPos+e.speed*dt);continue}
  const allowed=e.kind==='normal'?gateNormals.includes(e):e===gateSpecial;if(!allowed)continue;
  const hitGap=e.kind==='boss'?2.2:e.kind==='midboss'?1.9:1.5;
  if(now-e.lastStructureHit>=hitGap){
   e.lastStructureHit=now;const dmg=e.kind==='boss'?40:e.kind==='midboss'?24:10;
   if(gHp>0)gHp=Math.max(0,gHp-dmg);else oHp=Math.max(0,oHp-dmg);
   if(oHp<=0){running=false;showWarning('DEFEAT','GATE CORE DESTROYED',999999)}
  }
 }
}
function unitStats(u){
 if(u.type==='hero_aria')return {atk:u.atk,range:u.range,rate:u.rate};
 const t=UNIT_DEFS[u.type];return {atk:t.atk,range:t.range,rate:t.rate};
}
function updateUnits(now){
 for(const u of units.values()){
  const s=unitStats(u);if(now-u.lastShot<1/s.rate)continue;
  let target=null,best=999;
  for(const e of enemies){
   if(e.hp<=0)continue;const p=enemyXY(e),dist=Math.hypot(p.x-u.x,p.y-u.y);
   if(canCastleDefenderReach(u,e,s.range)&&dist<best){best=dist;target=e}
  }
  if(!target)continue;
  target.hp-=s.atk;u.lastShot=now;
  if(target.hp<=0){
   const reward=target.kind==='boss'?180:target.kind==='midboss'?90:12;gold+=reward;
   if(target.kind==='boss'){enterRpgPlaceholder();return}
   if(target.kind==='midboss')toast('중간보스 격파 +90G');else toast('+12G');
  }
 }
}
function enterRpgPlaceholder(){
 if(rpgPending)return;rpgPending=true;running=false;
 showWarning('TD BOSS DOWN','RPG BOSS BATTLE · NOT IMPLEMENTED YET',999999);
}
function renderEnemies(){
 enemyLayer.innerHTML='';
 for(const e of enemies){
  if(e.hp<=0)continue;const xy=enemyXY(e),p=posPct(xy.x,xy.y),d=document.createElement('div');
  d.className='enemyToken '+(e.kind==='boss'?'boss':e.kind==='midboss'?'midboss':'');
  d.style.left=p.left;d.style.top=p.top;d.textContent=e.label;
  d.innerHTML+='<span class="hpbar"><i style="width:'+Math.max(0,e.hp/e.maxHp*100)+'%"></i></span>';enemyLayer.appendChild(d);
 }
}
function spawnWave10BossNow(){
 if(wave!==10||specialSpawned)return;
 spawnEnemy('boss');
 specialSpawned=true;
 showWarning('⚠ BOSS','FINAL TD BOSS · WAVE 10',1700);
}
function advanceWave(){
 if(wave>=10)return;
 wave++;waveClock=0;spawnClock=0;waveSpawned=0;specialSpawned=false;
 if(wave===10)spawnWave10BossNow();
 else startWaveNotice();
}
function loop(ts){
 const raw=Math.min(.05,(ts-last)/1000);last=ts;
 if(running){
  const dt=raw*speed;simTime+=dt;waveClock+=dt;updateEnemies(dt,simTime);updateUnits(simTime);
  if(wave<10&&waveClock>=WAVE_DURATION)advanceWave();
  renderEnemies();syncHUD();
 }
 requestAnimationFrame(loop);
}
function syncHUD(){$('gold').textContent=gold;$('wave').textContent=wave;$('gHp').textContent=gHp;$('oHp').textContent=oHp}
function toast(msg){const t=$('toast');t.textContent=msg;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',750)}

$('closeBottom').onclick=()=>clearSelection(true);
$('battlefield').addEventListener('click',()=>clearSelection(true));
$('speed').onclick=()=>{speed=speed===1?2:speed===2?3:1;$('speed').textContent='×'+speed};
$('pause').onclick=()=>{if(rpgPending)return;running=!running;$('pause').textContent=running?'Ⅱ':'▶'};

buildGrid();renderUnits();syncHUD();updateComboHighlights();requestAnimationFrame(loop);

window.__LG_STAGE1_TEST__={
 grid:()=>({cols:COLS,rows:ROWS,cells:cells.length}),
 state:()=>({wave,gold,gHp,oHp,speed,simTime,units:[...units.values()],enemies:enemies.length,bosses:enemies.filter(e=>e.kind==='boss'&&e.hp>0).length,bottomVisible:bottom.classList.contains('on'),rpgPending,gatePhase:gHp>0?'FINAL_WALL_G':'GATE_CORE_O'}),
 select:(x,y)=>onCellTap(x,y),
 place:(x,y,type)=>placeUnit(x,y,UNIT_DEFS[type]),
 route:()=>route.slice(),
 recipes:()=>HERO_RECIPES,
 unitDefs:()=>UNIT_DEFS,
 standard:'LG_STAGE1_ALPHA_FIX_V2'
};
})();