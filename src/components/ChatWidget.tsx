import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import agentAvatar from 'figma:asset/e1e085ae75a2749b061ca9a2d4be120e5d13174a.png';

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('chatSession');
    if (savedSession) {
      const session: ChatSession = JSON.parse(savedSession);
      setMessages(session.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
      setUserName(session.userName);
      setUserEmail(session.userEmail || '');
      setSessionId(session.id);
      setIsRegistered(true);
      
      // Calculate unread messages from agent
      const unread = session.messages.filter(m => m.sender === 'agent' && !m.read).length;
      setUnreadCount(unread);
    } else {
      // Generate new session ID
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
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

  // AI Agent responses
  const getAgentResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();

    // Greeting
    if (lowerMsg.match(/привет|здравствуй|hello|hi/)) {
      return `Привет, ${userName}! 👋 Меня зовут Мира, я помощник Thailand My Car. С удовольствием отвечу на ваши вопросы! 😊`;
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
      return '🚗 Наш автопарк:\n\n🔹 Toyota Fortuner (премиум SUV)\n🔹 Toyota Camry (бизнес седан)\n🔹 Toyota Altis (комфорт класс)\n\nВсе автомобили 2023-2024 года, застрахованы и обслуживаются официально!';
    }

    // Location
    if (lowerMsg.match(/где|location|паттай|таиланд|thailand/)) {
      return '📍 Локация: Паттайя, Таиланд 🇹🇭\n\n🏖️ Популярный туристический город\n✈️ 2 часа от Бангкока\n📈 Высокий спрос на рентал круглый год\n🌴 Идеальное место для бизнеса!';
    }

    // Thanks
    if (lowerMsg.match(/спасибо|благодар|thanks/)) {
      return 'Всегда пожалуйста! 😊 Если возникут ещё вопросы - пишите!';
    }

    // Default response
    const defaultResponses = [
      'Интересный вопрос! Позвольте соединить вас с менеджером для детальной консультации. Оставьте свой email/Telegram?',
      'Спасибо за вопрос! Наш специалист свяжется с вами в течение часа для подробного ответа. Как с вами связаться?',
      'Хороший вопрос! Рекомендую изучить раздел "О проекте" на сайте. Или могу соединить с менеджером?'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleRegister = () => {
    if (userName.trim()) {
      setIsRegistered(true);
      
      // Welcome message
      const welcomeMsg: Message = {
        id: `msg_${Date.now()}`,
        text: `Здравствуйте, ${userName}! 👋\n\nМеня зовут Мира, я помощник Thailand My Car.\n\nС радостью отвечу на ваши вопросы об инвестициях, доходности, криптоплатежах и нашем автопарке!\n\nЧем могу помочь? 😊`,
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

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      read: true
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');

    // Show typing indicator
    setIsTyping(true);

    // Simulate agent response delay
    setTimeout(() => {
      const agentResponse = getAgentResponse(inputValue);
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
            animate={{ 
              opacity: 1, 
              scale: isMinimized ? 0.95 : 1, 
              y: 0,
              height: isMinimized ? '60px' : '600px'
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-20 right-0 w-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
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
                  <h3 className="font-semibold">Мира</h3>
                  <p className="text-xs opacity-80">
                    {isTyping ? 'Печатает...' : 'Консультант • Онлайн 24/7'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                        Начать чат
                      </h3>
                      <p className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                        Представьтесь, чтобы мы могли помочь вам лучше
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm mb-2 opacity-80" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          Ваше имя *
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Как к вам обращаться?"
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
                          Email (опционально)
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
                        Начать чат
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
                          animate={{ opacity: 1, y: 0 }}
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
                                {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Typing indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
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
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="w-2 h-2 rounded-full"
                              style={{ background: '#009696' }}
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-2 h-2 rounded-full"
                              style={{ background: '#009696' }}
                              animate={{ scale: [1, 1.2, 1] }}
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
                      <div className="flex gap-2">
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Напишите сообщение..."
                          className="flex-1 px-4 py-3 rounded-xl outline-none transition-all"
                          style={{
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            color: isDark ? '#FFFAF0' : '#143C50'
                          }}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim()}
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
            animate={{ scale: 1 }}
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