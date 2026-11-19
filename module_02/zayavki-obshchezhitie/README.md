# Доска заявок «Общежитие» — модуль 2

React + Vite + PocketBase. Заявки хранятся в коллекции `obshchezhitie`, изменения приходят по realtime.

## Запуск

1. PocketBase (папка `module_02/pocketbase`, Docker):
   ```
   docker compose up -d --build
   docker compose exec pocketbase /pb/pocketbase superuser upsert admin@example.com ВАШ_ПАРОЛЬ --dir=/pb/pb_data
   ```
2. Коллекция: создайте `obshchezhitie` по схеме `module_02/pocketbase/obshchezhitie.collection.json` (поля и правила доступа) в панели `http://localhost:8090/_/`, как в главе 2.2. Схему можно передать и через админ-API `POST /api/collections`.
3. Доска:
   ```
   npm install
   npm run dev
   ```
   Откройте `http://localhost:5173/`.

## Проверки

- `npm run build` и `npm run lint` проходят без ошибок.
- Остановите PocketBase (`docker compose stop`): появятся ошибка и кнопка «Повторить».
- Откройте два окна: заявка из одного появляется в другом без F5.

## Не входит в проект

Процессы n8n (ИИ-диспетчер, кнопка «Взять» в Telegram) — вебхук `http://localhost:5678/webhook/zayavka` в `src/notify.ts` — требуют токен бота и запущенный n8n.
