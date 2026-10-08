# Family Play Park

Seven activities share the existing free FamilyRoom host and room code. The host runs all game logic; clients submit bounded controls at 10 Hz, with movement/reel input expiring after 500 ms. Hide-and-seek snapshots are personalized before transmission so concealed opponents' coordinates are omitted. Leaving cancels hide-and-seek rounds and resets competitive sports seats.

Basketball and softball simulations and their court/field presentation are adapted from the owner's OC-Transition-Team repository. Its service configuration and networking are not used. The bundled Three.js build retains its embedded license notice. Family characters use the existing approved directional sheets as transparent billboards; they are not rigged 3D character models. Team NPCs in softball and the solo basketball computer use the original sports artwork.

Two-player activities: basketball, softball, seesaw. Fishing, swimming, cooking and hide-and-seek also allow additional family room members. Hide-and-seek and seesaw need at least two real room members. Sports offer a labeled computer opponent during solo practice. No local multiplayer is represented as an internet session.

Run `node --test world/tests/playpark.test.mjs world/tests/shared-family.test.mjs world/tests/game-catalog.test.mjs`. `world/tests/playpark-viewport.html` renders two actual game views against an in-page host simulation for responsive/UI checks. It is explicitly not a cross-device networking test. Existing peer connectivity and host-foreground requirements remain.
