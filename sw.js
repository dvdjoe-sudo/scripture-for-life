/* Scripture for Life offline support for the WEB build.
   Capacitor Android carries its web assets inside the application. */
const VERSION = 'scripture-for-life-shell-v7';
const CORE = [
  './', './index.html', './app.js', './styles.css', './genesis.js',
  './genesis.css', './psalm-walk.js', './psalm-walk.css', './psalm46.js', './data.js', './content.js', './icon.svg',
  './manifest.webmanifest', './data/bible.json',
  './data/episodes.json', './data/story-scenes.json'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('scripture-for-life-') && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Online first prevents a stale cached homepage from hiding new Genesis updates.
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(VERSION).then(cache => cache.put(request, copy)));
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const page = await caches.match(new URL('./index.html', self.registration.scope));
        if (page) return page;
      }
      return Response.error();
    }
  })());
});
