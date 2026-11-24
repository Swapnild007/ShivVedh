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

## Next action

Check Actions on draft PR #7 and inspect the failing step or artifacts if CI fails. Then inventory the draft-to-54-chapter map and reconcile PR #5's reader changes against the 19-section legacy catalog while preserving document anchors and saved positions.

Still open: completed 54-chapter Marathi manuscript and claim-level source review, publication design and reader redesign, complete knowledge centre, responsive screenshots, physical Android and Edge validation, deployment verification and owner release approval.
