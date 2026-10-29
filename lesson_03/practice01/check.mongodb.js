// Проверка результата приёмки в терминале (подключение к sandbox).
// Запуск: mongosh "mongodb://localhost:27017/sandbox" --quiet --file lesson_03/practice01/check.mongodb.js
// или в Compass: вкладка Aggregations / строка FILTER с этими же условиями.

const box = db.products;

print("Коллекция sandbox.products");
print(`  всего документов:            ${box.countDocuments()}`);
print(`  новинка p-101:               ${box.countDocuments({ _id: "p-101" })}`);
print(`  новинка p-102:               ${box.countDocuments({ _id: "p-102" })}`);
print(`  SKU-CP-018 осталось:         ${box.countDocuments({ sku: "SKU-CP-018" })}`);
print(`  аксессуары с free_shipping:  ${box.countDocuments({ category: "аксессуары", free_shipping: true })}`);
print(`  остатки SKU-NB-001 / PH-006 / PR-010: ` +
      ["SKU-NB-001", "SKU-PH-006", "SKU-PR-010"]
        .map(s => box.findOne({ sku: s }).qty_total).join(" / "));

print("\nТовары категории «аксессуары»:");
box.find({ category: "аксессуары" }, { _id: 1, sku: 1, title: 1, price: 1, qty_total: 1, free_shipping: 1 })
  .forEach(d => print("  " + EJSON.stringify(d)));

print(`\nЭталон shop.products с free_shipping (должно быть 0): ` +
      db.getSiblingDB("shop").products.countDocuments({ free_shipping: true }));
