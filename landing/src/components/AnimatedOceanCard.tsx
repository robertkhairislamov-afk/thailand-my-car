import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { Card } from './ui/card';

interface AnimatedOceanCardProps {
  children: ReactNode;
  className?: string;
  showWaves?: boolean;
  showGlow?: boolean;
  delay?: number;
}

export function AnimatedOceanCard({ 
  children, 
  className = '',
  showWaves = false,
  showGlow = false,
  delay = 0,
}: AnimatedOceanCardProps) {
  return (
    <div className="group relative">
      <Card className={`relative overflow-hidden border-[#4A9FD8]/20 bg-gradient-to-br from-card to-card/50 transition-shadow hover:shadow-md ${className}`}>
        {/* Glow effect on hover - simplified */}
        {showGlow && (
          <div
            className="pointer-events-none absolute -inset-[1px] rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: 'linear-gradient(135deg, rgba(74,159,216,0.1) 0%, rgba(82,201,193,0.1) 100%)',
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </Card>
    </div>
  );
}
