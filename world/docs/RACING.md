# Neon City Racers — October 7, 2026

The existing `arcade-new.html` racing tab is upgraded in place. Skee-ball and Stop the Light retain their original code. Town destinations, other games, approved scene artwork, room codes, invitations, inventory, and artwork galleries remain intact.

## COMPLETE

- One dependency-free Canvas pseudo-3D engine with continuous steering, speed/momentum, hills, curved roads, road-edge and car-to-car contacts. This is projected arcade 3D, not a polygonal WebGL scene.
- Eight physically simulated cars, seven labeled computer racers, three full-distance laps, interpolated crossing times and real finishing order. Unfinished AI cars show “Racing…” until they cross; their results are never invented.
- Four rear-view car designs with different handling, acceleration and maximum speed; five circuits reuse the engine: Neon City, Dinosaur Valley, Monster Truck Speedway, Bubble Beach and Country Road.
- Starting grid, 3/2/1/GO, hold controls with independent pointer capture, WASD/arrows, coasting/braking, pause on lost focus, results, replay and garage.
- Chase perspective, moving dimensional roadside scenery, lane/curb markings, finish gantry, tire movement, brake lights and passing feedback. Canvas pixels capped at 1.6× device scale; reduced-motion preference and automatic detail reduction.
- Synthesized engine pitch, start/countdown, skid, contact, lap and finish sounds. Sound unlocked through a user gesture. Haptics only when supported; no microphone, camera or tilt permission.
- A narrowly scoped origin/source-checked iframe bridge returns to the current world without reloading its room. Existing host-approved profile records store personal best lap/race and race count. A direct arcade visit stores separate local device records. Neither is a public leaderboard or a multiplayer race.

## Architecture and preservation

`world/client/racing/config.mjs` defines cars, palettes and continuous track geometry. `engine.mjs` is DOM-free simulation. `render.mjs` projects segmented roads and rear-view cars; artwork is generated before play, with no asset download. `controls.mjs`, `audio.mjs` and `app.mjs` own input, feedback and UI. Heavy work stops while the race tab is inactive. Parent integration is limited to the classic iframe, sound preference and a validated `race-result` action. Saved world format and existing keys are unchanged; `data.racing` is optional.

`npm test --prefix world` passes 36 tests, including continuous steering, simultaneous controls, coast/brake behavior, countdown, contacts at the circuit seam, passing, three-lap crossings, complete eight-car races on all tracks, isolated profile records and the 27 previous world tests. Original skee-ball and Stop the Light script blocks compare byte-for-byte equal to the preceding commit.

`world/tests/racing-viewport.html` is a developer test fixture, not a second game. It loads the exact existing arcade page in 390×740 and 844×390 frames. Its optional input replay holds keyboard controls and steers for three full laps, observing DOM telemetry without teleporting cars, setting race state or shortening tracks.

## IN PROGRESS

- Live browser phone/landscape interaction and full-race checks (recorded below after release validation).
- Physical iPhone/iPad Safari checks, especially simultaneous touch, audio balance and sustained frame rate. Desktop browser viewport checks cannot certify device performance.

## NEEDS ASSET / PLANNED

- Optional recorded vehicle audio and richer authored vehicle/environment art; current feedback is synthesized and current cars/scenery are procedural arcade artwork.
- Human-versus-human synchronized racing, motorcycle riding, jumps and unlockable content are future features. Existing family multiplayer continues elsewhere in the world; this race explicitly uses seven computer opponents.
