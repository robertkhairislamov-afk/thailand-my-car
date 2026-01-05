import { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, Wallet, Activity, Lock, Unlock, Calendar, Percent, ArrowRight, X, AlertTriangle, Loader2, Clock, WifiOff, RefreshCw, CheckCircle, Copy, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface Investment {
  id: string;
  amount: number;
  status: 'active' | 'withdrawal-request' | 'completed' | 'pending' | 'pending_confirmation';
  type: 'staking' | 'car';
  startDate: string;
  earned: number;
  withdrawnEarnings: number;
  monthlyRate: number;
  totalMonths: number;
  monthsPassed: number;
  daysPassed: number;
  isLocked: boolean;
  monthsUntilUnlock: number;
}

interface InvestorDashboardProps {
  walletAddress?: string | null;
}

// Withdrawal modal steps
type WithdrawalStep = 'select' | 'wallet' | 'confirm' | 'success';
type WithdrawalType = 'earnings' | 'principal' | 'all';

export function InvestorDashboard({ walletAddress }: InvestorDashboardProps) {
  const { t, language } = useLanguage();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);

  // Withdrawal form state
  const [withdrawalStep, setWithdrawalStep] = useState<WithdrawalStep>('select');
  const [withdrawalType, setWithdrawalType] = useState<WithdrawalType>('all');
  const [withdrawalWallet, setWithdrawalWallet] = useState('');
  const [walletError, setWalletError] = useState<string | null>(null);
  const [walletConfirmed, setWalletConfirmed] = useState(false);

  // Load investments from backend
  const loadInvestments = async () => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.getWalletInvestments(walletAddress);

      if (response.error) {
        setError(response.error === 'Network error'
          ? t('dashboard.noConnection')
          : response.error);
        setLoading(false);
        return;
      }

      if (response.data) {
        // Transform backend data to component format
        const transformed = response.data.map((inv: any) => {
          // Backend uses invested_at, not created_at
          const startDate = new Date(inv.invested_at);
          const now = new Date();

          // Validate date
          const isValidDate = !isNaN(startDate.getTime());

          // Lock period: 12 months for staking, 6 months for car_share
          const isCarShare = inv.tier_type === 'car_share';
          const lockPeriod = isCarShare ? 6 : 12;
          const totalMonths = isCarShare ? 6 : 12;

          // Calculate days passed for accurate earnings
          const daysPassed = isValidDate
            ? Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
            : 0;

          // Convert days to months (fractional) for display and calculations
          // Approximate: 30.44 days per month
          const monthsPassed = daysPassed / 30.44;

          // Monthly rate: 2.5% for staking, ~3.33% for car_share (20% / 6 months)
          const monthlyRate = isCarShare ? 3.33 : 2.5;

          const isLocked = monthsPassed < lockPeriod;
          const monthsUntilUnlock = isLocked ? Math.max(0, lockPeriod - monthsPassed) : 0;

          // Calculate earnings based on actual days passed
          const principal = parseFloat(inv.amount_usdt) || 0;
          const effectiveMonths = Math.min(monthsPassed, totalMonths);
          const earned = principal * (monthlyRate / 100) * effectiveMonths;
          const withdrawnEarnings = parseFloat(inv.total_withdrawn_earnings) || 0;

          // Map backend status to frontend status
          let frontendStatus: Investment['status'] = inv.status;
          if (inv.status === 'withdrawal_requested') {
            frontendStatus = 'withdrawal-request';
          } else if (inv.status === 'pending_confirmation') {
            frontendStatus = 'pending_confirmation';
          } else if (inv.status === 'pending') {
            frontendStatus = 'pending';
          }

          return {
            id: inv.id,
            amount: principal,
            status: frontendStatus,
            type: inv.tier_type === 'car_share' ? 'car' : 'staking',
            startDate: isValidDate ? startDate.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US') : '-',
            earned: Math.round(earned * 100) / 100,
            withdrawnEarnings: Math.round(withdrawnEarnings * 100) / 100,
            monthlyRate,
            totalMonths,
            monthsPassed: Math.min(monthsPassed, totalMonths),
            daysPassed,
            isLocked,
            monthsUntilUnlock
          };
        });
        setInvestments(transformed);
      }
    } catch (err) {
      setError(t('dashboard.loadError'));
      console.error('Load investments error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInvestments();
  }, [walletAddress]);

  // Calculate stats
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarned = investments.reduce((sum, inv) => sum + inv.earned, 0);
  const totalWithdrawnEarnings = investments.reduce((sum, inv) => sum + inv.withdrawnEarnings, 0);
  const totalBalance = totalInvested + totalEarned;
  const activeCount = investments.filter(inv => inv.status === 'active').length;

  // Generate earnings projection chart data
  const chartData = useMemo(() => {
    if (investments.length === 0) return [];

    const monthsStr = t(language === 'ru' ? 'dashboard.months_short_ru' : 'dashboard.months_short');
    const months = monthsStr.split('|');
    const now = new Date();
    const data = [];

    // Calculate cumulative earnings for the past 6 months and project 6 months ahead
    for (let i = -3; i <= 9; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthLabel = months[date.getMonth()];
      const isPast = i <= 0;

      let monthEarnings = 0;
      let monthBalance = 0;

      investments.forEach(inv => {
        if (inv.status !== 'active' && inv.status !== 'completed') return;

        const invStart = new Date(inv.startDate.split('.').reverse().join('-'));
        if (isNaN(invStart.getTime())) return;

        const monthsSinceStart = (date.getFullYear() - invStart.getFullYear()) * 12 + (date.getMonth() - invStart.getMonth());

        if (monthsSinceStart >= 0 && monthsSinceStart <= inv.totalMonths) {
          const earned = inv.amount * (inv.monthlyRate / 100) * Math.min(monthsSinceStart, inv.totalMonths);
          monthBalance += inv.amount + earned;
          monthEarnings += inv.amount * (inv.monthlyRate / 100);
        }
      });

      data.push({
        name: monthLabel,
        balance: Math.round(monthBalance),
        income: Math.round(monthEarnings),
        isPast
      });
    }

    return data;
  }, [investments, language, t]);

  const handleWithdrawClick = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowWithdrawalModal(true);
    setWithdrawalStep('select');
    setWithdrawalType('all');
    setWithdrawalWallet('');
    setWalletError(null);
    setWalletConfirmed(false);
  };

  const handleCloseModal = () => {
    setShowWithdrawalModal(false);
    setSelectedInvestment(null);
    setWithdrawalStep('select');
    setWithdrawalType('all');
    setWithdrawalWallet('');
    setWalletError(null);
    setWalletConfirmed(false);
  };

  // Validate BEP20 wallet address
  const validateWalletAddress = (address: string): boolean => {
    // BEP20 addresses start with 0x and are 42 characters
    const bep20Regex = /^0x[a-fA-F0-9]{40}$/;
    return bep20Regex.test(address);
  };

  const handleWalletSubmit = () => {
    const trimmedWallet = withdrawalWallet.trim();

    if (!trimmedWallet) {
      setWalletError(t('dashboard.enterWallet'));
      return;
    }

    if (!validateWalletAddress(trimmedWallet)) {
      setWalletError(t('dashboard.invalidWallet'));
      return;
    }

    setWalletError(null);
    setWithdrawalStep('confirm');
  };

  const handleConfirmWithdrawal = async () => {
    if (!selectedInvestment) return;

    setWithdrawalLoading(true);

    try {
      const response = await api.requestWithdrawal(
        selectedInvestment.id,
        withdrawalWallet.trim(),
        withdrawalType
      );

      if (response.data?.success) {
        setWithdrawalStep('success');
        // Update local state
        setInvestments(prev =>
          prev.map(inv =>
            inv.id === selectedInvestment.id
              ? { ...inv, status: 'withdrawal-request' as const }
              : inv
          )
        );
      } else {
        setWalletError(response.error || t('dashboard.loadError'));
        setWithdrawalStep('wallet');
      }
    } catch (err) {
      setWalletError(t('dashboard.networkError'));
      setWithdrawalStep('wallet');
    }

    setWithdrawalLoading(false);
  };

  // Calculate withdrawal amounts based on type
  const getWithdrawalAmounts = (investment: Investment, type: WithdrawalType) => {
    const details = calculateWithdrawalDetails(investment);
    let amount = 0;
    let label = '';

    switch (type) {
      case 'earnings':
        amount = details.earned;
        label = t('dashboard.earningsOnly');
        break;
      case 'principal':
        amount = details.principal;
        label = t('dashboard.principalOnly');
        break;
      case 'all':
        amount = details.netAmount;
        label = t('dashboard.withdrawAll');
        break;
    }

    // Apply fees: 3% base always + 5% early withdrawal if locked
    const baseFeePercent = 0.03; // 3% base fee always
    const earlyFeePercent = 0.05; // +5% if early withdrawal

    const baseFee = amount * baseFeePercent;
    const earlyFee = (details.isEarlyWithdrawal && type !== 'earnings') ? amount * earlyFeePercent : 0;
    const fee = baseFee + earlyFee;
    const netAmount = amount - fee;

    return { amount, fee, baseFee, earlyFee, netAmount, label, isEarlyWithdrawal: details.isEarlyWithdrawal };
  };

  const calculateWithdrawalDetails = (investment: Investment) => {
    const principal = investment.amount;
    const earned = investment.earned;
    const isEarlyWithdrawal = investment.isLocked;

    // 3% base fee always + 5% early fee if locked
    const baseFeePercent = 0.03;
    const earlyFeePercent = 0.05;
    const total = principal + earned;
    const baseFee = total * baseFeePercent;
    const earlyFee = isEarlyWithdrawal ? total * earlyFeePercent : 0;
    const fee = baseFee + earlyFee;
    const netAmount = total - fee;

    return { principal, earned, fee, baseFee, earlyFee, netAmount, isEarlyWithdrawal };
  };

  const getStatusBadge = (status: Investment['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 rounded-full text-sm" style={{
            backgroundColor: 'rgba(40, 180, 140, 0.15)',
            color: '#28B48C',
            border: '1px solid rgba(40, 180, 140, 0.3)'
          }}>
            {t('dashboard.statusActive')}
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-sm" style={{
            backgroundColor: 'rgba(0, 150, 150, 0.15)',
            color: '#009696',
            border: '1px solid rgba(0, 150, 150, 0.3)'
          }}>
            {t('dashboard.statusPending')}
          </span>
        );
      case 'pending_confirmation':
        return (
          <span className="px-3 py-1 rounded-full text-sm" style={{
            backgroundColor: 'rgba(255, 200, 80, 0.15)',
            color: '#FFC850',
            border: '1px solid rgba(255, 200, 80, 0.3)'
          }}>
            {t('dashboard.statusPendingConfirmation')}
          </span>
        );
      case 'withdrawal-request':
        return (
          <span className="px-3 py-1 rounded-full text-sm" style={{
            backgroundColor: 'rgba(255, 150, 50, 0.15)',
            color: '#FF9632',
            border: '1px solid rgba(255, 150, 50, 0.3)'
          }}>
            {t('dashboard.statusWithdrawalRequest')}
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-sm" style={{
            backgroundColor: 'rgba(255, 250, 240, 0.15)',
            color: '#FFFAF0',
            border: '1px solid rgba(255, 250, 240, 0.3)'
          }}>
            {t('dashboard.statusCompleted')}
          </span>
        );
    }
  };

  return (
    <div className="py-16 px-4 md:px-8">
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl mb-2" style={{ color: '#FFFAF0' }}>
            {t('dashboard.myDashboard')}
          </h1>
          <p className="text-lg opacity-70" style={{ color: '#FFFAF0' }}>
            {t('dashboard.manageInvestments')}
          </p>
        </motion.div>

        {loading ? (
          /* Loading State */
          <motion.div
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 size={48} className="animate-spin mb-4" style={{ color: '#009696' }} />
            <p style={{ color: '#FFFAF0' }}>{t('dashboard.loading')}</p>
          </motion.div>
        ) : error ? (
          /* Error State */
          <motion.div
            className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 100, 100, 0.1), rgba(255, 80, 80, 0.05))',
              border: '1px solid rgba(255, 100, 100, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{
                backgroundColor: 'rgba(255, 100, 100, 0.15)',
                border: '2px solid rgba(255, 100, 100, 0.3)'
              }}>
              <WifiOff size={40} style={{ color: '#FF6464' }} />
            </div>
            <h2 className="text-2xl mb-2" style={{ color: '#FFFAF0' }}>
              {t('dashboard.loadingError')}
            </h2>
            <p className="opacity-70 text-center mb-6" style={{ color: '#FFFAF0' }}>
              {error}
            </p>
            <button
              onClick={() => loadInvestments()}
              className="px-6 py-3 rounded-xl flex items-center gap-2 transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #009696, #28B48C)',
                color: '#FFFAF0'
              }}>
              <RefreshCw size={18} />
              {t('dashboard.retry')}
            </button>
          </motion.div>
        ) : !walletAddress ? (
          /* No Wallet Connected */
          <motion.div
            className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(0, 150, 150, 0.1), rgba(40, 180, 140, 0.05))',
              border: '1px solid rgba(255, 250, 240, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{
                backgroundColor: 'rgba(0, 150, 150, 0.15)',
                border: '2px solid rgba(0, 150, 150, 0.3)'
              }}>
              <Wallet size={40} style={{ color: '#009696' }} />
            </div>
            <h2 className="text-2xl mb-2" style={{ color: '#FFFAF0' }}>
              {t('dashboard.connectWallet')}
            </h2>
            <p className="opacity-70 text-center" style={{ color: '#FFFAF0' }}>
              {t('dashboard.connectToView')}
            </p>
          </motion.div>
        ) : investments.length === 0 ? (
          /* Empty State */
          <motion.div
            className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(0, 150, 150, 0.1), rgba(40, 180, 140, 0.05))',
              border: '1px solid rgba(255, 250, 240, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{
                backgroundColor: 'rgba(255, 200, 80, 0.15)',
                border: '2px solid rgba(255, 200, 80, 0.3)'
              }}>
              <DollarSign size={40} style={{ color: '#FFC850' }} />
            </div>
            <h2 className="text-2xl mb-2" style={{ color: '#FFFAF0' }}>
              {t('dashboard.noInvestments')}
            </h2>
            <p className="opacity-70 text-center" style={{ color: '#FFFAF0' }}>
              {t('dashboard.startInvestingHere')}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Stats Cards Row */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Total Invested */}
              <div className="p-6 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 150, 150, 0.15), rgba(0, 150, 150, 0.05))',
                  border: '1px solid rgba(0, 150, 150, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 150, 150, 0.2)' }}>
                    <Wallet size={24} style={{ color: '#009696' }} />
                  </div>
                  <div className="text-sm opacity-70" style={{ color: '#FFFAF0' }}>
                    {t('dashboard.invested')}
                  </div>
                </div>
                <div className="text-3xl" style={{ color: '#FFFAF0' }}>
                  ${totalInvested.toLocaleString()}
                </div>
              </div>

              {/* Total Earned */}
              <div className="p-6 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(40, 180, 140, 0.15), rgba(40, 180, 140, 0.05))',
                  border: '1px solid rgba(40, 180, 140, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(40, 180, 140, 0.2)' }}>
                    <TrendingUp size={24} style={{ color: '#28B48C' }} />
                  </div>
                  <div className="text-sm opacity-70" style={{ color: '#FFFAF0' }}>
                    {t('dashboard.earned')}
                  </div>
                </div>
                <div className="text-3xl" style={{ color: '#28B48C' }}>
                  +${totalEarned.toLocaleString()}
                </div>
                {totalWithdrawnEarnings > 0 && (
                  <div className="text-sm mt-1 opacity-70" style={{ color: '#009696' }}>
                    {t('dashboard.withdrawn')}: ${totalWithdrawnEarnings.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Total Balance */}
              <div className="p-6 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 200, 80, 0.15), rgba(255, 200, 80, 0.05))',
                  border: '1px solid rgba(255, 200, 80, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 200, 80, 0.2)' }}>
                    <DollarSign size={24} style={{ color: '#FFC850' }} />
                  </div>
                  <div className="text-sm opacity-70" style={{ color: '#FFFAF0' }}>
                    {t('dashboard.totalBalance')}
                  </div>
                </div>
                <div className="text-3xl" style={{ color: '#FFC850' }}>
                  ${totalBalance.toLocaleString()}
                </div>
              </div>

              {/* Active Investments */}
              <div className="p-6 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.15), rgba(255, 250, 240, 0.05))',
                  border: '1px solid rgba(255, 250, 240, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 250, 240, 0.1)' }}>
                    <Activity size={24} style={{ color: '#FFFAF0' }} />
                  </div>
                  <div className="text-sm opacity-70" style={{ color: '#FFFAF0' }}>
                    {t('dashboard.active')}
                  </div>
                </div>
                <div className="text-3xl" style={{ color: '#FFFAF0' }}>
                  {activeCount}
                </div>
              </div>
            </motion.div>

            {/* Earnings Projection Chart */}
            {chartData.length > 0 && (
              <motion.div
                className="mb-8 p-6 rounded-3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 150, 150, 0.1), rgba(40, 180, 140, 0.05))',
                  border: '1px solid rgba(255, 250, 240, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl mb-1" style={{ color: '#FFFAF0' }}>
                      {t('dashboard.earningsProjection')}
                    </h3>
                    <p className="text-sm opacity-60" style={{ color: '#FFFAF0' }}>
                      {t('dashboard.balanceByMonth')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#009696' }} />
                      <span style={{ color: '#FFFAF0', opacity: 0.7 }}>{t('dashboard.balance')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#28B48C' }} />
                      <span style={{ color: '#FFFAF0', opacity: 0.7 }}>{t('dashboard.monthlyIncome')}</span>
                    </div>
                  </div>
                </div>

                <div style={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#009696" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#009696" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#28B48C" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#28B48C" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#FFFAF0', opacity: 0.5, fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#FFFAF0', opacity: 0.5, fontSize: 12 }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(20, 60, 80, 0.95)',
                          border: '1px solid rgba(0, 150, 150, 0.3)',
                          borderRadius: '12px',
                          color: '#FFFAF0'
                        }}
                        formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'balance' ? t('dashboard.balance') : t('dashboard.monthlyIncome')]}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#009696"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                      />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#28B48C"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorEarnings)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Investment Cards List */}
            <div className="space-y-6">
              {investments.map((investment, index) => {
                const progressPercent = (investment.monthsPassed / investment.totalMonths) * 100;
                const withdrawalDetails = calculateWithdrawalDetails(investment);

                return (
                  <motion.div
                    key={investment.id}
                    className="p-6 md:p-8 rounded-3xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 150, 150, 0.1), rgba(40, 180, 140, 0.05))',
                      border: '1px solid rgba(255, 250, 240, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl md:text-4xl" style={{ color: '#FFFAF0' }}>
                          ${investment.amount.toLocaleString()}
                        </div>
                        {getStatusBadge(investment.status)}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-sm"
                          style={{
                            backgroundColor: investment.type === 'car' ? 'rgba(255, 200, 80, 0.2)' : 'rgba(0, 150, 150, 0.2)',
                            color: investment.type === 'car' ? '#FFC850' : '#009696',
                            border: `1px solid ${investment.type === 'car' ? 'rgba(255, 200, 80, 0.3)' : 'rgba(0, 150, 150, 0.3)'}`
                          }}>
                          {investment.type === 'car' ? t('dashboard.carShare') : t('dashboard.staking')}
                        </span>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} style={{ color: '#009696' }} />
                        <div>
                          <div className="text-xs opacity-60" style={{ color: '#FFFAF0' }}>{t('dashboard.date')}</div>
                          <div className="text-sm" style={{ color: '#FFFAF0' }}>{investment.startDate}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingUp size={18} style={{ color: '#28B48C' }} />
                        <div>
                          <div className="text-xs opacity-60" style={{ color: '#FFFAF0' }}>{t('dashboard.accumulated')}</div>
                          <div className="text-sm" style={{ color: '#28B48C' }}>+${investment.earned}</div>
                        </div>
                      </div>

                      {investment.withdrawnEarnings > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign size={18} style={{ color: '#009696' }} />
                          <div>
                            <div className="text-xs opacity-60" style={{ color: '#FFFAF0' }}>{t('dashboard.withdrawnPercent')}</div>
                            <div className="text-sm" style={{ color: '#009696' }}>${investment.withdrawnEarnings}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Percent size={18} style={{ color: '#FFC850' }} />
                        <div>
                          <div className="text-xs opacity-60" style={{ color: '#FFFAF0' }}>{t('dashboard.rate')}</div>
                          <div className="text-sm" style={{ color: '#FFFAF0' }}>{investment.monthlyRate}%{t('tiers.perMonth')}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {investment.isLocked ? (
                          <Lock size={18} style={{ color: '#FFC850' }} />
                        ) : (
                          <Unlock size={18} style={{ color: '#28B48C' }} />
                        )}
                        <div>
                          <div className="text-xs opacity-60" style={{ color: '#FFFAF0' }}>{t('dashboard.status')}</div>
                          <div className="text-sm" style={{ color: investment.isLocked ? '#FFC850' : '#28B48C' }}>
                            {investment.isLocked ? t('dashboard.locked') : t('dashboard.available')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm opacity-70" style={{ color: '#FFFAF0' }}>
                          {investment.daysPassed} {t('dashboard.days')} ({investment.monthsPassed.toFixed(1)} {t('dashboard.months')}) {t('dashboard.of')} {investment.totalMonths} {t('dashboard.months')}
                        </span>
                        <span className="text-sm" style={{ color: '#FFFAF0' }}>
                          {Math.round(progressPercent)}%
                        </span>
                      </div>
                      <div className="h-3 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'rgba(255, 250, 240, 0.1)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progressPercent}%`,
                            background: 'linear-gradient(90deg, #009696, #28B48C)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Lock Status & Withdrawal */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4"
                      style={{ borderTop: '1px solid rgba(255, 250, 240, 0.1)' }}>
                      <div className="flex items-center gap-3">
                        {investment.isLocked ? (
                          <>
                            <Lock size={20} style={{ color: '#FFC850' }} />
                            <span style={{ color: '#FFFAF0' }}>
                              {t('dashboard.untilUnlock')}: <span style={{ color: '#FFC850' }}>{Math.ceil(investment.monthsUntilUnlock * 30.44)} {t('dashboard.days')} ({investment.monthsUntilUnlock.toFixed(1)} {t('dashboard.months')})</span>
                            </span>
                          </>
                        ) : (
                          <>
                            <Unlock size={20} style={{ color: '#28B48C' }} />
                            <span style={{ color: '#28B48C' }}>{t('dashboard.availableForWithdraw')}</span>
                          </>
                        )}
                      </div>

                      {investment.status === 'active' && (
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs opacity-60" style={{ color: '#FFFAF0' }}>{t('dashboard.toWithdraw')}</div>
                            <div className="text-xl" style={{ color: '#FFFAF0' }}>
                              ${withdrawalDetails.netAmount.toLocaleString()}
                            </div>
                          </div>
                          <button
                            onClick={() => handleWithdrawClick(investment)}
                            className="px-6 py-3 rounded-xl flex items-center gap-2 transition-all hover:scale-105"
                            style={{
                              background: 'linear-gradient(135deg, #009696, #28B48C)',
                              color: '#FFFAF0'
                            }}>
                            {t('dashboard.withdraw')}
                            <ArrowRight size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
        </div>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && selectedInvestment && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(20, 60, 80, 0.9)', backdropFilter: 'blur(8px)' }}>
          <div
            className="rounded-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            style={{
              width: '100%',
              maxWidth: '32rem',
              background: 'linear-gradient(135deg, rgba(0, 150, 150, 0.15), rgba(40, 180, 140, 0.1))',
              border: '1px solid rgba(255, 250, 240, 0.2)',
              backdropFilter: 'blur(20px)'
            }}>

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl" style={{ color: '#FFFAF0' }}>
                {withdrawalStep === 'select' && t('dashboard.selectWithdrawalType')}
                {withdrawalStep === 'wallet' && t('dashboard.walletAddressStep')}
                {withdrawalStep === 'confirm' && t('dashboard.confirmation')}
                {withdrawalStep === 'success' && t('dashboard.requestSent')}
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: 'rgba(255, 250, 240, 0.1)' }}>
                <X size={20} style={{ color: '#FFFAF0' }} />
              </button>
            </div>

            {/* Step 1: Select withdrawal type */}
            {withdrawalStep === 'select' && (() => {
              const details = calculateWithdrawalDetails(selectedInvestment);
              return (
                <>
                  {/* Current balances info */}
                  <div className="mb-6 p-4 rounded-xl" style={{
                    backgroundColor: 'rgba(0, 150, 150, 0.1)',
                    border: '1px solid rgba(0, 150, 150, 0.2)'
                  }}>
                    <div className="flex justify-between mb-2">
                      <span className="opacity-70" style={{ color: '#FFFAF0' }}>{t('dashboard.principal')}</span>
                      <span style={{ color: '#FFFAF0' }}>${details.principal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70" style={{ color: '#FFFAF0' }}>{t('dashboard.accumulatedEarnings')}</span>
                      <span style={{ color: '#28B48C' }}>+${details.earned.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Withdrawal options */}
                  <div className="space-y-3 mb-6">
                    {/* Earnings only */}
                    <button
                      onClick={() => setWithdrawalType('earnings')}
                      className={`w-full p-4 rounded-xl text-left transition-all ${withdrawalType === 'earnings' ? 'scale-[1.02]' : ''}`}
                      style={{
                        backgroundColor: withdrawalType === 'earnings' ? 'rgba(40, 180, 140, 0.2)' : 'rgba(255, 250, 240, 0.05)',
                        border: withdrawalType === 'earnings' ? '2px solid #28B48C' : '1px solid rgba(255, 250, 240, 0.1)'
                      }}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium mb-1" style={{ color: '#FFFAF0' }}>{t('dashboard.earningsOnly')}</div>
                          <div className="text-xs opacity-70" style={{ color: '#FFFAF0' }}>{t('dashboard.principalStays')}</div>
                        </div>
                        <div className="text-xl" style={{ color: '#28B48C' }}>${details.earned.toLocaleString()}</div>
                      </div>
                    </button>

                    {/* Principal only */}
                    <button
                      onClick={() => setWithdrawalType('principal')}
                      className={`w-full p-4 rounded-xl text-left transition-all ${withdrawalType === 'principal' ? 'scale-[1.02]' : ''}`}
                      style={{
                        backgroundColor: withdrawalType === 'principal' ? 'rgba(0, 150, 150, 0.2)' : 'rgba(255, 250, 240, 0.05)',
                        border: withdrawalType === 'principal' ? '2px solid #009696' : '1px solid rgba(255, 250, 240, 0.1)'
                      }}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium mb-1" style={{ color: '#FFFAF0' }}>{t('dashboard.principalOnly')}</div>
                          <div className="text-xs opacity-70" style={{ color: '#FFFAF0' }}>{t('dashboard.earningsStay')}{details.isEarlyWithdrawal ? ` ${t('dashboard.feePercent')}` : ''}</div>
                        </div>
                        <div className="text-xl" style={{ color: '#009696' }}>
                          ${(details.isEarlyWithdrawal ? details.principal * 0.95 : details.principal).toLocaleString()}
                        </div>
                      </div>
                    </button>

                    {/* All */}
                    <button
                      onClick={() => setWithdrawalType('all')}
                      className={`w-full p-4 rounded-xl text-left transition-all ${withdrawalType === 'all' ? 'scale-[1.02]' : ''}`}
                      style={{
                        backgroundColor: withdrawalType === 'all' ? 'rgba(255, 200, 80, 0.2)' : 'rgba(255, 250, 240, 0.05)',
                        border: withdrawalType === 'all' ? '2px solid #FFC850' : '1px solid rgba(255, 250, 240, 0.1)'
                      }}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium mb-1" style={{ color: '#FFFAF0' }}>{t('dashboard.closeInvestment')}</div>
                          <div className="text-xs opacity-70" style={{ color: '#FFFAF0' }}>{t('dashboard.bodyPlusEarnings')}{details.isEarlyWithdrawal ? ` ${t('dashboard.feePercent')}` : ''}</div>
                        </div>
                        <div className="text-xl" style={{ color: '#FFC850' }}>${details.netAmount.toLocaleString()}</div>
                      </div>
                    </button>
                  </div>

                  {/* Early withdrawal warning */}
                  {details.isEarlyWithdrawal && withdrawalType !== 'earnings' && (
                    <div className="flex gap-3 p-4 rounded-xl mb-6" style={{
                      backgroundColor: 'rgba(255, 200, 80, 0.15)',
                      border: '1px solid rgba(255, 200, 80, 0.3)'
                    }}>
                      <AlertTriangle size={20} style={{ color: '#FFC850', flexShrink: 0 }} />
                      <div className="text-xs" style={{ color: '#FFFAF0' }}>
                        <span style={{ color: '#FFC850' }}>{t('dashboard.earlyWithdrawal')}</span> {t('dashboard.earlyWithdrawalNote')}
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={handleCloseModal}
                      className="flex-1 px-6 py-3 rounded-xl transition-all hover:scale-105"
                      style={{
                        backgroundColor: 'rgba(255, 250, 240, 0.1)',
                        border: '1px solid rgba(255, 250, 240, 0.2)',
                        color: '#FFFAF0'
                      }}>
                      {t('dashboard.cancel')}
                    </button>
                    <button
                      onClick={() => setWithdrawalStep('wallet')}
                      className="flex-1 px-6 py-3 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #009696, #28B48C)',
                        color: '#FFFAF0'
                      }}>
                      {t('dashboard.next')}
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </>
              );
            })()}

            {/* Step 2: Enter wallet address */}
            {withdrawalStep === 'wallet' && (
              <>
                <div className="mb-6">
                  <label className="block text-sm mb-2 opacity-70" style={{ color: '#FFFAF0' }}>
                    {t('dashboard.walletAddressLabel')}
                  </label>
                  <input
                    type="text"
                    value={withdrawalWallet}
                    onChange={(e) => {
                      setWithdrawalWallet(e.target.value);
                      setWalletError(null);
                    }}
                    placeholder="0x..."
                    className="w-full p-4 rounded-xl text-base outline-none transition-all"
                    style={{
                      backgroundColor: 'rgba(255, 250, 240, 0.1)',
                      border: walletError ? '2px solid #FF6464' : '1px solid rgba(255, 250, 240, 0.2)',
                      color: '#FFFAF0'
                    }}
                  />
                  {walletError && (
                    <div className="flex items-center gap-2 mt-2 text-sm" style={{ color: '#FF6464' }}>
                      <AlertCircle size={16} />
                      {walletError}
                    </div>
                  )}
                </div>

                {/* Network info */}
                <div className="p-4 rounded-xl mb-6" style={{
                  backgroundColor: 'rgba(255, 200, 80, 0.1)',
                  border: '1px solid rgba(255, 200, 80, 0.2)'
                }}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} style={{ color: '#FFC850', flexShrink: 0, marginTop: 2 }} />
                    <div className="text-sm" style={{ color: '#FFFAF0' }}>
                      <div className="font-medium mb-1" style={{ color: '#FFC850' }}>{t('dashboard.important')}</div>
                      <ul className="space-y-1 opacity-90">
                        <li>• {t('dashboard.bep20Warning')}</li>
                        <li>• {t('dashboard.wrongAddressWarning')}</li>
                        <li>• {t('dashboard.checkAddress')}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setWithdrawalStep('select')}
                    className="flex-1 px-6 py-3 rounded-xl transition-all hover:scale-105"
                    style={{
                      backgroundColor: 'rgba(255, 250, 240, 0.1)',
                      border: '1px solid rgba(255, 250, 240, 0.2)',
                      color: '#FFFAF0'
                    }}>
                    {t('dashboard.back')}
                  </button>
                  <button
                    onClick={handleWalletSubmit}
                    disabled={!withdrawalWallet.trim()}
                    className="flex-1 px-6 py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #009696, #28B48C)',
                      color: '#FFFAF0'
                    }}>
                    {t('dashboard.verify')}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Confirm */}
            {withdrawalStep === 'confirm' && (() => {
              const amounts = getWithdrawalAmounts(selectedInvestment, withdrawalType);
              return (
                <>
                  {/* Confirm wallet address */}
                  <div className="mb-6">
                    <div className="text-sm mb-2 opacity-70" style={{ color: '#FFFAF0' }}>
                      {t('dashboard.addressForReceiving')}
                    </div>
                    <div className="p-4 rounded-xl flex items-center gap-3" style={{
                      backgroundColor: 'rgba(0, 150, 150, 0.15)',
                      border: '1px solid rgba(0, 150, 150, 0.3)'
                    }}>
                      <code className="flex-1 text-sm break-all" style={{ color: '#009696' }}>
                        {withdrawalWallet}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(withdrawalWallet)}
                        className="p-2 rounded-lg transition-all hover:scale-110"
                        style={{ backgroundColor: 'rgba(0, 150, 150, 0.2)' }}>
                        <Copy size={16} style={{ color: '#009696' }} />
                      </button>
                    </div>
                  </div>

                  {/* Confirm checkbox */}
                  <label className="flex items-start gap-3 p-4 rounded-xl mb-6 cursor-pointer" style={{
                    backgroundColor: walletConfirmed ? 'rgba(40, 180, 140, 0.15)' : 'rgba(255, 250, 240, 0.05)',
                    border: walletConfirmed ? '2px solid #28B48C' : '1px solid rgba(255, 250, 240, 0.1)'
                  }}>
                    <input
                      type="checkbox"
                      checked={walletConfirmed}
                      onChange={(e) => setWalletConfirmed(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded"
                      style={{ accentColor: '#28B48C' }}
                    />
                    <div className="text-sm" style={{ color: '#FFFAF0' }}>
                      {t('dashboard.confirmAddress')}
                    </div>
                  </label>

                  {/* Summary */}
                  <div className="p-4 rounded-xl mb-6" style={{
                    backgroundColor: 'rgba(255, 200, 80, 0.1)',
                    border: '1px solid rgba(255, 200, 80, 0.2)'
                  }}>
                    <div className="text-sm font-medium mb-3" style={{ color: '#FFC850' }}>
                      {t('dashboard.totalToWithdraw')}
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="opacity-70" style={{ color: '#FFFAF0' }}>{amounts.label}</span>
                      <span style={{ color: '#FFFAF0' }}>${amounts.amount.toLocaleString()}</span>
                    </div>
                    {amounts.fee > 0 && (
                      <>
                        <div className="flex justify-between items-center mb-1">
                          <span className="opacity-70 text-sm" style={{ color: '#FFFAF0' }}>{t('dashboard.platformFee')}</span>
                          <span className="text-sm" style={{ color: '#FFC850' }}>-${amounts.baseFee?.toLocaleString() || '0'}</span>
                        </div>
                        {amounts.earlyFee > 0 && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="opacity-70 text-sm" style={{ color: '#FFFAF0' }}>{t('dashboard.earlyWithdrawalFee')}</span>
                            <span className="text-sm" style={{ color: '#E74C3C' }}>-${amounts.earlyFee?.toLocaleString() || '0'}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid rgba(255, 250, 240, 0.1)' }}>
                      <span className="font-medium" style={{ color: '#FFFAF0' }}>{t('dashboard.youWillReceive')}</span>
                      <span className="text-xl font-bold" style={{ color: '#FFC850' }}>${amounts.netAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Process info */}
                  <div className="p-4 rounded-xl mb-6" style={{
                    backgroundColor: 'rgba(0, 150, 150, 0.1)',
                    border: '1px solid rgba(0, 150, 150, 0.2)'
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} style={{ color: '#009696' }} />
                      <span className="text-sm font-medium" style={{ color: '#009696' }}>{t('dashboard.processingTime')}</span>
                    </div>
                    <ul className="text-xs space-y-1 opacity-90" style={{ color: '#FFFAF0' }}>
                      <li>• {t('dashboard.processingUp48h')}</li>
                      <li>• {t('dashboard.payoutsWeekdays')}</li>
                    </ul>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setWithdrawalStep('wallet');
                        setWalletConfirmed(false);
                      }}
                      disabled={withdrawalLoading}
                      className="flex-1 px-6 py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        backgroundColor: 'rgba(255, 250, 240, 0.1)',
                        border: '1px solid rgba(255, 250, 240, 0.2)',
                        color: '#FFFAF0'
                      }}>
                      {t('dashboard.changeAddress')}
                    </button>
                    <button
                      onClick={handleConfirmWithdrawal}
                      disabled={withdrawalLoading || !walletConfirmed}
                      className="flex-1 px-6 py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{
                        background: walletConfirmed ? 'linear-gradient(135deg, #009696, #28B48C)' : 'rgba(255, 250, 240, 0.1)',
                        color: '#FFFAF0'
                      }}>
                      {withdrawalLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          {t('dashboard.sending')}
                        </>
                      ) : (
                        t('dashboard.sendRequest')
                      )}
                    </button>
                  </div>
                </>
              );
            })()}

            {/* Step 4: Success */}
            {withdrawalStep === 'success' && (() => {
              const amounts = getWithdrawalAmounts(selectedInvestment, withdrawalType);
              return (
                <>
                  <div className="text-center py-6">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{
                      backgroundColor: 'rgba(40, 180, 140, 0.2)',
                      border: '2px solid #28B48C'
                    }}>
                      <CheckCircle size={40} style={{ color: '#28B48C' }} />
                    </div>
                    <h3 className="text-2xl mb-2" style={{ color: '#FFFAF0' }}>{t('dashboard.requestAccepted')}</h3>
                    <p className="opacity-70 mb-6" style={{ color: '#FFFAF0' }}>
                      {t('dashboard.withdrawalSent')} (${amounts.netAmount.toLocaleString()} USDT)
                    </p>

                    <div className="p-4 rounded-xl text-left mb-6" style={{
                      backgroundColor: 'rgba(0, 150, 150, 0.1)',
                      border: '1px solid rgba(0, 150, 150, 0.2)'
                    }}>
                      <div className="text-sm opacity-70 mb-1" style={{ color: '#FFFAF0' }}>{t('dashboard.receivingAddress')}</div>
                      <code className="text-sm break-all" style={{ color: '#009696' }}>{withdrawalWallet}</code>
                    </div>

                    <div className="text-sm opacity-70" style={{ color: '#FFFAF0' }}>
                      {t('dashboard.expectTransfer48h')}<br />
                      {t('dashboard.adminMayContact')}
                    </div>
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="w-full px-6 py-3 rounded-xl transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #009696, #28B48C)',
                      color: '#FFFAF0'
                    }}>
                    {t('dashboard.close')}
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
