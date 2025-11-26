import { Orbit, Moon, Sun, Wallet } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  activeTab: 'overview' | 'vaults' | 'portfolio' | 'contact';
  onTabChange: (tab: 'overview' | 'vaults' | 'portfolio' | 'contact') => void;
  walletAddress: string | null;
  onWalletChange: (address: string | null) => void;
}

export function Header({ isDark, onToggleTheme, activeTab, onTabChange, walletAddress, onWalletChange }: HeaderProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const checkIfWalletIsConnected = useCallback(async () => {
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
  }, [onWalletChange]);

  useEffect(() => {
    checkIfWalletIsConnected();

    // Listen for account changes
    // @ts-ignore
    if (window.ethereum) {
      // @ts-ignore
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          onWalletChange(null);
        } else {
          // User switched accounts
          onWalletChange(accounts[0]);
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
  }, [checkIfWalletIsConnected]);

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

      if (accounts.length > 0) {
        onWalletChange(accounts[0]);
      }
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

  return (
    <header className="relative z-20 px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div
          className={`backdrop-blur-xl rounded-full border shadow-lg px-6 py-3 transition-colors duration-500 ${
            isDark
              ? 'bg-white/10 border-white/10 shadow-black/20'
              : 'bg-white/40 border-white/60 shadow-purple-100/20'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-br from-cyan-400 to-purple-500 p-2.5 rounded-full">
                  <Orbit className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <div
                  className={`tracking-tight transition-colors duration-500 ${
                    isDark ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  OrbitYield
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onTabChange('overview')}
                className={`px-4 py-2 rounded-full text-sm transition-colors duration-500 ${
                  activeTab === 'overview'
                    ? isDark
                      ? 'bg-white/20 text-white'
                      : 'bg-white/80 text-gray-900'
                    : isDark
                    ? 'text-gray-300 hover:bg-white/10'
                    : 'text-gray-700 hover:bg-white/60'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => onTabChange('vaults')}
                className={`px-4 py-2 rounded-full text-sm transition-colors duration-500 ${
                  activeTab === 'vaults'
                    ? isDark
                      ? 'bg-white/20 text-white'
                      : 'bg-white/80 text-gray-900'
                    : isDark
                    ? 'text-gray-300 hover:bg-white/10'
                    : 'text-gray-700 hover:bg-white/60'
                }`}
              >
                Vaults
              </button>
              <button
                onClick={() => onTabChange('portfolio')}
                className={`px-4 py-2 rounded-full text-sm transition-colors duration-500 ${
                  activeTab === 'portfolio'
                    ? isDark
                      ? 'bg-white/20 text-white'
                      : 'bg-white/80 text-gray-900'
                    : isDark
                    ? 'text-gray-300 hover:bg-white/10'
                    : 'text-gray-700 hover:bg-white/60'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => onTabChange('contact')}
                className={`px-4 py-2 rounded-full text-sm transition-colors duration-500 ${
                  activeTab === 'contact'
                    ? isDark
                      ? 'bg-white/20 text-white'
                      : 'bg-white/80 text-gray-900'
                    : isDark
                    ? 'text-gray-300 hover:bg-white/10'
                    : 'text-gray-700 hover:bg-white/60'
                }`}
              >
                Contact
              </button>
            </nav>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={onToggleTheme}
                className={`p-2 rounded-full transition-all duration-500 ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20 text-yellow-300'
                    : 'bg-white/60 hover:bg-white/80 text-purple-600'
                }`}
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Connect Wallet Button */}
              {!walletAddress ? (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className={`group relative overflow-hidden px-5 py-2 rounded-full backdrop-blur-sm border shadow-sm transition-all duration-500 flex items-center gap-2 ${
                    isDark
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/40 hover:border-cyan-400/60 hover:shadow-cyan-500/20 text-white'
                      : 'bg-gradient-to-r from-cyan-100/60 to-purple-100/60 border-cyan-300/50 hover:border-cyan-400/70 text-gray-700'
                  } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Wallet className="w-4 h-4" />
                  <span className="relative text-sm">
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Connected Wallet Display */}
                  <div
                    className={`px-4 py-2 rounded-full backdrop-blur-sm border shadow-sm flex items-center gap-2 transition-colors duration-500 ${
                      isDark
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/40 text-white'
                        : 'bg-gradient-to-r from-green-100/60 to-emerald-100/60 border-green-300/50 text-gray-700'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm font-mono">{formatAddress(walletAddress)}</span>
                  </div>
                  
                  {/* Disconnect Button */}
                  <button
                    onClick={disconnectWallet}
                    className={`px-4 py-2 rounded-full text-sm transition-colors duration-500 ${
                      isDark
                        ? 'hover:bg-red-500/20 text-gray-300 hover:text-red-300'
                        : 'hover:bg-red-100/60 text-gray-600 hover:text-red-600'
                    }`}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}