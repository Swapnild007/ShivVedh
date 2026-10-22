# ShivVedh integrated reader release

Status: software review candidate; **not approved for public launch**.
Baseline: `f869bbed8a30579f63020de17841b56db8d10ccb`.

## Repository audit and resolution

| Finding in prototype | Resolution |
| --- | --- |
| One large HTML file combined manuscript, styles and pagination; pages were three-paragraph groups | Preserve the manuscript in its existing canonical HTML; replace reader logic with measured browser columns in `app/reader.js` and presentation in `app/reader.css` |
| Numeric page bookmarks changed meaning with typography or viewport | Versioned local chapter/text-offset positions; repaginate after font loading, resizing and font-size changes |
| Hand-maintained navigation and keyword search drifted from actual content | Generate catalog and full-text index from canonical HTML and unchanged historical datasets; CI rejects stale generated output |
| Existing viewport minimum height overrode measured page size | Reset minimum height and reserve space for Devanagari font bounds; check all rendered text fragments in narrow/landscape layouts |
| Runtime fonts depended on Google Fonts | Bundle Noto Serif Devanagari (400/700 + Latin) with SIL OFL license; remove external font requests |
| Offline installation ignored individual cache failures and mixed an independent download cache with shell caches | Atomic shell precache, cache-first versioned resources, failed-install rejection, old-cache cleanup, same-origin/scope restrictions, completeness query and visible retry/error states |
| Tests checked filenames and references, not reader behavior | Add preservation assertions, catalog/evidence tests, service-worker simulation and Chromium integration tests in CI |

## Delivered behavior

- Paper reader with browser-shaped Marathi pagination, previous/next boundaries, keyboard arrows, adjustable type (16–32 px), persistent text positions and visible chapter/page/progress indicators. Page count is a layout count, never a fabricated printed-book count.
- Generated navigation for six existing volume groupings, front matter and references: 16 reader sections, including 13 sections marked narrative in the prototype (the latter count includes references).
- Chapter evidence dialog links the existing five claim records, three document leads, three bakhar leads and five passage comparisons. Chapters without attached evidence explicitly say review is pending.
- Explicit categories distinguish verified fact, disputed account, later tradition and editorial narrative. **No new record is marked verified fact.** Existing edition-page verification labels remain quoted provenance, not independent event verification.
- Unified full-text search contains 51 records: manuscript and earlier volume draft, preserved letter and bakhar prose, document/claim/passage registries. These are search records, **not 51 authenticated historical sources**. Unicode normalization, Devanagari/Arabic digit equivalence, multiple terms, filters, meaningful excerpts, no-result/error messages and record links are supported.
- Offline reader, search, archives, local fonts and both original artwork assets, after one successful online installation. Offline status checks the service worker's entire required resource list. Updates wait for old tabs to close; a failed installation cannot replace the active version.
- Android-sized layouts, safe-area spacing, native evidence dialog, contents focus containment, Escape dismissal, focus-visible controls, accessible labels/progress/status, reduced motion and private/local-only reading state.
- Sized 192/512 PNG PWA icons derived from the existing logo. Original artwork is retained.

## Preservation and editorial boundaries

The `index.html` manuscript article is byte-for-byte identical to baseline. The body content of letters, bakhars and `volume-one.html` is preserved. Original `documents.json`, `bakhars.json`, `claims.json`, `bakhar-passages.json`, all research notes and all prior work remain. No scans, transcripts, archival identifiers, historical quotations, dates or corroboration were invented. Font links and software presentation changed; this is not a new manuscript edition.

The generated catalog is navigation metadata; canonical narrative remains in preserved HTML for this migration. This avoids maintaining two editable manuscripts. Run `python3 scripts/build_catalog.py` after intentional content changes, then review the resulting diff. Never edit generated indexes as independent historical sources.

## Verification

Commands: `npm ci`, `npx playwright install --with-deps chromium`, `npm test`.

- Existing release and architecture checks: pass.
- Generated catalog/search freshness: pass.
- Six preservation/evidence/precache/target integrity tests: pass.
- JavaScript syntax checks (app, worker and existing inline scripts): pass.
- Worker simulation: subpath resource scope, rejected incomplete installation, old-cache cleanup and unrelated request isolation: pass.
- Headless Chromium integration: preserved reader text, reload restoration, font and viewport reflow, page controls, contents/evidence, search/no-results, offline archives and offline full-text search: pass.
- Layouts: 393×852, 320×640, 852×393 and 1280×800. Explicit shaped-text clipping checks include front matter, portrait and long opening/final chapters at narrow/landscape sizes. Screenshot: CI artifact `reader-validation/android-reader.png`.
- Local browser execution used Chromium 153 from a temporary npm-distributed binary because the normal browser CDN download returned invalid ZIPs. CI installs the browser bundled with pinned Playwright 1.58.2. A physical Android browser, TalkBack and standalone installation still require device acceptance.

## Remaining gates and known limits

| Priority | Remaining work | Owner / dependency |
| --- | --- | --- |
| P0 | Full manuscript and chapter-by-chapter historical review; exact edition/page/folio provenance and corroboration | Marathi historical/editorial reviewer with access to originals/editions |
| P0 | Physical Android Chrome PWA install, airplane-mode relaunch, TalkBack, zoom and update acceptance | Device QA |
| P0 | Owner review and explicit approval before merging/releasing publicly | Repository owner |
| P1 | Migrate preserved HTML narrative to a structured block authoring format once editorial workflow is agreed | Software + editorial team |
| P1 | Archive pages retain their original independent presentation; the premium paginated reader applies to the principal manuscript | Later archive-reader consolidation |
| P1 | Real browser storage quota eviction cannot be prevented; initial complete installation needs network and space | Browser/device |
| P2 | Highlighting, export, sync, audio, maps and translations | Separate scope; no backend added |

A legacy numeric `shivvedh-page` bookmark is not converted to a text offset because its paragraph-group page numbers are not stable. New bookmarks use `shivvedh-position-v2`. Reading state is device/browser local and is not synced.

## Release safety

No deployment workflow was run, no release variable changed, no work deleted and no public site published. The existing manual-only deployment approval gate remains. This PR does not certify historical completeness or replace the existing `RELEASE_GATE.md`.
