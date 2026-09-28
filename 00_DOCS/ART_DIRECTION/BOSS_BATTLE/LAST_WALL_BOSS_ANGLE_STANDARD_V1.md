# LAST WALL BOSS ANGLE STANDARD V1

**Project:** Lucky Girls: Last Wall  
**Scene Code:** `LAST_WALL_BOSS_ANGLE`  
**Purpose:** 최종보스 RPG 전환 장면에서 영웅들이 성벽 앞에서 거대한 보스를 올려다보는 시그니처 구도를 일관되게 재현하기 위한 프롬프트/아트디렉션 기준.

---

## 1. 핵심 한 줄

> 카메라는 영웅 측의 낮은 위치에 있고, 관객도 영웅들과 함께 성벽 위의 거대 보스를 올려다보는 최후 결전 구도.

이 기준이 흔들리면 해당 장면의 핵심 연출이 사라진다.

---

## 2. 절대 유지 요소

- 16:9 가로형
- 낮은 카메라 시점
- 영웅 5명은 하단 전경
- 성벽은 중경
- 초거대 보스는 성벽 위 상단 배경
- 영웅의 얼굴/고개/무기 방향은 위쪽 보스를 향함
- 보스는 아래를 굽어보는 위치
- 강한 상향 원근감
- 영웅과 보스의 극단적 스케일 대비
- 종말적 공성전 / 최후의 방어선 / 다크 판타지 무드

### 금지
- 영웅과 보스가 같은 눈높이
- 평평한 수평 구도
- 영웅들이 정면만 보고 보스를 올려다보지 않는 구도
- 보스가 단순히 뒤에 크게만 있는 구도
- 카메라가 너무 높아 탑뷰처럼 되는 구도
- 보스가 작거나 멀어 위압감이 사라지는 구도

---

## 3. 공간 레이어

### Foreground
- 영웅 5인
- 무기
- 바닥 파편 / 잔해

### Midground
- 최후의 성벽 / 성문
- 깃발
- 불길
- 파괴된 방어선

### Background
- 초거대 재앙형 보스
- 연기
- 붉거나 어두운 하늘
- 무너진 건축물

권장 화면 점유:
- 상단 30~40%: 보스 + 보스 UI
- 중앙 25~35%: 성벽 / 폐허
- 하단 25~30%: 영웅 + 파티 UI

---

## 4. 카메라 키워드

- `low-angle cinematic shot`
- `upward-looking composition`
- `camera near the heroes`
- `viewer shares the heroes' perspective`
- `heroes looking up at the giant boss`
- `boss towering above the fortress`
- `intimidating vertical dominance`
- `extreme scale contrast`

---

## 5. 3 Section 구성

### SECTION 1 — READY / FRONT
- 영웅들은 정면 또는 정면 3/4
- 각자 전투 준비 포즈
- 얼굴이 보임
- 시선은 화면 상단의 보스를 향함
- 카메라는 낮은 위치
- 아직 전투 돌입 전의 긴장

Narrative example:
`[보스 이름]이 다가온다.`

### SECTION 2 — PRE-BATTLE / REAR
- 영웅 5인 후면
- 고개를 들고 보스를 올려다봄
- 성벽과 보스의 높이 차 강조
- 전투 돌입 직전
- 관객도 영웅 뒤에서 보스를 함께 바라보는 구도

Narrative example:
`공포가 엄습하고 있다.`

### SECTION 3 — COMBAT / SKILL
- 실제 전투 스틸
- 공격 모션 / 스킬 발동
- 공격 방향은 전방 상단의 보스를 향함
- 카린은 붉은 계열 돌진/베기 효과
- 보스는 여전히 상단에서 압도적 위치 유지

Narrative example:
`최악의 공포에 맞서, 살아남아야 한다.`

---

## 6. 영웅 배치

- 영웅 수: 5
- 중앙 핵심 영웅: 카린
- 좌우 2명씩 배치
- 역할 실루엣이 명확해야 함
- SD 또는 세미 SD 전투 비율
- 각 캐릭터의 공식 MASTER 설정을 우선

카린 핵심:
- 긴 흑발
- 붉은 장식
- 검정/진홍 계열
- 암살자 실루엣
- 단검/쌍단검 계열
- 민첩한 자세

---

## 7. 보스 기준

- 화면 상단 중앙
- 성벽보다 훨씬 큰 스케일
- 영웅을 내려다보는 자세
- 재앙/포식자/거수 계열 실루엣
- 붉은 입광 또는 위험 신호 계열 가능
- UI 공간을 침범하지 않도록 상단 여백 관리

보스는 단순히 '큰 적'이 아니라 **위에서 내려오는 재앙**처럼 보여야 한다.

---

## 8. UI 기준

### 상단
- 보스 이름
- 레벨 또는 Threat
- 긴 HP Bar
- 상태이상 아이콘
- Wave
- Pause

### 하단
- 영웅 5인 초상화
- 이름
- 레벨
- HP
- Skill slots
- 필요 시 우측 하단 전투 개시 / 주요 액션 버튼

UI는 실제 제작 단계에서 배경/보스/영웅과 분리 에셋화한다.

---

## 9. Common Prompt Core — KR

Lucky Girls: Last Wall의 최종보스전 장면. 반드시 영웅들이 성벽 앞에서 거대 보스를 올려다보는 구도여야 한다. 카메라는 영웅들 가까이의 낮은 위치에 있어 관객도 영웅들과 함께 보스를 올려다보는 느낌을 받아야 한다. 영웅 5인은 화면 하단 전경에 배치하고, 성벽은 중경, 거대 재앙형 보스는 화면 상단 배경에서 성벽 위로 솟아오르며 영웅들을 내려다보는 위치에 배치한다. 강한 상향 원근감, 극단적인 스케일 대비, 최후의 방어전, 종말적 공성전, 불타는 성벽, 연기, 화염, 사슬, 깃발, 잔해, 압도적인 위압감, 장엄한 다크 판타지 분위기.

---

## 10. Common Prompt Core — EN

A final boss battle scene for Lucky Girls: Last Wall. The composition must emphasize that the heroines are looking up at the boss. Use a low-angle camera placed near the heroes so the viewer shares their perspective. Place five heroines in the lower foreground, a fortress wall in the midground, and a colossal calamity-type boss towering high above the wall in the upper background, looking down at them. Strong upward perspective, extreme scale contrast, last stand atmosphere, apocalyptic siege, burning fortress, smoke, fire, chains, banners, debris, overwhelming intimidation, and epic dark fantasy mood.

---

## 11. 에셋화 원칙

최종 실사용 단계에서는 통합 그림 한 장으로 끝내지 않고 다음을 분리한다.

1. Background / Fortress
2. Boss
3. Five Heroes or individual Hero battle poses
4. VFX
5. Boss UI
6. Party UI

통합 콘셉트 이미지는 구도/분위기 기준으로 사용하고, 실제 게임 에셋은 분리 제작한다.

---

**Version:** V1  
**Status:** HOLD FOR ASSET PRODUCTION  
