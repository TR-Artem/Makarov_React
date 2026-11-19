# Модуль 2 · Доска заявок общежития и ИИ-диспетчер

Проект на Vite + React + TypeScript. Заявки хранятся в PocketBase, изменения приходят по realtime.

## Что внутри

| Папка | Что это |
| --- | --- |
| `zayavki-obshchezhitie/` | доска: `useRequests`, загрузка с ошибкой и повтором, realtime, отметка «кто взял» |
| `pocketbase/` | `Dockerfile`, `compose.yaml`, схема коллекции `obshchezhitie` с правилами доступа |
| `avtomatizaciya/` | три процесса n8n, стенд n8n + PocketBase + Ollama, инструкция |
| `screenshots/` | снимки для сдачи |

## Выполненные требования

- Своя коллекция `obshchezhitie`: поля как у `requests`, свои категории, обязательные поля.
- Правила: чтение всем, создать только «Новая», изменить без названия, комнаты и подробностей, удалить только «Готово».
- Загрузка из PocketBase с состояниями «Загрузка…» и ошибкой, кнопка «Повторить».
- Добавление, смена статуса и удаление уходят на сервер и сохраняются после F5.
- Код данных в хуке `useRequests`; в `App.tsx` нет `fetch` и эффекта загрузки.
- Заявка из одного окна появляется в другом без F5, без дублей (`upsertRequest`).
- Нет `localStorage` и `storage.ts`.
- ИИ-диспетчер: категория от модели записывается в коллекцию, в Telegram приходит сообщение с кнопкой «Взять».
- «Взять» переводит заявку в «В работе», доска обновляется без F5.
- Дополнительное задание: поле `master`, на карточке «Взял: имя».
- `npm run build` и `npm run lint` проходят.

## Снимки

- `screenshots/telegram-button.png` — сообщение бота с кнопкой «Взять» и отметкой «Взял: Klimovv».
- `screenshots/board-after-take.png` — доска после нажатия: заявки в статусе «В работе».

## Запуск

```
cd avtomatizaciya
cp .env.example .env      # токен бота
docker compose up -d
docker compose exec ollama ollama pull qwen2.5:3b
```

Доска: `cd zayavki-obshchezhitie && npm install && npm run dev`.
PocketBase: http://localhost:8090/_/, n8n: http://localhost:5678.
