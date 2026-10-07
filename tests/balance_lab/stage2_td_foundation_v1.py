from __future__ import annotations
import argparse,json,math
from pathlib import Path
from balance_lab_v1 import distribution,evidence_class

HERE=Path(__file__).resolve().parent
WORKTREE=HERE.parents[1]
CANDIDATE_PATH=HERE/'stage2_normal02_candidate_v1.json'
DT=.05
WAVE_DURATION=40.0
STAGE1_REF={'w5_ttk_sec':22.30,'w10_ttk_sec':41.00}

UNIT={
'watchtower':(80,15,3.0,.80,'single',0),'watchtower2':(120,25,4.0,.95,'single',0),'watchtower3_sniper':(165,42,6.0,.55,'single',0),'watchtower3_rapid':(165,24,4.0,1.65,'single',0),
'archer1':(90,16,3.0,.95,'single',0),'archer2':(130,28,5.0,.72,'single',0),'archer3_rapid':(180,24,4.0,1.60,'area',1),
'lancer1':(100,22,2.0,.82,'pierce',0),'lancer2':(145,30,3.0,.92,'pierce',0),'lancer3_elite':(195,42,3.0,1.00,'area',1),
'knight1':(80,18,1.3,.90,'single',0),'knight2':(120,28,1.4,1.00,'single',0),'knight3_commander':(170,42,1.7,1.05,'pierce',0)
}

def jsround(x):return math.floor(x+.5)

def enemy_xy(e,route,g_hp):
 p=e['pos']
 if p>=len(route)-2 and g_hp<=0:return route[-1]
 i=min(len(route)-2,int(math.floor(p)));f=max(0,min(1,p-i));a,b=route[i],route[i+1]
 return (a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f)

def route_cell(e,route):return max(0,min(len(route)-1,int(math.floor(e['pos']))))

def occupied(e,route):
 half=max(.01,e['foot']/2);a=max(0,math.floor(e['pos']-half+.5));b=min(len(route)-1,math.floor(e['pos']+half+.5));return list(range(a,b+1))

