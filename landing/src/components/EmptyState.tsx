import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface EmptyStateProps {
  illustration: 'tasks' | 'energy' | 'insights' | 'general';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  illustration,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <Card className="border-[#4A9FD8]/20 bg-gradient-to-br from-card to-card/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden p-12"
      >
        {/* Background Ocean Effect */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0 bg-gradient-to-b from-[#4A9FD8]/5 via-[#5AB5E8]/5 to-[#52C9C1]/5" />
          
          {/* Animated Bubbles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#4A9FD8]/20"
              style={{
                width: Math.random() * 30 + 10,
                height: Math.random() * 30 + 10,
                left: `${Math.random() * 100}%`,
                bottom: -50,
              }}
              animate={{
                y: [-50, -600],
                x: [0, (Math.random() - 0.5) * 100],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 4,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Illustration */}
        <div className="relative z-10 mb-6 flex justify-center">
          {illustration === 'tasks' && <TasksIllustration />}
          {illustration === 'energy' && <EnergyIllustration />}
          {illustration === 'insights' && <InsightsIllustration />}
          {illustration === 'general' && <GeneralIllustration />}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-2"
            style={{ fontSize: '20px', fontWeight: 600 }}
          >
            {title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mb-6 max-w-md text-muted-foreground"
            style={{ fontSize: '14px' }}
          >
            {description}
          </motion.p>

          {/* Actions */}
          {(actionLabel || secondaryActionLabel) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center"
            >
              {actionLabel && onAction && (
                <Button
                  onClick={onAction}
                  className="bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white hover:opacity-90"
                >
                  {actionLabel}
                </Button>
              )}
              {secondaryActionLabel && onSecondaryAction && (
                <Button
                  onClick={onSecondaryAction}
                  variant="outline"
                  className="border-[#4A9FD8]/30"
                >
                  {secondaryActionLabel}
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </Card>
  );
}

// Ocean-themed Illustrations

function TasksIllustration() {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fish Swimming */}
      <motion.g
        animate={{
          x: [0, 20, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Fish Body */}
        <ellipse cx="80" cy="100" rx="30" ry="18" fill="#4A9FD8" opacity="0.8" />
        {/* Fish Tail */}
        <path d="M 50 100 Q 40 90, 35 100 Q 40 110, 50 100" fill="#5AB5E8" opacity="0.8" />
        {/* Fish Eye */}
        <circle cx="100" cy="97" r="3" fill="white" />
        <circle cx="101" cy="97" r="1.5" fill="#1a1a1a" />
        {/* Fins */}
        <path d="M 80 118 Q 75 125, 80 130" stroke="#5AB5E8" strokeWidth="2" fill="none" opacity="0.6" />
      </motion.g>

      {/* Seaweed */}
      <motion.g
        animate={{
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ originX: '30px', originY: '180px' }}
      >
        <path
          d="M 30 180 Q 25 150, 30 120 Q 35 150, 30 180"
          fill="#52C9C1"
          opacity="0.4"
        />
      </motion.g>

      <motion.g
        animate={{
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ originX: '170px', originY: '180px' }}
      >
        <path
          d="M 170 180 Q 165 140, 170 110 Q 175 140, 170 180"
          fill="#52C9C1"
          opacity="0.4"
        />
      </motion.g>

      {/* Bubbles */}
      {[60, 120, 140].map((x, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={160}
          r="4"
          fill="#4A9FD8"
          opacity="0.3"
          animate={{
            cy: [160, 40],
            opacity: [0.3, 0.6, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Checkmark Icon (Task Related) */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      >
        <circle cx="140" cy="60" r="25" fill="white" stroke="#4A9FD8" strokeWidth="3" />
        <path
          d="M 130 60 L 137 67 L 152 52"
          stroke="#4A9FD8"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </motion.g>
    </svg>
  );
}

function EnergyIllustration() {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Jellyfish */}
      <motion.g
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Jellyfish Head */}
        <ellipse cx="100" cy="70" rx="35" ry="30" fill="url(#jellyGradient)" opacity="0.9" />
        <defs>
          <radialGradient id="jellyGradient" cx="50%" cy="30%">
            <stop offset="0%" stopColor="#5AB5E8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4A9FD8" stopOpacity="0.4" />
          </radialGradient>
        </defs>
        
        {/* Jellyfish Details */}
        <circle cx="90" cy="65" r="3" fill="white" opacity="0.6" />
        <circle cx="110" cy="65" r="3" fill="white" opacity="0.6" />
        
        {/* Tentacles */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.path
            key={i}
            d={`M ${85 + i * 8} 100 Q ${83 + i * 8} 130, ${85 + i * 8} 150`}
            stroke="#5AB5E8"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
            animate={{
              d: [
                `M ${85 + i * 8} 100 Q ${83 + i * 8} 130, ${85 + i * 8} 150`,
                `M ${85 + i * 8} 100 Q ${88 + i * 8} 130, ${82 + i * 8} 150`,
                `M ${85 + i * 8} 100 Q ${83 + i * 8} 130, ${85 + i * 8} 150`,
              ],
            }}
            transition={{
              duration: 2 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.g>

      {/* Energy Waves */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx="100"
          cy="70"
          r="40"
          stroke="#52C9C1"
          strokeWidth="2"
          fill="none"
          opacity="0"
          animate={{
            r: [40, 70],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.7,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Lightning Bolt (Energy Symbol) */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <path
          d="M 95 35 L 85 55 L 100 55 L 90 75 L 115 50 L 100 50 L 110 30 Z"
          fill="#FFD93D"
          stroke="#FFC107"
          strokeWidth="2"
        />
      </motion.g>

      {/* Bubbles */}
      {[40, 160, 120].map((x, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={180}
          r="5"
          fill="#4A9FD8"
          opacity="0.3"
          animate={{
            cy: [180, 20],
            opacity: [0.3, 0.6, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeOut",
          }}
        />
      ))}
    </svg>
  );
}

function InsightsIllustration() {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shell with Pearl (Knowledge/Insight Symbol) */}
      <motion.g
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        {/* Shell Bottom Half */}
        <motion.path
          d="M 60 110 Q 60 85, 75 75 Q 90 70, 100 70 Q 110 70, 125 75 Q 140 85, 140 110 L 135 120 Q 130 125, 120 127 Q 110 128, 100 128 Q 90 128, 80 127 Q 70 125, 65 120 Z"
          fill="#5AB5E8"
          opacity="0.7"
          animate={{
            d: [
              "M 60 110 Q 60 85, 75 75 Q 90 70, 100 70 Q 110 70, 125 75 Q 140 85, 140 110 L 135 120 Q 130 125, 120 127 Q 110 128, 100 128 Q 90 128, 80 127 Q 70 125, 65 120 Z",
              "M 60 110 Q 60 85, 75 75 Q 90 70, 100 70 Q 110 70, 125 75 Q 140 85, 140 110 L 137 122 Q 132 127, 120 129 Q 110 130, 100 130 Q 90 130, 80 129 Q 68 127, 63 122 Z",
              "M 60 110 Q 60 85, 75 75 Q 90 70, 100 70 Q 110 70, 125 75 Q 140 85, 140 110 L 135 120 Q 130 125, 120 127 Q 110 128, 100 128 Q 90 128, 80 127 Q 70 125, 65 120 Z",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Shell Top Half */}
        <motion.path
          d="M 60 110 Q 60 90, 70 80 Q 85 68, 100 65 Q 115 68, 130 80 Q 140 90, 140 110"
          fill="#4A9FD8"
          opacity="0.8"
          animate={{
            d: [
              "M 60 110 Q 60 90, 70 80 Q 85 68, 100 65 Q 115 68, 130 80 Q 140 90, 140 110",
              "M 58 110 Q 58 88, 68 78 Q 83 66, 100 63 Q 117 66, 132 78 Q 142 88, 142 110",
              "M 60 110 Q 60 90, 70 80 Q 85 68, 100 65 Q 115 68, 130 80 Q 140 90, 140 110",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Shell Lines (Detail) */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="100"
            y1="65"
            x2={80 + i * 10}
            y2="110"
            stroke="#52C9C1"
            strokeWidth="1.5"
            opacity="0.4"
          />
        ))}
        
        {/* Pearl (Glowing) */}
        <motion.g
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <circle cx="100" cy="95" r="15" fill="url(#pearlGradient)" />
          <circle cx="100" cy="95" r="18" fill="white" opacity="0.2" />
          <circle cx="100" cy="95" r="22" fill="white" opacity="0.1" />
        </motion.g>
        
        <defs>
          <radialGradient id="pearlGradient" cx="40%" cy="40%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f0f0f0" />
            <stop offset="100%" stopColor="#d0d0d0" />
          </radialGradient>
        </defs>
      </motion.g>

      {/* Chart Bars (Data/Analytics Symbol) */}
      <motion.g
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[
          { x: 50, height: 30, delay: 0 },
          { x: 70, height: 45, delay: 0.1 },
          { x: 90, height: 35, delay: 0.2 },
          { x: 130, height: 50, delay: 0.3 },
          { x: 150, height: 40, delay: 0.4 },
        ].map((bar, i) => (
          <motion.rect
            key={i}
            x={bar.x}
            y={160 - bar.height}
            width="12"
            height={bar.height}
            rx="2"
            fill="#52C9C1"
            opacity="0.6"
            initial={{ height: 0 }}
            animate={{ height: bar.height }}
            transition={{
              delay: 0.5 + bar.delay,
              duration: 0.6,
              type: "spring",
            }}
          />
        ))}
        
        {/* Chart Line */}
        <motion.path
          d="M 50 160 L 70 145 L 90 150 L 130 135 L 150 140"
          stroke="#4A9FD8"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        />
      </motion.g>

      {/* Light Rays from Pearl */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <motion.line
          key={i}
          x1={100 + Math.cos((angle * Math.PI) / 180) * 18}
          y1={95 + Math.sin((angle * Math.PI) / 180) * 18}
          x2={100 + Math.cos((angle * Math.PI) / 180) * 28}
          y2={95 + Math.sin((angle * Math.PI) / 180) * 28}
          stroke="#FFD93D"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Swimming Fish (Small) - moved to right side */}
      <motion.g
        animate={{
          x: [180, -40],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <ellipse cx="0" cy="50" rx="15" ry="8" fill="#4A9FD8" opacity="0.5" />
        <path d="M -15 50 Q -20 45, -22 50 Q -20 55, -15 50" fill="#5AB5E8" opacity="0.5" />
        <circle cx="10" cy="49" r="2" fill="white" opacity="0.7" />
      </motion.g>

      {/* Bubbles */}
      {[40, 160, 100].map((x, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={190}
          r="5"
          fill="#4A9FD8"
          opacity="0.3"
          animate={{
            cy: [190, 20],
            opacity: [0.3, 0.7, 0],
            scale: [1, 1.2, 0.8],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: i * 1.2,
            ease: "easeOut",
          }}
        />
      ))}
    </svg>
  );
}

function GeneralIllustration() {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Octopus */}
      <motion.g
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Head */}
        <ellipse cx="100" cy="80" rx="40" ry="35" fill="url(#octopusGradient)" />
        <defs>
          <radialGradient id="octopusGradient" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#5AB5E8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#4A9FD8" stopOpacity="0.7" />
          </radialGradient>
        </defs>
        
        {/* Eyes */}
        <circle cx="85" cy="75" r="6" fill="white" />
        <circle cx="115" cy="75" r="6" fill="white" />
        <circle cx="87" cy="75" r="3" fill="#1a1a1a" />
        <circle cx="117" cy="75" r="3" fill="#1a1a1a" />
        
        {/* Tentacles */}
        {[-20, -10, 0, 10, 20].map((offset, i) => (
          <motion.path
            key={i}
            d={`M ${100 + offset} 115 Q ${95 + offset} 145, ${100 + offset} 165`}
            stroke="#5AB5E8"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
            animate={{
              d: [
                `M ${100 + offset} 115 Q ${95 + offset} 145, ${100 + offset} 165`,
                `M ${100 + offset} 115 Q ${105 + offset} 145, ${95 + offset} 165`,
                `M ${100 + offset} 115 Q ${95 + offset} 145, ${100 + offset} 165`,
              ],
            }}
            transition={{
              duration: 2.5 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.g>

      {/* Bubbles */}
      {[50, 100, 150].map((x, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={190}
          r="6"
          fill="#4A9FD8"
          opacity="0.3"
          animate={{
            cy: [190, 10],
            opacity: [0.3, 0.7, 0],
            scale: [1, 1.2, 0.8],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: i * 1,
            ease: "easeOut",
          }}
        />
      ))}
    </svg>
  );
}