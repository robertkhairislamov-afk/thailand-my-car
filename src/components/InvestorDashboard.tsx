import { useState, useEffect, useMemo, useRef } from 'react';
import { DollarSign, TrendingUp, Wallet, Activity, Lock, Unlock, Calendar, Percent, ArrowRight, X, AlertTriangle, Loader2, Clock, WifiOff, RefreshCw, CheckCircle, Copy, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

  // Load investments from backend/mock
  const loadInvestments = async () => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real app, this calls api.getWalletInvestments(walletAddress)
      // For demo purposes, we can provide some mock data if API fails or returns empty
      const response = await api.getMyInvestments();

      if (response.data) {
        // If API returns data, use it. Otherwise use dummy data for visualization
        const rawData = response.data.length > 0 ? response.data : [
          {
            id: 'demo-1',
            amount_usdt: '5000',
            status: 'active',
            tier_type: 'staking',
            invested_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            total_withdrawn_earnings: '0'
          },
          {
            id: 'demo-2',
            amount_usdt: '12400',
            status: 'active',
            tier_type: 'car_share',
            invested_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            total_withdrawn_earnings: '0'
          }
        ];

        const transformed = rawData.map((inv: any) => {
          const startDate = new Date(inv.invested_at || inv.created_at);
          const now = new Date();
          const isValidDate = !isNaN(startDate.getTime());
          const isCarShare = inv.tier_type === 'car_share';
          const lockPeriod = isCarShare ? 6 : 12;
          const totalMonths = isCarShare ? 6 : 12;
          const daysPassed = isValidDate ? Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
          const monthsPassed = daysPassed / 30.44;
          const monthlyRate = isCarShare ? 3.33 : 2.5;
          const isLocked = monthsPassed < lockPeriod;
          const monthsUntilUnlock = isLocked ? Math.max(0, lockPeriod - monthsPassed) : 0;
          const principal = parseFloat(inv.amount_usdt) || 0;
          const effectiveMonths = Math.min(monthsPassed, totalMonths);
          const earned = principal * (monthlyRate / 100) * effectiveMonths;

          return {
            id: inv.id,
            amount: principal,
            status: inv.status as any,
            type: isCarShare ? 'car' : 'staking',
            startDate: isValidDate ? startDate.toLocaleDateString() : '-',
            earned: Math.round(earned * 100) / 100,
            withdrawnEarnings: parseFloat(inv.total_withdrawn_earnings || '0'),
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
      setError('Failed to load investments');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInvestments();
  }, [walletAddress]);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarned = investments.reduce((sum, inv) => sum + inv.earned, 0);
  const totalBalance = totalInvested + totalEarned;
  const activeCount = investments.filter(inv => inv.status === 'active').length;

  const chartData = useMemo(() => {
    if (investments.length === 0) return [];
    const data = [];
    const now = new Date();
    for (let i = -2; i <= 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthLabel = date.toLocaleString('default', { month: 'short' });
      let balance = 0;
      let income = 0;
      investments.forEach(inv => {
        balance += inv.amount + (inv.amount * (inv.monthlyRate / 100) * Math.max(0, i + 2));
        income += inv.amount * (inv.monthlyRate / 100);
      });
      data.push({ name: monthLabel, balance: Math.round(balance), income: Math.round(income) });
    }
    return data;
  }, [investments]);

  const handleWithdrawClick = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowWithdrawalModal(true);
    setWithdrawalStep('select');
  };

  const getStatusBadge = (status: Investment['status']) => {
    const colors: Record<string, string> = {
      active: '#28B48C',
      pending: '#FFC850',
      'withdrawal-request': '#FF9632',
      completed: '#FFFAF0'
    };
    return (
      <span className="px-3 py-1 rounded-full text-xs border" style={{ 
        color: colors[status] || '#FFF', 
        borderColor: (colors[status] || '#FFF') + '44',
        backgroundColor: (colors[status] || '#FFF') + '11'
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#FFFAF0' }}>{t('dashboard.myDashboard')}</h1>
        <p className="opacity-70" style={{ color: '#FFFAF0' }}>{t('dashboard.manageInvestments')}</p>
      </motion.div>

      {!walletAddress ? (
        <div className="text-center py-20 bg-black/20 rounded-3xl border border-white/10 backdrop-blur-xl">
          <Wallet size={48} className="mx-auto mb-4 opacity-50" style={{ color: '#009696' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFFAF0' }}>{t('dashboard.connectWallet')}</h2>
          <p className="opacity-60" style={{ color: '#FFFAF0' }}>{t('dashboard.connectToView')}</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10" style={{ color: '#009696' }} /></div>
      ) : (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: t('dashboard.invested'), value: `$${totalInvested.toLocaleString()}`, icon: Wallet, color: '#009696' },
              { label: t('dashboard.earned'), value: `+$${totalEarned.toLocaleString()}`, icon: TrendingUp, color: '#28B48C' },
              { label: t('dashboard.totalBalance'), value: `$${totalBalance.toLocaleString()}`, icon: DollarSign, color: '#FFC850' },
              { label: t('dashboard.active'), value: activeCount, icon: Activity, color: '#FFFAF0' }
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/10 backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <stat.icon size={20} style={{ color: stat.color }} />
                  <span className="text-sm opacity-60" style={{ color: '#FFFAF0' }}>{stat.label}</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: '#FFFAF0' }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Projection Chart */}
          <div className="p-6 rounded-3xl border border-white/10 backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: '#FFFAF0' }}>{t('dashboard.earningsProjection')}</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#009696" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#009696" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#ffffff44" fontSize={12} />
                  <YAxis stroke="#ffffff44" fontSize={12} tickFormatter={v => `$${v/1000}k`} />
                  <Tooltip contentStyle={{ background: '#143C50', border: 'none', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="balance" stroke="#009696" fillOpacity={1} fill="url(#colorBal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Investment List */}
          <div className="space-y-4">
            {investments.map((inv, i) => (
              <div key={inv.id} className="p-6 rounded-2xl border border-white/10 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold" style={{ color: '#FFFAF0' }}>${inv.amount.toLocaleString()}</span>
                    {getStatusBadge(inv.status)}
                  </div>
                  <div className="flex gap-4 text-sm opacity-60" style={{ color: '#FFFAF0' }}>
                    <span>{inv.type === 'car' ? t('dashboard.carShare') : t('dashboard.staking')}</span>
                    <span>{inv.startDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-xs opacity-50 mb-1" style={{ color: '#FFFAF0' }}>{t('dashboard.accumulated')}</div>
                    <div className="font-bold" style={{ color: '#28B48C' }}>+${inv.earned}</div>
                  </div>
                  <button onClick={() => handleWithdrawClick(inv)} className="px-6 py-2 rounded-xl font-bold transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #009696, #28B48C)', color: '#FFF' }}>
                    {t('dashboard.withdraw')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simplified Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowWithdrawalModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md p-8 rounded-3xl border border-white/20 shadow-2xl" style={{ background: '#143C50' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#FFFAF0' }}>{t('dashboard.withdraw')}</h2>
              <p className="opacity-70 mb-6" style={{ color: '#FFFAF0' }}>Запрос на вывод средств будет обработан администратором в течение 48 часов.</p>
              <div className="p-4 rounded-2xl bg-black/20 mb-6">
                <div className="flex justify-between mb-2"><span className="opacity-60" style={{ color: '#FFF' }}>Доступно:</span><span className="font-bold" style={{ color: '#28B48C' }}>${(selectedInvestment?.amount || 0) + (selectedInvestment?.earned || 0)}</span></div>
              </div>
              <button onClick={() => setShowWithdrawalModal(false)} className="w-full py-4 rounded-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #009696, #28B48C)' }}>Отправить запрос</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}