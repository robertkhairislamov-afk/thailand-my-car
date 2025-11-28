import { useState, useEffect } from 'react';
import { Car, TrendingUp, Shield, Clock, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { api } from '../../services/api';
import toyotaHeroImage from 'figma:asset/f4f6aa0cc69c114af6280953f6146b45713388f5.png';

interface HeroProps {
  isDark: boolean;
  onInvestClick: () => void;
}

interface FundraisingData {
  target: { baht: number; usd: number };
  current: { baht: number; usd: number };
  progress: number;
  investors: { current: number; max: number };
  cars: { total: number; assigned: number; available: number };
  deadline: string;
  isActive: boolean;
}

export function Hero({ isDark, onInvestClick }: HeroProps) {
  const [fundraising, setFundraising] = useState<FundraisingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFundraising = async () => {
      const response = await api.getFundraising();
      if (response.data) {
        setFundraising(response.data);
      }
      setLoading(false);
    };
    loadFundraising();
  }, []);

  // Default values while loading
  const targetBaht = fundraising?.target.baht || 2800000;
  const targetUSD = fundraising?.target.usd || 85000;
  const currentBaht = fundraising?.current.baht || 0;
  const currentUSD = fundraising?.current.usd || 0;
  const progress = fundraising?.progress || 0;
  const investorsCount = fundraising?.investors.current || 0;
  const maxInvestors = fundraising?.investors.max || 9;
  const carsAvailable = fundraising?.cars?.available || 9;
  const totalCars = fundraising?.cars?.total || 9;

  // Countdown to deadline
  const deadline = new Date(fundraising?.deadline || '2025-01-31T23:59:59');
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-[#009696]' : 'bg-[#009696]'
        }`} />
        <div className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-[#FFC850]' : 'bg-[#FFC850]'
        }`} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* Main Hero Content */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: isDark 
                ? 'rgba(0, 150, 150, 0.2)' 
                : 'rgba(0, 150, 150, 0.1)',
              border: `1px solid ${isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'}`
            }}
          >
            <Car className="w-4 h-4" style={{ color: '#009696' }} />
            <span className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
              Инвестиции в рентал-бизнес через блокчейн
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl tracking-tight mb-6"
            style={{ 
              color: isDark ? '#FFC850' : '#143C50',
              fontWeight: 700,
              lineHeight: 1.1
            }}
          >
            Инвестируйте в рентал-бизнес<br />
            <span style={{ color: '#009696' }}>с криптовалютой</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            style={{
              color: isDark ? '#FFFAF0' : '#143C50',
              opacity: 0.9
            }}
          >
            {totalCars} автомобилей Toyota • От $1,000 • 2.5%/мес или авто в собственность
          </motion.p>

          {/* Key Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mb-12"
          >
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(40, 180, 140, 0.2)' : 'rgba(40, 180, 140, 0.1)' }}>
                <Car className="w-5 h-5" style={{ color: '#28B48C' }} />
              </div>
              <div className="text-left">
                <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Авто доступно</div>
                <div className="text-lg" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>{carsAvailable} из {totalCars}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)' }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#009696' }} />
              </div>
              <div className="text-left">
                <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Стейкинг</div>
                <div className="text-lg" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>2.5%/мес</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(255, 200, 80, 0.2)' : 'rgba(255, 200, 80, 0.1)' }}>
                <Shield className="w-5 h-5" style={{ color: '#FFC850' }} />
              </div>
              <div className="text-left">
                <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Крупным инвесторам</div>
                <div className="text-lg" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>+20% или авто</div>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onClick={onInvestClick}
            className="px-8 py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
              color: '#FFFAF0',
              fontWeight: 600
            }}
          >
            Инвестировать сейчас
          </motion.button>
        </div>

        {/* Fundraising Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-4xl mx-auto rounded-3xl p-8 backdrop-blur-xl border shadow-2xl"
          style={{
            background: isDark 
              ? 'linear-gradient(135deg, rgba(26, 78, 100, 0.9) 0%, rgba(20, 60, 80, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 250, 240, 0.8) 100%)',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h3 className="text-2xl mb-1" style={{ color: isDark ? '#FFC850' : '#143C50', fontWeight: 600 }}>
                Сбор средств
              </h3>
              <p className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                Инвесторов: {investorsCount} / {maxInvestors}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
              backgroundColor: isDark ? 'rgba(255, 200, 80, 0.2)' : 'rgba(255, 200, 80, 0.1)',
              border: `1px solid ${isDark ? 'rgba(255, 200, 80, 0.3)' : 'rgba(255, 200, 80, 0.2)'}`
            }}>
              <Clock className="w-4 h-4" style={{ color: '#FFC850' }} />
              <span className="text-sm" style={{ color: isDark ? '#FFC850' : '#143C50', fontWeight: 600 }}>
                {daysLeft} дней осталось
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-3xl mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
                  ฿{currentBaht.toLocaleString()}
                </div>
                <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  ${currentUSD.toLocaleString()} USDT собрано
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl mb-1" style={{ color: '#009696', fontWeight: 600 }}>
                  {progress.toFixed(1)}%
                </div>
                <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  Цель: ฿{targetBaht.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-3 rounded-full overflow-hidden" style={{
              backgroundColor: isDark ? 'rgba(255, 250, 240, 0.1)' : 'rgba(20, 60, 80, 0.1)'
            }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
                className="h-full rounded-full relative"
                style={{
                  background: 'linear-gradient(90deg, #28B48C 0%, #009696 100%)'
                }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-50"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    animation: 'shimmer 2s infinite'
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-6"
            style={{
              borderTop: `1px solid ${isDark ? 'rgba(255, 250, 240, 0.1)' : 'rgba(20, 60, 80, 0.1)'}`
            }}
          >
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5" style={{ color: '#28B48C' }} />
              <span className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                Авто в собственность: {carsAvailable} свободно
              </span>
            </div>
            <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
              Min: $1,000 (стейкинг) • $12,400 (авто)
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}