import { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Loader2, AlertCircle, Car, Percent, ExternalLink, Plus, Minus, ChevronDown, Wallet, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../services/api';
import { bscService, IS_BSC_TESTNET } from '../../services/bsc';
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
      const isAtEnd = scrollTop + clientHeight >= scrollHeight - 15;
      if (isAtEnd) {
        setHasScrolledToEnd(true);
        setShowScrollHint(false);
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      if (scrollHeight <= clientHeight + 10) {
        setHasScrolledToEnd(true);
        setShowScrollHint(false);
      }
    }
  }, []);

  const accentColor = isDark ? '#FFC850' : '#143C50';
  const warningColor = '#F59E0B';

  return (
    <div className="space-y-3">
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="p-3 rounded-xl text-[11px] overflow-y-auto"
          style={{
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
            color: textColor,
            lineHeight: 1.6,
            maxHeight: 'calc(85vh - 220px)',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <p className="font-bold mb-3 text-xs text-center" style={{ color: accentColor }}>
            {t('modal.agreementTitle')}
          </p>
          <p className="mb-2 opacity-90">{t('modal.agreementIntro')}</p>
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
          <p className="mb-2 opacity-90"><strong>{t('modal.agreementReturn')}</strong> {t('modal.agreementReturnText')}</p>
          <p className="mb-2 opacity-90"><strong>{t('modal.agreementTaxes')}</strong> {t('modal.agreementTaxesText')}</p>
          <p className="mb-2 opacity-90"><strong>{t('modal.agreementDisputes')}</strong> {t('modal.agreementDisputesText')}</p>
          <p className="mb-2 opacity-90">
            <strong>{t('modal.agreementAge')}</strong> {t('modal.agreementAgeText')}{' '}
            <span style={{ color: warningColor, fontWeight: 600 }}>{t('modal.agreementAgeYears')}</span>.   
          </p>
          <p className="mb-2 opacity-90"><strong>{t('modal.agreementData')}</strong> {t('modal.agreementDataText')}</p>
          <p className="mb-2 opacity-90"><strong>{t('modal.agreementRoadmap')}</strong> {t('modal.agreementRoadmapText')}</p>
          <div className="pt-2 mt-2 border-t text-center opacity-50 text-[10px]" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <p>{t('modal.agreementVersion')}</p>
          </div>
        </div>
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

// Editable Amount Input
function AmountInput({ 
  amount, 
  onChange, 
  isDark 
}: { 
  amount: number; 
  onChange: (val: number) => void; 
  isDark: boolean;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digits
    const rawValue = e.target.value.replace(/\D/g, '');
    const val = rawValue === '' ? 0 : parseInt(rawValue);
    onChange(val);
  };

  return (
    <div className="flex items-center justify-center">
      <span className="text-2xl font-bold mr-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>$</span>
      <input
        type="text"
        inputMode="numeric"
        value={amount > 0 ? amount.toLocaleString() : ''}
        onChange={handleChange}
        className="bg-transparent text-2xl font-bold text-center focus:outline-none w-[140px]"
        style={{ color: isDark ? '#FFFAF0' : '#143C50' }}
        placeholder="0"
      />
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
  exchange_rate_thb_usd?: string;
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
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [selectedToken, setSelectedToken] = useState<'USDT' | 'USDC'>('USDT');

  useEffect(() => {
    if (isOpen && tier) {
      const minUsdValue = parseFloat(tier.min_investment_usd || '1000');
      setStep('agreement');
      setAmount(minUsdValue);
      setTxHash('');
      setError('');
      setAgreeTerms(false);
      loadSettings();
    }
  }, [isOpen, tier]);

  const loadSettings = async () => {
    const response = await api.getPlatformSettings();
    if (response.data) setSettings(response.data);
  };

  if (!tier || !isOpen) return null;

  const minUsd = parseFloat(tier.min_investment_usd || '1000');
  const maxUsd = parseFloat(settings?.min_car_investment_usd || '12400');
  const isStaking = tier.id === 1;
  const exchangeRate = parseFloat(settings?.exchange_rate_thb_usd || '32.65');
  const amountBaht = amount * exchangeRate;
  const increment = isStaking ? 100 : 500;

  const adjustAmount = (delta: number) => {
    setAmount(prev => {
      const newVal = prev + delta;
      // Allow user to go below min/above max while typing/adjusting, validation happens on submit
      // But for buttons, clamp to meaningful values if needed
      if (newVal < 0) return 0;
      return newVal;
    });
    setError('');
  };

  const startHold = (delta: number) => {
    adjustAmount(delta);
    intervalRef.current = setInterval(() => adjustAmount(delta), 100);
  };

  const stopHold = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const expectedReturn = isStaking 
    ? amount * (parseFloat(settings?.staking_monthly_rate || '1.7') / 100) * 6
    : amount * (parseFloat(settings?.large_investor_return || '20') / 100);

  const handleAmountSubmit = () => {
    if (amount < minUsd) {
      setError(`${t('modal.minAmount')}: $${minUsd.toLocaleString()}`);
      return;
    }
    // No hard max cap for Staking usually, but if there is:
    // if (isStaking && amount >= maxUsd) ...
    setStep('transfer');
  };

  const handleMetaMaskPayment = async () => {
    if (!settings?.platform_wallet) { setError('Wallet not configured'); return; }
    setLoading(true); setError('');
    try {
      await bscService.ensureBSCNetwork();
      const result = selectedToken === 'USDT'
        ? await bscService.transferUSDT(settings.platform_wallet, amount)
        : await bscService.transferUSDC(settings.platform_wallet, amount);
      if (!result.success) { setError(result.error || 'Failed'); setLoading(false); return; }
      await api.createInvestment({ tierId: tier.id, walletAddress, amountUsdt: amount, txHash: result.txHash });
      setStep('success'); onSuccess();
    } catch (err: any) { setError(err.message || 'Error'); } finally { setLoading(false); }
  };

  const bgStyle = {
    background: isDark
      ? 'linear-gradient(135deg, rgba(26, 78, 100, 0.98) 0%, rgba(20, 60, 80, 0.98) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 250, 240, 0.98) 100%)'
  };
  const textColor = isDark ? '#FFFAF0' : '#143C50';
  const accentColor = isDark ? '#FFC850' : '#143C50';

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div key="invest-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ ...bgStyle, width: '440px', maxWidth: 'calc(100vw - 24px)', maxHeight: '85vh' }}       
          >
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)' }}>
              <div className="flex items-center gap-2">
                {isStaking ? <Percent className="w-5 h-5" style={{ color: '#28B48C' }} /> : <Car className="w-5 h-5" style={{ color: '#FFC850' }} />}
                <h2 className="text-lg font-bold" style={{ color: accentColor }}>{tier.name}</h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/10"><X className="w-5 h-5" style={{ color: textColor }} /></button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {step === 'agreement' && <AgreementStep isDark={isDark} textColor={textColor} agreeTerms={agreeTerms} onAgree={setAgreeTerms} onContinue={() => setStep('amount')} t={t} />}
              {step === 'amount' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <label className="block text-xs mb-2 opacity-70" style={{ color: textColor }}>{t('modal.amount')}</label>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <button onMouseDown={() => startHold(-increment)} onMouseUp={stopHold} onMouseLeave={stopHold} className="w-12 h-12 rounded-xl border flex items-center justify-center opacity-80 transition-colors hover:bg-white/5 active:scale-95" style={{ borderColor: isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)' }}><Minus className="w-5 h-5" style={{ color: '#009696' }} /></button>
                      
                      {/* Editable Amount Input */}
                      <div className="px-4 py-2 rounded-xl min-w-[140px] border" style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)' }}>
                        <AmountInput amount={amount} onChange={setAmount} isDark={isDark} />
                      </div>

                      <button onMouseDown={() => startHold(increment)} onMouseUp={stopHold} onMouseLeave={stopHold} className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-transform active:scale-95" style={{ background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)' }}><Plus className="w-5 h-5" /></button>
                    </div>
                    
                    {/* Quick Add Buttons */}
                    <div className="flex justify-center gap-2 mb-2">
                         {[100, 500, 1000].map(val => (
                           <button 
                             key={val}
                             onClick={() => setAmount(prev => prev + val)}
                             className="px-2 py-1 rounded text-xs border opacity-70 hover:opacity-100"
                             style={{ color: textColor, borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }}
                           >
                             +${val}
                           </button>
                         ))}
                    </div>

                    <div className="text-xs opacity-70" style={{ color: textColor }}>≈ ฿{amountBaht.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  
                  <div className="p-3 rounded-xl text-center border" style={{ backgroundColor: isDark ? 'rgba(40,180,140,0.1)' : 'rgba(40,180,140,0.05)', borderColor: isDark ? 'rgba(40,180,140,0.2)' : 'rgba(40,180,140,0.1)' }}>
                    <div className="text-xs opacity-70 mb-1" style={{ color: textColor }}>{isStaking ? t('modal.expectedReturn') : t('modal.expectedReturnCar')}</div>
                    <div className="text-xl font-bold" style={{ color: '#28B48C' }}>+${expectedReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>

                  {error && <div className="text-red-500 text-xs text-center">{error}</div>}

                  <button onClick={handleAmountSubmit} className="w-full py-3 rounded-xl font-semibold text-white transition-transform active:scale-95" style={{ background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)' }}>{t('modal.next')}</button>
                </div>
              )}
              {step === 'transfer' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: accentColor }}>${amount.toLocaleString()}</div>
                    <div className="text-xs opacity-70" style={{ color: textColor }}>{t('modal.payViaWallet')}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedToken('USDT')} className="flex-1 py-2 rounded-xl border font-bold" style={{ borderColor: selectedToken === 'USDT' ? '#28B48C' : 'transparent', color: selectedToken === 'USDT' ? '#28B48C' : textColor }}>USDT</button>
                    <button onClick={() => setSelectedToken('USDC')} className="flex-1 py-2 rounded-xl border font-bold" style={{ borderColor: selectedToken === 'USDC' ? '#009696' : 'transparent', color: selectedToken === 'USDC' ? '#009696' : textColor }}>USDC</button>
                  </div>
                  <button onClick={handleMetaMaskPayment} disabled={loading} className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #F6851B 0%, #E2761B 100%)' }}>
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Wallet className="w-5 h-5" /> {t('modal.payViaWallet')}</>}
                  </button>
                  <button onClick={() => setStep('amount')} className="w-full py-2 text-xs opacity-70 hover:opacity-100" style={{ color: textColor }}>← {t('modal.back')}</button>
                </div>
              )}
              {step === 'success' && (
                <div className="text-center py-8">
                  <div className="w-16 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-green-500" /></div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: accentColor }}>{t('modal.applicationCreated')}</h3>
                  <button onClick={onClose} className="w-full py-3 rounded-xl bg-[#28B48C] text-white font-bold">{t('modal.done')}</button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}