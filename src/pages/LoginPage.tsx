import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Key, Eye, EyeOff, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button, Input } from '../components/ui';

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    await login(apiKey.trim());
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
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg shadow-indigo-500/20 mb-5">
            <MessageSquare className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-text mb-2 tracking-tight">پنل پیامک IPPanel</h1>
          <p className="text-sm text-text-dim">برای ورود، کلید دسترسی API خود را وارد کنید</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up">
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
            کلید API شما به صورت امن در مرورگر ذخیره می‌شود
          </p>
        </div>
      </div>
    </div>
  );
}
