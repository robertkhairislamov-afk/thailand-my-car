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
import { useLanguage } from '../../contexts/LanguageContext';

const IS_TESTNET = import.meta.env.VITE_BSC_TESTNET === 'true';
const NETWORK: 'mainnet' | 'testnet' = IS_TESTNET ? 'testnet' : 'mainnet';

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
  const { t, language } = useLanguage();
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
        setError('wallet_not_connected');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/profile?network=${NETWORK}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid - clear it and show reconnect message
        localStorage.removeItem('auth_token');
        setError('session_expired');
        setLoading(false);
        return;
      }

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
      setError('load_failed');
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
      const response = await api.requestWithdrawal(withdrawalModal.id, walletAddress || undefined);
      if (response.data?.success) {
        setSuccess(t('profile.withdrawalSent'));
        setWithdrawalModal(null);
        fetchInvestments(); // Refresh investments
      } else {
        setError(response.error || t('profile.withdrawalError'));
      }
    } catch (err) {
      setError(t('profile.withdrawalError'));
    } finally {
      setWithdrawing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: t('profile.statusPending'),
      pending_confirmation: t('profile.statusPendingConfirm'),
      active: t('profile.statusActive'),
      withdrawal_requested: t('profile.statusWithdrawalRequested'),
      completed: t('profile.statusCompleted'),
      cancelled: t('profile.statusCancelled')
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
      setSuccess(t('profile.updateSuccess'));

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
          <h2 className="text-2xl font-bold mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{t('profile.connectWallet')}</h2>
          <p style={{ color: isDark ? 'rgba(255,250,240,0.7)' : 'rgba(20,60,80,0.7)' }}>{t('profile.connectWalletDesc')}</p>
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
          <span>{t('profile.back')}</span>
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
                {formData.name || t('profile.yourProfile')}
              </h1>
              <p className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                <Wallet className="h-4 w-4" />
                {formatAddress(walletAddress)}
              </p>
              {profile && (
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {t('profile.memberSince')} {formatDate(profile.createdAt)}
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
              <p className="text-sm" style={{ color: isDark ? 'rgba(255,250,240,0.6)' : 'rgba(20,60,80,0.6)' }}>{t('profile.totalInvested')}</p>
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
              <p className="text-sm" style={{ color: isDark ? 'rgba(255,250,240,0.6)' : 'rgba(20,60,80,0.6)' }}>{t('profile.investments')}</p>
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
              <p className="text-sm" style={{ color: isDark ? 'rgba(255,250,240,0.6)' : 'rgba(20,60,80,0.6)' }}>{t('profile.activeInvestments')}</p>
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
              <p className="text-sm" style={{ color: isDark ? 'rgba(255,250,240,0.6)' : 'rgba(20,60,80,0.6)' }}>{t('profile.inBaht')}</p>
              <p className="text-xl font-bold" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>฿{stats.totalInvestedBaht.toLocaleString()}</p>
            </div>
          </motion.div>
        )}

        {/* Notifications */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl mb-6"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                {error === 'session_expired' && (
                  <>
                    <p className="font-semibold mb-1">{t('profile.sessionExpiredTitle')}</p>
                    <p className="text-sm opacity-80">
                      {t('profile.sessionExpiredDesc')}
                    </p>
                    <ol className="text-sm opacity-80 mt-2 list-decimal list-inside space-y-1">
                      <li>{t('profile.sessionExpiredStep1')}</li>
                      <li>{t('profile.sessionExpiredStep2')}</li>
                      <li>{t('profile.sessionExpiredStep3')}</li>
                    </ol>
                  </>
                )}
                {error === 'wallet_not_connected' && (
                  <>
                    <p className="font-semibold mb-1">{t('profile.walletNotConnectedTitle')}</p>
                    <p className="text-sm opacity-80">
                      {t('profile.walletNotConnectedDesc')}
                    </p>
                  </>
                )}
                {error === 'load_failed' && (
                  <>
                    <p className="font-semibold mb-1">{t('profile.loadFailedTitle')}</p>
                    <p className="text-sm opacity-80">
                      {t('profile.loadFailedDesc')}
                    </p>
                  </>
                )}
                {!['session_expired', 'wallet_not_connected', 'load_failed'].includes(error) && (
                  <p>{error}</p>
                )}
              </div>
            </div>
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
          <h2 className="text-xl font-bold mb-6" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>{t('profile.personalInfo')}</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,250,240,0.7)' : 'rgba(20,60,80,0.7)' }}>
                <User className="h-4 w-4 inline mr-2" />
                {t('profile.name')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('profile.namePlaceholder')}
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
                {t('profile.bio')}
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder={t('profile.bioPlaceholder')}
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
                  {t('profile.saving')}
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {t('profile.saveProfile')}
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
