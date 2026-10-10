from pathlib import Path
import hashlib,json,math
ROOT=Path(__file__).resolve().parents[1]
game=(ROOT/'app/src/main/assets/js/game.js').read_text(encoding='utf-8')
stage=ROOT/'app/src/main/assets/data/stage02.json'
data=json.loads(stage.read_text(encoding='utf-8'))
assert hashlib.sha256(stage.read_text(encoding='utf-8').replace('\n','\r\n').encode('utf-8')).hexdigest()=='cd5a664e83b0e462bb5d6246d3533267f9af6c18252939b1a5f7daf9405d8bca'
assert "name:'광산왕 모르겐',tdAtk:69,rpgPressure:5.3097265,hp:3990.65625,def:12,baseAttackGap:3.0" in game
assert "atk:NORMAL02_RPG_SOURCE.tdAtk*NORMAL02_RPG_SOURCE.rpgPressure" in game
assert math.isclose(69*5.3097265,366.3711285,rel_tol=0,abs_tol=1e-9)
assert "function normal02RpgAggregatePressure(){return activeMapSelection.stageId==='NORMAL_02'}" in game
assert "if(normal02RpgAggregatePressure())return;" in game
assert "const STAGE1_RPG_SOLO_BOSS_DAMAGE_X=.70;" in game
assert "activeMapSelection.stageId==='NORMAL_01'&&partySize===1" in game
assert "startStage2IntegrationDiagnostic" in game and "startStage2RpgDiagnostic" in game
assert "craftHero:(heroId)=>" in game and "recipeMaterials(r)" in game and "chooseHeroPlacement" in game
assert "if(e.kind==='boss'){" in game and "enterRpgPlaceholder(e);return true" in game
td=data['td_foundation']
assert td['profile_id']=='G'
assert td['encounter_multipliers']=={'midboss_hp_x':0.475,'td_boss_hp_x':0.8,'structure_damage_x':0.9}
assert td['spawn_count_total_per_wave']=={'1':25,'2':29,'3':33,'4':37,'5':42,'6':45,'7':49,'8':54,'9':57,'10':32}
assert td['enemies']['boss_def']['name']=='광산왕 모르겐'
assert td['enemies']['boss_def']['hp']==2431 and td['enemies']['boss_def']['def']==12 and td['enemies']['boss_def']['wall_atk']==69
print('PASS - NORMAL_02 RPG source & frozen TD static contract; browser validation separate')
