import { motion } from 'motion/react';
import { Bell, Check } from 'lucide-react';
import { Button } from './ui/button';
import { OceanBackground } from './OceanBackground';
import { RippleButton } from './RippleButton';
import { LanguageToggleCompact } from './LanguageToggle';
import { useLanguage } from './LanguageContext';

interface PermissionScreenProps {
  onAllow: () => void;
  onSkip: () => void;
}

export function PermissionScreen({ onAllow, onSkip }: PermissionScreenProps) {
  const { language, setLanguage, t } = useLanguage();

  const benefits = [
    t('permission.benefit1'),
    t('permission.benefit2'),
    t('permission.benefit3'),
  ];

  return (
    <OceanBackground variant="waves" showBubbles={true} showStars={true}>
      {/* Language toggle in top right corner */}
      <div className="fixed right-6 top-6 z-20">
        <LanguageToggleCompact
          currentLanguage={language}
          onToggle={setLanguage}
        />
      </div>

      <div className="min-h-screen px-6 py-12">
        <div className="mx-auto flex max-w-md flex-col items-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative mb-6"
          >
            <motion.div
              className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1] backdrop-blur-xl"
              style={{
                boxShadow: '0px 8px 24px rgba(74, 159, 216, 0.3)',
              }}
              animate={{
                boxShadow: [
                  '0px 8px 24px rgba(74, 159, 216, 0.3)',
                  '0px 12px 32px rgba(74, 159, 216, 0.5)',
                  '0px 8px 24px rgba(74, 159, 216, 0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Bell className="h-10 w-10 text-white" strokeWidth={2} />
            </motion.div>
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-[20px] border-2 border-[#4A9FD8]"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.8, 0, 0.8],
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
            style={{ fontSize: '28px', fontWeight: 700 }}
          >
            {t('permission.title')}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8 max-w-[300px] text-center text-muted-foreground"
            style={{ fontSize: '16px', lineHeight: '1.5' }}
          >
            {t('permission.description')}
          </motion.p>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8 w-full rounded-xl bg-card/80 p-4 backdrop-blur-md"
            style={{
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#52C9C1]">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-foreground" style={{ fontSize: '15px', lineHeight: '1.4' }}>
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="w-full space-y-3"
          >
            <RippleButton
              onClick={onAllow}
              className="h-[52px] w-full rounded-2xl bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white shadow-lg shadow-[#4A9FD8]/30 transition-transform hover:scale-[0.98] active:scale-95"
              style={{ fontSize: '16px', fontWeight: 600 }}
            >
              {t('permission.allow')}
            </RippleButton>

            <motion.button
              onClick={onSkip}
              className="h-12 w-full text-muted-foreground transition-colors hover:text-foreground"
              style={{ fontSize: '15px' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('permission.skip')}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </OceanBackground>
  );
}