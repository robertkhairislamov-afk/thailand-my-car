import { motion } from 'motion/react';

/**
 * Minimal Background - минималистичный дизайн
 * Чистый и простой фон с тонкими акцентами
 */
export function MinimalBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Очень тонкий градиент */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4A9FD8]/2 via-transparent to-[#52C9C1]/2" />

      {/* Одна тонкая волна внизу */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{ height: '120px' }}
      >
        <motion.path
          fill="rgba(74,159,216,0.03)"
          d="M0,64L120,69.3C240,75,480,85,720,80C960,75,1200,53,1320,42.7L1440,32L1440,120L1320,120C1200,120,960,120,720,120C480,120,240,120,120,120L0,120Z"
          animate={{
            d: [
              "M0,64L120,69.3C240,75,480,85,720,80C960,75,1200,53,1320,42.7L1440,32L1440,120L1320,120C1200,120,960,120,720,120C480,120,240,120,120,120L0,120Z",
              "M0,32L120,42.7C240,53,480,75,720,80C960,85,1200,75,1320,69.3L1440,64L1440,120L1320,120C1200,120,960,120,720,120C480,120,240,120,120,120L0,120Z",
              "M0,64L120,69.3C240,75,480,85,720,80C960,75,1200,53,1320,42.7L1440,32L1440,120L1320,120C1200,120,960,120,720,120C480,120,240,120,120,120L0,120Z",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>

      {/* Минимальные световые акценты */}
      <motion.div
        className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(74,159,216,0.04) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(82,201,193,0.04) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* Несколько нежных пузырьков */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={`bubble-${i}`}
          className="absolute h-1 w-1 rounded-full bg-[#4A9FD8]/20"
          style={{
            left: `${20 + i * 25}%`,
            bottom: '-10px',
          }}
          animate={{
            y: [0, -window.innerHeight - 50],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 15 + i * 3,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 2,
          }}
        />
      ))}

      {/* Одна тонкая линия горизонта */}
      <motion.div
        className="absolute left-0 top-1/2 h-px w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(74,159,216,0.1) 50%, transparent)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
