(()=> {
'use strict';

const COLS=18, ROWS=10, CELL_COUNT=COLS*ROWS;
const WAVE_DURATION=40;
const route=[[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[6,4],[6,3],[7,3],[8,3],[9,3],[10,3],[10,4],[10,5],[11,5],[12,5],[13,5],[14,5],[15,5],[16,5],[17,5],[18,5]];
const TILE_ROWS=[
 'WWTTXDDDDDTTTTTTTT','TWTTDDDDDDXTTTTTTT','DDDDDPPPPPDDDDDDDD','DDDDDPDDDPDDDDDDCC',
 'SPPPPPDDDPPPPPPPGO','DDXDDDDTDDDXDDXDCC','DDDDDDTTTDDDDDDDDD','TTTTTTTTTTTTTTTTTT',
 'WWTTTTTTTTTTTTTTTT','TWTTTTTTTTTTTTTTTT'
];

const UNIT_DEFS={
 watchtower:{id:'watchtower',family:'WATCHTOWER',tier:1,name:'감시탑',short:'탑',cost:80,atk:15,range:3.0,rate:.80,damageType:'단일',air:true,next:['watchtower2']},
 watchtower2:{id:'watchtower2',family:'WATCHTOWER',tier:2,name:'강화 감시탑',short:'강',cost:120,atk:25,range:4.0,rate:.95,damageType:'단일',air:true,next:['watchtower3_sniper','watchtower3_rapid','watchtower3_pierce']},
 watchtower3_sniper:{id:'watchtower3_sniper',family:'WATCHTOWER',tier:3,name:'저격 감시탑',short:'저탑',cost:165,atk:42,range:6.0,rate:.55,damageType:'단일',air:true,next:[]},
 watchtower3_rapid:{id:'watchtower3_rapid',family:'WATCHTOWER',tier:3,name:'연사 감시탑',short:'연탑',cost:165,atk:24,range:4.0,rate:1.65,damageType:'단일',air:true,next:[]},
 watchtower3_pierce:{id:'watchtower3_pierce',family:'WATCHTOWER',tier:3,name:'관통 감시탑',short:'관탑',cost:165,atk:34,range:4.0,rate:.90,damageType:'관통',air:true,next:[]},

 knight1:{id:'knight1',family:'KNIGHT',tier:1,name:'견습 기사',short:'견',cost:80,atk:18,range:1.3,rate:.90,damageType:'단일',air:false,next:['knight2']},
 knight2:{id:'knight2',family:'KNIGHT',tier:2,name:'상급 기사',short:'상',cost:120,atk:28,range:1.4,rate:1.00,damageType:'단일',air:false,next:['knight3_commander','knight3_berserker']},
 knight3_commander:{id:'knight3_commander',family:'KNIGHT',tier:3,name:'기사단장',short:'단',cost:170,atk:42,range:1.7,rate:1.05,damageType:'관통',air:false,next:[]},
 knight3_berserker:{id:'knight3_berserker',family:'KNIGHT',tier:3,name:'광전사',short:'광',cost:170,atk:36,range:1.8,rate:1.45,damageType:'관통/광역',air:false,next:[]},

 archer1:{id:'archer1',family:'ARCHER',tier:1,name:'견습 궁수',short:'견궁',cost:90,atk:16,range:3.0,rate:.95,damageType:'단일',air:true,next:['archer2']},
 archer2:{id:'archer2',family:'ARCHER',tier:2,name:'저격수',short:'저',cost:130,atk:28,range:5.0,rate:.72,damageType:'단일',air:true,next:['archer3_crossbow','archer3_rapid']},
 archer3_crossbow:{id:'archer3_crossbow',family:'ARCHER',tier:3,name:'석궁수',short:'석',cost:180,atk:38,range:4.0,rate:.78,damageType:'관통',air:true,next:[]},
 archer3_rapid:{id:'archer3_rapid',family:'ARCHER',tier:3,name:'연사궁병',short:'연',cost:180,atk:24,range:4.0,rate:1.60,damageType:'관통/광역',air:true,next:[]},

 lancer1:{id:'lancer1',family:'LANCER',tier:1,name:'투창병',short:'투',cost:100,atk:22,range:2.0,rate:.82,damageType:'관통',air:false,next:['lancer2']},
 lancer2:{id:'lancer2',family:'LANCER',tier:2,name:'프리 랜서',short:'프',cost:145,atk:30,range:3.0,rate:.92,damageType:'관통',air:true,next:['lancer3_elite','lancer3_magic']},
 lancer3_elite:{id:'lancer3_elite',family:'LANCER',tier:3,name:'엘리트 랜서',short:'엘',cost:195,atk:42,range:3.0,rate:1.00,damageType:'관통/광역',air:true,next:[]},
 lancer3_magic:{id:'lancer3_magic',family:'LANCER',tier:3,name:'마창병',short:'마창',cost:195,atk:34,range:4.0,rate:1.05,damageType:'관통/지속',air:true,next:[]}
};
const STAGE1_BASE_IDS=['watchtower','knight1','archer1','lancer1'];

const HERO_RECIPES=[
 {id:'ARIA',name:'아리아',rarity:'LEGENDARY',materials:[{type:'knight3_commander',count:2}],atk:72,range:3.0,rate:1.20}
];

const cells=[], units=new Map(), enemies=[];
let gold=500,wave=1,gHp=100,oHp=120,running=true,speed=1,last=performance.now(),simTime=0;
let spawnClock=0,waveClock=0,nextEnemyId=1,selected=null,heroCount=0,waveSpawned=0,specialSpawned=false,rpgPending=false,waveEnding=false;
let moveModeUnitId=null,comboPlacement=null,manualPaused=false;
let gameMode='TD',rpgState=null,rpgSimTime=0;

const $=id=>document.getElementById(id);
const grid=$('grid'), unitLayer=$('unitLayer'), enemyLayer=$('enemyLayer'), bottom=$('bottomUI'), actions=$('actions'), title=$('contextTitle');
const rpgScreen=$('rpgScreen'),rpgHeroRow=$('rpgHeroRow');

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
 if(comboPlacement){chooseHeroPlacement(x,y);return}
 if(moveModeUnitId){completeMove(x,y);return}
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

function unitFeatureText(t){
 return t.cost+'G · ATK '+t.atk+' · '+t.damageType+' · '+(t.air?'공중 대응':'지상 전용');
}
function renderBottomForEmpty(x,y){
 showBottom('빈 배치칸 '+x+','+y+' · 기본 아군 배치');
 STAGE1_BASE_IDS.map(id=>UNIT_DEFS[id]).forEach(t=>actionButton(t.name,unitFeatureText(t),()=>placeUnit(x,y,t),false,gold<t.cost));
}
function moveCooldownRemaining(u){return Math.max(0,(u.moveCooldownUntil||0)-simTime)}
function renderMoveAction(u){
 const remain=moveCooldownRemaining(u);
 actionButton('이동',remain>0?'재이동 대기 '+remain.toFixed(1)+'초':'빈 자리 이동 / 점유 자리와 교대',()=>beginMove(u),false,remain>0);
}
function renderBottomForUnit(u){
 if(u.type==='hero_aria'){
  showBottom('전설 영웅 · 아리아');
  renderMoveAction(u);
  return;
 }
 const t=UNIT_DEFS[u.type];showBottom(t.name+' · '+u.x+','+u.y+' · T'+t.tier);
 if(t.next.length){
  t.next.map(id=>UNIT_DEFS[id]).forEach(n=>actionButton('업그레이드 → '+n.name,unitFeatureText(n),()=>upgradeUnit(u,n),false,gold<n.cost));
 }else{
  actionButton('최종 전문화','이 유닛은 현재 최종 단계',()=>{},false,true);
 }
 renderMoveAction(u);
 actionButton('판매','구매/업그레이드 누적비용의 일부 회수',()=>sellUnit(u));
}
function renderBottomForCombo(u,recipe){
 const t=UNIT_DEFS[u.type];showBottom(t.name+' · 전설 조합 가능');
 actionButton('★ '+recipe.name+' 조합','재료 자리 중 영웅 배치 위치를 직접 선택',()=>beginHeroSummon(u,recipe),true,false);
 actionButton('유닛 정보',t.name+' · KNIGHT T3',()=>{},false,true);
 actionButton('판매','현재 유닛 판매',()=>sellUnit(u));
}
function placeUnit(x,y,t){
 if(units.has(tileKey(x,y))||gold<t.cost)return;
 gold-=t.cost;units.set(tileKey(x,y),{id:'u'+Date.now()+Math.random(),x,y,type:t.id,lastShot:0,spent:t.cost,moveCooldownUntil:0});
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
function beginHeroSummon(selectedMaterial,recipe){
 if(heroCount>=5){toast('영웅 슬롯 5/5');return}
 const mats=recipeMaterials(recipe);
 if(!mats||!mats.some(m=>m.id===selectedMaterial.id))return;
 moveModeUnitId=null;clearMoveTargets();
 comboPlacement={recipe,materialIds:mats.map(m=>m.id),positions:mats.map(m=>({x:m.x,y:m.y})),wasRunning:running};
 running=false;
 clearSelection(true);
 document.querySelectorAll('.cell.comboPlacement').forEach(e=>e.classList.remove('comboPlacement'));
 comboPlacement.positions.forEach(p=>cells[cellIndex(p.x,p.y)].el.classList.add('comboPlacement'));
 showWarning(recipe.name+'이 출전했다!','재료 유닛이 있던 자리 중 배치할 위치를 선택하세요',999999);
}
function chooseHeroPlacement(x,y){
 if(!comboPlacement)return;
 const pos=comboPlacement.positions.find(p=>p.x===x&&p.y===y);
 if(!pos){toast('영웅은 조합 재료가 있던 자리에만 배치할 수 있습니다');return}
 const {recipe,materialIds,wasRunning}=comboPlacement;
 const mats=[...units.values()].filter(u=>materialIds.includes(u.id));
 if(mats.length!==materialIds.length){cancelHeroPlacement('조합 재료 상태가 변경되었습니다');return}
 mats.forEach(m=>{units.delete(tileKey(m.x,m.y));cells[cellIndex(m.x,m.y)].el.classList.remove('occupied')});
 const hero={id:'h'+Date.now(),x,y,type:'hero_aria',hero:recipe.name,atk:recipe.atk,range:recipe.range,rate:recipe.rate,lastShot:0,spent:0,moveCooldownUntil:simTime+5};
 units.set(tileKey(x,y),hero);cells[cellIndex(x,y)].el.classList.add('occupied');heroCount++;
 comboPlacement=null;document.querySelectorAll('.cell.comboPlacement').forEach(e=>e.classList.remove('comboPlacement'));
 clearTimeout(showWarning.t);$('bossWarning').classList.remove('on');
 renderUnits();syncHUD();updateComboHighlights();clearSelection(true);
 running=wasRunning&&!manualPaused&&!rpgPending;
 toast(recipe.name+' 배치 완료 · 이동 재사용 5초');
}
function cancelHeroPlacement(msg){
 comboPlacement=null;document.querySelectorAll('.cell.comboPlacement').forEach(e=>e.classList.remove('comboPlacement'));
 clearTimeout(showWarning.t);$('bossWarning').classList.remove('on');if(msg)toast(msg);
}
function clearMoveTargets(){document.querySelectorAll('.cell.moveTarget').forEach(e=>e.classList.remove('moveTarget'))}
function findUnitById(id){return [...units.values()].find(u=>u.id===id)}
function beginMove(u){
 if(moveCooldownRemaining(u)>0){toast('이동 재사용 대기 중');return}
 moveModeUnitId=u.id;comboPlacement=null;clearMoveTargets();clearSelection(true);
 cells.forEach(c=>{if(c&&(c.code==='D'||c.code==='C'))c.el.classList.add('moveTarget')});
 showBottom((u.hero||UNIT_DEFS[u.type].name)+' 이동 · 목적지를 선택하세요');
 actionButton('이동 취소','현재 위치 유지',cancelMove);
}
function cancelMove(){moveModeUnitId=null;clearMoveTargets();clearSelection(true)}
function completeMove(x,y){
 const moving=findUnitById(moveModeUnitId);
 if(!moving){cancelMove();return}
 const cell=cells[cellIndex(x,y)];
 if(!cell||(cell.code!=='D'&&cell.code!=='C')){toast('배치 가능한 칸만 이동할 수 있습니다');return}
 if(moving.x===x&&moving.y===y){cancelMove();return}
 if(moveCooldownRemaining(moving)>0){toast('이동 재사용 대기 중');cancelMove();return}
 const target=units.get(tileKey(x,y));
 if(target&&moveCooldownRemaining(target)>0){toast('교대할 유닛이 이동 재사용 대기 중입니다');return}
 const sx=moving.x,sy=moving.y;
 units.delete(tileKey(sx,sy));
 if(target){
  units.delete(tileKey(x,y));
  target.x=sx;target.y=sy;target.moveCooldownUntil=simTime+5;
  units.set(tileKey(sx,sy),target);
 }else{
  cells[cellIndex(sx,sy)].el.classList.remove('occupied');
 }
 moving.x=x;moving.y=y;moving.moveCooldownUntil=simTime+5;
 units.set(tileKey(x,y),moving);
 cells[cellIndex(x,y)].el.classList.add('occupied');
 if(target)cells[cellIndex(sx,sy)].el.classList.add('occupied');
 moveModeUnitId=null;clearMoveTargets();renderUnits();updateComboHighlights();clearSelection(true);
 toast(target?'유닛 교대 완료 · 양쪽 5초 이동 잠금':'이동 완료 · 5초 이동 잠금');
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
 if(wave===10)toast('Wave 10 · 3초 경고 / 6초 보스 등장 / 40초 광폭화');
}
function updateSpawning(dt){
 spawnClock+=dt;
 if(wave===10){
  const preBossNormalLimit=Math.ceil(normalCountForWave(wave)*0.5);
  if(spawnClock>=waveSpawnInterval()&&waveSpawned<preBossNormalLimit){
   spawnClock=0;spawnEnemy('normal');waveSpawned++;
  }
  if(!wave10WarningShown&&waveClock>=WAVE10_WARNING_AT){
   wave10WarningShown=true;
   showWarning('⚠ WARNING','BOSS APPROACHING · 3 SEC',1200);
  }
  spawnWave10BossMidWave();
  triggerWave10Enrage();
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
  const baseHitGap=e.kind==='boss'?2.2:e.kind==='midboss'?1.9:1.5;
  const hitGap=e.kind==='boss'&&e.enraged?baseHitGap/1.25:baseHitGap;
  if(now-e.lastStructureHit>=hitGap){
   e.lastStructureHit=now;
   const baseDmg=e.kind==='boss'?40:e.kind==='midboss'?24:10;
   const dmg=e.kind==='boss'&&e.enraged?Math.round(baseDmg*1.5):baseDmg;
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
const RPG_HERO_DEFS={
 ARIA:{
  name:'아리아',hp:2600,atk:175,def:125,
  basicGap:1.0,skill1Gap:9,skill2Gap:16,
  skill1Name:'성광 참격',skill2Name:'수호의 맹세',ultimateName:'최후의 성역'
 }
};
const RPG_BOSS_DEF={name:'철각왕 브라움',hp:15000,atk:360,def:80,baseAttackGap:2.5};

function enterRpgPlaceholder(){enterRpgBattle()}
function enterRpgBattle(){
 if(rpgPending)return;
 rpgPending=true;running=false;clearSelection(true);cancelMove();
 const tdHeroes=[...units.values()].filter(u=>u.type==='hero_aria').slice(0,5);
 showWarning('TD BOSS DOWN','RPG BOSS BATTLE',900);
 setTimeout(()=>startRpgBattle(tdHeroes),650);
}
function startRpgBattle(tdHeroes){
 gameMode='RPG';rpgPending=false;manualPaused=false;rpgSimTime=0;
 const heroes=tdHeroes.map((u,i)=>{
  const d=RPG_HERO_DEFS.ARIA;
  return {id:'rpg_'+u.id,heroId:'ARIA',name:d.name,maxHp:d.hp,hp:d.hp,atk:d.atk,def:d.def,
   basicGap:d.basicGap,skill1Gap:d.skill1Gap,skill2Gap:d.skill2Gap,lastBasic:-999,lastSkill1:0,lastSkill2:0,
   buffUntil:0,ult:0,ko:false,slot:i};
 });
 rpgState={
  heroes,
  boss:{...RPG_BOSS_DEF,maxHp:RPG_BOSS_DEF.hp,hp:RPG_BOSS_DEF.hp,lastAttack:0,phase:1,enraged:false},
  result:null
 };
 $('battlefield').style.display='none';
 rpgScreen.classList.add('on');rpgScreen.setAttribute('aria-hidden','false');
 document.querySelectorAll('.tdHud').forEach(e=>e.style.display='none');
 document.querySelectorAll('.rpgHud').forEach(e=>e.style.display='flex');
 $('rpgBossName').textContent=rpgState.boss.name;
 syncPauseButton();renderRpg();
 if(!heroes.length){finishRpgDefeat('출전 가능한 영웅이 없습니다');return}
 running=true;
 showWarning('RPG BOSS BATTLE',rpgState.boss.name,1100);
}
function rpgDamageToBoss(raw){
 const b=rpgState.boss;
 return Math.max(1,Math.round(raw-Math.max(0,b.def*.35)));
}
function rpgDamageToHero(hero,raw){
 return Math.max(1,Math.round(raw-Math.max(0,hero.def*.45)));
}
function rpgAliveHeroes(){return rpgState.heroes.filter(h=>!h.ko&&h.hp>0)}
function updateRpg(dt){
 if(!rpgState||rpgState.result)return;
 rpgSimTime+=dt;
 const b=rpgState.boss;
 for(const h of rpgAliveHeroes()){
  const buff=h.buffUntil>rpgSimTime?1.15:1;
  if(rpgSimTime-h.lastBasic>=h.basicGap){
   h.lastBasic=rpgSimTime;b.hp-=rpgDamageToBoss(h.atk*buff);h.ult=Math.min(100,h.ult+6);
  }
  if(rpgSimTime-h.lastSkill1>=h.skill1Gap){
   h.lastSkill1=rpgSimTime;b.hp-=rpgDamageToBoss(h.atk*1.65*buff);h.ult=Math.min(100,h.ult+12);
  }
  if(rpgSimTime-h.lastSkill2>=h.skill2Gap){
   h.lastSkill2=rpgSimTime;h.buffUntil=rpgSimTime+8;
  }
 }
 if(b.hp<=0){b.hp=0;finishRpgVictory();return}
 const ratio=b.hp/b.maxHp;
 const nextPhase=ratio<=.35?3:ratio<=.70?2:1;
 if(nextPhase!==b.phase){
  b.phase=nextPhase;
  if(nextPhase===3)b.enraged=true;
  showWarning(nextPhase===3?'⚠ BOSS ENRAGED':'BOSS PHASE '+nextPhase,nextPhase===3?'HP 35% · 최종 광폭화':'공격 패턴 강화',1200);
 }
 const attackGap=b.baseAttackGap/(b.phase===1?1:b.phase===2?1.18:1.4);
 if(rpgSimTime-b.lastAttack>=attackGap){
  b.lastAttack=rpgSimTime;
  const alive=rpgAliveHeroes();
  if(alive.length){
   const count=b.phase===1?1:Math.min(alive.length,b.phase);
   const targets=alive.slice().sort(()=>Math.random()-.5).slice(0,count);
   targets.forEach(h=>{
    const raw=b.atk*(b.phase===1?1:b.phase===2?1.15:1.35);
    h.hp=Math.max(0,h.hp-rpgDamageToHero(h,raw));h.ult=Math.min(100,h.ult+10);
    if(h.hp<=0)h.ko=true;
   });
  }
 }
 if(!rpgAliveHeroes().length){finishRpgDefeat('모든 영웅이 전투불능');return}
 renderRpg();
}
function useRpgUltimate(heroId){
 if(gameMode!=='RPG'||!rpgState||rpgState.result||manualPaused)return;
 const h=rpgState.heroes.find(x=>x.id===heroId);
 if(!h||h.ko||h.ult<100)return;
 h.ult=0;
 const dmg=rpgDamageToBoss(h.atk*4);
 rpgState.boss.hp=Math.max(0,rpgState.boss.hp-dmg);
 showWarning(h.name+' · '+RPG_HERO_DEFS[h.heroId].ultimateName,'ULTIMATE · '+dmg+' DAMAGE',850);
 if(rpgState.boss.hp<=0)finishRpgVictory();else renderRpg();
}
function finishRpgVictory(){
 if(!rpgState||rpgState.result)return;
 rpgState.result='VICTORY';running=false;
 showWarning('STAGE CLEAR','RPG BOSS DEFEATED',999999);renderRpg();
}
function finishRpgDefeat(reason){
 if(!rpgState||rpgState.result)return;
 rpgState.result='DEFEAT';running=false;
 showWarning('RPG BATTLE FAILED',reason,999999);renderRpg();
}
function renderRpg(){
 if(!rpgState)return;
 const b=rpgState.boss;
 $('rpgBossHpText').textContent=Math.ceil(b.hp)+'/'+b.maxHp;
 $('rpgBossBarFill').style.width=Math.max(0,b.hp/b.maxHp*100)+'%';
 $('rpgPhaseLabel').textContent=b.enraged?'PHASE 3 · ENRAGED':'PHASE '+b.phase;
 rpgHeroRow.innerHTML='';
 for(const h of rpgState.heroes){
  const card=document.createElement('div');card.className='rpgHeroCard'+(h.ko?' ko':'');
  const hpPct=Math.max(0,h.hp/h.maxHp*100),ultPct=Math.max(0,h.ult);
  card.innerHTML='<div class="rpgHeroFigure">아</div><div class="rpgHeroName">'+h.name+'</div>'+
   '<div class="rpgHp"><i style="width:'+hpPct+'%"></i></div>'+
   '<div class="rpgUlt"><i style="width:'+ultPct+'%"></i></div>'+
   '<button class="rpgUltBtn '+(h.ult>=100&&!h.ko?'ready':'')+'" '+(h.ult>=100&&!h.ko?'':'disabled')+'>ULT '+Math.floor(h.ult)+'%</button>'+
   '<div class="rpgStatus">'+(h.ko?'K.O.':h.buffUntil>rpgSimTime?'수호의 맹세':'AUTO ATTACK')+'</div>';
  const btn=card.querySelector('.rpgUltBtn');btn.onclick=()=>useRpgUltimate(h.id);
  rpgHeroRow.appendChild(card);
 }
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
const WAVE10_BOSS_SPAWN_AT=6;
const WAVE10_WARNING_AT=3;
const WAVE10_ENRAGE_AT=40;
let wave10WarningShown=false,wave10EnrageTriggered=false;
function spawnWave10BossMidWave(){
 if(wave!==10||specialSpawned||waveClock<WAVE10_BOSS_SPAWN_AT)return;
 spawnEnemy('boss');
 specialSpawned=true;
 showWarning('⚠ BOSS','FINAL TD BOSS · WAVE 10',1700);
}
function triggerWave10Enrage(){
 if(wave!==10||wave10EnrageTriggered||waveClock<WAVE10_ENRAGE_AT)return;
 const boss=enemies.find(e=>e.hp>0&&e.kind==='boss');
 if(!boss)return;
 boss.enraged=true;
 wave10EnrageTriggered=true;
 showWarning('⚠ BOSS ENRAGED','40초 경과 · 공격력 1.5배 / 공격속도 1.25배',1800);
}
function waveSpawnComplete(){
 if(wave===10)return false;
 const normalsDone=waveSpawned>=normalCountForWave(wave);
 const specialDone=wave!==5||specialSpawned;
 return normalsDone&&specialDone;
}
function aliveEnemyCount(){return enemies.filter(e=>e.hp>0).length}
function earlyClearBonus(){
 const remaining=Math.max(0,Math.ceil(WAVE_DURATION-waveClock));
 return remaining*5;
}
function tryEarlyWaveClear(){
 if(waveEnding||wave>=10||waveClock>=WAVE_DURATION||!waveSpawnComplete()||aliveEnemyCount()>0)return false;
 waveEnding=true;
 const bonus=earlyClearBonus();
 gold+=bonus;
 showWarning('적 전멸 보너스','+'+bonus+'G · '+Math.max(0,Math.ceil(WAVE_DURATION-waveClock))+'초 조기 종료',1200);
 setTimeout(()=>{waveEnding=false;advanceWave()},450);
 return true;
}
function advanceWave(){
 if(wave>=10)return;
 wave++;waveClock=0;spawnClock=0;waveSpawned=0;specialSpawned=false;wave10WarningShown=false;wave10EnrageTriggered=false;
 startWaveNotice();
}
function loop(ts){
 const raw=Math.min(.05,(ts-last)/1000);last=ts;
 if(running){
  const dt=raw*speed;
  if(gameMode==='TD'){
   simTime+=dt;waveClock+=dt;updateEnemies(dt,simTime);updateUnits(simTime);
   if(!tryEarlyWaveClear()&&wave<10&&waveClock>=WAVE_DURATION)advanceWave();
   renderEnemies();syncHUD();
  }else if(gameMode==='RPG'){
   updateRpg(dt);
  }
 }
 requestAnimationFrame(loop);
}
function syncHUD(){$('gold').textContent=gold;$('wave').textContent=wave;$('gHp').textContent=gHp;$('oHp').textContent=oHp}
function toast(msg){const t=$('toast');t.textContent=msg;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',750)}

$('closeBottom').onclick=()=>clearSelection(true);
$('battlefield').addEventListener('click',()=>clearSelection(true));
$('speed').onclick=()=>{speed=speed===1?2:speed===2?3:1;$('speed').textContent='×'+speed};
function syncPauseButton(){$('pause').textContent=manualPaused?'▶ 계속':'Ⅱ 일시정지'}
$('pause').onclick=()=>{
 if(rpgPending||comboPlacement||(rpgState&&rpgState.result))return;
 manualPaused=!manualPaused;
 running=!manualPaused;
 syncPauseButton();
 if(manualPaused)showWarning('일시정지','전투 시간이 멈췄습니다',900);
};
syncPauseButton();

buildGrid();renderUnits();syncHUD();updateComboHighlights();requestAnimationFrame(loop);

window.__LG_STAGE1_TEST__={
 grid:()=>({cols:COLS,rows:ROWS,cells:cells.length}),
 state:()=>({gameMode,wave,gold,gHp,oHp,speed,simTime,waveClock,units:[...units.values()],enemies:enemies.length,bosses:enemies.filter(e=>e.kind==='boss'&&e.hp>0).length,bossEnraged:enemies.some(e=>e.kind==='boss'&&e.hp>0&&e.enraged),bottomVisible:bottom.classList.contains('on'),rpgPending,manualPaused,moveModeUnitId,comboPlacement:!!comboPlacement,rpg:rpgState?{bossHp:rpgState.boss.hp,bossPhase:rpgState.boss.phase,heroes:rpgState.heroes.map(h=>({name:h.name,hp:h.hp,ult:h.ult,ko:h.ko})),result:rpgState.result}:null,gatePhase:gHp>0?'FINAL_WALL_G':'GATE_CORE_O'}),
 select:(x,y)=>onCellTap(x,y),
 place:(x,y,type)=>placeUnit(x,y,UNIT_DEFS[type]),
 route:()=>route.slice(),
 recipes:()=>HERO_RECIPES,
 unitDefs:()=>UNIT_DEFS,
 startRpg:()=>startRpgBattle([...units.values()].filter(u=>u.type==='hero_aria').slice(0,5)),
 standard:'LG_STAGE1_RPG_BOSS_PROTOTYPE_V1'
};
})();