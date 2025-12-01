# 💬 Chat Widget с AI-агентом - Полное руководство

Полнофункциональный чат-виджет с AI-агентом поддержки и интеграцией в админ-панель.

---

## 🎯 Концепция

**User Flow:**
1. Пользователь кликает на кнопку чата (правый нижний угол)
2. Вводит имя и email (опционально)
3. Начинает диалог с AI-агентом
4. Получает мгновенные ответы на вопросы

**Admin Flow:**
1. Админ заходит в раздел "Сообщения"
2. Видит все активные чат-сессии
3. Может читать переписку в реальном времени
4. Отправляет ручные ответы (overriding AI)
5. Закрывает чаты при завершении

---

## 🎨 Компоненты

### 1. ChatWidget (для пользователей)

**Файл:** `/components/ChatWidget.tsx`

#### Основные возможности:

✨ **Регистрация:**
- Форма с именем (обязательно) и email (опционально)
- Автофокус на поле ввода
- Enter для отправки
- Генерация уникального session ID

✨ **Чат:**
- Список сообщений с аватарами (User/Bot)
- Индикатор "печатает..."
- Автоскролл к последнему сообщению
- Timestamp для каждого сообщения
- Minimize/Close функционал

✨ **AI-агент:**
- 15+ умных паттернов ответов
- Контекстные ответы на вопросы
- Delay 1-2.5 сек (симуляция реального человека)
- Fallback на соединение с менеджером

✨ **Уведомления:**
- Красный badge с количеством непрочитанных
- Pulse анимация кнопки
- Mark as read при открытии

✨ **Персистентность:**
- Сохранение в localStorage
- Восстановление сессии при перезагрузке
- Синхронизация с админ-панелью

---

### 2. Messages (для админов)

**Файл:** `/components/admin/Messages.tsx`

#### Основные возможности:

✨ **Список сессий:**
- Все чат-сессии с пользователями
- Сортировка по дате последнего сообщения
- Unread count для каждой сессии
- Фильтры: Active/Closed
- Live поиск по имени, email, тексту

✨ **Чат-окно:**
- Полная история переписки
- Аватары пользователя и бота
- Timestamps
- Возможность ответить вручную
- Кнопка "Закрыть чат"

✨ **Реалтайм:**
- Polling каждые 2 секунды
- Автоматическое обновление новых сообщений
- Синхронизация между вкладками

---

## 🤖 AI-агент: Паттерны ответов

### 1. **Приветствия**
```
Trigger: "привет", "здравствуй", "hello", "hi"
Response: "Привет, {userName}! 👋 Я AI-ассистент Thailand My Car..."
```

### 2. **Инвестиции**
```
Trigger: "инвестиц", "invest", "вложить", "сколько"
Response: Информация о 2 тирах с суммами и ROI
```

### 3. **Доходность**
```
Trigger: "roi", "доход", "прибыль", "процент"
Response: +20% для Tier 1, 5-8% ежемесячно для Tier 2
```

### 4. **Криптовалюта**
```
Trigger: "крипт", "usdt", "usdc", "кошелек", "metamask"
Response: USDT/USDC на BSC/Polygon
```

### 5. **Безопасность**
```
Trigger: "риск", "безопасн", "гаранти", "надежн"
Response: Юридическая структура, страхование, disclaimer
```

### 6. **Сроки**
```
Trigger: "когда", "срок", "время", "дата"
Response: Timeline выплат для обоих тиров
```

### 7. **Контакты**
```
Trigger: "контакт", "связ", "телефон", "email"
Response: Telegram, WhatsApp, Email
```

### 8. **Документы**
```
Trigger: "документ", "договор", "whitepaper", "legal"
Response: Список доступных документов
```

### 9. **Минимум инвестиции**
```
Trigger: "минимум", "minimum", "от какой суммы"
Response: $12,400 (฿404,600)
```

