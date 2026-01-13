import { motion } from 'motion/react';
import { Car, TrendingUp, MapPin, Shield, FileText, Star } from 'lucide-react';
import toyotaImage1 from '../../assets/toyota-veloz.webp';
import toyotaImage2 from '../../assets/toyota-yaris.webp';
import tmcLogo from '../../assets/TMC.webp';

interface AboutProjectProps {
  isDark: boolean;
}

export function AboutProject({ isDark }: AboutProjectProps) {
  const stats = [
    {
      icon: Car,
      value: '8',
      label: 'Новых автомобилей Toyota'
    },
    {
      icon: TrendingUp,
      value: '180,000 ฿',
      label: 'стабильный поток за месяц'
    },
    {
      icon: TrendingUp,
      value: '85%',
      label: 'Загрузка автопарка 2025'
    },
    {
      icon: MapPin,
      value: 'Паттайя',
      label: 'Туристический центр'
    }
  ];

  const timeline = [
    {
      cars: '3 АВТО',
      label: 'Старт',
      active: false
    },
    {
      cars: '5 АВТО',
      label: 'Рост',
      active: false
    },
    {
      cars: '8 АВТО',
      label: 'Сейчас',
      active: true
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Страхование',
      description: 'Полная страховка Type 1 (ชั้น 1) на авто и пассажиров',
      points: [
        'Полное покрытие ущерба автомобиля',
        'Угон и злоумышленные действия',
        'Стихийные бедствия (наводнение, пожар)',
        'Медицинские расходы водителя и пассажиров',
        'Ответственность перед третьими лицами',
        'Эвакуация и помощь на дороге 24/7'
      ]
    },
    {
      icon: FileText,
      title: 'Прозрачность',
      description: 'Ежемесячные отчеты и доступ к метрикам в реальном времени',
      points: []
    },
    {
      icon: Star,
      title: 'Опыт',
      description: '2+ года успешной работы на рынке рентала в Таиланде',
      points: []
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
          О проекте
        </h2>
        <div 
          className="w-32 h-1 mx-auto mb-6 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #40E0D0, #FFC850, #40E0D0, transparent)',
            boxShadow: '0 0 20px rgba(64, 224, 208, 0.5)'
          }}
        />
        <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ 
          color: isDark ? '#FFFAF0' : '#143C50',
          opacity: 0.8,
          lineHeight: 1.6
        }}>
          Действующий бизнес по прокату автомобилей в Паттайе с проверенными показателями доходности
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.05,
              rotateY: 5,
              rotateX: 5,
              transition: { duration: 0.3 }
            }}
            className="rounded-2xl p-6 backdrop-blur-xl border text-center transition-all duration-300 relative overflow-hidden"
            style={{
              background: isDark 
                ? 'rgba(26, 78, 100, 0.6)' 
                : 'rgba(255, 255, 255, 0.8)',
              borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
              boxShadow: '0 0 30px rgba(64, 224, 208, 0.3), 0 0 60px rgba(0, 206, 209, 0.15), 0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            {/* Gradient border */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-50"
              style={{
                background: 'linear-gradient(180deg, rgba(64, 224, 208, 0.3) 0%, transparent 50%, rgba(255, 200, 80, 0.3) 100%)',
                pointerEvents: 'none'
              }}
            />
            
            <motion.div 
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 relative z-10"
              animate={{ 
                y: [0, -8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2
              }}
              style={{ 
                background: 'linear-gradient(135deg, rgba(0, 150, 150, 0.3), rgba(64, 224, 208, 0.3))',
                boxShadow: '0 0 20px rgba(64, 224, 208, 0.4)'
              }}
            >
              {index === 0 ? (
                <img src={tmcLogo} alt="TMC" className="w-8 h-auto object-contain" />
              ) : (
                <stat.icon className="w-6 h-6" style={{ color: '#00CED1' }} />
              )}
            </motion.div>
            <div 
              className="text-2xl md:text-3xl mb-2 relative z-10" 
              style={{ 
                background: 'linear-gradient(135deg, #FFC850, #40E0D0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700,
                textShadow: '0 0 30px rgba(64, 224, 208, 0.5)',
                filter: 'drop-shadow(0 0 10px rgba(255, 200, 80, 0.3))'
              }}
            >
              {stat.value}
            </div>
            <div className="text-sm relative z-10" style={{ 
              color: isDark ? '#FFFAF0' : '#143C50',
              opacity: 0.7
            }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Timeline - История роста компании */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <h3 
          className="text-2xl md:text-3xl text-center mb-12" 
          style={{ 
            background: 'linear-gradient(135deg, #FFC850, #40E0D0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 600,
            letterSpacing: '0.02em',
            filter: 'drop-shadow(0 0 15px rgba(64, 224, 208, 0.3))'
          }}
        >
          История роста компании
        </h3>

        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-0 flex-wrap">
          {timeline.map((item, index) => (
            <div key={index} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ 
                  scale: 1.08,
                  rotateY: 8,
                  rotateX: 8,
                  transition: { duration: 0.3 }
                }}
                className="rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-xl border text-center w-[140px] sm:w-[160px] md:w-[200px] h-[140px] sm:h-[160px] md:h-[200px] flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden"
                style={{
                  background: item.active
                    ? 'linear-gradient(135deg, rgba(255, 200, 80, 0.2) 0%, rgba(0, 150, 150, 0.2) 100%)'
                    : isDark 
                      ? 'rgba(26, 78, 100, 0.4)' 
                      : 'rgba(255, 255, 255, 0.6)',
                  borderColor: item.active ? '#FFC850' : isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
                  borderWidth: item.active ? '2px' : '1px',
                  boxShadow: item.active 
                    ? '0 0 40px rgba(255, 200, 80, 0.5), 0 0 80px rgba(64, 224, 208, 0.3), 0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    : '0 0 30px rgba(64, 224, 208, 0.3), 0 0 60px rgba(0, 206, 209, 0.15), 0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                {/* Radial gradient spotlight */}
                {item.active && (
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(255, 200, 80, 0.3), transparent 70%)',
                      pointerEvents: 'none',
                      opacity: 0.5
                    }}
                  />
                )}
                
                {/* Growth Circle with TrendingUp Icon */}
                <div className="flex items-center justify-center mb-2 sm:mb-4 relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 + 0.2 }}
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: `${40 + index * 12}px`,
                      height: `${40 + index * 12}px`,
                      background: item.active 
                        ? 'linear-gradient(135deg, #FFC850, #FFD700)'
                        : 'linear-gradient(135deg, #40E0D0, #00CED1)',
                      border: `2px solid ${item.active ? '#FFC850' : '#40E0D0'}`,
                      boxShadow: item.active
                        ? '0 0 30px rgba(255, 200, 80, 0.6)'
                        : '0 0 25px rgba(64, 224, 208, 0.6)'
                    }}
                  >
                    <TrendingUp 
                      className="text-white" 
                      style={{ 
                        width: `${20 + index * 5}px`,
                        height: `${20 + index * 5}px`,
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                      }} 
                    />
                  </motion.div>
                </div>

                <div className="text-xl sm:text-2xl mb-1 sm:mb-2 relative z-10" style={{ 
                  color: item.active ? '#FFC850' : isDark ? '#FFFAF0' : '#143C50',
                  fontWeight: 700,
                  textShadow: item.active ? '0 0 20px rgba(255, 200, 80, 0.5)' : 'none'
                }}>
                  {item.cars}
                </div>
                <div className="text-xs sm:text-sm mb-1 sm:mb-2 relative z-10" style={{ 
                  color: item.active ? '#FFC850' : isDark ? '#FFFAF0' : '#143C50',
                  opacity: 0.8
                }}>
                  {item.label}
                </div>
                <div className="text-sm sm:text-base relative z-10" style={{ 
                  color: item.active ? '#FFC850' : isDark ? '#40E0D0' : '#009696',
                  opacity: 1,
                  fontWeight: 700,
                  textShadow: '0 0 15px rgba(64, 224, 208, 0.4)'
                }}>
                  {index === 0 ? '2022' : index === 1 ? '2023' : '2025'}
                </div>
              </motion.div>
              
              {index < timeline.length - 1 && (
                <div className="hidden md:block w-20 h-1 relative" style={{ overflow: 'visible' }}>
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 + 0.4 }}
                    className="absolute inset-0"
                    style={{ 
                      originX: 0,
                      background: 'linear-gradient(90deg, #40E0D0, #00CED1)',
                      boxShadow: '0 0 15px rgba(64, 224, 208, 0.6)'
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Benefits Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.05,
              rotateY: 5,
              rotateX: 5,
              transition: { duration: 0.3 }
            }}
            className="rounded-2xl p-6 backdrop-blur-xl border transition-all duration-300 relative overflow-hidden"
            style={{
              background: isDark 
                ? 'rgba(26, 78, 100, 0.6)' 
                : 'rgba(255, 255, 255, 0.8)',
              borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
              boxShadow: '0 0 30px rgba(64, 224, 208, 0.3), 0 0 60px rgba(0, 206, 209, 0.15), 0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            {/* Subtle pattern overlay */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(64, 224, 208, 0.5) 1px, transparent 0)',
                backgroundSize: '20px 20px',
                pointerEvents: 'none'
              }}
            />
            
            <motion.div 
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 relative z-10"
              animate={{ 
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.3
              }}
              style={{ 
                background: 'linear-gradient(135deg, rgba(0, 150, 150, 0.3), rgba(64, 224, 208, 0.3))',
                boxShadow: '0 0 20px rgba(64, 224, 208, 0.4)'
              }}
            >
              <benefit.icon className="w-6 h-6" style={{ color: '#00CED1' }} />
            </motion.div>
            <h4 className="text-xl mb-3 relative z-10" style={{ 
              color: isDark ? '#FFC850' : '#143C50',
              fontWeight: 600,
              textShadow: '0 0 10px rgba(64, 224, 208, 0.2)'
            }}>
              {benefit.title}
            </h4>
            <p className="text-sm mb-4 relative z-10" style={{ 
              color: isDark ? '#FFFAF0' : '#143C50',
              opacity: 0.8,
              lineHeight: 1.6
            }}>
              {benefit.description}
            </p>
            {benefit.points.length > 0 && (
              <ul className="space-y-2 relative z-10">
                {benefit.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm" style={{ 
                    color: isDark ? '#FFFAF0' : '#143C50',
                    opacity: 0.7
                  }}>
                    <span style={{ color: '#28B48C', marginTop: '2px' }}>•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>

      {/* Toyota Fleet Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h3 
          className="text-2xl md:text-3xl text-center mb-8" 
          style={{ 
            background: 'linear-gradient(135deg, #FFC850, #40E0D0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 600,
            letterSpacing: '0.02em',
            filter: 'drop-shadow(0 0 15px rgba(64, 224, 208, 0.3))'
          }}
        >
          Наш автопарк Toyota
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ 
              scale: 1.03,
              transition: { duration: 0.3 }
            }}
            className="rounded-2xl overflow-hidden border transition-all duration-300 shadow-lg relative group"
            style={{
              borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
              boxShadow: '0 0 30px rgba(64, 224, 208, 0.3), 0 0 60px rgba(0, 206, 209, 0.15), 0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="relative overflow-hidden">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full"
              >
                <video 
                  src={`${import.meta.env.BASE_URL}VELOZ_cropped.mp4`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-[300px] object-cover"
                />
              </motion.div>
              {/* Dark gradient overlay */}
              <div 
                className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)'
                }}
              />
              {/* Text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="text-white">
                  <div className="text-2xl mb-1" style={{ fontWeight: 700 }}>Toyota Veloz</div>
                  <div className="text-sm opacity-90">Премиальный 7-местный кроссовер</div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ 
              scale: 1.03,
              transition: { duration: 0.3 }
            }}
            className="rounded-2xl overflow-hidden border transition-all duration-300 shadow-lg relative group"
            style={{
              borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
              boxShadow: '0 0 30px rgba(64, 224, 208, 0.3), 0 0 60px rgba(0, 206, 209, 0.15), 0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="relative overflow-hidden">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full"
              >
                <video 
                  src={`${import.meta.env.BASE_URL}ATIV_cropped.mp4`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-[300px] object-cover"
                />
              </motion.div>
              {/* Dark gradient overlay */}
              <div 
                className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)'
                }}
              />
              {/* Text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="text-white">
                  <div className="text-2xl mb-1" style={{ fontWeight: 700 }}>Toyota Yaris</div>
                  <div className="text-sm opacity-90">Компактный седан для города</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}