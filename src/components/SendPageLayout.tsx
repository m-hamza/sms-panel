import { ReactNode } from 'react';
import { ArrowRight, Send, Loader2 } from 'lucide-react';
import { Button } from '../components/ui';

interface SendPageLayoutProps {
  title: string;
  description: string;
  icon: ReactNode;
  accentColor: string;
  onBack: () => void;
  onSend: () => void;
  isSending: boolean;
  sendDisabled?: boolean;
  children: ReactNode;
}

export default function SendPageLayout({
  title,
  description,
  icon,
  accentColor,
  onBack,
  onSend,
  isSending,
  sendDisabled,
  children,
}: SendPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accentColor} flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-text">{title}</h1>
            <p className="text-[11px] text-text-dim">{description}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-5 space-y-4 pb-36">
        {children}
      </main>

      {/* Sticky Send Button - Fixed above bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-bg via-bg to-transparent pt-4 pb-6">
        <div className="max-w-lg mx-auto px-4">
          <Button
            variant="primary"
            size="lg"
            loading={isSending}
            onClick={onSend}
            disabled={sendDisabled}
            icon={<Send className="w-4 h-4" />}
            className="w-full shadow-xl shadow-indigo-500/20"
          >
            ارسال پیامک
          </Button>
        </div>
      </div>
    </div>
  );
}
