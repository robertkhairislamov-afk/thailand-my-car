import { TrendingUp, Clock, Award, Vote, Car, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface InvestmentTiersProps {
  isDark: boolean;
  walletConnected: boolean;
  onInvest: (tier: number) => void;
}

export function InvestmentTiers({ isDark, walletConnected, onInvest }: InvestmentTiersProps) {
  const tiers = [
    {
      id: 1,
      name: '6 месяцев +20%',
      description: 'Краткосрочная инвестиция с фиксированной доходностью',
      minInvestment: {
        baht: 404600,
        usd: 12400,
        usdt: 12400
      },
      returns: {
        period: '6 месяцев',
        percentage: 20,
        baht: 485520,
        bonus: '1% / мес при досрочном выводе'
      },
      features: [
        { icon: TrendingUp, text: 'Гарантированный возврат +20%' },
        { icon: Clock, text: 'Возврат через 6 месяцев' },
        { icon: DollarSign, text: 'Бонус 1%/мес при досрочном выводе' },
        { icon: Award, text: 'NFT-сертификат инвестора' }
      ],
      color: '#28B48C',
      gradient: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
      popular: true
    },
    {
      id: 2,
      name: 'Долгосрочное участие',
      description: 'Получайте долю от прибыли и автомобиль в собственность',
      minInvestment: {
        baht: 404600,
        usd: 12400,
        usdt: 12400
      },
      returns: {
        period: '~3 года',
        percentage: null,
        bonus: 'Доля от прибыли + машина в собственность'
      },
      features: [
        { icon: Car, text: 'Автомобиль в собственность через 3 года' },
        { icon: TrendingUp, text: 'Доля от ежемесячной прибыли' },
        { icon: DollarSign, text: '100% дохода при своих клиентах' },
        { icon: Vote, text: 'Governance токены для голосования' }
      ],
      color: '#FFC850',
      gradient: 'linear-gradient(135deg, #FFC850 0%, #009696 100%)',
      popular: false
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {tiers.map((tier, index) => (
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
            {/* Popular Badge */}
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm shadow-lg"
                style={{
                  background: tier.gradient,
                  color: '#FFFAF0',
                  fontWeight: 600
                }}
              >
                Популярный выбор
              </div>
            )}

            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl mb-2" style={{ 
                color: tier.color,
                fontWeight: 700
              }}>
                {tier.name}
              </h3>
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
                Минимальная инвестиция
              </div>
              <div className="text-3xl mb-1" style={{ 
                color: isDark ? '#FFFAF0' : '#143C50',
                fontWeight: 700
              }}>
                ฿{tier.minInvestment.baht.toLocaleString()}
              </div>
              <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                ~${tier.minInvestment.usd.toLocaleString()} / {tier.minInvestment.usdt.toLocaleString()} USDT
              </div>
            </div>

            {/* Returns */}
            <div className="mb-6 p-4 rounded-2xl" style={{
              backgroundColor: isDark ? 'rgba(255, 200, 80, 0.1)' : 'rgba(255, 200, 80, 0.05)',
              border: `1px solid ${isDark ? 'rgba(255, 200, 80, 0.2)' : 'rgba(255, 200, 80, 0.1)'}`
            }}>
              <div className="text-sm mb-2 opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                Возврат
              </div>
              {tier.returns.percentage ? (
                <>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl" style={{ 
                      color: '#FFC850',
                      fontWeight: 700
                    }}>
                      +{tier.returns.percentage}%
                    </span>
                    <span className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                      через {tier.returns.period}
                    </span>
                  </div>
                  <div className="text-sm mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    = ฿{tier.returns.baht?.toLocaleString()}
                  </div>
                </>
              ) : (
                <div className="text-lg mb-2" style={{ 
                  color: isDark ? '#FFFAF0' : '#143C50',
                  fontWeight: 600
                }}>
                  {tier.returns.bonus}
                </div>
              )}
              {tier.returns.bonus && tier.returns.percentage && (
                <div className="text-sm" style={{ color: '#28B48C' }}>
                  Бонус: {tier.returns.bonus}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="mb-6 space-y-3">
              {tier.features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="p-2 rounded-lg flex-shrink-0" style={{
                      backgroundColor: isDark ? 'rgba(40, 180, 140, 0.2)' : 'rgba(40, 180, 140, 0.1)'
                    }}>
                      <Icon className="w-4 h-4" style={{ color: '#28B48C' }} />
                    </div>
                    <span className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                      {feature.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => onInvest(tier.id)}
              disabled={!walletConnected}
              className="w-full py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: walletConnected ? tier.gradient : isDark ? 'rgba(255, 250, 240, 0.2)' : 'rgba(20, 60, 80, 0.2)',
                color: '#FFFAF0',
                fontWeight: 600
              }}
            >
              {walletConnected ? 'Инвестировать' : 'Подключите кошелек'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-12 p-6 rounded-2xl text-center"
        style={{
          backgroundColor: isDark ? 'rgba(0, 150, 150, 0.1)' : 'rgba(0, 150, 150, 0.05)',
          border: `1px solid ${isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)'}`
        }}
      >
        <p className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
          💡 <strong>Принимаем:</strong> USDT, USDC на Binance Smart Chain (BSC) • 
          <strong> Комиссии сети:</strong> ~$0.20 • 
          <strong> Escrow защита</strong> до достижения цели сбора
        </p>
      </motion.div>
    </div>
  );
}
