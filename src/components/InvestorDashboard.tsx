import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Wallet, Activity, Lock, Unlock, Calendar, Percent, ArrowRight, X, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';

interface Investment {
  id: string;
  amount: number;
  status: 'active' | 'withdrawal-request' | 'completed' | 'pending';
  type: 'staking' | 'car';
  startDate: string;
  earned: number;
  monthlyRate: number;
  totalMonths: number;
  monthsPassed: number;
  isLocked: boolean;
  monthsUntilUnlock: number;
}

interface InvestorDashboardProps {
  walletAddress?: string | null;
}

export function InvestorDashboard({ walletAddress }: InvestorDashboardProps) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);

  // Load investments from backend
  useEffect(() => {
    const loadInvestments = async () => {
      if (!walletAddress) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await api.getWalletInvestments(walletAddress);

      if (response.data) {
        // Transform backend data to component format
        const transformed = response.data.map((inv: any) => {
          const startDate = new Date(inv.created_at);
          const now = new Date();
          const monthsPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
          const totalMonths = inv.tier_id === 1 ? 12 : inv.tier_id === 2 ? 12 : 6;
          const monthlyRate = inv.tier_id === 1 ? 2.5 : inv.tier_id === 2 ? 2.5 : 0;
          const lockPeriod = inv.tier_id === 1 ? 6 : inv.tier_id === 2 ? 6 : 0;
          const isLocked = monthsPassed < lockPeriod;
          const monthsUntilUnlock = isLocked ? lockPeriod - monthsPassed : 0;
          const earned = parseFloat(inv.amount_usdt) * (monthlyRate / 100) * monthsPassed;

          return {
            id: inv.id,
            amount: parseFloat(inv.amount_usdt),
            status: inv.status === 'withdrawal_requested' ? 'withdrawal-request' : inv.status,
            type: inv.tier_id === 3 ? 'car' : 'staking',
            startDate: startDate.toLocaleDateString('ru-RU'),
            earned: Math.round(earned * 100) / 100,
            monthlyRate,
            totalMonths,
            monthsPassed: Math.min(monthsPassed, totalMonths),
            isLocked,
            monthsUntilUnlock
          };
        });
        setInvestments(transformed);
      }
      setLoading(false);
    };

    loadInvestments();
  }, [walletAddress]);

  // Calculate stats
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarned = investments.reduce((sum, inv) => sum + inv.earned, 0);
  const totalBalance = totalInvested + totalEarned;
  const activeCount = investments.filter(inv => inv.status === 'active').length;

  const handleWithdrawClick = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowWithdrawalModal(true);
  };

  const handleCloseModal = () => {
    setShowWithdrawalModal(false);
    setSelectedInvestment(null);
  };

  const handleConfirmWithdrawal = async () => {
    if (!selectedInvestment) return;

    setWithdrawalLoading(true);
    const response = await api.requestWithdrawal(selectedInvestment.id);

    if (response.data?.success) {
      // Update local state
      setInvestments(prev =>
        prev.map(inv =>
          inv.id === selectedInvestment.id
            ? { ...inv, status: 'withdrawal-request' as const }
            : inv
        )
      );
      handleCloseModal();
    } else {
      alert(response.error || 'Ошибка при запросе вывода');
    }
    setWithdrawalLoading(false);
  };

  const calculateWithdrawalDetails = (investment: Investment) => {
    const principal = investment.amount;
    const earned = investment.earned;
    const isEarlyWithdrawal = investment.isLocked;
    const fee = isEarlyWithdrawal ? (principal + earned) * 0.05 : 0;
    const netAmount = principal + earned - fee;

    return { principal, earned, fee, netAmount, isEarlyWithdrawal };
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
            Активна
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-sm" style={{
            backgroundColor: 'rgba(0, 150, 150, 0.15)',
            color: '#009696',
            border: '1px solid rgba(0, 150, 150, 0.3)'
          }}>
            Ожидает подтверждения
          </span>
        );
      case 'withdrawal-request':
        return (
          <span className="px-3 py-1 rounded-full text-sm" style={{
            backgroundColor: 'rgba(255, 200, 80, 0.15)',
            color: '#FFC850',
            border: '1px solid rgba(255, 200, 80, 0.3)'
          }}>
            Запрос на вывод
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-sm" style={{
            backgroundColor: 'rgba(255, 250, 240, 0.15)',
            color: '#FFFAF0',
            border: '1px solid rgba(255, 250, 240, 0.3)'
          }}>
            Завершена
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
            Мой Dashboard
          </h1>
          <p className="text-lg opacity-70" style={{ color: '#FFFAF0' }}>
            Управляйте своими инвестициями
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
            <p style={{ color: '#FFFAF0' }}>Загрузка инвестиций...</p>
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
              Подключите кошелек
            </h2>
            <p className="opacity-70 text-center" style={{ color: '#FFFAF0' }}>
              Для просмотра инвестиций подключите кошелек в меню
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
              У вас пока нет инвестиций
            </h2>
            <p className="opacity-70 text-center" style={{ color: '#FFFAF0' }}>
              Начните инвестировать и следите за доходностью прямо здесь
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
                    Инвестировано
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
                    Заработано
                  </div>
                </div>
                <div className="text-3xl" style={{ color: '#28B48C' }}>
                  +${totalEarned.toLocaleString()}
                </div>
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
                    Общий баланс
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
                    Активных
                  </div>
                </div>
                <div className="text-3xl" style={{ color: '#FFFAF0' }}>
                  {activeCount}
                </div>
              </div>
            </motion.div>

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
                            backgroundColor: 'rgba(0, 150, 150, 0.2)',
                            color: '#009696',
                            border: '1px solid rgba(0, 150, 150, 0.3)'
                          }}>
                          Стейкинг
                        </span>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} style={{ color: '#009696' }} />
                        <div>
                          <div className="text-xs opacity-60" style={{ color: '#FFFAF0' }}>Дата</div>
                          <div className="text-sm" style={{ color: '#FFFAF0' }}>{investment.startDate}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingUp size={18} style={{ color: '#28B48C' }} />
                        <div>
                          <div className="text-xs opacity-60" style={{ color: '#FFFAF0' }}>Заработано</div>
                          <div className="text-sm" style={{ color: '#28B48C' }}>+${investment.earned}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Percent size={18} style={{ color: '#FFC850' }} />
                        <div>
                          <div className="text-xs opacity-60" style={{ color: '#FFFAF0' }}>Ставка</div>
                          <div className="text-sm" style={{ color: '#FFFAF0' }}>{investment.monthlyRate}%/мес</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {investment.isLocked ? (
                          <Lock size={18} style={{ color: '#FFC850' }} />
                        ) : (
                          <Unlock size={18} style={{ color: '#28B48C' }} />
                        )}
                        <div>
                          <div className="text-xs opacity-60" style={{ color: '#FFFAF0' }}>Статус</div>
                          <div className="text-sm" style={{ color: investment.isLocked ? '#FFC850' : '#28B48C' }}>
                            {investment.isLocked ? 'Заблокировано' : 'Доступно'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm opacity-70" style={{ color: '#FFFAF0' }}>
                          {investment.monthsPassed} из {investment.totalMonths} месяцев
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
                              До разблокировки: <span style={{ color: '#FFC850' }}>{investment.monthsUntilUnlock} мес</span>
                            </span>
                          </>
                        ) : (
                          <>
                            <Unlock size={20} style={{ color: '#28B48C' }} />
                            <span style={{ color: '#28B48C' }}>Доступно для вывода</span>
                          </>
                        )}
                      </div>

                      {investment.status !== 'withdrawal-request' && (
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs opacity-60" style={{ color: '#FFFAF0' }}>К выводу</div>
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
                            Вывести
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
            className="rounded-3xl p-8"
            style={{
              width: '100%',
              maxWidth: '28rem',
              background: 'linear-gradient(135deg, rgba(0, 150, 150, 0.15), rgba(40, 180, 140, 0.1))',
              border: '1px solid rgba(255, 250, 240, 0.2)',
              backdropFilter: 'blur(20px)'
            }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl" style={{ color: '#FFFAF0' }}>
                Запрос на вывод
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: 'rgba(255, 250, 240, 0.1)' }}>
                <X size={20} style={{ color: '#FFFAF0' }} />
              </button>
            </div>

            {/* Breakdown */}
            {(() => {
              const details = calculateWithdrawalDetails(selectedInvestment);
              return (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="opacity-70" style={{ color: '#FFFAF0' }}>Вложено</span>
                      <span className="text-lg" style={{ color: '#FFFAF0' }}>
                        ${details.principal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="opacity-70" style={{ color: '#FFFAF0' }}>Заработано</span>
                      <span className="text-lg" style={{ color: '#28B48C' }}>
                        +${details.earned.toLocaleString()}
                      </span>
                    </div>

                    {details.fee > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="opacity-70" style={{ color: '#FFFAF0' }}>Комиссия (5%)</span>
                        <span className="text-lg" style={{ color: '#FFC850' }}>
                          -${details.fee.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div
                      className="flex justify-between items-center pt-4"
                      style={{ borderTop: '1px solid rgba(255, 250, 240, 0.2)' }}>
                      <span style={{ color: '#FFFAF0' }}>К выводу</span>
                      <span className="text-2xl" style={{ color: '#FFC850' }}>
                        ${details.netAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Warning Banner */}
                  {details.isEarlyWithdrawal && (
                    <div
                      className="flex gap-3 p-4 rounded-xl mb-6"
                      style={{
                        backgroundColor: 'rgba(255, 200, 80, 0.15)',
                        border: '1px solid rgba(255, 200, 80, 0.3)'
                      }}>
                      <AlertTriangle size={20} style={{ color: '#FFC850', flexShrink: 0 }} />
                      <div>
                        <div className="text-sm mb-1" style={{ color: '#FFC850' }}>
                          Досрочный вывод
                        </div>
                        <div className="text-xs opacity-80" style={{ color: '#FFFAF0' }}>
                          При выводе до окончания срока взимается комиссия 5% от общей суммы
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={handleCloseModal}
                      disabled={withdrawalLoading}
                      className="flex-1 px-6 py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        backgroundColor: 'rgba(255, 250, 240, 0.1)',
                        border: '1px solid rgba(255, 250, 240, 0.2)',
                        color: '#FFFAF0'
                      }}>
                      Отмена
                    </button>
                    <button
                      onClick={handleConfirmWithdrawal}
                      disabled={withdrawalLoading}
                      className="flex-1 px-6 py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #009696, #28B48C)',
                        color: '#FFFAF0'
                      }}>
                      {withdrawalLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Обработка...
                        </>
                      ) : (
                        'Подтвердить'
                      )}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
