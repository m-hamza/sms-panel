import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import SendPages from './pages/SendPages';
import { useAuthStore, initializeAuth } from './store/authStore';

type SendMode = 'single' | 'bulk' | 'phonebook' | 'phonebook_select' | 'mobile' | 'peer' | 'pattern';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [sendMode, setSendMode] = useState<SendMode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAuth();
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    document.documentElement.classList.toggle('light', savedTheme === 'light');
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-gradient-to-r from-accent via-purple-500 to-accent"></div>
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

  // If not authenticated, show login page (handles both login and addAccount modes)
  if (!isAuthenticated) {
    return (
      <HashRouter>
        <Toaster position="top-center" toastOptions={toastOptions} />
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </HashRouter>
    );
  }

  // If send mode is active, show send page
  if (sendMode) {
    return (
      <HashRouter>
        <div className="min-h-screen bg-bg max-w-lg mx-auto relative">
          <Toaster position="top-center" toastOptions={toastOptions} />
          <SendPages mode={sendMode} onBack={() => setSendMode(null)} />
        </div>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-bg max-w-lg mx-auto relative">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/3 rounded-full blur-[100px]"></div>
        </div>
        
        <Toaster position="top-center" toastOptions={toastOptions} />
        
        <main className="relative z-10 min-h-screen">
          <Routes>
            <Route path="/" element={<DashboardPage onNavigate={(mode) => setSendMode(mode)} />} />
            <Route path="/dashboard" element={<DashboardPage onNavigate={(mode) => setSendMode(mode)} />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
