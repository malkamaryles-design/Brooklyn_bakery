require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { MONGO_URI } = require('./config/env');
const products = [ 
  { name: 'Cinnamon Roll', price: 12, imageUrl: '/product_images/PHOTO-2025-11-06-18-11-56_8.jpg', category: 'דונאטס', description: 'דונטס בצורת חלה בציפוי קינמון וסוכר' }, 
];
const seed = async () => { 
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db; 
  await db.collection('products').deleteMany({}); 
  await db.collection('products').insertMany(products); 
  console.log('Seeded products into Brooklyn_Bakery.products'); 
  await mongoose.disconnect(); 
};
seed();