const API_URL = import.meta.env.VITE_API_URL || '';
const IS_TESTNET = import.meta.env.VITE_BSC_TESTNET === 'true';
const NETWORK: 'mainnet' | 'testnet' = IS_TESTNET ? 'testnet' : 'mainnet';

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

  getToken() {
    return this.token;
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
  async getWalletNonce(walletAddress: string) {
    return this.request<{ message: string; nonce: string }>('/api/auth/wallet/nonce', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  }

  async connectWallet(walletAddress: string, signature?: string) {
    return this.request<{ token: string; user: any }>('/api/auth/wallet/connect', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature }),
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

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/api/auth/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
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
    }>(`/api/investments/stats?network=${NETWORK}`);
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
    }>(`/api/investments/fundraising?network=${NETWORK}`);
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
      exchange_rate_thb_usd: string;
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
    // Anti-fraud fields
    _formStartTime?: number;
    website?: string; // honeypot - should be empty
    network?: 'mainnet' | 'testnet';
  }) {
    return this.request<{
      id: string;
      status: string;
      tx_verified?: boolean;
      tx_verification_status?: string;
    }>('/api/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyTransaction(investmentId: string) {
    return this.request<{
      success: boolean;
      verified: boolean;
      status: string;
      details?: any;
    }>(`/api/investments/verify-tx/${investmentId}`, {
      method: 'POST',
    });
  }

  async getVerificationStats() {
    return this.request<{
      total: string;
      verified: string;
      pending: string;
      failed: string;
      amount_mismatch: string;
      not_found: string;
      no_tx_hash: string;
    }>('/api/investments/verification-stats');
  }

  async getWalletInvestments(walletAddress: string) {
    return this.request<any[]>(`/api/investments/wallet/${walletAddress}?network=${NETWORK}`);
  }

  async getMyInvestments() {
    return this.request<any[]>(`/api/investments/my?network=${NETWORK}`);
  }

  async requestWithdrawal(investmentId: string) {
    return this.request<{
      success: boolean;
      message: string;
      principal: number;
      total_earnings: number;
      early_fee: number;
      withdrawal_amount: number;
      is_early: boolean;
      months_passed: number;
    }>(`/api/investments/withdraw-request/${investmentId}`, {
      method: 'POST',
    });
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
  async getAdminDashboard(network: 'mainnet' | 'testnet' = 'mainnet') {
    return this.request<any>(`/api/admin/dashboard?network=${network}`);
  }

  async getAdminInvestments(params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
    network?: 'mainnet' | 'testnet';
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

  // Logs
  async getAdminLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{
      logs: any[];
      total: number;
      page: number;
      limit: number;
      filters: {
        actions: string[];
        entityTypes: string[];
      };
    }>(`/api/admin/logs${query ? `?${query}` : ''}`);
  }

  async getAdminLogsStats() {
    return this.request<{
      total: number;
      today: number;
      byAction: { action: string; count: string }[];
      byEntity: { entity_type: string; count: string }[];
    }>('/api/admin/logs/stats');
  }

  // Admin Settings
  async getAdminSettings() {
    return this.request<Array<{
      key: string;
      value: string;
      description: string;
      updated_at: string;
    }>>('/api/admin/settings');
  }

  async updateAdminSetting(key: string, value: string, pin?: string) {
    return this.request<{
      key: string;
      value: string;
      description: string;
      updated_at: string;
    }>(`/api/admin/settings/${key}`, {
      method: 'PATCH',
      body: JSON.stringify({ value, pin }),
    });
  }

  // Chat
  async createChatSession(data: {
    sessionId?: string;
    userName: string;
    userEmail?: string;
    userWallet?: string;
  }) {
    return this.request<{ session: any }>('/api/chat/session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendChatMessage(data: {
    sessionId: string;
    sender: 'user' | 'agent';
    senderName?: string;
    message: string;
  }) {
    return this.request<{ message: any }>('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async requestAdmin(sessionId: string) {
    return this.request<{ success: boolean }>('/api/chat/request-admin', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async getChatMessages(sessionId: string, after?: string) {
    const query = after ? `?after=${after}` : '';
    return this.request<{ messages: any[] }>(`/api/chat/messages/${sessionId}${query}`);
  }

  // Admin Chat
  async getAdminChatSessions(params?: { status?: string; needsAdmin?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ sessions: any[] }>(`/api/chat/admin/sessions${query ? `?${query}` : ''}`);
  }

  async getAdminChatMessages(sessionId: string) {
    return this.request<{ session: any; messages: any[] }>(`/api/chat/admin/messages/${sessionId}`);
  }

  async sendAdminChatMessage(sessionId: string, message: string) {
    return this.request<{ message: any }>('/api/chat/admin/message', {
      method: 'POST',
      body: JSON.stringify({ sessionId, message }),
    });
  }

  async closeChatSession(sessionId: string) {
    return this.request<{ success: boolean }>(`/api/chat/admin/close/${sessionId}`, {
      method: 'POST',
    });
  }

  async getAdminUnreadChats() {
    return this.request<{ unread: number }>('/api/chat/admin/unread');
  }
}

export const api = new ApiService();
export default api;
