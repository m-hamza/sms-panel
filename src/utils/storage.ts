// ===== Storage Management =====

const STORAGE_KEY = 'ippanel_accounts';
const ACTIVE_KEY = 'ippanel_active_account';

export interface Account { 
  id: string; 
  name: string; 
  apiKey: string; 
  userInfo?: any; 
  credit?: any; 
  numbers?: any[]; 
  phonebooks?: any[]; 
}

export function loadFromStorage() {
  try {
    return { 
      accounts: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'), 
      activeId: localStorage.getItem(ACTIVE_KEY) 
    };
  } catch { 
    return { accounts: [], activeId: null }; 
  }
}

export function saveToStorage(accounts: Account[], activeId: string | null) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
}
