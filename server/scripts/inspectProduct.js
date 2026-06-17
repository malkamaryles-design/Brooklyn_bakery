require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect('mongodb:
  const db = mongoose.connection.db;
  const product = await db.collection('products').findOne({});
  console.log(JSON.stringify(product, null, 2));
  await mongoose.disconnect();
})();