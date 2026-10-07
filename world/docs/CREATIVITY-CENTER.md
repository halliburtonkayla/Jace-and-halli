# Coloring & Creativity Center

The existing Game House includes a dedicated interactive coloring book and separate whiteboard. The owner rejected the initial panel presentation; the corrective room and improved art below are IN PROGRESS pending visual acceptance. `Color & draw` on the existing welcome screen starts the current family room and profile selector; `Create` in the world or the Game House opens the same center. This is an overlay in the hosting page, so peers remain connected. Enter/exit actions stop movement and return the player to the previous scene. Original whiteboard.html, all other games and original progress keys are preserved.

## Implementation

- Canvas 960 × 640 with pointer capture, touch/mouse/pen support and coalesced-event fallback. CSS size follows the available viewport; bitmap coordinates remain stable through rotation.
- 23 original vector coloring sheets: monster truck, dinosaur, bubbles, doll, puppy, kitten, zoo, train, school, church, Noah’s ark, playground, car, motorcycle, kitchen, lunch, shapes, ABCs, counting, spring, summer, autumn and winter. Closed regions support genuine pixel flood fill; no remote image requests or emoji artwork.
- Red, orange, yellow, green, blue, purple, pink, brown, black, white, gray and rainbow. Crayon, marker, paintbrush, pencil, eraser, bucket and stamps; four sizes; undo/redo; clear is undoable; PNG download.
- Whiteboard opens blank. Optional uppercase/lowercase, 0–20, shapes, names, paths, picture vocabulary, sight words, color prompts and shape matching. Tracing target coverage uses actual interpolated pointer contacts. Feedback is gentle; there is no speech recognition or negative scoring. Local browser narration follows existing sound preferences.
- Logical operation documents preserve editable artwork rather than just screenshots. Drawing budgets: 450 operations / 18,000 points / 180,000 JSON characters. No external image or executable markup operations accepted.

## Storage / room boundary

`jace-halli-world.art.v1` IndexedDB stores profile-scoped saved pictures (up to 40 per profile), separate from the original family progress key. Local drafts preserve the current and per-page drawing on each device. Explicit Save picture sends validated document chunks through the existing approved room. The hosting device stores the gallery; approved players can reopen their gallery from another device while that host is running. No public gallery or messaging. Room recreation on that same hosting browser retains saved artwork. A different browser/hosting device has its own stored gallery. Clearing browser website data removes those local records; Download PNG keeps an independent copy.

Gallery transport requires a selected approved player. It derives profile from host player state, ignoring client-supplied profile IDs. Chunks are bounded to 2,700 characters, ordered, expire after two minutes and are validated again before saving. Incoming room message limits and gameplay request rates remain in place. Upload pacing leaves room for normal control messages. Removing a device clears partial uploads.

## Approved package

The supplied `Jace_Halli_World_MASTER_Clean_Approved_For_Work(1).zip` contains the approved scene/reference images and a readme. Its four renamed character PNGs have the same hashes as the existing authoritative sheets. Its main world image is the visual reference for future town work; the corrected church and bus scene selections are retained in that supplied package. This drawing feature does not claim to implement the remaining town destinations or turn approved still scenes into gameplay. Source character references remain outside this public repository.

## Verification

Repository tests cover edit history, fill boundaries/black recoloring, trace contacts, profile isolation, ordered upload bounds, malformed artwork, actual approved peer message round trips, movement pause/return, and existing room/game behavior. Native Canvas QA renders all 23 sheets, verifies fill/eraser/undo/redo pixels and traces A through the real pointer event handlers. Live deployed browser QA verified closed-region coloring, rainbow pointer drawing, undo/redo, actual A tracing completion, stamps, shape matching, saved-picture reopening after reload, Jace/Halli gallery isolation, and returning to the same room code. All 19 repository tests pass. Real iPad/iPhone Safari hardware, rotation and live two-device PeerJS artwork transfers still need hardware QA; simulated approved peer transport is covered by tests.


## Corrective studio pass — October 6, 2026

The center now enters a physical Three.js room before opening drawing. Rounded extruded furniture, a coloring book/table, whiteboard, framed profile artwork, wooden floor, mouldings, inset window, outdoor path/trees and lighting use actual geometry. Hold Walk / Turn or drag to look; tapping a mesh or its projected accessible label approaches the station and opens its working activity. The same existing room stays connected. Return to Art room preserves the draft; Exit center restores the previous world scene. The main world renderer and unfinished attractions are unchanged and still require their larger migration.

Three.js remains pinned to the existing 0.169.0 version, imported only for the center. WebGL failures/context loss offer honest access to working drawing activities instead of pretending a flat room is 3D. Hardware/visual acceptance is IN PROGRESS. Geometry checks find 179 meshes / 76,018 triangles, three visible raycast targets, finite positions; this is not a measured Safari frame rate. No unapproved family model is invented. The current profile uses its existing approved-derived portrait. Other players remain connected but shared 3D presence inside this room is PLANNED.

Two new versioned illustrated sheets — Monster Truck Adventure and Dinosaur Friends — use generated professional black-and-white line art, converted to optimized WebP (217,370 and 163,092 bytes). The 23 older sheets remain available and preserve previously saved pictures. New sheet IDs do not silently replace the backgrounds of older artwork. Native Canvas checks load both shipped image assets and verify genuine region fill.

Halli starts with wider crayons and Stay inside assistance. An optional `inside: true` stroke property clips paint to the closed region at the first pointer point. It is validated and remains editable through save/reopen, undo/redo. Jace can switch it on. Erasing and blank-board drawing remain free. Coloring pages open with the bucket selected and spoken/touch instructions. Previous/Next and a swipe on the page-title tab turn pages without confusing a coloring stroke with navigation. This is a corrective foundation, not a claim that every existing sheet has received final art or that the entire requested world is complete.

Art-generation prompts: built-in image generation; one landscape 3:2 professional toddler coloring page per asset, pure white/crisp black closed outlines, no gray/color/text/mockup. Truck: oversized chunky tires, visible raised suspension/axles, rounded pickup body, three-quarter view, gentle dirt ramp, stars and flags. Dinosaur: gentle baby brontosaurus and triceratops hatching from an egg, prehistoric leaves, distant volcano and sun, large closed areas. Source renders are preserved outside the public repository; optimized game assets are `world/assets/creativity/monster-truck-v2.webp` and `dinosaur-v2.webp`.
