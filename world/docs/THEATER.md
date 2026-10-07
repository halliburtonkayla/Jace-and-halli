# Movie theater

COMPLETE: Movies hotspot in the existing approved town, approved cinema lobby and auditorium art, expandable movie selection, native touch video controls, replay, rewind, sound, fullscreen where supported, and return to the existing family session.

The owner-supplied 179.3-second movie is titled Jace & Halli’s World. The original upload is unchanged. Playback uses an optimized 720px H264/AAC copy. Approved cinema images come from the supplied master artwork archive.

Movie metadata lives in world/client/theater/movies.json. Add entries with title, duration, poster, and media.src for a directly hosted MP4. The first movie uses same-origin base64 parts because the publishing connector accepts text files only. Six concurrent requests load parts only after movie selection; byte count and SHA256 are checked before creating a native video Blob. Progress and retry are visible. Closing the theater aborts downloads and releases the Blob. No paid hosting is required.

This is individual movie playback, not synchronized multiplayer watching. The family room stays connected. Native iPhone/iPad hardware verification remains pending; browser checks are recorded separately.
