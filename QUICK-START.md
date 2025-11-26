# Thailand My Car - Быстрый старт на VPS

## За 5 минут от нуля до работающего приложения

### Предварительные требования
- VPS с Ubuntu 22.04 (2GB RAM, 2 CPU)
- Root доступ по SSH
- IP адрес сервера

---

## Быстрая установка

### 1. Подключитесь к VPS
```bash
ssh root@YOUR_SERVER_IP
```

### 2. Скопируйте и выполните команду установки
```bash
curl -fsSL https://get.docker.com -o get-docker.sh && \
sh get-docker.sh && \
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
chmod +x /usr/local/bin/docker-compose && \
apt install -y git ufw && \
ufw allow 22/tcp && \
ufw allow 80/tcp && \
ufw allow 443/tcp && \
ufw --force enable && \
echo "✅ Docker, Docker Compose, Git и Firewall установлены!"
```

### 3. Загрузите проект
```bash
cd /var/www && \
git clone YOUR_REPO_URL thailand-my-car && \
cd thailand-my-car && \
chmod +x deploy.sh && \
echo "✅ Проект загружен!"
```

**ИЛИ** загрузите файлы через SCP/SFTP в `/var/www/thailand-my-car/`

### 4. Запустите деплой
```bash
./deploy.sh
```

### 5. Готово! 🎉
Откройте в браузере: `http://YOUR_SERVER_IP`

---

## Что дальше?

### Настройка домена
1. Добавьте A-запись в DNS: `yourdomain.com → YOUR_SERVER_IP`
2. Подождите 5-10 минут для распространения DNS
3. Откройте `http://yourdomain.com`

### Установка SSL
```bash
apt install -y certbot python3-certbot-nginx
docker-compose down
certbot certonly --standalone -d yourdomain.com
# Следуйте инструкциям в VPS-DEPLOYMENT.md для настройки SSL
```

### Мониторинг
```bash
# Просмотр логов
docker-compose logs -f

# Статус контейнера
docker ps

# Использование ресурсов
docker stats
```

### Обновление
```bash
cd /var/www/thailand-my-car
git pull
./deploy.sh
```

---

## Полезные команды

```bash
# Перезапуск
docker-compose restart

# Остановка
docker-compose down

# Запуск
docker-compose up -d

# Логи
docker-compose logs --tail=100
```

---

## Проблемы?

Смотрите полную документацию: [VPS-DEPLOYMENT.md](./VPS-DEPLOYMENT.md)

**Поддержка:**
- Telegram: @thailandmycar
- Email: support@thailandmycar.com
