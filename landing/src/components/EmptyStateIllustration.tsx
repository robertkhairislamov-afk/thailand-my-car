import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Zap, 
  Target, 
  Calendar,
  Inbox,
  ListTodo,
  Waves,
  Sparkles
} from 'lucide-react';
import { RippleButton } from './RippleButton';

interface EmptyStateIllustrationProps {
  type: 'tasks' | 'energy' | 'habits' | 'review' | 'inbox';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyStateIllustration({
  type,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateIllustrationProps) {
  // Icon selection based on type
  const illustrations = {
    tasks: {
      icon: ListTodo,
      colors: ['#4A9FD8', '#52C9C1'],
      decorations: [CheckCircle2, Sparkles],
    },
    energy: {
      icon: Zap,
      colors: ['#52C9C1', '#5AB5E8'],
      decorations: [Waves, Target],
    },
    habits: {
      icon: Target,
      colors: ['#5AB5E8', '#4A9FD8'],
      decorations: [Calendar, CheckCircle2],
    },
    review: {
      icon: Calendar,
      colors: ['#4A9FD8', '#52C9C1'],
      decorations: [CheckCircle2, Zap],
    },
    inbox: {
      icon: Inbox,
      colors: ['#52C9C1', '#5AB5E8'],
      decorations: [Waves, Sparkles],
    },
  };

  const { icon: MainIcon, colors, decorations } = illustrations[type];
  const [Deco1, Deco2] = decorations;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* Illustration Container */}
      <div className="relative mb-6">
        {/* Background Glow */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-20 blur-3xl"
          style={{
            background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Main Icon Circle */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="relative rounded-full p-8"
          style={{
            background: `linear-gradient(135deg, ${colors[0]}15, ${colors[1]}15)`,
          }}
        >
          <MainIcon 
            className="h-16 w-16" 
            style={{ color: colors[0] }}
            strokeWidth={1.5}
          />

          {/* Floating Decoration 1 */}
          <motion.div
            className="absolute -right-2 -top-2 rounded-full p-2"
            style={{ backgroundColor: `${colors[1]}20` }}
            animate={{
              y: [0, -10, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.3,
            }}
          >
            <Deco1 className="h-5 w-5" style={{ color: colors[1] }} />
          </motion.div>

          {/* Floating Decoration 2 */}
          <motion.div
            className="absolute -bottom-2 -left-2 rounded-full p-2"
            style={{ backgroundColor: `${colors[0]}20` }}
            animate={{
              y: [0, 10, 0],
              rotate: [0, -10, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 0.5,
            }}
          >
            <Deco2 className="h-5 w-5" style={{ color: colors[0] }} />
          </motion.div>

          {/* Orbiting Dots */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{
                backgroundColor: colors[i % 2],
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, Math.cos((i * 120 * Math.PI) / 180) * 60],
                y: [0, Math.sin((i * 120 * Math.PI) / 180) * 60],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-2"
        style={{ fontSize: '18px', fontWeight: 600 }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6 max-w-sm text-muted-foreground"
        style={{ fontSize: '14px' }}
      >
        {description}
      </motion.p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <RippleButton
            onClick={onAction}
            className="bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white"
          >
            {actionLabel}
          </RippleButton>
        </motion.div>
      )}
    </div>
  );
}
