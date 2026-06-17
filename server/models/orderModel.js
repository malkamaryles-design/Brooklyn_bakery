const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  imageUrl:  { type: String },
  quantity:  { type: Number, required: true, min: 1 },
  subtotal:  { type: Number, required: true },
});
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customer: {
      name:    { type: String, required: true },
      email:   { type: String, required: true },
      phone:   { type: String },
      address: { type: String },
    },
    delivery: {
      type:    { type: String, enum: ['pickup', 'delivery'], required: true },
      address: { type: String },
    },
    items: {
      type:     [orderItemSchema],
      validate: { validator: (v) => v.length > 0, message: 'Order must have at least one item' },
    },
    total: { type: Number, required: true },
    status: {
      type:    String,
      enum:    ['pending', 'preparing', 'shipped', 'delivered'],
      default: 'pending',
    },
  },
  { timestamps: true }
);
const Order = mongoose.model('Order', orderSchema);
const createOrder      = async (data)          => Order.create(data);
const findByUserId     = async (userId)        => Order.find({ userId }).sort({ createdAt: -1 });
const findAll          = async ()              => Order.find().populate('userId', 'email').sort({ createdAt: -1 });
const updateStatusById = async (orderId, status) => Order.findByIdAndUpdate(orderId, { status }, { new: true });
module.exports = { Order, createOrder, findByUserId, findAll, updateStatusById };
