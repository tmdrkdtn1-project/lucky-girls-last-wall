from pathlib import Path
import json,sys,copy
HERE=Path(__file__).resolve().parent
WORKTREE=HERE.parents[1]
sys.path.insert(0,str(HERE))
from balance_lab_v1 import evidence_class,distribution
from stage2_td_foundation_v1 import run,STAGE1_REF

stage=json.loads((WORKTREE/'app/src/main/assets/data/stage02.json').read_text(encoding='utf-8'))
hier=json.loads((WORKTREE/'app/src/main/assets/data/map_hierarchy_v1.json').read_text(encoding='utf-8'))
game=(WORKTREE/'app/src/main/assets/js/game.js').read_text(encoding='utf-8')
index=(WORKTREE/'app/src/main/assets/index.html').read_text(encoding='utf-8')

assert stage['identity']['stage_id']=='NORMAL_02'
assert stage['identity']['status']=='IMPLEMENTED_LOCKED'
assert stage['identity']['player_exposed'] is False
assert stage['grid']=={'cols':18,'rows':10,'total':180}
route=[tuple(x) for x in stage['route']]
assert len(route)==28
assert all(abs(a[0]-b[0])+abs(a[1]-b[1])==1 for a,b in zip(route,route[1:]))
rows=stage['tile_rows'];assert len(rows)==10 and all(len(x)==18 for x in rows)
for x,y in route:assert rows[y-1][x-1] in 'SPGO'

profile=stage['td_foundation']
assert profile['profile_id']=='G' and profile['test_only'] is True and profile['player_exposed'] is False
assert profile['encounter_multipliers']=={'midboss_hp_x':0.475,'td_boss_hp_x':0.8,'structure_damage_x':0.9}
assert profile['spawn_count_total_per_wave']=={'1':25,'2':29,'3':33,'4':37,'5':42,'6':45,'7':49,'8':54,'9':57,'10':32}
assert profile['enemies']['source_defs']['최초의 골렘 아즈로']['hp']==2376
assert profile['enemies']['boss_def']['hp']==2431
assert profile['rpg']['status']=='DATA_PENDING' and profile['rpg']['transition_plumbing_only'] is True

s2=next(s for s in hier['worlds'][0]['local_maps'][0]['normal']['stages'] if s['id']=='NORMAL_02')
assert s2['status']=='IMPLEMENTED_LOCKED'
assert s2['data_path']=='data/stage02.json'
assert s2['geometry_status']=='IMPLEMENTED'
assert s2['player_exposed'] is False
assert s2['td_profile']=='STAGE2_G'

assert "{id:'NORMAL_02',globalStage:2,status:'IMPLEMENTED_LOCKED'" in game
assert "dataPath:'data/stage02.json'" in game
assert "playerExposed:false,tdProfile:'STAGE2_G'" in game
assert "startStage2FoundationDiagnostic" in game
assert "STAGE 2 · Lucky Roulette DATA_PENDING" in game
assert "STAGE 2 RPG · DATA_PENDING" in game
assert "activeMapSelection.stageId==='NORMAL_01'&&partySize===1?STAGE1_RPG_SOLO_BOSS_DAMAGE_X:1" in game
assert ('data-stage="2" disabled' in index) and ('STAGE 2 · 준비중' in index)

candidate={
 'candidate_id':'NORMAL_02_TD_FOUNDATION_G_RUNTIME',
 'route':stage['route'],
 'tile_rows':stage['tile_rows'],
 'spawn_count_total_per_wave':profile['spawn_count_total_per_wave'],
 'wave_composition':profile['wave_composition'],
 'source_enemies':copy.deepcopy(profile['enemies']['source_defs']),
 'source_boss':copy.deepcopy(profile['enemies']['boss_def']),
 'economy_control':profile['economy_control'],
 'deterministic_policy':profile['deterministic_policy'],
}
m=profile['encounter_multipliers']
for row in candidate['source_enemies'].values():
 row['wall_atk']=row['wall_atk']*m['structure_damage_x']
candidate['source_enemies'][profile['enemies']['wave5_midboss']]['hp']=round(candidate['source_enemies'][profile['enemies']['wave5_midboss']]['hp']*m['midboss_hp_x'])
candidate['source_boss']['hp']=round(candidate['source_boss']['hp']*m['td_boss_hp_x'])
candidate['source_boss']['wall_atk']=candidate['source_boss']['wall_atk']*m['structure_damage_x']

runs=[run(seed,candidate) for seed in profile['deterministic_policy']['seeds']]
w5=[r['telemetry']['w5_ttk'] for r in runs]
w10=[r['telemetry']['w10_td_boss_ttk'] for r in runs]
p5=[x/STAGE1_REF['w5_ttk_sec']-1 for x in w5]
p10=[x/STAGE1_REF['w10_ttk_sec']-1 for x in w10]
pressure=((sum(p5)/len(p5)+sum(p10)/len(p10))/2*100)
assert evidence_class(len(runs))=='SMOKE'
assert all(len(r['runtime_errors'])==0 for r in runs)
assert all(r['telemetry']['gate_core_hp_end']>0 for r in runs)
assert all(20<=x<=35 for x in w5)
assert all(40<=x<=60 for x in w10)
assert 8<=pressure<=20
assert all(r['telemetry']['spawn_count_per_wave']==profile['spawn_count_total_per_wave'] for r in runs)
assert all(r['telemetry']['rpg_transition_event'] for r in runs)

summary={
 'status':'PASS',
 'candidate':'G_RUNTIME',
 'gate_core_hp_end':[r['telemetry']['gate_core_hp_end'] for r in runs],
 'w5_ttk':distribution(w5),
 'w10_td_boss_ttk':distribution(w10),
 'effective_pressure_proxy_pct':pressure,
 'player_stage2_unlock':False,
 'source_base_stats_mutated':False,
 'rpg_balance':'DATA_PENDING',
 'canonical_promotion':False,
}
print(json.dumps(summary,ensure_ascii=False,indent=2))
