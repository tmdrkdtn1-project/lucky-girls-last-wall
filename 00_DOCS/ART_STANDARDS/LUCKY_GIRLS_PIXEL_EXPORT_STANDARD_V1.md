# LUCKY GIRLS PIXEL EXPORT STANDARD V1

**Project:** Lucky Girls: Last Wall  
**Scope:** All SD pixel characters  
**Status:** ENGINE / VIEW AGNOSTIC  
**Purpose:** 게임의 최종 뷰 형식과 전투 시스템이 확정되기 전에도 안전하게 사용할 수 있는 공통 Export 규칙

---

# 0. 핵심 원칙

현재 Lucky Girls의 최종 카메라/뷰 형식, 이동 방향 체계, 전투 시스템이 확정되지 않았으므로
**애니메이션 방향 수와 액션 구성을 먼저 고정하지 않는다.**

지금 확정할 것은 오직 다음이다.

1. 원본 Pixelorama 프로젝트 보존
2. 액션별 독립 Export
3. 프레임 순서 보존
4. 투명 배경 유지
5. 메타데이터 분리
6. 이후 게임 시스템 변경 시 재출력 가능
7. 승인 전 FINAL 승격 금지

즉 본 규격은 특정 엔진, 특정 카메라, 특정 전투 방식에 종속되지 않는다.

---

# 1. Source of Truth

최종 원본은 `.pxo` Pixelorama 프로젝트 파일이다.

```text
04_CHARACTERS/<CHARACTER_ID>/SPRITES/SOURCE/PIXELORAMA/
```

예:
```text
04_CHARACTERS/08_KARIN/SPRITES/SOURCE/PIXELORAMA/
└─ 08_KARIN_MASTER_PIXEL.pxo
```

PNG spritesheet는 원본이 아니라 **파생 Export 자산**이다.

---

# 2. Export Root

작업 중 Export:

```text
06_PIPELINE/03_PROCESSED/CHARACTERS/<CHARACTER_ID>/SPRITES/
```

QC 통과 후:

```text
06_PIPELINE/04_QC/CHARACTERS/<CHARACTER_ID>/SPRITES/
```

승인 후:

```text
06_PIPELINE/05_APPROVED/CHARACTERS/<CHARACTER_ID>/SPRITES/
```

최종 게임 투입용:

```text
06_PIPELINE/06_FINAL/CHARACTERS/<CHARACTER_ID>/SPRITES/
```

게임 프로젝트로 직접 복사하는 작업은 FINAL 승인 이후 별도 Deploy 단계에서 수행한다.

---

# 3. Action-First Export

현재 뷰 시스템이 미확정이므로 방향별로 강제 분리하지 않는다.

기본 구조:

```text
<CHARACTER_ID>/
├─ BASE/
├─ IDLE/
├─ MOVE/
├─ ATTACK_01/
├─ SKILL_01/
├─ HIT/
└─ DOWN/
```

게임 시스템 확정 후 필요하면 다음 구조로 확장한다.

```text
IDLE/
├─ FRONT/
├─ BACK/
├─ LEFT/
└─ RIGHT/
```

또는

```text
IDLE/
├─ NW/
├─ NE/
├─ SW/
└─ SE/
```

따라서 지금은 방향 폴더를 필수 규칙으로 만들지 않는다.

---

# 4. 반드시 출력할 4종

각 액션은 가능하면 아래 네 종류를 출력한다.

## A. Frame Strip PNG
모든 프레임을 가로로 연결.

예:
```text
08_KARIN_IDLE_STRIP.png
```

용도:
- 빠른 검수
- 단순 런타임
- 디버깅

## B. Sprite Sheet PNG
프레임을 지정 열 수로 정렬.

예:
```text
08_KARIN_IDLE_SHEET.png
```

용도:
- 게임 엔진 import
- atlas 생성
- 자동화

## C. Individual Frames
프레임별 PNG.

예:
```text
frames/
├─ 08_KARIN_IDLE_000.png
├─ 08_KARIN_IDLE_001.png
├─ 08_KARIN_IDLE_002.png
...
```

용도:
- 엔진 변경
- 프레임 수정
- 외부 툴 호환
- 재패킹

## D. Metadata JSON
예:
```text
08_KARIN_IDLE.json
```

용도:
- frame count
- canvas size
- fps
- loop
- pivot
- hitbox placeholder
- direction placeholder
- tags
- source path
- version

---

# 5. Export Naming Standard

기본 형식:

```text
<CHARACTER_ID>_<ACTION>_<TYPE>.<EXT>
```

예:

```text
08_KARIN_IDLE_STRIP.png
08_KARIN_IDLE_SHEET.png
08_KARIN_IDLE.json
```

개별 프레임:

```text
08_KARIN_IDLE_000.png
08_KARIN_IDLE_001.png
...
```

방향이 확정된 이후:

```text
08_KARIN_IDLE_FRONT_STRIP.png
08_KARIN_IDLE_FRONT.json
```

처럼 확장한다.

---

# 6. Metadata JSON Standard

최소 필드:

```json
{
  "project": "Lucky Girls: Last Wall",
  "character_id": "08_KARIN",
  "action": "IDLE",
  "version": 1,
  "canvas": {
    "width": 96,
    "height": 96
  },
  "frame_count": 6,
  "fps": 12,
  "loop": true,
  "direction": null,
  "view_system": "UNDECIDED",
  "pivot": {
    "mode": "bottom_center",
    "x": 48,
    "y": 84
  },
  "hitbox": null,
  "hurtbox": null,
  "source_pxo": "08_KARIN_MASTER_PIXEL.pxo",
  "approval_status": "WAITING_MASTER_APPROVAL"
}
```

