// مدیریت Background Sync و Periodic Sync در سمت کلاینت

export class SyncManager {
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    if ('serviceWorker' in navigator) {
      this.registration = await navigator.serviceWorker.ready;
    }
  }

  // ثبت Background Sync برای همگام‌سازی پیام‌ها
  async registerBackgroundSync(tag: string = 'sync-messages') {
    if (!this.registration) {
      console.warn('[SyncManager] Service Worker آماده نیست');
      return false;
    }

    if (!('sync' in this.registration)) {
      console.warn('[SyncManager] Background Sync پشتیبانی نمی‌شود');
      return false;
    }

    try {
      await (this.registration as any).sync.register(tag);
      console.log(`[SyncManager] Background Sync با تگ "${tag}" ثبت شد`);
      return true;
    } catch (error) {
      console.error('[SyncManager] خطا در ثبت Background Sync:', error);
      return false;
    }
  }

  // ثبت Periodic Sync برای به‌روزرسانی دوره‌ای
  async registerPeriodicSync(tag: string = 'refresh-data', minInterval: number = 24 * 60 * 60 * 1000) {
    if (!this.registration) {
      console.warn('[SyncManager] Service Worker آماده نیست');
      return false;
    }

    if (!('periodicSync' in this.registration)) {
      console.warn('[SyncManager] Periodic Sync پشتیبانی نمی‌شود');
      return false;
    }

    try {
      // بررسی مجوز
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync' as PermissionName
      });

      if (status.state !== 'granted') {
        console.warn('[SyncManager] مجوز Periodic Background Sync داده نشده است');
        return false;
      }

      await (this.registration as any).periodicSync.register(tag, {
        minInterval: minInterval
      });

      console.log(`[SyncManager] Periodic Sync با تگ "${tag}" ثبت شد`);
      return true;
    } catch (error) {
      console.error('[SyncManager] خطا در ثبت Periodic Sync:', error);
      return false;
    }
  }

  // ارسال پیام به Service Worker
  sendMessage(message: any) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }

  // گوش دادن به پیام‌های Service Worker
  onMessage(callback: (event: MessageEvent) => void) {
    navigator.serviceWorker.addEventListener('message', callback);
  }
}

// مدیریت Push Notifications
export class NotificationManager {
  // درخواست مجوز نوتیفیکیشن
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[NotificationManager] نوتیفیکیشن پشتیبانی نمی‌شود');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // نمایش نوتیفیکیشن محلی
  static showLocal(title: string, options: NotificationOptions = {}): void {
    if (!('Notification' in window)) {
      console.warn('[NotificationManager] نوتیفیکیشن پشتیبانی نمی‌شود');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('[NotificationManager] مجوز نوتیفیکیشن داده نشده است');
      return;
    }

    const defaultOptions = {
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      vibrate: [100, 50, 100],
      ...options
    } as NotificationOptions;

    new Notification(title, defaultOptions);
  }

  // ارسال نوتیفیکیشن از طریق Service Worker
  static async sendViaServiceWorker(title: string, body: string, data: any = {}): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[NotificationManager] Service Worker پشتیبانی نمی‌شود');
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(title, {
      body,
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      data,
      actions: [
        { action: 'open', title: 'باز کردن' },
        { action: 'close', title: 'بستن' }
      ]
    } as any);
  }
}

// مدیریت ذخیره‌سازی آفلاین
export class OfflineStorage {
  private dbName = 'IPPanelDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('pendingMessages')) {
          db.createObjectStore('pendingMessages', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  async addPendingMessage(message: any): Promise<number> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingMessages'], 'readwrite');
      const store = transaction.objectStore('pendingMessages');
      const request = store.add(message);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as number);
    });
  }

  async getPendingMessages(): Promise<any[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingMessages'], 'readonly');
      const store = transaction.objectStore('pendingMessages');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async removePendingMessage(id: number): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingMessages'], 'readwrite');
      const store = transaction.objectStore('pendingMessages');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async cacheData(key: string, data: any): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put({ key, data, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };
    });
  }
}

// نمونه استفاده
export const syncManager = new SyncManager();
export const offlineStorage = new OfflineStorage();
