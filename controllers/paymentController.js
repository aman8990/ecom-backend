const { createOrderFromCart } = require('./orderController');
const { createPaymentIntent } = require('../utils/stripeUtils');
const Order = require('../models/orderModel');

exports.pay = async (req, res) => {
  const userId = req.user._id;

  try {
    const order = await createOrderFromCart(userId);

    if (!order) return res.status(400).json({ error: 'Order creation failed' });

    const amountInPaise = order.amount * 100;
    const paymentIntent = await createPaymentIntent(amountInPaise);

    order.paymentId = paymentIntent.id;
    const address = order.address;
    await order.save();

    res.json({ clientSecret: paymentIntent.client_secret, address });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPay = async (req, res) => {
  const { paymentIntentId, status } = req.body;

  try {
    const order = await Order.findOne({ paymentId: paymentIntentId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status === 'succeeded') {
      order.paymentStatus = 'paid';
    } else {
      order.paymentStatus = 'failed';
      order.status = 'cancelled';
    }

    await order.save();
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
