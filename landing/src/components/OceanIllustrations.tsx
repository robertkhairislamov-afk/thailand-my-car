import { motion } from 'motion/react';

export function JellyfishIllustration({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{
        y: [0, -10, 0],
        x: [0, 5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Jellyfish bell */}
      <motion.ellipse
        cx="50"
        cy="30"
        rx="25"
        ry="20"
        fill="url(#jellyfishGradient)"
        opacity="0.7"
        animate={{
          ry: [20, 22, 20],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Tentacles */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.path
          key={i}
          d={`M ${35 + i * 7} 48 Q ${35 + i * 7 + (i % 2 ? 3 : -3)} 70, ${35 + i * 7} 90`}
          stroke="url(#tentacleGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
          animate={{
            d: [
              `M ${35 + i * 7} 48 Q ${35 + i * 7 + (i % 2 ? 3 : -3)} 70, ${35 + i * 7} 90`,
              `M ${35 + i * 7} 48 Q ${35 + i * 7 + (i % 2 ? -3 : 3)} 70, ${35 + i * 7} 90`,
              `M ${35 + i * 7} 48 Q ${35 + i * 7 + (i % 2 ? 3 : -3)} 70, ${35 + i * 7} 90`,
            ],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Glow effect */}
      <motion.ellipse
        cx="50"
        cy="28"
        rx="20"
        ry="15"
        fill="white"
        opacity="0.3"
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <defs>
        <linearGradient id="jellyfishGradient" x1="50" y1="10" x2="50" y2="50">
          <stop offset="0%" stopColor="#4A9FD8" />
          <stop offset="100%" stopColor="#52C9C1" />
        </linearGradient>
        <linearGradient id="tentacleGradient" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%" stopColor="#4A9FD8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#52C9C1" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

export function WaveIllustration({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M0 30 Q 25 10, 50 30 T 100 30 T 150 30 T 200 30"
        stroke="url(#waveGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
        animate={{
          d: [
            'M0 30 Q 25 10, 50 30 T 100 30 T 150 30 T 200 30',
            'M0 30 Q 25 45, 50 30 T 100 30 T 150 30 T 200 30',
            'M0 30 Q 25 10, 50 30 T 100 30 T 150 30 T 200 30',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.path
        d="M0 40 Q 25 20, 50 40 T 100 40 T 150 40 T 200 40"
        stroke="url(#waveGradient2)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.4"
        animate={{
          d: [
            'M0 40 Q 25 20, 50 40 T 100 40 T 150 40 T 200 40',
            'M0 40 Q 25 52, 50 40 T 100 40 T 150 40 T 200 40',
            'M0 40 Q 25 20, 50 40 T 100 40 T 150 40 T 200 40',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <defs>
        <linearGradient id="waveGradient" x1="0" y1="0" x2="200" y2="0">
          <stop offset="0%" stopColor="#4A9FD8" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#5AB5E8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#52C9C1" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="waveGradient2" x1="0" y1="0" x2="200" y2="0">
          <stop offset="0%" stopColor="#52C9C1" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#4ECDC4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#4A9FD8" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

export function FishIllustration({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 60 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{
        x: [-20, 20, -20],
        scaleX: [1, -1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {/* Fish body */}
      <ellipse
        cx="25"
        cy="20"
        rx="15"
        ry="10"
        fill="url(#fishGradient)"
        opacity="0.7"
      />
      
      {/* Fish tail */}
      <motion.path
        d="M 10 20 L 0 10 L 5 20 L 0 30 Z"
        fill="url(#fishGradient)"
        opacity="0.7"
        animate={{
          d: [
            'M 10 20 L 0 10 L 5 20 L 0 30 Z',
            'M 10 20 L 2 12 L 5 20 L 2 28 Z',
            'M 10 20 L 0 10 L 5 20 L 0 30 Z',
          ],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Fish eye */}
      <circle cx="32" cy="17" r="2" fill="white" opacity="0.9" />
      
      <defs>
        <linearGradient id="fishGradient" x1="0" y1="20" x2="40" y2="20">
          <stop offset="0%" stopColor="#5AB5E8" />
          <stop offset="100%" stopColor="#4A9FD8" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

export function BubbleGroup({ className = '' }: { className?: string }) {
  const bubbles = [
    { cx: 20, cy: 60, r: 8, delay: 0 },
    { cx: 40, cy: 70, r: 6, delay: 0.3 },
    { cx: 60, cy: 65, r: 10, delay: 0.6 },
    { cx: 80, cy: 75, r: 7, delay: 0.9 },
  ];

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {bubbles.map((bubble, i) => (
        <motion.g key={i}>
          <motion.circle
            cx={bubble.cx}
            cy={bubble.cy}
            r={bubble.r}
            fill="white"
            opacity="0.2"
            animate={{
              cy: [bubble.cy, bubble.cy - 50],
              opacity: [0.2, 0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: bubble.delay,
              ease: 'easeOut',
            }}
          />
          <motion.circle
            cx={bubble.cx}
            cy={bubble.cy}
            r={bubble.r * 0.6}
            fill="white"
            opacity="0.4"
            animate={{
              cy: [bubble.cy, bubble.cy - 50],
              opacity: [0.4, 0.7, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: bubble.delay,
              ease: 'easeOut',
            }}
          />
        </motion.g>
      ))}
    </svg>
  );
}

export function CoralIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Coral branches */}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M ${35 + i * 15} 100 Q ${35 + i * 15} 70, ${25 + i * 20} 50 Q ${20 + i * 20} 30, ${30 + i * 15} 20`}
          stroke="url(#coralGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
          animate={{
            d: [
              `M ${35 + i * 15} 100 Q ${35 + i * 15} 70, ${25 + i * 20} 50 Q ${20 + i * 20} 30, ${30 + i * 15} 20`,
              `M ${35 + i * 15} 100 Q ${35 + i * 15} 70, ${28 + i * 20} 50 Q ${23 + i * 20} 30, ${33 + i * 15} 20`,
              `M ${35 + i * 15} 100 Q ${35 + i * 15} 70, ${25 + i * 20} 50 Q ${20 + i * 20} 30, ${30 + i * 15} 20`,
            ],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      <defs>
        <linearGradient id="coralGradient" x1="50" y1="100" x2="50" y2="0">
          <stop offset="0%" stopColor="#FF6B9D" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFD93D" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  );
}
