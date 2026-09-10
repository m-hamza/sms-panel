import { useAuthStore } from '../store/authStore';
import {
  Send, Users, BookOpen, Smartphone, Zap,
  Wallet, Radio, Sparkles, CheckSquare
} from 'lucide-react';
import { Card, StatCard } from '../components/ui';
import { toPersianNumber } from '../utils/date';
import BottomNav from '../components/BottomNav';

type SendMode = 'single' | 'bulk' | 'phonebook' | 'phonebook_select' | 'mobile' | 'peer' | 'pattern';

interface DashboardPageProps {
  onNavigate: (mode: SendMode) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { numbers, phonebooks, credit } = useAuthStore();

  const modes = [
    { id: 'single' as SendMode, title: 'ارسال تکی', desc: 'ارسال پیامک به یک شماره', icon: Send, accent: 'indigo' as const },
    { id: 'bulk' as SendMode, title: 'ارسال دسته‌جمعی', desc: 'ارسال به چند شماره', icon: Zap, accent: 'violet' as const },
    { id: 'peer' as SendMode, title: 'همتا‌به‌همتا', desc: 'پیام متفاوت به هر شماره', icon: Users, accent: 'sky' as const },
    { id: 'phonebook' as SendMode, title: 'دفترچه تلفن', desc: 'ارسال به همه مخاطبین', icon: BookOpen, accent: 'emerald' as const },
    { id: 'phonebook_select' as SendMode, title: 'دفترچه تلفن موردی', desc: 'انتخاب مخاطبین خاص', icon: CheckSquare, accent: 'rose' as const },
    { id: 'mobile' as SendMode, title: 'از گوشی', desc: 'مخاطبین گوشی', icon: Smartphone, accent: 'amber' as const },
    { id: 'pattern' as SendMode, title: 'الگوی پیام', desc: 'ارسال با الگوی آماده', icon: Sparkles, accent: 'purple' as const },
  ];

  const accentColors: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/20',
    violet: 'from-violet-500 to-purple-600 shadow-violet-500/20',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/20',
    sky: 'from-sky-500 to-cyan-500 shadow-sky-500/20',
    rose: 'from-rose-500 to-pink-500 shadow-rose-500/20',
    purple: 'from-purple-500 to-fuchsia-500 shadow-purple-500/20',
  };

  return (
    <div className="px-4 pt-6 pb-28 space-y-6">
      <header className="animate-fade-in">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold text-text tracking-tight">پیشخوان</h1>
            <p className="text-xs text-text-dim mt-0.5">مدیریت و ارسال پیامک</p>
          </div>
          {credit?.credit && (
            <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-3 py-2">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-text">
                {toPersianNumber(Number(credit.credit).toFixed(0))}
              </span>
              <span className="text-[10px] text-text-dim">ریال</span>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 stagger">
        <StatCard
          label="خط فعال"
          value={numbers.length > 0 ? toPersianNumber(numbers.length) : '...'}
          icon={<Radio className="w-4 h-4" strokeWidth={1.5} />}
          accent="indigo"
        />
        <StatCard
          label="دفترچه تلفن"
          value={phonebooks.length > 0 ? toPersianNumber(phonebooks.length) : '...'}
          icon={<Users className="w-4 h-4" strokeWidth={1.5} />}
          accent="emerald"
        />
      </div>

      <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-sm font-medium text-text-muted mb-3 text-center">امکانات ارسال</h2>
        <div className="grid grid-cols-2 gap-3">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onNavigate(mode.id)}
              className="card card-interactive p-4 flex flex-col items-center text-center group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accentColors[mode.accent]} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
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
