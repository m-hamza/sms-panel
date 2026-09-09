import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore, initializeAuth } from './store/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SendPages from './pages/SendPages';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import BottomNav from './components/BottomNav';
import { MessageSquare, RefreshCw } from 'lucide-react';

// Subtle background refresh indicator
function BackgroundRefreshIndicator() {
  const { dataLoaded } = useAuthStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show indicator briefly when data is being refreshed
    if (!dataLoaded) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [dataLoaded]);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="h-0.5 bg-gradient-to-r from-accent via-purple-500 to-accent animate-gradient"></div>
    </div>
  );
}

type Page = 'dashboard' | 'reports' | 'profile';
type SendMode = 'single' | 'bulk' | 'phonebook' | 'phonebook_select' | 'mobile' | 'peer' | 'pattern';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sendMode, setSendMode] = useState<SendMode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // initializeAuth is now synchronous - loads from cache instantly
    initializeAuth();
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-bg">
        {/* Minimal instant loading - just a subtle indicator */}
        <div className="fixed top-0 left-0 right-0 h-0.5 z-50">
          <div className="h-full bg-gradient-to-r from-accent via-purple-500 to-accent animate-gradient w-full"></div>
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

  // If send mode is active, show send page (without bottom nav)
  if (sendMode) {
    return (
      <div className="min-h-screen bg-bg max-w-lg mx-auto relative noise-bg">
        <Toaster position="top-center" toastOptions={toastOptions} />
        <SendPages mode={sendMode} onBack={() => setSendMode(null)} />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={(mode) => setSendMode(mode)} />;
      case 'reports':
        return <ReportsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage onNavigate={(mode) => setSendMode(mode)} />;
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

      {/* Background refresh indicator - subtle top bar */}
      <BackgroundRefreshIndicator />
    </div>
  );
}

export default App;
