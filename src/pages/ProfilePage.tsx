import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  User, CreditCard, Phone, LogOut, Plus, Trash2,
  Edit3, Check, X, Loader2, Shield, ChevronDown
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
    <div className="p-4 pb-24 space-y-4 animate-fade-in">
      {/* Header */}
      <h1 className="text-xl font-bold text-white">پروفایل</h1>

      {/* User Info Card */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/20">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{userInfo?.name || 'کاربر'}</h2>
            <p className="text-sm text-slate-400">{userInfo?.user_name}</p>
            {userInfo?.is_reseller && (
              <span className="inline-flex items-center gap-1 text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full mt-1">
                <Shield className="w-3 h-3" />
                نماینده
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">شناسه کاربری</p>
            <p className="text-sm font-medium text-white">{userInfo?.user_id}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">اعتبار باقیمانده</p>
            <p className="text-sm font-medium text-emerald-400">
              {credit ? Number(credit.credit).toLocaleString('fa-IR', { maximumFractionDigits: 0 }) + ' ریال' : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Credit Info */}
      {credit && (
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-medium text-white">اطلاعات اعتبار</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">اعتبار فعلی</span>
              <span className="text-sm text-white font-medium">
                {Number(credit.credit).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">اعتبار دیروز</span>
              <span className="text-sm text-slate-300">
                {Number(credit.yesterday_credit).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال
              </span>
            </div>
            {credit.gift > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">هدیه</span>
                <span className="text-sm text-amber-400">
                  {Number(credit.gift).toLocaleString('fa-IR')} ریال
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">آخرین بروزرسانی</span>
              <span className="text-xs text-slate-500" dir="ltr">{credit.updated_at}</span>
            </div>
          </div>
        </div>
      )}

      {/* Numbers */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Phone className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-medium text-white">خطوط من</h3>
          <span className="text-xs text-slate-400 mr-auto">{numbers.length} خط</span>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {numbers.map((num: any) => (
            <div key={num.id} className="bg-slate-800/50 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <p className="text-sm text-white" dir="ltr">{num.number}</p>
                {num.alias && <p className="text-xs text-slate-400">{num.alias}</p>}
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            </div>
          ))}
          {numbers.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-3">خطی ثبت نشده</p>
          )}
        </div>
      </div>

      {/* Accounts Management */}
      <div className="glass rounded-2xl p-4">
        <button
          onClick={() => setShowAccounts(!showAccounts)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-medium text-white">مدیریت حساب‌ها</h3>
            <span className="text-xs text-slate-400">({accounts.length})</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showAccounts ? 'rotate-180' : ''}`} />
        </button>

        {showAccounts && (
          <div className="mt-3 space-y-2 animate-slide-up">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`bg-slate-800/50 rounded-xl p-3 flex items-center justify-between ${
                  account.id === currentAccountId ? 'ring-1 ring-blue-500/50' : ''
                }`}
              >
                {editingId === account.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-slate-700 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
                      autoFocus
                    />
                    <button onClick={() => handleRename(account.id)} className="text-emerald-400">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-slate-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-3 h-3 rounded-full ${account.id === currentAccountId ? 'bg-blue-400' : 'bg-slate-600'}`}></div>
                      <div>
                        <p className="text-sm text-white">{account.name}</p>
                        <p className="text-xs text-slate-500" dir="ltr">
                          {account.apiKey.substring(0, 10)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {account.id !== currentAccountId && (
                        <button
                          onClick={() => handleSwitchAccount(account.id)}
                          className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="تغییر حساب"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => { setEditingId(account.id); setEditName(account.name); }}
                        className="p-1.5 text-slate-400 hover:bg-slate-700 rounded-lg transition-colors"
                        title="تغییر نام"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveAccount(account.id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
              <div className="bg-slate-800/50 rounded-xl p-3 space-y-2 animate-slide-up">
                <input
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="نام حساب"
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <input
                  value={newAccountKey}
                  onChange={(e) => setNewAccountKey(e.target.value)}
                  placeholder="کلید API"
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  dir="ltr"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddAccount}
                    disabled={isAdding}
                    className="flex-1 gradient-primary text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1"
                  >
                    {isAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    افزودن
                  </button>
                  <button
                    onClick={() => { setShowAddAccount(false); setNewAccountName(''); setNewAccountKey(''); }}
                    className="flex-1 bg-slate-700/50 text-slate-300 text-xs py-2 rounded-lg"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddAccount(true)}
                className="w-full bg-slate-800/30 border border-dashed border-slate-600/50 rounded-xl p-3 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white hover:border-blue-500/50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                افزودن حساب جدید
              </button>
            )}
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-500/10 border border-red-500/30 text-red-400 font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        خروج از حساب
      </button>
    </div>
  );
}
