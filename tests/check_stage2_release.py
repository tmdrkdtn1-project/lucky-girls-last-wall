from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
game=(ROOT/'app/src/main/assets/js/game.js').read_text(encoding='utf-8')
assert "const STAGE2_CLEAR_BASE_REWARD=160,STAGE2_FIRST_CLEAR_BONUS=70;" in game
assert "Number(t.td_end_hero_count)>0" in game
assert "td.every((id,i)=>id===rp[i])" in game
assert "if(activeMapSelection&&activeMapSelection.stageId==='NORMAL_02')applyStage2IntegratedClearReward();" in game
assert "<strong>STAGE 2</strong><span>완료</span>" in game
assert "<strong>별 평가</strong><span>없음</span>" in game
assert "성장 재화 +" in game
assert "resultRetry" in game and "selectedMap:{...activeMapSelection}" in game
assert "resultNext" in game and "returnToStageSelect" in game
assert "{id:'ARIA',name:'아리아',rarity:'LEGENDARY',recipeNames:[\"기사단장\",\"기사단장\"],materials:[{\"type\":\"knight3_commander\",\"count\":2}],recipeRuntimeComplete:true" in game
assert "{id:'NORMAL_02',globalStage:2,status:'IMPLEMENTED_LOCKED'" in game and "playerExposed:false" in game
assert "{id:'NORMAL_03',globalStage:3,status:'DATA_CONFIRMED_RUNTIME_PENDING'}" in game
print('PASS - NORMAL_02 release plumbing static contract verified')
