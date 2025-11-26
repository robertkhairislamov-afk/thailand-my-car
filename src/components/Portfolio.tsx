import { TrendingUp, ArrowUpRight, ArrowDownRight, Clock, DollarSign } from 'lucide-react';

interface PortfolioProps {
  isDark: boolean;
  walletConnected: boolean;
}

interface Position {
  id: string;
  vault: string;
  amount: string;
  value: string;
  apy: number;
  earned: string;
  change: number;
  since: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  vault: string;
  amount: string;
  date: string;
}

export function Portfolio({ isDark, walletConnected }: PortfolioProps) {
  const positions: Position[] = [
    {
      id: '1',
      vault: 'USDC Maximizer',
      amount: '8,234 USDC',
      value: '$8,234.50',
      apy: 12.45,
      earned: '$234.50',
      change: 2.8,
      since: '30 days',
    },
    {
      id: '2',
      vault: 'Boost Protocol',
      amount: '15,000 USDT',
      value: '$15,234.20',
      apy: 18.67,
      earned: '$567.80',
      change: 3.9,
      since: '45 days',
    },
    {
      id: '3',
      vault: 'Stable Yield',
      amount: '10,000 DAI',
      value: '$10,089.00',
      apy: 8.5,
      earned: '$89.00',
      change: 0.9,
      since: '15 days',
    },
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'deposit',
      vault: 'USDC Maximizer',
      amount: '8,234 USDC',
      date: '2 hours ago',
    },
    {
      id: '2',
      type: 'withdraw',
      vault: 'Stable Yield',
      amount: '5,000 DAI',
      date: '1 day ago',
    },
    {
      id: '3',
      type: 'deposit',
      vault: 'Boost Protocol',
      amount: '15,000 USDT',
      date: '3 days ago',
    },
    {
      id: '4',
      type: 'deposit',
      vault: 'Stable Yield',
      amount: '10,000 DAI',
      date: '5 days ago',
    },
  ];

  const totalValue = positions.reduce((sum, pos) => {
    return sum + parseFloat(pos.value.replace(/[$,]/g, ''));
  }, 0);

  const totalEarned = positions.reduce((sum, pos) => {
    return sum + parseFloat(pos.earned.replace(/[$,]/g, ''));
  }, 0);

  if (!walletConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`text-center max-w-md rounded-3xl backdrop-blur-xl border p-12 transition-colors duration-500 ${
          isDark
            ? 'bg-white/5 border-white/10'
            : 'bg-white/50 border-white/60'
        }`}>
          <div className={`inline-flex p-4 rounded-2xl mb-6 transition-colors duration-500 ${
            isDark ? 'bg-white/10' : 'bg-white/60'
          }`}>
            <DollarSign className={`w-8 h-8 transition-colors duration-500 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`} />
          </div>
          <h2 className={`text-2xl tracking-tight mb-3 transition-colors duration-500 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Connect Your Wallet
          </h2>
          <p className={`transition-colors duration-500 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Connect your wallet to view your portfolio and track your positions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-4xl tracking-tight mb-2 transition-colors duration-500 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Portfolio
        </h1>
        <p className={`transition-colors duration-500 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Track your positions and earnings across all vaults
        </p>
      </div>

      {/* Total Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-3xl backdrop-blur-xl border p-6 transition-colors duration-500 ${
          isDark
            ? 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-400/20'
            : 'bg-gradient-to-br from-cyan-50 to-purple-50 border-cyan-200/50'
        }`}>
          <div className={`text-xs tracking-widest uppercase mb-2 transition-colors duration-500 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Total Value
          </div>
          <div className={`text-3xl tracking-tight transition-colors duration-500 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className={`rounded-3xl backdrop-blur-xl border p-6 transition-colors duration-500 ${
          isDark
            ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-400/20'
            : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50'
        }`}>
          <div className={`text-xs tracking-widest uppercase mb-2 transition-colors duration-500 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Total Earned
          </div>
          <div className={`text-3xl tracking-tight transition-colors duration-500 ${
            isDark ? 'text-green-400' : 'text-green-600'
          }`}>
            +${totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className={`rounded-3xl backdrop-blur-xl border p-6 transition-colors duration-500 ${
          isDark
            ? 'bg-white/5 border-white/10'
            : 'bg-white/50 border-white/60'
        }`}>
          <div className={`text-xs tracking-widest uppercase mb-2 transition-colors duration-500 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Active Positions
          </div>
          <div className={`text-3xl tracking-tight transition-colors duration-500 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {positions.length}
          </div>
        </div>
      </div>

      {/* Positions */}
      <div>
        <h2 className={`text-2xl tracking-tight mb-4 transition-colors duration-500 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Active Positions
        </h2>
        <div className="space-y-4">
          {positions.map((position) => (
            <div
              key={position.id}
              className={`rounded-3xl backdrop-blur-xl border p-6 transition-all duration-500 hover:scale-[1.01] ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:bg-white/10'
                  : 'bg-white/50 border-white/60 hover:bg-white/70'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Vault Info */}
                <div>
                  <div className={`text-xs tracking-widest uppercase mb-2 transition-colors duration-500 ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Vault
                  </div>
                  <div className={`text-xl tracking-tight transition-colors duration-500 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {position.vault}
                  </div>
                  <div className={`text-sm mt-1 transition-colors duration-500 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {position.amount}
                  </div>
                </div>

                {/* Value */}
                <div>
                  <div className={`text-xs tracking-widest uppercase mb-2 transition-colors duration-500 ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Value
                  </div>
                  <div className={`text-xl tracking-tight transition-colors duration-500 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {position.value}
                  </div>
                  <div className={`flex items-center gap-1 text-sm mt-1 ${
                    position.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {position.change >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {Math.abs(position.change)}%
                  </div>
                </div>

                {/* APY & Earned */}
                <div>
                  <div className={`text-xs tracking-widest uppercase mb-2 transition-colors duration-500 ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    APY / Earned
                  </div>
                  <div className={`text-xl tracking-tight transition-colors duration-500 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {position.apy}%
                  </div>
                  <div className={`text-sm mt-1 transition-colors duration-500 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {position.earned}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <button className={`px-4 py-2 rounded-xl transition-colors duration-500 ${
                    isDark
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-white/60 hover:bg-white/80 text-gray-900'
                  }`}>
                    Deposit
                  </button>
                  <button className={`px-4 py-2 rounded-xl transition-colors duration-500 ${
                    isDark
                      ? 'bg-white/10 hover:bg-red-500/20 text-white hover:text-red-300'
                      : 'bg-white/60 hover:bg-red-100 text-gray-900 hover:text-red-600'
                  }`}>
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className={`text-2xl tracking-tight mb-4 transition-colors duration-500 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Recent Transactions
        </h2>
        <div className={`rounded-3xl backdrop-blur-xl border overflow-hidden transition-colors duration-500 ${
          isDark
            ? 'bg-white/5 border-white/10'
            : 'bg-white/50 border-white/60'
        }`}>
          <div className="divide-y divide-white/10">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className={`p-6 transition-colors duration-500 ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-white/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${
                      tx.type === 'deposit'
                        ? isDark
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-green-100 text-green-600'
                        : isDark
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-orange-100 text-orange-600'
                    }`}>
                      {tx.type === 'deposit' ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className={`tracking-tight transition-colors duration-500 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {tx.type === 'deposit' ? 'Deposit' : 'Withdraw'}
                      </div>
                      <div className={`text-sm transition-colors duration-500 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {tx.vault}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`tracking-tight transition-colors duration-500 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {tx.amount}
                    </div>
                    <div className={`text-sm flex items-center gap-1 justify-end transition-colors duration-500 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {tx.date}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}