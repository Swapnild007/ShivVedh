const vm = require('node:vm'),
  fs = require('node:fs'),
  assert = require('node:assert/strict');
(async () => {
  const handlers = {},
    deleted = [],
    scope = 'https://example.test/ShivVedh/';
  let fail = false,
    keys = [];
  const cache = {
    async addAll(urls) {
      keys = urls;
      if (fail) throw Error('quota or missing file');
    },
    async match() {
      return null;
    },
  };
  const self = {
    registration: { scope },
    location: new URL(scope),
    clients: { async claim() {} },
    addEventListener: (name, handler) => (handlers[name] = handler),
  };
  const caches = {
    async open() {
      return cache;
    },
    async delete(key) {
      deleted.push(key);
    },
    async keys() {
      return [
        'unrelated-app',
        'shivvedh-shell-old',
        'shivvedh-user-download-v1',
      ];
    },
  };
  vm.runInNewContext(fs.readFileSync('sw.js', 'utf8'), {
    self,
    caches,
    URL,
    Response,
    fetch: async () => new Response('network'),
  });
  let pending;
  handlers.install({ waitUntil: (p) => (pending = p) });
  await pending;
  assert(keys.length >= 25);
  assert(keys.every((k) => k.startsWith(scope)));
  fail = true;
  handlers.install({ waitUntil: (p) => (pending = p) });
  await assert.rejects(pending, /quota/);
  assert(
    deleted.some((k) => k.endsWith('-v3')),
    'failed installation must discard partial release',
  );
  await handlers.activate({ waitUntil: (p) => (pending = p) });
  await pending;
  assert(deleted.includes('shivvedh-shell-old'));
  assert(!deleted.includes('unrelated-app'));
  for (const request of [
    new Request('https://other.test/x'),
    new Request('https://example.test/other/'),
    new Request(scope, { method: 'POST' }),
  ])
    handlers.fetch({
      request,
      respondWith: () => assert.fail('must not intercept unrelated requests'),
    });
  console.log(
    'SERVICE WORKER PASS: subpath scope, failed install, old-cache cleanup and request isolation',
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
// Parse every app and inline script as part of release validation.
for (const path of fs.readdirSync('app').filter((p) => p.endsWith('.js')))
  new vm.Script(fs.readFileSync('app/' + path, 'utf8'), { filename: path });
for (const path of fs.readdirSync('.').filter((p) => p.endsWith('.html')))
  for (const match of fs
    .readFileSync(path, 'utf8')
    .matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))
    new vm.Script(match[1], { filename: path });
