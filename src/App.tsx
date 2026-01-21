import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { CheckCircle, RefreshCw, Circle, Scale, Mail, Send, Youtube, AlertTriangle } from 'lucide-react';
import { ThailandHeader } from './components/thailand/ThailandHeader';
import { Hero } from './components/thailand/Hero';
import { AboutProject } from './components/thailand/AboutProject';
import { InvestmentTiers } from './components/thailand/InvestmentTiers';
import { CookieBanner } from './components/CookieBanner';
import { api } from './services/api';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import thailandBackground from 'figma:asset/59d824e2939479d4d11bed23e1809802ce6352f5.png';

// Lazy load heavy components (reduces initial bundle by ~300KB)
const InvestModal = lazy(() => import('./components/thailand/InvestModal').then(m => ({ default: m.InvestModal })));
const ChatWidget = lazy(() => import('./components/ChatWidget').then(m => ({ default: m.ChatWidget })));
const ProfilePage = lazy(() => import('./components/thailand/ProfilePage').then(m => ({ default: m.ProfilePage })));
const InvestorDashboard = lazy(() => import('./components/InvestorDashboard').then(m => ({ default: m.InvestorDashboard })));

// Loading fallback component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
      style={{ borderColor: '#009696', borderTopColor: 'transparent' }}
    />
  </div>
);

interface TierData {
  id: number;
  name: string;
  description: string;
  min_investment_baht: string;
  min_investment_usd: string;
  duration_months: number;
  return_percentage: string | null;
  features: string[];
}

// ✅ FIX #1: FALLBACK_TIERS вынесен из компонента - создаётся один раз!
const FALLBACK_TIERS: TierData[] = [
  {
    id: 3,  // ID из базы данных
    name: 'Стейкинг',
    description: 'Пассивный доход с гибкими условиями вывода',
    min_investment_baht: '31900',
    min_investment_usd: '1000',
    duration_months: 0,
    return_percentage: '20.4',
    features: [
      '1.7% в месяц (20.4% годовых)',
      'Вывод в любой момент',
      '5% комиссия при выводе до 6 мес',
      'Ежемесячное начисление процентов'
    ]
  },
  {
    id: 4,  // ID из базы данных
    name: 'Доля в автомобиле',
    description: 'Получите автомобиль в собственность или гарантированный возврат',
    min_investment_baht: '395560',
    min_investment_usd: '12400',
    duration_months: 6,
    return_percentage: null,
    features: [
      'Через 6 мес: +20% возврат ИЛИ ждать авто',
      'Автомобиль в собственность после выплаты кредита',
      'Приоритет: кто первый - тот получает авто',
      'Можно изменить выбор до закрытия кредита'
    ]
  }
];

// Main App wrapper with LanguageProvider
export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

// ✅ FIX: Функция для парсинга URL в tab
const getTabFromPath = (pathname: string): string => {
  const path = pathname.replace(/^\/thailand-my-car\/?/, '/').replace(/\/$/, '') || '/';
  const validTabs = ['home', 'about', 'invest', 'dashboard', 'profile', 'roadmap', 'contact'];
  const tab = path === '/' ? 'home' : path.slice(1);
  return validTabs.includes(tab) ? tab : 'home';
};

