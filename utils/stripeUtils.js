const stripe = require('stripe')(
  'sk_test_51OdJU4SG7m4hPidskneo49PMsNXHLVUQDJJXIPv7gJzSvQkBEqmwgaTvD3i8Wh2NXcMdNK6Me3QmVCfT2jWMmMIB00I9BClNry',
);

exports.createPaymentIntent = async (amount) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'inr',
      description: 'Payment',
    });
    // console.log(paymentIntent);
    return paymentIntent;
  } catch (error) {
    throw new Error(error.message);
  }
};
