import { useState, useEffect } from 'react';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './components/admin/Dashboard';
import { InvestmentDetail } from './components/admin/InvestmentDetail';
import { AdminLogin } from './components/admin/AdminLogin';
import { api } from './services/api';
import { Loader2 } from 'lucide-react';

export default function AdminApp() {
  const [isDark, setIsDark] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);

  // Auth state
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Data state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const adminData = localStorage.getItem('admin_data');

    if (token && adminData) {
      api.verifyToken().then((response) => {
        if (response.data?.valid) {
          setAdmin(JSON.parse(adminData));
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('admin_data');
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  // Load data when page changes
  useEffect(() => {
    if (!admin) return;

    const loadData = async () => {
      setDataLoading(true);
      try {
        if (currentPage === 'dashboard') {
          const res = await api.getAdminDashboard();
          if (res.data) setDashboardData(res.data);
        } else if (currentPage === 'investments') {
          const res = await api.getAdminInvestments();
          if (res.data) setInvestments(res.data.investments || []);
        } else if (currentPage === 'users') {
          const res = await api.getAdminUsers();
          if (res.data) setUsers(res.data.users || []);
        } else if (currentPage === 'messages') {
          const res = await api.getAdminMessages();
          if (res.data) setMessages(res.data.messages || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setDataLoading(false);
    };

    loadData();
  }, [admin, currentPage]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedInvestment(null);
  };

  const handleLogin = (adminData: any) => {
    setAdmin(adminData);
  };

  const handleLogout = () => {
    api.clearToken();
    localStorage.removeItem('admin_data');
    setAdmin(null);
    setDashboardData(null);
    setInvestments([]);
    setUsers([]);
    setMessages([]);
  };

  const handleUpdateInvestmentStatus = async (id: number, status: string) => {
    const res = await api.updateInvestment(String(id), { status });
    if (res.data) {
      // Refresh investments list
      const refreshRes = await api.getAdminInvestments();
      if (refreshRes.data) setInvestments(refreshRes.data.investments || []);
    }
  };

  const handleUpdateMessageStatus = async (id: number, status: string) => {
    const res = await api.updateMessage(String(id), status);
    if (res.data) {
      // Refresh messages list
      const refreshRes = await api.getAdminMessages();
      if (refreshRes.data) setMessages(refreshRes.data.messages || []);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#143C50] to-[#0a1f2d]">
        <Loader2 className="w-8 h-8 animate-spin text-[#009696]" />
      </div>
    );
  }

  // Login screen
  if (!admin) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const renderPage = () => {
    // Investment Detail View
    if (selectedInvestment) {
      return (
        <InvestmentDetail
          isDark={isDark}
          investment={selectedInvestment}
          onBack={() => setSelectedInvestment(null)}
          onUpdateStatus={handleUpdateInvestmentStatus}
        />
      );
    }

    // Main Pages
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard isDark={isDark} data={dashboardData} loading={dataLoading} />;

      case 'investments':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
                Инвестиции
              </h1>
            </div>

            {dataLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#009696]" />
              </div>
            ) : investments.length === 0 ? (
              <div
                className="rounded-2xl p-12 text-center border"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
                }}
              >
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                  Пока нет инвестиций
                </h3>
                <p className="opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  Инвестиции появятся здесь после первых вложений
                </p>
              </div>
            ) : (
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
                      {investments.map((inv) => (
                        <tr
                          key={inv.id}
                          className="transition-all hover:bg-opacity-50 cursor-pointer"
                          style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}
                          onClick={() => setSelectedInvestment(inv)}
                        >
                          <td className="px-6 py-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>#{inv.id}</td>
                          <td className="px-6 py-4">
                            <code className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                              {inv.wallet_address ? `${inv.wallet_address.slice(0, 6)}...${inv.wallet_address.slice(-4)}` : '-'}
                            </code>
                          </td>
                          <td className="px-6 py-4" style={{ color: '#28B48C', fontWeight: 600 }}>${Number(inv.amount_usdt || 0).toLocaleString()}</td>
                          <td className="px-6 py-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{inv.tier_name || `Tier ${inv.tier_id}`}</td>
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
                            {new Date(inv.created_at).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvestment(inv);
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
            )}
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
              Пользователи
            </h1>

            {dataLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#009696]" />
              </div>
            ) : users.length === 0 ? (
              <div
                className="rounded-2xl p-12 text-center border"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
                }}
              >
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                  Пока нет пользователей
                </h3>
                <p className="opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  Пользователи появятся после подключения первых кошельков
                </p>
              </div>
            ) : (
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
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr
                          key={index}
                          className="transition-all hover:bg-opacity-50"
                          style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}
                        >
                          <td className="px-6 py-4">
                            <code className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                              {user.wallet_address ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}` : '-'}
                            </code>
                          </td>
                          <td className="px-6 py-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{user.email || '-'}</td>
                          <td className="px-6 py-4" style={{ color: '#28B48C', fontWeight: 600 }}>${Number(user.total_invested || 0).toLocaleString()}</td>
                          <td className="px-6 py-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{user.investment_count || 0}</td>
                          <td className="px-6 py-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                            {new Date(user.created_at).toLocaleDateString('ru-RU')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
              Сообщения
            </h1>

            {dataLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#009696]" />
              </div>
            ) : messages.length === 0 ? (
              <div
                className="rounded-2xl p-12 text-center border"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
                }}
              >
                <div className="text-6xl mb-4">📬</div>
                <h3 className="text-xl mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                  Пока нет сообщений
                </h3>
                <p className="opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  Сообщения от пользователей появятся здесь
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
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
                        <p className="mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 500 }}>
                          {msg.subject || 'Без темы'}
                        </p>
                        <p className="text-sm opacity-80" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          {msg.message}
                        </p>
                      </div>
                      <div className="text-right flex flex-col gap-2">
                        <p className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          {new Date(msg.created_at).toLocaleDateString('ru-RU')}
                        </p>
                        {msg.status === 'new' && (
                          <button
                            onClick={() => handleUpdateMessageStatus(msg.id, 'read')}
                            className="px-3 py-1 rounded-lg text-xs"
                            style={{ background: 'rgba(0,150,150,0.2)', color: '#009696' }}
                          >
                            Прочитано
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'reports':
      case 'logs':
      case 'settings':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {currentPage === 'reports' ? '📈' : currentPage === 'logs' ? '📋' : '⚙️'}
              </div>
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
        return <Dashboard isDark={isDark} data={dashboardData} loading={dataLoading} />;
    }
  };

  return (
    <AdminLayout
      isDark={isDark}
      onToggleTheme={toggleTheme}
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      admin={admin}
    >
      {renderPage()}
    </AdminLayout>
  );
}