function AppContent() {
  const { language, setLanguage, t } = useLanguage();
  const [isDark, setIsDark] = useState(true);
  // ✅ FIX: Инициализируем activeTab из URL
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(window.location.pathname));
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tiers, setTiers] = useState<TierData[]>([]);
  const [selectedTier, setSelectedTier] = useState<TierData | null>(null);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);

  // ✅ FIX: Слушаем browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const newTab = getTabFromPath(window.location.pathname);
      setActiveTab(newTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Track page view
  useEffect(() => {
    const page = window.location.pathname + window.location.search;
    const referrer = document.referrer || undefined;

    api.trackPageView(page, referrer).catch(() => {});
  }, []);

  // Load tiers from API with fallback
  useEffect(() => {
    const loadTiers = async () => {
      const response = await api.getInvestmentTiers();
      if (response.data && response.data.length > 0) {
        setTiers(response.data);
      } else {
        setTiers(FALLBACK_TIERS);
      }
    };
    loadTiers();
  }, []);

  // ✅ FIX #2: Мемоизировать callback для ThailandHeader (остановит бесконечный цикл!)
  const handleWalletChange = useCallback((address: string | null) => {
    setWalletAddress(address);
  }, []);

  const handleInvest = useCallback((tierId: number) => {
    if (!walletAddress) {
      alert(t('alert.connectWallet'));
      return;
    }

    const tier = tiers.find(t => t.id === tierId);
    if (tier) {
      setSelectedTier(tier);
      setIsInvestModalOpen(true);
    }
  }, [walletAddress, tiers, t]);

  const handleInvestSuccess = useCallback(() => {
    // Refresh data or show notification
  }, []);

  const scrollToInvest = useCallback(() => {
    setActiveTab('invest');
    // Scroll to investment section
    setTimeout(() => {
      const investSection = document.getElementById('investment-section');
      if (investSection) {
        investSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);

    // ✅ FIX: Обновляем URL без перезагрузки страницы
    const basePath = window.location.pathname.includes('/thailand-my-car') ? '/thailand-my-car' : '';
    const newPath = tab === 'home' ? basePath || '/' : `${basePath}/${tab}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState({ tab }, '', newPath);
    }

    // Scroll to corresponding section
    if (tab === 'about') {
      setTimeout(() => {
        const aboutSection = document.getElementById('about-section');
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (tab === 'invest') {
      setTimeout(() => {
        const investSection = document.getElementById('investment-section');
        if (investSection) {
          investSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500"
      style={{
        background: isDark 
          ? 'linear-gradient(135deg, #143C50 0%, #0a2030 100%)'
          : 'linear-gradient(135deg, #FFFAF0 0%, #f5e6d3 100%)'
      }}
    >
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src={thailandBackground}
          alt="Thailand road background"
          className="w-full h-full object-cover"
          style={{ 
            opacity: isDark ? 0.2 : 0.25
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: isDark 
              ? 'linear-gradient(135deg, rgba(0, 150, 150, 0.15) 0%, rgba(40, 180, 140, 0.1) 50%, rgba(255, 200, 80, 0.08) 100%)'
              : 'linear-gradient(135deg, rgba(255, 250, 240, 0.1) 0%, rgba(0, 150, 150, 0.05) 50%, rgba(245, 230, 211, 0.1) 100%)'
          }}
        />
      </div>

      {/* Decorative background patterns */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(0, 150, 150, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 80% 70%, rgba(255, 200, 80, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 50% 50%, rgba(40, 180, 140, 0.1) 0%, transparent 50%)`
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <ThailandHeader
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          walletAddress={walletAddress}
          onWalletChange={handleWalletChange}
          language={language}
          onLanguageChange={setLanguage}
        />

        <main>
          {/* ✅ FIX #9: Hero только на home (остановит видео на других табах!) */}
          {activeTab === 'home' && (
            <Hero
              isDark={isDark}
              onInvestClick={scrollToInvest}
              walletConnected={!!walletAddress}
            />
          )}

          {/* About Section */}
          {(activeTab === 'home' || activeTab === 'about') && (
            <section id="about-section">
              <AboutProject isDark={isDark} />
            </section>
          )}

          {/* Investment Tiers Section */}
          {(activeTab === 'home' || activeTab === 'invest') && (
            <section id="investment-section">
              <InvestmentTiers 
                isDark={isDark}
                walletConnected={!!walletAddress}
                onInvest={handleInvest}
              />
            </section>
          )}

          {/* Dashboard Section */}
          {activeTab === 'dashboard' && (
            <Suspense fallback={<LoadingSpinner />}>
              <InvestorDashboard
                walletAddress={walletAddress}
              />
            </Suspense>
          )}

          {/* Profile Section */}
          {activeTab === 'profile' && (
            <Suspense fallback={<LoadingSpinner />}>
              <ProfilePage
                walletAddress={walletAddress}
                onBack={() => setActiveTab('home')}
                isDark={isDark}
              />
            </Suspense>
          )}

          {/* Roadmap Section */}
          {activeTab === 'roadmap' && (
            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="text-center mb-12">
                <h2 
                  className="text-3xl md:text-4xl lg:text-5xl mb-6" 
                  style={{ 
                    background: 'linear-gradient(135deg, #FFC850 0%, #40E0D0 50%, #FFC850 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    textShadow: '0 0 40px rgba(64, 224, 208, 0.3)',
                    filter: 'drop-shadow(0 0 20px rgba(255, 200, 80, 0.4))'
                  }}
                >
                  {t('roadmap.title')}
                </h2>
                <div 
                  className="w-32 h-1 mx-auto mb-6 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #40E0D0, #FFC850, #40E0D0, transparent)',
                    boxShadow: '0 0 20px rgba(64, 224, 208, 0.5)'
                  }}
                />
                <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{
                  color: isDark ? '#FFFAF0' : '#143C50',
                  opacity: 0.8,
                  lineHeight: 1.6
                }}>
                  {t('roadmap.subtitle')}
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { quarter: t('roadmap.q4_2025'), title: t('roadmap.launch'), status: 'completed', items: t('roadmap.launchItems').split('|') },
                  { quarter: t('roadmap.dec_jan'), title: t('roadmap.fundraising'), status: 'current', items: t('roadmap.fundraisingItems').split('|') },
                  { quarter: t('roadmap.jan_2026'), title: t('roadmap.roundClose'), status: 'upcoming', items: t('roadmap.roundCloseItems').split('|') },
                  { quarter: t('roadmap.feb_2026'), title: t('roadmap.legal'), status: 'upcoming', items: t('roadmap.legalItems').split('|') },
                  { quarter: t('roadmap.mar_2026'), title: t('roadmap.firstPayouts'), status: 'upcoming', items: t('roadmap.firstPayoutsItems').split('|') },
                  { quarter: t('roadmap.jul_2026'), title: t('roadmap.expansion'), status: 'upcoming', items: t('roadmap.expansionItems').split('|') },
                  { quarter: t('roadmap.oct_2026'), title: t('roadmap.newProducts'), status: 'upcoming', items: t('roadmap.newProductsItems').split('|') },
                  { quarter: t('roadmap.2027'), title: t('roadmap.continued'), status: 'upcoming', items: t('roadmap.continuedItems').split('|') },
                ].map((milestone, index) => (
                  <div key={index} className="rounded-2xl p-4 md:p-6 backdrop-blur-xl border"
                    style={{
                      background: isDark 
                        ? 'linear-gradient(135deg, rgba(26, 78, 100, 0.6) 0%, rgba(20, 60, 80, 0.4) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 250, 240, 0.7) 100%)',
                      borderColor: milestone.status === 'current' 
                        ? '#FFC850' 
                        : isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: milestone.status === 'completed' ? '#28B48C' :
                                         milestone.status === 'current' ? '#FFC850' :
                                         isDark ? 'rgba(255, 250, 240, 0.2)' : 'rgba(20, 60, 80, 0.2)'
                        }}
                      >
                        {milestone.status === 'completed' && <CheckCircle className="w-6 h-6" style={{ color: '#FFFAF0' }} />}
                        {milestone.status === 'current' && <RefreshCw className="w-6 h-6" style={{ color: '#FFFAF0' }} />}
                        {milestone.status === 'upcoming' && <Circle className="w-6 h-6" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl" style={{ 
                            color: isDark ? '#FFC850' : '#143C50',
                            fontWeight: 600
                          }}>
                            {milestone.title}
                          </h3>
                          <span className="text-sm px-3 py-1 rounded-full" style={{
                            backgroundColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)',
                            color: '#009696'
                          }}>
                            {milestone.quarter}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {milestone.items.map((item, i) => (
                            <li key={i} className="text-sm" style={{ 
                              color: isDark ? '#FFFAF0' : '#143C50',
                              opacity: 0.8
                            }}>
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="mt-8 p-4 rounded-xl text-sm" style={{
                backgroundColor: isDark ? 'rgba(255, 250, 240, 0.05)' : 'rgba(20, 60, 80, 0.05)',
                color: isDark ? '#FFFAF0' : '#143C50',
                opacity: 0.7
              }}>
                <div className="flex items-start gap-3 justify-center">
                  <Scale className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#009696' }} />
                  <p className="text-left max-w-2xl">
                    {t('roadmap.disclaimer')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t py-12 mt-16"
          style={{
            borderColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(20, 60, 80, 0.1)'
          }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-8">
              <h4 className="text-lg mb-4" style={{
                color: isDark ? '#FFC850' : '#143C50',
                fontWeight: 600
              }}>
                {t('footer.contacts')}
              </h4>
              <div className="flex items-center justify-center gap-4">
                <a
                  href="mailto:cloudjasmin8@gmail.com"
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(30, 60, 80, 0.9)' : 'rgba(20, 40, 60, 0.8)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                  title="Email"
                >
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" style={{ color: '#FFFAF0' }} />
                </a>
                <a
                  href="https://t.me/+YAG8PnZr-dhiZDM6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(30, 60, 80, 0.9)' : 'rgba(20, 40, 60, 0.8)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                  title="Telegram"
                >
                  <Send className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" style={{ color: '#FFFAF0' }} />
                </a>
                <a
                  href="https://youtube.com/@saturway-123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(30, 60, 80, 0.9)' : 'rgba(20, 40, 60, 0.8)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                  title="YouTube"
                >
                  <Youtube className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" style={{ color: '#FFFAF0' }} />
                </a>
              </div>
            </div>
            <div className="pt-8 border-t text-center text-sm opacity-70"
              style={{
                borderColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(20, 60, 80, 0.1)',
                color: isDark ? '#FFFAF0' : '#143C50'
              }}
            >
              <p className="mb-2">© 2025 Thailand My Car. {t('footer.rights')}.</p>
              <p className="text-xs flex items-start justify-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#FFC850' }} />
                <span>{t('footer.disclaimer')}</span>
              </p>
            </div>
          </div>
        </footer>

        {/* Support Button */}
        <Suspense fallback={null}>
          <ChatWidget isDark={isDark} />
        </Suspense>
      </div>

      {/* Invest Modal */}
      {isInvestModalOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div></div>}>
          <InvestModal
            isOpen={isInvestModalOpen}
            onClose={() => setIsInvestModalOpen(false)}
            tier={selectedTier}
            walletAddress={walletAddress || ''}
            isDark={isDark}
            onSuccess={handleInvestSuccess}
          />
        </Suspense>
      )}

      {/* Cookie Consent Banner */}
      <CookieBanner />
    </div>
  );
}