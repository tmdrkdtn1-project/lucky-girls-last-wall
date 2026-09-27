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