현재 확정되지 않은 것은 `null` 또는 `UNDECIDED`로 남긴다.

임의로 채우지 않는다.

---

# 7. Pivot Standard

게임 뷰가 미확정이어도 기본 Pivot 기준은 설정할 수 있다.

기본:
```text
BOTTOM_CENTER
```

96×96 기준 시작값:
```text
x = 48
y = 84
```

단 이것은 런타임 최종값이 아니라 **제작 기준점**이다.

최종 전투 시스템 확정 후 조정 가능해야 한다.

---

# 8. Frame Canvas Rule

모든 프레임은 동일한 캔버스 크기를 유지한다.

기본:
```text
96 × 96
```

금지:
- 프레임마다 자동 Crop
- 프레임마다 Canvas 크기 변경
- 캐릭터 움직임에 따라 이미지 크기 변동

이유:
- 애니메이션 흔들림 방지
- 피벗 유지
- 엔진 독립성 확보

---

# 9. Transparency

배경은 항상 Alpha 투명.

금지:
- 흰색 배경
- 검정 배경
- 체크무늬 실제 픽셀 포함
- 반투명 테스트 배경을 최종 Export에 포함

---

# 10. Sheet Packing

초기 표준은 단순하게 유지한다.

## Strip
```text
1 row × N frames
```

## Sheet
권장:
- 최대 8 columns
- 순서: 왼쪽→오른쪽, 위→아래

프레임 순서는 JSON의 frame index와 동일해야 한다.

복잡한 texture atlas packing은 최종 엔진이 확정된 뒤 처리한다.

---

# 11. FPS / Duration

FPS는 JSON에 반드시 기록한다.

초기 기본값:
```text
12 FPS
```

하지만 액션별로 달라질 수 있다.

예:
```text
IDLE = 12
MOVE = 12
ATTACK = 12~16
SKILL = 12~16
```

게임 시스템 확정 전에는 프레임 수와 FPS를 엔진 종속적으로 고정하지 않는다.

---

# 12. View / Direction Policy

현재:
```text
VIEW_SYSTEM = UNDECIDED
```

따라서 아래 어느 것도 지금 확정하지 않는다.

- 1방향
- 2방향
- 4방향
- 8방향
- Side View
- Quarter View
- Isometric
- Top-down
- Lane Battle
- Auto Battle specific facing

최종 게임플레이 카메라가 정해진 뒤 방향 체계를 결정한다.

---

# 13. Hitbox / Hurtbox Policy

현재 전투 시스템이 미확정이므로 Export 단계에서는:

```text
hitbox = null
hurtbox = null
```

로 둔다.

나중에 필요하면 별도 JSON 또는 엔진 데이터로 추가한다.

픽셀 이미지에 충돌 판정을 직접 박지 않는다.

---

# 14. VFX Separation

캐릭터 본체와 VFX를 분리한다.

권장:

```text
ATTACK_01/
├─ CHARACTER/
└─ VFX/
```

또는 파일명:

```text
08_KARIN_ATTACK_01_CHARACTER_SHEET.png
08_KARIN_ATTACK_01_VFX_SHEET.png
```

이렇게 하면:
- VFX 교체
- 색상 변경
- 성능 최적화
- 엔진 파티클 전환

이 쉬워진다.

---

# 15. Review Export

마스터 검수용으로 별도 Preview를 만든다.

```text
08_KARIN_IDLE_PREVIEW.gif
```

또는

```text
08_KARIN_IDLE_PREVIEW.mp4
```

Preview는 QC용이며 게임 FINAL 자산으로 취급하지 않는다.

---

# 16. Approval Gate

Export 자동화는 반드시 아래에서 멈춘다.

```text
WAITING_MASTER_APPROVAL
```

승인 전 자동으로 하지 않는 것:
- FINAL 이동
- 게임 프로젝트 배포
- MASTER 승격
- 다른 19명 자동 확장

---

# 17. Future Engine Adapter

게임 시스템 확정 후 Export Core를 변경하지 않고
별도의 Adapter를 붙인다.

예:

```text
EXPORT_CORE
├─ PNG_FRAMES
├─ STRIP
├─ SHEET
└─ JSON
        ↓
ENGINE_ADAPTER
        ↓
Godot / Unity / Custom Runtime
```

즉 원본 Export 규칙과 게임 엔진 규칙을 분리한다.

---

# 18. Automation Target

향후 PowerShell 또는 Python 자동화:

```text
Pixelorama .pxo
↓
HEADLESS EXPORT
↓
FRAME PNG
↓
STRIP PNG
↓
SHEET PNG
↓
METADATA JSON
↓
QC FOLDER
↓
WAITING_MASTER_APPROVAL
```

자동화 실패 시 원본 `.pxo`에는 손대지 않는다.

---

# 19. Current Decision

현재 확정:
- Source of Truth = `.pxo`
- Canvas fixed
- Alpha transparent
- Action-first
- Frames + Strip + Sheet + JSON
- VFX separated
- Metadata external
- Approval Gate
- Engine/View agnostic

현재 미확정:
- 최종 View
- Direction count
- Combat facing
- Final animation set
- Hitbox/Hurtbox
- Engine import format
- Final FPS
- Final atlas packing

이 미확정 항목들은 게임 시스템 결정 후 확정한다.

---

**Version:** V1  
**Status:** Approved as provisional production architecture  
