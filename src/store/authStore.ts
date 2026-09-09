import { create } from 'zustand';
import api from '../api/ippanel';

interface Account {
  id: string;
  name: string;
  apiKey: string;
  userInfo?: any;
  credit?: any;
  numbers?: any[];
  phonebooks?: any[];
  dataLoaded?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  currentAccountId: string | null;
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  userInfo: any | null;
  credit: any | null;
  numbers: any[];
  phonebooks: any[];
  dataLoaded: boolean;

  login: (apiKey: string) => Promise<boolean>;
  loginWithCredentials: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchAccount: (id: string) => void;
  addAccount: (name: string, apiKey: string) => Promise<boolean>;
  addAccountWithCredentials: (name: string, username: string, password: string) => Promise<boolean>;
  removeAccount: (id: string) => void;
  renameAccount: (id: string, name: string) => void;
  loadUserData: () => Promise<void>;
  clearData: () => void;
}

const STORAGE_KEY = 'ippanel_accounts';
const ACTIVE_KEY = 'ippanel_active_account';

const loadFromStorage = (): { accounts: Account[]; activeId: string | null } => {
  try {
    const accounts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const activeId = localStorage.getItem(ACTIVE_KEY);
    return { accounts, activeId };
  } catch {
    return { accounts: [], activeId: null };
  }
};

const saveToStorage = (accounts: Account[], activeId: string | null) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  currentAccountId: null,
  accounts: [],
  isLoading: false,
  error: null,
  userInfo: null,
  credit: null,
  numbers: [],
  phonebooks: [],
  dataLoaded: false,

  login: async (apiKey: string) => {
    set({ isLoading: true, error: null });
    try {
      api.setApiKey(apiKey);
      const result = await api.checkToken();
      
      if (result.meta.status) {
        const id = Date.now().toString();
        const account: Account = {
          id,
          name: result.data.user_name || 'حساب کاربری',
          apiKey,
          userInfo: result.data,
        };

        const { accounts } = loadFromStorage();
        const existingIndex = accounts.findIndex(a => a.apiKey === apiKey);
        
        if (existingIndex >= 0) {
          accounts[existingIndex] = { ...accounts[existingIndex], userInfo: result.data };
          set({
            isAuthenticated: true,
            currentAccountId: accounts[existingIndex].id,
            accounts,
            userInfo: result.data,
            isLoading: false,
          });
          saveToStorage(accounts, accounts[existingIndex].id);
        } else {
          accounts.push(account);
          set({
            isAuthenticated: true,
            currentAccountId: id,
            accounts,
            userInfo: result.data,
            isLoading: false,
          });
          saveToStorage(accounts, id);
        }

        // Load user data
        await get().loadUserData();
        return true;
      } else {
        set({ isLoading: false, error: result.meta.message });
        return false;
      }
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'خطا در اتصال' });
      return false;
    }
  },

  loginWithCredentials: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.login(username, password);
      
      if (result.meta.status && result.data) {
        const { method, token } = result.data;
        
        if (method === 'login') {
          // Direct login - use the token as API key
          return await get().login(token);
        } else if (method === 'sms') {
          // SMS OTP required - for now, show message
          set({ isLoading: false, error: 'ورود دو مرحله‌ای با پیامک فعال است. لطفاً از API Key استفاده کنید.' });
          return false;
        } else if (method === 'ga') {
          // Google Authenticator required - for now, show message
          set({ isLoading: false, error: 'ورود دو مرحله‌ای با Google Authenticator فعال است. لطفاً از API Key استفاده کنید.' });
          return false;
        }
      }
      
      set({ isLoading: false, error: result.meta.message || 'نام کاربری یا رمز عبور اشتباه است' });
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'خطا در اتصال' });
      return false;
    }
  },

  logout: () => {
    const { currentAccountId, accounts } = get();
    const newAccounts = accounts.filter(a => a.id !== currentAccountId);
    const newActiveId = newAccounts.length > 0 ? newAccounts[0].id : null;
    
    set({
      isAuthenticated: !!newActiveId,
      currentAccountId: newActiveId,
      accounts: newAccounts,
      userInfo: null,
      credit: null,
      numbers: [],
      phonebooks: [],
      dataLoaded: false,
    });
    
    saveToStorage(newAccounts, newActiveId);
    api.setApiKey('');
  },

  switchAccount: async (id: string) => {
    const { accounts } = get();
    const account = accounts.find(a => a.id === id);
    if (!account) return;

    api.setApiKey(account.apiKey);
    set({
      currentAccountId: id,
      userInfo: account.userInfo,
      credit: account.credit,
      numbers: account.numbers || [],
      phonebooks: account.phonebooks || [],
      dataLoaded: !!account.numbers,
    });
    
    localStorage.setItem(ACTIVE_KEY, id);
    
    if (!account.dataLoaded) {
      await get().loadUserData();
    }
  },

  addAccount: async (name: string, apiKey: string) => {
    set({ isLoading: true, error: null });
    try {
      api.setApiKey(apiKey);
      const result = await api.checkToken();
      
      if (result.meta.status) {
        const id = Date.now().toString();
        const account: Account = {
          id,
          name,
          apiKey,
          userInfo: result.data,
        };

        const { accounts } = loadFromStorage();
        accounts.push(account);
        
        set({
          accounts,
          isLoading: false,
        });
        saveToStorage(accounts, get().currentAccountId);
        return true;
      } else {
        set({ isLoading: false, error: result.meta.message });
        return false;
      }
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'خطا در اتصال' });
      return false;
    }
  },

  addAccountWithCredentials: async (name: string, username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.login(username, password);
      
      if (result.meta.status && result.data) {
        const { method, token } = result.data;
        
        if (method === 'login') {
          // Direct login - use the token as API key
          api.setApiKey(token);
          const checkResult = await api.checkToken();
          
          if (checkResult.meta.status) {
            const id = Date.now().toString();
            const account: Account = {
              id,
              name,
              apiKey: token,
              userInfo: checkResult.data,
            };

            const { accounts } = loadFromStorage();
            accounts.push(account);
            
            set({
              accounts,
              isLoading: false,
            });
            saveToStorage(accounts, get().currentAccountId);
            return true;
          }
        } else if (method === 'sms') {
          set({ isLoading: false, error: 'ورود دو مرحله‌ای با پیامک فعال است. لطفاً از API Key استفاده کنید.' });
          return false;
        } else if (method === 'ga') {
          set({ isLoading: false, error: 'ورود دو مرحله‌ای با Google Authenticator فعال است. لطفاً از API Key استفاده کنید.' });
          return false;
        }
      }
      
      set({ isLoading: false, error: result.meta.message || 'نام کاربری یا رمز عبور اشتباه است' });
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'خطا در اتصال' });
      return false;
    }
  },

  removeAccount: (id: string) => {
    const { accounts, currentAccountId } = get();
    const newAccounts = accounts.filter(a => a.id !== id);
    const newActiveId = currentAccountId === id 
      ? (newAccounts.length > 0 ? newAccounts[0].id : null)
      : currentAccountId;
    
    set({ accounts: newAccounts, currentAccountId: newActiveId });
    saveToStorage(newAccounts, newActiveId);
  },

  renameAccount: (id: string, name: string) => {
    const { accounts, currentAccountId } = get();
    const newAccounts = accounts.map(a => a.id === id ? { ...a, name } : a);
    set({ accounts: newAccounts });
    saveToStorage(newAccounts, currentAccountId);
  },

  loadUserData: async () => {
    try {
      const [creditRes, numbersRes, phonebooksRes] = await Promise.all([
        api.getCredit().catch(() => null),
        api.getNumbers().catch(() => null),
        api.getPhonebooks().catch(() => null),
      ]);

      const credit = creditRes?.meta?.status ? creditRes.data : null;
      const numbers = numbersRes?.meta?.status ? numbersRes.data : [];
      const phonebooks = phonebooksRes?.meta?.status ? phonebooksRes.data : [];

      const { accounts, currentAccountId } = get();
      const updatedAccounts = accounts.map(a => 
        a.id === currentAccountId 
          ? { ...a, credit, numbers, phonebooks, userInfo: get().userInfo }
          : a
      );

      set({
        credit,
        numbers,
        phonebooks,
        accounts: updatedAccounts,
        dataLoaded: true,
      });
      
      saveToStorage(updatedAccounts, currentAccountId);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  },

  clearData: () => {
    set({
      userInfo: null,
      credit: null,
      numbers: [],
      phonebooks: [],
      dataLoaded: false,
    });
  },
}));

