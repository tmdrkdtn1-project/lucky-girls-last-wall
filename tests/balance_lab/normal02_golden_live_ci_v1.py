from __future__ import annotations
"""Evaluate NORMAL_02 P0 Golden checks using THIS CI RUN's generated evidence."""
import hashlib
import json
import math
import subprocess
import sys
from pathlib import Path
from golden_runner_v1 import evaluate_matrix

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
def load(name):
    return json.loads((HERE/name).read_text(encoding='utf-8'))
def every_equal(xs, target, tol=1e-6):
    return len(xs)==4 and all(isinstance(x,(int,float)) and math.isclose(x,target,rel_tol=0,abs_tol=tol) for x in xs)

comp=load('normal02_rpg_a_component_result.json')['summary']
integration=load('normal02_td_rpg_integration_result.json')['summary']
release=load('normal02_release_idempotency_result.json')['summary']
defeat=load('normal02_defeat_retry_ci_result.json')['summary']
contract=load('golden_normal02_rpg_v1.json')
stage_text=(ROOT/'app/src/main/assets/data/stage02.json').read_text(encoding='utf-8')
stage_hash=hashlib.sha256(stage_text.replace('\n','\r\n').encode('utf-8')).hexdigest()
expected_stage_hash='cd5a664e83b0e462bb5d6246d3533267f9af6c18252939b1a5f7daf9405d8bca'
td_run=subprocess.run([sys.executable,str(HERE/'test_stage2_td_foundation_v1.py')],cwd=str(ROOT),text=True,capture_output=True,check=False)
td_verified=(td_run.returncode==0)
def evidence(checks):
    return {'checks':checks,'metrics':{}}
source={
    'four_runs':comp['runCount']==4,
    'runtime_errors_0':comp['runtimeErrors']==0,
    'victories_4':comp['victories']==4,
    'ttk_16_24_all':len(comp['durations'])==4 and all(16<=x<=24 for x in comp['durations']),
    'party_alive_end':len(comp['partyAliveEnd'])==4 and all(x>=1 for x in comp['partyAliveEnd']),
    'source_formula':every_equal(comp['bossAtk'],69*5.3097265) and every_equal(comp['bossHpConfigured'],3990.65625),
}
handoff={
    'four_runs':integration['runCount']==4,
    'runtime_errors_0':integration['runtimeErrors']==0,
    'legal_ruby_craft_4':integration['craftedRuby']==4,
    'transition_4':integration['tdTransitionRuns']==4,
    'party_match_4':integration['partyMatchRuns']==4 and len(integration['tdHeroIds'])==4 and integration['tdHeroIds']==integration['rpgPartyIds'] and all(ids==['RUBY'] for ids in integration['tdHeroIds']),
    'gate_positive':len(integration['gateHpAtTdEnd'])==4 and all(x>0 for x in integration['gateHpAtTdEnd']),
    'victories_4':integration['victories']==4,
}
td={
    'stage02_hash_unchanged':stage_hash==expected_stage_hash,
    'regressions_pass':td_verified,
}
reward={
    'first_230':release['first_reward']==230,
    'repeat_160':release['repeat_reward']==160,
    'total_390':release['total_after_two']==390,
    'no_runtime_errors':release['runtimeErrors']==0,
    'no_player_unlock':release['player_unlock'] is False,
    'no_normal03_auto_entry':release['normal03_auto_entry'] is False,
}
retry={
    'defeat':defeat['defeats']==1 and defeat['runCount']==1 and defeat['summonedSera'],
    'same_before_after_defeat':defeat['sameBeforeAfterDefeat'],
    'same_after_retry':defeat['sameAfterRetry'],
    'retry_resets_td':defeat['retryReset'],
    'stage2_context_retained':defeat['retryStage'],
    'no_next_button':defeat['nextHidden'] and defeat['releaseEligible'] is False,
    'no_runtime_errors':defeat['runtimeErrors']==0,
}
bundle={'scenarios':{
 'GOLDEN_NORMAL02_RPG_SOURCE_MINIMUM':evidence(source),
 'GOLDEN_NORMAL02_TD_RPG_INTEGRATION':evidence(handoff),
 'GOLDEN_NORMAL02_FROZEN_TD_NO_REGRESSION':evidence(td),
 'GOLDEN_NORMAL02_REWARD_FIRST_REPEAT':evidence(reward),
 'GOLDEN_NORMAL02_DEFEAT_RETRY_NO_REWARD':evidence(retry),
}}
result=evaluate_matrix(contract,bundle)
(HERE/'normal02_golden_live_ci_result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'run_scoped_evidence':True,'p0_golden':result,'td_regression_returncode':td_run.returncode,'release_status':'HOLD_ANDROID_PENDING'},ensure_ascii=False,indent=2))
if result['scenario_count']!=5 or result['pass_count']!=5 or result['promotion_gate']!='PASS':
    raise AssertionError('NORMAL02_GOLDEN_P0_INCOMPLETE_OR_FAIL')
