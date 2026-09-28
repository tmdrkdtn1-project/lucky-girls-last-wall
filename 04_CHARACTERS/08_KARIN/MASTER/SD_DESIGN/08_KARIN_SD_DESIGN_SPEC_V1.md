# 08_KARIN SD DESIGN SPEC V1

**Project:** Lucky Girls: Last Wall  
**Character ID:** 08_KARIN  
**Character Name:** 카린  
**Document Role:** Character-specific SD production specification  
**Parent Standard:** `LUCKY_GIRLS_SD_CHARACTER_DESIGN_STANDARD_V1.md`

---

# 0. Purpose

이 문서는 카린의 공식 MASTER 비주얼을 인게임용 SD 도트 스프라이트로 변환하기 위한 개별 설계 기준이다.

공통 규격은 상위 문서 `LUCKY_GIRLS_SD_CHARACTER_DESIGN_STANDARD_V1.md`를 따른다.  
본 문서에는 카린에게만 해당하는 식별 요소, 단순화 규칙, 섹스어필 포인트, 색상 방향, 무기/의상 우선순위, 애니메이션 개성을 정의한다.

---

# 1. Core Identity

## 1.1 Role Identity
- Archetype: 암살자 / 민첩형 전투원
- Combat Impression: 빠르고 날카롭고 조용한 공격
- Visual Mood: 위험함 + 도발적 매력 + 차가운 분위기
- Movement Mood: 무겁지 않고 짧고 빠르게 끊기는 동작

## 1.2 SD Readability Goal
96×96 화면에서 다음 5가지만 보여도 카린으로 인식되어야 한다.

1. 긴 흑발
2. 붉은 헤어 장식
3. 검정 + 진홍 중심의 암살자 복장
4. 날렵한 허리-골반 실루엣
5. 단검 계열 무기

---

# 2. Silhouette Key

카린의 SD 실루엣은 다음 구조를 우선한다.

## Head
- 머리 비중은 SD 기준 크게 유지
- 긴 흑발이 뒤쪽 실루엣을 충분히 형성해야 함
- 붉은 장식은 검은 머리 위에서 즉시 읽히도록 배치

## Upper Body
- 어깨는 너무 넓지 않게
- 상체는 날렵하고 밀착된 인상
- 가슴 볼륨은 실루엣으로 읽히되 직접적인 노출 없이 의상 구조 안에서 표현

## Waist
- 허리는 카린의 핵심 포인트 중 하나
- 상체와 골반 사이 대비가 명확해야 함

## Hip / Leg
- 골반은 머리와 함께 SD 인지성을 만드는 두 번째 큰 형태
- 허벅지는 가늘게만 처리하지 말고 하체 볼륨을 남긴다
- 가터/스트랩/하이컷 계열의 색상 분할로 하체를 강조

## Hair / Cloth Motion
- 긴 머리와 짧은 천 장식이 움직임을 만들어야 함
- Idle에서도 완전 고정하지 않는다

---

# 3. Hair Key

## Required
- 긴 흑발
- 머리 외곽은 한 덩어리 검정 실루엣이 아니라 최소 2~3개 큰 덩어리로 분리
- 붉은 헤어 장식 또는 리본 포인트 유지
- 앞머리와 얼굴 윤곽 사이에 1~2px 수준의 명확한 경계 확보

## Simplification
- 잔머리 다발은 생략 가능
- 세밀한 꽃잎 수는 줄여도 됨
- 붉은 장식은 형태 정확도보다 색상 인식 우선

---

# 4. Color Key

카린의 색상 우선순위:

1. CHARCOAL BLACK / DEEP BLACK
2. CRIMSON RED
3. PALE SKIN
4. DARK METAL
5. EYE / ACCENT COLOR

권장 역할:

```text
SKIN_LIGHT
SKIN_BASE
SKIN_SHADOW

HAIR_LIGHT
HAIR_BASE
HAIR_SHADOW

CRIMSON_LIGHT
CRIMSON_BASE
CRIMSON_DARK

OUTFIT_LIGHT
OUTFIT_BASE
OUTFIT_SHADOW

METAL_LIGHT
METAL_DARK

EYE_ACCENT
OUTLINE
```

총 12~16색 범위 권장.

## Color Rule
- 검정 의상이 머리와 합쳐지지 않도록 머리와 의상의 명도 차이를 둔다.
- 붉은색은 머리 장식 / 의상 포인트 / 스킬 이펙트에서 반복 사용한다.
- 피부색은 모바일 화면에서 검정 의상에 묻히지 않게 충분히 밝게 유지한다.

---

# 5. Costume Key

