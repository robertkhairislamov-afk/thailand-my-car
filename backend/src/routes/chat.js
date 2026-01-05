const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const telegram = require("../services/telegram");
const spamProtection = require("../services/spamProtection");

// ============ ФИЛЬТР ЦЕНЗУРЫ ============
const badWords = [
  // Русский мат (основные корни)
  "хуй", "хуя", "хуе", "хуи", "хую", "пизд", "пизд", "ебат", "ебан", "ебал", "ебу", "ебл", "ёб",
  "бля", "блядь", "бляд", "блят", "сука", "суки", "сучк", "мудак", "мудач", "мудил",
  "пидор", "пидар", "педик", "гандон", "гондон", "залуп", "шлюх", "давалк",
  "уёб", "уеб", "выеб", "заеб", "наеб", "поеб", "доеб", "съеб", "отъеб",
  "ебуч", "ёбан", "долбо", "дрочи", "дроч", "манд", "чмо", "лох", "чурк",
  // Оскорбления
  "идиот", "дебил", "кретин", "тупой", "урод", "мразь", "тварь", "скотин",
  // English
  "fuck", "shit", "bitch", "asshole", "dick", "cock", "pussy", "cunt", "whore"
];

// Функция проверки на мат
function containsProfanity(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase().replace(/[^a-zа-яё]/gi, "");
  return badWords.some(word => lowerText.includes(word.toLowerCase()));
}

// Функция цензуры текста (замена на звёздочки)
function censorText(text) {
  if (!text) return text;
  let result = text;
  badWords.forEach(word => {
    const regex = new RegExp(word, "gi");
    result = result.replace(regex, "*".repeat(word.length));
  });
  return result;
}

// ============ ROUTES ============

