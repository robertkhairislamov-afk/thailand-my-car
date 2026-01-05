const API_URL = import.meta.env.VITE_API_URL || '';
const IS_TESTNET = import.meta.env.VITE_BSC_TESTNET === 'true';
const NETWORK: 'mainnet' | 'testnet' = IS_TESTNET ? 'testnet' : 'mainnet';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.loadTokens();
  }

  private loadTokens() {
    const tokenData = localStorage.getItem('token_data');
    if (tokenData) {
      try {
        const parsed = JSON.parse(tokenData) as TokenData;
        this.accessToken = parsed.accessToken;
        this.refreshToken = parsed.refreshToken;
        this.tokenExpiresAt = parsed.expiresAt || 0;
      } catch {
        this.clearTokens();
      }
    }
    // Fallback for old token format
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('auth_token');
    }
  }

  private saveTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    const expiresAt = Date.now() + (expiresIn * 1000) - 60000; // 1 min buffer
    const tokenData: TokenData = { accessToken, refreshToken, expiresIn, expiresAt };
    
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiresAt = expiresAt;
    
    localStorage.setItem('token_data', JSON.stringify(tokenData));
    localStorage.setItem('auth_token', accessToken); // Backward compatibility
  }

  setToken(token: string) {
    // Legacy method - just save access token
    this.accessToken = token;
    localStorage.setItem('auth_token', token);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = 0;
    localStorage.removeItem('token_data');
    localStorage.removeItem('auth_token');
  }

  // Legacy alias
  clearToken() {
    this.clearTokens();
  }

  getToken() {
    return this.accessToken;
  }

  isTokenExpired(): boolean {
    return Date.now() >= this.tokenExpiresAt;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    // Prevent concurrent refresh requests
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefresh();
    
    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async doRefresh(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return false;
      }

      const data = await response.json();
      this.saveTokens(data.accessToken, data.refreshToken, data.expiresIn);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry: boolean = true
  ): Promise<ApiResponse<T>> {
    // Check if token needs refresh before request
    if (this.accessToken && this.refreshToken && this.isTokenExpired()) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed && retry) {
        return { error: 'Session expired. Please login again.' };
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle 401 - try to refresh token
      if (response.status === 401 && this.refreshToken && retry) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request<T>(endpoint, options, false);
        }
        return { error: 'Session expired. Please login again.' };
      }

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
    const result = await this.request<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: any;
      // Legacy format support
      token?: string;
    }>('/api/auth/wallet/connect', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature }),
    });

    if (result.data) {
      if (result.data.accessToken && result.data.refreshToken) {
        this.saveTokens(result.data.accessToken, result.data.refreshToken, result.data.expiresIn);
      } else if (result.data.token) {
        // Legacy support
        this.setToken(result.data.token);
      }
    }

    return result;
  }

  async adminLogin(email: string, password: string) {
    const result = await this.request<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      admin: any;
      // Legacy format support
      token?: string;
    }>('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.data) {
      if (result.data.accessToken && result.data.refreshToken) {
        this.saveTokens(result.data.accessToken, result.data.refreshToken, result.data.expiresIn);
      } else if (result.data.token) {
        this.setToken(result.data.token);
      }
    }

    return result;
  }

  async logout() {
    if (this.refreshToken) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      } catch {
        // Ignore logout errors
      }
    }
    this.clearTokens();
  }

  async verifyToken() {
    return this.request<{ valid: boolean; user: any }>('/api/auth/verify');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const result = await this.request<{ message: string }>('/api/auth/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    // After password change, tokens are revoked - need to re-login
    if (result.data) {
      this.clearTokens();
    }
    
    return result;
  }

  // Profile
  async getProfile() {
    return this.request<{
      profile: {
        id: string;
        walletAddress: string;
        email?: string;
        name?: string;
        telegram?: string;
        whatsapp?: string;
        instagram?: string;
        twitter?: string;
        facebook?: string;
        avatarUrl?: string;
        bio?: string;
        preferredLanguage?: string;
        emailVerified?: boolean;
        createdAt: string;
        lastLoginAt?: string;
      };
      stats: {
        totalInvestments: number;
        totalInvestedUsdt: number;
        totalInvestedBaht: number;
        activeInvestments: number;
      };
    }>(`/api/profile?network=${NETWORK}`);
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
    preferredLanguage?: 'ru' | 'en' | 'th';
  }) {
    return this.request<{ message: string; profile: any }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getProfileInvestments() {
    return this.request<{ investments: any[] }>(`/api/profile/investments?network=${NETWORK}`);
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
    _formStartTime?: number;
    website?: string;
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

  async requestWithdrawal(
    investmentId: string,
    withdrawalWallet: string,
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
    userWallet?: string;
  }) {
    return this.request<{ success: boolean; message: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin methods
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
      filters: { actions: string[]; entityTypes: string[] };
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
    userWallet?: string;
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
    return this.request<{ messages: any[]; sessionStatus?: string }>(`/api/chat/messages/${sessionId}${query}`);
  }

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
    const sessionId = this.getOrCreateSessionId();
    return this.request<{ ok: boolean }>("/api/analytics/track", {
      method: "POST",
      body: JSON.stringify({ page, referrer, sessionId }),
    });
  }

  async getAnalyticsStats(period: string = "7d") {
    return this.request<{
      period: string;
      totals: { total_views: string; unique_sessions: string; unique_ips: string };
      daily: { date: string; views: string; sessions: string }[];
      countries: { country: string; country_code: string; views: string; sessions: string }[];
      pages: { page: string; views: string }[];
      today: number;
      yesterday: number;
    }>(`/api/analytics/admin/stats?period=${period}`);
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem("visitor_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      sessionStorage.setItem("visitor_session_id", sessionId);
    }
    return sessionId;
  }
}

export const api = new ApiService();
export default api;
