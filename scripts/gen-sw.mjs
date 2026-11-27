// Chạy sau `next build`: quét thư mục out/ và sinh out/sw.js với danh sách file cần cache sẵn.
// Dùng đường dẫn tương đối so với scope của service worker nên chạy được cả khi có basePath.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const OUT = 'out';

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(OUT)
  .map((p) => relative(OUT, p).split(sep).join('/'))
  .filter((f) => f !== 'sw.js')
  .sort();

// Phiên bản = băm nội dung mọi file => build mới thì cache cũ bị xoá
const hash = createHash('sha1');
for (const f of files) hash.update(f).update(readFileSync(join(OUT, f)));
const version = hash.digest('hex').slice(0, 10);

// "index.html" cũng được cache dưới dạng "./" để mở thẳng trang chủ khi offline
const urls = new Set(['./']);
for (const f of files) urls.add('./' + f);

const sw = `// File sinh tự động bởi scripts/gen-sw.mjs - đừng sửa tay
const CACHE = 'rubik-cfop-${version}';
const PRECACHE = ${JSON.stringify([...urls], null, 2)};

const scope = self.registration.scope;
const abs = (p) => new URL(p, scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map(abs)))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Cache-first: mọi thứ đã nằm sẵn trong cache nên mở app không cần mạng.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      return await fetch(req);
    } catch (err) {
      if (req.mode === 'navigate') {
        const home = await cache.match(abs('./'));
        if (home) return home;
      }
      throw err;
    }
  })());
});
`;

writeFileSync(join(OUT, 'sw.js'), sw);
console.log(`sw.js: ${urls.size} URL được cache, phiên bản ${version}`);
