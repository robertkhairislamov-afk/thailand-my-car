# Thailand My Car - Полный анализ проекта

## Обзор

**Thailand My Car** — инвестиционная платформа для участия в бизнесе аренды автомобилей в Таиланде. Инвесторы могут вкладывать USDT (BEP-20 на Binance Smart Chain) и получать пассивный доход.

---

## Архитектура

```
thailand-my-car/
├── src/                    # Frontend React + TypeScript + Vite
├── backend/                # Backend Node.js + Express + PostgreSQL
├── landing/                # Лендинг-страница
└── docker-compose.yml      # Docker конфигурация
```

### Технологический стек

| Компонент | Технология |
|-----------|------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | Node.js, Express.js |
| База данных | PostgreSQL 15 |
| Аутентификация | JWT (7 дней) |
| Блокчейн | BSC (Binance Smart Chain), USDT BEP-20 |
| Верификация | BSCScan API |

---

## Бизнес-логика

### Инвестиционные тиры

#### 1. Стейкинг ($1,000 - $12,399)
- **Доходность**: 2.5% в месяц (30% годовых)
- **Минимум**: $1,000 / 32,650 THB
- **Особенности**:
  - Вывод в любой момент
  - Комиссия 5% при выводе до 6 месяцев
  - Ежемесячное начисление процентов

#### 2. Доля в автомобиле ($12,400+)
- **Доходность**: +20% через 6 месяцев ИЛИ автомобиль
- **Минимум**: $12,400 / 404,600 THB
- **Особенности**:
  - Выбор: забрать +20% ИЛИ ждать авто
  - Автомобиль в собственность после выплаты кредита
  - Приоритет: first come — first served (9 авто)

### Статусы инвестиций

```
pending → confirmed → active → completed
                ↓
           rejected / cancelled / refunded
```

| Статус | Описание |
|--------|----------|
| `pending` | Ожидает подтверждения транзакции |
| `confirmed` | Транзакция подтверждена, ожидает активации |
| `active` | Активная инвестиция, начисляются проценты |
| `completed` | Завершена, выплаты произведены |
| `rejected` | Отклонена администратором |
| `cancelled` | Отменена пользователем |
| `refunded` | Возврат средств |

---

## База данных

### Основные таблицы

#### `users`
```sql
id, email, password_hash, wallet_address, name, phone,
telegram, created_at, is_verified, is_admin
```

#### `investments`
```sql
id (UUID), user_id, tier_id, amount_baht, amount_usd,
wallet_address, tx_hash, status, tier_type (staking/car_share),
investor_choice, staking_earned, car_assigned, car_number,
created_at, confirmed_at
```

#### `platform_settings`
```sql
id, key, value, description, updated_at
```

**Настройки (редактируются в админке):**
| Ключ | Описание | Используется в |
|------|----------|----------------|
| `platform_wallet` | Кошелёк для приёма платежей (BEP-20) | InvestModal, InvestmentTiers |
| `staking_monthly_rate` | Ставка стейкинга в месяц (%) | InvestModal, InvestmentTiers |
| `staking_annual_rate` | Годовой процент стейкинга | InvestmentTiers |
| `large_investor_return` | Возврат для крупных инвесторов (%) | InvestModal, InvestmentTiers |
| `early_withdrawal_fee` | Комиссия за ранний вывод (%) | InvestmentTiers |
| `min_staking_investment_usd` | Мин. сумма для стейкинга ($) | Валидация |
| `min_car_investment_usd` | Мин. сумма для доли в авто ($) | InvestModal, Fundraising |
| `total_cars_available` | Всего авто доступно | Fundraising, Hero |
| `exchange_rate_thb_usd` | Курс THB к USD | InvestModal, Tiers (авто-обновление) |
| `bscscan_api_key` | API ключ BSCScan | TX верификация |

**Важно:** При изменении `exchange_rate_thb_usd` автоматически пересчитываются `min_investment_baht` во всех активных тарифах

#### `chat_sessions` / `chat_messages`
Система чата клиент-админ.

#### `car_assignments`
Отслеживание назначенных автомобилей (1-9).

#### `staking_log`
Лог начислений стейкинга.

---

## API Endpoints

### Публичные

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/investments/tiers` | Список тарифов |
| GET | `/api/investments/settings` | Настройки платформы |
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Авторизация |
| POST | `/api/contact` | Форма обратной связи |
| POST | `/api/chat/session` | Создать чат-сессию |
| POST | `/api/chat/message` | Отправить сообщение |
| GET | `/api/chat/messages/:sessionId` | Получить сообщения |

### Требуют авторизации (JWT)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/profile` | Профиль пользователя |
| PUT | `/api/profile` | Обновить профиль |
| GET | `/api/investments/user` | Инвестиции пользователя |
| POST | `/api/investments` | Создать инвестицию |
| POST | `/api/investments/:id/verify-tx` | Верифицировать транзакцию |
| DELETE | `/api/investments/:id` | Удалить pending инвестицию |

### Админ-панель (требует is_admin)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/admin/login` | Вход в админку |
| GET | `/api/admin/dashboard` | Статистика |
| GET | `/api/admin/investments` | Все инвестиции |
| PATCH | `/api/admin/investments/:id` | Обновить статус |
| GET | `/api/admin/users` | Все пользователи |
| GET | `/api/admin/logs` | Системные логи |
| GET | `/api/admin/chat/sessions` | Все чат-сессии |
| POST | `/api/admin/chat/reply` | Ответить в чате |
| POST | `/api/admin/chat/close` | Закрыть сессию |
| GET | `/api/admin/settings` | Все настройки платформы |
| PATCH | `/api/admin/settings/:key` | Обновить настройку |

