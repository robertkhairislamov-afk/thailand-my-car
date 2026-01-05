import { useState } from 'react';
import { LanguageToggle, LanguageToggleCompact, LanguageToggleDark } from './LanguageToggle';
import { OceanBackground } from './OceanBackground';

export function LanguageToggleDemo() {
  const [lang1, setLang1] = useState<'ru' | 'en'>('ru');
  const [lang2, setLang2] = useState<'ru' | 'en'>('ru');
  const [lang3, setLang3] = useState<'ru' | 'en'>('ru');

  return (
    <div className="min-h-screen">
      {/* Light background section */}
      <OceanBackground variant="gradient" showBubbles={true} showStars={true}>
        <div className="min-h-screen p-8">
          <div className="mx-auto max-w-2xl space-y-12">
            <div className="text-center">
              <h1 className="mb-2 text-white" style={{ fontSize: '32px', fontWeight: 700 }}>
                Language Toggle Variants
              </h1>
              <p className="text-white/80" style={{ fontSize: '16px' }}>
                Красивые переключатели языка для Saturway
              </p>
            </div>

            {/* Variant 1: With Globe Icon */}
            <div className="space-y-4">
              <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
                <h2 className="mb-4 text-white" style={{ fontSize: '20px', fontWeight: 600 }}>
                  1. С иконкой глобуса (LanguageToggle)
                </h2>
                <p className="mb-4 text-white/70" style={{ fontSize: '14px' }}>
                  Полная версия с иконкой Globe для дополнительной визуализации
                </p>
                <div className="flex items-center justify-center rounded-lg bg-white/5 p-8">
                  <LanguageToggle
                    currentLanguage={lang1}
                    onToggle={setLang1}
                  />
                </div>
                <div className="mt-4">
                  <code className="block rounded-md bg-black/30 p-3 text-white/80" style={{ fontSize: '13px' }}>
                    {`<LanguageToggle currentLanguage="${lang1}" onToggle={setLang1} />`}
                  </code>
                </div>
              </div>
            </div>

            {/* Variant 2: Compact */}
            <div className="space-y-4">
              <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
                <h2 className="mb-4 text-white" style={{ fontSize: '20px', fontWeight: 600 }}>
                  2. Компактная версия (LanguageToggleCompact)
                </h2>
                <p className="mb-4 text-white/70" style={{ fontSize: '14px' }}>
                  Минималистичная версия без иконки - используется на экранах авторизации
                </p>
                <div className="flex items-center justify-center rounded-lg bg-white/5 p-8">
                  <LanguageToggleCompact
                    currentLanguage={lang2}
                    onToggle={setLang2}
                  />
                </div>
                <div className="mt-4">
                  <code className="block rounded-md bg-black/30 p-3 text-white/80" style={{ fontSize: '13px' }}>
                    {`<LanguageToggleCompact currentLanguage="${lang2}" onToggle={setLang2} />`}
                  </code>
                </div>
              </div>
            </div>

            {/* Variant 3: Dark Theme */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-foreground" style={{ fontSize: '20px', fontWeight: 600 }}>
                  3. Темная версия (LanguageToggleDark)
                </h2>
                <p className="mb-4 text-muted-foreground" style={{ fontSize: '14px' }}>
                  Адаптированная версия для светлых фонов
                </p>
                <div className="flex items-center justify-center rounded-lg bg-muted/30 p-8">
                  <LanguageToggleDark
                    currentLanguage={lang3}
                    onToggle={setLang3}
                  />
                </div>
                <div className="mt-4">
                  <code className="block rounded-md bg-muted p-3 text-muted-foreground" style={{ fontSize: '13px' }}>
                    {`<LanguageToggleDark currentLanguage="${lang3}" onToggle={setLang3} />`}
                  </code>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
              <h3 className="mb-4 text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                Особенности
              </h3>
              <ul className="space-y-2 text-white/80" style={{ fontSize: '14px' }}>
                <li>• Spring анимация при переключении (react-spring)</li>
                <li>• Плавный переход фонового слайдера</li>
                <li>• Backdrop-blur для эффекта стекла</li>
                <li>• Hover и tap анимации</li>
                <li>• Океанский градиент (from-[#4A9FD8] to-[#52C9C1])</li>
                <li>• Три варианта под разные фоны</li>
              </ul>
            </div>

            {/* Usage */}
            <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
              <h3 className="mb-4 text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                Использование с контекстом
              </h3>
              <code className="block rounded-md bg-black/30 p-4 text-white/80" style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>
{`import { useLanguage } from './LanguageContext';
import { LanguageToggleCompact } from './LanguageToggle';

function MyComponent() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <LanguageToggleCompact
      currentLanguage={language}
      onToggle={setLanguage}
    />
  );
}`}
              </code>
            </div>
          </div>
        </div>
      </OceanBackground>
    </div>
  );
}
