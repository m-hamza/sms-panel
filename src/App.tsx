import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore, initializeAuth } from './store/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SendPages from './pages/SendPages';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import BottomNav from './components/BottomNav';

type SendMode = 'single' | 'bulk' | 'phonebook' | 'phonebook_select' | 'mobile' | 'peer' | 'pattern';

function AppContent() {
  const { isAuthenticated } = useAuthStore();
  const [sendMode, setSendMode] = useState<SendMode | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    document.documentElement.classList.toggle('light', savedTheme === 'light');
  }, []);

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
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </>
    );
  }

  if (sendMode) {
    return (
      <div className="min-h-screen bg-bg max-w-lg mx-auto relative noise-bg">
        <Toaster position="top-center" toastOptions={toastOptions} />
        <SendPages mode={sendMode} onBack={() => setSendMode(null)} />
      </div>
    );
  }

  const handleNavigate = (mode: SendMode) => {
    setSendMode(mode);
  };

  return (
    <div className="min-h-screen bg-bg max-w-lg mx-auto relative noise-bg">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/3 rounded-full blur-[100px]"></div>
      </div>
      
      <Toaster position="top-center" toastOptions={toastOptions} />
      
      <main className="relative z-10 min-h-screen">
        <Routes>
          <Route path="/" element={<DashboardPage onNavigate={handleNavigate} />} />
          <Route path="/dashboard" element={<DashboardPage onNavigate={handleNavigate} />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAuth();
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="fixed top-0 left-0 right-0 h-0.5 z-50">
          <div className="h-full bg-gradient-to-r from-accent via-purple-500 to-accent animate-gradient w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
