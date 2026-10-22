"""Guard preservation, generated indexes, cross-references, and evidence honesty."""
import hashlib,json,re,subprocess,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def load(path):return json.loads((ROOT/path).read_text())
class Integrity(unittest.TestCase):
 def test_manuscript_preserved_from_baseline(self):
  baseline=subprocess.check_output(['git','show','f869bbed8a30579f63020de17841b56db8d10ccb:index.html'],cwd=ROOT,text=True)
  extract=lambda s: re.search(r'<article class="leaf" id="content">(.*?)</article>',s,re.S)[1]
  self.assertEqual(extract(baseline),extract((ROOT/'index.html').read_text()))
 def test_all_sections_indexed_without_keyword_substitutes(self):
  index=load('data/search-index.json')['records']; catalog=load('data/catalog.json')
  for c in catalog['chapters']:
   r=next(r for r in index if r['id']==c['id']);self.assertIn(c['title'],r['text']);self.assertEqual(r['url'],'index.html#'+c['id'])
  self.assertEqual(len(catalog['chapters']),16)
 def test_every_claim_and_passage_has_explicit_category(self):
  policy=load('data/evidence-policy.json');categories=policy['categories']
  for filename,key,mapping in [('claims','claims','claims'),('bakhar-passages','comparisons','passages')]:
   for r in load('data/'+filename+'.json')[key]:
    self.assertIn(policy[mapping][r['id']],categories)
    self.assertNotEqual(policy[mapping][r['id']],'verified-fact')
 def test_every_precached_resource_exists(self):
  sw=(ROOT/'sw.js').read_text();paths=re.search(r'const PATHS\s*=\s*\[(.*?)\];',sw,re.S)[1]
  for path in re.findall("'([^']+)'",paths): self.assertTrue((ROOT/path).exists(),path)
  self.assertNotIn('allSettled',sw);self.assertIn('cache.addAll',sw)
 def test_record_targets_exist(self):
  for r in load('data/search-index.json')['records']:
   self.assertTrue((ROOT/r['url'].split('#')[0]).is_file(),r['url'])
 def test_no_archival_content_rewritten(self):
  for path in ['letters.html','bakhar.html','volume-one.html']+[str(p.relative_to(ROOT)) for p in (ROOT/'data').glob('*.json') if p.name in ['claims.json','documents.json','bakhars.json','bakhar-passages.json']]:
   baseline=subprocess.check_output(['git','show','f869bbed8a30579f63020de17841b56db8d10ccb:'+path],cwd=ROOT)

   actual=(ROOT/path).read_bytes()
   if path.endswith('.html'):
    extract=lambda value:re.search(rb'<main[^>]*>(.*?)</main>',value,re.S)[1]
    self.assertEqual(extract(baseline),extract(actual),path)
   else:self.assertEqual(baseline,actual,path)
if __name__=='__main__': unittest.main()
