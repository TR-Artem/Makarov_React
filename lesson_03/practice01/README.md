# ПР-01 · Каталог товаров — решение

Задание: <https://github.com/MaximBytecamp/mongodb-practice/tree/main/practice01>,
отчёт по домашнему заданию — [`../homework_03.md`](../homework_03.md).

- `solution.cpp` — программа каталога на C++17 (mongocxx), решает обе задачи практики;
- `check.mongodb.js` — проверка результата в базе `sandbox` через `mongosh`.

## Как запустить

Стенд и данные берутся из репозитория практик `mongodb-practice`
(склонирован рядом), папка с решением лежит в нём как `lesson_03/practice01`.
Из корня `mongodb-practice`:

```bash
docker compose up -d                                        # MongoDB 7 на localhost:27017
docker compose run --rm reset                               # чистые данные: 21 товар
docker compose run --rm cpp lesson_03/practice01/solution.cpp
docker compose run --rm python practice01/check.py          # Пройдено 12 из 12
```

Проверка базы после работы:

```bash
mongosh "mongodb://localhost:27017/sandbox" --quiet --file lesson_03/practice01/check.mongodb.js
```

Локально без Docker: `g++ -std=c++17 solution.cpp -o solution $(pkg-config --cflags --libs libmongocxx1) -lmongocxx && ./solution`
(нужен `brew install mongo-cxx-driver`). Адрес сервера — переменная `MONGO_URI`.

## Числа с прогона

| Проверка | Значение |
|---|---|
| товаров в `shop.products` | 21 |
| ноутбуков / страниц по 3 | 5 / 2 |
| самый дорогой товар | Ноутбук Apple MacBook Air 13, 114990 ₽ |
| страница 9 | 0 товаров, `total` = 5 |
| поиск «ноутбуки ≤ 69990 ₽» | 3 товара |
| позиций в `sandbox` после приёмки | 22 |
| остатки `SKU-NB-001` / `SKU-PH-006` / `SKU-PR-010` | 5 / 12 / 3 |
| аксессуаров с `free_shipping` | 5 |
| снято с продажи | 1 (`SKU-CP-018`) |
| правок в эталонной `shop` | 0 |
