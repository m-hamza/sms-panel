import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/ippanel';
import {
  Send, Users, BookOpen, Smartphone, Zap,
  ChevronDown, Loader2, XCircle,
  MessageSquare, Hash, ArrowUpRight, Wallet, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

type SendMode = 'single' | 'bulk' | 'phonebook' | 'mobile';

export default function DashboardPage() {
  const { numbers, phonebooks, credit } = useAuthStore();
  const [activeMode, setActiveMode] = useState<SendMode | null>(null);

  const modes = [
    { id: 'single' as SendMode, title: 'ارسال تکی', desc: 'ارسال به یک یا چند شماره', icon: Send, gradient: 'from-blue-500 to-cyan-500', borderClass: 'gradient-border' },
    { id: 'bulk' as SendMode, title: 'ارسال دسته‌جمعی', desc: 'ارسال انبوه به تعداد بالا', icon: Zap, gradient: 'from-purple-500 to-pink-500', borderClass: 'gradient-border-purple' },
    { id: 'phonebook' as SendMode, title: 'دفترچه تلفن', desc: 'ارسال به مخاطبین ذخیره', icon: BookOpen, gradient: 'from-emerald-500 to-teal-500', borderClass: 'gradient-border-emerald' },
    { id: 'mobile' as SendMode, title: 'ارسال از گوشی', desc: 'ارسال از شماره‌های موبایل', icon: Smartphone, gradient: 'from-orange-500 to-amber-500', borderClass: 'gradient-border-gold' },
  ];

  return (
    <div className="p-4 pb-28 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">پیشخوان</h1>
          <p className="text-xs text-slate-500 mt-0.5">مدیریت و ارسال پیامک</p>
        </div>
        {credit && (
          <div className="gradient-border-emerald rounded-xl px-3 py-2 flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-300">
              {Number(credit.credit).toLocaleString('fa-IR', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-emerald-500">ریال</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="gradient-border rounded-xl p-3.5 card-hover">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-white">{numbers.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">خط فعال</p>
        </div>
        <div className="gradient-border-purple rounded-xl p-3.5 card-hover">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-white">{phonebooks.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">دفترچه تلفن</p>
        </div>
        <div className="gradient-border-emerald rounded-xl p-3.5 card-hover">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-white">
            {credit ? Number(credit.credit / 10000).toLocaleString('fa-IR', { maximumFractionDigits: 0 }) : '0'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">هزار ریال</p>
        </div>
      </div>

      {/* Send Modes Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300">روش ارسال پیامک</h2>
          <div className="w-6 h-[1px] bg-gradient-to-l from-blue-500/50 to-transparent"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {modes.map((mode, idx) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`${mode.borderClass} rounded-2xl p-4 text-right transition-all duration-300 hover:scale-[1.03] active:scale-95 group relative overflow-hidden`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <mode.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="relative text-sm font-semibold text-white mb-0.5">{mode.title}</h3>
              <p className="relative text-[11px] text-slate-500 leading-relaxed">{mode.desc}</p>
              <ArrowUpRight className="absolute top-3 left-3 w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Send Form */}
      {activeMode && (
        <SendForm
          mode={activeMode}
          numbers={numbers}
          phonebooks={phonebooks}
          onClose={() => setActiveMode(null)}
        />
      )}

      {/* Features Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300">امکانات پنل</h2>
          <div className="w-6 h-[1px] bg-gradient-to-l from-purple-500/50 to-transparent"></div>
        </div>
        <div className="space-y-2">
          {[
            { title: 'ارسال پیامک انبوه', desc: 'ارسال به هزاران شماره', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { title: 'گزارش‌گیری پیشرفته', desc: 'آمار کامل ارسال‌ها', icon: Hash, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { title: 'مدیریت دفترچه تلفن', desc: 'ذخیره و مدیریت مخاطبین', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { title: 'ارسال بر اساس الگو', desc: 'ارسال با قالب آماده', icon: MessageSquare, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map((item, i) => (
            <div key={i} className="glass-card rounded-xl p-3.5 flex items-center justify-between card-hover group">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-200 block">{item.title}</span>
                  <span className="text-[11px] text-slate-500">{item.desc}</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full font-medium border border-emerald-500/20">
                فعال
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// === Send Form Component ===
function SendForm({ mode, numbers, phonebooks, onClose }: {
  mode: SendMode;
  numbers: any[];
  phonebooks: any[];
  onClose: () => void;
}) {
  const [selectedNumber, setSelectedNumber] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('');
  const [selectedPhonebook, setSelectedPhonebook] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);

  const handleSend = async () => {
    if (!selectedNumber || !message) {
      toast.error('لطفاً شماره فرستنده و متن پیام را وارد کنید');
      return;
    }

    setIsSending(true);
    try {
      let result;
      
      if (mode === 'phonebook') {
        if (!selectedPhonebook) {
          toast.error('لطفاً دفترچه تلفن را انتخاب کنید');
          setIsSending(false);
          return;
        }
        result = await api.sendToPhonebook({
          from_number: selectedNumber,
          message,
          params: [{ phonebook_id: selectedPhonebook, type: 'all' }],
        });
      } else {
        const recipientList = recipients
          .split(/[\n,،]/)
          .map(r => r.trim())
          .filter(r => r.length > 0)
          .map(r => r.startsWith('+') ? r : `+98${r.replace(/^0/, '')}`);

        if (recipientList.length === 0) {
          toast.error('لطفاً حداقل یک شماره گیرنده وارد کنید');
          setIsSending(false);
          return;
        }

        result = await api.sendSMS({
          from_number: selectedNumber,
          message,
          recipients: recipientList,
        });
      }

      if (result.meta.status) {
        toast.success('پیامک با موفقیت ارسال شد ✓');
        onClose();
      } else {
        toast.error(result.meta.message || 'خطا در ارسال پیامک');
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در ارسال');
    } finally {
      setIsSending(false);
    }
  };

  const modeConfig: Record<SendMode, { title: string; gradient: string }> = {
    single: { title: 'ارسال تکی', gradient: 'from-blue-500 to-cyan-500' },
    bulk: { title: 'ارسال دسته‌جمعی', gradient: 'from-purple-500 to-pink-500' },
    phonebook: { title: 'ارسال به دفترچه تلفن', gradient: 'from-emerald-500 to-teal-500' },
    mobile: { title: 'ارسال از گوشی', gradient: 'from-orange-500 to-amber-500' },
  };

  const config = modeConfig[mode];

  return (
    <div className="animated-border animate-slide-up">
      <div className="glass-card rounded-2xl p-5 space-y-4 relative noise-overlay">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
              <Send className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white">{config.title}</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-all">
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Select Number */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-medium">شماره فرستنده</label>
          <div className="relative">
            <button
              onClick={() => setShowNumbers(!showNumbers)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-right text-sm text-white flex items-center justify-between hover:border-slate-600/80 transition-colors"
            >
              <span className={selectedNumber ? 'text-white' : 'text-slate-500'}>{selectedNumber || 'انتخاب خط...'}</span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showNumbers ? 'rotate-180' : ''}`} />
            </button>
            {showNumbers && (
              <div className="absolute top-full mt-1.5 w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden z-20 shadow-2xl max-h-48 overflow-y-auto animate-scale-in">
                {numbers.map((num: any) => (
                  <button
                    key={num.id}
                    onClick={() => { setSelectedNumber(num.number); setShowNumbers(false); }}
                    className="w-full text-right px-3 py-2.5 text-sm text-slate-200 hover:bg-blue-500/10 hover:text-blue-300 transition-colors border-b border-slate-800/50 last:border-0"
                    dir="ltr"
                  >
                    {num.alias || num.number}
                  </button>
                ))}
                {numbers.length === 0 && (
                  <p className="px-3 py-3 text-sm text-slate-500 text-center">خطی یافت نشد</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recipients */}
        {mode !== 'phonebook' && (
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium">
              {mode === 'single' ? 'شماره گیرنده' : 'شماره‌های گیرنده'}
            </label>
            {mode === 'single' ? (
              <input
                type="tel"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="09120000000"
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                dir="ltr"
              />
            ) : (
              <textarea
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder={"09120000000\n09350000000"}
                rows={3}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 resize-none transition-colors"
                dir="ltr"
              />
            )}
          </div>
        )}

        {/* Phonebook Select */}
        {mode === 'phonebook' && (
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium">دفترچه تلفن</label>
            <select
              value={selectedPhonebook}
              onChange={(e) => setSelectedPhonebook(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="">انتخاب کنید...</option>
              {phonebooks.map((pb: any) => (
                <option key={pb.id} value={pb.id}>
                  {pb.title} ({pb.count} مخاطب)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Message */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-medium">متن پیام</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="متن پیامک خود را وارد کنید..."
            rows={4}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 resize-none transition-colors"
          />
          <div className="flex justify-between">
            <span className="text-[11px] text-slate-600">{message.length} کاراکتر</span>
            <span className="text-[11px] text-slate-600">{Math.ceil(message.length / 70)} بخش</span>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isSending}
          className="w-full relative group overflow-hidden rounded-xl disabled:opacity-50"
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="relative py-3 flex items-center justify-center gap-2 text-white font-medium text-sm">
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال ارسال...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>ارسال پیامک</span>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
