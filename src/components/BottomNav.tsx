import { LayoutDashboard, FileBarChart, UserCircle } from 'lucide-react';

type Page = 'dashboard' | 'reports' | 'profile';

interface BottomNavProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
}

export default function BottomNav({ activePage, onPageChange }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard' as Page, label: 'پیشخوان', icon: LayoutDashboard },
    { id: 'reports' as Page, label: 'گزارشات', icon: FileBarChart },
    { id: 'profile' as Page, label: 'پروفایل', icon: UserCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Gradient fade above nav */}
      <div className="h-6 bg-gradient-to-t from-[#050a18] to-transparent pointer-events-none"></div>
      
      {/* Nav Container */}
      <div className="relative">
        {/* Top border glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        
        <nav className="bg-[#0a0f1e]/95 backdrop-blur-xl border-t border-slate-800/50 px-4 pb-5 pt-2">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`relative flex flex-col items-center gap-1 py-2 px-5 rounded-xl transition-all duration-300 ${
                    isActive ? 'scale-105' : 'opacity-60 hover:opacity-90'
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30"></div>
                  )}
                  
                  {/* Icon */}
                  <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-blue-500/10' : ''
                  }`}>
                    <item.icon className={`w-5 h-5 transition-colors duration-300 ${
                      isActive ? 'text-blue-400' : 'text-slate-400'
                    }`} strokeWidth={isActive ? 2 : 1.5} />
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-blue-400/10 animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={`text-[10px] font-medium transition-colors duration-300 ${
                    isActive ? 'text-blue-400' : 'text-slate-500'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
