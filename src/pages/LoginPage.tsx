import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/ippanel';
import {
  Key, Eye, EyeOff, MessageSquare, ArrowLeft, User, Lock, Shield
} from 'lucide-react';
import { Button } from '../components/ui';
import toast from 'react-hot-toast';

type LoginMode = 'login' | 'addAccount';
type AuthMethod = 'login' | 'sms' | 'ga' | null;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, addAccount, addAccountWithCredentials } = useAuthStore();
  
  const [mode, setMode] = useState<LoginMode>('login');
  
  // Read mode from URL query parameter
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'addAccount') {
      setMode('addAccount');
    }
  }, [searchParams]);
  const [tab, setTab] = useState<'apikey' | 'credentials'>('apikey');
  
  // API Key
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  
  // Credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Account Name (for addAccount mode)
  const [accountName, setAccountName] = useState('');
  
  // OTP
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [otpToken, setOtpToken] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Handle API Key login/add
  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    
    setLoading(true);
    try {
      if (mode === 'login') {
        const success = await login(apiKey.trim());
        if (success) {
          toast.success('ورود موفق');
          navigate('/');
        }
      } else {
        if (!accountName.trim()) {
          toast.error('لطفاً نام حساب را وارد کنید');
          setLoading(false);
          return;
        }
        // For API key, no OTP needed
        api.setApiKey(apiKey.trim());
        const result = await api.checkToken();
        if (result.meta.status) {
          const success = await addAccount(accountName.trim(), apiKey.trim());
          if (success) {
            toast.success('حساب با موفقیت اضافه شد');
            navigate('/profile');
          }
        } else {
          toast.error(result.meta.message || 'کلید API نامعتبر است');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در اتصال');
    }
    setLoading(false);
  };

  // Handle Credentials login/add
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    setLoading(true);
    try {
      const result = await api.login(username.trim(), password.trim());
      
      if (result.meta.status && result.data) {
        const { method, token } = result.data;
        
        if (method === 'login') {
          // Direct login with token
          if (mode === 'login') {
            const success = await login(token);
            if (success) {
              toast.success('ورود موفق');
              navigate('/');
            }
          } else {
            if (!accountName.trim()) {
              toast.error('لطفاً نام حساب را وارد کنید');
              setLoading(false);
              return;
            }
            const success = await addAccount(accountName.trim(), token);
            if (success) {
              toast.success('حساب با موفقیت اضافه شد');
              navigate('/profile');
            }
          }
        } else if (method === 'sms') {
          // Need SMS OTP
          setAuthMethod('sms');
          setOtpToken(token);
          toast.success('کد تایید به شماره موبایل شما ارسال شد');
        } else if (method === 'ga') {
          // Need Google Authenticator
          setAuthMethod('ga');
          setOtpToken(token);
          toast.success('لطفاً کد Google Authenticator را وارد کنید');
        }
      } else {
        toast.error(result.meta.message || 'نام کاربری یا رمز عبور اشتباه است');
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در اتصال');
    }
    setLoading(false);
  };

  // Handle OTP confirmation
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    
    setLoading(true);
    try {
      const result = await api.confirmOtp(otpToken, otpCode.trim());
      
      if (result.meta.status && result.data?.token) {
        const token = result.data.token;
        
        if (mode === 'login') {
          const success = await login(token);
          if (success) {
            toast.success('ورود موفق');
            navigate('/');
          }
        } else {
          if (!accountName.trim()) {
            toast.error('لطفاً نام حساب را وارد کنید');
            setLoading(false);
            return;
          }
          const success = await addAccount(accountName.trim(), token);
          if (success) {
            toast.success('حساب با موفقیت اضافه شد');
            navigate('/profile');
          }
        }
      } else {
        toast.error(result.meta.message || 'کد تایید اشتباه است');
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در تایید کد');
    }
    setLoading(false);
  };

  // If OTP is required, show OTP form
  if (authMethod) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/6 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg shadow-indigo-500/20 mb-5">
              <Shield className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-text mb-2 tracking-tight">تایید هویت دو مرحله‌ای</h1>
            <p className="text-sm text-text-dim">
              {authMethod === 'sms' 
                ? 'کد تایید به شماره موبایل شما ارسال شد' 
                : 'کد Google Authenticator را وارد کنید'}
            </p>
          </div>

          <form onSubmit={handleOtpSubmit} className="space-y-5 animate-slide-up">
            {mode === 'addAccount' && (
              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">نام حساب</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="نام حساب جدید..."
                  className="input text-sm"
                  autoFocus
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">
                {authMethod === 'sms' ? 'کد تایید پیامکی' : 'کد Google Authenticator'}
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="کد ۶ رقمی..."
                className="input text-center text-lg font-mono tracking-widest"
                dir="ltr"
                maxLength={6}
                autoFocus
              />
              <p className="text-[11px] text-text-dim mt-2 text-center">
                {authMethod === 'sms' 
                  ? 'کد ارسال شده به موبایل خود را وارد کنید' 
                  : 'کد نمایش داده شده در اپلیکیشن Google Authenticator را وارد کنید'}
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!otpCode.trim()}
              className="w-full"
            >
              تایید و ادامه
            </Button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod(null);
                setOtpToken('');
                setOtpCode('');
              }}
              className="w-full text-center text-xs text-text-dim hover:text-text transition-colors"
            >
              بازگشت به صفحه ورود
            </button>
          </form>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-text mb-2 tracking-tight">
            {mode === 'login' ? 'ورود به پنل پیامک' : 'افزودن حساب جدید'}
          </h1>
          <p className="text-sm text-text-dim">
            {mode === 'login' 
              ? 'برای ورود، یکی از روش‌های زیر را انتخاب کنید' 
              : 'اطلاعات حساب جدید را وارد کنید'}
          </p>
        </div>

        {/* Mode Switcher (only show if authenticated) */}
        {mode === 'addAccount' && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-muted mb-2">نام حساب</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="نام حساب جدید..."
              className="input text-sm"
            />
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('apikey')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              tab === 'apikey'
                ? 'bg-accent/10 text-accent border border-accent/30'
                : 'bg-surface-2 text-text-dim border border-border hover:text-text'
            }`}
          >
            کلید API
          </button>
          <button
            onClick={() => setTab('credentials')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              tab === 'credentials'
                ? 'bg-accent/10 text-accent border border-accent/30'
                : 'bg-surface-2 text-text-dim border border-border hover:text-text'
            }`}
          >
            نام کاربری و رمز عبور
          </button>
        </div>

        {/* API Key Form */}
        {tab === 'apikey' && (
          <form onSubmit={handleApiKeySubmit} className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">
                کلید دسترسی API
              </label>
              <div className="relative">
                <Key className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none" />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="کلید API خود را وارد کنید..."
                  className="input pr-10 pl-10 font-mono text-sm"
                  dir="ltr"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text transition-colors"
                  tabIndex={-1}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!apiKey.trim()}
              className="w-full"
            >
              {mode === 'login' ? 'ورود به پنل' : 'افزودن حساب'}
            </Button>

            {mode === 'login' && (
              <div className="text-center">
                <a
                  href="https://edge.ippanel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-text-dim hover:text-accent transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  دریافت کلید API از پنل IPPanel
                </a>
              </div>
            )}
          </form>
        )}

        {/* Credentials Form */}
        {tab === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">
                نام کاربری
              </label>
              <div className="relative">
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری خود را وارد کنید..."
                  className="input pr-10 text-sm"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">
                رمز عبور
              </label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور خود را وارد کنید..."
                  className="input pr-10 pl-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!username.trim() || !password.trim()}
              className="w-full"
            >
              {mode === 'login' ? 'ورود به پنل' : 'افزودن حساب'}
            </Button>

            {mode === 'login' && (
              <div className="text-center">
                <p className="text-[11px] text-text-dim">
                  در صورت فعال بودن احراز هویت دو مرحله‌ای، کد تایید از شما درخواست می‌شود
                </p>
              </div>
            )}
          </form>
        )}

        {/* Back to login button (only in addAccount mode) */}
        {mode === 'addAccount' && (
          <button
            onClick={() => navigate('/profile')}
            className="mt-6 w-full text-center text-xs text-text-dim hover:text-text transition-colors"
          >
            بازگشت به پروفایل
          </button>
        )}
      </div>
    </div>
  );
}
