import { motion } from 'motion/react';

type Language = 'ru' | 'en' | 'th';

interface LanguageToggleProps {
  currentLanguage: Language;
  onToggle: (lang: Language) => void;
  isDark?: boolean;
  className?: string;
}

const languages = [
  { code: 'ru' as const, label: 'RU' },
  { code: 'en' as const, label: 'EN' },
  { code: 'th' as const, label: 'TH' },
];

// Calculate slider position based on language index
const getSliderPosition = (lang: Language) => {
  const index = languages.findIndex(l => l.code === lang);
  return index * 44; // 44px per button (36px width + 8px gap)
};

/**
 * Компактный переключатель языка для Thailand My Car
 * Стилизован под цветовую схему проекта (#009696, #FFC850)
 */
export function LanguageToggle({
  currentLanguage,
  onToggle,
  isDark = true,
  className = ''
}: LanguageToggleProps) {
  return (
    <div
      className={`relative inline-flex rounded-lg p-1 backdrop-blur-md ${className}`}
      style={{
        background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        border: `1px solid ${isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'}`,
      }}
    >
      {/* Background slider */}
      <motion.div
        className="absolute top-1 h-[calc(100%-8px)] rounded-md shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #009696 0%, #00b3b3 100%)',
          width: '36px',
        }}
        initial={false}
        animate={{
          x: getSliderPosition(currentLanguage),
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
          className="relative z-10 px-3 py-1.5 transition-colors"
          style={{ minWidth: '36px' }}
        >
          <motion.span
            className="block text-center font-semibold"
            style={{
              fontSize: '13px',
              color: currentLanguage === lang.code
                ? '#ffffff'
                : isDark
                  ? 'rgba(255, 255, 255, 0.6)'
                  : 'rgba(0, 150, 150, 0.7)',
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

/**
 * Переключатель с золотым акцентом (альтернативный вариант)
 */
export function LanguageToggleGold({
  currentLanguage,
  onToggle,
  isDark = true,
  className = ''
}: LanguageToggleProps) {
  return (
    <div
      className={`relative inline-flex rounded-lg p-1 backdrop-blur-md ${className}`}
      style={{
        background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        border: `1px solid ${isDark ? 'rgba(255, 200, 80, 0.3)' : 'rgba(255, 200, 80, 0.4)'}`,
      }}
    >
      {/* Background slider */}
      <motion.div
        className="absolute top-1 h-[calc(100%-8px)] rounded-md shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #FFC850 0%, #FFD970 100%)',
          width: '36px',
        }}
        initial={false}
        animate={{
          x: getSliderPosition(currentLanguage),
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
          className="relative z-10 px-3 py-1.5 transition-colors"
          style={{ minWidth: '36px' }}
        >
          <motion.span
            className="block text-center font-semibold"
            style={{
              fontSize: '13px',
              color: currentLanguage === lang.code
                ? '#143C50'
                : isDark
                  ? 'rgba(255, 255, 255, 0.6)'
                  : 'rgba(20, 60, 80, 0.6)',
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

export default LanguageToggle;
