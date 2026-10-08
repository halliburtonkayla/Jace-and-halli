# School upgrade — October 8, 2026

The seven owner-uploaded handwritten pages IMG_3548 through IMG_3554 are the requirements for this work. The owner explicitly chose “Build the school” and later authorized retrying the family-reference upload to OpenArt. Continue in the existing Jace-and-halli repository. Do not replace the town, playground, church, or earlier activities.

## Owner requirements

- Use the exact approved school artwork and dimensional children's-game quality. Room furniture and toys must have real interactions. No emoji artwork, flat placeholder people, or a generic block-style dashboard.
- Shared school day: morning bus → breakfast → separate classrooms → bathroom → lunch → existing playground → dismissal/ride home. Jace and Halli appear together for bus rides, meals, and recess. Do not rebuild the completed playground as part of this request.
- Morning: 30-second OpenArt animated bus ride. Their dad is the driver from the approved bus interior. Original 1990s-style country song, children as backing singers, gently bouncing bus. Arrive at school, children exit, Jace and Halli last, turn and wave, greet Miss Kayla.
- Breakfast: 10–15-second OpenArt clip. Jace is picky; Halli is not. Jace first chooses bread and peanut butter. Friendly lunch lady encourages trying a new food. Show both eating.
- Jace's board: age-three lessons for days of week, all ABCs, numbers, colors, weather/seasons, and holidays. Audio read-aloud and picture choices are necessary because he cannot read yet.
- Days: playful call-and-response / Blue's Clues-style pacing. Days chant/song. Family anchors: Wednesday and Sunday church, Thursday library night, Friday leads into weekend.
- Alphabet: one beginning lesson for every letter, finger tracing and read-aloud. A–Apple, B–Banana, H–Halli, J–Jace, K–Keke, U–Unique are specifically requested.
- Numbers: ten separate beginning lessons for digits 0–9, counting and numeral recognition. Three answer choices, randomized across at least 100 combinations, at most five quiz questions per visit. A pretend tablet keypad helps practice four digits. The actual reusable device code must be set locally in the grown-up corner, not published in repository source or these notes.
- Colors: one lesson per basic/rainbow color, spoken spelling, choosing a colored numeral, choosing a paint color, and filling only the flower petals while other parts are already colored.
- Seasons: each has its own lesson about weather, how to dress, what happens, and related holidays. Appropriate pictures. Mini quiz after each Jace lesson, celebration, grade and facial feedback; encourage trying again.
- Jace's desk: drawing, coloring, painting, play dough and other age-three activities. Play area: a dinosaur that moves and makes a sound, dimensional building blocks, play kitchen, sorting, ten-piece puzzle.
- Jace carpet time: illustrated books of 5–10 pages, swipe navigation, narration. Required themes: kind big brother, sitting/listening in church, listening to Mommy, fair play, fishing with Dada.
- Bathroom: gentle routine about potty help, toilet paper, flushing, handwashing. A 30-second video without undressing or private body parts. Halli may use a toddler potty/handwashing YouTube video.
- Lunch: 20-second OpenArt clip of both children getting lunch, picking up chocolate milk at the end, sitting, eating and trying a new food. Interactive “Put my tray away” action.
- Dismissal: turn and wave goodbye to teacher; same friendly dad driver arrives; 15-second ride-home video with an original simple toddler rap.
- Halli classroom: same detailed standard, using existing pink artwork. Ages one to two: colors, shapes, numbers 1–5, nursery rhymes including Wheels on the Bus and London Bridge, body parts, clothes, family words. “Pink. Can you say pink?” Allow long spoken-response pauses. No quizzes or speech-scoring; Halli cannot reliably tap yet. Parent-started hands-free mode.
- Halli desk: age-one/two coloring, play dough, blocks. Play area: responsive baby doll that can fuss, eat and sleep; kitchen, blocks, pots and bowls. Age-appropriate illustrated swipe storybooks. Shared meals, recess and bus rides with Jace.

## Architecture and preservation

`school.html` is an activity in the same site and existing world iframe. The School destination opens it directly. All earlier school/game pages remain in the catalog. The existing host, room-code connection, profile data and network transport are unchanged.

`world/client/school/` contains lesson data, interface, speech/audio, real Canvas toy interactions, and parent-local media support. `world/assets/school/manifest.json` records exact approved source filenames and checksums. Original PNGs and private reference sheets remain outside the public repository; optimized scene derivatives are shipped.

School progress uses new per-child records under `jhw-school-progress-v1`; it does not rewrite any existing family progress or artwork. School progress and parent-imported clips are device-local; these are not represented as synchronized multiplayer records. Shared routines are the same content for both children, not a new cross-device synchronization protocol.

Numbers: the mixed game samples five distinct target digits from 0–9, with two distinct distractors and randomized ordering. There are 360 unordered target/distractor combinations across ten targets, and more when answer position is counted. Per-digit lessons stay on their selected learning target; quizzes have three questions. Halli's interface never invokes graded quizzes.

Tracing uses the existing letter-path and coverage engine, with real target-cell coverage, continuous pointer interpolation and no scroll interception outside the drawing surface. Paintings, dough and blocks are kept separately per child. Story pages support horizontal swipe without blocking vertical scrolling.

## Media and visual status

The five requested OpenArt jobs were submitted using Wan 3.0, standard, 720p, landscape, native audio: 30s bus, 12s breakfast, 30s bathroom, 20s lunch, 15s dismissal. Total quoted cost 4,280 existing credits. All five jobs completed. Their optimized 720p H.264/AAC files are hosted within this free site; the videos/manifest.json records durations and checksums. Visual sample frames were inspected and all five clips loaded and played in WebKit. The school retains narrated, playable routines if a clip cannot load; missing clips are not labeled finished.

Toy art and alphabet pictures are new generated sprite atlases. Storybook environments are new generated illustrations with the existing approved family portraits layered on top. These are illustrated narrated books, not new character animation films. The fishing book currently represents Dada in narration; it does not substitute a generic father portrait. The toy dinosaur moves toward touches, jumps and has synthesized game sound; it is not a rigged 3D model. The baby doll is a toy character, not a replacement family member.

Browser narration uses an English device voice with a selectable grown-up preference. It is not a clone of Kayla's voice. Built-in nursery rhymes have modeled spoken lyrics and response pauses; recorded sung performances are a separate media enhancement. OpenArt bus and dismissal clips include generated native audio. Audio tracks are present; device speech voice quality and the precise generated lyrics still require listening on the family’s device.

## Validation

Passed automated WebKit browser checks at 1024×768 touch and 844×390 landscape: room navigation, A tracing with real coverage, correct/incorrect mini quizzes, A/F feedback, practice keypad, separate child progress, story page turns, Halli without quizzes, body highlighting, dinosaur control, block creation/counting, kitchen cooking/serving, sorting reset, puzzle preview, baby feed/cuddle/sleep/wake, recess return, and all five 1280×720 video players. No JavaScript errors or failed local requests were observed. Quiz-data tests verify five distinct targets, three distinct choices, all digits, and more than 100 generated combinations; existing game-catalog, presentation and church tests pass. Physical iPad/Safari, device-specific speech voices and cross-device networking require actual device validation. Do not claim those from a desktop screenshot.
