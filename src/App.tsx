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
      <div className="min-h-screen flex items-center justify-center bg-[#050a18]">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="absolute w-16 h-16 rounded-full border border-blue-500/20 animate-spin-slow"></div>
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-xl shadow-blue-500/20">
              <MessageSquare className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-slate-500 text-sm">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#e2e8f0',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '12px',
              fontSize: '13px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#050a18',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#050a18',
              },
            },
          }}
        />
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
    <div className="min-h-screen bg-[#050a18] max-w-lg mx-auto relative overflow-hidden">
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/3 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/3 rounded-full blur-[80px]"></div>
      </div>
      
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#e2e8f0',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '12px',
            fontSize: '13px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#050a18',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#050a18',
            },
          },
        }}
      />
      
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
