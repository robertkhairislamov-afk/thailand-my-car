# 🚗 Thailand My Car - Admin Panel

Современная админ-панель для управления крипто-инвестиционной платформой рентал-бизнеса автомобилей в Таиланде.

## 🎨 Дизайн

### Цветовая палитра
- **Primary:** #009696 (Teal) - основные действия
- **Success:** #28B48C (Green) - успешные статусы
- **Gold:** #FFC850 - важные элементы
- **Background:** #143C50 → #0a1f2d (градиент)
- **Text:** #FFFAF0 (Cream white)

### UI Components
- Glassmorphism карточки с backdrop-blur
- Rounded corners (12-24px)
- Smooth animations (Framer Motion)
- Recharts для графиков

## 📁 Структура

```
/components/admin/
  ├── Dashboard.tsx           # Главный дашборд с графиками
  ├── InvestmentDetail.tsx    # Детальная страница инвестиции
  ├── AdminLayout.tsx         # Layout с навигацией
  └── [будущие компоненты]

/AdminApp.tsx                 # Главный роутер админки
```

## 🚀 Доступ к админке

### Development
Откройте в браузере: `http://localhost:5173/admin`

### Production
URL: `https://yourdomain.com/admin`

## 📊 Функциональность

### ✅ Реализовано

#### Dashboard
- 4 статистические карточки с метриками
- Line Chart - динамика инвестиций (6 месяцев)
- Area Chart - накопленный доход
- Pie Chart - распределение по тирам
- Bar Chart - топ инвесторы
- Таймлайн активности
- Alerts для pending инвестиций

#### Investment Detail
- Полная информация об инвестиции
- Blockchain данные (tx hash, block, addresses)
- Информация об инвесторе
- Timeline/история изменений
- Admin notes
- Quick actions (Confirm/Reject)

#### Navigation
- Responsive sidebar (desktop)
- Mobile sidebar с overlay
- Theme toggle (dark/light)
- 7 разделов меню

#### Investments Page
- Таблица всех инвестиций
- Фильтр по статусам
- Переход к деталям
- Цветные статус-бейджи

#### Users Page
- Таблица инвесторов
- Wallet addresses
- Total invested
- Дата регистрации

#### Messages Page
- Список сообщений
- Статусы (New/Read/Replied)
- Карточки с hover эффектами

### 🚧 В разработке

- [ ] Reports (финансовые отчёты)
- [ ] Logs (логи активности)
- [ ] Settings (настройки админа)
- [ ] User Profile Page
- [ ] Message Detail Page
- [ ] Export to CSV
- [ ] Search & Advanced Filters

## 🔌 API Integration

Замените mock данные на реальные API вызовы:

```typescript
// Пример в Dashboard.tsx
const stats = {
  totalRaised: 51000,  // <- Заменить на: await api.getStats()
  monthlyRevenue: 5200,
  activeInvestors: 4,
  // ...
};
```

### API Endpoints (нужно подключить)

```
GET  /api/admin/dashboard/stats
GET  /api/admin/investments
GET  /api/admin/investments/:id
POST /api/admin/investments/:id/confirm
POST /api/admin/investments/:id/reject
GET  /api/admin/users
GET  /api/admin/messages
POST /api/admin/reports
GET  /api/admin/logs
```

## 🎯 Следующие шаги

### Immediate (Week 1)
1. Подключить реальный API вместо mock данных
2. Добавить User Profile Page
3. Добавить Message Detail Page с reply
4. Реализовать Search по инвестициям/users

### Short-term (Week 2-3)
5. Reports CRUD (создание/редактирование отчётов)
6. Activity Logs с фильтрами
7. Settings page (admin profile, campaign settings)
8. Export функциональность (CSV, PDF)

### Long-term (Month 2)
9. Email notifications integration
10. 2FA authentication
11. Advanced analytics
12. Multi-admin support

## 🔐 Безопасность

### Обязательно реализовать:
- [ ] JWT authentication
- [ ] 2FA (Google Authenticator)
- [ ] HTTPS only
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] CSRF protection
- [ ] Admin audit log

### Рекомендации:
```typescript
// middleware/auth.ts
export const requireAdmin = async (req, res, next) => {
  const token = req.headers.authorization;
  // Verify JWT
  // Check admin role
  // Log action
  next();
};
```

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile адаптация
- Sidebar → Bottom navigation
- Tables → Cards
- Modals → Full screen
- Touch-friendly buttons (44x44px min)

## 🎨 Customization

### Изменить цветовую схему:
```typescript
// В каждом компоненте замените цвета:
style={{
  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
  borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
}}
```

### Добавить новый раздел меню:
```typescript
// В AdminLayout.tsx
const menuItems = [
  // ... existing items
  { id: 'analytics', label: 'Аналитика', icon: TrendingUp }
];
```

## 📊 Charts Library (Recharts)

Используемые графики:
- `<LineChart>` - тренды
- `<AreaChart>` - накопленные значения
- `<BarChart>` - сравнения
- `<PieChart>` - распределения

Документация: https://recharts.org/

## 🐛 Debug Mode

Для отладки добавьте в URL: `?debug=true`

```typescript
const isDebug = new URLSearchParams(window.location.search).get('debug');
if (isDebug) {
  console.log('Stats:', stats);
}
```

## 💡 Tips & Tricks

### 1. Быстрый доступ к админке
Добавьте кнопку в Header основного сайта (только для админов):
```typescript
{isAdmin && (
  <button onClick={() => window.location.href = '/admin'}>
    Admin Panel
  </button>
)}
```

### 2. Dark/Light theme persistence
```typescript
useEffect(() => {
  const saved = localStorage.getItem('adminTheme');
  if (saved) setIsDark(saved === 'dark');
}, []);

useEffect(() => {
  localStorage.setItem('adminTheme', isDark ? 'dark' : 'light');
}, [isDark]);
```

### 3. Real-time updates
Используйте WebSockets для live обновлений:
```typescript
useEffect(() => {
  const ws = new WebSocket('wss://api.thailandmycar.com/admin');
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Update stats in real-time
  };
}, []);
```

## 📞 Support

Если возникли вопросы:
- 📧 Email: dev@thailandmycar.com
- 💬 Telegram: @dev_thailandmycar
- 📚 Docs: https://docs.thailandmycar.com/admin

---

**Happy Coding! 🚀**
