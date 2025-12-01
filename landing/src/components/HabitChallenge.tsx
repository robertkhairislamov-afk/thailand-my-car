import { useState } from 'react';
import { motion } from 'motion/react';
import { Target, Zap, CheckCircle2, Edit3, Calendar, Flame, Trophy, Clock, Timer, Sparkles } from 'lucide-react';
import { Card } from './ui/card';
import { RippleButton } from './RippleButton';
import { useLanguage } from './LanguageContext';
import { AnimatedOceanCard } from './AnimatedOceanCard';
import { HabitDetailModal } from './HabitDetailModal';

type HabitType = 'focus' | 'energy' | 'task' | 'custom';

interface HabitChallengeProps {
  // Можно добавить пропсы для управления состоянием из родителя
}

export function HabitChallenge({}: HabitChallengeProps) {
  const { t } = useLanguage();
  
  // Состояние: null = не выбрана, 'progress' = в процессе, 'completed' = завершена
  const [habitState, setHabitState] = useState<'none' | 'progress' | 'completed'>('none');
  const [selectedHabit, setSelectedHabit] = useState<HabitType | null>(null);
  const [currentDay, setCurrentDay] = useState(7); // для демо
  const [completedDays, setCompletedDays] = useState([1, 2, 3, 4, 5, 6, 7]); // для демо
  const [streak, setStreak] = useState(3);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const habitOptions = [
    { id: 'focus' as HabitType, icon: Target, label: t('habit.focusSession'), emoji: '⏱' },
    { id: 'energy' as HabitType, icon: Zap, label: t('habit.trackEnergy'), emoji: '⚡' },
    { id: 'task' as HabitType, icon: CheckCircle2, label: t('habit.oneTask'), emoji: '✅' },
    { id: 'custom' as HabitType, icon: Edit3, label: t('habit.custom'), emoji: '➕' },
  ];

  const handleStartChallenge = (habitId: HabitType) => {
    setSelectedHabit(habitId);
    setHabitState('progress');
    setCurrentDay(1);
    setCompletedDays([]);
    setStreak(0);
  };

  const handleMarkDone = () => {
    if (currentDay < 40) {
      setCompletedDays([...completedDays, currentDay]);
      setCurrentDay(currentDay + 1);
      setStreak(streak + 1);
      
      if (currentDay === 39) {
        setHabitState('completed');
      }
    }
  };

  const handleNewChallenge = () => {
    setHabitState('none');
    setSelectedHabit(null);
    setCurrentDay(0);
    setCompletedDays([]);
    setStreak(0);
  };

  const getHabitLabel = () => {
    const habit = habitOptions.find(h => h.id === selectedHabit);
    return habit?.label || '';
  };

  // Состояние 1: Привычка не выбрана
  if (habitState === 'none') {
    return (
      <AnimatedOceanCard delay={0.3}>
        <div className="p-6">
          {/* Заголовок */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="mb-2" style={{ fontSize: '20px', fontWeight: 600 }}>
                {t('habit.title')}
              </h3>
              <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
                {t('habit.subtitle')}
              </p>
            </div>
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Calendar className="h-8 w-8 text-[#4A9FD8]" />
            </motion.div>
          </div>

          {/* Выбор привычки */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            {habitOptions.map((habit) => {
              const Icon = habit.icon;
              return (
                <motion.button
                  key={habit.id}
                  onClick={() => handleStartChallenge(habit.id)}
                  className="rounded-xl border-2 border-border/50 bg-card p-3 text-left transition-all hover:border-[#4A9FD8]/50 hover:bg-[#4A9FD8]/5"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="rounded-lg bg-[#4A9FD8]/10 p-1.5">
                      <Icon className="h-4 w-4 text-[#4A9FD8]" />
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 500 }}>
                    {habit.label}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Визуальный индикатор */}
          <div className="mb-4 flex justify-center gap-1">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-border"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
              />
            ))}
            <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
              ... 40
            </span>
          </div>

          {/* Кнопка (неактивна, так как нужно выбрать привычку) */}
          <p className="text-center text-muted-foreground" style={{ fontSize: '13px' }}>
            {t('habit.chooseToStart')}
          </p>
        </div>
      </AnimatedOceanCard>
    );
  }

  // Состояние 3: Привычка завершена
  if (habitState === 'completed') {
    return (
      <AnimatedOceanCard delay={0.3}>
        <div className="p-6 text-center">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mb-4 flex justify-center"
          >
            <div className="relative rounded-full bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1] p-4">
              <Trophy className="h-10 w-10 text-white" />
              <motion.div
                className="absolute -right-1 -top-1"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              >
                <Sparkles className="h-5 w-5 text-[#FFD93D]" fill="#FFD93D" />
              </motion.div>
            </div>
          </motion.div>

          <h3 className="mb-2" style={{ fontSize: '24px', fontWeight: 700 }}>
            {t('habit.completed')}
          </h3>
          <p className="mb-4 text-muted-foreground" style={{ fontSize: '14px' }}>
            {t('habit.completedSubtitle')}
          </p>

          {/* Badge */}
          <div className="mb-6">
            <div className="mx-auto inline-block rounded-full bg-gradient-to-r from-[#4A9FD8]/20 to-[#52C9C1]/20 px-6 py-3">
              <p style={{ fontSize: '28px', fontWeight: 700 }}>
                40 / 40 {t('habit.days')}
              </p>
            </div>
          </div>

          <p className="mb-6 text-muted-foreground" style={{ fontSize: '13px' }}>
            {t('habit.completedDescription')}
          </p>

          {/* Buttons */}
          <div className="space-y-2">
            <RippleButton
              onClick={handleNewChallenge}
              className="w-full bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white hover:opacity-90"
            >
              {t('habit.newChallenge')}
            </RippleButton>
            <RippleButton
              variant="outline"
              onClick={() => setHabitState('none')}
              className="w-full border-[#4A9FD8]/30"
            >
              {t('habit.continueWithout')}
            </RippleButton>
          </div>
        </div>
      </AnimatedOceanCard>
    );
  }

  // Состояние 2: Привычка в процессе
  return (
    <>
      <AnimatedOceanCard 
        delay={0.3}
        onClick={() => setShowDetailModal(true)}
        className="cursor-pointer transition-all hover:scale-[1.01]"
      >
        <div className="p-6">
          {/* Заголовок */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h3 className="mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>
                {t('habit.habitTitle')}: {getHabitLabel()}
              </h3>
              <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
                {t('habit.day')} {currentDay} {t('habit.of')} 40
              </p>
            </div>
            <div className="rounded-full bg-[#4A9FD8]/10 p-2">
              <Calendar className="h-5 w-5 text-[#4A9FD8]" />
            </div>
          </div>

          {/* Прогресс - горизонтальная лента */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                {t('habit.progress')}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>
                {completedDays.length}/40
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[...Array(14)].map((_, i) => {
                const dayNum = i + 1;
                const isCompleted = completedDays.includes(dayNum);
                const isCurrent = dayNum === currentDay;
                
                return (
                  <motion.div
                    key={i}
                    className={`h-3 w-3 rounded-full ${
                      isCompleted
                        ? 'bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1]'
                        : isCurrent
                        ? 'border-2 border-[#4A9FD8] bg-transparent'
                        : 'bg-border'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                  />
                );
              })}
              <span className="text-muted-foreground" style={{ fontSize: '10px' }}>
                +{40 - 14}
              </span>
            </div>
          </div>

          {/* Серия */}
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#FFD93D]/10 p-3">
            <Flame className="h-4 w-4 text-[#FFD93D]" fill="#FFD93D" />
            <p style={{ fontSize: '13px', fontWeight: 500 }}>
              {t('habit.streak')}: {streak} {t('habit.daysInRow')}
            </p>
          </div>

          {/* Мотивационный текст */}
          <p className="mb-4 text-center text-muted-foreground" style={{ fontSize: '13px' }}>
            {t('habit.motivation')}
          </p>

          {/* Кнопка */}
          <RippleButton
            onClick={(e) => {
              e.stopPropagation();
              handleMarkDone();
            }}
            className="w-full bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white hover:opacity-90"
          >
            {t('habit.markDone')}
          </RippleButton>
        </div>
      </AnimatedOceanCard>

      {/* Detail Modal */}
      <HabitDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        habitName={getHabitLabel()}
        currentDay={currentDay}
        completedDays={completedDays}
        onMarkDone={handleMarkDone}
      />
    </>
  );
}