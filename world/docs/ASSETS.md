# Asset contract

## Current use — approved illustrated town, October 7

The owner approved the exact town and separate scene pictures as primary interactive navigation. This supersedes the historical welcome/overview-only and geometry-only restrictions below. `world/assets/town/approved-world-v1.webp` is the primary town after profile selection. `world/assets/scenes/manifest.json` maps six optimized, unaltered scene derivatives to their exact supplied originals and SHA-256 hashes. One image per scene; no collages or invented family figures. Scene images load on entry. Drawing, bubble hits, moving grass cutting and bowling collisions are actual gameplay layers; an image alone is not a game. Source ZIP/sheets remain outside the public repository. Existing family atlases are unchanged.

October 7 town derivative: `world/assets/town/approved-world-v1.webp` is a size-optimized copy of the owner's `01_World_Master.png`, used for the welcome and clearly labeled overview only. Its source remains unchanged in the approved ZIP. `town-landmarks.mjs` contains real scene geometry following that layout's arch/fountain/destination vocabulary; it is still first-pass scenery, not all finished attractions. Individual family source sheets remain private reference assets, unchanged.

Status: approved individual references COMPLETE; animated game models and final environment assets NEEDS ASSET. The owner supplied and approved Jace_Character_Sheet.png, Halli_Character_Sheet.png, Mommy_Character_Sheet.png and Unique_Character_Sheet.png. See [VISUAL-DIRECTION.md](VISUAL-DIRECTION.md) for authoritative mapping, hashes and the visual correction. These individual sheets supersede every older combined family/turnaround sheet. The current renderer is rejected as the final art direction; do not keep polishing its abstract/flat treatment. See [RENDERER-MIGRATION.md](RENDERER-MIGRATION.md) before implementation.

## Consistent family and NPC models

Use each supplied individual sheet as that character's style bible: face, age, skin tone, hairstyle, body type, proportions, silhouette and core appearance must remain consistent. Clothing can change for the activity while identity remains recognizable. Do not redesign the family or substitute generic/flat/blocky figures. Model and rig from the approved front/side/back and expression views; verify relative scale without assuming the independently cropped sheets establish exact heights. NPCs must share the same polished, rounded, colorful 3D style while having distinct identities. Store the unchanged references in the supplied work package, outside this public repository. Publish approved derived game assets where appropriate.

Model manifest IDs: `family.jace`, `family.halli`, `family.mommy`, `family.unique`, `guest.default`, `npc.pip`, `npc.rosie`. Reuse the same model ID in all scenes. Per-profile `characterAsset` remains null until an approved asset exists; future cosmetic selections should be IDs from a parent-approved manifest.

Prefer optimized GLB models with embedded textures, <=15k triangles per main character, <=2k for background NPCs, <=1024px textures and LOD where needed. These are initial budgets, not verified performance claims. Animation clips: idle, walk, run, wave, sit, drive, mow, pop, clap, dance and freeze. Mommy instructor clips: stand, sit, turn, clap, left/right step, march, reach, stretch and gentle squat. Model scale in meters with +Y up, forward axis documented consistently. Test skinning and material rendering on mobile Safari.

## Environment and sound

Required style: polished dimensional children's animation, soft detailed materials, coherent lighting, depth and recognizable physical destinations. No CSS blobs, abstract gradients, emoji, generic cards or flat decorative image as the primary world. Transition Town supplies the connected-place principle, not an adult/teen aesthetic.

Neighborhood kit: connected road geometry, sidewalks, family home exterior/interior, Game House, bubble garden, backyard, consistent trees/fences/signage; final road/world coordinate contract must preserve existing doorway IDs. Future locations have entries only when assets and actual gameplay exist.

Authentic licensed sounds: engine idle/acceleration, mower idle/cutting, doors, bubbles, scanner, pins/ball, train/crossing, animal sounds, ambience. Normalize levels and provide a quiet/muted setting. Current oscillator tones are development feedback, not authentic recordings. Use one audio context; unlock on gesture; narration uses local browser voices, not Mommy’s voice clone. Prefer short Opus/AAC assets with Safari-compatible fallbacks.

## Expandable media

Future theater/studio/story manifest: `id`, `title`, `poster`, `source`, `captions`, `duration`, `approvedByParent`, `ageModes`, `reducedMotionAlternative`, `assetVersion`. Serve parent-approved local media only. No arbitrary video URL submission by children, open YouTube search, camera, or motion-scoring requirement. Load one location/media bundle at a time; dispose resources on exit.

Never render a “play” control for a planned activity simply to show a message. Keep incomplete features in the parent checklist until real gameplay and assets are ready.

## Derived family artwork — October 6 update

`world/assets/characters/*-views-v1.webp` contains transparent, four-view artwork derived individually from each approved sheet. `manifest.json` records distinct identity, frame rectangles, dimensions and relative world height. The original sheets remain outside this public repository. Lossless WebP conversion was verified pixel-for-pixel. These images power the welcome, profiles and interim directional world sprites; they are not rigged, animated 3D models. Do not treat this step as completing the final character asset requirement.
