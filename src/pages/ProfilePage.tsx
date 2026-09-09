import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  User, Phone, LogOut, Plus, Trash2,
  Edit3, Check, X, Shield, ChevronDown,
  Wallet, Radio, Activity, Headphones,
  Globe, Moon, Sun, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Badge } from '../components/ui';
import { toPersianNumber } from '../utils/date';
import BottomNav from '../components/BottomNav';

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    userInfo, credit, numbers, accounts, currentAccountId,
    logout, switchAccount, removeAccount, renameAccount
  } = useAuthStore();

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showNumbers, setShowNumbers] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameAccount(id, editName.trim());
      setEditingId(null);
      toast.success('نام حساب تغییر کرد');
    }
  };

  const handleRemoveAccount = (id: string) => {
    if (accounts.length <= 1) {
      toast.error('حداقل یک حساب باید وجود داشته باشد');
      return;
    }
    removeAccount(id);
    toast.success('حساب حذف شد');
  };

  const handleSwitchAccount = async (id: string) => {
    if (id === currentAccountId) return;
    await switchAccount(id);
    toast.success('حساب تغییر کرد');
  };

  const handleLogout = () => {
    logout();
    toast.success('خروج موفق');
  };

  const handleAddAccount = () => {
    // Navigate to login page with addAccount mode
    navigate('/login?mode=addAccount');
  };

  return (
    <div className="px-4 pt-6 pb-28 space-y-5">
      <header className="animate-fade-in">
        <h1 className="text-xl font-bold text-text tracking-tight">پروفایل</h1>
        <p className="text-xs text-text-dim mt-0.5">مدیریت حساب و تنظیمات</p>
      </header>

      {/* Account Management */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-medium text-text">مدیریت حساب‌ها</h3>
          <Badge variant="neutral">{toPersianNumber(accounts.length)}</Badge>
        </div>

        <div className="space-y-2">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`bg-surface-2 border rounded-xl p-3 flex items-center justify-between transition-all ${
                account.id === currentAccountId ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-border'
              }`}
            >
              {editingId === account.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-surface border border-border-strong rounded-lg px-2 py-1 text-sm text-text focus:outline-none focus:border-accent"
                    autoFocus
                  />
                  <button onClick={() => handleRename(account.id)} className="text-emerald-400 hover:bg-emerald-500/10 p-1.5 rounded-lg transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-text-dim hover:bg-surface p-1.5 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${account.id === currentAccountId ? 'bg-indigo-400' : 'bg-text-dim'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-text">{account.name}</p>
                      <p className="text-[11px] text-text-dim font-mono mt-0.5" dir="ltr">
                        {account.apiKey.substring(0, 12)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {account.id !== currentAccountId && (
                      <button
                        onClick={() => handleSwitchAccount(account.id)}
                        className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        title="تغییر حساب"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => { setEditingId(account.id); setEditName(account.name); }}
                      className="p-1.5 text-text-dim hover:bg-surface rounded-lg transition-colors"
                      title="تغییر نام"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveAccount(account.id)}
                      className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      title="حذف حساب"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add Account Button */}
          <button
            onClick={handleAddAccount}
            className="w-full bg-surface-2 border border-dashed border-border-strong rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-text-dim hover:text-text hover:border-accent/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            افزودن حساب جدید
          </button>
        </div>
      </Card>

      {/* User Info */}
      <Card className="relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
        
        <div className="relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <User className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-text">{userInfo?.name || 'کاربر'}</h2>
              <p className="text-xs text-text-dim mt-0.5">{userInfo?.user_name}</p>
              {userInfo?.is_reseller && (
                <Badge variant="info">
                  <Shield className="w-3 h-3" />
                  نماینده
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Credit */}
      {credit && credit.credit && Number(credit.credit) > 0 && (
        <Card className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-medium text-text">اعتبار</h3>
          </div>
          <p className="text-lg font-bold text-emerald-400">
            {toPersianNumber(Number(credit.credit).toFixed(0))} ریال
          </p>
        </Card>
      )}

      {/* Numbers */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <button
          onClick={() => setShowNumbers(!showNumbers)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Radio className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-medium text-text">خطوط من</h3>
            <Badge variant="neutral">{toPersianNumber(numbers.length)}</Badge>
          </div>
          <ChevronDown className={`w-4 h-4 text-text-dim transition-transform ${showNumbers ? 'rotate-180' : ''}`} />
        </button>

        {showNumbers && (
          <div className="mt-4 space-y-2 animate-fade-in">
            {numbers.map((num: any) => (
              <div key={num.id} className="bg-surface-2 border border-border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text font-mono" dir="ltr">{num.number}</p>
                  {num.alias && <p className="text-[11px] text-text-dim mt-0.5">{num.alias}</p>}
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              </div>
            ))}
            {numbers.length === 0 && (
              <p className="text-center text-xs text-text-dim py-4">خطی ثبت نشده</p>
            )}
          </div>
        )}
      </Card>

      {/* Theme Toggle */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-indigo-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
            <span className="text-sm font-medium text-text">
              {theme === 'dark' ? 'حالت تاریک' : 'حالت روشن'}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="relative w-12 h-6 rounded-full bg-surface-2 border border-border transition-colors"
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
              theme === 'dark' 
                ? 'right-0.5 bg-indigo-500' 
                : 'left-0.5 bg-amber-400'
            }`}></div>
          </button>
        </div>
      </Card>

      {/* Support */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-2 mb-3">
          <Headphones className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-medium text-text">پشتیبانی</h3>
        </div>

        <div className="space-y-3">
          <div className="bg-surface-2 border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-text">اطلاعات سایت</span>
            </div>
            <p className="text-xs text-text-dim leading-relaxed">
              این پنل پیامکی بر پایه وب‌سرویس IPPanel Edge API طراحی و پیاده‌سازی شده است.
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-accent/20 rounded-xl p-3">
            <p className="text-xs text-text-dim leading-relaxed mb-3">
              پشتیبانی این پنل توسط <span className="text-text font-medium">استارتیچ</span> ارائه می‌شود.
            </p>
            <a
              href="https://starteach.ir"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-surface-2 border border-border rounded-lg p-2.5 hover:border-accent/30 transition-colors group mb-2"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs font-medium text-text">وب‌سایت استارتیچ</p>
                  <p className="text-[11px] text-text-dim">starteach.ir</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-text-dim group-hover:text-accent transition-colors" />
            </a>
            <a
              href="tel:09394812277"
              className="flex items-center justify-between bg-surface-2 border border-border rounded-lg p-2.5 hover:border-accent/30 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-xs font-medium text-text">تماس با پشتیبانی</p>
                  <p className="text-[11px] text-text-dim">پاسخگویی ۹ صبح تا ۹ شب</p>
                </div>
              </div>
              <span className="text-sm font-mono text-accent group-hover:text-accent/80 transition-colors" dir="ltr">
                ۰۹۳۹۴۸۱۲۲۷۷
              </span>
            </a>
          </div>
        </div>
      </Card>

      {/* Logout */}
      <div className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <Button
          variant="danger"
          size="lg"
          onClick={handleLogout}
          icon={<LogOut className="w-4 h-4" />}
          className="w-full"
        >
          خروج از حساب
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}
