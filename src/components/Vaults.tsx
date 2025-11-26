import { TrendingUp, Shield, Zap, Leaf, Rocket, Lock } from 'lucide-react';

interface VaultsProps {
  isDark: boolean;
}

interface Vault {
  id: string;
  name: string;
  strategy: string;
  apy: number;
  tvl: string;
  risk: 'Low' | 'Medium' | 'High';
  icon: any;
  color: string;
  isNew?: boolean;
}

export function Vaults({ isDark }: VaultsProps) {
  const vaults: Vault[] = [
    {
      id: '1',
      name: 'Stable Yield',
      strategy: 'USDC/USDT LP + Compound',
      apy: 8.5,
      tvl: '$2.3B',
      risk: 'Low',
      icon: Shield,
      color: 'from-green-400 to-emerald-500',
    },
    {
      id: '2',
      name: 'USDC Maximizer',
      strategy: 'USDC Multi-Protocol Yield',
      apy: 12.45,
      tvl: '$4.8B',
      risk: 'Low',
      icon: TrendingUp,
      color: 'from-cyan-400 to-blue-500',
      isNew: false,
    },
    {
      id: '3',
      name: 'Boost Protocol',
      strategy: 'DAI/USDT/USDC Triple Pool',
      apy: 18.67,
      tvl: '$1.9B',
      risk: 'Medium',
      icon: Zap,
      color: 'from-yellow-400 to-orange-500',
      isNew: true,
    },
    {
      id: '4',
      name: 'BUSD Strategy',
      strategy: 'BUSD Lending + Staking',
      apy: 10.2,
      tvl: '$890M',
      risk: 'Low',
      icon: Leaf,
      color: 'from-lime-400 to-green-500',
      isNew: true,
    },
    {
      id: '5',
      name: 'High Yield Stable',
      strategy: 'Multi-Stablecoin Arbitrage',
      apy: 24.8,
      tvl: '$456M',
      risk: 'High',
      icon: Rocket,
      color: 'from-pink-400 to-purple-500',
    },
    {
      id: '6',
      name: 'Locked USDT Vault',
      strategy: 'USDT Long-term Staking',
      apy: 15.3,
      tvl: '$3.2B',
      risk: 'Low',
      icon: Lock,
      color: 'from-purple-400 to-indigo-500',
    },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return isDark ? 'text-green-400 bg-green-500/20' : 'text-green-600 bg-green-100';
      case 'Medium':
        return isDark ? 'text-yellow-400 bg-yellow-500/20' : 'text-yellow-600 bg-yellow-100';
      case 'High':
        return isDark ? 'text-red-400 bg-red-500/20' : 'text-red-600 bg-red-100';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-4xl tracking-tight mb-2 transition-colors duration-500 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Vaults
        </h1>
        <p className={`transition-colors duration-500 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Explore our curated selection of yield-generating strategies
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-3xl backdrop-blur-xl border p-6 transition-colors duration-500 ${
          isDark
            ? 'bg-white/5 border-white/10'
            : 'bg-white/50 border-white/60'
        }`}>
          <div className={`text-xs tracking-widest uppercase mb-2 transition-colors duration-500 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Total Vaults
          </div>
          <div className={`text-3xl tracking-tight transition-colors duration-500 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {vaults.length}
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
            Total TVL
          </div>
          <div className={`text-3xl tracking-tight transition-colors duration-500 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            $14.5B
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
            Avg APY
          </div>
          <div className={`text-3xl tracking-tight transition-colors duration-500 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            15.2%
          </div>
        </div>
      </div>

      {/* Vaults Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vaults.map((vault) => {
          const Icon = vault.icon;
          return (
            <div
              key={vault.id}
              className={`group relative rounded-3xl backdrop-blur-xl border p-6 transition-all duration-500 hover:scale-[1.02] cursor-pointer ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  : 'bg-white/50 border-white/60 hover:bg-white/70 hover:border-white/80'
              }`}
            >
              {/* New Badge */}
              {vault.isNew && (
                <div className="absolute top-4 right-4">
                  <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-500 ${
                    isDark
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                      : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  }`}>
                    NEW
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className="mb-4">
                <div className="relative inline-block">
                  <div className={`absolute inset-0 bg-gradient-to-br ${vault.color} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`} />
                  <div className={`relative bg-gradient-to-br ${vault.color} p-3 rounded-2xl`}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h3 className={`text-xl tracking-tight mb-1 transition-colors duration-500 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {vault.name}
                  </h3>
                  <p className={`text-sm transition-colors duration-500 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {vault.strategy}
                  </p>
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs uppercase tracking-wider transition-colors duration-500 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      APY
                    </span>
                    <span className={`text-xl tracking-tight transition-colors duration-500 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      +{vault.apy}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs uppercase tracking-wider transition-colors duration-500 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      TVL
                    </span>
                    <span className={`transition-colors duration-500 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {vault.tvl}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs uppercase tracking-wider transition-colors duration-500 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      Risk
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(vault.risk)}`}>
                      {vault.risk}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button className={`w-full mt-4 py-3 rounded-2xl transition-all duration-500 ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-white/60 hover:bg-white/80 text-gray-900'
                }`}>
                  Enter Vault
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}