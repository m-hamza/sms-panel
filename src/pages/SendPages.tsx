import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/ippanel';
import {
  Send, Users, BookOpen, Smartphone, Zap,
  ChevronDown, CheckSquare, Sparkles, Phone,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Input, Textarea, Select, Button } from '../components/ui';
import { toPersianNumber, formatPhoneNumber, parsePhoneNumbers } from '../utils/date';
import SendPageLayout from '../components/SendPageLayout';

type SendMode = 'single' | 'bulk' | 'phonebook' | 'phonebook_select' | 'mobile' | 'peer' | 'pattern';

interface SendPagesProps {
  mode: SendMode;
  onBack: () => void;
}

export default function SendPages({ mode, onBack }: SendPagesProps) {
  const { numbers, phonebooks } = useAuthStore();
  const [patterns, setPatterns] = useState<any[]>([]);

  useEffect(() => {
    if (mode === 'pattern') {
      loadPatterns();
    }
  }, [mode]);

  const loadPatterns = async () => {
    try {
      const result = await api.getPatterns(1, 100, { state: 'active' });
      if (result.meta.status) {
        setPatterns(result.data || []);
      }
    } catch (err) {
      console.error('Error loading patterns:', err);
    }
  };

  switch (mode) {
    case 'single':
      return <SingleSendPage numbers={numbers} onBack={onBack} />;
    case 'bulk':
      return <BulkSendPage numbers={numbers} onBack={onBack} />;
    case 'peer':
      return <PeerSendPage numbers={numbers} onBack={onBack} />;
    case 'phonebook':
      return <PhonebookSendPage numbers={numbers} phonebooks={phonebooks} onBack={onBack} />;
    case 'phonebook_select':
      return <PhonebookSelectPage numbers={numbers} phonebooks={phonebooks} onBack={onBack} />;
    case 'mobile':
      return <MobileSendPage numbers={numbers} onBack={onBack} />;
    case 'pattern':
      return <PatternSendPage numbers={numbers} patterns={patterns} onBack={onBack} />;
    default:
      return null;
  }
}

