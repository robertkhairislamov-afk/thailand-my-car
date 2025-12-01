import { motion } from 'motion/react';
import { ArrowRight, Target, Zap, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from './LanguageContext';
import logoImage from 'figma:asset/443c5c749ebfe974980617b9c917b81b051ddc82.png';

interface WelcomeProps {
  onGetStarted: () => void;
}

export function Welcome({ onGetStarted }: WelcomeProps) {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#4A9FD8] via-[#5AB5E8] to-[#52C9C1]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Sun */}
        <motion.div
          className="absolute left-1/2 top-20 h-32 w-32 -translate-x-1/2 rounded-full bg-white shadow-[0_0_100px_40px_rgba(255,255,255,0.4)]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Light Rays */}
        <div className="absolute left-1/2 top-20 h-[600px] w-[600px] -translate-x-1/2">
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 h-[300px] w-1 -translate-x-1/2 bg-gradient-to-b from-white/20 to-transparent"
                style={{
                  transform: `rotate(${i * 30}deg) translateY(-150px)`,
                  transformOrigin: 'center 150px',
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Clouds */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-12 w-32 rounded-full bg-white/40 blur-sm"
            style={{
              top: `${20 + i * 15}%`,
              left: `${-20 + i * 25}%`,
            }}
            animate={{
              x: [0, 100, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Ocean Waves Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-b from-transparent to-[#52C9C1]/30" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="inline-block rounded-full bg-white/10 p-6 backdrop-blur-sm">
            <img
              src={logoImage}
              alt="Saturway Logo"
              className="h-40 w-auto drop-shadow-2xl"
            />
          </div>
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-white drop-shadow-lg" style={{ fontSize: '32px', fontWeight: 700 }}>
            {t('welcome.title')}
          </h1>
          <p className="mx-auto max-w-md text-white/90 drop-shadow-md" style={{ fontSize: '18px' }}>
            {t('welcome.description')}
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mb-12 grid gap-4 px-4"
        >
          {[
            { icon: Target, text: t('welcome.feature1') },
            { icon: Zap, text: t('welcome.feature2') },
            { icon: Brain, text: t('welcome.feature3') },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3 rounded-2xl bg-white/20 px-6 py-4 backdrop-blur-md"
              >
                <div className="rounded-lg bg-white/30 p-2">
                  <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-white" style={{ fontSize: '16px', fontWeight: 500 }}>
                  {feature.text}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <Button
            onClick={onGetStarted}
            className="group h-14 rounded-full bg-white px-8 text-[#4A9FD8] shadow-2xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.5)]"
            style={{ fontSize: '18px', fontWeight: 600 }}
          >
            {t('welcome.getStarted')}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#52C9C1] to-transparent" />
    </div>
  );
}