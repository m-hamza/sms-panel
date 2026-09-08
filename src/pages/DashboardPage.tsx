import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/ippanel';
import {
  Send, Users, BookOpen, Smartphone, Zap,
  ChevronDown, CheckCircle, XCircle,
  MessageSquare, Wallet, Radio, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Input, Textarea, Select, Badge, SectionHeader, StatCard } from '../components/ui';

type SendMode = 'single' | 'bulk' | 'phonebook' | 'mobile';

export default function DashboardPage() {
  const { numbers, phonebooks, credit } = useAuthStore();
  const [activeMode, setActiveMode] = useState<SendMode | null>(null);

  const modes = [
    { id: 'single' as SendMode, title: 'ارسال تکی', desc: 'به یک یا چند شماره', icon: Send, accent: 'indigo' as const },
    { id: 'bulk' as SendMode, title: 'ارسال دسته‌جمعی', desc: 'ارسال انبوه پیامک', icon: Zap, accent: 'violet' as const },
    { id: 'phonebook' as SendMode, title: 'دفترچه تلفن', desc: 'ارسال به مخاطبین', icon: BookOpen, accent: 'emerald' as const },
    { id: 'mobile' as SendMode, title: 'از گوشی', desc: 'ارسال از شماره‌ها', icon: Smartphone, accent: 'amber' as const },
  ];

  const accentColors: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/20',
    violet: 'from-violet-500 to-purple-600 shadow-violet-500/20',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/20',
  };

  return (
    <div className="px-4 pt-6 pb-28 space-y-6">
      {/* Hero Header */}
      <header className="animate-fade-in">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold text-text tracking-tight">پیشخوان</h1>
            <p className="text-xs text-text-dim mt-0.5">مدیریت و ارسال پیامک</p>
          </div>
          {credit && (
            <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-3 py-2">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-text">
                {Number(credit.credit).toLocaleString('fa-IR', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] text-text-dim">ریال</span>
            </div>
          )}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 stagger">
        <StatCard
          label="خط فعال"
          value={numbers.length}
          icon={<Radio className="w-4 h-4" strokeWidth={1.5} />}
          accent="indigo"
        />
        <StatCard
          label="دفترچه تلفن"
          value={phonebooks.length}
          icon={<Users className="w-4 h-4" strokeWidth={1.5} />}
          accent="emerald"
        />
      </div>

      {/* Quick Send Actions */}
      <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <SectionHeader title="ارسال پیامک" />
        <div className="grid grid-cols-2 gap-3">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className="card card-interactive p-4 text-right group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentColors[mode.accent]} flex items-center justify-center mb-3 shadow-lg group-hover:scale-105 transition-transform`}>
                <mode.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-medium text-text mb-0.5">{mode.title}</h3>
              <p className="text-[11px] text-text-dim">{mode.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Send Form Modal */}
      {activeMode && (
        <SendForm
          mode={activeMode}
          numbers={numbers}
          phonebooks={phonebooks}
          onClose={() => setActiveMode(null)}
        />
      )}

      {/* Features */}
      <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <SectionHeader title="امکانات" />
        <Card className="divide-y divide-border">
          {[
            { title: 'ارسال پیامک انبوه', icon: Zap, status: true },
            { title: 'گزارش‌گیری پیشرفته', icon: MessageSquare, status: true },
            { title: 'مدیریت دفترچه تلفن', icon: Users, status: true },
            { title: 'ارسال بر اساس الگو', icon: Sparkles, status: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
                </div>
                <span className="text-sm text-text">{item.title}</span>
              </div>
              <Badge variant="success">فعال</Badge>
            </div>
          ))}
        </Card>
      </section>
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-5 pb-8 sm:pb-5 max-h-[90vh] overflow-y-auto animate-slide-in-bottom">
        {/* Handle bar (mobile) */}
        <div className="sm:hidden w-10 h-1 bg-border-strong rounded-full mx-auto mb-4"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-text">{modeTitles[mode]}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-text-dim hover:text-text transition-colors">
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Select Number */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">شماره فرستنده</label>
            <div className="relative">
              <button
                onClick={() => setShowNumbers(!showNumbers)}
                className="input flex items-center justify-between text-right"
              >
                <span className={selectedNumber ? 'text-text font-mono text-sm' : 'text-text-dim'}>
                  {selectedNumber || 'انتخاب کنید...'}
                </span>
                <ChevronDown className={`w-4 h-4 text-text-dim transition-transform ${showNumbers ? 'rotate-180' : ''}`} />
              </button>
              {showNumbers && (
                <div className="absolute top-full mt-1 w-full bg-surface-2 border border-border-strong rounded-xl overflow-hidden z-20 shadow-2xl max-h-48 overflow-y-auto">
                  {numbers.map((num: any) => (
                    <button
                      key={num.id}
                      onClick={() => { setSelectedNumber(num.number); setShowNumbers(false); }}
                      className="w-full text-right px-3 py-2.5 text-sm text-text hover:bg-surface border-b border-border last:border-0 transition-colors"
                      dir="ltr"
                    >
                      {num.alias || num.number}
                    </button>
                  ))}
                  {numbers.length === 0 && (
                    <p className="px-3 py-3 text-xs text-text-dim text-center">خطی یافت نشد</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recipients */}
          {mode !== 'phonebook' && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                {mode === 'single' ? 'شماره گیرنده' : 'شماره‌های گیرنده (هر شماره در یک خط)'}
              </label>
              {mode === 'single' ? (
                <Input
                  type="tel"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="09120000000"
                  dir="ltr"
                  className="font-mono"
                />
              ) : (
                <Textarea
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder={"09120000000\n09350000000"}
                  rows={3}
                  dir="ltr"
                  className="font-mono"
                />
              )}
            </div>
          )}

          {/* Phonebook Select */}
          {mode === 'phonebook' && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">دفترچه تلفن</label>
              <Select
                value={selectedPhonebook}
                onChange={(e) => setSelectedPhonebook(e.target.value)}
              >
                <option value="">انتخاب کنید...</option>
                {phonebooks.map((pb: any) => (
                  <option key={pb.id} value={pb.id}>
                    {pb.title} ({pb.count} مخاطب)
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">متن پیام</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="متن پیامک خود را وارد کنید..."
              rows={4}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[11px] text-text-dim">{message.length} کاراکتر</span>
              <span className="text-[11px] text-text-dim">{Math.ceil(message.length / 70)} بخش</span>
            </div>
          </div>

          {/* Send Button */}
          <Button
            variant="primary"
            size="lg"
            loading={isSending}
            onClick={handleSend}
            icon={<Send className="w-4 h-4" />}
            className="w-full"
          >
            ارسال پیامک
          </Button>
        </div>
      </div>
    </div>
  );
}
