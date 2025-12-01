import { motion } from 'motion/react';
import { useState, useRef, forwardRef } from 'react';
import { Button, ButtonProps } from './ui/button';

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export interface RippleButtonProps extends ButtonProps {
  rippleColor?: string;
}

export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(({ 
  children, 
  onClick, 
  className = '', 
  rippleColor = 'rgba(255, 255, 255, 0.4)', 
  ...props 
}, ref) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newRipple = {
        x,
        y,
        id: nextId.current++,
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-flex w-full">
      <Button
        ref={ref}
        onClick={handleClick}
        className={`relative w-full overflow-hidden ${className}`}
        {...props}
      >
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
              backgroundColor: rippleColor,
            }}
            initial={{
              width: 0,
              height: 0,
              x: 0,
              y: 0,
              opacity: 1,
            }}
            animate={{
              width: 300,
              height: 300,
              x: -150,
              y: -150,
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
          />
        ))}
        <span className="relative z-10">{children}</span>
      </Button>
    </div>
  );
});

RippleButton.displayName = 'RippleButton';