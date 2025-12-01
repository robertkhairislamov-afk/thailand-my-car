import { motion } from 'motion/react';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  currentLanguage: 'ru' | 'en';
  onToggle: (lang: 'ru' | 'en') => void;
  className?: string;
}

export function LanguageToggle({ currentLanguage, onToggle, className = '' }: LanguageToggleProps) {
  const languages = [
    { code: 'ru' as const, label: 'RU', name: 'Русский' },
    { code: 'en' as const, label: 'EN', name: 'English' },
  ];

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Language toggle */}
      <div className="relative inline-flex rounded-lg bg-muted/80 p-1 backdrop-blur-md border border-[#4A9FD8]/20 shadow-sm">
        {/* Background slider */}
        <motion.div
          className="absolute left-1 top-1 h-[calc(100%-8px)] rounded-md bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] shadow-lg"
          initial={false}
          animate={{
            width: '36px',
            x: currentLanguage === 'ru' ? 0 : 44,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        />

        {/* Language buttons */}
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onToggle(lang.code)}
            className="relative z-10 px-3 py-1 transition-colors"
            style={{ minWidth: '36px' }}
          >
            <motion.span
              className="block text-center"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: currentLanguage === lang.code ? '#ffffff' : '#1e3a8a',
              }}
              animate={{
                scale: currentLanguage === lang.code ? 1 : 0.95,
              }}
              transition={{ duration: 0.2 }}
            >
              {lang.label}
            </motion.span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Compact version - just the toggle without globe icon
export function LanguageToggleCompact({ currentLanguage, onToggle, className = '' }: LanguageToggleProps) {
  const languages = [
    { code: 'ru' as const, label: 'RU' },
    { code: 'en' as const, label: 'EN' },
  ];

  return (
    <div className={`relative inline-flex rounded-lg bg-white/10 p-1 backdrop-blur-md ${className}`}>
      {/* Background slider */}
      <motion.div
        className="absolute left-1 top-1 h-[calc(100%-8px)] rounded-md bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] shadow-lg"
        initial={false}
        animate={{
          width: '36px',
          x: currentLanguage === 'ru' ? 0 : 44,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
      />

      {/* Language buttons */}
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onToggle(lang.code)}
          className="relative z-10 px-3 py-1 transition-colors"
          style={{ minWidth: '36px' }}
        >
          <motion.span
            className="block text-center"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: currentLanguage === lang.code ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
            }}
            animate={{
              scale: currentLanguage === lang.code ? 1 : 0.95,
            }}
            transition={{ duration: 0.2 }}
          >
            {lang.label}
          </motion.span>
        </button>
      ))}
    </div>
  );
}

// Dark theme version (for light backgrounds)
export function LanguageToggleDark({ currentLanguage, onToggle, className = '' }: LanguageToggleProps) {
  const languages = [
    { code: 'ru' as const, label: 'RU' },
    { code: 'en' as const, label: 'EN' },
  ];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Globe icon */}
      <motion.div
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4A9FD8]/10 backdrop-blur-md"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Globe className="h-4 w-4 text-[#4A9FD8]" strokeWidth={2} />
      </motion.div>

      {/* Language toggle */}
      <div className="relative inline-flex rounded-lg bg-muted/80 p-1 backdrop-blur-md border border-[#4A9FD8]/20 shadow-sm">
        {/* Background slider */}
        <motion.div
          className="absolute left-1 top-1 h-[calc(100%-8px)] rounded-md bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] shadow-lg"
          initial={false}
          animate={{
            width: '36px',
            x: currentLanguage === 'ru' ? 0 : 44,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        />

        {/* Language buttons */}
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onToggle(lang.code)}
            className="relative z-10 px-3 py-1 transition-colors"
            style={{ minWidth: '36px' }}
          >
            <motion.span
              className="block text-center"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: currentLanguage === lang.code ? '#ffffff' : '#1e3a8a',
              }}
              animate={{
                scale: currentLanguage === lang.code ? 1 : 0.95,
              }}
              transition={{ duration: 0.2 }}
            >
              {lang.label}
            </motion.span>
          </button>
        ))}
      </div>
    </div>
  );
}