### 10. **Автопарк**
```
Trigger: "машин", "автомобил", "toyota", "fleet"
Response: Fortuner, Camry, Altis с характеристиками
```

### 11. **Локация**
```
Trigger: "где", "location", "паттай", "таиланд"
Response: Паттайя, Таиланд 🇹🇭 с преимуществами
```

### 12. **Благодарность**
```
Trigger: "спасибо", "благодар", "thanks"
Response: Приятный ответ
```

### 13. **Default (неизвестный запрос)**
```
Response: Предложение связаться с менеджером
```

---

## 💾 Data Structure

### Message
```typescript
interface Message {
  id: string;              // Уникальный ID
  text: string;            // Текст сообщения
  sender: 'user' | 'agent'; // Отправитель
  timestamp: Date;         // Время отправки
  read?: boolean;          // Прочитано ли
}
```

### ChatSession
```typescript
interface ChatSession {
  id: string;              // Уникальный session ID
  userId: string;          // ID пользователя
  userName: string;        // Имя пользователя
  userEmail?: string;      // Email (optional)
  messages: Message[];     // Массив сообщений
  status: 'active' | 'closed'; // Статус чата
  createdAt: Date;         // Дата создания
  lastMessageAt: Date;     // Последнее сообщение
}
```

---

## 🗄️ localStorage Schema

### User Side
```javascript
// Ключ: 'chatSession'
{
  "id": "session_1732567890123_abc123",
  "userId": "user_session_1732567890123_abc123",
  "userName": "Алексей",
  "userEmail": "alexey@example.com",
  "messages": [
    {
      "id": "msg_1732567890124",
      "text": "Привет",
      "sender": "user",
      "timestamp": "2024-11-25T10:30:00.000Z",
      "read": true
    },
    {
      "id": "msg_1732567891234",
      "text": "Привет, Алексей! Чем могу помочь?",
      "sender": "agent",
      "timestamp": "2024-11-25T10:30:01.000Z",
      "read": true
    }
  ],
  "status": "active",
  "createdAt": "2024-11-25T10:30:00.000Z",
  "lastMessageAt": "2024-11-25T10:30:01.000Z"
}
```

### Admin Side
```javascript
// Ключ: 'adminChatMessages'
[
  { /* ChatSession 1 */ },
  { /* ChatSession 2 */ },
  { /* ChatSession 3 */ }
]
```

---

## 🎨 UI/UX Детали

### Регистрационная форма
```
┌──────────────────────────────┐
│  💬 Начать чат               │
│                              │
│  Представьтесь, чтобы мы     │
│  могли помочь вам лучше      │
│                              │
│  Ваше имя *                  │
│  [_________________]         │
│                              │
│  Email (опционально)         │
│  [_________________]         │
│                              │
│  [   Начать чат   ]          │
└──────────────────────────────┘
```

### Чат-окно
```
┌──────────────────────────────┐
│ 🤖 AI Support Agent    [▫][✕]│
│ Онлайн 24/7                  │
├──────────────────────────────┤
│                              │
│  🤖 Привет! Чем помочь?      │
│     10:30                    │
│                              │
│            👤 Сколько стоит? │
│               10:31          │
│                              │
│  🤖 Минимум $12,400          │
│     10:32                    │
│                              │
├──────────────────────────────┤
│ [Напишите сообщение...] [>] │
│ Powered by AI • Ответы за... │
└──────────────────────────────┘
```

### Админ Messages
```
┌─────────────┬────────────────────────┐
│ Sessions    │ Chat Window            │
│             │                        │
│ 👤 Алексей  │ 👤 Алексей            │
│ 2 new       │ alexey@example.com     │
│ 10:30       │ 15 сообщений   [Close] │
│             ├────────────────────────┤
│ 👤 Мария    │ 🤖 Привет!            │
│ 10:15       │                        │
│             │       👤 Сколько?      │
│ 👤 Игорь    │                        │
│ Closed      │ 🤖 $12,400            │
│ 09:45       │                        │
│             ├────────────────────────┤
│             │ [Введите ответ...] [>]│
└─────────────┴────────────────────────┘
```

