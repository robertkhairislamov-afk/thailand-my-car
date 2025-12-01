import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Briefcase, Heart, BookOpen, Sparkles, Clock, Coffee, Sunrise, Sun, Moon, Battery, BatteryLow, BatteryMedium, BatteryFull, Zap } from 'lucide-react';
import { RippleButton } from './RippleButton';
import { useLanguage } from './LanguageContext';
import { Card } from './ui/card';

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  mainFocus: 'work' | 'health' | 'personal' | 'mix';
  workSchedule: 'stable' | 'flexible' | 'freelance';
  startHour: string;
  initialEnergy: number;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(data as OnboardingData);
    }
  };

  const handleSkip = () => {
    onComplete({
      mainFocus: 'work',
      workSchedule: 'stable',
      startHour: '9:00',
      initialEnergy: 60,
    });
  };

  const selectOption = (key: keyof OnboardingData, value: any) => {
    setData({ ...data, [key]: value });
    setTimeout(handleNext, 300);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#4A9FD8]/10 via-background to-[#52C9C1]/10">
      {/* Background Ocean Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-20 top-20 h-40 w-40 rounded-full bg-[#4A9FD8]/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute -right-20 top-40 h-60 w-60 rounded-full bg-[#52C9C1]/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[...Array(totalSteps)].map((_, i) => (
            <motion.div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i + 1 === step
                  ? 'w-8 bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1]'
                  : i + 1 < step
                  ? 'w-2 bg-[#4A9FD8]'
                  : 'w-2 bg-border'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>

        {/* Skip Button */}
        <div className="mb-6 text-right">
          <button
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
            style={{ fontSize: '14px' }}
          >
            {t('onboarding.skip')}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Main Focus */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-[#4A9FD8]/20 bg-card/95 backdrop-blur-lg">
                <div className="p-8">
                  <h2
                    className="mb-3 bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] bg-clip-text text-transparent"
                    style={{ fontSize: '28px', fontWeight: 700 }}
                  >
                    {t('onboarding.step1.title')}
                  </h2>
                  <p className="mb-8 text-muted-foreground" style={{ fontSize: '16px' }}>
                    {t('onboarding.step1.subtitle')}
                  </p>

                  <div className="space-y-3">
                    {[
                      { id: 'work', icon: Briefcase, label: t('onboarding.step1.work'), color: '#4A9FD8' },
                      { id: 'health', icon: Heart, label: t('onboarding.step1.health'), color: '#52C9C1' },
                      { id: 'personal', icon: BookOpen, label: t('onboarding.step1.personal'), color: '#5AB5E8' },
                      { id: 'mix', icon: Sparkles, label: t('onboarding.step1.mix'), color: '#4A9FD8' },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <motion.button
                          key={option.id}
                          onClick={() => selectOption('mainFocus', option.id)}
                          className="w-full rounded-xl border-2 border-border/50 bg-card p-4 text-left transition-all hover:border-[#4A9FD8]/50 hover:bg-[#4A9FD8]/5"
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="rounded-lg p-3"
                              style={{ backgroundColor: `${option.color}15` }}
                            >
                              <Icon className="h-6 w-6" style={{ color: option.color }} />
                            </div>
                            <span style={{ fontSize: '16px', fontWeight: 500 }}>
                              {option.label}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Work Schedule */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-[#4A9FD8]/20 bg-card/95 backdrop-blur-lg">
                <div className="p-8">
                  <h2
                    className="mb-3 bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] bg-clip-text text-transparent"
                    style={{ fontSize: '28px', fontWeight: 700 }}
                  >
                    {t('onboarding.step2.title')}
                  </h2>
                  <p className="mb-8 text-muted-foreground" style={{ fontSize: '16px' }}>
                    {t('onboarding.step2.subtitle')}
                  </p>

                  <div className="space-y-3">
                    {[
                      { id: 'stable', label: t('onboarding.step2.stable'), desc: t('onboarding.step2.stableDesc') },
                      { id: 'flexible', label: t('onboarding.step2.flexible'), desc: t('onboarding.step2.flexibleDesc') },
                      { id: 'freelance', label: t('onboarding.step2.freelance'), desc: t('onboarding.step2.freelanceDesc') },
                    ].map((option) => (
                      <motion.button
                        key={option.id}
                        onClick={() => selectOption('workSchedule', option.id)}
                        className="w-full rounded-xl border-2 border-border/50 bg-card p-4 text-left transition-all hover:border-[#4A9FD8]/50 hover:bg-[#4A9FD8]/5"
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p style={{ fontSize: '16px', fontWeight: 500 }} className="mb-1">
                          {option.label}
                        </p>
                        <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                          {option.desc}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Start Hour */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-[#4A9FD8]/20 bg-card/95 backdrop-blur-lg">
                <div className="p-8">
                  <h2
                    className="mb-3 bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] bg-clip-text text-transparent"
                    style={{ fontSize: '28px', fontWeight: 700 }}
                  >
                    {t('onboarding.step3.title')}
                  </h2>
                  <p className="mb-8 text-muted-foreground" style={{ fontSize: '16px' }}>
                    {t('onboarding.step3.subtitle')}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { time: '8:00', icon: Sunrise, label: t('onboarding.step3.early') },
                      { time: '9:00', icon: Coffee, label: t('onboarding.step3.morning') },
                      { time: '10:00', icon: Sun, label: t('onboarding.step3.mid') },
                      { time: '11:00', icon: Sun, label: t('onboarding.step3.late') },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <motion.button
                          key={option.time}
                          onClick={() => selectOption('startHour', option.time)}
                          className="rounded-xl border-2 border-border/50 bg-card p-4 text-center transition-all hover:border-[#4A9FD8]/50 hover:bg-[#4A9FD8]/5"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="mx-auto mb-2 h-8 w-8 text-[#4A9FD8]" />
                          <p style={{ fontSize: '20px', fontWeight: 600 }}>{option.time}</p>
                          <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                            {option.label}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Initial Energy */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-[#4A9FD8]/20 bg-card/95 backdrop-blur-lg">
                <div className="p-8">
                  <h2
                    className="mb-3 bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] bg-clip-text text-transparent"
                    style={{ fontSize: '28px', fontWeight: 700 }}
                  >
                    {t('onboarding.step4.title')}
                  </h2>
                  <p className="mb-8 text-muted-foreground" style={{ fontSize: '16px' }}>
                    {t('onboarding.step4.subtitle')}
                  </p>

                  <div className="space-y-3">
                    {[
                      { value: 20, icon: Moon, label: t('onboarding.step4.tired'), color: '#94a3b8' },
                      { value: 40, icon: BatteryLow, label: t('onboarding.step4.low'), color: '#64748b' },
                      { value: 60, icon: BatteryMedium, label: t('onboarding.step4.okay'), color: '#4A9FD8' },
                      { value: 80, icon: BatteryFull, label: t('onboarding.step4.good'), color: '#52C9C1' },
                      { value: 100, icon: Zap, label: t('onboarding.step4.great'), color: '#5AB5E8' },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <motion.button
                          key={option.value}
                          onClick={() => selectOption('initialEnergy', option.value)}
                          className="w-full rounded-xl border-2 border-border/50 bg-card p-4 text-left transition-all hover:border-[#4A9FD8]/50 hover:bg-[#4A9FD8]/5"
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="rounded-lg p-3"
                              style={{ backgroundColor: `${option.color}15` }}
                            >
                              <Icon className="h-8 w-8" style={{ color: option.color }} />
                            </div>
                            <div className="flex-1">
                              <p style={{ fontSize: '16px', fontWeight: 500 }}>{option.label}</p>
                              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: option.color, width: `${option.value}%` }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${option.value}%` }}
                                  transition={{ delay: 0.2, duration: 0.5 }}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}