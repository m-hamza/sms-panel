import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { api } from './api/ippanel';
import { loadFromStorage, saveToStorage, Account } from './utils/storage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [credit, setCredit] = useState<any>(null);
  const [numbers, setNumbers] = useState<any[]>([]);
  const [phonebooks, setPhonebooks] = useState<any[]>([]);

  useEffect(() => {
    const { accounts: storedAccounts, activeId } = loadFromStorage();
    if (storedAccounts.length > 0 && activeId) {
      const account = storedAccounts.find((a: Account) => a.id === activeId);
      if (account) {
        api.setApiKey(account.apiKey);
        setAccounts(storedAccounts);
        setCurrentAccountId(activeId);
        setUserInfo(account.userInfo);
        setCredit(account.credit);
        setNumbers(account.numbers || []);
        setPhonebooks(account.phonebooks || []);
        setIsAuthenticated(true);
        loadUserData(account.apiKey, activeId, storedAccounts);
      }
    }
    setIsInitialized(true);
  }, []);

  const loadUserData = async (apiKey: string, activeId: string | null, accountsList: Account[]) => {
    try {
      const [creditRes, numbersRes, phonebooksRes] = await Promise.all([
        api.getCredit().catch(() => null),
        api.getNumbers().catch(() => null),
        api.getPhonebooks().catch(() => null),
      ]);
      const creditData = creditRes?.meta?.status ? creditRes.data : null;
      const numbersData = numbersRes?.meta?.status ? numbersRes.data : [];
      const phonebooksData = phonebooksRes?.meta?.status ? phonebooksRes.data : [];
      setCredit(creditData);
      setNumbers(numbersData);
      setPhonebooks(phonebooksData);
      const updated = accountsList.map((a: Account) => a.id === activeId ? { ...a, credit: creditData, numbers: numbersData, phonebooks: phonebooksData } : a);
      setAccounts(updated);
      saveToStorage(updated, activeId);
    } catch (err) { 
      console.error('خطا در بارگذاری:', err); 
    }
  };

  const login = async (apiKey: string): Promise<boolean> => {
    try {
      api.setApiKey(apiKey);
      const result = await api.checkToken();
      if (result.meta.status) {
        const id = Date.now().toString();
        const account: Account = { id, name: result.data.user_name || 'حساب کاربری', apiKey, userInfo: result.data };
        const { accounts: stored } = loadFromStorage();
        const existing = stored.findIndex((a: Account) => a.apiKey === apiKey);
        if (existing >= 0) { 
          stored[existing] = { ...stored[existing], userInfo: result.data }; 
        } else { 
          stored.push(account); 
        }
        setAccounts(stored);
        setCurrentAccountId(existing >= 0 ? stored[existing].id : id);
        setUserInfo(result.data);
        setIsAuthenticated(true);
        saveToStorage(stored, existing >= 0 ? stored[existing].id : id);
        loadUserData(apiKey, existing >= 0 ? stored[existing].id : id, stored);
        return true;
      } else { 
        return false; 
      }
    } catch (err) { 
      return false; 
    }
  };

  const logout = () => {
    const newAccounts = accounts.filter((a: Account) => a.id !== currentAccountId);
    const newId = newAccounts.length > 0 ? newAccounts[0].id : null;
    setAccounts(newAccounts);
    setCurrentAccountId(newId);
    setIsAuthenticated(!!newId);
    if (!newId) { 
      setUserInfo(null); 
      setCredit(null); 
      setNumbers([]); 
      setPhonebooks([]); 
    }
    saveToStorage(newAccounts, newId);
  };

  const switchAccount = async (id: string) => {
    const account = accounts.find((a: Account) => a.id === id);
    if (!account) return;
    api.setApiKey(account.apiKey);
    setCurrentAccountId(id);
    setUserInfo(account.userInfo);
    setCredit(account.credit);
    setNumbers(account.numbers || []);
    setPhonebooks(account.phonebooks || []);
    localStorage.setItem('ippanel_active_account', id);
  };

  const addAccount = async (name: string, apiKey: string): Promise<boolean> => {
    try {
      api.setApiKey(apiKey);
      const result = await api.checkToken();
      if (result.meta.status) {
        const id = Date.now().toString();
        const account: Account = { id, name, apiKey, userInfo: result.data };
        const newAccounts = [...accounts, account];
        setAccounts(newAccounts);
        saveToStorage(newAccounts, currentAccountId);
        return true;
      } else { 
        return false; 
      }
    } catch (err) { 
      return false; 
    }
  };

  const removeAccount = (id: string) => {
    const newAccounts = accounts.filter((a: Account) => a.id !== id);
    setAccounts(newAccounts);
    saveToStorage(newAccounts, currentAccountId);
  };

  const renameAccount = (id: string, name: string) => {
    const newAccounts = accounts.map((a: Account) => a.id === id ? { ...a, name } : a);
    setAccounts(newAccounts);
    saveToStorage(newAccounts, currentAccountId);
  };

  if (!isInitialized) {
    return <div className="min-h-screen bg-bg"><div className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-gradient-to-r from-accent via-purple-500 to-accent"></div></div>;
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
    success: { iconTheme: { primary: '#10b981', secondary: '#070b14' } },
    error: { iconTheme: { primary: '#ef4444', secondary: '#070b14' } },
  };

  return (
    <HashRouter>
      <Toaster position="top-center" toastOptions={toastOptions} />
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<LoginPage login={login} />} />
        ) : (
          <>
            <Route path="/" element={<DashboardPage numbers={numbers} phonebooks={phonebooks} credit={credit} />} />
            <Route path="/dashboard" element={<DashboardPage numbers={numbers} phonebooks={phonebooks} credit={credit} />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={
              <ProfilePage 
                userInfo={userInfo} 
                credit={credit} 
                numbers={numbers} 
                accounts={accounts} 
                currentAccountId={currentAccountId}
                logout={logout}
                switchAccount={switchAccount}
                addAccount={addAccount}
                removeAccount={removeAccount}
                renameAccount={renameAccount}
              />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </HashRouter>
  );
}

export default App;
