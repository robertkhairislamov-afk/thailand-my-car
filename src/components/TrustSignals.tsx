import { Shield, Brain, Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface TrustSignalsProps {
  view: 'calm' | 'warning' | 'success';
  isDark: boolean;
}

export function TrustSignals({ view, isDark }: TrustSignalsProps) {
  const topVaults = [
    { name: 'USDC Pool', ticker: 'USDC', value: '$14.5B', change: '+4.2%', positive: true },
    { name: 'USDT Vault', ticker: 'USDT', value: '$12.3B', change: '+3.8%', positive: true },
    { name: 'DAI Strategy', ticker: 'DAI', value: '$8.7B', change: '+5.1%', positive: true },
    { name: 'Multi-Stable', ticker: 'BUSD', value: '$5.2B', change: '+2.9%', positive: true },
  ];

  const recentActivity = [
    { action: 'Deposit', time: '2 mins ago', amount: '+$5.5M USDC' },
    { action: 'Yield Claim', time: '1 hour ago', amount: '+$37.77 USDT' },
    { action: 'Withdraw', time: '3 hours ago', amount: '+$41.08 DAI' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Vaults */}
      <div className={`rounded-[24px] backdrop-blur-2xl border shadow-xl p-5 overflow-hidden transition-colors duration-500 ${
        isDark
          ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 shadow-black/20'
          : 'bg-gradient-to-br from-white/50 to-white/30 border-white/60 shadow-purple-100/10'
      }`}>
        <div className={`text-xs tracking-widest uppercase mb-4 transition-colors duration-500 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>Top Vaults</div>
        
        <div className="space-y-3">
          {topVaults.map((vault, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  index === 0 
                    ? 'bg-gradient-to-br from-purple-500/40 to-blue-500/40 text-purple-300'
                    : index === 1
                    ? 'bg-gradient-to-br from-orange-500/40 to-yellow-500/40 text-orange-300'
                    : index === 2
                    ? 'bg-gradient-to-br from-cyan-500/40 to-green-500/40 text-cyan-300'
                    : 'bg-gradient-to-br from-pink-500/40 to-purple-500/40 text-pink-300'
                }`}>
                  {vault.ticker.slice(0, 1)}
                </div>
                <div>
                  <div className={`text-sm transition-colors duration-500 ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}>{vault.name}</div>
                  <div className="text-xs text-gray-500">{vault.ticker}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm transition-colors duration-500 ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>{vault.value}</div>
                <div className={`text-xs ${vault.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {vault.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`rounded-[24px] backdrop-blur-2xl border shadow-xl p-5 transition-colors duration-500 ${
        isDark
          ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 shadow-black/20'
          : 'bg-gradient-to-br from-white/50 to-white/30 border-white/60 shadow-purple-100/10'
      }`}>
        <div className={`text-xs tracking-widest uppercase mb-4 transition-colors duration-500 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>Recent Activity</div>
        
        <div className="space-y-3 mb-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.action === 'Deposit'
                    ? 'bg-green-500/20'
                    : activity.action === 'Yield Claim'
                    ? 'bg-purple-500/20'
                    : 'bg-orange-500/20'
                }`}>
                  {activity.action === 'Deposit' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : activity.action === 'Yield Claim' ? (
                    <Activity className="w-4 h-4 text-purple-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-orange-400" />
                  )}
                </div>
                <div>
                  <div className={`text-sm transition-colors duration-500 ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}>{activity.action}</div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              </div>
              <div className={`text-sm transition-colors duration-500 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>{activity.amount}</div>
            </div>
          ))}
        </div>

        {/* Deposit Button */}
        <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 text-white tracking-wide">
          DEPOSIT
        </button>
      </div>

      {/* Safety Module */}
      <div className={`rounded-[24px] backdrop-blur-2xl border shadow-xl p-5 transition-colors duration-500 ${
        isDark
          ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 shadow-green-500/10'
          : 'bg-gradient-to-br from-white/50 to-white/30 border-white/60 shadow-green-100/10'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className={`text-sm transition-colors duration-500 ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>Safety Module</div>
            <div className={`text-xs transition-colors duration-500 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>$5.2M Covered</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className={`transition-colors duration-500 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Coverage Ratio</span>
            <span className="text-green-400">142%</span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden transition-colors duration-500 ${
            isDark ? 'bg-white/10' : 'bg-white/40'
          }`}>
            <div className="h-full w-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className={`rounded-[24px] backdrop-blur-2xl border shadow-xl p-5 transition-all duration-500 ${
        view === 'success'
          ? isDark
            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border-yellow-500/30 shadow-yellow-500/10'
            : 'bg-gradient-to-br from-yellow-100/50 to-orange-100/30 border-yellow-200/60 shadow-yellow-100/10'
          : isDark
          ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 shadow-purple-500/10'
          : 'bg-gradient-to-br from-white/50 to-white/30 border-white/60 shadow-purple-100/10'
      }`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-xl shadow-md transition-all duration-500 ${
            view === 'success'
              ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
              : 'bg-gradient-to-br from-purple-500 to-blue-600'
          }`}>
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className={`text-sm transition-colors duration-500 ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>AI Analysis</div>
            <div className={`text-xs transition-colors duration-500 ${
              view === 'success' 
                ? 'text-orange-400' 
                : isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>Network Monitor</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${
              view === 'success' ? 'bg-yellow-400' : 'bg-green-400'
            } animate-pulse`} />
          </div>
          <span className={`text-sm transition-colors duration-500 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {view === 'success' ? 'Boost mode optimal' : 'All systems operational'}
          </span>
        </div>

        <div className={`p-3 rounded-xl transition-colors duration-500 text-xs ${
          view === 'success'
            ? isDark
              ? 'bg-yellow-500/20 text-orange-300'
              : 'bg-yellow-100/50 text-orange-700'
            : isDark
            ? 'bg-purple-500/20 text-purple-300'
            : 'bg-purple-100/50 text-purple-700'
        }`}>
          {view === 'success'
            ? '✨ Enhanced tokenomics generating additional yield'
            : 'Analyzing 1,247 pools across 8 networks'
          }
        </div>
      </div>
    </div>
  );
}