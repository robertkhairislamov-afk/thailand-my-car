import { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Loader2, AlertCircle, Car, Percent, ExternalLink, Plus, Minus, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../services/api';

// Agreement Step Component with scroll-to-unlock
function AgreementStep({
  isDark,
  textColor,
  agreeTerms,
  onAgree,
  onContinue
}: {
  isDark: boolean;
  textColor: string;
  agreeTerms: boolean;
  onAgree: (checked: boolean) => void;
  onContinue: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtEnd = scrollTop + clientHeight >= scrollHeight - 10;
      if (isAtEnd) {
        setHasScrolledToEnd(true);
        setShowScrollHint(false);
      }
    }
  };

  // Check on mount if content fits without scroll
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      if (scrollHeight <= clientHeight) {
        setHasScrolledToEnd(true);
        setShowScrollHint(false);
      }
    }
  }, []);

  const accentColor = isDark ? '#FFC850' : '#143C50';
  const warningColor = '#F59E0B';

  return (
    <div className="space-y-3">
      {/* Agreement text - scrollable */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="p-3 rounded-xl text-[11px] overflow-y-auto"
          style={{
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
            color: textColor,
            lineHeight: 1.6,
            maxHeight: 'calc(85vh - 180px)',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <p className="font-bold mb-3 text-xs text-center" style={{ color: accentColor }}>
            СОГЛАШЕНИЕ О ПАРТНЁРСКОМ ЗАЙМЕ
          </p>

          <p className="mb-2 opacity-90">
            Договор частного займа между физическими лицами согласно Гражданскому и Торговому кодексу Таиланда.
          </p>

          <p className="mb-2 opacity-90">
            <strong>1. Характер сделки:</strong> Частный займ между знакомыми лицами для развития бизнеса по аренде автомобилей.{' '}
            <span style={{ color: warningColor, fontWeight: 600 }}>НЕ является публичным предложением ценных бумаг</span>.
          </p>

          <div className="mb-2 p-2 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' }}>
            <p className="opacity-90">
              <strong style={{ color: warningColor }}>2. РИСКИ:</strong>{' '}
              Доходность —{' '}
              <span style={{ color: warningColor, fontWeight: 600 }}>ПРОГНОЗ, НЕ ГАРАНТИРУЕТСЯ</span>.
              Компания владеет реальными активами и имеет страховое покрытие, что минимизирует риски.
            </p>
          </div>

          <p className="mb-2 opacity-90">
            <strong>3. Возврат:</strong> Досрочный возврат возможен с удержанием компенсации.
          </p>

          <p className="mb-2 opacity-90">
            <strong>4. Налоги:</strong> Ответственность каждой стороны по законам своей страны.
          </p>

          <p className="mb-2 opacity-90">
            <strong>5. Споры:</strong> Разрешаются по тайскому праву.
          </p>

          <p className="mb-2 opacity-90">
            <strong>6. Возраст:</strong> Участник подтверждает достижение{' '}
            <span style={{ color: warningColor, fontWeight: 600 }}>20 лет</span>.
          </p>

          <p className="mb-2 opacity-90">
            <strong>7. Данные:</strong> Согласие на обработку согласно PDPA Таиланда.
          </p>

          <div className="pt-2 mt-2 border-t text-center opacity-50 text-[10px]" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <p>Версия 1.0 • 28.11.2025 • Thailand My Car, Pattaya</p>
          </div>
        </div>

        {/* Scroll hint */}
        {showScrollHint && (
          <div className="absolute bottom-0 left-0 right-0 h-10 flex items-end justify-center pb-1 pointer-events-none rounded-b-xl"
            style={{ background: isDark ? 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)' : 'linear-gradient(to top, rgba(255,255,255,0.8) 0%, transparent 100%)' }}>
            <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} className="flex items-center gap-1 text-[10px] opacity-80" style={{ color: textColor }}>
              <ChevronDown className="w-3 h-3" />
              <span>Прокрутите вниз</span>
            </motion.div>
          </div>
        )}
      </div>

      {/* Footer - checkbox and button */}
      <div className="space-y-2">
        <label className={`flex items-center gap-2 ${hasScrolledToEnd ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}>
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => hasScrolledToEnd && onAgree(e.target.checked)}
            disabled={!hasScrolledToEnd}
            style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
          />
          <div className="w-5 h-5 rounded flex items-center justify-center transition-all flex-shrink-0"
            style={{ border: `2px solid ${agreeTerms ? '#28B48C' : isDark ? 'rgba(255,250,240,0.3)' : 'rgba(20,60,80,0.3)'}`, backgroundColor: agreeTerms ? '#28B48C' : 'transparent' }}>
            {agreeTerms && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className="text-[11px]" style={{ color: textColor }}>
            {hasScrolledToEnd ? 'Я прочитал и принимаю условия' : 'Прокрутите до конца'}
          </span>
        </label>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          disabled={!agreeTerms}
          className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
          style={{ background: agreeTerms ? 'linear-gradient(135deg, #28B48C 0%, #009696 100%)' : isDark ? 'rgba(255,250,240,0.1)' : 'rgba(20,60,80,0.1)', color: agreeTerms ? '#FFFAF0' : textColor }}>
          {agreeTerms ? 'Продолжить' : 'Прочитайте соглашение'}
        </motion.button>
      </div>
    </div>
  );
}

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

type Step = 'agreement' | 'amount' | 'transfer' | 'confirm' | 'success';

export function InvestModal({ isOpen, onClose, tier, walletAddress, isDark, onSuccess }: InvestModalProps) {
  const [step, setStep] = useState<Step>('agreement');
  const [amount, setAmount] = useState(0);
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Anti-fraud: track form start time
  const [formStartTime, setFormStartTime] = useState<number>(0);

  // Agreement checkboxes
  const [agreeRisks, setAgreeRisks] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeData, setAgreeData] = useState(false);

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen && tier) {
      const minUsd = parseFloat(tier.min_investment_usd);
      setStep('agreement');
      setAmount(minUsd);
      setTxHash('');
      setError('');
      // Reset agreement checkboxes
      setAgreeRisks(false);
      setAgreeAge(false);
      setAgreeTerms(false);
      setAgreeData(false);
      // Anti-fraud: record form start time
      setFormStartTime(Date.now());
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
        txHash: txHash,
        // Anti-fraud fields
        _formStartTime: formStartTime,
        website: '' // honeypot - must be empty
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
        amountUsdt: amountNum,
        // Anti-fraud fields
        _formStartTime: formStartTime,
        website: '' // honeypot - must be empty
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
            className="relative rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col"
            style={{ ...bgStyle, width: '360px', maxWidth: 'calc(100vw - 24px)', maxHeight: '85vh' }}
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

            {/* Content - scrollable */}
            <div className="p-4 flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Step 0: Legal Agreement */}
              {step === 'agreement' && (
                <AgreementStep
                  isDark={isDark}
                  textColor={textColor}
                  agreeTerms={agreeTerms}
                  onAgree={(checked) => {
                    setAgreeTerms(checked);
                    setAgreeRisks(checked);
                    setAgreeAge(checked);
                    setAgreeData(checked);
                  }}
                  onContinue={() => setStep('amount')}
                />
              )}

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
                      {isStaking ? 'Ожидаемый доход (прогноз)' : 'Ожидаемый возврат до +20%'}
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

                  <button
                    onClick={() => setStep('agreement')}
                    className="w-full py-2 text-xs opacity-70 hover:opacity-100"
                    style={{ color: textColor }}
                  >
                    ← Назад к соглашению
                  </button>
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
