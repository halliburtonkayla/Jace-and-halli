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

- Physical iPhone/iPad Safari checks, especially simultaneous touch, audio balance and sustained frame rate. Desktop browser viewport checks cannot certify device performance.

## Live browser validation — completed October 7

- The published existing arcade was tested at 390×740. START RACE produced the countdown; held gas reached 82 MPH and moved 100 meters from its grid position; release coasted to 79 MPH; held brake reduced speed to 25 MPH. Continuous steering changed lateral position, and both passing and collisions occurred.
- The input replay drove three full-length laps without setting race state or shortening the track. Positions changed from 8th through 6th and 4th to 2nd. Jace's actual finish was 2:06.45; laps were 0:48.04, 0:41.66 and 0:36.75. The seven computers finished at 2:06.04, 2:10.76, 2:14.12, 2:18.34, 2:18.46, 2:18.58 and 2:21.60. All eight result rows, lap times, best lap and result navigation rendered. The document had no scrolling during racing.
- Actual pointer holds on the visible on-screen gas, steering and brake controls accelerated the car, moved it into a barrier, and braked it back to 0 MPH. Independent simultaneous pointer state is also covered by the automated input test; two-finger Safari hardware input is still pending.
- The 844×390 landscape garage initially clipped Start Race. Its corrected layout now shows that control fully at y=271–316 within the 390-pixel viewport. Vehicle and track selection changed the rendered racer to Little Monster on Bubble Beach. Change Track from results returned to the garage.
- The first browser run exposed timing tied to throttled redraws. The fixed-step simulation now uses an independent clock; the successful complete race above ran with that correction. Painting remains requestAnimationFrame-driven with adaptive detail. No claim of measured 60 FPS on physical iOS hardware is made.
- Verified both direct arcade → World entry and embedded World → arcade → race → Back to Our World. The latter kept the same Jace profile, room code, and arcade scene without reloading the host. The host's outer return toolbar is hidden only while the racer's own return control is active.
- GitHub Pages successfully published commit `902b6b9`; this record-only change does not alter that tested game build. The earlier publishing failure was recovered. GitHub's direct ref API later returned internal errors, so the timing/layout fix went through clean, merged PR #2.

## NEEDS ASSET / PLANNED

- Optional recorded vehicle audio and richer authored vehicle/environment art; current feedback is synthesized and current cars/scenery are procedural arcade artwork.
- Motorcycle riding, jumps and unlockable content are future features.

## Family racing — October 7 update

COMPLETE (implementation and automated validation): The same racer now offers Solo and Race with Family. Open `index.html?race=family` to create/join an approved family room and go straight to racing. Each device selects its own profile and car. Everyone taps Ready; the first racer leads track selection and starts the shared countdown. Eight seats include computers for unoccupied places. Approval and profile locking remain enforced by FamilyRoom; no public matchmaking or new paid service is added.

`racing/session.mjs` owns one race on the existing hosting device, reusing solo physics at 60 Hz substeps. Snapshots travel at 10 Hz. Children submit bounded input, a race ID and monotonic sequence; the host determines positions, laps, collisions and finish times. `network.mjs` interpolates with a 100 ms buffer for each device's own chase camera. The source/origin-checked iframe bridge never accepts another player's identity from the racer.

Missed controls brake after 800 ms; after three seconds an indicated computer helper drives until input resumes. Pit Stop uses the helper while the race continues. Leaving transfers leadership and converts the departed car to a computer; that profile earns no subsequent record. Late entrants wait for the next lobby. At six minutes remaining cars are marked DNF without invented times. The leader opens Next Race after all cars finish. Human records are saved once by the host, separately per profile; clients do not submit multiplayer results.

42 automated checks pass, including two approved transport endpoints, independent controls, leader permissions, ready resets, packet ordering/race-ID rejection, collisions, full-length shared three-lap finishes, profile records, departure/helper behavior, interpolation and prior solo/world checks.

IN PROGRESS: Live two-browser race and phone layout verification. Physical iPads and school-network WebRTC reachability require device testing. Keep the host open and awake; closing it ends the room. Existing free PeerJS signaling is reused without a newly configured relay, so networks blocking peer connections may prevent joining. Room codes remain session invitations, not secure authentication for the public website.
