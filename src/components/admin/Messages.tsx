import { useState, useEffect, useRef } from 'react';
import { MessageCircle, User, Bot, Send, Search, Filter, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

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

interface MessagesProps {
  isDark: boolean;
}

export function Messages({ isDark }: MessagesProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat sessions from localStorage
  useEffect(() => {
    loadSessions();
    
    // Poll for new messages every 2 seconds
    const interval = setInterval(loadSessions, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadSessions = () => {
    const savedSessions = localStorage.getItem('adminChatMessages');
    if (savedSessions) {
      const parsed: ChatSession[] = JSON.parse(savedSessions);
      // Convert string dates to Date objects
      const withDates = parsed.map(s => ({
        ...s,
        createdAt: new Date(s.createdAt),
        lastMessageAt: new Date(s.lastMessageAt),
        messages: s.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
      }));
      
      // Sort by last message time
      withDates.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
      setSessions(withDates);
    }
  };

  // Auto-scroll to bottom in chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession?.messages]);

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedSession) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      text: replyText,
      sender: 'agent',
      timestamp: new Date(),
      read: false
    };

    const updatedSession: ChatSession = {
      ...selectedSession,
      messages: [...selectedSession.messages, newMessage],
      lastMessageAt: new Date()
    };

    // Update in localStorage
    const allSessions = sessions.map(s => 
      s.id === selectedSession.id ? updatedSession : s
    );
    localStorage.setItem('adminChatMessages', JSON.stringify(allSessions));

    // Update user's chat session
    if (selectedSession.id === JSON.parse(localStorage.getItem('chatSession') || '{}').id) {
      localStorage.setItem('chatSession', JSON.stringify(updatedSession));
    }

    setSelectedSession(updatedSession);
    setSessions(allSessions);
    setReplyText('');
  };

  const handleCloseSession = (sessionId: string) => {
    const updatedSessions = sessions.map(s =>
      s.id === sessionId ? { ...s, status: 'closed' as const } : s
    );
    setSessions(updatedSessions);
    localStorage.setItem('adminChatMessages', JSON.stringify(updatedSessions));
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getUnreadCount = (session: ChatSession) => {
    return session.messages.filter(m => m.sender === 'user' && !m.read).length;
  };

  const getTotalUnread = () => {
    return sessions.reduce((acc, s) => acc + getUnreadCount(s), 0);
  };

  const cardBg = isDark ? 'rgba(20, 60, 80, 0.5)' : 'rgba(255, 255, 255, 0.8)';
  const borderColor = isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)';
  const textColor = isDark ? '#FFFAF0' : '#143C50';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-2" style={{ color: textColor, fontWeight: 700 }}>
          Сообщения
        </h1>
        <p className="opacity-70" style={{ color: textColor }}>
          Чат-сессии с пользователями • {getTotalUnread()} непрочитанных
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" style={{ color: textColor }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени, email, сообщениям..."
            className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              color: textColor
            }}
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {(['all', 'active', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="px-4 py-3 rounded-xl transition-all capitalize"
              style={{
                background: statusFilter === status
                  ? 'linear-gradient(135deg, #28B48C 0%, #009696 100%)'
                  : cardBg,
                border: `1px solid ${borderColor}`,
                color: statusFilter === status ? '#FFFAF0' : textColor
              }}
            >
              {status === 'all' ? 'Все' : status === 'active' ? 'Активные' : 'Закрытые'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1 space-y-3 max-h-[700px] overflow-y-auto pr-2">
          {filteredSessions.length === 0 ? (
            <div 
              className="p-8 rounded-xl text-center"
              style={{
                background: cardBg,
                border: `1px solid ${borderColor}`
              }}
            >
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: textColor }} />
              <p className="opacity-70" style={{ color: textColor }}>
                {searchQuery ? 'Ничего не найдено' : 'Нет сообщений'}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const unread = getUnreadCount(session);
              const lastMessage = session.messages[session.messages.length - 1];
              
              return (
                <motion.div
                  key={session.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: selectedSession?.id === session.id
                      ? 'linear-gradient(135deg, rgba(40,180,140,0.2) 0%, rgba(0,150,150,0.2) 100%)'
                      : cardBg,
                    border: `1px solid ${selectedSession?.id === session.id ? '#009696' : borderColor}`
                  }}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #FFC850 0%, #FF9800 100%)'
                        }}
                      >
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ color: textColor }}>
                          {session.userName}
                        </h4>
                        {session.userEmail && (
                          <p className="text-xs opacity-60" style={{ color: textColor }}>
                            {session.userEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-col items-end gap-1">
                      {unread > 0 && (
                        <div 
                          className="px-2 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: '#FF4444',
                            color: '#FFFFFF'
                          }}
                        >
                          {unread}
                        </div>
                      )}
                      {session.status === 'closed' && (
                        <div 
                          className="px-2 py-1 rounded-full text-xs"
                          style={{
                            background: 'rgba(128,128,128,0.2)',
                            color: textColor
                          }}
                        >
                          Closed
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Last message preview */}
                  <p className="text-sm opacity-70 truncate mb-2" style={{ color: textColor }}>
                    {lastMessage.sender === 'user' ? '👤 ' : '🤖 '}
                    {lastMessage.text}
                  </p>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-xs opacity-50" style={{ color: textColor }}>
                    <Clock className="w-3 h-3" />
                    {new Date(session.lastMessageAt).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Chat Window */}
        <div 
          className="lg:col-span-2 rounded-xl overflow-hidden flex flex-col"
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
            height: '700px'
          }}
        >
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div 
                className="p-4 border-b flex items-center justify-between"
                style={{ borderColor }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #FFC850 0%, #FF9800 100%)'
                    }}
                  >
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: textColor }}>
                      {selectedSession.userName}
                    </h3>
                    <p className="text-sm opacity-60" style={{ color: textColor }}>
                      {selectedSession.userEmail || selectedSession.userId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-sm opacity-60" style={{ color: textColor }}>
                    {selectedSession.messages.length} сообщений
                  </div>
                  {selectedSession.status === 'active' && (
                    <button
                      onClick={() => handleCloseSession(selectedSession.id)}
                      className="px-3 py-2 rounded-lg text-sm transition-all"
                      style={{
                        background: 'rgba(255,68,68,0.2)',
                        color: '#FF4444'
                      }}
                    >
                      Закрыть чат
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {selectedSession.messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[70%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: message.sender === 'agent'
                            ? 'linear-gradient(135deg, #28B48C 0%, #009696 100%)'
                            : 'linear-gradient(135deg, #FFC850 0%, #FF9800 100%)'
                        }}
                      >
                        {message.sender === 'agent' ? (
                          <Bot className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>

                      {/* Message bubble */}
                      <div>
                        <div
                          className="px-4 py-2 rounded-2xl"
                          style={{
                            background: message.sender === 'agent'
                              ? isDark ? 'rgba(0,150,150,0.15)' : 'rgba(0,150,150,0.1)'
                              : 'linear-gradient(135deg, #28B48C 0%, #009696 100%)',
                            color: message.sender === 'agent' ? textColor : '#FFFAF0',
                            borderRadius: message.sender === 'agent' ? '16px 16px 16px 4px' : '16px 16px 4px 16px'
                          }}
                        >
                          <p className="text-sm whitespace-pre-line">{message.text}</p>
                        </div>
                        <p className="text-xs opacity-50 mt-1 px-2" style={{ color: textColor }}>
                          {new Date(message.timestamp).toLocaleTimeString('ru-RU', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              {selectedSession.status === 'active' && (
                <div 
                  className="p-4 border-t"
                  style={{ borderColor }}
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                      placeholder="Введите ответ..."
                      className="flex-1 px-4 py-3 rounded-xl outline-none transition-all"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${borderColor}`,
                        color: textColor
                      }}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className="px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                      style={{
                        background: replyText.trim()
                          ? 'linear-gradient(135deg, #28B48C 0%, #009696 100%)'
                          : 'rgba(128,128,128,0.3)',
                        color: '#FFFAF0'
                      }}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: textColor }} />
                <h3 className="text-xl mb-2 opacity-70" style={{ color: textColor, fontWeight: 600 }}>
                  Выберите чат
                </h3>
                <p className="text-sm opacity-50" style={{ color: textColor }}>
                  Выберите сессию из списка слева
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
