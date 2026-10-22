"""Generate navigation and complete search text from preserved HTML; no historical claims added."""
import hashlib, html, json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
def text(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', ' ', s))).strip()
def build():
    source = (ROOT/'index.html').read_text()
    chapters=[]; volumes=[]; records=[]
    for slug, body in re.findall(r'<section class="section[^\"]*" id="([^\"]+)">(.*?)</section>', source, re.S):
        title = text(re.search(r'<h2[^>]*>(.*?)</h2>',body,re.S)[1])
        label = re.search(r'<div class="section-label">(.*?)</div>',body,re.S)
        volume = text(label[1]) if label and 'खंड' in label[1] else 'प्रारंभ आणि संदर्भ'
        if volume not in [v['title'] for v in volumes]: volumes.append({'id':f'SV-V-{len(volumes):02}', 'title':volume,'order':len(volumes)})
        chapter={'id':slug,'title':title,'volumeId':next(v['id'] for v in volumes if v['title']==volume),'order':len(chapters),'editorialStatus':'editorial-narrative','citationStatus':'review-pending'}
        chapters.append(chapter)
        records.append({'id':slug,'kind':'chapter','title':title,'text':text(body),'url':'index.html#'+slug,'status':'संपादकीय कथन · स्रोतपडताळणी बाकी'})
    # Index every preserved archive paragraph, not only manually curated keywords.
    for filename,kind in [('letters.html','letter'),('bakhar.html','bakhar'),('volume-one.html','chapter')]:
        s=(ROOT/filename).read_text(); main=re.search(r'<main[^>]*>(.*?)</main>',s,re.S)[1]
        parts=re.split(r'(<h[12][^>]*>.*?</h[12]>)',main,flags=re.S)
        for i in range(1,len(parts),2):
            heading=parts[i]; ident=re.search(r'id="([^\"]+)"',heading)
            records.append({'id':f'{filename}-{i}','kind':kind,'title':text(heading),'text':text(parts[i+1]),'url':filename+('#'+ident[1] if ident else ''),'status':'जतन केलेली संशोधन नोंद · प्रमाणित लिप्यंतर नाही'})
    for filename,key,kind,dest in [('documents.json','documents','letter','documents.html'),('bakhars.json','records','bakhar','bakhar.html'),('claims.json','claims','research','evidence.html'),('bakhar-passages.json','comparisons','research','bakhar-passages.html')]:
        data=json.loads((ROOT/'data'/filename).read_text())
        for r in data[key]:
            url=dest+'#'+r['id']
            if filename=='bakhars.json': url='bakhar.html#'+{'SV-B-01':'sabhasad','SV-B-02':'chitnis','SV-B-03':'ninetyone'}[r['id']]
            records.append({'id':r['id'],'kind':kind,'title':r.get('title',r.get('name',r.get('claim'))),'text':' '.join(str(v) for v in r.values()),'url':url,'status':r.get('status',r.get('sourceStatus',r.get('review','review-pending')))})
    catalog={'version':1,'volumes':volumes,'chapters':chapters}
    return {'data/catalog.json':catalog,'data/search-index.json':{'version':1,'records':records}}
if __name__=='__main__':
    failed=[]
    for path,data in build().items():
        value=json.dumps(data,ensure_ascii=False,indent=2)+'\n'; target=ROOT/path
        if '--check' in sys.argv:
            if not target.exists() or target.read_text()!=value: failed.append(path)
        else: target.write_text(value)
    if failed: sys.exit('Stale generated files: '+', '.join(failed))
    print('Catalog and full-text index verified' if '--check' in sys.argv else 'Catalog and full-text index generated')
