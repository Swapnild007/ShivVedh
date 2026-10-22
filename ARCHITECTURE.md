# ShivVedh Architecture Contract v1

**Status:** Architecture design baseline complete. This does **not** mean the application, manuscript, research, or testing is complete.

## System boundaries
- **Delivery:** static GitHub Pages web application; Android-first progressive web app; no backend, secret keys, or paid infrastructure required for the present phase.
- **Presentation:** `index.html` (page reader), `letters.html`, `bakhar.html`, `documents.html`, `bakhar-passages.html`, `evidence.html`, `search.html`, `offline.html`.
- **Content:** immutable, versioned UTF-8 JSON published in `data/`. HTML drafts remain transitional and must eventually be imported to structured chapter files. No duplicate independent copies of canonical factual claims.
- **Research:** separate claims, documents, editions, manuscript witnesses, passage references, and source provenance. A source *mention* is not source *verification*.
- **Delivery infrastructure:** `sw.js`, `manifest.webmanifest`, GitHub Actions validation, manually approved Pages deployment. No public deployment before explicit sign-off.

## Canonical identifiers and entities
| Entity | ID convention | Required conceptual fields |
|---|---|---|
| Volume | `SV-V-01` | title, order, language, editorialStatus |
| Chapter | `SV-CH-001` | volumeId, slug, title, narrative blocks, claimIds, editorialStatus |
| Document | `SV-L-1644-01` | title, type, date certainty, provenance, language, script, transcription status, rights |
| Bakhar edition | `SV-B-01` | title, author attribution, edition, manuscript witness, uncertainty |
| Passage | `SV-P-001` | editionId, page/folio locator, transcription, translation, verified flags |
| Historical claim | `SV-C-01` | chapter, claim, evidence links, review status |
| Fort / location | `SV-F-001` | names, coordinate provenance, geometry uncertainty, sourceIds |
| Media asset | `SV-M-001` | kind, source, rights, alt text, attribution, local path |

Existing document and claim IDs are retained; migration must preserve legacy URLs and anchors. New records must not reuse IDs.

## Contract and validation rules
1. Data files declare a version and one named top-level collection. JSON must parse and entity IDs must be unique within and across collections.
2. Every evidence reference resolves to a known source ID and names the correct collection. Every claim chapter resolves to a reader chapter ID.
3. Document `originalScan=false` or `transcript=false` must never be represented as an authenticated transcription. Missing provenance is an explicit review task, not inferred.
4. Each chapter uses source-backed claims; uncertain dates, attributed speeches, numerical assertions and popular traditions are labeled rather than silently presented as established.
5. No copied copyrighted facsimiles, scans, audio, maps or third-party site code without rights verification.
6. External research URLs are source references, not required runtime dependencies. App core and saved content must work without network after successful caching.
7. Reader progress and preferences are local to device. Do not collect personal data or store API secrets in browser bundles.
8. Static links, local resources, manifests, JSON relationships and script syntax must pass CI. Responsive and offline behavior additionally require real browser/device checks.

## Reader and offline design
- Reader shows cover → volume → chapter → page; deep links use stable chapter slugs.
- Layout should paginate by rendered available height, not fixed paragraph count. Font scaling, orientation, zoom, long words and Marathi shaping must be tested.
- Use accessible landmarks, logical headings, keyboard focus, visible progress, reduced-motion support, and image descriptions.
- Service worker precaches app shell, caches content by version, avoids cross-origin caches, and provides a clear update/refresh path. Never assert offline success before airplane-mode verification.
- Search indexes structured narrative blocks and archival records; results expose source category and verification state. Curated keyword search is only a temporary implementation.

## Future feature interfaces
- **Historical maps:** source-backed GeoJSON, stable fort IDs, coordinate confidence and date ranges. No unverified coordinates.
- **Family tree:** person/relationship records with date uncertainty and citations; never invent disputed kinship.
- **Audio and media:** local fallback, captions/transcripts, rights and source metadata.
- **Quizzes and simulation:** learning content explicitly distinct from historical fact.
- **Translations:** language-keyed narrative versions, same claim IDs, human review required; Marathi is canonical initial language.

## Operational boundaries
- Main branch contains work in progress, not necessarily releasable code.
- `scripts/check_release.py` and `scripts/check_architecture.py` run on every push/PR.
- Pages publication requires manual dispatch and `SHIVVEDH_RELEASE_APPROVED=true`; repository Settings > Pages must not separately publish from branch.
- Release checklist and known gaps: `RELEASE_GATE.md`. No version is declared complete until editorial and Android acceptance tests pass.

## Architecture decisions
- **ADR-001:** static-first hosting until a justified feature requires managed compute.
- **ADR-002:** structured JSON + stable IDs instead of a database in phase one.
- **ADR-003:** source-critical editorial workflow and explicit unknowns.
- **ADR-004:** offline PWA before any APK wrapper.
- **ADR-005:** accessible Marathi-first reader with future translations.
- **ADR-006:** gated public release, independent from ordinary code commits.

## Migration sequence
1. Validate current data and cross-references in CI.
2. Extract existing inline HTML chapter content into versioned chapter JSON, retaining IDs and preserving reading behavior.
3. Build unified search index from chapter blocks, archival sources and claims.
4. Move document/bakhar galleries to render canonical JSON records.
5. Add media, maps and translations only after provenance and rights models are populated.

**Architecture completion definition:** components, interfaces, identifiers, data ownership, integrity rules, security, deployment, offline, accessibility, ADRs, and migration are documented and mechanically checked where possible. Feature delivery is tracked separately.

## Integrated reader implementation (review candidate)

The manuscript HTML remains canonical during migration. `scripts/build_catalog.py` generates `data/catalog.json` and `data/search-index.json`; CI checks freshness. `app/reader.js` renders one preserved chapter at a time with measured CSS columns and stores `{chapter, offset}` under `shivvedh-position-v2`. The text offset is independent of a device's page count. Browser font bounds and viewport changes participate in pagination.

`data/evidence-policy.json` defines presentation categories without changing existing historical source statuses. The chapter evidence panel exposes unresolved references explicitly. A verified edition page is not verification of the narrated event.

The worker atomically precaches all required reader/archive/search/font resources and reports completeness to `app/offline.js`. It waits for old clients to close before an update activates. Bump the worker VERSION for every published content/software release. No public deployment is authorized by this implementation.

Verification, preservation boundaries and remaining editorial/device gates are documented in `docs/ENGINEERING_RELEASE_REPORT.md`.
