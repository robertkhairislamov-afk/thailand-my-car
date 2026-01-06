import { useState, useEffect } from 'react';
import { CheckCircle, RefreshCw, Circle, Scale } from 'lucide-react';
import { ThailandHeader } from './components/thailand/ThailandHeader';
import { Hero } from './components/thailand/Hero';
import { AboutProject } from './components/thailand/AboutProject';
import { InvestmentTiers } from './components/thailand/InvestmentTiers';
import { InvestModal } from './components/thailand/InvestModal';
import { ChatWidget } from './components/ChatWidget';
import { ProfilePage } from './components/thailand/ProfilePage';
import { InvestorDashboard } from './components/InvestorDashboard';
import { CookieBanner } from './components/CookieBanner';
import AdminApp from './AdminApp';
import { api } from './services/api';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import thailandBackground from 'figma:asset/cf6408d866e0ed42961c4b9ae724562d08a2e003.png';

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

// Main App wrapper with LanguageProvider
export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

function AppContent() {
  const { language, setLanguage, t } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [tiers, setTiers] = useState<TierData[]>([]);
  const [selectedTier, setSelectedTier] = useState<TierData | null>(null);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);

  // Track page view
  useEffect(() => {
    // Не трекаем админку
    if (window.location.pathname.includes("admin")) return;
    
    const page = window.location.pathname + window.location.search;
    const referrer = document.referrer || undefined;
    
    api.trackPageView(page, referrer).catch(() => {});
  }, []);

  // Check URL for admin route (only on saturway.com, not on saturway.space)
  useEffect(() => {
    const path = window.location.pathname;
    const host = window.location.hostname;

    // Admin only available on saturway.com
    const isAdminHost = host === 'saturway.com' || host === 'www.saturway.com' || host === 'localhost';

    setIsAdminRoute(
      isAdminHost && (
        path === '/thailand-my-car/admin' ||
        path.startsWith('/thailand-my-car/admin/') ||
        path === '/thailand-my-car_admin/admin' ||
        path.startsWith('/thailand-my-car_admin/admin/')
      )
    );
  }, []);

  // Load tiers
  useEffect(() => {
    const loadTiers = async () => {
      const response = await api.getInvestmentTiers();
      if (response.data) {
        setTiers(response.data);
      }
    };
    loadTiers();
  }, []);

  // Render admin app if on admin route
  if (isAdminRoute) {
    return <AdminApp />;
  }

  const handleInvest = (tierId: number) => {
    if (!walletAddress) {
      alert(t('alert.connectWallet'));
      return;
    }

    const tier = tiers.find(t => t.id === tierId);
    if (tier) {
      setSelectedTier(tier);
      setIsInvestModalOpen(true);
    }
  };

  const handleInvestSuccess = () => {
    // Refresh data or show notification
    console.log('Investment created successfully');
  };

  const scrollToInvest = () => {
    setActiveTab('invest');
    // Scroll to investment section
    setTimeout(() => {
      const investSection = document.getElementById('investment-section');
      if (investSection) {
        investSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

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
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500`}
      style={{
        background: isDark 
          ? 'linear-gradient(135deg, #143C50 0%, #0a2030 100%)'
          : 'linear-gradient(135deg, #FFFAF0 0%, #f5e6d3 100%)'
      }}
    >
      {/* Thailand Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
        style={{ 
          backgroundImage: `url(${thailandBackground})`,
          opacity: isDark ? 0.4 : 0.5
        }}
      />
      
      {/* Overlay gradient for better contrast and color tint */}
      <div 
        className="fixed inset-0 transition-opacity duration-500"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(20, 60, 80, 0.5) 0%, rgba(10, 32, 48, 0.6) 100%)'
            : 'linear-gradient(135deg, rgba(255, 250, 240, 0.5) 0%, rgba(245, 230, 211, 0.6) 100%)'
        }}
      />

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
          onWalletChange={setWalletAddress}
          language={language}
          onLanguageChange={setLanguage}
        />

        <main>
          {/* Hero Section - Always visible */}
          {(activeTab === 'home' || activeTab === 'about' || activeTab === 'invest') && (
            <Hero 
              isDark={isDark}
              onInvestClick={scrollToInvest}
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
            <InvestorDashboard
              walletAddress={walletAddress}
            />
          )}

          {/* Profile Section */}
          {activeTab === 'profile' && (
            <ProfilePage
              walletAddress={walletAddress}
              onBack={() => setActiveTab('home')}
              isDark={isDark}
            />
          )}

          {/* Roadmap Section - Coming Soon */}
          {activeTab === 'roadmap' && (
            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4" style={{
                  color: isDark ? '#FFC850' : '#143C50',
                  fontWeight: 700
                }}>
                  {t('roadmap.title')}
                </h2>
                <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{
                  color: isDark ? '#FFFAF0' : '#143C50',
                  opacity: 0.8
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
                  <div key={index} className="rounded-2xl p-6 backdrop-blur-xl border"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h4 className="text-lg mb-3" style={{
                  color: isDark ? '#FFC850' : '#143C50',
                  fontWeight: 600
                }}>
                  Thailand My Car
                </h4>
                <p className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  {t('footer.description')}
                </p>
              </div>
              <div>
                <h4 className="text-lg mb-3" style={{
                  color: isDark ? '#FFC850' : '#143C50',
                  fontWeight: 600
                }}>
                  {t('footer.contacts')}
                </h4>
                <div className="space-y-2 text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  <a
                    href="mailto:cloudjasmin8@gmail.com"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                  >
                    📧 cloudjasmin8@gmail.com
                  </a>
                  <a
                    href="https://t.me/+YAG8PnZr-dhiZDM6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                  >
                    💬 Telegram: @thailandmycar
                  </a>
                  <a
                    href="https://youtube.com/@saturway-123"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                  >
                    📺 YouTube: @saturway-123
                  </a>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t text-center text-sm opacity-70"
              style={{
                borderColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(20, 60, 80, 0.1)',
                color: isDark ? '#FFFAF0' : '#143C50'
              }}
            >
              <p className="mb-2">© 2025 Thailand My Car. {t('footer.rights')}.</p>
              <p className="text-xs">
                ⚠️ {t('footer.disclaimer')}
              </p>
            </div>
          </div>
        </footer>

        {/* Support Button */}
        <ChatWidget isDark={isDark} />
      </div>

      {/* Invest Modal */}
      <InvestModal
        isOpen={isInvestModalOpen}
        onClose={() => setIsInvestModalOpen(false)}
        tier={selectedTier}
        walletAddress={walletAddress || ''}
        isDark={isDark}
        onSuccess={handleInvestSuccess}
      />

      {/* Cookie Consent Banner */}
      <CookieBanner />
    </div>
  );
}