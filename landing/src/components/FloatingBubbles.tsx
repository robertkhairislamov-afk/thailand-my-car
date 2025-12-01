import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface FloatingBubblesProps {
  count?: number;
  minSize?: number;
  maxSize?: number;
  opacity?: number;
  className?: string;
}

export function FloatingBubbles({ 
  count = 8,
  minSize = 15,
  maxSize = 35,
  opacity = 0.15,
  className = ''
}: FloatingBubblesProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  const bubbles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * (maxSize - minSize) + minSize,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 12,
    xOffset: Math.random() * 40 - 20,
  }));

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className={`absolute rounded-full ${
            isDark ? 'bg-white/10' : 'bg-[#4A9FD8]/20'
          }`}
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.left}%`,
            bottom: '-50px',
            backdropFilter: 'blur(1px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,159,216,0.1)'}`,
            opacity: opacity,
          }}
          animate={{
            y: [0, -window.innerHeight - 100],
            x: [0, bubble.xOffset],
            scale: [1, 1.1, 1],
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
  );
}
