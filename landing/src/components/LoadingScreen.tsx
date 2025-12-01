import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import logoImage from 'figma:asset/443c5c749ebfe974980617b9c917b81b051ddc82.png';
import { OceanBackground } from './OceanBackground';
import { LanguageToggleCompact } from './LanguageToggle';
import { useLanguage } from './LanguageContext';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const { language, setLanguage, t } = useLanguage();
  const [textIndex, setTextIndex] = useState(0);

  const loadingTexts = [
    t('loading.connecting'),
    t('loading.wait'),
    t('loading.loadingData'),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1000);

    // Simulate auth completion after 3 seconds
    const timeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete, loadingTexts.length]);

  return (
    <OceanBackground variant="gradient" showBubbles={true} showStars={true}>
      {/* Language toggle in top right corner */}
      <div className="fixed right-6 top-6 z-20">
        <LanguageToggleCompact
          currentLanguage={language}
          onToggle={setLanguage}
        />
      </div>

      <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
        {/* Underwater light rays */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-0 h-[150%] w-2 origin-top bg-gradient-to-b from-white/20 via-white/10 to-transparent blur-sm"
              style={{
                transform: `translateX(-50%) rotate(${-20 + i * 10}deg)`,
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scaleY: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center px-6">
          {/* Logo with animation */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
            }}
            className="mb-8"
          >
            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative"
              style={{
                filter: 'drop-shadow(0px 20px 60px rgba(74, 159, 216, 0.5))',
              }}
            >
              <img
                src={logoImage}
                alt="Saturway Logo"
                className="h-[120px] w-auto"
              />
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#4A9FD8]/30 to-[#52C9C1]/30 blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          </motion.div>

          {/* App name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-2 text-center"
          >
            <h1
              className="bg-gradient-to-r from-white to-white/90 bg-clip-text"
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: 'transparent',
                textShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              {t('loading.appName')}
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-12 text-white"
            style={{ fontSize: '16px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
          >
            {t('loading.subtitle')}
          </motion.p>

          {/* Loading spinner with bubbles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col items-center"
          >
            {/* Spinner */}
            <div className="relative mb-3 h-10 w-10">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white shadow-lg shadow-white/50"
                  style={{
                    transformOrigin: '50% 20px',
                    transform: `rotate(${i * 45}deg)`,
                    opacity: 0.9,
                  }}
                  animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* Loading text */}
            <motion.p
              key={textIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 0.8, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-white"
              style={{ fontSize: '14px', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            >
              {loadingTexts[textIndex]}
            </motion.p>
          </motion.div>
        </div>
      </div>
    </OceanBackground>
  );
}