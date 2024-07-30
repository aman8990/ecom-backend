const Order = require('../models/orderModel');

async function deleteFailedOrders() {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

    const result = await Order.deleteMany({
      createdAt: { $lt: fiveMinutesAgo },
      paymentStatus: 'failed',
    });
  } catch (error) {
    console.error('Error deleting failed orders:', error);
  }
}

// deleteFailedOrders();

// setInterval(deleteFailedOrders, 2 * 60 * 60 * 1000);
