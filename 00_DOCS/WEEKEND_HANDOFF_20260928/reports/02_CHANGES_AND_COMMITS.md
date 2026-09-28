# 변경 및 커밋 목록

기준: `05284c014cf840817a2e17353a3e26c976e3a262`. 시간은 KST. 요청의 주말 범위를 **2026-09-26 00:00 ~ 2026-09-28 패키지 확인 시점**으로 잡고 월요일 후속 작업을 포함했다.
main 이력에서 이 기간에 해당하는 커밋은 94개이며, 실제 첫 커밋은 9월 27일 18:18:18 KST다. 9월 26일 커밋은 조회되지 않았다.
`COMMITS_94.csv`에 전체 SHA·시간·메시지·CI 결과·GitHub 링크를 수록했다. 현재 파일 묶음은 최신 상태이며 모든 중간 버전의 파일을 중복 수록한 것은 아니다.

## 주요 작업 묶음

| 범위 | 대표 커밋 | 내용 |
|---|---|---|
| Stage 1 재정비 | 824e91f3, e649b510, d12bcc5a | 새 Stage 1, 계열 성장, 10×40초 웨이브, W10 보스 |
| TD 조작·전환 | 62006155, 444a9ee1, 04184bd6, 63d3140e | 이동/교대, 배치 선택, RPG 보스 돌격 |
| 전투 효과·원장 | 41a83ab1, aed806c7, c13033e9, a77430a3 | TD 효과, 아리아 스킬, 영웅/보스 원장, 210스킬 변환 |
| RPG 실행 구조 | e0aa83ae, bfd21250, 151c8140, 15282505, 8bdecc94 | 공통 효과·바인딩·어댑터·미정 정의 보완 |
| 적·스테이지 계약 | 95f9aed3, 1c1fa72b, 42ca5483, aa121dc2, 717cb66f | 특수 적 감사, 의미별 연결, Stage 2+ 계약 |
| Lucky Roulette | 085db5a6, 043d9ec1, c1d364ce, 9c6e1529 | 보상 계약, 함수, 화면, 검사 |
| PlayerProfile | 94772018, 6b8e4e19, 42214627, a3cfc0a3 | BASIC/MASTER 로비, 골드 플래그, 레벨별 스킬 잠금 |
| 무료소환·중복 제한 | 6a63eeca, 7462a044, 9b57fb2e, bac39975 | 후보 필터, 슬롯 제한, 일반 조합 중복 차단 |
| 도감 희귀도·CI | cce079ee, 4655beb8, 05284c01 | 전설8/신화12, 검사 기대값 수정, #94 성공 |

## 매뉴얼 내부 스냅샷 이후 차이

매뉴얼 내부 `8bdecc948b49fc680eb14920de00aa94ca8e6261`에서 최신 main까지 **37커밋 / 10파일** 차이다. 매뉴얼 사본 자체는 main에 있는 그대로 보존했다.

| 파일 | 상태 | 추가/삭제 줄 |
|---|---|---|
| `MASTER_MANUAL_LUCKY_GIRLS_LAST_WALL.md` | added | +3453 / -0 |
| `MASTER_MANUAL_LUCKY_GIRLS_LAST_WALL_UTF8_BOM.md` | added | +3453 / -0 |
| `app/src/main/assets/css/game.css` | modified | +21 / -0 |
| `app/src/main/assets/data/enemy_special_runtime_audit_v1.json` | added | +403 / -0 |
| `app/src/main/assets/data/enemy_special_runtime_bindings_v1.json` | added | +224 / -0 |
| `app/src/main/assets/data/lucky_roulette_v1.json` | added | +147 / -0 |
| `app/src/main/assets/data/stage_runtime_contract_v1.json` | added | +86 / -0 |
| `app/src/main/assets/index.html` | modified | +15 / -1 |
| `app/src/main/assets/js/game.js` | modified | +212 / -22 |
| `tests/check_stage1.py` | modified | +163 / -9 |

전체 현재 파일 목록과 Git blob SHA는 `evidence/tree.json`, 매뉴얼 대비 diff는 `evidence/manual_to_main_compare.json` 참조.
legacy 브랜치의 과거 이미지/옛 런타임은 이번 main 묶음에 들어 있지 않다. 삭제 기록이나 과거 파일이 필요하면 GitHub 이력/legacy 브랜치에서 별도 복원해야 한다.
