import { useState } from 'react';
import { LayoutDashboard, DollarSign, Users, Mail, FileText, Settings, LogOut, Menu, X, Sun, Moon, Activity } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  isDark: boolean;
  onToggleTheme: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function AdminLayout({ children, isDark, onToggleTheme, currentPage, onNavigate }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { id: 'investments', label: 'Инвестиции', icon: DollarSign },
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'messages', label: 'Сообщения', icon: Mail },
    { id: 'reports', label: 'Отчёты', icon: FileText },
    { id: 'logs', label: 'Логи', icon: Activity },
    { id: 'settings', label: 'Настройки', icon: Settings }
  ];

  return (
    <div className="min-h-screen flex" style={{ background: isDark ? 'linear-gradient(135deg, #143C50 0%, #0a1f2d 100%)' : 'linear-gradient(135deg, #FFFAF0 0%, #f5e6d3 100%)' }}>
      {/* Sidebar - Desktop */}
      <aside 
        className="hidden lg:flex flex-col w-64 border-r"
        style={{
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <h1 className="text-2xl" style={{ color: isDark ? '#FFC850' : '#143C50', fontWeight: 700 }}>
            Thailand My Car
          </h1>
          <p className="text-sm opacity-70 mt-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
            Admin Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: isActive 
                    ? (isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)')
                    : 'transparent',
                  color: isActive ? '#009696' : (isDark ? '#FFFAF0' : '#143C50'),
                  fontWeight: isActive ? 600 : 400,
                  border: isActive ? `1px solid ${isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'}` : '1px solid transparent'
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t space-y-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-105"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: isDark ? '#FFFAF0' : '#143C50'
            }}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{isDark ? 'Светлая тема' : 'Тёмная тема'}</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-105"
            style={{
              background: 'rgba(231, 76, 60, 0.2)',
              color: '#E74C3C',
              border: '1px solid rgba(231, 76, 60, 0.3)'
            }}
          >
            <LogOut className="w-5 h-5" />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setSidebarOpen(false)}
        >
          <aside 
            className="w-64 h-full flex flex-col"
            style={{
              background: isDark ? '#143C50' : '#FFFFFF',
              backdropFilter: 'blur(20px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Logo */}
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <div>
                <h1 className="text-xl" style={{ color: isDark ? '#FFC850' : '#143C50', fontWeight: 700 }}>
                  Thailand My Car
                </h1>
                <p className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  Admin Panel
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl"
                style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
              >
                <X className="w-5 h-5" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: isActive 
                        ? (isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)')
                        : 'transparent',
                      color: isActive ? '#009696' : (isDark ? '#FFFAF0' : '#143C50'),
                      fontWeight: isActive ? 600 : 400,
                      border: isActive ? `1px solid ${isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'}` : '1px solid transparent'
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Footer */}
            <div className="p-4 border-t space-y-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <button
                onClick={onToggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{isDark ? 'Светлая тема' : 'Тёмная тема'}</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: 'rgba(231, 76, 60, 0.2)',
                  color: '#E74C3C',
                  border: '1px solid rgba(231, 76, 60, 0.3)'
                }}
              >
                <LogOut className="w-5 h-5" />
                <span>Выйти</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header 
          className="border-b backdrop-blur-xl"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              >
                <Menu className="w-6 h-6" />
              </button>

              <h2 className="text-xl lg:text-2xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                {menuItems.find(item => item.id === currentPage)?.label || 'Дашборд'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle - Desktop only */}
              <button
                onClick={onToggleTheme}
                className="hidden lg:block p-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Admin Avatar */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                  color: '#FFFAF0'
                }}
              >
                <span>A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
