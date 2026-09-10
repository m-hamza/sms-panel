// ===== API Service =====
const BASE_URL = 'https://edge.ippanel.com/v1';

class IPPanelAPI {
  private apiKey = '';
  
  setApiKey(key: string) { this.apiKey = key; }
  getApiKey() { return this.apiKey; }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': this.apiKey,
      ...(options.headers as Record<string, string> || {}),
    };
    
    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    let data;
    try { 
      data = await response.json(); 
    } catch { 
      throw new Error('خطا در پردازش پاسخ سرور'); 
    }
    
    if (!data.meta?.status && response.status === 401) {
      throw new Error('توکن نامعتبر یا منقضی شده است');
    }
    
    return data;
  }

  // احراز هویت
  async checkToken() { 
    return this.request('/api/acl/auth/check_token', { method: 'POST' }); 
  }
  
  async login(username: string, password: string) {
    return this.request('/api/acl/auth/login', { 
      method: 'POST', 
      body: JSON.stringify({ username, password }) 
    });
  }

  // تایید OTP
  async confirmOtp(token: string, otpCode: string) {
    return this.request('/api/acl/auth/confirm_otp', { 
      method: 'POST', 
      body: JSON.stringify({ token, otp: otpCode }) 
    });
  }

  // خطوط
  async getNumbers(page = 1, perPage = 100) { 
    return this.request(`/api/number/numbers?page=${page}&per_page=${perPage}`); 
  }

  // اعتبار
  async getCredit() { 
    return this.request('/api/payment/credit/mine'); 
  }

  // ارسال پیامک - Webservice
  async sendSMS(data: {
    from_number: string;
    message: string;
    recipients: string[];
    send_time?: string;
  }) {
    return this.request('/api/send', { 
      method: 'POST', 
      body: JSON.stringify({ 
        sending_type: 'webservice', 
        from_number: data.from_number,
        message: data.message,
        params: { recipients: data.recipients },
        send_time: data.send_time,
      }) 
    });
  }

  // ارسال پیامک - Peer to Peer
  async sendPeerToPeer(data: {
    from_number: string;
    params: Array<{ recipients: string[]; message: string }>;
    send_time?: string;
  }) {
    return this.request('/api/send', { 
      method: 'POST', 
      body: JSON.stringify({ 
        sending_type: 'peer_to_peer', 
        from_number: data.from_number,
        params: data.params,
        send_time: data.send_time,
      }) 
    });
  }

  // ارسال پیامک - Phonebook
  async sendToPhonebook(data: {
    from_number: string;
    message: string;
    params: Array<{ phonebook_id: string; type: 'all' | 'detail' }>;
    send_time?: string;
  }) {
    return this.request('/api/send', { 
      method: 'POST', 
      body: JSON.stringify({ 
        sending_type: 'phonebook', 
        from_number: data.from_number,
        message: data.message,
        params: data.params,
        send_time: data.send_time,
      }) 
    });
  }

  // ارسال پیامک - Pattern
  async sendPatternSMS(data: {
    from_number: string;
    code: string;
    recipients: string[];
    params: Record<string, string>;
  }) {
    return this.request('/api/send', { 
      method: 'POST', 
      body: JSON.stringify({ 
        sending_type: 'pattern', 
        from_number: data.from_number,
        code: data.code,
        recipients: data.recipients,
        params: data.params,
      }) 
    });
  }

  // دفترچه تلفن
  async getPhonebooks(page = 1, perPage = 100) { 
    return this.request(`/api/phonebooks/list-new?page=${page}&per_page=${perPage}`); 
  }

  async getPhonebookNumbers(phonebookId: string, page = 1, perPage = 1000) {
    return this.request(`/api/phonebooks/numbers/contact-list?phonebook_id=${phonebookId}&page=${page}&per_page=${perPage}`);
  }

  // گزارشات
  async getOutboxReport(data: {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
  }) {
    return this.request('/api/report/new_list', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    });
  }

  async getOutboxReportById(id: string) { 
    return this.request(`/api/report/by_bulk?messages_outbox_id=${id}`, { method: 'GET' }); 
  }

  // الگوها
  async getPatterns(page = 1, perPage = 100, filters?: any) {
    let url = `/api/patterns?page=${page}&per_page=${perPage}`;
    if (filters?.state) url += `&filter[state]=${filters.state}`;
    return this.request(url);
  }
}

export const api = new IPPanelAPI();
export default api;
