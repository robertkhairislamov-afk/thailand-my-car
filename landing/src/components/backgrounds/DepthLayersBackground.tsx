import { motion } from 'motion/react';

/**
 * Depth Layers Background - слои глубины океана
 * Параллакс-эффект с несколькими слоями разной глубины
 */
export function DepthLayersBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Самый дальний слой - темный глубокий океан */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-[#2A5F88]/5 via-[#3A7FA8]/8 to-[#2A8F88]/10"
        animate={{
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Второй слой - средняя глубина */}
      <div className="absolute inset-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`layer2-${i}`}
            className="absolute h-64 w-full"
            style={{
              top: `${i * 25}%`,
              background: `linear-gradient(90deg, transparent, rgba(74,159,216,0.06) 50%, transparent)`,
            }}
            animate={{
              x: [-100, 100],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Третий слой - плавающие силуэты */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`silhouette-${i}`}
          className="absolute rounded-full opacity-30"
          style={{
            width: `${40 + i * 15}px`,
            height: `${20 + i * 8}px`,
            left: `${10 + i * 15}%`,
            top: `${15 + i * 12}%`,
            background: `radial-gradient(ellipse, rgba(82,201,193,0.15), transparent)`,
            filter: 'blur(8px)',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.8,
          }}
        />
      ))}

      {/* Четвертый слой - крупные светящиеся области */}
      <motion.div
        className="absolute left-0 top-1/4 h-96 w-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(90,181,232,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: [-50, 50],
          y: [0, 40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(82,201,193,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: [50, -50],
          y: [0, -40, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Передний слой - быстрые частицы планктона */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`plankton-${i}`}
          className="absolute h-1 w-1 rounded-full bg-[#5AB5E8]/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, -30 - Math.random() * 20],
            y: [0, Math.random() * 40 - 20],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Световые лучи с глубины */}
      <div className="absolute inset-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`ray-${i}`}
            className="absolute left-1/2 top-0 h-full w-px origin-top bg-gradient-to-b from-[#4A9FD8]/20 via-[#4A9FD8]/10 to-transparent"
            style={{
              transform: `translateX(-50%) rotate(${-10 + i * 10}deg)`,
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scaleY: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
