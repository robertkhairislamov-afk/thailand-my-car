import { useState, useEffect } from 'react';
import { ThailandHeader } from './components/thailand/ThailandHeader';
import { Hero } from './components/thailand/Hero';
import { AboutProject } from './components/thailand/AboutProject';
import { InvestmentTiers } from './components/thailand/InvestmentTiers';
import AdminApp from './AdminApp';
import thailandBackground from 'figma:asset/cf6408d866e0ed42961c4b9ae724562d08a2e003.png';

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  // Check URL for admin route
  useEffect(() => {
    setIsAdminRoute(window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/'));
  }, []);

  // Render admin app if on admin route
  if (isAdminRoute) {
    return <AdminApp />;
  }

  const handleInvest = (tier: number) => {
    if (!walletAddress) {
      alert('Пожалуйста, подключите кошелек для инвестирования');
      return;
    }
    
    // Here would be the smart contract interaction
    console.log(`Investing in tier ${tier} from wallet ${walletAddress}`);
    alert(`Инвестиция в Tier ${tier} будет доступна после деплоя смарт-контракта`);
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
          onTabChange={setActiveTab}
          walletAddress={walletAddress}
          onWalletChange={setWalletAddress}
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

          {/* Dashboard Section - Coming Soon */}
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="text-center py-20 rounded-3xl backdrop-blur-xl border"
                style={{
                  background: isDark 
                    ? 'linear-gradient(135deg, rgba(26, 78, 100, 0.6) 0%, rgba(20, 60, 80, 0.4) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 250, 240, 0.7) 100%)',
                  borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
                }}
              >
                {walletAddress ? (
                  <>
                    <h2 className="text-3xl md:text-4xl mb-4" style={{ 
                      color: isDark ? '#FFC850' : '#143C50',
                      fontWeight: 700
                    }}>
                      Dashboard для инвесторов
                    </h2>
                    <p className="text-lg mb-6" style={{ 
                      color: isDark ? '#FFFAF0' : '#143C50',
                      opacity: 0.8
                    }}>
                      Следите за вашими инвестициями и доходностью
                    </p>
                    <div className="text-sm px-6 py-3 rounded-xl inline-block" style={{
                      backgroundColor: isDark ? 'rgba(255, 200, 80, 0.2)' : 'rgba(255, 200, 80, 0.1)',
                      color: isDark ? '#FFC850' : '#143C50'
                    }}>
                      🚧 В разработке - доступно после первых инвестиций
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl md:text-4xl mb-4" style={{ 
                      color: isDark ? '#FFC850' : '#143C50',
                      fontWeight: 700
                    }}>
                      Подключите кошелек
                    </h2>
                    <p className="text-lg" style={{ 
                      color: isDark ? '#FFFAF0' : '#143C50',
                      opacity: 0.8
                    }}>
                      Для доступа к dashboard необходимо подключить Web3 кошелек
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Roadmap Section - Coming Soon */}
          {activeTab === 'roadmap' && (
            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4" style={{ 
                  color: isDark ? '#FFC850' : '#143C50',
                  fontWeight: 700
                }}>
                  Roadmap проекта
                </h2>
                <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ 
                  color: isDark ? '#FFFAF0' : '#143C50',
                  opacity: 0.8
                }}>
                  Наш план развития и ключевые вехи
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { quarter: 'Q4 2024', title: 'Запуск платформы', status: 'completed', items: ['Создание Web3 платформы', 'Подключение MetaMask', 'Дизайн и UI/UX'] },
                  { quarter: 'Декабрь 2024', title: 'Сбор средств', status: 'current', items: ['Привлечение 6-7 инвесторов', 'Достижение цели ฿2.8M', 'KYC и AML процедуры'] },
                  { quarter: 'Январь 2025', title: 'Закрытие раунда', status: 'upcoming', items: ['Завершение сбора средств', 'Выпуск NFT сертификатов', 'Начало юридического оформления'] },
                  { quarter: 'Февраль 2025', title: 'Юридическое оформление', status: 'upcoming', items: ['Регистрация долей', 'Подписание договоров', 'Настройка автоматических выплат'] },
                  { quarter: 'Март 2025', title: 'Первые выплаты', status: 'upcoming', items: ['Начало ежемесячных выплат', 'Dashboard с реальными данными', 'Governance голосования'] },
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
                      <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl"
                        style={{
                          backgroundColor: milestone.status === 'completed' ? '#28B48C' :
                                         milestone.status === 'current' ? '#FFC850' : 
                                         isDark ? 'rgba(255, 250, 240, 0.2)' : 'rgba(20, 60, 80, 0.2)',
                          color: milestone.status === 'upcoming' ? (isDark ? '#FFFAF0' : '#143C50') : '#FFFAF0'
                        }}
                      >
                        {milestone.status === 'completed' ? '✓' : milestone.status === 'current' ? '🔄' : '📍'}
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
                  Инвестиции в рентал-бизнес автомобилей через блокчейн технологии
                </p>
              </div>
              <div>
                <h4 className="text-lg mb-3" style={{ 
                  color: isDark ? '#FFC850' : '#143C50',
                  fontWeight: 600
                }}>
                  Контакты
                </h4>
                <div className="space-y-2 text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  <div>📧 invest@thailandmycar.com</div>
                  <div>💬 Telegram: @thailandmycar</div>
                  <div>📱 WhatsApp: +66 XX XXX XXXX</div>
                </div>
              </div>
              <div>
                <h4 className="text-lg mb-3" style={{ 
                  color: isDark ? '#FFC850' : '#143C50',
                  fontWeight: 600
                }}>
                  Документы
                </h4>
                <div className="space-y-2 text-sm" style={{ color: '#009696' }}>
                  <div className="cursor-pointer hover:underline">📄 Whitepaper</div>
                  <div className="cursor-pointer hover:underline">📜 Legal Documents</div>
                  <div className="cursor-pointer hover:underline">🔐 Smart Contract</div>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t text-center text-sm opacity-70"
              style={{
                borderColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(20, 60, 80, 0.1)',
                color: isDark ? '#FFFAF0' : '#143C50'
              }}
            >
              <p className="mb-2">© 2024 Thailand My Car. All rights reserved.</p>
              <p className="text-xs">
                ⚠️ Инвестиции несут риски. Проект не является финансовой консультацией. 
                Платформа предназначена для квалифицированных инвесторов.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}