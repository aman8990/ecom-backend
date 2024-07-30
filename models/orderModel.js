const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: String,
  email: String,
  address: Object,
  phone: Number,
  items: [orderItemSchema],
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'inr',
  },
  paymentId: { type: String },
  paymentStatus: {
    type: String,
    enum: ['paid', 'failed'],
    default: 'failed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'cancelled'],
  },
  deliveryStatus: {
    type: String,
    enum: ['processing', 'inTransit', 'delivered'],
    default: 'processing',
  },
});

orderSchema.index({ createdAt: 1, paymentStatus: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
