// Практическая работа 01 «Каталог товаров» — ДЗ № 3.
//
// Задача 1: витрина каталога — одна страница списка товаров (база shop, только чтение).
// Задача 2: приёмка поставки — остатки, новинки, снятие с продажи (база sandbox).
//
// Сборка и запуск (в контейнере практик, из корня mongodb-practice):
//   docker compose run --rm cpp lesson_03/practice01/solution.cpp
// Сборка и запуск на своей машине:
//   g++ -std=c++17 solution.cpp -o solution $(pkg-config --cflags --libs libmongocxx1) -lmongocxx
//   ./solution
// Адрес сервера задаётся переменной MONGO_URI, по умолчанию mongodb://localhost:27017.

#include <bsoncxx/builder/basic/array.hpp>
#include <bsoncxx/builder/basic/document.hpp>
#include <bsoncxx/builder/basic/kvp.hpp>
#include <bsoncxx/json.hpp>
#include <bsoncxx/types/bson_value/view.hpp>
#include <mongocxx/client.hpp>
#include <mongocxx/exception/bulk_write_exception.hpp>
#include <mongocxx/exception/exception.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/options/find.hpp>
#include <mongocxx/options/insert.hpp>
#include <mongocxx/options/update.hpp>
#include <mongocxx/uri.hpp>

#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <map>
#include <string>
#include <utility>
#include <vector>

using bsoncxx::builder::basic::array;
using bsoncxx::builder::basic::document;
using bsoncxx::builder::basic::kvp;
using bsoncxx::builder::basic::make_array;
using bsoncxx::builder::basic::make_document;

struct Product {
    std::string sku;
    std::string title;
    long long price = 0;
    double rating = 0.0;
};

// Цена в данных лежит числом (int32 или int64) — приводим оба случая.
long long to_int64(const bsoncxx::types::bson_value::view& v) {
    switch (v.type()) {
        case bsoncxx::type::k_int32:  return v.get_int32().value;
        case bsoncxx::type::k_int64:  return v.get_int64().value;
        case bsoncxx::type::k_double: return static_cast<long long>(v.get_double().value);
        default: return 0;
    }
}

// Задача 1. Страница каталога: (товары, всего товаров под фильтром).
std::pair<std::vector<Product>, long long> catalog_page(
    mongocxx::collection& products, const std::string& category,
    long long page, long long per_page,
    const std::string& sort_field = "price", bool desc = true) {

    document q{};
    if (!category.empty()) q.append(kvp("category", category));
    auto filter = q.extract();

    const long long total = products.count_documents(filter.view());

    mongocxx::options::find opts;
    opts.projection(make_document(kvp("_id", 0), kvp("sku", 1),
                                  kvp("title", 1), kvp("price", 1),
                                  kvp("rating", 1)));
    // второй ключ sku делает порядок однозначным между страницами
    opts.sort(make_document(kvp(sort_field, desc ? -1 : 1), kvp("sku", 1)));
    opts.skip((page - 1) * per_page);
    opts.limit(per_page);

    std::vector<Product> items;
    for (auto&& doc : products.find(filter.view(), opts)) {
        Product p;
        p.sku = std::string(doc["sku"].get_string().value);
        p.title = std::string(doc["title"].get_string().value);
        p.price = to_int64(doc["price"].get_value());
        p.rating = doc["rating"].get_double().value;
        items.push_back(p);
    }
    return {items, total};
}

// ── Задача 2. Приёмка поставки ────────────────────────────────────
const std::map<std::string, std::int32_t> ARRIVED = {
    {"SKU-NB-001", 5},
    {"SKU-PH-006", 12},
    {"SKU-PR-010", 3},
};

const std::vector<std::string> NEW_ITEMS_JSON = {
    R"({"_id":"p-101","sku":"SKU-AC-101","title":"Подставка для ноутбука","brand":"OEM","category":"аксессуары","price":{"$numberLong":"2490"},"reviews":{"$numberLong":"0"}})",
    R"({"_id":"p-102","sku":"SKU-AC-102","title":"Чехол для планшета","brand":"OEM","category":"аксессуары","price":{"$numberLong":"1890"},"reviews":{"$numberLong":"0"}})",
};

