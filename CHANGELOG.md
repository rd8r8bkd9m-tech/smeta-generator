# Changelog

Все значимые изменения в проекте документируются в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/),
и проект следует [Семантическому версионированию](https://semver.org/lang/ru/).

## [1.0.0] - 2026-01-18

### Добавлено

#### Backend (API)
- Express сервер с полным REST API
- Аутентификация через JWT с rate limiting
- Prisma ORM с PostgreSQL
- AI генерация смет (Genkit + Gemini) с demo mode
- ML модели для прогнозирования цен и классификации работ
- Swagger/OpenAPI документация (`/api-docs`)
- Health check с проверкой БД (`/api/health`)
- Rate limiting для защиты от DDoS
- Security headers (helmet)

#### Frontend (Web)
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui компоненты
- PWA с Service Worker и offline поддержкой
- Калькулятор смет с ручным и AI режимами
- Управление проектами и клиентами
- Шаблоны смет
- Адаптивный дизайн

#### Инфраструктура
- Docker Compose для всех сервисов
- CI/CD pipeline (GitHub Actions)
- Автоматические тесты (79 тестов)
- Документация (STATUS, BACKLOG, DEPLOY, QA-CHECKLIST)

### API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Авторизация |
| GET/POST | `/api/projects/*` | Управление проектами |
| GET/POST | `/api/clients/*` | Управление клиентами |
| POST | `/api/calculator/calculate` | Расчет сметы |
| GET | `/api/calculator/templates` | Шаблоны смет |
| POST | `/api/ai/generate` | AI генерация сметы |

### Технологии

- **Runtime:** Node.js 20+
- **Framework:** Express 4.18
- **Database:** PostgreSQL 15 + Prisma 5
- **Cache:** Redis 7
- **AI:** Genkit + Google Gemini
- **Frontend:** React 18 + Vite 5 + Tailwind CSS 3
- **Testing:** Vitest + Supertest
- **CI/CD:** GitHub Actions

### Безопасность

- JWT токены с истечением 7 дней
- Bcrypt хеширование паролей (10 раундов)
- Rate limiting (100 req/min по умолчанию)
- Helmet security headers
- CORS настройка
- Zod валидация входных данных

### Известные ограничения

- Desktop сборка (Electron) не работает на CI
- AI функции требуют GOOGLE_AI_API_KEY (без ключа работает demo mode)
- Mobile приложение в разработке

---

## [Unreleased]

### Планируется

- E2E тесты для frontend (Playwright)
- Mobile приложение (React Native)
- Интеграция с 1С
- Экспорт в Excel/PDF
- Многопользовательский режим с ролями
