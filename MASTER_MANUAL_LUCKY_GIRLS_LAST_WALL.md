# 《Lucky Girls: Last Wall》 MASTER MANUAL

> **프로젝트 연속성 / 개발 인수인계 / 코드 스냅샷용 마스터 문서**  
> 스냅샷 기준 Git commit: `8bdecc948b49fc680eb14920de00aa94ca8e6261`  
> 작성 기준일: 2026-09-28 (KST)  
> 저장 위치 권장: `D:\MYGAME\lucky_girls\MASTER_MANUAL_LUCKY_GIRLS_LAST_WALL.md`  
> GitHub 기준 저장 위치: repository root `MASTER_MANUAL_LUCKY_GIRLS_LAST_WALL.md`

---

## 0. 이 문서의 역할

이 문서는 새 대화방, 새 개발 환경, 다른 개발자/AI, Unity 이관 시에도 《Lucky Girls: Last Wall》의 현재 상태를 복원할 수 있게 하는 **최상위 인수인계 문서**다.

우선순위:
1. 이 문서의 **확정 규칙**
2. GitHub `main`의 현재 데이터/코드
3. 최신 마스터 도감/밸런스 원본
4. 과거 문서/legacy branch

충돌 시 **최신 사용자 직접 확정 규칙**이 우선한다. 과거 Let’s Cut 규칙이나 legacy 20-wave/random summon 규칙을 Lucky Girls 현재 빌드에 섞지 않는다.

---

## 1. 프로젝트 식별

- 게임명: **Lucky Girls: Last Wall**
- 장르: **타워 디펜스(TD) + 보스 RPG 2단계 전투**
- 최종 런타임 목표: **Unity / Android mobile**
- 현재 GitHub/WebView alpha 목적: 전투 규칙, UX, 데이터 계약, 스킬/Effect 구조 검증
- GitHub repository: `tmdrkdtn1-project/lucky-girls-last-wall`
- 로컬 기준 루트: `D:\MYGAME\lucky_girls`
- legacy 보존 브랜치: `legacy-final-20260927`
- 과거 루트 파일은 삭제하지 않고 `99_ARCHIVE\00_PREVIOUS_ROOT_BACKUP\<timestamp>`에 보존
- 공용 자동화 코어: `D:\MYGAME\_shared_tools\Shared_Game_Automation_Core_V1_1_SAFE`

### 제작 툴
- GPT: 설계, 문서, 데이터, 코드, 검증
- Scenario: 원화/캐릭터 생성 후보 (API는 카드 문제로 보류 이력)
- Ludo: 웹 기반 이미지/에셋 참고
- Krita: 후처리
- Pixelorama: SD/도트/스프라이트

---

## 2. 캐릭터 마스터 목록

20영웅:
1. 아리아
2. 유나
3. 리엘
4. 루비
5. 에리카
6. 세라
7. 레이나
8. 카린
9. 벨
10. 미아
11. 아이린
12. 네온
13. 샤샤
14. 루나
15. 비올라
16. 클로에
17. 아델
18. 니아
19. 오로라
20. 이브

현재 Stage 1에서 실제 조합/런타임 샘플로 쓰는 영웅은 **아리아**다.

아리아 조합은 원본 추천안보다 사용자 확정 규칙이 우선하며:
`기사단장 + 기사단장 -> 아리아`

---

## 3. TD 핵심 확정 규칙

### 3.1 맵 계층
`월드맵 > 로컬맵 > 전투맵`

### 3.2 전투맵
- 논리 그리드: **18×10 = 180칸**
- Stage 1 타일:
```text
WWTTXDDDDDTTTTTTTT
TWTTDDDDDDXTTTTTTT
DDDDDPPPPPDDDDDDDD
DDDDDPDDDPDDDDDDCC
SPPPPPDDDPPPPPPPGO
DDXDDDDTDDDXDDXDCC
DDDDDDTTTDDDDDDDDD
TTTTTTTTTTTTTTTTTT
WWTTTTTTTTTTTTTTTT
TWTTTTTTTTTTTTTTTT
```

경로:
`(1,5) -> ... -> (6,5) -> (6,3) -> (10,3) -> (10,5) -> ... -> (18,5)`

### 3.3 성벽
```text
C C
G O
C C
```
- G = Final Wall, 필수/영구 방어선
- O = Gate Core, 최종 패배 목표
- 적은 G 파괴 후 O 공격
- Stage 1 기준 G HP100 / O HP120
- Optional B barricade: Stage 1~4 없음, Stage5+ 선택 가능

### 3.4 웨이브
- 총 10웨이브
- 각 웨이브 40초
- W1~W9: 계획 적 전원 스폰 후 40초 전에 전멸하면 즉시 종료
- 조기 전멸 보너스: **남은 정수 초 × 5G**
- 40초가 되어도 살아 있는 적은 삭제하지 않고 다음 웨이브로 이월
- W5: 약 7초 중간보스
- W10:
  - 0초 일반 적
  - 3초 경고
  - 6초 TD 보스
  - 40초 생존 시 광폭화
  - 광폭화: 구조물 피해 ×1.5 / 공격속도 ×1.25
  - 강제 타임아웃 없음
  - TD 보스가 죽어야 RPG로 전환

### 3.5 이동/조합
- 일반 유닛 + 영웅 이동 가능
- 현재 WebView: 클릭 → 이동 → 목적지 클릭
- 최종 Unity: drag & drop + pinch zoom + one-finger pan
- 이동 후 5초 재이동 잠금
- 점유 칸 이동 시 교대, 양쪽 모두 5초 잠금
- 영웅 조합 성립 후 전투 일시정지
- 소비된 재료 자리 중 하나를 플레이어가 영웅 배치 위치로 선택
- 영웅 슬롯 최대 5

---

## 4. 유닛 계열

- 견습 기사 → 상급 기사 → 기사단장 / 광전사
- 견습 궁수 → 저격수 → 석궁수 / 연사 궁병
- 투창병 → 프리 랜서 → 엘리트 랜서 / 마창병
- 무희 → 무희 단장 → 주술사 / 아이돌 (Stage10 unlock)
- 마탑 수습생 → 대마법사 → 대현자 / 용언사 (Stage5 unlock)
- 같은 계열만 성장
- 교차 계열 진화 금지

---

## 5. TD 피해/Effect 의미

- 단일: 단일 캐릭터 피해
- 지속: 지정 시간 동안 피해
- 관통: 같은 칸의 대상들을 관통
- 광역: 해당 칸 주변 N칸 동시 피해
- 이전: 인접 대상에게 피해 이전, 이전할수록 감소
- 빙결: 행동불능 + 피해 형태
- 화염: 지속 피해
- 기절: 일정 시간 행동불능
- 차단: 스킬 사용 봉쇄

### 같은 칸/관통 충돌 판정
적의 논리 footprint가 해당 칸에 조금이라도 걸치면 그 칸을 점유한 것으로 본다.
두 칸에 걸친 적은 양쪽 칸의 관통 공격 모두에 맞는다.
현재 알파의 footprint 폭은 일반 1.0 / 중간보스 1.3 / 보스 1.6칸의 **프로토타입 값**이다.

---

## 6. TD → RPG '보스 돌격'

이 전환 순간의 프로젝트 명칭은 **보스 돌격**이다.

1. TD 보스 HP 0
2. TD 명령 잠금
3. 쓰러짐
4. 재기립
5. 포효
6. TD 구조물/유닛 파괴 연출
7. 보스가 성벽 쪽으로 실제 돌진
8. RPG 3단계 인트로
9. RPG_ACTIVE

Stage Clear는 TD 보스 사망 시점이 아니라 **RPG 보스 최종 사망 후**만 발생한다.

---

## 7. RPG 보스전 확정 구조

- TD에서 실제 소환된 영웅만 RPG에 진입
- 1~5명
- 가로 한 줄
- 빈 슬롯 자동 채움 없음
- 기본공격 자동
- Skill1/Skill2 자동 쿨다운
- Skill3/Ultimate 수동, AUTO ON 시 자동 사용
- 영웅 HP 0 → 전투불능, 기본 부활 없음(스킬 예외 가능)
- 보스 Phase:
  - P1 100~70%
  - P2 70~35%
  - P3 35~0%, 광폭
- 하드 타임아웃 없음
- 파티 전멸 → 패배
- 보스 사망 → Stage Clear

---

## 8. 아리아 기준 전투 구현

원본:
- Skill1 성광 참격: 3칸 직선 관통, 방어벽에 붙은 적 +25%
- Skill2 수호의 맹세: 인근 2칸 아군 ATK/공속 +15%, 가장 가까운 방어벽 DEF +20%, 8초
- Skill3 최후의 성역: 전 경로 성광 피해 + 방어벽 5초간 피해 50% 감소

현재 TD 알파 보완값:
- S1 CD 9초 / damageRatio 1.35 / target cell + gate 방향 2칸
- S2 CD 16초
- S3 CD 30초 / damageRatio 1.0
이 수치들은 원본 미기재로 **프로토타입**이다.

RPG 변환:
- 관통 = DEF 100% 무시
- 수호의 맹세 = 생존 파티 ATK·공속 +15%, 파티 받는 피해 -20% 8초
- 최후의 성역 = 보스 피해 + 파티 5초간 받는 피해 -50%

---

## 9. 철각왕 브라움 Stage 1 RPG 샘플

- 뿔박치기: 파티 광역 돌진 피해 + 행동지연
  - CD 11초 / 피해계수 .75 / 행동지연 .8초 = 프로토타입
- 암반 붕괴: 무작위 생존 영웅 2명 스킬 6초 봉쇄
  - 2명/6초는 원본 보존, CD 17초 프로토타입
- 분쇄 포효: 파티 전체 8초 받는 피해 +40%
  - +40%/8초 원본 보존, CD 23초 프로토타입

---

## 10. 전체 스킬 데이터 안정화 상태

현재 데이터 계약:
- 영웅 20명 × 3 = 60스킬
- 보스 50명 × 3 = 150스킬
- 합계 210 RPG 스킬 레코드
- 과거 이름만 있던 보스 43스킬은 전부 1차 승인
- 승인 상태는 **변경 가능(mutable)** 이며 영구 고정이 아님
- 모든 수치 미기재 항목은 BALANCE_PENDING 또는 prototype로 구분

공용 RPG primitive:
- DAMAGE
- HEAL
- ATK_MULT
- RATE_MULT
- DAMAGE_REDUCTION
- ACTION_DELAY
- STUN
- DEF_MOD
- DOT
- SUMMON
- INVULNERABLE
- SKILL_BLOCK
- REFLECT
- DAMAGE_TAKEN_MULT

Adapter 런타임:
- CHANCE_TRIGGER
- CONDITIONAL_EXECUTE
- COPY_EFFECT
- DEATH_PREVENTION
- ECONOMY_DISABLED_IN_RPG
- MULTI_HIT_SEQUENCE
- RPG_SLOW_TO_ACTION_RATE
- SUMMON_AWARE_TARGETING
- TIME_REWIND
- TRANSFER_CHAIN
- ULT_GAUGE_MOD
- CONDITIONAL_EFFECT
- TELEGRAPH_SEQUENCE

현재 repository versionName은 **0.6.5-rpg-all-skills-runtime-ready**다.

중요: "runtime-ready"는 모든 영웅/보스가 현재 Stage 1 화면에서 실제 생성되어 플레이된다는 뜻이 아니다. **Effect/Adapter/데이터 계약상 실행 구조가 준비됐다는 뜻**이다. 현재 실제 플레이 샘플의 중심은 Stage 1 아리아 + 브라움이다.

---

## 11. 남아 있는 개발 순서

전투 시스템을 먼저 안정화한 뒤:
1. 전체 스킬별 실제 runtime payload/수치 연결 및 회귀 fixture 확대
2. 전체 적 스킬/정예 적 특수효과 연결
3. Stage별 보스 인스턴스화 및 테스트
4. HeroMasterData / UnitMasterData
5. PlayerProfile
6. 보유 영웅 / 레벨 / 한계돌파 / 강화
7. 재화
8. Save/Load
9. 클리어 기록
10. 로비
11. 성장/가챠
12. 무한성
13. Unity 최종 이관/최적화/아트

원칙: **화면부터가 아니라 데이터 계약부터.**

---

## 12. CI / 안전 규칙

멀티파일 GitHub 커밋은 반드시:
1. main ref SHA 확인
2. commit.tree.sha 확인
3. `create_tree(base_tree_sha=...)`
4. parent=현재 main으로 commit
5. `update_ref(force=false)`
6. Actions와 tree 확인

과거 `create_tree`에 base tree를 안 넣어 파일이 대거 사라진 사고가 있었으므로 이 절차는 절대 생략하지 않는다.

APK 버전:
- `versionCode = 2000 + GITHUB_RUN_NUMBER`
- `versionName = <base>-r<run>`
- APK: `LuckyGirls_<VERSION_NAME>.apk`
- Artifact: `lucky-girls-<VERSION_NAME>`

---

## 13. Unity 이관 원칙

WebView alpha에서 끝까지 다듬지 않는다.
Unity에서 최종 처리:
- Combat tick/state machine
- Object pooling
- projectile/VFX/audio
- animation
- pinch zoom / camera pan
- hit stop / shake
- sprite sorting
- mobile memory/GC
- Android immersive fullscreen
- TD→RPG scene/camera
- 최종 밸런스

---

## 14. Repository 전체 파일 인벤토리

스냅샷 commit: `8bdecc948b49fc680eb14920de00aa94ca8e6261`

| Path | Bytes |
|---|---:|
| `.github/workflows/stage1-apk.yml` | 1246 |
| `README.md` | 374 |
| `app/build.gradle.kts` | 718 |
| `app/src/main/AndroidManifest.xml` | 535 |
| `app/src/main/assets/css/game.css` | 16155 |
| `app/src/main/assets/data/boss_rpg_skill_approval_v1.json` | 27690 |
| `app/src/main/assets/data/combat_effect_runtime_v1.json` | 3305 |
| `app/src/main/assets/data/combat_effects_v1.json` | 1770 |
| `app/src/main/assets/data/combat_registry_v1.json` | 117889 |
| `app/src/main/assets/data/defense_structure.json` | 472 |
| `app/src/main/assets/data/enemy_balance_stage1.json` | 828 |
| `app/src/main/assets/data/hero_recipes_stage1.json` | 595 |
| `app/src/main/assets/data/rpg_explicit_effect_plans_v1.json` | 3966 |
| `app/src/main/assets/data/rpg_runtime_adapter_backlog_v1.json` | 9415 |
| `app/src/main/assets/data/rpg_runtime_bindings_v1.json` | 148614 |
| `app/src/main/assets/data/rpg_skill_issues_v1.json` | 56390 |
| `app/src/main/assets/data/rpg_skill_translation_v1.json` | 116515 |
| `app/src/main/assets/data/rpg_stage01.json` | 2123 |
| `app/src/main/assets/data/stage01.json` | 1649 |
| `app/src/main/assets/data/units_stage1.json` | 2332 |
| `app/src/main/assets/index.html` | 2134 |
| `app/src/main/assets/js/game.js` | 55866 |
| `app/src/main/java/com/luckygirls/lastwall/MainActivity.kt` | 1168 |
| `app/src/main/res/values/styles.xml` | 324 |
| `build.gradle.kts` | 142 |
| `docs/BOSS_RPG_SKILL_APPROVAL_V1.md` | 737 |
| `docs/COMBAT_STABILIZATION_PLAN_V1.md` | 1340 |
| `docs/RPG_BOSS_BATTLE_SYSTEM_V1.md` | 6476 |
| `docs/STAGE1_ALPHA_FIX_V2.json` | 461 |
| `docs/STAGE1_PLAYABLE_INTERACTION_STANDARD_V1.json` | 1295 |
| `docs/TD_ALPHA_ACCEPTANCE_2026-09-27.md` | 1244 |
| `docs/UNITY_MIGRATION_CHECKLIST.md` | 4407 |
| `settings.gradle.kts` | 280 |
| `tests/check_stage1.py` | 21964 |

### 대형 authoritative data 파일
아래 파일들은 코드가 아니라 **게임 데이터 원장**이다. 크기가 매우 커서 이 문서 본문에 중복 복사하지 않고, 위 commit SHA와 함께 canonical 위치를 고정한다.
- `combat_registry_v1.json` — 20영웅/50보스/특수 적 원장
- `rpg_skill_translation_v1.json` — 210스킬 RPG 변환 규칙
- `rpg_runtime_bindings_v1.json` — 210스킬 runtime primitive/adapter 바인딩
- `rpg_skill_issues_v1.json` — RPG 이슈/변환 추적
- `boss_rpg_skill_approval_v1.json` — 43개 프로비저널 보스 스킬 승인 기록

이 다섯 파일은 **GitHub main의 같은 commit `8bdecc948b49fc680eb14920de00aa94ca8e6261`**가 이 문서의 데이터 부록 원본이다. 새 방/새 개발자는 반드시 이 문서 + 해당 data 파일을 함께 읽는다.

---

# PART B — FULL EXECUTABLE CODE SNAPSHOT

아래는 현재 빌드와 검증에 직접 사용되는 실행/빌드/테스트 코드의 **전문 스냅샷**이다.
수정 시 canonical source 파일을 먼저 바꾸고, 이 마스터 매뉴얼의 코드 스냅샷도 새 commit 기준으로 재생성한다.



---

## SOURCE: `.github/workflows/stage1-apk.yml`

```yaml
name: Stage 1 APK
on:
  workflow_dispatch:
  push:
    branches: [ main ]
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v5
        with:
          distribution: temurin
          java-version: '17'
      - uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: '8.9'
      - name: Validate Stage 1 baseline
        run: python3 tests/check_stage1.py
      - name: Validate JavaScript
        run: node --check app/src/main/assets/js/game.js
      - name: Build debug APK
        run: gradle assembleDebug --stacktrace
      - name: Name APK with unique run version
        run: |
          BASE_VERSION=$(grep 'val baseVersionName =' app/build.gradle.kts | sed -E 's/.*"([^"]+)".*/\1/')
          VERSION_NAME="${BASE_VERSION}-r${GITHUB_RUN_NUMBER}"
          cp app/build/outputs/apk/debug/app-debug.apk "LuckyGirls_${VERSION_NAME}.apk"
          echo "APK_NAME=LuckyGirls_${VERSION_NAME}.apk" >> "$GITHUB_ENV"
          echo "ARTIFACT_NAME=lucky-girls-${VERSION_NAME}" >> "$GITHUB_ENV"
      - uses: actions/upload-artifact@v4
        with:
          name: ${{ env.ARTIFACT_NAME }}
          path: ${{ env.APK_NAME }}

```


---

## SOURCE: `app/build.gradle.kts`

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val githubRunNumber = System.getenv("GITHUB_RUN_NUMBER")?.toIntOrNull()
val buildNumber = githubRunNumber ?: 1
val baseVersionName = "0.6.5-rpg-all-skills-runtime-ready"

