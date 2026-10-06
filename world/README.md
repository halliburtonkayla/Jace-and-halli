# Jace & Halli’s World — foundation build

This is an additive upgrade inside `halliburtonkayla/Jace-and-halli`, not a second repository or replacement site. All 44 original HTML pages and original assets remain byte-for-byte unchanged. The private server makes this new world the entry point and contains the original site under `/classic/`, reached through Game House.

**Status:** implemented and locally tested foundations; not deployed; not a finished 3D family game. GitHub Pages still serves the original site. It cannot execute this server. Do not advertise the existing public URL as invitation-only.

## Run privately

Requires Node.js 22.13+ (tested on Node 24.19), with built-in SQLite. No npm dependencies or external signaling services are required.

```sh
cd world
# Set WORLD_PARENT_PASSWORD through your local terminal/hosting secret manager.
# Use a unique passphrase of at least 14 characters. Never commit it.
npm run init
# Remove WORLD_PARENT_PASSWORD from the environment after initialization.
npm start
```

Visit `http://localhost:8787` locally. Mommy signs in, selects Mommy, and creates a one-use invitation for Jace, Halli, Unique, or an approved named guest. Open that link on the approved device, accept it, then select its profile. No child email accounts. Invitations expire in one hour; approved device sessions expire after seven days and can be revoked by Mommy. Each device invitation is restricted to one profile. Selecting a child from a parent login locks that session to the selected child; returning to parent controls requires Mommy’s passphrase again.

For actual separate-device use, deploy **this repository’s `world/` server** behind HTTPS with a persistent disk; set `HOST=0.0.0.0`, `PORT` to the platform port, `NODE_ENV=production`, `WORLD_ORIGIN=https://your-approved-host`, and `WORLD_DATA_DIR` to a persistent private directory outside the static web root. Do not use ephemeral/serverless workers for this single-process implementation. Back up the SQLite database securely, including WAL state via a SQLite-aware backup. HTTPS must terminate at a trusted reverse proxy. SSE must not be buffered; idle timeout should allow the 10Hz stream. Start only one application instance, because live game state is in memory.

Account initialization is an operator action. There is no public registration or browser bootstrap route. Hosting secrets are never bundled in client code. Password recovery and automated backups need an operator workflow before production family use; do not expose an open reset endpoint. Public photographs already committed to the old public repository remain public: this change cannot retroactively make GitHub history private.

## Playable foundations

- Same connected neighborhood for every profile, with touch steering wheel, gas, brake, start/stop, walking, collision against buildings, follow camera, and large assisted toddler controls. Keyboard arrows/WASD also work.
- Server-verified positions at 20Hz and cookie-authenticated shared updates at 10Hz. Family players see one another and computer residents. Short input timeouts stop movement when a device disconnects.
- Actual mowing: only unique grass patches beneath a running, moving mower count. Cut grass visibly changes; shared lawn and each profile’s cut count persist in SQLite.
- Bubble garden: fixed population of large bubbles, pointer hit testing, confetti, saved pop count, three speech-prompt stages (pop, colors, first-word surprises), deliberate pauses, no speech recognition. Stages two and three are initial vocabulary prompts; richer illustrated surprise contents and targeted color tasks remain in progress.
- Optional shared tag: server contact transfers IT with a cooldown, feedback, and explicitly labeled computer residents. Hide-and-seek is planned.
- Game House serves all existing activities, with a return-to-world link. Old PeerJS room creation is disabled only in the private served copy; original files remain unchanged. Classic Connect Four/matching/drawing retain one-device cooperative play until migrated to approved shared sessions.

The home doorway displays an honest development notice. Unimplemented locations do not appear as fake playable attractions. Ambient car visuals are illustrative scenery; synchronized traffic, railroad crossings, and collision avoidance remain planned. The connected world is Canvas 2.5D development scenery; photo-based animated family models and final 3D environments are needed before this can meet the final visual brief.

## Architecture

`server/store.mjs`: password hashing, SQLite schema, local-only bootstrap. `server/index.mjs`: authenticated API, invitation lifecycle, static access boundary, parent controls, SSE, authoritative simulation loop. `server/simulation.mjs`: movement/collisions/mowing/proximity. `client/locations.mjs`: shared world coordinates. `client/render.mjs`: camera, procedural development scenery, bubble effects. `client/app.mjs`: profile flow, pointer controls, scene lifecycle, signed-in networking. `client/audio.mjs`: bounded shared audio context and optional browser narration.

Local device state is controls, renderer interpolation, audio context, and effects only. Server profile records own preferences, inventory schema, character asset reference, and progress. Sessions, invitations and family profiles live in private SQLite. No localStorage multiplayer, chat, microphone, camera, public player discovery, matchmaking, or stranger invites.

## Verification

```sh
cd world
npm test
```

See [architecture audit](docs/AUDIT.md), [development checklist](docs/CHECKLIST.md), and [asset contract](docs/ASSETS.md). Current browser coverage and limitations are recorded in the audit. iOS Safari hardware testing remains required before calling this an iPad-ready release.

## Deployment packaging

`world/Dockerfile` packages the **existing repository** into a Node server container. Build with repository root as context: `docker build -f world/Dockerfile .`. The Dockerfile-specific `world/Dockerfile.dockerignore` excludes git metadata, data, environment files and node_modules from the build context. Keep all other private credentials outside the repository. The `/data` volume must be owned/writable by the container’s `node` user (uid 1000). Set an HTTPS `WORLD_ORIGIN`, attach durable `/data`, and run the one-time `world/server/init.mjs` initialization with a temporary secret only through the operator’s environment. Do not put the secret into an image/build argument. Container deployment and restart persistence require host validation before release.
