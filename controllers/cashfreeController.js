const axios = require('axios');
const { Cashfree } = require('cashfree-pg');
const { createOrderFromCart } = require('./orderController');
const Order = require('../models/orderModel');

Cashfree.XClientId = 'TEST430329ae80e0f32e41a393d78b923034';
Cashfree.XClientSecret = 'TESTaf195616268bd6202eeb3bf8dc458956e7192a85';
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

function generateRandomLetters(length) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    result += letters[randomIndex];
  }
  return result;
}

function generateOrderId() {
  const timestamp = Date.now();
  const randomLetters = generateRandomLetters(5);
  return `${timestamp}${randomLetters}`;
}

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    const order = await createOrderFromCart(userId);

    if (!order) return res.status(400).json({ error: 'Order creation failed' });

    const customerId = String(order.userId);
    const customerName = String(order.name);
    const customerEmail = String(order.email);
    const customerPhone = String(order.phone);

    const cashfreeOrderId = generateOrderId();

    const request = {
      order_id: cashfreeOrderId,
      userOrder_id: order._id,
      order_amount: order.amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `https://aman-ecom.netlify.app//cashfree/verify?cashfreeOrderId=${cashfreeOrderId}&userOrderId=${order._id}`,
      },
      order_note: '',
    };

    const response = await Cashfree.PGCreateOrder('2023-08-01', request);
    const paymentData = response.data;

    res.status(200).json({
      status: 'success',
      paymentData,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error setting up order request',
      details: error.response ? error.response.data : error.message,
    });
  }
};

exports.verifyOrder = async (req, res) => {
  const { userOrderId, cashfreeOrderId } = req.body;
  try {
    const response = await axios.get(
      `https://sandbox.cashfree.com/pg/orders/${cashfreeOrderId}`,
      {
        headers: {
          accept: 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': Cashfree.XClientId,
          'x-client-secret': Cashfree.XClientSecret,
        },
      },
    );

    const order = await Order.findById(userOrderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (response.data.order_status === 'PAID') {
      order.paymentStatus = 'paid';
      order.paymentId = response.data.payment_session_id;
      await order.save();

      res.status(200).json({
        status: 'success',
        message: 'Payment successful. Thank you for your order!',
      });
    } else {
      order.paymentStatus = 'failed';
      order.status = 'cancelled';
      order.paymentId = response.data.payment_session_id;
      await order.save();

      res.status(400).json({
        status: 'error',
        message: 'Payment failed or was not successful. Please try again.',
      });
    }
  } catch (error) {
    console.error(
      'Error confirming payment:',
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
};
