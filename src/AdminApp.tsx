import { useState } from 'react';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './components/admin/Dashboard';
import { InvestmentDetail } from './components/admin/InvestmentDetail';

export default function AdminApp() {
  const [isDark, setIsDark] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedInvestment, setSelectedInvestment] = useState<number | null>(null);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedInvestment(null);
  };

  const renderPage = () => {
    // Investment Detail View
    if (selectedInvestment) {
      return (
        <InvestmentDetail 
          isDark={isDark} 
          onBack={() => setSelectedInvestment(null)}
        />
      );
    }

    // Main Pages
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard isDark={isDark} />;
      
      case 'investments':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
                Инвестиции
              </h1>
              <div className="flex gap-3">
                <select 
                  className="px-4 py-2 rounded-xl"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    color: isDark ? '#FFFAF0' : '#143C50'
                  }}
                >
                  <option>Все статусы</option>
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>

            {/* Investments Table */}
            <div 
              className="rounded-2xl overflow-hidden border"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                      <th className="px-6 py-4 text-left text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>ID</th>
                      <th className="px-6 py-4 text-left text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Инвестор</th>
                      <th className="px-6 py-4 text-left text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Сумма</th>
                      <th className="px-6 py-4 text-left text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Тир</th>
                      <th className="px-6 py-4 text-left text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Статус</th>
                      <th className="px-6 py-4 text-left text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Дата</th>
                      <th className="px-6 py-4 text-left text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 42, wallet: '0x742d...3E4f', amount: 13800, tier: 'Долгосрочное', status: 'pending', date: '2024-11-24' },
                      { id: 41, wallet: '0x8B5A...9C2D', amount: 12400, tier: '6 месяцев', status: 'confirmed', date: '2024-11-20' },
                      { id: 40, wallet: '0x1F3C...7A8B', amount: 12400, tier: '6 месяцев', status: 'confirmed', date: '2024-11-15' },
                      { id: 39, wallet: '0x9E2D...4B1C', amount: 12400, tier: '6 месяцев', status: 'completed', date: '2024-11-10' }
                    ].map((inv) => (
                      <tr 
                        key={inv.id}
                        className="transition-all hover:bg-opacity-50 cursor-pointer"
                        style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}
                        onClick={() => setSelectedInvestment(inv.id)}
                      >
                        <td className="px-6 py-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>#{inv.id}</td>
                        <td className="px-6 py-4">
                          <code className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{inv.wallet}</code>
                        </td>
                        <td className="px-6 py-4" style={{ color: '#28B48C', fontWeight: 600 }}>${inv.amount.toLocaleString()}</td>
                        <td className="px-6 py-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{inv.tier}</td>
                        <td className="px-6 py-4">
                          <span 
                            className="px-3 py-1 rounded-full text-sm"
                            style={{
                              background: inv.status === 'pending' ? 'rgba(255,200,80,0.2)' :
                                         inv.status === 'confirmed' ? 'rgba(40,180,140,0.2)' :
                                         'rgba(0,150,150,0.2)',
                              color: inv.status === 'pending' ? '#FFC850' :
                                    inv.status === 'confirmed' ? '#28B48C' :
                                    '#009696'
                            }}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          {new Date(inv.date).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInvestment(inv.id);
                            }}
                            className="px-3 py-1 rounded-lg text-sm transition-all hover:scale-105"
                            style={{
                              background: isDark ? 'rgba(0,150,150,0.2)' : 'rgba(0,150,150,0.1)',
                              color: '#009696'
                            }}
                          >
                            Детали
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case 'users':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
              Пользователи
            </h1>
            
            <div 
              className="rounded-2xl overflow-hidden border"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                      <th className="px-6 py-4 text-left text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Кошелёк</th>
                      <th className="px-6 py-4 text-left text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Email</th>
                      <th className="px-6 py-4 text-left text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Всего инвестировано</th>
                      <th className="px-6 py-4 text-left text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Инвестиций</th>
                      <th className="px-6 py-4 text-left text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Дата регистрации</th>
                      <th className="px-6 py-4 text-left text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { wallet: '0x742d...3E4f', email: 'investor1@example.com', total: 13800, count: 1, date: '2024-11-24' },
                      { wallet: '0x8B5A...9C2D', email: 'investor2@example.com', total: 12400, count: 1, date: '2024-11-20' },
                      { wallet: '0x1F3C...7A8B', email: 'investor3@example.com', total: 12400, count: 1, date: '2024-11-15' },
                      { wallet: '0x9E2D...4B1C', email: 'investor4@example.com', total: 12400, count: 1, date: '2024-11-10' }
                    ].map((user, index) => (
                      <tr 
                        key={index}
                        className="transition-all hover:bg-opacity-50"
                        style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}
                      >
                        <td className="px-6 py-4">
                          <code className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{user.wallet}</code>
                        </td>
                        <td className="px-6 py-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{user.email}</td>
                        <td className="px-6 py-4" style={{ color: '#28B48C', fontWeight: 600 }}>${user.total.toLocaleString()}</td>
                        <td className="px-6 py-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{user.count}</td>
                        <td className="px-6 py-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          {new Date(user.date).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="px-3 py-1 rounded-lg text-sm transition-all hover:scale-105"
                            style={{
                              background: isDark ? 'rgba(0,150,150,0.2)' : 'rgba(0,150,150,0.1)',
                              color: '#009696'
                            }}
                          >
                            Профиль
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
              Сообщения
            </h1>
            
            <div className="grid gap-4">
              {[
                { name: 'John Doe', email: 'john@example.com', subject: 'Вопрос об инвестициях', date: '2 дня назад', status: 'new' },
                { name: 'Jane Smith', email: 'jane@example.com', subject: 'Как получить ROI?', date: '3 дня назад', status: 'read' },
                { name: 'Bob Johnson', email: 'bob@example.com', subject: 'Партнёрство', date: '5 дней назад', status: 'replied' }
              ].map((msg, index) => (
                <div 
                  key={index}
                  className="rounded-2xl p-6 backdrop-blur-xl border transition-all hover:scale-[1.01] cursor-pointer"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                          {msg.name}
                        </h3>
                        <span 
                          className="px-2 py-1 rounded-full text-xs"
                          style={{
                            background: msg.status === 'new' ? 'rgba(255,200,80,0.2)' :
                                       msg.status === 'read' ? 'rgba(93,217,209,0.2)' :
                                       'rgba(40,180,140,0.2)',
                            color: msg.status === 'new' ? '#FFC850' :
                                  msg.status === 'read' ? '#5DD9D1' :
                                  '#28B48C'
                          }}
                        >
                          {msg.status === 'new' ? 'Новое' : msg.status === 'read' ? 'Прочитано' : 'Отвечено'}
                        </span>
                      </div>
                      <p className="text-sm opacity-70 mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                        {msg.email}
                      </p>
                      <p style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                        {msg.subject}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                        {msg.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'reports':
      case 'logs':
      case 'settings':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-2xl mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                {currentPage === 'reports' ? 'Финансовые отчёты' : 
                 currentPage === 'logs' ? 'Логи активности' : 'Настройки'}
              </h2>
              <p className="opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                Раздел в разработке
              </p>
            </div>
          </div>
        );

      default:
        return <Dashboard isDark={isDark} />;
    }
  };

  return (
    <AdminLayout
      isDark={isDark}
      onToggleTheme={toggleTheme}
      currentPage={currentPage}
      onNavigate={handleNavigate}
    >
      {renderPage()}
    </AdminLayout>
  );
}
