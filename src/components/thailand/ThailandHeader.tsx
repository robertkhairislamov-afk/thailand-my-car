import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, Wallet, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import tmcLogo from '../../assets/TMC.webp';

interface ThailandHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  walletAddress: string | null;
  onWalletChange: (address: string | null) => void;
  language: 'ru' | 'en' | 'th';
  onLanguageChange: (lang: 'ru' | 'en' | 'th') => void;
}

export function ThailandHeader({ 
  isDark, 
  onToggleTheme, 
  activeTab, 
  onTabChange,
  walletAddress,
  onWalletChange,
  language,
  onLanguageChange
}: ThailandHeaderProps) {
  const { t } = useLanguage();
  const [isConnecting, setIsConnecting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      // @ts-ignore
      const { ethereum } = window;
      
      if (!ethereum) {
        console.log('Make sure you have MetaMask installed!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        onWalletChange(account);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Listen for account changes
  useEffect(() => {
    // @ts-ignore
    if (window.ethereum) {
      // @ts-ignore
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          onWalletChange(accounts[0]);
        } else {
          onWalletChange(null);
        }
      };

      // @ts-ignore
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // @ts-ignore
      window.ethereum.on('chainChanged', () => {
        // Reload page when chain changes
        window.location.reload();
      });

      // Cleanup
      return () => {
        // @ts-ignore
        if (window.ethereum.removeListener) {
          // @ts-ignore
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      
      // @ts-ignore
      const { ethereum } = window;

      if (!ethereum) {
        alert('Please install MetaMask or another Web3 wallet!');
        setIsConnecting(false);
        return;
      }

      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      onWalletChange(accounts[0]);
      setIsConnecting(false);
    } catch (error) {
      console.log(error);
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    onWalletChange(null);
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const navItems = [
    { id: 'home', label: t('header.home') },
    { id: 'about', label: t('header.about') },
    { id: 'invest', label: t('header.invest') },
    { id: 'dashboard', label: t('header.dashboard') },
    { id: 'roadmap', label: t('header.roadmap') }
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-500 rounded-3xl mx-4 mt-4"
      style={{
        backgroundColor: isDark ? 'rgba(20, 60, 80, 0.95)' : 'rgba(255, 250, 240, 0.95)',
        borderColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(20, 60, 80, 0.1)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange('home')}>
            <div className="relative p-1 rounded-lg transition-all duration-300 group-hover:scale-110">
              <img 
                src={tmcLogo} 
                alt="Thailand My Car" 
                className="h-10 w-auto object-contain" // Height 40px, auto width to preserve car proportions
                style={{ 
                  filter: isDark ? 'drop-shadow(0 0 10px rgba(64, 224, 208, 0.2))' : 'none' 
                }}
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-xl" style={{ 
                color: 'rgb(255, 200, 80)', 
                fontWeight: 700, 
                lineHeight: 1 
              }}>
                Thailand My Car
              </div>
              <div className="text-xs" style={{ 
                color: 'rgb(255, 250, 240)', 
                opacity: 0.7 
              }}>
                Инвестиции в рентал
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Основная навигация">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="px-4 py-2 rounded-xl transition-all duration-300"
                aria-current={activeTab === item.id ? 'page' : undefined}
                style={{
                  color: activeTab === item.id
                    ? (isDark ? '#FFC850' : '#009696')
                    : (isDark ? '#FFFAF0' : '#143C50'),
                  backgroundColor: activeTab === item.id
                    ? (isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)')
                    : 'transparent',
                  fontWeight: activeTab === item.id ? 600 : 500,
                  opacity: activeTab === item.id ? 1 : 0.8
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle - Hidden on mobile */}
            <button
              onClick={onToggleTheme}
              className="hidden lg:block p-2 rounded-xl transition-all duration-500 hover:scale-110"
              style={{
                backgroundColor: isDark ? 'rgba(255, 250, 240, 0.1)' : 'rgba(20, 60, 80, 0.1)'
              }}
              aria-label={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
            >
              {isDark ? (
                <Sun className="w-5 h-5" style={{ color: '#FFC850' }} />
              ) : (
                <Moon className="w-5 h-5" style={{ color: '#143C50' }} />
              )}
            </button>

            {/* Language Toggle - Hidden on mobile */}
            <div className="hidden lg:block relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-500 hover:scale-110"
                style={{
                  backgroundColor: isDark ? 'rgba(255, 250, 240, 0.1)' : 'rgba(20, 60, 80, 0.1)'
                }}
                aria-label="Выбрать язык"
                aria-expanded={showLanguageMenu}
                aria-haspopup="true"
              >
                <Globe className="w-5 h-5" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
                <span className="text-xs" style={{
                  color: isDark ? '#FFFAF0' : '#143C50',
                  fontWeight: 600
                }}>
                  {language.toUpperCase()}
                </span>
              </button>

              {/* Language Menu Dropdown */}
              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    role="menu"
                    aria-label="Выбор языка"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 min-w-[140px] rounded-xl backdrop-blur-xl border shadow-2xl overflow-hidden z-50"
                    style={{
                      backgroundColor: isDark ? 'rgba(20, 60, 80, 0.98)' : 'rgba(255, 250, 240, 0.98)',
                      borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(20, 60, 80, 0.2)'
                    }}
                  >
                    <button
                      onClick={() => {
                        onLanguageChange('ru');
                        setShowLanguageMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 transition-all duration-200"
                      style={{
                        color: language === 'ru' ? '#009696' : (isDark ? '#FFFAF0' : '#143C50'),
                        backgroundColor: language === 'ru' 
                          ? (isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)')
                          : 'transparent',
                        fontWeight: language === 'ru' ? 600 : 500
                      }}
                    >
                      🇷🇺 Русский
                    </button>
                    <button
                      onClick={() => {
                        onLanguageChange('en');
                        setShowLanguageMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 transition-all duration-200"
                      style={{
                        color: language === 'en' ? '#009696' : (isDark ? '#FFFAF0' : '#143C50'),
                        backgroundColor: language === 'en' 
                          ? (isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)')
                          : 'transparent',
                        fontWeight: language === 'en' ? 600 : 500
                      }}
                    >
                      🇬🇧 English
                    </button>
                    <button
                      onClick={() => {
                        onLanguageChange('th');
                        setShowLanguageMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 transition-all duration-200"
                      style={{
                        color: language === 'th' ? '#009696' : (isDark ? '#FFFAF0' : '#143C50'),
                        backgroundColor: language === 'th' 
                          ? (isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)')
                          : 'transparent',
                        fontWeight: language === 'th' ? 600 : 500
                      }}
                    >
                      🇹🇭 ไทย
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Connect Wallet Button */}
            {walletAddress ? (
              <button
                onClick={disconnectWallet}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                  color: '#FFFAF0',
                  fontWeight: 600
                }}
                aria-label={`Отключить кошелёк ${formatAddress(walletAddress)}`}
              >
                <Wallet className="w-4 h-4" />
                <span>{formatAddress(walletAddress)}</span>
              </button>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #40E0D0 0%, #00CED1 100%)',
                  color: '#FFFAF0',
                  fontWeight: 600
                }}
                aria-label="Подключить кошелёк MetaMask"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Вход...' : 'Login'}</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl"
              style={{
                backgroundColor: isDark ? 'rgba(255, 250, 240, 0.1)' : 'rgba(20, 60, 80, 0.1)'
              }}
              aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
              ) : (
                <Menu className="w-5 h-5" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t"
            style={{
              borderColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(20, 60, 80, 0.1)'
            }}
          >
            <nav className="flex flex-col gap-2 mb-4" role="navigation" aria-label="Мобильная навигация">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 rounded-xl text-left transition-all duration-300"
                  aria-current={activeTab === item.id ? 'page' : undefined}
                  style={{
                    color: activeTab === item.id
                      ? (isDark ? '#FFC850' : '#009696')
                      : (isDark ? '#FFFAF0' : '#143C50'),
                    backgroundColor: activeTab === item.id
                      ? (isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)')
                      : 'transparent',
                    fontWeight: activeTab === item.id ? 600 : 500
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Mobile Theme & Language Controls */}
            <div className="flex items-center gap-2 mb-4">
              {/* Theme Toggle */}
              <button
                onClick={onToggleTheme}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300"
                style={{
                  backgroundColor: isDark ? 'rgba(255, 250, 240, 0.1)' : 'rgba(20, 60, 80, 0.1)',
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              >
                {isDark ? (
                  <>
                    <Sun className="w-5 h-5" style={{ color: '#FFC850' }} />
                    <span className="text-sm font-medium">Светлая</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" style={{ color: '#143C50' }} />
                    <span className="text-sm font-medium">Темная</span>
                  </>
                )}
              </button>

              {/* Language Selector */}
              <div className="flex-1 rounded-xl overflow-hidden" style={{
                backgroundColor: isDark ? 'rgba(255, 250, 240, 0.1)' : 'rgba(20, 60, 80, 0.1)'
              }}>
                <button
                  onClick={() => onLanguageChange(language === 'ru' ? 'en' : language === 'en' ? 'th' : 'ru')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 transition-all duration-300"
                  style={{
                    color: isDark ? '#FFFAF0' : '#143C50'
                  }}
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {language === 'ru' ? '🇷🇺 RU' : language === 'en' ? '🇬🇧 EN' : '🇹🇭 TH'}
                  </span>
                </button>
              </div>
            </div>

            {/* Mobile Wallet Button */}
            {walletAddress ? (
              <button
                onClick={disconnectWallet}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                  color: '#FFFAF0',
                  fontWeight: 600
                }}
              >
                <Wallet className="w-4 h-4" />
                <span>{formatAddress(walletAddress)}</span>
              </button>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #40E0D0 0%, #00CED1 100%)',
                  color: '#FFFAF0',
                  fontWeight: 600
                }}
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Вход...' : 'Login'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}