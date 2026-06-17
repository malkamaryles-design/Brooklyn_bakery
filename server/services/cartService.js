const cartModel    = require('../models/cartModel');
const productModel = require('../models/productModel');
const getCart = async (userId) => {
  const items = await cartModel.fetchCart(userId);
  const total = items.reduce((sum, i) => sum + i.subtotal, 0);
  return { items, total };
};
const addToCart = async (userId, productId, quantity) => {
  if (!productId) throw new Error('מזהה מוצר לא תקין');
  const product = await productModel.fetchById(productId);
  if (!product) throw new Error('המוצר לא נמצא');
  if (!product.available) throw new Error(`המוצר "${product.name}" אינו זמין כרגע`);
  await cartModel.upsertItem(userId, productId, quantity);
  return getCart(userId);
};
const removeFromCart = async (userId, cartItemId) => {
  const deleted = await cartModel.removeItem(userId, cartItemId);
  if (!deleted) throw new Error('הפריט לא נמצא בעגלה');
  return getCart(userId);
};
const updateQuantity = async (userId, cartItemId, quantity) => {
  if (quantity < 1) throw new Error('הכמות חייבת להיות לפחות 1');
  const item = await cartModel.setQuantity(userId, cartItemId, quantity);
  if (!item) throw new Error('הפריט לא נמצא בעגלה');
  return getCart(userId);
};
const mergeCart = async (userId, guestItems) => {
  if (!Array.isArray(guestItems)) return getCart(userId);
  for (const item of guestItems) {
    if (item.productId && item.quantity > 0) {
      const product = await productModel.fetchById(item.productId);
      if (product) {
        await cartModel.upsertItem(userId, item.productId, item.quantity);// לעשות בדיקה
      }
    }
  }
  return getCart(userId);
};
module.exports = { getCart, addToCart, removeFromCart, updateQuantity, mergeCart };