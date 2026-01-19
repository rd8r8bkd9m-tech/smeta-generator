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

---

# Status App Deployment

## Quick Start (Status App)

```bash
# Start Status App with MinIO storage
docker compose -f docker-compose.status.yml up -d

# Run migrations
docker compose -f docker-compose.status.yml exec api pnpm db:migrate:deploy

# Check services
docker compose -f docker-compose.status.yml ps
```

### Access Points
- **Mobile Web**: http://localhost:3000
- **API**: http://localhost:4000
- **MinIO Console**: http://localhost:9001

### Environment Variables

```env
# Database
POSTGRES_USER=status
POSTGRES_PASSWORD=secure-password
POSTGRES_DB=status_db

# JWT
JWT_SECRET=your-jwt-secret

# MinIO/S3
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=secure-minio-password
S3_BUCKET_NAME=status-app-media

# Frontend
API_URL=https://api.your-domain.com/api
CORS_ORIGIN=https://your-domain.com
```

## CI/CD Pipeline

### GitHub Actions Workflows

1. **CI** (`.github/workflows/ci.yml`) - Lint, test, build
2. **Deploy** (`.github/workflows/deploy.yml`) - Build & push Docker images

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `STAGING_HOST` | Staging server hostname |
| `STAGING_USER` | SSH username |
| `STAGING_SSH_KEY` | SSH private key |
| `PRODUCTION_HOST` | Production server hostname |
| `PRODUCTION_USER` | SSH username |
| `PRODUCTION_SSH_KEY` | SSH private key |
| `API_URL` | Production API URL |

## S3 Storage Configuration

### For AWS S3
```env
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=status-media
S3_CDN_URL=https://cdn.your-domain.com
```

### For MinIO (Self-hosted)
```env
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=status-app-media
S3_FORCE_PATH_STYLE=true
```
