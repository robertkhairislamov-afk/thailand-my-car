import { Car, TrendingUp, ArrowUpRight } from 'lucide-react';

export function HeroExport() {
  const currentUSD = 510400;
  const targetUSD = 580000;
  const progress = (currentUSD / targetUSD) * 100; // 88%

  return (
    <div className="relative w-full min-h-screen" style={{
      background: 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px',
      backgroundColor: '#fff'
    }}>
      <div className="w-full max-w-[1920px] mx-auto px-8 py-8">
        
        {/* Glassmorphism Navigation Header */}
        <header className="rounded-3xl mb-12 backdrop-blur-xl border shadow-2xl" style={{
          background: 'rgba(20, 60, 80, 0.85)',
          borderColor: 'rgba(0, 217, 255, 0.3)'
        }}>
          <div className="px-8 py-6 flex items-center justify-between">
            {/* Logo Left */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #00d9ff 0%, #009696 100%)'
              }}>
                <Car className="w-7 h-7" style={{ color: '#FFFAF0' }} />
              </div>
              <div>
                <div className="text-xl" style={{ color: '#FFFAF0', fontWeight: 700 }}>
                  Моя Машина
                </div>
                <div className="text-xs" style={{ color: 'rgba(255, 250, 240, 0.7)' }}>
                  в Таиланде
                </div>
              </div>
            </div>

            {/* Menu Center */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#" className="text-base hover:opacity-80 transition-opacity" style={{ color: '#FFFAF0', fontWeight: 500 }}>
                О проекте
              </a>
              <a href="#" className="text-base hover:opacity-80 transition-opacity" style={{ color: '#FFFAF0', fontWeight: 500 }}>
                Инвестиции
              </a>
              <a href="#" className="text-base hover:opacity-80 transition-opacity" style={{ color: '#FFFAF0', fontWeight: 500 }}>
                Roadmap
              </a>
              <a href="#" className="text-base hover:opacity-80 transition-opacity" style={{ color: '#FFFAF0', fontWeight: 500 }}>
                Dashboard
              </a>
            </nav>

            {/* Buttons Right */}
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 rounded-xl border transition-all hover:scale-105" style={{
                borderColor: 'rgba(0, 217, 255, 0.5)',
                color: '#00d9ff',
                fontWeight: 600
              }}>
                Войти
              </button>
              <button className="px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg" style={{
                background: 'linear-gradient(135deg, #00d9ff 0%, #009696 100%)',
                color: '#FFFAF0',
                fontWeight: 600
              }}>
                Connect Wallet
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column - Large Investment Card */}
          <div className="space-y-6">
            <div className="rounded-3xl p-12 backdrop-blur-xl border shadow-2xl" style={{
              background: 'rgba(20, 60, 80, 0.85)',
              borderColor: 'rgba(0, 217, 255, 0.3)'
            }}>
              <div className="inline-block px-4 py-2 rounded-full mb-6" style={{
                background: 'rgba(0, 217, 255, 0.15)',
                border: '1px solid rgba(0, 217, 255, 0.3)'
              }}>
                <span className="text-sm" style={{ color: '#00d9ff', fontWeight: 600 }}>
                  🚗 Premium Rental Business
                </span>
              </div>

              <h1 className="text-6xl mb-6" style={{ 
                color: '#FFFAF0',
                fontWeight: 700,
                lineHeight: 1.2
              }}>
                Инвестируйте<br />
                в рентал-бизнес
              </h1>

              <p className="text-xl mb-8" style={{ 
                color: 'rgba(255, 250, 240, 0.85)',
                lineHeight: 1.6
              }}>
                Автомобили Toyota в Паттайе<br />
                От $1,000 • 1.7%/мес или авто в собственность
              </p>

              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#00d9ff' }} />
                  <span className="text-base" style={{ color: 'rgba(255, 250, 240, 0.9)' }}>
                    Стабильный доход от аренды
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#00d9ff' }} />
                  <span className="text-base" style={{ color: 'rgba(255, 250, 240, 0.9)' }}>
                    Прозрачность через блокчейн
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#00d9ff' }} />
                  <span className="text-base" style={{ color: 'rgba(255, 250, 240, 0.9)' }}>
                    Реальный бизнес в Таиланде
                  </span>
                </div>
              </div>

              <button className="w-full px-8 py-5 rounded-2xl text-xl shadow-2xl transition-all hover:scale-105" style={{
                background: 'linear-gradient(135deg, #00d9ff 0%, #009696 100%)',
                color: '#FFFAF0',
                fontWeight: 700
              }}>
                Инвестировать сейчас
              </button>
            </div>
          </div>

          {/* Right Column - Three Floating Stat Cards */}
          <div className="flex flex-col gap-6">
            {/* Card 1: 8 Cars */}
            <div className="rounded-2xl p-8 backdrop-blur-xl border shadow-xl transition-all hover:scale-105" style={{
              background: 'rgba(20, 60, 80, 0.85)',
              borderColor: 'rgba(0, 217, 255, 0.3)'
            }}>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                  background: 'rgba(0, 217, 255, 0.15)',
                  border: '1px solid rgba(0, 217, 255, 0.3)'
                }}>
                  <Car className="w-8 h-8" style={{ color: '#00d9ff' }} />
                </div>
                <div>
                  <div className="text-5xl mb-2" style={{ color: '#FFFAF0', fontWeight: 700 }}>
                    8
                  </div>
                  <div className="text-lg" style={{ color: 'rgba(255, 250, 240, 0.8)' }}>
                    Cars
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: 1.7%/мес Доход */}
            <div className="rounded-2xl p-8 backdrop-blur-xl border shadow-xl transition-all hover:scale-105" style={{
              background: 'rgba(20, 60, 80, 0.85)',
              borderColor: 'rgba(0, 217, 255, 0.3)'
            }}>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                  background: 'rgba(0, 217, 255, 0.15)',
                  border: '1px solid rgba(0, 217, 255, 0.3)'
                }}>
                  <TrendingUp className="w-8 h-8" style={{ color: '#00d9ff' }} />
                </div>
                <div>
                  <div className="text-4xl mb-2" style={{ color: '#FFFAF0', fontWeight: 700 }}>
                    1.7%/мес
                  </div>
                  <div className="text-lg" style={{ color: 'rgba(255, 250, 240, 0.8)' }}>
                    Доход
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Прогноз +20% */}
            <div className="rounded-2xl p-8 backdrop-blur-xl border shadow-xl transition-all hover:scale-105" style={{
              background: 'rgba(20, 60, 80, 0.85)',
              borderColor: 'rgba(0, 217, 255, 0.3)'
            }}>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                  background: 'rgba(0, 217, 255, 0.15)',
                  border: '1px solid rgba(0, 217, 255, 0.3)'
                }}>
                  <ArrowUpRight className="w-8 h-8" style={{ color: '#00d9ff' }} />
                </div>
                <div>
                  <div className="text-lg mb-1" style={{ color: 'rgba(255, 250, 240, 0.8)' }}>
                    Прогноз
                  </div>
                  <div className="text-4xl" style={{ color: '#00d9ff', fontWeight: 700 }}>
                    +20%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar at Bottom */}
        <div className="mt-12 rounded-3xl p-10 backdrop-blur-xl border shadow-2xl" style={{
          background: 'rgba(20, 60, 80, 0.85)',
          borderColor: 'rgba(0, 217, 255, 0.3)'
        }}>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-sm mb-2" style={{ color: 'rgba(255, 250, 240, 0.7)' }}>
                TOTAL RAISED
              </div>
              <div className="text-5xl mb-1" style={{ color: '#FFFAF0', fontWeight: 700 }}>
                ${currentUSD.toLocaleString()}
              </div>
              <div className="text-xl" style={{ color: 'rgba(255, 250, 240, 0.7)' }}>
                из ${targetUSD.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-7xl" style={{ color: '#00d9ff', fontWeight: 700 }}>
                {progress.toFixed(0)}%
              </div>
              <div className="text-lg" style={{ color: 'rgba(255, 250, 240, 0.7)' }}>
                Completed
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-6 rounded-full overflow-hidden" style={{
            backgroundColor: 'rgba(255, 250, 240, 0.1)',
            border: '1px solid rgba(0, 217, 255, 0.2)'
          }}>
            <div 
              className="h-full rounded-full relative overflow-hidden"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #00d9ff 0%, #009696 50%, #28B48C 100%)',
                boxShadow: '0 0 20px rgba(0, 217, 255, 0.5)'
              }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 opacity-30" style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
              }} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm" style={{ color: 'rgba(255, 250, 240, 0.6)' }}>
              Start: $0
            </div>
            <div className="text-sm" style={{ color: 'rgba(255, 250, 240, 0.6)' }}>
              Goal: ${targetUSD.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Footer Badge */}
        <div className="mt-8 text-center">
          <div className="inline-block px-6 py-3 rounded-full backdrop-blur-xl" style={{
            background: 'rgba(20, 60, 80, 0.85)',
            border: '1px solid rgba(0, 217, 255, 0.3)'
          }}>
            <span className="text-sm" style={{ color: 'rgba(255, 250, 240, 0.8)', fontWeight: 500 }}>
              🔒 Secured by Web3 • Transparent • Real Business
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
