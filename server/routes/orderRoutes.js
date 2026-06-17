const express = require('express');        
const router  = express.Router();         
const auth    = require('../middleware/authMiddleware');  
const admin   = require('../middleware/adminMiddleware'); 
const { 
  placeOrder, getMyOrders, getAllOrders, updateOrderStatus,
} = require('../controllers/orderController');
router.post('/', auth, placeOrder); 
router.get('/mine', auth, getMyOrders); 
router.get('/', auth, admin, getAllOrders); 
router.patch('/:id/status', auth, admin, updateOrderStatus); 
module.exports = router; 