# Development checklist

## Current release — October 7 illustrated-town correction

This table supersedes the older renderer/default/attraction status entries below, which remain as development history. The owner explicitly approved the supplied illustrated town as the primary navigation experience.

| Item | Status | Scope / evidence |
|---|---|---|
| Approved town as actual play entry | COMPLETE | Profile selection enters the exact supplied master artwork; proportional hotspots, native pan, whole-scene view and accessible destination chooser. No WebGL prerequisite. |
| Approved scene rooms | COMPLETE | Home, arcade, backyard, bubble garden, arena and classroom images derived from exact supplied files; lazy loaded. Room pictures are navigation, not falsely labeled simulations. |
| Existing content preservation | COMPLETE | Original HTML activity files untouched; all remain in Classic Games. Driving, racing, skee-ball, cooking, blocks, books and baby-doll activities also have direct room entrances. Their older presentation has not been represented as a new finished remake. |
| Bubbles and mowing | COMPLETE | Existing authoritative pop IDs, progression and shared cut cells retained under the new presentation. |
| Bowling foundation | COMPLETE | Swipe or aim/roll controls, ball colors, moving ball, pin collision/chain reaction, gutters, 10-frame strike/spare scoring, computer turns and approved family turn queue. Host owns results; completed personal best/game count saved with existing profile data. |
| Coloring and whiteboard | COMPLETE | Opens actual existing editor directly from the art table or school board, with saved drafts/profile galleries; no intervening primitive 3D room. |
| Family room and profile preservation | COMPLETE | Same host approval, profile lock, storage keys and gallery schema. New destination requests are allowlisted; no client-supplied position/score authority. |
| Live browser and touch QA | IN PROGRESS | 27 automated tests pass, including scoring, collision outcomes, approved entry, asset/activity targets, preserved progress and returns. Live browser checks are recorded separately; real iPad/iPhone and separate-device connection checks remain required. |
| Additional attractions | PLANNED | Shop purchases, full home routines, zoo interaction, circus show, theater library, playground equipment, railroad, church stories, Move & Groove and other requested new games remain separate implementation work. Unbuilt scenery has no fake play hotspot. |
| Authentic sounds / further animations | NEEDS ASSET | Synthesized feedback/narration retained; approved scene art is received. Rigged family/NPC models are optional future 3D work, no longer a blocker to the approved illustrated town. |

## Earlier foundation history

COMPLETE means the stated foundation implementation exists and its listed checks pass. It does not mean the final requested world is finished. Free GitHub Pages room-code play supersedes mandatory paid server hosting at the user’s request.

