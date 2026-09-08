import { MessageSquare, BarChart3, User } from 'lucide-react';

type Page = 'dashboard' | 'reports' | 'profile';

interface BottomNavProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export default function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  const items = [
    { id: 'dashboard' as Page, label: 'پیشخوان', icon: MessageSquare },
    { id: 'reports' as Page, label: 'گزارشات', icon: BarChart3 },
    { id: 'profile' as Page, label: 'پروفایل', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass border-t border-slate-700/50">
        <div className="flex items-center justify-around px-4 py-2 max-w-lg mx-auto">
          {items.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all ${
                  isActive
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                  <item.icon className="w-5 h-5" />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400"></div>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-blue-400' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Safe area for mobile */}
      <div className="h-[env(safe-area-inset-bottom)] bg-slate-900/90"></div>
    </div>
  );
}
