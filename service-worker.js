// sw-all-lao.js - Service Worker สำหรับแอปผลรางวัลลาวและรัฐบาล
const CACHE_NAME = 'all-lao-lottery-v2';
const DYNAMIC_CACHE = 'all-lao-lottery-dynamic-v2';

// ไฟล์ที่ต้อง cache
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest-all-lao.json',
  './192.png',
  './512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// ติดตั้ง Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// เปิดใช้งาน Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
          .map(key => {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// จัดการการ fetch
self.addEventListener('fetch', event => {
  // ข้ามการ cache สำหรับ chrome-extension และ blob
  if (event.request.url.startsWith('chrome-extension://') || 
      event.request.url.startsWith('blob:')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // ถ้ามีใน cache ให้ส่งคืน
        if (response) {
          return response;
        }

        // ถ้าไม่มีใน cache ให้ fetch จาก network
        return fetch(event.request).then(fetchResponse => {
          // ตรวจสอบว่า response ถูกต้องและเป็น GET request
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic' || 
              event.request.method !== 'GET') {
            return fetchResponse;
          }

          // Cache response ใหม่
          const responseToCache = fetchResponse.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return fetchResponse;
        });
      })
      .catch(() => {
        // Fallback สำหรับหน้า HTML
        if (event.request.destination === 'document' || 
            (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
          return caches.match('./index.html');
        }
      })
  );
});

// รับข้อความจาก main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});