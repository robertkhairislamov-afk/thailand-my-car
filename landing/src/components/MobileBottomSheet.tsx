import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, TrendingUp, Users, Calendar, CheckCircle2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useEffect } from 'react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    category: string;
    description: string;
    fullDescription: string;
    image: string;
    metrics: Record<string, string>;
    features: string[];
    status: 'active' | 'coming-soon';
    link?: string;
    gradient: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
}

export function MobileBottomSheet({ isOpen, onClose, project }: MobileBottomSheetProps) {
  const { t } = useLanguage();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-card shadow-2xl"
          >
            {/* Handle */}
            <div className="sticky top-0 z-10 bg-card pt-4 pb-2">
              <div className="mx-auto h-1.5 w-12 rounded-full bg-muted" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-8 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-muted/80 backdrop-blur-sm transition-colors hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header with gradient */}
            <div
              className="relative overflow-hidden p-8 text-white"
              style={{
                background: `linear-gradient(135deg, ${project.colors.primary}, ${project.colors.secondary})`,
              }}
            >
              <div className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-sm">
                {project.category}
              </div>
              <h2 className="mb-2 text-3xl font-bold">
                {project.name}
              </h2>
              <p className="text-sm opacity-90">
                {project.description}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Metrics Grid */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                {Object.entries(project.metrics).slice(0, 4).map(([key, value], idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                    <div className="mb-1 font-bold" style={{ color: project.colors.primary }}>
                      {value}
                    </div>
                    <div className="text-xs capitalize text-muted-foreground">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Full Description */}
              <div className="mb-6">
                <h3 className="mb-3 font-bold">
                  {t('landing.projects.modal.about')}
                </h3>
                <p className="leading-relaxed text-muted-foreground text-sm">
                  {project.fullDescription}
                </p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="mb-3 font-bold">
                  {t('landing.projects.modal.keyFeatures')}
                </h3>
                <div className="space-y-2">
                  {project.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 flex-shrink-0"
                        style={{ color: project.colors.primary }}
                      />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA - Larger for touch */}
              {project.status === 'active' && (
                <div className="space-y-3">
                  {project.id === 'ai-organizer' && (
                    <button
                      onClick={() => {
                        window.open('https://t.me/saturway_bot', '_blank');
                        onClose();
                      }}
                      className="group flex w-full min-h-[56px] items-center justify-center gap-2 rounded-xl px-8 py-4 text-white transition-all hover:shadow-lg active:scale-95"
                      style={{
                        background: `linear-gradient(135deg, ${project.colors.primary}, ${project.colors.secondary})`,
                      }}
                    >
                      {t('landing.projects.modal.openTelegram')}
                      <ExternalLink className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </button>
                  )}
                  
                  {project.id === 'thailand-car' && (
                    <a
                      href="/thailand-my-car"
                      onClick={() => onClose()}
                      className="group flex w-full min-h-[56px] items-center justify-center gap-2 rounded-xl px-8 py-4 text-white transition-all hover:shadow-lg active:scale-95"
                      style={{
                        background: `linear-gradient(135deg, ${project.colors.primary}, ${project.colors.secondary})`,
                      }}
                    >
                      {t('landing.projects.modal.goToProject')}
                      <ExternalLink className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </a>
                  )}
                </div>
              )}

              {project.status === 'coming-soon' && (
                <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center">
                  <Calendar className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('landing.projects.modal.comingSoon')}
                  </p>
                </div>
              )}

              {/* Safe area padding for mobile */}
              <div className="h-6" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
