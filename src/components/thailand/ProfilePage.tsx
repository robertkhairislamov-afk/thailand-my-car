import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Send, MessageCircle,
  Instagram, Twitter, Facebook, Wallet,
  Save, Loader2, CheckCircle, AlertCircle,
  TrendingUp, DollarSign, Clock, ChevronLeft,
  Percent, ArrowDownCircle, Lock, Unlock, X
} from 'lucide-react';
import { api } from '../../services/api';

interface ProfilePageProps {
  walletAddress: string | null;
  onBack: () => void;
  isDark?: boolean;
}

interface Profile {
  id: string;
  walletAddress: string;
  email: string | null;
  name: string | null;
  telegram: string | null;
  whatsapp: string | null;
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  bio: string | null;
  createdAt: string;
}

interface Stats {
  totalInvestments: number;
  totalInvestedUsdt: number;
  totalInvestedBaht: number;
  activeInvestments: number;
}

interface Investment {
  id: string;
  amount_usdt: number;
  amount_baht: number;
  status: string;
  invested_at: string;
  tier_type: string;
  tier_name: string;
  staking_earned: number;
  total_earnings: number;
  pending_earnings: number;
  monthly_rate: number;
  months_passed: number;
  months_until_unlock: number;
  is_unlocked: boolean;
  unlock_date: string;
  withdrawal_amount: number;
  early_fee: number;
}

