const mongoose = require('mongoose');
const cartItemSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity:  { type: Number, required: true, min: 1 },
});
const Cart = mongoose.model('Cart', cartItemSchema, 'cart');
const upsertItem = async (userId, productId, quantity) => {
  const existing = await Cart.findOne({ userId, productId });
  if (existing) {
    existing.quantity += quantity;
    return existing.save();
  }
  return Cart.create({ userId, productId, quantity });
};
const fetchCart = async (userId, session = null) => {
  let query = Cart.find({ userId }).populate('productId');
  if (session) query = query.session(session);
  const items = await query;
  return items
    .filter((item) => item.productId)
    .map((item) => ({
      _id:       item._id,
      productId: item.productId._id,
      name:      item.productId.name,
      price:     item.productId.price,
      imageUrl:  item.productId.imageUrl,
      available: item.productId.available,
      unavailableNote: item.productId.unavailableNote,
      quantity:  item.quantity,
      subtotal:  item.productId.price * item.quantity,
    }));
};
const removeItem = async (userId, cartItemId) =>
  Cart.findOneAndDelete({ _id: cartItemId, userId });
const clearCart = async (userId, session = null) =>
  Cart.deleteMany({ userId }, { session });
const setQuantity = async (userId, cartItemId, quantity) =>
  Cart.findOneAndUpdate(
    { _id: cartItemId, userId },
    { quantity },
    { new: true }
  );
const fetchCartForOrder = async (userId, session) => {
  const Product = mongoose.model('Product');
  const cartDocs = await Cart.find({ userId }).session(session);
  if (!cartDocs || cartDocs.length === 0) return null;
  const productIds = cartDocs.map((c) => c.productId);
  const products   = await Product.find({ _id: { $in: productIds } }).session(session);
  const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));
  for (const cartDoc of cartDocs) {
    const product = productMap[cartDoc.productId.toString()];
    if (!product) {
      const err = new Error('אחד מהמוצרים בעגלה לא נמצא');
      err.statusCode = 400;
      throw err;
    }
    if (!product.available) {
      const err = new Error(`המוצר "${product.name}" אינו זמין כרגע`);
      err.statusCode = 400;
      throw err;
    }
  }
  const items = cartDocs.map((cartDoc) => {
    const product = productMap[cartDoc.productId.toString()];
    return {
      productId: product._id,
      name:      product.name,
      price:     product.price,
      imageUrl:  product.imageUrl,
      quantity:  cartDoc.quantity,
      subtotal:  product.price * cartDoc.quantity,
    };
  });
  const total = items.reduce((sum, i) => sum + i.subtotal, 0);
  return { items, total };
};
module.exports = { Cart, upsertItem, fetchCart, fetchCartForOrder, removeItem, clearCart, setQuantity };