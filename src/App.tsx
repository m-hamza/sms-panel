import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import {
  MessageSquare, Send, Users, BookOpen, Smartphone, Zap, Sparkles, CheckSquare,
  Wallet, Radio, Activity, Key, Lock, Eye, EyeOff, ArrowLeft, ArrowRight,
  User, Phone, LogOut, Plus, Trash2, Edit3, Check, X, Shield, ChevronDown,
  Headphones, Globe, Moon, Sun, ExternalLink, LayoutDashboard, FileText,
  Search, Filter, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, XCircle,
  Clock, AlertCircle, Inbox, Loader2
} from 'lucide-react';

// ===== API =====
const BASE_URL = 'https://edge.ippanel.com/v1';

class IPPanelAPI {
  private apiKey = '';
  setApiKey(key: string) { this.apiKey = key; }
  getApiKey() { return this.apiKey; }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': this.apiKey,
      ...(options.headers as Record<string, string> || {}),
    };
    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    let data;
    try { data = await response.json(); } catch { throw new Error('خطا در پردازش پاسخ'); }
    if (!data.meta?.status && response.status === 401) throw new Error('توکن نامعتبر');
    return data;
  }

  async checkToken() { return this.request('/api/acl/auth/check_token', { method: 'POST' }); }
  async login(username: string, password: string) {
    return this.request('/api/acl/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  }
  async getNumbers(page = 1, perPage = 100) { return this.request(`/api/number/numbers?page=${page}&per_page=${perPage}`); }
  async getCredit() { return this.request('/api/payment/credit/mine'); }
  async sendSMS(data: any) {
    return this.request('/api/send', { method: 'POST', body: JSON.stringify({ sending_type: 'webservice', ...data }) });
  }
  async sendPeerToPeer(data: any) {
    return this.request('/api/send', { method: 'POST', body: JSON.stringify({ sending_type: 'peer_to_peer', ...data }) });
  }
  async sendToPhonebook(data: any) {
    return this.request('/api/send', { method: 'POST', body: JSON.stringify({ sending_type: 'phonebook', ...data }) });
  }
  async sendPatternSMS(data: any) {
    return this.request('/api/send', { method: 'POST', body: JSON.stringify({ sending_type: 'pattern', ...data }) });
  }
  async getPhonebooks(page = 1, perPage = 100) { return this.request(`/api/phonebooks/list-new?page=${page}&per_page=${perPage}`); }
  async getPhonebookNumbers(phonebookId: string, page = 1, perPage = 1000) {
    return this.request(`/api/phonebooks/numbers/contact-list?phonebook_id=${phonebookId}&page=${page}&per_page=${perPage}`);
  }
  async getOutboxReport(data: any) {
    return this.request('/api/report/new_list', { method: 'POST', body: JSON.stringify(data) });
  }
  async getOutboxReportById(id: string) { return this.request(`/api/report/by_bulk?messages_outbox_id=${id}`, { method: 'GET' }); }
  async getPatterns(page = 1, perPage = 100, filters?: any) {
    let url = `/api/patterns?page=${page}&per_page=${perPage}`;
    if (filters?.state) url += `&filter[state]=${filters.state}`;
    return this.request(url);
  }
}

const api = new IPPanelAPI();

// ===== Utils =====
function toPersianNumber(num: any): string {
  if (num === undefined || num === null || isNaN(Number(num))) return '۰';
  return Number(num).toLocaleString('fa-IR');
}

function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  if (cleaned.startsWith('98')) cleaned = cleaned.substring(2);
  return `+98${cleaned}`;
}

function parsePhoneNumbers(text: string): string[] {
  return text.split(/[\n,،\s]/).map(r => r.trim()).filter(r => r.length > 0).map(r => formatPhoneNumber(r));
}

function toPersianDateTime(timestamp: any): string {
  try {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  } catch { return String(timestamp); }
}

function formatCost(cost: number): string {
  return Number(cost).toLocaleString('fa-IR', { maximumFractionDigits: 0 }) + ' ریال';
}

// ===== Store =====
const STORAGE_KEY = 'ippanel_accounts';
const ACTIVE_KEY = 'ippanel_active_account';

interface Account { id: string; name: string; apiKey: string; userInfo?: any; credit?: any; numbers?: any[]; phonebooks?: any[]; }

