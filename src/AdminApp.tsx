import { useState, useEffect } from 'react';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './components/admin/Dashboard';
import { InvestmentDetail } from './components/admin/InvestmentDetail';
import { AdminLogin } from './components/admin/AdminLogin';
import { api } from './services/api';
import { Loader2, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Activity, Filter, RefreshCw, ChevronLeft, ChevronRight, Wallet, Shield, X, AlertTriangle, Globe, TestTube2, DollarSign, FileText, Copy } from 'lucide-react';
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

  // Telegram Settings
  const [telegramSettings, setTelegramSettings] = useState<{
    telegram_enabled: string;
    telegram_support_chat_id: string;
    telegram_bot_token_set: boolean;
    webhook_url?: string;
  } | null>(null);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [newSupportChatId, setNewSupportChatId] = useState("");
  const [telegramTestLoading, setTelegramTestLoading] = useState(false);
  const [telegramMessage, setTelegramMessage] = useState<{type: "success" | "error"; text: string} | null>(null);

  useEffect(() => {
    loadSettings();
    loadTelegramSettings();
  }, []);

  const loadSettings = async () => {
    setSettingsLoading(true);
    const res = await api.getAdminSettings();
    if (res.data) {
      setPlatformSettings(res.data);
    }
    setSettingsLoading(false);
  };

  // Load Telegram settings
  const loadTelegramSettings = async () => {
    setTelegramLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/telegram/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.settings) {
        setTelegramSettings(data.settings);
        setNewSupportChatId(data.settings.telegram_support_chat_id || "");
      }
    } catch (e) {
      console.error("Load telegram settings error:", e);
    }
    setTelegramLoading(false);
  };

  // Save Telegram support chat ID
  const saveTelegramChatId = async () => {
    setTelegramLoading(true);
    setTelegramMessage(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/telegram/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ telegram_support_chat_id: newSupportChatId })
      });
      const data = await res.json();
      if (data.success) {
        setTelegramMessage({ type: "success", text: "Chat ID сохранён" });
        loadTelegramSettings();
      } else {
        setTelegramMessage({ type: "error", text: data.error || "Ошибка сохранения" });
      }
    } catch (e) {
      setTelegramMessage({ type: "error", text: "Ошибка сети" });
    }
    setTelegramLoading(false);
  };

  // Toggle Telegram enabled
  const toggleTelegramEnabled = async () => {
    setTelegramLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const newEnabled = telegramSettings?.telegram_enabled !== "true";
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/telegram/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ telegram_enabled: newEnabled })
      });
      if ((await res.json()).success) {
        loadTelegramSettings();
      }
    } catch (e) {
      console.error("Toggle telegram error:", e);
    }
    setTelegramLoading(false);
  };

  // Test Telegram connection
  const testTelegram = async () => {
    setTelegramTestLoading(true);
    setTelegramMessage(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/telegram/test`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTelegramMessage({ type: "success", text: "Тестовое сообщение отправлено!" });
      } else {
        setTelegramMessage({ type: "error", text: data.error || "Ошибка отправки" });
      }
    } catch (e) {
      setTelegramMessage({ type: "error", text: "Ошибка сети" });
    }
    setTelegramTestLoading(false);
  };

  // Setup webhook
  const setupWebhook = async () => {
    setTelegramLoading(true);
    setTelegramMessage(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/telegram/webhook/setup`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTelegramMessage({ type: "success", text: "Webhook установлен: " + data.url });
        loadTelegramSettings();
      } else {
        setTelegramMessage({ type: "error", text: data.error || "Ошибка установки" });
      }
    } catch (e) {
      setTelegramMessage({ type: "error", text: "Ошибка сети" });
    }
    setTelegramLoading(false);
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


      {/* Telegram Settings */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.9)",
          borderColor: isDark ? "rgba(0, 150, 150, 0.3)" : "rgba(0, 150, 150, 0.2)"
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,150,150,0.15)" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#009696">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </div>
            <h2 className="text-xl" style={{ color: isDark ? "#FFFAF0" : "#143C50", fontWeight: 600 }}>
              Telegram интеграция
            </h2>
          </div>
          <button
            onClick={loadTelegramSettings}
            disabled={telegramLoading}
            className="p-2 rounded-lg transition-all hover:scale-105"
            style={{ background: isDark ? "rgba(0,150,150,0.2)" : "rgba(0,150,150,0.1)", color: "#009696" }}
          >
            <RefreshCw className={`w-4 h-4 ${telegramLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {telegramMessage && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${telegramMessage.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
          >
            {telegramMessage.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {telegramMessage.text}
          </div>
        )}

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>
            <div>
              <div style={{ color: isDark ? "#FFFAF0" : "#143C50", fontWeight: 500 }}>Статус</div>
              <div className="text-xs opacity-50 mt-1" style={{ color: isDark ? "#FFFAF0" : "#143C50" }}>
                Включить/выключить пересылку сообщений в Telegram
              </div>
            </div>
            <button
              onClick={toggleTelegramEnabled}
              disabled={telegramLoading}
              className={`px-4 py-2 rounded-lg transition-all ${telegramSettings?.telegram_enabled === "true" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
            >
              {telegramSettings?.telegram_enabled === "true" ? "Включено" : "Выключено"}
            </button>
          </div>

          {/* Support Chat ID */}
          <div className="p-4 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>
            <div style={{ color: isDark ? "#FFFAF0" : "#143C50", fontWeight: 500 }}>Chat ID поддержки</div>
            <div className="text-xs opacity-50 mt-1 mb-3" style={{ color: isDark ? "#FFFAF0" : "#143C50" }}>
              ID пользователя Telegram который будет получать сообщения. Узнать можно отправив /start боту.
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSupportChatId}
                onChange={(e) => setNewSupportChatId(e.target.value)}
                placeholder="Например: 7038002579"
                className="flex-1 px-3 py-2 rounded-lg border text-sm"
                style={{
                  background: isDark ? "rgba(255,255,255,0.1)" : "white",
                  borderColor: isDark ? "rgba(0,150,150,0.3)" : "rgba(0,150,150,0.2)",
                  color: isDark ? "#FFFAF0" : "#143C50"
                }}
              />
              <button
                onClick={saveTelegramChatId}
                disabled={telegramLoading}
                className="px-4 py-2 rounded-lg transition-all hover:scale-105"
                style={{ background: "rgba(0,150,150,0.2)", color: "#009696" }}
              >
                Сохранить
              </button>
            </div>
          </div>

          {/* Bot Token Status */}
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>
            <div>
              <div style={{ color: isDark ? "#FFFAF0" : "#143C50", fontWeight: 500 }}>Bot Token</div>
              <div className="text-xs opacity-50 mt-1" style={{ color: isDark ? "#FFFAF0" : "#143C50" }}>
                Токен бота @SaturwayMira_bot
              </div>
            </div>
            <span className={`px-3 py-1 rounded-lg text-sm ${telegramSettings?.telegram_bot_token_set ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
              {telegramSettings?.telegram_bot_token_set ? "Настроен" : "Не настроен"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={testTelegram}
              disabled={telegramTestLoading || !telegramSettings?.telegram_enabled}
              className="px-4 py-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "rgba(40,180,140,0.2)", color: "#28B48C" }}
            >
              {telegramTestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Отправить тест"}
            </button>
            <button
              onClick={setupWebhook}
              disabled={telegramLoading}
              className="px-4 py-2 rounded-lg transition-all hover:scale-105"
              style={{ background: isDark ? "rgba(0,150,150,0.2)" : "rgba(0,150,150,0.1)", color: "#009696" }}
            >
              Настроить Webhook
            </button>
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

// Analytics Page Component
function AnalyticsPage({ isDark }: { isDark: boolean }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalyticsStats(period);
      if (res.data) {
        setStats(res.data);
      }
    } catch (e) {
      console.error("Analytics error:", e);
    }
    setLoading(false);
  };

  const countryFlags: Record<string, string> = {
    RU: "🇷🇺", US: "🇺🇸", DE: "🇩🇪", GB: "🇬🇧", FR: "🇫🇷", CN: "🇨🇳", JP: "🇯🇵",
    TH: "🇹🇭", VN: "🇻🇳", KR: "🇰🇷", IN: "🇮🇳", UA: "🇺🇦", KZ: "🇰🇿", BY: "🇧🇾",
    PL: "🇵🇱", NL: "🇳🇱", TR: "🇹🇷", AE: "🇦🇪", SG: "🇸🇬", ID: "🇮🇩", LO: "🏠"
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#009696" }} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="opacity-70">Нет данных аналитики</p>
      </div>
    );
  }

  const todayChange = stats.yesterday > 0 
    ? Math.round(((stats.today - stats.yesterday) / stats.yesterday) * 100) 
    : stats.today > 0 ? 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: isDark ? "#FFFAF0" : "#143C50" }}>
          <Globe className="w-5 h-5" style={{ color: "#009696" }} />
          Статистика посещений
        </h2>
        <div className="flex gap-2">
          {[{ value: "24h", label: "24ч" }, { value: "7d", label: "7д" }, { value: "30d", label: "30д" }, { value: "all", label: "Всё" }].map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)} className="px-3 py-1 rounded-lg text-sm transition-all"
              style={{ background: period === p.value ? "#009696" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", color: period === p.value ? "#FFFAF0" : isDark ? "#FFFAF0" : "#143C50" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl" style={{ background: isDark ? "rgba(0,150,150,0.15)" : "rgba(0,150,150,0.1)" }}>
          <div className="text-sm opacity-70 mb-1">Всего просмотров</div>
          <div className="text-2xl font-bold" style={{ color: "#009696" }}>{parseInt(stats.totals.total_views).toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-xl" style={{ background: isDark ? "rgba(40,180,140,0.15)" : "rgba(40,180,140,0.1)" }}>
          <div className="text-sm opacity-70 mb-1">Уник. сессий</div>
          <div className="text-2xl font-bold" style={{ color: "#28B48C" }}>{parseInt(stats.totals.unique_sessions).toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-xl" style={{ background: isDark ? "rgba(255,200,80,0.15)" : "rgba(255,200,80,0.1)" }}>
          <div className="text-sm opacity-70 mb-1">Уникальных IP</div>
          <div className="text-2xl font-bold" style={{ color: "#FFC850" }}>{parseInt(stats.totals.unique_ips).toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}>
          <div className="text-sm opacity-70 mb-1">Сегодня</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{stats.today}</span>
            <span className={todayChange >= 0 ? "text-green-500 text-sm" : "text-red-500 text-sm"}>{todayChange >= 0 ? "+" : ""}{todayChange}%</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Globe className="w-4 h-4" style={{ color: "#009696" }} />По странам</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {stats.countries.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}>
                <div className="flex items-center gap-2"><span className="text-xl">{countryFlags[c.country_code] || "🌍"}</span><span>{c.country}</span></div>
                <div className="flex items-center gap-4 text-sm"><span className="opacity-70">{c.sessions} сес.</span><span className="font-semibold" style={{ color: "#009696" }}>{c.views}</span></div>
              </div>
            ))}
            {stats.countries.length === 0 && <div className="text-center py-4 opacity-50">Нет данных</div>}
          </div>
        </div>
        <div className="p-4 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity className="w-4 h-4" style={{ color: "#28B48C" }} />По дням</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {stats.daily.map((d: any, i: number) => {
              const maxViews = Math.max(...stats.daily.map((x: any) => parseInt(x.views)));
              const width = maxViews > 0 ? (parseInt(d.views) / maxViews) * 100 : 0;
              return (
                <div key={i} className="relative">
                  <div className="absolute left-0 top-0 bottom-0 rounded-lg opacity-20" style={{ width: width + "%", background: "#28B48C" }} />
                  <div className="relative flex items-center justify-between py-2 px-3">
                    <span className="text-sm">{new Date(d.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</span>
                    <div className="flex items-center gap-4 text-sm"><span className="opacity-70">{d.sessions} сес.</span><span className="font-semibold" style={{ color: "#28B48C" }}>{d.views}</span></div>
                  </div>
                </div>
              );
            })}
            {stats.daily.length === 0 && <div className="text-center py-4 opacity-50">Нет данных</div>}
          </div>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" }}>
        <h3 className="font-semibold mb-4">Популярные страницы</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {stats.pages.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}>
              <span className="text-sm truncate" style={{ maxWidth: "70%" }}>{p.page}</span>
              <span className="font-semibold" style={{ color: "#FFC850" }}>{p.views}</span>
            </div>
          ))}
        </div>
      </div>
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
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Withdrawal modal state
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [withdrawalModalType, setWithdrawalModalType] = useState<'crypto' | 'bank' | 'reject' | null>(null);
  const [withdrawalTxHash, setWithdrawalTxHash] = useState('');
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [showCreateInvestmentModal, setShowCreateInvestmentModal] = useState(false);
  const [newInvestment, setNewInvestment] = useState({ wallet_address: "", amount_usdt: "", tier_type: "staking" });
  const [createInvestmentLoading, setCreateInvestmentLoading] = useState(false);
  const [toast, setToast] = useState<{show: boolean, type: 'success' | 'error', title: string, message: string}>({show: false, type: 'success', title: '', message: ''});

  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    setToast({show: true, type, title, message});
    setTimeout(() => setToast(t => ({...t, show: false})), 4000);
  };

  const copyWalletToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      alert('Не удалось скопировать. Выделите текст вручную.');
    }
  };
  const [withdrawalBankDetails, setWithdrawalBankDetails] = useState('');
  const [withdrawalNotes, setWithdrawalNotes] = useState('');
  const [withdrawalProcessing, setWithdrawalProcessing] = useState(false);

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
        } else if (currentPage === 'withdrawals') {
          const res = await api.getAdminWithdrawals({ network });
          if (res.data) setWithdrawals(res.data.withdrawals || []);
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



  const handleCreateInvestment = async () => {
    if (!newInvestment.wallet_address || !newInvestment.amount_usdt) {
      alert("Заполните все поля");
      return;
    }

    const amount = parseInt(newInvestment.amount_usdt);
    if (isNaN(amount) || amount < 1000) {
      alert("Минимальная сумма: $1,000");
      return;
    }

    if (newInvestment.tier_type === "car_share" && amount < 12400) {
      alert("Минимум для доли в авто: $12,400");
      return;
    }

    if (newInvestment.tier_type === "staking" && amount >= 12400) {
      alert("Для суммы от $12,400 выберите тип Доля в авто");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newInvestment.wallet_address)) {
      alert("Некорректный адрес кошелька");
      return;
    }

    setCreateInvestmentLoading(true);
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/investments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          wallet_address: newInvestment.wallet_address,
          amount_usdt: amount,
          tier_type: newInvestment.tier_type,
          network: network
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setShowCreateInvestmentModal(false);
        setNewInvestment({ wallet_address: "", amount_usdt: "", tier_type: "staking" });
        showToast('success', 'Депозит создан', `$${amount.toLocaleString()} • ${newInvestment.tier_type === 'staking' ? 'Стейкинг' : 'Доля в авто'} • ${newInvestment.wallet_address.slice(0,6)}...${newInvestment.wallet_address.slice(-4)}`);
        // Data will refresh on page reload
      } else {
        showToast('error', 'Ошибка', data.error || 'Не удалось создать депозит');
      }
    } catch (error) {
      console.error("Create investment error:", error);
      showToast('error', 'Ошибка сервера', 'Проверьте подключение и попробуйте снова');
    } finally {
      setCreateInvestmentLoading(false);
    }
  };

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
                          {inv.tx_hash?.startsWith('admin_') || inv.tx_verification_status === 'admin_created' ? (
                            <span
                              className="px-2 py-0.5 rounded text-xs inline-block"
                              style={{ background: 'rgba(147,51,234,0.2)', color: '#9333EA' }}
                            >
                              РУЧНОЙ
                            </span>
                          ) : inv.tx_hash ? (
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

      case 'withdrawals':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
              Заявки на вывод
            </h1>

            {dataLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#009696]" />
              </div>
            ) : withdrawals.length === 0 ? (
              <div
                className="rounded-2xl p-12 text-center border"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
                }}
              >
                <Wallet className="w-16 h-16 mx-auto mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }} />
                <h3 className="text-xl mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                  Нет заявок на вывод
                </h3>
                <p className="opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  Все запросы обработаны
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((wd) => (
                  <div
                    key={wd.id}
                    className="rounded-2xl p-6 border"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                      borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                            Инвестиция #{wd.id}
                          </h3>
                          <span
                            className="px-2 py-1 rounded-lg text-xs"
                            style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}
                          >
                            Запрос на вывод
                          </span>
                        </div>
                        <code className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          {wd.wallet_address?.slice(0, 10)}...{wd.wallet_address?.slice(-8)}
                        </code>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl" style={{ color: '#28B48C', fontWeight: 700 }}>
                          ${Number(wd.return_amount || wd.amount_usdt || 0).toLocaleString()}
                        </div>
                        <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          к выплате
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl mb-4" style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
                      <div>
                        <div className="text-xs opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Инвестировано</div>
                        <div style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>${Number(wd.amount_usdt || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Заработано</div>
                        <div style={{ color: '#28B48C', fontWeight: 600 }}>+${Number(wd.staking_earned || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Комиссия</div>
                        <div style={{ color: '#E74C3C', fontWeight: 600 }}>-${Number(wd.early_withdrawal_fee || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Тип</div>
                        <div style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>{wd.tier_type === 'car_share' ? 'Доля в авто' : 'Стейкинг'}</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          setSelectedWithdrawal(wd);
                          setWithdrawalModalType('crypto');
                          setWithdrawalTxHash('');
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                        style={{ background: 'rgba(0, 150, 150, 0.2)', color: '#009696', fontWeight: 600 }}
                      >
                        <DollarSign className="w-4 h-4" />
                        Выплатить крипто
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWithdrawal(wd);
                          setWithdrawalModalType('bank');
                          setWithdrawalBankDetails('');
                          setWithdrawalNotes('');
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                        style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6', fontWeight: 600 }}
                      >
                        <FileText className="w-4 h-4" />
                        Банковский перевод
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWithdrawal(wd);
                          setWithdrawalModalType('reject');
                          setWithdrawalNotes('');
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                        style={{ background: 'rgba(231, 76, 60, 0.2)', color: '#E74C3C', fontWeight: 600 }}
                      >
                        <X className="w-4 h-4" />
                        Отклонить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Withdrawal Modal */}
            {withdrawalModalType && selectedWithdrawal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setWithdrawalModalType(null)}>
                <div
                  className="rounded-2xl w-full max-h-[90vh] overflow-y-auto"
                  style={{ background: isDark ? '#1a3a4a' : '#FFFFFF', maxWidth: '450px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <h3 className="text-xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
                      {withdrawalModalType === 'crypto' && 'Выплата криптовалютой'}
                      {withdrawalModalType === 'bank' && 'Банковский перевод'}
                      {withdrawalModalType === 'reject' && 'Отклонить заявку'}
                    </h3>
                    <button
                      onClick={() => setWithdrawalModalType(null)}
                      className="p-2 rounded-lg"
                      style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                    >
                      <X className="w-5 h-5" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Info */}
                    <div className="p-4 rounded-xl" style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
                      <div className="flex justify-between mb-2">
                        <span style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Инвестиция</span>
                        <span style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>#{selectedWithdrawal.id}</span>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <span style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Кошелёк</span>
                          <button
                            onClick={() => copyWalletToClipboard(selectedWithdrawal.wallet_address || '')}
                            className="px-2 py-1 rounded text-xs flex items-center gap-1 transition-all hover:scale-105"
                            style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: isDark ? '#FFFAF0' : '#143C50' }}
                          >
                            {copiedWallet ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedWallet ? 'Скопировано!' : 'Копировать'}
                          </button>
                        </div>
                        <code
                          className="block text-sm font-mono p-2 rounded break-all select-all cursor-pointer"
                          style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)', color: isDark ? '#FFFAF0' : '#143C50' }}
                          onClick={() => copyWalletToClipboard(selectedWithdrawal.wallet_address || '')}
                        >
                          {selectedWithdrawal.wallet_address || 'Не указан'}
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Сумма к выплате</span>
                        <span className="text-xl" style={{ color: '#28B48C', fontWeight: 700 }}>
                          ${Number(selectedWithdrawal.return_amount || selectedWithdrawal.amount_usdt || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Crypto Form */}
                    {withdrawalModalType === 'crypto' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Transaction Hash (TX Hash) *</label>
                          <input
                            type="text"
                            value={withdrawalTxHash}
                            onChange={(e) => setWithdrawalTxHash(e.target.value)}
                            placeholder="0x..."
                            className="w-full px-4 py-3 rounded-xl font-mono text-sm"
                            style={{
                              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                              color: isDark ? '#FFFAF0' : '#143C50'
                            }}
                          />
                        </div>
                        <button
                          onClick={async () => {
                            if (!withdrawalTxHash.trim()) return;
                            setWithdrawalProcessing(true);
                            const res = await api.processWithdrawalCrypto(selectedWithdrawal.id, withdrawalTxHash.trim());
                            if (res.data?.success) {
                              setWithdrawalModalType(null);
                              const refreshRes = await api.getAdminWithdrawals({ network });
                              if (refreshRes.data) setWithdrawals(refreshRes.data.withdrawals || []);
                            }
                            setWithdrawalProcessing(false);
                          }}
                          disabled={!withdrawalTxHash.trim() || withdrawalProcessing}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all disabled:opacity-50"
                          style={{ background: '#009696', color: '#FFFFFF', fontWeight: 600 }}
                        >
                          {withdrawalProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                          Подтвердить выплату
                        </button>
                      </div>
                    )}

                    {/* Bank Form */}
                    {withdrawalModalType === 'bank' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Реквизиты перевода / Номер операции</label>
                          <input
                            type="text"
                            value={withdrawalBankDetails}
                            onChange={(e) => setWithdrawalBankDetails(e.target.value)}
                            placeholder="Номер операции, реквизиты..."
                            className="w-full px-4 py-3 rounded-xl text-sm"
                            style={{
                              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                              color: isDark ? '#FFFAF0' : '#143C50'
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Комментарий</label>
                          <textarea
                            value={withdrawalNotes}
                            onChange={(e) => setWithdrawalNotes(e.target.value)}
                            placeholder="Дополнительная информация..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                            style={{
                              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                              color: isDark ? '#FFFAF0' : '#143C50'
                            }}
                          />
                        </div>
                        <button
                          onClick={async () => {
                            setWithdrawalProcessing(true);
                            const res = await api.processWithdrawalBank(selectedWithdrawal.id, {
                              bankDetails: withdrawalBankDetails.trim() || undefined,
                              notes: withdrawalNotes.trim() || undefined,
                            });
                            if (res.data?.success) {
                              setWithdrawalModalType(null);
                              const refreshRes = await api.getAdminWithdrawals({ network });
                              if (refreshRes.data) setWithdrawals(refreshRes.data.withdrawals || []);
                            }
                            setWithdrawalProcessing(false);
                          }}
                          disabled={withdrawalProcessing}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all disabled:opacity-50"
                          style={{ background: '#3B82F6', color: '#FFFFFF', fontWeight: 600 }}
                        >
                          {withdrawalProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                          Подтвердить перевод
                        </button>
                      </div>
                    )}

                    {/* Reject Form */}
                    {withdrawalModalType === 'reject' && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl" style={{ background: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.2)' }}>
                          <p style={{ color: '#E74C3C' }}>
                            Заявка будет отклонена, а инвестиция вернётся в статус "Активна". Инвестор сможет подать заявку повторно.
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Причина отклонения (опционально)</label>
                          <textarea
                            value={withdrawalNotes}
                            onChange={(e) => setWithdrawalNotes(e.target.value)}
                            placeholder="Укажите причину..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                            style={{
                              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                              color: isDark ? '#FFFAF0' : '#143C50'
                            }}
                          />
                        </div>
                        <button
                          onClick={async () => {
                            setWithdrawalProcessing(true);
                            const res = await api.rejectWithdrawal(selectedWithdrawal.id, withdrawalNotes.trim() || undefined);
                            if (res.data?.success) {
                              setWithdrawalModalType(null);
                              const refreshRes = await api.getAdminWithdrawals({ network });
                              if (refreshRes.data) setWithdrawals(refreshRes.data.withdrawals || []);
                            }
                            setWithdrawalProcessing(false);
                          }}
                          disabled={withdrawalProcessing}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all disabled:opacity-50"
                          style={{ background: '#E74C3C', color: '#FFFFFF', fontWeight: 600 }}
                        >
                          {withdrawalProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                          Отклонить заявку
                        </button>
                      </div>
                    )}
                  </div>
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
                      <div className="flex gap-6 items-center">
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
                        <button
                          onClick={() => {
                            setNewInvestment({ wallet_address: user.wallet_address, amount_usdt: '', tier_type: 'staking' });
                            setShowCreateInvestmentModal(true);
                          }}
                          className="px-3 py-2 rounded-lg flex items-center gap-1 transition-all hover:scale-105 text-sm"
                          style={{ background: 'linear-gradient(135deg, #009696 0%, #28B48C 100%)', color: '#FFFAF0', fontWeight: 600 }}
                        >
                          <DollarSign className="w-4 h-4" />
                          Депозит
                        </button>
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
        return <AnalyticsPage isDark={isDark} />;


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

      {/* Create Investment Modal */}
      {/* Toast Notification */}
            {toast.show && (
              <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-top-2 fade-in duration-300">
                <div 
                  className="px-5 py-4 rounded-xl shadow-2xl flex items-start gap-4 min-w-[320px] max-w-[400px]"
                  style={{ 
                    background: isDark ? '#1a3a4a' : '#FFFFFF',
                    border: `2px solid ${toast.type === 'success' ? '#28B48C' : '#E74C3C'}`
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: toast.type === 'success' ? 'rgba(40,180,140,0.15)' : 'rgba(231,76,60,0.15)' }}
                  >
                    {toast.type === 'success' ? (
                      <CheckCircle className="w-5 h-5" style={{ color: '#28B48C' }} />
                    ) : (
                      <AlertTriangle className="w-5 h-5" style={{ color: '#E74C3C' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                      {toast.title}
                    </div>
                    <div className="text-sm opacity-70 break-words" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                      {toast.message}
                    </div>
                  </div>
                  <button 
                    onClick={() => setToast(t => ({...t, show: false}))}
                    className="p-1 rounded-lg opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <X className="w-4 h-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
                  </button>
                </div>
              </div>
            )}

            {showCreateInvestmentModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-3 sm:p-4 z-50" onClick={() => setShowCreateInvestmentModal(false)}>
                <div
                  className="rounded-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
                  style={{ background: isDark ? '#1a3a4a' : '#FFFFFF', maxWidth: '460px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="px-5 sm:px-6 py-4 sm:py-5 border-b flex items-center justify-between" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #009696 0%, #28B48C 100%)' }}>
                        <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
                          Создать депозит
                        </h3>
                        <p className="text-xs sm:text-sm opacity-60 hidden sm:block" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Ручное добавление</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCreateInvestmentModal(false)}
                      className="p-2.5 rounded-xl transition-all active:scale-95"
                      style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                    >
                      <X className="w-5 h-5" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-5 sm:px-6 py-5 sm:py-6 space-y-4 sm:space-y-5">
                    {/* Warning */}
                    <div className="px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(147, 51, 234, 0.2)' }}>
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: '#9333EA' }} />
                      <span className="text-xs sm:text-sm" style={{ color: '#9333EA' }}>Депозит будет помечен как ручной</span>
                    </div>

                    {/* Wallet Info */}
                    <div className="px-4 py-3 sm:py-4 rounded-xl" style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' }}>
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Wallet className="w-4 h-4 opacity-60" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
                        <span className="text-xs sm:text-sm opacity-60" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Кошелёк</span>
                      </div>
                      <code
                        className="block text-xs sm:text-sm font-mono px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg break-all"
                        style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)', color: isDark ? '#FFFAF0' : '#143C50' }}
                      >
                        {newInvestment.wallet_address || '0x...'}
                      </code>
                    </div>

                    {/* Tier Type Selection */}
                    <div>
                      <label className="block text-xs sm:text-sm mb-3 px-1" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>Тип инвестиции</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setNewInvestment({ ...newInvestment, tier_type: 'staking', amount_usdt: '' })}
                          className="px-3 sm:px-4 py-4 sm:py-5 rounded-xl border-2 transition-all active:scale-[0.98] text-left"
                          style={{ 
                            background: newInvestment.tier_type === 'staking' ? 'rgba(0,150,150,0.1)' : (isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'),
                            borderColor: newInvestment.tier_type === 'staking' ? '#009696' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')
                          }}
                        >
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3" style={{ background: newInvestment.tier_type === 'staking' ? '#009696' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') }}>
                            <Activity className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: newInvestment.tier_type === 'staking' ? '#FFFFFF' : (isDark ? '#FFFAF0' : '#143C50') }} />
                          </div>
                          <div className="font-semibold text-sm sm:text-base mb-0.5" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Стейкинг</div>
                          <div className="text-xs sm:text-sm" style={{ color: '#009696' }}>от $1,000</div>
                        </button>
                        <button
                          onClick={() => setNewInvestment({ ...newInvestment, tier_type: 'car_share', amount_usdt: '' })}
                          className="px-3 sm:px-4 py-4 sm:py-5 rounded-xl border-2 transition-all active:scale-[0.98] text-left"
                          style={{ 
                            background: newInvestment.tier_type === 'car_share' ? 'rgba(0,150,150,0.1)' : (isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'),
                            borderColor: newInvestment.tier_type === 'car_share' ? '#009696' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')
                          }}
                        >
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3" style={{ background: newInvestment.tier_type === 'car_share' ? '#009696' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') }}>
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: newInvestment.tier_type === 'car_share' ? '#FFFFFF' : (isDark ? '#FFFAF0' : '#143C50') }} />
                          </div>
                          <div className="font-semibold text-sm sm:text-base mb-0.5" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Доля в авто</div>
                          <div className="text-xs sm:text-sm" style={{ color: '#009696' }}>от $12,400</div>
                        </button>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="block text-xs sm:text-sm mb-2 sm:mb-3 px-1" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                        Сумма (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg sm:text-xl" style={{ color: '#28B48C', fontWeight: 700 }}>$</span>
                        <input
                          type="number"
                          value={newInvestment.amount_usdt}
                          onChange={(e) => setNewInvestment({ ...newInvestment, amount_usdt: e.target.value })}
                          className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-4 sm:py-5 rounded-xl text-lg sm:text-xl"
                          style={{ 
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            border: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                            color: isDark ? '#FFFAF0' : '#143C50',
                            fontWeight: 700
                          }}
                          placeholder={newInvestment.tier_type === 'staking' ? '1000' : '12400'}
                          min={newInvestment.tier_type === 'staking' ? 1000 : 12400}
                          step="100"
                        />
                      </div>
                      <div className="mt-2 text-xs opacity-60 px-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                        Мин: ${newInvestment.tier_type === 'staking' ? '1,000' : '12,400'}
                      </div>
                    </div>

                    {/* Network Info */}
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' }}>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 opacity-60" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
                        <span className="text-xs sm:text-sm opacity-60" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Сеть</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: network === 'testnet' ? '#F59E0B' : '#28B48C' }}></div>
                        <span className="text-sm font-semibold" style={{ color: network === 'testnet' ? '#F59E0B' : '#28B48C' }}>
                          {network === 'testnet' ? 'Testnet' : 'Mainnet'}
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleCreateInvestment}
                      disabled={createInvestmentLoading || !newInvestment.amount_usdt}
                      className="w-full flex items-center justify-center gap-2 sm:gap-3 px-5 py-4 sm:py-5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
                      style={{ background: 'linear-gradient(135deg, #009696 0%, #28B48C 100%)', color: '#FFFFFF', fontWeight: 600 }}
                    >
                      {createInvestmentLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Создание...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Создать депозит
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
    </AdminLayout>
  );
}