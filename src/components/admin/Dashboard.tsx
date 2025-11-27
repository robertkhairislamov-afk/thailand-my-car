import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  isDark: boolean;
}

export function Dashboard({ isDark }: DashboardProps) {
  // Mock data - replace with real API data
  const stats = {
    totalRaised: 51000,
    targetAmount: 85000,
    monthlyRevenue: 5200,
    previousMonthRevenue: 4800,
    activeInvestors: 4,
    totalInvestors: 7,
    roiPaidOut: 8400,
    pendingApprovals: 2
  };

  const monthlyChange = ((stats.monthlyRevenue - stats.previousMonthRevenue) / stats.previousMonthRevenue * 100).toFixed(1);
  const progress = (stats.totalRaised / stats.targetAmount * 100).toFixed(1);

  // Investment trends (last 6 months)
  const investmentTrends = [
    { month: 'Jun', amount: 12400 },
    { month: 'Jul', amount: 0 },
    { month: 'Aug', amount: 12400 },
    { month: 'Sep', amount: 13800 },
    { month: 'Oct', amount: 0 },
    { month: 'Nov', amount: 12400 }
  ];

  // Cumulative revenue
  const cumulativeRevenue = [
    { month: 'Jun', revenue: 5000 },
    { month: 'Jul', revenue: 10200 },
    { month: 'Aug', revenue: 15100 },
    { month: 'Sep', revenue: 20500 },
    { month: 'Oct', revenue: 25300 },
    { month: 'Nov', revenue: 30500 }
  ];

  // Tier distribution
  const tierDistribution = [
    { name: '6 месяцев', value: 37200, investors: 3 },
    { name: 'Долгосрочное', value: 13800, investors: 1 }
  ];

  // Top investors
  const topInvestors = [
    { name: '0x742d...3E4f', amount: 13800 },
    { name: '0x8B5A...9C2D', amount: 12400 },
    { name: '0x1F3C...7A8B', amount: 12400 },
    { name: '0x9E2D...4B1C', amount: 12400 }
  ];

  // Recent activity
  const recentActivity = [
    { type: 'investment', text: 'Новая инвестиция от 0x742d...3E4f', amount: '$13,800', time: '2 часа назад', status: 'pending' },
    { type: 'payout', text: 'Выплата инвестору 0x1F3C...7A8B', amount: '$2,480', time: '1 день назад', status: 'completed' },
    { type: 'message', text: 'Новое сообщение от John Doe', amount: null, time: '2 дня назад', status: 'new' },
    { type: 'report', text: 'Опубликован отчет за октябрь', amount: null, time: '5 дней назад', status: 'completed' },
    { type: 'investment', text: 'Инвестиция подтверждена 0x8B5A...9C2D', amount: '$12,400', time: '1 неделю назад', status: 'confirmed' }
  ];

  const COLORS = ['#28B48C', '#009696'];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'investment': return <DollarSign className="w-4 h-4" />;
      case 'payout': return <TrendingUp className="w-4 h-4" />;
      case 'message': return <AlertCircle className="w-4 h-4" />;
      case 'report': return <Calendar className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'investment': return '#28B48C';
      case 'payout': return '#009696';
      case 'message': return '#FFC850';
      case 'report': return '#5DD9D1';
      default: return '#FFFAF0';
    }
  };

  return (
    <div className="space-y-8">
      {/* Alerts */}
      {stats.pendingApprovals > 0 && (
        <div 
          className="rounded-2xl p-4 border flex items-center gap-3"
          style={{
            background: isDark ? 'rgba(255, 200, 80, 0.1)' : 'rgba(255, 200, 80, 0.05)',
            borderColor: isDark ? 'rgba(255, 200, 80, 0.3)' : 'rgba(255, 200, 80, 0.2)'
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#FFC850' }} />
          <div className="flex-1">
            <p style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
              У вас {stats.pendingApprovals} инвестиций ожидают подтверждения
            </p>
          </div>
          <button 
            className="px-4 py-2 rounded-xl transition-all"
            style={{
              background: '#FFC850',
              color: '#143C50'
            }}
          >
            Проверить
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Raised */}
        <div 
          className="rounded-2xl p-6 backdrop-blur-xl border"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(40, 180, 140, 0.2)' }}>
              <DollarSign className="w-6 h-6" style={{ color: '#28B48C' }} />
            </div>
            <div className="text-right">
              <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Прогресс</div>
              <div style={{ color: '#28B48C', fontWeight: 600 }}>{progress}%</div>
            </div>
          </div>
          <h3 className="text-sm opacity-70 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Собрано средств</h3>
          <div className="text-3xl mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
            ${stats.totalRaised.toLocaleString()}
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #28B48C 0%, #009696 100%)'
              }}
            />
          </div>
          <div className="text-sm opacity-70 mt-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
            Цель: ${stats.targetAmount.toLocaleString()}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div 
          className="rounded-2xl p-6 backdrop-blur-xl border"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(0, 150, 150, 0.2)' }}>
              <TrendingUp className="w-6 h-6" style={{ color: '#009696' }} />
            </div>
            <div className="flex items-center gap-1" style={{ color: parseFloat(monthlyChange) >= 0 ? '#28B48C' : '#E74C3C' }}>
              {parseFloat(monthlyChange) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(parseFloat(monthlyChange))}%</span>
            </div>
          </div>
          <h3 className="text-sm opacity-70 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Доход за месяц</h3>
          <div className="text-3xl mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
            ${stats.monthlyRevenue.toLocaleString()}
          </div>
          <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
            Прошлый месяц: ${stats.previousMonthRevenue.toLocaleString()}
          </div>
        </div>

        {/* Active Investors */}
        <div 
          className="rounded-2xl p-6 backdrop-blur-xl border"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(93, 217, 209, 0.2)' }}>
              <Users className="w-6 h-6" style={{ color: '#5DD9D1' }} />
            </div>
            <div className="text-right">
              <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Лимит</div>
              <div style={{ color: '#5DD9D1', fontWeight: 600 }}>{stats.totalInvestors} макс</div>
            </div>
          </div>
          <h3 className="text-sm opacity-70 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Активные инвесторы</h3>
          <div className="text-3xl mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
            {stats.activeInvestors}
          </div>
          <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
            {stats.totalInvestors - stats.activeInvestors} слотов доступно
          </div>
        </div>

        {/* ROI Paid Out */}
        <div 
          className="rounded-2xl p-6 backdrop-blur-xl border"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255, 200, 80, 0.2)' }}>
              <CheckCircle className="w-6 h-6" style={{ color: '#FFC850' }} />
            </div>
            {stats.pendingApprovals > 0 && (
              <div className="px-3 py-1 rounded-full text-sm" style={{ background: 'rgba(255,200,80,0.2)', color: '#FFC850' }}>
                {stats.pendingApprovals} pending
              </div>
            )}
          </div>
          <h3 className="text-sm opacity-70 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Выплачено ROI</h3>
          <div className="text-3xl mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
            ${stats.roiPaidOut.toLocaleString()}
          </div>
          <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
            Все время
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment Trends */}
        <div 
          className="rounded-2xl p-6 backdrop-blur-xl border"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
          }}
        >
          <h3 className="text-xl mb-6" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
            Динамика инвестиций
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={investmentTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis dataKey="month" stroke={isDark ? '#FFFAF0' : '#143C50'} />
              <YAxis stroke={isDark ? '#FFFAF0' : '#143C50'} />
              <Tooltip 
                contentStyle={{
                  background: isDark ? '#143C50' : '#FFFFFF',
                  border: `1px solid ${isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'}`,
                  borderRadius: '12px',
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              />
              <Line type="monotone" dataKey="amount" stroke="#28B48C" strokeWidth={3} dot={{ fill: '#28B48C', r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative Revenue */}
        <div 
          className="rounded-2xl p-6 backdrop-blur-xl border"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
          }}
        >
          <h3 className="text-xl mb-6" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
            Накопленный доход
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cumulativeRevenue}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#009696" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#009696" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis dataKey="month" stroke={isDark ? '#FFFAF0' : '#143C50'} />
              <YAxis stroke={isDark ? '#FFFAF0' : '#143C50'} />
              <Tooltip 
                contentStyle={{
                  background: isDark ? '#143C50' : '#FFFFFF',
                  border: `1px solid ${isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'}`,
                  borderRadius: '12px',
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#009696" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Distribution */}
        <div 
          className="rounded-2xl p-6 backdrop-blur-xl border"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
          }}
        >
          <h3 className="text-xl mb-6" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
            По тирам
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={tierDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {tierDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  background: isDark ? '#143C50' : '#FFFFFF',
                  border: `1px solid ${isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'}`,
                  borderRadius: '12px',
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {tierDistribution.map((tier, index) => (
              <div key={tier.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS[index] }} />
                  <span className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{tier.name}</span>
                </div>
                <span className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                  ${tier.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Investors */}
        <div 
          className="rounded-2xl p-6 backdrop-blur-xl border"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
          }}
        >
          <h3 className="text-xl mb-6" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
            Топ инвесторы
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topInvestors} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis type="number" stroke={isDark ? '#FFFAF0' : '#143C50'} />
              <YAxis dataKey="name" type="category" stroke={isDark ? '#FFFAF0' : '#143C50'} width={100} />
              <Tooltip 
                contentStyle={{
                  background: isDark ? '#143C50' : '#FFFFFF',
                  border: `1px solid ${isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'}`,
                  borderRadius: '12px',
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              />
              <Bar dataKey="amount" fill="#28B48C" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div 
          className="rounded-2xl p-6 backdrop-blur-xl border"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
              Активность
            </h3>
            <Clock className="w-5 h-5 opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
          </div>
          <div className="space-y-4 max-h-[280px] overflow-y-auto">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-3">
                <div className="p-2 rounded-lg flex-shrink-0 h-fit" style={{ background: `${getActivityColor(activity.type)}20` }}>
                  <div style={{ color: getActivityColor(activity.type) }}>
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    {activity.text}
                  </p>
                  <div className="flex items-center gap-2 text-xs opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    <span>{activity.time}</span>
                    {activity.amount && (
                      <>
                        <span>•</span>
                        <span style={{ color: '#28B48C', fontWeight: 600 }}>{activity.amount}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
