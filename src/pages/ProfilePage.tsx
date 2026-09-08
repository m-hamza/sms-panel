import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  User, CreditCard, Phone, LogOut, Plus, Trash2,
  Edit3, Check, X, Loader2, Shield, ChevronDown,
  Wallet, Radio, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Input, Badge, SectionHeader } from '../components/ui';

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
    <div className="px-4 pt-6 pb-28 space-y-5">
      {/* Header */}
      <header className="animate-fade-in">
        <h1 className="text-xl font-bold text-text tracking-tight">پروفایل</h1>
        <p className="text-xs text-text-dim mt-0.5">مدیریت حساب و اطلاعات کاربری</p>
      </header>

      {/* User Info Card */}
      <Card className="relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-5">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-2 border border-border rounded-xl p-3">
              <p className="text-[11px] text-text-dim mb-1">شناسه کاربری</p>
              <p className="text-sm font-semibold text-text">{userInfo?.user_id}</p>
            </div>
            <div className="bg-surface-2 border border-border rounded-xl p-3">
              <p className="text-[11px] text-text-dim mb-1">اعتبار</p>
              <p className="text-sm font-semibold text-emerald-400">
                {credit ? Number(credit.credit).toLocaleString('fa-IR', { maximumFractionDigits: 0 }) : '-'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Credit Details */}
      {credit && (
        <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-medium text-text">اطلاعات اعتبار</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-dim">اعتبار فعلی</span>
              <span className="text-sm font-medium text-text">
                {Number(credit.credit).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال
              </span>
            </div>
            <div className="divider"></div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-dim">اعتبار دیروز</span>
              <span className="text-sm text-text-muted">
                {Number(credit.yesterday_credit).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال
              </span>
            </div>
            {credit.gift > 0 && (
              <>
                <div className="divider"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-dim">هدیه</span>
                  <span className="text-sm font-medium text-amber-400">
                    {Number(credit.gift).toLocaleString('fa-IR')} ریال
                  </span>
                </div>
              </>
            )}
            <div className="divider"></div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-dim">آخرین بروزرسانی</span>
              <span className="text-[11px] text-text-dim font-mono" dir="ltr">{credit.updated_at}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Numbers */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Radio className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-medium text-text">خطوط من</h3>
          </div>
          <Badge variant="neutral">{numbers.length}</Badge>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
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
      </Card>

      {/* Accounts Management */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <button
          onClick={() => setShowAccounts(!showAccounts)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-medium text-text">مدیریت حساب‌ها</h3>
            <Badge variant="neutral">{accounts.length}</Badge>
          </div>
          <ChevronDown className={`w-4 h-4 text-text-dim transition-transform ${showAccounts ? 'rotate-180' : ''}`} />
        </button>

        {showAccounts && (
          <div className="mt-4 space-y-2 animate-fade-in">
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

            {/* Add Account */}
            {showAddAccount ? (
              <div className="bg-surface-2 border border-border rounded-xl p-3 space-y-2.5 animate-fade-in">
                <input
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="نام حساب"
                  className="input text-sm"
                />
                <input
                  value={newAccountKey}
                  onChange={(e) => setNewAccountKey(e.target.value)}
                  placeholder="کلید API"
                  className="input text-sm font-mono"
                  dir="ltr"
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddAccount}
                    disabled={isAdding}
                    loading={isAdding}
                    icon={<Plus className="w-3.5 h-3.5" />}
                    className="flex-1"
                  >
                    افزودن
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setShowAddAccount(false); setNewAccountName(''); setNewAccountKey(''); }}
                    className="flex-1"
                  >
                    انصراف
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddAccount(true)}
                className="w-full bg-surface-2 border border-dashed border-border-strong rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-text-dim hover:text-text hover:border-accent/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                افزودن حساب جدید
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Logout */}
      <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
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
    </div>
  );
}
