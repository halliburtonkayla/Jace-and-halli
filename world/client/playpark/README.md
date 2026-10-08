# Family Play Park

Seven activities share the existing free FamilyRoom host and room code. The host runs all game logic; clients submit bounded controls at 10 Hz, with movement/reel input expiring after 500 ms. Hide-and-seek snapshots are personalized before transmission so concealed opponents' coordinates are omitted. Leaving cancels hide-and-seek rounds and resets competitive sports seats.

Basketball and softball simulations and their court/field presentation are adapted from the owner's OC-Transition-Team repository. Its service configuration and networking are not used. The bundled Three.js build retains its embedded license notice. Family characters use the existing approved directional sheets as transparent billboards; they are not rigged 3D character models. Team NPCs in softball and the solo basketball computer use the original sports artwork.

Two-player activities: basketball, softball, seesaw. Fishing, swimming, cooking and hide-and-seek also allow additional family room members. Hide-and-seek and seesaw need at least two real room members. Sports offer a labeled computer opponent during solo practice. No local multiplayer is represented as an internet session.

Run `node --test world/tests/playpark.test.mjs world/tests/shared-family.test.mjs world/tests/game-catalog.test.mjs`. `world/tests/playpark-viewport.html` renders two actual game views against an in-page host simulation for responsive/UI checks. It is explicitly not a cross-device networking test. Existing peer connectivity and host-foreground requirements remain.

Devices without WebGL use the perspective Canvas renderer against the identical simulation, controls and personalized snapshots. The cloud browser has WebGL disabled; browser verification covers this fallback, while native WebGL rendering still needs a real-device visual check.

Browser checks (2026-10-08): actual Play Together menu includes all seven links and opens Family Kitchen through the host room; two independent preview views show personalized seeker countdown, touch movement (1.00 to 3.29), shared softball strike count and seesaw push meter, underwater toggle, and fishing cast. Portrait/landscape controls were inspected. All 67 repository tests passed. Separate real iPhone/iPad internet play and native WebGL visuals remain unverified in this cloud environment.

## October 8 activity correction

The owner permits animated game avatars in softball, pool and kitchen; approved family artwork remains in hide-and-seek. Softball now retains its articulated batter, bat, fielders, swing and pitch animations. The compatible renderer has a dedicated close batting camera and visible swinging bat instead of portraits or numbered dots. Pool uses a tiled sunken basin, coping, ladders, diving board and articulated swimmers with strokes and underwater motion. Kitchen has chefs, appliances, carried ingredients and plates, preparation animations and a turn-food cooking step. Hide-and-seek has solid hedge obstacles, barrel collision, closer follow camera and preserved per-view hidden positions. Movement is interpolated for presentation; simulation remains host-authoritative. No change to family identities, stored progress or room admission.

68 tests pass, including complete two-person cooking flow, inventory/plate ownership, hedge collision and existing shared transport coverage. Native device/WebGL visual confirmation is still separate from cloud fallback checks.

Follow-up checks: compatible renderer shows the restored bat and both swimmers; swimming circles collect rings in both views. Chefs have carried food and articulated limbs verified in tests. The food-preparation counter was corrected after browser inspection. All 69 tests pass.
