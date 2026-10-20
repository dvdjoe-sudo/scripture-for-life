/* Scripture for Life offline support for the WEB build.
   Capacitor Android carries its web assets inside the application. */
const VERSION = 'scripture-for-life-shell-v18-psalm9-connections';
const CORE = [
  './', './index.html', './app.js', './styles.css', './genesis.js', './exodus.js', './exodus-people.js', './data/exodus-episodes.json', './data/exodus-scenes.json',
  './genesis.css', './psalm-walk.js', './psalm-walk.css', './psalm46.js', './data.js', './content.js', './icon.svg',
  './assets/psalm23/verse-1-watercolor.webp', './assets/psalm23/verse-2-watercolor.webp',
  './assets/psalm23/verse-3-watercolor.webp', './assets/psalm23/verse-4-watercolor.webp',
  './assets/psalm23/verse-5-watercolor.webp', './assets/psalm23/verse-6-watercolor.webp',
  './psalm-verse-study.js', './psalm-verse-study.css', './psalm1.js', './psalms-2-3.js',
  './psalm4.js', './psalm5.js', './psalm6.js', './psalms-7-8.js', './psalm9.js', './topic-connections.js',
  './assets/psalm9/verse-1-watercolor.webp',
  './assets/psalm9/verse-2-watercolor.webp',
  './assets/psalm9/verse-3-watercolor.webp',
  './assets/psalm9/verse-4-watercolor.webp',
  './assets/psalm9/verse-5-watercolor.webp',
  './assets/psalm9/verse-6-watercolor.webp',
  './assets/psalm9/verse-7-watercolor.webp',
  './assets/psalm9/verse-8-watercolor.webp',
  './assets/psalm9/verse-9-watercolor.webp',
  './assets/psalm9/verse-10-watercolor.webp',
  './assets/psalm9/verse-11-watercolor.webp',
  './assets/psalm9/verse-12-watercolor.webp',
  './assets/psalm9/verse-13-watercolor.webp',
  './assets/psalm9/verse-14-watercolor.webp',
  './assets/psalm9/verse-15-watercolor.webp',
  './assets/psalm9/verse-16-watercolor.webp',
  './assets/psalm9/verse-17-watercolor.webp',
  './assets/psalm9/verse-18-watercolor.webp',
  './assets/psalm9/verse-19-watercolor.webp',
  './assets/psalm9/verse-20-watercolor.webp',
  './assets/psalm7/verse-1-watercolor.webp',
  './assets/psalm7/verse-2-watercolor.webp',
  './assets/psalm7/verse-3-watercolor.webp',
  './assets/psalm7/verse-4-watercolor.webp',
  './assets/psalm7/verse-5-watercolor.webp',
  './assets/psalm7/verse-6-watercolor.webp',
  './assets/psalm7/verse-7-watercolor.webp',
  './assets/psalm7/verse-8-watercolor.webp',
  './assets/psalm7/verse-9-watercolor.webp',
  './assets/psalm7/verse-10-watercolor.webp',
  './assets/psalm7/verse-11-watercolor.webp',
  './assets/psalm7/verse-12-watercolor.webp',
  './assets/psalm7/verse-13-watercolor.webp',
  './assets/psalm7/verse-14-watercolor.webp',
  './assets/psalm7/verse-15-watercolor.webp',
  './assets/psalm7/verse-16-watercolor.webp',
  './assets/psalm7/verse-17-watercolor.webp',
  './assets/psalm8/verse-1-watercolor.webp',
  './assets/psalm8/verse-2-watercolor.webp',
  './assets/psalm8/verse-3-watercolor.webp',
  './assets/psalm8/verse-4-watercolor.webp',
  './assets/psalm8/verse-5-watercolor.webp',
  './assets/psalm8/verse-6-watercolor.webp',
  './assets/psalm8/verse-7-watercolor.webp',
  './assets/psalm8/verse-8-watercolor.webp',
  './assets/psalm8/verse-9-watercolor.webp',
  './assets/psalm6/verse-1-watercolor.webp',
  './assets/psalm6/verse-2-watercolor.webp',
  './assets/psalm6/verse-3-watercolor.webp',
  './assets/psalm6/verse-4-watercolor.webp',
  './assets/psalm6/verse-5-watercolor.webp',
  './assets/psalm6/verse-6-watercolor.webp',
  './assets/psalm6/verse-7-watercolor.webp',
  './assets/psalm6/verse-8-watercolor.webp',
  './assets/psalm6/verse-9-watercolor.webp',
  './assets/psalm6/verse-10-watercolor.webp',
  './assets/psalm5/verse-1-watercolor.webp',
  './assets/psalm5/verse-2-watercolor.webp',
  './assets/psalm5/verse-3-watercolor.webp',
  './assets/psalm5/verse-4-watercolor.webp',
  './assets/psalm5/verse-5-watercolor.webp',
  './assets/psalm5/verse-6-watercolor.webp',
  './assets/psalm5/verse-7-watercolor.webp',
  './assets/psalm5/verse-8-watercolor.webp',
  './assets/psalm5/verse-9-watercolor.webp',
  './assets/psalm5/verse-10-watercolor.webp',
  './assets/psalm5/verse-11-watercolor.webp',
  './assets/psalm5/verse-12-watercolor.webp',
  './assets/psalm4/verse-1-watercolor.webp',
  './assets/psalm4/verse-2-watercolor.webp',
  './assets/psalm4/verse-3-watercolor.webp',
  './assets/psalm4/verse-4-watercolor.webp',
  './assets/psalm4/verse-5-watercolor.webp',
  './assets/psalm4/verse-6-watercolor.webp',
  './assets/psalm4/verse-7-watercolor.webp',
  './assets/psalm4/verse-8-watercolor.webp',
  './assets/psalm2/verse-1-watercolor.webp',
  './assets/psalm2/verse-2-watercolor.webp',
  './assets/psalm2/verse-3-watercolor.webp',
  './assets/psalm2/verse-4-watercolor.webp',
  './assets/psalm2/verse-5-watercolor.webp',
  './assets/psalm2/verse-6-watercolor.webp',
  './assets/psalm2/verse-7-watercolor.webp',
  './assets/psalm2/verse-8-watercolor.webp',
  './assets/psalm2/verse-9-watercolor.webp',
  './assets/psalm2/verse-10-watercolor.webp',
  './assets/psalm2/verse-11-watercolor.webp',
  './assets/psalm2/verse-12-watercolor.webp',
  './assets/psalm3/verse-1-watercolor.webp',
  './assets/psalm3/verse-2-watercolor.webp',
  './assets/psalm3/verse-3-watercolor.webp',
  './assets/psalm3/verse-4-watercolor.webp',
  './assets/psalm3/verse-5-watercolor.webp',
  './assets/psalm3/verse-6-watercolor.webp',
  './assets/psalm3/verse-7-watercolor.webp',
  './assets/psalm3/verse-8-watercolor.webp',
  './assets/psalm1/verse-1-watercolor.webp',
  './assets/psalm1/verse-2-watercolor.webp',
  './assets/psalm1/verse-3-watercolor.webp',
  './assets/psalm1/verse-4-watercolor.webp',
  './assets/psalm1/verse-5-watercolor.webp',
  './assets/psalm1/verse-6-watercolor.webp',
  './psalms-content.js', './psalms-book.js', './psalms-book.css',
  './assets/psalms/tree-watercolor.webp',
  './assets/psalms/night-watercolor.webp',
  './assets/psalms/music-watercolor.webp',
  './assets/psalms/prayer-watercolor.webp',
  './assets/psalms/deer-watercolor.webp',
  './assets/psalms/word-watercolor.webp',
  './assets/psalms/renewal-watercolor.webp',
  './assets/psalms/wilderness-watercolor.webp',
  './assets/psalms/harvest-watercolor.webp',
  './assets/psalms/exile-watercolor.webp',
  './assets/psalms/wings-watercolor.webp',
  './assets/psalms/praise-watercolor.webp',
  './assets/psalm46/section-1-watercolor.webp',
  './assets/psalm46/section-2-watercolor.webp',
  './assets/psalm46/section-3-watercolor.webp',
  './assets/psalm46/section-4-watercolor.webp',
  './assets/psalm46/section-5-watercolor.webp',
  './assets/psalm46/section-6-watercolor.webp',
  './psalm-art.js', './psalm-art.css', './psalm-navigation.js',
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
