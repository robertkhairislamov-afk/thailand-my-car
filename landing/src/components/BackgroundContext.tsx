import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type BackgroundVariant = 'ocean-accents' | 'caustics' | 'waves' | 'depth-layers' | 'mesh-grid' | 'minimal';

interface BackgroundContextType {
  background: BackgroundVariant;
  setBackground: (bg: BackgroundVariant) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [background, setBackgroundState] = useState<BackgroundVariant>(() => {
    const saved = localStorage.getItem('saturway-background');
    return (saved as BackgroundVariant) || 'ocean-accents';
  });

  useEffect(() => {
    localStorage.setItem('saturway-background', background);
  }, [background]);

  const setBackground = (bg: BackgroundVariant) => {
    setBackgroundState(bg);
  };

  return (
    <BackgroundContext.Provider value={{ background, setBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}
