import { Car, TrendingUp, Percent, ArrowUpRight } from 'lucide-react';
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import tmcLogo from '../../assets/TMC.webp';
import { api } from '../../services/api';

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
  // Fundraising data from API
  const [fundraising, setFundraising] = useState<FundraisingData | null>(null);

  useEffect(() => {
    api.getFundraising().then(res => {
      if (res.data) setFundraising(res.data);
    });
  }, []);

  // Use API data with fallbacks
  const targetUSD = fundraising?.target.usd || 580000;
  const currentUSD = fundraising?.current.usd || 510400;
  const progress = fundraising?.progress || (currentUSD / targetUSD) * 100;
  const availableCars = fundraising?.cars?.available || 8;

  // Scroll-based animation for video playback
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState(0);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"]
  });

  // Physics-based smoothing for video scrubbing (Apple-style smoothness)
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 15,
    stiffness: 50,
    mass: 0.2
  });

  // Sync video time with smooth scroll progress
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (videoRef.current && videoDuration > 0) {
      const targetTime = Math.min(Math.max(latest * videoDuration, 0), videoDuration);
      videoRef.current.currentTime = targetTime;
    }
  });

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  return (
    <div ref={heroRef} className="relative overflow-hidden min-h-[150vh] rounded-3xl mx-4 mt-4">
      {/* Sticky Container for the Video Background */}
      <div className="sticky top-4 h-[90vh] rounded-3xl overflow-hidden">
        {/* Background Video (All-Intra MP4 optimized for scroll scrubbing) */}
        <video
          ref={videoRef}
          src={`${import.meta.env.BASE_URL}Toyota_veloz_driving_final.mp4`}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          style={{ transform: 'translate3d(0, 0, 0)' }}
        />
        
        {/* Final Professional Gradient Overlay - Soft Midnight Blue shadows */}
        <div className="absolute inset-0 pointer-events-none z-[1]" style={{
          background: `linear-gradient(90deg, 
            rgba(2, 10, 15, 0.7) 0%, 
            rgba(2, 10, 15, 0.4) 35%, 
            rgba(2, 10, 15, 0) 100%),
            linear-gradient(to top, 
            rgba(2, 10, 15, 0.4) 0%, 
            rgba(2, 10, 15, 0) 50%)`
        }} />

        <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-20 h-full flex items-center z-10">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full">
            
            {/* Left Column - Hero Content */}
            <div className="space-y-8 relative z-20">
              {/* Main Glassmorphism Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="rounded-3xl p-8 md:p-12 backdrop-blur-xl border shadow-2xl"
                style={{
                  background: 'rgba(35, 60, 65, 0.5)',
                  borderColor: 'rgba(0, 150, 150, 0.4)',
                  boxShadow: '0 0 30px rgba(64, 224, 208, 0.3), 0 0 60px rgba(0, 206, 209, 0.15), 0 25px 50px rgba(0, 0, 0, 0.3)'
                }}
              >
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl md:text-5xl lg:text-6xl mb-6"
                  style={{ 
                    color: '#FFFFFF',
                    fontWeight: 700,
                    lineHeight: 1.2
                  }}
                >
                  Инвестируйте<br />
                  в рентал-бизнес
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-base md:text-lg mb-8"
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.85)'
                  }}
                >
                  {availableCars} автомобилей Toyota • От $1,000 • 1.7%/мес<br />
                  или авто в собственность
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  onClick={onInvestClick}
                  className="px-8 py-4 rounded-2xl text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: '#40E0D0',
                    color: '#FFFFFF',
                    fontWeight: 600
                  }}
                >
                  Инвестировать сейчас
                </motion.button>
              </motion.div>

              {/* Progress Bar Card */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="rounded-2xl p-6 backdrop-blur-xl border"
                style={{
                  background: 'rgba(35, 60, 65, 0.5)',
                  borderColor: 'rgba(0, 150, 150, 0.4)',
                  boxShadow: '0 0 30px rgba(64, 224, 208, 0.3), 0 0 60px rgba(0, 206, 209, 0.15), 0 25px 50px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-2xl md:text-3xl mb-1" style={{ color: '#FFFFFF', fontWeight: 700 }}>
                      ${currentUSD.toLocaleString()}
                    </div>
                    <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                      Собрано из ${targetUSD.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-3xl" style={{ color: '#FFFFFF', fontWeight: 700 }}>
                    {progress.toFixed(0)}%
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 rounded-full overflow-hidden" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)'
                }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #40E0D0 0%, #00CED1 100%)'
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* 🎨 FLOATING STAT CARDS - Positioned around Toyota */}
          <div className="hidden lg:block pointer-events-none">
            {/* Card 1: 8 Cars - LEFT CENTER */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -10, 0] // Float up and down
              }}
              transition={{ 
                duration: 0.6, // Entrance duration
                delay: 0.5,
                y: {
                  duration: 4, // Float cycle duration
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
              }}
              className="absolute rounded-2xl backdrop-blur-xl border shadow-2xl"
              style={{
                left: '795px',
                top: '320px',
                width: '120px',
                height: '120px',
                background: 'rgba(35, 60, 65, 0.5)',
                borderColor: 'rgba(0, 150, 150, 0.4)',
                boxShadow: '0 0 30px rgba(64, 224, 208, 0.3), 0 0 60px rgba(0, 206, 209, 0.15), 0 20px 40px rgba(0, 0, 0, 0.3)',
                zIndex: 20
              }}
            >
                          <div className="h-full flex flex-col items-center justify-center gap-2 p-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                              background: 'rgba(0, 150, 150, 0.2)',
                              border: '1px solid rgba(0, 150, 150, 0.3)'
                            }}>
                              <img src={tmcLogo} alt="TMC" className="w-8 h-auto object-contain" />
                            </div>
                            <div className="text-center">                  <div className="text-2xl mb-0.5" style={{ color: '#FFFFFF', fontWeight: 700 }}>
                    {availableCars}
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                    Cars
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: 1.7%/мес - TOP RIGHT */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -15, 0] // Slightly larger range
              }}
              transition={{ 
                duration: 0.6,
                delay: 0.6,
                y: {
                  duration: 5, // Slower
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 0
                }
              }}
              className="absolute rounded-2xl backdrop-blur-xl border shadow-2xl"
              style={{
                left: '1100px',
                top: '250px',
                width: '160px',
                height: '120px',
                background: 'rgba(35, 60, 65, 0.5)',
                borderColor: 'rgba(0, 150, 150, 0.4)',
                boxShadow: '0 0 30px rgba(64, 224, 208, 0.3), 0 0 60px rgba(0, 206, 209, 0.15), 0 20px 40px rgba(0, 0, 0, 0.3)',
                zIndex: 20
              }}
            >
              <div className="h-full flex flex-col items-center justify-center gap-2 p-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                  background: 'rgba(0, 150, 150, 0.2)'
                }}>
                  <Percent className="w-6 h-6" style={{ color: '#28B48C' }} />
                </div>
                <div className="text-center">
                  <div className="text-lg mb-0.5 leading-tight" style={{ color: '#FFFFFF', fontWeight: 700 }}>
                    1.7%/мес.
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                    доход
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Прогноз +20% - BOTTOM RIGHT */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -8, 0] // Smaller range
              }}
              transition={{ 
                duration: 0.6,
                delay: 0.7,
                y: {
                  duration: 3.5, // Faster
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 1
                }
              }}
              className="absolute rounded-2xl backdrop-blur-xl border shadow-2xl"
              style={{
                left: '1000px',
                top: '540px',
                width: '160px',
                height: '120px',
                background: 'rgba(35, 60, 65, 0.5)',
                borderColor: 'rgba(0, 150, 150, 0.4)',
                boxShadow: '0 0 30px rgba(64, 224, 208, 0.3), 0 0 60px rgba(0, 206, 209, 0.15), 0 20px 40px rgba(0, 0, 0, 0.3)',
                zIndex: 20
              }}
            >
              <div className="h-full flex flex-col items-center justify-center gap-2 p-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                  background: 'rgba(0, 150, 150, 0.2)'
                }}>
                  <ArrowUpRight className="w-6 h-6" style={{ color: '#28B48C' }} />
                </div>
                <div className="text-center">
                  <div className="text-xs mb-0.5" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                    Прогноз
                  </div>
                  <div className="text-xl" style={{ color: '#FFFFFF', fontWeight: 700 }}>
                    +20%
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}