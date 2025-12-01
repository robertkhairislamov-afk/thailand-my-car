import { motion } from 'motion/react';

/**
 * Caustics Background - солнечные лучи через воду
 * Эффект преломления света, создающий танцующие узоры
 */
export function CausticsBackground() {
  const causticPatterns = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 0.5,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Базовый градиент */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4A9FD8]/5 via-transparent to-[#52C9C1]/5" />
      
      {/* Caustics patterns */}
      <div className="absolute inset-0">
        {causticPatterns.map((pattern) => (
          <motion.div
            key={pattern.id}
            className="absolute h-full w-full"
            style={{
              background: `radial-gradient(ellipse at ${20 + pattern.id * 12}% ${30 + pattern.id * 8}%, rgba(74,159,216,0.08) 0%, transparent 50%)`,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 4 + pattern.id * 0.5,
              repeat: Infinity,
              delay: pattern.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Световые пятна */}
      <motion.div
        className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-[#5AB5E8]/10 to-transparent"
        style={{ filter: 'blur(60px)' }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-[#52C9C1]/10 to-transparent"
        style={{ filter: 'blur(70px)' }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* Плавающие частицы света */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-[#4A9FD8]/30"
          style={{
            left: `${10 + i * 7}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
