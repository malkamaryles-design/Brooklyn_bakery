require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect('mongodb:
  const db = mongoose.connection.db;
  const collection = db.collection('products');
  const result = await collection.updateMany(
    {},
    {
      $rename: {
        'price ':       'price',
        ' description': 'description',
      }
    }
  );
  console.log(`✓ Updated ${result.modifiedCount} products — fixed field names`);
  await mongoose.disconnect();
})();