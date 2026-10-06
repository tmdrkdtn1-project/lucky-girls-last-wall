from pathlib import Path
import json,sys
HERE=Path(__file__).resolve().parent
WORKTREE=HERE.parents[1]
sys.path.insert(0,str(HERE))
from balance_lab_v1 import evidence_class,distribution
c=json.loads((HERE/'stage2_normal02_candidate_v1.json').read_text(encoding='utf-8'))
assert c['authority']=='TEST_ONLY_NOT_CANON'
assert c['stage']['stage_id']=='NORMAL_02' and c['stage']['local_name']=='브레몽 왕국'
assert c['grid']=={'cols':18,'rows':10}
route=[tuple(x) for x in c['route']]
assert 22<=len(route)<=28 and len(route)==c['geometry_summary']['route_length_cells']
assert all(abs(a[0]-b[0])+abs(a[1]-b[1])==1 for a,b in zip(route,route[1:]))
rows=c['tile_rows'];assert len(rows)==10 and all(len(x)==18 for x in rows)
for x,y in route:assert rows[y-1][x-1] in 'SPGO'
for _,x,y in c['deterministic_policy']['placements']:assert (x,y) not in route and rows[y-1][x-1] in 'DCTW'
assert c['spawn_count_total_per_wave']=={'1':27,'2':32,'3':36,'4':41,'5':46,'6':50,'7':54,'8':59,'9':63,'10':35}
assert c['source_boss']['name']=='광산왕 모르겐' and c['source_boss']['hp']==2431 and c['source_boss']['def']==12
assert c['source_enemies']['최초의 골렘 아즈로']['hp']==2376 and c['source_enemies']['절벽 매']['runtime_semantic']=='FLYING_TERRAIN_IGNORE'
assert evidence_class(4)=='SMOKE' and distribution([20,25,30,35])['median']==27.5
game=(WORKTREE/'app/src/main/assets/js/game.js').read_text(encoding='utf-8')
index=(WORKTREE/'app/src/main/assets/index.html').read_text(encoding='utf-8')
hier=json.loads((WORKTREE/'app/src/main/assets/data/map_hierarchy_v1.json').read_text(encoding='utf-8'))
assert "{id:'NORMAL_02',globalStage:2,status:'DATA_CONFIRMED_RUNTIME_PENDING'}" in game
assert 'STAGE2_FOUNDATION' not in game
assert "activeMapSelection.stageId==='NORMAL_01'" in game
assert ('STAGE 2' in index) and ('disabled' in index or '준비중' in index)
stage=next(s for s in hier['worlds'][0]['local_maps'][0]['normal']['stages'] if s['id']=='NORMAL_02')
assert stage['status']=='DATA_CONFIRMED_RUNTIME_PENDING' and stage['data_path'] is None and stage['geometry_status']=='DESIGN_PENDING'
print('PASS - Stage2 NORMAL_02 TD Foundation candidate stays TEST_ONLY while production UI/runtime/data/geometry blockers remain locked')
