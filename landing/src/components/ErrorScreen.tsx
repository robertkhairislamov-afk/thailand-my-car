import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { OceanBackground } from './OceanBackground';
import { RippleButton } from './RippleButton';
import { LanguageToggleCompact } from './LanguageToggle';
import { useLanguage } from './LanguageContext';

interface ErrorScreenProps {
  errorCode?: string;
  errorMessage?: string;
  onRetry: () => void;
  onSupport?: () => void;
}

export function ErrorScreen({
  errorCode = 'AUTH001',
  errorMessage,
  onRetry,
  onSupport,
}: ErrorScreenProps) {
  const { language, setLanguage, t } = useLanguage();
  const displayMessage = errorMessage || t('error.defaultMessage');

  return (
    <OceanBackground variant="deep" showBubbles={true} showStars={true}>
      {/* Language toggle in top right corner */}
      <div className="fixed right-6 top-6 z-20">
        <LanguageToggleCompact
          currentLanguage={language}
          onToggle={setLanguage}
        />
      </div>

      <div className="min-h-screen px-6 py-12">
        <div className="mx-auto flex max-w-md flex-col items-center pt-20">
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative mb-6"
          >
            <motion.div
              animate={{
                rotate: [0, -5, 5, -5, 5, 0],
              }}
              transition={{
                duration: 0.6,
                delay: 0.5,
                ease: 'easeInOut',
              }}
              className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#FF6B6B]/10 backdrop-blur-md"
              style={{
                boxShadow: '0 8px 32px rgba(255, 107, 107, 0.2)',
              }}
            >
              <AlertCircle className="h-14 w-14 text-[#FF6B6B]" strokeWidth={2} />
            </motion.div>
            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#FF6B6B]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-3 text-center text-foreground"
            style={{ fontSize: '24px', fontWeight: 700 }}
          >
            {t('error.title')}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-4 max-w-[280px] text-center text-muted-foreground"
            style={{ fontSize: '16px', lineHeight: '1.5' }}
          >
            {displayMessage}
          </motion.p>

          {/* Error Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8 rounded-md bg-muted/50 px-3 py-2 backdrop-blur-sm"
          >
            <code
              className="text-muted-foreground"
              style={{
                fontSize: '12px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}
            >
              {t('error.code')} {errorCode}
            </code>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-full space-y-3"
          >
            <RippleButton
              onClick={onRetry}
              className="h-[52px] w-full rounded-2xl bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white shadow-lg shadow-[#4A9FD8]/30 transition-transform hover:scale-[0.98] active:scale-95"
              style={{ fontSize: '16px', fontWeight: 600 }}
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              {t('error.retry')}
            </RippleButton>

            {onSupport && (
              <motion.button
                onClick={onSupport}
                className="flex h-12 w-full items-center justify-center gap-2 text-[#4A9FD8] transition-colors hover:text-[#5AB5E8] hover:underline"
                style={{ fontSize: '15px' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="h-4 w-4" />
                {t('error.support')}
              </motion.button>
            )}
          </motion.div>

          {/* Additional help text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-8 rounded-lg bg-card/50 p-4 backdrop-blur-sm"
            style={{
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            }}
          >
            <p className="text-center text-muted-foreground" style={{ fontSize: '13px' }}>
              {t('error.helpTitle')}
            </p>
            <ul
              className="mt-2 space-y-1 text-muted-foreground"
              style={{ fontSize: '13px' }}
            >
              <li>{t('error.help1')}</li>
              <li>{t('error.help2')}</li>
              <li>{t('error.help3')}</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </OceanBackground>
  );
}