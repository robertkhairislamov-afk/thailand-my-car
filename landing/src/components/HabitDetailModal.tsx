import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { RippleButton } from './RippleButton';
import { useLanguage } from './LanguageContext';

interface HabitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitName: string;
  currentDay: number;
  completedDays: number[];
  onMarkDone: () => void;
}

export function HabitDetailModal({
  isOpen,
  onClose,
  habitName,
  currentDay,
  completedDays,
  onMarkDone,
}: HabitDetailModalProps) {
  const { t } = useLanguage();

  const missedDays = currentDay - completedDays.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 z-[70] mx-auto max-w-lg -translate-y-1/2 overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-lg"
          >
            {/* Header */}
            <div className="border-b border-border/50 bg-gradient-to-r from-[#4A9FD8]/10 to-[#52C9C1]/10 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 700 }}>
                    {t('habit.detailTitle')}
                  </h2>
                  <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
                    {habitName} · {t('habit.day')} {currentDay} {t('habit.of')} 40
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {/* 40-day grid (8x5) */}
              <div className="mb-6">
                <p className="mb-3 text-muted-foreground" style={{ fontSize: '12px' }}>
                  {t('habit.progressGrid')}
                </p>
                <div className="grid grid-cols-8 gap-2">
                  {[...Array(40)].map((_, i) => {
                    const dayNum = i + 1;
                    const isCompleted = completedDays.includes(dayNum);
                    const isCurrent = dayNum === currentDay;
                    const isFuture = dayNum > currentDay;

                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.01 }}
                        className="relative flex aspect-square items-center justify-center"
                      >
                        <div
                          className={`flex h-full w-full items-center justify-center rounded-lg transition-all ${
                            isCompleted
                              ? 'bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1] shadow-md'
                              : isCurrent
                              ? 'border-2 border-[#4A9FD8] bg-transparent ring-2 ring-[#4A9FD8]/20'
                              : isFuture
                              ? 'border border-border/30 bg-muted/20'
                              : 'border border-red-500/30 bg-red-500/5'
                          }`}
                        >
                          <span
                            className={`${
                              isCompleted
                                ? 'text-white'
                                : isCurrent
                                ? 'text-[#4A9FD8] font-semibold'
                                : isFuture
                                ? 'text-muted-foreground/40'
                                : 'text-red-500/50'
                            }`}
                            style={{ fontSize: '10px' }}
                          >
                            {dayNum}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="mb-6 grid grid-cols-3 gap-2 rounded-lg bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1]" />
                  <span style={{ fontSize: '11px' }} className="text-muted-foreground">
                    {t('habit.completed')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm border-2 border-[#4A9FD8]" />
                  <span style={{ fontSize: '11px' }} className="text-muted-foreground">
                    {t('habit.today')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm border border-red-500/30 bg-red-500/10" />
                  <span style={{ fontSize: '11px' }} className="text-muted-foreground">
                    {t('habit.missed')}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-[#4A9FD8]/10 p-3 text-center">
                  <p style={{ fontSize: '20px', fontWeight: 700 }}>
                    {completedDays.length}
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                    {t('habit.done')}
                  </p>
                </div>
                <div className="rounded-lg bg-[#52C9C1]/10 p-3 text-center">
                  <p style={{ fontSize: '20px', fontWeight: 700 }}>
                    {Math.max(0, missedDays)}
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                    {t('habit.skipped')}
                  </p>
                </div>
                <div className="rounded-lg bg-[#FFD93D]/10 p-3 text-center">
                  <p style={{ fontSize: '20px', fontWeight: 700 }}>
                    {Math.round((completedDays.length / currentDay) * 100)}%
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                    {t('habit.rate')}
                  </p>
                </div>
              </div>

              {/* Motivational message */}
              <div className="mb-6 rounded-lg border border-[#4A9FD8]/20 bg-[#4A9FD8]/5 p-4">
                <p className="text-center" style={{ fontSize: '13px' }}>
                  {missedDays > 0
                    ? t('habit.motivationMissed').replace('{count}', missedDays.toString())
                    : t('habit.motivationGreat')}
                </p>
              </div>

              {/* Action button */}
              <RippleButton
                onClick={() => {
                  onMarkDone();
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white hover:opacity-90"
                style={{ fontSize: '16px', fontWeight: 600 }}
              >
                {t('habit.markDone')}
              </RippleButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
