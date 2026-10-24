/* Chromium integration checks. Run from repo root: npm run test:browser */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
(async () => {
  const server = spawn(
    'python3',
    ['-m', 'http.server', '4173', '--bind', '127.0.0.1', '--directory', '..'],
    { stdio: 'ignore' },
  );
  let browser;
  try {
    for (let i = 0; i < 40; i++) {
      try {
        await fetch('http://127.0.0.1:4173');
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 100));
      }
    }
    browser = await chromium.launch({
      headless: true,
      args: JSON.parse(process.env.CHROMIUM_ARGS || '[]'),
      ...(process.env.CHROMIUM_PATH
        ? { executablePath: process.env.CHROMIUM_PATH }
        : {}),
    });
    const context = await browser.newContext({
      viewport: { width: 393, height: 852 },
      deviceScaleFactor: 1,
    });
    const p = await context.newPage(),
      errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    // Block remote fonts to verify there is no required third-party runtime dependency.
    await p.route('https://**/*', (r) => r.abort());
    const base =
      'http://127.0.0.1:4173/' +
      encodeURIComponent(require('node:path').basename(process.cwd())) +
      '/';
    await p.goto(base + 'index.html#opening');
    await p.waitForSelector('#content #opening');
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(250);
    async function geometry() {
      return p.evaluate(() => {
        const v = document
          .getElementById('page-viewport')
          .getBoundingClientRect();
        const f = document.getElementById('next').getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          viewport: v.height,
          footer: f.bottom,
          height: innerHeight,
          text: document.getElementById('content').textContent,
        };
      });
    }
    const initial = await geometry();
    assert(!initial.overflow);
    assert(initial.footer <= initial.height + 1);
    assert(initial.viewport > 200);
    const source = await p.evaluate(
      () => document.getElementById('content').textContent,
    );
    for (let i = 0; i < 3; i++) await p.click('#next');
    const saved = await p.evaluate(() =>
      JSON.parse(localStorage.getItem('shivvedh-position-v2')),
    );
    assert(saved.offset > 0);
    assert.equal(saved.chapter, 'opening');
    await p.reload();
    await p.waitForSelector('#content #opening');
    assert.equal(
      (
        await p.evaluate(() =>
          JSON.parse(localStorage.getItem('shivvedh-position-v2')),
        )
      ).chapter,
      'opening',
    );
    assert.equal(await p.locator('#content').textContent(), source);
    for (let i = 0; i < 5; i++) await p.click('#larger');
    let after = await p.evaluate(() =>
      JSON.parse(localStorage.getItem('shivvedh-position-v2')),
    );
    assert.equal(after.chapter, saved.chapter);
    assert(after.offset <= saved.offset + 300);
    assert(after.offset >= saved.offset - 1500);
    for (const size of [
      { width: 320, height: 640 },
      { width: 852, height: 393 },
      { width: 1280, height: 800 },
    ]) {
      await p.setViewportSize(size);
      await p.waitForTimeout(200);
      const g = await geometry();
      assert(!g.overflow, JSON.stringify(g));
      assert(g.footer <= g.height + 1, JSON.stringify(g));
    }
    await p.click('#toc');
    assert.equal(await p.locator('#reader').getAttribute('inert'), '');
    await p.click('[data-target="afzal"]');
    await p.click('#show-citations');
    await p.waitForSelector('#citations h3');
    assert(
      (await p.locator('#citations').textContent()).includes(
        'मुद्रित पृष्ठ 11',
      ),
    );
    await p.click('#close-citations');
    await p.goto(base + 'search.html');
    await p.waitForSelector('#results .card');
    await p.fill('#query', 'कान्होजी');
    await p.selectOption('#kind', 'letter');
    assert((await p.locator('#results .card').count()) > 0);
    await p.fill('#query', 'zzzzzzzzz');
    assert.equal(await p.locator('#results .card').count(), 0);
    await p.goto(base + 'offline.html');
    await p.waitForFunction(() =>
      document.getElementById('status').textContent.includes('सर्व फाइल्स जतन'),
    );
    await p.goto(base + 'index.html');
    await p.evaluate(async () => {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller)
        await new Promise((r) =>
          navigator.serviceWorker.addEventListener('controllerchange', r, {
            once: true,
          }),
        );
    });
    await context.setOffline(true);
    for (const path of [
      'index.html#birth',
      'search.html',
      'letters.html',
      'documents.html',
      'evidence.html',
      'bakhar-passages.html',
      'volume-one.html',
    ]) {
      const response = await p.goto(base + path);
      if (response) assert.equal(response.status(), 200, path);
    }
    await p.goto(base + 'search.html');
    await p.waitForSelector('#results .card');
    await p.fill('#query', 'प्रतापगड');
    assert((await p.locator('#results .card').count()) > 0);
    await p.goto(base + 'index.html#birth');
    await p.waitForSelector('#content #birth');
    await p.setViewportSize({ width: 393, height: 852 });
    await p.waitForTimeout(250);
    fs.mkdirSync('test-results', { recursive: true });
    await p.screenshot({
      path: 'test-results/android-reader.png',
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    await context.setOffline(false);
    // Every shaped text fragment must fit vertically and land on a counted column.
    for (const viewport of [
      { width: 320, height: 640 },
      { width: 852, height: 393 },
    ]) {
      await p.setViewportSize(viewport);
      for (const slug of ['mudra', 'portrait', 'opening', 'south']) {
        await p.goto(base + 'index.html#' + slug);
        await p.waitForTimeout(200);
        const clipped = await p.evaluate(() => {
          const leaf = document.getElementById('content'),
            v = document
              .getElementById('page-viewport')
              .getBoundingClientRect(),
            w = document.createTreeWalker(leaf, NodeFilter.SHOW_TEXT),
            bad = [];
          while (w.nextNode()) {
            if (!w.currentNode.textContent.trim()) continue;
            const r = document.createRange();
            r.selectNodeContents(w.currentNode);
            for (const b of r.getClientRects())
              if (b.height && (b.top < v.top - 8 || b.bottom > v.bottom + 8))
                bad.push({
                  text: w.currentNode.textContent.slice(0, 25),
                  top: b.top - v.top,
                  bottom: b.bottom - v.bottom,
                });
          }
          return bad;
        });
        assert.deepEqual(clipped, [], slug + ' at ' + viewport.width);
      }
    }
    console.log(
      'BROWSER PASS: pagination, preserved text, saved positions, font/viewport reflow, evidence, drawer, search and complete offline navigation',
    );
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
})();
