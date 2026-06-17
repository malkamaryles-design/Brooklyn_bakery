const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const {
  getCart, addToCart, removeFromCart, updateQuantity, mergeCart,
} = require('../controllers/cartController');
router.get('/',          auth, getCart);
router.post('/',         auth, addToCart);
router.post('/merge',    auth, mergeCart);
router.delete('/:itemId', auth, removeFromCart);
router.patch('/:itemId',  auth, updateQuantity);
module.exports = router;