# 🚗 Thailand My Car - Crypto Investment Platform

Современная Web3 платформа для инвестирования в рентал-бизнес автомобилей Toyota в Паттайе, Таиланд.

![Thailand My Car](https://img.shields.io/badge/Status-MVP-success)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4)

## 🌟 Особенности

### Основной сайт (User-facing)
- ✅ **Hero секция** с прогресс-баром сбора средств (цель: ฿2.8M / $85,000)
- ✅ **2 инвестиционных тира:**
  - 6 месяцев фиксированный доход (+20% ROI)
  - Долгосрочное участие (ежемесячные дивиденды)
- ✅ **MetaMask интеграция** (готова к подключению)
- ✅ **О проекте** - информация о бизнесе с галереей авто
- ✅ **Roadmap** - план развития проекта
- ✅ **Dashboard для инвесторов** (placeholder)
- ✅ **Тайская тематика** - фоновые изображения тропиков
- ✅ **Dark/Light theme** toggle

### Admin Panel (NEW! 🎉)
- ✅ **Продвинутый Dashboard:**
  - 4 статистические карточки с метриками
  - Line Chart - динамика инвестиций
  - Area Chart - накопленный доход
  - Pie Chart - распределение по тирам
  - Bar Chart - топ инвесторы
  - Activity timeline
  - Alert система для pending actions
  
- ✅ **Investment Management:**
  - Полная таблица инвестиций
  - Детальная страница каждой инвестиции
  - Blockchain данные (tx hash, addresses, block number)
  - Timeline/история изменений
  - Admin notes
  - Quick actions (Approve/Reject)
  
- ✅ **User Management:**
  - Таблица всех инвесторов
  - Wallet addresses
  - Total invested tracking
  - Join dates
  
- ✅ **Messages:**
  - Список сообщений от инвесторов
  - Статусы (New/Read/Replied)
  
- ✅ **Responsive Navigation:**
  - Desktop sidebar
  - Mobile hamburger menu
  - Theme toggle
  - 7 разделов меню

## 🎨 Design System

### Цветовая палитра
```css
Primary:     #009696  /* Teal - основные действия */
Success:     #28B48C  /* Green - успех */
Gold:        #FFC850  /* Важные элементы */
Info:        #5DD9D1  /* Light teal */
Background:  #143C50 → #0a1f2d /* Gradient */
Text:        #FFFAF0  /* Cream white */
```

### Технологии
- **React 18** с TypeScript
- **Tailwind CSS 4.0** для стилей
- **Framer Motion** для анимаций
- **Recharts** для графиков
- **Lucide React** для иконок
- **Vite** для сборки

## 🚀 Быстрый старт

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Откроется на `http://localhost:5173`

### Доступ к админке
Перейдите на `http://localhost:5173/admin`

### Production Build
```bash
npm run build
npm run preview
```

## 📁 Структура проекта

```
thailand-my-car/
├── components/
│   ├── thailand/              # User-facing компоненты
│   │   ├── ThailandHeader.tsx
│   │   ├── Hero.tsx
│   │   ├── AboutProject.tsx
│   │   └── InvestmentTiers.tsx
│   │
│   └── admin/                 # Admin panel компоненты
│       ├── AdminLayout.tsx    # Layout с навигацией
│       ├── Dashboard.tsx      # Главный дашборд
│       └── InvestmentDetail.tsx
│
├── App.tsx                    # Основной сайт
├── AdminApp.tsx              # Admin panel роутер
├── styles/
│   └── globals.css           # Глобальные стили
└── README.md
```

## 🔌 Backend Integration

### API Endpoints (требуется реализация)

**Campaign:**
```
GET  /api/campaign/info        # Статистика кампании
GET  /api/investment-tiers     # Тиры инвестиций
GET  /api/monthly-reports      # Ежемесячные отчёты
```

**Investor:**
```
POST /api/invest/submit        # Отправка инвестиции
GET  /api/investor/dashboard   # Dashboard инвестора
```

**Admin:**
```
POST /api/admin/login                    # Авторизация
GET  /api/admin/dashboard/stats          # Статистика
GET  /api/admin/investments              # Список инвестиций
GET  /api/admin/investments/:id          # Детали
POST /api/admin/investments/:id/confirm  # Подтверждение
POST /api/admin/investments/:id/reject   # Отклонение
GET  /api/admin/users                    # Список юзеров
GET  /api/admin/messages                 # Сообщения
```

См. полную документацию в `/ADMIN_README.md`

## 🎯 Roadmap

### ✅ Завершено (Q4 2024)
- [x] Web3 платформа с MetaMask
- [x] Дизайн и UI/UX
- [x] Admin panel с графиками
- [x] Responsive design

### 🚧 В разработке (Декабрь 2024)
- [ ] Backend API (Node.js + PostgreSQL)
- [ ] Blockchain monitoring
- [ ] Email уведомления
- [ ] Smart contract integration (опционально)

### 📅 Запланировано (Q1 2025)
- [ ] KYC интеграция
- [ ] NFT сертификаты
- [ ] Автоматические выплаты
- [ ] Governance голосования
- [ ] Mobile app

## 💰 Investment Tiers

### Tier 1: 6 месяцев фиксированный доход
- **Min:** $12,400 (฿404,600)
- **ROI:** +20% через 6 месяцев
- **Return:** $14,880 (฿485,520)

### Tier 2: Долгосрочное участие
- **Min:** $12,400 (฿404,600)
- **Dividends:** Ежемесячные выплаты от прибыли
- **Duration:** Ongoing

## 🔐 Безопасность

- JWT authentication для admin
- Web3 signature для инвесторов
- HTTPS only
- Rate limiting
- Input sanitization
- Audit logs

## 📱 Responsive Design

Полностью адаптивный для:
- 📱 Mobile (< 768px)
- 📱 Tablet (768px - 1024px)
- 💻 Desktop (> 1024px)

## 🌍 Локализация

Текущие языки:
- 🇷🇺 Русский (основной)

Планируется:
- 🇬🇧 English
- 🇹🇭 ไทย (Thai)

## 📊 Analytics

Метрики для отслеживания:
- Всего собрано средств
- Количество инвесторов
- Ежемесячный доход
- ROI выплачено
- Pending approvals

## 🤝 Contributing

Проект в активной разработке. Для предложений:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Контакты

- 📧 Email: invest@thailandmycar.com
- 💬 Telegram: @thailandmycar
- 📱 WhatsApp: +66 XX XXX XXXX

## ⚠️ Disclaimer

Инвестиции несут риски. Проект не является финансовой консультацией. Платформа предназначена для квалифицированных инвесторов.

## 📄 License

© 2024 Thailand My Car. All rights reserved.

---

**Made with ❤️ in Thailand 🇹🇭**
