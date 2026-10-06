# Existing project audit

Baseline: `ec4e3856c2adeb5894f161b7c0fa395ad4cddcb1` on main, inspected October 6, 2026.

The repository has 44 independent HTML files, inline CSS/JS, two photo assets, two scene PNGs, one MP3, and upload notes. No package, server, service worker, shared router, authentication, durable profile store, or database existed. Every original HTML source was read during audit.

## Navigation and state

`index.html` separates Jace/Halli menus. `jace.html` and `halli.html` link independent activities; shared books/arcade point back to index. Original file-relative paths remain functional under `/classic/`. No localStorage, sessionStorage or IndexedDB calls exist in the original source. Drawings, game scores and current pages are in-memory and reset on reload; there is no saved profile system to migrate or erase. Preserve the original source as a compatibility contract.

`together.html` uses PeerJS public signaling and five-character room names without parent approval. This is network play, but not secure private family access. The new server disables its room creation/join controls only in the served private copy; local cooperative games are retained.

## Source findings

- `riding-mower.html` increments completion from elapsed movement time, including already visited grass. New mowing counts actual unique patches.
- `halli-bubbles.html` spawns two new bubbles after each pop without a population cap and makes a new AudioContext per pop. New garden uses a fixed bubble population and one shared AudioContext.
- `landscape-new.html` depends on an external real-estate image and uses a 620px minimum-height play area; unsuitable as the connected world’s mobile landscape foundation. Its file remains untouched.
- Many activities use emoji artwork, static CSS toys, DOM events or repeated generic vehicle code. Preserve as Classic; do not claim these are the new final 3D experience.
- `watch.html` opens external YouTube Kids searches; keep this out of the new world/media library. Parent content allowlisting for Classic is a future hardening task.

## Original file inventory

Canvas/event counts are source indicators, not a claim of gameplay quality.

| File | Title | Canvas mentions | Animation loop | Local linked files missing |
|---|---|---:|---|---|
| `arcade-new.html` | Jace & Halli Arcade - New | 8 | yes | none |
| `arcade.html` | Jace & Halli Arcade | 8 | yes | none |
| `art.html` | Jace & Halli Coloring Book | 0 | no | none |
| `blocks.html` | Jace's 3D Block Studio | 0 | no | none |
| `bubbles.html` | Bubble World | 0 | no | none |
| `clicky-computer.html` | Clicky Computer | 0 | no | none |
| `construction-drive.html` | Construction | 3 | yes | none |
| `dinosaurs.html` | Jace's Dinosaur Adventure | 3 | yes | none |
| `driving.html` | Jace's Driving Adventure | 3 | yes | none |
| `family-library.html` | Jace & Halli Story Library | 0 | no | none |
| `halli-abc.html` | MY FIRST ABC BOOK | 2 | no | none |
| `halli-animals.html` | Animal Touch | 0 | no | none |
| `halli-baby.html` | Halli's Baby Doll | 0 | no | none |
| `halli-balloons.html` | BALLOON POP | 0 | yes | none |
| `halli-bath.html` | Halli Bath Time | 0 | no | none |
| `halli-bubbles.html` | BUBBLE POP | 0 | yes | none |
| `halli-colors.html` | Color Splash | 0 | no | none |
| `halli-counting.html` | MY FIRST COUNTING BOOK | 0 | no | none |
| `halli-garden.html` | BUTTERFLY GARDEN | 0 | no | none |
| `halli-kitchen.html` | Halli Little Kitchen | 0 | no | none |
| `halli-lights.html` | LIGHTS & COLORS | 2 | yes | none |
| `halli-magic-paint.html` | MAGIC PAINT | 2 | no | none |
| `halli-music.html` | MUSIC ROOM | 0 | no | none |
| `halli-peekaboo.html` | PEEK-A-BOO | 0 | no | none |
| `halli-playroom.html` | Halli's Magic Playroom | 0 | no | none |
| `halli-stars.html` | Twinkle Stars | 0 | no | none |
| `halli.html` | Halli's World | 0 | no | none |
| `index.html` | Jace & Halli | 0 | no | none |
| `jace.html` | Jace's World | 0 | no | none |
| `landscape-new.html` | Jace's Yard | 2 | no | none |
| `landscape.html` | Jace's Yard Crew | 2 | yes | none |
| `learning-tent.html` | Learning Tent | 0 | no | none |
| `learning.html` | Jace Learn & Trace | 5 | no | none |
| `little-chef.html` | Jace's Little Chef | 0 | no | none |
| `monster-truck-drive.html` | Monster Truck | 3 | yes | none |
| `monster-trucks.html` | Monster Truck | 0 | no | none |
| `riding-mower.html` | Riding Mower | 3 | yes | none |
| `storytime.html` | Story Books | 0 | no | none |
| `together.html` | Play Together | 3 | no | none |
| `toolbox.html` | Jace's Fix-It Workshop | 0 | no | none |
| `town-driving.html` | Town Driving | 3 | yes | none |
| `tractor-farm.html` | Tractor Farm | 3 | yes | none |
| `watch.html` | Watch & Learn | 0 | no | none |
| `whiteboard.html` | Jace & Halli Whiteboard | 4 | yes | none |

## Validation and release boundaries

- `npm test`: four passing tests cover unauthenticated access, foreign-origin writes, password check, cookie flags, one-use invitations, child profile/admin restrictions, independent authenticated players in shared snapshots, preferences persistence, device revocation, duplicate-profile refusal, Classic signaling removal, car controls, unique mowing patches and doorway proximity.
- Every original HTML source remains unchanged relative to the baseline. All file-relative `href`/`src` targets discovered in the audit exist; external URLs were identified separately. This is source/link verification, not certification of every original game.
- Native Canvas render checks executed the world and bubble renderers, generated images for visual inspection and confirmed bubble hit regions. This is not browser compatibility testing.
- Playwright browser QA was attempted, but no browser executable was installed and Chromium download returned an invalid archive. No successful browser/iOS test is claimed. Real iPad/iPhone Safari testing, rotation/audio behavior, and all Classic activities still require manual/browser QA before release.
- The root homepage is unchanged while private hosting remains unavailable. The new authenticated server uses the new world as its root homepage. The new world has not been deployed publicly or privately.
- Input/model/world art are functional development foundations, not final 3D assets. Full home and all additional attractions remain planned in the checklist.

## Free room-code adaptation — October 6, 2026

At the user’s request, mandatory paid/private server hosting was replaced with free GitHub Pages room-code play. The root index is now the world entry point. The baseline index is preserved byte-for-byte as `classic-home.html`; other 43 original HTML pages/assets remain untouched. PeerJS connects approved devices, with the hosting browser owning the authoritative movement/progress state. Generated codes identify a room; they are not secure website authentication. Public source/assets remain accessible.

New automated tests use fake data connections to verify withholding snapshots before approval, restricting remote profile selection, shared movement/state, removal, generated codes, bubble hit validation, bounded population and persistence. Real browser/WebRTC and iPad QA remain pending. The Game House iframe keeps the host page alive while legacy activities run and rewrites their home links in the served frame only.
