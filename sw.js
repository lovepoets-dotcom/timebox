const CACHE_NAME = 'timebox-v7'; // 디자인 수정 반영을 위한 v7 업데이트
const ASSETS = [
    './',
    './index.html',
    './style.css?v=2',
    './main.js?v=2',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    self.skipWaiting(); // 즉시 새로운 서비스 워커 활성화
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // 네트워크 우선 전략 (Network First)
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
