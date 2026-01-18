# 🏗️ SMETA PRO

Профессиональная система сметных расчетов нового поколения

## 🚀 Особенности

- ⚡ **Максимальная производительность** - WASM + WebGPU + SIMD
- 📱 **Mobile-First PWA** - работает как нативное приложение с поддержкой Offline (Dexie)
- 🤖 **Multi-agent AI** - "Строительный институт" из 5 ИИ-агентов для точных расчетов
- 🔧 **Полный функционал** - КС-2, КС-3, М-29, ФЕР, ГЭСН, ТЕР
- 💼 **Единая экосистема** - Синхронизация между Web, Mobile, Desktop и Telegram
- 📊 **Профессиональная аналитика** - Dashboard и визуализация данных

## 🛠️ Технологии

- Frontend: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Node.js + Express + PostgreSQL + Prisma
- WASM: Rust + wasm-bindgen + SIMD
- Mobile: PWA + Service Worker + OPFS
- Desktop: Electron
- Bot: Telegram Bot API

## 📦 Структура проекта

```
smeta-generator/
├── apps/
│   ├── web/              # Unified React PWA (Offline-first)
│   ├── api/              # Central Node.js API (Prisma + Genkit)
│   ├── mobile/           # Native Mobile App (React Native/Expo)
│   ├── desktop/          # Desktop App (Electron)
│   └── telegram-bot/     # Telegram Bot (Integrated with API)
├── packages/
│   ├── core/             # Shared business logic & calculations
│   ├── types/            # Shared TypeScript interfaces
│   ├── ui/               # Shared UI components (shadcn/ui)
│   └── wasm-calculator/  # Rust WASM calculation engine
├── data/
│   ├── normatives/       # Нормативы ФЕР, ГЭСН, ТЕР
│   ├── templates/        # Шаблоны документов
│   └── prices/           # База цен
└── docker/               # Docker конфигурация
```

## 🚀 Быстрый старт

```bash
# Установка зависимостей
pnpm install

# Сборка WASM модулей
pnpm build:wasm

# Запуск в режиме разработки
pnpm dev

# Сборка для production
pnpm build
```

## 📋 Требования

- Node.js 20+
- Rust 1.75+
- PostgreSQL 15+
- pnpm 8+

## 🐳 Docker

```bash
# Запуск всех сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps

# Логи
docker-compose logs -f api
```

**Порты:**
- Web: http://localhost:3005
- API: http://localhost:4001
- Swagger: http://localhost:4001/api-docs

## ⚙️ Переменные окружения

Скопируйте `apps/api/.env.example` в `apps/api/.env` и настройте:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smeta_pro
JWT_SECRET=your-secret-key
GOOGLE_AI_API_KEY=your-google-ai-key  # опционально
```

## 🧪 Тесты

```bash
# Запуск всех тестов
pnpm test

# Тесты API
pnpm --filter api test
```

## 📖 Документация

- [Статус проекта](docs/STATUS.md)
- [Backlog](docs/BACKLOG.md)
- [Руководство по деплою](docs/DEPLOY.md)
- [QA Checklist](docs/QA-CHECKLIST.md)
- [Changelog](CHANGELOG.md)

## 🔗 API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Авторизация |
| POST | `/api/ai/generate` | AI генерация сметы |
| POST | `/api/calculator/calculate` | Расчет сметы |
| GET | `/api/calculator/templates` | Шаблоны |

Полная документация: http://localhost:4001/api-docs

## 📄 Лицензия

MIT
