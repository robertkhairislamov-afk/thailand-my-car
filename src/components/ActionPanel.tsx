import { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Info, ChevronDown } from 'lucide-react';

interface ActionPanelProps {
  view: 'calm' | 'warning' | 'success';
  onWithdraw: () => void;
  onDeposit: () => void;
  boostActive: boolean;
  isDark: boolean;
}

interface Stablecoin {
  symbol: string;
  name: string;
  balance: string;
  icon: string;
}

export function ActionPanel({ view, onWithdraw, onDeposit, boostActive, isDark }: ActionPanelProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<string>('USDT');
  const [showCoinSelector, setShowCoinSelector] = useState(false);

  const stablecoins: Stablecoin[] = [
    { symbol: 'USDT', name: 'Tether USD', balance: '1,250.00', icon: '₮' },
    { symbol: 'USDC', name: 'USD Coin', balance: '850.50', icon: '◎' },
    { symbol: 'DAI', name: 'Dai Stablecoin', balance: '420.75', icon: '◈' },
    { symbol: 'BUSD', name: 'Binance USD', balance: '0.00', icon: 'Ⓑ' },
    { symbol: 'TUSD', name: 'TrueUSD', balance: '100.00', icon: '₸' },
  ];

  const currentCoin = stablecoins.find(c => c.symbol === selectedCoin) || stablecoins[0];

  const estimatedYearly = amount ? (parseFloat(amount) * (boostActive ? 0.1867 : 0.1245)).toFixed(2) : '0.00';

  const handleSubmit = () => {
    if (activeTab === 'withdraw') {
      onWithdraw();
    } else {
      onDeposit();
    }
  };

  const handleMaxClick = () => {
    setAmount(currentCoin.balance.replace(/,/g, ''));
  };

  return (
    <div className={`rounded-[28px] backdrop-blur-2xl border shadow-xl p-6 md:p-8 transition-colors duration-500 ${
      isDark
        ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 shadow-black/20'
        : 'bg-gradient-to-br from-white/50 to-white/30 border-white/60 shadow-purple-100/10'
    }`}>
      <div className={`text-xs tracking-widest uppercase mb-6 transition-colors duration-500 ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>Portfolio</div>

      {/* Tabs */}
      <div className={`flex gap-2 p-1 rounded-2xl mb-6 transition-colors duration-500 ${
        isDark ? 'bg-white/10' : 'bg-white/40'
      }`}>
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-2.5 px-4 rounded-xl transition-all duration-300 text-sm ${
            activeTab === 'deposit'
              ? isDark
                ? 'bg-white/20 shadow-md text-white'
                : 'bg-white/80 shadow-md text-gray-800'
              : isDark
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowDownToLine className="w-4 h-4" />
            <span>Deposit</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-2.5 px-4 rounded-xl transition-all duration-300 text-sm ${
            activeTab === 'withdraw'
              ? isDark
                ? 'bg-white/20 shadow-md text-white'
                : 'bg-white/80 shadow-md text-gray-800'
              : isDark
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowUpFromLine className="w-4 h-4" />
            <span>Withdraw</span>
          </div>
        </button>
      </div>

      {/* Stablecoin Selector */}
      <div className="mb-4">
        <label className={`block text-xs mb-2 transition-colors duration-500 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>Select Stablecoin</label>
        <div className="relative">
          <button
            onClick={() => setShowCoinSelector(!showCoinSelector)}
            className={`w-full px-4 py-3 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
              isDark
                ? 'bg-white/10 border-white/20 hover:bg-white/15 text-white'
                : 'bg-white/60 border-white/60 hover:bg-white/80 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-colors duration-500 ${
                isDark ? 'bg-white/20' : 'bg-white/80'
              }`}>
                {currentCoin.icon}
              </div>
              <div className="text-left">
                <div className={`transition-colors duration-500 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {currentCoin.symbol}
                </div>
                <div className={`text-xs transition-colors duration-500 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {currentCoin.name}
                </div>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
              showCoinSelector ? 'rotate-180' : ''
            } ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>

          {/* Dropdown */}
          {showCoinSelector && (
            <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border overflow-hidden z-20 transition-colors duration-500 ${
              isDark
                ? 'bg-slate-900/95 border-white/20 backdrop-blur-xl'
                : 'bg-white/95 border-white/60 backdrop-blur-xl'
            }`}>
              {stablecoins.map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => {
                    setSelectedCoin(coin.symbol);
                    setShowCoinSelector(false);
                    setAmount('');
                  }}
                  className={`w-full px-4 py-3 flex items-center justify-between transition-colors duration-300 ${
                    coin.symbol === selectedCoin
                      ? isDark
                        ? 'bg-cyan-500/20'
                        : 'bg-cyan-100'
                      : isDark
                      ? 'hover:bg-white/10'
                      : 'hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-colors duration-500 ${
                      isDark ? 'bg-white/20' : 'bg-white/80'
                    }`}>
                      {coin.icon}
                    </div>
                    <div className="text-left">
                      <div className={`transition-colors duration-500 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {coin.symbol}
                      </div>
                      <div className={`text-xs transition-colors duration-500 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {coin.name}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm transition-colors duration-500 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {coin.balance}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className={`block text-xs mb-2 transition-colors duration-500 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>Amount</label>
        <div className="relative">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={`w-full px-5 py-3.5 rounded-2xl border focus:outline-none focus:ring-2 transition-all text-xl placeholder:text-gray-500 ${
              isDark
                ? 'bg-white/10 border-white/20 focus:border-purple-400 focus:ring-purple-500/30 text-white'
                : 'bg-white/60 border-white/60 focus:border-purple-200 focus:ring-purple-100/50 text-gray-800 placeholder:text-gray-400'
            }`}
          />
          <button 
            onClick={handleMaxClick}
            className={`absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg text-xs transition-colors ${
              isDark
                ? 'bg-purple-500/30 hover:bg-purple-500/40 text-purple-300'
                : 'bg-purple-100/70 hover:bg-purple-200/70 text-purple-700'
            }`}
          >
            MAX
          </button>
        </div>
        <div className={`mt-2 text-xs transition-colors duration-500 ${
          isDark ? 'text-gray-500' : 'text-gray-600'
        }`}>
          Balance: {currentCoin.balance} {currentCoin.symbol}
        </div>
      </div>

      {/* Info Row */}
      <div className={`mb-6 p-4 rounded-2xl border transition-colors duration-500 ${
        isDark
          ? 'bg-white/5 border-white/10'
          : 'bg-white/40 border-white/40'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm transition-colors duration-500 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Estimated yearly earnings</span>
          <span className={`transition-colors duration-500 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>${estimatedYearly}</span>
        </div>
        {boostActive && (
          <div className="text-xs text-orange-400 mt-1">
            ✨ Including boost rewards
          </div>
        )}
      </div>

      {/* Warning Banner (shown when withdrawing) */}
      {activeTab === 'withdraw' && view === 'warning' && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/30 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-orange-300 mb-0.5">Withdrawal Queue Active</div>
              <div className="text-xs text-orange-400/80">
                Your withdrawal will be processed in 7 days to ensure protocol stability.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Action Button */}
      <button
        onClick={handleSubmit}
        className={`group relative w-full overflow-hidden rounded-2xl py-3.5 transition-all duration-300 ${
          activeTab === 'deposit'
            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:shadow-lg hover:shadow-purple-500/30'
            : 'bg-gradient-to-r from-orange-500 to-rose-500 hover:shadow-lg hover:shadow-orange-500/30'
        }`}
      >
        <span className="relative text-white tracking-wide">
          {activeTab === 'deposit' ? `Deposit ${selectedCoin}` : `Withdraw ${selectedCoin}`}
        </span>
      </button>

      {/* Additional info */}
      <div className={`mt-3 text-center text-xs transition-colors duration-500 ${
        isDark ? 'text-gray-500' : 'text-gray-600'
      }`}>
        {activeTab === 'deposit' 
          ? 'Only stablecoins accepted • No lock-up period'
          : 'Standard withdrawal time: 7 days'
        }
      </div>
    </div>
  );
}