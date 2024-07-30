const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

exports.createOrderFromCart = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId }).populate('cartItems.productId');

    if (!cart) throw new AppError('Cart not found', 400);

    const user = await User.findById(userId);

    if (!user) throw new Error('User not found', 400);

    const orderItems = cart.cartItems.map((item) => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price,
    }));

    const order = new Order({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      items: orderItems,
      amount: cart.totalPrice,
      currency: 'inr',
      status: 'pending',
    });

    await order.save();

    return order;
  } catch (error) {
    console.log('Error creating order:', error);
  }
};