function loadFromStorage() {
  try {
    return { accounts: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'), activeId: localStorage.getItem(ACTIVE_KEY) };
  } catch { return { accounts: [], activeId: null }; }
}

function saveToStorage(accounts: Account[], activeId: string | null) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
}

// ===== App =====
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [credit, setCredit] = useState<any>(null);
  const [numbers, setNumbers] = useState<any[]>([]);
  const [phonebooks, setPhonebooks] = useState<any[]>([]);

  useEffect(() => {
    const { accounts: storedAccounts, activeId } = loadFromStorage();
    if (storedAccounts.length > 0 && activeId) {
      const account = storedAccounts.find((a: Account) => a.id === activeId);
      if (account) {
        api.setApiKey(account.apiKey);
        setAccounts(storedAccounts);
        setCurrentAccountId(activeId);
        setUserInfo(account.userInfo);
        setCredit(account.credit);
        setNumbers(account.numbers || []);
        setPhonebooks(account.phonebooks || []);
        setIsAuthenticated(true);
        // بارگذاری پس‌زمینه
        loadUserData(account.apiKey, activeId, storedAccounts);
      }
    }
    setIsInitialized(true);
  }, []);

  const loadUserData = async (apiKey: string, activeId: string | null, accountsList: Account[]) => {
    try {
      const [creditRes, numbersRes, phonebooksRes] = await Promise.all([
        api.getCredit().catch(() => null),
        api.getNumbers().catch(() => null),
        api.getPhonebooks().catch(() => null),
      ]);
      const creditData = creditRes?.meta?.status ? creditRes.data : null;
      const numbersData = numbersRes?.meta?.status ? numbersRes.data : [];
      const phonebooksData = phonebooksRes?.meta?.status ? phonebooksRes.data : [];
      setCredit(creditData);
      setNumbers(numbersData);
      setPhonebooks(phonebooksData);
      const updated = accountsList.map((a: Account) => a.id === activeId ? { ...a, credit: creditData, numbers: numbersData, phonebooks: phonebooksData } : a);
      setAccounts(updated);
      saveToStorage(updated, activeId);
    } catch (err) { console.error('خطا در بارگذاری:', err); }
  };

  const login = async (apiKey: string): Promise<boolean> => {
    try {
      api.setApiKey(apiKey);
      const result = await api.checkToken();
      if (result.meta.status) {
        const id = Date.now().toString();
        const account: Account = { id, name: result.data.user_name || 'حساب کاربری', apiKey, userInfo: result.data };
        const { accounts: stored } = loadFromStorage();
        const existing = stored.findIndex((a: Account) => a.apiKey === apiKey);
        if (existing >= 0) { stored[existing] = { ...stored[existing], userInfo: result.data }; }
        else { stored.push(account); }
        setAccounts(stored);
        setCurrentAccountId(existing >= 0 ? stored[existing].id : id);
        setUserInfo(result.data);
        setIsAuthenticated(true);
        saveToStorage(stored, existing >= 0 ? stored[existing].id : id);
        loadUserData(apiKey, existing >= 0 ? stored[existing].id : id, stored);
        return true;
      } else { toast.error(result.meta.message); return false; }
    } catch (err: any) { toast.error(err.message || 'خطا در اتصال'); return false; }
  };

  const loginWithCredentials = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await api.login(username, password);
      if (result.meta.status && result.data) {
        if (result.data.method === 'login') return await login(result.data.token);
        else { toast.error('ورود دو مرحله‌ای فعال است. از API Key استفاده کنید.'); return false; }
      } else { toast.error(result.meta.message || 'نام کاربری یا رمز عبور اشتباه'); return false; }
    } catch (err: any) { toast.error(err.message || 'خطا'); return false; }
  };

  const logout = () => {
    const newAccounts = accounts.filter((a: Account) => a.id !== currentAccountId);
    const newId = newAccounts.length > 0 ? newAccounts[0].id : null;
    setAccounts(newAccounts);
    setCurrentAccountId(newId);
    setIsAuthenticated(!!newId);
    if (!newId) { setUserInfo(null); setCredit(null); setNumbers([]); setPhonebooks([]); }
    saveToStorage(newAccounts, newId);
  };

  const switchAccount = async (id: string) => {
    const account = accounts.find(a => a.id === id);
    if (!account) return;
    api.setApiKey(account.apiKey);
    setCurrentAccountId(id);
    setUserInfo(account.userInfo);
    setCredit(account.credit);
    setNumbers(account.numbers || []);
    setPhonebooks(account.phonebooks || []);
    localStorage.setItem(ACTIVE_KEY, id);
  };

  const addAccount = async (name: string, apiKey: string): Promise<boolean> => {
    try {
      api.setApiKey(apiKey);
      const result = await api.checkToken();
      if (result.meta.status) {
        const id = Date.now().toString();
        const account: Account = { id, name, apiKey, userInfo: result.data };
        const newAccounts = [...accounts, account];
        setAccounts(newAccounts);
        saveToStorage(newAccounts, currentAccountId);
        return true;
      } else { toast.error(result.meta.message); return false; }
    } catch (err: any) { toast.error(err.message); return false; }
  };

  const addAccountWithCredentials = async (name: string, username: string, password: string): Promise<boolean> => {
    try {
      const result = await api.login(username, password);
      if (result.meta.status && result.data?.method === 'login') {
        const id = Date.now().toString();
        const account: Account = { id, name, apiKey: result.data.token };
        const newAccounts = [...accounts, account];
        setAccounts(newAccounts);
        saveToStorage(newAccounts, currentAccountId);
        return true;
      } else { toast.error('خطا در افزودن حساب'); return false; }
    } catch (err: any) { toast.error(err.message); return false; }
  };

  const removeAccount = (id: string) => {
    const newAccounts = accounts.filter(a => a.id !== id);
    setAccounts(newAccounts);
    saveToStorage(newAccounts, currentAccountId);
  };

  const renameAccount = (id: string, name: string) => {
    const newAccounts = accounts.map(a => a.id === id ? { ...a, name } : a);
    setAccounts(newAccounts);
    saveToStorage(newAccounts, currentAccountId);
  };

  if (!isInitialized) {
    return <div className="min-h-screen bg-bg"><div className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-gradient-to-r from-accent via-purple-500 to-accent"></div></div>;
  }

  return (
    <HashRouter>
      <Toaster position="top-center" toastOptions={{ style: { background: 'rgba(12,18,32,0.95)', color: '#e5e7eb', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '12px', fontSize: '13px', backdropFilter: 'blur(12px)' } }} />
      {!isAuthenticated ? (
        <Routes><Route path="*" element={<LoginPage login={login} loginWithCredentials={loginWithCredentials} />} /></Routes>
      ) : (
        <Routes>
          <Route path="/" element={<DashboardPage numbers={numbers} phonebooks={phonebooks} credit={credit} />} />
          <Route path="/dashboard" element={<DashboardPage numbers={numbers} phonebooks={phonebooks} credit={credit} />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage userInfo={userInfo} credit={credit} numbers={numbers} accounts={accounts} currentAccountId={currentAccountId} logout={logout} switchAccount={switchAccount} addAccount={addAccount} addAccountWithCredentials={addAccountWithCredentials} removeAccount={removeAccount} renameAccount={renameAccount} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </HashRouter>
  );
}

// ===== Login Page =====
function LoginPage({ login, loginWithCredentials }: any) {
  const [tab, setTab] = useState<'apikey' | 'credentials'>('apikey');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (tab === 'apikey') await login(apiKey.trim());
    else await loginWithCredentials(username.trim(), password.trim());
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/6 rounded-full blur-[100px]"></div>
      </div>
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg shadow-indigo-500/20 mb-5">
            <MessageSquare className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">پنل پیامک IPPanel</h1>
          <p className="text-sm text-text-dim">برای ورود، یکی از روش‌های زیر را انتخاب کنید</p>
        </div>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('apikey')} className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${tab === 'apikey' ? 'bg-accent/10 text-accent border border-accent/30' : 'bg-surface-2 text-text-dim border border-border'}`}>کلید API</button>
          <button onClick={() => setTab('credentials')} className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${tab === 'credentials' ? 'bg-accent/10 text-accent border border-accent/30' : 'bg-surface-2 text-text-dim border border-border'}`}>نام کاربری و رمز عبور</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
          {tab === 'apikey' ? (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">کلید دسترسی API</label>
              <div className="relative">
                <Key className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="کلید API..." className="input pr-10 pl-10 font-mono text-sm" dir="ltr" autoFocus />
                <button type="button" onClick={() => setShowKey(!showKey)} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"><EyeOff className="w-4 h-4" /></button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">نام کاربری</label>
                <div className="relative">
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="نام کاربری..." className="input pr-10 text-sm" autoFocus />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">رمز عبور</label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input type={showKey ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="رمز عبور..." className="input pr-10 text-sm" />
                  <button type="button" onClick={() => setShowKey(!showKey)} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"><Eye className="w-4 h-4" /></button>
                </div>
              </div>
            </>
          )}
          <button type="submit" disabled={loading || (tab === 'apikey' ? !apiKey.trim() : !username.trim() || !password.trim())} className="btn btn-primary w-full" style={{ padding: '14px' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            ورود به پنل
          </button>
        </form>
      </div>
    </div>
  );
}

// ===== Dashboard Page =====
function DashboardPage({ numbers, phonebooks, credit }: any) {
  const navigate = useNavigate();
  const modes = [
    { id: 'single', title: 'ارسال تکی', desc: 'ارسال به یک شماره', icon: Send, color: 'from-indigo-500 to-indigo-600' },
    { id: 'bulk', title: 'ارسال دسته‌جمعی', desc: 'ارسال به چند شماره', icon: Zap, color: 'from-violet-500 to-purple-600' },
    { id: 'peer', title: 'همتا‌به‌همتا', desc: 'پیام متفاوت به هر شماره', icon: Users, color: 'from-sky-500 to-cyan-500' },
    { id: 'phonebook', title: 'دفترچه تلفن', desc: 'ارسال به همه مخاطبین', icon: BookOpen, color: 'from-emerald-500 to-emerald-600' },
    { id: 'phonebook_select', title: 'دفترچه تلفن موردی', desc: 'انتخاب مخاطبین خاص', icon: CheckSquare, color: 'from-rose-500 to-pink-500' },
    { id: 'mobile', title: 'از گوشی', desc: 'مخاطبین گوشی', icon: Smartphone, color: 'from-amber-500 to-orange-500' },
    { id: 'pattern', title: 'الگوی پیام', desc: 'ارسال با الگوی آماده', icon: Sparkles, color: 'from-purple-500 to-fuchsia-500' },
  ];

  return (
    <div className="px-4 pt-6 pb-28 space-y-6">
      <header className="animate-fade-in">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold text-text">پیشخوان</h1>
            <p className="text-xs text-text-dim mt-0.5">مدیریت و ارسال پیامک</p>
          </div>
          {credit?.credit && (
            <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-3 py-2">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-text">{toPersianNumber(Number(credit.credit).toFixed(0))}</span>
              <span className="text-[10px] text-text-dim">ریال</span>
            </div>
          )}
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3">
            <Radio className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-bold text-text">{toPersianNumber(numbers.length)}</p>
          <p className="text-xs text-text-dim mt-0.5">خط فعال</p>
        </div>
        <div className="card p-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
            <Users className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-bold text-text">{toPersianNumber(phonebooks.length)}</p>
          <p className="text-xs text-text-dim mt-0.5">دفترچه تلفن</p>
        </div>
      </div>
      <section className="animate-slide-up">
        <h2 className="text-sm font-medium text-text-muted mb-3 text-center">امکانات ارسال</h2>
        <div className="grid grid-cols-2 gap-3">
          {modes.map((mode) => (
            <button key={mode.id} onClick={() => navigate(`/send/${mode.id}`)} className="card card-interactive p-4 flex flex-col items-center text-center group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                <mode.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-medium text-text mb-1">{mode.title}</h3>
              <p className="text-[11px] text-text-dim">{mode.desc}</p>
            </button>
          ))}
        </div>
      </section>
      <BottomNav />
    </div>
  );
}

// ===== Bottom Nav =====
function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const items = [
    { id: '/', label: 'پیشخوان', icon: LayoutDashboard },
    { id: '/reports', label: 'گزارشات', icon: FileText },
    { id: '/profile', label: 'پروفایل', icon: User },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-lg mx-auto">
      <div className="bg-surface/80 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around px-4 py-2">
          {items.map((item) => {
            const isActive = location.pathname === item.id;
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => navigate(item.id)} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative ${isActive ? 'text-accent' : 'text-text-dim'}`}>
                {isActive && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent rounded-full"></div>}
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// ===== Reports Page =====
function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchReports(1); }, []);

  const fetchReports = async (pageNum: number) => {
    setLoading(true);
    try {
      const result = await api.getOutboxReport({ page: pageNum, limit: 50 });
      if (result.meta.status) {
        setReports(result.data || []);
        setTotalPages(result.meta.last_page || 1);
        setTotal(result.meta.total || 0);
      }
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="px-4 pt-6 pb-28 space-y-5">
      <header className="flex items-start justify-between animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-text">گزارشات</h1>
          <p className="text-xs text-text-dim mt-0.5">تمامی پیام‌های ارسالی از ابتدا تاکنون</p>
        </div>
        <button onClick={() => fetchReports(page)} className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>
      <div className="card flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Inbox className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-text-dim">مجموع کل گزارشات</p>
            <p className="text-lg font-bold text-text">{toPersianNumber(total)}</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-[10px] text-text-dim">صفحه</p>
          <p className="text-sm font-medium text-text">{toPersianNumber(page)} از {toPersianNumber(totalPages)}</p>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-text-dim mx-auto mb-3" />
          <p className="text-sm text-text-dim">گزارشی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((report, idx) => (
            <div key={idx} className="card p-3.5">
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="badge badge-success">ارسال شده</span>
                    <p className="text-[11px] text-text-dim mt-1 font-mono" dir="ltr">{report.number}</p>
                  </div>
                </div>
                <span className="text-[11px] text-text-dim">{toPersianDateTime(report.time)}</span>
              </div>
              <p className="text-sm text-text mb-2.5 line-clamp-2">{report.message}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-3 text-[11px] text-text-dim">
                  <span>گیرندگان: <span className="text-text-muted">{toPersianNumber(report.rcpts_count)}</span></span>
                  <span>ارسال: <span className="text-text-muted">{toPersianNumber(report.exit_count)}</span></span>
                </div>
                <span className="text-xs font-medium text-emerald-400">{formatCost(report.cost)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => { setPage(page - 1); fetchReports(page - 1); }} disabled={page <= 1} className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs text-text-muted px-2">{toPersianNumber(page)} / {toPersianNumber(totalPages)}</span>
          <button onClick={() => { setPage(page + 1); fetchReports(page + 1); }} disabled={page >= totalPages} className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}
      <BottomNav />
    </div>
  );
}

// ===== Profile Page =====
function ProfilePage({ userInfo, credit, numbers, accounts, currentAccountId, logout, switchAccount, addAccount, addAccountWithCredentials, removeAccount, renameAccount }: any) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as any) || 'dark');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addTab, setAddTab] = useState<'apikey' | 'credentials'>('apikey');
  const [newName, setNewName] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');
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
    setIsAdding(true);
    let success = false;
    if (addTab === 'apikey') success = await addAccount(newName.trim(), newKey.trim());
    else success = await addAccountWithCredentials(newName.trim(), newUser.trim(), newPass.trim());
    if (success) { toast.success('حساب اضافه شد'); setShowAddAccount(false); setNewName(''); setNewKey(''); setNewUser(''); setNewPass(''); }
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
              <div className="flex gap-2">
                <button onClick={() => setAddTab('apikey')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium ${addTab === 'apikey' ? 'bg-accent/10 text-accent border border-accent/30' : 'bg-surface border border-border text-text-dim'}`}>کلید API</button>
                <button onClick={() => setAddTab('credentials')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium ${addTab === 'credentials' ? 'bg-accent/10 text-accent border border-accent/30' : 'bg-surface border border-border text-text-dim'}`}>نام کاربری و رمز</button>
              </div>
              {addTab === 'apikey' ? (
                <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="کلید API" className="input text-sm font-mono" dir="ltr" />
              ) : (
                <>
                  <input value={newUser} onChange={(e) => setNewUser(e.target.value)} placeholder="نام کاربری" className="input text-sm" />
                  <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="رمز عبور" className="input text-sm" />
                </>
              )}
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

export default App;
