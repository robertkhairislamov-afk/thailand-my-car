import { useState, useEffect, useRef } from 'react';
import { MessageCircle, User, Send, X, RefreshCw, Loader2, Clock, CheckCircle } from 'lucide-react';
import api from '../../services/api';

interface ChatSession {
  id: string;
  user_name: string;
  user_email?: string;
  user_wallet?: string;
  status: 'active' | 'closed';
  needs_admin: boolean;
  unread_count: number;
  last_message?: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'agent' | 'admin';
  sender_name?: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface AdminChatProps {
  isDark: boolean;
}

export function AdminChat({ isDark }: AdminChatProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'needs_admin' | 'active'>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Load sessions
  const loadSessions = async () => {
    try {
      const params: any = {};
      if (filter === 'needs_admin') params.needsAdmin = 'true';
      if (filter === 'active') params.status = 'active';

      const result = await api.getAdminChatSessions(params);
      if (result.data?.sessions) {
        setSessions(result.data.sessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected session
  const loadMessages = async (sessionId: string) => {
    setMessagesLoading(true);
    try {
      const result = await api.getAdminChatMessages(sessionId);
      if (result.data) {
        setMessages(result.data.messages || []);
        if (result.data.session) {
          setSelectedSession(result.data.session);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadSessions();
  }, [filter]);

  // Poll for new messages when session is selected
  useEffect(() => {
    if (selectedSession) {
      pollingRef.current = setInterval(() => {
        loadMessages(selectedSession.id);
        loadSessions();
      }, 5000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [selectedSession?.id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!inputValue.trim() || !selectedSession) return;

    setSending(true);
    try {
      await api.sendAdminChatMessage(selectedSession.id, inputValue);
      setInputValue('');
      await loadMessages(selectedSession.id);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Close session
  const handleCloseSession = async () => {
    if (!selectedSession) return;

    try {
      await api.closeChatSession(selectedSession.id);
      setSelectedSession(null);
      setMessages([]);
      await loadSessions();
    } catch (error) {
      console.error('Error closing session:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return formatTime(dateStr);
    }
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) + ' ' + formatTime(dateStr);
  };

  // Count needing admin
  const needsAdminCount = sessions.filter(s => s.needs_admin && s.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
            Чат с клиентами
          </h1>
          {needsAdminCount > 0 && (
            <span
              className="px-3 py-1 rounded-full text-sm animate-pulse"
              style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' }}
            >
              {needsAdminCount} ожидают
            </span>
          )}
        </div>
        <button
          onClick={loadSessions}
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

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'needs_admin', 'active'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-sm transition-all"
            style={{
              background: filter === f
                ? 'linear-gradient(135deg, #009696 0%, #28B48C 100%)'
                : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: filter === f ? '#FFFAF0' : isDark ? '#FFFAF0' : '#143C50'
            }}
          >
            {f === 'all' && 'Все'}
            {f === 'needs_admin' && 'Ждут ответа'}
            {f === 'active' && 'Активные'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: '600px' }}>
        {/* Sessions List */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
          }}
        >
          <div
            className="px-4 py-3 border-b"
            style={{
              background: isDark ? 'rgba(0, 150, 150, 0.1)' : 'rgba(0, 150, 150, 0.05)',
              borderColor: isDark ? 'rgba(0, 150, 150, 0.2)' : 'rgba(0, 150, 150, 0.1)'
            }}
          >
            <h3 style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
              Сессии ({sessions.length})
            </h3>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: '550px' }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#009696]" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
                <p className="opacity-60" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  Нет активных чатов
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    setSelectedSession(session);
                    loadMessages(session.id);
                  }}
                  className="p-4 border-b cursor-pointer transition-all hover:bg-opacity-50"
                  style={{
                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    background: selectedSession?.id === session.id
                      ? isDark ? 'rgba(0, 150, 150, 0.15)' : 'rgba(0, 150, 150, 0.1)'
                      : 'transparent'
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: session.needs_admin
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'linear-gradient(135deg, #009696 0%, #28B48C 100%)'
                        }}
                      >
                        <User className="w-5 h-5" style={{ color: session.needs_admin ? '#EF4444' : '#FFFAF0' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                            {session.user_name}
                          </span>
                          {session.needs_admin && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm opacity-60 truncate max-w-[180px]" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          {session.last_message || 'Нет сообщений'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                        {formatDate(session.updated_at)}
                      </p>
                      {session.unread_count > 0 && (
                        <span
                          className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs"
                          style={{ background: '#EF4444', color: '#FFFFFF' }}
                        >
                          {session.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div
          className="lg:col-span-2 rounded-2xl border overflow-hidden flex flex-col"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
          }}
        >
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div
                className="px-4 py-3 border-b flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, #009696 0%, #28B48C 100%)',
                  borderColor: 'transparent'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedSession.user_name}</h3>
                    <p className="text-white/70 text-sm">
                      {selectedSession.user_email || selectedSession.user_wallet?.slice(0, 10) + '...' || 'Без контактов'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSession.status === 'active' && (
                    <button
                      onClick={() => {
                        if (confirm('Завершить чат с клиентом?')) {
                          handleCloseSession();
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-all text-white text-sm"
                      title="Закрыть чат"
                    >
                      <X className="w-4 h-4" />
                      Завершить
                    </button>
                  )}
                  {selectedSession.status === 'closed' && (
                    <span className="px-3 py-1 rounded-full text-xs bg-white/20 text-white">
                      Закрыт
                    </span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-[#009696]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="opacity-60" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                      Нет сообщений
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] ${msg.sender === 'admin' ? 'order-2' : 'order-1'}`}
                        >
                          <div
                            className="px-4 py-2 rounded-2xl"
                            style={{
                              background: msg.sender === 'admin'
                                ? 'linear-gradient(135deg, #009696 0%, #28B48C 100%)'
                                : msg.sender === 'agent'
                                ? isDark ? 'rgba(255,200,80,0.15)' : 'rgba(255,200,80,0.2)'
                                : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                              color: msg.sender === 'admin'
                                ? '#FFFAF0'
                                : isDark ? '#FFFAF0' : '#143C50',
                              borderRadius: msg.sender === 'admin'
                                ? '16px 16px 4px 16px'
                                : '16px 16px 16px 4px'
                            }}
                          >
                            {msg.sender === 'agent' && (
                              <p className="text-xs opacity-60 mb-1">🤖 Мира (AI)</p>
                            )}
                            <p className="text-sm whitespace-pre-line">{msg.message}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 px-2 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <Clock className="w-3 h-3 opacity-40" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
                            <span className="text-xs opacity-40" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                              {formatTime(msg.created_at)}
                            </span>
                            {msg.sender === 'admin' && msg.read && (
                              <CheckCircle className="w-3 h-3 text-[#28B48C]" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              {selectedSession.status === 'active' && (
                <div
                  className="p-4 border-t"
                  style={{ borderColor: isDark ? 'rgba(0,150,150,0.2)' : 'rgba(0,150,150,0.1)' }}
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Напишите ответ..."
                      className="flex-1 px-4 py-3 rounded-xl outline-none transition-all"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        color: isDark ? '#FFFAF0' : '#143C50'
                      }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim() || sending}
                      className="px-4 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                      style={{
                        background: inputValue.trim() && !sending
                          ? 'linear-gradient(135deg, #28B48C 0%, #009696 100%)'
                          : 'rgba(128,128,128,0.3)',
                        color: '#FFFAF0'
                      }}
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
                <h3 className="text-xl mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                  Выберите чат
                </h3>
                <p className="opacity-60" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  Выберите чат слева, чтобы начать общение
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
