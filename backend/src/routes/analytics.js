/**
 * Analytics Routes - Простой счётчик посещений
 */

const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

// Кэш для гео-данных (чтобы не спамить ip-api.com)
const geoCache = new Map();
const GEO_CACHE_TTL = 3600000; // 1 час

// Получить гео-данные по IP
async function getGeoData(ip) {
  // Проверяем кэш
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.timestamp < GEO_CACHE_TTL) {
    return cached.data;
  }

  // Пропускаем localhost
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { country: "Local", countryCode: "LO", city: "Local" };
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city`);
    const data = await response.json();
    
    if (data.status === "success") {
      const result = {
        country: data.country || "Unknown",
        countryCode: data.countryCode || "??",
        city: data.city || ""
      };
      geoCache.set(ip, { data: result, timestamp: Date.now() });
      return result;
    }
  } catch (error) {
    console.error("GeoIP error:", error.message);
  }

  return { country: "Unknown", countryCode: "??", city: "" };
}

// Трекинг посещения страницы
router.post("/track", async (req, res) => {
  try {
    const { page, referrer, sessionId } = req.body;
    
    // Получаем реальный IP
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() 
      || req.headers["x-real-ip"] 
      || req.connection.remoteAddress 
      || "unknown";
    
    const userAgent = req.headers["user-agent"] || "";

    // Получаем гео-данные
    const geo = await getGeoData(ip);

    // Сохраняем в БД
    await pool.query(`
      INSERT INTO page_views (ip_address, country, country_code, city, page, referrer, user_agent, session_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [ip, geo.country, geo.countryCode, geo.city, page || "/", referrer || null, userAgent, sessionId || null]);

    res.json({ ok: true });
  } catch (error) {
    console.error("Track error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Alias для совместимости с фронтендом
router.post("/pageview", async (req, res) => {
  try {
    const { page, referrer } = req.body;

    // Получаем реальный IP
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
      || req.headers["x-real-ip"]
      || req.connection.remoteAddress
      || "unknown";

    const userAgent = req.headers["user-agent"] || "";

    // Получаем гео-данные
    const geo = await getGeoData(ip);

    // Сохраняем в БД
    await pool.query(`
      INSERT INTO page_views (ip_address, country, country_code, city, page, referrer, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [ip, geo.country, geo.countryCode, geo.city, page || "/", referrer || null, userAgent]);

    res.json({ ok: true });
  } catch (error) {
    console.error("Track error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ============ ADMIN ROUTES ============

// Получить общую статистику
router.get("/admin/stats", authenticateToken, async (req, res) => {
  try {
    const { period = "7d" } = req.query;
    
    // Определяем период
    let interval;
    switch (period) {
      case "24h": interval = "24 hours"; break;
      case "7d": interval = "7 days"; break;
      case "30d": interval = "30 days"; break;
      case "all": interval = "100 years"; break;
      default: interval = "7 days";
    }

    // Общая статистика
    const totals = await pool.query(`
      SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM page_views
      WHERE created_at > NOW() - INTERVAL '${interval}'
    `);

    // По дням
    const daily = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as sessions
      FROM page_views
      WHERE created_at > NOW() - INTERVAL '${interval}'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // По странам
    const countries = await pool.query(`
      SELECT 
        country,
        country_code,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as sessions
      FROM page_views
      WHERE created_at > NOW() - INTERVAL '${interval}'
        AND country IS NOT NULL
      GROUP BY country, country_code
      ORDER BY views DESC
      LIMIT 20
    `);

    // По страницам
    const pages = await pool.query(`
      SELECT 
        page,
        COUNT(*) as views
      FROM page_views
      WHERE created_at > NOW() - INTERVAL '${interval}'
      GROUP BY page
      ORDER BY views DESC
      LIMIT 10
    `);

    // Сегодня vs вчера
    const today = await pool.query(`
      SELECT COUNT(*) as views FROM page_views
      WHERE created_at > CURRENT_DATE
    `);
    
    const yesterday = await pool.query(`
      SELECT COUNT(*) as views FROM page_views
      WHERE created_at BETWEEN CURRENT_DATE - INTERVAL '1 day' AND CURRENT_DATE
    `);

    res.json({
      period,
      totals: totals.rows[0],
      daily: daily.rows,
      countries: countries.rows,
      pages: pages.rows,
      today: parseInt(today.rows[0].views),
      yesterday: parseInt(yesterday.rows[0].views)
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
