"""Validate ShivVedh architecture relationships and document invariants."""
import json
import re
import sys
from pathlib import Path

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
passages = load("data/bakhar-passages.json", "passages")
index = (ROOT / "index.html").read_text(encoding="utf-8")
chapters = set(re.findall(r'<section\s+class="section narrative"\s+id="([^"]+)"', index))
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
for required in ["ARCHITECTURE.md", "MASTER_BLUEPRINT.md", "RELEASE_GATE.md"]:
    if not (ROOT / required).is_file():
        errors.append(f"Missing architecture document {required}")
if errors:
    print("ARCHITECTURE FAIL:\n" + "\n".join(errors))
    sys.exit(1)
print(f"ARCHITECTURE PASS: {len(chapters)} chapters, {len(docs)} documents, {len(bakhars)} bakhars, {len(claims)} claims, {len(passages)} passages; unique IDs and links")
