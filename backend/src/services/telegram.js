/**
 * Telegram Bot Integration Service
 * Пересылка сообщений из чата сайта в Telegram и обратно
 * Поддержка Topics (тем) для группировки сообщений по клиентам
 */

const pool = require("../config/database");

let config = {
  botToken: null,
  supportChatId: null,
  enabled: false
};

async function loadConfig() {
  try {
    const result = await pool.query(`
      SELECT key, value FROM platform_settings
      WHERE key IN ($1, $2, $3)
    `, ["telegram_bot_token", "telegram_support_chat_id", "telegram_enabled"]);

    result.rows.forEach(row => {
      if (row.key === "telegram_bot_token") config.botToken = row.value;
      if (row.key === "telegram_support_chat_id") config.supportChatId = row.value;
      if (row.key === "telegram_enabled") config.enabled = row.value === "true";
    });

    return config;
  } catch (error) {
    console.error("Failed to load Telegram config:", error);
    return config;
  }
}

async function createForumTopic(chatId, name, iconColor) {
  await loadConfig();
  if (!config.botToken) return { ok: false, error: "Bot token not configured" };

  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/createForumTopic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
        chat_id: chatId,
        name: name.substring(0, 128),
        icon_color: iconColor || 7322096
      })
    });
    const data = await response.json();
    console.log("Created forum topic:", data);
    return data;
  } catch (error) {
    console.error("Telegram createForumTopic error:", error);
    return { ok: false, error: error.message };
  }
}

async function closeForumTopic(chatId, topicId) {
  await loadConfig();
  if (!config.botToken || !topicId) return { ok: false, error: "Not configured" };

  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/closeForumTopic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret_token: process.env.TELEGRAM_WEBHOOK_SECRET, chat_id: chatId, message_thread_id: topicId })
    });
    const data = await response.json();
    console.log("Closed forum topic:", data);
    return data;
  } catch (error) {
    console.error("Telegram closeForumTopic error:", error);
    return { ok: false, error: error.message };
  }
}

async function sendMessage(chatId, text, options = {}) {
  await loadConfig();
  if (!config.botToken) return { ok: false, error: "Bot token not configured" };

  try {
    const body = {
      chat_id: chatId,
      text: text,
      parse_mode: options.parseMode || "HTML"
    };

    if (options.topicId) body.message_thread_id = options.topicId;
    if (options.replyTo) body.reply_to_message_id = options.replyTo;
    if (options.replyMarkup) body.reply_markup = options.replyMarkup;

    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return await response.json();
  } catch (error) {
    console.error("Telegram sendMessage error:", error);
    return { ok: false, error: error.message };
  }
}

async function answerCallbackQuery(callbackQueryId, text) {
  await loadConfig();
  if (!config.botToken) return { ok: false };

  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret_token: process.env.TELEGRAM_WEBHOOK_SECRET, callback_query_id: callbackQueryId, text: text })
    });
    return await response.json();
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function forwardToSupport(sessionId, userName, userWallet, message, userEmail) {
  await loadConfig();

  if (!config.enabled || !config.supportChatId) {
    return { ok: false, error: "Telegram not configured" };
  }

  const sessionResult = await pool.query(
    "SELECT telegram_topic_id FROM chat_sessions WHERE id = $1", [sessionId]
  );
  let topicId = sessionResult.rows[0]?.telegram_topic_id;

  // Создаем тему если нет
  if (!topicId) {
    const shortId = sessionId.substring(0, 6);
    const topicName = `${userName} #${shortId}`;
    const colors = [7322096, 16766590, 13338331, 9367192, 16749490, 16478047];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const topicResult = await createForumTopic(config.supportChatId, topicName, randomColor);

    if (topicResult.ok && topicResult.result) {
      topicId = topicResult.result.message_thread_id;
      await pool.query("UPDATE chat_sessions SET telegram_topic_id = $1 WHERE id = $2", [topicId, sessionId]);

      // Приветственное сообщение с кнопкой закрытия
      let walletInfo = userWallet && userWallet.startsWith("0x")
        ? `<code>${userWallet}</code>` : "<i>не подключён</i>";
      let emailInfo = userEmail ? `\n📧 Email: ${escapeHtml(userEmail)}` : "";

      await sendMessage(config.supportChatId, 
        `👤 <b>Новый клиент:</b> ${escapeHtml(userName)}
💳 Кошелёк: ${walletInfo}${emailInfo}
🆔 Сессия: <code>${sessionId}</code>`, 
        { 
          topicId,
          replyMarkup: JSON.stringify({
            inline_keyboard: [[
              { text: "❌ Закрыть чат", callback_data: `close_${sessionId}` }
            ]]
          })
        }
      );
    }
  }

  const result = await sendMessage(config.supportChatId, `💬 ${escapeHtml(message)}`, { topicId });

  if (result.ok && result.result) {
    await pool.query(`
      UPDATE chat_sessions SET telegram_message_id = $1, telegram_chat_id = $2 WHERE id = $3
    `, [result.result.message_id, config.supportChatId, sessionId]);
  }

  return result;
}

