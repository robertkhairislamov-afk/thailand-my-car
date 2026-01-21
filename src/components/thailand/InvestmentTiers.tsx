import { TrendingUp, Clock, Award, Vote, Car, DollarSign, Percent, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';

interface InvestmentTiersProps {
  isDark: boolean;
  walletConnected: boolean;
  onInvest: (tierId: number) => void;
}

export function InvestmentTiers({ isDark, walletConnected, onInvest }: InvestmentTiersProps) {
  const { t } = useLanguage();

  const handleInvest = (tier: number) => {
    if (!walletConnected) {
      alert(t('alert.connectWallet'));
      return;
    }
    onInvest(tier);
  };
  
  const tiers = [
    {
      id: 3,
      name: t('tiers.staking'),
      badge: t('tiers.stakingBadge'),
      description: t('tiers.stakingDesc'),
      subtitle: `8 ${t('tiers.carsLeft')}`,
      minInvestment: {
        baht: 31900,
        usd: 1000,
        usdt: 1000
      },
      features: [
        t('tiers.stakingFeature1'),
        t('tiers.stakingFeature2'),
        t('tiers.stakingFeature3'),
        t('tiers.stakingFeature4')
      ],
      color: '#40E0D0'
    },
    {
      id: 4,
      name: t('tiers.carShare'),
      badge: null,
      description: t('tiers.carShareDesc'),
      subtitle: null,
      minInvestment: {
        baht: 395560,
        usd: 12400,
        usdt: 12400
      },
      features: [
        t('tiers.carShareFeature1'),
        t('tiers.carShareFeature2'),
        t('tiers.carShareFeature3'),
        t('tiers.carShareFeature4')
      ],
      color: '#FFC850'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 
          className="text-3xl md:text-4xl lg:text-5xl mb-6" 
          style={{ 
            background: 'linear-gradient(135deg, #FFC850 0%, #40E0D0 50%, #FFC850 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            letterSpacing: '0.02em',
            textShadow: '0 0 40px rgba(64, 224, 208, 0.3)',
            filter: 'drop-shadow(0 0 20px rgba(255, 200, 80, 0.4))'
          }}
        >
          {t('tiers.options')}
        </h2>
        <div 
          className="w-32 h-1 mx-auto mb-6 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #40E0D0, #FFC850, #40E0D0, transparent)',
            boxShadow: '0 0 20px rgba(64, 224, 208, 0.5)'
          }}
        />
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-4" style={{
          color: isDark ? '#FFFAF0' : '#143C50',
          opacity: 0.8,
          lineHeight: 1.6
        }}>
          {t('tiers.subtitle')}
        </p>
        {/* Legal disclaimer - qualified investors */}
        <p className="text-sm max-w-2xl mx-auto px-4 py-2 rounded-lg" style={{
          color: '#FFC850',
          backgroundColor: isDark ? 'rgba(255, 200, 80, 0.1)' : 'rgba(255, 200, 80, 0.15)',
          border: '1px solid rgba(255, 200, 80, 0.3)'
        }}>
          {t('tiers.qualifiedInvestors')}
        </p>
      </motion.div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="rounded-3xl p-6 md:p-8 backdrop-blur-xl border relative overflow-hidden group hover:scale-105 transition-all duration-300"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(26, 78, 100, 0.8) 0%, rgba(20, 60, 80, 0.6) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 250, 240, 0.85) 100%)',
              borderColor: tier.color,
              borderWidth: '2px',
              boxShadow: isDark 
                ? `0 0 30px ${tier.color}4d, 0 0 60px ${tier.color}26, 0 20px 40px rgba(0,0,0,0.3)`
                : `0 0 30px ${tier.color}33, 0 0 60px ${tier.color}1a, 0 20px 40px rgba(0,0,0,0.1)`
            }}
          >
            {/* Badge */}
            {tier.badge && (
              <div className="absolute top-6 right-6">
                <div className="px-4 py-2 rounded-full text-sm" style={{
                  background: tier.color,
                  color: '#FFFAF0',
                  fontWeight: 600
                }}>
                  {tier.badge}
                </div>
              </div>
            )}

            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl mb-2" style={{ 
                color: isDark ? '#FFFAF0' : '#143C50',
                fontWeight: 600
              }}>
                {tier.name}
              </h3>
              <p className="text-sm mb-4 opacity-80" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                {tier.description}
              </p>
              <div className="text-sm mb-2 opacity-60" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                {t('tiers.minInvestment')}
              </div>
              <div className="text-4xl mb-3" style={{ 
                color: tier.color,
                fontWeight: 700
              }}>
                ${tier.minInvestment.usd.toLocaleString()} USDT
              </div>
              <p className="text-sm opacity-70 mb-3" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                ~฿{tier.minInvestment.baht.toLocaleString()}
              </p>
              {tier.subtitle && (
                <div className="inline-block px-3 py-1 rounded-full text-sm" style={{
                  backgroundColor: isDark ? 'rgba(255, 200, 80, 0.2)' : 'rgba(255, 200, 80, 0.3)',
                  color: '#FFC850',
                  fontWeight: 600
                }}>
                  {tier.subtitle}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="mb-6 space-y-3">
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: tier.color }} />
                  <span className="text-sm" style={{ 
                    color: isDark ? '#FFFAF0' : '#143C50',
                    opacity: 0.9
                  }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => handleInvest(tier.id)}
              className="w-full py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${tier.color} 0%, ${tier.color}dd 100%)`,
                color: '#FFFAF0',
                fontWeight: 600
              }}
            >
              {t('tiers.invest')}
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
        <p className="text-sm flex items-start justify-center gap-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
          <DollarSign className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#28B48C' }} />
          <span>
            <strong>{t('tiers.currencies')}</strong> USDT, USDC (Binance Smart Chain) •
            <strong> {t('tiers.networkFee')}</strong> ~$0.20 •
            <strong> {t('tiers.deposit')}</strong> {t('tiers.directToWallet')}
          </span>
        </p>
      </motion.div>

      {/* Legal Disclaimer - Not a public offering */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-6 text-center"
      >
        <p className="text-xs px-4 py-2 inline-block rounded-lg" style={{
          color: isDark ? 'rgba(255, 250, 240, 0.6)' : 'rgba(20, 60, 80, 0.6)',
          backgroundColor: isDark ? 'rgba(255, 100, 100, 0.1)' : 'rgba(200, 50, 50, 0.05)',
          border: `1px solid ${isDark ? 'rgba(255, 100, 100, 0.2)' : 'rgba(200, 50, 50, 0.1)'}`
        }}>
          ⚠️ {t('tiers.notPublicOffering')}
        </p>
      </motion.div>
    </div>
  );
}