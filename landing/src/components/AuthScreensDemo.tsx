import { useState } from 'react';
import { LoadingScreen } from './LoadingScreen';
import { PermissionScreen } from './PermissionScreen';
import { ErrorScreen } from './ErrorScreen';
import { Button } from './ui/button';
import { OceanBackground } from './OceanBackground';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { LanguageToggleCompact } from './LanguageToggle';

type DemoScreen = 'menu' | 'loading' | 'permission' | 'error';

function DemoContent() {
  const [currentScreen, setCurrentScreen] = useState<DemoScreen>('menu');
  const { language, setLanguage, t } = useLanguage();

  if (currentScreen === 'loading') {
    return (
      <>
        <LoadingScreen onComplete={() => setCurrentScreen('menu')} />
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
          <Button
            onClick={() => setCurrentScreen('menu')}
            variant="outline"
            className="bg-white/90 backdrop-blur-sm"
          >
            {t('demo.backToMenu')}
          </Button>
        </div>
      </>
    );
  }

  if (currentScreen === 'permission') {
    return (
      <>
        <PermissionScreen
          onAllow={() => setCurrentScreen('menu')}
          onSkip={() => setCurrentScreen('menu')}
        />
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
          <Button
            onClick={() => setCurrentScreen('menu')}
            variant="outline"
            className="bg-card/90 backdrop-blur-sm"
          >
            {t('demo.backToMenu')}
          </Button>
        </div>
      </>
    );
  }

  if (currentScreen === 'error') {
    return (
      <>
        <ErrorScreen
          onRetry={() => setCurrentScreen('menu')}
          onSupport={() => console.log('Support clicked')}
        />
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
          <Button
            onClick={() => setCurrentScreen('menu')}
            variant="outline"
            className="bg-card/90 backdrop-blur-sm"
          >
            {t('demo.backToMenu')}
          </Button>
        </div>
      </>
    );
  }

  return (
    <OceanBackground variant="gradient" showBubbles={true} showStars={true}>
      {/* Language toggle in top right corner */}
      <div className="fixed right-6 top-6 z-20">
        <LanguageToggleCompact
          currentLanguage={language}
          onToggle={setLanguage}
        />
      </div>

      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-md space-y-4 pt-12">
          <div className="mb-8 text-center">
            <h1 style={{ fontSize: '28px', fontWeight: 700 }} className="mb-2 text-white">
              {t('demo.title')}
            </h1>
            <p className="text-white/80" style={{ fontSize: '16px' }}>
              {t('demo.subtitle')}
            </p>
          </div>

          <Button
            onClick={() => setCurrentScreen('loading')}
            className="h-16 w-full rounded-xl bg-white/90 text-[#4A9FD8] shadow-lg backdrop-blur-md transition-transform hover:scale-[0.98] hover:bg-white active:scale-95"
            style={{ fontSize: '16px', fontWeight: 600 }}
          >
            {t('demo.loadingScreen')}
            <span className="ml-2 text-sm opacity-70">
              {t('demo.loadingScreenDesc')}
            </span>
          </Button>

          <Button
            onClick={() => setCurrentScreen('permission')}
            className="h-16 w-full rounded-xl bg-white/90 text-[#4A9FD8] shadow-lg backdrop-blur-md transition-transform hover:scale-[0.98] hover:bg-white active:scale-95"
            style={{ fontSize: '16px', fontWeight: 600 }}
          >
            {t('demo.permissionScreen')}
            <span className="ml-2 text-sm opacity-70">
              {t('demo.permissionScreenDesc')}
            </span>
          </Button>

          <Button
            onClick={() => setCurrentScreen('error')}
            className="h-16 w-full rounded-xl bg-white/90 text-[#4A9FD8] shadow-lg backdrop-blur-md transition-transform hover:scale-[0.98] hover:bg-white active:scale-95"
            style={{ fontSize: '16px', fontWeight: 600 }}
          >
            {t('demo.errorScreen')}
            <span className="ml-2 text-sm opacity-70">
              {t('demo.errorScreenDesc')}
            </span>
          </Button>

          <div className="mt-8 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
            <h3 style={{ fontSize: '14px', fontWeight: 600 }} className="mb-2 text-white">
              {t('demo.features')}
            </h3>
            <ul className="space-y-1 text-white/80" style={{ fontSize: '13px' }}>
              <li>{t('demo.feature1')}</li>
              <li>{t('demo.feature2')}</li>
              <li>{t('demo.feature3')}</li>
              <li>{t('demo.feature4')}</li>
              <li>{t('demo.feature5')}</li>
              <li>{t('demo.feature6')}</li>
              <li>{t('demo.feature7')}</li>
              <li>{t('demo.feature8')}</li>
            </ul>
          </div>

          <div className="pt-4 text-center text-white/70" style={{ fontSize: '12px' }}>
            {t('demo.version')}
          </div>
        </div>
      </div>
    </OceanBackground>
  );
}

export function AuthScreensDemo() {
  return (
    <LanguageProvider>
      <DemoContent />
    </LanguageProvider>
  );
}