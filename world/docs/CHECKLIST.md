# Development checklist

COMPLETE means the stated foundation implementation exists and its listed checks pass. It does not mean the final requested world is finished or deployed.

| System | Status | Evidence / next step |
|---|---|---|
| Existing project audit and preservation | COMPLETE | All 44 original HTML pages unchanged; source inventory in AUDIT.md |
| Secure parent authentication foundation | COMPLETE | Server scrypt hash, opaque HttpOnly cookie, same-origin write checks, login rate limit; no browser secrets |
| Parent device approvals and guests | COMPLETE | One-use expiring invitations, profile restriction, revocation, server tests |
| Profile selection / saved state schema | COMPLETE | Four family profiles; toddler/preschool assistance; SQLite progress/preferences; inventory/model reference schema |
| Real approved shared sessions | COMPLETE | Authoritative movement + SSE; independent approved session cookies tested; single household/server process |
| Consistent world navigation | COMPLETE | Shared location coordinates, doorway proximity, connected walking/driving, Classic return path |
| Connected world shell and driving | IN PROGRESS | Functional Canvas 2.5D movement/controls; final environment/character assets and richer toddler route assistance needed |
| Classic Games / Game House | COMPLETE | All original games preserved; private served copy disables open PeerJS rooms |
| Lawn mowing foundation | COMPLETE | Running mower, unique grass removal, durable shared lawn/profile count; simulation tests |
| Bubble garden foundation | COMPLETE | Fixed large bubbles, pop hit detection, confetti, saved progression and spoken vocabulary; server persistence checks |
| Bubble illustrated surprises / color challenges | IN PROGRESS | Prompt stages implemented; illustrated contents and targeted task progression needed |
| Shared tag foundation | IN PROGRESS | Server contact and computer residents; browser gameplay/age-assistance polish needed |
| Hide-and-seek / Find Mommy | PLANNED | Countdown/hide/search, shared visibility rules, toddler assistance |
| Final family character models | NEEDS ASSET | Approved separate photo references + consistent animated models |
| Final world scenery / authentic sounds | NEEDS ASSET | See ASSETS.md; development art/audio explicitly identified |
| Private HTTPS deployment | PLANNED | Choose server-capable hosting + durable disk; existing GitHub Pages cannot run server |
| iPad / iPhone Safari hardware QA | PLANNED | Real-device touch, audio, rotation, reconnect, memory/performance checks |
| Interactive family home | PLANNED | All rooms, objects, bath/potty/bed routines, dressing, toy inventory; doorway is a development notice |
| Shop + usable purchases | PLANNED | Physical pickup, basket, scanning, home inventory; inventory schema reserved |
| Advanced landscaping | PLANNED | Jobs, watering, flowers, leaves, reset/progression rules |
| Bowling + arcade | PLANNED | Swipe physics/scoring, NPC/family turns, skee-ball, bumper cars, coaster |
| Go-kart / motorcycle / monster truck | PLANNED | Actual track simulation, rivals, assisted controls, jumps |
| Park + playground | PLANNED | Animated slide/swing/tire swing and rider camera |
| Zoo (~25 animals) | PLANNED | Recognizable approved models, authentic audio, narrated local content |
| Circus | PLANNED | Animated show, lights/music, look-around camera |
| Expandable theater | PLANNED | Lobby, posters, seats, dimming, local original movie manifest |
| New art center/coloring book | PLANNED | Classic whiteboard/coloring preserved; new physical book, undo and page gestures |
| Railroad + train rides | PLANNED | Shared crossing barriers/signals, traffic waiting, station, camera views |
| School bus | PLANNED | Boarding, NPC riders, connected route |
| School / early learning center | PLANNED | Physical manipulatives; speech-first toddler mode; preschool progression |
| Church / Sunday school library | PLANNED | Visual narrated Bible library; gentle short practice; movement/music |
| Move & Groove studio | PLANNED | Mommy animation, original songs/video manifest, no camera requirement |
| Parent password recovery / backup automation | PLANNED | Operator-only secure procedures before production |
| Multi-instance scalability | PLANNED | Shared authoritative session service + centralized storage; do not scale current process horizontally |
