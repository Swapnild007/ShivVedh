"""Validate ShivVedh architecture relationships and document invariants."""
import json
import sys
from pathlib import Path

from build_catalog import reader_sections

ROOT = Path(__file__).resolve().parents[1]
errors = []

def load(path, key):
    try:
        data = json.loads((ROOT / path).read_text(encoding="utf-8"))
        if not isinstance(data.get("version"), int) or not isinstance(data.get(key), list):
            errors.append(f"{path}: invalid version or {key}")
            return []
        return data[key]
    except (OSError, ValueError) as exc:
        errors.append(f"{path}: {exc}")
        return []

docs = load("data/documents.json", "documents")
bakhars = load("data/bakhars.json", "records")
claims = load("data/claims.json", "claims")
passages = load("data/bakhar-passages.json", "comparisons")
index = (ROOT / "index.html").read_text(encoding="utf-8")
section_ids = [section_id for section_id, _ in reader_sections(index)]
chapters = set(section_ids)
if len(section_ids) != len(chapters):
    errors.append("Duplicate chapter ID in reader")
registry = {}
for collection, records in [("documents", docs), ("bakhars", bakhars), ("claims", claims), ("passages", passages)]:
    for record in records:
        ident = record.get("id")
        if not isinstance(ident, str) or not ident:
            errors.append(f"{collection}: missing ID")
        elif ident in registry:
            errors.append(f"Duplicate ID {ident}: {registry[ident]} / {collection}")
        else:
            registry[ident] = collection
for doc in docs:
    if not doc.get("title") or not doc.get("status") or not doc.get("collection"):
        errors.append(f"{doc.get('id')}: missing documentary provenance/status")
    if doc.get("originalScan") is not False and doc.get("originalScan") is not True:
        errors.append(f"{doc.get('id')}: originalScan must be boolean")
    if doc.get("transcript") is not False and doc.get("transcript") is not True:
        errors.append(f"{doc.get('id')}: transcript must be boolean")
    if doc.get("chapter") not in chapters:
        errors.append(f"{doc.get('id')}: unknown chapter {doc.get('chapter')}")
for claim in claims:
    if claim.get("chapter") not in chapters:
        errors.append(f"{claim.get('id')}: unknown chapter {claim.get('chapter')}")
    if not claim.get("review"):
        errors.append(f"{claim.get('id')}: missing editorial review note")
    for evidence in claim.get("evidence", []):
        source_id = evidence.get("id")
        collection = evidence.get("collection")
        if registry.get(source_id) != collection or collection not in ("documents", "bakhars"):
            errors.append(f"{claim.get('id')}: unresolved/mistyped source {source_id} in {collection}")
events = load("data/events.json", "events")
event_sources = json.loads((ROOT / "data/events.json").read_text(encoding="utf-8"))["sources"]
event_ids = set()
previous_year = 0
for event in events:
    ident = event.get("id")
    year = event.get("year")
    if not ident or ident in event_ids:
        errors.append(f"Duplicate or absent timeline ID: {ident}")
    event_ids.add(ident)
    if not isinstance(year, int) or year < previous_year:
        errors.append(f"{ident}: invalid timeline ordering")
    elif year:
        previous_year = year
    if event.get("chapter") not in chapters or not event.get("evidence"):
        errors.append(f"{ident}: timeline record must reference a reader section and evidence")
    for record in event.get("evidence", []):
        if record.get("source") not in event_sources or not record.get("locator") or not record.get("status"):
            errors.append(f"{ident}: incomplete event citation")
        url = record.get("url", "")
        if url.startswith("documents.html#"):
            document_id = url.split("#", 1)[1]
            if registry.get(document_id) != "documents":
                errors.append(f"{ident}: missing document {document_id}")
        elif not url.startswith("https://"):
            errors.append(f"{ident}: unsupported evidence URL")

for required in ["ARCHITECTURE.md", "MASTER_BLUEPRINT.md", "RELEASE_GATE.md"]:
    if not (ROOT / required).is_file():
        errors.append(f"Missing architecture document {required}")
if errors:
    print("ARCHITECTURE FAIL:\n" + "\n".join(errors))
    sys.exit(1)
print(f"ARCHITECTURE PASS: {len(chapters)} chapters, {len(docs)} documents, {len(bakhars)} bakhars, {len(claims)} claims, {len(passages)} passages; unique IDs and links")
