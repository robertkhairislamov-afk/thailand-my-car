import { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Loader2, AlertCircle, Car, Percent, ExternalLink, Plus, Minus, ChevronDown, Wallet, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../services/api';
import { bscService, type BalanceInfo, IS_BSC_TESTNET } from '../../services/bsc';
import { useLanguage } from '../../contexts/LanguageContext';

// Agreement Step Component with scroll-to-unlock
function AgreementStep({
  isDark,
  textColor,
  agreeTerms,
  onAgree,
  onContinue,
  t
}: {
  isDark: boolean;
  textColor: string;
  agreeTerms: boolean;
  onAgree: (checked: boolean) => void;
  onContinue: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
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
            {t('modal.agreementTitle')}
          </p>

          <p className="mb-2 opacity-90">
            {t('modal.agreementIntro')}
          </p>

          <p className="mb-2 opacity-90">
            <strong>{t('modal.agreementNature')}</strong> {t('modal.agreementNatureText')}{' '}
            <span style={{ color: warningColor, fontWeight: 600 }}>{t('modal.agreementNotPublic')}</span>.
          </p>

          <div className="mb-2 p-2 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' }}>
            <p className="opacity-90">
              <strong style={{ color: warningColor }}>{t('modal.agreementRisks')}</strong>{' '}
              {t('modal.agreementRisksText')}{' '}
              <span style={{ color: warningColor, fontWeight: 600 }}>{t('modal.agreementNotGuaranteed')}</span>.
              {t('modal.agreementRisksNote')}
            </p>
          </div>

          <p className="mb-2 opacity-90">
            <strong>{t('modal.agreementReturn')}</strong> {t('modal.agreementReturnText')}
          </p>

          <p className="mb-2 opacity-90">
            <strong>{t('modal.agreementTaxes')}</strong> {t('modal.agreementTaxesText')}
          </p>

          <p className="mb-2 opacity-90">
            <strong>{t('modal.agreementDisputes')}</strong> {t('modal.agreementDisputesText')}
          </p>

          <p className="mb-2 opacity-90">
            <strong>{t('modal.agreementAge')}</strong> {t('modal.agreementAgeText')}{' '}
            <span style={{ color: warningColor, fontWeight: 600 }}>{t('modal.agreementAgeYears')}</span>.
          </p>

          <p className="mb-2 opacity-90">
            <strong>{t('modal.agreementData')}</strong> {t('modal.agreementDataText')}
          </p>

          <p className="mb-2 opacity-90">
            <strong>{t('modal.agreementRoadmap')}</strong> {t('modal.agreementRoadmapText')}
          </p>

          <div className="pt-2 mt-2 border-t text-center opacity-50 text-[10px]" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <p>{t('modal.agreementVersion')}</p>
          </div>
        </div>

        {/* Scroll hint */}
        {showScrollHint && (
          <div className="absolute bottom-0 left-0 right-0 h-10 flex items-end justify-center pb-1 pointer-events-none rounded-b-xl"
            style={{ background: isDark ? 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)' : 'linear-gradient(to top, rgba(255,255,255,0.8) 0%, transparent 100%)' }}>
            <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} className="flex items-center gap-1 text-[10px] opacity-80" style={{ color: textColor }}>
              <ChevronDown className="w-3 h-3" />
              <span>{t('modal.scrollDown')}</span>
            </motion.div>
          </div>
        )}
      </div>

      {/* Footer - checkbox and button */}
      <div className="space-y-2">
        <label className={`flex items-center gap-3 min-h-[44px] ${hasScrolledToEnd ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}>
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => hasScrolledToEnd && onAgree(e.target.checked)}
            disabled={!hasScrolledToEnd}
            style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
          />
          <div className="w-6 h-6 rounded flex items-center justify-center transition-all flex-shrink-0"
            style={{ border: `2px solid ${agreeTerms ? '#28B48C' : isDark ? 'rgba(255,250,240,0.3)' : 'rgba(20,60,80,0.3)'}`, backgroundColor: agreeTerms ? '#28B48C' : 'transparent' }}>
            {agreeTerms && <Check className="w-4 h-4 text-white" />}
          </div>
          <span className="text-xs" style={{ color: textColor }}>
            {hasScrolledToEnd ? t('modal.agreeTerms') : t('modal.scrollToEnd')}
          </span>
        </label>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          disabled={!agreeTerms}
          className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
          style={{ background: agreeTerms ? 'linear-gradient(135deg, #28B48C 0%, #009696 100%)' : isDark ? 'rgba(255,250,240,0.1)' : 'rgba(20,60,80,0.1)', color: agreeTerms ? '#FFFAF0' : textColor }}>
          {agreeTerms ? t('modal.continue') : t('modal.readAgreement')}
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
  const { t } = useLanguage();
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

  // MetaMask payment state
  const [selectedToken, setSelectedToken] = useState<'USDT' | 'USDC'>('USDT');
  const [isMetaMaskPayment, setIsMetaMaskPayment] = useState(false);
  const [balances, setBalances] = useState<BalanceInfo | null>(null);
  const [loadingBalances, setLoadingBalances] = useState(false);

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
  const exchangeRate = parseFloat(settings?.exchange_rate_thb_usd || '32.65');
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

  // Load user's token balances
  const loadBalances = async () => {
    if (!walletAddress) return;
    setLoadingBalances(true);
    try {
      await bscService.ensureBSCNetwork();
      const bal = await bscService.getBalances(walletAddress);
      setBalances(bal);
    } catch (err) {
      console.error('Failed to load balances:', err);
    } finally {
      setLoadingBalances(false);
    }
  };

  // Handle MetaMask payment
  const handleMetaMaskPayment = async () => {
    if (!settings?.platform_wallet) {
      setError('Platform wallet not configured');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Ensure BSC network
      await bscService.ensureBSCNetwork();

      // Transfer tokens
      const result = selectedToken === 'USDT'
        ? await bscService.transferUSDT(settings.platform_wallet, amountNum)
        : await bscService.transferUSDC(settings.platform_wallet, amountNum);

      if (!result.success) {
        setError(result.error || 'Transaction failed');
        setLoading(false);
        return;
      }

      // Set TX hash and create investment
      setTxHash(result.txHash || '');

      // Create investment with TX hash
      const response = await api.createInvestment({
        tierId: tier.id,
        walletAddress: walletAddress,
        amountUsdt: amountNum,
        txHash: result.txHash,
        _formStartTime: formStartTime,
        website: '',
        network: IS_BSC_TESTNET ? 'testnet' : 'mainnet'
      });

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      setStep('success');
      onSuccess();
    } catch (err: any) {
      console.error('MetaMask payment error:', err);
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSubmit = () => {
    if (amountNum < minUsd) {
      setError(`${t('modal.minAmount')}: $${minUsd.toLocaleString()}`);
      return;
    }
    if (isStaking && amountNum >= maxUsd) {
      setError(t('modal.maxError').replace('${amount}', `$${maxUsd.toLocaleString()}`));
      return;
    }
    setError('');
    setStep('transfer');
  };

  const handleConfirmSubmit = async () => {
    if (!txHash.trim()) {
      setError(t('modal.enterTxHash'));
      return;
    }
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      setError(t('modal.invalidTxHash'));
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
        website: '', // honeypot - must be empty
        network: IS_BSC_TESTNET ? 'testnet' : 'mainnet'
      });

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }
      setStep('success');
      onSuccess();
    } catch (err) {
      setError(t('modal.errorCreating'));
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
        website: '', // honeypot - must be empty
        network: IS_BSC_TESTNET ? 'testnet' : 'mainnet'
      });

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }
      setStep('success');
      onSuccess();
    } catch (err) {
      setError(t('modal.errorCreating'));
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
            style={{ ...bgStyle, width: '440px', maxWidth: 'calc(100vw - 24px)', maxHeight: '85vh' }}
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
                  t={t}
                />
              )}

              {/* Step 1: Amount */}
              {step === 'amount' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <label className="block text-xs mb-2 opacity-70" style={{ color: textColor }}>
                      {t('modal.amount')}
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
                          className="px-3 py-2 rounded-lg text-xs font-semibold transition-all min-h-[36px]"
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
                      {isStaking ? t('modal.expectedReturn') : t('modal.expectedReturnCar')}
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
                        {t('modal.orCarOwnership')}
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
                    {t('modal.next')}
                  </motion.button>

                  <button
                    onClick={() => setStep('agreement')}
                    className="w-full py-2 text-xs opacity-70 hover:opacity-100"
                    style={{ color: textColor }}
                  >
                    {t('modal.backToAgreement')}
                  </button>
                </div>
              )}

              {/* Step 2: Transfer Instructions */}
              {step === 'transfer' && (
                <div className="space-y-4">
                  {/* Testnet Banner */}
                  {IS_BSC_TESTNET && (
                    <div className="p-3 rounded-xl text-center text-sm font-semibold" style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                      color: '#FFFFFF'
                    }}>
                      {t('modal.testnetMode')}
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1" style={{ color: accentColor }}>
                      ${amountNum.toLocaleString()}
                    </div>
                    <div className="text-xs opacity-70" style={{ color: textColor }}>
                      {t('modal.choosePayment')}
                    </div>
                  </div>

                  {/* Token Selector */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedToken('USDT')}
                      className="flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: selectedToken === 'USDT'
                          ? (isDark ? 'rgba(40, 180, 140, 0.3)' : 'rgba(40, 180, 140, 0.2)')
                          : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
                        color: selectedToken === 'USDT' ? '#28B48C' : textColor,
                        border: selectedToken === 'USDT' ? '2px solid #28B48C' : '2px solid transparent'
                      }}
                    >
                      USDT
                    </button>
                    <button
                      onClick={() => setSelectedToken('USDC')}
                      className="flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: selectedToken === 'USDC'
                          ? (isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)')
                          : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
                        color: selectedToken === 'USDC' ? '#009696' : textColor,
                        border: selectedToken === 'USDC' ? '2px solid #009696' : '2px solid transparent'
                      }}
                    >
                      USDC
                    </button>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="p-3 rounded-xl text-sm" style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#EF4444'
                    }}>
                      {error}
                    </div>
                  )}

                  {/* MetaMask Payment Button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMetaMaskPayment}
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #F6851B 0%, #E2761B 100%)',
                      color: '#FFFFFF'
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t('modal.confirmInWallet')}</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        <span>{t('modal.payViaWallet')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  {/* Bank Transfer Coming Soon */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                    <span className="text-xs opacity-50" style={{ color: textColor }}>{t('modal.or')}</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                  </div>

                  <div className="p-4 rounded-xl text-center" style={{
                    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                  }}>
                    <div className="text-sm opacity-70" style={{ color: textColor }}>
                      💳 {t('modal.paymentDetails')} — <span style={{ color: accentColor }}>{t('modal.comingSoon')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { setStep('amount'); setError(''); }}
                    className="w-full py-2 text-xs opacity-70 hover:opacity-100"
                    style={{ color: textColor }}
                  >
                    ← {t('modal.back')}
                  </button>
                </div>
              )}

              {/* Step 3: Success */}
              {step === 'success' && (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(40, 180, 140, 0.2)' }}
                  >
                    <Check className="w-7 h-7" style={{ color: '#28B48C' }} />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-1" style={{ color: accentColor }}>
                      {t('modal.applicationCreated')}
                    </h3>
                    <p className="text-xs opacity-70" style={{ color: textColor }}>
                      {t('modal.investmentPending')}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl text-left text-sm" style={{
                    backgroundColor: isDark ? 'rgba(0, 150, 150, 0.1)' : 'rgba(0, 150, 150, 0.05)'
                  }}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs opacity-70" style={{ color: textColor }}>{t('modal.amountLabel')}</span>
                      <span className="text-xs font-semibold" style={{ color: textColor }}>
                        ${amountNum.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs opacity-70" style={{ color: textColor }}>{t('modal.statusLabel')}</span>
                      <span className="text-xs font-semibold" style={{ color: '#FFC850' }}>
                        {txHash ? t('modal.awaitingVerification') : t('modal.awaitingPayment')}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] opacity-70" style={{ color: textColor }}>
                    {t('modal.willCheck24h')}
                  </p>

                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                      color: '#FFFAF0'
                    }}
                  >
                    {t('modal.done')}
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
