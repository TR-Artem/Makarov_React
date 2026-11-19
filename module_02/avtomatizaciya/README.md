# Автоматизация модуля 2 · Общежитие

Три процесса n8n и стенд в Docker: n8n, PocketBase, Ollama с моделью `qwen2.5:3b`.

## Запуск

```
cp .env.example .env      # вписать токен бота
docker compose up -d
docker compose exec ollama ollama pull qwen2.5:3b
```

- n8n — http://localhost:5678
- PocketBase — http://localhost:8090/_/
- Ollama — http://localhost:11434

Коллекция `obshchezhitie` и правила доступа — в `../pocketbase/obshchezhitie.collection.json`.

## Процессы

| Файл | Что делает |
| --- | --- |
| `zayavka-telegram.json` | простой вариант модуля 1: заявка → сообщение в Telegram |
| `ii-dispetcher.json` | модель определяет категорию и срочность, пишет категорию в базу, присылает сообщение с кнопкой «Взять» |
| `knopka-vzyat.json` | раз в 10 секунд забирает нажатия `getUpdates`, переводит заявку в «В работе», меняет сообщение |

Импорт: n8n → новый процесс → вставить JSON в холст (Ctrl+V). После импорта в узлах Telegram указать учётные данные бота и **Chat ID**.

## Порядок публикации

Вебхук `/webhook/zayavka` может слушать только один процесс. Поэтому:

1. Если опубликован `zayavka-telegram` — снять с публикации (**Unpublish**).
2. Опубликовать `ii-dispetcher`.
3. Опубликовать `knopka-vzyat`.

## Что заменено под вариант

- коллекция `requests` → `obshchezhitie`;
- категории: Сантехника, Электрика, Мебель, Интернет;
- «Кабинет» → «Комната»;
- промпт модели описывает срочность общежития (затопление, нет воды или света).

Токен в `.env`, в JSON его нет. `Chat ID` перед сдачей из экспортированных файлов убирается.
