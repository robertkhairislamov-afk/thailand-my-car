import { motion } from 'motion/react';
import { Flame, ArrowDown } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface StreakBadgeProps {
  streak: number;
  type?: 'tasks' | 'energy' | 'general';
}

export function StreakBadge({ streak, type = 'tasks' }: StreakBadgeProps) {
  const { t } = useLanguage();

  if (streak === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 rounded-full border border-[#4A9FD8]/20 bg-[#4A9FD8]/5 px-3 py-1.5"
      >
        <span className="text-muted-foreground" style={{ fontSize: '13px' }}>
          {t('streak.start')}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FFD93D]/20 to-[#FF6B6B]/20 px-3 py-1.5 shadow-sm"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      >
        <Flame className="h-4 w-4 text-[#FF6B6B]" fill="#FF6B6B" />
      </motion.div>
      <span style={{ fontSize: '13px', fontWeight: 600 }}>
        {streak} {t('streak.days')}
      </span>
    </motion.div>
  );
}