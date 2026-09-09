# 📱 راهنمای PWA - پنل پیامک IPPanel

## ✅ ویژگی‌های PWA پیاده‌سازی شده

### 🎯 Web App Manifest
- **فایل**: `public/manifest.json`
- **نام برنامه**: پنل پیامک IPPanel
- **نام کوتاه**: IPPanel
- **آیکون**: SVG با گرادیانت بنفش-آبی
- **رنگ تم**: #6366f1 (ایندیگو)
- **رنگ پس‌زمینه**: #070b14 (تاریک)
- **نمایش**: standalone (حالت برنامه مستقل)
- **جهت**: portrait (عمودی)
- **زبان**: فارسی (fa)
- **جهت متن**: راست به چپ (rtl)

### 🔧 Service Worker
- **فایل**: `public/sw.js`
- **استراتژی کش**: Cache-First با به‌روزرسانی در پس‌زمینه
- **کش اولیه**: index.html, manifest.json, offline.html, icon.svg
- **مدیریت آفلاین**: نمایش صفحه offline.html هنگام عدم دسترسی به شبکه
- **به‌روزرسانی خودکار**: حذف کش‌های قدیمی و نصب نسخه جدید

### 📄 صفحه آفلاین
- **فایل**: `public/offline.html`
- **طراحی**: مدرن و مینیمال با گرادیانت بنفش
- **پیام**: اطلاع‌رسانی قطعی اتصال و دکمه تلاش مجدد
- **ریسپانسیو**: سازگار با تمام اندازه‌های صفحه

### 🎨 آیکون‌ها
- **فرمت**: SVG (مقیاس‌پذیر)
- **اندازه‌ها**: 72x72 تا 512x512
- **طراحی**: آیکون چت با سه نقطه و گرادیانت
- **هدف**: any maskable (سازگار با تمام پلتفرم‌ها)

### ⚡ Shortcuts (میانبرها)
1. **ارسال تکی**: دسترسی سریع به ارسال تکی
2. **گزارشات**: دسترسی سریع به گزارشات
3. **پروفایل**: دسترسی سریع به پروفایل

### 🏷️ Meta Tags
- `theme-color`: رنگ تم برنامه
- `description`: توضیحات برنامه
- `apple-mobile-web-app-capable`: پشتیبانی از iOS
- `apple-mobile-web-app-status-bar-style`: استایل نوار وضعیت iOS
- `apple-mobile-web-app-title`: نام برنامه در iOS

## 🚀 نحوه نصب و استفاده

### نصب روی دسکتاپ
1. باز کردن سایت در Chrome, Edge یا Firefox
2. کلیک روی آیکون نصب در نوار آدرس
3. تایید نصب

### نصب روی موبایل
#### Android (Chrome):
1. باز کردن سایت در Chrome
2. کلیک روی منوی سه نقطه
3. انتخاب "افزودن به صفحه اصلی"
4. تایید نصب

#### iOS (Safari):
1. باز کردن سایت در Safari
2. کلیک روی دکمه Share
3. انتخاب "Add to Home Screen"
4. تایید اضافه کردن

## 🔍 تست PWA

### ابزارهای تست
1. **Lighthouse** (Chrome DevTools):
   - باز کردن DevTools (F12)
   - رفتن به تب Lighthouse
   - انتخاب "Progressive Web App"
   - کلیک روی "Generate report"

2. **PWABuilder**:
   - ورود به https://www.pwabuilder.com/
   - وارد کردن URL سایت
   - بررسی گزارش و پیشنهادات

### معیارهای موفقیت
- ✅ Manifest معتبر
- ✅ Service Worker ثبت شده
- ✅ HTTPS (در production)
- ✅ آیکون‌های با کیفیت
- ✅ صفحه آفلاین
- ✅ عملکرد سریع

## 📊 ساختار فایل‌ها

```
public/
├── manifest.json          # تنظیمات PWA
├── sw.js                  # Service Worker
├── offline.html           # صفحه آفلاین
└── icons/
    └── icon.svg           # آیکون برنامه

index.html                 # صفحه اصلی با meta tags
```

## 🎯 ویژگی‌های آینده

### قابلیت‌های قابل اضافه کردن
- [ ] **Push Notifications**: ارسال اعلان‌ها
- [ ] **Background Sync**: همگام‌سازی در پس‌زمینه
- [ ] **File Handlers**: مدیریت فایل‌ها
- [ ] **Share Target**: دریافت محتوا از سایر برنامه‌ها
- [ ] **Protocol Handlers**: مدیریت پروتکل‌های سفارشی
- [ ] **Widgets**: ویجت‌های دسکتاپ
- [ ] **Tabbed Display**: نمایش تب‌دار
- [ ] **Window Controls Overlay**: کنترل‌های پنجره

### بهبودهای عملکردی
- [ ] **Image Optimization**: بهینه‌سازی تصاویر
- [ ] **Code Splitting**: تقسیم کد برای لود سریع‌تر
- [ ] **Lazy Loading**: بارگذاری تنبل کامپوننت‌ها
- [ ] **Caching Strategies**: استراتژی‌های کش پیشرفته
- [ ] **Offline Data**: ذخیره داده‌ها برای استفاده آفلاین

## 🛠️ توسعه و نگهداری

### به‌روزرسانی Service Worker
1. تغییر `CACHE_NAME` در `sw.js`
2. build مجدد پروژه
3. Service Worker قدیمی به‌طور خودکار حذف می‌شود

### به‌روزرسانی Manifest
1. ویرایش `public/manifest.json`
2. build مجدد پروژه
3. کاربران به‌طور خودکار نسخه جدید را دریافت می‌کنند

### تست لوکال
```bash
# شروع سرور توسعه
npm run dev

# build برای production
npm run build

# پیش‌نمایش build
npm run preview
```

## 📝 نکات مهم

### HTTPS
- Service Worker فقط در HTTPS کار می‌کند
- در development، localhost استثنا است
- در production، حتماً از HTTPS استفاده کنید

### کش
- Service Worker فایل‌ها را کش می‌کند
- برای به‌روزرسانی، `CACHE_NAME` را تغییر دهید
- کاربران به‌طور خودکار نسخه جدید را دریافت می‌کنند

### آیکون‌ها
- از SVG برای مقیاس‌پذیری استفاده شده
- آیکون باید حداقل 192x192 پیکسل باشد
- از فرمت‌های PNG و SVG پشتیبانی می‌شود

## 🔗 منابع مفید

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA](https://web.dev/progressive-web-apps/)
- [PWABuilder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox)

## 📞 پشتیبانی

برای سوالات و پشتیبانی:
- وب‌سایت: starteach.ir
- تلفن: 09394812277

---

**نسخه**: 1.0  
**آخرین به‌روزرسانی**: 2024  
**توسعه‌دهنده**: استارتیچ
