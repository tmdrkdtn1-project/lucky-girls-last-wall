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
 watchtower:{id:'watchtower',family:'WATCHTOWER',tier:1,name:'감시탑',short:'탑',cost:80,atk:15,range:3.0,rate:.80,damageType:'단일',targetCount:1,air:true,next:['watchtower2']},
 watchtower2:{id:'watchtower2',family:'WATCHTOWER',tier:2,name:'강화 감시탑',short:'강',cost:120,atk:25,range:4.0,rate:.95,damageType:'단일',targetCount:2,air:true,next:['watchtower3_sniper','watchtower3_rapid','watchtower3_pierce']},
 watchtower3_sniper:{id:'watchtower3_sniper',family:'WATCHTOWER',tier:3,name:'저격 감시탑',short:'저탑',cost:165,atk:42,range:6.0,rate:.55,damageType:'단일',targetCount:2,air:true,next:[]},
 watchtower3_rapid:{id:'watchtower3_rapid',family:'WATCHTOWER',tier:3,name:'연사 감시탑',short:'연탑',cost:165,atk:24,range:4.0,rate:1.65,damageType:'단일',targetCount:3,air:true,next:[]},
 watchtower3_pierce:{id:'watchtower3_pierce',family:'WATCHTOWER',tier:3,name:'관통 감시탑',short:'관탑',cost:165,atk:34,range:4.0,rate:.90,damageType:'관통',targetCount:2,air:true,next:[]},

 knight1:{id:'knight1',family:'KNIGHT',tier:1,name:'견습 기사',short:'견',cost:80,atk:18,range:1.3,rate:.90,damageType:'단일',targetCount:1,air:false,next:['knight2']},
 knight2:{id:'knight2',family:'KNIGHT',tier:2,name:'상급 기사',short:'상',cost:120,atk:28,range:1.4,rate:1.00,damageType:'단일',targetCount:1,air:false,next:['knight3_commander','knight3_berserker']},
 knight3_commander:{id:'knight3_commander',family:'KNIGHT',tier:3,name:'기사단장',short:'단',cost:170,atk:42,range:1.7,rate:1.05,damageType:'관통',targetCount:2,air:false,next:[]},
 knight3_berserker:{id:'knight3_berserker',family:'KNIGHT',tier:3,name:'광전사',short:'광',cost:170,atk:36,range:1.8,rate:1.45,damageType:'관통/광역',targetCount:3,areaRadiusCells:1,air:false,next:[]},

 archer1:{id:'archer1',family:'ARCHER',tier:1,name:'견습 궁수',short:'견궁',cost:90,atk:16,range:3.0,rate:.95,damageType:'단일',targetCount:1,air:true,next:['archer2']},
 archer2:{id:'archer2',family:'ARCHER',tier:2,name:'저격수',short:'저',cost:130,atk:28,range:5.0,rate:.72,damageType:'단일',targetCount:1,air:true,next:['archer3_crossbow','archer3_rapid']},
 archer3_crossbow:{id:'archer3_crossbow',family:'ARCHER',tier:3,name:'석궁수',short:'석',cost:180,atk:38,range:4.0,rate:.78,damageType:'관통',targetCount:2,air:true,next:[]},
 archer3_rapid:{id:'archer3_rapid',family:'ARCHER',tier:3,name:'연사궁병',short:'연',cost:180,atk:24,range:4.0,rate:1.60,damageType:'관통/광역',targetCount:3,areaRadiusCells:1,air:true,next:[]},

 lancer1:{id:'lancer1',family:'LANCER',tier:1,name:'투창병',short:'투',cost:100,atk:22,range:2.0,rate:.82,damageType:'관통',targetCount:2,air:false,next:['lancer2']},
 lancer2:{id:'lancer2',family:'LANCER',tier:2,name:'프리 랜서',short:'프',cost:145,atk:30,range:3.0,rate:.92,damageType:'관통',targetCount:2,air:true,next:['lancer3_elite','lancer3_magic']},
 lancer3_elite:{id:'lancer3_elite',family:'LANCER',tier:3,name:'엘리트 랜서',short:'엘',cost:195,atk:42,range:3.0,rate:1.00,damageType:'관통/광역',targetCount:3,areaRadiusCells:1,air:true,next:[]},
 lancer3_magic:{id:'lancer3_magic',family:'LANCER',tier:3,name:'마창병',short:'마창',cost:195,atk:34,range:4.0,rate:1.05,damageType:'관통/지속',targetCount:2,dotDuration:4,dotTick:1,dotRatio:.25,air:true,next:[]}
};
const STAGE1_BASE_IDS=['watchtower','knight1','archer1','lancer1'];

const HERO_RECIPES=[
 {id:'ARIA',name:'아리아',rarity:'LEGENDARY',materials:[{type:'knight3_commander',count:2}],atk:72,range:3.0,rate:1.20}
];

const cells=[], units=new Map(), enemies=[];
let gold=500,wave=1,gHp=100,oHp=120,running=true,speed=1,last=performance.now(),simTime=0;
let spawnClock=0,waveClock=0,nextEnemyId=1,selected=null,heroCount=0,waveSpawned=0,specialSpawned=false,rpgPending=false,waveEnding=false;
let moveModeUnitId=null,comboPlacement=null,manualPaused=false;
let gameMode='TD',rpgState=null,rpgSimTime=0,rpgTransitioning=false,rpgAutoBattle=false;
let luckyJackpotPct=0,luckyStageBuffPct=0,luckyOverlayOpen=false,midbossRewardPending=false;
const LUCKY_FAIL_WEIGHTS={LUCKY:1.5,BONUS:1.8,MISS:1.0};
function luckyOutcomeRoll(randomValue=Math.random()){
 const jp=Math.max(0,Math.min(100,luckyJackpotPct))/100;
 if(randomValue<jp)return 'JACKPOT';
 const remain=1-jp,local=remain>0?(randomValue-jp)/remain:0,total=4.3;
 if(local<1.5/total)return 'LUCKY';
 if(local<(1.5+1.8)/total)return 'BONUS';
 return 'MISS';
}
function addLuckyWaveClear(w){if(w>=1&&w<=9)luckyJackpotPct=Math.min(45,luckyJackpotPct+5)}
function addLuckyMidbossBonus(){luckyJackpotPct=Math.min(100,luckyJackpotPct+20)}
function resetLuckyAfterSpin(){luckyJackpotPct=0}
function addLuckyStageBuff(pct){luckyStageBuffPct=Math.min(40,luckyStageBuffPct+pct);return luckyStageBuffPct}
function luckyUnitStatMultiplier(){return 1+luckyStageBuffPct/100}
function luckyRewardOptions(tier){
 if(tier==='JACKPOT')return ['MYTHIC_OWNED_RANDOM_1','STAGE_BUFF_30','LEGENDARY_OWNED_RANDOM_2','GOLD_2000'];
 if(tier==='LUCKY')return ['LEGENDARY_OWNED_RANDOM_1','STAGE_BUFF_20','GOLD_1000'];
 if(tier==='BONUS')return ['STAGE_BUFF_10','GOLD_500'];
 return [];
}
function luckySpin(randomValue=Math.random()){
 if(gameMode!=='TD'||rpgPending||luckyOverlayOpen)return null;
 const tier=luckyOutcomeRoll(randomValue);running=false;luckyOverlayOpen=true;resetLuckyAfterSpin();
 return {tier,rewards:luckyRewardOptions(tier)};
}
function closeLuckyOverlay(){luckyOverlayOpen=false;if(gameMode==='TD'&&!rpgPending&&!midbossRewardPending)running=!manualPaused}
function applyLuckySimpleReward(id){
 if(id==='GOLD_2000')gold+=2000;else if(id==='GOLD_1000'||id==='MID_GOLD_1000')gold+=1000;else if(id==='GOLD_500')gold+=500;
 else if(id==='STAGE_BUFF_30')addLuckyStageBuff(30);else if(id==='STAGE_BUFF_20')addLuckyStageBuff(20);else if(id==='STAGE_BUFF_10')addLuckyStageBuff(10);
 else if(id==='MID_JACKPOT_20')addLuckyMidbossBonus();
 syncHUD();
}
function openMidbossReward(){running=false;midbossRewardPending=true;luckyOverlayOpen=true;return ['MID_GOLD_1000','MID_LEGENDARY_1','MID_JACKPOT_20']}
function chooseMidbossReward(id){if(!midbossRewardPending)return false;applyLuckySimpleReward(id);midbossRewardPending=false;closeLuckyOverlay();return true}

