# LUCKY GIRLS PIXELORAMA MASTER TEMPLATE V1

**Project:** Lucky Girls: Last Wall  
**Scope:** All SD pixel characters  
**Status:** VIEW / COMBAT SYSTEM AGNOSTIC  
**Purpose:** 게임의 최종 뷰와 전투 시스템이 확정되기 전에도 안전하게 사용할 수 있는 Pixelorama MASTER 프로젝트 구조

---

# 1. 핵심 원칙

현재 확정하지 않는다:
- Side / Quarter / Top-down / Isometric
- 1 / 2 / 4 / 8방향
- 최종 전투 액션 세트
- Hitbox / Hurtbox
- 최종 FPS
- 엔진별 Atlas

현재 확정한다:
- 96×96 기본 캔버스
- `.pxo`가 편집 원본
- 캐릭터 본체와 VFX 분리
- 공통 레이어 이름
- 태그/액션 이름 규칙
- Export 가능한 구조
- 승인 전 FINAL 금지

---

# 2. MASTER 파일 구조

캐릭터마다 하나의 중심 Pixelorama MASTER 파일을 둔다.

예:

```text
04_CHARACTERS/08_KARIN/SPRITES/SOURCE/PIXELORAMA/
└─ 08_KARIN_MASTER_PIXEL.pxo
```

개별 액션 파일이 필요하면 파생 파일로 둔다.

```text
08_KARIN_IDLE_WORK.pxo
08_KARIN_MOVE_WORK.pxo
08_KARIN_ATTACK_01_WORK.pxo
```

단, 최종 Source of Truth는 `08_KARIN_MASTER_PIXEL.pxo`.

---

# 3. 권장 레이어 구조

```text
00_GUIDE
01_SHADOW
02_BODY
03_OUTFIT
04_HAIR_BACK
05_HAIR_FRONT
06_ACCESSORY
07_WEAPON
08_FACE
09_VFX
```

필요한 경우 캐릭터별 보조 레이어 허용:

```text
06A_RIBBON
06B_CAPE
07A_WEAPON_OFFHAND
```

공통 번호 체계는 유지한다.

---

# 4. Frame / Tag 구조

기본 태그 후보:

```text
BASE
IDLE
MOVE
ATTACK_01
SKILL_01
HIT
DOWN
```

현재 게임 시스템 미확정이므로
필요 없는 태그를 억지로 만들지 않는다.

최소 파일럿:
```text
BASE
IDLE
```

카린 파일럿 승인 후 확장한다.

---

# 5. BASE Frame

`BASE`는 모든 액션의 기준 프레임이다.

규칙:
- 96×96
- 투명 배경
- 캐릭터 높이 약 70~76px
- 기본 Pivot 제작 기준: bottom center
- 카린 파일럿에서는 3/4 정면 사용
- 이후 최종 뷰 확정 시 별도 VIEW Variant 생성 가능

BASE는 애니메이션이 아니라
캐릭터 외형 기준용 프레임이다.

---

# 6. Guide Layer

`00_GUIDE`에 둘 수 있는 것:
- Ground line
- Center line
- Pivot mark
- Character height guide
- Weapon reach guide
- Safe bounds

Export 시 GUIDE 레이어는 반드시 제외한다.

---

# 7. VFX Rule

`09_VFX`는 캐릭터 본체와 분리한다.

이유:
- 엔진 파티클 전환 가능
- VFX 재사용 가능
- 성능 조정 가능
- 캐릭터 스프라이트와 독립적으로 수정 가능

VFX가 복잡해지면 별도 `.pxo`로 분리 가능.

---

# 8. Direction Rule

현재 방향 수는 미확정.

따라서 파일명과 태그에 FRONT/LEFT/RIGHT/BACK를 강제하지 않는다.

최종 View 확정 후 다음 중 하나를 채택:

```text
IDLE_FRONT
IDLE_BACK
IDLE_LEFT
IDLE_RIGHT
```

또는:

```text
IDLE_NE
IDLE_NW
IDLE_SE
IDLE_SW
```

지금은 `IDLE`만 사용.

---

# 9. Version Rule

Pixelorama 작업 파일 버전:

```text
08_KARIN_MASTER_PIXEL_v001.pxo
08_KARIN_MASTER_PIXEL_v002.pxo
```

승인된 대표 파일:

```text
08_KARIN_MASTER_PIXEL.pxo
```

기존 승인본을 덮어쓰기 전에는 백업을 남긴다.

---

# 10. Character Work Folder

```text
04_CHARACTERS/<ID>/SPRITES/
├─ SOURCE/
│  └─ PIXELORAMA/
├─ IDLE/
├─ MOVE/
├─ ATTACK/
├─ SKILL/
├─ HIT/
├─ DOWN/
└─ QC/
```

현재 시스템 미확정 액션 폴더는 만들어 두어도 되지만
빈 폴더 상태를 허용한다.

---

# 11. Template Manifest

각 캐릭터 Pixelorama MASTER 옆에 다음 파일을 둔다.

```text
<CHARACTER_ID>_PIXEL_TEMPLATE.json
```

필수 필드:
- character_id
- canvas
- target_height
- source_pxo
- view_system
- directions
- layers
- actions
- approval_status

미확정 값은 `null` 또는 `UNDECIDED`.

---

# 12. Approval Gate

상태 흐름:

```text
WORKING
→ QC
→ WAITING_MASTER_APPROVAL
→ APPROVED
→ FINAL
```

자동화는 `WAITING_MASTER_APPROVAL`에서 정지.

승인 전:
- FINAL 이동 금지
- 엔진 배포 금지
- 20명 전체 복제 금지

---

# 13. Karin Pilot

카린 파일럿의 최소 범위:

```text
08_KARIN_MASTER_PIXEL.pxo
├─ BASE
└─ IDLE (6F)
```

이 두 개가 승인되기 전에는
MOVE / ATTACK / SKILL을 세부 확정하지 않는다.

이유:
- 최종 게임 View 미확정
- 전투 시스템 미확정
- 방향 수 미확정

---

# 14. Next Gate

카린 `BASE + IDLE` 승인 후 결정할 것:

1. 실제 게임 화면 배율
2. 최종 카메라 뷰
3. 이동 방향 수
4. 전투 방식
5. 액션 세트
6. 최종 FPS
7. 엔진 Adapter

그 뒤에만 20명 확장 규칙을 확정한다.

---

**Version:** V1
