import { motion } from 'motion/react';

interface OceanDividerProps {
  variant?: 'wave' | 'dots' | 'gradient' | 'simple';
  className?: string;
}

export function OceanDivider({ variant = 'gradient', className = '' }: OceanDividerProps) {
  if (variant === 'wave') {
    return (
      <div className={`relative h-12 overflow-hidden ${className}`}>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,30 Q300,10 600,30 T1200,30 L1200,60 L0,60 Z"
            fill="url(#ocean-gradient)"
            initial={{ d: "M0,30 Q300,10 600,30 T1200,30 L1200,60 L0,60 Z" }}
            animate={{
              d: [
                "M0,30 Q300,10 600,30 T1200,30 L1200,60 L0,60 Z",
                "M0,30 Q300,50 600,30 T1200,30 L1200,60 L0,60 Z",
                "M0,30 Q300,10 600,30 T1200,30 L1200,60 L0,60 Z",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <defs>
            <linearGradient id="ocean-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4A9FD8" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#52C9C1" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#5AB5E8" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center gap-2 py-4 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1]"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div className={`relative h-px overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4A9FD8]/30 to-transparent" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#4A9FD8] via-[#52C9C1] to-[#5AB5E8]"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    );
  }

  // Simple variant
  return (
    <div className={`h-px bg-gradient-to-r from-transparent via-border to-transparent ${className}`} />
  );
}
