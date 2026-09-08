import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/ippanel';
import {
  Send, Users, BookOpen, Smartphone, Zap,
  ChevronDown, Loader2, CheckCircle, XCircle,
  MessageSquare, Hash
} from 'lucide-react';
import toast from 'react-hot-toast';

type SendMode = 'single' | 'bulk' | 'phonebook' | 'mobile';

export default function DashboardPage() {
  const { numbers, phonebooks, credit } = useAuthStore();
  const [activeMode, setActiveMode] = useState<SendMode | null>(null);

  const modes = [
    { id: 'single' as SendMode, title: 'ارسال تکی', desc: 'ارسال پیامک به یک یا چند شماره', icon: Send, color: 'from-blue-500 to-blue-600' },
    { id: 'bulk' as SendMode, title: 'ارسال دسته‌جمعی', desc: 'ارسال پیامک به تعداد بالا', icon: Zap, color: 'from-purple-500 to-purple-600' },
    { id: 'phonebook' as SendMode, title: 'ارسال به دفترچه تلفن', desc: 'ارسال به مخاطبین دفترچه', icon: BookOpen, color: 'from-emerald-500 to-emerald-600' },
    { id: 'mobile' as SendMode, title: 'ارسال از گوشی', desc: 'ارسال از شماره‌های گوشی', icon: Smartphone, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="p-4 pb-24 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-white">پیشخوان</h1>
        {credit && (
          <div className="glass-light rounded-xl px-3 py-1.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs text-emerald-300">
              {Number(credit.credit).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ریال
            </span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{numbers.length}</p>
          <p className="text-xs text-slate-400">خط فعال</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{phonebooks.length}</p>
          <p className="text-xs text-slate-400">دفترچه تلفن</p>
        </div>
      </div>

      {/* Send Modes */}
      <div>
        <h2 className="text-sm font-medium text-slate-400 mb-3">روش ارسال پیامک</h2>
        <div className="grid grid-cols-2 gap-3">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`glass rounded-xl p-4 text-right transition-all hover:scale-[1.02] active:scale-95 ${
                activeMode === mode.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-3 shadow-lg`}>
                <mode.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-medium text-white mb-1">{mode.title}</h3>
              <p className="text-xs text-slate-400">{mode.desc}</p>
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

      {/* Features List */}
      <div>
        <h2 className="text-sm font-medium text-slate-400 mb-3">امکانات پنل</h2>
        <div className="space-y-2">
          {[
            { title: 'ارسال پیامک انبوه', icon: Zap, badge: 'فعال' },
            { title: 'گزارش‌گیری پیشرفته', icon: Hash, badge: 'فعال' },
            { title: 'مدیریت دفترچه تلفن', icon: Users, badge: 'فعال' },
            { title: 'ارسال بر اساس الگو', icon: MessageSquare, badge: 'فعال' },
          ].map((item, i) => (
            <div key={i} className="glass-light rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-slate-300" />
                </div>
                <span className="text-sm text-slate-200">{item.title}</span>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Send Form Component
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
        toast.success('پیامک با موفقیت ارسال شد');
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

  const modeTitles: Record<SendMode, string> = {
    single: 'ارسال تکی',
    bulk: 'ارسال دسته‌جمعی',
    phonebook: 'ارسال به دفترچه تلفن',
    mobile: 'ارسال از گوشی',
  };

  return (
    <div className="glass rounded-2xl p-4 space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-white">{modeTitles[mode]}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Select Number */}
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">شماره فرستنده</label>
        <div className="relative">
          <button
            onClick={() => setShowNumbers(!showNumbers)}
            className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl py-2.5 px-3 text-right text-sm text-white flex items-center justify-between"
          >
            <span>{selectedNumber || 'انتخاب کنید...'}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showNumbers ? 'rotate-180' : ''}`} />
          </button>
          {showNumbers && (
            <div className="absolute top-full mt-1 w-full bg-slate-800 border border-slate-600/50 rounded-xl overflow-hidden z-20 shadow-xl max-h-48 overflow-y-auto">
              {numbers.map((num: any) => (
                <button
                  key={num.id}
                  onClick={() => { setSelectedNumber(num.number); setShowNumbers(false); }}
                  className="w-full text-right px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                  dir="ltr"
                >
                  {num.alias || num.number}
                </button>
              ))}
              {numbers.length === 0 && (
                <p className="px-3 py-2 text-sm text-slate-500 text-center">خطی یافت نشد</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recipients (not for phonebook mode) */}
      {mode !== 'phonebook' && (
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">
            {mode === 'single' ? 'شماره گیرنده' : 'شماره‌های گیرنده (هر شماره در یک خط)'}
          </label>
          {mode === 'single' ? (
            <input
              type="tel"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="09120000000"
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              dir="ltr"
            />
          ) : (
            <textarea
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder={"09120000000\n09350000000"}
              rows={3}
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              dir="ltr"
            />
          )}
        </div>
      )}

      {/* Phonebook Select */}
      {mode === 'phonebook' && (
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">دفترچه تلفن</label>
          <select
            value={selectedPhonebook}
            onChange={(e) => setSelectedPhonebook(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
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
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">متن پیام</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="متن پیامک خود را وارد کنید..."
          rows={4}
          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-500">{message.length} کاراکتر</span>
          <span className="text-xs text-slate-500">{Math.ceil(message.length / 70)} بخش</span>
        </div>
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={isSending}
        className="w-full gradient-primary text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>در حال ارسال...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>ارسال پیامک</span>
          </>
        )}
      </button>
    </div>
  );
}
