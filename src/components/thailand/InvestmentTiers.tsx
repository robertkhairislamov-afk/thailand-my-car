import { useState, useEffect } from 'react';
import { TrendingUp, Clock, Award, Car, DollarSign, Loader2, Percent, AlertCircle, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../../services/api';

interface InvestmentTiersProps {
  isDark: boolean;
  walletConnected: boolean;
  onInvest: (tier: number) => void;
}

interface TierData {
  id: number;
  name: string;
  description: string;
  min_investment_baht: string;
  min_investment_usd: string;
  duration_months: number;
  return_percentage: string | null;
  features: string[];
  is_active: boolean;
}

interface PlatformSettings {
  platform_wallet: string;
  staking_monthly_rate: string;
  staking_annual_rate: string;
  large_investor_return: string;
  early_withdrawal_fee: string;
  min_staking_investment_usd: string;
  min_car_investment_usd: string;
  total_cars_available: string;
}

const featureIcons: Record<string, any> = {
  '2.5%': Percent,
  '30%': Percent,
  '+20%': TrendingUp,
  'месяц': Clock,
  'Вывод': DollarSign,
  'комиссия': AlertCircle,
  'Автомобиль': Car,
  'авто': Car,
  'Приоритет': Award,
  'изменить': Check,
};

function getIconForFeature(feature: string) {
  for (const [key, icon] of Object.entries(featureIcons)) {
    if (feature.includes(key)) return icon;
  }
  return Check;
}

export function InvestmentTiers({ isDark, walletConnected, onInvest }: InvestmentTiersProps) {
  const [tiers, setTiers] = useState<TierData[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [carsAvailable, setCarsAvailable] = useState<number>(9);

  useEffect(() => {
    const loadData = async () => {
      const [tiersRes, settingsRes, carsRes] = await Promise.all([
        api.getInvestmentTiers(),
        api.getPlatformSettings(),
        api.getCarsAvailable()
      ]);

      if (tiersRes.data) setTiers(tiersRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
      if (carsRes.data) setCarsAvailable(carsRes.data.available);

      setLoading(false);
    };
    loadData();
  }, []);

  const tierStyles = [
    {
      color: '#28B48C',
      gradient: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
      badge: null
    },
    {
      color: '#FFC850',
      gradient: 'linear-gradient(135deg, #FFC850 0%, #009696 100%)',
      badge: `${carsAvailable} авто осталось`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4" style={{
            color: isDark ? '#FFC850' : '#143C50',
            fontWeight: 700
          }}>
            Варианты инвестиций
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{
            color: isDark ? '#FFFAF0' : '#143C50',
            opacity: 0.8
          }}>
            Выберите подходящую стратегию инвестирования
          </p>
        </motion.div>
      </div>

      {/* Tiers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#009696' }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tiers.map((tier, index) => {
            const minBaht = parseFloat(tier.min_investment_baht);
            const minUsd = parseFloat(tier.min_investment_usd);
            const returnPct = tier.return_percentage ? parseFloat(tier.return_percentage) : null;
            const style = tierStyles[index % tierStyles.length];
            const isStaking = tier.name.toLowerCase().includes('стейкинг');
            const isCarShare = tier.name.toLowerCase().includes('авто');

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative rounded-3xl p-8 backdrop-blur-xl border shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(26, 78, 100, 0.9) 0%, rgba(20, 60, 80, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 250, 240, 0.9) 100%)',
                  borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
                }}
              >
                {/* Badge */}
                {style.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm shadow-lg"
                    style={{
                      background: style.gradient,
                      color: '#FFFAF0',
                      fontWeight: 600
                    }}
                  >
                    {style.badge}
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    {isStaking ? (
                      <Percent className="w-8 h-8" style={{ color: style.color }} />
                    ) : (
                      <Car className="w-8 h-8" style={{ color: style.color }} />
                    )}
                    <h3 className="text-2xl md:text-3xl" style={{
                      color: style.color,
                      fontWeight: 700
                    }}>
                      {tier.name}
                    </h3>
                  </div>
                  <p className="opacity-80" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    {tier.description}
                  </p>
                </div>

                {/* Investment Amount */}
                <div className="mb-6 p-4 rounded-2xl" style={{
                  backgroundColor: isDark ? 'rgba(0, 150, 150, 0.1)' : 'rgba(0, 150, 150, 0.05)',
                  border: `1px solid ${isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)'}`
                }}>
                  <div className="text-sm mb-2 opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    {isStaking ? 'Минимальная инвестиция' : 'Полная стоимость автомобиля'}
                  </div>
                  <div className="text-3xl mb-1" style={{
                    color: isDark ? '#FFFAF0' : '#143C50',
                    fontWeight: 700
                  }}>
                    ${minUsd.toLocaleString()} USDT
                  </div>
                  <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    ~฿{minBaht.toLocaleString()}
                  </div>
                </div>

                {/* Returns Info */}
                <div className="mb-6 p-4 rounded-2xl" style={{
                  backgroundColor: isDark ? 'rgba(255, 200, 80, 0.1)' : 'rgba(255, 200, 80, 0.05)',
                  border: `1px solid ${isDark ? 'rgba(255, 200, 80, 0.2)' : 'rgba(255, 200, 80, 0.1)'}`
                }}>
                  <div className="text-sm mb-2 opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    {isStaking ? 'Доходность' : 'Через 6 месяцев'}
                  </div>
                  {isStaking ? (
                    <>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl" style={{
                          color: '#FFC850',
                          fontWeight: 700
                        }}>
                          {settings?.staking_monthly_rate || '2.5'}%/мес
                        </span>
                        <span className="text-lg opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          ({settings?.staking_annual_rate || '30'}% годовых)
                        </span>
                      </div>
                      <div className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.8 }}>
                        Вывод в любой момент • {settings?.early_withdrawal_fee || '5'}% комиссия до 6 мес
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-lg mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                        <span className="font-bold" style={{ color: '#FFC850' }}>Выбор инвестора:</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5" style={{ color: '#28B48C' }} />
                          <span className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                            Забрать <strong>+{settings?.large_investor_return || '20'}%</strong> возврат
                          </span>
                        </div>
                        <div className="text-center text-sm opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          ИЛИ
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="w-5 h-5" style={{ color: '#FFC850' }} />
                          <span className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                            Ждать <strong>авто в собственность</strong> (после выплаты кредита)
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Features */}
                <div className="mb-6 space-y-3">
                  {tier.features.map((feature, idx) => {
                    const Icon = getIconForFeature(feature);
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="p-2 rounded-lg flex-shrink-0" style={{
                          backgroundColor: isDark ? 'rgba(40, 180, 140, 0.2)' : 'rgba(40, 180, 140, 0.1)'
                        }}>
                          <Icon className="w-4 h-4" style={{ color: '#28B48C' }} />
                        </div>
                        <span className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          {feature}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Car availability warning for car tier */}
                {isCarShare && carsAvailable <= 3 && (
                  <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{
                    backgroundColor: 'rgba(255, 200, 80, 0.2)',
                    border: '1px solid rgba(255, 200, 80, 0.3)'
                  }}>
                    <AlertCircle className="w-5 h-5" style={{ color: '#FFC850' }} />
                    <span className="text-sm" style={{ color: '#FFC850' }}>
                      Осталось мало авто! Кто первый - тот получает.
                    </span>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => onInvest(tier.id)}
                  disabled={!walletConnected || (isCarShare && carsAvailable === 0)}
                  className="w-full py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: walletConnected && !(isCarShare && carsAvailable === 0)
                      ? style.gradient
                      : isDark ? 'rgba(255, 250, 240, 0.2)' : 'rgba(20, 60, 80, 0.2)',
                    color: '#FFFAF0',
                    fontWeight: 600
                  }}
                >
                  {!walletConnected
                    ? 'Подключите кошелек'
                    : isCarShare && carsAvailable === 0
                      ? 'Все авто зарезервированы'
                      : 'Инвестировать'}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Platform Wallet Info */}
      {settings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 p-6 rounded-2xl"
          style={{
            backgroundColor: isDark ? 'rgba(0, 150, 150, 0.1)' : 'rgba(0, 150, 150, 0.05)',
            border: `1px solid ${isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)'}`
          }}
        >
          <div className="text-center">
            <p className="text-sm mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
              <strong>Кошелёк для инвестиций (BSC Network):</strong>
            </p>
            <code className="px-4 py-2 rounded-lg text-sm break-all" style={{
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
              color: '#009696'
            }}>
              {settings.platform_wallet}
            </code>
            <p className="text-sm mt-4 opacity-80" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
              💡 Принимаем: <strong>USDT, USDC</strong> на Binance Smart Chain (BSC) •
              Комиссия сети: ~$0.20
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