// Get or create chat session
router.post("/session", async (req, res) => {
  try {
    const { sessionId, userName, userEmail, userWallet } = req.body;

    if (!userName) {
      return res.status(400).json({ error: "User name is required" });

    // Защита от спама - лимит сессий с одного IP
    const clientIp = req.ip || req.connection.remoteAddress || "unknown";
    const sessionCheck = spamProtection.checkSessionRateLimit(clientIp);
    if (!sessionCheck.allowed) {
      return res.status(429).json({ error: sessionCheck.error, message: sessionCheck.message });
    }
    }

    // Check if session exists
    let session;
    if (sessionId) {
      const existing = await pool.query(
        "SELECT * FROM chat_sessions WHERE id = $1",
        [sessionId]
      );
      if (existing.rows.length > 0) {
        session = existing.rows[0];
        
        // Обновляем wallet если его не было
        if (userWallet && !session.user_wallet) {
          await pool.query(
            "UPDATE chat_sessions SET user_wallet = $1 WHERE id = $2",
            [userWallet, sessionId]
          );
          session.user_wallet = userWallet;
        }
      }
    }

    // Create new session if not found
    if (!session) {
      const result = await pool.query(`
        INSERT INTO chat_sessions (user_name, user_email, user_wallet)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [userName, userEmail || null, userWallet || null]);
      session = result.rows[0];
    }

    res.json({ session });
  } catch (error) {
    console.error("Session error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Send message
router.post("/message", async (req, res) => {
  try {
    const { sessionId, sender, senderName, message, userWallet } = req.body;

    if (!sessionId || !sender || !message) {
      return res.status(400).json({ error: "Missing required fields" });

    // Защита от спама - rate limit
    const rateCheck = spamProtection.checkMessageRateLimit(sessionId);
    if (!rateCheck.allowed) {
      return res.status(429).json({ error: rateCheck.error, message: rateCheck.message });
    }

    // Проверка длины сообщения
    const lengthCheck = spamProtection.checkMessageLength(message);
    if (!lengthCheck.allowed) {
      return res.status(400).json({ error: lengthCheck.error, message: lengthCheck.message });
    }
    }

    // Проверка статуса сессии
    const sessionCheck = await pool.query(
      "SELECT status FROM chat_sessions WHERE id = $1",
      [sessionId]
    );
    
    if (sessionCheck.rows.length > 0 && sessionCheck.rows[0].status === "closed") {
      return res.status(400).json({
        error: "chat_closed",
        message: "Чат завершён. Начните новый чат для продолжения общения."
      });
    }

    // Проверка на мат
    if (containsProfanity(message)) {
      return res.status(400).json({ 
        error: "profanity_detected",
        message: "Сообщение содержит недопустимые выражения. Пожалуйста, выражайтесь корректно."
      });
    }

    // Save message
    const result = await pool.query(`
      INSERT INTO chat_messages (session_id, sender, sender_name, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [sessionId, sender, senderName || null, message]);

    // Update session timestamp и wallet если передан
    if (userWallet) {
      await pool.query(`
        UPDATE chat_sessions 
        SET updated_at = CURRENT_TIMESTAMP, user_wallet = COALESCE(user_wallet, $2)
        WHERE id = $1
      `, [sessionId, userWallet]);
    } else {
      await pool.query(`
        UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1
      `, [sessionId]);
    }

    // Если сообщение от пользователя - пересылаем в Telegram
    if (sender === "user") {
      try {
        const sessionData = await pool.query(
          "SELECT user_name, user_wallet, user_email FROM chat_sessions WHERE id = $1",
          [sessionId]
        );

        if (sessionData.rows.length > 0) {
          const { user_name, user_wallet, user_email } = sessionData.rows[0];
          const wallet = userWallet || user_wallet;
          // Проверка cooldown для Telegram (защита от флуда)
          if (spamProtection.checkTelegramCooldown(sessionId)) {
            await telegram.forwardToSupport(sessionId, user_name, wallet, message, user_email);
          }
        }
      } catch (tgError) {
        console.error("Telegram forward error:", tgError);
      }
    }

    res.json({ message: result.rows[0] });
  } catch (error) {
    console.error("Message error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Request admin help
router.post("/request-admin", async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Проверяем не запрошен ли уже менеджер
    const existingRequest = await pool.query(
      "SELECT needs_admin FROM chat_sessions WHERE id = $1",
      [sessionId]
    );
    
    if (existingRequest.rows[0]?.needs_admin === true) {
      return res.json({ success: true, message: "Already requested" });
    }

    await pool.query(`
      UPDATE chat_sessions
      SET needs_admin = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [sessionId]);

    // Уведомляем в Telegram
    try {
      const sessionData = await pool.query(
        "SELECT user_name, user_wallet, user_email FROM chat_sessions WHERE id = $1",
        [sessionId]
      );

      if (sessionData.rows.length > 0) {
        const { user_name, user_wallet, user_email } = sessionData.rows[0];
      // Проверка cooldown для Telegram
      if (!spamProtection.checkTelegramCooldown(sessionId)) {
        console.log("Telegram cooldown active for session:", sessionId);
      } else {
        await telegram.forwardToSupport(
          sessionId,
          user_name,
          user_wallet,
          "🎧 ЗАПРОС ПОДДЕРЖКИ\n\nПользователь нажал кнопку вызова менеджера и ожидает ответа!",
          user_email
        );
      }
      }
    } catch (tgError) {
      console.error("Telegram notify error:", tgError);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Request admin error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get messages for session (client)
router.get("/messages/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { after } = req.query;

    // Получаем статус сессии
    const sessionResult = await pool.query(
      "SELECT status FROM chat_sessions WHERE id = $1",
      [sessionId]
    );

    let query = `
      SELECT * FROM chat_messages
      WHERE session_id = $1
    `;
    const params = [sessionId];

    if (after) {
      query += ` AND created_at > $2`;
      params.push(after);
    }

    query += ` ORDER BY created_at ASC`;

    const result = await pool.query(query, params);
    
    res.json({ 
      messages: result.rows,
      sessionStatus: sessionResult.rows[0]?.status || "active"
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ============ ADMIN ROUTES ============

// Get all chat sessions (admin)
router.get("/admin/sessions", authenticateToken, async (req, res) => {
  try {
    const { status, needsAdmin } = req.query;

    let query = `
      SELECT
        cs.*,
        (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id AND sender = $1 AND read = false) as unread_count,
        (SELECT message FROM chat_messages WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM chat_sessions cs
      WHERE 1=1
    `;
    const params = ["user"];

    if (status) {
      params.push(status);
      query += ` AND cs.status = $${params.length}`;
    }

    if (needsAdmin === "true") {
      query += ` AND cs.needs_admin = true`;
    }

    query += ` ORDER BY cs.updated_at DESC`;

    const result = await pool.query(query, params);
    res.json({ sessions: result.rows });
  } catch (error) {
    console.error("Admin sessions error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get messages for session (admin)
router.get("/admin/messages/:sessionId", authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await pool.query(
      "SELECT * FROM chat_sessions WHERE id = $1",
      [sessionId]
    );

    const messages = await pool.query(`
      SELECT * FROM chat_messages
      WHERE session_id = $1
      ORDER BY created_at ASC
    `, [sessionId]);

    await pool.query(`
      UPDATE chat_messages
      SET read = true
      WHERE session_id = $1 AND sender = $2
    `, [sessionId, "user"]);

    res.json({
      session: session.rows[0],
      messages: messages.rows
    });
  } catch (error) {
    console.error("Admin messages error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin send message
router.post("/admin/message", authenticateToken, async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const adminId = req.user.id;
    const adminEmail = req.user.email;

    if (!sessionId || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(`
      INSERT INTO chat_messages (session_id, sender, sender_name, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [sessionId, "admin", adminEmail, message]);

    await pool.query(`
      UPDATE chat_sessions
      SET admin_id = $1, needs_admin = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [adminId, sessionId]);

    res.json({ message: result.rows[0] });
  } catch (error) {
    console.error("Admin message error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Close chat session
router.post("/admin/close/:sessionId", authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Добавляем системное сообщение о закрытии чата
    await pool.query(`
      INSERT INTO chat_messages (session_id, sender, sender_name, message)
      VALUES ($1, $2, $3, $4)
    `, [sessionId, "system", "Система", "✅ Чат завершён. Спасибо за обращение! Если у вас появятся новые вопросы, просто напишите нам снова."]);

    // Закрываем сессию
    await pool.query(`
      UPDATE chat_sessions
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, ["closed", sessionId]);

    // Уведомляем в Telegram о закрытии
    try {
      const sessionData = await pool.query(
        "SELECT user_name, telegram_chat_id, telegram_topic_id FROM chat_sessions WHERE id = $1",
        [sessionId]
      );
      
      if (sessionData.rows.length > 0) {
        const { user_name, telegram_chat_id, telegram_topic_id } = sessionData.rows[0];
        if (telegram_chat_id) {
          await telegram.sendMessage(
            telegram_chat_id,
            `✅ Чат с ${user_name} завершён.`,
            { topicId: telegram_topic_id }
          );

          // Закрываем тему в Telegram
          if (telegram_topic_id) {
            await telegram.closeForumTopic(telegram_chat_id, telegram_topic_id);
          }
        }
      }
    } catch (tgError) {
    }

    res.json({ success: true, message: "Чат закрыт" });
  } catch (error) {
    console.error("Close session error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get unread count for admin
router.get("/admin/unread", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(DISTINCT session_id) as count
      FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.id
      WHERE cm.sender = $1 AND cm.read = false AND cs.status = $2
    `, ["user", "active"]);

    res.json({ unread: parseInt(result.rows[0].count) || 0 });
  } catch (error) {
    console.error("Unread count error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
