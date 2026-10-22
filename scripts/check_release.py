# ShivVedh integrated release validation
# Run: python3 scripts/check_release.py
from pathlib import Path
import json,re,sys
root=Path(__file__).resolve().parents[1]
pages=["index.html","letters.html","bakhar.html","documents.html","search.html","evidence.html","bakhar-passages.html","offline.html"]
errors=[]
for p in pages:
 f=root/p
 if not f.is_file():errors.append(f"Missing page: {p}");continue
 s=f.read_text(encoding="utf-8")
 if 'rel="manifest"' not in s:errors.append(f"No manifest: {p}")
 if p!="offline.html" and 'navigator.serviceWorker.register' not in s:errors.append(f"No SW registration: {p}")
for p in ["manifest.webmanifest","sw.js","data/documents.json","data/bakhars.json","data/claims.json","data/bakhar-passages.json"]:
 if not (root/p).is_file():errors.append(f"Missing asset: {p}")
for p in ["data/documents.json","data/bakhars.json","data/claims.json","data/bakhar-passages.json","manifest.webmanifest"]:
 try:json.loads((root/p).read_text(encoding="utf-8"))
 except Exception as e:errors.append(f"Invalid JSON {p}: {e}")
try:
 docs=json.loads((root/"data/documents.json").read_text())["documents"]
 baks=json.loads((root/"data/bakhars.json").read_text())["records"]
 claims=json.loads((root/"data/claims.json").read_text())["claims"]
 ids={d["id"] for d in docs+baks}
 for claim in claims:
  for ev in claim["evidence"]:
   if ev["id"] not in ids:errors.append(f"Broken claim source: {claim['id']} => {ev['id']}")
 print(f"Evidence integrity: {len(docs)} documents, {len(baks)} bakhars, {len(claims)} claims")
except Exception as e:errors.append(f"Evidence check failed: {e}")
for p in pages:
 if (root/p).is_file():
  html=(root/p).read_text(encoding="utf-8")
  for href in re.findall(r'href="([^"]+)"',html):
   if href.startswith(("https:","http:","#","mailto:","javascript:")):continue
   local=href.split("#")[0].split("?")[0]
   if local and not (root/local).exists():errors.append(f"Broken local link in {p}: {href}")
if errors:
 print("FAIL\n"+"\n".join(errors));sys.exit(1)
print("PASS: static files, offline integration, JSON, references and internal links")
