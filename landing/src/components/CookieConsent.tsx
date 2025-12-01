import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, Shield } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export function CookieConsent() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('saturway-cookie-consent');
    if (!consent) {
      // Show after 2 seconds
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('saturway-cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('saturway-cookie-consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:bottom-6 md:left-6 md:right-auto md:max-w-md"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* Close button */}
            <button
              onClick={handleDecline}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 transition-colors hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6">
              {/* Icon */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
                  <Cookie className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">
                  {t('cookie.title')}
                </h3>
              </div>

              {/* Content */}
              <p className="mb-4 text-sm text-muted-foreground">
                {t('cookie.description')}
              </p>

              {/* Privacy note */}
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-muted/30 p-3">
                <Shield className="h-4 w-4 flex-shrink-0 text-[#6366F1] mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {t('cookie.privacy')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={handleAccept}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-6 py-3 text-sm text-white transition-all hover:shadow-lg"
                >
                  {t('cookie.accept')}
                </button>
                <button
                  onClick={handleDecline}
                  className="flex-1 rounded-xl border border-border bg-transparent px-6 py-3 text-sm transition-all hover:bg-muted/30"
                >
                  {t('cookie.decline')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