def run(seed,c):
 route=[tuple(x) for x in c['route']];rows=c['tile_rows'];wave=1;sim=wave_clock=spawn_clock=0.0;spawned=0;spawn_index=0;special=False;enraged=False
 g_hp,o_hp=100,120;gold=500;cumulative=500;earned=spent=0;build_actions=upgrade_actions=0;enemies=[];next_id=1
 tel={'spawn_count_per_wave':{},'enemy_mix_per_wave':{},'wave_end_survivors':{},'gate_hp_per_wave':{},'final_wall_hp_per_wave':{},'w5_ttk':None,'w10_td_boss_ttk':None,'special_spawn_times':{'w5':None,'w10':None},'runtime_errors':[]}
 units=[]
 for typ,x,y in c['deterministic_policy']['placements']:
  cost=UNIT[typ][0]
  if gold<cost:raise RuntimeError('INITIAL_BUILD_GOLD')
  gold-=cost;spent+=cost;build_actions+=1;units.append({'type':typ,'x':x,'y':y,'last':0.0})
 plan=c['deterministic_policy']['upgrade_plan'];done=set()

 def add_gold(v):
  nonlocal gold,cumulative,earned
  if v>0:gold+=v;cumulative+=v;earned+=v

 def record_spawn(e):
  k=str(wave);tel['spawn_count_per_wave'][k]=tel['spawn_count_per_wave'].get(k,0)+1
  tel['enemy_mix_per_wave'].setdefault(k,{})[e['name']]=tel['enemy_mix_per_wave'].setdefault(k,{}).get(e['name'],0)+1
  if e['kind']=='midboss':tel['special_spawn_times']['w5']=sim
  if e['kind']=='boss':tel['special_spawn_times']['w10']=sim

 def spawn(name,kind='normal'):
  nonlocal next_id
  d=c['source_boss'] if kind=='boss' else c['source_enemies'][name]
  e={'id':next_id,'name':name,'kind':kind,'hp':float(d['hp']),'max_hp':float(d['hp']),'def':float(d.get('def',0)),'speed':float(d['move_speed']),'wall':float(d['wall_atk']),'pos':0.0,'last_hit':0.0,'foot':1.6 if kind=='boss' else 1.3 if kind=='midboss' else 1.0,'enraged':False,'dead':False}
  next_id+=1;enemies.append(e);record_spawn(e);return e

 def regular_names(w):
  return [n for n in c['wave_composition'][str(w)] if n not in ('최초의 골렘 아즈로',c['source_boss']['name'])]

 def regular_count(w):return int(c['spawn_count_total_per_wave'][str(w)])-(1 if w in (5,10) else 0)

 def hit(e,raw):
  nonlocal gold
  dmg=max(1,jsround(raw-max(0,e['def']*.25)));e['hp']-=dmg
  if e['hp']<=0 and not e['dead']:
   e['dead']=True
   if e['kind']=='midboss' and tel['special_spawn_times']['w5'] is not None:tel['w5_ttk']=max(0,sim-tel['special_spawn_times']['w5'])
   if e['kind']=='boss' and tel['special_spawn_times']['w10'] is not None:tel['w10_td_boss_ttk']=max(0,sim-tel['special_spawn_times']['w10'])
   if e['kind']=='normal':add_gold(c['economy_control']['gold_per_kill'])
  return e['dead']

 def can_reach(u,e):
  ex,ey=enemy_xy(e,route,g_hp);dist=math.hypot(ex-u['x'],ey-u['y']);rng=UNIT[u['type']][2]
  if dist<=rng:return True
  if e['pos']<len(route)-2:return False
  code=rows[u['y']-1][u['x']-1]
  if code=='C':return True
  return 15<=u['x']<=16 and 4<=u['y']<=6 and dist<=max(rng,2.25)

 def attack_targets(u,target):
  mode=UNIT[u['type']][4];alive=[e for e in enemies if e['hp']>0]
  if mode=='area':
   center=route_cell(target,route);rad=UNIT[u['type']][5];cells=set(range(max(0,center-rad),min(len(route)-1,center+rad)+1))
   return [e for e in alive if any(x in cells for x in occupied(e,route))]
  if mode=='pierce':
   cell=route_cell(target,route);return [e for e in alive if cell in occupied(e,route)]
  return [target]

 def try_upgrade():
  nonlocal gold,spent,upgrade_actions
  for i,row in enumerate(plan):
   if i in done:continue
   x,y,fr,to=row;u=next((z for z in units if z['x']==x and z['y']==y),None)
   if u and u['type']==to:done.add(i);continue
   if u and u['type']==fr and gold>=UNIT[to][0]:
    gold-=UNIT[to][0];spent+=UNIT[to][0];upgrade_actions+=1;u['type']=to;done.add(i);break

 def record_wave(w):
  k=str(w);tel['wave_end_survivors'][k]=sum(e['hp']>0 for e in enemies);tel['gate_hp_per_wave'][k]=o_hp;tel['final_wall_hp_per_wave'][k]=g_hp

 defeat=False;boss_down=False
 for step in range(260000):
  try_upgrade();sim+=DT;wave_clock+=DT;spawn_clock+=DT
  limit=regular_count(wave);interval=max(.08,(WAVE_DURATION-3)/max(1,limit))
  if spawn_clock>=interval and spawned<limit:
   spawn_clock=0;names=regular_names(wave);name=names[(spawn_index+abs(seed))%len(names)];spawn(name);spawn_index+=1;spawned+=1
  if wave==5 and not special and wave_clock>=7:spawn('최초의 골렘 아즈로','midboss');special=True
  if wave==10 and not special and wave_clock>=6:spawn(c['source_boss']['name'],'boss');special=True
  if wave==10 and not enraged and wave_clock>=40:
   b=next((e for e in enemies if e['kind']=='boss' and e['hp']>0),None)
   if b:b['enraged']=True;enraged=True

  attached=[e for e in enemies if e['hp']>0 and e['pos']>=len(route)-2]
  gate_normals=[e for e in attached if e['kind']=='normal'][:3];gate_special=next((e for e in attached if e['kind']!='normal'),None)
  for e in [x for x in enemies if x['hp']>0]:
   if e['pos']<len(route)-2:e['pos']=min(len(route)-2,e['pos']+e['speed']*DT);continue
   allowed=e in gate_normals or e is gate_special
   if not allowed:continue
   gap=2.2 if e['kind']=='boss' else 1.9 if e['kind']=='midboss' else 1.5
   if e.get('enraged'):gap/=1.25
   if sim-e['last_hit']>=gap:
    e['last_hit']=sim;dmg=e['wall']*(1.5 if e.get('enraged') else 1)
    dmg=max(1,jsround(dmg))
    if g_hp>0:g_hp=max(0,g_hp-dmg)
    else:o_hp=max(0,o_hp-dmg)
    if o_hp<=0:defeat=True;break
  if defeat:break

  for u in units:
   typ=u['type'];atk,rng,rate=UNIT[typ][1],UNIT[typ][2],UNIT[typ][3]
   alive=[e for e in enemies if e['hp']>0 and can_reach(u,e)]
   if not alive:continue
   target=min(alive,key=lambda e:math.hypot(enemy_xy(e,route,g_hp)[0]-u['x'],enemy_xy(e,route,g_hp)[1]-u['y']))
   if sim-u['last']<1/rate:continue
   u['last']=sim
   for e in attack_targets(u,target):
    if hit(e,atk) and e['kind']=='boss':boss_down=True
  if boss_down:
   record_wave(10);break

  if wave<10:
   normals_done=spawned>=regular_count(wave);special_done=wave!=5 or special;alive_count=sum(e['hp']>0 for e in enemies)
   if normals_done and special_done and alive_count==0 and wave_clock<WAVE_DURATION:
    add_gold(max(0,math.ceil(WAVE_DURATION-wave_clock))*5);record_wave(wave);wave+=1;wave_clock=spawn_clock=0;spawned=spawn_index=0;special=False;enraged=False
   elif wave_clock>=WAVE_DURATION:
    record_wave(wave);wave+=1;wave_clock=spawn_clock=0;spawned=spawn_index=0;special=False;enraged=False

 tel.update({'cumulative_gold':cumulative,'current_gold':gold,'gold_earned':earned,'gold_spent':spent,'build_actions':build_actions,'upgrade_actions':upgrade_actions,'gate_hp_at_td_end':o_hp if boss_down else None,'gate_core_hp_end':o_hp,'final_wall_hp_end':g_hp,'td_end_hero_count':0,'td_end_hero_ids':[],'rpg_transition_event':bool(boss_down),'rpg_transition_plumbing_static_verified':True,'finished_reason':'TD_BOSS_DEFEATED' if boss_down else 'TD_DEFEAT_GATE' if defeat else 'TIMEOUT'})
 return {'schema':'lucky_girls.balance_lab.trial.v1','scenario_id':'STAGE2_NORMAL02_TD_FOUNDATION','candidate_id':c['candidate_id'],'mode':'CORE_SIM','validated_fixture':True,'production_exposed_fixture':False,'direct_injection':False,'seed':seed,'victory':boss_down and o_hp>0,'runtime_errors':tel['runtime_errors'],'telemetry':tel}

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--output',required=True);ap.add_argument('--candidate',default=str(CANDIDATE_PATH));a=ap.parse_args()
 c=json.loads(Path(a.candidate).read_text(encoding='utf-8'));game=(WORKTREE/'app/src/main/assets/js/game.js').read_text(encoding='utf-8')
 assert "function enterRpgPlaceholder(boss){beginTdBossRpgTransition(boss)}" in game and "stage1RpgSoloBossDamageX" in game and "activeMapSelection.stageId==='NORMAL_01'" in game
 runs=[run(seed,c) for seed in c['deterministic_policy']['seeds']]
 w5=[r['telemetry']['w5_ttk'] for r in runs if isinstance(r['telemetry']['w5_ttk'],(int,float))];w10=[r['telemetry']['w10_td_boss_ttk'] for r in runs if isinstance(r['telemetry']['w10_td_boss_ttk'],(int,float))]
 p5=[x/STAGE1_REF['w5_ttk_sec']-1 for x in w5];p10=[x/STAGE1_REF['w10_ttk_sec']-1 for x in w10]
 pressure=((sum(p5)/len(p5)+sum(p10)/len(p10))/2*100) if p5 and p10 else None
 exact=all(r['telemetry']['spawn_count_per_wave']==c['spawn_count_total_per_wave'] for r in runs)
 summary={'run_count':len(runs),'seed_evidence_class':evidence_class(len(runs)),'runtime_error_count':sum(len(r['runtime_errors']) for r in runs),'gate_core_hp_end':[r['telemetry']['gate_core_hp_end'] for r in runs],'final_wall_hp_end':[r['telemetry']['final_wall_hp_end'] for r in runs],'w5_ttk':distribution(w5),'w10_td_boss_ttk':distribution(w10),'w5_band_pass':len(w5)==4 and all(20<=x<=35 for x in w5),'w10_band_pass':len(w10)==4 and all(40<=x<=60 for x in w10),'stage1_reference':STAGE1_REF,'effective_pressure_proxy_pct':pressure,'effective_pressure_proxy_formula':'mean(W5_TTK_ratio_minus_1,W10_TTK_ratio_minus_1)*100 using VERIFIED Candidate B 22.30s/41.00s','pressure_band_8_20_pass':pressure is not None and 8<=pressure<=20,'spawn_counts_exact':exact,'spawn_count_per_wave':[r['telemetry']['spawn_count_per_wave'] for r in runs],'enemy_mix_per_wave':[r['telemetry']['enemy_mix_per_wave'] for r in runs],'wave_end_survivors':[r['telemetry']['wave_end_survivors'] for r in runs],'cumulative_gold':[r['telemetry']['cumulative_gold'] for r in runs],'gold_earned':[r['telemetry']['gold_earned'] for r in runs],'gold_spent':[r['telemetry']['gold_spent'] for r in runs],'build_actions':[r['telemetry']['build_actions'] for r in runs],'upgrade_actions':[r['telemetry']['upgrade_actions'] for r in runs],'td_end_hero_count':[r['telemetry']['td_end_hero_count'] for r in runs],'td_end_hero_ids':[r['telemetry']['td_end_hero_ids'] for r in runs],'rpg_transition_event':[r['telemetry']['rpg_transition_event'] for r in runs]}
 summary['selection_band_pass']=summary['runtime_error_count']==0 and all(x>0 for x in summary['gate_core_hp_end']) and summary['w5_band_pass'] and summary['w10_band_pass'] and summary['pressure_band_8_20_pass'] and exact
 out={'schema':'lucky_girls.stage2.normal02.td_foundation.core_sim_bundle.v1','candidate':c,'runs':runs,'summary':summary}
 p=Path(a.output);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(summary,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
