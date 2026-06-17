require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') }); 
const express       = require('express');       
const cors          = require('cors');          
const connectDB     = require('./config/db');   
const { PORT }      = require('./config/env');  
const authRoutes    = require('./routes/authRoutes');    
const productRoutes = require('./routes/productRoutes'); 
const cartRoutes    = require('./routes/cartRoutes');    
const adminRoutes   = require('./routes/adminRoutes');   
const orderRoutes   = require('./routes/orderRoutes');   
const app = express(); 
app.use(cors());            
app.use(express.json());    
app.use('/api/auth',           authRoutes);    
app.use('/api/products',       productRoutes); 
app.use('/api/cart',           cartRoutes);    
app.use('/api/admin/products', adminRoutes);   
app.use('/api/orders',         orderRoutes);   
connectDB().then(() => { 
  app.listen(PORT, () => { 
    console.log(`Bakery server running on http://localhost:${PORT}`);
  });
});