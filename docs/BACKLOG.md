# Backlog проекта SMETA PRO

**Обновлено:** 2026-01-18

---

## P0 - Блокеры релиза

> Нет критических блокеров. Проект готов к релизу.

---

## P1 - Обязательно до релиза

### 1. ~~Создать .env.example~~
- **Симптом:** Нет примера конфигурации, новые разработчики не знают какие переменные нужны
- **Ожидаемое:** Файл .env.example со всеми переменными и комментариями
- **Где чинить:** `/apps/api/.env.example`
- **Как проверить:** `cat apps/api/.env.example` показывает все переменные
- **Статус:** ✅ DONE

### 2. ~~Исправить TypeScript warnings~~
- **Симптом:** 11 warnings при `pnpm lint`
- **Ожидаемое:** 0 warnings
- **Где чинить:** `apps/api/src/routes/ai.ts`, `apps/web/src/pages/TemplatesPage.tsx`
- **Как проверить:** `pnpm lint` без warnings
- **Статус:** ⏳ В процессе (не критично)

### 3. ~~Добавить healthcheck для всех сервисов~~
- **Симптом:** Только API имеет healthcheck
- **Ожидаемое:** Все сервисы имеют healthcheck в docker-compose
- **Где чинить:** `docker-compose.yml`
- **Как проверить:** `docker-compose ps` показывает healthy для всех
- **Статус:** ✅ DONE

### 4. ~~Документировать API~~
- **Симптом:** Нет документации по API endpoints
- **Ожидаемое:** Swagger/OpenAPI документация
- **Где чинить:** `apps/api/src/index.ts`
- **Как проверить:** `/api/docs` показывает Swagger UI
- **Статус:** ⏳ Частично (swagger-jsdoc установлен)

---

## P2 - После релиза

### 1. Исправить Desktop сборку
- **Симптом:** `electron-builder` падает при сборке AppImage
- **Ожидаемое:** Успешная сборка desktop приложения
- **Где чинить:** `apps/desktop/package.json`, electron-builder config
- **Как проверить:** `pnpm --filter @smeta/desktop build` успешно

### 2. Добавить E2E тесты для Frontend
- **Симптом:** Нет автоматических тестов UI
- **Ожидаемое:** Playwright тесты для критических сценариев
- **Где чинить:** `apps/web/e2e/`
- **Как проверить:** `pnpm --filter web test:e2e` проходит

### 3. Настроить CI/CD
- **Симптом:** Нет автоматической проверки PR
- **Ожидаемое:** GitHub Actions для lint/test/build
- **Где чинить:** `.github/workflows/ci.yml`
- **Как проверить:** PR запускает проверки

### 4. Добавить rate limiting
- **Симптом:** API не защищен от DDoS
- **Ожидаемое:** Rate limit на публичных endpoints
- **Где чинить:** `apps/api/src/index.ts`
- **Как проверить:** 429 при превышении лимита

### 5. Добавить логирование
- **Симптом:** Только morgan для HTTP логов
- **Ожидаемое:** Структурированные логи (winston/pino)
- **Где чинить:** `apps/api/src/lib/logger.ts`
- **Как проверить:** JSON логи в stdout

### 6. Mobile приложение
- **Симптом:** React Native scaffold без функционала
- **Ожидаемое:** Полнофункциональное мобильное приложение
- **Где чинить:** `apps/mobile/`
- **Как проверить:** Expo запускается, все экраны работают

---

## Завершенные задачи

- [x] Исправить TypeScript ошибки в тестах (e2e.test.ts)
- [x] Исправить TypeScript ошибки в EstimateTable.tsx
- [x] Проверить работу API health endpoint
- [x] Проверить работу AI генерации (demo mode)
- [x] Проверить работу калькулятора
- [x] Запустить все тесты (79/79 passed)
- [x] Проверить lint (0 errors, 11 warnings)
- [x] Проверить сборку (API, Web, Bot, Core, Types, UI - OK)
