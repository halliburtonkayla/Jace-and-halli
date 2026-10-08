# School playground — development status

This is an IN PROGRESS playable implementation, **not an accepted commercial-quality release**. The owner explicitly rejects button-only, emoji, flat-paper, or block-placeholder games. Existing school video tours remain at school-playground-tours.html; their game buttons now lead to the actual playground. Existing multiplayer hide-and-seek remains unchanged.

## Implemented, covered by simulation checks

- One 68 × 60 playground with jungle gym, slide, tunnel, playhouse, swings, benches, trees, bushes, basketball and soccer. Shared walkable space; no separate hide-and-seek field.
- Grid pathfinding with obstacle clearance and diagonal corner checks; touch destinations, drag steering, keyboard control; contact-based tags and safe-base radius.
- Three computer children, shuffled hiding locations, ten-second countdown, seeker investigation, stand/react/run behavior, physical chase, NPC escape to base.
- Hider rounds, AI patrol/investigation, sight obstruction, reaction grace period, faster preschool player, alternate roles, replay, easy/normal, run-to-base assistance.
- Enter enclosed hiding locations and exit to walkable entrances; no name labels or opponent minimap markers.
- Articulated child development meshes with head/eyes/hair/clothing, arms, elbows, legs/knees, walking, running, crouching, sitting, throwing and kicking poses. They are not the approved final Jace rig.
- Third-person tracking and first-person view, directional light/shadows, textured surfaces, detailed equipment assemblies, material-batched fixed scenery.
- Seesaw with automatic computer partner and timed physical pumping, damping and teamwork stars.
- Exploration slide, tunnel, jungle-gym traversal and swing ride; stop/step-off.
- Basketball pickup, aim/power, button/swipe release, gravity, rim/backboard contact, through-rim score detection, net response and retrieval.
- Soccer directional kicks/dribbles, free ball movement, gravity/rolling friction, post/prop collisions, goal crossing and optional computer goalkeeper.
- Browser speech instructions and synthesized feedback; quiet toggle. Pauses on backgrounding, releases controls on blur/cancel.

## Still incomplete / acceptance gates

- Final artist-authored, approved rigged family likeness and polished NPC animation. Existing authoritative Jace directional reference was inspected; it remains unchanged. Procedural development models must not be represented as final approved identities.
- Recorded laughter and production-quality sound assets. Current short synthesized effects are functional feedback only.
- GPU visual acceptance, phone/iPad frame-rate profiling, camera-wall comfort and physical iPad Safari testing. Browser automation does not constitute iPad hardware testing.
- Commercial production polish, accessibility playtesting with preschool children, and full asset/art approval.

## Preservation and checks

No family session, movie, multiplayer protocol, profile storage or progress schema is changed. The original tours and imagery are retained. School and all-games catalog link the playground and tours. The renderer uses the repository's pinned Three.js bundle; no paid services or runtime CDNs were added.

Run `node --test world/tests/playground.test.mjs` for reachability, countdown, discovery without auto-tags, NPC escape, player escape/tag, replay, rim scoring/misses/retrieval, soccer scoring/saves, seesaw teamwork, equipment traversal and articulated model integrity. Run `node --test world/tests/*.test.mjs` for preservation coverage.

Real-device QA pending: Safari landscape/portrait, tap destinations, drag plus camera controls, 3-minute AI round, both role outcomes, repeated restarts, swipe shooting, quiet mode, background/return, sustained performance and world return.
