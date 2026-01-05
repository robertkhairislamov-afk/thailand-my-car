# Thailand My Car - Отчёт и Инструкции по Деплою

## Отчёт о проделанной работе (12-13 декабря 2025)

### 1. Исправление админ-панели

#### Nginx конфигурация
- Исправлен 404 на `/thailand-my-car_admin/`
- Изменено с `alias` на `root` с `^~` location modifier

#### Модальное окно выплаты
- Исправлено отображение кошелька (убрано обрезание адреса)
- Добавлена кнопка "Копировать" с визуальным подтверждением
- Исправлена ширина модалки (maxWidth: 450px)
- Добавлен fallback для копирования в старых браузерах

### 2. Система комиссий
- **Базовая комиссия**: 3% на все выводы
- **Комиссия за ранний вывод**: +5% (до истечения lock-периода)
- Lock-периоды: 6 месяцев (доля в авто), 12 месяцев (стейкинг)

### 3. Ручное создание депозитов (для админа)
- Endpoint `POST /api/admin/investments/create`
- Кнопка "Депозит" у каждого пользователя
- Профессиональная модалка с выбором типа
- Бейдж "РУЧНОЙ" для ручных депозитов
- Toast-уведомления об успехе/ошибке

---

## Серверы

| Сервер | IP | Назначение |
|--------|-----|------------|
| saturway.com | 194.163.164.16 | Админка (статика) |
| saturway.space | (основной) | API, Backend, БД, Фронтенд |

### Доступы
```
SSH saturway.com: ssh bot@194.163.164.16 (пароль: 8560431Xmod)
SSH saturway.space: ssh boot@saturway.space (пароль: 8560431Xmod)
```

---

## Деплой бэкенда

```bash
# 1. Подключиться
ssh boot@saturway.space
cd /home/boot/thailand-my-car/backend

# 2. Пересобрать Docker образ
docker build -t thailand-backend .

# 3. Перезапустить контейнер
docker stop thailand-backend && docker rm thailand-backend
docker run -d \
  --name thailand-backend \
  --network thailand-network \
  --link thailand-postgres:postgres \
  -p 3001:3001 \
  thailand-backend

# 4. Проверить
docker logs thailand-backend --tail 20
curl https://saturway.space/api/investments/tiers
```

---

## Деплой фронтенда

```bash
# 1. Подключиться
ssh boot@saturway.space
cd /home/boot/thailand-my-car

# 2. Пересобрать Docker образ
docker build -t thailand-frontend .

# 3. Перезапустить контейнер
docker stop thailand-frontend && docker rm thailand-frontend
docker run -d \
  --name thailand-frontend \
  --network thailand-network \
  -p 80:80 -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  thailand-frontend

# 4. Проверить
docker logs thailand-frontend --tail 10
```

---

## Деплой админки на saturway.com (одной командой)

```bash
ssh boot@saturway.space
cd /home/boot/thailand-my-car

# Удалить старый билд если есть проблемы с правами
sudo rm -rf build-admin

# Собрать и задеплоить
docker run --rm -v $(pwd):/app -w /app \
  -e VITE_API_URL=https://saturway.space \
  node:20-alpine \
  sh -c "npm run build -- --outDir build-admin --base=/thailand-my-car_admin/" && \
tar czf /tmp/admin-build.tar.gz -C . --exclude='favicon.svg' build-admin && \
sshpass -p '8560431Xmod' scp /tmp/admin-build.tar.gz bot@194.163.164.16:/tmp/ && \
sshpass -p '8560431Xmod' ssh bot@194.163.164.16 \
  "rm -rf /var/www/saturway.com/thailand-my-car_admin/* && \
   cd /var/www/saturway.com/thailand-my-car_admin && \
   tar xzf /tmp/admin-build.tar.gz --strip-components=1"
```

---

## Частые проблемы

### Бэкенд не видит postgres
```bash
# Перезапустить с --link
docker stop thailand-backend && docker rm thailand-backend
docker run -d --name thailand-backend --network thailand-network \
  --link thailand-postgres:postgres -p 3001:3001 thailand-backend
```

### Фронтенд не видит SSL сертификаты
```bash
# Запустить с монтированием /etc/letsencrypt
docker run -d --name thailand-frontend --network thailand-network \
  -p 80:80 -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  thailand-frontend
```

### Ошибка Permission denied на build-admin
```bash
sudo rm -rf /home/boot/thailand-my-car/build-admin
```

---

## URL доступа

- **Основной сайт**: https://saturway.space/thailand-my-car/
- **Testnet**: https://saturway.space/thailand-my-car_testnet/
- **Админка**: https://saturway.com/thailand-my-car_admin/admin

---

Дата: 13 декабря 2025
