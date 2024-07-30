const Cart = require('../models/cartModel');

const getCartItems = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId }).populate({
      path: 'cartItems.productId',
      select: '_id name price photo',
    });

    if (!cart) {
      return { cartItems: [] };
    }

    return cart;
  } catch (err) {
    throw new Error(`Error fetching cart items: ${err.message}`);
  }
};

const addItemToCart = async (userId, productId, quantity = 1) => {
  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, cartItems: [] });
      await cart.save();
    }

    if (!cart.cartItems) cart.cartItems = [];

    const index = cart.cartItems.findIndex((item) =>
      item.productId.equals(productId),
    );

    if (index !== -1) {
      cart.cartItems[index].quantity += Number(quantity);
    } else {
      cart.cartItems.push({ productId, quantity });
    }

    await cart.save();
    const data = await getCartItems(userId);
    return data;
  } catch (err) {
    throw new Error(`Error adding item to cart: ${err.message}`);
  }
};

const updateCartItem = async (userId, productId, quantity) => {
  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      throw new Error('Cart not found');
    }

    const index = cart.cartItems.findIndex((item) =>
      item.productId.equals(productId),
    );

    if (index === -1) {
      throw new Error('Item not found in the cart');
    }

    cart.cartItems[index].quantity = Number(quantity);

    await cart.save();

    const data = await getCartItems(userId);
    return data;
  } catch (err) {
    throw new Error(`Error finding item: ${err.message}`);
  }
};

const removeItemFromCart = async (userId, productId) => {
  try {
    const cart = await Cart.findOne({ userId }).populate({
      path: 'cartItems.productId',
      select: '_id name price photo',
    });

    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.cartItems = cart.cartItems.filter(
      (item) => !item.productId.equals(productId),
    );

    await cart.save();

    const data = await getCartItems(userId);
    return data;
  } catch (err) {
    throw new Error(`Error removing item: ${err.message}`);
  }
};

const removeDeletedItemFromCart = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId }).populate({
      path: 'cartItems.productId',
      select: '_id name price photo',
    });

    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.cartItems = cart.cartItems.filter((item) => item.productId !== null);

    await cart.save();
  } catch (err) {
    throw new Error(`Error removing item: ${err.message}`);
  }
};

module.exports = {
  getCartItems,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  removeDeletedItemFromCart,
};
