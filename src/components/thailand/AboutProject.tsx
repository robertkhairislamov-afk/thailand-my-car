import { Car, TrendingUp, Users, MapPin, Shield, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import toyotaImage1 from 'figma:asset/5ced44ff814542adbb7d542e23cd5e996dbff908.png';
import toyotaImage2 from 'figma:asset/f4f6aa0cc69c114af6280953f6146b45713388f5.png';

interface AboutProjectProps {
  isDark: boolean;
}

export function AboutProject({ isDark }: AboutProjectProps) {
  const stats = [
    { icon: Car, label: 'Автомобилей', value: '9', subtitle: 'Toyota в автопарке' },
    { icon: TrendingUp, label: 'Ежемесячный доход', value: '180k+', subtitle: '฿ стабильный поток' },
    { icon: Users, label: 'Загрузка', value: '85%', subtitle: 'Средняя за 2024' },
    { icon: MapPin, label: 'Локация', value: 'Паттайя', subtitle: 'Туристический центр' }
  ];

  const timeline = [
    { year: '2022', label: 'Запуск', value: '3 авто', color: '#28B48C' },
    { year: '2023', label: 'Рост', value: '6 авто', color: '#009696' },
    { year: '2024', label: 'Сейчас', value: '9 авто', color: '#FFC850' }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Страхование',
      description: 'Все автомобили застрахованы по полной программе КАСКО'
    },
    {
      icon: BarChart3,
      title: 'Прозрачность',
      description: 'Ежемесячные отчеты и доступ к метрикам в реальном времени'
    },
    {
      icon: Users,
      title: 'Опыт',
      description: '2+ года успешной работы на рынке рентала в Таиланде'
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
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4" style={{ 
          color: isDark ? '#FFC850' : '#143C50',
          fontWeight: 700
        }}>
          О проекте
        </h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ 
          color: isDark ? '#FFFAF0' : '#143C50',
          opacity: 0.8
        }}>
          Действующий бизнес по прокату автомобилей Toyota в Паттайе с проверенными показателями доходности
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="rounded-2xl p-6 backdrop-blur-xl border hover:scale-105 transition-all duration-300"
              style={{
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(26, 78, 100, 0.6) 0%, rgba(20, 60, 80, 0.4) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 250, 240, 0.7) 100%)',
                borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
              }}
            >
              <div className="p-3 rounded-xl inline-block mb-4" style={{
                backgroundColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)'
              }}>
                <Icon className="w-6 h-6" style={{ color: '#009696' }} />
              </div>
              <div className="text-sm mb-2 opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                {stat.label}
              </div>
              <div className="text-3xl mb-1" style={{ 
                color: isDark ? '#FFFAF0' : '#143C50',
                fontWeight: 700
              }}>
                {stat.value}
              </div>
              <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                {stat.subtitle}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Growth Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl p-8 md:p-12 backdrop-blur-xl border mb-16"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(26, 78, 100, 0.8) 0%, rgba(20, 60, 80, 0.6) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 250, 240, 0.8) 100%)',
          borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
        }}
      >
        <h3 className="text-2xl md:text-3xl mb-8 text-center" style={{ 
          color: isDark ? '#FFC850' : '#143C50',
          fontWeight: 700
        }}>
          История роста компании
        </h3>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 hidden md:block"
            style={{
              background: 'linear-gradient(90deg, #28B48C 0%, #009696 50%, #FFC850 100%)',
              opacity: 0.3
            }}
          />
          
          {/* Timeline items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="inline-block p-6 rounded-2xl mb-4 relative z-10" style={{
                  backgroundColor: isDark ? 'rgba(20, 60, 80, 0.9)' : 'rgba(255, 250, 240, 0.9)',
                  border: `2px solid ${item.color}`,
                  boxShadow: `0 0 20px ${item.color}40`
                }}>
                  <div className="text-sm mb-2 opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    {item.year}
                  </div>
                  <div className="text-3xl mb-1" style={{ 
                    color: item.color,
                    fontWeight: 700
                  }}>
                    {item.value}
                  </div>
                  <div className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    {item.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="rounded-2xl p-6 backdrop-blur-xl border"
              style={{
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(26, 78, 100, 0.6) 0%, rgba(20, 60, 80, 0.4) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 250, 240, 0.7) 100%)',
                borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
              }}
            >
              <div className="p-3 rounded-xl inline-block mb-4" style={{
                background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)'
              }}>
                <Icon className="w-6 h-6" style={{ color: '#FFFAF0' }} />
              </div>
              <h4 className="text-xl mb-2" style={{ 
                color: isDark ? '#FFC850' : '#143C50',
                fontWeight: 600
              }}>
                {feature.title}
              </h4>
              <p className="opacity-80" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Car Fleet Gallery */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h3 className="text-2xl md:text-3xl mb-6 text-center" style={{ 
          color: isDark ? '#FFC850' : '#143C50',
          fontWeight: 700
        }}>
          Наш автопарк Toyota
        </h3>
        <p className="text-center mb-8 max-w-2xl mx-auto" style={{ 
          color: isDark ? '#FFFAF0' : '#143C50',
          opacity: 0.8
        }}>
          Премиальные автомобили Toyota в отличном состоянии на живописных дорогах Таиланда
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative rounded-3xl overflow-hidden group cursor-pointer"
          style={{
            boxShadow: isDark 
              ? '0 20px 60px rgba(0, 150, 150, 0.3)' 
              : '0 20px 60px rgba(20, 60, 80, 0.2)'
          }}
        >
          <ImageWithFallback
            src={toyotaImage1}
            alt="Toyota Veloz - Premium 7-seater MPV"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="text-white">
              <div className="text-2xl mb-1" style={{ fontWeight: 700 }}>Toyota Veloz</div>
              <div className="text-sm opacity-90">Premium 7-seater • Идеально для семьи</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative rounded-3xl overflow-hidden group cursor-pointer"
          style={{
            boxShadow: isDark 
              ? '0 20px 60px rgba(0, 150, 150, 0.3)' 
              : '0 20px 60px rgba(20, 60, 80, 0.2)'
          }}
        >
          <ImageWithFallback
            src={toyotaImage2}
            alt="Toyota Yaris - Compact sedan perfect for city"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="text-white">
              <div className="text-2xl mb-1" style={{ fontWeight: 700 }}>Toyota Yaris</div>
              <div className="text-sm opacity-90">Компактный седан • Экономичный и надёжный</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}