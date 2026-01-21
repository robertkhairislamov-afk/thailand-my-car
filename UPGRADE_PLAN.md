# План обновления зависимостей Thailand My Car

**Создан:** 13 января 2026
**Статус:** В работе

---

## Этап 1: Безопасные обновления (Patch/Minor)

**Статус:** ✅ Завершен (13.01.2026)

### Frontend
- [x] `motion` 12.23.25 → 12.26.2
- [x] `@reown/appkit` 1.8.15 → 1.8.16
- [x] `@reown/appkit-adapter-ethers` 1.8.15 → 1.8.16
- [x] `react-hook-form` 7.68.0 → 7.71.0
- [x] `@types/node` 20.19.26 → 20.19.29 (через Docker build)

### Команды
```bash
# Обновление через package.json + Docker rebuild
docker-compose build --no-cache thailand-app
docker-compose up -d thailand-app
```

### Тестирование после Этапа 1
- [x] Сборка проекта без ошибок
- [x] Страница загружается (HTTP 200)
- [x] Motion библиотека загружена
- [x] API endpoints работают
- [x] Размер бандла стабилен (~2.1MB main)

---

## Этап 2: Minor обновления

**Статус:** ✅ Завершен (13.01.2026)

### Frontend
- [x] `lucide-react` 0.487.0 → 0.562.0

### Команды
```bash
# Обновление через package.json + Docker rebuild
docker-compose build --no-cache thailand-app
docker-compose up -d thailand-app
```

### Тестирование после Этапа 2
- [x] Сборка успешна
- [x] 52 icon chunks загружены
- [x] Размер бандла стабилен (2.1MB)

---

## Этап 3: Backend Major обновления

**Статус:** ⏳ Ожидает выполнения
**Риск:** 🟡 Средний

### Пакеты
- [ ] `helmet` 7.2.0 → 8.1.0
- [ ] `express-rate-limit` 7.5.1 → 8.2.1
- [ ] `bcryptjs` 2.4.3 → 3.0.3
- [ ] `uuid` 9.0.1 → 13.0.0

### Команды
```bash
cd /home/boot/thailand-my-car/backend
npm install helmet@8 express-rate-limit@8 bcryptjs@3 uuid@13
```

### Изменения кода (если требуются)

#### helmet 8
```javascript
// Проверить: новый синтаксис CSP
// Было:
helmet.contentSecurityPolicy({ directives: {...} })
// Стало: возможно изменение API
```

#### uuid 13
```javascript
// Проверить: импорты
// Было: const { v4: uuidv4 } = require('uuid')
// Может потребоваться: import { v4 as uuidv4 } from 'uuid'
```

### Тестирование после Этапа 3
- [ ] Backend запускается без ошибок
- [ ] Health check проходит
- [ ] API `/api/fundraising` отвечает
- [ ] API `/api/investments` работает
- [ ] Rate limiting работает
- [ ] Security headers присутствуют
- [ ] Аутентификация работает

---

## Этап 4: Express 5

**Статус:** ⏳ Ожидает выполнения
**Риск:** 🔴 Высокий

### Пакеты
- [ ] `express` 4.22.1 → 5.2.1

### Изменения кода (обязательные)

#### Асинхронные обработчики ошибок
```javascript
// Express 5 автоматически ловит async ошибки
// Можно убрать try-catch обертки или asyncHandler
```

#### Изменения в Router
```javascript
// Проверить: app.del() удален, использовать app.delete()
// Проверить: req.host вместо req.hostname
```

#### Удаленные методы
```javascript
// res.send(status) - использовать res.status(status).send()
// req.param() - удален
```

### Тестирование после Этапа 4
- [ ] Все API endpoints работают
- [ ] Error handling работает
- [ ] Middleware цепочка работает
- [ ] Stress test пройден

---

## Этап 5: Vite 7

**Статус:** ⏳ Ожидает выполнения
**Риск:** 🔴 Высокий

### Пакеты
- [ ] `vite` 6.4.1 → 7.3.1
- [ ] `@vitejs/plugin-react-swc` 3.11.0 → 4.2.2

### Изменения конфигурации
```javascript
// vite.config.ts - проверить совместимость настроек
// Возможные изменения в build options
```

### Тестирование после Этапа 5
- [ ] `npm run build` успешен
- [ ] `npm run build:testnet` успешен
- [ ] Dev сервер работает
- [ ] HMR работает
- [ ] Размер бандла не увеличился критически

---

## Этап 6: React 19

**Статус:** ⏳ Ожидает выполнения
**Риск:** 🔴 Очень высокий

### Пакеты
- [ ] `react` 18.3.1 → 19.x
- [ ] `react-dom` 18.3.1 → 19.x

### Предварительные требования
- [ ] Vite 7 установлен
- [ ] Все остальные пакеты обновлены

### Изменения кода (обязательные)

#### Новый JSX Transform
```javascript
// Убедиться что используется новый JSX transform
// Не нужен import React from 'react' в каждом файле
```

#### useEffect изменения
```javascript
// React 19 более строго относится к dependencies
// Проверить все useEffect на правильность deps
```

#### Concurrent features
```javascript
// Проверить использование Suspense
// Проверить использование startTransition
```

### Тестирование после Этапа 6
- [ ] Приложение запускается
- [ ] Нет console warnings
- [ ] Все страницы рендерятся
- [ ] Все интерактивные элементы работают
- [ ] Формы работают
- [ ] Модалки работают
- [ ] Анимации работают
- [ ] Web3 интеграция работает

---

## Этап 7: Остальные Major обновления

**Статус:** ⏳ Ожидает выполнения

### Пакеты
- [ ] `recharts` 2.15.4 → 3.6.0
- [ ] `react-day-picker` 8.10.1 → 9.13.0
- [ ] `react-resizable-panels` 2.1.9 → 4.4.0

### Тестирование
- [ ] Dashboard графики работают
- [ ] Date picker работает
- [ ] Resizable panels работают (если используются)

---

## Чеклист финального тестирования

### Функциональность
- [ ] Главная страница загружается
- [ ] Переключение языков (RU/EN/TH)
- [ ] Подключение MetaMask
- [ ] Модалка инвестирования
- [ ] Страница профиля
- [ ] Dashboard
- [ ] Страница контактов
- [ ] Chat widget

### Производительность
- [ ] Lighthouse score > 80
- [ ] First Contentful Paint < 2s
- [ ] Bundle size не увеличился более чем на 10%

### Безопасность
- [ ] `npm audit` - 0 vulnerabilities
- [ ] Security headers присутствуют
- [ ] HTTPS работает

### Кроссбраузерность
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Откат (Rollback)

### При проблемах на любом этапе:
```bash
# Восстановить package.json из git
git checkout HEAD -- package.json package-lock.json

# Переустановить зависимости
rm -rf node_modules
npm install

# Пересобрать контейнеры
docker-compose build --no-cache
docker-compose up -d
```

### Бэкап перед обновлением:
```bash
# Создать бэкап package files
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
cp backend/package.json backend/package.json.backup
cp backend/package-lock.json backend/package-lock.json.backup
```

---

## История обновлений

| Дата | Этап | Статус | Примечания |
|------|------|--------|------------|
| 13.01.2026 | Этап 1 | ✅ Завершен | motion, appkit, react-hook-form обновлены |
| 13.01.2026 | Этап 2 | ✅ Завершен | lucide-react 0.487→0.562 |

---

## Контакты

При возникновении проблем обращаться к DevOps или создать issue в репозитории.
