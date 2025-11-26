import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, Wallet, Car } from 'lucide-react';

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
  const [isConnecting, setIsConnecting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { id: 'home', label: 'Главная' },
    { id: 'about', label: 'О проекте' },
    { id: 'invest', label: 'Инвестиции' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'roadmap', label: 'Roadmap' }
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
            {walletAddress ? (
              <button
                onClick={disconnectWallet}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105"
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
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                  color: '#FFFAF0',
                  fontWeight: 600
                }}
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Подключение...' : 'Connect Wallet'}</span>
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
                  background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                  color: '#FFFAF0',
                  fontWeight: 600
                }}
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Подключение...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