## Must Keep
- 검정 + 진홍 컬러 분할
- 밀착형 상체
- 허리 라인 강조
- 골반 / 허벅지 실루엣 강조
- 스트랩 / 가터 계열
- 짧은 천 또는 망토성 요소
- 암살자답게 움직임을 방해하지 않는 인상

## Can Simplify
- 작은 버클
- 미세 금속 장식
- 레이스 반복 패턴
- 원화에서만 보이는 작은 봉제선
- 지나치게 얇은 장식 끈

---

# 6. Sexy Appeal Key

본 항목은 상위 공통 기준의 성인 캐릭터 규칙을 따른다.

## Focus 1 — Waist / Hip
카린의 1순위 매력 포인트.
- 허리-골반 대비를 적극적으로 살린다.
- 골반 라인이 의상에 묻히지 않게 한다.
- 하체 실루엣이 직선형으로 무너지지 않게 한다.

## Focus 2 — Hip / Underbutt
- 짧은 하의, 하이컷, 스트랩, 천 구조 등을 활용해 하체 매력을 강조한다.
- SD에서는 직접적인 세부 묘사보다 명암/실루엣/피부-의상 색 블록으로 표현한다.
- 인게임 가독성을 해치는 과도한 픽셀 디테일은 피한다.

## Focus 3 — Bust Silhouette
- 가슴은 의상으로 가리되 볼륨은 실루엣으로 읽히게 한다.
- 밀착 소재 또는 절개 구조를 이용해 상체 인상을 만든다.
- 직접적인 주요 부위 노출은 하지 않는다.

## Sexy Mood
**위험하고 도발적인 암살자**

목표는 노출량 자체가 아니라,
- 허리
- 골반
- 가슴
- 허벅지
- 움직이는 머리/천
의 조합으로 카린 특유의 매력을 만드는 것이다.

---

# 7. Weapon Key

## Primary Weapon
- 단검 또는 쌍단검 계열
- 너무 작은 단검은 96×96에서 사라지므로 실제 비례보다 약간 크게 표현 가능

## Weapon Pixel Rule
- 칼날은 1px로만 끝내지 말고 필요한 경우 2px 이상의 명암 차를 준다.
- 손과 칼날이 합쳐지지 않도록 금속색을 피부/의상과 분리한다.
- ATTACK 프레임에서는 무기의 실제 위치 정확도보다 공격 방향이 읽히는 것이 우선이다.

---

# 8. Base Pose

## Default View
- 3/4 Front
- 몸통은 정면에 가깝게
- 얼굴은 약간 전투 방향을 바라봄
- 한쪽 다리를 살짝 앞으로
- 무게중심은 중앙보다 약간 낮게
- 손에는 단검을 들거나 즉시 꺼낼 수 있는 자세

## Pose Impression
- 경직된 차렷 자세 금지
- 과도한 모델 포즈 금지
- 작은 화면에서 즉시 전투 캐릭터처럼 보여야 함

---

# 9. Animation Character Rules

## 9.1 IDLE — 6 Frames
카린의 Idle은 큰 움직임보다 긴장된 정지 상태를 표현한다.

```text
F01 BASE
F02 BODY +1px / slight breath
F03 HAIR & RIBBON delay
F04 BASE
F05 BODY -1px
F06 HAIR / CLOTH settle
```

### Character Motion
- 호흡은 작게
- 긴 머리는 1프레임 늦게 반응
- 붉은 장식은 머리보다 더 작은 움직임
- 단검은 거의 고정
- 골반 이동은 최소화

---

## 9.2 MOVE — 8 Frames
- 빠른 보행 또는 경량 러닝에 가까운 느낌
- 상하 진폭 과도하게 키우지 않음
- 긴 머리는 몸보다 약간 늦게 따라옴
- 단검은 흔들지 말고 몸과 같이 안정적으로 이동

Key:
```text
CONTACT
DOWN
PASS
UP
CONTACT
DOWN
PASS
UP
```

---

## 9.3 ATTACK_01 — 6 Frames

카린 기본 공격:
**짧은 전진 + 빠른 단검 베기**

```text
F01 READY
F02 WINDUP
F03 DASH
F04 SLASH / HIT
F05 FOLLOW
F06 RETURN
```

### Priority
- F03→F04의 속도감
- 무기 궤적
- 머리/천 후행
- F04 실루엣이 가장 크게 달라져야 함

---

## 9.4 SKILL_01 — 8 Frames

카린 기본 스킬 컨셉:
**저자세 접근 → 교차 베기 또는 순간 돌진**

