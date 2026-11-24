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
- The editorial chapter map inventories nine volumes and 54 planned chapters. Twenty-eight chapters have related draft material, often shared across several chapters. Twenty-six have no mapped draft file. The 17 source files contain 18,169 whitespace-delimited tokens including headings and editorial matter. No chapter has been certified against the final plan.
- Local regression run after reconciliation passed static and architecture validation, the index freshness check, ten Python tests and the service-worker lifecycle suite. Device browser validation remains open.

## Next action

Read the latest Actions result and locate the captured screenshots in the `reader-validation` artifact. Resolve any regression before continuing with the publication information architecture. Use `manuscript/chapter-map.json` to reconcile literature with stable legacy anchors and define the nine-volume library.

Still open: new publication design, complete manuscript and claim-level source review, full reader and knowledge centre features, physical Android and Edge validation, deployment verification and owner release approval. Current verdict: public release blocked.
