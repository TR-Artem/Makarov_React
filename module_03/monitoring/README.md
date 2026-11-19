# Мониторинг сайтов группы

React + TypeScript + Vite. Страницы: сводка по сайтам группы, страница сайта с историей проверок, «О проверке». Публикация на GitHub Pages.

## Запуск

```
npm install
npm run dev        # http://localhost:5173/monitoring/
npm run build && npm run preview
node scripts/check.mjs   # ручная проверка сайтов
```

## Публикация

- Settings → Pages → Source: GitHub Actions.
- Ночная проверка (`check.yml`, 00:00 МСК) сохраняет `public/data/results.json` и публикует сайт.
- Секреты репозитория: `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`. Без них сообщения не отправляются.

## Список сайтов

`public/data/sites.json` — сейчас примеры; замените на сайты своей группы (`id` латиницей, название, адрес).