export function ProfilePage({ walletAddress, onBack, isDark = true }: ProfilePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Withdrawal modal state
  const [withdrawalModal, setWithdrawalModal] = useState<Investment | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telegram: '',
    whatsapp: '',
    instagram: '',
    twitter: '',
    facebook: '',
    bio: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    if (walletAddress) {
      fetchProfile();
      fetchInvestments();
    }
  }, [walletAddress]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setError('Please connect your wallet first');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setStats(data.stats);

      setFormData({
        name: data.profile.name || '',
        email: data.profile.email || '',
        telegram: data.profile.telegram || '',
        whatsapp: data.profile.whatsapp || '',
        instagram: data.profile.instagram || '',
        twitter: data.profile.twitter || '',
        facebook: data.profile.facebook || '',
        bio: data.profile.bio || ''
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestments = async () => {
    try {
      const response = await api.getMyInvestments();
      if (response.data) {
        setInvestments(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch investments:', err);
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!withdrawalModal) return;

    setWithdrawing(true);
    try {
      const response = await api.requestWithdrawal(withdrawalModal.id);
      if (response.data?.success) {
        setSuccess('Запрос на вывод отправлен! Администратор свяжется с вами.');
        setWithdrawalModal(null);
        fetchInvestments(); // Refresh investments
      } else {
        setError(response.error || 'Ошибка при отправке запроса');
      }
    } catch (err) {
      setError('Ошибка при отправке запроса');
    } finally {
      setWithdrawing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      pending_confirmation: 'На проверке',
      active: 'Активна',
      withdrawal_requested: 'Запрос на вывод',
      completed: 'Завершена',
      cancelled: 'Отменена'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#FFC850',
      pending_confirmation: '#FFC850',
      active: '#28B48C',
      withdrawal_requested: '#009696',
      completed: '#666',
      cancelled: '#ef4444'
    };
    return colors[status] || '#666';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setSuccess('Profile updated successfully!');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Wallet className="h-16 w-16 mx-auto mb-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Connect Your Wallet</h2>
          <p style={{ color: isDark ? 'rgba(255,250,240,0.7)' : 'rgba(20,60,80,0.7)' }}>Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#009696' }} />
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 transition-colors hover:opacity-80"
          style={{ color: isDark ? '#FFFAF0' : '#143C50' }}
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Назад</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 mb-6 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #009696 0%, #28B48C 100%)' }}
        >
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {formData.name || 'Ваш профиль'}
              </h1>
              <p className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                <Wallet className="h-4 w-4" />
                {formatAddress(walletAddress)}
              </p>
              {profile && (
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Участник с {formatDate(profile.createdAt)}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <div
              className="rounded-xl p-4 border"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                borderColor: isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'
              }}
            >
              <DollarSign className="h-6 w-6 mb-2" style={{ color: '#009696' }} />
              <p className="text-sm" style={{ color: isDark ? 'rgba(255,250,240,0.6)' : 'rgba(20,60,80,0.6)' }}>Инвестировано</p>
              <p className="text-xl font-bold" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>${stats.totalInvestedUsdt.toLocaleString()}</p>
            </div>
            <div
              className="rounded-xl p-4 border"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                borderColor: isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'
              }}
            >
              <TrendingUp className="h-6 w-6 mb-2" style={{ color: '#28B48C' }} />
              <p className="text-sm" style={{ color: isDark ? 'rgba(255,250,240,0.6)' : 'rgba(20,60,80,0.6)' }}>Инвестиций</p>
              <p className="text-xl font-bold" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{stats.totalInvestments}</p>
            </div>
            <div
              className="rounded-xl p-4 border"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                borderColor: isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'
              }}
            >
              <Clock className="h-6 w-6 mb-2" style={{ color: '#FFC850' }} />
              <p className="text-sm" style={{ color: isDark ? 'rgba(255,250,240,0.6)' : 'rgba(20,60,80,0.6)' }}>Активных</p>
              <p className="text-xl font-bold" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{stats.activeInvestments}</p>
            </div>
            <div
              className="rounded-xl p-4 border"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                borderColor: isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'
              }}
            >
              <DollarSign className="h-6 w-6 mb-2" style={{ color: '#009696' }} />
              <p className="text-sm" style={{ color: isDark ? 'rgba(255,250,240,0.6)' : 'rgba(20,60,80,0.6)' }}>В батах</p>
              <p className="text-xl font-bold" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>฿{stats.totalInvestedBaht.toLocaleString()}</p>
            </div>
          </motion.div>
        )}

        {/* Notifications */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
          >
            <AlertCircle className="h-5 w-5" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            {success}
          </motion.div>
        )}

        {/* Profile Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 border shadow-lg"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
            borderColor: isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'
          }}
        >
          <h2 className="text-xl font-bold mb-6" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Личная информация</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,250,240,0.7)' : 'rgba(20,60,80,0.7)' }}>
                <User className="h-4 w-4 inline mr-2" />
                Имя
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Введите ваше имя"
                className="w-full rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#009696]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,250,240,0.7)' : 'rgba(20,60,80,0.7)' }}>
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#009696]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              />
            </div>

            {/* Telegram */}
            <div>
              <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,250,240,0.7)' : 'rgba(20,60,80,0.7)' }}>
                <Send className="h-4 w-4 inline mr-2" />
                Telegram
              </label>
              <input
                type="text"
                name="telegram"
                value={formData.telegram}
                onChange={handleChange}
                placeholder="@username"
                className="w-full rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#009696]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,250,240,0.7)' : 'rgba(20,60,80,0.7)' }}>
                <MessageCircle className="h-4 w-4 inline mr-2" />
                WhatsApp
              </label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+7 999 123 4567"
                className="w-full rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#009696]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,250,240,0.7)' : 'rgba(20,60,80,0.7)' }}>
                <Instagram className="h-4 w-4 inline mr-2" />
                Instagram
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@username"
                className="w-full rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#009696]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              />
            </div>

            {/* Twitter */}
            <div>
              <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,250,240,0.7)' : 'rgba(20,60,80,0.7)' }}>
                <Twitter className="h-4 w-4 inline mr-2" />
                Twitter / X
              </label>
              <input
                type="text"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="@username"
                className="w-full rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#009696]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              />
            </div>

            {/* Facebook */}
            <div className="md:col-span-2">
              <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,250,240,0.7)' : 'rgba(20,60,80,0.7)' }}>
                <Facebook className="h-4 w-4 inline mr-2" />
                Facebook
              </label>
              <input
                type="text"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="facebook.com/username"
                className="w-full rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#009696]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,250,240,0.7)' : 'rgba(20,60,80,0.7)' }}>
                О себе
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Расскажите о себе..."
                rows={3}
                className="w-full rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#009696] resize-none"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#FFFAF0' : '#143C50'
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={saving}
              className="w-full font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #009696 0%, #28B48C 100%)',
                color: '#FFFAF0'
              }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Сохранить профиль
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
