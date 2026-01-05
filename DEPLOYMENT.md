# Thailand My Car - Инструкция по деплою

## Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    saturway.space (45.12.135.240)           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐     ┌──────────────────┐              │
│  │ thailand-my-car │────▶│ thailand-backend │              │
│  │   (nginx:alpine)│     │    (Node.js)     │              │
│  │   Порты: 80,443 │     │    Порт: 3001    │              │
│  └─────────────────┘     └──────────────────┘              │
│          │                        │                         │
│          │                        ▼                         │
│          │               ┌──────────────────┐              │
│          │               │ thailand-postgres │              │
│          │               │   (PostgreSQL)   │              │
│          │               │    Порт: 5432    │              │
│          │               └──────────────────┘              │
│          │                                                  │
│          ▼                                                  │
│  /etc/letsencrypt/live/saturway.space/ (SSL сертификаты)   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Сети Docker

- `thailand-network` - основная сеть (backend, postgres)
- `thailand-my-car_thailand-network` - сеть docker-compose

**ВАЖНО:** Frontend контейнер должен быть подключен к ОБЕИМ сетям!

## Файлы конфигурации

| Файл | Описание |
|------|----------|
| `docker-compose.yml` | Конфигурация контейнера frontend |
| `Dockerfile` | Сборка образа (landing + platform + nginx) |
| `nginx.conf` | Конфигурация nginx с SSL и проксированием API |

## Правильный процесс деплоя

### 1. Остановить и удалить старый контейнер
```bash
docker stop thailand-my-car
docker rm thailand-my-car
```

### 2. Пересобрать образ
```bash
cd /home/boot/thailand-my-car
docker-compose build --no-cache
```
⏱️ Занимает ~3-5 минут

### 3. Запустить контейнер
```bash
docker-compose up -d
```

### 4. Подключить к сети thailand-network
```bash
docker network connect thailand-network thailand-my-car
```

### 5. Перезапустить контейнер
```bash
docker restart thailand-my-car
```

### 6. Проверить статус
```bash
docker ps --filter "name=thailand"
```

Ожидаемый результат:
```
thailand-my-car     Up X seconds (healthy)   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
thailand-backend    Up X days                0.0.0.0:3001->3001/tcp
thailand-postgres   Up X days                5432/tcp
```

### 7. Проверить доступность
```bash
curl -s -o /dev/null -w "%{http_code}" https://localhost/thailand-my-car/ -k
```
Должен вернуть `200`

## Частые ошибки

### Ошибка: "host not found in upstream thailand-backend"
**Причина:** Контейнер не подключен к сети `thailand-network`
**Решение:**
```bash
docker network connect thailand-network thailand-my-car
docker restart thailand-my-car
```

### Ошибка: ERR_CONNECTION_REFUSED на saturway.space
**Причина:** Контейнер запущен неправильно (не через docker-compose)
**Решение:** Использовать docker-compose, а не `docker run` напрямую

### Ошибка: Порты 80/443 не слушаются
**Причина:** Контейнер запущен с неправильными портами
**Решение:** Проверить `docker ps` и убедиться что порты 80:80 и 443:443

## НЕ ДЕЛАТЬ

❌ НЕ запускать `docker run nginx:alpine` с монтированием только build папки
❌ НЕ использовать порт 3000 для production (только 80/443)
❌ НЕ забывать подключать к сети `thailand-network`

## Быстрый деплой (одна команда)

```bash
cd /home/boot/thailand-my-car && \
docker stop thailand-my-car 2>/dev/null; \
docker rm thailand-my-car 2>/dev/null; \
docker-compose build --no-cache && \
docker-compose up -d && \
docker network connect thailand-network thailand-my-car && \
docker restart thailand-my-car && \
sleep 3 && \
docker ps --filter "name=thailand-my-car"
```

## Проверка после деплоя

1. Открыть https://saturway.space/ - должен показать landing
2. Открыть https://saturway.space/thailand-my-car/ - должен показать платформу
3. Проверить API: `curl https://saturway.space/api/health`
