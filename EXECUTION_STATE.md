# ShivVedh integration state

## Baseline and scope

- Main baseline: `edd16aa52e7dde803452b49d533c4b55ca0a46e5`. Integration branch: `integration/shivvedh-mahagrantha`. GitHub review: draft PR #7.
- PR #6 is the engineering baseline. PR #2 contributes 16 narrative drafts and a separate scene, with manuscript tests and provisional evidence ledgers. The reader HTML and archive records are preserved during the editorial merge.
- PR #5 supplies a separate implementation of the cover, opening, search, bookmarks and reading controls. Its reader and service-worker changes overlap with main and require reconciliation by file.
- Reviewed the master blueprint, release gate, editorial index and 54-chapter Grantha plan. The old chapter numbering in reader data and the editorial sequence differ.
- Issues #3 and #4 cover 3D forts and completing the manuscript. Deployment workflow uses manual dispatch with an owner approval variable. Live Pages source settings are unverified.

## Release-check investigation

| Runs | Actions run IDs |
| --- | --- |
| 52–56 | 45179569054, 45179634654, 45180512221, 45181125065, 45181871406 |
| 57–60 | 45462765811, 45463016220, 45463088707, 45463126418 |

Job logs for all nine runs show the catalog generator rejecting stale `data/catalog.json` and `data/search-index.json` inside `npm test`. The checked-in indexes had not kept pace with changes to the reader and Volume One archive. Playwright installation succeeded in run #60. Ubuntu 24.04 is pinned for compatibility with Playwright 1.58.2.

- Reproduced stale output from main.
- PR #6 regeneration, strict original-section preservation checks and worker cache migration are integrated. Static validation, architecture validation, generated index checks, six Python tests and service-worker lifecycle tests passed locally.
- The editorial merge passed all nine Python tests. Local Chromium aborted at startup because the runtime denied a socket operation. Browser assertions require the hosted runner.

## Integration validation

- Actions #61 passed the engineering baseline. Actions #62 passed the baseline with the editorial merge.
- PR #5 was reconciled into the branch with the 19 existing reader sections and legacy anchors intact. The cache version advanced to v5 and now includes the reader stylesheet. The royal browser suite captures mobile, tablet and desktop screenshots under the Actions artifact directory.
- Hosted run #63 was started with a truncated reader HTML transfer. A corrective commit restored the full locally tested blob, and the resulting GitHub tree hash matched the local commit. Its hosted run is #64.
- Architecture validation now uses the same reader section inventory as the generator and guards against duplicate IDs.
- The editorial chapter map inventories nine volumes and 54 planned chapters. Twenty-nine chapters have related draft material, often shared across several chapters. Twenty-five have no mapped draft file. The 18 source files include 17 narrative drafts and a standalone scene. No chapter has been certified against the final plan.
- Local regression run after reconciliation passed static and architecture validation, the index freshness check, ten Python tests and the service-worker lifecycle suite. Device browser validation remains open.

- Run #64 exposed missing dock controls during initialization. Restored the controls and checked the exact uploaded tree. Run #66 passed the release suite and captured 12 screenshots at 393×852, 820×1180 and 1440×1000. The splash, cover, light chapter and night reader images were inspected at each size. See [run #66 and reader-validation artifact](https://github.com/Swapnild007/ShivVedh/actions/runs/45465972402).
- Chapter 30 has an original Marathi draft and seven linked claim records. The register distinguishes the inspected scan of printed pp. 72–75 of Sen’s 1920 published Sabhasad translation, the consulted text of Sarkar’s 1920 study, an encyclopedia excerpt and unresolved primary-source checks.
- The cover links to a nine-volume, 54-entry contents page. Existing reader links are identified as related sections from the current reading edition. The contents page is in the v6 precache and has automated coverage for rendering offline, expanding each volume and opening a legacy reader anchor.

- The opening now uses a locally cached 97 KiB WebP derivative of Sopan Patil’s 2017 photo from the Torna–Rajgad route. Attribution is in the contents and asset register. The sequence skips on deep links, after dismissal in the same tab, and when reduced motion is requested. Cache v7 includes the photograph.

- Runs #68 and #69 passed the contents page and cover changes, including offline expansion of all nine volumes.
- Reader preferences now include four themes plus persisted line spacing and width controls. Passage selection supports local highlights and personal notes. Run #72 passed the expanded browser suite, including reduced motion and creating, restoring, reopening and removing an annotation. Fifteen screenshots (opening, cover, light chapter, night reader and contents at three viewport sizes) were downloaded and inspected. [Run #72](https://github.com/Swapnild007/ShivVedh/actions/runs/45467688243).
- Cache v10 adds a chapter filter to Marathi search with a browser regression assertion. Local checks include 11 Python tests.

- The public GitHub Pages URL returned HTTP 200 and its homepage bytes match the `edd16aa` main baseline. The integration branch has no Pages deployment.
- Cache v11 adds an initial reference gallery and six dated timeline records. The timeline indexes published secondary study references and existing document summaries with distinct evidence status, and links events back to the current reader.

- [Integration QA and deployment instructions](docs/INTEGRATION_QA.md) records test evidence and editorial gaps. Pages now stages a checked public artifact after the full release suite and retains the manual owner-approval gate.

## Next action

Verify the latest Actions run for the v11 timeline and its offline document links. Next, extend the knowledge centre with audited fort and person records using stable identifiers and dated evidence. Continue the first draft of Chapter 31 and resolve Chapter 30’s date and name questions from a dated primary edition before certifying those details.

Still open: new publication design, complete manuscript and claim-level source review, full reader and knowledge centre features, physical Android and Edge validation, deployment verification and owner release approval. Current verdict: public release blocked.
