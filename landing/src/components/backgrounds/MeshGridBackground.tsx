import { motion } from 'motion/react';

/**
 * Mesh Grid Background - волновая сетка
 * Тонкая анимированная сетка с волновым эффектом
 */
export function MeshGridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Базовый градиент */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4A9FD8]/3 via-transparent to-[#52C9C1]/3" />

      {/* SVG сетка с волновым эффектом */}
      <svg className="absolute inset-0 h-full w-full opacity-30">
        <defs>
          <pattern
            id="ocean-grid"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <motion.path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="rgba(74,159,216,0.15)"
              strokeWidth="0.5"
              animate={{
                strokeWidth: [0.5, 1, 0.5],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </pattern>
          
          {/* Градиент для маски */}
          <radialGradient id="grid-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Применяем паттерн с маской */}
        <rect width="100%" height="100%" fill="url(#ocean-grid)" />
        <rect width="100%" height="100%" fill="url(#grid-fade)" />
      </svg>

      {/* Волновые искажения сетки */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 30% 40%, rgba(74,159,216,0.08) 0%, transparent 50%)`,
        }}
        animate={{
          background: [
            'radial-gradient(circle at 30% 40%, rgba(74,159,216,0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 60%, rgba(82,201,193,0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 40%, rgba(74,159,216,0.08) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Плавающие точки на сетке */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`grid-dot-${i}`}
          className="absolute h-1.5 w-1.5 rounded-full bg-[#4A9FD8]/40"
          style={{
            left: `${(i * 8.33) % 100}%`,
            top: `${10 + (i * 7) % 80}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Световые волны */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`wave-${i}`}
          className="absolute left-0 h-px w-full"
          style={{
            top: `${20 + i * 30}%`,
            background: 'linear-gradient(90deg, transparent, rgba(82,201,193,0.3) 50%, transparent)',
          }}
          animate={{
            x: [-1000, 1000],
          }}
          transition={{
            duration: 15 + i * 5,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 2,
          }}
        />
      ))}

      {/* Пульсирующие узлы сетки */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`node-${i}`}
          className="absolute h-20 w-20 rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            top: `${25 + (i % 2) * 40}%`,
            background: `radial-gradient(circle, rgba(90,181,232,0.15) 0%, transparent 70%)`,
            filter: 'blur(15px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 5 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.7,
          }}
        />
      ))}

      {/* Текущий поток через сетку */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(74,159,216,0.05) 0%, transparent 30%, rgba(82,201,193,0.05) 100%)',
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
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
