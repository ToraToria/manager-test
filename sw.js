// sw.js - Service Worker
const CACHE_NAME = 'manager-test-v1.5';
const urlsToCache = [
  '/manager-test/',
  '/manager-test/index.html',
  '/manager-test/test.html',
  '/manager-test/results.html',
  '/manager-test/styles.css',
  '/manager-test/main.js',
  '/manager-test/user.js',
  '/manager-test/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
