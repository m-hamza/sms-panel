import { useState, useEffect } from 'react';
import { User, Phone, LogOut, Plus, Trash2, Edit3, Check, X, Shield, ChevronDown, Wallet, Radio, Activity, Headphones, Globe, Moon, Sun, ExternalLink } from 'lucide-react';
import { toPersianNumber } from '../utils/format';
import BottomNav from '../components/BottomNav';

interface ProfilePageProps {
  userInfo: any;
  credit: any;
  numbers: any[];
  accounts: any[];
  currentAccountId: string | null;
  logout: () => void;
  switchAccount: (id: string) => void;
  addAccount: (name: string, apiKey: string) => Promise<boolean>;
  removeAccount: (id: string) => void;
  renameAccount: (id: string, name: string) => void;
}

export default function ProfilePage({ userInfo, credit, numbers, accounts, currentAccountId, logout, switchAccount, addAccount, removeAccount, renameAccount }: ProfilePageProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as any) || 'dark');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newName, setNewName] = useState('');
  const [newKey, setNewKey] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showNumbers, setShowNumbers] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleAdd = async () => {
    if (!newName.trim() || !newKey.trim()) return;
    setIsAdding(true);
    await addAccount(newName.trim(), newKey.trim());
    setShowAddAccount(false);
    setNewName('');
    setNewKey('');
    setIsAdding(false);
  };

  return (
    <div className="px-4 pt-6 pb-28 space-y-5">
      <header className="animate-fade-in">
        <h1 className="text-xl font-bold text-text">پروفایل</h1>
        <p className="text-xs text-text-dim mt-0.5">مدیریت حساب و تنظیمات</p>
      </header>

      <div className="card p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-medium text-text">مدیریت حساب‌ها</h3>
          <span className="badge badge-neutral">{toPersianNumber(accounts.length)}</span>
        </div>
        <div className="space-y-2">
          {accounts.map((account: any) => (
            <div key={account.id} className={`bg-surface-2 border rounded-xl p-3 flex items-center justify-between ${account.id === currentAccountId ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-border'}`}>
              {editingId === account.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 bg-surface border border-border-strong rounded-lg px-2 py-1 text-sm text-text focus:outline-none" autoFocus />
                  <button onClick={() => { renameAccount(account.id, editName); setEditingId(null); }} className="text-emerald-400 p-1.5"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingId(null)} className="text-text-dim p-1.5"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${account.id === currentAccountId ? 'bg-indigo-400' : 'bg-text-dim'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-text">{account.name}</p>
                      <p className="text-[11px] text-text-dim font-mono mt-0.5" dir="ltr">{account.apiKey.substring(0, 12)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {account.id !== currentAccountId && <button onClick={() => switchAccount(account.id)} className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg"><Check className="w-4 h-4" /></button>}
                    <button onClick={() => { setEditingId(account.id); setEditName(account.name); }} className="p-1.5 text-text-dim hover:bg-surface rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => removeAccount(account.id)} className="p-1.5 text-danger hover:bg-danger/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
          {showAddAccount ? (
            <div className="bg-surface-2 border border-border rounded-xl p-3 space-y-3">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="نام حساب" className="input text-sm" />
              <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="کلید API" className="input text-sm font-mono" dir="ltr" />
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={isAdding} className="btn btn-primary flex-1" style={{ padding: '8px' }}>{isAdding ? '...' : 'افزودن'}</button>
                <button onClick={() => setShowAddAccount(false)} className="btn btn-ghost flex-1" style={{ padding: '8px' }}>انصراف</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddAccount(true)} className="w-full bg-surface-2 border border-dashed border-border-strong rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-text-dim hover:text-text">
              <Plus className="w-4 h-4" /> افزودن حساب جدید
            </button>
          )}
        </div>
      </div>

      <div className="card p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <User className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-text">{userInfo?.name || 'کاربر'}</h2>
            <p className="text-xs text-text-dim mt-0.5">{userInfo?.user_name}</p>
          </div>
        </div>
      </div>

      {credit?.credit && Number(credit.credit) > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-medium text-text">اعتبار</h3>
          </div>
          <p className="text-lg font-bold text-emerald-400">{toPersianNumber(Number(credit.credit).toFixed(0))} ریال</p>
        </div>
      )}

      <div className="card p-4">
        <button onClick={() => setShowNumbers(!showNumbers)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Radio className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-medium text-text">خطوط من</h3>
            <span className="badge badge-neutral">{toPersianNumber(numbers.length)}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-text-dim transition-transform ${showNumbers ? 'rotate-180' : ''}`} />
        </button>
        {showNumbers && (
          <div className="mt-4 space-y-2">
            {numbers.map((num: any) => (
              <div key={num.id} className="bg-surface-2 border border-border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text font-mono" dir="ltr">{num.number}</p>
                  {num.alias && <p className="text-[11px] text-text-dim mt-0.5">{num.alias}</p>}
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
            <span className="text-sm font-medium text-text">{theme === 'dark' ? 'حالت تاریک' : 'حالت روشن'}</span>
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="relative w-12 h-6 rounded-full bg-surface-2 border border-border">
            <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${theme === 'dark' ? 'right-0.5 bg-indigo-500' : 'left-0.5 bg-amber-400'}`}></div>
          </button>
        </div>
      </div>

      <div className="card p-4">
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
            <p className="text-xs text-text-dim leading-relaxed">این پنل پیامکی بر پایه وب‌سرویس IPPanel Edge API طراحی و پیاده‌سازی شده است.</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-accent/20 rounded-xl p-3">
            <p className="text-xs text-text-dim leading-relaxed mb-3">پشتیبانی این پنل توسط <span className="text-text font-medium">استارتیچ</span> ارائه می‌شود.</p>
            <a href="https://starteach.ir" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-surface-2 border border-border rounded-lg p-2.5 hover:border-accent/30 mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs font-medium text-text">وب‌سایت استارتیچ</p>
                  <p className="text-[11px] text-text-dim">starteach.ir</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-text-dim" />
            </a>
            <a href="tel:09394812277" className="flex items-center justify-between bg-surface-2 border border-border rounded-lg p-2.5 hover:border-accent/30">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-xs font-medium text-text">تماس با پشتیبانی</p>
                  <p className="text-[11px] text-text-dim">پاسخگویی ۹ صبح تا ۹ شب</p>
                </div>
              </div>
              <span className="text-sm font-mono text-accent" dir="ltr">۰۹۳۹۴۸۱۲۲۷۷</span>
            </a>
          </div>
        </div>
      </div>

      <button onClick={logout} className="btn btn-danger w-full">
        <LogOut className="w-4 h-4" /> خروج از حساب
      </button>
      <BottomNav />
    </div>
  );
}
