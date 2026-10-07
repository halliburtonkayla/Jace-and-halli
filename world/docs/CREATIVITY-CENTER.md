# Coloring & Creativity Center

The existing Game House now includes a dedicated interactive coloring book and separate whiteboard. `Color & draw` on the existing welcome screen starts the current family room and profile selector; `Create` in the world or the Game House opens the same center. This is an overlay in the hosting page, so peers remain connected. Enter/exit actions stop movement and return the player to the previous scene. Original whiteboard.html, all other games and original progress keys are preserved.

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

Repository tests cover edit history, fill boundaries/black recoloring, trace contacts, profile isolation, ordered upload bounds, malformed artwork, actual approved peer message round trips, movement pause/return, and existing room/game behavior. Native Canvas QA renders all 23 sheets, verifies fill/eraser/undo/redo pixels and traces A through the real pointer event handlers. Live UI QA and Safari limitations are recorded after deployment.
