// sw.js - Service Worker
const CACHE_NAME = 'manager-test-v3.0';
const urlsToCache = [
  './',
  './index.html',
  './test.html',
  './results.html',
  './styles.css?v=7',
  './main.js?v=5',
  './user.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker активирован');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  // Пропускаем запросы к Firebase
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('gstatic')) {
    return fetch(event.request);
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем кешированную версию, если есть
        if (response) {
          return response;
        }
        
        // Иначе загружаем с сети
        return fetch(event.request)
          .then(response => {
            // Проверяем валидный ответ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Клонируем ответ
            const responseToCache = response.clone();
            
            // Кешируем для будущего использования
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Если офлайн и нет в кеше, можно показать кастомную страницу
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
          });
      })
  );
});
