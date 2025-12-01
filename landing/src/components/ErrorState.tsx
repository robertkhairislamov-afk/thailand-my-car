import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, WifiOff, ServerCrash } from 'lucide-react';
import { RippleButton } from './RippleButton';
import { useLanguage } from './LanguageContext';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  type?: 'network' | 'server' | 'general';
  fullScreen?: boolean;
}

export function ErrorState({
  title,
  message,
  onRetry,
  type = 'general',
  fullScreen = false,
}: ErrorStateProps) {
  const { t } = useLanguage();

  const icons = {
    network: WifiOff,
    server: ServerCrash,
    general: AlertCircle,
  };

  const Icon = icons[type];

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      {/* Error Icon with Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="relative"
      >
        <div className="rounded-full bg-destructive/10 p-6">
          <Icon className="h-12 w-12 text-destructive" />
        </div>

        {/* Pulsing Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-destructive/30"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Error Title */}
      <h3 style={{ fontSize: '20px', fontWeight: 600 }}>
        {title || t('error.title')}
      </h3>

      {/* Error Message */}
      <p className="max-w-sm text-muted-foreground" style={{ fontSize: '14px' }}>
        {message || t('error.message')}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RippleButton
            onClick={onRetry}
            className="bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('error.retry')}
          </RippleButton>
        </motion.div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-8">
        {content}
      </div>
    );
  }

  return (
    <div className="flex min-h-[300px] items-center justify-center p-8">
      {content}
    </div>
  );
}
