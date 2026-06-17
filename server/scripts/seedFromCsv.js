const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({
  path: path.join(__dirname, '..', '..', '.env')
});

const CSV_PATH = path.join(
  __dirname,
  '..',
  '..',
  'client',
  'public',
  'wolt ברוקלין - imageUrl הושלם.csv'
);

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is missing. Check that .env exists in the project root.');
  process.exit(1);
}

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

  return {
    category,
    name,
    imageUrl,
    description,
    price,
    weight_g,
    available: true,
    unavailableNote: ''
  };
}

(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);

    console.log('Connected to MongoDB');

    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    const products = [];

    for (let i = 1; i < lines.length; i++) {
      const product = parseLine(lines[i]);
      if (product) {
        products.push(product);
      }
    }

    console.log(`Found ${products.length} products in CSV`);

    const db = mongoose.connection.db;

    await db.collection('products').deleteMany({});
    console.log('Old products deleted');

    const result = await db.collection('products').insertMany(products);
    console.log(`Inserted ${result.insertedCount} products`);

    const zeroPrices = products.filter(product => product.price === 0).length;
    console.log(`Zero-price products: ${zeroPrices}`);

    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
})();