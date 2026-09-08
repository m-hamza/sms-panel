import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Key, Eye, EyeOff, Loader2, MessageSquare, Shield, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#050a18]"></div>
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-[80px]"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="w-full max-w-[380px] relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="relative inline-flex items-center justify-center mb-5">
            {/* Outer ring */}
            <div className="absolute w-24 h-24 rounded-full border border-blue-500/20 animate-spin-slow"></div>
            {/* Middle ring */}
            <div className="absolute w-20 h-20 rounded-full border border-purple-500/15"></div>
            {/* Icon container */}
            <div className="relative w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pulse-ring">
              <MessageSquare className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
          </div>
          
          <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
            پنل پیامک <span className="bg-gradient-to-l from-blue-400 to-purple-400 bg-clip-text text-transparent">IPPanel</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            مدیریت حرفه‌ای پیامک با وب‌سرویس
          </p>
        </div>

        {/* Login Card */}
        <div className="animated-border animate-scale-in">
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5 relative noise-overlay">
            {/* Decorative top accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            
            {/* Section title */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">ورود به حساب</h2>
                <p className="text-[11px] text-slate-500">کلید دسترسی API خود را وارد کنید</p>
              </div>
            </div>

            {/* API Key Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                کلید API
              </label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-purple-500/10 group-focus-within:to-blue-500/10 transition-all duration-500"></div>
                <div className="relative flex items-center">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all duration-300"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute left-3 p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 rounded-xl p-3 animate-fade-in">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-400 text-xs">!</span>
                </div>
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !apiKey.trim()}
              className="w-full relative group overflow-hidden rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 gradient-primary opacity-90 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative py-3.5 flex items-center justify-center gap-2 text-white font-medium text-sm">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال احراز هویت...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>ورود به پنل</span>
                  </>
                )}
              </div>
            </button>

            {/* Helper Link */}
            <div className="text-center pt-1">
              <a
                href="https://edge.ippanel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-400 transition-colors group"
              >
                <span>دریافت کلید API</span>
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
              </a>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
            <div className="w-1 h-1 rounded-full bg-emerald-500/50"></div>
            <span>اتصال امن به سرور IPPanel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
