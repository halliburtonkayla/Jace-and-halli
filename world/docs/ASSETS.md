# Asset contract

Status: NEEDS ASSET. The visible family residents and landscape are explicitly development artwork, not finished photo-based character models. Do not label these as final family likenesses. Existing photo files are preserved but not used to construct models without the separately supplied approved references.

## Consistent family and NPC models

For each family member: approved face/front and full-length reference; hairstyle, preferred outfit and footwear, glasses if applicable; neutral front/side/back model views; consistent relative heights and approved proportions. Store references privately, outside this public repository. Publish only approved derived game assets where appropriate.

Model manifest IDs: `family.jace`, `family.halli`, `family.mommy`, `family.unique`, `guest.default`, `npc.pip`, `npc.rosie`. Reuse the same model ID in all scenes. Per-profile `characterAsset` remains null until an approved asset exists; future cosmetic selections should be IDs from a parent-approved manifest.

Prefer optimized GLB models with embedded textures, <=15k triangles per main character, <=2k for background NPCs, <=1024px textures and LOD where needed. These are initial budgets, not verified performance claims. Animation clips: idle, walk, run, wave, sit, drive, mow, pop, clap, dance and freeze. Mommy instructor clips: stand, sit, turn, clap, left/right step, march, reach, stretch and gentle squat. Model scale in meters with +Y up, forward axis documented consistently. Test skinning and material rendering on mobile Safari.

## Environment and sound

Neighborhood kit: connected road geometry, sidewalks, family home exterior/interior, Game House, bubble garden, backyard, consistent trees/fences/signage; final road/world coordinate contract must preserve existing doorway IDs. Future locations have entries only when assets and actual gameplay exist.

Authentic licensed sounds: engine idle/acceleration, mower idle/cutting, doors, bubbles, scanner, pins/ball, train/crossing, animal sounds, ambience. Normalize levels and provide a quiet/muted setting. Current oscillator tones are development feedback, not authentic recordings. Use one audio context; unlock on gesture; narration uses local browser voices, not Mommy’s voice clone. Prefer short Opus/AAC assets with Safari-compatible fallbacks.

## Expandable media

Future theater/studio/story manifest: `id`, `title`, `poster`, `source`, `captions`, `duration`, `approvedByParent`, `ageModes`, `reducedMotionAlternative`, `assetVersion`. Serve parent-approved local media only. No arbitrary video URL submission by children, open YouTube search, camera, or motion-scoring requirement. Load one location/media bundle at a time; dispose resources on exit.

Never render a “play” control for a planned activity simply to show a message. Keep incomplete features in the parent checklist until real gameplay and assets are ready.
