import { useState, useEffect } from 'react';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './components/admin/Dashboard';
import { InvestmentDetail } from './components/admin/InvestmentDetail';
import { AdminLogin } from './components/admin/AdminLogin';
import { api } from './services/api';
import { Loader2, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Activity, Filter, RefreshCw, ChevronLeft, ChevronRight, Wallet, Shield, X, AlertTriangle, Globe, TestTube2 } from 'lucide-react';
import { AdminChat } from './components/admin/AdminChat';

// Settings Page Component
function SettingsPage({ isDark, admin }: { isDark: boolean; admin: any }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Platform Settings
  const [platformSettings, setPlatformSettings] = useState<Array<{key: string; value: string; description: string}>>([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Wallet Modal
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [walletPin, setWalletPin] = useState('');
  const [walletError, setWalletError] = useState('');
  const [walletSaving, setWalletSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setSettingsLoading(true);
    const res = await api.getAdminSettings();
    if (res.data) {
      setPlatformSettings(res.data);
    }
    setSettingsLoading(false);
  };

  const handleEditSetting = (key: string, value: string) => {
    // Special handling for platform_wallet - open modal
    if (key === 'platform_wallet') {
      setNewWalletAddress(value);
      setWalletPin('');
      setWalletError('');
      setWalletModalOpen(true);
      return;
    }
    setEditingKey(key);
    setEditValue(value);
  };

  const handleSaveSetting = async () => {
    if (!editingKey) return;
    setSaveLoading(true);
    const res = await api.updateAdminSetting(editingKey, editValue);
    if (res.data) {
      setPlatformSettings(prev => prev.map(s => s.key === editingKey ? { ...s, value: editValue } : s));
      setEditingKey(null);
      setEditValue('');
    } else if (res.error) {
      alert('Ошибка: ' + res.error);
    }
    setSaveLoading(false);
  };

  // Validate BEP-20 address format
  const isValidBEP20 = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSaveWallet = async () => {
    setWalletError('');

    // Validate address format
    if (!isValidBEP20(newWalletAddress)) {
      setWalletError('Неверный формат адреса. BEP-20 адрес должен начинаться с 0x и содержать 40 символов (a-f, 0-9)');
      return;
    }

    // Validate PIN
    if (!walletPin || walletPin.length !== 4) {
      setWalletError('Введите 4-значный PIN-код');
      return;
    }

    setWalletSaving(true);
    const res = await api.updateAdminSetting('platform_wallet', newWalletAddress, walletPin);

    if (res.data) {
      setPlatformSettings(prev => prev.map(s => s.key === 'platform_wallet' ? { ...s, value: newWalletAddress } : s));
      setWalletModalOpen(false);
      setNewWalletAddress('');
      setWalletPin('');
    } else if (res.error) {
      setWalletError(res.error);
    }
    setWalletSaving(false);
  };

  const closeWalletModal = () => {
    setWalletModalOpen(false);
    setNewWalletAddress('');
    setWalletPin('');
    setWalletError('');
  };

  const getSettingLabel = (key: string) => {
    const labels: Record<string, string> = {
      'platform_wallet': 'Кошелёк платформы',
      'staking_monthly_rate': 'Ставка стейкинга (мес.)',
      'staking_annual_rate': 'Ставка стейкинга (год)',
      'large_investor_return': 'Возврат для крупных инвесторов (%)',
      'early_withdrawal_fee': 'Комиссия за ранний вывод (%)',
      'min_staking_investment_usd': 'Мин. инвестиция стейкинг ($)',
      'min_car_investment_usd': 'Мин. инвестиция авто ($)',
      'total_cars_available': 'Всего авто',
      'exchange_rate_thb_usd': 'Курс THB/USD',
      'bscscan_api_key': 'BSCScan API Key'
    };
    return labels[key] || key;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (newPassword.length < 6) {
      setError('Новый пароль должен быть не менее 6 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      const response = await api.changePassword(currentPassword, newPassword);

      if (response.error) {
        if (response.error.includes('incorrect')) {
          setError('Текущий пароль неверен');
        } else {
          setError(response.error);
        }
      } else {
        setSuccess('Пароль успешно изменён');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError('Ошибка при смене пароля');
    } finally {
      setLoading(false);
    }
  };

  const currentWallet = platformSettings.find(s => s.key === 'platform_wallet')?.value || '';

  return (
    <>
      {/* Wallet Edit Modal */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}>
          <div
            className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: isDark ? 'linear-gradient(135deg, #1a4a5e 0%, #0d2938 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
              border: `2px solid ${isDark ? 'rgba(0, 150, 150, 0.5)' : 'rgba(0, 150, 150, 0.3)'}`
            }}
          >
            {/* Header */}
            <div
              className="p-6 flex items-center justify-between"
              style={{
                background: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #009696 0%, #28B48C 100%)' }}
                >
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
                    Изменение кошелька
                  </h2>
                  <p className="text-sm opacity-60" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    BEP-20 (Binance Smart Chain)
                  </p>
                </div>
              </div>
              <button
                onClick={closeWalletModal}
                className="p-2 rounded-xl transition-all hover:scale-110"
                style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
              >
                <X className="w-5 h-5" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
              </button>
            </div>

            {/* Warning */}
            <div className="px-6 pt-6">
              <div
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{
                  background: 'rgba(255, 200, 80, 0.15)',
                  border: '1px solid rgba(255, 200, 80, 0.3)'
                }}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#FFC850' }} />
                <div>
                  <p className="text-sm" style={{ color: '#FFC850', fontWeight: 600 }}>
                    Внимание! Критическая настройка
                  </p>
                  <p className="text-xs mt-1 opacity-80" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    Все инвестиции будут направляться на этот адрес. Убедитесь, что адрес верный и у вас есть доступ к кошельку.
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Current Wallet */}
              <div>
                <label className="block text-sm mb-2 opacity-60" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  Текущий адрес
                </label>
                <div
                  className="px-4 py-3 rounded-xl font-mono text-sm break-all"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: '#28B48C',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                  }}
                >
                  {currentWallet}
                </div>
              </div>

              {/* New Wallet */}
              <div>
                <label className="block text-sm mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 500 }}>
                  Новый адрес кошелька
                </label>
                <input
                  type="text"
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 rounded-xl font-mono text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#009696]"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                    color: isDark ? '#FFFAF0' : '#143C50',
                    border: `1px solid ${isValidBEP20(newWalletAddress) ? '#28B48C' : (newWalletAddress.length > 0 ? '#E74C3C' : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'))}`
                  }}
                />
                {newWalletAddress.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    {isValidBEP20(newWalletAddress) ? (
                      <>
                        <CheckCircle className="w-4 h-4" style={{ color: '#28B48C' }} />
                        <span className="text-xs" style={{ color: '#28B48C' }}>Формат адреса верный</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" style={{ color: '#E74C3C' }} />
                        <span className="text-xs" style={{ color: '#E74C3C' }}>Неверный формат (0x + 40 символов hex)</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-sm mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 500 }}>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" style={{ color: '#009696' }} />
                    PIN-код подтверждения
                  </div>
                </label>
                <input
                  type="password"
                  value={walletPin}
                  onChange={(e) => setWalletPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="• • • •"
                  maxLength={4}
                  className="w-full px-4 py-3 rounded-xl text-center text-2xl tracking-[0.5em] transition-all focus:outline-none focus:ring-2 focus:ring-[#009696]"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                    color: isDark ? '#FFFAF0' : '#143C50',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`
                  }}
                />
              </div>

              {/* Error */}
              {walletError && (
                <div
                  className="flex items-center gap-2 p-4 rounded-xl"
                  style={{
                    background: 'rgba(231, 76, 60, 0.15)',
                    border: '1px solid rgba(231, 76, 60, 0.3)'
                  }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#E74C3C' }} />
                  <p className="text-sm" style={{ color: '#E74C3C' }}>{walletError}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="p-6 flex gap-3"
              style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}
            >
              <button
                onClick={closeWalletModal}
                className="flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleSaveWallet}
                disabled={walletSaving || !isValidBEP20(newWalletAddress) || walletPin.length !== 4}
                className="flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #009696 0%, #28B48C 100%)',
                  color: '#FFFAF0'
                }}
              >
                {walletSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Сохранить
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    <div className="space-y-6">
      <h1 className="text-3xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
        Настройки
      </h1>

      {/* Platform Settings */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
            Настройки платформы
          </h2>
          <button
            onClick={loadSettings}
            className="p-2 rounded-lg transition-all hover:scale-105"
            style={{ background: isDark ? 'rgba(0,150,150,0.2)' : 'rgba(0,150,150,0.1)', color: '#009696' }}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {settingsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#009696]" />
          </div>
        ) : (
          <div className="space-y-4">
            {platformSettings.map((setting) => (
              <div
                key={setting.key}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl"
                style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
              >
                <div className="flex-1">
                  <div style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 500 }}>
                    {getSettingLabel(setting.key)}
                  </div>
                  <div className="text-xs opacity-50 mt-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    {setting.description}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editingKey === setting.key ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="px-3 py-2 rounded-lg border text-sm w-full md:w-64"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                          borderColor: isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)',
                          color: isDark ? '#FFFAF0' : '#143C50'
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveSetting}
                        disabled={saveLoading}
                        className="px-3 py-2 rounded-lg text-sm transition-all hover:scale-105"
                        style={{ background: 'rgba(40,180,140,0.2)', color: '#28B48C' }}
                      >
                        {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сохранить'}
                      </button>
                      <button
                        onClick={() => { setEditingKey(null); setEditValue(''); }}
                        className="px-3 py-2 rounded-lg text-sm"
                        style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.6 }}
                      >
                        Отмена
                      </button>
                    </>
                  ) : (
                    <>
                      <code
                        className="px-3 py-2 rounded-lg text-sm break-all"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                          color: setting.key === 'platform_wallet' ? '#28B48C' : (isDark ? '#FFFAF0' : '#143C50')
                        }}
                      >
                        {setting.key.includes('api_key') ? '••••••••' : setting.value}
                      </code>
                      <button
                        onClick={() => handleEditSetting(setting.key, setting.value)}
                        className="px-3 py-2 rounded-lg text-sm transition-all hover:scale-105"
                        style={{ background: isDark ? 'rgba(0,150,150,0.2)' : 'rgba(0,150,150,0.1)', color: '#009696' }}
                      >
                        Изменить
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Info */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
        }}
      >
        <h2 className="text-xl mb-4" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
          Информация об аккаунте
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm opacity-60 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Email</p>
            <p style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 500 }}>{admin?.email}</p>
          </div>
          <div>
            <p className="text-sm opacity-60 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Роль</p>
            <p style={{ color: '#009696', fontWeight: 500 }}>{admin?.role === 'superadmin' ? 'Супер-админ' : 'Админ'}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6" style={{ color: '#009696' }} />
          <h2 className="text-xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
            Смена пароля
          </h2>
        </div>

        {error && (
          <div
            className="flex items-center gap-2 p-4 rounded-xl mb-4"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {success && (
          <div
            className="flex items-center gap-2 p-4 rounded-xl mb-4"
            style={{ background: 'rgba(40, 180, 140, 0.1)', border: '1px solid rgba(40, 180, 140, 0.3)' }}
          >
            <CheckCircle className="w-5 h-5" style={{ color: '#28B48C' }} />
            <p style={{ color: '#28B48C' }}>{success}</p>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          {/* Current Password */}
          <div>
            <label className="block text-sm mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.8 }}>
              Текущий пароль
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 rounded-xl border transition-all focus:outline-none focus:ring-2"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
                placeholder="Введите текущий пароль"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.6 }}
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.8 }}>
              Новый пароль
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 pr-12 rounded-xl border transition-all focus:outline-none focus:ring-2"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
                placeholder="Минимум 6 символов"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.6 }}
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.8 }}>
              Подтвердите новый пароль
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 pr-12 rounded-xl border transition-all focus:outline-none focus:ring-2"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
                placeholder="Повторите новый пароль"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.6 }}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #009696 0%, #28B48C 100%)',
              color: '#FFFAF0'
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Изменить пароль
              </>
            )}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}

// Logs Page Component
function LogsPage({ isDark }: { isDark: boolean }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<{ actions: string[]; entityTypes: string[] }>({ actions: [], entityTypes: [] });
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const limit = 20;

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (selectedAction) params.action = selectedAction;
      if (selectedEntity) params.entityType = selectedEntity;

      const [logsRes, statsRes] = await Promise.all([
        api.getAdminLogs(params),
        api.getAdminLogsStats()
      ]);

      if (logsRes.data) {
        setLogs(logsRes.data.logs);
        setTotal(logsRes.data.total);
        setFilters(logsRes.data.filters);
      }
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, selectedAction, selectedEntity]);

  const totalPages = Math.ceil(total / limit);

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'admin_login': 'Вход админа',
      'password_change': 'Смена пароля',
      'investment_status_update': 'Обновление инвестиции',
      'message_status_update': 'Обновление сообщения',
      'wallet_connect': 'Подключение кошелька',
      'investment_created': 'Новая инвестиция',
      'profile_update': 'Обновление профиля',
      'user_created': 'Новый пользователь'
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    if (action.includes('login')) return '#28B48C';
    if (action.includes('password')) return '#FFC850';
    if (action.includes('investment')) return '#009696';
    if (action.includes('message')) return '#5DD9D1';
    if (action.includes('wallet')) return '#9B59B6';
    if (action.includes('profile')) return '#E67E22';
    return '#FFFAF0';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
          Логи активности
        </h1>
        <button
          onClick={loadLogs}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
          style={{
            background: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)',
            color: '#009696'
          }}
        >
          <RefreshCw className="w-4 h-4" />
          Обновить
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className="rounded-xl p-4 border"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
            }}
          >
            <Activity className="w-5 h-5 mb-2" style={{ color: '#009696' }} />
            <p className="text-2xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
              {stats.total}
            </p>
            <p className="text-sm opacity-60" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
              Всего записей
            </p>
          </div>
          <div
            className="rounded-xl p-4 border"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
            }}
          >
            <Activity className="w-5 h-5 mb-2" style={{ color: '#28B48C' }} />
            <p className="text-2xl" style={{ color: '#28B48C', fontWeight: 700 }}>
              {stats.today}
            </p>
            <p className="text-sm opacity-60" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
              Сегодня
            </p>
          </div>
          <div
            className="rounded-xl p-4 border col-span-2"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
            }}
          >
            <p className="text-sm opacity-60 mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
              По типу действия
            </p>
            <div className="flex flex-wrap gap-2">
              {stats.byAction.slice(0, 5).map((item: any) => (
                <span
                  key={item.action}
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    background: `${getActionColor(item.action)}20`,
                    color: getActionColor(item.action)
                  }}
                >
                  {getActionLabel(item.action)}: {item.count}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div
        className="rounded-xl p-4 border flex flex-wrap gap-4 items-center"
        style={{
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
        }}
      >
        <Filter className="w-5 h-5" style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.6 }} />
        <select
          value={selectedAction}
          onChange={(e) => { setSelectedAction(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'white',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
            color: isDark ? '#FFFAF0' : '#143C50'
          }}
        >
          <option value="">Все действия</option>
          {filters.actions.map(action => (
            <option key={action} value={action}>{getActionLabel(action)}</option>
          ))}
        </select>
        <select
          value={selectedEntity}
          onChange={(e) => { setSelectedEntity(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'white',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
            color: isDark ? '#FFFAF0' : '#143C50'
          }}
        >
          <option value="">Все объекты</option>
          {filters.entityTypes.map(entity => (
            <option key={entity} value={entity}>{entity}</option>
          ))}
        </select>
        {(selectedAction || selectedEntity) && (
          <button
            onClick={() => { setSelectedAction(''); setSelectedEntity(''); setPage(1); }}
            className="text-sm px-3 py-2 rounded-lg"
            style={{ color: '#009696' }}
          >
            Сбросить фильтры
          </button>
        )}
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#009696]" />
        </div>
      ) : logs.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center border"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
          }}
        >
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
            Логи не найдены
          </h3>
          <p className="opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
            {selectedAction || selectedEntity ? 'Попробуйте изменить фильтры' : 'Записи появятся здесь после первых действий'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-xl p-4 border transition-all hover:scale-[1.01]"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
              }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${getActionColor(log.action)}20` }}
                  >
                    <Activity className="w-5 h-5" style={{ color: getActionColor(log.action) }} />
                  </div>
                  <div>
                    <p style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                      {getActionLabel(log.action)}
                    </p>
                    <p className="text-sm opacity-60" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                      {log.user_email || 'Система'}
                      {log.entity_type && log.entity_id && (
                        <span> • {log.entity_type} #{log.entity_id.slice(0, 8)}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    {formatDate(log.created_at)}
                  </p>
                  {log.ip_address && (
                    <p className="text-xs opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                      IP: {log.ip_address}
                    </p>
                  )}
                </div>
              </div>
              {log.details && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <pre className="text-xs opacity-60 overflow-x-auto" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg transition-all disabled:opacity-30"
            style={{
              background: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)',
              color: '#009696'
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
            {page} из {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg transition-all disabled:opacity-30"
            style={{
              background: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)',
              color: '#009696'
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminApp() {
  const [isDark, setIsDark] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('mainnet');

  // Auth state
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Data state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
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

  // Load data when page changes or network changes
  useEffect(() => {
    if (!admin) return;

    const loadData = async () => {
      setDataLoading(true);
      try {
        if (currentPage === 'dashboard') {
          const res = await api.getAdminDashboard(network);
          if (res.data) setDashboardData(res.data);
        } else if (currentPage === 'investments') {
          const res = await api.getAdminInvestments({ network });
          if (res.data) setInvestments(res.data.investments || []);
        } else if (currentPage === 'users') {
          const res = await api.getAdminUsers();
          if (res.data) setUsers(res.data.users || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setDataLoading(false);
    };

    loadData();
  }, [admin, currentPage, network]);

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
  };

  const handleUpdateInvestmentStatus = async (id: string | number, status: string) => {
    try {
      const res = await api.updateInvestment(String(id), { status });
      if (res.error) {
        alert('Ошибка: ' + res.error);
        return;
      }
      if (res.data) {
        alert('Статус обновлён: ' + status);
        // Refresh investments list
        const refreshRes = await api.getAdminInvestments({ network });
        if (refreshRes.data) setInvestments(refreshRes.data.investments || []);
        // Clear selected investment to go back to list
        setSelectedInvestment(null);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Ошибка при обновлении статуса');
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
        return <Dashboard isDark={isDark} data={dashboardData} loading={dataLoading} onNavigate={handleNavigate} />;

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
              <>
                {/* Mobile Cards View */}
                <div className="md:hidden space-y-4">
                  {investments.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedInvestment(inv)}
                      className="rounded-2xl p-4 border cursor-pointer transition-all active:scale-[0.98]"
                      style={{
                        background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                        borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
                      }}
                    >
                      {/* Header row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>#{inv.id}</span>
                          <span
                            className="px-2 py-1 rounded-full text-xs"
                            style={{
                              background: inv.status === 'pending' ? 'rgba(255,200,80,0.2)' :
                                         inv.status === 'confirmed' ? 'rgba(40,180,140,0.2)' :
                                         'rgba(0,150,150,0.2)',
                              color: inv.status === 'pending' ? '#FFC850' :
                                    inv.status === 'confirmed' ? '#28B48C' : '#009696'
                            }}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <span className="text-xl" style={{ color: '#28B48C', fontWeight: 700 }}>
                          ${Number(inv.amount_usdt || 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="opacity-50 block text-xs" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Кошелёк</span>
                          <code style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                            {inv.wallet_address ? `${inv.wallet_address.slice(0, 6)}...${inv.wallet_address.slice(-4)}` : '-'}
                          </code>
                        </div>
                        <div>
                          <span className="opacity-50 block text-xs" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Тир</span>
                          <span style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{inv.tier_name || `Tier ${inv.tier_id}`}</span>
                        </div>
                        <div>
                          <span className="opacity-50 block text-xs" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>TX</span>
                          {inv.tx_hash ? (
                            <span
                              className="px-2 py-0.5 rounded text-xs inline-block"
                              style={{
                                background: inv.tx_verified ? 'rgba(40,180,140,0.2)' :
                                           inv.tx_verification_status === 'pending' ? 'rgba(255,200,80,0.2)' :
                                           'rgba(231,76,60,0.2)',
                                color: inv.tx_verified ? '#28B48C' :
                                      inv.tx_verification_status === 'pending' ? '#FFC850' : '#E74C3C'
                              }}
                            >
                              {inv.tx_verified ? '✓' : inv.tx_verification_status === 'pending' ? '⏳' : '✗'}
                            </span>
                          ) : (
                            <span className="opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>—</span>
                          )}
                        </div>
                        <div>
                          <span className="opacity-50 block text-xs" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Дата</span>
                          <span style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                            {inv.invested_at ? new Date(inv.invested_at).toLocaleDateString('ru-RU') : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div
                  className="hidden md:block rounded-2xl overflow-hidden border"
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
                          <th className="px-6 py-4 text-left text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>TX Верификация</th>
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
                            <td className="px-6 py-4">
                              {inv.tx_hash ? (
                                <span
                                  className="px-2 py-1 rounded-lg text-xs flex items-center gap-1 w-fit"
                                  style={{
                                    background: inv.tx_verified ? 'rgba(40,180,140,0.2)' :
                                               inv.tx_verification_status === 'pending' ? 'rgba(255,200,80,0.2)' :
                                               'rgba(231,76,60,0.2)',
                                    color: inv.tx_verified ? '#28B48C' :
                                          inv.tx_verification_status === 'pending' ? '#FFC850' :
                                          '#E74C3C'
                                  }}
                                >
                                  {inv.tx_verified ? '✓ Проверено' :
                                   inv.tx_verification_status === 'pending' ? '⏳ Ожидает' :
                                   '✗ Ошибка'}
                                </span>
                              ) : (
                                <span className="text-xs opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                                  Нет TX
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                              {inv.invested_at ? new Date(inv.invested_at).toLocaleDateString('ru-RU') : '-'}
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
              </>
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
              <div className="space-y-4">
                {users.map((user, index) => (
                  <div
                    key={index}
                    className="rounded-2xl p-6 border transition-all hover:scale-[1.01]"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                      borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* User Info */}
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                          style={{ background: 'linear-gradient(135deg, #009696 0%, #28B48C 100%)' }}
                        >
                          {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                        </div>
                        <div>
                          <h3 style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                            {user.name || 'Без имени'}
                          </h3>
                          <code className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                            {user.wallet_address ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}` : '-'}
                          </code>
                        </div>
                      </div>

                      {/* Investment Stats */}
                      <div className="flex gap-6">
                        <div className="text-center">
                          <div style={{ color: '#28B48C', fontWeight: 700, fontSize: '1.25rem' }}>
                            ${Number(user.total_invested_usdt || 0).toLocaleString()}
                          </div>
                          <div className="text-xs opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                            Инвестировано
                          </div>
                        </div>
                        <div className="text-center">
                          <div style={{ color: '#FFC850', fontWeight: 700, fontSize: '1.25rem' }}>
                            {user.total_investments || 0}
                          </div>
                          <div className="text-xs opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                            Инвестиций
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info Grid */}
                    <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                      <div>
                        <div className="text-xs opacity-50 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Email</div>
                        <div className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          {user.email || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs opacity-50 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Telegram</div>
                        <div className="text-sm" style={{ color: user.telegram ? '#5DD9D1' : (isDark ? '#FFFAF0' : '#143C50') }}>
                          {user.telegram || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs opacity-50 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>WhatsApp</div>
                        <div className="text-sm" style={{ color: user.whatsapp ? '#28B48C' : (isDark ? '#FFFAF0' : '#143C50') }}>
                          {user.whatsapp || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs opacity-50 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Регистрация</div>
                        <div className="text-sm" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          {new Date(user.created_at).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    {(user.instagram || user.twitter || user.facebook) && (
                      <div className="mt-3 flex gap-3">
                        {user.instagram && (
                          <span className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(225,48,108,0.2)', color: '#E1306C' }}>
                            IG: {user.instagram}
                          </span>
                        )}
                        {user.twitter && (
                          <span className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(29,161,242,0.2)', color: '#1DA1F2' }}>
                            X: {user.twitter}
                          </span>
                        )}
                        {user.facebook && (
                          <span className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(66,103,178,0.2)', color: '#4267B2' }}>
                            FB: {user.facebook}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'chat':
        return (
          <AdminChat isDark={isDark} />
        );

      case 'logs':
        return <LogsPage isDark={isDark} />;

      case 'reports':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-6xl mb-4">📈</div>
              <h2 className="text-2xl mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                Финансовые отчёты
              </h2>
              <p className="opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                Раздел в разработке
              </p>
            </div>
          </div>
        );

      case 'settings':
        return <SettingsPage isDark={isDark} admin={admin} />;

      default:
        return <Dashboard isDark={isDark} data={dashboardData} loading={dataLoading} onNavigate={handleNavigate} />;
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
      network={network}
      onNetworkChange={setNetwork}
    >
      {network === 'testnet' && (
        <div className="mb-4 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#F59E0B'
          }}>
          <TestTube2 className="w-4 h-4" />
          TESTNET MODE - Тестовые данные BSC Testnet
        </div>
      )}
      {renderPage()}
    </AdminLayout>
  );
}