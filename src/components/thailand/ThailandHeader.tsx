import { useState, useEffect, useCallback, useRef } from 'react';
import { Moon, Sun, Menu, X, Wallet, Globe, LogOut, Loader2 } from 'lucide-react';
import { useAppKit, useAppKitAccount, useDisconnect, useAppKitProvider } from '@reown/appkit/react';
import { BrowserProvider } from 'ethers';
import type { Provider } from '@reown/appkit';
import { api } from '../../services/api';
import { MobileWalletHelper, isMobileDevice, isWalletBrowser } from './MobileWalletHelper';
import { useLanguage } from '../../contexts/LanguageContext';
import tmcLogo from '../../assets/TMC.webp';
import { motion, AnimatePresence } from 'motion/react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningMessage, setIsSigningMessage] = useState(false);
  const [showMobileHelper, setShowMobileHelper] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ✅ FIX #6: Throttle scroll updates с requestAnimationFrame
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reown AppKit hooks
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { walletProvider } = useAppKitProvider<Provider>('eip155');

  // ✅ FIX: Ref для предотвращения повторных авторизаций
  const isAuthenticatingRef = useRef(false);
  // ✅ FIX: Инициализируем из localStorage для сохранения между перезагрузками
  const lastAuthAddressRef = useRef<string | null>(localStorage.getItem('last_auth_address'));
  const currentAuthAddressRef = useRef<string | null>(null);
  const isDisconnectingRef = useRef(false); // Флаг отключения

  // Sync Web3Modal state with parent component
  useEffect(() => {
    // ✅ FIX: Если идёт отключение — не делаем ничего
    if (isDisconnectingRef.current) {
      return;
    }

    // ✅ FIX: Синхронные проверки ДО async функции

    // Если кошелек отключен
    if (!isConnected || !address) {
      if (walletAddress) {
        api.clearToken();
        onWalletChange(null);
        lastAuthAddressRef.current = null;
        isAuthenticatingRef.current = false;
        currentAuthAddressRef.current = null;
      }
      return;
    }

    // ✅ FIX: Определяем lowerAddress в начале для использования во всех проверках
    const lowerAddress = address.toLowerCase();

    // Проверяем токен напрямую из localStorage
    const existingToken = localStorage.getItem('auth_token');
    if (existingToken) {
      // ✅ FIX: Проверяем, что токен для ЭТОГО адреса
      // Если адрес изменился - нужна реавторизация
      if (lastAuthAddressRef.current && lastAuthAddressRef.current !== lowerAddress) {
        // Кошелёк переключён - очищаем старый токен
        api.clearToken();
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('last_auth_address');
        lastAuthAddressRef.current = null;
        // Продолжаем для новой авторизации
      } else {
        // Токен есть и адрес тот же - просто обновляем состояние
        if (!lastAuthAddressRef.current) {
          lastAuthAddressRef.current = lowerAddress;
          localStorage.setItem('last_auth_address', lowerAddress);
        }
        if (walletAddress !== address) {
          onWalletChange(address);
        }
        return;
      }
    }

    if (isAuthenticatingRef.current) {
      return;
    }

    if (lastAuthAddressRef.current === lowerAddress) {
      if (walletAddress !== address) {
        onWalletChange(address);
      }
      return;
    }

    if (currentAuthAddressRef.current === lowerAddress) {
      return;
    }

    // ✅ FIX: Устанавливаем флаги СИНХРОННО до async операций
    isAuthenticatingRef.current = true;
    currentAuthAddressRef.current = lowerAddress;
    setIsSigningMessage(true);

    const syncWallet = async () => {
      let authSuccess = false;

      try {
        // Step 1: Get nonce from server
        const nonceResponse = await api.getWalletNonce(address);

        if (nonceResponse.error || !nonceResponse.data?.message) {
          // Fallback: подключение без подписи
          const response = await api.connectWallet(address);
          if (response.data?.accessToken) {
            api.setToken(response.data.accessToken);
            if (response.data.refreshToken) {
              localStorage.setItem('refresh_token', response.data.refreshToken);
            }
            authSuccess = true;
          }
        } else {
          // Step 2: Sign the message
          let signature: string | null = null;

          if (walletProvider) {
            try {
              const provider = new BrowserProvider(walletProvider);
              const signer = await provider.getSigner();
              signature = await signer.signMessage(nonceResponse.data.message);
            } catch (signError) {
              // Продолжаем без подписи
            }
          }

          // Step 3: Connect with signature (or without if signing failed)
          const response = await api.connectWallet(address, signature || undefined);

          if (response.data?.accessToken) {
            api.setToken(response.data.accessToken);
            if (response.data.refreshToken) {
              localStorage.setItem('refresh_token', response.data.refreshToken);
            }
            authSuccess = true;
          }
        }
      } catch (error) {
        // Auth exception
      } finally {
        setIsSigningMessage(false);
        isAuthenticatingRef.current = false;
        currentAuthAddressRef.current = null;
      }

      // Обновляем состояние
      if (authSuccess) {
        lastAuthAddressRef.current = lowerAddress;
        localStorage.setItem('last_auth_address', lowerAddress);
        onWalletChange(address);
      } else {
        lastAuthAddressRef.current = null;
        localStorage.removeItem('last_auth_address');
        disconnect();
        alert(t('header.authError'));
      }
    };

    syncWallet();
  }, [isConnected, address, walletProvider, walletAddress, onWalletChange, disconnect]);

  const connectWallet = () => {
    // On mobile, if not in wallet browser, show helper
    if (isMobileDevice() && !isWalletBrowser()) {
      setShowMobileHelper(true);
    } else {
      open();
    }
  };

  const disconnectWallet = () => {
    // ✅ FIX: Устанавливаем флаг отключения ПЕРЕД disconnect()
    isDisconnectingRef.current = true;
    lastAuthAddressRef.current = null;
    localStorage.removeItem('last_auth_address');
    isAuthenticatingRef.current = false;
    currentAuthAddressRef.current = null;

    // Сначала очищаем токены
    api.clearToken();
    localStorage.removeItem('refresh_token');
    onWalletChange(null);

    // Потом отключаем кошелёк
    disconnect();

    // Сбрасываем флаг через небольшую задержку
    setTimeout(() => {
      isDisconnectingRef.current = false;
    }, 1000);
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const navItems = [
    { id: 'home', label: t('header.home') },
    { id: 'about', label: t('header.about') },
    { id: 'invest', label: t('header.invest') },
    { id: 'dashboard', label: t('header.dashboard') },
    { id: 'roadmap', label: t('header.roadmap') },
    // Profile показывается только когда кошелёк подключён
    ...(walletAddress ? [{ id: 'profile', label: t('header.profile') }] : [])
  ];

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 rounded-3xl mx-4 mt-4 ${
        isScrolled ? '' : ''
      }`}
      style={{
        backgroundColor: isScrolled
          ? (isDark ? 'rgba(20, 60, 80, 0.95)' : 'rgba(255, 250, 240, 0.95)')
          : (isDark ? 'rgba(20, 60, 80, 1)' : 'rgba(255, 250, 240, 1)'),
        borderColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(20, 60, 80, 0.95)',
        willChange: isScrolled ? 'background-color, backdrop-filter' : 'auto'
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
                className="h-10 w-auto object-contain"
                style={{
                  filter: isDark ? 'drop-shadow(0 0 10px rgba(64, 224, 208, 0.2))' : 'none'
                }}
              />
            </div>
            <div>
              <div className="text-lg sm:text-xl" style={{
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
                {t('header.subtitle')}
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
                backgroundColor: isDark ? 'rgba(255, 250, 240, 0.1)' : 'rgba(20, 60, 80, 0.95)'
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
                  backgroundColor: isDark ? 'rgba(255, 250, 240, 0.1)' : 'rgba(20, 60, 80, 0.95)'
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
                    className="absolute right-0 top-full mt-2 min-w-[140px] rounded-xl  border shadow-2xl overflow-hidden z-50"
                    style={{
                      backgroundColor: isDark ? 'rgba(20, 60, 80, 0.98)' : 'rgba(255, 250, 240, 0.98)',
                      borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(20, 60, 80, 0.95)'
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
            {isSigningMessage ? (
              <div className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                  color: '#FFFAF0',
                  fontWeight: 600
                }}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('header.signing')}</span>
              </div>
            ) : walletAddress ? (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => open({ view: 'Account' })}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                    color: '#FFFAF0',
                    fontWeight: 600
                  }}
                  aria-label={`Кошелёк ${formatAddress(walletAddress)}`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>{formatAddress(walletAddress)}</span>
                </button>
                <button
                  onClick={disconnectWallet}
                  className="flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 100, 100, 0.2)' : 'rgba(200, 50, 50, 0.1)',
                    color: '#ff6b6b'
                  }}
                  title="Отключить кошелёк"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #40E0D0 0%, #00CED1 100%)',
                  color: '#FFFAF0',
                  fontWeight: 600
                }}
                aria-label="Подключить кошелёк"
              >
                <Wallet className="w-4 h-4" />
                <span>{t('header.login')}</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl"
              style={{
                backgroundColor: isDark ? 'rgba(255, 250, 240, 0.1)' : 'rgba(20, 60, 80, 0.95)'
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
              borderColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(20, 60, 80, 0.95)'
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
                  backgroundColor: isDark ? 'rgba(255, 250, 240, 0.1)' : 'rgba(20, 60, 80, 0.95)',
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              >
                {isDark ? (
                  <>
                    <Sun className="w-5 h-5" style={{ color: '#FFC850' }} />
                    <span className="text-sm font-medium">{t('header.lightTheme')}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" style={{ color: '#143C50' }} />
                    <span className="text-sm font-medium">{t('header.darkTheme')}</span>
                  </>
                )}
              </button>

              {/* Language Selector */}
              <div className="flex-1 rounded-xl overflow-hidden" style={{
                backgroundColor: isDark ? 'rgba(255, 250, 240, 0.1)' : 'rgba(20, 60, 80, 0.95)'
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
            {isSigningMessage ? (
              <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                  color: '#FFFAF0',
                  fontWeight: 600
                }}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('header.signing')}</span>
              </div>
            ) : walletAddress ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    open({ view: 'Account' });
                    setMobileMenuOpen(false);
                  }}
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
                <button
                  onClick={() => {
                    disconnectWallet();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 100, 100, 0.2)' : 'rgba(200, 50, 50, 0.1)',
                    color: '#ff6b6b',
                    fontWeight: 600
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('header.disconnect')}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  connectWallet();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #40E0D0 0%, #00CED1 100%)',
                  color: '#FFFAF0',
                  fontWeight: 600
                }}
              >
                <Wallet className="w-4 h-4" />
                <span>{t('header.login')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile Wallet Helper Modal */}
      <MobileWalletHelper
        isOpen={showMobileHelper}
        onClose={() => setShowMobileHelper(false)}
        isDark={isDark}
        onContinueWithWalletConnect={() => open()}
        onLoginWithEmail={() => open()}
      />
    </header>
  );
}
