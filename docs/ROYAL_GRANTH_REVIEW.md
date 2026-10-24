# Royal Granth UI review

This change adds a short, skippable emblem-led opening, a charcoal/gold bound cover, a parchment reading room, persisted night theme, text-offset bookmarks, in-reader Marathi search, mobile sheets and a quiet reading mode. The existing locally bundled emblem and fonts are reused.

## Preservation and scope

The canonical `index.html` manuscript article remains byte-for-byte identical to the original baseline. The historical JSON, archival main content, titles and generated catalog/search records are unchanged. Automated preservation tests enforce this. No historical claim has been newly certified. The 16 navigation entries include front matter and references, so the UI labels them **sections**, not 16 completed manuscript chapters.

PR #1 was already merged. PR #2 (`editorial/volume-one-manuscript`) remains the independent manuscript workstream; its files and branch are untouched. This UI branch starts from main at `69fb0416b30d6d97bc4bc9cd755e538d4644657d`. No deployment or merge is part of this change.

## Interaction design

- Splash automatically dismisses after 1.6 seconds (0.4 seconds for reduced motion), offers immediate skip, and is skipped on deep links and subsequent opens in the same session.
- Contents retains actual volume groupings and chapter titles. Chapter navigation participates in browser history.
- Font sizing retains stable text-offset positions. Bookmarks store section IDs and text offsets rather than unstable device page numbers; multiple bookmarks are supported.
- Parchment/night preferences persist locally. Quiet mode hides the upper controls while retaining page navigation and an explicit exit.
- Search normalizes Unicode and zero-width joiners, separates manuscript from reference materials, and presents excerpts and source status. Results open the relevant chapter or existing archive record. Search opens chapters at their start, not an exact highlighted match.
- Evidence remains in a modal sheet with the existing uncertainty categories and source links. Source archive pages retain their original independent presentation.
- Offline worker v3 includes the new stylesheet and retains atomic installation. No external font/image runtime requests were introduced.

## Validation

Executed full `npm test` locally with Playwright 1.58.2 and a temporary Chromium runtime (standard Playwright browser download was unavailable). The temporary browser package is not a project dependency.

The suite includes release/architecture checks, generated-index freshness, six content-integrity tests, script syntax and worker lifecycle checks, existing pagination/restoration/font reflow/offline browser checks, plus royal UI interaction tests. Screenshots below are actual browser renders, not mockups.

Viewports: existing suite at 320×640, 393×852, 852×393 and 1280×800; new interactions/screenshots at 393×852 and 1440×1000.

| Surface | Android-sized | Desktop |
| --- | --- | --- |
| Splash | [Screenshot](screenshots/android-splash.png) | [Screenshot](screenshots/desktop-splash.png) |
| Cover | [Screenshot](screenshots/android-cover.png) | [Screenshot](screenshots/desktop-cover.png) |
| Chapter opening | [Screenshot](screenshots/android-chapter.png) | [Screenshot](screenshots/desktop-chapter.png) |
| Night reader | [Screenshot](screenshots/android-reader.png) | [Screenshot](screenshots/desktop-reader.png) |

## Remaining gates

- Physical Android Chrome, TalkBack, installation, airplane-mode cold launch and real-device update acceptance remain untested here. Browser viewport tests are not physical-device certification.
- Manuscript writing, source-specific verification and independent historical review remain ongoing in the editorial workstream.
- No geographical map or reconstructed forts were added: existing data is a source registry, not a verified geospatial model.
- Archive pages retain existing layouts; a fully unified archive design is future work.
- Reading progress and bookmarks are browser-local and may be lost if browser storage is cleared.

Verdict: UI review candidate; not a declaration of manuscript completion or public-release approval.