// Initialize from storage on app start - NON-BLOCKING
// Immediately shows cached data, validates in background
export const initializeAuth = () => {
  const { accounts, activeId } = loadFromStorage();
  
  if (accounts.length > 0 && activeId) {
    const account = accounts.find(a => a.id === activeId);
    if (account) {
      api.setApiKey(account.apiKey);
      
      // IMMEDIATE: Set state with cached data (synchronous, instant)
      useAuthStore.setState({
        isAuthenticated: true,
        currentAccountId: activeId,
        accounts,
        userInfo: account.userInfo || null,
        credit: account.credit || null,
        numbers: Array.isArray(account.numbers) ? account.numbers : [],
        phonebooks: Array.isArray(account.phonebooks) ? account.phonebooks : [],
        dataLoaded: !!account.numbers,
      });
      
      // BACKGROUND: Validate token and refresh data (non-blocking)
      validateAndRefreshInBackground();
    }
  }
};

// Background validation and refresh - runs after UI is shown
const validateAndRefreshInBackground = async () => {
  try {
    // Validate token
    const result = await api.checkToken();
    
    if (result.meta.status) {
      // Update user info if changed
      useAuthStore.setState({ userInfo: result.data });
      
      // Refresh data in background (parallel, non-blocking)
      useAuthStore.getState().loadUserData();
    } else {
      // Token invalid - try to restore from other accounts
      const { accounts, currentAccountId } = useAuthStore.getState();
      const newAccounts = accounts.filter(a => a.id !== currentAccountId);
      const newActiveId = newAccounts.length > 0 ? newAccounts[0].id : null;
      
      if (newActiveId) {
        // Switch to another valid account
        api.setApiKey(newAccounts[0].apiKey);
        useAuthStore.setState({
          accounts: newAccounts,
          currentAccountId: newActiveId,
        });
        saveToStorage(newAccounts, newActiveId);
        // Re-validate the new account
        validateAndRefreshInBackground();
      } else {
        // No valid accounts, logout
        useAuthStore.setState({
          isAuthenticated: false,
          currentAccountId: null,
          accounts: [],
          userInfo: null,
          credit: null,
          numbers: [],
          phonebooks: [],
          dataLoaded: false,
        });
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ACTIVE_KEY);
      }
    }
  } catch {
    // Network error - silently continue with cached data
    // Data will be refreshed when user interacts
    console.log('Background validation failed, using cached data');
  }
};
