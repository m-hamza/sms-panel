import { LayoutDashboard, FileText, User } from 'lucide-react';

type Page = 'dashboard' | 'reports' | 'profile';

interface BottomNavProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
}

const navItems = [
  { id: 'dashboard' as Page, label: 'پیشخوان', icon: LayoutDashboard },
  { id: 'reports' as Page, label: 'گزارشات', icon: FileText },
  { id: 'profile' as Page, label: 'پروفایل', icon: User },
];

export default function BottomNav({ activePage, onPageChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto">
      <div className="bg-surface/80 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative ${
                  isActive ? 'text-accent' : 'text-text-dim hover:text-text-muted'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent rounded-full"></div>
                )}
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2 : 1.5} />
                <span className={`text-[10px] font-medium transition-all ${isActive ? 'text-accent' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
