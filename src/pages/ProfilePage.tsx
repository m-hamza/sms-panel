import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  User, CreditCard, Phone, LogOut, Plus, Trash2,
  Edit3, Check, X, Loader2, Shield, ChevronDown,
  Wallet, Fingerprint, UserCircle, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const {
    userInfo, credit, numbers, accounts, currentAccountId,
    logout, switchAccount, addAccount, removeAccount, renameAccount
  } = useAuthStore();

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountKey, setNewAccountKey] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showAccounts, setShowAccounts] = useState(false);

  const handleAddAccount = async () => {
    if (!newAccountName.trim() || !newAccountKey.trim()) {
      toast.error('لطفاً نام و کلید API را وارد کنید');
      return;
    }
    setIsAdding(true);
    const success = await addAccount(newAccountName.trim(), newAccountKey.trim());
    if (success) {
      toast.success('حساب با موفقیت اضافه شد');
      setShowAddAccount(false);
      setNewAccountName('');
      setNewAccountKey('');
    }
    setIsAdding(false);
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
    setShowAccounts(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('خروج موفق');
  };

  return (
    <div className="p-4 pb-28 space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">پروفایل</h1>
        <p className="text-xs text-slate-500 mt-0.5">اطلاعات حساب و تنظیمات</p>
      </div>

      {/* User Info Card */}
      <div className="gradient-border rounded-2xl p-5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
        
        <div className="relative flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-blue-500/20">
              <User className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{userInfo?.name || 'کاربر'}</h2>
            <p className="text-sm text-slate-400">{userInfo?.user_name}</p>
            {userInfo?.is_reseller && (
              <span className="inline-flex items-center gap-1 text-[11px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full mt-1.5 border border-purple-500/20">
                <Shield className="w-3 h-3" />
                نماینده
              </span>
            )}
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3">
          <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/30">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-blue-400" />
              <p className="text-[11px] text-slate-500">شناسه کاربری</p>
            </div>
            <p className="text-sm font-bold text-white">{userInfo?.user_id}</p>
          </div>
          <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/30">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-[11px] text-slate-500">اعتبار</p>
            </div>
            <p className="text-sm font-bold text-emerald-400">
              {credit ? Number(credit.credit).toLocaleString('fa-IR', { maximumFractionDigits: 0 }) : '-'}
            </p>
            <p className="text-[10px] text-slate-600">ریال</p>
          </div>
        </div>
      </div>

      {/* Credit Details */}
      {credit && (
        <div className="gradient-border-emerald rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">جزئیات اعتبار</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-800/30">
              <span className="text-xs text-slate-400">اعتبار فعلی</span>
              <span className="text-sm font-semibold text-white">
                {Number(credit.credit).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} <span className="text-[10px] text-slate-500">ریال</span>
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/30">
              <span className="text-xs text-slate-400">اعتبار دیروز</span>
              <span className="text-sm text-slate-300">
                {Number(credit.yesterday_credit).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} <span className="text-[10px] text-slate-500">ریال</span>
              </span>
            </div>
            {credit.gift > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-slate-800/30">
                <span className="text-xs text-slate-400">هدیه</span>
                <span className="text-sm text-amber-400 font-medium">
                  {Number(credit.gift).toLocaleString('fa-IR')} <span className="text-[10px] text-amber-600">ریال</span>
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-slate-400">آخرین بروزرسانی</span>
              <span className="text-[11px] text-slate-500" dir="ltr">{credit.updated_at}</span>
            </div>
          </div>
        </div>
      )}

      {/* Numbers */}
      <div className="gradient-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Phone className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-white flex-1">خطوط من</h3>
          <span className="text-[11px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">{numbers.length} خط</span>
        </div>
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {numbers.map((num: any) => (
            <div key={num.id} className="bg-slate-900/40 rounded-xl p-3 flex items-center justify-between border border-slate-800/30 hover:border-slate-700/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                  <Building2 className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white" dir="ltr">{num.number}</p>
                  {num.alias && <p className="text-[11px] text-slate-500">{num.alias}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-glow"></div>
                <span className="text-[10px] text-emerald-500">فعال</span>
              </div>
            </div>
          ))}
          {numbers.length === 0 && (
            <div className="text-center py-6">
              <Phone className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500">خطی ثبت نشده</p>
            </div>
          )}
        </div>
      </div>

      {/* Accounts Management */}
      <div className="gradient-border-purple rounded-2xl p-4">
        <button
          onClick={() => setShowAccounts(!showAccounts)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <UserCircle className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">مدیریت حساب‌ها</h3>
            <span className="text-[11px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">{accounts.length}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${showAccounts ? 'rotate-180' : ''}`} />
        </button>

        {showAccounts && (
          <div className="mt-4 space-y-2.5 animate-slide-up">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`bg-slate-900/40 rounded-xl p-3.5 flex items-center justify-between border transition-all ${
                  account.id === currentAccountId ? 'border-blue-500/30 glow-blue' : 'border-slate-800/30'
                }`}
              >
                {editingId === account.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                      autoFocus
                    />
                    <button onClick={() => handleRename(account.id)} className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="w-7 h-7 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-3 h-3 rounded-full ${account.id === currentAccountId ? 'bg-blue-400 shadow-lg shadow-blue-400/50' : 'bg-slate-600'}`}></div>
                      <div>
                        <p className="text-sm font-medium text-white">{account.name}</p>
                        <p className="text-[11px] text-slate-600" dir="ltr">
                          {account.apiKey.substring(0, 12)}•••
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {account.id !== currentAccountId && (
                        <button
                          onClick={() => handleSwitchAccount(account.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-500/10 transition-all hover:scale-110"
                          title="تغییر حساب"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => { setEditingId(account.id); setEditName(account.name); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-700/50 transition-all hover:scale-110"
                        title="تغییر نام"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveAccount(account.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-all hover:scale-110"
                        title="حذف حساب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Add Account */}
            {showAddAccount ? (
              <div className="bg-slate-900/40 rounded-xl p-4 space-y-3 border border-slate-800/30 animate-scale-in">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">نام حساب</label>
                  <input
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="مثلاً: حساب کاری"
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">کلید API</label>
                  <input
                    value={newAccountKey}
                    onChange={(e) => setNewAccountKey(e.target.value)}
                    placeholder="کلید API جدید..."
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                    dir="ltr"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddAccount}
                    disabled={isAdding}
                    className="flex-1 relative group overflow-hidden rounded-xl"
                  >
                    <div className="absolute inset-0 gradient-primary opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative text-white text-xs font-medium py-2.5 flex items-center justify-center gap-1.5">
                      {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      افزودن
                    </span>
                  </button>
                  <button
                    onClick={() => { setShowAddAccount(false); setNewAccountName(''); setNewAccountKey(''); }}
                    className="flex-1 bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs py-2.5 rounded-xl hover:bg-slate-700/50 transition-colors"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddAccount(true)}
                className="w-full bg-slate-900/20 border border-dashed border-slate-700/50 rounded-xl p-3.5 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span>افزودن حساب جدید</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-500/5 border border-red-500/20 text-red-400 font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
      >
        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>خروج از حساب</span>
      </button>
    </div>
  );
}
