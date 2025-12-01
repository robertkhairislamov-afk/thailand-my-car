import { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { RippleButton } from './RippleButton';
import { useLanguage } from './LanguageContext';
import { AnimatedOceanCard } from './AnimatedOceanCard';

interface ReviewScreenProps {
  onComplete?: () => void;
}

export function ReviewScreen({ onComplete }: ReviewScreenProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<'questions' | 'results'>('questions');
  const [goodThings, setGoodThings] = useState('');
  const [missedThings, setMissedThings] = useState('');
  const [endEnergy, setEndEnergy] = useState<number>(60);

  const energyLevels = [
    { value: 20, emoji: '😴' },
    { value: 40, emoji: '😐' },
    { value: 60, emoji: '🙂' },
    { value: 80, emoji: '😄' },
    { value: 100, emoji: '🚀' },
  ];

  const handleSubmit = () => {
    // В реальном приложении здесь будет запрос к API
    setStep('results');
  };

  if (step === 'results') {
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="rounded-full bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1] p-6">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2
            className="mb-2 bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] bg-clip-text text-transparent"
            style={{ fontSize: '28px', fontWeight: 700 }}
          >
            {t('review.complete')}
          </h2>
          <p className="text-muted-foreground" style={{ fontSize: '16px' }}>
            {t('review.completeSubtitle')}
          </p>
        </motion.div>

        {/* AI Summary */}
        <AnimatedOceanCard delay={0.3}>
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-[#4A9FD8]/10 p-2">
                <Brain className="h-5 w-5 text-[#4A9FD8]" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
                {t('review.daySummary')}
              </h3>
            </div>
            <div className="space-y-3 text-muted-foreground" style={{ fontSize: '14px' }}>
              <p>• {t('review.summaryPoint1')}</p>
              <p>• {t('review.summaryPoint2')}</p>
              <p>• {t('review.summaryPoint3')}</p>
            </div>
          </div>
        </AnimatedOceanCard>

        {/* AI Recommendations */}
        <AnimatedOceanCard delay={0.4}>
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <motion.div
                className="rounded-lg bg-[#FFD93D]/10 p-2"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Lightbulb className="h-5 w-5 text-[#FFD93D]" />
              </motion.div>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
                {t('review.tomorrowTips')}
              </h3>
            </div>
            <div className="space-y-3 text-muted-foreground" style={{ fontSize: '14px' }}>
              <p>• {t('review.tip1')}</p>
              <p>• {t('review.tip2')}</p>
            </div>
          </div>
        </AnimatedOceanCard>

        {/* Action Button */}
        <RippleButton
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white hover:opacity-90"
          style={{ fontSize: '16px', fontWeight: 600 }}
        >
          {t('review.planTomorrow')}
        </RippleButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2
          className="mb-2 bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] bg-clip-text text-transparent"
          style={{ fontSize: '28px', fontWeight: 700 }}
        >
          {t('review.title')}
        </h2>
        <p className="text-muted-foreground" style={{ fontSize: '16px' }}>
          {t('review.subtitle')}
        </p>
      </div>

      {/* Question 1 */}
      <AnimatedOceanCard delay={0.1}>
        <div className="p-6">
          <label className="mb-3 block" style={{ fontSize: '16px', fontWeight: 600 }}>
            {t('review.question1')}
          </label>
          <Textarea
            value={goodThings}
            onChange={(e) => setGoodThings(e.target.value)}
            placeholder={t('review.question1Placeholder')}
            className="min-h-[100px] resize-none border-[#4A9FD8]/30 focus-visible:ring-[#4A9FD8]"
          />
        </div>
      </AnimatedOceanCard>

      {/* Question 2 */}
      <AnimatedOceanCard delay={0.15}>
        <div className="p-6">
          <label className="mb-3 block" style={{ fontSize: '16px', fontWeight: 600 }}>
            {t('review.question2')}
          </label>
          <Textarea
            value={missedThings}
            onChange={(e) => setMissedThings(e.target.value)}
            placeholder={t('review.question2Placeholder')}
            className="min-h-[100px] resize-none border-[#4A9FD8]/30 focus-visible:ring-[#4A9FD8]"
          />
        </div>
      </AnimatedOceanCard>

      {/* Question 3: Energy */}
      <AnimatedOceanCard delay={0.2}>
        <div className="p-6">
          <label className="mb-4 block" style={{ fontSize: '16px', fontWeight: 600 }}>
            {t('review.question3')}
          </label>
          <div className="flex justify-between gap-2">
            {energyLevels.map((level) => (
              <motion.button
                key={level.value}
                onClick={() => setEndEnergy(level.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  endEnergy === level.value
                    ? 'border-[#4A9FD8] bg-[#4A9FD8]/10'
                    : 'border-border/50 hover:border-[#4A9FD8]/50 hover:bg-[#4A9FD8]/5'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span style={{ fontSize: '32px' }}>{level.emoji}</span>
                <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                  {level.value}%
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </AnimatedOceanCard>

      {/* Submit Button */}
      <RippleButton
        onClick={handleSubmit}
        disabled={!goodThings.trim() || !missedThings.trim()}
        className="w-full bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white hover:opacity-90 disabled:opacity-50"
        style={{ fontSize: '16px', fontWeight: 600 }}
      >
        {t('review.completeDay')}
      </RippleButton>
    </div>
  );
}
