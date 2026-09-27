# TD Alpha Acceptance — 2026-09-27

Project: Lucky Girls: Last Wall

Status: ACCEPTED BY MASTER FOR TD SYSTEM PROTOTYPE

The current GitHub/WebView TD prototype is considered sufficient for system validation and can move out of primary feature-development focus.

Accepted prototype scope includes:
- 18x10 Stage 1 playable map
- G Final Wall -> O Gate Core defense flow
- 10-wave structure
- 40-second normal wave timing
- early enemy-wipe bonus flow
- Wave 5 midboss
- Wave 10 boss warning at 3s / boss entry at 6s / enrage at 40s
- Wave 10 has no forced timeout; TD boss defeat is required for RPG transition
- unit progression / same-family upgrades
- Ariya combination from two 기사단장
- hero material-slot placement selection while battle time is frozen
- all-unit movement / swaps with 5-second move lock
- manual pause
- shared simulation speed handling
- top-area warnings that do not obscure the map
- upgrade UI showing ATK and combat traits

Next development focus:
RPG boss battle prototype and TD -> RPG transition.

The WebView alpha remains a reference implementation for system rules. Final camera controls, pinch zoom, production rendering, animation, VFX, audio, pooling and mobile optimization are deferred to Unity.
