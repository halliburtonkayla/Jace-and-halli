# Preserve gameplay while replacing the world renderer

Status: IN PROGRESS — October 7 owner instruction: “fix it to the new town.” The new-town 3D renderer is now the normal entry path; final visual acceptance and iPad/iPhone hardware verification remain pending. The rejected flat renderer is retained only at the explicit development rollback URL `?view=legacy`, not offered as the normal experience or graphics-failure fallback. This changes presentation, not the room transport or saved-state contract.

## What must change

`Renderer` currently requests `canvas.getContext('2d')` and draws an isometric projection using paths, ellipses and flat shapes. Its simulated camera shifts that projection; it is not a perspective 3D camera. Additional CSS, gradients, or a background image cannot turn this renderer into the approved explorable 3D world.

Replace the world presentation with a WebGL 3D scene renderer (for example Three.js), including a scene graph, perspective camera, dimensional meshes, consistent materials/lighting, optimized approved character models and animations. Verify the selected library/version and Safari support at implementation time. HTML remains appropriate for large accessible controls and room setup. Individual activities may retain Canvas where it serves their gameplay.

The renderer is replaceable without discarding the room or simulation architecture. A browser-based 3D layer does not inherently require a paid server. Keep the existing free hosting and room approach. It controls access to a play session; it does not make the public GitHub Pages files private.

## Contracts to preserve

| Existing system | Retain / adapt |
|---|---|
| `room.mjs` | Room codes, host approval, profile permissions, transport, snapshots and disconnect handling. Rendering must not own connection state. |
| `family-game.mjs` and `server/simulation.mjs` | Authoritative controls, movement, tag contact/cooldown, bounded input, bubble IDs, lawn cells and progress. Meshes follow state; they do not invent authority. |
| `locations.mjs` | Stable location IDs, logical coordinates, lawn bounds and doorway proximity. Preserve saved-state interpretation and activity entry/exit. |
| `free-app.mjs` | Existing action/input flow, sound settings, assistance, profile selection and Game House iframe lifecycle. Extract a presentation adapter rather than rewriting these behaviors. |
| `audio.mjs` | Gesture-based audio unlock, shared audio context, sound controls and spoken prompts. Improve assets separately. |
| Classic Games and original assets | Preserve all original activities and return navigation, keeping the hosting page alive while Classic Games is open. |
| Saved state | Preserve `jace-halli-world.family.v1`, profile IDs, progress and preferences. If a schema change is necessary, implement versioned migration with backup and recovery. |

The existing game plane uses `(x, y)` with an angle where forward movement is `(sin(angle), -cos(angle))`. Introduce one documented adapter to 3D `(X, Z)`; use a consistent world scale and derive mesh heading from the forward vector. Keep height on 3D Y. Do not silently reinterpret saved coordinates, input directions or doorway distances.

Preserve the current presentation entry points (`resize`, `draw`, `pop` and bubble hit testing) through a facade, or change their callers together behind the same gameplay contract. Use separate canvases or a deliberate renderer lifecycle: the currently initialized 2D canvas cannot simply be reused as an already initialized WebGL context. Translate input to the active scene's coordinates; verify touch targeting after resize/rotation.

## Small first implementation

1. Inspect the newest repository and capture the existing working routes/state before editing. Keep a reversible checkpoint; avoid a second website or destructive rebuild.
2. Add a renderer adapter and one connected neighborhood: road, sidewalks, home exterior, Game House, backyard and Bubble Garden. Use real geometry, coherent scale, signs, landscaping and a comfortable follow camera. Larger destinations remain PLANNED until implemented.
3. Model and rig the four family identities from the exact approved sheets. Reuse stable character IDs and outfit variants across scenes. The references are approved; animated game assets remain NEEDS ASSET. Do not ship replacement generic family figures as the corrected visual milestone.
4. Connect scene objects to the existing simulation. Make the visible lawn reflect the same cut-cell set; keep interaction prompts tied to existing doors, players and activity state. Stage 3D rendering separately from behavior changes.
5. Optimize and lazy-load assets. Define and measure triangle/texture/draw-call budgets on the target iPads; use appropriate mesh detail, instancing, texture compression and modest shadows. Dispose unloaded GPU resources and handle context loss. Choose reduced quality through render settings, not a separate world.
6. Check two approved devices in one room, profile isolation, steering/gas/brake, Halli assistance, tag, grass cutting, bubble hit detection, saved progress, sound, Classic Games, scene returns and device removal. Check landscape/portrait changes, memory, frame pacing and thermal behavior on Safari.
7. Promote the new renderer only after the small neighborhood is functional and visually meets `VISUAL-DIRECTION.md`. Keep the existing renderer solely as a temporary rollback/development option; it is not the accepted final art style. Do not claim untested device support or multiplayer completion.

