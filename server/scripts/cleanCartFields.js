require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect('mongodb:
  const db = mongoose.connection.db;
  const result = await db.collection('cart').updateMany(
    {},
    { $unset: { name: '', price: '', imageUrl: '' } }
  );
  console.log(`✓ Cleaned ${result.modifiedCount} cart items — removed name/price/imageUrl fields`);
  await mongoose.disconnect();
})();