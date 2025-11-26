import { useState } from 'react';

interface YieldChartProps {
  view: 'calm' | 'warning' | 'success';
  boostActive: boolean;
  isDark: boolean;
  timeframe: 'weekly' | 'monthly' | 'yearly';
}

export function YieldChart({ view, boostActive, isDark, timeframe }: YieldChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; value: number } | null>(null);

  // Generate data based on timeframe
  const getChartData = () => {
    switch (timeframe) {
      case 'weekly':
        // 7 days, 30 points for smooth curve
        const weeklyPoints = 30;
        return {
          points: weeklyPoints,
          data: Array.from({ length: weeklyPoints }, (_, i) => {
            const base = 12.5 + Math.sin(i / 5) * 2.5 + Math.cos(i / 7) * 1.2;
            const boost = boostActive ? 6.2 : 0;
            return base + boost;
          }),
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        };
      
      case 'monthly':
        // 30 days, 40 points for smooth curve
        const monthlyPoints = 40;
        return {
          points: monthlyPoints,
          data: Array.from({ length: monthlyPoints }, (_, i) => {
            const base = 12.5 + Math.sin(i / 8) * 3 + Math.cos(i / 6) * 2 + Math.sin(i / 12) * 1.5;
            const boost = boostActive ? 6.2 : 0;
            return base + boost;
          }),
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        };
      
      case 'yearly':
        // 12 months, 50 points for smooth curve
        const yearlyPoints = 50;
        return {
          points: yearlyPoints,
          data: Array.from({ length: yearlyPoints }, (_, i) => {
            const base = 12.5 + Math.sin(i / 10) * 4 + Math.cos(i / 7) * 2.5 + Math.sin(i / 15) * 2;
            const boost = boostActive ? 6.2 : 0;
            return base + boost;
          }),
          labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov']
        };
    }
  };

  const { points, data, labels } = getChartData();

  const max = Math.max(...data) + 1;
  const min = Math.min(...data) - 1;
  const range = max - min;

  // SVG dimensions
  const width = 100;
  const height = 30;
  
  // Create smooth curve using cubic bezier for professional look
  const createSmoothPath = () => {
    const points_data = data.map((value, i) => ({
      x: (i / (points - 1)) * width,
      y: height - ((value - min) / range) * height
    }));

    if (points_data.length < 2) return '';

    let path = `M ${points_data[0].x} ${points_data[0].y}`;

    for (let i = 0; i < points_data.length - 1; i++) {
      const current = points_data[i];
      const next = points_data[i + 1];
      
      // Calculate control points for smooth cubic bezier
      const cp1x = current.x + (next.x - current.x) / 3;
      const cp1y = current.y;
      const cp2x = current.x + 2 * (next.x - current.x) / 3;
      const cp2y = next.y;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    return path;
  };

  const smoothPath = createSmoothPath();
  const fillPath = `${smoothPath} L ${width} ${height} L 0 ${height} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    
    // Find closest point
    let closestIndex = 0;
    let minDistance = Infinity;
    
    data.forEach((value, i) => {
      const x = (i / (points - 1)) * width;
      const distance = Math.abs(x - mouseX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    });

    const x = (closestIndex / (points - 1)) * width;
    const y = height - ((data[closestIndex] - min) / range) * height;
    
    setHoveredPoint(closestIndex);
    setTooltipData({ 
      x: (x / width) * 100, 
      y: (y / height) * 100, 
      value: data[closestIndex] 
    });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setTooltipData(null);
  };

  return (
    <div className="relative h-32 rounded-3xl overflow-hidden">
      {/* Gradient dots background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)'} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          opacity: isDark ? 0.2 : 0.3
        }} />
      </div>

      {/* Chart SVG */}
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full relative z-10 cursor-crosshair"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Main gradient */}
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop 
              offset="0%" 
              className={`transition-all duration-700 ${
                view === 'success' 
                  ? 'text-yellow-400' 
                  : isDark ? 'text-cyan-400' : 'text-cyan-200'
              }`}
              stopColor="currentColor" 
              stopOpacity={isDark ? "0.4" : "0.6"} 
            />
            <stop 
              offset="50%" 
              className={`transition-all duration-700 ${
                view === 'success' 
                  ? 'text-orange-400' 
                  : isDark ? 'text-purple-400' : 'text-purple-200'
              }`}
              stopColor="currentColor" 
              stopOpacity={isDark ? "0.2" : "0.3"} 
            />
            <stop 
              offset="100%" 
              stopColor="transparent" 
              stopOpacity="0" 
            />
          </linearGradient>

          {/* Glow gradient */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop 
              offset="0%" 
              className={`transition-all duration-700 ${
                view === 'success' 
                  ? 'text-yellow-400' 
                  : isDark ? 'text-cyan-400' : 'text-cyan-300'
              }`}
              stopColor="currentColor" 
            />
            <stop 
              offset="50%" 
              className={`transition-all duration-700 ${
                view === 'success' 
                  ? 'text-orange-400' 
                  : isDark ? 'text-purple-400' : 'text-purple-300'
              }`}
              stopColor="currentColor" 
            />
            <stop 
              offset="100%" 
              className={`transition-all duration-700 ${
                view === 'success' 
                  ? 'text-pink-400' 
                  : isDark ? 'text-pink-400' : 'text-pink-300'
              }`}
              stopColor="currentColor" 
            />
          </linearGradient>
        </defs>

        {/* Fill area */}
        <path
          d={fillPath}
          fill="url(#waveGradient)"
          className="transition-all duration-700"
        />

        {/* Glow effect */}
        <path
          d={smoothPath}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isDark ? "0.3" : "0.2"}
          filter="blur(8px)"
        />

        {/* Main line */}
        <path
          d={smoothPath}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-700"
        />

        {/* Interactive points */}
        {data.map((value, i) => {
          const x = (i / (points - 1)) * width;
          const y = height - ((value - min) / range) * height;
          const isHovered = hoveredPoint === i;
          
          return (
            <g key={i}>
              {/* Larger invisible hit area */}
              <circle
                cx={x}
                cy={y}
                r="2"
                fill="transparent"
                className="cursor-pointer"
              />
              
              {/* Visible point */}
              {(i % 5 === 0 || isHovered) && (
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? "1" : "0.5"}
                  className={`transition-all duration-200 ${
                    view === 'success' 
                      ? 'fill-yellow-400' 
                      : isDark ? 'fill-cyan-400' : 'fill-white'
                  }`}
                  opacity={isHovered ? "1" : isDark ? "0.6" : "0.8"}
                />
              )}
              
              {/* Hover glow */}
              {isHovered && (
                <circle
                  cx={x}
                  cy={y}
                  r="1.5"
                  className={`${
                    view === 'success' 
                      ? 'fill-yellow-400' 
                      : isDark ? 'fill-cyan-400' : 'fill-cyan-500'
                  }`}
                  opacity="0.3"
                  filter="blur(2px)"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltipData && (
        <div 
          className={`absolute z-20 px-3 py-2 rounded-xl backdrop-blur-xl border shadow-lg pointer-events-none transition-all duration-200 ${
            isDark 
              ? 'bg-white/10 border-white/20 text-white' 
              : 'bg-white/80 border-white/60 text-gray-800'
          }`}
          style={{
            left: `${tooltipData.x}%`,
            top: `${tooltipData.y - 20}%`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="text-xs whitespace-nowrap">
            <span className={view === 'success' ? 'text-yellow-400' : isDark ? 'text-cyan-400' : 'text-cyan-600'}>
              {tooltipData.value.toFixed(2)}%
            </span>
            <span className="mx-1">•</span>
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>APY</span>
          </div>
        </div>
      )}

      {/* Time labels at bottom */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4">
        {labels.map((label, i) => (
          <span 
            key={i} 
            className={`text-[10px] transition-colors duration-500 ${
              isDark ? 'text-gray-500' : 'text-gray-600'
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}