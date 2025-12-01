import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, TrendingUp, Users, Calendar, CheckCircle2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    category: string;
    description: string;
    fullDescription: string;
    image: string;
    metrics: {
      target?: string;
      raised?: string;
      minInvestment?: string;
      roi?: string;
      users?: string;
      tasks?: string;
      satisfaction?: string;
    };
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

export function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  const { t } = useLanguage();

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

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header with gradient */}
              <div
                className="relative h-64 overflow-hidden rounded-t-3xl"
                style={{
                  background: `linear-gradient(135deg, ${project.colors.primary}, ${project.colors.secondary})`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="mb-2 inline-block rounded-full bg-white/20 px-4 py-1 text-sm backdrop-blur-sm">
                      {project.category}
                    </div>
                    <h2 className="mb-4 px-6 text-4xl font-bold md:text-5xl">
                      {project.name}
                    </h2>
                    <p className="mx-auto max-w-2xl px-6 text-lg opacity-90">
                      {project.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Metrics Grid */}
                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {project.metrics.target && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                      <div className="mb-1 text-2xl font-bold" style={{ color: project.colors.primary }}>
                        {project.metrics.target}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('landing.projects.modal.target')}
                      </div>
                    </div>
                  )}
                  {project.metrics.raised && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                      <div className="mb-1 text-2xl font-bold" style={{ color: project.colors.primary }}>
                        {project.metrics.raised}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('landing.projects.modal.raised')}
                      </div>
                    </div>
                  )}
                  {project.metrics.roi && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                      <div className="mb-1 flex items-center justify-center gap-1 text-2xl font-bold text-emerald-600">
                        <TrendingUp className="h-5 w-5" />
                        {project.metrics.roi}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('landing.projects.modal.roi')}
                      </div>
                    </div>
                  )}
                  {project.metrics.users && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                      <div className="mb-1 flex items-center justify-center gap-1 text-2xl font-bold" style={{ color: project.colors.primary }}>
                        <Users className="h-5 w-5" />
                        {project.metrics.users}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('landing.projects.modal.users')}
                      </div>
                    </div>
                  )}
                  {project.metrics.tasks && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                      <div className="mb-1 text-2xl font-bold" style={{ color: project.colors.primary }}>
                        {project.metrics.tasks}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('landing.projects.modal.tasks')}
                      </div>
                    </div>
                  )}
                  {project.metrics.satisfaction && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                      <div className="mb-1 text-2xl font-bold" style={{ color: project.colors.primary }}>
                        {project.metrics.satisfaction}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('landing.projects.modal.satisfaction')}
                      </div>
                    </div>
                  )}
                  {project.metrics.minInvestment && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                      <div className="mb-1 text-2xl font-bold" style={{ color: project.colors.primary }}>
                        {project.metrics.minInvestment}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('landing.projects.modal.minInvestment')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Full Description */}
                <div className="mb-8">
                  <h3 className="mb-4 text-2xl font-bold">
                    {t('landing.projects.modal.about')}
                  </h3>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {project.fullDescription}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h3 className="mb-4 text-2xl font-bold">
                    {t('landing.projects.modal.keyFeatures')}
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {project.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-4"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-5 w-5 flex-shrink-0"
                          style={{ color: project.colors.primary }}
                        />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                {project.status === 'active' && (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {project.id === 'ai-organizer' && (
                      <button
                        onClick={() => window.open('https://t.me/saturway_bot', '_blank')}
                        className="group flex flex-1 items-center justify-center gap-2 rounded-xl px-8 py-4 text-lg text-white transition-all hover:shadow-lg"
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
                        className="group flex flex-1 items-center justify-center gap-2 rounded-xl px-8 py-4 text-lg text-white transition-all hover:shadow-lg"
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
                    <Calendar className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                    <p className="font-medium text-muted-foreground">
                      {t('landing.projects.modal.comingSoon')}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
