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

  async connectWallet(walletAddress: string, signature?: string, isEmbeddedWallet?: boolean) {
    return this.request<{ accessToken: string; refreshToken: string; expiresIn: number; user: any }>('/api/auth/wallet/connect', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, isEmbeddedWallet }),
    });
  }

  async adminLogin(email: string, password: string) {
    return this.request<{ accessToken: string; refreshToken: string; admin: any }>('/api/auth/admin/login', {
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
    }>('/api/investments/settings');
  }

  async getCarsAvailable() {
    return this.request<{
      total: number;
      assigned: number;
      available: number;
    }>(`/api/investments/cars/available?network=${NETWORK}`);
  }

  async createInvestment(data: {
    tierId: number;
    walletAddress: string;
    amountUsdt: number;
    txHash?: string;
    // Anti-fraud fields
    _formStartTime?: number;
    website?: string; // honeypot - should be empty
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

  // Profile
  async getProfile(network: 'mainnet' | 'testnet' = 'mainnet') {
    return this.request<{
      profile: {
        id: string;
        walletAddress: string;
        email: string | null;
        name: string | null;
        telegram: string | null;
        whatsapp: string | null;
        instagram: string | null;
        twitter: string | null;
        facebook: string | null;
        avatarUrl: string | null;
        bio: string | null;
        preferredLanguage: string | null;
        emailVerified: boolean;
        createdAt: string;
        lastLoginAt: string | null;
      };
      stats: {
        totalInvestments: number;
        totalInvestedUsdt: number;
        totalInvestedBaht: number;
        activeInvestments: number;
      };
    }>(`/api/profile?network=${network}`);
  }

  async updateProfile(data: {
    name?: string;
    email?: string;
    telegram?: string;
    whatsapp?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    bio?: string;
    preferredLanguage?: string;
  }) {
    return this.request<{ success: boolean; message: string }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Withdrawal
  async requestWithdrawal(
    investmentId: string,
    withdrawalWallet?: string,
    withdrawalType: 'earnings' | 'principal' | 'all' = 'all'
  ) {
    return this.request<{
      success: boolean;
      message: string;
      userWallet?: string;
      principal: number;
      total_earnings: number;
      early_fee: number;
      withdrawal_amount: number;
      is_early: boolean;
      months_passed: number;
    }>(`/api/investments/withdraw-request/${investmentId}`, {
      method: 'POST',
      body: JSON.stringify({
        withdrawalWallet,
        withdrawalType,
        network: NETWORK
      }),
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

  // Withdrawal Management
  async getAdminWithdrawals(params?: { network?: 'mainnet' | 'testnet'; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{
      withdrawals: any[];
      total: number;
      page: number;
      limit: number;
    }>(`/api/admin/withdrawals${query ? `?${query}` : ''}`);
  }

  async processWithdrawalCrypto(investmentId: string, txHash: string) {
    return this.request<{ success: boolean; investment: any }>(`/api/admin/withdrawals/${investmentId}/process-crypto`, {
      method: 'POST',
      body: JSON.stringify({ txHash }),
    });
  }

  async processWithdrawalBank(investmentId: string, data: {
    receiptUrl?: string;
    bankDetails?: string;
    notes?: string;
  }) {
    return this.request<{ success: boolean; investment: any }>(`/api/admin/withdrawals/${investmentId}/process-bank`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectWithdrawal(investmentId: string, reason?: string) {
    return this.request<{ success: boolean; investment: any }>(`/api/admin/withdrawals/${investmentId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Analytics
  async trackPageView(page: string, referrer?: string) {
    return this.request<{ ok: boolean }>('/api/analytics/pageview', {
      method: 'POST',
      body: JSON.stringify({ page, referrer }),
    });
  }
}

export const api = new ApiService();
export default api;
