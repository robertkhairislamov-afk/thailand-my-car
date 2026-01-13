import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Minimize2, User, Bot, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import agentAvatar from '../assets/e1e085ae75a2749b061ca9a2d4be120e5d13174a.webp';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  read?: boolean;
}

interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  messages: Message[];
  status: 'active' | 'closed';
  createdAt: Date;
  lastMessageAt: Date;
}

interface ChatWidgetProps {
  isDark: boolean;
}

export function ChatWidget({ isDark }: ChatWidgetProps) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [waitingForAdmin, setWaitingForAdmin] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<string | null>(null);
  const [isChatClosed, setIsChatClosed] = useState(false);
  const [isClosingAnimation, setIsClosingAnimation] = useState(false);

  // Анимация закрытия чата
  useEffect(() => {
    if (isChatClosed && !isClosingAnimation) {
      // Ждём немного чтобы пользователь увидел сообщение
      const timer = setTimeout(() => {
        setIsClosingAnimation(true);
        
        // После анимации сбрасываем чат
        setTimeout(() => {
          setIsOpen(false);
          setIsClosingAnimation(false);
          setIsChatClosed(false);
          setMessages([]);
          setSessionId("");
          setIsRegistered(false);
          setUserName("");
          setUserEmail("");
          setWaitingForAdmin(false);
          setUnreadCount(0);
          localStorage.removeItem("chatSession");
        }, 600);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isChatClosed, isClosingAnimation]);
  const [profanityError, setProfanityError] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Get wallet from localStorage
  const getWalletAddress = (): string | undefined => {
    try {
      const wallet = localStorage.getItem("wallet_address");
      return wallet || undefined;
    } catch {
      return undefined;
    }
  };

  // Load chat session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('chatSession');
    if (savedSession) {
      const session: ChatSession = JSON.parse(savedSession);
      setMessages(session.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
      setUserName(session.userName);
      setUserEmail(session.userEmail || '');
      // Only use session ID if it's a valid UUID format (from backend)
      if (session.id && session.id.includes('-') && session.id.length === 36) {
        setSessionId(session.id);
      }
      setIsRegistered(true);

      // Calculate unread messages from agent
      const unread = session.messages.filter(m => m.sender === 'agent' && !m.read).length;
      setUnreadCount(unread);
    }
    // Don't generate session ID here - it will come from backend on registration
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
      const updatedMessages = messages.map(m => ({ ...m, read: true }));
      setMessages(updatedMessages);
      saveSession(updatedMessages);
    }
  }, [isOpen, isMinimized]);

  // Poll for admin messages when waiting
  const pollForMessages = useCallback(async () => {
    // Проверяем статус и сообщения всегда когда есть активная сессия
    if (!sessionId) return;

    try {
      const result = await api.getChatMessages(sessionId, lastMessageTime || undefined);
      
      // Проверяем статус сессии
      if (result.data?.sessionStatus === "closed") {
        setIsChatClosed(true);
        setWaitingForAdmin(false);
      }
      if (result.data?.messages && result.data.messages.length > 0) {
        const newAdminMsgs = result.data.messages.filter(
          (m: any) => (m.sender === 'admin' || m.sender === 'system') && !messages.some(existing => existing.id === m.id)
        );

        if (newAdminMsgs.length > 0) {
          const formattedMsgs: Message[] = newAdminMsgs.map((m: any) => ({
            id: m.id,
            text: m.message,
            sender: 'agent' as const,
            timestamp: new Date(m.created_at),
            read: isOpen && !isMinimized
          }));

          const updatedMessages = [...messages, ...formattedMsgs];
          setMessages(updatedMessages);
          saveSession(updatedMessages);
          setLastMessageTime(newAdminMsgs[newAdminMsgs.length - 1].created_at);

          if (!isOpen || isMinimized) {
            setUnreadCount(prev => prev + newAdminMsgs.length);
          }
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, [sessionId, waitingForAdmin, lastMessageTime, messages, isOpen, isMinimized]);

  // Start/stop polling - ТОЛЬКО когда чат открыт!
  useEffect(() => {
    // ✅ ОПТИМИЗАЦИЯ: Polling ТОЛЬКО когда чат открыт
    // Экономия CPU/Network когда пользователь не использует чат
    if (sessionId && isRegistered && isOpen) {
      const interval = waitingForAdmin ? 5000 : 15000; // Чаще когда ждём админа
      pollingRef.current = setInterval(pollForMessages, interval);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [waitingForAdmin, sessionId, isRegistered, isOpen, pollForMessages]);

  // Save session to localStorage and sync with admin
  const saveSession = (msgs: Message[]) => {
    const session: ChatSession = {
      id: sessionId,
      userId: `user_${sessionId}`,
      userName: userName || 'Guest',
      userEmail: userEmail,
      messages: msgs,
      status: 'active',
      createdAt: new Date(msgs[0]?.timestamp || Date.now()),
      lastMessageAt: new Date(msgs[msgs.length - 1]?.timestamp || Date.now())
    };

    localStorage.setItem('chatSession', JSON.stringify(session));
    
    // Save to admin messages list
    const adminMessages = JSON.parse(localStorage.getItem('adminChatMessages') || '[]');
    const existingIndex = adminMessages.findIndex((s: ChatSession) => s.id === sessionId);
    
    if (existingIndex >= 0) {
      adminMessages[existingIndex] = session;
    } else {
      adminMessages.push(session);
    }
    
    localStorage.setItem('adminChatMessages', JSON.stringify(adminMessages));
  };

  // Helper: pick random from array
  const randomPick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // Helper: normalize text (remove extra spaces, fix common typos)
  const normalizeText = (text: string): string => {
    return text.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
  };

  // Helper: check if text matches patterns (with typo tolerance)
  const matchesAny = (text: string, patterns: string[]): boolean => {
    const normalized = normalizeText(text);
    return patterns.some(p => {
      if (normalized.includes(p)) return true;
      const words = normalized.split(' ');
      return words.some(word => {
        if (Math.abs(word.length - p.length) > 2) return false;
        let diff = 0;
        for (let i = 0; i < Math.min(word.length, p.length); i++) {
          if (word[i] !== p[i]) diff++;
        }
        return (diff + Math.abs(word.length - p.length)) <= 2 && p.length >= 3;
      });
    });
  };

  // Filter: offensive language
  const isOffensive = (text: string): boolean => {
    const bad = ['дур','идиот','тупой','тупая','дебил','лох','мудак','сука','бля','хуй','пизд','еба','нахуй','нахер','похуй','ублюд','гавно','говно','мразь','чмо','урод','козел','скам','scam','fuck','shit','bitch','asshole','idiot','stupid'];
    const n = normalizeText(text);
    return bad.some(p => n.includes(p));
  };

  // AI Agent responses
  const getAgentResponse = (userMessage: string): string => {
    const lowerMsg = normalizeText(userMessage);

    // Check offensive language first
    if (isOffensive(userMessage)) {
      return randomPick([
        'Давайте общаться уважительно 🙏 Чем могу помочь по существу?',
        'Я здесь, чтобы помочь! Есть вопросы об инвестициях? 😊',
        'Предлагаю начать сначала 🔄 Какой у вас вопрос о проекте?'
      ]);
    }

    // Greeting (with typo tolerance)
    if (matchesAny(lowerMsg, ['привет','привте','прив','здравствуй','здарова','здорова','добрый','доброе','hello','hi','hey','хай','хей'])) {
      return randomPick([
        `Привет, ${userName}! 👋 Рада видеть! Чем могу помочь?`,
        `Здравствуйте, ${userName}! 😊 Я Мира, ваш помощник. Какие вопросы?`,
        `Привет! 🌟 Добро пожаловать! О чём хотите узнать?`,
        `Хей, ${userName}! 👋 Как я могу помочь сегодня?`
      ]);
    }

    // How are you
    if (matchesAny(lowerMsg, ['как дела','как ты','как сама','как жизнь','как оно','что нового','как поживаешь','как делишки','чо как','шо там'])) {
      return randomPick([
        `Отлично! 😄 Помогаю инвесторам. А у тебя как?`,
        `Супер! 🚀 Много интересных вопросов сегодня. Чем помочь?`,
        `Прекрасно, ${userName}! ☀️ Готова к общению!`,
        `На позитиве! 🌈 Есть вопросы по инвестициям?`,
        `Бодрячком! 💪 Чем могу помочь?`,
        `Всё круто! 😎 Таиланд, солнце... Что интересует?`,
        `Хорошо! 🌴 А ты как? Интересуешься проектом?`
      ]);
    }

    // Who are you
    if (matchesAny(lowerMsg, ['кто ты','что ты','ты кто','ты бот','ты робот','ты человек','ты живая'])) {
      return randomPick([
        `Я Мира - AI-помощник Thailand My Car! 🤖 Знаю всё о проекте!`,
        `Меня зовут Мира 👩‍💼 Виртуальный консультант 24/7!`,
        `Я AI-ассистент 🌟 Отвечу на вопросы об инвестициях!`
      ]);
    }

    // Greeting original fallback
    if (lowerMsg.match(/привет|здравствуй|hello|hi/)) {
      return `Привет, ${userName}! 👋 Меня зовут Мира. С удовольствием отвечу на вопросы! 😊`;
    }

    // Investment questions
    if (lowerMsg.match(/инвестиц|invest|вложить|сколько/)) {
      return 'У нас есть два инвестиционных тира:\n\n💰 Tier 1: $12,400 - фиксированный доход +20% через 6 месяцев\n💎 Tier 2: $12,400 - долгосрочное участие с ежемесячными дивидендами\n\nКакой вариант вас интересует?';
    }

    // ROI questions
    if (lowerMsg.match(/roi|доход|прибыль|процент/)) {
      return 'Наша доходность:\n\n📊 Tier 1: +20% фиксированный ROI за 6 месяцев\n📈 Tier 2: 5-8% ежемесячно от прибыли рентала\n\nВсе выплаты в USDT/USDC на ваш кошелёк!';
    }

    // Crypto/payment questions
    if (lowerMsg.match(/крипт|usdt|usdc|кошелек|wallet|metamask|оплат/)) {
      return 'Мы принимаем:\n\n🪙 USDT и USDC\n🔗 Сети: BSC и Polygon (низкие комиссии)\n💳 MetaMask, Trust Wallet, любые Web3 кошельки\n\nПереводите средства напрямую на корпоративный кошелек!';
    }

    // Risk questions
    if (lowerMsg.match(/риск|безопасн|гаранти|надежн/)) {
      return '🔒 Безопасность инвестиций:\n\n✅ Юридическая компания в Таиланде\n✅ Реальный автопарк Toyota\n✅ Прозрачная отчётность\n✅ Страхование автомобилей\n\nНо помните: любые инвестиции несут риски. Инвестируйте ответственно!';
    }

    // Timeline questions
    if (lowerMsg.match(/когда|срок|время|дата|получ/)) {
      return '⏰ Сроки:\n\n📅 Tier 1: выплата через 6 месяцев\n📅 Tier 2: ежемесячные выплаты с 1 числа\n🚀 Сбор средств: осталось 68 дней\n\nНачинайте получать доход уже в следующем месяце (Tier 2)!';
    }

    // Contact/support
    if (lowerMsg.match(/контакт|связ|телефон|email|менеджер/)) {
      return '📞 Связаться с нами:\n\n💬 Telegram: @thailandmycar\n📱 WhatsApp: +66 XX XXX XXXX\n📧 Email: invest@thailandmycar.com\n\nИли продолжайте писать здесь - я всегда на связи! 🤖';
    }

    // Documents
    if (lowerMsg.match(/документ|договор|contract|whitepaper|legal/)) {
      return '📄 Документы доступны в личном кабинете после регистрации:\n\n📋 Whitepaper проекта\n📜 Инвестиционный договор\n🏢 Регистрация компании\n📊 Финансовые отчёты\n\nХотите получить доступ?';
    }

    // Minimum investment
    if (lowerMsg.match(/минимум|minimum|мин\.|от какой суммы/)) {
      return '💵 Минимальная сумма инвестиции: $12,400 (฿404,600)\n\nЭто покрывает стоимость одного автомобиля Toyota в нашем парке.';
    }

    // Cars/fleet
    if (lowerMsg.match(/машин|автомобил|toyota|fleet|парк/)) {
      return '🚗 Наш автопарк:\n\n🔹 Toyota Fortuner (премиум SUV)\n🔹 Toyota Camry (бизнес седан)\n🔹 Toyota Altis (комфорт класс)\n\nВсе автомобили 2023-2024 года, страховка Type 1 (полная), обслуживание официальное!';
    }

    // Location
    if (lowerMsg.match(/где|location|паттай|таиланд|thailand/)) {
      return '📍 Локация: Паттайя, Таиланд 🇹🇭\n\n🏖️ Популярный туристический город\n✈️ 2 часа от Бангкока\n📈 Высокий спрос на рентал круглый год\n🌴 Идеальное место для бизнеса!';
    }

    // Thanks
    if (matchesAny(lowerMsg, ['спасибо','благодар','thanks','спс','сяб','thx'])) {
      return randomPick([
        'Всегда пожалуйста! 😊 Обращайтесь!',
        'Рада помочь! 🌟 Ещё вопросы?',
        'Не за что! 💚 Удачных инвестиций!',
        'На здоровье! 🙏 Если что - я тут!',
        'Обращайтесь! 👋 Всегда рада помочь!'
      ]);
    }

    // Bye
    if (matchesAny(lowerMsg, ['пока','до свидания','bye','бай','прощай','увидимся','до связи'])) {
      return randomPick([
        `До свидания, ${userName}! 👋 Возвращайтесь!`,
        'Пока! 🌟 Буду рада пообщаться снова!',
        'Всего доброго! 💚 Удачи!',
        `До связи, ${userName}! 🚀`
      ]);
    }

    // Yes/agree
    if (matchesAny(lowerMsg, ['да','ага','угу','yes','конечно','давай','хочу','интересно','расскажи'])) {
      return randomPick([
        'Отлично! 🎯 Что именно хотите узнать подробнее?',
        'Супер! Какой аспект интересует - доходность, риски или процесс?',
        'Здорово! 🚀 Спрашивайте - отвечу на всё!'
      ]);
    }

    // No
    if (matchesAny(lowerMsg, ['нет','неа','no','не надо','не хочу']) && lowerMsg.length < 15) {
      return randomPick([
        'Понял! Если передумаете - я здесь 😊',
        'Хорошо! Может, есть другие вопросы?',
        'Без проблем! Обращайтесь, если что 👋'
      ]);
    }

    // Default response
    return randomPick([
      'Интересный вопрос! 🤔 Позвольте соединить с менеджером. Как связаться?',
      'Хм, уточню! Оставьте email или Telegram - ответим в течение часа 📨',
      `${userName}, отличный вопрос! Для детального ответа лучше связаться с менеджером.`,
      'Спасибо за вопрос! Рекомендую раздел "О проекте" или могу позвать менеджера?',
      'Это требует детального ответа! 📋 Как с вами связаться?'
    ]);
  };

  const handleRegister = async () => {
    if (userName.trim()) {
      setIsRegistered(true);

      // Create session in backend
      try {
        const result = await api.createChatSession({
          userName: userName.trim(),
          userEmail: userEmail || undefined
        });

        if (result.data?.session) {
          setSessionId(result.data.session.id);
        }
      } catch (error) {
        console.error('Failed to create session:', error);
      }

      // Welcome message
      const welcomeMsg: Message = {
        id: `msg_${Date.now()}`,
        text: t('chat.welcomeMessage', { name: userName }),
        sender: 'agent',
        timestamp: new Date(),
        read: true
      };

      const newMessages = [welcomeMsg];
      setMessages(newMessages);
      saveSession(newMessages);

      setTimeout(() => inputRef.current?.focus(), 300);
    }
  };

  // Request admin/manager
  const handleRequestAdmin = async () => {
    if (!sessionId) return;

    try {
      await api.requestAdmin(sessionId);
      setWaitingForAdmin(true);

      const systemMsg: Message = {
        id: `msg_${Date.now()}`,
        text: t('chat.managerRequestSent'),
        sender: 'agent',
        timestamp: new Date(),
        read: true
      };

      const updatedMessages = [...messages, systemMsg];
      setMessages(updatedMessages);
      saveSession(updatedMessages);
    } catch (error) {
      console.error('Failed to request admin:', error);
    }
  };

  // End chat session
  const handleEndChat = () => {
    // Clear local state
    setMessages([]);
    setSessionId('');
    setIsRegistered(false);
    setUserName('');
    setUserEmail('');
    setWaitingForAdmin(false);
    setUnreadCount(0);

    // Clear localStorage
    localStorage.removeItem('chatSession');
    localStorage.removeItem('adminChatMessages');

    // Close chat window
    setIsOpen(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Clear profanity error
    setProfanityError(false);

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      read: true
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    const messageText = inputValue;
    setInputValue('');

    // Save user message to backend
    if (sessionId) {
      try {
        const result = await api.sendChatMessage({
          sessionId,
          sender: 'user',
          senderName: userName,
          message: messageText,
          userWallet: getWalletAddress()
        });
        // Check for profanity error
        if (result.error === "profanity_detected" || result.error?.includes("profanity")) {
        
        // Проверка на закрытый чат
        if (result.error === "chat_closed") {
          setIsChatClosed(true);
          return;
        }
          setMessages(messages);
          setProfanityError(true);
          setTimeout(() => setProfanityError(false), 5000);
          return;
        }
      } catch (error) {
        console.error('Failed to save message:', error);
      }
    }

    // If waiting for admin, don't generate AI response
    if (waitingForAdmin) {
      saveSession(newMessages);
      return;
    }

    // Show typing indicator
    setIsTyping(true);

    // Simulate agent response delay
    setTimeout(async () => {
      const agentResponse = getAgentResponse(messageText);
      const agentMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        text: agentResponse,
        sender: 'agent',
        timestamp: new Date(),
        read: isOpen && !isMinimized
      };

      const updatedMessages = [...newMessages, agentMsg];
      setMessages(updatedMessages);
      saveSession(updatedMessages);
      setIsTyping(false);

      // Save AI response to backend
      if (sessionId) {
        try {
          await api.sendChatMessage({
            sessionId,
            sender: 'agent',
            senderName: 'Мира',
            message: agentResponse
          });
        } catch (error) {
          console.error('Failed to save AI response:', error);
        }
      }

      if (!isOpen || isMinimized) {
        setUnreadCount(prev => prev + 1);
      }
    }, 1000 + Math.random() * 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isRegistered) {
        handleSendMessage();
      } else {
        handleRegister();
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={isClosingAnimation ? { opacity: 0, scale: 0.1, y: 100, x: 50 } : { 
              opacity: 1, 
              scale: isMinimized ? 0.95 : 1, 
              y: 0,
              height: isMinimized ? '60px' : 'min(600px, calc(100vh - 120px))'
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-20 right-0 w-[calc(100vw-32px)] sm:w-96 max-w-[384px] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(20,60,80,0.98) 0%, rgba(10,31,45,0.98) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
              border: `1px solid ${isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'}`,
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Header */}
            <div 
              className="px-4 py-3 flex items-center justify-between cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                color: '#FFFAF0'
              }}
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0">
                  <img 
                    src={agentAvatar} 
                    alt="Мира" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{t('chat.agentName')}</h3>
                  <p className="text-xs opacity-80">
                    {isTyping ? t('chat.typing') : t('chat.consultantOnline')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isRegistered && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(t('chat.endChatConfirm'))) {
                        handleEndChat();
                      }
                    }}
                    className="px-2 py-1 text-xs hover:bg-white/20 rounded transition-colors border border-white/30"
                    title={t('chat.endChat')}
                  >
                    {t('chat.end')}
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Registration Form */}
                {!isRegistered ? (
                  <div className="flex-1 p-6 flex flex-col justify-center">
                    <div className="text-center mb-6">
                      <div
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)' }}
                      >
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3
                        className="text-xl mb-2"
                        style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}
                      >
                        {t('chat.startChat')}
                      </h3>
                      <p className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                        {t('chat.introduceYourself')}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm mb-2 opacity-80" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          {t('chat.yourName')} *
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={t('chat.namePlaceholder')}
                          className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                          style={{
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            color: isDark ? '#FFFAF0' : '#143C50'
                          }}
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-sm mb-2 opacity-80" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          {t('chat.emailOptional')}
                        </label>
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                          style={{
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            color: isDark ? '#FFFAF0' : '#143C50'
                          }}
                        />
                      </div>

                      <button
                        onClick={handleRegister}
                        disabled={!userName.trim()}
                        className="w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                        style={{
                          background: userName.trim()
                            ? 'linear-gradient(135deg, #28B48C 0%, #009696 100%)'
                            : 'rgba(128,128,128,0.3)',
                          color: '#FFFAF0'
                        }}
                      >
                        {t('chat.startChat')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <div 
                      className="flex-1 p-4 overflow-y-auto"
                      style={{
                        maxHeight: '450px'
                      }}
                    >
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={isClosingAnimation ? { opacity: 0, scale: 0.1, y: 100, x: 50 } : { opacity: 1, y: 0 }}
                          className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            {message.sender === 'agent' ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-teal-500/30 flex-shrink-0">
                                <img 
                                  src={agentAvatar} 
                                  alt="Мира" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: 'linear-gradient(135deg, #FFC850 0%, #FF9800 100%)'
                                }}
                              >
                                <User className="w-5 h-5 text-white" />
                              </div>
                            )}

                            {/* Message bubble */}
                            <div>
                              <div
                                className="px-4 py-2 rounded-2xl"
                                style={{
                                  background: message.sender === 'agent'
                                    ? isDark ? 'rgba(0,150,150,0.15)' : 'rgba(0,150,150,0.1)'
                                    : 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                                  color: message.sender === 'agent'
                                    ? isDark ? '#FFFAF0' : '#143C50'
                                    : '#FFFAF0',
                                  borderRadius: message.sender === 'agent' ? '16px 16px 16px 4px' : '16px 16px 4px 16px'
                                }}
                              >
                                <p className="text-sm whitespace-pre-line">{message.text}</p>
                              </div>
                              <p className="text-xs opacity-50 mt-1 px-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                                {message.timestamp.toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Typing indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={isClosingAnimation ? { opacity: 0, scale: 0.1, y: 100, x: 50 } : { opacity: 1 }}
                          className="flex gap-2 mb-4"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-teal-500/30 flex-shrink-0">
                            <img 
                              src={agentAvatar} 
                              alt="Мира" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div 
                            className="px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1"
                            style={{
                              background: isDark ? 'rgba(0,150,150,0.15)' : 'rgba(0,150,150,0.1)'
                            }}
                          >
                            <motion.div
                              className="w-2 h-2 rounded-full"
                              style={{ background: '#009696' }}
                              animate={isClosingAnimation ? { opacity: 0, scale: 0.1, y: 100, x: 50 } : { scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="w-2 h-2 rounded-full"
                              style={{ background: '#009696' }}
                              animate={isClosingAnimation ? { opacity: 0, scale: 0.1, y: 100, x: 50 } : { scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-2 h-2 rounded-full"
                              style={{ background: '#009696' }}
                              animate={isClosingAnimation ? { opacity: 0, scale: 0.1, y: 100, x: 50 } : { scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div
                      className="p-4 border-t"
                      style={{
                        borderColor: isDark ? 'rgba(0,150,150,0.2)' : 'rgba(0,150,150,0.1)'
                      }}
                    >
                      {/* Request manager button */}
                      {!waitingForAdmin && (
                        <button
                          onClick={handleRequestAdmin}
                          className="w-full mb-3 py-2 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:shadow-md"
                          style={{
                            background: isDark ? 'rgba(255,200,80,0.15)' : 'rgba(255,200,80,0.2)',
                            color: isDark ? '#FFC850' : '#B8860B',
                            border: `1px solid ${isDark ? 'rgba(255,200,80,0.3)' : 'rgba(255,200,80,0.4)'}`
                          }}
                        >
                          <Headphones className="w-4 h-4" />
                          {t('chat.contactManager')}
                        </button>
                      )}

                      {waitingForAdmin && (
                        <div
                          className="mb-3 py-2 px-4 rounded-xl text-sm text-center"
                          style={{
                            background: isDark ? 'rgba(40,180,140,0.15)' : 'rgba(40,180,140,0.1)',
                            color: isDark ? '#28B48C' : '#1a7a5a'
                          }}
                        >
                          {t('chat.waitingForManager')}
                        </div>
                      )}

                      {/* Chat closed message */}
                      {isChatClosed && (
                        <div
                          className="mb-3 py-3 px-4 rounded-xl text-sm text-center"
                          style={{
                            background: "rgba(40,180,140,0.15)",
                            color: "#28B48C",
                            border: "1px solid rgba(40,180,140,0.3)"
                          }}
                        >
                          ✅ Чат завершён. Спасибо за обращение!
                        </div>
                      )}

                      {/* Profanity error message */}
                      {profanityError && (
                        <div
                          className="mb-3 py-2 px-4 rounded-xl text-sm text-center"
                          style={{
                            background: "rgba(255,68,68,0.15)",
                            color: "#FF4444",
                            border: "1px solid rgba(255,68,68,0.3)"
                          }}
                        >
                          ⚠️ Сообщение содержит недопустимые выражения
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          disabled={isChatClosed}
                          ref={inputRef}
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={isChatClosed ? "Чат завершён" : (waitingForAdmin ? t("chat.writeToManager") : t("chat.writeMessage"))}
                          className="flex-1 px-4 py-3 rounded-xl outline-none transition-all"
                          style={{
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            color: isDark ? '#FFFAF0' : '#143C50'
                          }}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim() || isChatClosed}
                          className="px-4 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                          style={{
                            background: inputValue.trim()
                              ? 'linear-gradient(135deg, #28B48C 0%, #009696 100%)'
                              : 'rgba(128,128,128,0.3)',
                            color: '#FFFAF0'
                          }}
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center overflow-hidden group"
        style={{
          background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {/* Pulse animation */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
              opacity: 0.5
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        <motion.div
          animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <MessageCircle className="w-7 h-7 text-white" />
          )}
        </motion.div>

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={isClosingAnimation ? { opacity: 0, scale: 0.1, y: 100, x: 50 } : { scale: 1 }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{
              background: '#FF4444',
              color: '#FFFFFF'
            }}
          >
            {unreadCount}
          </motion.div>
        )}

        {/* Hover overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
          }}
        />
      </motion.button>
    </div>
  );
}