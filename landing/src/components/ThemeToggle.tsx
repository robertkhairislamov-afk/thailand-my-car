import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
  ];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Theme toggle */}
      <div className="relative inline-flex rounded-lg bg-white/10 p-1 backdrop-blur-md">
        {/* Background slider */}
        <motion.div
          className="absolute left-1 top-1 h-[calc(100%-8px)] rounded-md bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] shadow-lg"
          initial={false}
          animate={{
            width: '36px',
            x: theme === 'light' ? 0 : 44,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        />

        {/* Theme buttons */}
        {themes.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className="relative z-10 flex items-center justify-center px-2 py-1 transition-colors"
              style={{ minWidth: '36px' }}
              aria-label={t.label}
            >
              <motion.div
                animate={{
                  scale: theme === t.value ? 1 : 0.9,
                  rotate: theme === t.value && t.value === 'dark' ? 0 : theme === t.value ? 0 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon
                  className="h-4 w-4"
                  style={{
                    color: theme === t.value ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                  }}
                  strokeWidth={2}
                />
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Dark theme version (for light backgrounds in navigation)
export function ThemeToggleDark({ className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
  ];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Theme toggle */}
      <div className="relative inline-flex rounded-lg bg-muted/80 p-1 backdrop-blur-md border border-[#6366F1]/20 shadow-sm">
        {/* Background slider */}
        <motion.div
          className="absolute left-1 top-1 h-[calc(100%-8px)] rounded-md bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] shadow-lg"
          initial={false}
          animate={{
            width: '36px',
            x: theme === 'light' ? 0 : 44,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        />

        {/* Theme buttons */}
        {themes.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className="relative z-10 flex items-center justify-center px-2 py-1 transition-colors"
              style={{ minWidth: '36px' }}
              aria-label={t.label}
            >
              <motion.div
                animate={{
                  scale: theme === t.value ? 1 : 0.9,
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon
                  className="h-4 w-4"
                  style={{
                    color: theme === t.value ? '#ffffff' : 'rgba(99, 102, 241, 0.5)',
                  }}
                  strokeWidth={2}
                />
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
