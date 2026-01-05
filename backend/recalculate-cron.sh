#!/bin/bash
# Скрипт для запуска перерасчёта процентов через cron
# Запускается ежедневно в 00:05

LOGFILE="/home/boot/thailand-my-car/logs/earnings-recalc.log"
mkdir -p /home/boot/thailand-my-car/logs

echo "========================================" >> $LOGFILE
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting recalculation..." >> $LOGFILE

# Запуск через docker exec
sg docker -c "docker exec thailand-backend node /app/src/jobs/recalculateEarnings.js" >> $LOGFILE 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Completed" >> $LOGFILE
echo "" >> $LOGFILE
