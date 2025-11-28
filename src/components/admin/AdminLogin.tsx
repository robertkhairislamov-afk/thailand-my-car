import { useState } from 'react';
import { Loader2, AlertCircle, Car } from 'lucide-react';
import { api } from '../../services/api';

interface AdminLoginProps {
  onLogin: (admin: any) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await api.adminLogin(email, password);

    setLoading(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    if (response.data) {
      api.setToken(response.data.token);
      localStorage.setItem('admin_data', JSON.stringify(response.data.admin));
      onLogin(response.data.admin);
    }
  };

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex items-center justify-center px-4 py-6"
      style={{
        background: 'linear-gradient(135deg, #143C50 0%, #0a2030 100%)'
      }}
    >
      {/* Login Card */}
      <div
        className="w-full max-w-sm mx-auto rounded-2xl p-8 shadow-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          maxWidth: '380px'
        }}
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div
            className="inline-flex p-3 rounded-xl mb-4"
            style={{
              background: 'rgba(40, 180, 140, 0.15)',
              border: '1px solid rgba(40, 180, 140, 0.2)'
            }}
          >
            <Car className="w-8 h-8" style={{ color: '#28B48C' }} />
          </div>
          <h1
            className="text-xl mb-1"
            style={{ color: '#FFFAF0', fontWeight: 600 }}
          >
            Thailand My Car
          </h1>
          <p
            className="text-sm"
            style={{ color: 'rgba(255, 250, 240, 0.5)' }}
          >
            Панель администратора
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: 'rgba(255, 250, 240, 0.7)' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-lg text-sm transition-all duration-200 focus:outline-none"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFFAF0'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(0, 150, 150, 0.5)';
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.background = 'rgba(255, 255, 255, 0.06)';
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: 'rgba(255, 250, 240, 0.7)' }}
            >
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-lg text-sm transition-all duration-200 focus:outline-none"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFFAF0'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(0, 150, 150, 0.5)';
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.background = 'rgba(255, 255, 255, 0.06)';
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2.5 p-3 rounded-lg"
              style={{
                background: 'rgba(231, 76, 60, 0.1)',
                border: '1px solid rgba(231, 76, 60, 0.2)'
              }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#E74C3C' }} />
              <span className="text-sm" style={{ color: 'rgba(255, 250, 240, 0.9)' }}>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: '#28B48C',
              color: '#FFFAF0',
              fontWeight: 500
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Вход...</span>
              </>
            ) : (
              'Войти'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs" style={{ color: 'rgba(255, 250, 240, 0.3)' }}>
            © 2024 Thailand My Car
          </p>
        </div>
      </div>
    </div>
  );
}
