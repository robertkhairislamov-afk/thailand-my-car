// ============ ЗАЩИТА ОТ СПАМА ============

// Хранилище для rate limiting (в памяти)
const rateLimits = {
  messages: new Map(),    // sessionId -> { count, lastReset, lastMessage }
  sessions: new Map(),    // ip -> { count, lastReset }
  telegram: new Map()     // sessionId -> lastTelegramSend
};

// Настройки лимитов
const LIMITS = {
  MESSAGES_PER_MINUTE: 10,        // Макс сообщений в минуту
  SESSIONS_PER_HOUR: 5,           // Макс сессий с одного IP в час
  MIN_MESSAGE_INTERVAL: 1000,     // Минимум 1 секунда между сообщениями
  MAX_MESSAGE_LENGTH: 1000,       // Макс длина сообщения
  TELEGRAM_COOLDOWN: 2000,        // Минимум 2 сек между отправками в Telegram
};

// Очистка старых записей (каждые 5 минут)
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimits.messages) {
    if (now - data.lastReset > 60000) rateLimits.messages.delete(key);
  }
  for (const [key, data] of rateLimits.sessions) {
    if (now - data.lastReset > 3600000) rateLimits.sessions.delete(key);
  }
  for (const [key, time] of rateLimits.telegram) {
    if (now - time > 60000) rateLimits.telegram.delete(key);
  }
}, 300000);

// Проверка rate limit для сообщений
function checkMessageRateLimit(sessionId) {
  const now = Date.now();
  let data = rateLimits.messages.get(sessionId);
  
  if (!data) {
    data = { count: 0, lastReset: now, lastMessage: 0 };
    rateLimits.messages.set(sessionId, data);
  }
  
  // Сброс счётчика каждую минуту
  if (now - data.lastReset > 60000) {
    data.count = 0;
    data.lastReset = now;
  }
  
  // Проверка минимального интервала
  if (now - data.lastMessage < LIMITS.MIN_MESSAGE_INTERVAL) {
    return { allowed: false, error: "too_fast", message: "Подождите секунду перед следующим сообщением" };
  }
  
  // Проверка лимита в минуту
  if (data.count >= LIMITS.MESSAGES_PER_MINUTE) {
    return { allowed: false, error: "rate_limit", message: "Слишком много сообщений. Подождите минуту." };
  }
  
  data.count++;
  data.lastMessage = now;
  return { allowed: true };
}

// Проверка rate limit для создания сессий
function checkSessionRateLimit(ip) {
  const now = Date.now();
  let data = rateLimits.sessions.get(ip);
  
  if (!data) {
    data = { count: 0, lastReset: now };
    rateLimits.sessions.set(ip, data);
  }
  
  // Сброс каждый час
  if (now - data.lastReset > 3600000) {
    data.count = 0;
    data.lastReset = now;
  }
  
  if (data.count >= LIMITS.SESSIONS_PER_HOUR) {
    return { allowed: false, error: "session_limit", message: "Превышен лимит создания чатов. Попробуйте позже." };
  }
  
  data.count++;
  return { allowed: true };
}

// Проверка cooldown для Telegram
function checkTelegramCooldown(sessionId) {
  const now = Date.now();
  const lastSend = rateLimits.telegram.get(sessionId) || 0;
  
  if (now - lastSend < LIMITS.TELEGRAM_COOLDOWN) {
    return false; // Не отправлять в Telegram
  }
  
  rateLimits.telegram.set(sessionId, now);
  return true;
}

// Проверка длины сообщения
function checkMessageLength(message) {
  if (!message) return { allowed: false, error: "empty", message: "Сообщение не может быть пустым" };
  if (message.length > LIMITS.MAX_MESSAGE_LENGTH) {
    return { allowed: false, error: "too_long", message: `Сообщение слишком длинное (макс ${LIMITS.MAX_MESSAGE_LENGTH} символов)` };
  }
  return { allowed: true };
}

module.exports = {
  checkMessageRateLimit,
  checkSessionRateLimit,
  checkTelegramCooldown,
  checkMessageLength,
  LIMITS
};
