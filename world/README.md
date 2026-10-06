# Jace & Halli’s World — free family rooms

The live entry point is the existing repository’s `index.html`. This version runs on the existing GitHub Pages hosting with **no paid application server**. It uses family room codes and host-approved PeerJS data connections, following the existing cooperative-game approach. This supersedes the paid/private-server deployment plan at the user’s request on October 6, 2026.

## Play

1. Open `https://halliburtonkayla.github.io/Jace-and-halli/` on the hosting iPad, phone or computer.
2. Open **Mommy / grownup room setup**, then **Start family room**. Select Mommy or a family profile.
3. Share the displayed 10-character code or use **Copy room link**.
4. On another device, enter the same code, choose Jace, Halli, Unique, or a guest’s name, and tap **Join family room**.
5. Approve the request on the host. The joining device then selects its approved profile and enters the same world.
6. Keep the hosting page open **in the foreground**. All devices need internet access for initial connections. If the host closes, refreshes or leaves the page, it must open a new room and everyone rejoins. Progress remains on that hosting browser.

One device can play with computer residents even if signaling is unavailable. Each new room receives a fresh code; there is no hardcoded family password in the public source. Guests and joining family devices require the host’s approval, and guest connections cannot select Mommy or a different profile. This is **room access and connection control, not secure website authentication**: GitHub Pages/source/assets remain public. No public matchmaking, strangers list, public messages, camera or microphone is added.

PeerJS’s free cloud handles signaling; data channels connect the devices. No paid TURN relay is configured. Some networks block WebRTC or require a relay, so separate-device connectivity is not guaranteed on every school/carrier network. Use normal home Wi-Fi when testing. If the library/signaling fails, the host still supports one-device play and shows a connection explanation rather than fake multiplayer success.

## First playable foundation

- One connected Canvas 2.5D neighborhood shared by all approved profiles.
- Actual walking/driving: large touch steering wheel, GO/GAS, BRAKE, START; keyboard arrows/WASD. Halli gets larger controls, lower vehicle speed and basic steering assistance.
- Host-authoritative movement and collision checks; bounded numeric input only. Remote players submit controls, never authoritative positions/progress.
- Mower cuts unique grass patches with visible removal. Cutting the same patch repeatedly does not award more progress.
- Bubble garden has a fixed population, tap hit detection, confetti, saved progression, color/vocabulary prompts and spoken pauses. No speech recognition requirement.
- Shared tag transfers IT after contact and cooldown, with computer residents when playing alone.
- Game House contains Classic Games in an iframe; the hosting world remains open. Existing books, whiteboards and games are preserved. The original homepage is preserved exactly as `classic-home.html`, and the other 43 original HTML activity pages/assets are untouched.

The full interactive home and remaining attractions are planned, not falsely presented as finished games. Final family characters/scenery/audio still need approved assets. Ambient traffic is illustrated scenery, not a finished traffic simulation. The current characters are clearly identified as development artwork.

## State and limitations

`world/client/family-game.mjs` owns authoritative simulation and state on the hosting browser. `room.mjs` owns codes, join approvals, per-device profile permissions, shared updates and remote request timeouts. `free-app.mjs` integrates these with the existing world renderer/audio/controls. Browser `localStorage` saves household progress, preferences, guests and shared grass on the host; it **does not implement multiplayer**. PeerJS data channels implement cross-device play. Clearing browser storage or switching hosting devices does not carry progress automatically. **Save progress backup** downloads a JSON checkpoint; an import/restore interface is planned.

Room codes are created with Web Crypto. Incoming messages have size/rate limits; unapproved peers receive no world snapshots. One approved connection per profile prevents duplicate Jace/Halli sessions. Approvals are session-scoped. Host controls can remove a device or regrow the lawn. This code-based setup cannot authenticate who a person is; the host must recognize whom it is approving.

The optional secure Node/SQLite implementation is retained under `world/server/` for future use, but it is not required for the current free play path. Its previous hosting instructions are archived in `docs/OPTIONAL-PRIVATE-SERVER.md`. Do not follow that paid-hosting path for this release.

## Validation

Run `cd world && npm test`. Eight test cases pass: original server/security tests, simulation controls/mowing/proximity, generated codes, fixed bubble population and saved progression, fake-transport host approvals/profile locking/shared snapshots/device removal, and rejecting remote-position authority. The transport tests use a deterministic test double; they are not a claim that real WebRTC/iPad connections were tested. Native Canvas renderer checks also pass. Full real-browser/iOS Safari QA remains required; Chromium installation was unavailable in the execution environment.

See `docs/CHECKLIST.md`, `docs/AUDIT.md`, and `docs/ASSETS.md` for complete development status.
