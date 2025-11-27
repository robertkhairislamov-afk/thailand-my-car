# Инструкция по обновлению изображений на VPS

## Что изменилось

### Обновленные файлы:
1. **vite.config.ts** - обновлены пути к изображениям
2. **Изображения заменены:**
   - Старые файлы удалены (3 файла)
   - Новые файлы добавлены (3 файла)

### Новые изображения:
- `src/assets/thailand-background.png` - новый фон сайта
- `src/assets/toyota-yaris.png` - новое фото Toyota Yaris
- `src/assets/toyota-veloz.png` - новое фото Toyota Veloz

---

## Способ 1: Автоматическое обновление через Git (рекомендуется)

На VPS выполните:

```bash
# Перейти в директорию проекта
cd /var/www/thailand-my-car

# Получить изменения
git pull origin main

# Пересобрать и перезапустить
./deploy.sh
```

**Готово!** Изменения применены автоматически.

---

## Способ 2: Точечное обновление (если нужно обновить только изображения)

### Шаг 1: Загрузить новые изображения на VPS

```bash
# На вашем локальном компьютере:
cd C:\321\1\src\assets

# Загрузить файлы на VPS через SCP
scp thailand-background.png root@YOUR_SERVER_IP:/var/www/thailand-my-car/src/assets/
scp toyota-yaris.png root@YOUR_SERVER_IP:/var/www/thailand-my-car/src/assets/
scp toyota-veloz.png root@YOUR_SERVER_IP:/var/www/thailand-my-car/src/assets/
```

### Шаг 2: Удалить старые изображения на VPS

```bash
# На VPS:
cd /var/www/thailand-my-car/src/assets

# Удалить старые файлы
rm -f 5ced44ff814542adbb7d542e23cd5e996dbff908.png
rm -f cf6408d866e0ed42961c4b9ae724562d08a2e003.png
rm -f f4f6aa0cc69c114af6280953f6146b45713388f5.png
```

### Шаг 3: Обновить vite.config.ts на VPS

```bash
# На вашем локальном компьютере:
scp vite.config.ts root@YOUR_SERVER_IP:/var/www/thailand-my-car/
```

**Или вручную отредактировать файл на VPS:**

```bash
# На VPS:
nano /var/www/thailand-my-car/vite.config.ts
```

Измените строки 20-22:

```typescript
// Было:
'figma:asset/f4f6aa0cc69c114af6280953f6146b45713388f5.png': path.resolve(__dirname, './src/assets/f4f6aa0cc69c114af6280953f6146b45713388f5.png'),
'figma:asset/cf6408d866e0ed42961c4b9ae724562d08a2e003.png': path.resolve(__dirname, './src/assets/cf6408d866e0ed42961c4b9ae724562d08a2e003.png'),
'figma:asset/5ced44ff814542adbb7d542e23cd5e996dbff908.png': path.resolve(__dirname, './src/assets/5ced44ff814542adbb7d542e23cd5e996dbff908.png'),

// Стало:
'figma:asset/f4f6aa0cc69c114af6280953f6146b45713388f5.png': path.resolve(__dirname, './src/assets/toyota-yaris.png'),
'figma:asset/cf6408d866e0ed42961c4b9ae724562d08a2e003.png': path.resolve(__dirname, './src/assets/thailand-background.png'),
'figma:asset/5ced44ff814542adbb7d542e23cd5e996dbff908.png': path.resolve(__dirname, './src/assets/toyota-veloz.png'),
```

### Шаг 4: Пересобрать приложение

```bash
# На VPS:
cd /var/www/thailand-my-car
./deploy.sh
```

---

## Способ 3: Через SFTP (FileZilla, WinSCP)

1. Подключитесь к VPS через SFTP
2. Перейдите в `/var/www/thailand-my-car/src/assets/`
3. Удалите 3 старых файла:
   - `5ced44ff814542adbb7d542e23cd5e996dbff908.png`
   - `cf6408d866e0ed42961c4b9ae724562d08a2e003.png`
   - `f4f6aa0cc69c114af6280953f6146b45713388f5.png`
4. Загрузите 3 новых файла:
   - `thailand-background.png`
   - `toyota-yaris.png`
   - `toyota-veloz.png`
5. Загрузите обновленный `vite.config.ts` в корень проекта
6. Выполните на VPS:
   ```bash
   cd /var/www/thailand-my-car
   ./deploy.sh
   ```

---

## Проверка

После обновления откройте в браузере:
- `http://YOUR_SERVER_IP/`

Вы должны увидеть:
- Новый фон на всем сайте
- Новые фотографии автомобилей в секции "О проекте"

---

## Размеры файлов (для проверки)

- `thailand-background.png` - ~8.4 MB
- `toyota-yaris.png` - ~1.9 MB
- `toyota-veloz.png` - ~4.7 MB

**Общий размер:** ~15 MB

---

## Troubleshooting

### Изображения не загружаются
```bash
# Проверить права доступа
cd /var/www/thailand-my-car/src/assets
ls -la *.png

# Установить правильные права
chmod 644 *.png
```

### Ошибка при сборке
```bash
# Очистить кеш и пересобрать
cd /var/www/thailand-my-car
docker-compose down
docker system prune -f
./deploy.sh
```

### Старые изображения все еще показываются
```bash
# Очистить кеш браузера
# Ctrl + Shift + R (Chrome/Firefox)
# Cmd + Shift + R (Mac)

# Или добавить timestamp к URL
# ?v=20251127
```

---

## Rollback (откат изменений)

Если что-то пошло не так:

```bash
cd /var/www/thailand-my-car
git reset --hard HEAD~1
./deploy.sh
```

---

**Дата обновления:** 27 ноября 2024
**Коммит:** Update images - new background and car photos