---

## Безопасность

### Rate Limiting
```javascript
windowMs: 1 * 60 * 1000,  // 1 минута
max: 200                   // 200 запросов/минуту
```

### Anti-Fraud система

1. **Honeypot поля** — скрытые поля для ботов
2. **Timing Check** — проверка времени заполнения (< 3 сек = бот)
3. **Integrity Hash** — хеш формы для защиты от подмены
4. **IP Rate Limiting** — 10 инвестиций в день с одного IP
5. **Wallet Rate Limiting** — 5 инвестиций в день с одного кошелька
6. **Минимальные суммы** — защита от спама мелкими транзакциями

### Защита критических настроек

**Platform Wallet:**
- Валидация формата BEP-20 адреса (0x + 40 hex символов)
- Требуется PIN-код для изменения
- Модальное окно с предупреждением
- Отображение текущего адреса для сравнения

### JWT Authentication
```javascript
JWT_SECRET: 'thailand_jwt_secret_key_very_secure_2024'
JWT_EXPIRES_IN: '7d'
```

### Headers (Helmet.js)
- XSS Protection
- Content Security Policy
- HSTS
- X-Frame-Options

---

## Frontend компоненты

### Основные страницы
- `App.tsx` — главное приложение
- `AdminApp.tsx` — админ-панель

### Компоненты
```
src/components/
├── thailand/
│   ├── HeroSection.tsx        # Главный баннер
│   ├── InvestmentTiers.tsx    # Карточки тарифов
│   ├── InvestModal.tsx        # Модал инвестирования
│   ├── InvestmentDetail.tsx   # Детали инвестиции
│   ├── CarShowcase.tsx        # Галерея авто
│   ├── ThaiFeatures.tsx       # Преимущества
│   ├── ContactSection.tsx     # Контактная форма
│   └── DashboardSection.tsx   # Дашборд пользователя
├── admin/
│   ├── AdminLayout.tsx        # Layout админки
│   └── AdminChat.tsx          # Чат с клиентами
├── ChatWidget.tsx             # Виджет чата
└── ConnectWallet.tsx          # Подключение кошелька
```

### Состояние
- Локальное состояние через `useState`
- API запросы через `src/services/api.ts`
- Темная/светлая тема

---

## Docker

```yaml
services:
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: thailand_db
      POSTGRES_USER: thailand
      POSTGRES_PASSWORD: thailand_secure_pass_2024
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://thailand:thailand_secure_pass_2024@postgres:5432/thailand_db

  frontend:
    build: .
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
```

---

## Миграции

### Применённые миграции

1. **001_new_business_logic.sql**
   - Создание `platform_settings`
   - Новые тарифы (стейкинг, доля в авто)
   - Дополнительные поля в `investments`
   - Таблицы `car_assignments`, `staking_log`

2. **migrate-antifraud.js**
   - Таблица `fraud_logs`
   - Настройки BSCScan API

3. **migrate-chat.js**
   - Таблицы `chat_sessions`, `chat_messages`

---

## Важные файлы конфигурации

### Backend `.env`
```env
DATABASE_URL=postgresql://thailand:...@postgres:5432/thailand_db
JWT_SECRET=thailand_jwt_secret_key_very_secure_2024
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@thailandmycar.com
ADMIN_PASSWORD=Admin123!@#
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://saturway.space
BSCSCAN_API_KEY=          # Требуется для верификации TX
```

---

## Известные ограничения

1. **BSCScan API Key** не настроен — верификация транзакций не работает
2. **Polling чата** каждые 5 секунд (не WebSocket)
3. **Нет email уведомлений**
4. **Нет 2FA**

---

## Контакты

- **Домен**: saturway.space
- **Admin Email**: admin@thailandmycar.com
- **Platform Wallet**: 0x4182426adacc77effdf7f16fea939d49733e3409

---

## Changelog

| Дата | Изменение |
|------|-----------|
| 2025-12-05 | Добавлена защита platform_wallet (валидация BEP-20, PIN-код, модальное окно) |
| 2025-12-05 | Добавлено управление настройками в админке (GET/PATCH /api/admin/settings) |
| 2025-12-05 | Курс валют теперь динамический (из platform_settings) |
| 2025-12-05 | Авто-обновление min_investment_baht при изменении курса |
| 2025-12-05 | Добавлен exchange_rate_thb_usd в публичный API settings |
| 2025-12-02 | Исправлен дашборд (исключены rejected инвестиции) |
| 2025-12-02 | Добавлена кнопка "Завершить чат" |
| 2025-12-02 | Удалён дубляж сообщений в админке |
| 2025-12-02 | Исправлен 500 error при обновлении статуса инвестиции |
| 2025-12-02 | Добавлена колонка TX Verification в таблицу инвестиций |
| 2025-11-27 | Новая бизнес-логика (стейкинг + доля в авто) |

---

## Админ-панель: Настройки

Путь: `/thailand-my-car/admin` → Настройки

### Редактируемые параметры:
- Кошелёк платформы (с защитой PIN)
- Ставки стейкинга (месяц/год)
- Возврат для крупных инвесторов
- Комиссия за ранний вывод
- Минимальные суммы инвестиций
- Количество авто
- Курс THB/USD
- BSCScan API Key

### Особенности:
- Все изменения логируются в `activity_logs`
- Изменения применяются мгновенно
- Курс валют автоматически пересчитывает тарифы

---

*Документ обновлён: 2025-12-05*
