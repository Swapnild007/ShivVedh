"""Guard preservation, generated indexes, cross-references, and evidence honesty."""
import hashlib,json,re,subprocess,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def load(path):return json.loads((ROOT/path).read_text())
class Integrity(unittest.TestCase):
 def test_manuscript_preserved_from_baseline(self):
  # New chapters may be inserted, but every originally approved section must remain byte-for-byte intact.
  baseline=subprocess.check_output(['git','show','f869bbed8a30579f63020de17841b56db8d10ccb:index.html'],cwd=ROOT,text=True)
  current=(ROOT/'index.html').read_text(encoding='utf-8')
  extract=lambda s: re.search(r'<article class="leaf" id="content">(.*?)</article>',s,re.S)[1]
  pattern=r'<section class="section[^"]*" id="([^"]+)">(.*?)</section>'
  original=dict(re.findall(pattern,extract(baseline),re.S))
  sections=dict(re.findall(pattern,extract(current),re.S))
  self.assertTrue(original)
  self.assertTrue(all(k in sections for k in original),'Approved section missing')
  self.assertEqual([k for k in sections if k in original],list(original),'Approved reading order changed')
  for section_id,html in original.items():
   self.assertEqual(sections[section_id],html,'Approved content modified: '+section_id)
  additions=[k for k in sections if k not in original]
  self.assertEqual(set(additions),{'two-courts','raireshwar','pratapgad'})
  for section_id in additions:
   self.assertGreater(len(sections[section_id]),1500,'New chapter lacks substantial prose: '+section_id)
 def test_all_sections_indexed_without_keyword_substitutes(self):
  index=load('data/search-index.json')['records']; catalog=load('data/catalog.json')
  for c in catalog['chapters']:
   r=next(r for r in index if r['id']==c['id']);self.assertIn(c['title'],r['text']);self.assertEqual(r['url'],'index.html#'+c['id'])
  self.assertEqual(len(catalog['chapters']),19)
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
    old_main,new_main=extract(baseline),extract(actual)
    if path=='volume-one.html':
     # The original archive chapters remain unchanged; newly approved additions may follow.
     pattern=rb'<article id="([^"]+)" class="chapter">(.*?)</article>'
     old_articles=dict(re.findall(pattern,old_main,re.S))
     new_articles=dict(re.findall(pattern,new_main,re.S))
     self.assertEqual([k for k in new_articles if k in old_articles],list(old_articles))
     for ident,body in old_articles.items():
      self.assertEqual(new_articles[ident],body,'Approved archive chapter modified: '+ident.decode())
     additions=set(new_articles)-set(old_articles)
     self.assertEqual(additions,{b'new-shahaji',b'new-raireshwar',b'new-pratapgad'})
     for ident in additions:
      self.assertGreater(len(new_articles[ident]),1500,'New archive chapter lacks prose')
    else:
     self.assertEqual(old_main,new_main,path)
   else:self.assertEqual(baseline,actual,path)
if __name__=='__main__': unittest.main()
