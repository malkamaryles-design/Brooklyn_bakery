require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/Brooklyn_Bakery?replicaSet=rs0');
  const result = await mongoose.connection.db.collection('users').deleteMany({});
  console.log(`Deleted ${result.deletedCount} users`);
  await mongoose.disconnect();
})();