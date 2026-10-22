(() => {
  'use strict';
  const q = document.getElementById('query'),
    kind = document.getElementById('kind'),
    results = document.getElementById('results'),
    count = document.getElementById('count');
  let records = [];
  const normalize = (value) =>
    value
      .normalize('NFC')
      .replace(/[\u200c\u200d]/g, '')
      .replace(/[०-९]/g, (n) => String('०१२३४५६७८९'.indexOf(n)))
      .toLocaleLowerCase('mr');
  function render() {
    const terms = normalize(q.value).trim().split(/\s+/).filter(Boolean),
      hits = records.filter(
        (r) =>
          (kind.value === 'all' || r.kind === kind.value) &&
          terms.every((t) =>
            normalize(r.title + ' ' + r.text + ' ' + r.status).includes(t),
          ),
      );
    results.replaceChildren();
    count.textContent = hits.length + ' नोंदी सापडल्या';
    for (const r of hits) {
      const article = document.createElement('article');
      article.className = 'card';
      const h = document.createElement('h2'),
        a = document.createElement('a');
      a.href = r.url;
      a.textContent = r.title;
      h.append(a);
      const p = document.createElement('p');
      let start = terms.length
        ? Math.max(0, normalize(r.text).indexOf(terms[0]) - 70)
        : 0;
      p.textContent =
        (start ? '…' : '') +
        r.text.slice(start, start + 320) +
        (r.text.length > start + 320 ? '…' : '');
      const status = document.createElement('p');
      status.className = 'status';
      status.textContent = r.status;
      article.append(h, p, status);
      results.append(article);
    }
    if (!hits.length)
      results.textContent = 'या शब्दांसाठी नोंद सापडली नाही. वेगळे शब्द वापरा.';
  }
  q.addEventListener('input', render);
  kind.addEventListener('change', render);
  fetch('data/search-index.json')
    .then((r) => {
      if (!r.ok) throw Error(r.status);
      return r.json();
    })
    .then((data) => {
      records = data.records;
      render();
    })
    .catch(() => {
      count.textContent =
        'शोधसूची लोड झाली नाही. इंटरनेट तपासा किंवा पृष्ठ रीफ्रेश करा.';
    });
})();
