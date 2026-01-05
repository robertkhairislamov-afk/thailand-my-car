import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Sparkles, 
  TrendingUp,
  Users,
  Star,
  Smartphone,
  Globe,
  Heart,
  Shield,
  Clock,
  Briefcase,
  Code,
  Palette,
  Car,
  Brain,
  DollarSign,
  Target,
  Cpu,
  Zap,
  Rocket,
  CheckCircle2,
  BarChart3,
  Coins,
  Building2,
  Award,
  Lightbulb
} from 'lucide-react';
import { AnimatedOceanCard } from './AnimatedOceanCard';
import { useLanguage } from './LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggleDark } from './ThemeToggle';
import { ProjectModal } from './ProjectModal';
import { MobileBottomSheet } from './MobileBottomSheet';
import { CookieConsent } from './CookieConsent';
import logoImage from 'figma:asset/443c5c749ebfe974980617b9c917b81b051ddc82.png';
import thailandBg from 'figma:asset/8703d1eade1f26db4f0daf0c4127ca966e251655.png';
import saturwayBg from 'figma:asset/63ee1135d2de80d559031f3410debd4eccdd3ec3.png';

export function Landing() {
  const { t, language, setLanguage } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const stats = [
    { value: '2', label: t('landing.brand.stats.activeProjects') },
    { value: 'MVP', label: t('landing.brand.stats.stage') },
    { value: '2025', label: t('landing.brand.stats.founded') },
  ];

  const projects = [
    {
      id: 'ai-organizer',
      name: t('landing.projects.aiOrganizer.name'),
      category: t('landing.projects.aiOrganizer.category'),
      description: t('landing.projects.aiOrganizer.shortDesc'),
      fullDescription: t('landing.projects.aiOrganizer.fullDesc'),
      image: '',
      metrics: {
        status: 'MVP',
        stage: 'Beta',
        platform: 'Telegram',
        users: 'Coming Soon',
      },
      features: [
        t('landing.projects.aiOrganizer.feature1'),
        t('landing.projects.aiOrganizer.feature2'),
        t('landing.projects.aiOrganizer.feature3'),
        t('landing.projects.aiOrganizer.feature4'),
        t('landing.projects.aiOrganizer.feature5'),
        t('landing.projects.aiOrganizer.feature6'),
      ],
      status: 'active' as const,
      link: '#',
      gradient: 'from-[#4A9FD8] to-[#52C9C1]',
      colors: {
        primary: '#4A9FD8',
        secondary: '#52C9C1',
      },
      icon: Cpu,
    },
    {
      id: 'thailand-car',
      name: t('landing.projects.thailandCar.name'),
      category: t('landing.projects.thailandCar.category'),
      description: t('landing.projects.thailandCar.shortDesc'),
      fullDescription: t('landing.projects.thailandCar.fullDesc'),
      image: '',
      metrics: {
        location: 'Pattaya',
        business: 'Car Rental',
        stage: 'Planning',
        launch: '2025',
      },
      features: [
        t('landing.projects.thailandCar.feature1'),
        t('landing.projects.thailandCar.feature2'),
        t('landing.projects.thailandCar.feature3'),
        t('landing.projects.thailandCar.feature4'),
        t('landing.projects.thailandCar.feature5'),
        t('landing.projects.thailandCar.feature6'),
      ],
      status: 'active' as const,
      link: 'https://thailand-my-car.com',
      gradient: 'from-[#0D9488] to-[#14B8A6]',
      colors: {
        primary: '#0D9488',
        secondary: '#14B8A6',
      },
      icon: Building2,
    },
  ];

  const testimonials = [
    {
      name: t('landing.testimonials.founder.name'),
      role: t('landing.testimonials.founder.role'),
      icon: Award,
      color: '#6366F1',
      text: t('landing.testimonials.founder.text'),
      rating: 5,
    },
  ];

  const benefits = [
    { icon: Cpu, text: t('landing.benefits.time') },
    { icon: Coins, text: t('landing.benefits.balance') },
    { icon: Rocket, text: t('landing.benefits.productivity') },
    { icon: Shield, text: t('landing.benefits.privacy') },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-card/98 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] p-1">
              <img src={logoImage} alt="Saturway" className="h-full w-full object-contain" />
            </div>
            <span className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-base sm:text-lg md:text-xl font-bold text-transparent">
              Saturway
            </span>
          </div>
          
          <div className="hidden items-center gap-8 md:flex">
            <a href="#projects" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {t('landing.nav.projects')}
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {t('landing.nav.about')}
            </a>
            <div className="flex items-center gap-3">
              <ThemeToggleDark />
              <LanguageToggle currentLanguage={language} onToggle={setLanguage} />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 md:hidden">
            <ThemeToggleDark />
            <LanguageToggle currentLanguage={language} onToggle={setLanguage} />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-32 md:pb-20">
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div className="space-y-6 md:space-y-8">
              <div>
                <div className="mb-3 md:mb-4 inline-flex items-center gap-2 rounded-full border border-[#6366F1]/30 bg-[#6366F1]/10 px-3 py-1.5 md:px-4 md:py-2">
                  <Star className="h-3 w-3 md:h-4 md:w-4 text-[#6366F1]" />
                  <span className="text-xs md:text-sm font-medium text-[#6366F1]">
                    Saturway
                  </span>
                </div>
                
                <h1 className="mb-4 md:mb-6 text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  {t('landing.brand.hero.title')}
                  <span className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                    {' '}{t('landing.brand.hero.titleAccent')}
                  </span>
                </h1>
                
                <p className="text-base md:text-xl lg:text-2xl text-muted-foreground">
                  {t('landing.brand.hero.subtitle')}
                </p>
              </div>

              <div className="flex flex-col gap-3 md:gap-4 sm:flex-row">
                <button 
                  onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group flex min-h-[52px] md:min-h-[56px] items-center justify-center rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-6 md:px-8 py-3 md:py-4 text-base md:text-lg text-white transition-all hover:shadow-lg active:scale-95"
                >
                  {t('landing.brand.hero.cta')}
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
                </button>
                
                <button className="min-h-[52px] md:min-h-[56px] rounded-xl border-2 border-[#6366F1]/30 bg-transparent px-6 md:px-8 py-3 md:py-4 text-base md:text-lg text-foreground transition-all hover:bg-[#6366F1]/10 active:scale-95">
                  {t('landing.brand.hero.demo')}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 md:gap-6 sm:grid-cols-3">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="mb-1 flex items-center justify-center gap-1 text-2xl md:text-3xl font-bold text-[#6366F1]">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Illustration */}
            <div className="relative">
              <div className="relative mx-auto max-w-md">
                <div className="aspect-square rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20 p-4 md:p-8">
                  <div className="flex h-full flex-col items-center justify-center gap-4 md:gap-6">
                    <div className="grid grid-cols-2 gap-3 md:gap-4 w-full">
                      <div className="aspect-square rounded-xl md:rounded-2xl bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1] p-3 md:p-4 flex items-center justify-center">
                        <Cpu className="h-8 w-8 md:h-12 md:w-12 text-white" />
                      </div>
                      <div className="aspect-square rounded-xl md:rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#14B8A6] p-3 md:p-4 flex items-center justify-center">
                        <Building2 className="h-8 w-8 md:h-12 md:w-12 text-white" />
                      </div>
                      <div className="aspect-square rounded-xl md:rounded-2xl bg-gradient-to-br from-[#10B981] to-[#14B8A6] p-3 md:p-4 flex items-center justify-center">
                        <BarChart3 className="h-8 w-8 md:h-12 md:w-12 text-white" />
                      </div>
                      <div className="aspect-square rounded-xl md:rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#EF4444] p-3 md:p-4 flex items-center justify-center">
                        <Rocket className="h-8 w-8 md:h-12 md:w-12 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-12 md:py-20 px-4 md:px-6 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 md:mb-16 text-center">
            <h2 className="mb-3 md:mb-4 text-2xl md:text-4xl lg:text-5xl font-bold">
              {t('landing.projects.title')}
            </h2>
            <p className="text-base md:text-xl text-muted-foreground">
              {t('landing.projects.subtitle')}
            </p>
          </div>

          {/* Mobile: Vertical Stack - All Projects Visible */}
          <div className="md:hidden space-y-4">
            {projects.map((project, index) => (
              <div key={project.id}>
                <AnimatedOceanCard delay={index * 0.1}>
                  <div 
                    className="relative overflow-hidden p-6"
                    style={
                      project.id === 'thailand-car'
                        ? {
                            backgroundImage: `url(${thailandBg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : project.id === 'ai-organizer'
                        ? {
                            backgroundImage: `url(${saturwayBg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : undefined
                    }
                  >
                    {/* Overlay for projects with background */}
                    {project.id === 'thailand-car' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0D9488]/50 to-[#14B8A6]/45" />
                    )}
                    {project.id === 'ai-organizer' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#4A9FD8]/50 to-[#52C9C1]/45" />
                    )}

                    <div className="relative z-10">
                      {/* Project Header */}
                      <div className="mb-4 flex items-start justify-between">
                        <div
                          className={`flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-xl md:rounded-2xl bg-gradient-to-br ${project.gradient} ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'shadow-lg' : ''}`}
                        >
                          <project.icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                        </div>
                        <div className={`inline-flex items-center gap-1.5 md:gap-2 rounded-full ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'bg-white/20 backdrop-blur-sm' : 'bg-green-500/10'} px-2.5 md:px-3 py-1 text-xs md:text-sm ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'text-white' : 'text-green-600'}`}>
                          <div className={`h-1.5 w-1.5 md:h-2 md:w-2 rounded-full ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'bg-white' : 'bg-green-500'}`}></div>
                          {t('landing.projects.active')}
                        </div>
                      </div>

                      {/* Project Info */}
                      <div className={`mb-1.5 text-xs md:text-sm ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {project.category}
                      </div>
                      <h3 className={`mb-2.5 text-xl md:text-2xl font-bold ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'text-white' : ''}`}>
                        {project.name}
                      </h3>
                      <p className={`mb-4 md:mb-6 text-sm md:text-base leading-relaxed ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'text-white/90' : 'text-muted-foreground'}`}>
                        {project.description}
                      </p>

                      {/* Metrics */}
                      <div className="mb-4 md:mb-6 grid grid-cols-2 gap-2 md:gap-3">
                        {Object.entries(project.metrics).slice(0, 4).map(([key, value], idx) => (
                          <div 
                            key={idx} 
                            className={`rounded-lg border p-2 md:p-3 text-center ${
                              (project.id === 'thailand-car' || project.id === 'ai-organizer')
                                ? 'border-white/30 bg-white/20 backdrop-blur-sm' 
                                : 'border-border bg-muted/30'
                            }`}
                          >
                            <div className={`text-base md:text-lg font-bold ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'text-white' : ''}`} style={(project.id !== 'thailand-car' && project.id !== 'ai-organizer') ? { color: project.colors.primary } : undefined}>
                              {value}
                            </div>
                            <div className={`text-[10px] md:text-xs capitalize ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'text-white/80' : 'text-muted-foreground'}`}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* CTA - Touch Friendly */}
                      <button
                        onClick={() => setSelectedProject(project)}
                        className={`group/btn flex w-full min-h-[52px] md:min-h-[56px] items-center justify-center gap-2 rounded-xl px-5 md:px-6 py-3 md:py-4 text-sm md:text-base text-white transition-all hover:shadow-lg active:scale-95 ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'shadow-xl' : ''}`}
                        style={{
                          background: `linear-gradient(135deg, ${project.colors.primary}, ${project.colors.secondary})`,
                        }}
                      >
                        {t('landing.projects.viewDetails')}
                        <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </AnimatedOceanCard>
              </div>
            ))}
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid gap-8 md:grid-cols-2">
            {projects.map((project) => (
              <div key={project.id} className="group">
                <AnimatedOceanCard delay={0}>
                  <div 
                    className="relative overflow-hidden p-8"
                    style={
                      project.id === 'thailand-car'
                        ? {
                            backgroundImage: `url(${thailandBg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : project.id === 'ai-organizer'
                        ? {
                            backgroundImage: `url(${saturwayBg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : undefined
                    }
                  >
                    {/* Overlay for projects with background */}
                    {project.id === 'thailand-car' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0D9488]/50 to-[#14B8A6]/45" />
                    )}
                    {project.id === 'ai-organizer' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#4A9FD8]/50 to-[#52C9C1]/45" />
                    )}

                    <div className="relative z-10">
                      {/* Project Header */}
                      <div className="mb-6 flex items-start justify-between">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${project.gradient} ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'shadow-lg' : ''}`}
                        >
                          <project.icon className="h-8 w-8 text-white" />
                        </div>
                        <div className={`inline-flex items-center gap-2 rounded-full ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'bg-white/20 backdrop-blur-sm' : 'bg-green-500/10'} px-3 py-1 text-sm ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'text-white' : 'text-green-600'}`}>
                          <div className={`h-2 w-2 rounded-full ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'bg-white' : 'bg-green-500'}`}></div>
                          {t('landing.projects.active')}
                        </div>
                      </div>

                      {/* Project Info */}
                      <div className={`mb-2 text-sm ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {project.category}
                      </div>
                      <h3 className={`mb-3 text-2xl font-bold ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'text-white' : ''}`}>
                        {project.name}
                      </h3>
                      <p className={`mb-6 leading-relaxed ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'text-white/90' : 'text-muted-foreground'}`}>
                        {project.description}
                      </p>

                      {/* Metrics */}
                      <div className="mb-6 grid grid-cols-2 gap-3">
                        {Object.entries(project.metrics).slice(0, 4).map(([key, value], idx) => (
                          <div 
                            key={idx} 
                            className={`rounded-lg border p-3 text-center ${
                              (project.id === 'thailand-car' || project.id === 'ai-organizer')
                                ? 'border-white/30 bg-white/20 backdrop-blur-sm' 
                                : 'border-border bg-muted/30'
                            }`}
                          >
                            <div className={`text-lg font-bold ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'text-white' : ''}`} style={(project.id !== 'thailand-car' && project.id !== 'ai-organizer') ? { color: project.colors.primary } : undefined}>
                              {value}
                            </div>
                            <div className={`text-xs capitalize ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'text-white/80' : 'text-muted-foreground'}`}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* CTA - Touch Friendly */}
                      <button
                        onClick={() => setSelectedProject(project)}
                        className={`group/btn flex w-full min-h-[56px] items-center justify-center gap-2 rounded-xl px-6 py-4 text-white transition-all hover:shadow-lg active:scale-95 ${(project.id === 'thailand-car' || project.id === 'ai-organizer') ? 'shadow-xl' : ''}`}
                        style={{
                          background: `linear-gradient(135deg, ${project.colors.primary}, ${project.colors.secondary})`,
                        }}
                      >
                        {t('landing.projects.viewDetails')}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </AnimatedOceanCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-12 md:py-20 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          {/* AI Organizer Section */}
          <div className="mb-8 md:mb-16 text-center">
            <h2 className="mb-3 md:mb-4 text-2xl md:text-4xl lg:text-5xl font-bold">
              {t('landing.howItWorks.title')}
            </h2>
            <p className="text-base md:text-xl text-muted-foreground">
              {t('landing.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid gap-4 md:gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: t('landing.howItWorks.step1.title'),
                description: t('landing.howItWorks.step1.desc'),
                icon: Smartphone,
                color: '#6366F1',
              },
              {
                step: '2',
                title: t('landing.howItWorks.step2.title'),
                description: t('landing.howItWorks.step2.desc'),
                icon: Zap,
                color: '#8B5CF6',
              },
              {
                step: '3',
                title: t('landing.howItWorks.step3.title'),
                description: t('landing.howItWorks.step3.desc'),
                icon: CheckCircle2,
                color: '#10B981',
              },
            ].map((step, index) => (
              <div key={index}>
                <AnimatedOceanCard delay={0}>
                  <div className="p-4 md:p-6 text-center">
                    <div className="relative mx-auto mb-4 md:mb-6 inline-block">
                      <div
                        className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${step.color}40, ${step.color}20)`,
                        }}
                      >
                        <step.icon className="h-8 w-8 md:h-10 md:w-10" style={{ color: step.color }} />
                      </div>
                      <div
                        className="absolute -right-1 -top-1 md:-right-2 md:-top-2 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full text-white text-sm md:text-base"
                        style={{
                          background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                        }}
                      >
                        <span className="font-bold">{step.step}</span>
                      </div>
                    </div>
                    <h3 className="mb-2 md:mb-3 text-lg md:text-xl font-semibold">{step.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground">{step.description}</p>
                  </div>
                </AnimatedOceanCard>
              </div>
            ))}
          </div>

          {/* Thailand My Car Section */}
          <div className="mt-16 md:mt-32">
            <div className="mb-8 md:mb-16 text-center">
              <h2 className="mb-3 md:mb-4 text-2xl md:text-4xl lg:text-5xl font-bold">
                {t('landing.thailand.title')}
              </h2>
              <p className="text-base md:text-xl text-muted-foreground">
                {t('landing.thailand.subtitle')}
              </p>
            </div>

            <div className="grid gap-4 md:gap-8 md:grid-cols-3">
              {[
                {
                  step: '1',
                  title: t('landing.thailand.step1.title'),
                  description: t('landing.thailand.step1.desc'),
                  icon: Building2,
                  color: '#F59E0B',
                },
                {
                  step: '2',
                  title: t('landing.thailand.step2.title'),
                  description: t('landing.thailand.step2.desc'),
                  icon: Coins,
                  color: '#10B981',
                },
                {
                  step: '3',
                  title: t('landing.thailand.step3.title'),
                  description: t('landing.thailand.step3.desc'),
                  icon: BarChart3,
                  color: '#6366F1',
                },
              ].map((step, index) => (
                <div key={index}>
                  <AnimatedOceanCard delay={0.1}>
                    <div className="p-4 md:p-6 text-center">
                      <div className="relative mx-auto mb-4 md:mb-6 inline-block">
                        <div
                          className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full"
                          style={{
                            background: `linear-gradient(135deg, ${step.color}40, ${step.color}20)`,
                          }}
                        >
                          <step.icon className="h-8 w-8 md:h-10 md:w-10" style={{ color: step.color }} />
                        </div>
                        <div
                          className="absolute -right-1 -top-1 md:-right-2 md:-top-2 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full text-white text-sm md:text-base"
                          style={{
                            background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                          }}
                        >
                          <span className="font-bold">{step.step}</span>
                        </div>
                      </div>
                      <h3 className="mb-2 md:mb-3 text-lg md:text-xl font-semibold">{step.title}</h3>
                      <p className="text-sm md:text-base text-muted-foreground">{step.description}</p>
                    </div>
                  </AnimatedOceanCard>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Saturway Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 md:mb-16 text-center">
            <h2 className="mb-3 md:mb-4 text-2xl md:text-4xl lg:text-5xl font-bold">
              {t('landing.whySaturway.title')}
            </h2>
            <p className="text-base md:text-xl text-muted-foreground">
              {t('landing.whySaturway.subtitle')}
            </p>
          </div>

          <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-3 md:gap-4 rounded-xl border border-border bg-card p-4 md:p-6 text-center transition-all hover:shadow-md"
              >
                <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
                  <benefit.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <span className="text-sm md:text-base font-medium leading-snug">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 md:py-20 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 md:mb-16 text-center">
            <h2 className="mb-3 md:mb-4 text-2xl md:text-4xl lg:text-5xl font-bold">
              {t('landing.testimonials.title')}
            </h2>
            <p className="text-base md:text-xl text-muted-foreground">
              {t('landing.testimonials.subtitle')}
            </p>
          </div>

          <div className="flex justify-center">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="max-w-2xl w-full">
                <AnimatedOceanCard delay={0}>
                  <div className="p-4 md:p-6">
                    <div className="mb-3 md:mb-4 flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 md:h-5 md:w-5 fill-[#FFD93D] text-[#FFD93D]" />
                      ))}
                    </div>
                    <p className="mb-4 md:mb-6 text-sm md:text-base text-muted-foreground">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div 
                        className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${testimonial.color}, ${testimonial.color}dd)`,
                        }}
                      >
                        <testimonial.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm md:text-base font-semibold">{testimonial.name}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedOceanCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div>
            <AnimatedOceanCard>
              <div className="bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20 p-6 md:p-12">
                <div className="mb-8 md:mb-12 text-center">
                  <h2 className="mb-3 md:mb-4 text-2xl md:text-4xl lg:text-5xl font-bold">
                    {t('landing.cta.title')}
                  </h2>
                  <p className="text-base md:text-xl text-muted-foreground">
                    {t('landing.cta.subtitle')}
                  </p>
                </div>
                
                <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                  {/* AI Organizer CTA */}
                  <div className="rounded-xl md:rounded-2xl border-2 border-[#4A9FD8]/30 bg-gradient-to-br from-[#4A9FD8]/10 to-[#52C9C1]/10 p-6 md:p-8 text-center">
                    <div className="mb-3 md:mb-4 flex h-12 w-12 md:h-16 md:w-16 mx-auto items-center justify-center rounded-xl md:rounded-2xl bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1]">
                      <Brain className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                    <h3 className="mb-2 text-xl md:text-2xl font-bold">
                      {t('landing.projects.aiOrganizer.name')}
                    </h3>
                    <p className="mb-4 md:mb-6 text-xs md:text-sm text-muted-foreground">
                      {t('landing.cta.aiOrganizerDesc')}
                    </p>
                    <button
                      onClick={() => window.open('https://t.me/saturway_bot', '_blank')}
                      className="w-full min-h-[52px] md:min-h-[56px] rounded-xl bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] px-6 md:px-8 py-3 md:py-4 text-sm md:text-base text-white transition-all hover:shadow-lg active:scale-95"
                    >
                      {t('landing.cta.aiOrganizerBtn')}
                    </button>
                  </div>

                  {/* Thailand My Car CTA */}
                  <div className="rounded-xl md:rounded-2xl border-2 border-[#0D9488]/30 bg-gradient-to-br from-[#0D9488]/10 to-[#14B8A6]/10 p-6 md:p-8 text-center">
                    <div className="mb-3 md:mb-4 flex h-12 w-12 md:h-16 md:w-16 mx-auto items-center justify-center rounded-xl md:rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#14B8A6]">
                      <Car className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                    <h3 className="mb-2 text-xl md:text-2xl font-bold">
                      {t('landing.projects.thailandCar.name')}
                    </h3>
                    <p className="mb-4 md:mb-6 text-xs md:text-sm text-muted-foreground">
                      {t('landing.cta.thailandCarDesc')}
                    </p>
                    <button
                      onClick={() => window.open('https://saturway.space/thailand-my-car/', '_blank')}
                      className="w-full min-h-[52px] md:min-h-[56px] rounded-xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] px-6 md:px-8 py-3 md:py-4 text-sm md:text-base text-white transition-all hover:shadow-lg active:scale-95"
                    >
                      {t('landing.cta.thailandCarBtn')}
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedOceanCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 md:py-12 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:gap-8 grid-cols-2 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-3 md:mb-4 flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] p-1">
                  <img src={logoImage} alt="Saturway" className="h-full w-full object-contain" />
                </div>
                <span className="text-lg md:text-xl font-bold">Saturway</span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                {t('landing.footer.tagline')}
              </p>
            </div>
            
            <div>
              <h4 className="mb-3 md:mb-4 text-sm md:text-base font-semibold">{t('landing.footer.product')}</h4>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
                <li><a href="#projects" className="hover:text-foreground">{t('landing.footer.features')}</a></li>
                <li><a href="#" className="hover:text-foreground">{t('landing.footer.pricing')}</a></li>
                <li><a href="#" className="hover:text-foreground">{t('landing.footer.roadmap')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-3 md:mb-4 text-sm md:text-base font-semibold">{t('landing.footer.company')}</h4>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">{t('landing.footer.about')}</a></li>
                <li><a href="#" className="hover:text-foreground">{t('landing.footer.blog')}</a></li>
                <li><a href="#" className="hover:text-foreground">{t('landing.footer.contact')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-3 md:mb-4 text-sm md:text-base font-semibold">{t('landing.footer.legal')}</h4>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">{t('landing.footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-foreground">{t('landing.footer.terms')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 md:mt-12 border-t border-border/50 pt-6 md:pt-8 text-center text-xs md:text-sm text-muted-foreground">
            © 2025 Saturway. {t('landing.footer.rights')}
          </div>
        </div>
      </footer>

      {/* Project Modal - Desktop */}
      {!isMobile && (
        <ProjectModal
          isOpen={selectedProject !== null}
          onClose={() => setSelectedProject(null)}
          project={selectedProject || projects[0]}
        />
      )}

      {/* Mobile Bottom Sheet - Mobile */}
      {isMobile && (
        <MobileBottomSheet
          isOpen={selectedProject !== null}
          onClose={() => setSelectedProject(null)}
          project={selectedProject || projects[0]}
        />
      )}

      {/* Cookie Consent */}
      <CookieConsent />
    </div>
  );
}