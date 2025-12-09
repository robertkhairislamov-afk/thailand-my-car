import { useState, useEffect, useCallback } from 'react';
import { Moon, Sun, Menu, X, Wallet, Car, User, LogOut, Loader2 } from 'lucide-react';
import { useAppKit, useAppKitAccount, useDisconnect, useAppKitProvider } from '@reown/appkit/react';
import { BrowserProvider } from 'ethers';
import type { Provider } from '@reown/appkit';
import { api } from '../../services/api';

interface ThailandHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  walletAddress: string | null;
  onWalletChange: (address: string | null) => void;
}

export function ThailandHeader({
  isDark,
  onToggleTheme,
  activeTab,
  onTabChange,
  walletAddress,
  onWalletChange
}: ThailandHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningMessage, setIsSigningMessage] = useState(false);

  // Reown AppKit hooks
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { walletProvider } = useAppKitProvider<Provider>('eip155');

  // Sign message with wallet
  const signMessageWithWallet = useCallback(async (message: string): Promise<string | null> => {
    if (!walletProvider || !address) return null;

    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      return null;
    }
  }, [walletProvider, address]);

  // Sync Web3Modal state with parent component
  useEffect(() => {
    const syncWallet = async () => {
      if (isConnected && address) {
        // Register wallet with backend and get auth token
        if (!api.getToken()) {
          try {
            setIsSigningMessage(true);

            // Step 1: Get nonce from server
            const nonceResponse = await api.getWalletNonce(address);
            if (nonceResponse.error || !nonceResponse.data?.message) {
              console.error('Failed to get nonce:', nonceResponse.error);
              // Fallback to connect without signature
              const response = await api.connectWallet(address);
              if (response.data?.token) {
                api.setToken(response.data.token);
              }
            } else {
              // Step 2: Sign the message
              const signature = await signMessageWithWallet(nonceResponse.data.message);

              // Step 3: Connect with signature (or without if signing failed/cancelled)
              const response = await api.connectWallet(address, signature || undefined);
              if (response.data?.token) {
                api.setToken(response.data.token);
              }
            }
          } catch (error) {
            console.error('Failed to register wallet:', error);
          } finally {
            setIsSigningMessage(false);
          }
        }
        onWalletChange(address);
      } else {
        if (walletAddress) {
          api.clearToken();
          onWalletChange(null);
        }
      }
    };

    syncWallet();
  }, [isConnected, address, signMessageWithWallet]);

  const connectWallet = () => {
    open();
  };

  const disconnectWallet = () => {
    disconnect();
    api.clearToken();
    onWalletChange(null);
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatAddressShort = (addr: string) => {
    return `${addr.substring(0, 4)}..${addr.substring(addr.length - 3)}`;
  };

  const navItems = [
    { id: 'home', label: 'Главная' },
    { id: 'about', label: 'О проекте' },
    { id: 'invest', label: 'Инвестиции' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'roadmap', label: 'Roadmap' },
    ...(walletAddress ? [{ id: 'profile', label: 'Профиль' }] : [])
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-500"
      style={{
        backgroundColor: isDark ? 'rgba(20, 60, 80, 0.9)' : 'rgba(255, 250, 240, 0.9)',
        borderColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(20, 60, 80, 0.1)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('home')}>
            <div className="p-2 rounded-xl" style={{
              background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)'
            }}>
              <Car className="w-6 h-6" style={{ color: '#FFFAF0' }} />
            </div>
            <div>
              <div className="text-xl" style={{
                color: isDark ? '#FFC850' : '#143C50',
                fontWeight: 700,
                lineHeight: 1
              }}>
                Thailand My Car
              </div>
              <div className="text-xs" style={{
                color: isDark ? '#FFFAF0' : '#143C50',
                opacity: 0.7
              }}>
                Инвестиции в рентал
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="px-4 py-2 rounded-xl transition-all duration-300"
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
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl transition-all duration-500 hover:scale-110"
              style={{
                backgroundColor: isDark ? 'rgba(255, 250, 240, 0.1)' : 'rgba(20, 60, 80, 0.1)'
              }}
            >
              {isDark ? (
                <Sun className="w-5 h-5" style={{ color: '#FFC850' }} />
              ) : (
                <Moon className="w-5 h-5" style={{ color: '#143C50' }} />
              )}
            </button>

            {/* Connect Wallet Button */}
            {isSigningMessage ? (
              <div className="flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                  color: '#FFFAF0',
                  fontWeight: 600
                }}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Подписание...</span>
              </div>
            ) : walletAddress ? (
              <div className="flex items-center gap-1 md:gap-2">
                {/* Profile Button - hidden on very small screens */}
                <button
                  onClick={() => onTabChange('profile')}
                  className="hidden sm:flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: activeTab === 'profile'
                      ? (isDark ? 'rgba(255, 200, 80, 0.2)' : 'rgba(0, 150, 150, 0.2)')
                      : (isDark ? 'rgba(255, 250, 240, 0.1)' : 'rgba(20, 60, 80, 0.1)'),
                    color: activeTab === 'profile'
                      ? (isDark ? '#FFC850' : '#009696')
                      : (isDark ? '#FFFAF0' : '#143C50')
                  }}
                >
                  <User className="w-4 h-4" />
                </button>
                {/* Wallet Address Display */}
                <button
                  onClick={() => open({ view: 'Account' })}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2.5 rounded-xl transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                    color: '#FFFAF0',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  <Wallet className="w-4 h-4" />
                  <span className="sm:hidden">{formatAddressShort(walletAddress)}</span>
                  <span className="hidden sm:inline">{formatAddress(walletAddress)}</span>
                </button>
                {/* Disconnect Button */}
                <button
                  onClick={disconnectWallet}
                  className="flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 100, 100, 0.2)' : 'rgba(200, 50, 50, 0.1)',
                    color: '#ff6b6b'
                  }}
                  title="Отключить кошелек"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                  color: '#FFFAF0',
                  fontWeight: 600
                }}
              >
                <Wallet className="w-4 h-4" />
                <span>Connect</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl"
              style={{
                backgroundColor: isDark ? 'rgba(255, 250, 240, 0.1)' : 'rgba(20, 60, 80, 0.1)'
              }}
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
            <nav className="flex flex-col gap-2 mb-4">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 rounded-xl text-left transition-all duration-300"
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
                <span>Подписание...</span>
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
                  <span>Отключить</span>
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
                  background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                  color: '#FFFAF0',
                  fontWeight: 600
                }}
              >
                <Wallet className="w-4 h-4" />
                <span>Подключить кошелек</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
