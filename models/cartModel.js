const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    unique: true,
  },
  cartItems: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  totalPrice: {
    type: Number,
    default: 0,
  },
});

cartSchema.pre('save', async function (next) {
  if (this.isModified('cartItems') || this.isNew) {
    const cart = this;
    let totalPrice = 0;

    await cart.populate('cartItems.productId');

    cart.cartItems.forEach((item) => {
      const price = item.productId.price;
      totalPrice += price * item.quantity;
    });

    cart.totalPrice = totalPrice;
  }
  next();
});

cartSchema.index({ userId: 1, productId: 1 });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
