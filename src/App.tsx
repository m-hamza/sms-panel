import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore, initializeAuth } from './store/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import BottomNav from './components/BottomNav';
import { MessageSquare } from 'lucide-react';

type Page = 'dashboard' | 'reports' | 'profile';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAuth().then(() => setIsInitialized(true));
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center animate-fade-in">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="absolute w-16 h-16 rounded-full border border-accent/20 animate-spin-slow"></div>
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <MessageSquare className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-xs text-text-dim">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const toastOptions = {
    style: {
      background: 'rgba(12, 18, 32, 0.95)',
      color: '#e5e7eb',
      border: '1px solid rgba(148, 163, 184, 0.1)',
      borderRadius: '12px',
      fontSize: '13px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
      padding: '12px 16px',
    },
    success: {
      iconTheme: { primary: '#10b981', secondary: '#070b14' },
    },
    error: {
      iconTheme: { primary: '#ef4444', secondary: '#070b14' },
    },
  };

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" toastOptions={toastOptions} />
        <LoginPage />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'reports':
        return <ReportsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-bg max-w-lg mx-auto relative noise-bg">
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/3 rounded-full blur-[100px]"></div>
      </div>
      
      <Toaster position="top-center" toastOptions={toastOptions} />
      
      {/* Main Content */}
      <main className="relative z-10 min-h-screen">
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activePage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
}

export default App;
