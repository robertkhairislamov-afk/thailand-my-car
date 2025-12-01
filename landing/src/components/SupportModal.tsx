import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageCircle, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Rate limiting: store last submission time
const RATE_LIMIT_KEY = 'support_last_submit';
const RATE_LIMIT_COOLDOWN = 60000; // 1 minute between submissions
const MIN_FORM_TIME = 3000; // 3 seconds minimum on form (anti-bot)

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Honeypot field - bots fill this
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formOpenTime = useRef<number>(0);

  // Track when form was opened
  useEffect(() => {
    if (isOpen) {
      formOpenTime.current = Date.now();
    }
  }, [isOpen]);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'support.title': { ru: 'Поддержка', en: 'Support' },
      'support.name': { ru: 'Ваше имя', en: 'Your name' },
      'support.namePlaceholder': { ru: 'Как к вам обращаться?', en: 'How should we call you?' },
      'support.email': { ru: 'Email', en: 'Email' },
      'support.subject': { ru: 'Тема', en: 'Subject' },
      'support.selectSubject': { ru: 'Выберите тему', en: 'Select a subject' },
      'support.subjectGeneral': { ru: 'Общий вопрос', en: 'General question' },
      'support.subjectPartnership': { ru: 'Предложение о сотрудничестве', en: 'Partnership proposal' },
      'support.subjectTechnical': { ru: 'Техническая проблема', en: 'Technical issue' },
      'support.subjectOther': { ru: 'Другое', en: 'Other' },
      'support.message': { ru: 'Сообщение', en: 'Message' },
      'support.messagePlaceholder': { ru: 'Опишите ваш вопрос или предложение...', en: 'Describe your question or suggestion...' },
      'support.send': { ru: 'Отправить', en: 'Send' },
      'support.sending': { ru: 'Отправка...', en: 'Sending...' },
      'support.success': { ru: 'Сообщение отправлено!', en: 'Message sent!' },
      'support.successDesc': { ru: 'Мы ответим вам в ближайшее время', en: 'We will reply to you soon' },
      'support.errorNetwork': { ru: 'Ошибка сети. Попробуйте позже.', en: 'Network error. Try again later.' },
      'support.errorRateLimit': { ru: 'Пожалуйста, подождите минуту перед повторной отправкой', en: 'Please wait a minute before sending again' },
      'support.errorBot': { ru: 'Ошибка отправки', en: 'Submission error' },
    };
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  const checkRateLimit = (): boolean => {
    const lastSubmit = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastSubmit) {
      const timePassed = Date.now() - parseInt(lastSubmit, 10);
      if (timePassed < RATE_LIMIT_COOLDOWN) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Anti-spam check 1: Honeypot (bots fill hidden fields)
    if (honeypot) {
      console.log('Bot detected: honeypot filled');
      setError(t('support.errorBot'));
      return;
    }

    // Anti-spam check 2: Minimum time on form
    const timeOnForm = Date.now() - formOpenTime.current;
    if (timeOnForm < MIN_FORM_TIME) {
      console.log('Bot detected: form submitted too fast');
      setError(t('support.errorBot'));
      return;
    }

    // Anti-spam check 3: Rate limiting
    if (!checkRateLimit()) {
      setError(t('support.errorRateLimit'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // API URL - adjust based on environment
      const apiUrl = import.meta.env.VITE_API_URL || '';

      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject: subject || 'Обращение в поддержку',
          message: `[Лендинг Saturway]\n\n${message}`,
          // Anti-spam metadata
          _formStartTime: formOpenTime.current,
          _source: 'landing',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error');
      }

      // Save submission time for rate limiting
      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());

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
    } catch (err) {
      console.error('Contact error:', err);
      setError(t('support.errorNetwork'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {t('support.title')}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl transition-all hover:bg-muted"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-green-500/20">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl mb-2 font-semibold text-foreground">
                    {t('support.success')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('support.successDesc')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  )}

                  {/* Honeypot field - hidden from users, bots fill it */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">
                      {t('support.name')} *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      minLength={2}
                      maxLength={100}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
                      placeholder={t('support.namePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">
                      {t('support.email')} *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={255}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">
                      {t('support.subject')}
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
                    >
                      <option value="">{t('support.selectSubject')}</option>
                      <option value="Общий вопрос">{t('support.subjectGeneral')}</option>
                      <option value="Предложение о сотрудничестве">{t('support.subjectPartnership')}</option>
                      <option value="Техническая проблема">{t('support.subjectTechnical')}</option>
                      <option value="Другое">{t('support.subjectOther')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">
                      {t('support.message')} *
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 resize-none"
                      placeholder={t('support.messagePlaceholder')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-semibold transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('support.sending')}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {t('support.send')}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
