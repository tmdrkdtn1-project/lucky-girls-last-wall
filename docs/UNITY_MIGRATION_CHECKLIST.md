# Lucky Girls: Last Wall — Unity Migration Checklist

Status: PREPARED
Scope: GitHub/WebView TD alpha -> Unity final runtime

## 1. Core combat state
- Preserve Stage hierarchy: World Map -> Local Map -> Battle Map
- Preserve 18x10 logical battle grid
- Preserve Stage 1 route / tile semantics
- Preserve G -> O defense chain
- Preserve 10 waves
- Preserve 40 second wave duration for Waves 1-9
- Preserve early wipe rule: enemy wipe before 40s -> immediate wave end + explicit "적 전멸 보너스"
- Preserve uncleared enemies across normal wave transitions
- Preserve Wave 5 midboss
- Preserve Wave 10 sequence:
  - 0s: normal enemies start
  - 3s: BOSS APPROACHING warning
  - 6s: TD boss enters
  - 40s: boss enrage if alive
  - no forced Wave 10 timeout
  - TD ends only when TD boss is defeated
  - then transition to RPG boss battle

## 2. Unit / hero rules
- All normal units and heroes can move
- Support tap-select movement and mobile drag & drop
- Occupied target tile -> swap positions
- Every unit involved in a move/swap receives 5 second move cooldown
- Hero summon materials are consumed
- After hero combination:
  - freeze battle time
  - show "[Hero]이 출전했다!" in top UI
  - player must choose one of the consumed material slots
  - place hero in chosen material slot
  - resume battle
- Hero slots: max 5 per stage
- Ariya Stage 1 recipe: 기사단장 x2 -> 아리아
- Same-family unit growth only
- No cross-family replacement

## 3. Camera / mobile controls
- Implement pinch zoom
- Implement one-finger camera pan
- Clamp minimum / maximum zoom
- Clamp camera bounds so important combat space cannot be permanently lost off-screen
- Do not force camera jumps for boss warnings
- Resolve gesture priority:
  - unit drag > camera pan when unit is grabbed
  - pinch zoom > pan
  - UI interaction blocks world input
- Preserve landscape orientation

## 4. UI / UX
- Fixed top HUD
- Contextual bottom unit UI
- Manual pause / resume
- Speed controls use one shared simulation time
- All warnings / notices stay near top HUD and do not cover battlefield
- Upgrade buttons show:
  - target unit name
  - gold cost
  - ATK
  - combat trait (single / pierce / AoE / DoT etc.)
  - air capability
- Boss and midboss must be visually larger than normal enemies
- Distinct boss / midboss VFX and HP presentation

## 5. Unity runtime implementation
- Replace WebView loop with Unity game state / tick architecture
- Object pooling for enemies, projectiles, VFX and damage text
- ScriptableObject or JSON-backed single source for unit / enemy / stage data
- Remove duplicated hard-coded balance tables from runtime scripts
- Deterministic wave state machine
- Explicit TD -> RPG transition state
- Separate simulation clock from UI / animation clock where needed
- Pause must freeze gameplay simulation without breaking UI
- Support 1x / 2x / 3x speed consistently
- Mobile memory / GC profiling
- Android performance profiling on target device

## 6. Art / animation migration
- Replace temporary circles/tokens with final or production-intent sprites
- Pixelorama/Krita assets imported with consistent pixels-per-unit
- Animation state setup for Idle / Attack / Hit / Move where applicable
- Sorting layers for units, enemies, projectiles, structures and VFX
- Boss scale and silhouette readability pass

## 7. RPG boss handoff
- TD boss defeat must not show Stage Clear
- Transition into RPG boss mode
- RPG composition: 5 heroes in one horizontal row
- Low camera behind/near heroes looking up at colossal boss
- Prepare 3-section presentation:
  1. front preparation
  2. rear / charge-in
  3. combat still / active RPG combat
- Stage Clear only after RPG boss defeat

## 8. Validation before retiring WebView alpha
- Stage 1 full clear reproducible
- Early-wave clear bonus verified
- 40s carry-over verified
- Wave 5 midboss verified
- Wave 10 boss 3s warning / 6s entry / 40s enrage verified
- G -> O defense and castle defenders verified
- Unit move/swap + 5s cooldown verified
- Hero combination placement-choice flow verified
- Manual pause and speed sync verified
- No legacy 20-wave / random-hero rules leak into runtime

## Migration policy
The GitHub/WebView build is a systems prototype. Do not spend time reproducing final camera, VFX, animation or performance work here once the rule is validated. Final runtime behavior, performance and presentation belong in Unity.
