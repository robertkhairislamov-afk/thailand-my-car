import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  MessageSquare,
  LogOut,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  ChevronRight,
  RefreshCw,
  Globe,
  TestTube2,
  XCircle,
  Play,
  Ban,
  ArrowLeft,
  ExternalLink,
  Copy,
  Wallet,
  Upload,
  X,
  Banknote,
  Bitcoin
} from 'lucide-react';
import { api } from '../../services/api';

interface AdminDashboardProps {
  admin: any;
  onLogout: () => void;
}

type TabType = 'dashboard' | 'investments' | 'withdrawals' | 'users' | 'messages';
type NetworkType = 'mainnet' | 'testnet';
type ModalType = 'crypto' | 'bank' | 'reject' | null;

export function AdminDashboard({ admin, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [network, setNetwork] = useState<NetworkType>('mainnet');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Withdrawals state
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [withdrawalModal, setWithdrawalModal] = useState<ModalType>(null);
  const [txHash, setTxHash] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [bankNotes, setBankNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab, network]);

  const fetchData = async () => {
    setLoading(true);

    if (activeTab === 'dashboard') {
      const response = await api.getAdminDashboard(network);
      if (response.data) {
        setDashboardData(response.data);
      }
    } else if (activeTab === 'investments') {
      const response = await api.getAdminInvestments({ network });
      if (response.data) {
        setInvestments(response.data.investments || []);
      }
    } else if (activeTab === 'messages') {
      const response = await api.getAdminMessages({});
      if (response.data) {
        setMessages(response.data.messages || []);
      }
    } else if (activeTab === 'users') {
      const response = await api.getAdminUsers({});
      if (response.data) {
        setUsers(response.data.users || []);
      }
    } else if (activeTab === 'withdrawals') {
      const response = await api.getAdminWithdrawals({ network });
      if (response.data) {
        setWithdrawals(response.data.withdrawals || []);
      }
    }

    setLoading(false);
  };

  const handleLogout = () => {
    api.clearToken();
    localStorage.removeItem('admin_data');
    onLogout();
  };

  const updateInvestmentStatus = async (id: string, status: string) => {
    await api.updateInvestment(id, { status });
    fetchData();
  };

  const updateMessageStatus = async (id: string, status: string) => {
    await api.updateMessage(id, status);
    fetchData();
  };

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Дашборд', icon: LayoutDashboard },
    { id: 'investments' as TabType, label: 'Инвестиции', icon: TrendingUp },
    { id: 'withdrawals' as TabType, label: 'Заявки на вывод', icon: Wallet, badge: withdrawals.length },
    { id: 'users' as TabType, label: 'Пользователи', icon: Users },
    { id: 'messages' as TabType, label: 'Сообщения', icon: MessageSquare },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'withdrawal_requested': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'new': return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'read': return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активна';
      case 'confirmed': return 'Подтверждена';
      case 'pending': return 'Ожидает';
      case 'completed': return 'Завершена';
      case 'rejected': return 'Отклонена';
      case 'cancelled': return 'Отменена';
      case 'withdrawal_requested': return 'Запрос на вывод';
      case 'new': return 'Новое';
      case 'read': return 'Прочитано';
      case 'replied': return 'Отвечено';
      default: return status;
    }
  };

  // Withdrawal handlers
  const openWithdrawalModal = (withdrawal: any, modalType: ModalType) => {
    setSelectedWithdrawal(withdrawal);
    setWithdrawalModal(modalType);
    setTxHash('');
    setBankDetails('');
    setBankNotes('');
    setRejectReason('');
  };

  const closeWithdrawalModal = () => {
    setWithdrawalModal(null);
    setSelectedWithdrawal(null);
    setTxHash('');
    setBankDetails('');
    setBankNotes('');
    setRejectReason('');
  };

  const handleProcessCrypto = async () => {
    if (!selectedWithdrawal || !txHash.trim()) return;
    setProcessingWithdrawal(true);
    try {
      const response = await api.processWithdrawalCrypto(selectedWithdrawal.id, txHash.trim());
      if (response.data?.success) {
        closeWithdrawalModal();
        fetchData();
      }
    } catch (error) {
      console.error('Process crypto error:', error);
    }
    setProcessingWithdrawal(false);
  };

  const handleProcessBank = async () => {
    if (!selectedWithdrawal) return;
    setProcessingWithdrawal(true);
    try {
      const response = await api.processWithdrawalBank(selectedWithdrawal.id, {
        bankDetails: bankDetails.trim() || undefined,
        notes: bankNotes.trim() || undefined,
      });
      if (response.data?.success) {
        closeWithdrawalModal();
        fetchData();
      }
    } catch (error) {
      console.error('Process bank error:', error);
    }
    setProcessingWithdrawal(false);
  };

  const handleRejectWithdrawal = async () => {
    if (!selectedWithdrawal) return;
    setProcessingWithdrawal(true);
    try {
      const response = await api.rejectWithdrawal(selectedWithdrawal.id, rejectReason.trim() || undefined);
      if (response.data?.success) {
        closeWithdrawalModal();
        fetchData();
      }
    } catch (error) {
      console.error('Reject withdrawal error:', error);
    }
    setProcessingWithdrawal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#143C50] to-[#0a1f2d]">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-[#009696]/20">
              <LayoutDashboard className="w-6 h-6 text-[#28B48C]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Thailand My Car</h1>
              <p className="text-sm text-gray-400">Панель администратора</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Network Switcher */}
            <div className="flex rounded-xl overflow-hidden border border-white/10">
              <button
                onClick={() => setNetwork('mainnet')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all ${
                  network === 'mainnet'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Globe className="w-4 h-4" />
                Mainnet
              </button>
              <button
                onClick={() => setNetwork('testnet')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all ${
                  network === 'testnet'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <TestTube2 className="w-4 h-4" />
                Testnet
              </button>
            </div>

            <div className="text-right">
              <p className="text-sm text-white">{admin?.name || admin?.email}</p>
              <p className="text-xs text-gray-400">{admin?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Testnet Banner */}
        {network === 'testnet' && (
          <div className="mb-4 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#F59E0B'
            }}>
            <TestTube2 className="w-4 h-4" />
            TESTNET MODE - Тестовые данные
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#009696] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {'badge' in tab && tab.badge > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={fetchData}
            className="ml-auto p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#009696]" />
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && dashboardData && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-green-500/20">
                        <DollarSign className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Всего инвестиций</p>
                        <p className="text-2xl font-bold text-white">
                          ${parseFloat(dashboardData.investments?.total_usdt || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-500/20">
                        <Users className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Пользователей</p>
                        <p className="text-2xl font-bold text-white">
                          {dashboardData.users?.total || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-yellow-500/20">
                        <Clock className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Ожидают</p>
                        <p className="text-2xl font-bold text-white">
                          {dashboardData.investments?.pending || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-purple-500/20">
                        <MessageSquare className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Новых сообщений</p>
                        <p className="text-2xl font-bold text-white">
                          {dashboardData.messages?.new_messages || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Investments */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Последние инвестиции</h3>
                  {dashboardData.recentInvestments?.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.recentInvestments.map((inv: any) => (
                        <div key={inv.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div>
                            <p className="text-white font-mono text-sm">
                              {inv.wallet_address?.slice(0, 6)}...{inv.wallet_address?.slice(-4)}
                            </p>
                            <p className="text-sm text-gray-400">{inv.tier_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">${parseFloat(inv.amount_usdt).toLocaleString()}</p>
                            <span className={`inline-block px-2 py-1 rounded-lg text-xs border ${getStatusColor(inv.status)}`}>
                              {getStatusLabel(inv.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">Нет инвестиций</p>
                  )}
                </div>
              </div>
            )}

            {/* Investments Tab */}
            {activeTab === 'investments' && (
              <>
                {selectedInvestment ? (
                  /* Investment Detail View */
                  <div className="space-y-6">
                    {/* Header with back button */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setSelectedInvestment(null)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            Инвестиция #{selectedInvestment.id}
                          </h2>
                          <p className="text-gray-400">
                            {new Date(selectedInvestment.invested_at || selectedInvestment.created_at).toLocaleString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-block px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(selectedInvestment.status)}`}>
                        {getStatusLabel(selectedInvestment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Main Info */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Investment Info */}
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Информация об инвестиции</h3>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Сумма</p>
                              <p className="text-2xl font-bold text-white">
                                ${parseFloat(selectedInvestment.amount_usdt || 0).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-400">USDT</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Тир</p>
                              <p className="text-xl font-semibold text-white">
                                {selectedInvestment.tier_name || (selectedInvestment.tier_id === 1 ? '6 месяцев +20%' : 'Долгосрочное')}
                              </p>
                              <p className="text-sm text-gray-400">
                                {selectedInvestment.tier_id === 1 ? 'ROI: +20%' : 'Доля в бизнесе'}
                              </p>
                            </div>
                            {selectedInvestment.tier_id === 1 && (
                              <>
                                <div>
                                  <p className="text-sm text-gray-400 mb-1">Ожидаемый возврат</p>
                                  <p className="text-xl font-bold text-green-400">
                                    ${(parseFloat(selectedInvestment.amount_usdt || 0) * 1.2).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400 mb-1">Дата разблокировки</p>
                                  <p className="text-white">
                                    {selectedInvestment.unlock_date
                                      ? new Date(selectedInvestment.unlock_date).toLocaleDateString('ru-RU')
                                      : 'Не установлена'}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Blockchain Info */}
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Данные блокчейна</h3>
                          <div className="space-y-4">
                            {selectedInvestment.tx_hash && (
                              <div>
                                <p className="text-sm text-gray-400 mb-2">Transaction Hash</p>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
                                  <code className="flex-1 text-sm font-mono text-white truncate">
                                    {selectedInvestment.tx_hash}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(selectedInvestment.tx_hash)}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                  >
                                    {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                  </button>
                                  <a
                                    href={`https://bscscan.com/tx/${selectedInvestment.tx_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4 text-[#009696]" />
                                  </a>
                                </div>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-gray-400 mb-2">Адрес кошелька</p>
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
                                <code className="flex-1 text-sm font-mono text-white truncate">
                                  {selectedInvestment.wallet_address}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(selectedInvestment.wallet_address)}
                                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                  <Copy className="w-4 h-4 text-gray-400" />
                                </button>
                                <a
                                  href={`https://bscscan.com/address/${selectedInvestment.wallet_address}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4 text-[#009696]" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions Sidebar */}
                      <div className="space-y-6">
                        {/* Actions */}
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Действия</h3>
                          <div className="space-y-3">
                            {/* Pending status actions */}
                            {selectedInvestment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    updateInvestmentStatus(selectedInvestment.id, 'confirmed');
                                    setSelectedInvestment({ ...selectedInvestment, status: 'confirmed' });
                                  }}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all font-semibold"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                  Подтвердить инвестицию
                                </button>
                                <button
                                  onClick={() => {
                                    updateInvestmentStatus(selectedInvestment.id, 'rejected');
                                    setSelectedInvestment({ ...selectedInvestment, status: 'rejected' });
                                  }}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-semibold"
                                >
                                  <XCircle className="w-5 h-5" />
                                  Отклонить
                                </button>
                              </>
                            )}

                            {/* Confirmed status actions */}
                            {selectedInvestment.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => {
                                    updateInvestmentStatus(selectedInvestment.id, 'active');
                                    setSelectedInvestment({ ...selectedInvestment, status: 'active' });
                                  }}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all font-semibold"
                                >
                                  <Play className="w-5 h-5" />
                                  Активировать
                                </button>
                                <button
                                  onClick={() => {
                                    updateInvestmentStatus(selectedInvestment.id, 'cancelled');
                                    setSelectedInvestment({ ...selectedInvestment, status: 'cancelled' });
                                  }}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-semibold"
                                >
                                  <Ban className="w-5 h-5" />
                                  Отменить
                                </button>
                              </>
                            )}

                            {/* Active status actions */}
                            {selectedInvestment.status === 'active' && (
                              <>
                                <button
                                  onClick={() => {
                                    updateInvestmentStatus(selectedInvestment.id, 'completed');
                                    setSelectedInvestment({ ...selectedInvestment, status: 'completed' });
                                  }}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all font-semibold"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                  Завершить (выплатить)
                                </button>
                                <button
                                  onClick={() => {
                                    updateInvestmentStatus(selectedInvestment.id, 'cancelled');
                                    setSelectedInvestment({ ...selectedInvestment, status: 'cancelled' });
                                  }}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-semibold"
                                >
                                  <Ban className="w-5 h-5" />
                                  Отменить
                                </button>
                              </>
                            )}

                            {/* Completed/Rejected/Cancelled - no actions */}
                            {['completed', 'rejected', 'cancelled'].includes(selectedInvestment.status) && (
                              <p className="text-center text-gray-400 py-4">
                                Инвестиция {getStatusLabel(selectedInvestment.status).toLowerCase()}.
                                Действия недоступны.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Flow Info */}
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Статусы</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                              <span className="text-gray-400">Ожидает</span>
                              <span className="text-gray-500">→ проверка TX</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-400"></div>
                              <span className="text-gray-400">Подтверждена</span>
                              <span className="text-gray-500">→ TX OK</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                              <span className="text-gray-400">Активна</span>
                              <span className="text-gray-500">→ работает</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                              <span className="text-gray-400">Завершена</span>
                              <span className="text-gray-500">→ выплачено</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-400"></div>
                              <span className="text-gray-400">Отклонена/Отменена</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Investments List */
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                      <h3 className="text-lg font-semibold text-white">Все инвестиции</h3>
                    </div>
                    {investments.length > 0 ? (
                      <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-white/5">
                              <tr>
                                <th className="px-6 py-4 text-left text-sm text-gray-400">ID</th>
                                <th className="px-6 py-4 text-left text-sm text-gray-400">Кошелёк</th>
                                <th className="px-6 py-4 text-left text-sm text-gray-400">Тир</th>
                                <th className="px-6 py-4 text-left text-sm text-gray-400">Сумма</th>
                                <th className="px-6 py-4 text-left text-sm text-gray-400">Статус</th>
                                <th className="px-6 py-4 text-left text-sm text-gray-400">Дата</th>
                                <th className="px-6 py-4 text-left text-sm text-gray-400">Действия</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {investments.map((inv) => (
                                <tr key={inv.id} className="hover:bg-white/5">
                                  <td className="px-6 py-4 text-white">#{inv.id}</td>
                                  <td className="px-6 py-4">
                                    <p className="text-white font-mono text-sm">
                                      {inv.wallet_address?.slice(0, 6)}...{inv.wallet_address?.slice(-4)}
                                    </p>
                                  </td>
                                  <td className="px-6 py-4 text-gray-300">{inv.tier_name || (inv.tier_id === 1 ? '6 мес' : 'Долгосрок')}</td>
                                  <td className="px-6 py-4 text-white font-semibold">
                                    ${parseFloat(inv.amount_usdt || 0).toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-block px-2 py-1 rounded-lg text-xs border ${getStatusColor(inv.status)}`}>
                                      {getStatusLabel(inv.status)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-gray-400 text-sm">
                                    {new Date(inv.invested_at || inv.created_at).toLocaleDateString('ru')}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => setSelectedInvestment(inv)}
                                        className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                                        title="Подробнее"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                      {inv.status === 'pending' && (
                                        <>
                                          <button
                                            onClick={() => updateInvestmentStatus(inv.id, 'confirmed')}
                                            className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                            title="Подтвердить"
                                          >
                                            <CheckCircle className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => updateInvestmentStatus(inv.id, 'rejected')}
                                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                            title="Отклонить"
                                          >
                                            <XCircle className="w-4 h-4" />
                                          </button>
                                        </>
                                      )}
                                      {inv.status === 'confirmed' && (
                                        <button
                                          onClick={() => updateInvestmentStatus(inv.id, 'active')}
                                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                          title="Активировать"
                                        >
                                          <Play className="w-4 h-4" />
                                        </button>
                                      )}
                                      {inv.status === 'active' && (
                                        <button
                                          onClick={() => updateInvestmentStatus(inv.id, 'completed')}
                                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                          title="Завершить"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-white/5">
                          {investments.map((inv) => (
                            <div key={inv.id} className="p-4 hover:bg-white/5" onClick={() => setSelectedInvestment(inv)}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-semibold">#{inv.id}</span>
                                  <span className={`px-2 py-1 rounded-lg text-xs border ${getStatusColor(inv.status)}`}>
                                    {getStatusLabel(inv.status)}
                                  </span>
                                </div>
                                <span className="text-white font-bold">${parseFloat(inv.amount_usdt || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <code className="text-gray-400 font-mono">
                                  {inv.wallet_address?.slice(0, 6)}...{inv.wallet_address?.slice(-4)}
                                </code>
                                <span className="text-gray-500">
                                  {new Date(inv.invested_at || inv.created_at).toLocaleDateString('ru')}
                                </span>
                              </div>
                              <div className="flex gap-2 mt-3">
                                {inv.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); updateInvestmentStatus(inv.id, 'confirmed'); }}
                                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm"
                                    >
                                      <CheckCircle className="w-4 h-4" /> Подтвердить
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); updateInvestmentStatus(inv.id, 'rejected'); }}
                                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm"
                                    >
                                      <XCircle className="w-4 h-4" /> Отклонить
                                    </button>
                                  </>
                                )}
                                {inv.status === 'confirmed' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateInvestmentStatus(inv.id, 'active'); }}
                                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm"
                                  >
                                    <Play className="w-4 h-4" /> Активировать
                                  </button>
                                )}
                                {inv.status === 'active' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateInvestmentStatus(inv.id, 'completed'); }}
                                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm"
                                  >
                                    <CheckCircle className="w-4 h-4" /> Завершить
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400 text-center py-12">Нет инвестиций</p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white">Пользователи</h3>
                </div>
                {users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm text-gray-400">Кошелёк</th>
                          <th className="px-6 py-4 text-left text-sm text-gray-400">Email</th>
                          <th className="px-6 py-4 text-left text-sm text-gray-400">Инвестиций</th>
                          <th className="px-6 py-4 text-left text-sm text-gray-400">Всего вложено</th>
                          <th className="px-6 py-4 text-left text-sm text-gray-400">Регистрация</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-white/5">
                            <td className="px-6 py-4">
                              <p className="text-white font-mono text-sm">
                                {user.wallet_address?.slice(0, 6)}...{user.wallet_address?.slice(-4)}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-gray-300">{user.email || '-'}</td>
                            <td className="px-6 py-4 text-white">{user.total_investments}</td>
                            <td className="px-6 py-4 text-white font-semibold">
                              ${parseFloat(user.total_invested_usdt || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-gray-400 text-sm">
                              {new Date(user.created_at).toLocaleDateString('ru')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-12">Нет пользователей</p>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white">Сообщения</h3>
                </div>
                {messages.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {messages.map((msg) => (
                      <div key={msg.id} className="p-6 hover:bg-white/5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-semibold">{msg.name}</p>
                            <p className="text-sm text-gray-400">{msg.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block px-2 py-1 rounded-lg text-xs border ${getStatusColor(msg.status)}`}>
                              {getStatusLabel(msg.status)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.created_at).toLocaleDateString('ru')}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{msg.subject}</p>
                        <p className="text-gray-300">{msg.message}</p>
                        {msg.status === 'new' && (
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => updateMessageStatus(msg.id, 'read')}
                              className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30"
                            >
                              Отметить прочитанным
                            </button>
                            <button
                              onClick={() => updateMessageStatus(msg.id, 'replied')}
                              className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30"
                            >
                              Отмечено как отвечено
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-12">Нет сообщений</p>
                )}
              </div>
            )}

            {/* Withdrawals Tab */}
            {activeTab === 'withdrawals' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-orange-400" />
                    Заявки на вывод средств
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Обработайте запросы инвесторов на вывод средств
                  </p>
                </div>
                {withdrawals.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {withdrawals.map((wd, index) => (
                      <div key={wd.id} className="p-6 hover:bg-white/5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-white font-semibold">Заявка #{index + 1}</p>
                              <span className={`inline-block px-2 py-1 rounded-lg text-xs border ${getStatusColor(wd.status)}`}>
                                {getStatusLabel(wd.status)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">ID: {wd.id}</p>
                            <div className="p-2 bg-white/5 rounded-lg mb-2">
                              <p className="text-xs text-gray-400 mb-1">Кошелёк инвестора:</p>
                              <code className="text-sm font-mono text-white break-all">
                                {wd.wallet_address}
                              </code>
                            </div>
                            {wd.user_email && (
                              <p className="text-sm text-gray-500">{wd.user_email}</p>
                            )}
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className="text-2xl font-bold text-white">
                              ${parseFloat(wd.return_amount || wd.amount_usdt || 0).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-400">к выплате</p>
                          </div>
                        </div>

                        {/* Withdrawal Type Badge */}
                        {wd.withdrawal_type && (
                          <div className="mb-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                              wd.withdrawal_type === 'earnings'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : wd.withdrawal_type === 'principal'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            }`}>
                              {wd.withdrawal_type === 'earnings' && 'Вывод процентов'}
                              {wd.withdrawal_type === 'principal' && 'Вывод тела депозита'}
                              {wd.withdrawal_type === 'all' && 'Полный вывод (тело + проценты)'}
                            </span>
                          </div>
                        )}

                        {/* Withdrawal Wallet */}
                        {wd.withdrawal_wallet && (
                          <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs text-orange-400 font-semibold">КУДА ОТПРАВИТЬ (указан инвестором)</p>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => copyToClipboard(wd.withdrawal_wallet)}
                                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-xs text-gray-300 flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" /> Копировать
                                </button>
                                <a
                                  href={`https://bscscan.com/address/${wd.withdrawal_wallet}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-xs text-[#009696] flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" /> BscScan
                                </a>
                              </div>
                            </div>
                            <code className="block text-white font-mono text-sm break-all bg-black/20 p-2 rounded select-all">
                              {wd.withdrawal_wallet}
                            </code>
                          </div>
                        )}

                        {/* Investment Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-white/5 rounded-xl">
                          <div>
                            <p className="text-xs text-gray-400">Инвестировано</p>
                            <p className="text-white font-semibold">${parseFloat(wd.amount_usdt || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Заработано</p>
                            <p className="text-green-400 font-semibold">+${parseFloat(wd.staking_earned || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Комиссия</p>
                            <p className="text-red-400 font-semibold">-${parseFloat(wd.early_withdrawal_fee || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Тип инвестиции</p>
                            <p className="text-white">{wd.tier_type === 'car_share' ? 'Доля в авто' : 'Стейкинг'}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => openWithdrawalModal(wd, 'crypto')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#009696]/20 text-[#28B48C] hover:bg-[#009696]/30 transition-all font-semibold"
                          >
                            <Bitcoin className="w-4 h-4" />
                            Выплатить крипто
                          </button>
                          <button
                            onClick={() => openWithdrawalModal(wd, 'bank')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all font-semibold"
                          >
                            <Banknote className="w-4 h-4" />
                            Банковский перевод
                          </button>
                          <button
                            onClick={() => openWithdrawalModal(wd, 'reject')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-semibold"
                          >
                            <XCircle className="w-4 h-4" />
                            Отклонить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Нет заявок на вывод</p>
                    <p className="text-gray-500 text-sm mt-1">Все запросы обработаны</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Withdrawal Modals */}
      {withdrawalModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={closeWithdrawalModal}>
          <div className="bg-[#1a3a4a] rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {withdrawalModal === 'crypto' && <><Bitcoin className="w-5 h-5 text-[#28B48C]" /> Выплата крипто</>}
                {withdrawalModal === 'bank' && <><Banknote className="w-5 h-5 text-blue-400" /> Банк перевод</>}
                {withdrawalModal === 'reject' && <><XCircle className="w-5 h-5 text-red-400" /> Отклонить</>}
              </h3>
              <button
                onClick={closeWithdrawalModal}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4">
              {/* Investment Info */}
              <div className="p-4 bg-white/5 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Инвестиция</span>
                  <code className="text-xs text-gray-500 font-mono">#{selectedWithdrawal.id}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Кошелёк</span>
                  <button
                    onClick={() => copyToClipboard(selectedWithdrawal.wallet_address || '')}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-xs text-gray-300 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Копировать
                  </button>
                </div>
                <code 
                  className="block text-white font-mono text-sm break-all bg-black/20 p-3 rounded select-all cursor-pointer hover:bg-black/30 transition-colors" 
                  onClick={() => copyToClipboard(selectedWithdrawal.wallet_address || '')}
                  title="Нажмите чтобы скопировать"
                >
                  {selectedWithdrawal.wallet_address || 'Не указан'}
                </code>
                {selectedWithdrawal.withdrawal_type && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Тип вывода</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      selectedWithdrawal.withdrawal_type === 'earnings'
                        ? 'bg-green-500/20 text-green-400'
                        : selectedWithdrawal.withdrawal_type === 'principal'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {selectedWithdrawal.withdrawal_type === 'earnings' && 'Проценты'}
                      {selectedWithdrawal.withdrawal_type === 'principal' && 'Тело депозита'}
                      {selectedWithdrawal.withdrawal_type === 'all' && 'Всё'}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Сумма к выплате</span>
                  <span className="text-2xl font-bold text-green-400">
                    ${parseFloat(selectedWithdrawal.return_amount || selectedWithdrawal.amount_usdt || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Withdrawal Wallet - КУДА ОТПРАВИТЬ */}
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-orange-400 font-semibold">КУДА ОТПРАВИТЬ USDT (BEP20)</p>
                  <button
                    onClick={() => copyToClipboard(selectedWithdrawal.withdrawal_wallet || selectedWithdrawal.wallet_address || '')}
                    className="px-3 py-1 rounded-lg bg-orange-500/30 hover:bg-orange-500/50 transition-colors text-xs text-orange-400 flex items-center gap-1"
                  >
                    {copied ? <><CheckCircle className="w-3 h-3" /> Скопировано</> : <><Copy className="w-3 h-3" /> Копировать</>}
                  </button>
                </div>
                <code className="block text-white font-mono text-xs break-all bg-black/30 p-3 rounded select-all">
                  {selectedWithdrawal.withdrawal_wallet || selectedWithdrawal.wallet_address || 'Не указан'}
                </code>
              </div>

              {/* Crypto Modal Form */}
              {withdrawalModal === 'crypto' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Transaction Hash (TX Hash) *
                    </label>
                    <input
                      type="text"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#009696]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Введите хэш транзакции отправки USDT на кошелёк инвестора
                    </p>
                  </div>
                  <button
                    onClick={handleProcessCrypto}
                    disabled={!txHash.trim() || processingWithdrawal}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#009696] text-white hover:bg-[#00b8b8] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingWithdrawal ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Подтвердить выплату
                  </button>
                </div>
              )}

              {/* Bank Modal Form */}
              {withdrawalModal === 'bank' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Реквизиты перевода / Номер операции
                    </label>
                    <input
                      type="text"
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                      placeholder="Номер операции, реквизиты..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#009696]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Комментарий (опционально)
                    </label>
                    <textarea
                      value={bankNotes}
                      onChange={(e) => setBankNotes(e.target.value)}
                      placeholder="Дополнительная информация о переводе..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#009696] resize-none"
                    />
                  </div>
                  <button
                    onClick={handleProcessBank}
                    disabled={processingWithdrawal}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingWithdrawal ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Подтвердить перевод
                  </button>
                </div>
              )}

              {/* Reject Modal Form */}
              {withdrawalModal === 'reject' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm">
                      Заявка будет отклонена, а инвестиция вернётся в статус "Активна".
                      Инвестор сможет подать заявку повторно.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Причина отклонения (опционально)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Укажите причину отклонения..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleRejectWithdrawal}
                    disabled={processingWithdrawal}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingWithdrawal ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    Отклонить заявку
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
