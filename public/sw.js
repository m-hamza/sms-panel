// Service Worker برای پنل پیامک IPPanel
// نسخه 1.0

const CACHE_NAME = 'ippanel-sms-v1';
const OFFLINE_URL = '/';

// لیست فایل‌هایی که باید کش شوند
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon.svg'
];

// نصب Service Worker و کش کردن فایل‌های اولیه
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] کش کردن فایل‌های اولیه');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// فعال‌سازی Service Worker و پاک کردن کش‌های قدیمی
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] حذف کش قدیمی:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// مدیریت درخواست‌های شبکه
self.addEventListener('fetch', (event) => {
  // فقط درخواست‌های GET را مدیریت کن
  if (event.request.method !== 'GET') return;

  // درخواست‌های API را کش نکن
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // اگر در کش موجود است، از کش برگردان
          // اما در پس‌زمینه سعی کن نسخه جدید را بگیری
          event.waitUntil(
            fetch(event.request)
              .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                  return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse);
                  });
                }
              })
              .catch(() => {
                // خطای شبکه را نادیده بگیر
              })
          );
          return cachedResponse;
        }

        // اگر در کش موجود نیست، از شبکه بگیر
        return fetch(event.request)
          .then((networkResponse) => {
            // اگر پاسخ معتبر است، آن را کش کن
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // اگر شبکه در دسترس نیست و در کش هم نیست
            // برای درخواست‌های navigation، صفحه آفلاین را برگردان
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            return new Response('آفلاین', { status: 503 });
          });
      })
  );
});

// مدیریت پیام‌ها از سمت کلاینت
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
