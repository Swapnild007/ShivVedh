# SHIVVEDH RELEASE GATE

**State: NOT READY FOR PUBLIC LAUNCH.**

The GitHub Pages deployment workflow is manual-only and refuses to deploy unless repository variable `SHIVVEDH_RELEASE_APPROVED` equals `true`. Do not set this variable until all release checks below pass. Note: if GitHub Pages is independently configured to publish from a branch, that separate setting must also be disabled in repository Settings > Pages; the workflow change alone cannot control branch-based publishing.

## Release gates
- [ ] Complete, editorially reviewed Marathi manuscript with all planned volumes and full-length chapters.
- [ ] Source ledger: each significant factual claim points to a verified edition, page/folio or an explicit unresolved status.
- [ ] Original letters: exact provenance, permissions, verified transcript and translations where available. Never fabricate absent scans.
- [ ] Bakhar comparisons: original editions checked, variant readings identified, primary vs later tradition clearly distinguished.
- [ ] Accessible, consistent mobile book reader and archive navigation; tested on Android.
- [ ] Offline functionality verified in airplane mode, including data pages and version updates.
- [ ] Search across all indexed content; no broken links or missing files.
- [ ] Release CI passes; successful Pages deployment in controlled review.
- [ ] Owner approves final release.

## Development workflow
1. Work on code, content, and research in repository without public announcements.
2. Use `scripts/check_release.py` and GitHub Actions checks after changes.
3. Record historical uncertainty, missing scans, and editorial gaps in structured records.
4. Only after sign-off, set `SHIVVEDH_RELEASE_APPROVED=true` and manually run the deployment workflow.

## Present limitations
Existing chapters are an incomplete draft, not the intended 1200+ page book. The archives contain preliminary records, not complete verified transcriptions. Mobile offline support is implemented but not yet device-tested. No historical advisory-board review has been completed.
