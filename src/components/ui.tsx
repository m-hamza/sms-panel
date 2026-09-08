import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

// Card
export function Card({ children, className, interactive, onClick, style }: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={twMerge(
        'card p-4',
        interactive && 'card-interactive',
        className
      )}
    >
      {children}
    </div>
  );
}

// Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}
export function Button({ children, variant = 'ghost', size = 'md', loading, icon, className, ...props }: ButtonProps) {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-5 py-3 text-sm rounded-xl',
  };
  return (
    <button className={twMerge('btn', `btn-${variant}`, sizes[size], className)} disabled={loading || props.disabled} {...props}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

// Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
}
export function Input({ icon, error, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none">
          {icon}
        </div>
      )}
      <input
        className={twMerge('input', icon && 'pr-10', error && 'border-danger/50', className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

// Textarea
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={twMerge('input resize-none', className)} {...props} />;
}

// Select
export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={twMerge('input', className)} {...props}>
      {children}
    </select>
  );
}

// Badge
export function Badge({ children, variant = 'neutral' }: { children: ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

// Empty State
export function EmptyState({ icon, title, description, action }: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-4 text-text-dim">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-text mb-1">{title}</h3>
      {description && <p className="text-xs text-text-dim max-w-[240px]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Loading State
export function LoadingState({ text = 'در حال بارگذاری...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-border"></div>
        <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-accent animate-spin"></div>
      </div>
      <p className="mt-4 text-xs text-text-dim">{text}</p>
    </div>
  );
}

// Skeleton
export function Skeleton({ className }: { className?: string }) {
  return <div className={twMerge('skeleton', className)} />;
}

// Section Header
export function SectionHeader({ title, action, count }: { title: string; action?: ReactNode; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-text-muted">{title}</h2>
        {count !== undefined && (
          <span className="text-xs text-text-dim bg-surface-2 px-1.5 py-0.5 rounded-md">{count}</span>
        )}
      </div>
      {action}
    </div>
  );
}

// Stat Card
export function StatCard({ label, value, icon, accent = 'indigo', trend }: {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
  trend?: string;
}) {
  const accents = {
    indigo: 'from-indigo-500/20 to-indigo-500/0 text-indigo-400',
    emerald: 'from-emerald-500/20 to-emerald-500/0 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-500/0 text-amber-400',
    rose: 'from-rose-500/20 to-rose-500/0 text-rose-400',
    sky: 'from-sky-500/20 to-sky-500/0 text-sky-400',
  };
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${accents[accent].split(' ').slice(0, 2).join(' ')} pointer-events-none`}></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center ${accents[accent].split(' ')[2]}`}>
            {icon}
          </div>
          {trend && <span className="text-[10px] text-text-dim">{trend}</span>}
        </div>
        <p className="text-2xl font-bold text-text tracking-tight">{value}</p>
        <p className="text-xs text-text-dim mt-0.5">{label}</p>
      </div>
    </Card>
  );
}
