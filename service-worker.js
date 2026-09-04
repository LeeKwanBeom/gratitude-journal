const CACHE_NAME = 'gratitude-journal-v1';

// 오프라인일 때만 보여줄 최소한의 폴백 캐시
const FALLBACK_URLS = [
  './',
  './index.html',
  './entries.json',
  './manifest.json',
  './favicon.svg',
  './favicon-32.png',
  './favicon-192.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FALLBACK_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// network-first: 항상 네트워크에서 최신 데이터를 먼저 시도하고,
// 실패(오프라인)할 때만 마지막으로 캐시해둔 화면을 보여줌
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const cloned = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