```text
F01 READY
F02 LOW STANCE
F03 DASH START
F04 SLASH A
F05 SLASH B
F06 FOLLOW
F07 LAND
F08 RETURN
```

VFX는 캐릭터와 분리:
```text
VFX_SLASH
VFX_AFTERIMAGE
```

색상:
- Crimson Red
- Dark Red
- White highlight 최소 사용

---

## 9.5 HIT — 3 Frames
```text
NORMAL
RECOIL
RECOVER
```

- 머리가 몸보다 약간 늦게 따라온다.
- 과도한 변형 금지.

---

## 9.6 DOWN — 5 Frames
```text
HIT
FALL_01
FALL_02
GROUND
HOLD
```

- 복잡한 사망 애니메이션보다 명확한 상태 전달 우선.

---

# 10. Pixel Simplification Notes

카린 도트 변환 시 아래 원칙을 적용한다.

## Keep Large
- 머리 전체 실루엣
- 붉은 헤어 장식
- 가슴/허리/골반 비율
- 허벅지 스트랩
- 단검
- 큰 붉은 의상 포인트

## Reduce
- 얇은 장식 끈
- 작은 금속 장식
- 작은 문양
- 반복되는 버클
- 세밀한 주름

## Never Lose
- BLACK + CRIMSON identity
- Long black hair
- Red hair accent
- Assassin weapon
- Curved waist/hip silhouette

---

# 11. Pixelorama Layer Spec

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

카린 전용 추가가 필요할 경우:
```text
06A_RED_RIBBON
```
추가 가능.

---

# 12. File Set

권장 저장 위치:

```text
D:\MYGAME\lucky_girls\04_CHARACTERS\08_KARIN\MASTER\SD_DESIGN\
```

파일:

```text
08_KARIN_SD_DESIGN_SPEC_V1.md
```

Pixelorama source:

```text
D:\MYGAME\lucky_girls\04_CHARACTERS\08_KARIN\SPRITES\SOURCE\PIXELORAMA\
```

예:
```text
08_KARIN_IDLE.pxo
08_KARIN_MOVE.pxo
08_KARIN_ATTACK_01.pxo
08_KARIN_SKILL_01.pxo
08_KARIN_HIT.pxo
08_KARIN_DOWN.pxo
```

Krita workfile:

```text
D:\MYGAME\lucky_girls\04_CHARACTERS\08_KARIN\WORKFILES\KRITA\
```

권장 파일:
```text
08_KARIN_SD_PREP.kra
08_KARIN_SD_PALETTE.png
08_KARIN_SD_GUIDE.png
```

---

# 13. Approval Gate

카린 SD 작업은 다음 단계를 따른다.

```text
MASTER REFERENCE
↓
KRITA PREP
↓
SD BASE
↓
IDLE TEST
↓
MOVE TEST
↓
ATTACK / SKILL
↓
EXPORT TEST
↓
QC
↓
WAITING_MASTER_APPROVAL
```

`WAITING_MASTER_APPROVAL`에서 반드시 멈춘다.

승인 전에는:
- FINAL 이동 금지
- MASTER 승격 금지
- 19명 전체 자동 확장 금지

---

# 14. Pilot Success Criteria

카린 파일럿은 아래를 모두 통과해야 한다.

- [ ] 96×96에서 카린으로 즉시 인식 가능
- [ ] 긴 흑발과 붉은 장식이 읽힘
- [ ] 검정+진홍 암살자 색상 정체성 유지
- [ ] 허리-골반 실루엣이 무너지지 않음
- [ ] 단검이 작은 화면에서도 인식됨
- [ ] IDLE 6프레임이 자연스러움
- [ ] MOVE에서 체형 흔들림 없음
- [ ] ATTACK이 한눈에 읽힘
- [ ] SKILL VFX와 캐릭터가 분리됨
- [ ] 투명 배경 정상
- [ ] Pixelorama export 정상
- [ ] 게임 프로젝트에서 정상 렌더링

---

# 15. Reuse Rule

카린 파일럿이 승인되면 다음 항목은 20명 공통 템플릿으로 승격 후보가 된다.

- 96×96 캔버스
- 2.8~3등신 기준
- 기본 레이어
- IDLE 구조
- MOVE 구조
- HIT 구조
- DOWN 구조
- export naming
- JSON metadata format
- QC checklist
- approval gate

카린 고유 요소는 템플릿화하지 않는다:
- 머리
- 색상
- 의상
- 무기
- Sexy Appeal Focus
- ATTACK/Skill 개성

---

**Version:** V1  
**Status:** DRAFT FOR PILOT  
**Character:** 08_KARIN / 카린  
