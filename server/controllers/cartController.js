const cartService  = require('../services/cartService');
const asyncHandler = require('../middleware/asyncHandler');
const getCart = asyncHandler(async (req, res) => {
  const result = await cartService.getCart(req.user.userId);
  res.json(result);
});
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const result = await cartService.addToCart(req.user.userId, productId, quantity);
  res.status(201).json(result);
});
const removeFromCart = asyncHandler(async (req, res) => {
  const result = await cartService.removeFromCart(req.user.userId, req.params.itemId);
  res.json(result);
});
const updateQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const result = await cartService.updateQuantity(req.user.userId, req.params.itemId, quantity);
  res.json(result);
});
const mergeCart = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const result = await cartService.mergeCart(req.user.userId, items);
  res.json(result);
});
module.exports = { getCart, addToCart, removeFromCart, updateQuantity, mergeCart };