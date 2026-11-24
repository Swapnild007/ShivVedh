# ShivVedh integration QA

**Public release decision: NO-GO.** Draft PR #7 is a working integration checkpoint.

| Area | Evidence |
| --- | --- |
| Repeated CI failure | Actions #52–60 all stopped at the generated-file check. Rebuilding the catalog and search index from the changed manuscript and archive HTML fixed that failure. |
| Preservation | Regression tests compare all 16 baseline reader sections byte-for-byte and preserve their order. Separate tests preserve baseline archive articles and evidence records. The catalog currently contains 19 existing reader sections. |
| Contents and offline | Hosted Chromium opened all nine contents volumes offline and counted 54 planned entries. Published reader sections retain their original anchors. |
| Reader | Hosted Chromium verified pagination, font and viewport reflow, saved position, bookmarks, four themes, spacing, width, private annotations, Marathi search, dialog navigation, history, and reduced motion. |
| Visual review | Downloaded and inspected the 18 responsive images from Actions #74. Looked at the opening, cover, light chapter, night reader, contents and timeline at 393×852, 820×1180 and 1440×1000. Text and primary controls fit the captured frames. Desktop and tablet reader margins intentionally remain broad for shorter line lengths. These are viewport emulations. |
| Manuscript | The nine-volume map has 54 planned chapters, 29 with related drafts and 25 without a mapped draft. The 18 source files contain 19,566 whitespace-delimited tokens, including editorial apparatus. No final-plan chapter has been certified. |
| Historical evidence | Chapter 30 has seven source-linked checks. Printed pages 72–75 of the 1920 Sen edition were visually inspected at the University of North Bengal scan. Sarkar’s 1920 pages and the encyclopedia lead have different access statuses. Exact capture date, name chronology and disputed totals remain open. |
| Pages | The current public homepage returned HTTP 200 and was byte-identical to the `edd16aa` main baseline. The integration branch has no deployment. Actions #75 passed the full suite and the staged artifact check. The 42-file public artifact excludes the research folder, manuscript drafts and repository metadata. |
| Device QA | Physical Android Chrome, TalkBack, desktop Edge and real-device install/update tests remain open. Local Chromium launch was blocked by the environment, so automated browser claims refer to the GitHub-hosted runner. |

- [Draft integration PR #7](https://github.com/Swapnild007/ShivVedh/pull/7)
- [Actions #72 and inspected reader screenshots](https://github.com/Swapnild007/ShivVedh/actions/runs/45467688243)
- [Actions #74 covering the timeline and 18 responsive screenshots](https://github.com/Swapnild007/ShivVedh/actions/runs/45468827966)
- [Actions #75 covering the release suite and public Pages artifact packaging](https://github.com/Swapnild007/ShivVedh/actions/runs/45469092055)

## Controlled preview and deployment

For local verification, check out `integration/shivvedh-mahagrantha` and run `python3 -m http.server 4173` from the checkout. Open `http://localhost:4173/`. The service worker needs HTTP on localhost or HTTPS. To verify the exact distribution, stage into a fresh directory with `python3 scripts/package_pages.py /path/to/fresh-directory` and serve that directory.

After all gates in [RELEASE_GATE.md](../RELEASE_GATE.md) pass and the owner authorizes publication, confirm that GitHub Pages uses GitHub Actions as its source. Set `SHIVVEDH_RELEASE_APPROVED=true` and manually run **Publish ShivVedh to GitHub Pages** from the approved revision. The workflow runs the full release tests and stages the public application before deploying. Check the published URL, its contents page, deep links, Marathi search and an offline round trip on a physical device. Compare the deployed cache version with the approved revision.
