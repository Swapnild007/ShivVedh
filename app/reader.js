/* Layout pages are computed by the browser after Marathi shaping. Stored positions use text offsets. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id),
    leaf = $('content'),
    reader = $('reader'),
    cover = $('cover'),
    drawer = $('drawer');
  const chapters = [...leaf.children],
    textNodes = () => {
      const w = document.createTreeWalker(leaf, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (w.nextNode()) nodes.push(w.currentNode);
      return nodes;
    };
  const storage = {
    get(key, fallback) {
      try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        $('reader-status').textContent =
          'या सत्रापुरती प्रगती; उपकरणावर जतन करता आले नाही.';
      }
    },
  };
  let size = Number(storage.get('shivvedh-font', 19));
  if (!Number.isFinite(size)) size = 19;
  size = Math.max(16, Math.min(32, size));
  let saved = storage.get('shivvedh-position-v2', {}),
    chapter = Math.max(
      0,
      chapters.findIndex((c) => c.id === saved.chapter),
    ),
    page = 0,
    pages = 1,
    stride = 0,
    layingOut = false;
  let marks = storage.get('shivvedh-bookmarks-v1', []);
  if (!Array.isArray(marks)) marks = [];
  marks = marks.filter(m => m && chapters.some(c => c.id === m.chapter) && Number.isFinite(m.offset));
  let theme = storage.get('shivvedh-theme', 'parchment');
  document.body.dataset.theme = theme === 'night' ? 'night' : 'parchment';
  let catalog, claims, documents, bakhars, passages, policy;
  function rangeAt(offset) {
    for (const n of textNodes()) {
      if (offset < n.length) {
        const r = document.createRange();
        r.setStart(n, offset);
        r.setEnd(n, offset + 1);
        return r;
      }
      offset -= n.length;
    }
    return null;
  }
  function pageOf(offset) {
    const r = rangeAt(offset);
    return r
      ? Math.max(
          0,
          Math.floor(
            (r.getBoundingClientRect().left -
              leaf.getBoundingClientRect().left +
              1) /
              stride,
          ),
        )
      : 0;
  }
  function firstOffset() {
    let offset = 0;
    for (const n of textNodes()) {
      for (let i = 0; i < n.length; i++) {
        if (!n.textContent[i].trim()) continue;
        const r = document.createRange();
        r.setStart(n, i);
        r.setEnd(n, i + 1);
        const x =
          r.getBoundingClientRect().left - leaf.getBoundingClientRect().left;
        if (x >= page * stride - 1) return offset + i;
      }
      offset += n.length;
    }
    return 0;
  }
  function persist() {
    saved = { chapter: chapters[chapter].id, offset: firstOffset() };
    storage.set('shivvedh-position-v2', saved);
  }
  function paint(save = true) {
    leaf.style.transform = `translateX(${-page * stride}px)`;
    $('page-number').textContent =
      `विभाग ${chapter + 1} / ${chapters.length} · पृष्ठ ${page + 1} / ${pages}`;
    $('previous').disabled = chapter === 0 && page === 0;
    $('next').disabled = chapter === chapters.length - 1 && page === pages - 1;
    const total = chapters.reduce((n, c) => n + c.textContent.length, 0),
      before = chapters
        .slice(0, chapter)
        .reduce((n, c) => n + c.textContent.length, 0);
    const amount = Math.round(
      (100 *
        (before +
          ((page + 1) / pages) * chapters[chapter].textContent.length)) /
        total,
    );
    $('bar').style.width = amount + '%';
    $('reading-progress').value = amount;
    $('chapter-title').textContent =
      chapters[chapter].querySelector('h2')?.textContent || '';
    if (save) persist();
    const marked = marks.some(m => m.chapter === chapters[chapter].id && pageOf(m.offset) === page);
    $('bookmark').setAttribute('aria-pressed', String(marked));
    $('bookmark').textContent = marked ? 'खूण काढा' : 'खूण ठेवा';
    drawer.querySelectorAll('[data-target]').forEach((b) => {
      if (b.dataset.target === chapters[chapter].id)
        b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
  }
  function layout(
    offset = saved.chapter === chapters[chapter].id ? saved.offset : 0,
  ) {
    if (reader.hidden) return;
    layingOut = true;
    leaf.style.transform = 'none';
    page = 0;
    const viewport = $('page-viewport');
    stride = viewport.clientWidth + 48;
    leaf.style.columnWidth = viewport.clientWidth + 'px';
    leaf.style.width = viewport.clientWidth + 'px';
    leaf.style.height = Math.max(60, viewport.clientHeight - size * 1.5) + 'px';
    leaf.style.setProperty('--page-height', leaf.style.height);
    pages = Math.max(1, Math.round((leaf.scrollWidth + 48) / stride));
    page = Math.min(
      pages - 1,
      pageOf(Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : 0),
    );
    paint();
    layingOut = false;
  }
  function show(i, offset = 0) {
    chapter = i;
    leaf.replaceChildren(chapters[i].cloneNode(true));
    evidence();
    layout(offset);
  }
  function open() {
    cover.hidden = true;
    reader.hidden = false;
    show(chapter, saved.chapter === chapters[chapter].id ? saved.offset : 0);
  }
  function change(delta) {
    if (page + delta >= 0 && page + delta < pages) {
      page += delta;
      paint();
    } else if (chapter + delta >= 0 && chapter + delta < chapters.length) {
      show(chapter + delta);
      history.pushState(null, '', '#' + chapters[chapter].id);
      if (delta < 0) {
        page = pages - 1;
        paint();
      }
    }
  }
  function closeDrawer() {
    drawer.hidden = true;
    reader.inert = false;
    $('toc').setAttribute('aria-expanded', 'false');
    $('toc').focus();
  }
  function follow(initial = false) {
    let slug;
    try {
      slug = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const i = chapters.findIndex((c) => c.id === slug);
    if (!slug && !initial) { reader.hidden = true; cover.hidden = false; return; }
    if (i >= 0) {
      chapter = i;
      cover.hidden = true;
      reader.hidden = false;
      show(i, initial === true && saved.chapter === slug ? saved.offset : 0);
    }
  }
  function evidence() {
    const panel = $('citations');
    panel.replaceChildren();
    const add = (tag, value) => {
      const n = document.createElement(tag);
      n.textContent = value;
      panel.append(n);
      return n;
    };
    add('h2', 'अध्यायाचे संदर्भ व पुरावे');
    add(
      'p',
      'संपादकीय कथन. स्रोताचा उल्लेख म्हणजे तथ्याचे प्रमाणीकरण नाही. मतभेद, उत्तरकालीन परंपरा आणि पडताळणीची स्थिती स्वतंत्रपणे वाचा.',
    );
    if (!claims) {
      add('p', 'संदर्भ नोंदी लोड होत आहेत.');
      return;
    }
    const id = chapters[chapter].id,
      linked = claims.filter((c) => c.chapter === id),
      found = passages.comparisons.filter((p) => p.chapter === id);
    if (!linked.length && !found.length)
      add(
        'p',
        'या अध्यायाला तपशीलवार प्रमाणित संदर्भ अद्याप जोडलेले नाहीत. स्रोतपडताळणी बाकी.',
      );
    for (const c of linked) {
      add('h3', c.id + ' · ' + c.claim);
      add('p', policy.categories[policy.claims[c.id]]);
      add('p', c.review);
      for (const e of c.evidence) {
        const source = [...documents, ...bakhars].find((r) => r.id === e.id);
        add(
          'p',
          (source?.title || source?.name || e.id) +
            ' · ' +
            e.status +
            ' · ' +
            e.support,
        );
        const a = add('a', 'स्रोत नोंद उघडा');
        a.href =
          e.collection === 'documents'
            ? 'documents.html#' + e.id
            : 'bakhar.html#' +
              {
                'SV-B-01': 'sabhasad',
                'SV-B-02': 'chitnis',
                'SV-B-03': 'ninetyone',
              }[e.id];
      }
    }
    for (const p of found) {
      add('h3', p.title);
      add('p', policy.categories[policy.passages[p.id]]);
      add(
        'p',
        `${passages.edition.title} · ${passages.edition.editor}, ${passages.edition.year} · मुद्रित पृष्ठ ${p.editionPage}`,
      );
      add('p', p.sourceSection);
      add('p', p.attestedSummary);
      add('p', p.criticalNote);
      add('p', 'जतन केलेली पडताळणी नोंद: ' + p.status);
    }
  }
  $('open').onclick = () => { open(); history.pushState(null, '', '#' + chapters[chapter].id); };
  $('home').onclick = () => {
    reader.hidden = true;
    cover.hidden = false;
    history.pushState(null, '', location.pathname + location.search);
    $('open').focus();
  };
  $('preferences').onclick = () => $('settings-dialog').showModal();
  document.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => {
    document.body.dataset.theme = b.dataset.theme;
    storage.set('shivvedh-theme', b.dataset.theme);
    document.querySelectorAll('[data-theme]').forEach(t => t.setAttribute('aria-pressed', String(t === b)));
  });
  $('focus-mode').onclick = () => {
    const active = document.body.classList.toggle('quiet');
    $('focus-mode').setAttribute('aria-pressed', String(active));
    $('focus-mode').textContent = active ? 'नियंत्रणे दाखवा' : 'निवांत वाचन';
  };
  $('bookmark').onclick = () => {
    const matching = m => m.chapter === chapters[chapter].id && pageOf(m.offset) === page;
    if (marks.some(matching)) marks = marks.filter(m => !matching(m));
    else marks.push({chapter: chapters[chapter].id, offset: firstOffset(), title: $('chapter-title').textContent});
    storage.set('shivvedh-bookmarks-v1', marks); paint(false);
  };
  $('bookmarks').onclick = () => {
    const list = $('bookmark-list'); list.replaceChildren();
    if (!marks.length) list.textContent = 'अद्याप वाचनखुणा नाहीत. वाचताना “खूण ठेवा” निवडा.';
    for (const m of marks) {
      const b = document.createElement('button'); b.className = 'result'; b.textContent = m.title || m.chapter;
      b.onclick = () => { $('bookmarks-dialog').close(); show(chapters.findIndex(c => c.id === m.chapter), m.offset); history.pushState(null, '', '#' + m.chapter); };
      list.append(b);
    }
    $('bookmarks-dialog').showModal();
  };
  let searchRecords;
  const normalize = text => text.normalize('NFC').toLocaleLowerCase().replace(/[\u200c\u200d]/g, '');
  function search() {
    const q = normalize($('granth-query').value.trim());
    const results = $('granth-results'); results.replaceChildren();
    if (!searchRecords) return;
    const matches = q ? searchRecords.filter(r => normalize(r.title + ' ' + r.text).includes(q)) : [];
    $('search-status').textContent = q ? `${matches.length} नोंदी` : 'शोधण्यासाठी मराठी शब्द लिहा.';
    for (const r of matches) {
      const a = document.createElement('a'); a.className = 'result'; a.href = r.url;
      const title = document.createElement('strong'); title.textContent = r.title;
      const kind = document.createElement('small'); kind.textContent = (r.kind === 'chapter' ? 'ग्रंथातील कथन' : 'संदर्भ सामग्री') + ' · ' + (r.status || 'पडताळणी स्थिती स्रोत नोंदीत पहा');
      const excerpt = document.createElement('p'); const at = normalize(r.text).indexOf(q); excerpt.textContent = r.text.slice(Math.max(0, at - 45), Math.max(0, at - 45) + 180) + '…';
      a.append(kind, title, excerpt);
      if (r.kind === 'chapter') a.onclick = e => { e.preventDefault(); $('search-dialog').close(); const i = chapters.findIndex(c => c.id === r.id); if (i >= 0) { show(i); history.pushState(null, '', '#' + r.id); } };
      results.append(a);
    }
  }
  $('granth-query').oninput = search;
  $('reader-search').onclick = async () => {
    $('search-dialog').showModal(); $('granth-query').focus();
    if (!searchRecords) {
      $('search-status').textContent = 'शोध नोंदी लोड होत आहेत…';
      try { const r = await fetch('data/search-index.json'); if (!r.ok) throw Error(); searchRecords = (await r.json()).records; }
      catch { $('search-status').textContent = 'शोध उपलब्ध नाही. इंटरनेट किंवा ऑफलाइन जतन तपासा.'; return; }
    }
    search();
  };
  const splash = $('splash');
  let seen = false; try { seen = sessionStorage.getItem('shivvedh-welcome'); } catch {}
  if (!location.hash && !seen) {
    splash.showModal();
    const dismiss = () => { splash.close(); try { sessionStorage.setItem('shivvedh-welcome', '1'); } catch {} };
    $('skip-splash').onclick = dismiss;
    setTimeout(dismiss, matchMedia('(prefers-reduced-motion: reduce)').matches ? 400 : 1600);
  }
  $('previous').onclick = () => change(-1);
  $('next').onclick = () => change(1);
  function font(delta) {
    const offset = firstOffset();
    size = Math.max(16, Math.min(32, size + delta));
    document.documentElement.style.setProperty('--size', size + 'px');
    storage.set('shivvedh-font', size);
    layout(offset);
  }
  document.documentElement.style.setProperty('--size', size + 'px');
  $('larger').onclick = () => font(1);
  $('smaller').onclick = () => font(-1);
  $('toc').onclick = () => {
    drawer.hidden = false;
    reader.inert = true;
    $('toc').setAttribute('aria-expanded', 'true');
    $('close').focus();
  };
  $('close').onclick = closeDrawer;
  function bindContents() {
    drawer.querySelectorAll('[data-target]').forEach(
      (b) =>
        (b.onclick = () => {
          const i = chapters.findIndex((c) => c.id === b.dataset.target);
          if (i < 0) return;
          closeDrawer();
          show(i);
          history.pushState(null, '', '#' + chapters[i].id);
        }),
    );
  }
  bindContents();
  $('show-citations').onclick = () => {
    $('evidence-dialog').showModal();
  };
  $('close-citations').onclick = () => $('evidence-dialog').close();
  document.addEventListener('keydown', (e) => {
    if (!drawer.hidden) {
      if (e.key === 'Escape') closeDrawer();
      if (e.key === 'Tab') {
        const links = [...drawer.querySelectorAll('button,a')],
          first = links[0],
          last = links.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      return;
    }
    if (
      reader.hidden ||
      document.querySelector('dialog[open]') ||
      e.altKey ||
      e.ctrlKey ||
      e.metaKey ||
      /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)
    )
      return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      change(1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      change(-1);
    }
  });
  let resize;
  new ResizeObserver(() => {
    if (layingOut || reader.hidden) return;
    clearTimeout(resize);
    const offset = saved.offset;
    resize = setTimeout(() => layout(offset), 100);
  }).observe($('page-viewport'));
  document.querySelector('.skip-link').onclick = (e) => {
    e.preventDefault();
    if (reader.hidden) open();
    leaf.tabIndex = -1;
    leaf.focus();
  };
  window.addEventListener('hashchange', () => follow());
  document.fonts.ready.then(() => {
    if (!reader.hidden) layout(saved.offset);
  });
  follow(true);
  Promise.all(
    [
      'catalog',
      'claims',
      'documents',
      'bakhars',
      'bakhar-passages',
      'evidence-policy',
    ].map(async (name) => {
      const r = await fetch(`data/${name}.json`);
      if (!r.ok) throw Error(name);
      return r.json();
    }),
  )
    .then(([a, b, c, d, e, f]) => {
      catalog = a;
      const controls = document.createElement('div');
      let volume = '';
      for (const c of catalog.chapters) {
        if (c.volumeId !== volume) {
          volume = c.volumeId;
          const h = document.createElement('div');
          h.className = 'volume-heading';
          h.textContent = catalog.volumes.find((v) => v.id === volume).title;
          controls.append(h);
        }
        const b = document.createElement('button');
        b.dataset.target = c.id;
        b.textContent = c.title;
        controls.append(b);
      }
      drawer
        .querySelectorAll('[data-target],.volume-heading')
        .forEach((n) => n.remove());
      drawer.querySelector('h2').after(controls);
      bindContents();
      claims = b.claims;
      documents = c.documents;
      bakhars = d.records;
      passages = e;
      policy = f;
      evidence();
      if (!reader.hidden) paint(false);
    })
    .catch(() => {
      $('citations').textContent =
        'संदर्भ लोड झाले नाहीत. पुन्हा प्रयत्न करण्यासाठी पृष्ठ रीफ्रेश करा.';
    });
})();
