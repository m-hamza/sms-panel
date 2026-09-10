import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const items = [
    { id: '/', label: 'پیشخوان', icon: LayoutDashboard },
    { id: '/reports', label: 'گزارشات', icon: FileText },
    { id: '/profile', label: 'پروفایل', icon: User },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-lg mx-auto">
      <div className="bg-surface/80 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around px-4 py-2">
          {items.map((item) => {
            const isActive = location.pathname === item.id;
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => navigate(item.id)} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative ${isActive ? 'text-accent' : 'text-text-dim'}`}>
                {isActive && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent rounded-full"></div>}
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