| System | Status | Evidence / next step |
|---|---|---|
| Existing project audit and preservation | COMPLETE | Original homepage preserved as classic-home.html; 43 other HTML pages and all assets unchanged |
| Optional secure server authentication | COMPLETE | Retained for future use; not required or claimed for free code-based play |
| Free family room approvals and guests | COMPLETE | Random room code, host approval per device/profile, removal; transport tests |
| Profile selection / saved state schema | COMPLETE | Four family profiles + approved guests; host-browser progress/preferences; inventory/model schema |
| Real approved shared sessions | IN PROGRESS | Free host-authoritative PeerJS rooms implemented and fake-transport tests pass; live two-client attempt timed out before approval in cloud browser; separate-iPad QA still required |
| Consistent world navigation | COMPLETE | Shared location coordinates, doorway proximity, connected walking/driving, Classic return path |
| Connected world shell and driving | IN PROGRESS | Functional movement/controls retained; Canvas world presentation must be replaced under the approved visual direction; held-pedal route assistance and golden paths implemented; real-device steering QA needed |
| Classic Games / Game House | COMPLETE | All original games preserved in hosted iframe; optional private-server copy disables legacy open PeerJS rooms |
| Lawn mowing foundation | COMPLETE | Unique grass removal; shared lawn/profile count saved on hosting browser |
| Bubble garden foundation | COMPLETE | Fixed large bubbles, pop hit detection, confetti, saved progression and spoken vocabulary; server persistence checks |
| Bubble illustrated surprises / color challenges | IN PROGRESS | Prompt stages implemented; illustrated contents and targeted task progression needed |
| Shared tag foundation | IN PROGRESS | Host-authoritative contact and computer residents; browser gameplay/age-assistance polish needed |
| Hide-and-seek / Find Mommy | PLANNED | Countdown/hide/search, shared visibility rules, toddler assistance |
| Approved individual character references / visual prompt | COMPLETE | Four unchanged approved sheets mapped in VISUAL-DIRECTION.md; older combined sheet superseded |
| 3D renderer migration contract | COMPLETE | Preserve gameplay/state while replacing Canvas world presentation; see RENDERER-MIGRATION.md |
| 3D renderer implementation / corrected neighborhood | IN PROGRESS | New-town 3D scene is the default following October 7 owner request; arch, fountain and destination skyline added. Approved master artwork is used for welcome/overview. 22 regression tests and structural geometry checks pass; GPU visuals and Safari hardware remain unverified. Approved character rigs still needed |
| Directional family artwork and visual profiles | COMPLETE | Four separate approved references used for derived transparent atlases, visual profile selector and directional walkers; not rigged models |
| Final family character models | NEEDS ASSET | Individual sheets received; rigging, animation and consistent game-ready models still required |
| Final world scenery / authentic sounds | NEEDS ASSET | See ASSETS.md; development art/audio explicitly identified |
| Free GitHub Pages play | COMPLETE | Existing site published; welcome, room creation and profile selection confirmed in live browser; cross-device play has a separate QA gate |
| iPad / iPhone Safari hardware QA | PLANNED | Real-device touch, audio, rotation, reconnect, memory/performance checks |
| Interactive family home | PLANNED | All rooms, objects, bath/potty/bed routines, dressing, toy inventory; doorway is a development notice |
| Shop + usable purchases | PLANNED | Physical pickup, basket, scanning, home inventory; inventory schema reserved |
| Advanced landscaping | PLANNED | Jobs, watering, flowers, leaves, reset/progression rules |
| Bowling + arcade | PLANNED | Swipe physics/scoring, NPC/family turns, skee-ball, bumper cars, coaster |
| Go-kart / motorcycle / monster truck | PLANNED | Actual track simulation, rivals, assisted controls, jumps |
| Park + playground | PLANNED | Animated slide/swing/tire swing and rider camera |
| Zoo (~25 animals) | PLANNED | Recognizable approved models, authentic audio, narrated local content |
| Circus | PLANNED | Animated show, lights/music, look-around camera |
| Expandable theater | PLANNED | Lobby, posters, seats, dimming, local original movie manifest |
| Coloring & Creativity Center / Whiteboard | COMPLETE | 23 original vector coloring pages, full palette and seven tools, bucket fill, sizes, undo/redo, stamps, downloads, tracing coverage, vocabulary and matching; artwork bound to approved profile and stored on host in IndexedDB. Browser QA recorded in CREATIVITY-CENTER.md |
| Creativity hardware QA / further illustration packs | IN PROGRESS | Real iPad Pencil/touch and Safari storage QA remain; expandable sheet manifest, more Bible/seasonal illustrations can be added |
| Railroad + train rides | PLANNED | Shared crossing barriers/signals, traffic waiting, station, camera views |
| School bus | PLANNED | Boarding, NPC riders, connected route |
| School / early learning center | PLANNED | Physical manipulatives; speech-first toddler mode; preschool progression |
| Church / Sunday school library | PLANNED | Visual narrated Bible library; gentle short practice; movement/music |
| Move & Groove studio | PLANNED | Mommy animation, original songs/video manifest, no camera requirement |
| Progress backup / restore | IN PROGRESS | Host can download progress JSON; restore interface planned |
| Multi-instance scalability | PLANNED | Shared authoritative session service + centralized storage; do not scale current process horizontally |


### Creativity correction after owner rejection

| Item | Status | Evidence / remaining work |
|---|---|---|
| Drawing engine, profile galleries, original pictures | COMPLETE | Existing engine/data preserved; 19 tests and native pixel checks pass |
| Actual 3D Creativity Center room | IN PROGRESS | Physical furniture, window/outdoor geometry, walk/look, raycast stations, gallery textures; mobile/Safari visual acceptance pending |
| Monster truck and dinosaur illustrated pages | COMPLETE | Two versioned WebP pages, genuine fill verified; older backgrounds preserved |
| Assisted touch coloring | COMPLETE | Starting-region clip, wider Halli crayon, validated save/undo/redo; native pixel isolation verified |
| Other coloring pages at final illustrated quality | NEEDS ASSET | 23 originals retained, not represented as the final commissioned art collection |
| Shared visible characters inside the art room | PLANNED | Family room connection maintained; interior avatar presence is not yet implemented |
| Whole-world approved visual correction | IN PROGRESS | October 7: approved town welcome/overview installed, default changed from flat prototype to 3D town, modeled landmarks added. Final detailed scenery, animated character models and real-device visual acceptance still required |
