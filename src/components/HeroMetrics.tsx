import { TrendingUp, Sparkles } from 'lucide-react';
import { YieldChart } from './YieldChart';
import { useState } from 'react';

interface HeroMetricsProps {
  boostActive: boolean;
  onBoostToggle: () => void;
  view: 'calm' | 'warning' | 'success';
  isDark: boolean;
}

export function HeroMetrics({ boostActive, onBoostToggle, view, isDark }: HeroMetricsProps) {
  const baseAPY = 12.45;
  const boostedAPY = 18.67;
  const currentAPY = boostActive ? boostedAPY : baseAPY;
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');

  return (
    <div className="relative">
      {/* Main Hero Card */}
      <div className={`relative overflow-hidden rounded-[32px] backdrop-blur-2xl border shadow-2xl p-8 md:p-10 transition-colors duration-500 ${
        isDark
          ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 shadow-black/20'
          : 'bg-gradient-to-br from-white/50 to-white/30 border-white/60 shadow-purple-200/10'
      }`}>
        
        {/* Top Row: TVL + APY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Total Value Locked */}
          <div className="space-y-3">
            <div className={`text-xs tracking-widest uppercase transition-colors duration-500 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Value Locked</div>
            <div className={`transition-all duration-500 ${
              view === 'success' 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400' 
                : isDark ? 'text-white' : 'text-white'
            }`}>
              <div className="text-6xl md:text-7xl tracking-tight drop-shadow-lg">
                $14.5B
              </div>
            </div>
          </div>

          {/* Your Yield (APY) */}
          <div className="space-y-3 md:text-right">
            <div className={`text-xs tracking-widest uppercase transition-colors duration-500 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Your Yield</div>
            <div className="flex items-baseline gap-2 md:justify-end">
              <span className={`text-6xl md:text-7xl tracking-tight transition-all duration-500 ${
                view === 'success' 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 drop-shadow-lg' 
                  : isDark ? 'text-white drop-shadow-lg' : 'text-white drop-shadow-lg'
              }`}>
                +{currentAPY.toFixed(1)}%
              </span>
              {boostActive && (
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              )}
            </div>
            
            {/* Boost Toggle */}
            <div className="flex items-center gap-3 md:justify-end mt-4">
              <span className={`text-xs transition-colors duration-500 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Boost Mode</span>
              <button
                onClick={onBoostToggle}
                className={`relative w-14 h-7 rounded-full transition-all duration-500 ${
                  boostActive 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-md shadow-orange-500/30' 
                    : isDark ? 'bg-white/20' : 'bg-white/60'
                }`}
              >
                <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-500 ${
                  boostActive ? 'translate-x-7' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Timeframe Selector and Label Row */}
        <div className="flex items-center justify-between mb-4">
          <div className={`text-xs tracking-widest uppercase transition-colors duration-500 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {timeframe === 'weekly' ? 'Weekly APY' : timeframe === 'monthly' ? 'Monthly APY' : 'Yearly APY'}
          </div>
          
          {/* Timeframe Toggle */}
          <div className={`flex items-center gap-1 p-1 rounded-full backdrop-blur-sm border transition-colors duration-500 ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-white/60 border-white/60'
          }`}>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1 rounded-full text-xs transition-all duration-300 ${
                timeframe === 'weekly'
                  ? isDark
                    ? 'bg-cyan-500/30 text-cyan-300 shadow-sm shadow-cyan-500/20'
                    : 'bg-cyan-100 text-cyan-700'
                  : isDark
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1 rounded-full text-xs transition-all duration-300 ${
                timeframe === 'monthly'
                  ? isDark
                    ? 'bg-cyan-500/30 text-cyan-300 shadow-sm shadow-cyan-500/20'
                    : 'bg-cyan-100 text-cyan-700'
                  : isDark
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeframe('yearly')}
              className={`px-3 py-1 rounded-full text-xs transition-all duration-300 ${
                timeframe === 'yearly'
                  ? isDark
                    ? 'bg-cyan-500/30 text-cyan-300 shadow-sm shadow-cyan-500/20'
                    : 'bg-cyan-100 text-cyan-700'
                  : isDark
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Chart */}
        <YieldChart view={view} boostActive={boostActive} isDark={isDark} timeframe={timeframe} />
      </div>
    </div>
  );
}