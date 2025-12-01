import { useState } from 'react';
import { LoadingScreen } from './LoadingScreen';
import { PermissionScreen } from './PermissionScreen';
import { ErrorScreen } from './ErrorScreen';
import { LanguageProvider } from './LanguageContext';

type AuthStep = 'loading' | 'permission' | 'error' | 'complete';

interface AuthFlowProps {
  onComplete: () => void;
  simulateError?: boolean;
}

export function AuthFlow({ onComplete, simulateError = false }: AuthFlowProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>('loading');

  const handleLoadingComplete = () => {
    if (simulateError) {
      setCurrentStep('error');
    } else {
      setCurrentStep('permission');
    }
  };

  const handlePermissionAllow = () => {
    // Here you would actually request notification permissions
    console.log('Notifications enabled');
    setCurrentStep('complete');
    onComplete();
  };

  const handlePermissionSkip = () => {
    console.log('Notifications skipped');
    setCurrentStep('complete');
    onComplete();
  };

  const handleErrorRetry = () => {
    setCurrentStep('loading');
  };

  const handleSupport = () => {
    // Open support chat or link
    console.log('Opening support...');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'loading':
        return <LoadingScreen onComplete={handleLoadingComplete} />;
      
      case 'permission':
        return (
          <PermissionScreen
            onAllow={handlePermissionAllow}
            onSkip={handlePermissionSkip}
          />
        );
      
      case 'error':
        return (
          <ErrorScreen
            onRetry={handleErrorRetry}
            onSupport={handleSupport}
          />
        );
      
      case 'complete':
        onComplete();
        return null;
      
      default:
        return null;
    }
  };

  return (
    <LanguageProvider>
      {renderStep()}
    </LanguageProvider>
  );
}