---

## 🎯 Анимации

### Кнопка чата
```css
Pulse: scale [1 → 1.3 → 1], opacity [0.5 → 0 → 0.5], 2s infinite
Hover: scale 1.1
Tap: scale 0.9
Open/Close: rotate 180° (spring animation)
```

### Чат-окно
```css
Initial: opacity 0, scale 0.8, y +20px
Animate: opacity 1, scale 1, y 0
Minimize: height 600px → 60px
```

### Сообщения
```css
Initial: opacity 0, y +10px
Animate: opacity 1, y 0
Stagger delay: 0.05s per message
```

### Typing indicator
```css
3 dots, scale [1 → 1.2 → 1]
Delay: 0s, 0.2s, 0.4s
Duration: 0.6s infinite
```

---

## 🔧 Кастомизация

### Изменить AI-ответы

В файле `/components/ChatWidget.tsx` найдите функцию `getAgentResponse()`:

```typescript
const getAgentResponse = (userMessage: string): string => {
  const lowerMsg = userMessage.toLowerCase();

  // Добавьте свой паттерн
  if (lowerMsg.match(/ваш_паттерн/)) {
    return 'Ваш ответ';
  }

  // ...остальные паттерны
};
```

### Изменить delay ответа

```typescript
// В handleSendMessage()
setTimeout(() => {
  // ...agent response
}, 1000 + Math.random() * 1500); // От 1 до 2.5 секунд
```

### Добавить поля в регистрацию

```typescript
const [userPhone, setUserPhone] = useState('');

// В JSX
<input
  type="tel"
  value={userPhone}
  onChange={(e) => setUserPhone(e.target.value)}
  placeholder="+7 XXX XXX XX XX"
/>
```

### Изменить polling интервал админки

```typescript
// В Messages.tsx
const interval = setInterval(loadSessions, 2000); // 2 секунды
// Измените на 5000 для 5 секунд
```

---

## 🚀 Интеграция с Backend

### 1. Заменить localStorage на API

**User Side (ChatWidget.tsx):**

```typescript
// Вместо localStorage
const saveSession = async (msgs: Message[]) => {
  const session: ChatSession = { /* ... */ };
  
  await fetch('/api/chat/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session)
  });
};
```

**Admin Side (Messages.tsx):**

```typescript
const loadSessions = async () => {
  const response = await fetch('/api/admin/chat/sessions');
  const sessions = await response.json();
  setSessions(sessions);
};
```

### 2. WebSocket для реалтайма

```typescript
// Установка соединения
const ws = new WebSocket('wss://your-api.com/chat');

// Отправка сообщения
ws.send(JSON.stringify({
  type: 'message',
  sessionId,
  message: { /* ... */ }
}));

// Получение обновлений
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'new_message') {
    setMessages(prev => [...prev, data.message]);
  }
};
```

### 3. Настоящий AI (OpenAI API)

```typescript
const getAgentResponse = async (userMessage: string): Promise<string> => {
  const response = await fetch('/api/chat/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userMessage,
      context: messages // История для контекста
    })
  });
  
  const { reply } = await response.json();
  return reply;
};
```

---

## 📊 Analytics

### События для отслеживания

```typescript
// Открытие чата
gtag('event', 'chat_opened', {
  event_category: 'engagement'
});

// Регистрация
gtag('event', 'chat_registration', {
  event_category: 'conversion',
  event_label: userName
});

// Отправка сообщения
gtag('event', 'chat_message_sent', {
  event_category: 'engagement',
  event_label: 'user_message'
});

// AI ответ
gtag('event', 'chat_ai_response', {
  event_category: 'engagement',
  event_label: 'pattern_matched'
});
```

---

## 🎯 Best Practices

### ✅ DO:

