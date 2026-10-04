(()=> {
'use strict';

let COLS=18, ROWS=10, CELL_COUNT=COLS*ROWS;
const WAVE_DURATION=40;
const PRIORITY_C_CANDIDATE_B=Object.freeze({
 id:'CANDIDATE_B',status:'PLANNING_SELECTED_TD_BASELINE_NOT_CANONICAL_MAIN',
 rawEnemyCountX:2.25,rawEnemyHpX:1.35,canonRelativeCountX:1.125,canonRelativeHpX:1.125,
 goldPerKill:11,w5HpX:6.5,w10HpX:10.5,waveDurationSec:40
});
let priorityCTestProfile='CANDIDATE_B',priorityCTelemetry=null;
function priorityCBalanceProfile(){return priorityCTestProfile==='CANON_CURRENT'?null:PRIORITY_C_CANDIDATE_B}
function priorityCResetTelemetry(){
 priorityCTelemetry={
  schema:'LG_STAGE1_PRIORITY_C_TELEMETRY_V1',
  profile:priorityCTestProfile==='CANON_CURRENT'?'CANON_CURRENT':'CANDIDATE_B',
  profile_status:priorityCTestProfile==='CANON_CURRENT'?'CANON_CONTROL':PRIORITY_C_CANDIDATE_B.status,
  spawn_count_per_wave:{},spawn_count_by_kind:{},
  wave_end_survivors:{},gate_hp_per_wave:{},final_wall_hp_per_wave:{},
  cumulative_gold:typeof gold==='number'?gold:500,gold_earned:0,gold_spent:0,
  build_actions:0,upgrade_actions:0,gate_hp:typeof oHp==='number'?oHp:120,
  hero_acquisition_actions:[],td_end_hero_count:null,td_end_hero_ids:[],
  w5_ttk:null,w10_td_boss_ttk:null,rpg_transition:false,rpg_transition_sim_time:null,
  rpg_party_size:null,rpg_party_ids:[],rpg_battle_started_with_valid_party:false,rpg_result:null,rpg_boss_ttk_sec:null,
  special_spawn_times:{w5:null,w10:null},
  started_sim_time:typeof simTime==='number'?simTime:0,finished_reason:null
 };
 return priorityCTelemetry;
}
function priorityCEnsureTelemetry(){return priorityCTelemetry||priorityCResetTelemetry()}
function priorityCSetProfile(id){
 if(id==null||id==='CANDIDATE_B'||id==='SELECTED_TD_BASELINE')priorityCTestProfile='CANDIDATE_B';
 else if(id==='CANON_CURRENT')priorityCTestProfile='CANON_CURRENT';
 else throw new Error('UNKNOWN_PRIORITY_C_PROFILE '+id);
 return priorityCResetTelemetry();
}
function priorityCRecordGold(amount,source){
 if(!(amount>0))return;
 const t=priorityCEnsureTelemetry();t.cumulative_gold+=amount;t.gold_earned+=amount;
 t.last_gold_source=source||'UNSPECIFIED';
}
function priorityCRecordSpend(amount,kind){
 if(!(amount>0))return;
 const t=priorityCEnsureTelemetry();t.gold_spent+=amount;
 if(kind==='BUILD')t.build_actions++;else if(kind==='UPGRADE')t.upgrade_actions++;
}
function priorityCRecordHeroAcquisition(source,heroIds){
 if(!heroIds||!heroIds.length)return;
 const t=priorityCEnsureTelemetry();
 t.hero_acquisition_actions.push({source:source||'LUCKY_FREE_SUMMON',wave,sim_time:simTime,hero_ids:[...heroIds]});
}
function priorityCRecordSpawn(e){
 const t=priorityCEnsureTelemetry(),k=String(wave);
 t.spawn_count_per_wave[k]=(t.spawn_count_per_wave[k]||0)+1;
 if(!t.spawn_count_by_kind[k])t.spawn_count_by_kind[k]={normal:0,midboss:0,boss:0};
 t.spawn_count_by_kind[k][e.kind]=(t.spawn_count_by_kind[k][e.kind]||0)+1;
 if(e.kind==='midboss'&&t.special_spawn_times.w5==null)t.special_spawn_times.w5=simTime;
 if(e.kind==='boss'&&t.special_spawn_times.w10==null)t.special_spawn_times.w10=simTime;
}
function priorityCRecordEnemyDeath(e){
 const t=priorityCEnsureTelemetry();
 if(e.kind==='midboss'&&t.w5_ttk==null&&t.special_spawn_times.w5!=null)t.w5_ttk=Math.max(0,simTime-t.special_spawn_times.w5);
 if(e.kind==='boss'&&t.w10_td_boss_ttk==null&&t.special_spawn_times.w10!=null)t.w10_td_boss_ttk=Math.max(0,simTime-t.special_spawn_times.w10);
}
function priorityCRecordWaveEnd(w){
 const t=priorityCEnsureTelemetry(),k=String(w);
 if(t.wave_end_survivors[k]===undefined)t.wave_end_survivors[k]=aliveEnemyCount();
 if(t.gate_hp_per_wave[k]===undefined)t.gate_hp_per_wave[k]=oHp;
 if(t.final_wall_hp_per_wave[k]===undefined)t.final_wall_hp_per_wave[k]=gHp;
 t.gate_hp=oHp;
}
function priorityCRecordTdEnd(tdHeroes,boss){
 const t=priorityCEnsureTelemetry();
 t.wave_end_survivors['10']=enemies.filter(e=>e!==boss&&e.hp>0).length;
 t.gate_hp_per_wave['10']=oHp;t.final_wall_hp_per_wave['10']=gHp;t.gate_hp=oHp;t.gate_hp_at_td_end=oHp;
 t.td_end_hero_count=tdHeroes.length;t.td_end_hero_ids=tdHeroes.map(h=>h.heroId).filter(Boolean);
}
function priorityCRecordRpgTransition(){
 const t=priorityCEnsureTelemetry();t.rpg_transition=true;t.rpg_transition_sim_time=simTime;t.rpg_transition_gate_hp_after_cinematic=oHp;
}
function priorityCRecordRpgBattleStart(heroIds){
 const t=priorityCEnsureTelemetry(),ids=(heroIds||[]).filter(Boolean);
 t.rpg_party_size=ids.length;t.rpg_party_ids=[...ids];t.rpg_battle_started_with_valid_party=ids.length>=1&&ids.length<=5;
}
function priorityCRecordRpgResult(result){
 const t=priorityCEnsureTelemetry();t.rpg_result=result;
 if(result==='VICTORY')t.rpg_boss_ttk_sec=rpgSimTime;
}
function rpgDiagReset(heroIds){
 rpgDiagnostic={
  schema:'LG_STAGE1_RPG_SMALL_PARTY_DIAGNOSTIC_V1',
  partyIds:[...(heroIds||[])],
  bossHpStart:rpgState&&rpgState.boss?rpgState.boss.maxHp:null,
  bossHpEnd:null,bossHpRemainingPct:null,
  rpgBattleDurationSec:null,partyAliveCountEnd:null,timeToFirstHeroDefeatSec:null,
  totalPartyDamageToBoss:0,
  skillActivationCounts:{heroes:{},boss:{basic:0,skill1:0,skill2:0,skill3:0}},
  statusEffectCounts:{},result:null
 };
 return rpgDiagnostic;
}
function rpgDiagHeroAction(heroId,kind){
 if(!rpgDiagnostic)return;
 const key=heroId||'UNKNOWN',bucket=rpgDiagnostic.skillActivationCounts.heroes[key]||(rpgDiagnostic.skillActivationCounts.heroes[key]={basic:0,s1:0,s2:0,ult:0});
 bucket[kind]=(bucket[kind]||0)+1;
}
function rpgDiagBossAction(kind){
 if(!rpgDiagnostic)return;
 const b=rpgDiagnostic.skillActivationCounts.boss;b[kind]=(b[kind]||0)+1;
}
function rpgDiagStatus(type,count=1){
 if(!rpgDiagnostic||!type)return;
 rpgDiagnostic.statusEffectCounts[type]=(rpgDiagnostic.statusEffectCounts[type]||0)+Math.max(0,count||0);
}
function rpgDiagFirstHeroDefeat(hero){
 if(!rpgDiagnostic||rpgDiagnostic.timeToFirstHeroDefeatSec!=null)return;
 if(hero&&(hero.ko||hero.hp<=0))rpgDiagnostic.timeToFirstHeroDefeatSec=rpgSimTime;
}
function rpgDiagFinish(result){
 if(!rpgDiagnostic)return;
 const boss=rpgState&&rpgState.boss?rpgState.boss:null;
 rpgDiagnostic.result=result;
 rpgDiagnostic.rpgBattleDurationSec=rpgSimTime;
 rpgDiagnostic.bossHpEnd=boss?Math.max(0,boss.hp):null;
 rpgDiagnostic.bossHpRemainingPct=boss&&boss.maxHp>0?Math.max(0,boss.hp/boss.maxHp*100):null;
 rpgDiagnostic.partyAliveCountEnd=rpgState?rpgAliveHeroes().length:null;
}
function rpgDiagSnapshot(){
 if(!rpgDiagnostic)return null;
 const out=JSON.parse(JSON.stringify(rpgDiagnostic));
 if(rpgState&&rpgState.boss){
  out.bossHpEnd=Math.max(0,rpgState.boss.hp);
  out.bossHpRemainingPct=rpgState.boss.maxHp>0?Math.max(0,rpgState.boss.hp/rpgState.boss.maxHp*100):null;
  out.partyAliveCountEnd=rpgAliveHeroes().length;
  if(out.rpgBattleDurationSec==null)out.rpgBattleDurationSec=rpgSimTime;
 }
 return out;
}
function priorityCExportTelemetry(){
 const t=priorityCEnsureTelemetry();
 t.current_gold=gold;t.gate_hp=oHp;t.final_wall_hp=gHp;t.current_wave=wave;t.game_mode=gameMode;
 return JSON.parse(JSON.stringify(t));
}
let activeStageRoutes=[];
let route=[[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[6,4],[6,3],[7,3],[8,3],[9,3],[10,3],[10,4],[10,5],[11,5],[12,5],[13,5],[14,5],[15,5],[16,5],[17,5],[18,5]];
let TILE_ROWS=[
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
const MAP_RUNTIME_REGISTRY={WORLD_01:{id:'WORLD_01',localMaps:{
  LOCAL_WEST:{id:'LOCAL_WEST',normalName:'브레몽 왕국',hardName:'타락한 서부 왕국',modes:{NORMAL:{stages:[{id:'NORMAL_01',globalStage:1,status:'IMPLEMENTED',dataPath:'data/stage01.json',baseUnitIds:['watchtower','knight1','archer1','lancer1'],label:'브레몽 왕국 · 산악 초입'},{id:'NORMAL_02',globalStage:2,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_03',globalStage:3,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_04',globalStage:4,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_05',globalStage:5,status:'DATA_CONFIRMED_RUNTIME_PENDING'}]},HARD:{stages:[{id:'HARD_31',globalStage:31,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'HARD_32',globalStage:32,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'HARD_33',globalStage:33,status:'DATA_CONFIRMED_RUNTIME_PENDING'}]}}},
  LOCAL_BELOZAR:{id:'LOCAL_BELOZAR',normalName:'벨로자르 제국',hardName:'타락한 벨로자르 제국',modes:{NORMAL:{stages:[{id:'NORMAL_16',globalStage:16,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_17',globalStage:17,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_18',globalStage:18,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_19',globalStage:19,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_20',globalStage:20,status:'DATA_CONFIRMED_RUNTIME_PENDING'}]},HARD:{stages:[{id:'HARD_34',globalStage:34,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'HARD_35',globalStage:35,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'HARD_36',globalStage:36,status:'DATA_CONFIRMED_RUNTIME_PENDING'}]}}},
  LOCAL_AZAR:{id:'LOCAL_AZAR',normalName:'아자르 삼국연합',hardName:'타락한 아자르 삼국연합',modes:{NORMAL:{stages:[{id:'NORMAL_06',globalStage:6,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_07',globalStage:7,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_08',globalStage:8,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_09',globalStage:9,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_10',globalStage:10,status:'DATA_CONFIRMED_RUNTIME_PENDING'}]},HARD:{stages:[{id:'HARD_37',globalStage:37,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'HARD_38',globalStage:38,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'HARD_39',globalStage:39,status:'DATA_CONFIRMED_RUNTIME_PENDING'}]}}},
  LOCAL_HAERYUN:{id:'LOCAL_HAERYUN',normalName:'해륜 황국',hardName:'타락한 해륜왕국',modes:{NORMAL:{stages:[{id:'NORMAL_11',globalStage:11,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_12',globalStage:12,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_13',globalStage:13,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_14',globalStage:14,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_15',globalStage:15,status:'DATA_CONFIRMED_RUNTIME_PENDING'}]},HARD:{stages:[{id:'HARD_40',globalStage:40,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'HARD_41',globalStage:41,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'HARD_42',globalStage:42,status:'DATA_CONFIRMED_RUNTIME_PENDING'}]}}},
  LOCAL_SAINTARC:{id:'LOCAL_SAINTARC',normalName:'생아트르크 교황령',hardName:'암운이 드리운 생트아르크 교황령',modes:{NORMAL:{stages:[{id:'NORMAL_21',globalStage:21,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_22',globalStage:22,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_23',globalStage:23,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_24',globalStage:24,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_25',globalStage:25,status:'DATA_CONFIRMED_RUNTIME_PENDING'}]},HARD:{stages:[{id:'HARD_43',globalStage:43,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'HARD_44',globalStage:44,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'HARD_45',globalStage:45,status:'DATA_CONFIRMED_RUNTIME_PENDING'}]}}},
  LOCAL_SANDRAK:{id:'LOCAL_SANDRAK',normalName:'상드라크 제국',hardName:'심연에 침식당한 상드라크 제국',modes:{NORMAL:{stages:[{id:'NORMAL_26',globalStage:26,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_27',globalStage:27,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_28',globalStage:28,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_29',globalStage:29,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'NORMAL_30',globalStage:30,status:'DATA_CONFIRMED_RUNTIME_PENDING'}]},HARD:{stages:[{id:'HARD_46',globalStage:46,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'HARD_47',globalStage:47,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'HARD_48',globalStage:48,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'HARD_49',globalStage:49,status:'DATA_CONFIRMED_RUNTIME_PENDING'},{id:'HARD_50',globalStage:50,status:'DATA_CONFIRMED_RUNTIME_PENDING'}]}}}
}}};
let activeMapSelection={worldId:'WORLD_01',localMapId:'LOCAL_WEST',mode:'NORMAL',stageId:'NORMAL_01'};
let activeStageRuntime=MAP_RUNTIME_REGISTRY.WORLD_01.localMaps.LOCAL_WEST.modes.NORMAL.stages[0];
function stageBaseUnitIds(){return activeStageRuntime.baseUnitIds||[]}
function resolveStageRuntime(selection){const world=MAP_RUNTIME_REGISTRY[selection.worldId];if(!world)throw new Error('Unknown world '+selection.worldId);const local=world.localMaps[selection.localMapId];if(!local)throw new Error('Unknown local map '+selection.localMapId);const mode=local.modes[selection.mode];if(!mode)throw new Error('Unknown mode '+selection.mode);const stage=mode.stages.find(s=>s.id===selection.stageId);if(!stage||stage.status!=='IMPLEMENTED')throw new Error('Stage map '+selection.stageId+' runtime is not implemented');return stage}
function selectStageRuntime(selection){activeStageRuntime=resolveStageRuntime(selection);activeMapSelection={...selection};playerProfile.selectedMap={...selection};return activeStageRuntime}
function availableMasterStages(){const out=[];Object.values(MAP_RUNTIME_REGISTRY).forEach(w=>Object.values(w.localMaps).forEach(l=>Object.entries(l.modes).forEach(([mode,v])=>v.stages.forEach(s=>out.push({worldId:w.id,localMapId:l.id,mode,id:s.id,globalStage:s.globalStage,status:s.status,label:s.label||s.id})))));return out}
function syncStageHud(){const stage=activeStageRuntime;const hud=document.querySelector('#topHUD .hudStage');if(hud)hud.textContent='STAGE '+stage.globalStage+' · '+(stage.label||stage.id);const banner=document.getElementById('stageBanner');if(banner)banner.textContent=(stage.label||stage.id)}
function validateStageMapData(data){
 if(!data||!data.grid||(!Array.isArray(data.route)&&!Array.isArray(data.routes))||!Array.isArray(data.tile_rows))throw new Error('Invalid stage map data');
 if(data.tile_rows.length!==data.grid.rows||data.tile_rows.some(r=>r.length!==data.grid.cols))throw new Error('Stage map grid mismatch');
 const paths=data.routes||[data.route];if(!paths.length||paths.some(p=>!Array.isArray(p)||p.length<2))throw new Error('Stage map route mismatch');
 return data;
}
function applyStageMapData(data){
 validateStageMapData(data);COLS=data.grid.cols;ROWS=data.grid.rows;CELL_COUNT=COLS*ROWS;const paths=data.routes||[data.route];route=paths[0].map(p=>[p[0],p[1]]);activeStageRoutes=paths.map(path=>path.map(p=>[p[0],p[1]]));TILE_ROWS=data.tile_rows.slice();
}
async function loadJsonAsset(path){
 const resolved=new URL(path,location.href).href;
 if(location.protocol==='file:'){
  return await new Promise((resolve,reject)=>{
   const xhr=new XMLHttpRequest();
   xhr.open('GET',resolved,true);
   if(xhr.overrideMimeType)xhr.overrideMimeType('application/json');
   xhr.onload=()=>{
    const body=xhr.responseText||'';
    if((xhr.status===0||xhr.status>=200&&xhr.status<300)&&body){
     try{resolve(JSON.parse(body))}catch(err){reject(new Error('STAGE_ASSET_JSON_INVALID '+path))}
     return;
    }
    reject(new Error('STAGE_ASSET_XHR_FAILED '+path+' status='+xhr.status));
   };
   xhr.onerror=()=>reject(new Error('STAGE_ASSET_XHR_FAILED '+path+' status='+xhr.status));
   xhr.send();
  });
 }
 const response=await fetch(resolved);if(!response.ok)throw new Error('STAGE_ASSET_FETCH_FAILED '+path+' status='+response.status);
 return await response.json();
}
async function loadStageMapRuntime(selection){
 const stage=resolveStageRuntime(selection);if(!stage.dataPath)throw new Error('Stage map '+stage.id+' has no runtime map data');
 applyStageMapData(await loadJsonAsset(stage.dataPath));return stage;
}
function rebuildStageGrid(){
 cells.length=0;document.querySelectorAll('#grid > .cell').forEach(el=>el.remove());buildGrid();renderUnits();
}

const HERO_RECIPES=[
 {id:'ARIA',name:'아리아',rarity:'LEGENDARY',recipeNames:["기사단장","기사단장"],materials:[{"type":"knight3_commander","count":2}],recipeRuntimeComplete:true,atk:72,range:3,rate:1.2},
 {id:'YUNA',name:'유나',rarity:'LEGENDARY',recipeNames:["주술사","대현자"],materials:[],recipeRuntimeComplete:false,atk:42,range:4,rate:1.1},
 {id:'RIEL',name:'리엘',rarity:'LEGENDARY',recipeNames:["1급 용암수정","대현자"],materials:[],recipeRuntimeComplete:false,atk:90,range:4,rate:1.2},
 {id:'RUBY',name:'루비',rarity:'LEGENDARY',recipeNames:["연사궁병","연사 감시탑"],materials:[{"type":"archer3_rapid","count":1},{"type":"watchtower3_rapid","count":1}],recipeRuntimeComplete:true,atk:72,range:4,rate:1.4},
 {id:'ERIKA',name:'에리카',rarity:'LEGENDARY',recipeNames:["광전사","마창병"],materials:[{"type":"knight3_berserker","count":1},{"type":"lancer3_magic","count":1}],recipeRuntimeComplete:true,atk:84,range:1,rate:1.3},
 {id:'SERA',name:'세라',rarity:'LEGENDARY',recipeNames:["아이돌","주술사"],materials:[],recipeRuntimeComplete:false,atk:30,range:3,rate:1.2},
 {id:'REINA',name:'레이나',rarity:'LEGENDARY',recipeNames:["1급 얼음수정","대현자"],materials:[],recipeRuntimeComplete:false,atk:58,range:4,rate:1.1},
 {id:'KARIN',name:'카린',rarity:'LEGENDARY',recipeNames:["광전사","연사궁병"],materials:[{"type":"knight3_berserker","count":1},{"type":"archer3_rapid","count":1}],recipeRuntimeComplete:true,atk:82,range:2,rate:1.7},
 {id:'BELL',name:'벨',rarity:'MYTHIC',recipeNames:["주술사","충만한 마력수정","유나"],materials:[],recipeRuntimeComplete:false,atk:70,range:4,rate:1.2},
 {id:'MIA',name:'미아',rarity:'MYTHIC',recipeNames:["대형 발리스타","연사 감시탑","루비"],materials:[{"type":"watchtower3_rapid","count":1}],recipeRuntimeComplete:false,atk:88,range:4,rate:1.5},
 {id:'IRENE',name:'아이린',rarity:'MYTHIC',recipeNames:["기사단장","마력 캐논타워","아리아"],materials:[{"type":"knight3_commander","count":1}],recipeRuntimeComplete:false,atk:96,range:2,rate:1.3},
 {id:'NEON',name:'네온',rarity:'MYTHIC',recipeNames:["흑마법사","대현자","유나"],materials:[],recipeRuntimeComplete:false,atk:82,range:4,rate:1.4},
 {id:'SASHA',name:'샤샤',rarity:'MYTHIC',recipeNames:["봄버 캐논타워","석궁수","루비"],materials:[{"type":"archer3_crossbow","count":1}],recipeRuntimeComplete:false,atk:100,range:5,rate:1.1},
 {id:'LUNA',name:'루나',rarity:'MYTHIC',recipeNames:["대현자","충만한 마력수정","레이나"],materials:[],recipeRuntimeComplete:false,atk:60,range:5,rate:1.2},
 {id:'VIOLA',name:'비올라',rarity:'MYTHIC',recipeNames:["흑마법사","죽음의 화신","유나"],materials:[],recipeRuntimeComplete:false,atk:78,range:4,rate:1.3},
 {id:'CHLOE',name:'클로에',rarity:'MYTHIC',recipeNames:["아이돌","주술사","세라"],materials:[],recipeRuntimeComplete:false,atk:45,range:4,rate:1.4},
 {id:'ADEL',name:'아델',rarity:'MYTHIC',recipeNames:["기사단장","미스릴 방어벽","아리아"],materials:[{"type":"knight3_commander","count":1}],recipeRuntimeComplete:false,atk:76,range:1,rate:1.1},
 {id:'NIA',name:'니아',rarity:'MYTHIC',recipeNames:["흑마법사","마녀대모","리엘"],materials:[],recipeRuntimeComplete:false,atk:98,range:4,rate:1.3},
 {id:'AURORA',name:'오로라',rarity:'MYTHIC',recipeNames:["주술사","충만한 마력수정","세라"],materials:[],recipeRuntimeComplete:false,atk:94,range:5,rate:1.2},
 {id:'EVE',name:'이브',rarity:'MYTHIC',recipeNames:["아이돌","1급 얼음수정","카린"],materials:[],recipeRuntimeComplete:false,atk:62,range:5,rate:1.3}
];

const cells=[], units=new Map(), enemies=[];
const ALL_HERO_IDS=['ARIA','YUNA','RIEL','RUBY','ERIKA','SERA','REINA','KARIN','BELL','MIA','IRENE','NEON','SASHA','LUNA','VIOLA','CHLOE','ADEL','NIA','AURORA','EVE'];
const HERO_RARITY_REGISTRY={ARIA:'LEGENDARY',YUNA:'LEGENDARY',RIEL:'LEGENDARY',RUBY:'LEGENDARY',ERIKA:'LEGENDARY',SERA:'LEGENDARY',REINA:'LEGENDARY',KARIN:'LEGENDARY',BELL:'MYTHIC',MIA:'MYTHIC',IRENE:'MYTHIC',NEON:'MYTHIC',SASHA:'MYTHIC',LUNA:'MYTHIC',VIOLA:'MYTHIC',CHLOE:'MYTHIC',ADEL:'MYTHIC',NIA:'MYTHIC',AURORA:'MYTHIC',EVE:'MYTHIC'}; // authoritative V4_2 encyclopedia: Legendary 8 + Mythic 12
let playerProfile={type:'UNSELECTED',ownedHeroes:[],heroLevel:10,selectedMap:{worldId:'WORLD_01',localMapId:'LOCAL_WEST',mode:'NORMAL',stageId:'NORMAL_01'},infiniteGold:false};
function heroSkillUnlocked(slot){return slot===1||slot===2&&playerProfile.heroLevel>=20||slot===3&&playerProfile.heroLevel>=30}
function spendGold(amount){if(playerProfile.infiniteGold)return true;if(gold<amount)return false;gold-=amount;return true}
function addGold(amount,source){gold+=amount;priorityCRecordGold(amount,source);return gold}
let gold=500,wave=1,gHp=100,oHp=120,running=true,speed=1,last=performance.now(),simTime=0;
let spawnClock=0,waveClock=0,nextEnemyId=1,selected=null,heroCount=0,waveSpawned=0,specialSpawned=false,rpgPending=false,waveEnding=false;
let moveModeUnitId=null,comboPlacement=null,manualPaused=false;
let gameMode='TD',rpgState=null,rpgDiagnostic=null,rpgSimTime=0,rpgTransitioning=false,rpgAutoBattle=false;
let luckyNaturalPct=0,luckyBonusPct=0,luckyStageBuffPct=0,luckyOverlayOpen=false,midbossRewardPending=false,luckySpinPhase='IDLE';
const LUCKY_FAIL_WEIGHTS={LUCKY:1.5,BONUS:1.8,MISS:1.0};
function luckyDisplayedJackpotPct(){return Math.max(0,Math.min(100,luckyNaturalPct+luckyBonusPct))}
function luckyOutcomeRoll(randomSource=Math.random){
 const jp=luckyDisplayedJackpotPct()/100;
 if(jp<=0)return 'MISS';
 const first=typeof randomSource==='function'?randomSource():randomSource;
 if(first<jp)return 'JACKPOT';
 const second=typeof randomSource==='function'?randomSource():Math.random();
 if(second<Math.min(1,jp*1.5))return 'LUCKY';
 const third=typeof randomSource==='function'?randomSource():Math.random();
 if(third<Math.min(1,jp*1.8))return 'BONUS';
 return 'MISS';
}
function addLuckyWaveClear(w){if(w>=1&&w<=9)luckyNaturalPct=Math.min(18,luckyNaturalPct+2)}
function addLuckyMidbossBonus(){luckyBonusPct=Math.min(100,luckyBonusPct+20)}
function resetLuckyAfterSpin(){luckyNaturalPct=0;luckyBonusPct=0}
function addLuckyStageBuff(pct){luckyStageBuffPct=Math.min(40,luckyStageBuffPct+pct);return luckyStageBuffPct}
function luckyUnitStatMultiplier(){return 1+luckyStageBuffPct/100}
function luckyRewardOptions(tier){
 if(tier==='JACKPOT')return ['MYTHIC_OWNED_RANDOM_1','STAGE_BUFF_30','LEGENDARY_OWNED_RANDOM_2','GOLD_2000'];
 if(tier==='LUCKY')return ['LEGENDARY_OWNED_RANDOM_1','STAGE_BUFF_20','GOLD_1000'];
 if(tier==='BONUS')return ['STAGE_BUFF_10','GOLD_500'];
 return [];
}
function luckySpin(randomSource=Math.random){
 if(gameMode!=='TD'||rpgPending||midbossRewardPending||luckySpinPhase!=='OPEN')return null;
 luckySpinPhase='SPINNING';running=false;const tier=luckyOutcomeRoll(randomSource);resetLuckyAfterSpin();
 return {tier,rewards:luckyRewardOptions(tier)};
}
function luckyRewardLabel(id){
 const labels={MYTHIC_OWNED_RANDOM_1:'보유 신화 영웅 1명 무료 소환',STAGE_BUFF_30:'전 유닛 공격력·공격속도 +30%',LEGENDARY_OWNED_RANDOM_2:'보유 전설 영웅 2명 무료 소환',GOLD_2000:'2000 골드',LEGENDARY_OWNED_RANDOM_1:'보유 전설 영웅 1명 무료 소환',STAGE_BUFF_20:'전 유닛 공격력·공격속도 +20%',GOLD_1000:'1000 골드',STAGE_BUFF_10:'전 유닛 공격력·공격속도 +10%',GOLD_500:'500 골드',MID_GOLD_1000:'1000 골드',MID_LEGENDARY_1:'보유 전설 영웅 1명 무료 소환',MID_JACKPOT_20:'JACKPOT 확률 +20%p'};
 return labels[id]||id;
}
function syncLuckyHud(){const pct=luckyDisplayedJackpotPct(),a=$('luckyJackpotPct'),b=$('luckyModalPct');if(a)a.textContent=pct+'%';if(b)b.textContent=pct+'%'}
function renderLuckyChoices(ids,onChoose){
 const box=$('luckyRewardChoices');box.innerHTML='';
 ids.forEach(id=>{const b=document.createElement('button');b.textContent=luckyRewardLabel(id);b.onclick=()=>onChoose(id);box.appendChild(b)});
}
function showLuckyCelebration(title){$('luckyResultTitle').textContent=title;const fw=$('luckyFireworks');fw.classList.remove('on');void fw.offsetWidth;fw.classList.add('on')}
function openLuckyModal(){
 if(gameMode!=='TD'||rpgPending||midbossRewardPending||luckySpinPhase!=='IDLE')return;
 running=false;luckyOverlayOpen=true;luckySpinPhase='OPEN';syncLuckyHud();
 $('luckyModal').classList.add('on');$('luckyModal').setAttribute('aria-hidden','false');
 $('luckyResultTitle').textContent='LUCKY ROULETTE';$('luckyResultSub').innerHTML='JACKPOT <b id="luckyModalPct">'+luckyDisplayedJackpotPct()+'%</b>';
 $('luckyRewardChoices').innerHTML='';$('luckySpinButton').style.display='inline-block';
}
function closeLuckyOverlay(){
 luckyOverlayOpen=false;luckySpinPhase='IDLE';
 const modal=$('luckyModal');if(modal){modal.classList.remove('on');modal.setAttribute('aria-hidden','true')}
 if(gameMode==='TD'&&!rpgPending&&!midbossRewardPending)running=!manualPaused;
 syncLuckyHud();
}
function summonedHeroIds(){return new Set([...units.values()].filter(u=>u.heroId).map(u=>u.heroId))}
function eligibleOwnedHeroes(rarity){
 const summoned=summonedHeroIds();
 return playerProfile.ownedHeroes.filter(id=>HERO_RARITY_REGISTRY[id]===rarity&&!summoned.has(id));
}
function findFreeHeroTiles(){
 return cells.filter(c=>c&&(c.code==='D'||c.code==='C')&&!units.has(tileKey(c.x,c.y)));
}
function freeSummonHeroById(heroId){
 if(heroCount>=5)return false;
 const tile=findFreeHeroTiles()[0];if(!tile)return false;
 const recipe=HERO_RECIPES.find(r=>r.id===heroId);if(!recipe)return false;
 const hero={id:'hfree'+Date.now()+Math.random(),heroId:heroId,x:tile.x,y:tile.y,type:'hero_aria',hero:recipe.name,atk:recipe.atk,range:recipe.range,rate:recipe.rate,lastShot:0,lastSkill1:simTime,lastSkill2:simTime,lastSkill3:simTime,ariaOathUntil:0,spent:0,moveCooldownUntil:simTime+5};
 units.set(tileKey(tile.x,tile.y),hero);tile.el.classList.add('occupied');heroCount++;postUnitChange();return true;
}
function luckyFreeSummon(rarity,count,source='LUCKY_FREE_SUMMON'){
 const open=Math.max(0,5-heroCount),eligible=eligibleOwnedHeroes(rarity),wanted=Math.min(count,open,eligible.length);
 if(wanted<=0){showLuckyCelebration('💥 펑!');$('luckyResultSub').textContent='소환 가능한 '+(rarity==='MYTHIC'?'신화':'전설')+' 영웅이 없습니다';setTimeout(closeLuckyOverlay,1100);return {summoned:[],burst:true}}
 const pool=[...eligible],picked=[];while(picked.length<wanted){const i=Math.floor(Math.random()*pool.length);picked.push(pool.splice(i,1)[0])}
 const summoned=picked.filter(freeSummonHeroById);
 if(!summoned.length){showLuckyCelebration('💥 펑!');$('luckyResultSub').textContent='소환 가능한 영웅 배치 공간이 없습니다';setTimeout(closeLuckyOverlay,1100);return {summoned:[],burst:true}}
 priorityCRecordHeroAcquisition(source,summoned);
 showLuckyCelebration('무료 소환 성공!!');$('luckyResultSub').textContent=summoned.map(id=>(HERO_RECIPES.find(r=>r.id===id)||{name:id}).name).join(' · ');setTimeout(closeLuckyOverlay,1100);return {summoned,burst:false};
}
function applyLuckyRewardChoice(id){
 if(luckySpinPhase!=='REWARD')return false;
 if(id==='MYTHIC_OWNED_RANDOM_1'){luckyFreeSummon('MYTHIC',1,'LUCKY_REWARD_MYTHIC_OWNED_RANDOM_1');return true}
 if(id==='LEGENDARY_OWNED_RANDOM_2'){luckyFreeSummon('LEGENDARY',2,'LUCKY_REWARD_LEGENDARY_OWNED_RANDOM_2');return true}
 if(id==='LEGENDARY_OWNED_RANDOM_1'||id==='MID_LEGENDARY_1'){luckyFreeSummon('LEGENDARY',1,'LUCKY_REWARD_LEGENDARY_OWNED_RANDOM_1');return true}
 applyLuckySimpleReward(id);showLuckyCelebration('보상 획득!!');setTimeout(closeLuckyOverlay,850);return true;
}
function runLuckySpinPresentation(){
 const result=luckySpin();
 if(!result)return;
 syncLuckyHud();$('luckySpinButton').style.display='none';const wheel=$('luckyWheel');wheel.classList.add('spinning');
 setTimeout(()=>{wheel.classList.remove('spinning');$('luckyResultTitle').textContent=result.tier==='MISS'?'꽝':result.tier+' 성공!!';
  $('luckyResultSub').textContent=result.tier==='MISS'?'다음 웨이브에서 행운을 모아보세요':'보상을 하나 선택하세요';
  if(result.tier==='MISS'){setTimeout(closeLuckyOverlay,900);return}
  luckySpinPhase='REWARD';showLuckyCelebration(result.tier+' 성공!!');renderLuckyChoices(result.rewards,applyLuckyRewardChoice);
 },1900);
}
function showMidbossRewardModal(){
 running=false;midbossRewardPending=true;luckyOverlayOpen=true;luckySpinPhase='REWARD';
 $('luckyModal').classList.add('on');$('luckyModal').setAttribute('aria-hidden','false');$('luckySpinButton').style.display='none';
 $('luckyResultTitle').textContent='MID BOSS CLEAR';$('luckyResultSub').textContent='보상 1개를 선택하세요';
 renderLuckyChoices(['MID_GOLD_1000','MID_LEGENDARY_1','MID_JACKPOT_20'],id=>{
  if(id==='MID_LEGENDARY_1'){midbossRewardPending=false;luckyFreeSummon('LEGENDARY',1,'MID_BOSS_REWARD');return}
  chooseMidbossReward(id);showLuckyCelebration('중간보스 보상 획득!!');
 });
}
function applyLuckySimpleReward(id){
 if(id==='GOLD_2000')addGold(2000,'LUCKY_GOLD_2000');else if(id==='GOLD_1000'||id==='MID_GOLD_1000')addGold(1000,id);else if(id==='GOLD_500')addGold(500,'LUCKY_GOLD_500');
 else if(id==='STAGE_BUFF_30')addLuckyStageBuff(30);else if(id==='STAGE_BUFF_20')addLuckyStageBuff(20);else if(id==='STAGE_BUFF_10')addLuckyStageBuff(10);
 else if(id==='MID_JACKPOT_20')addLuckyMidbossBonus();
 syncHUD();
}
function openMidbossReward(){showMidbossRewardModal();return ['MID_GOLD_1000','MID_LEGENDARY_1','MID_JACKPOT_20']}
function chooseMidbossReward(id){if(!midbossRewardPending)return false;applyLuckySimpleReward(id);midbossRewardPending=false;closeLuckyOverlay();return true}

const $=id=>document.getElementById(id);
const grid=$('grid'), unitLayer=$('unitLayer'), enemyLayer=$('enemyLayer'), bottom=$('bottomUI'), actions=$('actions'), title=$('contextTitle');
const rpgScreen=$('rpgScreen'),rpgHeroRow=$('rpgHeroRow'),rpgTransition=$('rpgTransition'),rpgTransitionMessage=$('rpgTransitionMessage');
const uiV1Flow=$('uiV1Flow'),heroStrip=$('heroStrip'),heroBrowser=$('heroBrowser'),heroBrowserList=$('heroBrowserList'),resultScreen=$('resultScreen');

const flowScrollPositions=new Map();
function showFlowScreen(name){
 if(!uiV1Flow)return;
 const current=uiV1Flow.querySelector('[data-flow-screen].active');
 if(current)flowScrollPositions.set(current.dataset.flowScreen,uiV1Flow.scrollTop);
 uiV1Flow.classList.remove('off');
 uiV1Flow.querySelectorAll('[data-flow-screen]').forEach(s=>s.classList.toggle('active',s.dataset.flowScreen===name));
 requestAnimationFrame(()=>{uiV1Flow.scrollTop=flowScrollPositions.get(name)||0});
}
document.querySelectorAll('[data-flow-go]').forEach(b=>b.onclick=()=>showFlowScreen(b.dataset.flowGo));
if($('openTestProfile'))$('openTestProfile').onclick=()=>{uiV1Flow.classList.add('off');$('prototypeLobby').classList.remove('off')};
if($('closeTestProfile'))$('closeTestProfile').onclick=()=>{$('prototypeLobby').classList.add('off');showFlowScreen('lobby')};

function heroRecipeProgress(recipe){
 const needs=(recipe.materials||[]).reduce((a,m)=>a+m.count,0);
 if(!needs)return {have:0,need:0,text:'DATA_PENDING'};
 let have=0;
 for(const req of recipe.materials||[]){
  const n=[...units.values()].filter(u=>u.type===req.type).length;
  have+=Math.min(req.count,n);
 }
 return {have,need:needs,text:have+'/'+needs};
}
function renderHeroStrip(){
 if(!heroStrip)return;
 const active=[...units.values()].filter(u=>u.heroId).slice(0,5);
 heroStrip.innerHTML='';
 for(let i=0;i<5;i++){
  const slot=document.createElement('div');
  const h=active[i];
  slot.className='heroSlot '+(h?'filled':'empty');
  if(h){
   const recipe=HERO_RECIPES.find(r=>r.id===h.heroId)||{name:h.heroId};const rarity=HERO_RARITY_REGISTRY[h.heroId]||'HERO';
   slot.setAttribute('aria-label',recipe.name+' · '+rarity);slot.title=recipe.name+' · '+rarity;
   slot.innerHTML='<span class="heroPortrait">'+recipe.name.slice(0,1)+'</span><b class="heroRarityDot"></b>';
  }else{slot.setAttribute('aria-label','빈 영웅 슬롯');slot.innerHTML='<span class="heroPortrait emptyPortrait">＋</span>'}
  heroStrip.appendChild(slot);
 }
 if($('heroCountHud'))$('heroCountHud').textContent=active.length;
}
function renderHeroBrowser(){
 if(!heroBrowserList)return;
 heroBrowserList.innerHTML='';
 const summoned=summonedHeroIds();
 const roster=(playerProfile.ownedHeroes&&playerProfile.ownedHeroes.length?playerProfile.ownedHeroes:ALL_HERO_IDS);
 roster.forEach(id=>{
  const r=HERO_RECIPES.find(x=>x.id===id);if(!r)return;
  const p=heroRecipeProgress(r),complete=r.recipeRuntimeComplete===true,craftable=complete&&!summoned.has(id)&&p.need>0&&p.have>=p.need&&heroCount<5;
  const card=document.createElement('div');
  card.className='heroRecipeCard '+(craftable?'craftable ':'')+(!complete?'locked':'');
  const rarity=HERO_RARITY_REGISTRY[id]||r.rarity||'HERO';
  const state=summoned.has(id)?'ACTIVE':heroCount>=5?'CAP 5/5':!complete?'DATA_PENDING':craftable?'CRAFTABLE':'재료 진행 '+p.text;
  card.innerHTML='<div class="line"><strong>'+r.name+'</strong><span>'+rarity+'</span></div><small>'+state+' · '+((r.recipeNames||[]).join(' + ')||'레시피 데이터 대기')+'</small>';
  heroBrowserList.appendChild(card);
 });
}
function syncUiV1(){
 renderHeroStrip();renderHeroBrowser();
 if($('hudWarningLane'))$('hudWarningLane').textContent=gameMode==='TD'?'WAVE '+wave+' · 전선 진행':'RPG · '+(rpgState&&rpgState.boss?'PHASE '+rpgState.boss.phase:'전투 준비');
}
if($('heroBrowserButton'))$('heroBrowserButton').onclick=()=>{renderHeroBrowser();heroBrowser.classList.add('on');heroBrowser.setAttribute('aria-hidden','false')};
if($('heroBrowserClose'))$('heroBrowserClose').onclick=()=>{heroBrowser.classList.remove('on');heroBrowser.setAttribute('aria-hidden','true')};

function showResultScreen(kind,reason){
 if(!resultScreen)return;
 resultScreen.classList.add('on');resultScreen.setAttribute('aria-hidden','false');
 $('resultEyebrow').textContent=kind==='CLEAR'?'STAGE RESULT':'BATTLE RESULT';
 $('resultTitle').textContent=kind==='CLEAR'?'STAGE CLEAR':'DEFEAT';
 $('resultReason').textContent=reason||'';
 $('resultMeta').innerHTML=kind==='CLEAR'
  ?'<div><strong>STAGE 1</strong><span>완료</span></div><div><strong>별 조건</strong><span>DATA_PENDING</span></div><div><strong>보상</strong><span>DATA_PENDING</span></div>'
  :'<div><strong>패배 사유</strong><span>'+reason+'</span></div><div><strong>재도전</strong><span>가능</span></div><div><strong>복귀</strong><span>로컬 전선 유지</span></div>';
 $('resultNext').style.display=kind==='CLEAR'?'inline-block':'none';
}
function hideResultScreen(){if(resultScreen){resultScreen.classList.remove('on');resultScreen.setAttribute('aria-hidden','true')}}
function resetBattleRuntimeForUi(){
 priorityCTestProfile='CANDIDATE_B';
 running=false;manualPaused=false;speed=1;gameMode='TD';rpgPending=false;rpgTransitioning=false;rpgAutoBattle=false;rpgState=null;rpgDiagnostic=null;rpgSimTime=0;resetBattleCamera();
 gold=500;wave=1;gHp=100;oHp=120;simTime=0;spawnClock=0;waveClock=0;nextEnemyId=1;selected=null;heroCount=0;waveSpawned=0;specialSpawned=false;waveEnding=false;
 priorityCResetTelemetry();
 moveModeUnitId=null;comboPlacement=null;luckyNaturalPct=0;luckyBonusPct=0;luckyStageBuffPct=0;luckyOverlayOpen=false;midbossRewardPending=false;luckySpinPhase='IDLE';
 units.clear();enemies.length=0;
 if(enemyLayer)enemyLayer.innerHTML='';if(unitLayer)unitLayer.innerHTML='';if($('fxLayer'))$('fxLayer').innerHTML='';
 if(rpgScreen){rpgScreen.className='';rpgScreen.setAttribute('aria-hidden','true')} if($('topHUD'))$('topHUD').style.display=''
 $('battlefield').style.display='';
 document.querySelectorAll('.tdHud').forEach(e=>e.style.display='');
 document.querySelectorAll('.rpgOnlyControl').forEach(e=>e.style.display='none');
 if($('autoBattle')){$('autoBattle').textContent='AUTO OFF';$('autoBattle').classList.remove('on')}
 if($('speed'))$('speed').textContent='×1';
 hideResultScreen();syncPauseButton();
}
function returnToStageSelect(){
 resetBattleRuntimeForUi();$('app').classList.add('prototypeBattleHidden');showFlowScreen('stage');
}
if($('resultStageSelect'))$('resultStageSelect').onclick=returnToStageSelect;
if($('resultRetry'))$('resultRetry').onclick=()=>{const p={...playerProfile,selectedMap:{...activeMapSelection}};resetBattleRuntimeForUi();startPrototypeBattle(p)};
if($('resultNext'))$('resultNext').onclick=returnToStageSelect;
let uiV1BattleStartInFlight=false;
function uiV1BattleProfile(){return {type:'UI_V1',ownedHeroes:[...ALL_HERO_IDS],heroLevel:30,selectedMap:{worldId:'WORLD_01',localMapId:'LOCAL_WEST',mode:'NORMAL',stageId:'NORMAL_01'},infiniteGold:false}}
async function activateUiV1BattleStart(){
 if(uiV1BattleStartInFlight)return false;
 const b=$('uiV1StartBattle');uiV1BattleStartInFlight=true;
 if(b){b.setAttribute('aria-busy','true');b.textContent='전투 로딩...'}
 try{await startPrototypeBattle(uiV1BattleProfile());return true}
 catch(err){console.error('UI_V1_BATTLE_START_FAILED',err);const code=String(err&&err.message||err||'UNKNOWN').split(/\s+/)[0];if(b){b.textContent='전투 시작 실패 · '+code}return false}
 finally{uiV1BattleStartInFlight=false;if(b){b.removeAttribute('aria-busy');if(!uiV1Flow.classList.contains('off'))setTimeout(()=>{if(!uiV1Flow.classList.contains('off'))b.textContent='전투 시작'},900)}}
}
function bindUiV1BattleStartInput(){
 const b=$('uiV1StartBattle');if(!b)return;
 let sx=0,sy=0,started=false,lastTouchActivation=0;
 b.addEventListener('click',()=>{if(performance.now()-lastTouchActivation<700)return;activateUiV1BattleStart()});
 b.addEventListener('touchstart',e=>{const t=e.touches&&e.touches[0];if(!t||e.touches.length!==1){started=false;return}sx=t.clientX;sy=t.clientY;started=true},{passive:true});
 b.addEventListener('touchcancel',()=>{started=false},{passive:true});
 b.addEventListener('touchend',e=>{
  if(!started)return;started=false;const t=e.changedTouches&&e.changedTouches[0];if(!t)return;
  const moved=Math.hypot(t.clientX-sx,t.clientY-sy);if(moved>14)return;
  e.preventDefault();lastTouchActivation=performance.now();activateUiV1BattleStart();
 },{passive:false});
}
bindUiV1BattleStartInput();
function tileKey(x,y){return x+','+y}
function cellIndex(x,y){return (y-1)*COLS+(x-1)}
function codeFor(x,y){return TILE_ROWS[y-1][x-1]}
function posPct(x,y){return {left:((x-.5)/COLS*100)+'%',top:((y-.5)/ROWS*100)+'%'}}

const CAMERA_MIN=1,CAMERA_MAX=1.8,CAMERA_STEP=.15;
let cameraScale=1,cameraPanX=0,cameraPanY=0,cameraSuppressClickUntil=0;
const cameraPointers=new Map();
let cameraGesture=null,cameraPinch=null;
function clampCameraPan(){
 const frame=$('mapFrame');if(!frame||!grid)return;
 const baseW=grid.offsetWidth,baseH=grid.offsetHeight,fw=frame.clientWidth,fh=frame.clientHeight;
 const maxX=Math.max(0,(baseW*cameraScale-fw)/2),maxY=Math.max(0,(baseH*cameraScale-fh)/2);
 cameraPanX=Math.max(-maxX,Math.min(maxX,cameraPanX));cameraPanY=Math.max(-maxY,Math.min(maxY,cameraPanY));
}
function syncCameraControls(){
 if($('cameraReset'))$('cameraReset').textContent=cameraScale.toFixed(cameraScale===1?0:1)+'×';
 if($('cameraZoomOut'))$('cameraZoomOut').disabled=cameraScale<=CAMERA_MIN+.001;
 if($('cameraZoomIn'))$('cameraZoomIn').disabled=cameraScale>=CAMERA_MAX-.001;
}
function applyBattleCamera(){
 clampCameraPan();grid.style.transform='translate3d('+cameraPanX.toFixed(1)+'px,'+cameraPanY.toFixed(1)+'px,0) scale('+cameraScale.toFixed(3)+')';syncCameraControls();
}
function setBattleCameraScale(next){
 cameraScale=Math.max(CAMERA_MIN,Math.min(CAMERA_MAX,next));applyBattleCamera();return cameraScale;
}
function panBattleCamera(dx,dy){cameraPanX+=dx;cameraPanY+=dy;applyBattleCamera();return {x:cameraPanX,y:cameraPanY}}
function resetBattleCamera(){cameraScale=1;cameraPanX=0;cameraPanY=0;cameraPointers.clear();cameraGesture=null;cameraPinch=null;if(grid)grid.style.transform='';syncCameraControls()}
function cameraDistance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function beginCameraPointer(e){
 if(gameMode!=='TD'||rpgPending)return;
 cameraPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(cameraPointers.size===1)cameraGesture={pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,panX:cameraPanX,panY:cameraPanY,moved:false};
 if(cameraPointers.size===2){const pts=[...cameraPointers.values()];cameraPinch={distance:Math.max(1,cameraDistance(pts[0],pts[1])),scale:cameraScale};cameraGesture=null}
}
function moveCameraPointer(e){
 if(!cameraPointers.has(e.pointerId)||gameMode!=='TD')return;
 cameraPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(cameraPointers.size>=2){
  const pts=[...cameraPointers.values()];if(!cameraPinch)cameraPinch={distance:Math.max(1,cameraDistance(pts[0],pts[1])),scale:cameraScale};
  const ratio=cameraDistance(pts[0],pts[1])/cameraPinch.distance;setBattleCameraScale(cameraPinch.scale*ratio);cameraSuppressClickUntil=performance.now()+500;e.preventDefault();return;
 }
 if(cameraGesture&&cameraGesture.pointerId===e.pointerId){
  const dx=e.clientX-cameraGesture.startX,dy=e.clientY-cameraGesture.startY;
  if(!cameraGesture.moved&&Math.hypot(dx,dy)>8)cameraGesture.moved=true;
  if(cameraGesture.moved){cameraPanX=cameraGesture.panX+dx;cameraPanY=cameraGesture.panY+dy;applyBattleCamera();cameraSuppressClickUntil=performance.now()+500;e.preventDefault()}
 }
}
function endCameraPointer(e){
 cameraPointers.delete(e.pointerId);
 if(cameraPointers.size===1){const [id,p]=cameraPointers.entries().next().value;cameraGesture={pointerId:id,startX:p.x,startY:p.y,panX:cameraPanX,panY:cameraPanY,moved:false};cameraPinch=null}
 else if(cameraPointers.size===0){cameraGesture=null;cameraPinch=null}
}
function bindBattleCamera(){
 const frame=$('mapFrame');if(!frame)return;
 frame.addEventListener('pointerdown',beginCameraPointer,{passive:true});
 frame.addEventListener('pointermove',moveCameraPointer,{passive:false});
 frame.addEventListener('pointerup',endCameraPointer,{passive:true});
 frame.addEventListener('pointercancel',endCameraPointer,{passive:true});
 frame.addEventListener('wheel',e=>{if(gameMode!=='TD'||!(e.ctrlKey||e.metaKey))return;e.preventDefault();setBattleCameraScale(cameraScale+(e.deltaY<0?CAMERA_STEP:-CAMERA_STEP))},{passive:false});
 if($('cameraZoomOut'))$('cameraZoomOut').onclick=e=>{e.stopPropagation();setBattleCameraScale(cameraScale-CAMERA_STEP)};
 if($('cameraZoomIn'))$('cameraZoomIn').onclick=e=>{e.stopPropagation();setBattleCameraScale(cameraScale+CAMERA_STEP)};
 if($('cameraReset'))$('cameraReset').onclick=e=>{e.stopPropagation();resetBattleCamera()};
 window.addEventListener('resize',()=>applyBattleCamera());syncCameraControls();
}
bindBattleCamera();

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
 if(cells.length!==CELL_COUNT)throw new Error(COLS+'x'+ROWS+' grid build failed');
}

function clearSelection(hide=true){
 document.querySelectorAll('.cell.selected').forEach(e=>e.classList.remove('selected'));
 document.querySelectorAll('.unitToken.selectedUnit').forEach(e=>e.classList.remove('selectedUnit'));
 selected=null;
 if(hide){bottom.classList.remove('on');$('app').classList.remove('contextPanelOpen')}
}
function onCellTap(x,y){
 if(gameMode!=='TD'||rpgPending||performance.now()<cameraSuppressClickUntil)return;
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
 const token=unitLayer.querySelector('[data-unit-id="'+u.id+'"]');if(token)token.classList.add('selectedUnit');
 const combo=comboForUnit(u);if(combo)renderBottomForCombo(u,combo);else renderBottomForUnit(u);
}
function showBottom(text){title.textContent=text;actions.innerHTML='';bottom.classList.add('on');$('app').classList.add('contextPanelOpen')}
function actionButton(name,desc,fn,hero=false,disabled=false){
 const b=document.createElement('button');b.className='action'+(hero?' heroAction':'');b.innerHTML='<b>'+name+'</b><small>'+desc+'</small>';
 b.disabled=disabled;if(arguments[5]){b.setAttribute('aria-disabled','true');b.style.opacity='.48';b.style.filter='grayscale(.75)';}b.onclick=fn;actions.appendChild(b);
}

function unitFeatureText(t){
 return t.cost+'G · ATK '+t.atk+' · '+t.damageType+' · '+(t.air?'공중 대응':'지상 전용');
}
function renderBottomForEmpty(x,y){
 showBottom('빈 배치칸 · 기본 아군 배치');
 stageBaseUnitIds().map(id=>UNIT_DEFS[id]).forEach(t=>actionButton(t.name,unitFeatureText(t),()=>placeUnit(x,y,t),false,!playerProfile.infiniteGold&&gold<t.cost));
}
function moveCooldownRemaining(u){return Math.max(0,(u.moveCooldownUntil||0)-simTime)}
function renderMoveAction(u){
 const remain=moveCooldownRemaining(u);
 actionButton('이동',remain>0?'재이동 대기 '+remain.toFixed(1)+'초':'빈 자리 이동 / 점유 자리와 교대',()=>beginMove(u),false,remain>0);
}
function renderBottomForUnit(u){
 if(u.heroId){
  const recipe=HERO_RECIPES.find(r=>r.id===u.heroId)||{name:u.heroId};
  const rarity=HERO_RARITY_REGISTRY[u.heroId]||'HERO';
  showBottom(rarity+' 영웅 · '+recipe.name);
  renderMoveAction(u);
  if(rarity==='MYTHIC')actionButton('신화 영웅','판매할 수 없습니다',()=>{},false,true);
  else actionButton('영웅 판매','활성 영웅 슬롯 1칸 반환',()=>sellHeroUnit(u));
  return;
 }
 const t=UNIT_DEFS[u.type];showBottom(t.name+' · T'+t.tier);
 if(t.next.length){
  t.next.map(id=>UNIT_DEFS[id]).forEach(n=>actionButton('업그레이드 → '+n.name,unitFeatureText(n),()=>upgradeUnit(u,n),false,!playerProfile.infiniteGold&&gold<n.cost));
 }else{
  actionButton('최종 전문화','이 유닛은 현재 최종 단계',()=>{},false,true);
 }
 renderMoveAction(u);
 actionButton('판매','구매/업그레이드 누적비용의 일부 회수',()=>sellUnit(u));
}
function renderBottomForCombo(u,recipe){
 const t=UNIT_DEFS[u.type];showBottom(t.name+' · 전설 조합 가능');
 const full=heroCount>=5;actionButton('★ '+recipe.name+' 조합',full?'영웅 제한 5/5 · 누르면 안내 표시':'재료 자리 중 영웅 배치 위치를 직접 선택',()=>{if(full){toast('영웅 제한 초과');return}beginHeroSummon(u,recipe)},true,false,full);
 actionButton('유닛 정보',t.name+' · KNIGHT T3',()=>{},false,true);
 actionButton('판매','현재 유닛 판매',()=>sellUnit(u));
}
function placeUnit(x,y,t){
 if(gameMode!=='TD'||rpgPending)return;
 if(units.has(tileKey(x,y))||!spendGold(t.cost))return;
 units.set(tileKey(x,y),{id:'u'+Date.now()+Math.random(),x,y,type:t.id,lastShot:0,spent:t.cost,moveCooldownUntil:0});
 priorityCRecordSpend(t.cost,'BUILD');
 cells[cellIndex(x,y)].el.classList.add('occupied');postUnitChange();toast(t.name+' 배치');
}
function upgradeUnit(u,next){
 if(gameMode!=='TD'||rpgPending)return;
 const cur=UNIT_DEFS[u.type];
 if(!cur||!cur.next.includes(next.id)){toast('같은 계열 업그레이드만 가능합니다');return}
 if(!spendGold(next.cost))return;
 priorityCRecordSpend(next.cost,'UPGRADE');
 u.type=next.id;u.spent=(u.spent||0)+next.cost;postUnitChange();toast(next.name+' 업그레이드');
}
function sellHeroUnit(u){
 if(gameMode!=='TD'||rpgPending||!u.heroId)return;
 const rarity=HERO_RARITY_REGISTRY[u.heroId]||'HERO';
 if(rarity==='MYTHIC'){toast('신화 영웅은 판매할 수 없습니다');return}
 units.delete(tileKey(u.x,u.y));cells[cellIndex(u.x,u.y)].el.classList.remove('occupied');
 heroCount=Math.max(0,heroCount-1);postUnitChange();toast('영웅 슬롯 반환 · '+heroCount+'/5');
}
function sellUnit(u){
 if(gameMode!=='TD'||rpgPending)return;
 if(u.heroId){sellHeroUnit(u);return}
 addGold(Math.max(1,Math.round((u.spent||UNIT_DEFS[u.type].cost)*.35)),'UNIT_SELL');
 units.delete(tileKey(u.x,u.y));cells[cellIndex(u.x,u.y)].el.classList.remove('occupied');postUnitChange();toast('판매 완료');
}
function postUnitChange(){renderUnits();syncHUD();updateComboHighlights();syncUiV1();clearSelection(true)}

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
 const summoned=summonedHeroIds();
 for(const r of HERO_RECIPES){if(r.recipeRuntimeComplete!==true||summoned.has(r.id))continue;const mats=recipeMaterials(r);if(mats&&mats.some(m=>m.id===u.id))return r}
 return null;
}
function updateComboHighlights(){
 document.querySelectorAll('.cell.combo').forEach(e=>e.classList.remove('combo'));
 const summoned=summonedHeroIds();HERO_RECIPES.forEach(r=>{if(r.recipeRuntimeComplete!==true||summoned.has(r.id))return;const mats=recipeMaterials(r);if(mats)mats.forEach(m=>cells[cellIndex(m.x,m.y)].el.classList.add('combo'))});
}
function beginHeroSummon(selectedMaterial,recipe){
 if(summonedHeroIds().has(recipe.id)){toast(recipe.name+'은 이미 소환되었습니다');return}
 if(gameMode!=='TD'||rpgPending)return;
 if(recipe.recipeRuntimeComplete!==true){toast('아직 조합할 수 없는 영웅입니다');return}
 if(heroCount>=5){toast('영웅 제한 초과');return}
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
 if(heroCount>=5){cancelHeroPlacement('영웅 제한 초과');running=wasRunning&&!manualPaused&&!rpgPending;return}
 mats.forEach(m=>{units.delete(tileKey(m.x,m.y));cells[cellIndex(m.x,m.y)].el.classList.remove('occupied')});
 const hero={id:'h'+Date.now(),heroId:recipe.id,x,y,type:'hero_aria',hero:recipe.name,atk:recipe.atk,range:recipe.range,rate:recipe.rate,lastShot:0,lastSkill1:simTime,lastSkill2:simTime,lastSkill3:simTime,ariaOathUntil:0,spent:0,moveCooldownUntil:simTime+5};
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
  const hero=!!u.heroId;const t=hero?{short:(u.hero||u.heroId||'영').slice(0,1)}:UNIT_DEFS[u.type];
  const isSelected=selected&&selected.type==='unit'&&selected.id===u.id;
  const d=document.createElement('div');d.className='unitToken '+(hero?'hero':t.tier===3?'tier3':t.tier===2?'tier2':'basic')+(isSelected?' selectedUnit':'');d.dataset.unitId=u.id;
  const p=posPct(u.x,u.y);d.style.left=p.left;d.style.top=p.top;d.textContent=t.short;unitLayer.appendChild(d);
 }
}

function rawNormalCountForWave(w){return 10+w*2}
function rawNormalHpForWave(w){return 48+w*12}
function baselineNormalCountForWave(w){return rawNormalCountForWave(w)*2}
function baselineNormalHpForWave(w){return Math.round(rawNormalHpForWave(w)*1.2)}
function normalCountForWave(w){const p=priorityCBalanceProfile();return p?Math.round(rawNormalCountForWave(w)*p.rawEnemyCountX):baselineNormalCountForWave(w)}
function normalHpForWave(w){const p=priorityCBalanceProfile();return p?Math.round(rawNormalHpForWave(w)*p.rawEnemyHpX):baselineNormalHpForWave(w)}
function waveSpawnInterval(){
 const count=normalCountForWave(wave),floor=priorityCBalanceProfile()?.08:.34;return Math.max(floor,(WAVE_DURATION-3)/Math.max(1,count));
}
function spawnEnemy(kind='normal'){
 const p=priorityCBalanceProfile();let hp,speedMult=1,label='E';
 if(kind==='midboss'){hp=Math.round(normalHpForWave(wave)*(p?p.w5HpX:5.5));speedMult=.72;label='M'}
 else if(kind==='boss'){hp=Math.round(normalHpForWave(wave)*(p?p.w10HpX:9));speedMult=.62;label='B'}
 else hp=normalHpForWave(wave);
 const e={id:nextEnemyId++,kind,label,pathPos:0,hp,maxHp:hp,speed:(.62+wave*.015)*speedMult,lastStructureHit:0,effects:[],rewarded:false,hitFxType:null,hitFxUntil:0,footprintCells:kind==='boss'?1.6:kind==='midboss'?1.3:1.0};
 enemies.push(e);priorityCRecordSpawn(e);
}
function showWarning(text,sub='',hold=1400){
 const box=$('bossWarning');$('bossWarningTitle').textContent=text;$('bossWarningSub').textContent=sub;box.classList.add('on');
 const lane=$('hudWarningLane');if(lane)lane.textContent=(text+' · '+sub).replace(/\s+·\s*$/,'');
 clearTimeout(showWarning.t);showWarning.t=setTimeout(()=>{box.classList.remove('on');if(lane)lane.textContent=gameMode==='TD'?'WAVE '+wave+' · 전선 진행':'RPG · 전투 진행'},hold);
}function startWaveNotice(){
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
 e.rewarded=true;priorityCRecordEnemyDeath(e);
 const p=priorityCBalanceProfile(),normalReward=p?p.goldPerKill:12,reward=e.kind==='boss'?180:e.kind==='midboss'?0:normalReward;
 addGold(reward,e.kind==='boss'?'TD_BOSS_KILL':e.kind==='midboss'?'MIDBOSS_KILL':'NORMAL_KILL');
 if(e.kind==='boss'){enterRpgPlaceholder(e);return true}
 if(e.kind==='midboss'){openMidbossReward();toast('중간보스 격파 · 보상 1개 선택');}else toast('+'+normalReward+'G');
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
   if(oHp<=0){priorityCEnsureTelemetry().finished_reason='TD_DEFEAT_GATE';priorityCEnsureTelemetry().gate_hp=0;running=false;showWarning('DEFEAT','GATE CORE DESTROYED',1200);setTimeout(()=>showResultScreen('DEFEAT','GATE CORE DESTROYED'),900);return}
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
 if(!u.heroId)return false;
 const d=TD_HERO_SKILL_DEFS[u.heroId];
 if(!d)return false;
 if(heroSkillUnlocked(3)&&now-(u.lastSkill3||0)>=d.skill3.cooldown){if(castAriaSkill3(u,now))return true}
 if(heroSkillUnlocked(2)&&now-(u.lastSkill2||0)>=d.skill2.cooldown){if(castAriaSkill2(u,now))return true}
 if(heroSkillUnlocked(1)&&now-(u.lastSkill1||0)>=d.skill1.cooldown){if(castAriaSkill1(u,now))return true}
 return false;
}
const RPG_HERO_DEFS={
 ARIA:{name:'아리아',hp:2600,atk:175,def:125,basicGap:1/1.0,skill1Gap:8,skill2Gap:18,s1:1.6,s2:.4,ult:4.0,skill1Name:'성광 참격',skill2Name:'수호의 맹세',ultimateName:'최후의 성역'},
 YUNA:{name:'유나',hp:2250,atk:150,def:105,basicGap:1/.9,skill1Gap:9,skill2Gap:16,s1:1.2,s2:.25,ult:2.8,skill1Name:'봉인의 부적',skill2Name:'결계진',ultimateName:'대봉인술'},
 RIEL:{name:'리엘',hp:2100,atk:205,def:90,basicGap:1/.95,skill1Gap:8,skill2Gap:14,s1:1.75,s2:1.1,ult:4.6,skill1Name:'화염창',skill2Name:'용암지대',ultimateName:'홍련지옥'},
 RUBY:{name:'루비',hp:2200,atk:190,def:95,basicGap:1/1.05,skill1Gap:8,skill2Gap:12,s1:1.55,s2:.9,ult:4.3,skill1Name:'현상표식',skill2Name:'도탄사격',ultimateName:'DEAD OR ALIVE'},
 ERIKA:{name:'에리카',hp:2850,atk:195,def:115,basicGap:1/1.0,skill1Gap:8,skill2Gap:16,s1:1.65,s2:.5,ult:4.2,skill1Name:'용혈참',skill2Name:'혈룡폭주',ultimateName:'용의 숨결'},
 SERA:{name:'세라',hp:2350,atk:120,def:110,basicGap:1/.85,skill1Gap:10,skill2Gap:18,s1:.8,s2:.2,ult:2.2,skill1Name:'천상의 노래',skill2Name:'치유의 광휘',ultimateName:'세라핌 앙코르'},
 REINA:{name:'레이나',hp:2150,atk:185,def:100,basicGap:1/.9,skill1Gap:9,skill2Gap:15,s1:1.3,s2:.35,ult:3.2,skill1Name:'서리창',skill2Name:'빙결감옥',ultimateName:'절대영도'},
 KARIN:{name:'카린',hp:2050,atk:220,def:85,basicGap:1/1.2,skill1Gap:7,skill2Gap:11,s1:1.7,s2:.9,ult:4.8,skill1Name:'그림자 베기',skill2Name:'잔영난무',ultimateName:'홍련 처형'},
 BELL:{name:'벨',hp:3200,atk:235,def:135,basicGap:1/1.0,skill1Gap:8,skill2Gap:14,s1:1.35,s2:.5,ult:3.6,skill1Name:'저주인형',skill2Name:'마리오네트',ultimateName:'대인형극'},
 MIA:{name:'미아',hp:2950,atk:260,def:120,basicGap:1/1.05,skill1Gap:7,skill2Gap:13,s1:1.45,s2:.6,ult:4.0,skill1Name:'보물탄',skill2Name:'행운의 함정',ultimateName:'왕의 보물고'},
 IRENE:{name:'아이린',hp:3400,atk:240,def:150,basicGap:1/1.0,skill1Gap:8,skill2Gap:15,s1:1.5,s2:.5,ult:4.1,skill1Name:'클린 스위프',skill2Name:'전술 봉사',ultimateName:'퍼펙트 클리닝'},
 NEON:{name:'네온',hp:2850,atk:255,def:110,basicGap:1/1.05,skill1Gap:7,skill2Gap:12,s1:1.4,s2:.75,ult:4.2,skill1Name:'형상복제',skill2Name:'프리즘 왜곡',ultimateName:'무한 프리즘'},
 SASHA:{name:'샤샤',hp:3100,atk:270,def:120,basicGap:1/.9,skill1Gap:8,skill2Gap:13,s1:1.75,s2:1.0,ult:4.5,skill1Name:'접착 폭약',skill2Name:'연쇄기폭',ultimateName:'최종 폭파계획'},
 LUNA:{name:'루나',hp:2800,atk:230,def:125,basicGap:1/.9,skill1Gap:9,skill2Gap:15,s1:1.2,s2:.3,ult:3.2,skill1Name:'운명의 표식',skill2Name:'역행의 별',ultimateName:'운명개변'},
 VIOLA:{name:'비올라',hp:2750,atk:250,def:105,basicGap:1/.95,skill1Gap:8,skill2Gap:13,s1:1.4,s2:.8,ult:4.2,skill1Name:'독화살비',skill2Name:'역병 전염',ultimateName:'죽음의 정원'},
 CHLOE:{name:'클로에',hp:2900,atk:190,def:125,basicGap:1/.9,skill1Gap:9,skill2Gap:12,s1:.95,s2:.75,ult:2.8,skill1Name:'비트 업',skill2Name:'소닉 웨이브',ultimateName:'라스트 앙코르'},
 ADEL:{name:'아델',hp:3800,atk:205,def:175,basicGap:1/.9,skill1Gap:9,skill2Gap:16,s1:1.3,s2:.35,ult:3.3,skill1Name:'수호의 일격',skill2Name:'미스릴 가호',ultimateName:'불락의 성채'},
 NIA:{name:'니아',hp:3000,atk:285,def:105,basicGap:1/1.0,skill1Gap:7,skill2Gap:13,s1:1.7,s2:.7,ult:4.8,skill1Name:'혈창',skill2Name:'피의 저주',ultimateName:'진홍월식'},
 AURORA:{name:'오로라',hp:2950,atk:275,def:115,basicGap:1/1.0,skill1Gap:8,skill2Gap:15,s1:1.55,s2:.45,ult:4.5,skill1Name:'유성낙하',skill2Name:'별자리 결속',ultimateName:'천구붕괴'},
 EVE:{name:'이브',hp:2850,atk:250,def:120,basicGap:1/.95,skill1Gap:8,skill2Gap:14,s1:1.2,s2:.35,ult:3.2,skill1Name:'시간지연',skill2Name:'되감기',ultimateName:'멈춰버린 세계'}
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
 const tdHeroes=[...units.values()].filter(u=>u.heroId).slice(0,5);
 priorityCRecordTdEnd(tdHeroes,boss);
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
 gameMode='RPG';rpgPending=false;manualPaused=false;rpgSimTime=0;rpgTransitioning=true;priorityCRecordRpgTransition();
 const heroes=tdHeroes.map((u,i)=>{
  const heroId=u.heroId||'ARIA',d=RPG_HERO_DEFS[heroId]||RPG_HERO_DEFS.ARIA;
  return {id:'rpg_'+u.id,heroId,name:d.name,maxHp:d.hp,hp:d.hp,atk:d.atk,def:d.def,
   basicGap:d.basicGap,skill1Gap:d.skill1Gap,skill2Gap:d.skill2Gap,lastBasic:-999,lastSkill1:0,lastSkill2:0,
   buffUntil:0,atkBuffMult:1,atkBuffUntil:0,rateBuffMult:1,rateBuffUntil:0,damageReduction:0,damageReductionUntil:0,damageTakenMult:1,damageTakenUntil:0,stunUntil:0,defModPct:0,defModUntil:0,invulnerableUntil:0,skillBlockUntil:0,reflectUntil:0,reflectRatio:0,rpgDots:[],ult:0,ko:false,slot:i};
 });
 priorityCRecordRpgBattleStart(heroes.map(h=>h.heroId));
 rpgState={
  heroes,
  boss:{...RPG_BOSS_DEF,maxHp:RPG_BOSS_DEF.hp,hp:RPG_BOSS_DEF.hp,lastAttack:0,lastSkill1:0,lastSkill2:0,lastSkill3:0,rateBuffMult:1,rateBuffUntil:0,deathPreventionCharges:0,phase:1,enraged:false,invulnerableUntil:0,skillBlockUntil:0,reflectUntil:0,reflectRatio:0,rpgDots:[]},
  summons:[],
  pendingEvents:[],
  result:null
 };
 rpgDiagReset(heroes.map(h=>h.heroId));
 $('battlefield').style.display='none';$('battlefield').classList.remove('tdLocked');
 rpgScreen.classList.add('on','prep','transitionLock');rpgScreen.classList.remove('approach','battle');rpgScreen.setAttribute('aria-hidden','false');
 document.querySelectorAll('.tdHud').forEach(e=>e.style.display='none');
 document.querySelectorAll('.rpgOnlyControl').forEach(e=>e.style.display='none'); if($('topHUD'))$('topHUD').style.display='none';
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
 setRpgTransitionMessage('모든 방어선이 '+rpgState.boss.name+' 에게 무너졌다.',false);
 fadeRpgSceneIn();

 setTimeout(fadeRpgSceneOut,1650);
 setTimeout(()=>{
  rpgScreen.classList.remove('prep');rpgScreen.classList.add('approach');
  setRpgTransitionMessage('DATA_PENDING · 보스 전용 대사 원본 대기',false);
  fadeRpgSceneIn();
 },2000);

 setTimeout(fadeRpgSceneOut,4650);
 setTimeout(()=>{
  rpgScreen.classList.remove('approach');rpgScreen.classList.add('battle');
  if($('topHUD'))$('topHUD').style.display='';
  document.querySelectorAll('.rpgOnlyControl').forEach(e=>e.style.display='inline-flex');
  setRpgTransitionMessage('영웅들이여, 그대들이 바로\nLAST WALL 이다.',true);
  fadeRpgSceneIn();
 },5000);

 setTimeout(fadeRpgSceneOut,7650);
 setTimeout(()=>{
  clearRpgTransitionMessage();
  rpgScreen.classList.remove('transitionLock','sceneFade');
  rpgTransitioning=false;
  running=!manualPaused;
 },8000);
}const RPG_EFFECT_RUNTIME_VERSION='LG_RPG_EFFECT_RUNTIME_V1';
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
    const beforeHp=t.hp,dealt=rpgDamageToBoss(raw,{ignoreDefense:!!effect.ignoreDefense});
    t.hp=Math.max(0,t.hp-dealt);
    if(rpgDiagnostic&&source&&source.heroId)rpgDiagnostic.totalPartyDamageToBoss+=Math.max(0,beforeHp-t.hp);
    if((t.reflectUntil||0)>rpgSimTime&&source&&source!==t){
     const sourceWasAlive=!!(source.heroId&&!source.ko&&source.hp>0);
     const back=Math.max(1,Math.round(dealt*(t.reflectRatio||0)));
     source.hp=Math.max(0,source.hp-rpgDamageToHero(source,back));
     if(source.hp<=0){source.ko=true;if(sourceWasAlive)rpgDiagFirstHeroDefeat(source)}
    }
   }else{
    const wasAlive=!t.ko&&t.hp>0,dealt=rpgDamageToHero(t,raw);
    t.hp=Math.max(0,t.hp-dealt);
    if(t.hp<=0){
     if(!tryRpgDeathPrevention(t))t.ko=true;
    }
    if(wasAlive&&(t.ko||t.hp<=0))rpgDiagFirstHeroDefeat(t);
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
 if(effect.type!=='DAMAGE'&&effect.type!=='HEAL'&&effect.type!=='SUMMON'&&targets.length)rpgDiagStatus(effect.type,targets.length);
 if(effect.type==='SUMMON'){
  const count=Math.max(1,effect.count||1);
  rpgDiagStatus('SUMMON',count);
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
function setRpgCast(name,duration,tier,target){
 const bar=$('rpgCastBar');if(!bar)return;
 $('rpgCastName').textContent=name;
 $('rpgCastMeta').textContent=(tier||'WARN')+' · '+(target||'FIELD');
 const fill=$('rpgCastFill');
 bar.classList.add('on');bar.setAttribute('aria-hidden','false');
 fill.style.transition='none';fill.style.width='0%';
 requestAnimationFrame(()=>{fill.style.transition='width '+duration+'s linear';fill.style.width='100%'});
 clearTimeout(setRpgCast.t);
 setRpgCast.t=setTimeout(()=>{bar.classList.remove('on');bar.setAttribute('aria-hidden','true')},Math.max(300,duration*1000));
}
function castBraunHornCharge(b){
 const d=RPG_BOSS_SKILL_DEFS.BRAUM.skill1;rpgDiagBossAction('skill1');
 setRpgCast(d.name,.85,'HIGH','ALL HEROES');
 applyRpgEffects([
  {type:'DAMAGE',target:'ALL_HEROES',amount:b.atk*d.prototype.damageRatio},
  {type:'ACTION_DELAY',target:'ALL_HEROES',seconds:d.prototype.actionDelay}
 ],{source:b});
 b.lastSkill1=rpgSimTime;
 showWarning('철각왕 브라움 · 뿔박치기','돌진 충격 · 전원 피해 / 행동 지연',850);
}
function castBraunRockCollapse(b){
 const d=RPG_BOSS_SKILL_DEFS.BRAUM.skill2;rpgDiagBossAction('skill2');
 setRpgCast(d.name,.9,'DANGER','RANDOM 2');
 applyRpgEffects([{type:'SKILL_BLOCK',target:'RANDOM_HEROES',count:d.targetCount,duration:d.duration}],{source:b});
 b.lastSkill2=rpgSimTime;
 showWarning('철각왕 브라움 · 암반 붕괴','영웅 2명 스킬 6초 봉쇄',900);
}
function castBraunCrushingRoar(b){
 const d=RPG_BOSS_SKILL_DEFS.BRAUM.skill3;rpgDiagBossAction('skill3');
 setRpgCast(d.name,.9,'CRITICAL','ALL HEROES');
 applyRpgEffects([{type:'DAMAGE_TAKEN_MULT',target:'ALL_HEROES',mult:d.damageTakenMult,duration:d.duration}],{source:b});
 b.lastSkill3=rpgSimTime;
 showWarning('철각왕 브라움 · 분쇄 포효','8초간 파티 받는 피해 +40%',900);
}function updateRpgBossSkills(b){
 if((b.stunUntil||0)>rpgSimTime||(b.skillBlockUntil||0)>rpgSimTime)return;
 const d=RPG_BOSS_SKILL_DEFS.BRAUM;
 if(rpgSimTime-b.lastSkill3>=d.skill3.cooldown){castBraunCrushingRoar(b);return}
 if(rpgSimTime-b.lastSkill2>=d.skill2.cooldown){castBraunRockCollapse(b);return}
 if(rpgSimTime-b.lastSkill1>=d.skill1.cooldown){castBraunHornCharge(b);return}
}
function rpgHeroSkillEffects(h,slot){
 const d=RPG_HERO_DEFS[h.heroId],atk=effectiveHeroAtk(h);
 if(!d)return [];
 const ratio=slot===1?d.s1:d.s2;
 const fx=[{type:'DAMAGE',target:'BOSS',amount:atk*ratio}];
 if(slot===1){
  if(h.heroId==='KARIN')fx[0].ignoreDefense=true;
  if(h.heroId==='RIEL'||h.heroId==='VIOLA')fx.push({type:'DOT',target:'BOSS',amount:atk*.18,duration:6,tick:1});
  if(h.heroId==='YUNA')fx.push({type:'STUN',target:'BOSS',duration:1});
  if(h.heroId==='REINA'||h.heroId==='EVE')runRpgAdapter('RPG_SLOW_TO_ACTION_RATE',{target:'BOSS',slowRatio:.25,duration:4},{source:h});
  if(h.heroId==='RUBY'||h.heroId==='LUNA')fx.push({type:'DAMAGE_TAKEN_MULT',target:'BOSS',mult:h.heroId==='LUNA'?1.18:1.15,duration:8});
 }
 if(slot===2){
  if(h.heroId==='YUNA')fx.push({type:'SKILL_BLOCK',target:'BOSS',duration:2});
  if(h.heroId==='REINA')fx.push({type:'STUN',target:'BOSS',duration:1});
  if(h.heroId==='NIA')fx.push({type:'DEF_MOD',target:'BOSS',pct:-.18,duration:8});
  if(h.heroId==='EVE')runRpgAdapter('TIME_REWIND',{target:'BOSS',seconds:2},{source:h});
  if(h.heroId==='ERIKA')fx.push({type:'ATK_MULT',target:'SELF',mult:1.30,duration:10},{type:'RATE_MULT',target:'SELF',mult:1.25,duration:10});
  if(h.heroId==='CHLOE')fx.push({type:'STUN',target:'BOSS',duration:1});
 }
 return fx;
}
function castRpgHeroSkill(h,slot){
 const d=RPG_HERO_DEFS[h.heroId];if(!d)return;
 rpgDiagHeroAction(h.heroId,slot===1?'s1':'s2');
 const effects=rpgHeroSkillEffects(h,slot);h.lastSkillEffects=effects.map(e=>({...e}));
 applyRpgEffects(effects,{source:h});
 if(slot===1){h.lastSkill1=rpgSimTime;h.ult=Math.min(100,h.ult+12)}
 else {h.lastSkill2=rpgSimTime;h.ult=Math.min(100,h.ult+16)}
}
function rpgHeroUltimateEffects(h){
 const d=RPG_HERO_DEFS[h.heroId],atk=effectiveHeroAtk(h);if(!d)return [];
 const fx=[{type:'DAMAGE',target:'BOSS',amount:atk*d.ult}];
 if(h.heroId==='ARIA')fx.push({type:'DAMAGE_REDUCTION',target:'ALL_HEROES',ratio:.50,duration:5});
 if(h.heroId==='YUNA')fx.push({type:'SKILL_BLOCK',target:'BOSS',duration:4});
 if(h.heroId==='RIEL')fx.push({type:'DOT',target:'BOSS',amount:atk*.22,duration:6,tick:1});
 if(h.heroId==='SERA')fx.push({type:'ATK_MULT',target:'ALL_HEROES',mult:1.18,duration:10},{type:'RATE_MULT',target:'ALL_HEROES',mult:1.18,duration:10});
 if(h.heroId==='REINA')fx.push({type:'STUN',target:'BOSS',duration:1});
 if(h.heroId==='CHLOE')fx.push({type:'RATE_MULT',target:'ALL_HEROES',mult:1.15,duration:10});
 if(h.heroId==='EVE')fx.push({type:'STUN',target:'BOSS',duration:1},{type:'RATE_MULT',target:'ALL_HEROES',mult:1.20,duration:6});
 return fx;
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
   h.lastBasic=rpgSimTime;rpgDiagHeroAction(h.heroId,'basic');
   applyRpgEffects([{type:'DAMAGE',target:'BOSS',amount:atk}],{source:h});
   h.ult=Math.min(100,h.ult+6);
  }
  if(heroSkillUnlocked(1)&&(h.skillBlockUntil||0)<=rpgSimTime&&rpgSimTime-h.lastSkill1>=effectiveHeroGap(h,h.skill1Gap))castRpgHeroSkill(h,1);
  if(heroSkillUnlocked(2)&&(h.skillBlockUntil||0)<=rpgSimTime&&rpgSimTime-h.lastSkill2>=effectiveHeroGap(h,h.skill2Gap))castRpgHeroSkill(h,2);
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
  b.lastAttack=rpgSimTime;rpgDiagBossAction('basic');
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
 if(rpgAutoBattle&&heroSkillUnlocked(3)){
  const ready=rpgAliveHeroes().find(h=>h.ult>=100);
  if(ready){useRpgUltimate(ready.id,true);return}
 }
 renderRpg();
}
function useRpgUltimate(heroId,fromAuto=false){
 if(gameMode!=='RPG'||!rpgState||rpgState.result||manualPaused)return;
 const h=rpgState.heroes.find(x=>x.id===heroId);
 if(!h||h.ko||!heroSkillUnlocked(3)||h.ult<100||(h.skillBlockUntil||0)>rpgSimTime)return;
 h.ult=0;rpgDiagHeroAction(h.heroId,'ult');
 const before=rpgState.boss.hp;
 applyRpgEffects(rpgHeroUltimateEffects(h),{source:h});
 const dmg=Math.max(0,Math.round(before-rpgState.boss.hp));
 showWarning(h.name+' · '+RPG_HERO_DEFS[h.heroId].ultimateName,(fromAuto?'AUTO · ':'')+'ULTIMATE · '+dmg+' DAMAGE · PARTY GUARD 5s',850);
 if(rpgState.boss.hp<=0)finishRpgVictory();else renderRpg();
}
function finishRpgVictory(){
 if(!rpgState||rpgState.result)return;
 priorityCRecordRpgResult('VICTORY');rpgDiagFinish('VICTORY');rpgState.result='VICTORY';running=false;
 showWarning('STAGE CLEAR','RPG BOSS DEFEATED',1200);renderRpg();
 setTimeout(()=>showResultScreen('CLEAR',rpgState.boss.name+' 격파'),900);
}
function finishRpgDefeat(reason){
 if(!rpgState||rpgState.result)return;
 priorityCRecordRpgResult('DEFEAT');rpgDiagFinish('DEFEAT');rpgState.result='DEFEAT';running=false;
 showWarning('RPG BATTLE FAILED',reason,1200);renderRpg();
 setTimeout(()=>showResultScreen('DEFEAT',reason),900);
}
function rpgStatusBadges(h){
 const out=[];
 if(h.ko)out.push('K.O.');
 if((h.stunUntil||0)>rpgSimTime)out.push('STUN '+Math.ceil(h.stunUntil-rpgSimTime)+'s');
 if((h.damageTakenUntil||0)>rpgSimTime)out.push('VULN '+Math.ceil(h.damageTakenUntil-rpgSimTime)+'s');
 if((h.damageReductionUntil||0)>rpgSimTime)out.push('GUARD '+Math.ceil(h.damageReductionUntil-rpgSimTime)+'s');
 if((h.rateBuffUntil||0)>rpgSimTime)out.push('HASTE '+Math.ceil(h.rateBuffUntil-rpgSimTime)+'s');
 if((h.rpgDots||[]).length)out.push('DOT '+h.rpgDots.length);
 const shown=out.slice(0,3),overflow=Math.max(0,out.length-shown.length);
 return shown.map(x=>'<span class="rpgStatusIcon">'+x+'</span>').join('')+(overflow?'<span class="rpgStatusIcon">+'+overflow+'</span>':'');
}function renderRpg(){
 if(!rpgState)return;
 const b=rpgState.boss;
 $('rpgBossHpText').textContent=Math.ceil(b.hp)+'/'+b.maxHp;
 $('rpgBossBarFill').style.width=Math.max(0,b.hp/b.maxHp*100)+'%';
 $('rpgPhaseLabel').textContent=b.enraged?'PHASE 3 · ENRAGED':'PHASE '+b.phase;
 rpgHeroRow.innerHTML='';
 for(const h of rpgState.heroes){
  const card=document.createElement('div');card.className='rpgHeroCard'+(h.ko?' ko':'');
  const hpPct=Math.max(0,h.hp/h.maxHp*100),ultPct=Math.max(0,h.ult);
  card.innerHTML='<div class="rpgHeroFigure">'+h.name.slice(0,1)+'</div><div class="rpgHeroName">'+h.name+'</div>'+
   '<div class="rpgHp"><i style="width:'+hpPct+'%"></i></div>'+
   '<div class="rpgUlt"><i style="width:'+ultPct+'%"></i></div>'+
   '<button class="rpgUltBtn '+(heroSkillUnlocked(3)&&h.ult>=100&&!h.ko?'ready':'')+'" '+(heroSkillUnlocked(3)&&h.ult>=100&&!h.ko?'':'disabled')+'>'+(heroSkillUnlocked(3)?'ULT '+Math.floor(h.ult)+'%':'ULT LOCK')+'</button>'+
   '<div class="rpgStatusIcons">'+rpgStatusBadges(h)+'</div>'+
   '<div class="rpgStatus">'+(h.ko?'전투불능':h.buffUntil>rpgSimTime?'수호의 맹세':'전투 가능')+'</div>';
  const btn=card.querySelector('.rpgUltBtn');btn.onclick=()=>useRpgUltimate(h.id);
  rpgHeroRow.appendChild(card);
 }
}function renderEnemies(){
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
 addGold(bonus,'EARLY_CLEAR_BONUS');priorityCRecordWaveEnd(wave);
 showWarning('적 전멸 보너스','+'+bonus+'G · '+Math.max(0,Math.ceil(WAVE_DURATION-waveClock))+'초 조기 종료',1200);
 setTimeout(()=>{waveEnding=false;advanceWave()},450);
 return true;
}
function advanceWave(){
 if(wave>=10)return;
 priorityCRecordWaveEnd(wave);
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
function syncHUD(){$('gold').textContent=gold;$('wave').textContent=wave;$('gHp').textContent=gHp;$('oHp').textContent=oHp;if($('gHpBar'))$('gHpBar').style.width=Math.max(0,Math.min(100,gHp))+'%';if($('oHpBar'))$('oHpBar').style.width=Math.max(0,Math.min(100,oHp/120*100))+'%';syncLuckyHud();syncUiV1()}
function toast(msg){const t=$('toast');t.textContent=msg;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',750)}

$('closeBottom').onclick=()=>clearSelection(true);
$('luckyRouletteButton').onclick=openLuckyModal;
$('luckySpinButton').onclick=runLuckySpinPresentation;
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

async function startPrototypeBattle(profile){
 playerProfile=profile;resetBattleRuntimeForUi();
 const selection=profile.selectedMap||{worldId:'WORLD_01',localMapId:'LOCAL_WEST',mode:'NORMAL',stageId:'NORMAL_01'};
 await loadStageMapRuntime(selection);selectStageRuntime(selection);rebuildStageGrid();syncStageHud();
 gold=profile.infiniteGold?500:500;
 $('prototypeLobby').classList.add('off');if(uiV1Flow)uiV1Flow.classList.add('off');$('app').classList.remove('prototypeBattleHidden');running=true;last=performance.now();syncHUD();
}document.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('[data-profile]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');
 if(b.dataset.profile==='BASIC'){startPrototypeBattle({type:'BASIC',ownedHeroes:['ARIA'],heroLevel:10,selectedStage:1,infiniteGold:false});return}
 $('masterSetup').classList.add('on');$('profileStepText').textContent='MASTER PROFILE · 테스트 조건을 선택하세요.';
});
let masterGold=null,masterLevel=null,masterStage=1;
document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{if(b.disabled)return;document.querySelectorAll('[data-stage]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');masterStage=Number(b.dataset.stage)});
document.querySelectorAll('[data-gold]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-gold]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');masterGold=b.dataset.gold;$('masterStart').disabled=!(masterGold&&masterLevel)});
document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-level]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');masterLevel=Number(b.dataset.level);$('masterStart').disabled=!(masterGold&&masterLevel)});
$('masterStart').onclick=()=>startPrototypeBattle({type:'MASTER',ownedHeroes:[...ALL_HERO_IDS],heroLevel:masterLevel,selectedMap:{worldId:'WORLD_01',localMapId:'LOCAL_WEST',mode:'NORMAL',stageId:'NORMAL_0'+masterStage},infiniteGold:masterGold==='INFINITE'});

buildGrid();renderUnits();syncHUD();updateComboHighlights();running=false;requestAnimationFrame(loop);

window.__LG_STAGE1_TEST__={
 luckyRoulette:{eligible:(rarity)=>eligibleOwnedHeroes(rarity),freeSummon:(rarity,count)=>luckyFreeSummon(rarity,count),roll:(v)=>{const q=Array.isArray(v)?[...v]:null;return luckyOutcomeRoll(q?()=>q.shift():v)},spin:(v)=>{const q=Array.isArray(v)?[...v]:null;return luckySpin(q?()=>q.shift():v)},waveClear:(w)=>addLuckyWaveClear(w),midbossBonus:()=>addLuckyMidbossBonus(),buff:(p)=>addLuckyStageBuff(p),state:()=>({jackpotPct:luckyDisplayedJackpotPct(),naturalPct:luckyNaturalPct,bonusPct:luckyBonusPct,stageBuffPct:luckyStageBuffPct,spinPhase:luckySpinPhase}),midbossOptions:()=>openMidbossReward(),chooseMidboss:(id)=>chooseMidbossReward(id)},
 camera:{state:()=>({scale:cameraScale,panX:cameraPanX,panY:cameraPanY}),setScale:(s)=>setBattleCameraScale(s),pan:(x,y)=>{cameraPanX=x;cameraPanY=y;applyBattleCamera();return {scale:cameraScale,panX:cameraPanX,panY:cameraPanY}},reset:()=>resetBattleCamera()},
 priorityC:{
  candidateB:()=>({...PRIORITY_C_CANDIDATE_B}),
  candidateBSanity:(w=1)=>({
   wave:w,
   rawCount:rawNormalCountForWave(w),canonCount:baselineNormalCountForWave(w),candidateCount:Math.round(rawNormalCountForWave(w)*PRIORITY_C_CANDIDATE_B.rawEnemyCountX),
   rawHp:rawNormalHpForWave(w),canonHp:baselineNormalHpForWave(w),candidateHp:Math.round(rawNormalHpForWave(w)*PRIORITY_C_CANDIDATE_B.rawEnemyHpX)
  }),
  setProfile:(id)=>priorityCSetProfile(id),
  telemetry:()=>priorityCExportTelemetry(),
  startDiagnosticBattle:(ownedHeroes,heroLevel=30)=>startPrototypeBattle({type:'RPG_DIAGNOSTIC',ownedHeroes:[...(ownedHeroes||[])],heroLevel:Number(heroLevel)||30,selectedMap:{worldId:'WORLD_01',localMapId:'LOCAL_WEST',mode:'NORMAL',stageId:'NORMAL_01'},infiniteGold:false}),
  rpgDiagnostic:()=>rpgDiagSnapshot(),
  setSpeed:(v)=>{speed=Math.max(1,Math.min(3,Number(v)||1));if($('speed'))$('speed').textContent='×'+speed;return speed},
  stepTd:(dt=.05)=>{if(gameMode!=='TD'||rpgPending||!running)return false;const step=Math.max(.001,Math.min(.05,Number(dt)||.05));simTime+=step;waveClock+=step;updateEnemies(step,simTime);updateUnits(simTime);if(!tryEarlyWaveClear()&&wave<10&&waveClock>=WAVE_DURATION)advanceWave();return true},
  stepRpg:(dt=.05)=>{if(gameMode!=='RPG'||!rpgState||rpgTransitioning||rpgState.result)return false;const step=Math.max(.001,Math.min(.05,Number(dt)||.05));updateRpg(step);return true},
  forceAdvanceAfterEarlyClear:()=>{if(waveEnding){waveEnding=false;advanceWave();return true}return false},
  upgrade:(x,y,nextId)=>{const u=units.get(tileKey(x,y));if(!u||u.heroId)return false;const cur=UNIT_DEFS[u.type],id=nextId||(cur&&cur.next&&cur.next[0]),next=UNIT_DEFS[id];if(!cur||!next||!cur.next.includes(id))return false;const before=u.type;upgradeUnit(u,next);return u.type!==before}
 },
 grid:()=>({cols:COLS,rows:ROWS,cells:cells.length}),
 state:()=>({gameMode,wave,gold,gHp,oHp,speed,simTime,waveClock,running,midbossRewardPending,units:[...units.values()],enemies:enemies.length,bosses:enemies.filter(e=>e.kind==='boss'&&e.hp>0).length,bossEnraged:enemies.some(e=>e.kind==='boss'&&e.hp>0&&e.enraged),bottomVisible:bottom.classList.contains('on'),rpgPending,manualPaused,moveModeUnitId,comboPlacement:!!comboPlacement,rpg:rpgState?{bossHp:rpgState.boss.hp,bossPhase:rpgState.boss.phase,rpgSimTime,heroes:rpgState.heroes.map(h=>({heroId:h.heroId,name:h.name,hp:h.hp,ult:h.ult,ko:h.ko})),result:rpgState.result,transitioning:rpgTransitioning,autoBattle:rpgAutoBattle}:null,gatePhase:gHp>0?'FINAL_WALL_G':'GATE_CORE_O'}),
 select:(x,y)=>onCellTap(x,y),
 place:(x,y,type)=>placeUnit(x,y,UNIT_DEFS[type]),
 route:()=>route.slice(),routes:()=>activeStageRoutes.map(r=>r.slice()),
 recipes:()=>HERO_RECIPES,
 unitDefs:()=>UNIT_DEFS,
 startRpg:()=>startRpgBattle([...units.values()].filter(u=>u.heroId).slice(0,5)),
 enemySpecialRuntime:{semantics:()=>ENEMY_SPECIAL_RUNTIME_SEMANTICS,bindings:()=>({...ENEMY_SPECIAL_SEMANTIC_BY_NAME}),bind:(enemy,name)=>bindEnemySpecialSemantic(enemy,name),profile:(semantic,hp,maxHp)=>enemySpecialRuntimeProfile(semantic,hp,maxHp),freezeDuration:(semantic,duration)=>enemyFreezeDuration({specialSemantic:semantic,hp:1,maxHp:1},duration),physicalDamage:(semantic,amount)=>applyEnemyPhysicalDamageReduction({specialSemantic:semantic,hp:1,maxHp:1},amount,'PHYSICAL')},
 profile:()=>({...playerProfile,ownedHeroes:[...playerProfile.ownedHeroes]}),stages:()=>availableMasterStages(),skillUnlocked:(slot)=>heroSkillUnlocked(slot),
 standard:'LG_STAGE1_RPG_BOSS_PROTOTYPE_V1_2'
};
})();