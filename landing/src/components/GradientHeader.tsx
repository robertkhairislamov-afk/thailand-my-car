import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: 'ocean' | 'sky' | 'turquoise';
  showDecoration?: boolean;
  className?: string;
}

export function GradientHeader({ 
  title, 
  subtitle, 
  icon,
  variant = 'ocean',
  showDecoration = true,
  className = ''
}: GradientHeaderProps) {
  
  const gradients = {
    ocean: 'from-[#4A9FD8] via-[#5AB5E8] to-[#52C9C1]',
    sky: 'from-[#5AB5E8] via-[#4ECDC4] to-[#52C9C1]',
    turquoise: 'from-[#52C9C1] via-[#4ECDC4] to-[#4A9FD8]',
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[variant]} p-6 text-white ${className}`}>
      <div className="relative z-10">
        {icon && (
          <motion.div 
            className="mb-3 inline-flex rounded-lg bg-white/20 p-2.5 backdrop-blur-sm"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            {icon}
          </motion.div>
        )}
        <motion.h2 
          style={{ fontSize: '24px', fontWeight: 700 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p 
            className="mt-1 opacity-90" 
            style={{ fontSize: '15px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Decorative elements */}
      {showDecoration && (
        <>
          <motion.div 
            className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"
            style={{ transform: 'translate(30%, -30%)' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/10 blur-xl"
            style={{ transform: 'translate(-20%, 20%)' }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            style={{ transform: 'translateX(-100%)' }}
            animate={{
              transform: ['translateX(-100%)', 'translateX(100%)'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'linear',
            }}
          />
        </>
      )}
    </div>
  );
}
