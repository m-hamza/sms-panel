import { useState } from 'react';
import { Key, Eye, EyeOff, MessageSquare } from 'lucide-react';

interface LoginPageProps {
  login: (apiKey: string) => Promise<boolean>;
}

export default function LoginPage({ login }: LoginPageProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setLoading(true);
    await login(apiKey.trim());
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
          <p className="text-sm text-text-dim">برای ورود، کلید API خود را وارد کنید</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">کلید دسترسی API</label>
            <div className="relative">
              <Key className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="کلید API..." className="input pr-10 pl-10 font-mono text-sm" dir="ltr" autoFocus />
              <button type="button" onClick={() => setShowKey(!showKey)} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"><EyeOff className="w-4 h-4" /></button>
            </div>
          </div>
          <button type="submit" disabled={loading || !apiKey.trim()} className="btn btn-primary w-full" style={{ padding: '14px' }}>
            {loading ? <span className="animate-spin">⏳</span> : null}
            ورود به پنل
          </button>
        </form>
      </div>
    </div>
  );
}
