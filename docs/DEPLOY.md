# Руководство по деплою SMETA PRO

## Требования

- Docker 24+
- Docker Compose 2.20+
- 2GB RAM минимум
- 10GB свободного места

## Быстрый старт (Docker)

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-org/smeta-pro.git
cd smeta-pro/smeta-generator
```

### 2. Настройка переменных окружения

```bash
# Создайте .env файл в корне проекта
cat > .env << EOF
JWT_SECRET=$(openssl rand -base64 32)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
GOOGLE_AI_API_KEY=your-google-ai-key
EOF
```

### 3. Запуск

```bash
docker compose up -d
```

### 4. Проверка

```bash
# Проверка статуса контейнеров
docker compose ps

# Проверка health check
curl http://localhost:4001/api/health

# Открыть веб-интерфейс
open http://localhost:3005
```

## Порты

| Сервис | Внутренний | Внешний |
|--------|------------|---------|
| API | 4000 | 4001 |
| Web | 80 | 3005 |
| PostgreSQL | 5432 | 5433 |
| Redis | 6379 | 6380 |

## Миграции базы данных

```bash
# Применить миграции
docker compose exec api npx prisma migrate deploy

# Seed данные (опционально)
docker compose exec api npx tsx prisma/seed.ts
```

## Обновление

```bash
# Получить последние изменения
git pull

# Пересобрать и перезапустить
docker compose down
docker compose build --no-cache
docker compose up -d

# Применить миграции
docker compose exec api npx prisma migrate deploy
```

## Откат

### Откат к предыдущей версии

```bash
# Остановить текущую версию
docker compose down

# Переключиться на предыдущий коммит
git checkout HEAD~1

# Запустить
docker compose up -d
```

### Откат миграции БД

```bash
# Откатить последнюю миграцию
docker compose exec api npx prisma migrate reset --skip-seed
```

## Мониторинг

### Логи

```bash
# Все логи
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f api
docker compose logs -f web
```

### Health checks

```bash
# API health
curl http://localhost:4001/api/health

# PostgreSQL
docker compose exec postgres pg_isready -U postgres

# Redis
docker compose exec redis redis-cli ping
```

## Бэкап и восстановление

### Бэкап PostgreSQL

```bash
# Создать бэкап
docker compose exec postgres pg_dump -U postgres smeta_pro > backup_$(date +%Y%m%d).sql

# Восстановить из бэкапа
docker compose exec -T postgres psql -U postgres smeta_pro < backup_20260118.sql
```

### Бэкап Redis

```bash
# Redis автоматически сохраняет данные в volume
# Для ручного сохранения:
docker compose exec redis redis-cli BGSAVE
```

## Troubleshooting

### API не запускается

```bash
# Проверить логи
docker compose logs api

# Проверить переменные окружения
docker compose exec api env | grep -E "DATABASE|JWT|PORT"

# Проверить подключение к БД
docker compose exec api npx prisma db pull
```

### Web не загружается

```bash
# Проверить nginx конфиг
docker compose exec web nginx -t

# Проверить проксирование к API
docker compose exec web curl http://api:4000/api/health
```

### Проблемы с миграциями

```bash
# Сбросить БД (ВНИМАНИЕ: удалит все данные!)
docker compose exec api npx prisma migrate reset

# Пересоздать клиент Prisma
docker compose exec api npx prisma generate
```

## Production рекомендации

1. **Используйте внешнюю БД** - не храните данные в Docker volumes
2. **Настройте SSL** - используйте reverse proxy (nginx, traefik)
3. **Настройте бэкапы** - автоматические ежедневные бэкапы
4. **Мониторинг** - настройте alerting для health checks
5. **Логирование** - отправляйте логи в централизованную систему