const std::vector<std::string> DISCONTINUED = {"SKU-CP-018"};

// Поиск/фильтрация каталога: артикулы из списка и цена до указанной.
void search_products(mongocxx::collection& products) {
    std::cout << "\n" << std::string(62, '=') << "\n"
              << "ПОИСК · фильтр по категории и цене\n"
              << std::string(62, '=') << "\n";

    auto query = make_document(kvp("category", "ноутбуки"),
                               kvp("price", make_document(kvp("$lte", 69990))));
    std::cout << "  фильтр: категория «ноутбуки», цена ≤ 69990 ₽ → найдено "
              << products.count_documents(query.view()) << "\n";

    mongocxx::options::find opts;
    opts.projection(make_document(kvp("_id", 0), kvp("sku", 1), kvp("title", 1),
                                  kvp("price", 1), kvp("rating", 1)));
    opts.sort(make_document(kvp("price", -1), kvp("sku", 1)));
    for (auto&& doc : products.find(query.view(), opts)) {
        Product p;
        p.sku = std::string(doc["sku"].get_string().value);
        p.title = std::string(doc["title"].get_string().value);
        p.price = to_int64(doc["price"].get_value());
        p.rating = doc["rating"].get_double().value;
        std::cout << "  " << p.price << " ₽  " << p.title
                  << " (" << p.sku << ")  рейтинг " << p.rating << "\n";
    }

    // Оператор $in: значение поля есть в списке.
    auto in_query = make_document(kvp("sku", make_document(kvp("$in", make_array("SKU-NB-001", "SKU-CP-018")))));
    std::cout << "\n  $in {sku: [SKU-NB-001, SKU-CP-018]} → найдено "
              << products.count_documents(in_query.view()) << "\n";
    mongocxx::options::find name_only;
    name_only.projection(make_document(kvp("_id", 0), kvp("sku", 1), kvp("title", 1)));
    for (auto&& doc : products.find(in_query.view(), name_only))
        std::cout << "    " << bsoncxx::to_json(doc) << "\n";
}

// Ширина строки в «знаках»: русские буквы в UTF-8 занимают по два байта.
size_t width(const std::string& s) {
    size_t n = 0;
    for (unsigned char c : s) if ((c & 0xC0) != 0x80) ++n;
    return n;
}

