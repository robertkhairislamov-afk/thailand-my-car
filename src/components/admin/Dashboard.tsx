import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  isDark: boolean;
  data?: any;
  loading?: boolean;
}

export function Dashboard({ isDark, data, loading }: DashboardProps) {
  // Use real data from API or defaults for empty state
  const stats = {
    totalRaised: Number(data?.stats?.total_invested || 0),
    targetAmount: 85000, // 7 investors * ~$12,400
    monthlyRevenue: Number(data?.stats?.monthly_revenue || 0),
    previousMonthRevenue: Number(data?.stats?.previous_month_revenue || 0),
    activeInvestors: Number(data?.stats?.active_investors || 0),
    totalInvestors: 7, // Max investors
    roiPaidOut: Number(data?.stats?.roi_paid || 0),
    pendingApprovals: Number(data?.stats?.pending_count || 0)
  };

  const monthlyChange = stats.previousMonthRevenue > 0
    ? ((stats.monthlyRevenue - stats.previousMonthRevenue) / stats.previousMonthRevenue * 100).toFixed(1)
    : '0';
  const progress = (stats.totalRaised / stats.targetAmount * 100).toFixed(1);

  // Investment trends from API or empty
  const investmentTrends = data?.trends || [];

  // Cumulative revenue from API or empty
  const cumulativeRevenue = data?.revenue || [];

  // Tier distribution from API or empty
  const tierDistribution = data?.tierDistribution || [];

  // Top investors from API or empty
  const topInvestors = data?.topInvestors || [];

  // Recent activity from API or empty
  const recentActivity = data?.recentActivity || [];

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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#009696]" />
      </div>
    );
  }

  // Check if we have any data
  const hasData = stats.totalRaised > 0 || stats.activeInvestors > 0;

  return (
    <div className="space-y-8">
      {/* Welcome message for empty state */}
      {!hasData && (
        <div
          className="rounded-2xl p-8 border text-center"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
          }}
        >
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl mb-2" style={{ color: isDark ? '#FFC850' : '#143C50', fontWeight: 700 }}>
            Добро пожаловать в Thailand My Car!
          </h2>
          <p className="opacity-70 max-w-lg mx-auto" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
            Платформа готова к работе. Статистика появится после первых инвестиций.
            Цель: собрать $85,000 от 7 инвесторов.
          </p>
        </div>
      )}

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
