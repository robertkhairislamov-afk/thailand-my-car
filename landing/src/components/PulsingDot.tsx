import { motion } from 'motion/react';

interface PulsingDotProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PulsingDot({ 
  color = '#4A9FD8', 
  size = 'md',
  className = '' 
}: PulsingDotProps) {
  const sizes = {
    sm: { dot: 'h-2 w-2', ring: 'h-3 w-3' },
    md: { dot: 'h-3 w-3', ring: 'h-5 w-5' },
    lg: { dot: 'h-4 w-4', ring: 'h-7 w-7' },
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Pulsing ring */}
      <motion.div
        className={`absolute rounded-full ${sizes[size].ring}`}
        style={{ backgroundColor: color, opacity: 0.3 }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Center dot */}
      <div
        className={`rounded-full ${sizes[size].dot}`}
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