void receive_supply(mongocxx::collection& box) {
    std::cout << "\n" << std::string(62, '=') << "\n"
              << "ЗАДАЧА 2 · приёмка поставки\n"
              << std::string(62, '=') << "\n";

    std::vector<std::pair<std::string, long long>> report;

    // 1. $inc прибавляет на сервере, ничего не читая на клиент.
    long long updated = 0;
    for (const auto& [sku, qty] : ARRIVED) {
        auto inc = make_document(kvp("qty_total", qty));
        auto res = box.update_one(make_document(kvp("sku", sku)),
                                  make_document(kvp("$inc", inc)));
        if (res->matched_count() == 0)
            std::cout << "  ВНИМАНИЕ: артикул " << sku << " не найден в каталоге\n";
        updated += static_cast<long long>(res->modified_count());
    }
    report.emplace_back("остатки обновлены", updated);

    // 2. Новинки со своим _id: повторный запуск упрётся в E11000, а не создаст дубли.
    std::vector<bsoncxx::document::value> new_items;
    for (const auto& json : NEW_ITEMS_JSON)
        new_items.push_back(bsoncxx::from_json(json));

    mongocxx::options::insert insert_opts;
    insert_opts.ordered(false);
    long long added = 0;
    try {
        auto many = box.insert_many(new_items, insert_opts);
        added = static_cast<long long>(many->inserted_count());
    } catch (const mongocxx::bulk_write_exception& error) {
        // список неудач лежит в raw_server_error()["writeErrors"]
        long long already = 0;
        if (auto raw = error.raw_server_error()) {
            if (raw->view()["writeErrors"] &&
                raw->view()["writeErrors"].type() == bsoncxx::type::k_array)
                already = static_cast<long long>(
                    raw->view()["writeErrors"].get_array().value.length());
        }
        added = static_cast<long long>(NEW_ITEMS_JSON.size()) - already;
        std::cout << "  " << already << " позиций уже были в каталоге — пропущены\n";
    }
    report.emplace_back("новых позиций", added);

    // 3. Перед удалением — посчитать и показать, что попадёт под него.
    array skus{array{}};
    for (const auto& s : DISCONTINUED) skus.append(s);
    auto discontinued_q = make_document(kvp("sku", make_document(kvp("$in", skus))));

    std::cout << "\n  под снятие с продажи попало: "
              << box.count_documents(discontinued_q.view()) << "\n";

    mongocxx::options::find preview;
    preview.projection(make_document(kvp("_id", 1), kvp("title", 1), kvp("price", 1)));
    for (auto&& doc : box.find(discontinued_q.view(), preview))
        std::cout << "    " << bsoncxx::to_json(doc) << "\n";

    report.emplace_back("снято с продажи",
                        static_cast<long long>(box.delete_many(discontinued_q.view())->deleted_count()));

    // 4. Бесплатная доставка всей категории одним запросом.
    auto accessories = make_document(kvp("category", "аксессуары"));
    std::cout << "\n  бесплатная доставка коснётся: "
              << box.count_documents(accessories.view()) << " товаров\n";

    mongocxx::options::update upd;
    auto res = box.update_many(accessories.view(),
                               make_document(kvp("$set", make_document(kvp("free_shipping", true)))),
                               upd);
    report.emplace_back("бесплатная доставка", static_cast<long long>(res->modified_count()));

    report.emplace_back("итого в каталоге",
                        static_cast<long long>(box.count_documents(make_document())));

    std::cout << "\nОтчёт о приёмке:\n";
    for (const auto& [name, value] : report) {
        std::cout << "  " << name;
        for (size_t i = width(name); i < 24; ++i) std::cout << ' ';
        std::cout << value << "\n";
    }
}

int main() {
    mongocxx::instance inst{};
    const char* uri_env = std::getenv("MONGO_URI");
    try {
        mongocxx::client client{mongocxx::uri{uri_env ? uri_env : "mongodb://localhost:27017"}};
        auto products = client["shop"]["products"];   // только читаем
        auto box = client["sandbox"]["products"];   // здесь меняем

        std::cout << std::string(62, '=') << "\n"
                  << "ЗАДАЧА 1 · витрина каталога\n"
                  << std::string(62, '=') << "\n";

        auto [items, total] = catalog_page(products, "ноутбуки", 1, 3);
        const long long pages = (total + 2) / 3;
        std::cout << "\nНоутбуки, страница 1 из " << pages << " (всего " << total << "):\n";
        for (const auto& p : items)
            std::cout << "  " << p.price << " ₽  " << p.title
                      << "  рейтинг " << p.rating << "\n";

        auto [items2, _t2] = catalog_page(products, "ноутбуки", 2, 3);
        std::cout << "\nСтраница 2:\n";
        for (const auto& p : items2)
            std::cout << "  " << p.price << " ₽  " << p.title
                      << "  рейтинг " << p.rating << "\n";

        auto [top5, all_total] = catalog_page(products, "", 1, 5);
        std::cout << "\nВесь каталог, топ-5 по цене (всего " << all_total << "):\n";
        for (const auto& p : top5)
            std::cout << "  " << p.price << " ₽  " << p.title << "\n";

        // Страница за пределами данных — пустой список, total прежний.
        auto [far, far_total] = catalog_page(products, "ноутбуки", 9, 3);
        std::cout << "\nСтраница 9 из существующих " << pages << ": найдено "
                  << far.size() << " товаров, total по-прежнему " << far_total << "\n";

        search_products(products);
        receive_supply(box);
    } catch (const mongocxx::exception& e) {
        std::cerr << "Ошибка MongoDB: " << e.what() << "\n";
        return 1;
    }
    return 0;
}
