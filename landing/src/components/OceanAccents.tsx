import { motion } from 'motion/react';

interface OceanAccentsProps {
  variant?: 'subtle' | 'medium' | 'vibrant';
  showRipples?: boolean;
  showGradientOrbs?: boolean;
  className?: string;
}

export function OceanAccents({ 
  variant = 'subtle',
  showRipples = true,
  showGradientOrbs = true,
  className = ''
}: OceanAccentsProps) {
  
  const opacities = {
    subtle: 0.03,
    medium: 0.05,
    vibrant: 0.08,
  };

  const ripples = Array.from({ length: 3 }, (_, i) => ({
    id: i,
    delay: i * 2,
  }));

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Gradient orbs */}
      {showGradientOrbs && (
        <>
          <motion.div
            className="absolute left-0 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1]"
            style={{
              opacity: opacities[variant],
              filter: 'blur(80px)',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          <motion.div
            className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-gradient-to-br from-[#52C9C1] to-[#5AB5E8]"
            style={{
              opacity: opacities[variant],
              filter: 'blur(80px)',
              transform: 'translate(40%, -30%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />

          <motion.div
            className="absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-[#5AB5E8] to-[#4A9FD8]"
            style={{
              opacity: opacities[variant],
              filter: 'blur(90px)',
              transform: 'translate(-50%, 40%)',
            }}
            animate={{
              scale: [1, 1.15, 1],
              x: [0, -40, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
        </>
      )}



      {/* Light beams */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-0 h-full w-0.5 origin-top bg-gradient-to-b from-[#4A9FD8]/30 to-transparent"
            style={{
              transform: `translateX(-50%) rotate(${-20 + i * 13}deg)`,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
