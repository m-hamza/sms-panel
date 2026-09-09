// Service Worker برای پنل پیامک IPPanel
// نسخه 2.0 - با پشتیبانی از Periodic Sync و Background Sync

const CACHE_NAME = 'ippanel-sms-v2';
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

// Periodic Background Sync
// این قابلیت به برنامه اجازه می‌دهد در فواصل زمانی مشخص داده‌ها را به‌روزرسانی کند
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-data') {
    console.log('[Periodic Sync] به‌روزرسانی داده‌ها');
    event.waitUntil(refreshData());
  }
});

// تابع به‌روزرسانی داده‌ها
async function refreshData() {
  try {
    // دریافت لیست کلاینت‌ها
    const clients = await self.clients.matchAll();
    
    // ارسال پیام به کلاینت‌ها برای به‌روزرسانی
    clients.forEach(client => {
      client.postMessage({
        type: 'refresh-data',
        timestamp: Date.now()
      });
    });

    console.log('[Periodic Sync] داده‌ها با موفقیت به‌روزرسانی شدند');
  } catch (error) {
    console.error('[Periodic Sync] خطا در به‌روزرسانی داده‌ها:', error);
  }
}

// Background Sync
// این قابلیت به برنامه اجازه می‌دهد کارها را به تعویق بیندازد تا زمانی که اتصال شبکه پایدار شود
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    console.log('[Background Sync] همگام‌سازی پیام‌ها');
    event.waitUntil(syncMessages());
  }
  
  if (event.tag === 'send-sms') {
    console.log('[Background Sync] ارسال پیامک‌های در صف');
    event.waitUntil(sendPendingMessages());
  }
});

// تابع همگام‌سازی پیام‌ها
async function syncMessages() {
  try {
    // دریافت پیام‌های ذخیره شده در IndexedDB
    const db = await openDatabase();
    const pendingMessages = await getPendingMessages(db);
    
    console.log(`[Background Sync] ${pendingMessages.length} پیام در صف`);
    
    // ارسال پیام‌ها به سرور
    for (const message of pendingMessages) {
      try {
        await sendMessageToServer(message);
        await markMessageAsSent(db, message.id);
      } catch (error) {
        console.error('[Background Sync] خطا در ارسال پیام:', error);
      }
    }
    
    db.close();
  } catch (error) {
    console.error('[Background Sync] خطا در همگام‌سازی:', error);
  }
}

// تابع ارسال پیام‌های در صف
async function sendPendingMessages() {
  try {
    const db = await openDatabase();
    const pendingMessages = await getPendingMessages(db);
    
    for (const message of pendingMessages) {
      try {
        const response = await fetch('/api/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': message.apiKey
          },
          body: JSON.stringify(message.data)
        });
        
        if (response.ok) {
          await markMessageAsSent(db, message.id);
        }
      } catch (error) {
        console.error('[Background Sync] خطا در ارسال:', error);
      }
    }
    
    db.close();
  } catch (error) {
    console.error('[Background Sync] خطا:', error);
  }
}

// توابع کمکی برای IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('IPPanelDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pendingMessages')) {
        db.createObjectStore('pendingMessages', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getPendingMessages(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingMessages'], 'readonly');
    const store = transaction.objectStore('pendingMessages');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function markMessageAsSent(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingMessages'], 'readwrite');
    const store = transaction.objectStore('pendingMessages');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function sendMessageToServer(message) {
  // پیاده‌سازی ارسال پیام به سرور
  const response = await fetch('/api/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': message.apiKey
    },
    body: JSON.stringify(message.data)
  });
  
  if (!response.ok) {
    throw new Error('خطا در ارسال پیام');
  }
  
  return response.json();
}

// Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'پیام جدید',
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'پنل پیامک IPPanel', options)
  );
});

// مدیریت کلیک روی نوتیفیکیشن
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // اگر پنجره‌ای باز است، روی آن تمرکز کن
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // اگر پنجره‌ای باز نیست، پنجره جدید باز کن
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// مدیریت پیام‌ها از سمت کلاینت
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'register-periodic-sync') {
    // ثبت Periodic Sync
    if ('periodicSync' in self.registration) {
      self.registration.periodicSync.register('refresh-data', {
        minInterval: 24 * 60 * 60 * 1000 // هر 24 ساعت
      }).then(() => {
        console.log('[Periodic Sync] ثبت شد');
      }).catch(error => {
        console.error('[Periodic Sync] خطا در ثبت:', error);
      });
    }
  }
  
  if (event.data && event.data.type === 'register-background-sync') {
    // ثبت Background Sync
    if ('sync' in self.registration) {
      self.registration.sync.register('sync-messages').then(() => {
        console.log('[Background Sync] ثبت شد');
      }).catch(error => {
        console.error('[Background Sync] خطا در ثبت:', error);
      });
    }
  }
});
