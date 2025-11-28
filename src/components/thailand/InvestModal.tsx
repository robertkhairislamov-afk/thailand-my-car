import { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Loader2, AlertCircle, Car, Percent, ExternalLink, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../services/api';

// Animated digit component for rolling numbers
function AnimatedDigit({ digit, isDark }: { digit: string; isDark: boolean }) {
  const textColor = isDark ? '#FFFAF0' : '#143C50';

  return (
    <div className="relative h-10 w-6 overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8
          }}
          className="absolute inset-0 flex items-center justify-center text-2xl font-bold"
          style={{ color: textColor }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// Format number with animated digits
function AnimatedAmount({ amount, isDark }: { amount: number; isDark: boolean }) {
  const formatted = amount.toLocaleString();
  const digits = formatted.split('');

  return (
    <div className="flex items-center justify-center">
      <span className="text-2xl font-bold mr-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>$</span>
      {digits.map((char, index) => (
        char === ',' ? (
          <span key={`sep-${index}`} className="text-2xl font-bold" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>,</span>
        ) : (
          <AnimatedDigit key={`${index}-${char}`} digit={char} isDark={isDark} />
        )
      ))}
    </div>
  );
}

interface TierData {
  id: number;
  name: string;
  description: string;
  min_investment_baht: string;
  min_investment_usd: string;
  duration_months: number;
  return_percentage: string | null;
  features: string[];
}

interface PlatformSettings {
  platform_wallet: string;
  staking_monthly_rate: string;
  staking_annual_rate: string;
  large_investor_return: string;
  early_withdrawal_fee: string;
  min_staking_investment_usd: string;
  min_car_investment_usd: string;
}

interface InvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: TierData | null;
  walletAddress: string;
  isDark: boolean;
  onSuccess: () => void;
}

type Step = 'amount' | 'transfer' | 'confirm' | 'success';

export function InvestModal({ isOpen, onClose, tier, walletAddress, isDark, onSuccess }: InvestModalProps) {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState(0);
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize amount with minimum when modal opens
  useEffect(() => {
    if (isOpen && tier) {
      const minUsd = parseFloat(tier.min_investment_usd);
      setStep('amount');
      setAmount(minUsd);
      setTxHash('');
      setError('');
      loadSettings();
    }
  }, [isOpen, tier]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadSettings = async () => {
    const response = await api.getPlatformSettings();
    if (response.data) {
      setSettings(response.data);
    }
  };

  if (!tier || !isOpen) return null;

  const minUsd = parseFloat(tier.min_investment_usd);
  const maxUsd = parseFloat(settings?.min_car_investment_usd || '12400');
  const isStaking = tier.name.toLowerCase().includes('стейкинг');
  const isCarShare = tier.name.toLowerCase().includes('авто');

  const amountNum = amount;
  const exchangeRate = 32.65;
  const amountBaht = amountNum * exchangeRate;

  // Step increment based on tier
  const increment = isStaking ? 100 : 500;

  // Handlers for +/- buttons with hold functionality
  const adjustAmount = (delta: number) => {
    setAmount(prev => {
      const newVal = prev + delta;
      if (newVal < minUsd) return minUsd;
      if (isStaking && newVal >= maxUsd) return maxUsd - increment;
      return newVal;
    });
    setError('');
  };

  const startHold = (delta: number) => {
    adjustAmount(delta);
    intervalRef.current = setInterval(() => {
      adjustAmount(delta);
    }, 100);
  };

  const stopHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const getExpectedReturn = () => {
    if (isStaking) {
      const monthlyRate = parseFloat(settings?.staking_monthly_rate || '2.5') / 100;
      return amountNum * monthlyRate * 6;
    } else {
      const returnRate = parseFloat(settings?.large_investor_return || '20') / 100;
      return amountNum * returnRate;
    }
  };

  const expectedReturn = getExpectedReturn();

  const handleCopyWallet = async () => {
    if (settings?.platform_wallet) {
      await navigator.clipboard.writeText(settings.platform_wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAmountSubmit = () => {
    if (amountNum < minUsd) {
      setError(`Минимум: $${minUsd.toLocaleString()}`);
      return;
    }
    if (isStaking && amountNum >= maxUsd) {
      setError(`Для $${maxUsd.toLocaleString()}+ выберите "Доля в автомобиле"`);
      return;
    }
    setError('');
    setStep('transfer');
  };

  const handleConfirmSubmit = async () => {
    if (!txHash.trim()) {
      setError('Введите TX Hash');
      return;
    }
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      setError('Неверный формат TX Hash');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await api.createInvestment({
        tierId: tier.id,
        walletAddress: walletAddress,
        amountUsdt: amountNum,
        txHash: txHash
      });

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }
      setStep('success');
      onSuccess();
    } catch (err) {
      setError('Ошибка создания инвестиции');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipTxHash = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.createInvestment({
        tierId: tier.id,
        walletAddress: walletAddress,
        amountUsdt: amountNum
      });

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }
      setStep('success');
      onSuccess();
    } catch (err) {
      setError('Ошибка создания инвестиции');
    } finally {
      setLoading(false);
    }
  };

  const bgStyle = {
    background: isDark
      ? 'linear-gradient(135deg, rgba(26, 78, 100, 0.98) 0%, rgba(20, 60, 80, 0.98) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 250, 240, 0.98) 100%)'
  };

  const textColor = isDark ? '#FFFAF0' : '#143C50';
  const accentColor = isDark ? '#FFC850' : '#143C50';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl"
            style={{ ...bgStyle, width: '340px', maxWidth: 'calc(100vw - 32px)' }}
          >
            {/* Header */}
            <div className="sticky top-0 p-4 border-b flex items-center justify-between z-10"
              style={{ ...bgStyle, borderColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)' }}
            >
              <div className="flex items-center gap-2">
                {isStaking ? (
                  <Percent className="w-5 h-5" style={{ color: '#28B48C' }} />
                ) : (
                  <Car className="w-5 h-5" style={{ color: '#FFC850' }} />
                )}
                <h2 className="text-lg font-bold" style={{ color: accentColor }}>
                  {tier.name}
                </h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors">
                <X className="w-5 h-5" style={{ color: textColor }} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Step 1: Amount */}
              {step === 'amount' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <label className="block text-xs mb-2 opacity-70" style={{ color: textColor }}>
                      Сумма инвестиции
                    </label>

                    {/* Main amount display with +/- controls */}
                    <div className="flex items-center justify-center gap-3 mb-2">
                      {/* Minus button */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onMouseDown={() => startHold(-increment)}
                        onMouseUp={stopHold}
                        onMouseLeave={stopHold}
                        onTouchStart={() => startHold(-increment)}
                        onTouchEnd={stopHold}
                        disabled={amountNum <= minUsd}
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                        style={{
                          background: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)',
                          border: `2px solid ${isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'}`
                        }}
                      >
                        <Minus className="w-5 h-5" style={{ color: '#009696' }} />
                      </motion.button>

                      {/* Animated amount display */}
                      <div className="px-4 py-2 rounded-xl min-w-[140px]" style={{
                        background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                        border: `2px solid ${error ? '#ef4444' : isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'}`
                      }}>
                        <AnimatedAmount amount={amountNum} isDark={isDark} />
                      </div>

                      {/* Plus button */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onMouseDown={() => startHold(increment)}
                        onMouseUp={stopHold}
                        onMouseLeave={stopHold}
                        onTouchStart={() => startHold(increment)}
                        onTouchEnd={stopHold}
                        disabled={isStaking && amountNum >= maxUsd - increment}
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                        style={{
                          background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)'
                        }}
                      >
                        <Plus className="w-5 h-5" style={{ color: '#FFFAF0' }} />
                      </motion.button>
                    </div>

                    {/* Quick amount buttons */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {(isStaking ? [100, 500, 1000, 2000] : [500, 1000, 2000, 5000]).map((val) => (
                        <motion.button
                          key={val}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const newAmount = amountNum + val;
                            if (isStaking && newAmount >= maxUsd) return;
                            setAmount(newAmount);
                            setError('');
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-all"
                          style={{
                            backgroundColor: isDark ? 'rgba(255, 200, 80, 0.15)' : 'rgba(255, 200, 80, 0.1)',
                            color: '#FFC850',
                            border: `1px solid ${isDark ? 'rgba(255, 200, 80, 0.3)' : 'rgba(255, 200, 80, 0.2)'}`
                          }}
                        >
                          +${val}
                        </motion.button>
                      ))}
                    </div>

                    {/* Baht equivalent */}
                    <div className="text-xs opacity-70" style={{ color: textColor }}>
                      ≈ ฿{amountBaht.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>

                  {/* Expected Return */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl text-center"
                    style={{
                      backgroundColor: isDark ? 'rgba(40, 180, 140, 0.1)' : 'rgba(40, 180, 140, 0.05)',
                      border: `1px solid ${isDark ? 'rgba(40, 180, 140, 0.2)' : 'rgba(40, 180, 140, 0.1)'}`
                    }}
                  >
                    <div className="text-xs opacity-70 mb-1" style={{ color: textColor }}>
                      {isStaking ? 'Доход за 6 мес' : 'Возврат +20%'}
                    </div>
                    <motion.div
                      key={expectedReturn}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-xl font-bold"
                      style={{ color: '#28B48C' }}
                    >
                      +${expectedReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </motion.div>
                    {isCarShare && (
                      <div className="text-xs mt-1 opacity-70" style={{ color: textColor }}>
                        или авто в собственность
                      </div>
                    )}
                  </motion.div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-1 text-red-500 text-xs"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAmountSubmit}
                    className="w-full py-3 rounded-xl font-semibold transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                      color: '#FFFAF0'
                    }}
                  >
                    Далее
                  </motion.button>
                </div>
              )}

              {/* Step 2: Transfer Instructions */}
              {step === 'transfer' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1" style={{ color: accentColor }}>
                      ${amountNum.toLocaleString()}
                    </div>
                    <div className="text-xs opacity-70" style={{ color: textColor }}>
                      Переведите на кошелёк
                    </div>
                  </div>

                  {/* Network */}
                  <div className="py-2 px-3 rounded-lg text-center text-xs font-semibold" style={{
                    backgroundColor: isDark ? 'rgba(255, 200, 80, 0.1)' : 'rgba(255, 200, 80, 0.05)',
                    color: '#FFC850'
                  }}>
                    BSC (BEP-20) • USDT/USDC
                  </div>

                  {/* Wallet */}
                  <div className="p-3 rounded-xl" style={{
                    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                  }}>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm p-2 rounded-lg font-mono" style={{
                        backgroundColor: isDark ? 'rgba(0, 150, 150, 0.1)' : 'rgba(0, 150, 150, 0.05)',
                        color: '#009696'
                      }}>
                        {settings?.platform_wallet
                          ? `${settings.platform_wallet.slice(0, 8)}...${settings.platform_wallet.slice(-6)}`
                          : ''}
                      </code>
                      <button
                        onClick={handleCopyWallet}
                        className="p-2 rounded-lg transition-colors hover:bg-black/10 flex-shrink-0"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5" style={{ color: '#009696' }} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="text-[10px] space-y-1 opacity-70" style={{ color: textColor }}>
                    <div className="flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#FFC850' }} />
                      <span>Только USDT/USDC по сети BSC</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#FFC850' }} />
                      <span>Сохраните TX Hash после перевода</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('confirm')}
                    className="w-full py-3 rounded-xl font-semibold transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                      color: '#FFFAF0'
                    }}
                  >
                    Я перевёл
                  </button>

                  <button
                    onClick={() => setStep('amount')}
                    className="w-full py-2 text-xs opacity-70 hover:opacity-100"
                    style={{ color: textColor }}
                  >
                    ← Назад
                  </button>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 'confirm' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm mb-1" style={{ color: textColor }}>Подтвердите</div>
                    <div className="text-2xl font-bold" style={{ color: accentColor }}>
                      ${amountNum.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1 opacity-70" style={{ color: textColor }}>
                      TX Hash
                    </label>
                    <input
                      type="text"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-3 py-3 rounded-xl text-xs border-2 font-mono"
                      style={{
                        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                        borderColor: error ? '#ef4444' : isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
                        color: textColor
                      }}
                    />
                    <div className="text-[10px] mt-1 opacity-50" style={{ color: textColor }}>
                      Найти на{' '}
                      <a href="https://bscscan.com" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 hover:underline" style={{ color: '#009696' }}>
                        BSCScan <ExternalLink className="w-2 h-2" />
                      </a>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center justify-center gap-1 text-red-500 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleConfirmSubmit}
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                      color: '#FFFAF0'
                    }}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? 'Подтверждение...' : 'Подтвердить'}
                  </button>

                  <button
                    onClick={handleSkipTxHash}
                    disabled={loading}
                    className="w-full py-2 text-xs rounded-xl border opacity-70 hover:opacity-100"
                    style={{
                      borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
                      color: textColor
                    }}
                  >
                    Добавить TX Hash позже
                  </button>

                  <button
                    onClick={() => setStep('transfer')}
                    className="w-full py-2 text-xs opacity-70 hover:opacity-100"
                    style={{ color: textColor }}
                  >
                    ← Назад
                  </button>
                </div>
              )}

              {/* Step 4: Success */}
              {step === 'success' && (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(40, 180, 140, 0.2)' }}
                  >
                    <Check className="w-7 h-7" style={{ color: '#28B48C' }} />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-1" style={{ color: accentColor }}>
                      Заявка создана!
                    </h3>
                    <p className="text-xs opacity-70" style={{ color: textColor }}>
                      Инвестиция на рассмотрении
                    </p>
                  </div>

                  <div className="p-3 rounded-xl text-left text-sm" style={{
                    backgroundColor: isDark ? 'rgba(0, 150, 150, 0.1)' : 'rgba(0, 150, 150, 0.05)'
                  }}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs opacity-70" style={{ color: textColor }}>Сумма:</span>
                      <span className="text-xs font-semibold" style={{ color: textColor }}>
                        ${amountNum.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs opacity-70" style={{ color: textColor }}>Статус:</span>
                      <span className="text-xs font-semibold" style={{ color: '#FFC850' }}>
                        {txHash ? 'Ожидает проверки' : 'Ожидает перевода'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] opacity-70" style={{ color: textColor }}>
                    Проверим транзакцию в течение 24 часов
                  </p>

                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                      color: '#FFFAF0'
                    }}
                  >
                    Готово
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
