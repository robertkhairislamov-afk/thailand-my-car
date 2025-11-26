# Thailand My Car - VPS Deployment Guide

## Требования к VPS серверу

### Минимальные характеристики:
- **CPU:** 2 ядра
- **RAM:** 2GB
- **Disk:** 20GB SSD
- **OS:** Ubuntu 22.04 LTS / Debian 11+
- **Network:** 100 Mbps

### Рекомендуемые провайдеры:
- DigitalOcean (Droplet $12/месяц)
- Hetzner Cloud (CX21 ~€5/месяц)
- Vultr (Regular Performance $12/месяц)
- Linode (Shared CPU 4GB $24/месяц)

---

## Шаг 1: Подготовка VPS сервера

### 1.1 Подключение к серверу
```bash
ssh root@YOUR_SERVER_IP
```

### 1.2 Обновление системы
```bash
apt update && apt upgrade -y
```

### 1.3 Установка Docker
```bash
# Установка необходимых пакетов
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Добавление Docker GPG ключа
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

# Добавление Docker репозитория
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Установка Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io

# Проверка установки
docker --version
```

### 1.4 Установка Docker Compose
```bash
# Скачивание последней версии
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Установка прав
chmod +x /usr/local/bin/docker-compose

# Проверка
docker-compose --version
```

### 1.5 Установка Git
```bash
apt install -y git
```

### 1.6 Настройка firewall
```bash
# Установка UFW
apt install -y ufw

# Разрешение SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Включение firewall
ufw --force enable
ufw status
```

---

## Шаг 2: Загрузка проекта на VPS

### Вариант A: Через Git (рекомендуется)

```bash
# Создание директории для проекта
mkdir -p /var/www
cd /var/www

# Клонирование репозитория
git clone https://github.com/YOUR_USERNAME/thailand-my-car.git
cd thailand-my-car

# Если репозиторий приватный
git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/thailand-my-car.git
```

### Вариант B: Через SCP (прямая загрузка)

**На вашем локальном компьютере:**
```bash
# Создание архива проекта
cd C:\321\1
tar -czf thailand-my-car.tar.gz .

# Загрузка на VPS
scp thailand-my-car.tar.gz root@YOUR_SERVER_IP:/var/www/

# На VPS сервере:
cd /var/www
tar -xzf thailand-my-car.tar.gz
rm thailand-my-car.tar.gz
```

### Вариант C: Через SFTP (FileZilla, WinSCP)

1. Подключитесь к серверу через SFTP
2. Загрузите все файлы в `/var/www/thailand-my-car/`

---

## Шаг 3: Деплой приложения

### 3.1 Переход в директорию проекта
```bash
cd /var/www/thailand-my-car
```

### 3.2 Установка прав на скрипт
```bash
chmod +x deploy.sh
```

### 3.3 Запуск деплоя
```bash
./deploy.sh
```

Скрипт автоматически:
- Соберет Docker образ
- Запустит контейнер
- Проверит работоспособность
- Очистит старые образы

---

## Шаг 4: Настройка домена (опционально)

### 4.1 Добавление DNS записей

В панели управления доменом добавьте A-запись:
```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 3600
```

Для поддомена:
```
Type: A
Name: app
Value: YOUR_SERVER_IP
TTL: 3600
```

### 4.2 Настройка SSL (Let's Encrypt)

```bash
# Установка Certbot
apt install -y certbot python3-certbot-nginx

# Остановка контейнера временно
docker-compose down

# Получение сертификата
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Обновление nginx.conf для SSL
# Добавьте в nginx.conf:
```

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... остальная конфигурация
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

```bash
# Обновление docker-compose.yml для монтирования сертификатов
# Добавьте в volumes:
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro

# Перезапуск
docker-compose up -d
```

### 4.3 Автообновление SSL сертификата
```bash
# Добавить в crontab
crontab -e

# Добавить строку:
0 0 1 * * certbot renew --quiet && docker-compose restart
```

---

## Шаг 5: Мониторинг и обслуживание

### Просмотр логов
```bash
# Все логи
docker-compose logs -f

# Последние 100 строк
docker-compose logs --tail=100

# Логи конкретного сервиса
docker logs thailand-my-car
```

### Проверка статуса
```bash
# Статус контейнера
docker ps

# Использование ресурсов
docker stats thailand-my-car

# Health check
curl http://localhost/health
```

### Перезапуск приложения
```bash
docker-compose restart
```

### Остановка приложения
```bash
docker-compose down
```

### Обновление приложения
```bash
# Если используете Git
git pull origin main
./deploy.sh

# Или просто
./deploy.sh
```

---

## Шаг 6: Backup и восстановление

### Создание backup
```bash
# Backup кода
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/thailand-my-car

# Backup Docker образа
docker save thailand-my-car:latest | gzip > thailand-my-car-image.tar.gz
```

### Восстановление
```bash
# Восстановление кода
tar -xzf backup-YYYYMMDD.tar.gz -C /

# Восстановление образа
docker load < thailand-my-car-image.tar.gz
docker-compose up -d
```

---

## Шаг 7: Настройка автозапуска

```bash
# Docker уже настроен на автозапуск при перезагрузке системы
# Проверка
systemctl is-enabled docker

# Если не включен
systemctl enable docker
```

---

## Полезные команды

### Очистка Docker
```bash
# Удалить все неиспользуемые образы
docker image prune -a

# Удалить все неиспользуемые контейнеры
docker container prune

# Полная очистка
docker system prune -a --volumes
```

### Проверка использования диска
```bash
df -h
du -sh /var/www/thailand-my-car
```

### Мониторинг ресурсов
```bash
# CPU и RAM
htop

# Если htop не установлен
apt install -y htop
```

---

## Troubleshooting

### Проблема: Контейнер не запускается
```bash
# Просмотр логов
docker-compose logs

# Пересборка без кеша
docker-compose build --no-cache
docker-compose up -d
```

### Проблема: Порт 80 занят
```bash
# Проверка что использует порт
netstat -tulpn | grep :80

# Остановка nginx если установлен
systemctl stop nginx
systemctl disable nginx
```

### Проблема: Нет доступа из интернета
```bash
# Проверка firewall
ufw status

# Проверка что контейнер слушает порт
netstat -tulpn | grep :80
```

---

## Контакты для поддержки

При возникновении проблем:
- Email: support@thailandmycar.com
- Telegram: @thailandmycar
- GitHub Issues: https://github.com/YOUR_USERNAME/thailand-my-car/issues

---

## Чеклист деплоя

- [ ] VPS сервер создан и доступен
- [ ] Docker и Docker Compose установлены
- [ ] Firewall настроен (порты 22, 80, 443)
- [ ] Проект загружен на сервер
- [ ] Скрипт deploy.sh имеет права на выполнение
- [ ] Деплой выполнен успешно (./deploy.sh)
- [ ] Приложение доступно по IP адресу
- [ ] (Опционально) Домен настроен и работает
- [ ] (Опционально) SSL сертификат установлен
- [ ] Мониторинг настроен

**Поздравляем! Ваше приложение развернуто на VPS! 🎉**
