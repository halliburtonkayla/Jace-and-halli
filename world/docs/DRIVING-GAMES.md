# Town Driving and Tractor Farm

October 7, 2026: the owner's request upgrades these two existing activities. It does not replace the approved illustrated main town or the existing racing game.

- `town-driving.html`: free continuous x/z driving through a connected street grid, recognizable world destinations, first-person/chase cameras, map/heading guidance, unique place discovery, proximity/speed gated entrances to existing activities.
- `tractor-farm.html`: starts inside the cab. Work real ground patches in order: plow, plant, harvest, then haul to the barn and stop to deliver. A lifted implement does no work. Driving outside the field or idling awards no crop progress. Replay creates a new field. Delivery cannot be claimed again after reloading.
- Both: independent multi-touch pedals and finger steering, keyboard support, reverse recovery, collision boundaries, sound/read-aloud, pause on blur/visibility loss, safe reset without erasing accomplishments, responsive portrait/landscape controls.
- Presentation is a perspective software 3D scene rendered in Canvas, with free camera heading and near-plane clipping. It reuses the existing racer's car art, input abstraction and audio. It needs no external graphics library or paid service. Building geometry is newly modeled scenery for these activities, not an exact conversion of the approved painted town into a 3D asset.
- Main town, family identities, family room protocol, galleries, existing racer/multiplayer, and prior progress are preserved. The host sends the approved current profile and sound setting to the same-origin activity iframe; only known destinations can be opened. Standalone links also work.
- New driving/crop records use separate per-profile device-local `jhw-driving.v1.*` keys. These two activities are solo games; this change does not add shared driving or synchronize farm progress across devices.
- Movie Theater connects to the theater added in the concurrent October 7 update; that work and its family film are preserved.

## Verification

`node --test world/tests/driving.test.mjs` checks movement, braking, reversing, collision, unique discoveries, independent touch IDs, real work coverage, a complete crop cycle, reload, delivery deduplication and replay. Existing tests are retained.

`world/tests/driving-viewport.html` loads the actual game page at phone and landscape dimensions; it drives with keyboard events, tests pause/camera/map, and measures control bounds. QA uses an isolated `qa-driving` profile. The optional `?qa=1` page exposes a read-only snapshot, not controls that mutate game state.

Native Canvas renders were visually reviewed in 844×390 and 390×844 views. Real iPhone/iPad Safari touch, performance, haptics and sound must still be checked on physical devices; simulated dimensions are not a hardware claim.

## Publication checkpoint

The local implementation is committed on `codex/town-driving-tractor`, based on the theater merge `9cfd274`. All 50 current repository tests pass. GitHub publication was blocked by automatic approval review, which requires explicit owner permission to push this change to `halliburtonkayla/Jace-and-halli`. The owner then explicitly approved publication. The authenticated GitHub connector is used for publishing because this checkout has no command-line push credential. After merging, run the existing `driving-viewport.html` fixture on the live Pages site in both orientations and verify the family-world entry/exit bridge. The cloud browser cannot access localhost in this session, so live browser QA remains pending.