// Number Selector Component
function NumberSelector({ numbers, selected, onSelect }: {
  numbers: any[];
  selected: string;
  onSelect: (num: string) => void;
}) {
  const [show, setShow] = useState(false);
  
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1.5">شماره فرستنده</label>
      <div className="relative">
        <button
          onClick={() => setShow(!show)}
          className="input flex items-center justify-between text-right"
        >
          <span className={selected ? 'text-text font-mono text-sm' : 'text-text-dim'}>
            {selected || 'انتخاب کنید...'}
          </span>
          <ChevronDown className={`w-4 h-4 text-text-dim transition-transform ${show ? 'rotate-180' : ''}`} />
        </button>
        {show && (
          <div className="absolute top-full mt-1 w-full bg-surface-2 border border-border-strong rounded-xl overflow-hidden z-20 shadow-2xl max-h-48 overflow-y-auto">
            {numbers.map((num: any) => (
              <button
                key={num.id}
                onClick={() => { onSelect(num.number); setShow(false); }}
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
  );
}

// Single Send Page
function SingleSendPage({ numbers, onBack }: { numbers: any[]; onBack: () => void }) {
  const [selectedNumber, setSelectedNumber] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!selectedNumber || !recipient || !message) {
      toast.error('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    setIsSending(true);
    try {
      const result = await api.sendSMS({
        from_number: formatPhoneNumber(selectedNumber),
        message,
        recipients: [formatPhoneNumber(recipient)],
      });

      if (result.meta.status) {
        toast.success('پیامک با موفقیت ارسال شد');
        onBack();
      } else {
        toast.error(result.meta.message || 'خطا در ارسال');
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در ارسال');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SendPageLayout
      title="ارسال تکی"
      description="ارسال پیامک به یک شماره"
      icon={<Send className="w-4 h-4 text-white" strokeWidth={1.5} />}
      accentColor="from-indigo-500 to-indigo-600 shadow-indigo-500/20"
      onBack={onBack}
      onSend={handleSend}
      isSending={isSending}
    >
      <NumberSelector numbers={numbers} selected={selectedNumber} onSelect={setSelectedNumber} />
      
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">شماره گیرنده</label>
        <Input
          type="tel"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="09120000000"
          dir="ltr"
          className="font-mono"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">متن پیام</label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="متن پیامک خود را وارد کنید..."
          rows={5}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-text-dim">{toPersianNumber(message.length)} کاراکتر</span>
          <span className="text-[11px] text-text-dim">{toPersianNumber(Math.ceil(message.length / 70))} بخش</span>
        </div>
      </div>
    </SendPageLayout>
  );
}

// Bulk Send Page
function BulkSendPage({ numbers, onBack }: { numbers: any[]; onBack: () => void }) {
  const [selectedNumber, setSelectedNumber] = useState('');
  const [recipients, setRecipients] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!selectedNumber || !recipients || !message) {
      toast.error('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    const recipientList = parsePhoneNumbers(recipients);
    if (recipientList.length === 0) {
      toast.error('لطفاً حداقل یک شماره گیرنده وارد کنید');
      return;
    }

    setIsSending(true);
    try {
      const result = await api.sendSMS({
        from_number: formatPhoneNumber(selectedNumber),
        message,
        recipients: recipientList,
      });

      if (result.meta.status) {
        toast.success(`پیامک به ${toPersianNumber(recipientList.length)} شماره ارسال شد`);
        onBack();
      } else {
        toast.error(result.meta.message || 'خطا در ارسال');
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در ارسال');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SendPageLayout
      title="ارسال دسته‌جمعی"
      description="ارسال به چند شماره"
      icon={<Zap className="w-4 h-4 text-white" strokeWidth={1.5} />}
      accentColor="from-violet-500 to-purple-600 shadow-violet-500/20"
      onBack={onBack}
      onSend={handleSend}
      isSending={isSending}
    >
      <NumberSelector numbers={numbers} selected={selectedNumber} onSelect={setSelectedNumber} />
      
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">شماره‌های گیرنده (هر شماره در یک خط)</label>
        <Textarea
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          placeholder={"09120000000\n09350000000"}
          rows={5}
          dir="ltr"
          className="font-mono"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">متن پیام</label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="متن پیامک خود را وارد کنید..."
          rows={5}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-text-dim">{toPersianNumber(message.length)} کاراکتر</span>
          <span className="text-[11px] text-text-dim">{toPersianNumber(Math.ceil(message.length / 70))} بخش</span>
        </div>
      </div>
    </SendPageLayout>
  );
}

// Peer to Peer Send Page
function PeerSendPage({ numbers, onBack }: { numbers: any[]; onBack: () => void }) {
  const [selectedNumber, setSelectedNumber] = useState('');
  const [recipients, setRecipients] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!selectedNumber || !recipients) {
      toast.error('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    const lines = recipients.split('\n').filter(l => l.trim());
    const params = lines.map(line => {
      const parts = line.split('|').map(p => p.trim());
      return {
        recipients: [formatPhoneNumber(parts[0])],
        message: parts[1] || '',
      };
    }).filter(p => p.message);

    if (params.length === 0) {
      toast.error('لطفاً حداقل یک شماره و پیام وارد کنید');
      return;
    }

    setIsSending(true);
    try {
      const result = await api.sendPeerToPeer({
        from_number: formatPhoneNumber(selectedNumber),
        params,
      });

      if (result.meta.status) {
        toast.success(`پیامک به ${toPersianNumber(params.length)} شماره ارسال شد`);
        onBack();
      } else {
        toast.error(result.meta.message || 'خطا در ارسال');
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در ارسال');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SendPageLayout
      title="ارسال همتا‌به‌همتا"
      description="پیام متفاوت به هر شماره"
      icon={<Users className="w-4 h-4 text-white" strokeWidth={1.5} />}
      accentColor="from-sky-500 to-cyan-500 shadow-sky-500/20"
      onBack={onBack}
      onSend={handleSend}
      isSending={isSending}
    >
      <NumberSelector numbers={numbers} selected={selectedNumber} onSelect={setSelectedNumber} />
      
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">شماره و پیام (هر خط: شماره|پیام)</label>
        <Textarea
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          placeholder={"09120000000|سلام\n09350000000|درود"}
          rows={8}
          dir="ltr"
          className="font-mono"
        />
        <p className="text-[11px] text-text-dim mt-1.5">
          فرمت: هر خط شامل شماره و پیام جدا شده با |
        </p>
      </div>
    </SendPageLayout>
  );
}

// Phonebook Send Page
function PhonebookSendPage({ numbers, phonebooks, onBack }: { numbers: any[]; phonebooks: any[]; onBack: () => void }) {
  const [selectedNumber, setSelectedNumber] = useState('');
  const [selectedPhonebook, setSelectedPhonebook] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!selectedNumber || !selectedPhonebook || !message) {
      toast.error('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    setIsSending(true);
    try {
      const result = await api.sendToPhonebook({
        from_number: formatPhoneNumber(selectedNumber),
        message,
        params: [{ phonebook_id: selectedPhonebook, type: 'all' }],
      });

      if (result.meta.status) {
        toast.success('پیامک به دفترچه تلفن ارسال شد');
        onBack();
      } else {
        toast.error(result.meta.message || 'خطا در ارسال');
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در ارسال');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SendPageLayout
      title="ارسال به دفترچه تلفن"
      description="ارسال به همه مخاطبین"
      icon={<BookOpen className="w-4 h-4 text-white" strokeWidth={1.5} />}
      accentColor="from-emerald-500 to-emerald-600 shadow-emerald-500/20"
      onBack={onBack}
      onSend={handleSend}
      isSending={isSending}
    >
      <NumberSelector numbers={numbers} selected={selectedNumber} onSelect={setSelectedNumber} />
      
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

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">متن پیام</label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="متن پیامک خود را وارد کنید..."
          rows={5}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-text-dim">{toPersianNumber(message.length)} کاراکتر</span>
          <span className="text-[11px] text-text-dim">{toPersianNumber(Math.ceil(message.length / 70))} بخش</span>
        </div>
      </div>
    </SendPageLayout>
  );
}

// Phonebook Select Page
function PhonebookSelectPage({ numbers, phonebooks, onBack }: { numbers: any[]; phonebooks: any[]; onBack: () => void }) {
  const [selectedNumber, setSelectedNumber] = useState('');
  const [selectedPhonebook, setSelectedPhonebook] = useState('');
  const [phonebookNumbers, setPhonebookNumbers] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loadingNumbers, setLoadingNumbers] = useState(false);

  const loadPhonebookNumbers = async (phonebookId: string) => {
    if (!phonebookId) {
      setPhonebookNumbers([]);
      setSelectedContacts([]);
      return;
    }

    setLoadingNumbers(true);
    try {
      const result = await api.getPhonebookNumbers(phonebookId, 1, 1000);
      if (result.meta.status) {
        setPhonebookNumbers(result.data || []);
        setSelectedContacts([]);
        toast.success(`${toPersianNumber((result.data || []).length)} مخاطب بارگذاری شد`);
      } else {
        toast.error(result.meta.message || 'خطا در بارگذاری');
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در بارگذاری');
    } finally {
      setLoadingNumbers(false);
    }
  };

  const toggleContact = (number: string) => {
    setSelectedContacts(prev => 
      prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]
    );
  };

  const selectAll = () => {
    if (selectedContacts.length === phonebookNumbers.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(phonebookNumbers.map((n: any) => n.number));
    }
  };

  const handleSend = async () => {
    if (!selectedNumber || selectedContacts.length === 0 || !message) {
      toast.error('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    setIsSending(true);
    try {
      const result = await api.sendSMS({
        from_number: formatPhoneNumber(selectedNumber),
        message,
        recipients: selectedContacts,
      });

      if (result.meta.status) {
        toast.success(`پیامک به ${toPersianNumber(selectedContacts.length)} مخاطب ارسال شد`);
        onBack();
      } else {
        toast.error(result.meta.message || 'خطا در ارسال');
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در ارسال');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SendPageLayout
      title="دفترچه تلفن موردی"
      description="انتخاب مخاطبین خاص"
      icon={<CheckSquare className="w-4 h-4 text-white" strokeWidth={1.5} />}
      accentColor="from-rose-500 to-pink-500 shadow-rose-500/20"
      onBack={onBack}
      onSend={handleSend}
      isSending={isSending}
    >
      <NumberSelector numbers={numbers} selected={selectedNumber} onSelect={setSelectedNumber} />
      
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">دفترچه تلفن</label>
        <Select
          value={selectedPhonebook}
          onChange={(e) => {
            setSelectedPhonebook(e.target.value);
            loadPhonebookNumbers(e.target.value);
          }}
        >
          <option value="">انتخاب کنید...</option>
          {phonebooks.map((pb: any) => (
            <option key={pb.id} value={pb.id}>
              {pb.title} ({toPersianNumber(pb.count)} مخاطب)
            </option>
          ))}
        </Select>
      </div>

      {selectedPhonebook && (
        <div className="bg-surface-2 border border-border rounded-xl p-3">
          {loadingNumbers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          ) : phonebookNumbers.length === 0 ? (
            <p className="text-center text-sm text-text-dim py-4">مخاطبی یافت نشد</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                <span className="text-xs text-text-dim">
                  {toPersianNumber(selectedContacts.length)} از {toPersianNumber(phonebookNumbers.length)} انتخاب شده
                </span>
                <button
                  onClick={selectAll}
                  className="text-xs text-accent hover:text-accent/80 transition-colors"
                >
                  {selectedContacts.length === phonebookNumbers.length ? 'لغو انتخاب همه' : 'انتخاب همه'}
                </button>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {phonebookNumbers.map((contact: any) => (
                  <label 
                    key={contact.id} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.number)}
                      onChange={() => toggleContact(contact.number)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text truncate">
                        {contact.name || 'بدون نام'}
                      </p>
                      <p className="text-xs text-text-dim font-mono" dir="ltr">
                        {contact.number}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">متن پیام</label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="متن پیامک خود را وارد کنید..."
          rows={5}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-text-dim">{toPersianNumber(message.length)} کاراکتر</span>
          <span className="text-[11px] text-text-dim">{toPersianNumber(Math.ceil(message.length / 70))} بخش</span>
        </div>
      </div>
    </SendPageLayout>
  );
}

// Mobile Send Page
function MobileSendPage({ numbers, onBack }: { numbers: any[]; onBack: () => void }) {
  const [selectedNumber, setSelectedNumber] = useState('');
  const [mobileContacts, setMobileContacts] = useState<Array<{name: string, phone: string}>>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadMobileContacts = async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
      toast.error('لطفاً از گوشی موبایل برای استفاده از این قابلیت استفاده کنید');
      return;
    }

    try {
      // @ts-ignore
      if ('contacts' in navigator && 'ContactsManager' in window) {
        // @ts-ignore
        const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: true });
        const formatted = contacts.map((c: any) => ({
          name: c.name[0] || 'بدون نام',
          phone: formatPhoneNumber(c.tel[0] || '')
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

  const toggleContact = (phone: string) => {
    setSelectedContacts(prev => 
      prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone]
    );
  };

  const handleSend = async () => {
    if (!selectedNumber || selectedContacts.length === 0 || !message) {
      toast.error('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    setIsSending(true);
    try {
      const result = await api.sendSMS({
        from_number: formatPhoneNumber(selectedNumber),
        message,
        recipients: selectedContacts,
      });

      if (result.meta.status) {
        toast.success(`پیامک به ${toPersianNumber(selectedContacts.length)} مخاطب ارسال شد`);
        onBack();
      } else {
        toast.error(result.meta.message || 'خطا در ارسال');
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در ارسال');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SendPageLayout
      title="ارسال از گوشی"
      description="مخاطبین گوشی"
      icon={<Smartphone className="w-4 h-4 text-white" strokeWidth={1.5} />}
      accentColor="from-amber-500 to-orange-500 shadow-amber-500/20"
      onBack={onBack}
      onSend={handleSend}
      isSending={isSending}
    >
      <NumberSelector numbers={numbers} selected={selectedNumber} onSelect={setSelectedNumber} />
      
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
          <div className="space-y-2 max-h-64 overflow-y-auto">
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

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">متن پیام</label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="متن پیامک خود را وارد کنید..."
          rows={5}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-text-dim">{toPersianNumber(message.length)} کاراکتر</span>
          <span className="text-[11px] text-text-dim">{toPersianNumber(Math.ceil(message.length / 70))} بخش</span>
        </div>
      </div>
    </SendPageLayout>
  );
}

// Pattern Send Page
function PatternSendPage({ numbers, patterns, onBack }: { numbers: any[]; patterns: any[]; onBack: () => void }) {
  const [selectedNumber, setSelectedNumber] = useState('');
  const [selectedPattern, setSelectedPattern] = useState('');
  const [recipient, setRecipient] = useState('');
  const [patternParams, setPatternParams] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);

  const selectedPatternData = patterns.find(p => p.pattern_code === selectedPattern);

  const handleSend = async () => {
    if (!selectedNumber || !selectedPattern || !recipient) {
      toast.error('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    if (selectedPatternData?.variable) {
      const missingParams = selectedPatternData.variable.filter((v: any) => !patternParams[v.name]);
      if (missingParams.length > 0) {
        toast.error(`لطفاً مقدار ${missingParams.map((v: any) => v.name).join('، ')} را وارد کنید`);
        return;
      }
    }

    setIsSending(true);
    try {
      const result = await api.sendPatternSMS({
        from_number: formatPhoneNumber(selectedNumber),
        code: selectedPattern,
        recipients: [formatPhoneNumber(recipient)],
        params: patternParams,
      });

      if (result.meta.status) {
        toast.success('پیامک با موفقیت ارسال شد');
        onBack();
      } else {
        toast.error(result.meta.message || 'خطا در ارسال');
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در ارسال');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SendPageLayout
      title="ارسال با الگو"
      description="ارسال با الگوی آماده"
      icon={<Sparkles className="w-4 h-4 text-white" strokeWidth={1.5} />}
      accentColor="from-purple-500 to-fuchsia-500 shadow-purple-500/20"
      onBack={onBack}
      onSend={handleSend}
      isSending={isSending}
    >
      <NumberSelector numbers={numbers} selected={selectedNumber} onSelect={setSelectedNumber} />
      
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">الگوی پیام</label>
        <Select
          value={selectedPattern}
          onChange={(e) => {
            setSelectedPattern(e.target.value);
            setPatternParams({});
          }}
        >
          <option value="">انتخاب کنید...</option>
          {patterns.map((p: any) => (
            <option key={p.pattern_code} value={p.pattern_code}>
              {p.title || p.pattern_code}
            </option>
          ))}
        </Select>
        {patterns.length === 0 && (
          <p className="text-xs text-text-dim mt-2">هیچ الگوی فعالی یافت نشد</p>
        )}
      </div>

      {selectedPatternData && (
        <div className="bg-surface-2 border border-border rounded-xl p-3 space-y-3">
          <div>
            <label className="block text-xs text-text-dim mb-1">متن الگو:</label>
            <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
              {selectedPatternData.pattern_message}
            </p>
          </div>
          
          {selectedPatternData.variable && selectedPatternData.variable.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-text-muted">پارامترهای الگو</label>
              {selectedPatternData.variable.map((v: any) => (
                <div key={v.name}>
                  <label className="block text-xs text-text-dim mb-1">
                    {v.name} 
                    {v.type && <span className="text-text-dim/60 mr-1">({v.type})</span>}
                  </label>
                  <Input
                    value={patternParams[v.name] || ''}
                    onChange={(e) => setPatternParams({ ...patternParams, [v.name]: e.target.value })}
                    placeholder={`مقدار ${v.name}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">شماره گیرنده</label>
        <Input
          type="tel"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="09120000000"
          dir="ltr"
          className="font-mono"
        />
        <p className="text-[11px] text-text-dim mt-1">
          توجه: در ارسال الگو فقط یک گیرنده مجاز است
        </p>
      </div>
    </SendPageLayout>
  );
}
