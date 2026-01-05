import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Smartphone, Copy, Check, Mail } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface MobileWalletHelperProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onContinueWithWalletConnect: () => void;
  onLoginWithEmail?: () => void;
}

// Deep links for wallet browsers
const WALLET_LINKS = [
  {
    name: 'MetaMask',
    icon: '🦊',
    deepLink: (url: string) => `https://metamask.app.link/dapp/${url.replace('https://', '')}`,
    color: '#E2761B',
  },
  {
    name: 'OKX Wallet',
    icon: '⭕',
    deepLink: (url: string) => `okx://wallet/dapp/url?dappUrl=${encodeURIComponent(url)}`,
    color: '#000000',
  },
  {
    name: 'Trust Wallet',
    icon: '🛡️',
    deepLink: (url: string) => `trust://browser_enable?url=${encodeURIComponent(url)}`,
    color: '#3375BB',
  },
  {
    name: 'Binance Web3',
    icon: '🟡',
    deepLink: (url: string) => `bnc://app.binance.com/cedefi/web3-browser?url=${encodeURIComponent(url)}`,
    color: '#F0B90B',
  },
];

export function MobileWalletHelper({ isOpen, onClose, isDark, onContinueWithWalletConnect, onLoginWithEmail }: MobileWalletHelperProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  if (!isOpen) return null;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openInWallet = (wallet: typeof WALLET_LINKS[0]) => {
    const deepLink = wallet.deepLink(currentUrl);
    window.location.href = deepLink;

    // Fallback: if deep link doesn't work after 2 seconds, show message
    setTimeout(() => {
      // User is still on the page, deep link probably didn't work
    }, 2000);
  };

  const modalContent = (
    <div
      className="fixed inset-0 flex items-end justify-center"
      style={{
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Modal */}
      <div
        className="relative w-full rounded-t-3xl p-5 pb-8 animate-slide-up"
        style={{
          backgroundColor: isDark ? '#1A4E64' : '#FFFAF0',
          maxHeight: '85vh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 100000,
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-colors"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
          }}
        >
          <X className="w-5 h-5" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl" style={{ backgroundColor: isDark ? 'rgba(0,150,150,0.2)' : 'rgba(0,150,150,0.1)' }}>
            <Smartphone className="w-6 h-6" style={{ color: '#009696' }} />
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: isDark ? '#FFC850' : '#143C50' }}>
              {t('mobileHelper.title')}
            </h3>
            <p className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
              {t('mobileHelper.subtitle')}
            </p>
          </div>
        </div>

        {/* Best option - Open in wallet browser */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-3" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
            {t('mobileHelper.recommend')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {WALLET_LINKS.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => openInWallet(wallet)}
                className="flex items-center gap-2 p-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}
              >
                <span className="text-2xl">{wallet.icon}</span>
                <span className="text-sm font-medium" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  {wallet.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
          <span className="text-xs opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{t('mobileHelper.or')}</span>
          <div className="flex-1 h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
        </div>

        {/* Copy URL option */}
        <div className="mb-4">
          <p className="text-sm opacity-70 mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
            {t('mobileHelper.copyLink')}
          </p>
          <button
            onClick={copyUrl}
            className="w-full flex items-center justify-between p-3 rounded-xl transition-all"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}
          >
            <span className="text-sm truncate mr-2 opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
              {currentUrl}
            </span>
            {copied ? (
              <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#28B48C' }} />
            ) : (
              <Copy className="w-5 h-5 flex-shrink-0" style={{ color: '#009696' }} />
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
          <span className="text-xs opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{t('mobileHelper.or')}</span>
          <div className="flex-1 h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
        </div>

        {/* Email/Google login - for investors without crypto wallet */}
        {onLoginWithEmail && (
          <div className="mb-4">
            <p className="text-sm opacity-70 mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
              {t('mobileHelper.noWallet')}
            </p>
            <button
              onClick={() => {
                onClose();
                onLoginWithEmail();
              }}
              className="w-full p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #FFC850 0%, #FF9800 100%)',
                color: '#143C50',
                fontWeight: 600
              }}
            >
              <Mail className="w-5 h-5" />
              {t('mobileHelper.loginEmail')}
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
          <span className="text-xs opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{t('mobileHelper.or')}</span>
          <div className="flex-1 h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
        </div>

        {/* Try WalletConnect anyway */}
        <button
          onClick={() => {
            onClose();
            onContinueWithWalletConnect();
          }}
          className="w-full p-3 rounded-xl transition-all hover:opacity-90"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            color: isDark ? '#FFFAF0' : '#143C50',
            fontWeight: 500,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
          }}
        >
          {t('mobileHelper.tryWalletConnect')}
        </button>

        <p className="text-xs text-center mt-3 opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
          {t('mobileHelper.walletConnectNote')}
        </p>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );

  // Render using portal to body to escape any parent overflow/positioning
  return createPortal(modalContent, document.body);
}

// Helper to detect mobile
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Helper to detect if running inside wallet browser
export function isWalletBrowser(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes('metamask') ||
    ua.includes('trust') ||
    ua.includes('okx') ||
    ua.includes('binance') ||
    ua.includes('tokenpocket') ||
    ua.includes('imtoken') ||
    // Check for injected providers
    !!(window as any).ethereum?.isMetaMask ||
    !!(window as any).ethereum?.isTrust ||
    !!(window as any).okxwallet ||
    !!(window as any).BinanceChain
  );
}
