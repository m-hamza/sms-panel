const BASE_URL = 'https://edge.ippanel.com/v1';

export interface ApiResponse<T = any> {
  data: T;
  meta: {
    status: boolean;
    message: string;
    message_code: string;
    errors?: Record<string, string[]>;
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

class IPPanelAPI {
  private apiKey: string = '';

  setApiKey(key: string) {
    this.apiKey = key;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': this.apiKey,
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    
    if (!data.meta?.status && response.status === 401) {
      throw new Error('توکن نامعتبر یا منقضی شده است');
    }

    return data;
  }

  // Auth
  async checkToken(): Promise<ApiResponse> {
    return this.request('/api/acl/auth/check_token', { method: 'POST' });
  }

  // Numbers
  async getNumbers(page = 1, perPage = 100): Promise<ApiResponse> {
    return this.request(`/api/number/numbers?page=${page}&per_page=${perPage}`);
  }

  // Credit
  async getCredit(): Promise<ApiResponse> {
    return this.request('/api/payment/credit/mine');
  }

  // Send SMS - Webservice (Single/Bulk)
  async sendSMS(data: {
    from_number: string;
    message: string;
    recipients: string[];
    send_time?: string;
  }): Promise<ApiResponse> {
    return this.request('/api/send', {
      method: 'POST',
      body: JSON.stringify({
        sending_type: 'webservice',
        from_number: data.from_number,
        message: data.message,
        params: { recipients: data.recipients },
        send_time: data.send_time,
      }),
    });
  }

  // Send SMS - Peer to Peer
  async sendPeerToPeer(data: {
    from_number: string;
    params: Array<{
      recipients: string[];
      message: string;
    }>;
    send_time?: string;
  }): Promise<ApiResponse> {
    return this.request('/api/send', {
      method: 'POST',
      body: JSON.stringify({
        sending_type: 'peer_to_peer',
        from_number: data.from_number,
        params: data.params,
        send_time: data.send_time,
      }),
    });
  }

  // Send SMS - Phonebook
  async sendToPhonebook(data: {
    from_number: string;
    message: string;
    params: Array<{
      phonebook_id: string;
      type: 'all' | 'detail';
      start?: string;
      size?: string;
      number_ids?: string[];
    }>;
    send_time?: string;
  }): Promise<ApiResponse> {
    return this.request('/api/send', {
      method: 'POST',
      body: JSON.stringify({
        sending_type: 'phonebook',
        from_number: data.from_number,
        message: data.message,
        params: data.params,
        send_time: data.send_time,
      }),
    });
  }

  // Send SMS - Pattern
  async sendPatternSMS(data: {
    from_number: string;
    code: string;
    recipients: string[];
    params: Record<string, string>;
    phonebook?: {
      id: number;
      name?: string;
      pre?: string;
      email?: string;
      options?: Record<string, string>;
    };
  }): Promise<ApiResponse> {
    const body: any = {
      sending_type: 'pattern',
      from_number: data.from_number,
      code: data.code,
      recipients: data.recipients,
      params: data.params,
    };

    if (data.phonebook) {
      body.phonebook = data.phonebook;
    }

    return this.request('/api/send', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Phonebooks
  async getPhonebooks(page = 1, perPage = 100): Promise<ApiResponse> {
    return this.request(`/api/phonebooks/list-new?page=${page}&per_page=${perPage}`);
  }

  // Reports - Outbox
  async getOutboxReport(data: {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
  }): Promise<ApiResponse> {
    return this.request('/api/report/new_list', {
      method: 'POST',
      body: JSON.stringify({
        page: data.page || 1,
        limit: data.limit || 20,
        filters: data.filters || {},
      }),
    });
  }

  // Reports - Outbox by ID (Full details)
  async getOutboxReportById(id: string): Promise<ApiResponse> {
    return this.request(`/api/report/by_bulk?messages_outbox_id=${id}`, { method: 'GET' });
  }

  // Reports - Bulk Stats
  async getBulkStats(id: string): Promise<ApiResponse> {
    return this.request(`/api/report/bulk/${id}/stats`);
  }

  // Reports - Bulk Recipients
  async getBulkRecipients(id: string, page = 1, limit = 20): Promise<ApiResponse> {
    return this.request(`/api/report/bulk/${id}/recipients?page=${page}&limit=${limit}`);
  }

  // Reports - Inbox
  async getInboxReport(data: {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
  }): Promise<ApiResponse> {
    return this.request('/api/report/inbox', {
      method: 'POST',
      body: JSON.stringify({
        page: data.page || 1,
        limit: data.limit || 20,
        filters: data.filters || {},
      }),
    });
  }

  // Calculate Price
  async calculatePrice(data: {
    from_number: string;
    message: string;
    recipients: string[];
  }): Promise<ApiResponse> {
    return this.request('/api/send/calculate-price', {
      method: 'POST',
      body: JSON.stringify({
        from_number: data.from_number,
        message: data.message,
        recipients: data.recipients,
      }),
    });
  }

  // Patterns
  async getPatterns(page = 1, perPage = 100): Promise<ApiResponse> {
    return this.request(`/api/pattern/list?page=${page}&per_page=${perPage}`);
  }
}

export const api = new IPPanelAPI();
export default api;
