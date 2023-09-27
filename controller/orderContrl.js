const User = require('../models/userModel')
const Product = require('../models/productModel')
const asyncHandler = require('express-async-handler');

//checkout page loading
const checkoutPage = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const userWithCart = await User.findById(user).populate('cart.product');
       
        const userWithAddresses = await User.findById(user).populate('addresses');
        const addresses = userWithAddresses.addresses
        
        // Access the cart items and their quantities
        const cartItems = userWithCart.cart.map(cartItem => ({
            product: cartItem.product,
            quantity: cartItem.quantity, // Assuming 'quantity' is the property in the cart
        }));

        // Calculate Cart Subtotal
        const cartSubtotal = cartItems.reduce((total, item) => {
            return total + item.product.salePrice * item.quantity;
        }, 0);

        const processingFee = 50;
        let taxAmount = Math.ceil(0.01 * cartSubtotal);
        const orderTotal = cartSubtotal + processingFee + taxAmount;
        if (cartSubtotal < 100000) {
            taxAmount = 0;
        }
        res.render('./shop/pages/checkout', {
            cartItems,
            cartSubtotal,
            processingFee,
            taxAmount,
            orderTotal,
            addresses
        });
    } catch (error) {
        throw new Error(error);
    }
});


module.exports = {
    checkoutPage
}