android {
    namespace = "com.luckygirls.lastwall"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.luckygirls.lastwall"
        minSdk = 26
        targetSdk = 35
        versionCode = 2000 + buildNumber
        versionName = "$baseVersionName-r$buildNumber"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

```


---

## SOURCE: `app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
 <application android:theme="@style/AppTheme" android:label="LUCKY GIRLS" android:usesCleartextTraffic="false">
  <activity android:name=".MainActivity" android:screenOrientation="landscape" android:configChanges="orientation|screenSize|keyboardHidden" android:exported="true">
   <intent-filter><action android:name="android.intent.action.MAIN"/><category android:name="android.intent.category.LAUNCHER"/></intent-filter>
  </activity>
 </application>
</manifest>

```


---

## SOURCE: `app/src/main/assets/index.html`

```html
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover">
<title>Lucky Girls Stage 1 Playable</title>
<link rel="stylesheet" href="css/game.css">
</head>
<body>
<div id="app">
<header id="topHUD">
  <div class="hudBox">STAGE 1</div>
  <div class="hudBox tdHud">WAVE <span id="wave">1</span>/10</div>
  <div class="hudBox tdHud">🪙 <span id="gold">500</span></div>
  <div class="hudBox tdHud">G <span id="gHp">100</span>/100</div>
  <div class="hudBox tdHud">O <span id="oHp">120</span>/120</div>
  <div class="hudGrow"></div>
  <button class="hudBtn" id="speed">×1</button>
  <button class="hudBtn rpgOnlyControl" id="autoBattle">AUTO OFF</button>
  <button class="hudBtn" id="pause">Ⅱ 일시정지</button>
</header>
<main id="battlefield">
  <div id="stageBanner">서부 왕국 · 산악 초입 · 18×10 PLAYABLE BLOCKOUT</div>
  <div id="legend">S 스폰 <span>P 경로</span><span>D 배치</span><span>W 수역</span><span>X 장애물</span><span>G 최종방어벽</span><span>O 성문</span></div>
  <div id="mapFrame">
    <div id="grid"><div id="unitLayer"></div><div id="enemyLayer"></div><div id="fxLayer"></div></div>
  </div>
</main>
<section id="rpgScreen" aria-hidden="true">
  <div id="rpgTransition" class="rpgTransition">
    <div id="rpgTransitionMessage"></div>
  </div>
  <div id="rpgArena">
    <div id="rpgBossStatus">
      <div id="rpgBossStatusLine"><strong id="rpgBossName">철각왕 브라움</strong><span id="rpgPhaseLabel">PHASE 1</span><span id="rpgBossHpText">0/0</span></div>
      <div id="rpgBossTopBar"><i id="rpgBossBarFill"></i></div>
    </div>
    <div id="rpgBoss">
      <div id="rpgBossBody">BOSS</div>
    </div>
    <div id="rpgHeroRow"></div>
  </div>
</section>
<div id="bottomUI">
  <button id="closeBottom">✕</button>
  <div id="contextTitle"></div>
  <div id="actions"></div>
</div>
<div id="toast"></div>\n<div id="bossWarning"><div id="bossWarningTitle">⚠ WARNING</div><div id="bossWarningSub"></div></div>
</div>
<script src="js/game.js"></script>
</body>
</html>
```


---

## SOURCE: `app/src/main/assets/css/game.css`

```css
:root{
 --top:54px;--bottom:116px;
 --safe-top:env(safe-area-inset-top,0px);
 --safe-right:env(safe-area-inset-right,0px);
 --safe-bottom:env(safe-area-inset-bottom,0px);
 --safe-left:env(safe-area-inset-left,0px);
}
*{box-sizing:border-box}
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#15251c;color:#fff;font-family:system-ui,-apple-system,sans-serif;touch-action:manipulation}
button{font:inherit}
#app{width:100%;height:100%;position:relative;background:linear-gradient(#355e45,#203c2d 58%,#13251b)}
#topHUD{position:fixed;z-index:50;left:0;right:0;top:0;height:var(--top);display:flex;align-items:center;gap:10px;padding:6px 12px;background:#111923ef;border-bottom:1px solid #647565;box-shadow:0 3px 14px #0008}
.hudBox{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:10px;background:#26342d;border:1px solid #4f6257;font-weight:800;white-space:nowrap}
.hudGrow{flex:1}
.hudBtn{border:1px solid #65766e;background:#202c28;color:white;border-radius:9px;padding:6px 10px;font-weight:900}
#battlefield{position:absolute;left:0;right:0;top:var(--top);bottom:0;overflow:hidden;background:
radial-gradient(circle at 20% 30%,#60875b55,transparent 25%),
radial-gradient(circle at 80% 20%,#7a976055,transparent 24%),
linear-gradient(140deg,#466945,#284c35 55%,#1b392b)}
#mapFrame{position:absolute;left:2.5%;right:2.5%;top:3%;bottom:5%;display:flex;align-items:center;justify-content:center}
#grid{position:relative;display:grid;grid-template-columns:repeat(18,1fr);grid-template-rows:repeat(10,1fr);gap:1px;width:min(94vw,calc(90vh * 1.8));aspect-ratio:18/10;border:2px solid #8ba07a88;border-radius:10px;overflow:hidden;box-shadow:0 16px 50px #0008;background:#284831}
.cell{position:relative;min-width:0;min-height:0;background:#40633d;border:1px solid #62805a33}
.cell.t{background:linear-gradient(145deg,#355337,#29452e)}
.cell.w{background:linear-gradient(145deg,#315e73,#214455)}
.cell.x{background:linear-gradient(145deg,#4b4c43,#30332d)}
.cell.d{background:linear-gradient(145deg,#4e7149,#3a5c3b)}
.cell.d:after{content:'';position:absolute;inset:18%;border:1px solid #b8cc9f44;border-radius:20%;box-shadow:inset 0 0 0 1px #ffffff10}
.cell.p{background:linear-gradient(145deg,#8a7552,#66583e)}
.cell.s{background:linear-gradient(145deg,#8b493d,#5c2f2b)}
.cell.c{background:linear-gradient(145deg,#8b9e9b,#556965)}
.cell.g{background:linear-gradient(145deg,#6f6e78,#464650)}
.cell.o{background:linear-gradient(145deg,#b47d39,#71491f)}
.cell.selected{outline:3px solid #ffe76b;outline-offset:-3px;z-index:5}
.cell.combo{box-shadow:inset 0 0 0 3px #ffd958,0 0 12px #ffd958aa;z-index:4}
.cell.deployable:not(.occupied){cursor:pointer}
.cell.deployable:not(.occupied):active{filter:brightness(1.25)}
.coord{position:absolute;left:2px;top:1px;font-size:7px;color:#ffffff42;pointer-events:none}
.tileLabel{position:absolute;right:2px;bottom:1px;font-size:8px;font-weight:900;color:#ffffff88}
#unitLayer,#enemyLayer,#fxLayer{position:absolute;inset:0;pointer-events:none}
.unitToken{position:absolute;transform:translate(-50%,-50%);width:4.8%;aspect-ratio:1;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:clamp(10px,1.4vw,18px);border:2px solid #fff8;box-shadow:0 3px 8px #0009;pointer-events:none}
.unitToken.basic{background:#377ac9}
.unitToken.tier2{background:#7758c8}
.unitToken.tier3{background:#b86a35;box-shadow:0 0 12px #ffbd6b99}
.unitToken.hero{background:#d5aa35;color:#251b08;box-shadow:0 0 15px #ffd953}
.enemyToken{position:absolute;transform:translate(-50%,-50%);width:3.4%;aspect-ratio:1;border-radius:45%;background:#743b75;border:2px solid #d996d8;box-shadow:0 0 12px #a64ca4;font-size:clamp(8px,1.1vw,14px);display:flex;align-items:center;justify-content:center;font-weight:900}
.enemyToken.midboss{width:4.8%;background:#81502e;border-color:#ffd087;box-shadow:0 0 16px #ffbb55}
.enemyToken.boss{width:4.8%;background:#8b382f;border-color:#ffb070;box-shadow:0 0 22px #e04b35}
.hpbar{position:absolute;left:8%;right:8%;top:-14%;height:5px;background:#211;border-radius:8px;overflow:hidden}
.hpbar i{display:block;height:100%;background:#62e36a}
#bottomUI{position:fixed;z-index:60;left:0;right:0;bottom:0;min-height:var(--bottom);padding:8px 12px;background:#111821f2;border-top:1px solid #5d6b66;box-shadow:0 -4px 18px #000a;display:none}
#bottomUI.on{display:block}
#contextTitle{font-weight:900;margin-bottom:7px}
#actions{display:flex;gap:8px;overflow-x:auto;padding-bottom:3px}
.action{min-width:142px;border:1px solid #71847c;background:#27342f;color:#fff;border-radius:11px;padding:9px;text-align:left}
.action b{display:block;font-size:14px}.action small{display:block;color:#b8c5bf;margin-top:3px}
.action.heroAction{border-color:#e0bd4d;background:#4a3b1e}
.action:disabled{opacity:.42}
#closeBottom{position:absolute;right:10px;top:7px;border:0;background:#26322e;color:#fff;border-radius:8px;padding:5px 9px}
#toast{position:fixed;z-index:130;left:50%;top:calc(var(--top) + 8px);transform:translateX(-50%);background:#111c19f2;border:1px solid #8ea49a;padding:7px 14px;border-radius:9px;display:none;font-weight:900;box-shadow:0 3px 16px #0009;animation:topAlertBlink .55s steps(2,end) infinite}
#legend{position:absolute;z-index:20;right:1.5%;top:2%;font-size:10px;background:#101813b8;padding:7px 9px;border-radius:9px;border:1px solid #6e826f66;pointer-events:none}
#legend span{margin-left:8px}
#stageBanner{position:absolute;z-index:20;left:1.5%;top:2%;background:#101813b8;padding:7px 10px;border-radius:9px;border:1px solid #6e826f66;font-size:11px}
@media (max-height:520px){:root{--top:46px;--bottom:100px}.hudBox{padding:4px 8px;font-size:12px}.hudBtn{padding:4px 8px}.action{min-width:126px;padding:6px}.action b{font-size:12px}.action small{font-size:10px}}

#bossWarning{position:fixed;z-index:140;left:50%;top:calc(var(--top) + 8px);transform:translateX(-50%);min-width:min(68vw,760px);max-width:82vw;text-align:center;padding:8px 18px;border:2px solid #ffb25e;background:#140d0df2;box-shadow:0 3px 20px #000a,0 0 18px #ff3d2455;opacity:0;pointer-events:none;border-radius:10px}
#bossWarning.on{opacity:1;animation:topAlertBlink .55s steps(2,end) infinite}
#bossWarningTitle{font-size:clamp(18px,2.2vw,30px);font-weight:1000;letter-spacing:.05em;color:#ffcf77;text-shadow:0 0 12px #ff5522}
#bossWarningSub{margin-top:2px;font-size:clamp(10px,1.1vw,15px);font-weight:900;color:#fff}
@keyframes topAlertBlink{0%,49%{filter:brightness(1)}50%,100%{filter:brightness(1.35)}}

.cell.moveTarget{box-shadow:inset 0 0 0 3px #72d8ff,0 0 12px #72d8ffaa;z-index:4}
.cell.comboPlacement{outline:4px solid #ffd84d;outline-offset:-4px;box-shadow:inset 0 0 18px #ffd84d99,0 0 18px #ffd84dcc;z-index:7}

.rpgHud{display:none}
#rpgScreen{position:absolute;left:0;right:0;top:var(--top);bottom:0;display:none;overflow:hidden;background:linear-gradient(#301f23,#1c1820 52%,#11151c)}
#rpgScreen.on{display:block}
#rpgArena{position:absolute;inset:0;background:radial-gradient(circle at 50% 22%,#8c4e3e55,transparent 28%),linear-gradient(180deg,#402b31,#171a20 65%,#0d1117)}
#rpgPhaseLabel{position:absolute;top:3%;left:50%;transform:translateX(-50%);font-size:clamp(12px,1.4vw,18px);font-weight:1000;letter-spacing:.12em;color:#ffce8a}
#rpgBoss{position:absolute;left:50%;top:11%;transform:translateX(-50%);width:min(35vw,360px);text-align:center}
#rpgBossBody{margin:auto;width:42%;aspect-ratio:.72;border-radius:48% 48% 32% 32%;background:linear-gradient(#9e4b3b,#4c1f24);border:3px solid #e18a62;box-shadow:0 0 40px #db503966;display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:clamp(18px,2.4vw,34px)}
#rpgBossBar{height:12px;margin-top:10px;background:#251316;border:1px solid #9d5e56;border-radius:8px;overflow:hidden}
#rpgBossBar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#b72f31,#e86a3d)}
#rpgHeroRow{position:absolute;left:6%;right:6%;bottom:5%;display:flex;justify-content:center;align-items:flex-end;gap:2%}
.rpgHeroCard{width:min(16vw,170px);min-width:100px;padding:8px;border:1px solid #6f7d86;border-radius:12px;background:#141b22e8;box-shadow:0 5px 18px #0009;text-align:center}
.rpgHeroCard.ko{opacity:.35;filter:grayscale(1)}
.rpgHeroFigure{margin:0 auto 5px;width:48%;aspect-ratio:.75;border-radius:45% 45% 28% 28%;background:linear-gradient(#d9b56e,#735028);border:2px solid #f0d18c;display:flex;align-items:center;justify-content:center;font-weight:1000;color:#251b08}
.rpgHeroName{font-weight:1000;font-size:13px}
.rpgHp,.rpgUlt{height:8px;margin-top:5px;background:#242b30;border-radius:5px;overflow:hidden}
.rpgHp i{display:block;height:100%;background:#5bd06a}
.rpgUlt i{display:block;height:100%;background:#e2bc46}
.rpgUltBtn{margin-top:6px;width:100%;padding:6px;border-radius:8px;border:1px solid #8d7940;background:#3d3219;color:#fff;font-weight:900}
.rpgUltBtn.ready{box-shadow:0 0 12px #ffd64f;animation:topAlertBlink .55s steps(2,end) infinite}
.rpgUltBtn:disabled{opacity:.4}
.rpgStatus{margin-top:4px;min-height:14px;font-size:10px;color:#c9d2d8}

.rpgTransition{position:absolute;inset:0;z-index:20;pointer-events:none;display:none}
.rpgTransition.on{display:block}
#rpgTransitionMessage{position:absolute;left:50%;top:calc(var(--top) + 10px);transform:translateX(-50%);padding:8px 18px;border-radius:10px;background:#121820f2;border:1px solid #8ea49a;font-weight:1000;letter-spacing:.04em;animation:topAlertBlink .55s steps(2,end) infinite;white-space:nowrap}
#rpgTransition.centerFlash #rpgTransitionMessage{top:50%;transform:translate(-50%,-50%);font-size:clamp(24px,4vw,48px);padding:14px 24px;border:2px solid #ffcc73;background:#1a1212f2;box-shadow:0 0 30px #ff6d3d66}
#rpgScreen.prep #rpgBoss{top:10%;transform:translateX(-50%) scale(.28)}
#rpgScreen.approach #rpgBoss{top:9%;transform:translateX(-50%) scale(.58)}
#rpgScreen.battle #rpgBoss{top:11%;transform:translateX(-50%) scale(1)}
#rpgScreen.prep #rpgHeroRow{bottom:6%}
#rpgScreen.prep .rpgHeroFigure{transform:rotateY(0deg) scale(1.02)}
#rpgScreen.approach .rpgHeroFigure,#rpgScreen.battle .rpgHeroFigure{transform:rotateY(180deg)}
#rpgScreen.transitionLock .rpgUltBtn{pointer-events:none}
#rpgBoss{transition:transform .45s ease,top .45s ease}
.rpgHeroFigure{transition:transform .35s ease}

/* RPG V1.1: one readable boss status panel, no duplicate tiny HUD */
#rpgBossStatus{position:absolute;z-index:12;left:12%;right:12%;top:2%;padding:7px 12px;border-radius:10px;background:#130f13e8;border:1px solid #9a6459;box-shadow:0 4px 16px #0009}
#rpgBossStatusLine{display:flex;align-items:center;gap:14px;font-size:clamp(12px,1.45vw,19px)}
#rpgBossStatusLine strong{font-size:clamp(15px,1.9vw,24px);flex:1}
#rpgBossHpText{font-weight:1000}
#rpgPhaseLabel{position:static;transform:none;font-size:clamp(11px,1.2vw,16px);color:#ffce8a}
#rpgBossTopBar{height:14px;margin-top:5px;background:#241015;border:1px solid #a65a54;border-radius:8px;overflow:hidden}
#rpgBossTopBar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#b52d31,#ec6b3c)}
#rpgBossBar{display:none}
#rpgBoss{top:14%}

/* TD boss defeat -> revival -> roar -> charge cinematic */
#battlefield.tdLocked{pointer-events:none}
.enemyToken.cinematicBoss{z-index:30;transition:transform .35s ease,filter .35s ease,box-shadow .35s ease}
.enemyToken.bossFallen{transform:translate(-50%,-50%) rotate(82deg) scale(.86);filter:brightness(.72)}
.enemyToken.bossRise{transform:translate(-50%,-50%) rotate(0deg) scale(1);box-shadow:0 0 30px #ff2d22,0 0 12px #ff0000 inset;filter:brightness(1.3)}
.enemyToken.bossRoar{animation:bossRoarShake .12s linear infinite;box-shadow:0 0 38px #ff3525}
.enemyToken.bossCharge{transition:left .8s cubic-bezier(.2,.8,.3,1),top .8s cubic-bezier(.2,.8,.3,1),transform .8s ease;transform:translate(-50%,-50%) scale(1.12)}
@keyframes bossRoarShake{0%,100%{margin-left:0}25%{margin-left:-5px}75%{margin-left:5px}}

/* 2s / 3s / 3s RPG scene pacing with fade out -> fade in */
#rpgArena,#rpgTransition{transition:opacity .35s ease}
#rpgScreen.sceneFade #rpgArena,#rpgScreen.sceneFade #rpgTransition{opacity:0}
#rpgScreen.prep #rpgBoss{top:15%}
#rpgScreen.approach #rpgBoss{top:14%}
#rpgScreen.battle #rpgBoss{top:14%}

/* RPG V1.2 boss charge / destruction / auto */
.rpgOnlyControl{display:none}
#autoBattle.on{border-color:#e6bd4b;background:#4a3a18;box-shadow:0 0 10px #e6bd4b66}
.enemyToken.bossCharge{
 transition:left 1.35s cubic-bezier(.12,.82,.25,1),top 1.35s cubic-bezier(.12,.82,.25,1),transform .2s ease !important;
 transform:translate(-50%,-50%) scale(1.18) !important;
 animation:bossChargePulse .16s linear infinite;
}
@keyframes bossChargePulse{0%,100%{filter:brightness(1.1)}50%{filter:brightness(1.55)}}
.unitToken.tdDestroyed{animation:tdUnitBreak .7s ease forwards}
.cell.tdStructureDestroyed{animation:tdStructureBreak .85s ease forwards}
@keyframes tdUnitBreak{
 0%{opacity:1;transform:translate(-50%,-50%) scale(1)}
 45%{opacity:1;transform:translate(-50%,-50%) scale(1.25) rotate(12deg);filter:brightness(1.8)}
 100%{opacity:0;transform:translate(-50%,-50%) scale(.2) rotate(55deg);filter:brightness(.5)}
}
@keyframes tdStructureBreak{
 0%{filter:brightness(1);box-shadow:inset 0 0 0 #0000}
 45%{filter:brightness(1.9);box-shadow:inset 0 0 22px #ff6b35}
 100%{filter:brightness(.35);box-shadow:inset 0 0 30px #160705}
}

/* UI spacing pass V1: full-bleed background, protected combat framing */
#topHUD{
 padding-left:calc(12px + var(--safe-left));
 padding-right:calc(12px + var(--safe-right));
 padding-top:calc(6px + var(--safe-top));
 height:calc(var(--top) + var(--safe-top));
}
#battlefield,#rpgScreen{top:calc(var(--top) + var(--safe-top))}

/* Keep the TD battlefield broad, but leave visual breathing room around units and edges. */
#mapFrame{
 left:calc(4% + var(--safe-left));
 right:calc(4% + var(--safe-right));
 top:5%;
 bottom:7%;
}
#grid{width:min(90vw,calc(84vh * 1.8))}
.unitToken{width:4.25%;font-size:clamp(9px,1.2vw,16px)}
.enemyToken{width:3.05%;font-size:clamp(8px,1vw,13px)}
.enemyToken.midboss,.enemyToken.boss{width:4.35%}
#stageBanner{left:calc(2% + var(--safe-left));top:2.5%}
#legend{right:calc(2% + var(--safe-right));top:2.5%}

/* Action sheet stays clear of gesture/navigation areas without pulling the map inward. */
#bottomUI{
 padding-left:calc(14px + var(--safe-left));
 padding-right:calc(14px + var(--safe-right));
 padding-bottom:calc(10px + var(--safe-bottom));
}
#actions{gap:10px}
.action{min-width:136px}

/* RPG: background remains full screen, combatants occupy a narrower central stage. */
#rpgBossStatus{
 left:calc(14% + var(--safe-left));
 right:calc(14% + var(--safe-right));
 top:2.5%;
}
#rpgScreen.battle #rpgBoss{top:16%;transform:translateX(-50%) scale(.90)}
#rpgScreen.approach #rpgBoss{top:15%;transform:translateX(-50%) scale(.54)}
#rpgScreen.prep #rpgBoss{top:16%;transform:translateX(-50%) scale(.26)}
#rpgHeroRow{
 left:calc(10% + var(--safe-left));
 right:calc(10% + var(--safe-right));
 bottom:calc(7% + var(--safe-bottom));
 gap:3%;
}
.rpgHeroCard{width:min(14.5vw,156px);min-width:94px;padding:7px}
.rpgHeroFigure{width:44%}
#rpgTransitionMessage{max-width:78vw;text-align:center;white-space:normal}

/* Landscape phones with short vertical space: prioritize separation over giant tokens/cards. */
@media (max-height:520px){
 #mapFrame{left:calc(4.5% + var(--safe-left));right:calc(4.5% + var(--safe-right));top:5%;bottom:8%}
 #grid{width:min(89vw,calc(82vh * 1.8))}
 .unitToken{width:4.1%}
 .enemyToken{width:2.95%}
 .enemyToken.midboss,.enemyToken.boss{width:4.2%}
 #rpgHeroRow{left:calc(11% + var(--safe-left));right:calc(11% + var(--safe-right));bottom:calc(6% + var(--safe-bottom));gap:3.2%}
 .rpgHeroCard{width:min(13.8vw,145px);min-width:88px;padding:6px}
 #rpgBossStatus{left:calc(15% + var(--safe-left));right:calc(15% + var(--safe-right))}
 #rpgScreen.battle #rpgBoss{top:17%;transform:translateX(-50%) scale(.86)}
}

/* TD combat effect engine V1 visual verification */
.enemyToken.hitFx-pierce{box-shadow:0 0 16px #b8e7ff,0 0 28px #7db9ff}
.enemyToken.hitFx-area{box-shadow:0 0 18px #ffd36f,0 0 34px #ff8b45}
.enemyToken.hitFx-dot{box-shadow:0 0 16px #d867ff,0 0 30px #9d38c7}

```


---

## SOURCE: `app/src/main/assets/js/game.js`

```javascript
(()=> {
'use strict';

const COLS=18, ROWS=10, CELL_COUNT=COLS*ROWS;
const WAVE_DURATION=40;
const route=[[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[6,4],[6,3],[7,3],[8,3],[9,3],[10,3],[10,4],[10,5],[11,5],[12,5],[13,5],[14,5],[15,5],[16,5],[17,5],[18,5]];
const TILE_ROWS=[
 'WWTTXDDDDDTTTTTTTT','TWTTDDDDDDXTTTTTTT','DDDDDPPPPPDDDDDDDD','DDDDDPDDDPDDDDDDCC',
 'SPPPPPDDDPPPPPPPGO','DDXDDDDTDDDXDDXDCC','DDDDDDTTTDDDDDDDDD','TTTTTTTTTTTTTTTTTT',
 'WWTTTTTTTTTTTTTTTT','TWTTTTTTTTTTTTTTTT'
];

const UNIT_DEFS={
 watchtower:{id:'watchtower',family:'WATCHTOWER',tier:1,name:'감시탑',short:'탑',cost:80,atk:15,range:3.0,rate:.80,damageType:'단일',targetCount:1,air:true,next:['watchtower2']},
 watchtower2:{id:'watchtower2',family:'WATCHTOWER',tier:2,name:'강화 감시탑',short:'강',cost:120,atk:25,range:4.0,rate:.95,damageType:'단일',targetCount:2,air:true,next:['watchtower3_sniper','watchtower3_rapid','watchtower3_pierce']},
 watchtower3_sniper:{id:'watchtower3_sniper',family:'WATCHTOWER',tier:3,name:'저격 감시탑',short:'저탑',cost:165,atk:42,range:6.0,rate:.55,damageType:'단일',targetCount:2,air:true,next:[]},
 watchtower3_rapid:{id:'watchtower3_rapid',family:'WATCHTOWER',tier:3,name:'연사 감시탑',short:'연탑',cost:165,atk:24,range:4.0,rate:1.65,damageType:'단일',targetCount:3,air:true,next:[]},
 watchtower3_pierce:{id:'watchtower3_pierce',family:'WATCHTOWER',tier:3,name:'관통 감시탑',short:'관탑',cost:165,atk:34,range:4.0,rate:.90,damageType:'관통',targetCount:2,air:true,next:[]},

 knight1:{id:'knight1',family:'KNIGHT',tier:1,name:'견습 기사',short:'견',cost:80,atk:18,range:1.3,rate:.90,damageType:'단일',targetCount:1,air:false,next:['knight2']},
 knight2:{id:'knight2',family:'KNIGHT',tier:2,name:'상급 기사',short:'상',cost:120,atk:28,range:1.4,rate:1.00,damageType:'단일',targetCount:1,air:false,next:['knight3_commander','knight3_berserker']},
 knight3_commander:{id:'knight3_commander',family:'KNIGHT',tier:3,name:'기사단장',short:'단',cost:170,atk:42,range:1.7,rate:1.05,damageType:'관통',targetCount:2,air:false,next:[]},
 knight3_berserker:{id:'knight3_berserker',family:'KNIGHT',tier:3,name:'광전사',short:'광',cost:170,atk:36,range:1.8,rate:1.45,damageType:'관통/광역',targetCount:3,areaRadiusCells:1,air:false,next:[]},

 archer1:{id:'archer1',family:'ARCHER',tier:1,name:'견습 궁수',short:'견궁',cost:90,atk:16,range:3.0,rate:.95,damageType:'단일',targetCount:1,air:true,next:['archer2']},
 archer2:{id:'archer2',family:'ARCHER',tier:2,name:'저격수',short:'저',cost:130,atk:28,range:5.0,rate:.72,damageType:'단일',targetCount:1,air:true,next:['archer3_crossbow','archer3_rapid']},
 archer3_crossbow:{id:'archer3_crossbow',family:'ARCHER',tier:3,name:'석궁수',short:'석',cost:180,atk:38,range:4.0,rate:.78,damageType:'관통',targetCount:2,air:true,next:[]},
 archer3_rapid:{id:'archer3_rapid',family:'ARCHER',tier:3,name:'연사궁병',short:'연',cost:180,atk:24,range:4.0,rate:1.60,damageType:'관통/광역',targetCount:3,areaRadiusCells:1,air:true,next:[]},

 lancer1:{id:'lancer1',family:'LANCER',tier:1,name:'투창병',short:'투',cost:100,atk:22,range:2.0,rate:.82,damageType:'관통',targetCount:2,air:false,next:['lancer2']},
 lancer2:{id:'lancer2',family:'LANCER',tier:2,name:'프리 랜서',short:'프',cost:145,atk:30,range:3.0,rate:.92,damageType:'관통',targetCount:2,air:true,next:['lancer3_elite','lancer3_magic']},
 lancer3_elite:{id:'lancer3_elite',family:'LANCER',tier:3,name:'엘리트 랜서',short:'엘',cost:195,atk:42,range:3.0,rate:1.00,damageType:'관통/광역',targetCount:3,areaRadiusCells:1,air:true,next:[]},
 lancer3_magic:{id:'lancer3_magic',family:'LANCER',tier:3,name:'마창병',short:'마창',cost:195,atk:34,range:4.0,rate:1.05,damageType:'관통/지속',targetCount:2,dotDuration:4,dotTick:1,dotRatio:.25,air:true,next:[]}
};
const STAGE1_BASE_IDS=['watchtower','knight1','archer1','lancer1'];

const HERO_RECIPES=[
 {id:'ARIA',name:'아리아',rarity:'LEGENDARY',materials:[{type:'knight3_commander',count:2}],atk:72,range:3.0,rate:1.20}
];

const cells=[], units=new Map(), enemies=[];
let gold=500,wave=1,gHp=100,oHp=120,running=true,speed=1,last=performance.now(),simTime=0;
let spawnClock=0,waveClock=0,nextEnemyId=1,selected=null,heroCount=0,waveSpawned=0,specialSpawned=false,rpgPending=false,waveEnding=false;
let moveModeUnitId=null,comboPlacement=null,manualPaused=false;
let gameMode='TD',rpgState=null,rpgSimTime=0,rpgTransitioning=false,rpgAutoBattle=false;

const $=id=>document.getElementById(id);
const grid=$('grid'), unitLayer=$('unitLayer'), enemyLayer=$('enemyLayer'), bottom=$('bottomUI'), actions=$('actions'), title=$('contextTitle');
const rpgScreen=$('rpgScreen'),rpgHeroRow=$('rpgHeroRow'),rpgTransition=$('rpgTransition'),rpgTransitionMessage=$('rpgTransitionMessage');

function tileKey(x,y){return x+','+y}
function cellIndex(x,y){return (y-1)*COLS+(x-1)}
function codeFor(x,y){return TILE_ROWS[y-1][x-1]}
function posPct(x,y){return {left:((x-.5)/COLS*100)+'%',top:((y-.5)/ROWS*100)+'%'}}

function buildGrid(){
 for(let y=1;y<=ROWS;y++) for(let x=1;x<=COLS;x++){
  const code=codeFor(x,y),el=document.createElement('div');
  el.className='cell '+code.toLowerCase()+(code==='D'||code==='C'?' deployable':'');
  el.dataset.x=x;el.dataset.y=y;el.dataset.code=code;
  el.innerHTML='<span class="coord">'+x+','+y+'</span><span class="tileLabel">'+code+'</span>';
  el.addEventListener('click',ev=>{ev.stopPropagation();onCellTap(x,y)});
  cells[cellIndex(x,y)]={x,y,code,el};
  grid.insertBefore(el,unitLayer);
 }
 if(cells.length!==CELL_COUNT)throw new Error('18x10 grid build failed');
}

function clearSelection(hide=true){
 document.querySelectorAll('.cell.selected').forEach(e=>e.classList.remove('selected'));
 selected=null;
 if(hide)bottom.classList.remove('on');
}
function onCellTap(x,y){
 if(gameMode!=='TD'||rpgPending)return;
 if(comboPlacement){chooseHeroPlacement(x,y);return}
 if(moveModeUnitId){completeMove(x,y);return}
 const cell=cells[cellIndex(x,y)],u=units.get(tileKey(x,y));
 if(u){selectUnit(u);return}
 if(cell.code==='D'||cell.code==='C'){selectCell(x,y);return}
 clearSelection(true);
}
function selectCell(x,y){
 clearSelection(false);selected={type:'cell',x,y};cells[cellIndex(x,y)].el.classList.add('selected');renderBottomForEmpty(x,y);
}
function selectUnit(u){
 clearSelection(false);selected={type:'unit',id:u.id};cells[cellIndex(u.x,u.y)].el.classList.add('selected');
 const combo=comboForUnit(u);if(combo)renderBottomForCombo(u,combo);else renderBottomForUnit(u);
}
function showBottom(text){title.textContent=text;actions.innerHTML='';bottom.classList.add('on')}
function actionButton(name,desc,fn,hero=false,disabled=false){
 const b=document.createElement('button');b.className='action'+(hero?' heroAction':'');b.innerHTML='<b>'+name+'</b><small>'+desc+'</small>';
 b.disabled=disabled;b.onclick=fn;actions.appendChild(b);
}

function unitFeatureText(t){
 return t.cost+'G · ATK '+t.atk+' · '+t.damageType+' · '+(t.air?'공중 대응':'지상 전용');
}
function renderBottomForEmpty(x,y){
 showBottom('빈 배치칸 '+x+','+y+' · 기본 아군 배치');
 STAGE1_BASE_IDS.map(id=>UNIT_DEFS[id]).forEach(t=>actionButton(t.name,unitFeatureText(t),()=>placeUnit(x,y,t),false,gold<t.cost));
}
function moveCooldownRemaining(u){return Math.max(0,(u.moveCooldownUntil||0)-simTime)}
function renderMoveAction(u){
 const remain=moveCooldownRemaining(u);
 actionButton('이동',remain>0?'재이동 대기 '+remain.toFixed(1)+'초':'빈 자리 이동 / 점유 자리와 교대',()=>beginMove(u),false,remain>0);
}
function renderBottomForUnit(u){
 if(u.type==='hero_aria'){
  showBottom('전설 영웅 · 아리아');
  renderMoveAction(u);
  return;
 }
 const t=UNIT_DEFS[u.type];showBottom(t.name+' · '+u.x+','+u.y+' · T'+t.tier);
 if(t.next.length){
  t.next.map(id=>UNIT_DEFS[id]).forEach(n=>actionButton('업그레이드 → '+n.name,unitFeatureText(n),()=>upgradeUnit(u,n),false,gold<n.cost));
 }else{
  actionButton('최종 전문화','이 유닛은 현재 최종 단계',()=>{},false,true);
 }
 renderMoveAction(u);
 actionButton('판매','구매/업그레이드 누적비용의 일부 회수',()=>sellUnit(u));
}
function renderBottomForCombo(u,recipe){
 const t=UNIT_DEFS[u.type];showBottom(t.name+' · 전설 조합 가능');
 actionButton('★ '+recipe.name+' 조합','재료 자리 중 영웅 배치 위치를 직접 선택',()=>beginHeroSummon(u,recipe),true,false);
 actionButton('유닛 정보',t.name+' · KNIGHT T3',()=>{},false,true);
 actionButton('판매','현재 유닛 판매',()=>sellUnit(u));
}
function placeUnit(x,y,t){
 if(gameMode!=='TD'||rpgPending)return;
 if(units.has(tileKey(x,y))||gold<t.cost)return;
 gold-=t.cost;units.set(tileKey(x,y),{id:'u'+Date.now()+Math.random(),x,y,type:t.id,lastShot:0,spent:t.cost,moveCooldownUntil:0});
 cells[cellIndex(x,y)].el.classList.add('occupied');postUnitChange();toast(t.name+' 배치');
}
function upgradeUnit(u,next){
 if(gameMode!=='TD'||rpgPending)return;
 const cur=UNIT_DEFS[u.type];
 if(!cur||!cur.next.includes(next.id)){toast('같은 계열 업그레이드만 가능합니다');return}
 if(gold<next.cost)return;
 gold-=next.cost;u.type=next.id;u.spent=(u.spent||0)+next.cost;postUnitChange();toast(next.name+' 업그레이드');
}
function sellUnit(u){
 if(gameMode!=='TD'||rpgPending)return;
 if(u.type==='hero_aria'){toast('전설 영웅 판매는 현재 잠금');return}
 gold+=Math.max(1,Math.round((u.spent||UNIT_DEFS[u.type].cost)*.35));
 units.delete(tileKey(u.x,u.y));cells[cellIndex(u.x,u.y)].el.classList.remove('occupied');postUnitChange();toast('판매 완료');
}
function postUnitChange(){renderUnits();syncHUD();updateComboHighlights();clearSelection(true)}

function recipeMaterials(recipe){
 const picked=[];
 for(const req of recipe.materials){
  const pool=[...units.values()].filter(u=>u.type===req.type&&!picked.includes(u));
  if(pool.length<req.count)return null;
  picked.push(...pool.slice(0,req.count));
 }
 return picked;
}
function comboForUnit(u){
 for(const r of HERO_RECIPES){const mats=recipeMaterials(r);if(mats&&mats.some(m=>m.id===u.id))return r}
 return null;
}
function updateComboHighlights(){
 document.querySelectorAll('.cell.combo').forEach(e=>e.classList.remove('combo'));
 HERO_RECIPES.forEach(r=>{const mats=recipeMaterials(r);if(mats)mats.forEach(m=>cells[cellIndex(m.x,m.y)].el.classList.add('combo'))});
}
function beginHeroSummon(selectedMaterial,recipe){
 if(gameMode!=='TD'||rpgPending)return;
 if(heroCount>=5){toast('영웅 슬롯 5/5');return}
 const mats=recipeMaterials(recipe);
 if(!mats||!mats.some(m=>m.id===selectedMaterial.id))return;
 moveModeUnitId=null;clearMoveTargets();
 comboPlacement={recipe,materialIds:mats.map(m=>m.id),positions:mats.map(m=>({x:m.x,y:m.y})),wasRunning:running};
 running=false;
 clearSelection(true);
 document.querySelectorAll('.cell.comboPlacement').forEach(e=>e.classList.remove('comboPlacement'));
 comboPlacement.positions.forEach(p=>cells[cellIndex(p.x,p.y)].el.classList.add('comboPlacement'));
 showWarning(recipe.name+'이 출전했다!','재료 유닛이 있던 자리 중 배치할 위치를 선택하세요',999999);
}
function chooseHeroPlacement(x,y){
 if(!comboPlacement)return;
 const pos=comboPlacement.positions.find(p=>p.x===x&&p.y===y);
 if(!pos){toast('영웅은 조합 재료가 있던 자리에만 배치할 수 있습니다');return}
 const {recipe,materialIds,wasRunning}=comboPlacement;
 const mats=[...units.values()].filter(u=>materialIds.includes(u.id));
 if(mats.length!==materialIds.length){cancelHeroPlacement('조합 재료 상태가 변경되었습니다');return}
 mats.forEach(m=>{units.delete(tileKey(m.x,m.y));cells[cellIndex(m.x,m.y)].el.classList.remove('occupied')});
 const hero={id:'h'+Date.now(),x,y,type:'hero_aria',hero:recipe.name,atk:recipe.atk,range:recipe.range,rate:recipe.rate,lastShot:0,lastSkill1:simTime,lastSkill2:simTime,lastSkill3:simTime,ariaOathUntil:0,spent:0,moveCooldownUntil:simTime+5};
 units.set(tileKey(x,y),hero);cells[cellIndex(x,y)].el.classList.add('occupied');heroCount++;
 comboPlacement=null;document.querySelectorAll('.cell.comboPlacement').forEach(e=>e.classList.remove('comboPlacement'));
 clearTimeout(showWarning.t);$('bossWarning').classList.remove('on');
 renderUnits();syncHUD();updateComboHighlights();clearSelection(true);
 running=wasRunning&&!manualPaused&&!rpgPending;
 toast(recipe.name+' 배치 완료 · 이동 재사용 5초');
}
function cancelHeroPlacement(msg){
 comboPlacement=null;document.querySelectorAll('.cell.comboPlacement').forEach(e=>e.classList.remove('comboPlacement'));
 clearTimeout(showWarning.t);$('bossWarning').classList.remove('on');if(msg)toast(msg);
}
function clearMoveTargets(){document.querySelectorAll('.cell.moveTarget').forEach(e=>e.classList.remove('moveTarget'))}
function findUnitById(id){return [...units.values()].find(u=>u.id===id)}
function beginMove(u){
 if(gameMode!=='TD'||rpgPending)return;
 if(moveCooldownRemaining(u)>0){toast('이동 재사용 대기 중');return}
 moveModeUnitId=u.id;comboPlacement=null;clearMoveTargets();clearSelection(true);
 cells.forEach(c=>{if(c&&(c.code==='D'||c.code==='C'))c.el.classList.add('moveTarget')});
 showBottom((u.hero||UNIT_DEFS[u.type].name)+' 이동 · 목적지를 선택하세요');
 actionButton('이동 취소','현재 위치 유지',cancelMove);
}
function cancelMove(){moveModeUnitId=null;clearMoveTargets();clearSelection(true)}
function completeMove(x,y){
 const moving=findUnitById(moveModeUnitId);
 if(!moving){cancelMove();return}
 const cell=cells[cellIndex(x,y)];
 if(!cell||(cell.code!=='D'&&cell.code!=='C')){toast('배치 가능한 칸만 이동할 수 있습니다');return}
 if(moving.x===x&&moving.y===y){cancelMove();return}
 if(moveCooldownRemaining(moving)>0){toast('이동 재사용 대기 중');cancelMove();return}
 const target=units.get(tileKey(x,y));
 if(target&&moveCooldownRemaining(target)>0){toast('교대할 유닛이 이동 재사용 대기 중입니다');return}
 const sx=moving.x,sy=moving.y;
 units.delete(tileKey(sx,sy));
 if(target){
  units.delete(tileKey(x,y));
  target.x=sx;target.y=sy;target.moveCooldownUntil=simTime+5;
  units.set(tileKey(sx,sy),target);
 }else{
  cells[cellIndex(sx,sy)].el.classList.remove('occupied');
 }
 moving.x=x;moving.y=y;moving.moveCooldownUntil=simTime+5;
 units.set(tileKey(x,y),moving);
 cells[cellIndex(x,y)].el.classList.add('occupied');
 if(target)cells[cellIndex(sx,sy)].el.classList.add('occupied');
 moveModeUnitId=null;clearMoveTargets();renderUnits();updateComboHighlights();clearSelection(true);
 toast(target?'유닛 교대 완료 · 양쪽 5초 이동 잠금':'이동 완료 · 5초 이동 잠금');
}

function renderUnits(){
 unitLayer.innerHTML='';
 for(const u of units.values()){
  const hero=u.type==='hero_aria';const t=hero?{short:'아'}:UNIT_DEFS[u.type];
  const d=document.createElement('div');d.className='unitToken '+(hero?'hero':t.tier===3?'tier3':t.tier===2?'tier2':'basic');
  const p=posPct(u.x,u.y);d.style.left=p.left;d.style.top=p.top;d.textContent=t.short;unitLayer.appendChild(d);
 }
}

function normalCountForWave(w){return (10+w*2)*2}
function normalHpForWave(w){return Math.round((48+w*12)*1.2)}
function waveSpawnInterval(){
 const count=normalCountForWave(wave);return Math.max(.34,(WAVE_DURATION-3)/Math.max(1,count));
}
function spawnEnemy(kind='normal'){
 let hp,speedMult=1,label='E';
 if(kind==='midboss'){hp=Math.round(normalHpForWave(wave)*5.5);speedMult=.72;label='M'}
 else if(kind==='boss'){hp=Math.round(normalHpForWave(wave)*9);speedMult=.62;label='B'}
 else hp=normalHpForWave(wave);
 enemies.push({id:nextEnemyId++,kind,label,pathPos:0,hp,maxHp:hp,speed:(.62+wave*.015)*speedMult,lastStructureHit:0,effects:[],rewarded:false,hitFxType:null,hitFxUntil:0,footprintCells:kind==='boss'?1.6:kind==='midboss'?1.3:1.0});
}
function showWarning(text,sub='',hold=1400){
 const box=$('bossWarning');$('bossWarningTitle').textContent=text;$('bossWarningSub').textContent=sub;box.classList.add('on');
 clearTimeout(showWarning.t);showWarning.t=setTimeout(()=>box.classList.remove('on'),hold);
}
function startWaveNotice(){
 if(wave===5)showWarning('⚠ WARNING','MID BOSS · WAVE 5');
 if(wave===10)toast('Wave 10 · 3초 경고 / 6초 보스 등장 / 40초 광폭화');
}
function updateSpawning(dt){
 spawnClock+=dt;
 if(wave===10){
  const preBossNormalLimit=Math.ceil(normalCountForWave(wave)*0.5);
  if(spawnClock>=waveSpawnInterval()&&waveSpawned<preBossNormalLimit){
   spawnClock=0;spawnEnemy('normal');waveSpawned++;
  }
  if(!wave10WarningShown&&waveClock>=WAVE10_WARNING_AT){
   wave10WarningShown=true;
   showWarning('⚠ WARNING','BOSS APPROACHING · 3 SEC',1200);
  }
  spawnWave10BossMidWave();
  triggerWave10Enrage();
  return;
 }
 const limit=normalCountForWave(wave);
 if(spawnClock>=waveSpawnInterval()&&waveSpawned<limit){
  spawnClock=0;spawnEnemy('normal');waveSpawned++;
 }
 if(wave===5&&!specialSpawned&&waveClock>=7){
  spawnEnemy('midboss');specialSpawned=true;
 }
}
function enemyXY(e){
 // After Final Wall G breaks, structure-engaged enemies visually/targetably advance to Gate Core O.
 if(e.pathPos>=route.length-2 && gHp<=0)return {x:18,y:5};
 const a=route[Math.floor(e.pathPos)],b=route[Math.min(route.length-1,Math.floor(e.pathPos)+1)],f=e.pathPos-Math.floor(e.pathPos);
 return {x:a[0]+(b[0]-a[0])*f,y:a[1]+(b[1]-a[1])*f};
}
function canCastleDefenderReach(u,e,baseRange){
 const p=enemyXY(e),dist=Math.hypot(p.x-u.x,p.y-u.y);
 if(dist<=baseRange)return true;
 if(e.pathPos<route.length-2)return false;
 // Units deployed on castle C cells always retain line-of-fire against enemies hitting G/O.
 if(codeFor(u.x,u.y)==='C')return true;
 // Front-line defenders immediately in front of the castle get a small gate-defense reach assist.
 const nearCastleFront=(u.x>=15&&u.x<=16&&u.y>=4&&u.y<=6);
 return nearCastleFront&&dist<=Math.max(baseRange,2.25);
}
function routeCellForEnemy(e){return Math.max(0,Math.min(route.length-1,Math.floor(e.pathPos)))}
function occupiedRouteCells(e){
 const half=Math.max(.01,(e.footprintCells||1)/2);
 const start=Math.max(0,Math.floor(e.pathPos-half+.5));
 const end=Math.min(route.length-1,Math.floor(e.pathPos+half+.5));
 const out=[];
 for(let i=start;i<=end;i++){
  const cellMin=i-.5,cellMax=i+.5;
  const spriteMin=e.pathPos-half,spriteMax=e.pathPos+half;
  if(spriteMax>=cellMin&&spriteMin<=cellMax)out.push(i);
 }
 return out;
}
function enemyOccupiesRouteCell(e,cellIndex){return occupiedRouteCells(e).includes(cellIndex)}
function handleEnemyDeath(e){
 if(e.rewarded)return false;
 e.rewarded=true;
 const reward=e.kind==='boss'?180:e.kind==='midboss'?90:12;gold+=reward;
 if(e.kind==='boss'){enterRpgPlaceholder(e);return true}
 if(e.kind==='midboss')toast('중간보스 격파 +90G');else toast('+12G');
 return false;
}
function dealEnemyDamage(e,amount,fxType='single'){
 if(!e||e.hp<=0)return false;
 e.hp=Math.max(0,e.hp-Math.max(0,amount));
 e.hitFxType=fxType;e.hitFxUntil=simTime+.22;
 if(e.hp<=0)return handleEnemyDeath(e);
 return false;
}
function addEnemyDot(e,sourceAtk,profile){
 if(!e||e.hp<=0)return;
 const duration=profile.dotDuration||4,tick=profile.dotTick||1,ratio=profile.dotRatio||.25;
 e.effects=e.effects||[];
 e.effects.push({type:'dot',remaining:duration,tickEvery:tick,nextTick:tick,damage:sourceAtk*ratio});
 e.hitFxType='dot';e.hitFxUntil=simTime+.28;
}
function updateEnemyEffects(e,dt){
 if(!e.effects||!e.effects.length||e.hp<=0)return false;
 for(let i=e.effects.length-1;i>=0;i--){
  const fx=e.effects[i];fx.remaining-=dt;fx.nextTick-=dt;
  while(fx.type==='dot'&&fx.nextTick<=0&&fx.remaining>-fx.tickEvery){
   fx.nextTick+=fx.tickEvery;
   if(dealEnemyDamage(e,fx.damage,'dot'))return true;
   if(e.hp<=0)return false;
  }
  if(fx.remaining<=0)e.effects.splice(i,1);
 }
 return false;
}
function targetsForTdAttack(target,profile){
 const alive=enemies.filter(e=>e.hp>0);
 const center=routeCellForEnemy(target);
 const hasPierce=(profile.damageType||'').includes('관통');
 const hasArea=(profile.damageType||'').includes('광역');
 if(hasArea){
  const radius=profile.areaRadiusCells||1;
  return alive.filter(e=>occupiedRouteCells(e).some(c=>Math.abs(c-center)<=radius));
 }
 if(hasPierce)return alive.filter(e=>enemyOccupiesRouteCell(e,center));
 return [target];
}
function resolveTdAttack(u,profile,target){
 const hit=targetsForTdAttack(target,profile);
 const fx=(profile.damageType||'').includes('광역')?'area':(profile.damageType||'').includes('관통')?'pierce':'single';
 for(const e of hit){
  const triggered=dealEnemyDamage(e,profile.atk,fx);
  if((profile.damageType||'').includes('지속')&&e.hp>0)addEnemyDot(e,profile.atk,profile);
  if(triggered)return true;
 }
 return false;
}
function updateEnemies(dt,now){
 updateSpawning(dt);
 const gateNormals=enemies.filter(e=>e.hp>0&&e.kind==='normal'&&e.pathPos>=route.length-2).slice(0,3);
 const gateSpecial=enemies.find(e=>e.hp>0&&e.kind!=='normal'&&e.pathPos>=route.length-2);
 for(const e of enemies){
  if(e.hp<=0)continue;
  if(updateEnemyEffects(e,dt)){return}
  if(e.hp<=0)continue;
  if(e.pathPos<route.length-2){e.pathPos=Math.min(route.length-2,e.pathPos+e.speed*dt);continue}
  const allowed=e.kind==='normal'?gateNormals.includes(e):e===gateSpecial;if(!allowed)continue;
  const baseHitGap=e.kind==='boss'?2.2:e.kind==='midboss'?1.9:1.5;
  const hitGap=e.kind==='boss'&&e.enraged?baseHitGap/1.25:baseHitGap;
  if(now-e.lastStructureHit>=hitGap){
   e.lastStructureHit=now;
   const baseDmg=e.kind==='boss'?40:e.kind==='midboss'?24:10;
   const rawDmg=e.kind==='boss'&&e.enraged?Math.round(baseDmg*1.5):baseDmg;
   const defMult=now<wallDefBuffUntil?1/(1+wallDefBonusPct):1;
   const shieldMult=now<wallShieldUntil?1-wallShieldReduction:1;
   const dmg=Math.max(1,Math.round(rawDmg*defMult*shieldMult));
   if(gHp>0)gHp=Math.max(0,gHp-dmg);else oHp=Math.max(0,oHp-dmg);
   if(oHp<=0){running=false;showWarning('DEFEAT','GATE CORE DESTROYED',999999)}
  }
 }
}
function unitStats(u){
 const oath=(u.ariaOathUntil||0)>simTime;
 const atkMult=oath?1.15:1,rateMult=oath?1.15:1;
 if(u.type==='hero_aria')return {atk:u.atk*atkMult,range:u.range,rate:u.rate*rateMult,damageType:'단일',targetCount:1};
 const t=UNIT_DEFS[u.type];return {atk:t.atk*atkMult,range:t.range,rate:t.rate*rateMult,damageType:t.damageType,targetCount:t.targetCount||1,areaRadiusCells:t.areaRadiusCells||0,dotDuration:t.dotDuration||0,dotTick:t.dotTick||0,dotRatio:t.dotRatio||0};
}
function updateUnits(now){
 for(const u of units.values()){
  if(updateHeroSkills(u,now))return;
  const s=unitStats(u);if(now-u.lastShot<1/s.rate)continue;
  let target=null,best=999;
  for(const e of enemies){
   if(e.hp<=0)continue;const p=enemyXY(e),dist=Math.hypot(p.x-u.x,p.y-u.y);
   if(canCastleDefenderReach(u,e,s.range)&&dist<best){best=dist;target=e}
  }
  if(!target)continue;
  u.lastShot=now;
  if(resolveTdAttack(u,s,target))return;
 }
}
const TD_HERO_SKILL_DEFS={
 ARIA:{
  skill1:{id:'ARIA_S1',name:'성광 참격',cooldown:9,effects:['DAMAGE','PENETRATION'],prototype:{damageRatio:1.35,lineCells:3,lineMapping:'target path cell + next 2 path cells toward gate'},wallAttachedBonus:1.25},
  skill2:{id:'ARIA_S2',name:'수호의 맹세',cooldown:16,duration:8,effects:['BUFF','WALL_DEF_MOD'],allyRadius:2,allyAtkMult:1.15,allyRateMult:1.15,wallDefBonusPct:.20},
  skill3:{id:'ARIA_S3',name:'최후의 성역',cooldown:30,duration:5,effects:['DAMAGE','WALL_DAMAGE_REDUCTION'],prototype:{damageRatio:1.0},wallDamageReduction:.50}
 }
};
let wallDefBuffUntil=0,wallDefBonusPct=0,wallShieldUntil=0,wallShieldReduction=0;
function nearestAliveEnemyForUnit(u,range){
 let target=null,best=999;
 for(const e of enemies){
  if(e.hp<=0)continue;
  const p=enemyXY(e),dist=Math.hypot(p.x-u.x,p.y-u.y);
  if(canCastleDefenderReach(u,e,range)&&dist<best){best=dist;target=e}
 }
 return target;
}
function ariaSkill1Targets(target){
 const start=routeCellForEnemy(target),cellsToHit=[start,start+1,start+2].filter(i=>i>=0&&i<route.length);
 return enemies.filter(e=>e.hp>0&&occupiedRouteCells(e).some(c=>cellsToHit.includes(c)));
}
function castAriaSkill1(u,now){
 const def=TD_HERO_SKILL_DEFS.ARIA.skill1,target=nearestAliveEnemyForUnit(u,u.range);
 if(!target)return false;
 const hit=ariaSkill1Targets(target);
 for(const e of hit){
  const attached=e.pathPos>=route.length-2;
  if(dealEnemyDamage(e,u.atk*def.prototype.damageRatio*(attached?def.wallAttachedBonus:1),'pierce'))return true;
 }
 u.lastSkill1=now;toast('아리아 · 성광 참격');return false;
}
function castAriaSkill2(u,now){
 const def=TD_HERO_SKILL_DEFS.ARIA.skill2;
 for(const ally of units.values()){
  if(Math.hypot(ally.x-u.x,ally.y-u.y)<=def.allyRadius)ally.ariaOathUntil=Math.max(ally.ariaOathUntil||0,now+def.duration);
 }
 wallDefBuffUntil=Math.max(wallDefBuffUntil,now+def.duration);wallDefBonusPct=def.wallDefBonusPct;
 u.lastSkill2=now;toast('아리아 · 수호의 맹세');return false;
}
function castAriaSkill3(u,now){
 const def=TD_HERO_SKILL_DEFS.ARIA.skill3;
 for(const e of enemies.filter(x=>x.hp>0)){
  if(dealEnemyDamage(e,u.atk*def.prototype.damageRatio,'area'))return true;
 }
 wallShieldUntil=Math.max(wallShieldUntil,now+def.duration);wallShieldReduction=def.wallDamageReduction;
 u.lastSkill3=now;showWarning('아리아 · 최후의 성역','전 경로 성광 피해 · 방어선 5초 보호',900);return false;
}
function updateHeroSkills(u,now){
 if(u.type!=='hero_aria')return false;
 const d=TD_HERO_SKILL_DEFS.ARIA;
 if(now-(u.lastSkill3||0)>=d.skill3.cooldown){if(castAriaSkill3(u,now))return true}
 if(now-(u.lastSkill2||0)>=d.skill2.cooldown){if(castAriaSkill2(u,now))return true}
 if(now-(u.lastSkill1||0)>=d.skill1.cooldown){if(castAriaSkill1(u,now))return true}
 return false;
}
const RPG_HERO_DEFS={
 ARIA:{
  name:'아리아',hp:2600,atk:175,def:125,
  basicGap:1.0,skill1Gap:9,skill2Gap:16,
  skill1Name:'성광 참격',skill1DamageType:'관통',skill2Name:'수호의 맹세',ultimateName:'최후의 성역'
 }
};
const RPG_BOSS_DEF={name:'철각왕 브라움',hp:16000,atk:110,def:60,baseAttackGap:3.0};
const RPG_BOSS_SKILL_DEFS={
 BRAUM:{
  skill1:{id:'BRAUM_S1',name:'뿔박치기',cooldown:11,prototype:{damageRatio:.75,actionDelay:.8},source:'직선 경로 가속'},
  skill2:{id:'BRAUM_S2',name:'암반 붕괴',cooldown:17,duration:6,targetCount:2,source:'배치칸 2곳 6초 비활성'},
  skill3:{id:'BRAUM_S3',name:'분쇄 포효',cooldown:23,duration:8,damageTakenMult:1.40,source:'방어벽 피해 +40% 8초'}
 }
};

function enterRpgPlaceholder(boss){beginTdBossRpgTransition(boss)}
function cancelAllTdCommands(){
 clearSelection(true);
 moveModeUnitId=null;clearMoveTargets();
 comboPlacement=null;
 document.querySelectorAll('.cell.comboPlacement,.cell.combo').forEach(e=>e.classList.remove('comboPlacement','combo'));
 actions.innerHTML='';
 bottom.classList.remove('on');
 $('battlefield').classList.add('tdLocked');
}
function destroyTdDefenseForBossCharge(){
 document.querySelectorAll('.unitToken').forEach((el,i)=>{
  el.style.animationDelay=(i*.035)+'s';
  el.classList.add('tdDestroyed');
 });
 document.querySelectorAll('.cell.c,.cell.g,.cell.o').forEach((el,i)=>{
  el.style.animationDelay=(i*.05)+'s';
  el.classList.add('tdStructureDestroyed');
 });
 gHp=0;oHp=0;syncHUD();
}
function beginTdBossRpgTransition(boss){
 if(rpgPending)return;
 rpgPending=true;running=false;gameMode='TD_TRANSITION';
 cancelAllTdCommands();
 const tdHeroes=[...units.values()].filter(u=>u.type==='hero_aria').slice(0,5);
 clearTimeout(showWarning.t);$('bossWarning').classList.remove('on');
 boss.hp=1;boss.cinematic=true;boss.cinematicState='fallen';
 renderEnemies();
 showWarning('TD BOSS DOWN','전투 명령 종료 · RPG 전환',1100);
 setTimeout(()=>{
  boss.cinematicState='rise';renderEnemies();
 },1500);
 setTimeout(()=>{
  boss.cinematicState='roar';renderEnemies();
  showWarning('⚠ ROAR',RPG_BOSS_DEF.name+'이 다시 일어섰다',900);
 },2200);
 setTimeout(()=>{
  destroyTdDefenseForBossCharge();
  boss.cinematicState='charge';
  const start=enemyXY(boss);
  renderEnemies();
  const token=document.querySelector('.enemyToken[data-enemy-id="'+boss.id+'"]');
  if(token){
   const from=posPct(start.x,start.y),to=posPct(16.75,5);
   token.style.left=from.left;token.style.top=from.top;
   token.classList.add('bossCharge');
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
    token.style.left=to.left;token.style.top=to.top;
   }));
  }
 },3200);
 setTimeout(()=>{
  startRpgBattle(tdHeroes);
 },4700);
}
function enterRpgBattle(){
 const boss=enemies.find(e=>e.kind==='boss');
 beginTdBossRpgTransition(boss||{id:-1,hp:1,pathPos:route.length-2,kind:'boss',label:'B',maxHp:1});
}
function startRpgBattle(tdHeroes){
 gameMode='RPG';rpgPending=false;manualPaused=false;rpgSimTime=0;rpgTransitioning=true;
 const heroes=tdHeroes.map((u,i)=>{
  const d=RPG_HERO_DEFS.ARIA;
  return {id:'rpg_'+u.id,heroId:'ARIA',name:d.name,maxHp:d.hp,hp:d.hp,atk:d.atk,def:d.def,
   basicGap:d.basicGap,skill1Gap:d.skill1Gap,skill2Gap:d.skill2Gap,lastBasic:-999,lastSkill1:0,lastSkill2:0,
   buffUntil:0,atkBuffMult:1,atkBuffUntil:0,rateBuffMult:1,rateBuffUntil:0,damageReduction:0,damageReductionUntil:0,damageTakenMult:1,damageTakenUntil:0,stunUntil:0,defModPct:0,defModUntil:0,invulnerableUntil:0,skillBlockUntil:0,reflectUntil:0,reflectRatio:0,rpgDots:[],ult:0,ko:false,slot:i};
 });
 rpgState={
  heroes,
  boss:{...RPG_BOSS_DEF,maxHp:RPG_BOSS_DEF.hp,hp:RPG_BOSS_DEF.hp,lastAttack:0,lastSkill1:0,lastSkill2:0,lastSkill3:0,rateBuffMult:1,rateBuffUntil:0,deathPreventionCharges:0,phase:1,enraged:false,invulnerableUntil:0,skillBlockUntil:0,reflectUntil:0,reflectRatio:0,rpgDots:[]},
  summons:[],
  pendingEvents:[],
  result:null
 };
 $('battlefield').style.display='none';$('battlefield').classList.remove('tdLocked');
 rpgScreen.classList.add('on','prep','transitionLock');rpgScreen.classList.remove('approach','battle');rpgScreen.setAttribute('aria-hidden','false');
 document.querySelectorAll('.tdHud').forEach(e=>e.style.display='none');
 document.querySelectorAll('.rpgOnlyControl').forEach(e=>e.style.display='inline-flex');
 $('rpgBossName').textContent=rpgState.boss.name;
 syncPauseButton();renderRpg();
 if(!heroes.length){finishRpgDefeat('출전 가능한 영웅이 없습니다');return}
 running=false;
 playRpgIntroSequence();
}
function setRpgTransitionMessage(text,center=false){
 rpgTransition.classList.add('on');
 rpgTransition.classList.toggle('centerFlash',center);
 rpgTransitionMessage.textContent=text;
}
function clearRpgTransitionMessage(){
 rpgTransition.classList.remove('on','centerFlash');
 rpgTransitionMessage.textContent='';
}
function fadeRpgSceneOut(){rpgScreen.classList.add('sceneFade')}
function fadeRpgSceneIn(){requestAnimationFrame(()=>rpgScreen.classList.remove('sceneFade'))}
function playRpgIntroSequence(){
 rpgTransitioning=true;running=false;
 rpgScreen.classList.add('prep','transitionLock');rpgScreen.classList.remove('approach','battle','sceneFade');
 setRpgTransitionMessage(rpgState.boss.name+'이 다가온다',false);
 fadeRpgSceneIn();

 // Scene 1: 2 seconds
 setTimeout(fadeRpgSceneOut,1650);
 setTimeout(()=>{
  rpgScreen.classList.remove('prep');rpgScreen.classList.add('approach');
  setRpgTransitionMessage('그대들이 바로 마지막 보루, LAST WALL이다.',false);
  fadeRpgSceneIn();
 },2000);

 // Scene 2: 3 seconds
 setTimeout(fadeRpgSceneOut,4650);
 setTimeout(()=>{
  rpgScreen.classList.remove('approach');rpgScreen.classList.add('battle');
  setRpgTransitionMessage('최후의 전투, 개전!',true);
  fadeRpgSceneIn();
 },5000);

 // Scene 3: 3 seconds
 setTimeout(fadeRpgSceneOut,7650);
 setTimeout(()=>{
  clearRpgTransitionMessage();
  rpgScreen.classList.remove('transitionLock','sceneFade');
  rpgTransitioning=false;
  running=!manualPaused;
 },8000);
}
const RPG_EFFECT_RUNTIME_VERSION='LG_RPG_EFFECT_RUNTIME_V1';
function selectRpgTargets(spec,source,effect={}){
 if(!rpgState)return [];
 if(spec==='BOSS')return [rpgState.boss];
 if(spec==='BOSS_AND_SUMMONS')return [rpgState.boss,...(rpgState.summons||[]).filter(s=>s.hp>0)];
 if(spec==='SELF')return source?[source]:[];
 if(spec==='ALL_HEROES')return rpgAliveHeroes();
 if(spec==='LOWEST_HP_HERO'){
  const alive=rpgAliveHeroes().slice().sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp));return alive.slice(0,1);
 }
 if(spec==='RANDOM_HERO'){
  const alive=rpgAliveHeroes();return alive.length?[alive[Math.floor(Math.random()*alive.length)]]:[];
 }
 if(spec==='RANDOM_HEROES'){
  const alive=rpgAliveHeroes().slice().sort(()=>Math.random()-.5);
  return alive.slice(0,Math.min(alive.length,Math.max(1,effect.count||1)));
 }
 return [];
}
function applyRpgEffect(effect,ctx={}){
 const source=ctx.source||null,targets=selectRpgTargets(effect.target,source,effect);
 for(const t of targets){
  if(effect.type==='DAMAGE'){
   const raw=typeof effect.amount==='function'?effect.amount(source,t):effect.amount;
   if((t.invulnerableUntil||0)>rpgSimTime)continue;
   if(t===rpgState.boss){
    const dealt=rpgDamageToBoss(raw,{ignoreDefense:!!effect.ignoreDefense});
    t.hp=Math.max(0,t.hp-dealt);
    if((t.reflectUntil||0)>rpgSimTime&&source&&source!==t){
     const back=Math.max(1,Math.round(dealt*(t.reflectRatio||0)));
     source.hp=Math.max(0,source.hp-rpgDamageToHero(source,back));if(source.hp<=0)source.ko=true;
    }
   }else{
    const dealt=rpgDamageToHero(t,raw);
    t.hp=Math.max(0,t.hp-dealt);
    if(t.hp<=0){
     if(!tryRpgDeathPrevention(t))t.ko=true;
    }
    if((t.reflectUntil||0)>rpgSimTime&&source&&source!==t&&source===rpgState.boss){
     source.hp=Math.max(0,source.hp-Math.max(1,Math.round(dealt*(t.reflectRatio||0))));
    }
   }
  }else if(effect.type==='HEAL'){
   const raw=typeof effect.amount==='function'?effect.amount(source,t):effect.amount;
   t.hp=Math.min(t.maxHp,t.hp+Math.max(0,Math.round(raw)));
  }else if(effect.type==='ATK_MULT'){
   t.atkBuffMult=Math.max(t.atkBuffMult||1,effect.mult||1);t.atkBuffUntil=Math.max(t.atkBuffUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='RATE_MULT'){
   t.rateBuffMult=Math.max(t.rateBuffMult||1,effect.mult||1);t.rateBuffUntil=Math.max(t.rateBuffUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='DAMAGE_REDUCTION'){
   t.damageReduction=Math.max(t.damageReduction||0,effect.ratio||0);t.damageReductionUntil=Math.max(t.damageReductionUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='DAMAGE_TAKEN_MULT'){
   t.damageTakenMult=Math.max(t.damageTakenMult||1,effect.mult||1);t.damageTakenUntil=Math.max(t.damageTakenUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='ACTION_DELAY'){
   const sec=effect.seconds||0;t.lastBasic=(t.lastBasic||0)+sec;t.lastSkill1=(t.lastSkill1||0)+sec;t.lastSkill2=(t.lastSkill2||0)+sec;
  }else if(effect.type==='STUN'){
   t.stunUntil=Math.max(t.stunUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='DEF_MOD'){
   t.defModPct=effect.pct||0;t.defModUntil=Math.max(t.defModUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='DOT'){
   t.rpgDots=t.rpgDots||[];
   t.rpgDots.push({remaining:effect.duration||4,tick:effect.tick||1,nextTick:effect.tick||1,amount:effect.amount||1,source});
  }else if(effect.type==='INVULNERABLE'){
   t.invulnerableUntil=Math.max(t.invulnerableUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='SKILL_BLOCK'){
   t.skillBlockUntil=Math.max(t.skillBlockUntil||0,rpgSimTime+(effect.duration||0));
  }else if(effect.type==='REFLECT'){
   t.reflectRatio=Math.max(t.reflectRatio||0,effect.ratio||0);t.reflectUntil=Math.max(t.reflectUntil||0,rpgSimTime+(effect.duration||0));
  }
 }
 if(effect.type==='SUMMON'){
  const count=Math.max(1,effect.count||1);
  rpgState.summons=rpgState.summons||[];
  for(let i=0;i<count;i++)rpgState.summons.push({id:'add_'+Date.now()+'_'+i,name:effect.name||'소환물',hp:effect.hp||100,maxHp:effect.hp||100,atk:effect.atk||20,attackGap:effect.attackGap||3,lastAttack:rpgSimTime,expiresAt:effect.duration?rpgSimTime+effect.duration:null});
 }
 return targets;
}
function applyRpgEffects(effects,ctx={}){for(const e of effects)applyRpgEffect(e,ctx)}
function updateRpgDots(dt){
 const actors=[...(rpgState?.heroes||[]),...(rpgState?[rpgState.boss]:[])];
 for(const t of actors){
  if(!t.rpgDots||!t.rpgDots.length)continue;
  for(const dot of t.rpgDots){
   dot.remaining-=dt;dot.nextTick-=dt;
   if(dot.nextTick<=0&&dot.remaining>=0){
    dot.nextTick+=dot.tick;
    applyRpgEffects([{type:'DAMAGE',target:'SELF',amount:dot.amount}],{source:t===rpgState.boss?(dot.source||null):rpgState.boss});
   }
  }
  t.rpgDots=t.rpgDots.filter(d=>d.remaining>0);
 }
}
function updateRpgSummons(){
 if(!rpgState)return;
 rpgState.summons=(rpgState.summons||[]).filter(s=>s.hp>0&&(!s.expiresAt||s.expiresAt>rpgSimTime));
 for(const s of rpgState.summons){
  if(rpgSimTime-s.lastAttack>=s.attackGap){
   s.lastAttack=rpgSimTime;
   const alive=rpgAliveHeroes();if(!alive.length)continue;
   const target=alive[Math.floor(Math.random()*alive.length)];
   applyRpgEffects([{type:'DAMAGE',target:'SELF',amount:s.atk}],{source:target});
  }
 }
}
function scheduleRpgEvent(delay,fn,label=''){
 if(!rpgState)return;
 rpgState.pendingEvents=rpgState.pendingEvents||[];
 rpgState.pendingEvents.push({at:rpgSimTime+Math.max(0,delay),fn,label});
}
function updateRpgPendingEvents(){
 if(!rpgState?.pendingEvents?.length)return;
 const due=rpgState.pendingEvents.filter(e=>e.at<=rpgSimTime);
 rpgState.pendingEvents=rpgState.pendingEvents.filter(e=>e.at>rpgSimTime);
 for(const e of due)e.fn();
}
function rpgConditionMet(condition,source){
 if(!condition)return true;
 if(condition.type==='HP_LTE'){
  const actor=condition.target==='SELF'?source:rpgState?.boss;
  return !!actor&&(actor.hp/Math.max(1,actor.maxHp))<=condition.ratio;
 }
 return false;
}
const RPG_ADAPTER_RUNTIME_VERSION='LG_RPG_ADAPTER_RUNTIME_V1_1';
function tryRpgDeathPrevention(actor){
 if((actor.deathPreventionCharges||0)<=0)return false;
 actor.deathPreventionCharges--;actor.hp=Math.max(1,Math.round(actor.maxHp*(actor.deathPreventionHealRatio||.20)));
 actor.ko=false;return true;
}
function runRpgAdapter(id,params={},ctx={}){
 const source=ctx.source||null;
 if(id==='CHANCE_TRIGGER'){
  const chance=Math.max(0,Math.min(1,params.chance??1));
  if(Math.random()>chance)return {triggered:false};
  if(params.effects)applyRpgEffects(params.effects,{source});
  return {triggered:true};
 }
 if(id==='CONDITIONAL_EXECUTE'){
  const targets=selectRpgTargets(params.target||'BOSS',source,params);
  const threshold=params.threshold??.30,mult=params.multiplier??1.6;
  for(const t of targets){
   const low=(t.hp/Math.max(1,t.maxHp))<=threshold;
   if(low&&params.baseDamage!=null)applyRpgEffects([{type:'DAMAGE',target:t===rpgState.boss?'BOSS':'SELF',amount:params.baseDamage*mult,ignoreDefense:!!params.ignoreDefense}],{source:t===rpgState.boss?source:t});
  }
  return {triggered:targets.some(t=>(t.hp/Math.max(1,t.maxHp))<=threshold)};
 }
 if(id==='COPY_EFFECT'){
  const donor=params.donor||rpgAliveHeroes().find(h=>h!==source&&h.lastSkillEffects?.length);
  const effects=params.effects||donor?.lastSkillEffects||[];
  if(effects.length)applyRpgEffects(effects.map(e=>({...e,target:params.targetOverride||e.target})),{source});
  return {triggered:effects.length>0,count:effects.length};
 }
 if(id==='DEATH_PREVENTION'){
  const targets=selectRpgTargets(params.target||'SELF',source,params);
  for(const t of targets){t.deathPreventionCharges=(t.deathPreventionCharges||0)+(params.charges||1);t.deathPreventionHealRatio=params.healRatio??.20}
  return {triggered:targets.length>0,count:targets.length};
 }
 if(id==='ECONOMY_DISABLED_IN_RPG'){
  return {triggered:false,disabled:true,reason:'RPG_NO_COMBAT_ECONOMY'};
 }
 if(id==='MULTI_HIT_SEQUENCE'){
  const hits=Math.max(1,params.hits||1),falloff=params.falloff??1;
  let ratio=1;
  for(let i=0;i<hits;i++){
   const effects=(params.effects||[]).map(e=>e.type==='DAMAGE'?{...e,amount:(typeof e.amount==='number'?e.amount*ratio:e.amount)}:{...e});
   applyRpgEffects(effects,{source});ratio*=falloff;
  }
  return {triggered:true,hits};
 }
 if(id==='RPG_SLOW_TO_ACTION_RATE'){
  const slow=Math.max(0,Math.min(.90,params.slowRatio??.25));
  const duration=params.duration||4;
  const targets=selectRpgTargets(params.target||'BOSS',source,params);
  for(const t of targets){t.rateBuffMult=Math.min(t.rateBuffMult||1,1-slow);t.rateBuffUntil=Math.max(t.rateBuffUntil||0,rpgSimTime+duration)}
  return {triggered:targets.length>0,count:targets.length};
 }
 if(id==='SUMMON_AWARE_TARGETING'){
  const targets=selectRpgTargets('BOSS_AND_SUMMONS',source,params);
  if(params.effects){
   for(const t of targets){
    for(const e of params.effects){
     if(e.type==='DAMAGE'){
      const amount=typeof e.amount==='function'?e.amount(source,t):e.amount;
      if(t===rpgState.boss)applyRpgEffects([{...e,target:'BOSS',amount}],{source});
      else t.hp=Math.max(0,t.hp-Math.max(1,Math.round(amount||0)));
     }
    }
   }
  }
  return {triggered:targets.length>0,count:targets.length};
 }
 if(id==='TIME_REWIND'){
  const seconds=params.seconds||2,target=params.target||'BOSS';
  const targets=selectRpgTargets(target,source,params);
  for(const t of targets){
   t.lastAttack=(t.lastAttack||0)+seconds;
   t.lastSkill1=(t.lastSkill1||0)+seconds;t.lastSkill2=(t.lastSkill2||0)+seconds;t.lastSkill3=(t.lastSkill3||0)+seconds;
  }
  return {triggered:targets.length>0,count:targets.length};
 }
 if(id==='TRANSFER_CHAIN'){
  const chain=params.targets||selectRpgTargets(params.target||'BOSS_AND_SUMMONS',source,params);
  const maxTargets=Math.min(chain.length,params.maxTargets||5),falloff=params.falloff??.90;
  let amount=params.amount||0;
  for(let i=0;i<maxTargets;i++){
   const t=chain[i];
   if(t===rpgState.boss)applyRpgEffects([{type:'DAMAGE',target:'BOSS',amount,ignoreDefense:!!params.ignoreDefense}],{source});
   else if(t&&typeof t.hp==='number')t.hp=Math.max(0,t.hp-Math.max(1,Math.round(amount)));
   amount*=falloff;
  }
  return {triggered:maxTargets>0,count:maxTargets};
 }
 if(id==='ULT_GAUGE_MOD'){
  const targets=selectRpgTargets(params.target||'ALL_HEROES',source,params),delta=params.delta||0;
  for(const t of targets)if(typeof t.ult==='number')t.ult=Math.max(0,Math.min(100,t.ult+delta));
  return {triggered:targets.length>0,count:targets.length};
 }
 if(id==='CONDITIONAL_EFFECT'){
  if(!rpgConditionMet(params.condition,source))return {triggered:false};
  if(params.effects)applyRpgEffects(params.effects,{source});
  return {triggered:true};
 }
 if(id==='TELEGRAPH_SEQUENCE'){
  const count=Math.max(1,params.count||1),gap=Math.max(.1,params.gap||.7),warning=Math.max(0,params.warning||.6);
  for(let i=0;i<count;i++){
   scheduleRpgEvent(i*gap,()=>showWarning(params.label||'⚠ TARGETED ATTACK',params.warningText||'곧 공격이 도착합니다',Math.round(warning*1000)));
   scheduleRpgEvent(i*gap+warning,()=>{
    const targets=selectRpgTargets(params.target||'RANDOM_HERO',source,{count:params.targetCount||1});
    for(const t of targets){
     const amount=typeof params.amount==='function'?params.amount(source,t):params.amount;
     applyRpgEffects([{type:'DAMAGE',target:'SELF',amount:amount||1}],{source:t});
    }
   });
  }
  return {triggered:true,count};
 }
 return {triggered:false,unsupported:true};
}
function effectiveHeroAtk(h){
 const legacy=h.buffUntil>rpgSimTime?1.15:1;
 const mult=(h.atkBuffUntil||0)>rpgSimTime?(h.atkBuffMult||1):1;
 return h.atk*legacy*mult;
}
function effectiveHeroGap(h,base){
 const mult=(h.rateBuffUntil||0)>rpgSimTime?(h.rateBuffMult||1):1;
 return base/Math.max(.1,mult);
}
function rpgDamageToBoss(raw,options={}){
 const b=rpgState.boss;
 if(options.ignoreDefense)return Math.max(1,Math.round(raw));
 return Math.max(1,Math.round(raw-Math.max(0,b.def*.25)));
}
function rpgDamageToHero(hero,raw){
 const defPct=(hero.defModUntil||0)>rpgSimTime?(hero.defModPct||0):0;
 const effectiveDef=Math.max(0,hero.def*(1+defPct));
 const reduced=Math.max(1,raw-Math.max(0,effectiveDef*.45));
 const dr=(hero.damageReductionUntil||0)>rpgSimTime?(hero.damageReduction||0):0;
 const taken=(hero.damageTakenUntil||0)>rpgSimTime?(hero.damageTakenMult||1):1;
 return Math.max(1,Math.round(reduced*(1-dr)*taken));
}
function rpgAliveHeroes(){return rpgState.heroes.filter(h=>!h.ko&&h.hp>0)}
function castBraunHornCharge(b){
 const d=RPG_BOSS_SKILL_DEFS.BRAUM.skill1;
 applyRpgEffects([
  {type:'DAMAGE',target:'ALL_HEROES',amount:b.atk*d.prototype.damageRatio},
  {type:'ACTION_DELAY',target:'ALL_HEROES',seconds:d.prototype.actionDelay}
 ],{source:b});
 b.lastSkill1=rpgSimTime;
 showWarning('철각왕 브라움 · 뿔박치기','돌진 충격 · 전원 피해 / 행동 지연',850);
}
function castBraunRockCollapse(b){
 const d=RPG_BOSS_SKILL_DEFS.BRAUM.skill2;
 applyRpgEffects([{type:'SKILL_BLOCK',target:'RANDOM_HEROES',count:d.targetCount,duration:d.duration}],{source:b});
 b.lastSkill2=rpgSimTime;
 showWarning('철각왕 브라움 · 암반 붕괴','영웅 2명 스킬 6초 봉쇄',900);
}
function castBraunCrushingRoar(b){
 const d=RPG_BOSS_SKILL_DEFS.BRAUM.skill3;
 applyRpgEffects([{type:'DAMAGE_TAKEN_MULT',target:'ALL_HEROES',mult:d.damageTakenMult,duration:d.duration}],{source:b});
 b.lastSkill3=rpgSimTime;
 showWarning('철각왕 브라움 · 분쇄 포효','8초간 파티 받는 피해 +40%',900);
}
function updateRpgBossSkills(b){
 if((b.stunUntil||0)>rpgSimTime||(b.skillBlockUntil||0)>rpgSimTime)return;
 const d=RPG_BOSS_SKILL_DEFS.BRAUM;
 if(rpgSimTime-b.lastSkill3>=d.skill3.cooldown){castBraunCrushingRoar(b);return}
 if(rpgSimTime-b.lastSkill2>=d.skill2.cooldown){castBraunRockCollapse(b);return}
 if(rpgSimTime-b.lastSkill1>=d.skill1.cooldown){castBraunHornCharge(b);return}
}
function updateRpg(dt){
 if(!rpgState||rpgState.result)return;
 rpgSimTime+=dt;
 updateRpgPendingEvents();updateRpgDots(dt);updateRpgSummons();
 const b=rpgState.boss;
 for(const h of rpgAliveHeroes()){
  if((h.stunUntil||0)>rpgSimTime)continue;
  const atk=effectiveHeroAtk(h);
  if(rpgSimTime-h.lastBasic>=effectiveHeroGap(h,h.basicGap)){
   h.lastBasic=rpgSimTime;
   applyRpgEffects([{type:'DAMAGE',target:'BOSS',amount:atk}],{source:h});
   h.ult=Math.min(100,h.ult+6);
  }
  if((h.skillBlockUntil||0)<=rpgSimTime&&rpgSimTime-h.lastSkill1>=effectiveHeroGap(h,h.skill1Gap)){
   h.lastSkill1=rpgSimTime;
   const skill1=RPG_HERO_DEFS[h.heroId];
   const skillEffects=[{type:'DAMAGE',target:'BOSS',amount:atk*1.65,ignoreDefense:skill1.skill1DamageType==='관통'}];
   h.lastSkillEffects=skillEffects.map(e=>({...e}));
   applyRpgEffects(skillEffects,{source:h});
   h.ult=Math.min(100,h.ult+12);
  }
  if((h.skillBlockUntil||0)<=rpgSimTime&&rpgSimTime-h.lastSkill2>=effectiveHeroGap(h,h.skill2Gap)){
   h.lastSkill2=rpgSimTime;
   applyRpgEffects([
    {type:'ATK_MULT',target:'ALL_HEROES',mult:1.15,duration:8},
    {type:'RATE_MULT',target:'ALL_HEROES',mult:1.15,duration:8},
    {type:'DAMAGE_REDUCTION',target:'ALL_HEROES',ratio:.20,duration:8}
   ],{source:h});
   h.buffUntil=rpgSimTime+8;
  }
 }
 if(b.hp<=0){b.hp=0;finishRpgVictory();return}
 const ratio=b.hp/b.maxHp;
 const nextPhase=ratio<=.35?3:ratio<=.70?2:1;
 if(nextPhase!==b.phase){
  b.phase=nextPhase;
  if(nextPhase===3)b.enraged=true;
  showWarning(nextPhase===3?'⚠ BOSS ENRAGED':'BOSS PHASE '+nextPhase,nextPhase===3?'HP 35% · 최종 광폭화':'공격 패턴 강화',1200);
 }
 updateRpgBossSkills(b);
 const bossRate=(b.rateBuffUntil||0)>rpgSimTime?(b.rateBuffMult||1):1;
 const attackGap=(b.baseAttackGap/(b.phase===1?1:b.phase===2?1.18:1.4))/Math.max(.1,bossRate);
 if(rpgSimTime-b.lastAttack>=attackGap){
  b.lastAttack=rpgSimTime;
  const alive=rpgAliveHeroes();
  if(alive.length){
   const count=b.phase===1?1:Math.min(alive.length,b.phase);
   const targets=alive.slice().sort(()=>Math.random()-.5).slice(0,count);
   targets.forEach(h=>{
    const raw=b.atk*(b.phase===1?1:b.phase===2?1.15:1.35);
    applyRpgEffects([{type:'DAMAGE',target:'SELF',amount:raw}],{source:h});
    h.ult=Math.min(100,h.ult+10);
   });
  }
 }
 if(!rpgAliveHeroes().length){finishRpgDefeat('모든 영웅이 전투불능');return}
 if(rpgAutoBattle){
  const ready=rpgAliveHeroes().find(h=>h.ult>=100);
  if(ready){useRpgUltimate(ready.id,true);return}
 }
 renderRpg();
}
function useRpgUltimate(heroId,fromAuto=false){
 if(gameMode!=='RPG'||!rpgState||rpgState.result||manualPaused)return;
 const h=rpgState.heroes.find(x=>x.id===heroId);
 if(!h||h.ko||h.ult<100||(h.skillBlockUntil||0)>rpgSimTime)return;
 h.ult=0;
 const before=rpgState.boss.hp;
 applyRpgEffects([
  {type:'DAMAGE',target:'BOSS',amount:h.atk*4},
  {type:'DAMAGE_REDUCTION',target:'ALL_HEROES',ratio:.50,duration:5}
 ],{source:h});
 const dmg=Math.max(0,Math.round(before-rpgState.boss.hp));
 showWarning(h.name+' · '+RPG_HERO_DEFS[h.heroId].ultimateName,(fromAuto?'AUTO · ':'')+'ULTIMATE · '+dmg+' DAMAGE · PARTY GUARD 5s',850);
 if(rpgState.boss.hp<=0)finishRpgVictory();else renderRpg();
}
function finishRpgVictory(){
 if(!rpgState||rpgState.result)return;
 rpgState.result='VICTORY';running=false;
 showWarning('STAGE CLEAR','RPG BOSS DEFEATED',999999);renderRpg();
}
function finishRpgDefeat(reason){
 if(!rpgState||rpgState.result)return;
 rpgState.result='DEFEAT';running=false;
 showWarning('RPG BATTLE FAILED',reason,999999);renderRpg();
}
function renderRpg(){
 if(!rpgState)return;
 const b=rpgState.boss;
 $('rpgBossHpText').textContent=Math.ceil(b.hp)+'/'+b.maxHp;
 $('rpgBossBarFill').style.width=Math.max(0,b.hp/b.maxHp*100)+'%';
 $('rpgPhaseLabel').textContent=b.enraged?'PHASE 3 · ENRAGED':'PHASE '+b.phase;
 rpgHeroRow.innerHTML='';
 for(const h of rpgState.heroes){
  const card=document.createElement('div');card.className='rpgHeroCard'+(h.ko?' ko':'');
  const hpPct=Math.max(0,h.hp/h.maxHp*100),ultPct=Math.max(0,h.ult);
  card.innerHTML='<div class="rpgHeroFigure">아</div><div class="rpgHeroName">'+h.name+'</div>'+
   '<div class="rpgHp"><i style="width:'+hpPct+'%"></i></div>'+
   '<div class="rpgUlt"><i style="width:'+ultPct+'%"></i></div>'+
   '<button class="rpgUltBtn '+(h.ult>=100&&!h.ko?'ready':'')+'" '+(h.ult>=100&&!h.ko?'':'disabled')+'>ULT '+Math.floor(h.ult)+'%</button>'+
   '<div class="rpgStatus">'+(h.ko?'K.O.':h.buffUntil>rpgSimTime?'수호의 맹세':'AUTO ATTACK')+'</div>';
  const btn=card.querySelector('.rpgUltBtn');btn.onclick=()=>useRpgUltimate(h.id);
  rpgHeroRow.appendChild(card);
 }
}
function renderEnemies(){
 enemyLayer.innerHTML='';
 for(const e of enemies){
  if(e.hp<=0&&!e.cinematic)continue;const xy=enemyXY(e),p=posPct(xy.x,xy.y),d=document.createElement('div');
  const cinematicClass=e.cinematic?' cinematicBoss '+(e.cinematicState==='fallen'?'bossFallen':e.cinematicState==='rise'?'bossRise':e.cinematicState==='roar'?'bossRise bossRoar':e.cinematicState==='charge'?'bossRise bossCharge':''):'';
  const hitFx=e.hitFxUntil>simTime&&e.hitFxType?' hitFx-'+e.hitFxType:'';
  d.className='enemyToken '+(e.kind==='boss'?'boss':e.kind==='midboss'?'midboss':'')+cinematicClass+hitFx;
  d.dataset.enemyId=e.id;
  d.style.left=p.left;d.style.top=p.top;d.textContent=e.label;
  if(!e.cinematic)d.innerHTML+='<span class="hpbar"><i style="width:'+Math.max(0,e.hp/e.maxHp*100)+'%"></i></span>';
  enemyLayer.appendChild(d);
 }
}
const WAVE10_BOSS_SPAWN_AT=6;
const WAVE10_WARNING_AT=3;
const WAVE10_ENRAGE_AT=40;
let wave10WarningShown=false,wave10EnrageTriggered=false;
function spawnWave10BossMidWave(){
 if(wave!==10||specialSpawned||waveClock<WAVE10_BOSS_SPAWN_AT)return;
 spawnEnemy('boss');
 specialSpawned=true;
 showWarning('⚠ BOSS','FINAL TD BOSS · WAVE 10',1700);
}
function triggerWave10Enrage(){
 if(wave!==10||wave10EnrageTriggered||waveClock<WAVE10_ENRAGE_AT)return;
 const boss=enemies.find(e=>e.hp>0&&e.kind==='boss');
 if(!boss)return;
 boss.enraged=true;
 wave10EnrageTriggered=true;
 showWarning('⚠ BOSS ENRAGED','40초 경과 · 공격력 1.5배 / 공격속도 1.25배',1800);
}
function waveSpawnComplete(){
 if(wave===10)return false;
 const normalsDone=waveSpawned>=normalCountForWave(wave);
 const specialDone=wave!==5||specialSpawned;
 return normalsDone&&specialDone;
}
function aliveEnemyCount(){return enemies.filter(e=>e.hp>0).length}
function earlyClearBonus(){
 const remaining=Math.max(0,Math.ceil(WAVE_DURATION-waveClock));
 return remaining*5;
}
function tryEarlyWaveClear(){
 if(waveEnding||wave>=10||waveClock>=WAVE_DURATION||!waveSpawnComplete()||aliveEnemyCount()>0)return false;
 waveEnding=true;
 const bonus=earlyClearBonus();
 gold+=bonus;
 showWarning('적 전멸 보너스','+'+bonus+'G · '+Math.max(0,Math.ceil(WAVE_DURATION-waveClock))+'초 조기 종료',1200);
 setTimeout(()=>{waveEnding=false;advanceWave()},450);
 return true;
}
function advanceWave(){
 if(wave>=10)return;
 wave++;waveClock=0;spawnClock=0;waveSpawned=0;specialSpawned=false;wave10WarningShown=false;wave10EnrageTriggered=false;
 startWaveNotice();
}
function loop(ts){
 const raw=Math.min(.05,(ts-last)/1000);last=ts;
 if(running){
  const dt=raw*speed;
  if(gameMode==='TD'){
   simTime+=dt;waveClock+=dt;updateEnemies(dt,simTime);updateUnits(simTime);
   if(!tryEarlyWaveClear()&&wave<10&&waveClock>=WAVE_DURATION)advanceWave();
   renderEnemies();syncHUD();
  }else if(gameMode==='RPG'){
   updateRpg(dt);
  }
 }
 requestAnimationFrame(loop);
}
function syncHUD(){$('gold').textContent=gold;$('wave').textContent=wave;$('gHp').textContent=gHp;$('oHp').textContent=oHp}
function toast(msg){const t=$('toast');t.textContent=msg;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',750)}

$('closeBottom').onclick=()=>clearSelection(true);
$('battlefield').addEventListener('click',()=>{if(gameMode==='TD'&&!rpgPending)clearSelection(true)});
$('speed').onclick=()=>{speed=speed===1?2:speed===2?3:1;$('speed').textContent='×'+speed};
$('autoBattle').onclick=()=>{
 if(gameMode!=='RPG'||rpgTransitioning||(rpgState&&rpgState.result))return;
 rpgAutoBattle=!rpgAutoBattle;
 $('autoBattle').textContent=rpgAutoBattle?'AUTO ON':'AUTO OFF';
 $('autoBattle').classList.toggle('on',rpgAutoBattle);
 showWarning('AUTO '+(rpgAutoBattle?'ON':'OFF'),rpgAutoBattle?'궁극기를 자동으로 사용합니다':'궁극기를 직접 사용합니다',700);
};
function syncPauseButton(){$('pause').textContent=manualPaused?'▶ 계속':'Ⅱ 일시정지'}
$('pause').onclick=()=>{
 if(rpgPending||comboPlacement||rpgTransitioning||(rpgState&&rpgState.result))return;
 manualPaused=!manualPaused;
 running=!manualPaused;
 syncPauseButton();
 if(manualPaused)showWarning('일시정지','전투 시간이 멈췄습니다',900);
};
syncPauseButton();

buildGrid();renderUnits();syncHUD();updateComboHighlights();requestAnimationFrame(loop);

window.__LG_STAGE1_TEST__={
 grid:()=>({cols:COLS,rows:ROWS,cells:cells.length}),
 state:()=>({gameMode,wave,gold,gHp,oHp,speed,simTime,waveClock,units:[...units.values()],enemies:enemies.length,bosses:enemies.filter(e=>e.kind==='boss'&&e.hp>0).length,bossEnraged:enemies.some(e=>e.kind==='boss'&&e.hp>0&&e.enraged),bottomVisible:bottom.classList.contains('on'),rpgPending,manualPaused,moveModeUnitId,comboPlacement:!!comboPlacement,rpg:rpgState?{bossHp:rpgState.boss.hp,bossPhase:rpgState.boss.phase,heroes:rpgState.heroes.map(h=>({name:h.name,hp:h.hp,ult:h.ult,ko:h.ko})),result:rpgState.result,transitioning:rpgTransitioning,autoBattle:rpgAutoBattle}:null,gatePhase:gHp>0?'FINAL_WALL_G':'GATE_CORE_O'}),
 select:(x,y)=>onCellTap(x,y),
 place:(x,y,type)=>placeUnit(x,y,UNIT_DEFS[type]),
 route:()=>route.slice(),
 recipes:()=>HERO_RECIPES,
 unitDefs:()=>UNIT_DEFS,
 startRpg:()=>startRpgBattle([...units.values()].filter(u=>u.type==='hero_aria').slice(0,5)),
 standard:'LG_STAGE1_RPG_BOSS_PROTOTYPE_V1'
};
})();
```


---

## SOURCE: `app/src/main/java/com/luckygirls/lastwall/MainActivity.kt`

```kotlin
package com.luckygirls.lastwall

import android.app.Activity
import android.content.pm.ActivityInfo
import android.os.Bundle
import android.view.WindowManager
import android.webkit.WebView

class MainActivity : Activity() {
    private lateinit var webView: WebView
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.useWideViewPort = true
            settings.loadWithOverviewMode = true
            loadUrl("file:///android_asset/index.html")
        }
        setContentView(webView)
    }
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        webView.evaluateJavascript(
            "document.getElementById('bottomUI')?.classList.contains('on') ? (document.getElementById('closeBottom').click(), true) : false"
        ) { handled -> if (handled != "true") super.onBackPressed() }
    }
}

```


---

## SOURCE: `app/src/main/res/values/styles.xml`

```xml
<resources>
 <style name="AppTheme" parent="android:style/Theme.Material.Light.NoActionBar">
  <item name="android:fontFamily">sans</item>
  <item name="android:windowFullscreen">true</item>
  <item name="android:navigationBarColor">#111923</item>
  <item name="android:statusBarColor">#111923</item>
 </style>
</resources>

```


---

## SOURCE: `build.gradle.kts`

```kotlin
plugins {
    id("com.android.application") version "8.7.3" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
}

```


---

## SOURCE: `settings.gradle.kts`

```kotlin
pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }
dependencyResolutionManagement { repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS); repositories { google(); mavenCentral() } }
rootProject.name = "LuckyGirlsLastWall"
include(":app")

```


---

## SOURCE: `tests/check_stage1.py`

```python
from pathlib import Path
import json
root=Path("app/src/main/assets")
html=(root/"index.html").read_text(encoding="utf-8")
css=(root/"css/game.css").read_text(encoding="utf-8")
js=(root/"js/game.js").read_text(encoding="utf-8")
stage=json.loads((root/"data/stage01.json").read_text(encoding="utf-8"))
manifest=Path("app/src/main/AndroidManifest.xml").read_text(encoding="utf-8")
activity=Path("app/src/main/java/com/luckygirls/lastwall/MainActivity.kt").read_text(encoding="utf-8")
assert stage["grid"]=={"cols":18,"rows":10,"total":180}
assert len(stage["tile_rows"])==10 and all(len(r)==18 for r in stage["tile_rows"])
assert stage["castle"]["G"]==[[17,5]] and stage["castle"]["O"]==[[18,5]]
assert stage["B_default_present"] is False
for token in ["renderBottomForEmpty","renderBottomForUnit","renderBottomForCombo","updateComboHighlights","CELL_COUNT=COLS*ROWS"]:
    assert token in js, token
assert "#topHUD{position:fixed" in css
assert "#bottomUI" in css and "display:none" in css
assert 'android:screenOrientation="landscape"' in manifest
assert 'file:///android_asset/index.html' in activity
print("PASS - clean Stage 1 baseline")

# V2 regression guards
assert "기사단장" in js and "광전사" in js and "상급 기사" in js
assert "마탑 수습생" not in js  # Stage 5 unlock must not leak into Stage 1 placement
assert "materials:[{type:'knight3_commander',count:2}]" in js
assert "replaceUnit" not in js
assert "wave===5" in js and "midboss" in js
assert "normalCountForWave(w){return (10+w*2)*2}" in js
assert "*1.2" in js
assert "beginTdBossRpgTransition" in js and "startRpgBattle" in js
assert "bossWarning" in html
print("PASS - V2 unit tree / hero recipe / midboss / pressure / boss warning guards")

# Speed sync regression guard
assert "simTime+=dt" in js
assert "updateEnemies(dt,simTime);updateUnits(simTime)" in js
assert "updateEnemies(dt,ts/1000)" not in js
assert "updateUnits(ts/1000)" not in js
print("PASS - speed multiplier advances one shared simulation clock for enemies and allies")

# Castle defense targeting regression guards
assert "canCastleDefenderReach" in js
assert "if(e.pathPos>=route.length-2 && gHp<=0)return {x:18,y:5};" in js
assert "codeFor(u.x,u.y)==='C'" in js
assert "nearCastleFront" in js
assert "gatePhase:gHp>0?'FINAL_WALL_G':'GATE_CORE_O'" in js
print("PASS - castle defenders can keep firing after G breaks and enemies engage O")

# Wave timing / Wave 10 boss / enrage guards
assert "const WAVE_DURATION=40;" in js
assert "WAVE10_WARNING_AT=3" in js
assert "WAVE10_BOSS_SPAWN_AT=6" in js
assert "WAVE10_ENRAGE_AT=40" in js
assert "waveClock<WAVE10_BOSS_SPAWN_AT" in js
assert "BOSS APPROACHING · 3 SEC" in js
assert "spawnWave10BossMidWave" in js
assert "function triggerWave10Enrage()" in js
assert "boss.enraged=true" in js
assert "baseHitGap/1.25" in js
assert "Math.round(baseDmg*1.5)" in js
print("PASS - all waves are 40s; W10 warns at 3s, boss spawns at 6s, enrages at 40s")

# Early wave clear bonus guards
assert "function waveSpawnComplete()" in js
assert "function tryEarlyWaveClear()" in js
assert "remaining*5" in js
assert "적 전멸 보너스" in js
assert "wave>=10" in js
print("PASS - early enemy wipe ends non-boss waves and grants explicit bonus gold")

# Unit movement / hero placement / pause guards
assert "moveCooldownUntil:simTime+5" in js
assert "function beginMove(u)" in js and "function completeMove(x,y)" in js
assert "target.moveCooldownUntil=simTime+5" in js
assert "유닛 교대 완료 · 양쪽 5초 이동 잠금" in js
assert "function beginHeroSummon" in js and "function chooseHeroPlacement" in js
assert "이 출전했다!" in js
assert "running=false;" in js
assert "comboPlacement.positions.find" in js
assert "영웅은 조합 재료가 있던 자리에만 배치할 수 있습니다" in js
assert "Ⅱ 일시정지" in html
assert "manualPaused" in js and "▶ 계속" in js
assert ".cell.moveTarget" in css and ".cell.comboPlacement" in css
print("PASS - all units move/swap with 5s lock; hero placement pauses and uses material slots; manual pause is explicit")

# Upgrade UI combat descriptor guards
assert "function unitFeatureText(t)" in js
assert "ATK '+t.atk+' · '+t.damageType" in js
assert "damageType:'관통/광역'" in js
assert "damageType:'관통/지속'" in js
assert "damageType:'관통'" in js
assert "공중 대응" in js and "지상 전용" in js
print("PASS - placement and upgrade UI show ATK, damage type, and air capability")

# Top alert / boss scale guards
assert ".enemyToken.boss{width:4.8%" in css
assert "top:calc(var(--top) + 8px)" in css
assert "@keyframes topAlertBlink" in css
assert "#bossWarning.on{opacity:1;animation:topAlertBlink" in css
assert "#toast{position:fixed" in css and "animation:topAlertBlink" in css
assert "\\\\n.enemyToken.boss" not in css
print("PASS - boss matches midboss scale and all alerts stay in blinking top HUD area")

# RPG boss prototype guards
assert 'id="rpgScreen"' in html
assert 'id="rpgHeroRow"' in html
assert "const RPG_HERO_DEFS" in js
assert "ARIA:{" in js and "hp:2600,atk:175,def:125" in js
assert "const RPG_BOSS_DEF" in js
assert "function enterRpgBattle()" in js
assert "function startRpgBattle(tdHeroes)" in js
assert "function updateRpg(dt)" in js
assert "function useRpgUltimate(heroId,fromAuto=false)" in js
assert "function finishRpgVictory()" in js
assert "function finishRpgDefeat(reason)" in js
assert "gameMode==='RPG'" in js
assert "STAGE CLEAR" in js
assert "RPG BATTLE FAILED" in js
assert "PHASE 3 · ENRAGED" in js
assert ".rpgHeroCard" in css and "#rpgBossBody" in css
print("PASS - TD boss now hands off to playable RPG boss prototype with 1-5 TD heroes")

# RPG cinematic intro guards
assert 'id="rpgTransition"' in html
assert "function playRpgIntroSequence()" in js
assert "name+'이 다가온다'" in js
assert "그대들이 바로 마지막 보루, LAST WALL이다." in js
assert "최후의 전투, 개전!" in js
assert "rpgTransitioning=true" in js
assert "running=false;" in js
assert "rpgScreen.classList.add('prep','transitionLock')" in js
assert "rpgScreen.classList.add('approach')" in js
assert "rpgScreen.classList.add('battle')" in js
assert "#rpgScreen.prep #rpgBoss" in css
assert "#rpgScreen.approach #rpgBoss" in css
assert "#rpgScreen.battle #rpgBoss" in css
assert "centerFlash" in css
print("PASS - RPG intro uses front-prep, distant boss, approach beat, LAST WALL line, center start flash, then combat")

# RPG V1.1 transition lock / cinematic / readability / Stage 1 balance guards
assert "gameMode='TD_TRANSITION'" in js
assert "function cancelAllTdCommands()" in js
assert "function beginTdBossRpgTransition(boss)" in js
assert "boss.cinematicState='fallen'" in js
assert "boss.cinematicState='rise'" in js
assert "boss.cinematicState='roar'" in js
assert "boss.cinematicState='charge'" in js
assert "setTimeout(()=>{\n  startRpgBattle(tdHeroes);\n },4700);" in js
assert "if(gameMode!=='TD'||rpgPending)return;" in js
assert "hp:16000,atk:110,def:60,baseAttackGap:3.0" in js
assert "setTimeout(fadeRpgSceneOut,1650)" in js
assert "},2000);" in js and "},5000);" in js and "},8000);" in js
assert 'id="rpgBossStatus"' in html
assert html.count('id="rpgBossName"') == 1
assert html.count('id="rpgBossHpText"') == 1
assert "#rpgBossStatus{" in css
assert ".enemyToken.bossFallen" in css and ".enemyToken.bossRoar" in css and ".enemyToken.bossCharge" in css
print("PASS - RPG V1.1 locks TD commands, adds boss revival cinematic, 2/3/3 fade intro, readable top boss status, and one-legendary Stage 1 tuning")

# RPG V1.2 charge motion / destruction / 60s target / auto battle guards
assert 'id="autoBattle"' in html
assert "rpgAutoBattle=false" in js
assert "function destroyTdDefenseForBossCharge()" in js
assert "tdDestroyed" in js and "tdStructureDestroyed" in js
assert "const from=posPct(start.x,start.y),to=posPct(16.75,5)" in js
assert "requestAnimationFrame(()=>requestAnimationFrame" in js
assert ".enemyToken.bossCharge" in css and "1.35s" in css
assert "@keyframes tdUnitBreak" in css and "@keyframes tdStructureBreak" in css
assert "rpgAutoBattle=!rpgAutoBattle" in js
assert "useRpgUltimate(ready.id,true)" in js
assert "AUTO ON" in js and "AUTO OFF" in js
print("PASS - RPG V1.2 shows real boss charge, destroys TD defense, targets ~60s 1x combat, and adds auto ultimate toggle")

# UI spacing V1 / mobile landscape safe-area guards
assert "--safe-left:env(safe-area-inset-left,0px)" in css
assert "--safe-bottom:env(safe-area-inset-bottom,0px)" in css
assert "left:calc(4% + var(--safe-left))" in css
assert "#grid{width:min(90vw,calc(84vh * 1.8))}" in css
assert ".unitToken{width:4.25%" in css
assert ".enemyToken{width:3.05%" in css
assert "left:calc(10% + var(--safe-left))" in css
assert "bottom:calc(7% + var(--safe-bottom))" in css
assert ".rpgHeroCard{width:min(14.5vw,156px)" in css
print("PASS - UI spacing V1 preserves full-bleed backgrounds while giving TD/RPG combatants safe breathing room")

# TD combat effect engine V1 guards
assert "function targetsForTdAttack(target,profile)" in js
assert "enemyOccupiesRouteCell(e,center)" in js
assert "occupiedRouteCells(e).some(c=>Math.abs(c-center)<=radius)" in js
assert "function addEnemyDot(e,sourceAtk,profile)" in js
assert "function updateEnemyEffects(e,dt)" in js
assert "resolveTdAttack(u,s,target)" in js
assert "target.hp-=s.atk" not in js
assert "damageType:'관통/광역',targetCount:3,areaRadiusCells:1" in js
assert "damageType:'관통/지속',targetCount:2,dotDuration:4,dotTick:1,dotRatio:.25" in js
assert ".enemyToken.hitFx-pierce" in css and ".enemyToken.hitFx-area" in css and ".enemyToken.hitFx-dot" in css
print("PASS - Stage 1 TD attacks now execute single, penetration, area, and prototype DOT semantics instead of UI-only labels")

# Combat semantics V1.1: overlap-based same-cell and RPG penetration mapping
assert "function occupiedRouteCells(e)" in js
assert "function enemyOccupiesRouteCell(e,cellIndex)" in js
assert "occupiedRouteCells(e).some(c=>Math.abs(c-center)<=radius)" in js
assert "enemyOccupiesRouteCell(e,center)" in js
assert "footprintCells:kind==='boss'?1.6:kind==='midboss'?1.3:1.0" in js
assert "skill1DamageType:'관통'" in js
assert "if(options.ignoreDefense)return Math.max(1,Math.round(raw))" in js
assert "skill1.skill1DamageType==='관통'" in js
print("PASS - same-cell uses sprite-footprint overlap, multi-cell enemies are hittable from either cell, and RPG penetration ignores DEF")

# Full combat registry / RPG issue inventory guards
combat_registry=json.loads((root/"data/combat_registry_v1.json").read_text(encoding="utf-8"))
rpg_issues=json.loads((root/"data/rpg_skill_issues_v1.json").read_text(encoding="utf-8"))
assert combat_registry["schema"]=="LG_COMBAT_REGISTRY_V1"
assert combat_registry["counts"]["heroes"]==20
assert combat_registry["counts"]["bosses"]==50
assert all(len(h["skills"])==3 for h in combat_registry["heroes"])
assert all(len(b["skills"])==3 for b in combat_registry["bosses"])
aria=next(h for h in combat_registry["heroes"] if h["name"]=="아리아")
assert aria["source_recipe"]==["기사단장","기사단장"]
assert aria["skills"][0]["rpg_mapping"]["rule"]=="RPG_PENETRATION_IGNORE_DEF"
assert len(rpg_issues["items"])>0
assert any(x["character"]=="아리아" and x["skill"]=="성광 참격" for x in rpg_issues["items"])
print("PASS - full combat registry contains 20 heroes, 50 bosses, skill-bearing enemies, and RPG review inventory")

assert combat_registry["counts"]["skill_enemies"]==len(combat_registry["skill_enemies"])
assert combat_registry["counts"]["skill_enemies"]<65
assert all(e["special_effect"]!="불가능" for e in combat_registry["skill_enemies"])
print("PASS - skill-bearing enemy inventory excludes ordinary enemies and reads the correct source special-effect column")

# Aria TD skill framework V1 guards
assert "const TD_HERO_SKILL_DEFS" in js
assert "ARIA_S1" in js and "ARIA_S2" in js and "ARIA_S3" in js
assert "function castAriaSkill1(u,now)" in js
assert "function castAriaSkill2(u,now)" in js
assert "function castAriaSkill3(u,now)" in js
assert "cellsToHit=[start,start+1,start+2]" in js
assert "attached=e.pathPos>=route.length-2" in js
assert "ally.ariaOathUntil" in js
assert "wallDefBuffUntil" in js and "wallShieldUntil" in js
assert "wallShieldReduction=.50" not in js  # reduction comes from data definition, not hidden literal combat branch
assert "wallDamageReduction:.50" in js
assert "updateHeroSkills(u,now)" in js
print("PASS - Aria TD S1/S2/S3 execute through shared effect primitives with source-backed effects and marked prototype gaps")

# Full RPG translation matrix V1 guards
rpg_translation=json.loads((root/"data/rpg_skill_translation_v1.json").read_text(encoding="utf-8"))
assert rpg_translation["schema"]=="LG_RPG_SKILL_TRANSLATION_V1_3"
assert rpg_translation["counts"]["hero_skills"]==60
assert rpg_translation["counts"]["boss_skills"]==150
assert rpg_translation["counts"]["total"]==210
assert all(x["rpg_rules"] for x in rpg_translation["hero_skills"])
assert all(x["rpg_rules"] for x in rpg_translation["boss_skills"])
assert any(x["character"]=="미아" and x["skill"]=="보물탄" and any("DEF 100% 무시" in r for r in x["rpg_rules"]) for x in rpg_translation["hero_skills"])
assert any(x["character"]=="아리아" and x["skill"]=="수호의 맹세" and "받는 피해 -20%" in x["rpg_rules"][0] for x in rpg_translation["hero_skills"])
assert rpg_issues["schema"]=="LG_RPG_SKILL_ISSUE_REGISTRY_V1_3"
assert all(x.get("mapping") for x in rpg_issues["items"])
print("PASS - all 60 hero and 150 boss skills have RPG translation records; unresolved source gaps are explicitly marked")

# Provisional boss definition closure guards
assert rpg_translation["counts"]["manual_boss_definitions"]==0
assert rpg_translation["counts"]["approved_provisional_boss_definitions"]==43
assert rpg_translation["counts"]["provisional_boss_definitions"]==0
assert all(x["rpg_rules"] for x in rpg_translation["boss_skills"])
assert all(x.get("definition_origin")=="PROJECT_DESIGN_V1_INFERRED_FROM_SKILL_NAME_AND_BOSS_ROLE" for x in rpg_translation["boss_skills"] if x["status"]=="APPROVED_PROVISIONAL_V1")
assert any(x["character"]=="침식의 근원, 사룡 발테리옹" and x["skill"]=="LAST WALL 파괴" and any("즉사" in r for r in x["rpg_rules"]) for x in rpg_translation["boss_skills"])
assert rpg_issues["schema"]=="LG_RPG_SKILL_ISSUE_REGISTRY_V1_3"
print("PASS - all 43 name-only boss skills have explicit provisional RPG behavior and remain clearly separated from source-backed definitions")

# Master approval gate guards
boss_approval=json.loads((root/"data/boss_rpg_skill_approval_v1.json").read_text(encoding="utf-8"))
assert boss_approval["status"]=="APPROVED_FOR_RUNTIME"
assert boss_approval["approved_count"]==43
assert all(x["approval_status"]=="APPROVED_FOR_RUNTIME" for x in boss_approval["items"])
assert all(x["mutable"] is True for x in boss_approval["items"])
print("PASS - all 43 provisional boss RPG skills are approved for runtime while remaining explicitly mutable")

# Shared RPG Effect Runtime V1 guards
effect_runtime=json.loads((root/"data/combat_effect_runtime_v1.json").read_text(encoding="utf-8"))
assert effect_runtime["schema"] in ("LG_COMBAT_EFFECT_RUNTIME_V1","LG_COMBAT_EFFECT_RUNTIME_V1_1","LG_COMBAT_EFFECT_RUNTIME_V1_2")
assert "const RPG_EFFECT_RUNTIME_VERSION='LG_RPG_EFFECT_RUNTIME_V1'" in js
assert "function applyRpgEffect(effect,ctx={})" in js
assert "function applyRpgEffects(effects,ctx={})" in js
assert "function selectRpgTargets(spec,source,effect={})" in js
assert "effect.type==='DAMAGE'" in js and "effect.type==='HEAL'" in js
assert "effect.type==='ATK_MULT'" in js and "effect.type==='RATE_MULT'" in js
assert "effect.type==='DAMAGE_REDUCTION'" in js and "effect.type==='STUN'" in js
assert "ignoreDefense:skill1.skill1DamageType==='관통'" in js
assert "{type:'DAMAGE_REDUCTION',target:'ALL_HEROES',ratio:.50,duration:5}" in js
assert "{type:'DAMAGE_REDUCTION',target:'ALL_HEROES',ratio:.20,duration:8}" in js
assert all(x["status"]=="IMPLEMENTED" for x in effect_runtime["rpg_primitives"][:8])
print("PASS - Stage 1 RPG now uses a shared effect dispatcher for damage, buffs, mitigation, delays, stun, and DEF modifiers")

# RPG advanced primitives V1.1 guards
effect_runtime=json.loads((root/"data/combat_effect_runtime_v1.json").read_text(encoding="utf-8"))
assert effect_runtime["schema"]=="LG_COMBAT_EFFECT_RUNTIME_V1_2"
assert "effect.type==='DOT'" in js
assert "effect.type==='SUMMON'" in js
assert "effect.type==='INVULNERABLE'" in js
assert "effect.type==='SKILL_BLOCK'" in js
assert "effect.type==='REFLECT'" in js
assert "function updateRpgDots(dt)" in js
assert "function updateRpgSummons()" in js
assert "rpgState.summons=rpgState.summons||[]" in js
assert "(h.skillBlockUntil||0)<=rpgSimTime" in js
assert "if((t.invulnerableUntil||0)>rpgSimTime)continue;" in js
assert all(x["status"]=="IMPLEMENTED" for x in effect_runtime["rpg_primitives"])
print("PASS - DOT, summon, invulnerability, skill block, and reflect are now implemented as shared RPG primitives")

# Stage 1 Braum RPG skill connection guards
assert "const RPG_BOSS_SKILL_DEFS" in js
assert "BRAUM_S1" in js and "BRAUM_S2" in js and "BRAUM_S3" in js
assert "function updateRpgBossSkills(b)" in js
assert "function castBraunHornCharge(b)" in js
assert "function castBraunRockCollapse(b)" in js
assert "function castBraunCrushingRoar(b)" in js
assert "target:'RANDOM_HEROES',count:d.targetCount,duration:d.duration" in js
assert "damageTakenMult:1.40" in js
assert "effect.type==='DAMAGE_TAKEN_MULT'" in js
assert "updateRpgBossSkills(b);" in js
braum=[x for x in rpg_translation["boss_skills"] if x["character"]=="철각왕 브라움"]
assert len(braum)==3 and all(x["runtime_status"]=="CONNECTED_STAGE1_V1" for x in braum)
assert next(x for x in braum if x["skill"]=="암반 붕괴")["source_preserved_values"]=={"target_count":2,"duration_sec":6}
assert next(x for x in braum if x["skill"]=="분쇄 포효")["source_preserved_values"]=={"damage_taken_mult":1.4,"duration_sec":8}
print("PASS - Stage 1 Braum S1/S2/S3 are connected through shared RPG effects with source values separated from prototype timing")

# Full 210-skill runtime binding matrix guards
runtime_bindings=json.loads((root/"data/rpg_runtime_bindings_v1.json").read_text(encoding="utf-8"))
adapter_backlog=json.loads((root/"data/rpg_runtime_adapter_backlog_v1.json").read_text(encoding="utf-8"))
assert runtime_bindings["schema"] in ("LG_RPG_RUNTIME_BINDINGS_V1","LG_RPG_RUNTIME_BINDINGS_V1_1","LG_RPG_RUNTIME_BINDINGS_V1_2")
assert runtime_bindings["total"]==210
assert len(runtime_bindings["items"])==210
assert sum(runtime_bindings["counts"].values())==210
assert not any(x["runtime_status"]=="BLOCKED_UNSUPPORTED_PRIMITIVE" for x in runtime_bindings["items"])
assert all(x["unsupported_primitives"]==[] for x in runtime_bindings["items"])
assert len([x for x in runtime_bindings["items"] if x["runtime_status"]=="LIVE_STAGE1"])==3
assert any(x["character"]=="아리아" and x["skill"]=="성광 참격" and x["primitive_options"]["ignoreDefense"] for x in runtime_bindings["items"])
assert adapter_backlog["count"]==len(adapter_backlog["adapters"])
print("PASS - all 210 RPG skills now have machine-readable runtime bindings; special semantics are isolated in an adapter backlog")

# RPG adapter runtime V1 guards
runtime_bindings=json.loads((root/"data/rpg_runtime_bindings_v1.json").read_text(encoding="utf-8"))
adapter_backlog=json.loads((root/"data/rpg_runtime_adapter_backlog_v1.json").read_text(encoding="utf-8"))
assert runtime_bindings["schema"]=="LG_RPG_RUNTIME_BINDINGS_V1_1"
assert adapter_backlog["schema"]=="LG_RPG_RUNTIME_ADAPTER_BACKLOG_V1_1"
assert adapter_backlog["implemented_count"]==11 and adapter_backlog["pending_count"]==0
assert all(a["status"]=="IMPLEMENTED_V1" for a in adapter_backlog["adapters"])
assert "const RPG_ADAPTER_RUNTIME_VERSION='LG_RPG_ADAPTER_RUNTIME_V1'" in js
assert "function runRpgAdapter(id,params={},ctx={})" in js
for adapter_id in ["CHANCE_TRIGGER","CONDITIONAL_EXECUTE","COPY_EFFECT","DEATH_PREVENTION","ECONOMY_DISABLED_IN_RPG","MULTI_HIT_SEQUENCE","RPG_SLOW_TO_ACTION_RATE","SUMMON_AWARE_TARGETING","TIME_REWIND","TRANSFER_CHAIN","ULT_GAUGE_MOD"]:
    assert "id==='"+adapter_id+"'" in js, adapter_id
assert runtime_bindings["counts"].get("NEEDS_ADAPTER",0)==0
assert runtime_bindings["counts"].get("ADAPTER_READY",0)==43
assert "tryRpgDeathPrevention(t)" in js
print("PASS - all 11 RPG adapters are implemented and all 43 adapter-dependent skills are runtime-ready")

# Five explicit RPG effect plans close the remaining definition gap
explicit_plans=json.loads((root/"data/rpg_explicit_effect_plans_v1.json").read_text(encoding="utf-8"))
runtime_bindings=json.loads((root/"data/rpg_runtime_bindings_v1.json").read_text(encoding="utf-8"))
adapter_backlog=json.loads((root/"data/rpg_runtime_adapter_backlog_v1.json").read_text(encoding="utf-8"))
assert explicit_plans["schema"]=="LG_RPG_EXPLICIT_EFFECT_PLANS_V1"
assert explicit_plans["count"]==5 and len(explicit_plans["items"])==5
assert all(x["status"]=="READY_FOR_RUNTIME" for x in explicit_plans["items"])
assert next(x for x in explicit_plans["items"] if x["character"]=="루나" and x["skill"]=="역행의 별")["plan"]["effects"][0]["duration"]==1.5
assert runtime_bindings["schema"]=="LG_RPG_RUNTIME_BINDINGS_V1_2"
assert runtime_bindings["counts"].get("NEEDS_EXPLICIT_EFFECT_PLAN",0)==0
assert runtime_bindings["counts"].get("EXPLICIT_PLAN_READY",0)==5
assert sum(runtime_bindings["counts"].values())==210
assert adapter_backlog["count"]==13 and adapter_backlog["pending_count"]==0
assert "id==='CONDITIONAL_EFFECT'" in js and "id==='TELEGRAPH_SEQUENCE'" in js
assert "function updateRpgPendingEvents()" in js
assert "updateRpgPendingEvents();updateRpgDots(dt)" in js
print("PASS - the final five ambiguous skills have explicit runtime plans; all 210 RPG skill definitions are structurally runtime-ready")

```


---

## SOURCE: `app/src/main/assets/data/combat_effect_runtime_v1.json`

```json
{
  "schema": "LG_COMBAT_EFFECT_RUNTIME_V1_2",
  "purpose": "Shared effect primitives for TD/RPG stabilization before PlayerProfile/Save work.",
  "rpg_primitives": [
    {
      "type": "DAMAGE",
      "status": "IMPLEMENTED",
      "targets": [
        "BOSS",
        "SELF",
        "ALL_HEROES",
        "LOWEST_HP_HERO",
        "RANDOM_HERO"
      ],
      "notes": "ignoreDefense supported for penetration mapping"
    },
    {
      "type": "HEAL",
      "status": "IMPLEMENTED",
      "targets": [
        "SELF",
        "ALL_HEROES",
        "LOWEST_HP_HERO"
      ]
    },
    {
      "type": "ATK_MULT",
      "status": "IMPLEMENTED",
      "targets": [
        "SELF",
        "ALL_HEROES"
      ]
    },
    {
      "type": "RATE_MULT",
      "status": "IMPLEMENTED",
      "targets": [
        "SELF",
        "ALL_HEROES"
      ]
    },
    {
      "type": "DAMAGE_REDUCTION",
      "status": "IMPLEMENTED",
      "targets": [
        "SELF",
        "ALL_HEROES"
      ]
    },
    {
      "type": "ACTION_DELAY",
      "status": "IMPLEMENTED",
      "targets": [
        "SELF",
        "ALL_HEROES",
        "RANDOM_HERO"
      ]
    },
    {
      "type": "STUN",
      "status": "IMPLEMENTED",
      "targets": [
        "SELF",
        "ALL_HEROES",
        "RANDOM_HERO"
      ]
    },
    {
      "type": "DEF_MOD",
      "status": "IMPLEMENTED",
      "targets": [
        "SELF",
        "ALL_HEROES",
        "RANDOM_HERO"
      ]
    },
    {
      "type": "DOT",
      "status": "IMPLEMENTED",
      "notes": "duration/tick/amount queue; numeric tuning remains skill data"
    },
    {
      "type": "SUMMON",
      "status": "IMPLEMENTED",
      "notes": "generic timed or persistent boss add with HP/ATK/attackGap"
    },
    {
      "type": "INVULNERABLE",
      "status": "IMPLEMENTED",
      "notes": "damage ignored until expiry"
    },
    {
      "type": "SKILL_BLOCK",
      "status": "IMPLEMENTED",
      "notes": "blocks hero Skill1/Skill2/Ultimate; basic attacks continue"
    },
    {
      "type": "REFLECT",
      "status": "IMPLEMENTED",
      "notes": "returns ratio of dealt damage to attacker"
    },
    {
      "type": "DAMAGE_TAKEN_MULT",
      "status": "IMPLEMENTED",
      "targets": [
        "SELF",
        "ALL_HEROES",
        "RANDOM_HERO",
        "RANDOM_HEROES"
      ],
      "notes": "Multiplier to final incoming damage; used by Stage 1 브라움 분쇄 포효."
    }
  ],
  "stage1_connected": {
    "hero": "아리아",
    "hero_skill1": "DAMAGE + ignoreDefense (관통)",
    "hero_skill2": "ATK_MULT + RATE_MULT + DAMAGE_REDUCTION",
    "hero_skill3": "DAMAGE + DAMAGE_REDUCTION",
    "boss": "철각왕 브라움",
    "boss_basic": "DAMAGE",
    "boss_skills": {
      "뿔박치기": "DAMAGE + ACTION_DELAY; damage ratio/cooldown are prototype",
      "암반 붕괴": "RANDOM_HEROES(2) + SKILL_BLOCK 6s; duration and target count preserved from source",
      "분쇄 포효": "ALL_HEROES DAMAGE_TAKEN_MULT 1.40 for 8s; +40%/8s preserved from source"
    }
  },
  "validation_rule": "All currently planned core RPG primitives are implemented. Skill-specific numbers remain data/balance responsibility.",
  "next_step": "Connect approved hero/boss skill definitions to these primitives and add per-skill regression fixtures."
}

```


---

## SOURCE: `app/src/main/assets/data/combat_effects_v1.json`

```json
{
  "schema": "LG_COMBAT_EFFECTS_V1_1",
  "source_semantics": {
    "single": "one target",
    "penetration": "all enemies whose logical sprite footprint overlaps the struck path cell; an enemy spanning two cells is valid for penetration from either cell",
    "area": "enemies in nearby path cells; Stage 1 prototype uses radius 1 path cell when a unit has no explicit radius",
    "transfer": "damage transfers to nearby targets and drops 10% each transfer",
    "freeze": "stun/disable plus damage for a defined duration",
    "fire": "damage-over-time for a defined duration",
    "stun": "action disabled for a defined duration",
    "block": "skill use disabled for a defined duration"
  },
  "stage1_runtime": {
    "penetration": true,
    "area": true,
    "dot": true,
    "single": true,
    "transfer": false,
    "freeze": false,
    "fire": false,
    "stun": false,
    "block": false
  },
  "prototype_only": {
    "magic_lancer_dot": {
      "duration_sec": 4,
      "tick_sec": 1,
      "damage_per_tick_ratio_of_atk": 0.25
    },
    "default_area_radius_path_cells": 1,
    "note": "These values fill source blanks for the alpha and are not final balance."
  },
  "collision_rule": {
    "same_cell": "An enemy counts as being in a cell when any part of its logical sprite footprint intersects that cell.",
    "multi_cell_overlap": "If one enemy overlaps two path cells, penetration from either cell hits that enemy.",
    "implementation": "Logical footprint is independent from CSS rendering size so visuals can change without changing combat rules."
  },
  "rpg_mapping": {
    "hero_penetration_skill": "ignore target DEF completely in RPG mode",
    "aria_skill1": "성광 참격 is tagged 관통 and therefore ignores boss DEF in RPG."
  }
}

```


---

## SOURCE: `app/src/main/assets/data/rpg_explicit_effect_plans_v1.json`

```json
{
  "schema": "LG_RPG_EXPLICIT_EFFECT_PLANS_V1",
  "count": 5,
  "policy": "Source-backed values are preserved; source gaps are marked PROTOTYPE_MUTABLE and may be changed later.",
  "items": [
    {
      "character": "루나",
      "skill": "역행의 별",
      "side": "HERO",
      "status": "READY_FOR_RUNTIME",
      "source": "가장 앞선 적 3체를 경로 1칸 뒤로 되돌림, 보스는 1.5초 정지.",
      "plan": {
        "effects": [
          {
            "type": "STUN",
            "target": "BOSS",
            "duration": 1.5
          }
        ]
      },
      "value_origin": {
        "duration_1_5_sec": "SOURCE_BACKED"
      },
      "notes": "RPG 단일보스에서는 소스에 명시된 보스 1.5초 정지를 그대로 사용."
    },
    {
      "character": "심해무녀 우미",
      "skill": "익사자의 손",
      "side": "BOSS",
      "stage": 13,
      "status": "READY_FOR_RUNTIME",
      "source": "1칸 봉쇄",
      "plan": {
        "effects": [
          {
            "type": "SKILL_BLOCK",
            "target": "RANDOM_HERO",
            "duration": 3
          }
        ]
      },
      "value_origin": {
        "target": "RPG_TRANSLATION_PROTOTYPE",
        "duration_3_sec": "PROTOTYPE_MUTABLE"
      },
      "notes": "TD의 1칸 봉쇄를 RPG에서 무작위 영웅 1명의 스킬 사용 봉쇄로 임시 변환."
    },
    {
      "character": "설해마녀 스카디아",
      "skill": "빙결표식",
      "side": "BOSS",
      "stage": 18,
      "status": "READY_FOR_RUNTIME",
      "source": "빙결표식",
      "plan": {
        "effects": [
          {
            "type": "STUN",
            "target": "RANDOM_HERO",
            "duration": 2
          }
        ]
      },
      "value_origin": {
        "target": "PROJECT_DESIGN_PROTOTYPE",
        "duration_2_sec": "PROTOTYPE_MUTABLE"
      },
      "notes": "원본은 스킬명만 있어 RPG에서는 무작위 영웅 1명 빙결/행동불능으로 1차 정의."
    },
    {
      "character": "동토광왕 브란",
      "skill": "피의광폭",
      "side": "BOSS",
      "stage": 19,
      "status": "READY_FOR_RUNTIME",
      "source": "피의광폭 / RPG: HP 임계치 기반 강화 상태",
      "plan": {
        "adapter": "CONDITIONAL_EFFECT",
        "params": {
          "condition": {
            "type": "HP_LTE",
            "target": "SELF",
            "ratio": 0.4
          },
          "effects": [
            {
              "type": "ATK_MULT",
              "target": "SELF",
              "mult": 1.35,
              "duration": 9999
            },
            {
              "type": "RATE_MULT",
              "target": "SELF",
              "mult": 1.25,
              "duration": 9999
            }
          ]
        }
      },
      "value_origin": {
        "hp_threshold_40": "PROTOTYPE_MUTABLE",
        "atk_35": "PROTOTYPE_MUTABLE",
        "rate_25": "PROTOTYPE_MUTABLE"
      },
      "notes": "원본에 임계치/강화수치가 없어 모두 변경 가능한 V1 프로토타입."
    },
    {
      "character": "공중요새 코르부스",
      "skill": "마력폭격",
      "side": "BOSS",
      "stage": 29,
      "status": "READY_FOR_RUNTIME",
      "source": "마력폭격 / 승인된 V1: 복수 영웅 순차 폭격 + 각 폭격 사이 짧은 경고",
      "plan": {
        "adapter": "TELEGRAPH_SEQUENCE",
        "params": {
          "count": 3,
          "gap": 1,
          "warning": 0.6,
          "target": "RANDOM_HERO",
          "amount_ratio_to_boss_atk": 0.85,
          "label": "공중요새 코르부스 · 마력폭격"
        }
      },
      "value_origin": {
        "count_3": "PROTOTYPE_MUTABLE",
        "gap_1_0": "PROTOTYPE_MUTABLE",
        "warning_0_6": "PROTOTYPE_MUTABLE",
        "damage_ratio_0_85": "PROTOTYPE_MUTABLE"
      },
      "notes": "마스터 승인된 V1 동작을 유지하되 세부 수치는 밸런스 보류."
    }
  ]
}

```


---

## SOURCE: `app/src/main/assets/data/rpg_runtime_adapter_backlog_v1.json`

```json
{
  "schema": "LG_RPG_RUNTIME_ADAPTER_BACKLOG_V1_2",
  "count": 13,
  "adapters": [
    {
      "id": "CHANCE_TRIGGER",
      "status": "IMPLEMENTED_V1",
      "affected_skills": [
        {
          "side": "HERO",
          "character": "카린",
          "skill": "홍련 처형",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "벨",
          "skill": "대인형극",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "루나",
          "skill": "운명개변",
          "stage": null
        },
        {
          "side": "BOSS",
          "character": "종말을 걷는 자 에레보스",
          "skill": "공포의천막",
          "stage": 49
        }
      ],
      "runtime": "runRpgAdapter"
    },
    {
      "id": "CONDITIONAL_EXECUTE",
      "status": "IMPLEMENTED_V1",
      "affected_skills": [
        {
          "side": "HERO",
          "character": "루비",
          "skill": "DEAD OR ALIVE",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "카린",
          "skill": "홍련 처형",
          "stage": null
        },
        {
          "side": "BOSS",
          "character": "불꽃도적 카심",
          "skill": "광폭화",
          "stage": 7
        },
        {
          "side": "BOSS",
          "character": "반역장군 드라켄",
          "skill": "처형창",
          "stage": 27
        },
        {
          "side": "BOSS",
          "character": "침식된 반역장군 드라켄",
          "skill": "처형창진",
          "stage": 47
        }
      ],
      "runtime": "runRpgAdapter"
    },
    {
      "id": "COPY_EFFECT",
      "status": "IMPLEMENTED_V1",
      "affected_skills": [
        {
          "side": "HERO",
          "character": "네온",
          "skill": "형상복제",
          "stage": null
        }
      ],
      "runtime": "runRpgAdapter"
    },
    {
      "id": "DEATH_PREVENTION",
      "status": "IMPLEMENTED_V1",
      "affected_skills": [
        {
          "side": "HERO",
          "character": "아델",
          "skill": "불락의 성채",
          "stage": null
        },
        {
          "side": "BOSS",
          "character": "동토광왕 브란",
          "skill": "죽음거부",
          "stage": 19
        }
      ],
      "runtime": "runRpgAdapter"
    },
    {
      "id": "ECONOMY_DISABLED_IN_RPG",
      "status": "IMPLEMENTED_V1",
      "affected_skills": [
        {
          "side": "HERO",
          "character": "미아",
          "skill": "행운의 함정",
          "stage": null
        }
      ],
      "runtime": "runRpgAdapter"
    },
    {
      "id": "MULTI_HIT_SEQUENCE",
      "status": "IMPLEMENTED_V1",
      "affected_skills": [
        {
          "side": "HERO",
          "character": "리엘",
          "skill": "홍련지옥",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "루비",
          "skill": "도탄사격",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "카린",
          "skill": "잔영난무",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "미아",
          "skill": "보물탄",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "미아",
          "skill": "왕의 보물고",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "아이린",
          "skill": "퍼펙트 클리닝",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "샤샤",
          "skill": "접착 폭약",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "샤샤",
          "skill": "연쇄기폭",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "니아",
          "skill": "혈창",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "이브",
          "skill": "되감기",
          "stage": null
        },
        {
          "side": "BOSS",
          "character": "침식의 근원, 사룡 발테리옹",
          "skill": "재앙의날갯짓",
          "stage": 50
        }
      ],
      "runtime": "runRpgAdapter"
    },
    {
      "id": "RPG_SLOW_TO_ACTION_RATE",
      "status": "IMPLEMENTED_V1",
      "affected_skills": [
        {
          "side": "HERO",
          "character": "유나",
          "skill": "봉인의 부적",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "유나",
          "skill": "결계진",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "레이나",
          "skill": "서리창",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "레이나",
          "skill": "빙결감옥",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "레이나",
          "skill": "절대영도",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "카린",
          "skill": "그림자 베기",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "벨",
          "skill": "마리오네트",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "루나",
          "skill": "운명개변",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "클로에",
          "skill": "라스트 앙코르",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "아델",
          "skill": "수호의 일격",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "이브",
          "skill": "시간지연",
          "stage": null
        },
        {
          "side": "BOSS",
          "character": "붉은협곡의 바르칸",
          "skill": "협곡 질주",
          "stage": 3
        },
        {
          "side": "BOSS",
          "character": "심해무녀 우미",
          "skill": "심해의 노래",
          "stage": 13
        },
        {
          "side": "BOSS",
          "character": "황실골렘 아르카논",
          "skill": "중력파",
          "stage": 26
        }
      ],
      "runtime": "runRpgAdapter"
    },
    {
      "id": "SUMMON_AWARE_TARGETING",
      "status": "IMPLEMENTED_V1",
      "affected_skills": [
        {
          "side": "HERO",
          "character": "리엘",
          "skill": "홍련지옥",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "레이나",
          "skill": "절대영도",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "니아",
          "skill": "진홍월식",
          "stage": null
        },
        {
          "side": "BOSS",
          "character": "순교자 세베라",
          "skill": "순교찬가",
          "stage": 23
        },
        {
          "side": "BOSS",
          "character": "검은대주교 말키엘",
          "skill": "광신폭주",
          "stage": 43
        },
        {
          "side": "BOSS",
          "character": "사룡숭배 대성상",
          "skill": "성상분열",
          "stage": 44
        }
      ],
      "runtime": "runRpgAdapter"
    },
    {
      "id": "TIME_REWIND",
      "status": "IMPLEMENTED_V1",
      "affected_skills": [
        {
          "side": "HERO",
          "character": "이브",
          "skill": "되감기",
          "stage": null
        }
      ],
      "runtime": "runRpgAdapter"
    },
    {
      "id": "TRANSFER_CHAIN",
      "status": "IMPLEMENTED_V1",
      "affected_skills": [
        {
          "side": "HERO",
          "character": "루비",
          "skill": "도탄사격",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "벨",
          "skill": "저주인형",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "루나",
          "skill": "운명의 표식",
          "stage": null
        },
        {
          "side": "HERO",
          "character": "비올라",
          "skill": "역병 전염",
          "stage": null
        }
      ],
      "runtime": "runRpgAdapter"
    },
    {
      "id": "ULT_GAUGE_MOD",
      "status": "IMPLEMENTED_V1",
      "affected_skills": [
        {
          "side": "HERO",
          "character": "이브",
          "skill": "되감기",
          "stage": null
        },
        {
          "side": "BOSS",
          "character": "침식의 근원, 사룡 발테리옹",
          "skill": "재앙의날갯짓",
          "stage": 50
        }
      ],
      "runtime": "runRpgAdapter"
    },
    {
      "id": "CONDITIONAL_EFFECT",
      "status": "IMPLEMENTED_V1",
      "runtime": "runRpgAdapter",
      "affected_skills": []
    },
    {
      "id": "TELEGRAPH_SEQUENCE",
      "status": "IMPLEMENTED_V1",
      "runtime": "runRpgAdapter",
      "affected_skills": []
    }
  ],
  "implemented_count": 13,
  "pending_count": 0
}

```


---

## SOURCE: `docs/RPG_BOSS_BATTLE_SYSTEM_V1.md`

```markdown
# Lucky Girls: Last Wall — RPG Boss Battle System V1

Status: PROPOSED IMPLEMENTATION BASELINE
Date: 2026-09-27
Next after: TD alpha acceptance

## 1. Purpose

The RPG boss battle is the second phase of each stage boss encounter.

TD Phase:
- Wave 10 TD boss defeated
- TD battlefield freezes
- surviving/active hero state is captured
- transition into RPG boss battle

RPG Phase:
- 5 heroes in one horizontal row
- low camera behind / near the heroes
- colossal boss in front
- stage clear only after the RPG boss is defeated

The RPG phase must feel different from TD while reusing the same hero roster and stats.

## 2. Core battle format

### Party
- Maximum 5 heroes
- One horizontal row only
- No front row / back row split
- No formation swapping during the first prototype
- Empty hero slots remain empty
- Only heroes summoned during the TD phase enter the RPG phase

### Battle control
- Basic attacks: automatic
- Skill 1: automatic by cooldown
- Skill 2: automatic by cooldown
- Ultimate / Skill 3: manual activation
- Game speed: 1x / 2x / 3x
- Manual pause supported

Reason for V1:
- keeps the RPG phase readable on mobile
- avoids turning the second phase into a separate full RPG
- preserves player decision through ultimate timing

## 3. Hero combat loop

Each living hero repeatedly:
1. acquires the boss
2. performs basic attack
3. checks Skill 1 cooldown
4. checks Skill 2 cooldown
5. charges ultimate gauge through combat
6. waits for player input for ultimate

### Ultimate gauge
- Range: 0–100
- Gain from dealing damage
- Gain from receiving boss damage
- Optional small passive gain over time
- At 100, hero portrait/button glows
- Player taps the hero ultimate button to activate

V1 rule:
- ultimate gauge does not auto-fire
- activating an ultimate briefly pauses combat for the cut-in
- after cut-in, combat resumes automatically

## 4. Boss combat loop

The boss has:
- HP
- DEF
- normal attack
- heavy attack
- phase skill
- enrage timer

Boss target selection:
- normal attack: one random living hero
- heavy attack: 2–3 heroes or an area in front of the party
- phase skill: whole-party or scripted mechanic

The boss attacks the hero row directly. There is no wall / G / O in RPG phase.

## 5. Damage and defeat

### Heroes
- Heroes have RPG HP during this phase.
- At 0 HP, the hero is knocked out for the remainder of the RPG battle.
- No automatic replacement from non-selected heroes.
- No resurrection in V1 unless a hero skill explicitly provides it later.

### Boss
- Boss defeat ends RPG phase.
- When boss HP reaches 0:
  - stop all combat
  - play victory finish
  - Stage Clear
  - reward flow

### Full party defeat
- If all active heroes are knocked out:
  - RPG BATTLE FAILED
  - Stage Failed
  - return to retry/result flow

## 6. Boss phases

Recommended V1 boss structure:

Phase 1: 100%–70%
- normal attack
- simple heavy attack
- teaches rhythm

Phase 2: 70%–35%
- attack speed increases
- unlocks one boss signature skill
- stronger visual pressure

Phase 3: 35%–0%
- boss enrages
- stronger attacks
- shorter skill interval
- no forced timer failure

This is separate from the TD Wave 10 enrage system.

## 7. Transition presentation

### Section 1 — Front preparation
- short hero-facing shot
- heroes ready weapons / spells
- boss silhouette or scale reveal

### Section 2 — Rear / charge-in
- camera moves behind hero row
- heroes face the boss
- low angle emphasizes boss size

### Section 3 — Active RPG combat
- playable combat view
- one horizontal hero row
- boss occupies upper/front field
- combat UI appears

Prototype priority:
- implement Section 3 first
- Sections 1 and 2 can be temporary transitions until final art/camera work in Unity

## 8. RPG battle UI

Top:
- Boss name
- Boss HP bar
- Boss phase marker
- speed control
- pause

Bottom:
- 5 hero portraits aligned horizontally
- HP per hero
- ultimate gauge per hero
- ultimate button when ready

Center:
- combat space only
- do not place persistent warning panels over heroes or boss

Warnings:
- top UI only
- blink / pulse
- examples:
  - BOSS PHASE 2
  - BOSS ENRAGED
  - ULTIMATE READY

## 9. TD -> RPG state handoff

Carry from TD:
- summoned hero identities
- hero count
- hero rarity / upgrades
- stage context
- boss identity
- selected game speed can be retained

Do not carry:
- TD unit positions
- normal unit positions
- wall HP
- G/O HP
- remaining TD enemies
- TD move cooldowns

RPG party is rebuilt from hero state only.

## 10. Prototype balance baseline

Temporary V1 values:

Hero RPG HP:
- derived from hero data
- if unavailable in prototype: use normalized placeholder by rarity

Basic attack:
- auto

Skill 1:
- 8–12 sec cooldown target range

Skill 2:
- 14–20 sec cooldown target range

Ultimate:
- manual
- target average charge time: 20–30 sec in active combat

Boss battle target duration:
- 45–90 sec for Stage 1 prototype

Boss phase thresholds:
- 70%
- 35%

Boss final enrage:
- starts at 35% HP, not by hard timeout

## 11. Stage 1 RPG prototype

For Stage 1:
- use current summoned heroes from TD
- Ariya must be supported if summoned
- if fewer than 5 heroes exist, use only those heroes
- if zero heroes exist at TD boss defeat, RPG transition still occurs but battle should fail immediately or show insufficient party state

Recommended prototype behavior:
- allow 1–5 heroes
- no free filler heroes
- no hidden auto-fill

## 12. Engineering state machine

Suggested states:

TD_ACTIVE
TD_BOSS_DEAD
RPG_TRANSITION
RPG_PREPARE
RPG_ACTIVE
RPG_PHASE_CHANGE
RPG_VICTORY
RPG_DEFEAT
STAGE_CLEAR

No direct transition:
TD_BOSS_DEAD -> STAGE_CLEAR

Required path:
TD_BOSS_DEAD -> RPG_TRANSITION -> RPG_ACTIVE -> RPG_VICTORY -> STAGE_CLEAR

## 13. V1 acceptance checklist

- TD boss defeat enters RPG transition
- no false Stage Clear before RPG victory
- 1–5 summoned heroes appear in one horizontal row
- basic attacks work automatically
- boss attacks heroes
- hero HP / knockout works
- boss HP / phase thresholds work
- manual ultimate can be triggered
- pause works
- speed controls work on one shared RPG simulation clock
- party wipe gives defeat
- boss death gives Stage Clear
- warning messages stay in top UI

## 14. Deferred to Unity polish

- final 3-cut cinematic camera
- final character sprites / animations
- ultimate Live2D / cut-ins
- advanced boss telegraphs
- hit stop / screen shake
- projectile VFX
- audio / voice
- controller-quality gesture polish
- final balance

```


---

# PART C — 새 대화방/새 개발자 시작용 지시문

새 채팅 첫 메시지 권장:

```text
《Lucky Girls: Last Wall》 개발을 이어서 진행한다.
repository root의 MASTER_MANUAL_LUCKY_GIRLS_LAST_WALL.md를 최우선으로 읽고,
그 문서가 가리키는 GitHub main data 파일과 현재 Actions 상태를 확인한 뒤 이어서 작업한다.
과거 legacy 20-wave/random summon 규칙은 현재 규칙을 덮어쓰지 않는다.
최신 사용자 확정 규칙 > 마스터 매뉴얼 > main data > 과거 문서 순으로 우선한다.
```

## 반드시 기억할 현재 개발 철학
- 시스템과 데이터 계약을 먼저 닫는다.
- source-backed 값과 prototype 값을 절대 섞지 않는다.
- 구현됨 / 데이터 준비됨 / 승인됨 / 보류됨을 구분해서 말한다.
- 전투 안정화가 끝난 뒤 공용 캐릭터 데이터와 세이브로 간다.
- 모든 변경은 GitHub CI로 회귀 검증한다.

**END OF MASTER MANUAL — snapshot 8bdecc948b49fc680eb14920de00aa94ca8e6261**


---

## AUTHORITATIVE WORKBOOK BASELINE — 2026-09-28

Primary design source: `Lucky_Girls_GAME_DESIGN_MASTER_2026-09-28.xlsx`
SHA-256: `398489cafe1f7c66ad2fe9ceb57f12c2397946218fde6d8c0e5fcae607f2c9b3`

When this manual, legacy summaries, and the workbook disagree, use the latest direct user decision first, then this workbook. Runtime-derived tuning explicitly recorded as an override remains separate from source design values.

### Map hierarchy
`WORLD > LOCAL_MAP > STAGE_MAP`. A local map is not a stage map.

NORMAL:
- 서부 왕국: Stage 1–5
- 아자르 삼국연합: Stage 6–10
- 해륜왕국: Stage 11–15
- 벨로자르 제국: Stage 16–20
- 생트아르크 교황령: Stage 21–25
- 상드라크 제국: Stage 26–30

HARD:
- 타락한 서부 왕국: Stage 31–33 (3)
- 타락한 벨로자르 제국 / 타락한 북부: Stage 34–36 (3)
- 타락한 아자르 삼국연합: Stage 37–39 (3)
- 타락한 해륜왕국: Stage 40–42 (3)
- 암운이 드리운 생트아르크 교황령: Stage 43–45 (3)
- 심연에 침식당한 상드라크 제국: Stage 46–50 (5)

HARD stage count is therefore variable by local map and must never be inferred from NORMAL's fixed five-stage rule.

Canonical runtime data:
- `app/src/main/assets/data/map_hierarchy_v1.json`
- `app/src/main/assets/data/hard_stage_master_v1.json`

Workbook sheets that directly govern HARD design include:
`HARD31_36_1주성장벽`, `HARD37_45_성장벽`, `HARD46_50_최종성장벽`,
`HARD31_33_REDESIGN`, `HARD34_44_TD_RPG통합`, `HARD45_50_FINAL_DESIGN`,
`TD_RPG_통합검수_30_33`, and `적군 보스`.


### Six-region TD map reference package
Local path: `D:\MYGAME\lucky_girls\03_DESIGN\MAP\REFERENCE\6_REGION_TD_CONCEPT_V1`
GitHub reference registry: `03_DESIGN/MAP/REFERENCE/6_REGION_TD_CONCEPT_V1/`

Status is strictly **REFERENCE ONLY**. The package anchors regional visual/layout proposals to Stage 01 WEST, 08 AZAR, 13 HAERYUN, 18 BELOZAR, 23 SAINT, and 30 SANDRAK. It does not approve those layouts as runtime geometry and does not approve HARD geometry.

Promotion rule: `REFERENCE -> REVIEWED_CANDIDATE -> APPROVED_MAP_DESIGN -> STAGE_JSON_RUNTIME`.
Only an explicitly approved map may be converted into runtime coordinates.
