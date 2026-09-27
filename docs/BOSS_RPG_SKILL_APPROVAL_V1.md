# Boss RPG Skill Approval V1

상태: **43개 전부 1차 승인 / 런타임 연결 허용**  
승인일: 2026-09-28  
변경 정책: **추후 스킬 변경 가능**. 이번 승인은 현재 V1 설계를 런타임에 연결해도 된다는 의미이며, 영구 고정이 아니다.

- 승인 대상: 원본에 스킬명만 있고 구체 효과가 없었던 보스 RPG 스킬 43개
- 상태값: `APPROVED_FOR_RUNTIME`
- 데이터 상태값: `APPROVED_PROVISIONAL_V1`
- 수치 상태: 기존대로 `BALANCE_PENDING`
- 변경 시: 해당 스킬 정의 버전과 회귀 테스트를 함께 갱신

실제 효과 목록은 `app/src/main/assets/data/boss_rpg_skill_approval_v1.json` 및 `rpg_skill_translation_v1.json`을 기준으로 한다.
