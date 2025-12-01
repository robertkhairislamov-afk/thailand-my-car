import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface OceanBackgroundProps {
  variant?: 'gradient' | 'waves' | 'deep';
  showBubbles?: boolean;
  showStars?: boolean;
  children?: React.ReactNode;
}

export function OceanBackground({ 
  variant = 'gradient', 
  showBubbles = true,
  showStars = false,
  children 
}: OceanBackgroundProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark theme is active
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  const bubbles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 40 + 20,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 10,
  }));

  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 2,
  }));

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      {variant === 'gradient' && (
        <div 
          className={`absolute inset-0 ${
            isDark 
              ? 'bg-gradient-to-b from-[#0d1b2a] via-[#1b3a52] to-[#2C4A5F]' 
              : 'bg-gradient-to-b from-[#4A9FD8] via-[#5AB5E8] to-[#52C9C1]'
          }`}
        />
      )}

      {variant === 'waves' && (
        <div className={`absolute inset-0 ${isDark ? 'bg-[#0d1b2a]' : 'bg-[#5AB5E8]'}`}>
          {/* Animated waves */}
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <motion.path
              fill={isDark ? '#1b3a52' : '#4A9FD8'}
              fillOpacity="0.3"
              d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              animate={{
                d: [
                  "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,165.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.path
              fill={isDark ? '#2C4A5F' : '#52C9C1'}
              fillOpacity="0.5"
              d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,144C672,139,768,149,864,165.3C960,181,1056,203,1152,192C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              animate={{
                d: [
                  "M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,144C672,139,768,149,864,165.3C960,181,1056,203,1152,192C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,128L48,128C96,128,192,128,288,149.3C384,171,480,213,576,213.3C672,213,768,171,864,154.7C960,139,1056,149,1152,149.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,144C672,139,768,149,864,165.3C960,181,1056,203,1152,192C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </svg>
        </div>
      )}

      {variant === 'deep' && (
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-b from-[#0d1b2a] to-[#1b3a52]' 
            : 'bg-gradient-to-b from-[#2C7DA0] to-[#4A9FD8]'
        }`} />
      )}

      {/* Light rays effect */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-0 h-full w-1 origin-top bg-gradient-to-b from-white/20 to-transparent"
            style={{
              transform: `translateX(-50%) rotate(${-30 + i * 12}deg)`,
            }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Bubbles */}
      {showBubbles && (
        <div className="absolute inset-0 overflow-hidden">
          {bubbles.map((bubble) => (
            <motion.div
              key={bubble.id}
              className={`absolute rounded-full ${
                isDark ? 'bg-white/10' : 'bg-white/20'
              }`}
              style={{
                width: bubble.size,
                height: bubble.size,
                left: `${bubble.left}%`,
                bottom: '-50px',
                backdropFilter: 'blur(2px)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)'}`,
              }}
              animate={{
                y: [0, -window.innerHeight - 100],
                x: [0, Math.sin(bubble.id) * 50],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: bubble.duration,
                repeat: Infinity,
                delay: bubble.delay,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}

      {/* Stars for dark theme */}
      {showStars && isDark && (
        <div className="absolute inset-0 overflow-hidden">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                width: star.size,
                height: star.size,
                left: `${star.left}%`,
                top: `${star.top}%`,
                boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.5)`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Content overlay with backdrop blur */}
      <div className="relative z-10 backdrop-blur-[1px]">
        {children}
      </div>
    </div>
  );
}
