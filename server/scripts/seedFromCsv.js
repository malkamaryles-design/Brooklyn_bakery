const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const CSV_PATH = path.join(__dirname, '..', '..', 'client', 'public', 'wolt ברוקלין - imageUrl הושלם.csv');
const MONGO_URI = 'mongodb://127.0.0.1:27017/Brooklyn_Bakery?replicaSet=rs0';
function parseLine(line) {
  const parts = line.split(',');
  if (parts.length < 6) return null;
  const category = parts[0].trim();
  const name = parts[1].trim();
  const imageUrl = parts[2].trim();
  const weight_g = Number(parts[parts.length - 1].trim()) || 0;
  const price = Number(parts[parts.length - 2].trim()) || 0;
  const description = parts.slice(3, parts.length - 2).join(',').trim();
  if (!name) return null;
  return { category, name, imageUrl, description, price, weight_g, available: true, unavailableNote: '' };
}
(async () => {
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  const products = [];
  for (let i = 1; i < lines.length; i++) {
    const p = parseLine(lines[i]);
    if (p) products.push(p);
  }
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  await db.collection('products').deleteMany({});
  const result = await db.collection('products').insertMany(products);
  console.log(`Inserted ${result.insertedCount} products`);
  const zeroPrices = products.filter(p => p.price === 0).length;
  console.log(`Zero-price products: ${zeroPrices}`);
  await mongoose.disconnect();
})();