async function handleWebhook(update) {
  await loadConfig();

  // Обработка нажатия кнопки
  if (update.callback_query) {
    const cb = update.callback_query;
    const data = cb.data;

    if (data && data.startsWith("close_")) {
      const sessionId = data.replace("close_", "");
      
      // Получаем данные сессии
      const session = await pool.query(
        "SELECT user_name, telegram_chat_id, telegram_topic_id FROM chat_sessions WHERE id = $1",
        [sessionId]
      );

      if (session.rows.length > 0) {
        const { user_name, telegram_chat_id, telegram_topic_id } = session.rows[0];

        // Добавляем системное сообщение
        await pool.query(`
          INSERT INTO chat_messages (session_id, sender, sender_name, message)
          VALUES ($1, $2, $3, $4)
        `, [sessionId, "system", "Система", "✅ Чат завершён. Спасибо за обращение!"]);

        // Закрываем сессию
        await pool.query("UPDATE chat_sessions SET status = $1 WHERE id = $2", ["closed", sessionId]);

        // Отправляем сообщение и закрываем тему
        await sendMessage(telegram_chat_id, `✅ Чат с ${user_name} завершён.`, { topicId: telegram_topic_id });
        
        if (telegram_topic_id) {
          await closeForumTopic(telegram_chat_id, telegram_topic_id);
        }

        await answerCallbackQuery(cb.id, "Чат закрыт!");
        return { ok: true, action: "chat_closed", sessionId };
      }

      await answerCallbackQuery(cb.id, "Сессия не найдена");
      return { ok: false, error: "Session not found" };
    }

    await answerCallbackQuery(cb.id);
    return { ok: true, action: "callback_handled" };
  }

  // Обработка сообщений
  const msg = update.message;
  if (!msg) return { ok: false, error: "No message in update" };

  const fromChatId = msg.chat.id;
  const topicId = msg.message_thread_id;
  const responseText = msg.text;

  // Команда /start
  if (responseText === "/start" && !topicId) {
    const userName = msg.from.first_name || "User";
    await sendMessage(fromChatId, `Привет, ${userName}! 👋\n\nВаш Chat ID: <code>${fromChatId}</code>`);
    return { ok: true, action: "start_command" };
  }

  // Проверяем что из нашей группы
  if (String(fromChatId) !== String(config.supportChatId)) {
    return { ok: false, error: "Unknown chat" };
  }

  // Ищем сессию по теме
  if (topicId) {
    const session = await pool.query("SELECT id FROM chat_sessions WHERE telegram_topic_id = $1", [topicId]);

    if (session.rows.length > 0 && !msg.from.is_bot) {
      const sessionId = session.rows[0].id;

      await pool.query(`
        INSERT INTO chat_messages (session_id, sender, sender_name, message)
        VALUES ($1, $2, $3, $4)
      `, [sessionId, "admin", "Поддержка", responseText]);

      await pool.query("UPDATE chat_sessions SET needs_admin = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1", [sessionId]);

      return { ok: true, sessionId, message: responseText };
    }
  }

  return { ok: false, error: "Session not found" };
}

async function setWebhook(webhookUrl) {
  await loadConfig();
  if (!config.botToken) return { ok: false, error: "Bot token not configured" };

  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"]
      })
    });
    return await response.json();
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function deleteWebhook() {
  await loadConfig();
  if (!config.botToken) return { ok: false, error: "Bot token not configured" };
  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/deleteWebhook`);
    return await response.json();
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function getWebhookInfo() {
  await loadConfig();
  if (!config.botToken) return { ok: false, error: "Bot token not configured" };
  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/getWebhookInfo`);
    return await response.json();
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function escapeHtml(text) {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

module.exports = {
  loadConfig, sendMessage, createForumTopic, closeForumTopic,
  forwardToSupport, handleWebhook, setWebhook, deleteWebhook, getWebhookInfo, answerCallbackQuery
};
