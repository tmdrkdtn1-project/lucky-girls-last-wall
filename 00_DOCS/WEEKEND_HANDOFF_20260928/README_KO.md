# Lucky Girls 주말 정리 패키지

기준 main `05284c014cf840817a2e17353a3e26c976e3a262` / GitHub CI #94 성공. **코드 수정판이 아니라 확인 시점의 원본과 인수인계 자료**다.

## 포함 항목

1. reports/01_WEEKEND_REPORT.md — 주말 보고서 및 실제 발견 결함
2. reports/02_CHANGES_AND_COMMITS.md, COMMITS_94.csv — 변경·94커밋 목록
3. reports/03_CONFIRMED_RULES_AND_OPEN_ITEMS.md — 확정 규칙·미결정·미완성
4. manual/ — 최신 main 매뉴얼 원문2종, 최신 변경 보충문서
5. repository/ — main 추적 파일40개 전체(데이터·소스·테스트·빌드 설정 포함), reference/ — 업로드 V4_2 원본과60스킬/희귀도 추출, verification/ — 검사와 로그, evidence/ — GitHub 조회 근거
6. Install-LuckyGirls-Weekend.ps1 — 안전 배치, manifest.json — 파일별 SHA-256/배치 경로

## 실행

ZIP 전체를 `D:\MYGAME\lucky_girls` 바깥의 폴더(예: 다운로드 폴더)에 압축 해제한다. 압축 안에서 실행하지 말고, 아래 스크립트와 manifest.json 및 모든 하위 폴더를 함께 둔다.
압축 해제한 `LuckyGirls_Weekend_20260928_05284c01` 폴더에서 PowerShell을 열고:

```powershell
# 미리보기: 파일이나 폴더를 변경하지 않음. 인자 없이 실행해도 동일.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\Install-LuckyGirls-Weekend.ps1" -DryRun
# 위 배치 목록을 확인한 뒤 실제 반영
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\Install-LuckyGirls-Weekend.ps1" -Apply
```

기본 대상은 `D:\MYGAME\lucky_girls`다. 경로에 공백이 있으면 따옴표를 유지한다. 실행 정책 우회는 위 프로세스에만 적용한다.

## 배치 경로

| 내용 | 대상 루트 아래 위치 |
|---|---|
| 매뉴얼 원문 | MASTER_MANUAL_LUCKY_GIRLS_LAST_WALL.md 및 BOM 사본 |
| 보고서·커밋·근거·보충문서 | 00_DOCS/WEEKEND_HANDOFF_20260928/ |
| main 코드/데이터/테스트 전체 | 08_GAME_PROJECT/SNAPSHOTS/main_05284c01/ |
| V4_2 원본·추출표 | 03_DATA/REFERENCE/V4_2_WEEKEND_20260928/ |
| 검증 로그·보조검사 | 09_TEST/WEEKEND_20260928/ |
| 설치기 보관 | 11_TOOLS/POWERSHELL/Install-LuckyGirls-Weekend.ps1 |
| 충돌하는 기존 파일의 원본 | 99_ARCHIVE/00_PREVIOUS_ROOT_BACKUP/타임스탬프/원래상대경로 |
| 실제 실행 로그 | _SORT_LOGS/WEEKEND_타임스탬프/plan.csv, operations.jsonl |

기존 프로젝트나 .git을 자동 교체하지 않고 별도 SNAPSHOTS에 최신 파일을 보관한다. 실행 중인 프로젝트에 적용/병합하는 단계는 별도다.
기존 관계없는 파일·폴더는 제자리에 보존한다. 같은 내용은 건너뛰고, 내용이 다른 동일 경로 파일은 **전부 먼저 백업하고 해시 검증한 후 복사**한다. 삭제/폴더 전체 이동은 수행하지 않는다.
링크/정션, 상위 폴더 탈출, 파일·폴더 충돌, 변조된 payload는 중단한다. 실행 중 게임/에디터가 대상 파일을 변경하지 않도록 닫고, 설치기를 동시에 여러 개 실행하지 않는다.
중단 시 자동 롤백/삭제하지 않는다. 로그와 백업을 보존하고 verification/README.md의 복구 설명을 따른다.

## 현재 한계

CI 성공과60스킬 실전 완료는 다르다. 보고서의 F01~F05 및 미연결 항목을 확인한다. APK 바이너리는 미포함이며 Actions #94에서 별도 다운로드할 수 있다.
이 패키지 제작 과정에서 실제 D: 루트는 변경하지 않았다. V4_2 원본도 변경하지 않았다.