Physics for jumping trucks, bowling or other later activities may need dedicated modules. Add those when building the actual activity; do not rebuild working planar movement merely to replace its visual layer.

## October 6 implementation checkpoint

- `render-3d.mjs` lazily imports Three.js 0.169.0 from its pinned CDN module after profile selection. It supplies a perspective rider/first-person camera, touch look-around, a town overview, 3D vehicles, instanced lawn blades, screen-aligned interactive 3D bubbles and a shared-state presentation adapter.
- `neighborhood.mjs` builds connected streets, crossings, curbs, sidewalks, four destination exteriors, window/roof/door details, signs, landscaping and dimensional trees. Static geometry is batched by material. Original simulation coordinates, collision behavior, door IDs and progress schemas are retained.
- First-person walking does not invent a family body/face. Other walking players and computer residents currently use named presence markers. This is an explicit development limitation, not delivery of approved animated family models.
- Unsupported graphics offer the existing playable renderer inside the same room. Switching compatibility view does not reset room membership or saved state. Controls send braking input while the new scene is unavailable.
- A missing Leave mower control was restored through the existing exit action.
- Nine repository tests pass. A native geometry check produced 62 static scene groups, about 114k triangles including instanced lawn geometry, 340 lawn cells and reversible cut-cell visibility. A state integration check exercises walking, bubble hit coordinates/pop, car, camera and mower exit with GPU drawing stubbed. These are not frame-rate or GPU visual claims.
- The live cloud browser loaded the preview but reports WebGL disabled, so rendered-scene appearance and Safari performance cannot be verified there. A real peer join attempt timed out before reaching approval; fake transport tests do not substitute for two-iPad testing. Do not mark either hardware rendering or cross-device multiplayer QA complete.
- Documentation consulted: https://threejs.org/manual/pages/creating-a-scene.html and https://threejs.org/docs/pages/WebGLRenderer.html. WebGL 2 is required for this renderer.

### Directional artwork integration

Family walkers now use the separate approved character-derived atlases instead of name markers alone. The camera follows the walking player; four directional views change with camera bearing. This remains an interim sprite presentation, pending approved animated models. Route dots share the existing logical coordinates in both renderers, and assisted steering feeds the authoritative movement simulation only while the child holds a pedal. No destination selection teleports players. The optional 3D gate and hardware QA requirement remain.

### October 7 new-town correction (supersedes optional-default notes above)

- `01_World_Master.png` from `Jace_Halli_World_MASTER_Clean_Approved_For_Work(2).zip` supplies the approved welcome/overview artwork. The optimized derivative is `world/assets/town/approved-world-v1.webp` (about 339 KiB). The source image is unchanged and retained outside the public repo. Source SHA-256: `b8b2ecabc238fe7c5cc632cb5e7b97ced9b610114c43da6ebc3c0b22140edece`.
- The welcome and “Our town” overview show this actual supplied image. They do not simulate movement or claim the pictured attractions are finished games. In portrait the full artwork is shown above the start controls; the overview supports native horizontal scrolling to inspect it.
- Start playing and shared room links select `render-3d.mjs` by default. `?view=3d` still works. `?view=legacy` is the deliberate development rollback only.
- `town-landmarks.mjs` adds a modeled stone-and-timber entrance arch, fountain plaza with moving water, and distinct school, church, zoo, bowling, movies, toy-store, circus, arena, park and station exteriors. Planned places are scenery beyond the original play bounds, not fake activity buttons. These first-pass meshes are not an exact reproduction of every detail in the approved artwork or accepted final production art.
- The four playable doorway IDs/coordinates, lawn cells, simulation bounds, profile identities, storage keys, galleries and room protocol are unchanged. Existing car/foot travel still uses the authoritative simulation; the art image is not used as a pretend driving background.
- On a WebGL error, movement is paused, the approved overview stays behind a clear error, and real Coloring/Classic Games remain accessible within the same room. The old flat town is not silently restored.
- Checks: 22 repository tests pass. Native Three scene construction found 175 scene meshes/batches, 217,408 triangles including instanced grass/water, finite vertices, moving water instance transforms, and reversible grass-cut rendering for all 340 cells. These are structural checks, not GPU frame-rate or iPad visual acceptance.
- NEEDS ASSET: rigged/animated family and NPC models, final detailed environment art and authentic audio. PLANNED: actual activities inside the added scenic destinations. IN PROGRESS: real-device rendering/performance, mobile comfort, shared visual presence verification.
- Live browser checks after publishing: approved welcome artwork loads; Start playing creates a room; all four profiles appear; Jace selection follows the 3D path without a query flag; WebGL-disabled cloud browser shows the explicit recovery screen rather than the rejected renderer; Classic Games opens inside the existing iframe and returns; Creativity Center opens; Jace's pre-existing Dinosaur Friends, Monster Truck Adventure and Trace A gallery records remain visible. No WebGL GPU scene image or iPad performance is claimed from this browser.
