# Church service — October 8, 2026

The existing town Church button opens `church.html` inside the same activity frame. The owner-approved church interior is an optimized copy of `24_Church_Interior_APPROVED.png`; family identities and source art are unchanged. Other activities, room transport and family progress are preserved.

Implemented: arrival with quiet synthesized crowd murmur; male generated welcome (device voice fallback); opening song; opening prayer and posture prompt; shuffled Bible lesson; three spoken A/B/C questions with five seconds after all choices are read, then answer highlight and spoken encouragement; closing song; closing prayer; dismissal and murmur. Pause/break, replay, mute, parent lesson selection, next-part controls, read-aloud alternatives, cancellation on exit and device-local media are included.

Rotation uses `jhw.church.rotation.v1`, isolated from family progress. Five lessons form a shuffled bag, with no repeat at the cycle boundary. Parent overrides do not erase the normal rotation. The opening and closing prayers remain identical across lessons (about 25–30 words each). Their generated spoken duration is about 11 seconds each, excluding the posture reminder.

Official YouTube embeds only. No videos are downloaded or rehosted. Opening chorus: `LxgUtFZlQ70`, 0:22–0:40, verified against the video's captions. Closing verse: `rRy6WGIX8cE`, 0:11–0:40, verified against its captions. Both publishers label their renditions a cappella. Media availability, adverts and external player behavior are controlled by YouTube. Full audible/video playback and the absence of instruments have not been independently verified in the restricted test browser.

Creation (`teu7BCZTgDs`) ≤3:29; Adam and Eve (`VG3D9EOwSyc`) ≤4:31; Noah (`j1QfF1JKHVo`) is the complete 12:58–14:46 story inside the publisher's Jr compilation, 1:48; Jonah (`WOSadLyqshg`) ≤2:59; Jesus and the Children (`VPUMDVBO7dY`) ≤1:26 plus an original spoken introduction about who Jesus is. The official player enforces start/end segments and the service advances at the configured endpoint; videos are not promised to bypass parental or network restrictions.

When YouTube is blocked, original narrated summaries remain usable with the approved church setting. Song lyrics provide a sing-with-Mommy alternative. Grown-ups can also import permitted media already saved on their device: lesson files ≤5 minutes, songs ≤90 seconds, files ≤200 MB. IndexedDB stores these only on that device; clearing website data removes them. Uploaded files are never sent to the public repository.

Generated male welcome, posture prompts, both prayers and dismissal are stored as local MP3 assets beside the site. Playback was observed in the live browser. A four-and-a-half-second failure fallback switches to device speech. A compatible English male device voice is preferred; availability depends on the iPad's installed voices. Authentic recorded crowd chatter and a fully animated preacher are future improvements; the current ambience is synthesized and the approved preacher is part of the sanctuary image.

Verification: 12 focused Node checks (including existing town and game-menu regressions) cover lesson/video bounds, 15 quiz questions, repeated shuffle cycles, corrupt stored rotation, prayer length and town integration. Browser and physical iPad results should be recorded separately; automated content checks do not establish media playback or Safari hardware behavior.

Browser verification: live page, welcome completion, first prayer cues, parent lesson override, read-aloud story progression, and correct answer reveal observed. Browser speech was unavailable; this exposed and prompted a fix to preserve reading time before auto-advance. An additional generated quiz voice request timed out without a usable audio result; quizzes retain device narration with explicit on-screen fallback. Phone/iPad layout checks are provided in `world/tests/church-viewport.html`.

Final layout checks: 768×1024 tablet and 390×844 phone portrait fit without horizontal overflow. Pause stopped prayer playback. Physical iPad playback remains unverified.