- Всегда сохраняйте имя пользователя
- Используйте уникальные session IDs
- Mark messages as read
- Валидируйте ввод (email format)
- Показывайте typing indicator
- Автоскролл к новым сообщениям
- Тестируйте на мобильных

### ❌ DON'T:

- Не делайте AI слишком "роботизированным"
- Не теряйте контекст разговора
- Не спамьте пользователя сообщениями
- Не забывайте про fallback ответы
- Не делайте delay слишком коротким (<500ms)
- Не игнорируйте accessibility

---

## 🐛 Troubleshooting

### Проблема: Сообщения не синхронизируются

**Решение:**
```typescript
// Проверьте, что session ID одинаковый
console.log('User session:', localStorage.getItem('chatSession'));
console.log('Admin sessions:', localStorage.getItem('adminChatMessages'));
```

### Проблема: AI не отвечает

**Решение:**
```typescript
// Добавьте логирование
console.log('User message:', userMessage);
console.log('Matched pattern:', /* результат regex */);
console.log('AI response:', agentResponse);
```

### Проблема: Unread count неверный

**Решение:**
```typescript
// Убедитесь, что mark as read срабатывает
useEffect(() => {
  if (isOpen && !isMinimized) {
    console.log('Marking messages as read');
    // ...
  }
}, [isOpen, isMinimized]);
```

---

## 🌍 Локализация

```typescript
const translations = {
  ru: {
    chatTitle: 'AI Support Agent',
    chatSubtitle: 'Онлайн 24/7',
    typing: 'Печатает...',
    placeholder: 'Напишите сообщение...',
    sendButton: 'Отправить',
    // ...
  },
  en: {
    chatTitle: 'AI Support Agent',
    chatSubtitle: 'Online 24/7',
    typing: 'Typing...',
    placeholder: 'Type a message...',
    sendButton: 'Send',
    // ...
  }
};

const t = translations[currentLang];
```

---

## 📈 Roadmap

### Phase 2 (Q1 2025):
- [ ] Backend API интеграция
- [ ] WebSocket реалтайм
- [ ] Настоящий OpenAI GPT
- [ ] File attachments (скриншоты)
- [ ] Voice messages
- [ ] Emoji picker

### Phase 3 (Q2 2025):
- [ ] Multi-language AI
- [ ] Sentiment analysis
- [ ] Chat history export
- [ ] CSAT ratings
- [ ] Auto-assignment to agents
- [ ] Priority queue

---

## 🔐 Безопасность

### Защита от спама:
```typescript
// Rate limiting
const MESSAGE_LIMIT = 10; // per minute
const userMessageCount = /* track in state */;

if (userMessageCount > MESSAGE_LIMIT) {
  alert('Слишком много сообщений. Подождите минуту.');
  return;
}
```

### XSS защита:
```typescript
// Sanitize user input
import DOMPurify from 'dompurify';

const sanitizedText = DOMPurify.sanitize(inputValue);
```

### Валидация email:
```typescript
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

---

## 📱 Mobile адаптация

```css
/* Полная высота на мобильных */
@media (max-width: 768px) {
  .chat-window {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100vh;
    bottom: 0;
    right: 0;
    border-radius: 0;
  }
}
```

---

## 🎁 Бонус: Quick Replies

Добавьте быстрые ответы для пользователей:

```typescript
const quickReplies = [
  '💰 Сколько стоит?',
  '📊 Какая доходность?',
  '🔐 Это безопасно?',
  '📞 Связаться с менеджером'
];

// В JSX
<div className="flex gap-2 flex-wrap">
  {quickReplies.map(reply => (
    <button
      key={reply}
      onClick={() => setInputValue(reply)}
      className="px-3 py-2 rounded-lg text-sm"
    >
      {reply}
    </button>
  ))}
</div>
```

---

**Made with ❤️ using AI & Framer Motion**

Теперь у вас полнофункциональный чат с AI-агентом! 🚀
