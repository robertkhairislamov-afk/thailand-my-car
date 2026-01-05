import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300"
      style={{ backgroundColor: 'rgba(20, 60, 80, 0.98)' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm" style={{ color: '#FFFAF0' }}>
          <span className="text-xl">🍪</span>
          <p className="opacity-90">
            {t('cookies.message')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm rounded-lg transition-all hover:opacity-80"
            style={{
              color: '#FFFAF0',
              opacity: 0.7
            }}
          >
            {t('cookies.decline')}
          </button>
          <button
            onClick={handleAccept}
            className="px-6 py-2 text-sm rounded-lg transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #009696, #28B48C)',
              color: '#FFFAF0'
            }}
          >
            {t('cookies.accept')}
          </button>
          <button
            onClick={handleDecline}
            className="p-1 rounded-lg transition-all hover:opacity-80 sm:hidden"
            style={{ color: '#FFFAF0', opacity: 0.5 }}
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