const $=id=>document.getElementById(id);
const grid=$('grid'), unitLayer=$('unitLayer'), enemyLayer=$('enemyLayer'), bottom=$('bottomUI'), actions=$('actions'), title=$('contextTitle');
const rpgScreen=$('rpgScreen'),rpgHeroRow=$('rpgHeroRow'),rpgTransition=$('rpgTransition'),rpgTransitionMessage=$('rpgTransitionMessage');

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
 if(gameMode!=='TD'||rpgPending)return;
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
 if(gameMode!=='TD'||rpgPending)return;
 if(units.has(tileKey(x,y))||gold<t.cost)return;
 gold-=t.cost;units.set(tileKey(x,y),{id:'u'+Date.now()+Math.random(),x,y,type:t.id,lastShot:0,spent:t.cost,moveCooldownUntil:0});
 cells[cellIndex(x,y)].el.classList.add('occupied');postUnitChange();toast(t.name+' 배치');
}
function upgradeUnit(u,next){
 if(gameMode!=='TD'||rpgPending)return;
 const cur=UNIT_DEFS[u.type];
 if(!cur||!cur.next.includes(next.id)){toast('같은 계열 업그레이드만 가능합니다');return}
 if(gold<next.cost)return;
 gold-=next.cost;u.type=next.id;u.spent=(u.spent||0)+next.cost;postUnitChange();toast(next.name+' 업그레이드');
}
function sellUnit(u){
 if(gameMode!=='TD'||rpgPending)return;
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
 if(gameMode!=='TD'||rpgPending)return;
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
 const hero={id:'h'+Date.now(),x,y,type:'hero_aria',hero:recipe.name,atk:recipe.atk,range:recipe.range,rate:recipe.rate,lastShot:0,lastSkill1:simTime,lastSkill2:simTime,lastSkill3:simTime,ariaOathUntil:0,spent:0,moveCooldownUntil:simTime+5};
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
 if(gameMode!=='TD'||rpgPending)return;
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
 enemies.push({id:nextEnemyId++,kind,label,pathPos:0,hp,maxHp:hp,speed:(.62+wave*.015)*speedMult,lastStructureHit:0,effects:[],rewarded:false,hitFxType:null,hitFxUntil:0,footprintCells:kind==='boss'?1.6:kind==='midboss'?1.3:1.0});
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
function routeCellForEnemy(e){return Math.max(0,Math.min(route.length-1,Math.floor(e.pathPos)))}
function occupiedRouteCells(e){
 const half=Math.max(.01,(e.footprintCells||1)/2);
 const start=Math.max(0,Math.floor(e.pathPos-half+.5));
 const end=Math.min(route.length-1,Math.floor(e.pathPos+half+.5));
 const out=[];
 for(let i=start;i<=end;i++){
  const cellMin=i-.5,cellMax=i+.5;
  const spriteMin=e.pathPos-half,spriteMax=e.pathPos+half;
  if(spriteMax>=cellMin&&spriteMin<=cellMax)out.push(i);
 }
 return out;
}
function enemyOccupiesRouteCell(e,cellIndex){return occupiedRouteCells(e).includes(cellIndex)}
function handleEnemyDeath(e){
 if(e.rewarded)return false;
 e.rewarded=true;
 const reward=e.kind==='boss'?180:e.kind==='midboss'?0:12;gold+=reward;
 if(e.kind==='boss'){enterRpgPlaceholder(e);return true}
 if(e.kind==='midboss'){openMidbossReward();toast('중간보스 격파 · 보상 1개 선택');}else toast('+12G');
 return false;
}
const ENEMY_SPECIAL_RUNTIME_SEMANTICS={
 FLYING_TERRAIN_IGNORE:{airborne:true,terrainPathing:'IGNORE_TERRAIN'},
 FREEZE_DURATION_REDUCTION_40:{freezeDurationMultiplier:.60},
 PHYSICAL_DAMAGE_REDUCTION_20:{physicalDamageTakenMultiplier:.80},
 LOW_HP_BERSERK_40_25:{triggerHpRatioLte:.40,moveSpeedMultiplier:1.25,wallDamageMultiplier:1.25}
};
const ENEMY_SPECIAL_SEMANTIC_BY_NAME={
 '절벽 매':'FLYING_TERRAIN_IGNORE',
 '암석 골렘':'FREEZE_DURATION_REDUCTION_40',
 '최초의 골렘 아즈로':'FREEZE_DURATION_REDUCTION_40',
 '모래망령':'PHYSICAL_DAMAGE_REDUCTION_20',
 '해룡 치어':'FLYING_TERRAIN_IGNORE',
 '물귀신':'PHYSICAL_DAMAGE_REDUCTION_20',
 '동토 광전사':'LOW_HP_BERSERK_40_25',
 '설산 독수리':'FLYING_TERRAIN_IGNORE',
 '서리 골렘':'FREEZE_DURATION_REDUCTION_40',
 '성당 가고일':'FLYING_TERRAIN_IGNORE',
 '광휘 망령':'PHYSICAL_DAMAGE_REDUCTION_20',
 '성유물 골렘':'FREEZE_DURATION_REDUCTION_40',
 '타락 천사 파편체':'FLYING_TERRAIN_IGNORE',
 '저주받은 성상':'FREEZE_DURATION_REDUCTION_40',
 '기원의 대성상':'FREEZE_DURATION_REDUCTION_40',
 '마력 골렘':'FREEZE_DURATION_REDUCTION_40',
 '마도 비행체':'FLYING_TERRAIN_IGNORE'
};
function bindEnemySpecialSemantic(enemy,name){
 if(!enemy)return enemy;
 const semantic=ENEMY_SPECIAL_SEMANTIC_BY_NAME[name];
 if(semantic)enemy.specialSemantic=semantic;
 return enemy;
}
function enemySpecialRuntimeProfile(semantic,hp=1,maxHp=1){
 const def=ENEMY_SPECIAL_RUNTIME_SEMANTICS[semantic];if(!def)return null;
 if(semantic==='LOW_HP_BERSERK_40_25'){
  const active=maxHp>0&&hp/maxHp<=def.triggerHpRatioLte;
  return {...def,active,moveSpeedMultiplier:active?def.moveSpeedMultiplier:1,wallDamageMultiplier:active?def.wallDamageMultiplier:1};
 }
 return {...def,active:true};
}
function applyEnemyPhysicalDamageReduction(e,amount,damageClass='PHYSICAL'){
 const p=enemySpecialRuntimeProfile(e&&e.specialSemantic,e&&e.hp,e&&e.maxHp);
 return damageClass==='PHYSICAL'&&p&&p.physicalDamageTakenMultiplier?amount*p.physicalDamageTakenMultiplier:amount;
}
function enemyFreezeDuration(e,duration){
 const p=enemySpecialRuntimeProfile(e&&e.specialSemantic,e&&e.hp,e&&e.maxHp);
 return p&&p.freezeDurationMultiplier?duration*p.freezeDurationMultiplier:duration;
}
function enemyMovementMultiplier(e){
 const p=enemySpecialRuntimeProfile(e&&e.specialSemantic,e&&e.hp,e&&e.maxHp);
 return p&&p.moveSpeedMultiplier?p.moveSpeedMultiplier:1;
}
function enemyWallDamageMultiplier(e){
 const p=enemySpecialRuntimeProfile(e&&e.specialSemantic,e&&e.hp,e&&e.maxHp);
 return p&&p.wallDamageMultiplier?p.wallDamageMultiplier:1;
}
function dealEnemyDamage(e,amount,fxType='single',damageClass='PHYSICAL'){
 if(!e||e.hp<=0)return false;
 const resolved=applyEnemyPhysicalDamageReduction(e,Math.max(0,amount),damageClass);
 e.hp=Math.max(0,e.hp-resolved);
 e.hitFxType=fxType;e.hitFxUntil=simTime+.22;
 if(e.hp<=0)return handleEnemyDeath(e);
 return false;
}
function addEnemyDot(e,sourceAtk,profile){
 if(!e||e.hp<=0)return;
 const duration=profile.dotDuration||4,tick=profile.dotTick||1,ratio=profile.dotRatio||.25;
 e.effects=e.effects||[];
 e.effects.push({type:'dot',remaining:duration,tickEvery:tick,nextTick:tick,damage:sourceAtk*ratio});
 e.hitFxType='dot';e.hitFxUntil=simTime+.28;
}
function updateEnemyEffects(e,dt){
 if(!e.effects||!e.effects.length||e.hp<=0)return false;
 for(let i=e.effects.length-1;i>=0;i--){
  const fx=e.effects[i];fx.remaining-=dt;fx.nextTick-=dt;
  while(fx.type==='dot'&&fx.nextTick<=0&&fx.remaining>-fx.tickEvery){
   fx.nextTick+=fx.tickEvery;
   if(dealEnemyDamage(e,fx.damage,'dot'))return true;
   if(e.hp<=0)return false;
  }
  if(fx.remaining<=0)e.effects.splice(i,1);
 }
 return false;
}
function targetsForTdAttack(target,profile){
 const alive=enemies.filter(e=>e.hp>0);
 const center=routeCellForEnemy(target);
 const hasPierce=(profile.damageType||'').includes('관통');
 const hasArea=(profile.damageType||'').includes('광역');
 if(hasArea){
  const radius=profile.areaRadiusCells||1;
  return alive.filter(e=>occupiedRouteCells(e).some(c=>Math.abs(c-center)<=radius));
 }
 if(hasPierce)return alive.filter(e=>enemyOccupiesRouteCell(e,center));
 return [target];
}
function resolveTdAttack(u,profile,target){
 const hit=targetsForTdAttack(target,profile);
 const fx=(profile.damageType||'').includes('광역')?'area':(profile.damageType||'').includes('관통')?'pierce':'single';
 for(const e of hit){
  const triggered=dealEnemyDamage(e,profile.atk,fx);
  if((profile.damageType||'').includes('지속')&&e.hp>0)addEnemyDot(e,profile.atk,profile);
  if(triggered)return true;
 }
 return false;
}
function updateEnemies(dt,now){
 updateSpawning(dt);
 const gateNormals=enemies.filter(e=>e.hp>0&&e.kind==='normal'&&e.pathPos>=route.length-2).slice(0,3);
 const gateSpecial=enemies.find(e=>e.hp>0&&e.kind!=='normal'&&e.pathPos>=route.length-2);
 for(const e of enemies){
  if(e.hp<=0)continue;
  if(updateEnemyEffects(e,dt)){return}
  if(e.hp<=0)continue;
  if(e.pathPos<route.length-2){e.pathPos=Math.min(route.length-2,e.pathPos+e.speed*enemyMovementMultiplier(e)*dt);continue}
  const allowed=e.kind==='normal'?gateNormals.includes(e):e===gateSpecial;if(!allowed)continue;
  const baseHitGap=e.kind==='boss'?2.2:e.kind==='midboss'?1.9:1.5;
  const hitGap=e.kind==='boss'&&e.enraged?baseHitGap/1.25:baseHitGap;
  if(now-e.lastStructureHit>=hitGap){
   e.lastStructureHit=now;
   const baseDmg=e.kind==='boss'?40:e.kind==='midboss'?24:10;
   const rawDmg=(e.kind==='boss'&&e.enraged?Math.round(baseDmg*1.5):baseDmg)*enemyWallDamageMultiplier(e);
   const defMult=now<wallDefBuffUntil?1/(1+wallDefBonusPct):1;
   const shieldMult=now<wallShieldUntil?1-wallShieldReduction:1;
   const dmg=Math.max(1,Math.round(rawDmg*defMult*shieldMult));
   if(gHp>0)gHp=Math.max(0,gHp-dmg);else oHp=Math.max(0,oHp-dmg);
   if(oHp<=0){running=false;showWarning('DEFEAT','GATE CORE DESTROYED',999999)}
  }
 }
}
function unitStats(u){
 const oath=(u.ariaOathUntil||0)>simTime;
 const atkMult=oath?1.15:1,rateMult=oath?1.15:1;
 const lucky=luckyUnitStatMultiplier();
 if(u.type==='hero_aria')return {atk:u.atk*atkMult*lucky,range:u.range,rate:u.rate*rateMult*lucky,damageType:'단일',targetCount:1};
 const t=UNIT_DEFS[u.type];return {atk:t.atk*atkMult*lucky,range:t.range,rate:t.rate*rateMult*lucky,damageType:t.damageType,targetCount:t.targetCount||1,areaRadiusCells:t.areaRadiusCells||0,dotDuration:t.dotDuration||0,dotTick:t.dotTick||0,dotRatio:t.dotRatio||0};
}
function updateUnits(now){
 for(const u of units.values()){
  if(updateHeroSkills(u,now))return;
  const s=unitStats(u);if(now-u.lastShot<1/s.rate)continue;
  let target=null,best=999;
  for(const e of enemies){
   if(e.hp<=0)continue;const p=enemyXY(e),dist=Math.hypot(p.x-u.x,p.y-u.y);
   if(canCastleDefenderReach(u,e,s.range)&&dist<best){best=dist;target=e}
  }
  if(!target)continue;
  u.lastShot=now;
  if(resolveTdAttack(u,s,target))return;
 }
}
const TD_HERO_SKILL_DEFS={
 ARIA:{
  skill1:{id:'ARIA_S1',name:'성광 참격',cooldown:9,effects:['DAMAGE','PENETRATION'],prototype:{damageRatio:1.35,lineCells:3,lineMapping:'target path cell + next 2 path cells toward gate'},wallAttachedBonus:1.25},
  skill2:{id:'ARIA_S2',name:'수호의 맹세',cooldown:16,duration:8,effects:['BUFF','WALL_DEF_MOD'],allyRadius:2,allyAtkMult:1.15,allyRateMult:1.15,wallDefBonusPct:.20},
  skill3:{id:'ARIA_S3',name:'최후의 성역',cooldown:30,duration:5,effects:['DAMAGE','WALL_DAMAGE_REDUCTION'],prototype:{damageRatio:1.0},wallDamageReduction:.50}
 }
};
let wallDefBuffUntil=0,wallDefBonusPct=0,wallShieldUntil=0,wallShieldReduction=0;
function nearestAliveEnemyForUnit(u,range){
 let target=null,best=999;
 for(const e of enemies){
  if(e.hp<=0)continue;
  const p=enemyXY(e),dist=Math.hypot(p.x-u.x,p.y-u.y);
  if(canCastleDefenderReach(u,e,range)&&dist<best){best=dist;target=e}
 }
 return target;
}
function ariaSkill1Targets(target){
 const start=routeCellForEnemy(target),cellsToHit=[start,start+1,start+2].filter(i=>i>=0&&i<route.length);
 return enemies.filter(e=>e.hp>0&&occupiedRouteCells(e).some(c=>cellsToHit.includes(c)));
}
function castAriaSkill1(u,now){
 const def=TD_HERO_SKILL_DEFS.ARIA.skill1,target=nearestAliveEnemyForUnit(u,u.range);
 if(!target)return false;
 const hit=ariaSkill1Targets(target);
 for(const e of hit){
  const attached=e.pathPos>=route.length-2;
  if(dealEnemyDamage(e,u.atk*def.prototype.damageRatio*(attached?def.wallAttachedBonus:1),'pierce'))return true;
 }
 u.lastSkill1=now;toast('아리아 · 성광 참격');return false;
}
function castAriaSkill2(u,now){
 const def=TD_HERO_SKILL_DEFS.ARIA.skill2;
 for(const ally of units.values()){
  if(Math.hypot(ally.x-u.x,ally.y-u.y)<=def.allyRadius)ally.ariaOathUntil=Math.max(ally.ariaOathUntil||0,now+def.duration);
 }
 wallDefBuffUntil=Math.max(wallDefBuffUntil,now+def.duration);wallDefBonusPct=def.wallDefBonusPct;
 u.lastSkill2=now;toast('아리아 · 수호의 맹세');return false;
}
function castAriaSkill3(u,now){
 const def=TD_HERO_SKILL_DEFS.ARIA.skill3;
 for(const e of enemies.filter(x=>x.hp>0)){
  if(dealEnemyDamage(e,u.atk*def.prototype.damageRatio,'area'))return true;
 }
 wallShieldUntil=Math.max(wallShieldUntil,now+def.duration);wallShieldReduction=def.wallDamageReduction;
 u.lastSkill3=now;showWarning('아리아 · 최후의 성역','전 경로 성광 피해 · 방어선 5초 보호',900);return false;
}
function updateHeroSkills(u,now){
 if(u.type!=='hero_aria')return false;
 const d=TD_HERO_SKILL_DEFS.ARIA;
 if(now-(u.lastSkill3||0)>=d.skill3.cooldown){if(castAriaSkill3(u,now))return true}
 if(now-(u.lastSkill2||0)>=d.skill2.cooldown){if(castAriaSkill2(u,now))return true}
 if(now-(u.lastSkill1||0)>=d.skill1.cooldown){if(castAriaSkill1(u,now))return true}
 return false;
}
const RPG_HERO_DEFS={
 ARIA:{
  name:'아리아',hp:2600,atk:175,def:125,
  basicGap:1.0,skill1Gap:9,skill2Gap:16,
  skill1Name:'성광 참격',skill1DamageType:'관통',skill2Name:'수호의 맹세',ultimateName:'최후의 성역'
 }
};
const RPG_BOSS_DEF={name:'철각왕 브라움',hp:16000,atk:110,def:60,baseAttackGap:3.0};
const RPG_BOSS_SKILL_DEFS={
 BRAUM:{
  skill1:{id:'BRAUM_S1',name:'뿔박치기',cooldown:11,prototype:{damageRatio:.75,actionDelay:.8},source:'직선 경로 가속'},
  skill2:{id:'BRAUM_S2',name:'암반 붕괴',cooldown:17,duration:6,targetCount:2,source:'배치칸 2곳 6초 비활성'},
  skill3:{id:'BRAUM_S3',name:'분쇄 포효',cooldown:23,duration:8,damageTakenMult:1.40,source:'방어벽 피해 +40% 8초'}
 }
};

function enterRpgPlaceholder(boss){beginTdBossRpgTransition(boss)}
function cancelAllTdCommands(){
 clearSelection(true);
 moveModeUnitId=null;clearMoveTargets();
 comboPlacement=null;
 document.querySelectorAll('.cell.comboPlacement,.cell.combo').forEach(e=>e.classList.remove('comboPlacement','combo'));
 actions.innerHTML='';
 bottom.classList.remove('on');
 $('battlefield').classList.add('tdLocked');
}
function destroyTdDefenseForBossCharge(){
 document.querySelectorAll('.unitToken').forEach((el,i)=>{
  el.style.animationDelay=(i*.035)+'s';
  el.classList.add('tdDestroyed');
 });
 document.querySelectorAll('.cell.c,.cell.g,.cell.o').forEach((el,i)=>{
  el.style.animationDelay=(i*.05)+'s';
  el.classList.add('tdStructureDestroyed');
 });
 gHp=0;oHp=0;syncHUD();
}
function beginTdBossRpgTransition(boss){
 if(rpgPending)return;
 rpgPending=true;running=false;gameMode='TD_TRANSITION';
 cancelAllTdCommands();
 const tdHeroes=[...units.values()].filter(u=>u.type==='hero_aria').slice(0,5);
 clearTimeout(showWarning.t);$('bossWarning').classList.remove('on');
 boss.hp=1;boss.cinematic=true;boss.cinematicState='fallen';
 renderEnemies();
 showWarning('TD BOSS DOWN','전투 명령 종료 · RPG 전환',1100);
 setTimeout(()=>{
  boss.cinematicState='rise';renderEnemies();
 },1500);
 setTimeout(()=>{
  boss.cinematicState='roar';renderEnemies();
  showWarning('⚠ ROAR',RPG_BOSS_DEF.name+'이 다시 일어섰다',900);
 },2200);
 setTimeout(()=>{
  destroyTdDefenseForBossCharge();
  boss.cinematicState='charge';
  const start=enemyXY(boss);
  renderEnemies();
  const token=document.querySelector('.enemyToken[data-enemy-id="'+boss.id+'"]');
  if(token){
   const from=posPct(start.x,start.y),to=posPct(16.75,5);
   token.style.left=from.left;token.style.top=from.top;
   token.classList.add('bossCharge');
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
    token.style.left=to.left;token.style.top=to.top;
   }));
  }
 },3200);
 setTimeout(()=>{
  startRpgBattle(tdHeroes);
 },4700);
}
function enterRpgBattle(){
 const boss=enemies.find(e=>e.kind==='boss');
 beginTdBossRpgTransition(boss||{id:-1,hp:1,pathPos:route.length-2,kind:'boss',label:'B',maxHp:1});
}
function startRpgBattle(tdHeroes){
 gameMode='RPG';rpgPending=false;manualPaused=false;rpgSimTime=0;rpgTransitioning=true;
 const heroes=tdHeroes.map((u,i)=>{
  const d=RPG_HERO_DEFS.ARIA;
  return {id:'rpg_'+u.id,heroId:'ARIA',name:d.name,maxHp:d.hp,hp:d.hp,atk:d.atk,def:d.def,
   basicGap:d.basicGap,skill1Gap:d.skill1Gap,skill2Gap:d.skill2Gap,lastBasic:-999,lastSkill1:0,lastSkill2:0,
   buffUntil:0,atkBuffMult:1,atkBuffUntil:0,rateBuffMult:1,rateBuffUntil:0,damageReduction:0,damageReductionUntil:0,damageTakenMult:1,damageTakenUntil:0,stunUntil:0,defModPct:0,defModUntil:0,invulnerableUntil:0,skillBlockUntil:0,reflectUntil:0,reflectRatio:0,rpgDots:[],ult:0,ko:false,slot:i};
 });
 rpgState={
  heroes,
  boss:{...RPG_BOSS_DEF,maxHp:RPG_BOSS_DEF.hp,hp:RPG_BOSS_DEF.hp,lastAttack:0,lastSkill1:0,lastSkill2:0,lastSkill3:0,rateBuffMult:1,rateBuffUntil:0,deathPreventionCharges:0,phase:1,enraged:false,invulnerableUntil:0,skillBlockUntil:0,reflectUntil:0,reflectRatio:0,rpgDots:[]},
  summons:[],
  pendingEvents:[],
  result:null
 };
 $('battlefield').style.display='none';$('battlefield').classList.remove('tdLocked');
 rpgScreen.classList.add('on','prep','transitionLock');rpgScreen.classList.remove('approach','battle');rpgScreen.setAttribute('aria-hidden','false');
 document.querySelectorAll('.tdHud').forEach(e=>e.style.display='none');
 document.querySelectorAll('.rpgOnlyControl').forEach(e=>e.style.display='inline-flex');
 $('rpgBossName').textContent=rpgState.boss.name;
 syncPauseButton();renderRpg();
 if(!heroes.length){finishRpgDefeat('출전 가능한 영웅이 없습니다');return}
 running=false;
 playRpgIntroSequence();
}
function setRpgTransitionMessage(text,center=false){
 rpgTransition.classList.add('on');
 rpgTransition.classList.toggle('centerFlash',center);
 rpgTransitionMessage.textContent=text;
}
function clearRpgTransitionMessage(){
 rpgTransition.classList.remove('on','centerFlash');
 rpgTransitionMessage.textContent='';
}
function fadeRpgSceneOut(){rpgScreen.classList.add('sceneFade')}
function fadeRpgSceneIn(){requestAnimationFrame(()=>rpgScreen.classList.remove('sceneFade'))}
function playRpgIntroSequence(){
 rpgTransitioning=true;running=false;
 rpgScreen.classList.add('prep','transitionLock');rpgScreen.classList.remove('approach','battle','sceneFade');
 setRpgTransitionMessage(rpgState.boss.name+'이 다가온다',false);
 fadeRpgSceneIn();

 // Scene 1: 2 seconds
 setTimeout(fadeRpgSceneOut,1650);
 setTimeout(()=>{
  rpgScreen.classList.remove('prep');rpgScreen.classList.add('approach');
  setRpgTransitionMessage('그대들이 바로 마지막 보루, LAST WALL이다.',false);
  fadeRpgSceneIn();
 },2000);

 // Scene 2: 3 seconds
 setTimeout(fadeRpgSceneOut,4650);
 setTimeout(()=>{
  rpgScreen.classList.remove('approach');rpgScreen.classList.add('battle');
  setRpgTransitionMessage('최후의 전투, 개전!',true);
  fadeRpgSceneIn();
 },5000);

 // Scene 3: 3 seconds
 setTimeout(fadeRpgSceneOut,7650);
 setTimeout(()=>{
  clearRpgTransitionMessage();
  rpgScreen.classList.remove('transitionLock','sceneFade');
  rpgTransitioning=false;
  running=!manualPaused;
 },8000);
}
const RPG_EFFECT_RUNTIME_VERSION='LG_RPG_EFFECT_RUNTIME_V1';
function selectRpgTargets(spec,source,effect={}){
 if(!rpgState)return [];
 if(spec==='BOSS')return [rpgState.boss];
 if(spec==='BOSS_AND_SUMMONS')return [rpgState.boss,...(rpgState.summons||[]).filter(s=>s.hp>0)];
 if(spec==='SELF')return source?[source]:[];
 if(spec==='ALL_HEROES')return rpgAliveHeroes();
 if(spec==='LOWEST_HP_HERO'){
  const alive=rpgAliveHeroes().slice().sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp));return alive.slice(0,1);
 }
 if(spec==='RANDOM_HERO'){
  const alive=rpgAliveHeroes();return alive.length?[alive[Math.floor(Math.random()*alive.length)]]:[];
 }
 if(spec==='RANDOM_HEROES'){
  const alive=rpgAliveHeroes().slice().sort(()=>Math.random()-.5);
  return alive.slice(0,Math.min(alive.length,Math.max(1,effect.count||1)));
 }
 return [];
}
function applyRpgEffect(effect,ctx={}){
 const source=ctx.source||null,targets=selectRpgTargets(effect.target,source,effect);
 for(const t of targets){
  if(effect.type==='DAMAGE'){
   const raw=typeof effect.amount==='function'?effect.amount(source,t):effect.amount;
   if((t.invulnerableUntil||0)>rpgSimTime)continue;
   if(t===rpgState.boss){
    const dealt=rpgDamageToBoss(raw,{ignoreDefense:!!effect.ignoreDefense});
    t.hp=Math.max(0,t.hp-dealt);
    if((t.reflectUntil||0)>rpgSimTime&&source&&source!==t){
     const back=Math.max(1,Math.round(dealt*(t.reflectRatio||0)));
     source.hp=Math.max(0,source.hp-rpgDamageToHero(source,back));if(source.hp<=0)source.ko=true;
    }
   }else{
    const dealt=rpgDamageToHero(t,raw);
    t.hp=Math.max(0,t.hp-dealt);
    if(t.hp<=0){
     if(!tryRpgDeathPrevention(t))t.ko=true;
    }
    if((t.reflectUntil||0)>rpgSimTime&&source&&source!==t&&source===rpgState.boss){
     source.hp=Math.max(0,source.hp-Math.max(1,Math.round(dealt*(t.reflectRatio||0))));
    }
   }
  }else if(effect.type==='HEAL'){
   const raw=typeof effect.amount==='function'?effect.amount(source,t):effect.amount;
   t.hp=Math.min(t.maxHp,t.hp+Math.max(0,Math.round(raw)));
  }else if(effect.type==='ATK_MULT'){
   t.atkBuffMult=Math.max(t.atkBuffMult||1,effect.mult||1);t.atkBuffUntil=Math.max(t.atkBuffUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='RATE_MULT'){
   t.rateBuffMult=Math.max(t.rateBuffMult||1,effect.mult||1);t.rateBuffUntil=Math.max(t.rateBuffUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='DAMAGE_REDUCTION'){
   t.damageReduction=Math.max(t.damageReduction||0,effect.ratio||0);t.damageReductionUntil=Math.max(t.damageReductionUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='DAMAGE_TAKEN_MULT'){
   t.damageTakenMult=Math.max(t.damageTakenMult||1,effect.mult||1);t.damageTakenUntil=Math.max(t.damageTakenUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='ACTION_DELAY'){
   const sec=effect.seconds||0;t.lastBasic=(t.lastBasic||0)+sec;t.lastSkill1=(t.lastSkill1||0)+sec;t.lastSkill2=(t.lastSkill2||0)+sec;
  }else if(effect.type==='STUN'){
   t.stunUntil=Math.max(t.stunUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='DEF_MOD'){
   t.defModPct=effect.pct||0;t.defModUntil=Math.max(t.defModUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='DOT'){
   t.rpgDots=t.rpgDots||[];
   t.rpgDots.push({remaining:effect.duration||4,tick:effect.tick||1,nextTick:effect.tick||1,amount:effect.amount||1,source});
  }else if(effect.type==='INVULNERABLE'){
   t.invulnerableUntil=Math.max(t.invulnerableUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='SKILL_BLOCK'){
   t.skillBlockUntil=Math.max(t.skillBlockUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='REFLECT'){
   t.reflectRatio=Math.max(t.reflectRatio||0,effect.ratio||0);t.reflectUntil=Math.max(t.reflectUntil||0,rpgSimTime+(effect.duration||0));
  }
 }
 if(effect.type==='SUMMON'){
  const count=Math.max(1,effect.count||1);
  rpgState.summons=rpgState.summons||[];
  for(let i=0;i<count;i++)rpgState.summons.push({id:'add_'+Date.now()+'_'+i,name:effect.name||'소환물',hp:effect.hp||100,maxHp:effect.hp||100,atk:effect.atk||20,attackGap:effect.attackGap||3,lastAttack:rpgSimTime,expiresAt:effect.duration?rpgSimTime+effect.duration:null});
 }
 return targets;
}
function applyRpgEffects(effects,ctx={}){for(const e of effects)applyRpgEffect(e,ctx)}
function updateRpgDots(dt){
 const actors=[...(rpgState?.heroes||[]),...(rpgState?[rpgState.boss]:[])];
 for(const t of actors){
  if(!t.rpgDots||!t.rpgDots.length)continue;
  for(const dot of t.rpgDots){
   dot.remaining-=dt;dot.nextTick-=dt;
   if(dot.nextTick<=0&&dot.remaining>=0){
    dot.nextTick+=dot.tick;
    applyRpgEffects([{type:'DAMAGE',target:'SELF',amount:dot.amount}],{source:t===rpgState.boss?(dot.source||null):rpgState.boss});
   }
  }
  t.rpgDots=t.rpgDots.filter(d=>d.remaining>0);
 }
}
function updateRpgSummons(){
 if(!rpgState)return;
 rpgState.summons=(rpgState.summons||[]).filter(s=>s.hp>0&&(!s.expiresAt||s.expiresAt>rpgSimTime));
 for(const s of rpgState.summons){
  if(rpgSimTime-s.lastAttack>=s.attackGap){
   s.lastAttack=rpgSimTime;
   const alive=rpgAliveHeroes();if(!alive.length)continue;
   const target=alive[Math.floor(Math.random()*alive.length)];
   applyRpgEffects([{type:'DAMAGE',target:'SELF',amount:s.atk}],{source:target});
  }
 }
}
function scheduleRpgEvent(delay,fn,label=''){
 if(!rpgState)return;
 rpgState.pendingEvents=rpgState.pendingEvents||[];
 rpgState.pendingEvents.push({at:rpgSimTime+Math.max(0,delay),fn,label});
}
function updateRpgPendingEvents(){
 if(!rpgState?.pendingEvents?.length)return;
 const due=rpgState.pendingEvents.filter(e=>e.at<=rpgSimTime);
 rpgState.pendingEvents=rpgState.pendingEvents.filter(e=>e.at>rpgSimTime);
 for(const e of due)e.fn();
}
function rpgConditionMet(condition,source){
 if(!condition)return true;
 if(condition.type==='HP_LTE'){
  const actor=condition.target==='SELF'?source:rpgState?.boss;
  return !!actor&&(actor.hp/Math.max(1,actor.maxHp))<=condition.ratio;
 }
 return false;
}
const RPG_ADAPTER_RUNTIME_VERSION='LG_RPG_ADAPTER_RUNTIME_V1_1';
function tryRpgDeathPrevention(actor){
 if((actor.deathPreventionCharges||0)<=0)return false;
 actor.deathPreventionCharges--;actor.hp=Math.max(1,Math.round(actor.maxHp*(actor.deathPreventionHealRatio||.20)));
 actor.ko=false;return true;
}
function runRpgAdapter(id,params={},ctx={}){
 const source=ctx.source||null;
 if(id==='CHANCE_TRIGGER'){
  const chance=Math.max(0,Math.min(1,params.chance??1));
  if(Math.random()>chance)return {triggered:false};
  if(params.effects)applyRpgEffects(params.effects,{source});
  return {triggered:true};
 }
 if(id==='CONDITIONAL_EXECUTE'){
  const targets=selectRpgTargets(params.target||'BOSS',source,params);
  const threshold=params.threshold??.30,mult=params.multiplier??1.6;
  for(const t of targets){
   const low=(t.hp/Math.max(1,t.maxHp))<=threshold;
   if(low&&params.baseDamage!=null)applyRpgEffects([{type:'DAMAGE',target:t===rpgState.boss?'BOSS':'SELF',amount:params.baseDamage*mult,ignoreDefense:!!params.ignoreDefense}],{source:t===rpgState.boss?source:t});
  }
  return {triggered:targets.some(t=>(t.hp/Math.max(1,t.maxHp))<=threshold)};
 }
 if(id==='COPY_EFFECT'){
  const donor=params.donor||rpgAliveHeroes().find(h=>h!==source&&h.lastSkillEffects?.length);
  const effects=params.effects||donor?.lastSkillEffects||[];
  if(effects.length)applyRpgEffects(effects.map(e=>({...e,target:params.targetOverride||e.target})),{source});
  return {triggered:effects.length>0,count:effects.length};
 }
 if(id==='DEATH_PREVENTION'){
  const targets=selectRpgTargets(params.target||'SELF',source,params);
  for(const t of targets){t.deathPreventionCharges=(t.deathPreventionCharges||0)+(params.charges||1);t.deathPreventionHealRatio=params.healRatio??.20}
  return {triggered:targets.length>0,count:targets.length};
 }
 if(id==='ECONOMY_DISABLED_IN_RPG'){
  return {triggered:false,disabled:true,reason:'RPG_NO_COMBAT_ECONOMY'};
 }
 if(id==='MULTI_HIT_SEQUENCE'){
  const hits=Math.max(1,params.hits||1),falloff=params.falloff??1;
  let ratio=1;
  for(let i=0;i<hits;i++){
   const effects=(params.effects||[]).map(e=>e.type==='DAMAGE'?{...e,amount:(typeof e.amount==='number'?e.amount*ratio:e.amount)}:{...e});
   applyRpgEffects(effects,{source});ratio*=falloff;
  }
  return {triggered:true,hits};
 }
 if(id==='RPG_SLOW_TO_ACTION_RATE'){
  const slow=Math.max(0,Math.min(.90,params.slowRatio??.25));
  const duration=params.duration||4;
  const targets=selectRpgTargets(params.target||'BOSS',source,params);
  for(const t of targets){t.rateBuffMult=Math.min(t.rateBuffMult||1,1-slow);t.rateBuffUntil=Math.max(t.rateBuffUntil||0,rpgSimTime+duration)}
  return {triggered:targets.length>0,count:targets.length};
 }
 if(id==='SUMMON_AWARE_TARGETING'){
  const targets=selectRpgTargets('BOSS_AND_SUMMONS',source,params);
  if(params.effects){
   for(const t of targets){
    for(const e of params.effects){
     if(e.type==='DAMAGE'){
      const amount=typeof e.amount==='function'?e.amount(source,t):e.amount;
      if(t===rpgState.boss)applyRpgEffects([{...e,target:'BOSS',amount}],{source});
      else t.hp=Math.max(0,t.hp-Math.max(1,Math.round(amount||0)));
     }
    }
   }
  }
  return {triggered:targets.length>0,count:targets.length};
 }
 if(id==='TIME_REWIND'){
  const seconds=params.seconds||2,target=params.target||'BOSS';
  const targets=selectRpgTargets(target,source,params);
  for(const t of targets){
   t.lastAttack=(t.lastAttack||0)+seconds;
   t.lastSkill1=(t.lastSkill1||0)+seconds;t.lastSkill2=(t.lastSkill2||0)+seconds;t.lastSkill3=(t.lastSkill3||0)+seconds;
  }
  return {triggered:targets.length>0,count:targets.length};
 }
 if(id==='TRANSFER_CHAIN'){
  const chain=params.targets||selectRpgTargets(params.target||'BOSS_AND_SUMMONS',source,params);
  const maxTargets=Math.min(chain.length,params.maxTargets||5),falloff=params.falloff??.90;
  let amount=params.amount||0;
  for(let i=0;i<maxTargets;i++){
   const t=chain[i];
   if(t===rpgState.boss)applyRpgEffects([{type:'DAMAGE',target:'BOSS',amount,ignoreDefense:!!params.ignoreDefense}],{source});
   else if(t&&typeof t.hp==='number')t.hp=Math.max(0,t.hp-Math.max(1,Math.round(amount)));
   amount*=falloff;
  }
  return {triggered:maxTargets>0,count:maxTargets};
 }
 if(id==='ULT_GAUGE_MOD'){
  const targets=selectRpgTargets(params.target||'ALL_HEROES',source,params),delta=params.delta||0;
  for(const t of targets)if(typeof t.ult==='number')t.ult=Math.max(0,Math.min(100,t.ult+delta));
  return {triggered:targets.length>0,count:targets.length};
 }
 if(id==='CONDITIONAL_EFFECT'){
  if(!rpgConditionMet(params.condition,source))return {triggered:false};
  if(params.effects)applyRpgEffects(params.effects,{source});
  return {triggered:true};
 }
 if(id==='TELEGRAPH_SEQUENCE'){
  const count=Math.max(1,params.count||1),gap=Math.max(.1,params.gap||.7),warning=Math.max(0,params.warning||.6);
  for(let i=0;i<count;i++){
   scheduleRpgEvent(i*gap,()=>showWarning(params.label||'⚠ TARGETED ATTACK',params.warningText||'곧 공격이 도착합니다',Math.round(warning*1000)));
   scheduleRpgEvent(i*gap+warning,()=>{
    const targets=selectRpgTargets(params.target||'RANDOM_HERO',source,{count:params.targetCount||1});
    for(const t of targets){
     const amount=typeof params.amount==='function'?params.amount(source,t):params.amount;
     applyRpgEffects([{type:'DAMAGE',target:'SELF',amount:amount||1}],{source:t});
    }
   });
  }
  return {triggered:true,count};
 }
 return {triggered:false,unsupported:true};
}
function effectiveHeroAtk(h){
 const legacy=h.buffUntil>rpgSimTime?1.15:1;
 const mult=(h.atkBuffUntil||0)>rpgSimTime?(h.atkBuffMult||1):1;
 return h.atk*legacy*mult;
}
function effectiveHeroGap(h,base){
 const mult=(h.rateBuffUntil||0)>rpgSimTime?(h.rateBuffMult||1):1;
 return base/Math.max(.1,mult);
}
function rpgDamageToBoss(raw,options={}){
 const b=rpgState.boss;
 if(options.ignoreDefense)return Math.max(1,Math.round(raw));
 return Math.max(1,Math.round(raw-Math.max(0,b.def*.25)));
}
function rpgDamageToHero(hero,raw){
 const defPct=(hero.defModUntil||0)>rpgSimTime?(hero.defModPct||0):0;
 const effectiveDef=Math.max(0,hero.def*(1+defPct));
 const reduced=Math.max(1,raw-Math.max(0,effectiveDef*.45));
 const dr=(hero.damageReductionUntil||0)>rpgSimTime?(hero.damageReduction||0):0;
 const taken=(hero.damageTakenUntil||0)>rpgSimTime?(hero.damageTakenMult||1):1;
 return Math.max(1,Math.round(reduced*(1-dr)*taken));
}
function rpgAliveHeroes(){return rpgState.heroes.filter(h=>!h.ko&&h.hp>0)}
function castBraunHornCharge(b){
 const d=RPG_BOSS_SKILL_DEFS.BRAUM.skill1;
 applyRpgEffects([
  {type:'DAMAGE',target:'ALL_HEROES',amount:b.atk*d.prototype.damageRatio},
  {type:'ACTION_DELAY',target:'ALL_HEROES',seconds:d.prototype.actionDelay}
 ],{source:b});
 b.lastSkill1=rpgSimTime;
 showWarning('철각왕 브라움 · 뿔박치기','돌진 충격 · 전원 피해 / 행동 지연',850);
}
function castBraunRockCollapse(b){
 const d=RPG_BOSS_SKILL_DEFS.BRAUM.skill2;
 applyRpgEffects([{type:'SKILL_BLOCK',target:'RANDOM_HEROES',count:d.targetCount,duration:d.duration}],{source:b});
 b.lastSkill2=rpgSimTime;
 showWarning('철각왕 브라움 · 암반 붕괴','영웅 2명 스킬 6초 봉쇄',900);
}
function castBraunCrushingRoar(b){
 const d=RPG_BOSS_SKILL_DEFS.BRAUM.skill3;
 applyRpgEffects([{type:'DAMAGE_TAKEN_MULT',target:'ALL_HEROES',mult:d.damageTakenMult,duration:d.duration}],{source:b});
 b.lastSkill3=rpgSimTime;
 showWarning('철각왕 브라움 · 분쇄 포효','8초간 파티 받는 피해 +40%',900);
}
function updateRpgBossSkills(b){
 if((b.stunUntil||0)>rpgSimTime||(b.skillBlockUntil||0)>rpgSimTime)return;
 const d=RPG_BOSS_SKILL_DEFS.BRAUM;
 if(rpgSimTime-b.lastSkill3>=d.skill3.cooldown){castBraunCrushingRoar(b);return}
 if(rpgSimTime-b.lastSkill2>=d.skill2.cooldown){castBraunRockCollapse(b);return}
 if(rpgSimTime-b.lastSkill1>=d.skill1.cooldown){castBraunHornCharge(b);return}
}
function updateRpg(dt){
 if(!rpgState||rpgState.result)return;
 rpgSimTime+=dt;
 updateRpgPendingEvents();updateRpgDots(dt);updateRpgSummons();
 const b=rpgState.boss;
 for(const h of rpgAliveHeroes()){
  if((h.stunUntil||0)>rpgSimTime)continue;
  const atk=effectiveHeroAtk(h);
  if(rpgSimTime-h.lastBasic>=effectiveHeroGap(h,h.basicGap)){
   h.lastBasic=rpgSimTime;
   applyRpgEffects([{type:'DAMAGE',target:'BOSS',amount:atk}],{source:h});
   h.ult=Math.min(100,h.ult+6);
  }
  if((h.skillBlockUntil||0)<=rpgSimTime&&rpgSimTime-h.lastSkill1>=effectiveHeroGap(h,h.skill1Gap)){
   h.lastSkill1=rpgSimTime;
   const skill1=RPG_HERO_DEFS[h.heroId];
   const skillEffects=[{type:'DAMAGE',target:'BOSS',amount:atk*1.65,ignoreDefense:skill1.skill1DamageType==='관통'}];
   h.lastSkillEffects=skillEffects.map(e=>({...e}));
   applyRpgEffects(skillEffects,{source:h});
   h.ult=Math.min(100,h.ult+12);
  }
  if((h.skillBlockUntil||0)<=rpgSimTime&&rpgSimTime-h.lastSkill2>=effectiveHeroGap(h,h.skill2Gap)){
   h.lastSkill2=rpgSimTime;
   applyRpgEffects([
    {type:'ATK_MULT',target:'ALL_HEROES',mult:1.15,duration:8},
    {type:'RATE_MULT',target:'ALL_HEROES',mult:1.15,duration:8},
    {type:'DAMAGE_REDUCTION',target:'ALL_HEROES',ratio:.20,duration:8}
   ],{source:h});
   h.buffUntil=rpgSimTime+8;
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
 updateRpgBossSkills(b);
 const bossRate=(b.rateBuffUntil||0)>rpgSimTime?(b.rateBuffMult||1):1;
 const attackGap=(b.baseAttackGap/(b.phase===1?1:b.phase===2?1.18:1.4))/Math.max(.1,bossRate);
 if(rpgSimTime-b.lastAttack>=attackGap){
  b.lastAttack=rpgSimTime;
  const alive=rpgAliveHeroes();
  if(alive.length){
   const count=b.phase===1?1:Math.min(alive.length,b.phase);
   const targets=alive.slice().sort(()=>Math.random()-.5).slice(0,count);
   targets.forEach(h=>{
    const raw=b.atk*(b.phase===1?1:b.phase===2?1.15:1.35);
    applyRpgEffects([{type:'DAMAGE',target:'SELF',amount:raw}],{source:h});
    h.ult=Math.min(100,h.ult+10);
   });
  }
 }
 if(!rpgAliveHeroes().length){finishRpgDefeat('모든 영웅이 전투불능');return}
 if(rpgAutoBattle){
  const ready=rpgAliveHeroes().find(h=>h.ult>=100);
  if(ready){useRpgUltimate(ready.id,true);return}
 }
 renderRpg();
}
function useRpgUltimate(heroId,fromAuto=false){
 if(gameMode!=='RPG'||!rpgState||rpgState.result||manualPaused)return;
 const h=rpgState.heroes.find(x=>x.id===heroId);
 if(!h||h.ko||h.ult<100||(h.skillBlockUntil||0)>rpgSimTime)return;
 h.ult=0;
 const before=rpgState.boss.hp;
 applyRpgEffects([
  {type:'DAMAGE',target:'BOSS',amount:h.atk*4},
  {type:'DAMAGE_REDUCTION',target:'ALL_HEROES',ratio:.50,duration:5}
 ],{source:h});
 const dmg=Math.max(0,Math.round(before-rpgState.boss.hp));
 showWarning(h.name+' · '+RPG_HERO_DEFS[h.heroId].ultimateName,(fromAuto?'AUTO · ':'')+'ULTIMATE · '+dmg+' DAMAGE · PARTY GUARD 5s',850);
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
  if(e.hp<=0&&!e.cinematic)continue;const xy=enemyXY(e),p=posPct(xy.x,xy.y),d=document.createElement('div');
  const cinematicClass=e.cinematic?' cinematicBoss '+(e.cinematicState==='fallen'?'bossFallen':e.cinematicState==='rise'?'bossRise':e.cinematicState==='roar'?'bossRise bossRoar':e.cinematicState==='charge'?'bossRise bossCharge':''):'';
  const hitFx=e.hitFxUntil>simTime&&e.hitFxType?' hitFx-'+e.hitFxType:'';
  d.className='enemyToken '+(e.kind==='boss'?'boss':e.kind==='midboss'?'midboss':'')+cinematicClass+hitFx;
  d.dataset.enemyId=e.id;
  d.style.left=p.left;d.style.top=p.top;d.textContent=e.label;
  if(!e.cinematic)d.innerHTML+='<span class="hpbar"><i style="width:'+Math.max(0,e.hp/e.maxHp*100)+'%"></i></span>';
  enemyLayer.appendChild(d);
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
 addLuckyWaveClear(wave);
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
$('battlefield').addEventListener('click',()=>{if(gameMode==='TD'&&!rpgPending)clearSelection(true)});
$('speed').onclick=()=>{speed=speed===1?2:speed===2?3:1;$('speed').textContent='×'+speed};
$('autoBattle').onclick=()=>{
 if(gameMode!=='RPG'||rpgTransitioning||(rpgState&&rpgState.result))return;
 rpgAutoBattle=!rpgAutoBattle;
 $('autoBattle').textContent=rpgAutoBattle?'AUTO ON':'AUTO OFF';
 $('autoBattle').classList.toggle('on',rpgAutoBattle);
 showWarning('AUTO '+(rpgAutoBattle?'ON':'OFF'),rpgAutoBattle?'궁극기를 자동으로 사용합니다':'궁극기를 직접 사용합니다',700);
};
function syncPauseButton(){$('pause').textContent=manualPaused?'▶ 계속':'Ⅱ 일시정지'}
$('pause').onclick=()=>{
 if(rpgPending||comboPlacement||rpgTransitioning||(rpgState&&rpgState.result))return;
 manualPaused=!manualPaused;
 running=!manualPaused;
 syncPauseButton();
 if(manualPaused)showWarning('일시정지','전투 시간이 멈췄습니다',900);
};
syncPauseButton();

buildGrid();renderUnits();syncHUD();updateComboHighlights();requestAnimationFrame(loop);

window.__LG_STAGE1_TEST__={
 luckyRoulette:{roll:(v)=>luckyOutcomeRoll(v),spin:(v)=>luckySpin(v),waveClear:(w)=>addLuckyWaveClear(w),midbossBonus:()=>addLuckyMidbossBonus(),buff:(p)=>addLuckyStageBuff(p),state:()=>({jackpotPct:luckyJackpotPct,stageBuffPct:luckyStageBuffPct}),midbossOptions:()=>openMidbossReward(),chooseMidboss:(id)=>chooseMidbossReward(id)},
 grid:()=>({cols:COLS,rows:ROWS,cells:cells.length}),
 state:()=>({gameMode,wave,gold,gHp,oHp,speed,simTime,waveClock,units:[...units.values()],enemies:enemies.length,bosses:enemies.filter(e=>e.kind==='boss'&&e.hp>0).length,bossEnraged:enemies.some(e=>e.kind==='boss'&&e.hp>0&&e.enraged),bottomVisible:bottom.classList.contains('on'),rpgPending,manualPaused,moveModeUnitId,comboPlacement:!!comboPlacement,rpg:rpgState?{bossHp:rpgState.boss.hp,bossPhase:rpgState.boss.phase,heroes:rpgState.heroes.map(h=>({name:h.name,hp:h.hp,ult:h.ult,ko:h.ko})),result:rpgState.result,transitioning:rpgTransitioning,autoBattle:rpgAutoBattle}:null,gatePhase:gHp>0?'FINAL_WALL_G':'GATE_CORE_O'}),
 select:(x,y)=>onCellTap(x,y),
 place:(x,y,type)=>placeUnit(x,y,UNIT_DEFS[type]),
 route:()=>route.slice(),
 recipes:()=>HERO_RECIPES,
 unitDefs:()=>UNIT_DEFS,
 startRpg:()=>startRpgBattle([...units.values()].filter(u=>u.type==='hero_aria').slice(0,5)),
 enemySpecialRuntime:{semantics:()=>ENEMY_SPECIAL_RUNTIME_SEMANTICS,bindings:()=>({...ENEMY_SPECIAL_SEMANTIC_BY_NAME}),bind:(enemy,name)=>bindEnemySpecialSemantic(enemy,name),profile:(semantic,hp,maxHp)=>enemySpecialRuntimeProfile(semantic,hp,maxHp),freezeDuration:(semantic,duration)=>enemyFreezeDuration({specialSemantic:semantic,hp:1,maxHp:1},duration),physicalDamage:(semantic,amount)=>applyEnemyPhysicalDamageReduction({specialSemantic:semantic,hp:1,maxHp:1},amount,'PHYSICAL')},
 standard:'LG_STAGE1_RPG_BOSS_PROTOTYPE_V1_2'
};
})();