import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Key, Eye, EyeOff, MessageSquare, ArrowLeft, User, Lock } from 'lucide-react';
import { Button } from '../components/ui';

type LoginTab = 'apikey' | 'credentials';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<LoginTab>('apikey');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithCredentials, isLoading, error } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    await login(apiKey.trim());
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    await loginWithCredentials(username.trim(), password.trim());
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/6 rounded-full blur-[100px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg shadow-indigo-500/20 mb-5">
            <MessageSquare className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-text mb-2 tracking-tight">پنل پیامک IPPanel</h1>
          <p className="text-sm text-text-dim">برای ورود، یکی از روش‌های زیر را انتخاب کنید</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 animate-fade-in-up">
          <button
            onClick={() => setActiveTab('apikey')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'apikey'
                ? 'bg-accent/10 text-accent border border-accent/30'
                : 'bg-surface-2 text-text-dim border border-border hover:text-text'
            }`}
          >
            کلید API
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'credentials'
                ? 'bg-accent/10 text-accent border border-accent/30'
                : 'bg-surface-2 text-text-dim border border-border hover:text-text'
            }`}
          >
            نام کاربری و رمز عبور
          </button>
        </div>

        {/* API Key Form */}
        {activeTab === 'apikey' && (
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

            {error && (
              <div className="bg-danger/5 border border-danger/20 rounded-xl p-3 text-danger text-xs text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={!apiKey.trim()}
              className="w-full"
            >
              ورود به پنل
            </Button>
          </form>
        )}

        {/* Credentials Form */}
        {activeTab === 'credentials' && (
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

            {error && (
              <div className="bg-danger/5 border border-danger/20 rounded-xl p-3 text-danger text-xs text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={!username.trim() || !password.trim()}
              className="w-full"
            >
              ورود به پنل
            </Button>

            <div className="text-center">
              <p className="text-[11px] text-text-dim">
                در صورت فعال بودن احراز هویت دو مرحله‌ای، لطفاً از کلید API استفاده کنید
              </p>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
          <a
            href="https://edge.ippanel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-text-dim hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            دریافت کلید API از پنل IPPanel
          </a>
          <p className="mt-4 text-[11px] text-text-dim/60">
            اطلاعات ورود شما به صورت امن در مرورگر ذخیره می‌شود
          </p>
        </div>
      </div>
    </div>
  );
}
