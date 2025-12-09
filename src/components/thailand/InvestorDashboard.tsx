import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, Loader2, TrendingUp, DollarSign, Clock,
  Percent, Lock, Unlock, X, AlertCircle, CheckCircle,
  ArrowDownCircle, Calendar
} from 'lucide-react';
import { api } from '../../services/api';

interface Investment {
  id: string;
  amount_usdt: number;
  amount_baht: number;
  status: string;
  invested_at: string;
  tier_type: string;
  tier_name: string;
  staking_earned: number;
  total_earnings: number;
  pending_earnings: number;
  monthly_rate: number;
  months_passed: number;
  months_until_unlock: number;
  is_unlocked: boolean;
  unlock_date: string;
  withdrawal_amount: number;
  early_fee: number;
}

interface InvestorDashboardProps {
  walletAddress: string | null;
  isDark?: boolean;
}

export function InvestorDashboard({ walletAddress, isDark = true }: InvestorDashboardProps) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalModal, setWithdrawalModal] = useState<Investment | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress) {
      fetchInvestments();
    }
  }, [walletAddress]);

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const response = await api.getMyInvestments();
      if (response.data) {
        setInvestments(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch investments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!withdrawalModal) return;

    setWithdrawing(true);
    setError(null);
    try {
      const response = await api.requestWithdrawal(withdrawalModal.id);
      if (response.data?.success) {
        setSuccess('Запрос на вывод отправлен! Администратор свяжется с вами.');
        setWithdrawalModal(null);
        fetchInvestments();
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(response.error || 'Ошибка при отправке запроса');
      }
    } catch (err) {
      setError('Ошибка при отправке запроса');
    } finally {
      setWithdrawing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      pending_confirmation: 'На проверке',
      active: 'Активна',
      withdrawal_requested: 'Запрос на вывод',
      completed: 'Завершена',
      cancelled: 'Отменена'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#FFC850',
      pending_confirmation: '#FFC850',
      active: '#28B48C',
      withdrawal_requested: '#009696',
      completed: '#666',
      cancelled: '#ef4444'
    };
    return colors[status] || '#666';
  };

  // Calculate totals
  const activeInvestments = investments.filter(i => i.status === 'active');
  const totalInvested = activeInvestments.reduce((sum, i) => sum + Number(i.amount_usdt), 0);
  const totalEarnings = activeInvestments.reduce((sum, i) => sum + (Number(i.total_earnings) || 0), 0);
  const totalBalance = totalInvested + totalEarnings;

  if (!walletAddress) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center py-20 rounded-3xl backdrop-blur-xl border"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(26, 78, 100, 0.6) 0%, rgba(20, 60, 80, 0.4) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 250, 240, 0.7) 100%)',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
          }}
        >
          <Wallet className="w-16 h-16 mx-auto mb-4" style={{ color: isDark ? '#FFC850' : '#143C50' }} />
          <h2 className="text-3xl mb-4" style={{ color: isDark ? '#FFC850' : '#143C50', fontWeight: 700 }}>
            Подключите кошелек
          </h2>
          <p style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.8 }}>
            Для доступа к dashboard необходимо подключить Web3 кошелек
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#009696' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl mb-2" style={{ color: isDark ? '#FFC850' : '#143C50', fontWeight: 700 }}>
          Мои инвестиции
        </h1>
        <p style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.7 }}>
          Следите за вашими инвестициями и доходностью
        </p>
      </motion.div>

      {/* Notifications */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 rounded-xl flex items-center gap-3"
            style={{ backgroundColor: 'rgba(40, 180, 140, 0.2)', border: '1px solid #28B48C' }}
          >
            <CheckCircle className="w-5 h-5" style={{ color: '#28B48C' }} />
            <span style={{ color: '#28B48C' }}>{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 rounded-xl flex items-center gap-3"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444' }}
          >
            <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
            <span style={{ color: '#ef4444' }}>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="rounded-2xl p-5 border backdrop-blur-xl"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
            borderColor: isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'
          }}
        >
          <DollarSign className="w-8 h-8 mb-3" style={{ color: '#009696' }} />
          <p className="text-sm mb-1" style={{ color: isDark ? 'rgba(255,250,240,0.6)' : 'rgba(20,60,80,0.6)' }}>
            Инвестировано
          </p>
          <p className="text-2xl font-bold" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
            ${totalInvested.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl p-5 border backdrop-blur-xl"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
            borderColor: isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'
          }}
        >
          <Percent className="w-8 h-8 mb-3" style={{ color: '#28B48C' }} />
          <p className="text-sm mb-1" style={{ color: isDark ? 'rgba(255,250,240,0.6)' : 'rgba(20,60,80,0.6)' }}>
            Заработано
          </p>
          <p className="text-2xl font-bold" style={{ color: '#28B48C' }}>
            +${totalEarnings.toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl p-5 border backdrop-blur-xl"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
            borderColor: isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'
          }}
        >
          <TrendingUp className="w-8 h-8 mb-3" style={{ color: '#FFC850' }} />
          <p className="text-sm mb-1" style={{ color: isDark ? 'rgba(255,250,240,0.6)' : 'rgba(20,60,80,0.6)' }}>
            Общий баланс
          </p>
          <p className="text-2xl font-bold" style={{ color: '#FFC850' }}>
            ${totalBalance.toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl p-5 border backdrop-blur-xl"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
            borderColor: isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'
          }}
        >
          <Clock className="w-8 h-8 mb-3" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
          <p className="text-sm mb-1" style={{ color: isDark ? 'rgba(255,250,240,0.6)' : 'rgba(20,60,80,0.6)' }}>
            Активных
          </p>
          <p className="text-2xl font-bold" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
            {activeInvestments.length}
          </p>
        </div>
      </motion.div>

      {/* Investments List */}
      {investments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-2xl border backdrop-blur-xl"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
            borderColor: isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'
          }}
        >
          <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
          <p style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.7 }}>
            У вас пока нет инвестиций
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {investments.map((inv, index) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl p-6 border backdrop-blur-xl"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                borderColor: isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg font-bold" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                      ${Number(inv.amount_usdt).toLocaleString()}
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${getStatusColor(inv.status)}20`, color: getStatusColor(inv.status) }}
                    >
                      {getStatusLabel(inv.status)}
                    </span>
                    {inv.tier_type === 'staking' && (
                      <span className="px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: 'rgba(0,150,150,0.2)', color: '#009696' }}>
                        Стейкинг
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p style={{ color: isDark ? 'rgba(255,250,240,0.5)' : 'rgba(20,60,80,0.5)' }}>Дата</p>
                      <p style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{formatDate(inv.invested_at)}</p>
                    </div>
                    {inv.tier_type === 'staking' && inv.status === 'active' && (
                      <>
                        <div>
                          <p style={{ color: isDark ? 'rgba(255,250,240,0.5)' : 'rgba(20,60,80,0.5)' }}>Заработано</p>
                          <p style={{ color: '#28B48C', fontWeight: 600 }}>+${(inv.total_earnings || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p style={{ color: isDark ? 'rgba(255,250,240,0.5)' : 'rgba(20,60,80,0.5)' }}>Ставка</p>
                          <p style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{inv.monthly_rate || 2.5}%/мес</p>
                        </div>
                        <div>
                          <p style={{ color: isDark ? 'rgba(255,250,240,0.5)' : 'rgba(20,60,80,0.5)' }}>
                            {inv.is_unlocked ? 'Разблокировано' : 'До разблокировки'}
                          </p>
                          <p className="flex items-center gap-1" style={{ color: inv.is_unlocked ? '#28B48C' : '#FFC850' }}>
                            {inv.is_unlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            {inv.is_unlocked ? 'Доступно' : `${inv.months_until_unlock} мес`}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                {inv.status === 'active' && inv.tier_type === 'staking' && (
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right mb-2">
                      <p className="text-xs" style={{ color: isDark ? 'rgba(255,250,240,0.5)' : 'rgba(20,60,80,0.5)' }}>
                        К выводу
                      </p>
                      <p className="text-xl font-bold" style={{ color: '#28B48C' }}>
                        ${(inv.withdrawal_amount || 0).toFixed(2)}
                      </p>
                      {!inv.is_unlocked && inv.early_fee > 0 && (
                        <p className="text-xs" style={{ color: '#FFC850' }}>
                          (комиссия 5%: -${inv.early_fee.toFixed(2)})
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setWithdrawalModal(inv)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                        color: '#FFFAF0'
                      }}
                    >
                      <ArrowDownCircle className="w-4 h-4" />
                      Вывести
                    </button>
                  </div>
                )}

                {inv.status === 'withdrawal_requested' && (
                  <div className="text-right">
                    <p className="text-sm" style={{ color: '#009696' }}>
                      Ожидает обработки
                    </p>
                  </div>
                )}
              </div>

              {/* Progress bar for lock period */}
              {inv.status === 'active' && inv.tier_type === 'staking' && !inv.is_unlocked && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <div className="flex justify-between text-xs mb-2">
                    <span style={{ color: isDark ? 'rgba(255,250,240,0.5)' : 'rgba(20,60,80,0.5)' }}>
                      Прогресс: {inv.months_passed} из 12 месяцев
                    </span>
                    <span style={{ color: '#FFC850' }}>
                      {Math.round((inv.months_passed / 12) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (inv.months_passed / 12) * 100)}%`,
                        background: 'linear-gradient(90deg, #009696, #28B48C)'
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {withdrawalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            onClick={() => !withdrawing && setWithdrawalModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-6"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(26, 78, 100, 0.95) 0%, rgba(20, 60, 80, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 250, 240, 0.98) 100%)',
                border: `1px solid ${isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'}`
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold" style={{ color: isDark ? '#FFC850' : '#143C50' }}>
                  Запрос на вывод
                </h3>
                <button
                  onClick={() => !withdrawing && setWithdrawalModal(null)}
                  className="p-2 rounded-lg transition-colors hover:bg-white/10"
                >
                  <X className="w-5 h-5" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span style={{ color: isDark ? 'rgba(255,250,240,0.7)' : 'rgba(20,60,80,0.7)' }}>Вложено:</span>
                  <span style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>${Number(withdrawalModal.amount_usdt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: isDark ? 'rgba(255,250,240,0.7)' : 'rgba(20,60,80,0.7)' }}>Заработано:</span>
                  <span style={{ color: '#28B48C' }}>+${(withdrawalModal.total_earnings || 0).toFixed(2)}</span>
                </div>
                {!withdrawalModal.is_unlocked && withdrawalModal.early_fee > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: isDark ? 'rgba(255,250,240,0.7)' : 'rgba(20,60,80,0.7)' }}>Комиссия (5%):</span>
                    <span style={{ color: '#ef4444' }}>-${withdrawalModal.early_fee.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-3 border-t flex justify-between" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <span className="font-bold" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>К выводу:</span>
                  <span className="font-bold text-xl" style={{ color: '#28B48C' }}>${(withdrawalModal.withdrawal_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              {!withdrawalModal.is_unlocked && (
                <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 200, 80, 0.1)', border: '1px solid rgba(255, 200, 80, 0.3)' }}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#FFC850' }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: '#FFC850' }}>Досрочный вывод</p>
                      <p className="text-sm" style={{ color: isDark ? 'rgba(255,250,240,0.8)' : 'rgba(20,60,80,0.8)' }}>
                        До разблокировки осталось {withdrawalModal.months_until_unlock} мес. При досрочном выводе взимается комиссия 5%.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setWithdrawalModal(null)}
                  disabled={withdrawing}
                  className="flex-1 py-3 rounded-xl font-medium transition-all"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    color: isDark ? '#FFFAF0' : '#143C50'
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleWithdrawalRequest}
                  disabled={withdrawing}
                  className="flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                    color: '#FFFAF0',
                    opacity: withdrawing ? 0.7 : 1
                  }}
                >
                  {withdrawing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    'Подтвердить'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
