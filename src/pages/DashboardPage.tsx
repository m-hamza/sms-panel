import { Wallet, Radio, Users, Send, Zap, BookOpen, Smartphone, Sparkles, CheckSquare } from 'lucide-react';
import { toPersianNumber } from '../utils/format';
import BottomNav from '../components/BottomNav';

interface DashboardPageProps {
  numbers: any[];
  phonebooks: any[];
  credit: any;
}

export default function DashboardPage({ numbers, phonebooks, credit }: DashboardPageProps) {
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
            <button key={mode.id} className="card card-interactive p-4 flex flex-col items-center text-center group">
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
