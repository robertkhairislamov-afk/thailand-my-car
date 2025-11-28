const API_URL = import.meta.env.VITE_API_URL || '';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed' };
      }

      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Network error' };
    }
  }

  // Auth
  async connectWallet(walletAddress: string) {
    return this.request<{ token: string; user: any }>('/api/auth/wallet/connect', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  }

  async adminLogin(email: string, password: string) {
    return this.request<{ token: string; admin: any }>('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async verifyToken() {
    return this.request<{ valid: boolean; user: any }>('/api/auth/verify');
  }

  // Investments
  async getInvestmentTiers() {
    return this.request<any[]>('/api/investments/tiers');
  }

  async getStats() {
    return this.request<{
      total_invested_usdt: string;
      total_investors: string;
      active_investments: string;
      completed_investments: string;
    }>('/api/investments/stats');
  }

  async getFundraising() {
    return this.request<{
      target: { baht: number; usd: number };
      current: { baht: number; usd: number };
      progress: number;
      investors: { current: number; max: number };
      cars: { total: number; assigned: number; available: number };
      deadline: string;
      isActive: boolean;
    }>('/api/investments/fundraising');
  }

  async getPlatformSettings() {
    return this.request<{
      platform_wallet: string;
      staking_monthly_rate: string;
      staking_annual_rate: string;
      large_investor_return: string;
      early_withdrawal_fee: string;
      min_staking_investment_usd: string;
      min_car_investment_usd: string;
      total_cars_available: string;
    }>('/api/investments/settings');
  }

  async getCarsAvailable() {
    return this.request<{
      total: number;
      assigned: number;
      available: number;
    }>('/api/investments/cars/available');
  }

  async createInvestment(data: {
    tierId: number;
    walletAddress: string;
    amountUsdt: number;
    txHash?: string;
  }) {
    return this.request<any>('/api/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWalletInvestments(walletAddress: string) {
    return this.request<any[]>(`/api/investments/wallet/${walletAddress}`);
  }

  async getMyInvestments() {
    return this.request<any[]>('/api/investments/my');
  }

  // Contact
  async sendContactMessage(data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }) {
    return this.request<{ success: boolean; message: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin
  async getAdminDashboard() {
    return this.request<any>('/api/admin/dashboard');
  }

  async getAdminInvestments(params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any>(`/api/admin/investments${query ? `?${query}` : ''}`);
  }

  async updateInvestment(id: string, data: {
    status?: string;
    notes?: string;
    returnAmount?: number;
    nftTokenId?: string;
  }) {
    return this.request<any>(`/api/admin/investments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getAdminUsers(params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any>(`/api/admin/users${query ? `?${query}` : ''}`);
  }

  async getAdminMessages(params?: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any>(`/api/admin/messages${query ? `?${query}` : ''}`);
  }

  async updateMessage(id: string, status: string) {
    return this.request<any>(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

export const api = new ApiService();
export default api;
