import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/ippanel';
import {
  Send, Users, BookOpen, Smartphone, Zap,
  ChevronDown, CheckCircle, XCircle,
  MessageSquare, Wallet, Radio, Sparkles,
  FileText, Link, MapPin, Tag, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Input, Textarea, Select, Badge, SectionHeader, StatCard } from '../components/ui';
import { toPersianNumber } from '../utils/date';

type SendMode = 'single' | 'bulk' | 'phonebook' | 'mobile' | 'peer' | 'postal' | 'pattern';

export default function DashboardPage() {
  const { numbers, phonebooks, credit } = useAuthStore();
  const [activeMode, setActiveMode] = useState<SendMode | null>(null);

  const modes = [
    { id: 'single' as SendMode, title: 'ارسال تکی', desc: 'به یک یا چند شماره', icon: Send, accent: 'indigo' as const },
    { id: 'bulk' as SendMode, title: 'ارسال دسته‌جمعی', desc: 'ارسال انبوه پیامک', icon: Zap, accent: 'violet' as const },
    { id: 'peer' as SendMode, title: 'ارسال همتا‌به‌همتا', desc: 'پیام متفاوت به هر شماره', icon: Users, accent: 'sky' as const },
    { id: 'phonebook' as SendMode, title: 'دفترچه تلفن', desc: 'ارسال به مخاطبین', icon: BookOpen, accent: 'emerald' as const },
    { id: 'mobile' as SendMode, title: 'از گوشی', desc: 'مخاطبین گوشی', icon: Smartphone, accent: 'amber' as const },
    { id: 'postal' as SendMode, title: 'کد پستی', desc: 'ارسال بر اساس منطقه', icon: MapPin, accent: 'rose' as const },
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
                {toPersianNumber(Number(credit.credit).toFixed(0))}
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
          value={toPersianNumber(numbers.length)}
          icon={<Radio className="w-4 h-4" strokeWidth={1.5} />}
          accent="indigo"
        />
        <StatCard
          label="دفترچه تلفن"
          value={toPersianNumber(phonebooks.length)}
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
  const [mobileContacts, setMobileContacts] = useState<Array<{name: string, phone: string}>>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const loadMobileContacts = async () => {
    // Check if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
      toast.error('لطفاً از گوشی موبایل برای استفاده از این قابلیت استفاده کنید');
      return;
    }

    // Request contacts permission
    try {
      // @ts-ignore - Contact Picker API
      if ('contacts' in navigator && 'ContactsManager' in window) {
        // @ts-ignore
        const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: true });
        const formatted = contacts.map((c: any) => ({
          name: c.name[0] || 'بدون نام',
          phone: c.tel[0] || ''
        }));
        setMobileContacts(formatted);
        toast.success(`${toPersianNumber(formatted.length)} مخاطب بارگذاری شد`);
      } else {
        toast.error('مرورگر شما از دسترسی به مخاطبین پشتیبانی نمی‌کند');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        toast('انتخاب لغو شد');
      } else {
        toast.error('خطا در دریافت مخاطبین');
      }
    }
  };

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
      } else if (mode === 'mobile') {
        if (selectedContacts.length === 0) {
          toast.error('لطفاً حداقل یک مخاطب انتخاب کنید');
          setIsSending(false);
          return;
        }
        result = await api.sendSMS({
          from_number: selectedNumber,
          message,
          recipients: selectedContacts,
        });
      } else if (mode === 'peer') {
        // Peer to peer - each recipient gets different message
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

        result = await api.sendPeerToPeer({
          from_number: selectedNumber,
          params: [{ recipients: recipientList, message }],
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
    peer: 'ارسال همتا‌به‌همتا',
    phonebook: 'ارسال به دفترچه تلفن',
    mobile: 'ارسال از گوشی',
    postal: 'ارسال با کد پستی',
    pattern: 'ارسال با الگو',
  };

  const toggleContact = (phone: string) => {
    setSelectedContacts(prev => 
      prev.includes(phone) 
        ? prev.filter(p => p !== phone)
        : [...prev, phone]
    );
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

          {/* Recipients (not for phonebook mode) */}
          {mode !== 'phonebook' && mode !== 'mobile' && (
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

          {/* Mobile Contacts */}
          {mode === 'mobile' && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">مخاطبین گوشی</label>
              {mobileContacts.length === 0 ? (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={loadMobileContacts}
                  icon={<Phone className="w-4 h-4" />}
                  className="w-full"
                >
                  بارگذاری مخاطبین از گوشی
                </Button>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mobileContacts.map((contact, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-surface-2 border border-border cursor-pointer hover:bg-surface transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.phone)}
                        onChange={() => toggleContact(contact.phone)}
                        className="w-4 h-4 rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-text">{contact.name}</p>
                        <p className="text-xs text-text-dim font-mono" dir="ltr">{contact.phone}</p>
                      </div>
                    </label>
                  ))}
                  <p className="text-xs text-text-dim text-center mt-2">
                    {toPersianNumber(selectedContacts.length)} مخاطب انتخاب شده
                  </p>
                </div>
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
                    {pb.title} ({toPersianNumber(pb.count)} مخاطب)
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
              <span className="text-[11px] text-text-dim">{toPersianNumber(message.length)} کاراکتر</span>
              <span className="text-[11px] text-text-dim">{toPersianNumber(Math.ceil(message.length / 70))} بخش</span>
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
