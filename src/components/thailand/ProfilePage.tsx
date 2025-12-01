import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Send, MessageCircle,
  Instagram, Twitter, Facebook, Wallet,
  Save, Loader2, CheckCircle, AlertCircle,
  TrendingUp, DollarSign, Clock, ChevronLeft
} from 'lucide-react';

interface ProfilePageProps {
  walletAddress: string | null;
  onBack: () => void;
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

export function ProfilePage({ walletAddress, onBack }: ProfilePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-500">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-6 mb-6 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {formData.name || 'Your Profile'}
              </h1>
              <p className="text-teal-100 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                {formatAddress(walletAddress)}
              </p>
              {profile && (
                <p className="text-teal-200 text-sm mt-1">
                  Member since {formatDate(profile.createdAt)}
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
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <DollarSign className="h-6 w-6 text-teal-400 mb-2" />
              <p className="text-gray-400 text-sm">Total Invested</p>
              <p className="text-xl font-bold text-white">${stats.totalInvestedUsdt.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <TrendingUp className="h-6 w-6 text-green-400 mb-2" />
              <p className="text-gray-400 text-sm">Investments</p>
              <p className="text-xl font-bold text-white">{stats.totalInvestments}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <Clock className="h-6 w-6 text-yellow-400 mb-2" />
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-xl font-bold text-white">{stats.activeInvestments}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <DollarSign className="h-6 w-6 text-blue-400 mb-2" />
              <p className="text-gray-400 text-sm">In Baht</p>
              <p className="text-xl font-bold text-white">฿{stats.totalInvestedBaht.toLocaleString()}</p>
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
          className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg"
        >
          <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Telegram */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                <Send className="h-4 w-4 inline mr-2" />
                Telegram
              </label>
              <input
                type="text"
                name="telegram"
                value={formData.telegram}
                onChange={handleChange}
                placeholder="@username"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                <MessageCircle className="h-4 w-4 inline mr-2" />
                WhatsApp
              </label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+7 999 123 4567"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                <Instagram className="h-4 w-4 inline mr-2" />
                Instagram
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@username"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Twitter */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                <Twitter className="h-4 w-4 inline mr-2" />
                Twitter / X
              </label>
              <input
                type="text"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="@username"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Facebook */}
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-2">
                <Facebook className="h-4 w-4 inline mr-2" />
                Facebook
              </label>
              <input
                type="text"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="facebook.com/username"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-2">
                About You
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
