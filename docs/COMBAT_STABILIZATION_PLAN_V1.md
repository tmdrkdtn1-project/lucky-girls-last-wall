# Lucky Girls Combat Stabilization Plan V1

## 목적
공용 캐릭터/세이브 시스템으로 넘어가기 전에 전체 전투 콘텐츠를 데이터 기준으로 고정한다.

## 순서
1. 아리아 3스킬을 공용 Effect 구조의 기준 구현으로 완성.
2. 20영웅, 50 스테이지 보스, 스킬/특수효과 보유 일반·정예 적을 combat_registry_v1.json으로 관리.
3. RPG에서 TD 공간/방어벽/경로 개념이 그대로 성립하지 않는 스킬을 rpg_skill_issues_v1.json에서 개별 확정.
4. 공용 Effect Type을 런타임 디스패처에 연결하고 누락 Effect Type/스킬 정의를 CI에서 차단.
5. 전투시스템 안정화 후 HeroMasterData / PlayerProfile / Save / Lobby / Growth / Gacha 순으로 이동.

## 확정 규칙
- TD 관통: 피격 칸과 적 논리 footprint가 조금이라도 겹치면 피격. 두 칸에 걸친 적은 양쪽 칸 관통 모두 대상.
- RPG 영웅 관통 스킬: 대상 DEF 100% 무시.
- 아리아 조합: 기사단장 2명.
- 소스에 수치가 없는 항목은 임의 확정하지 않고 source_gap/prototype로 표시한다.

## CI 최소 검증
- 영웅 20명 × 3스킬 누락 없음.
- 보스 50명 × 3스킬 누락 없음.
- RPG 검토 대상 스킬 목록 생성.
- 최신 사용자 확정 규칙(아리아 조합/관통 매핑) 회귀 검사.
