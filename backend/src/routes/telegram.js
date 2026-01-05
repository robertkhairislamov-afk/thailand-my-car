/**
 * Telegram Webhook Routes
 */

const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const telegram = require("../services/telegram");
const { authenticateToken, requireSuperAdmin } = require("../middleware/auth");

// Webhook endpoint (Telegram будет слать сюда)
router.post("/webhook", async (req, res) => {
  try {
    // Verify webhook secret token
    const secretToken = req.headers["x-telegram-bot-api-secret-token"];
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    
    if (expectedSecret && secretToken !== expectedSecret) {
      console.log("Telegram webhook: Invalid secret token");
      return res.status(403).json({ error: "Invalid secret token" });
    }

    console.log("Telegram webhook received:", JSON.stringify(req.body).substring(0, 500));

    const result = await telegram.handleWebhook(req.body);

    if (result.ok) {
      console.log("Webhook processed successfully:", result);
    } else {
      console.log("Webhook not processed:", result.error);
    }

    // Всегда отвечаем 200 чтобы Telegram не повторял запрос
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(200).json({ ok: true }); // Всё равно 200
  }
});

// ============ ADMIN ROUTES ============

// Получить текущие настройки Telegram
router.get("/settings", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT key, value FROM platform_settings
      WHERE key LIKE $1
    `, ["telegram_%"]);

    const settings = {};
    result.rows.forEach(row => {
      // Маскируем токен для безопасности
      if (row.key === "telegram_bot_token" && row.value) {
        settings[row.key] = row.value.substring(0, 10) + "..." + row.value.slice(-5);
        settings.telegram_bot_token_set = true;
      } else {
        settings[row.key] = row.value;
      }
    });

    // Получаем информацию о webhook
    const webhookInfo = await telegram.getWebhookInfo();

    res.json({
      settings,
      webhook: webhookInfo.ok ? webhookInfo.result : null,
      secretConfigured: !!process.env.TELEGRAM_WEBHOOK_SECRET
    });
  } catch (error) {
    console.error("Get telegram settings error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Обновить настройки Telegram
router.put("/settings", authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { telegram_bot_token, telegram_support_chat_id, telegram_enabled } = req.body;

    const updates = [];

    if (telegram_bot_token !== undefined) {
      updates.push(pool.query(`
        INSERT INTO platform_settings (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = $2
      `, ["telegram_bot_token", telegram_bot_token]));
    }

    if (telegram_support_chat_id !== undefined) {
      updates.push(pool.query(`
        INSERT INTO platform_settings (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = $2
      `, ["telegram_support_chat_id", String(telegram_support_chat_id)]));
    }

    if (telegram_enabled !== undefined) {
      updates.push(pool.query(`
        INSERT INTO platform_settings (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = $2
      `, ["telegram_enabled", String(telegram_enabled)]));
    }

    await Promise.all(updates);

    res.json({ success: true, message: "Настройки обновлены" });
  } catch (error) {
    console.error("Update telegram settings error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Установить webhook
router.post("/webhook/setup", authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const webhookUrl = "https://saturway.space/api/telegram/webhook";

    const result = await telegram.setWebhook(webhookUrl);

    if (result.ok) {
      res.json({ 
        success: true, 
        message: "Webhook установлен с secret token", 
        url: webhookUrl,
        secretConfigured: !!process.env.TELEGRAM_WEBHOOK_SECRET
      });
    } else {
      res.status(400).json({ error: result.description || "Ошибка установки webhook" });
    }
  } catch (error) {
    console.error("Setup webhook error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Удалить webhook
router.delete("/webhook", authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const result = await telegram.deleteWebhook();

    if (result.ok) {
      res.json({ success: true, message: "Webhook удалён" });
    } else {
      res.status(400).json({ error: result.description || "Ошибка удаления webhook" });
    }
  } catch (error) {
    console.error("Delete webhook error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Отправить тестовое сообщение
router.post("/test", authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const config = await telegram.loadConfig();

    if (!config.botToken || !config.supportChatId) {
      return res.status(400).json({
        error: "Сначала настройте Bot Token и Chat ID поддержки"
      });
    }

    const result = await telegram.sendMessage(
      config.supportChatId,
      "🔔 <b>Тестовое сообщение</b>\n\nТelegram интеграция работает корректно!\n\n<i>Это сообщение отправлено из админки Thailand My Car</i>"
    );

    if (result.ok) {
      res.json({ success: true, message: "Тестовое сообщение отправлено!" });
    } else {
      res.status(400).json({ error: result.description || "Ошибка отправки" });
    }
  } catch (error) {
    console.error("Test message error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
