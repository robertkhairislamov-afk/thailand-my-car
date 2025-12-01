import { useState } from 'react';
import { X, Send, MessageCircle, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  walletAddress?: string | null;
}

export function SupportModal({ isOpen, onClose, isDark, walletAddress }: SupportModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.sendContactMessage({
        name,
        email,
        subject: subject || 'Обращение в поддержку',
        message: walletAddress ? `[Wallet: ${walletAddress}]\n\n${message}` : message
      });

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess(true);
        // Reset form after 3 seconds and close
        setTimeout(() => {
          setName('');
          setEmail('');
          setSubject('');
          setMessage('');
          setSuccess(false);
          onClose();
        }, 3000);
      }
    } catch (err) {
      setError('Ошибка отправки сообщения');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(26, 78, 100, 0.95) 0%, rgba(20, 60, 80, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 250, 240, 0.95) 100%)',
          borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #009696 0%, #28B48C 100%)' }}>
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
              Поддержка
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all hover:scale-110"
            style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
          >
            <X className="w-5 h-5" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(40, 180, 140, 0.2)' }}
              >
                <CheckCircle className="w-8 h-8" style={{ color: '#28B48C' }} />
              </div>
              <h3 className="text-xl mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                Сообщение отправлено!
              </h3>
              <p className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                Мы ответим вам в ближайшее время
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                >
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.8 }}>
                  Ваше имя *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'white',
                    borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
                    color: isDark ? '#FFFAF0' : '#143C50'
                  }}
                  placeholder="Как к вам обращаться?"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.8 }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'white',
                    borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
                    color: isDark ? '#FFFAF0' : '#143C50'
                  }}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.8 }}>
                  Тема
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'white',
                    borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
                    color: isDark ? '#FFFAF0' : '#143C50'
                  }}
                >
                  <option value="">Выберите тему</option>
                  <option value="Вопрос по инвестициям">Вопрос по инвестициям</option>
                  <option value="Техническая проблема">Техническая проблема</option>
                  <option value="Вопрос по выводу средств">Вопрос по выводу средств</option>
                  <option value="Предложение о сотрудничестве">Предложение о сотрудничестве</option>
                  <option value="Другое">Другое</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', opacity: 0.8 }}>
                  Сообщение *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 resize-none"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'white',
                    borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)',
                    color: isDark ? '#FFFAF0' : '#143C50'
                  }}
                  placeholder="Опишите ваш вопрос или проблему..."
                />
              </div>

              {walletAddress && (
                <div className="text-xs opacity-60 flex items-center gap-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  <span>Кошелек:</span>
                  <code>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</code>
                </div>
              )}

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
                    Отправка...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Отправить
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
