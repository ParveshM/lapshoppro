const User = require('../models/userModel')
const Product = require('../models/productModel')
const asyncHandler = require('express-async-handler');



// Loading cart page--
const loadCartPage = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the user by ID and populate the 'cart.product' field to get product details
        const userWithCart = await User.findById(userId).populate('cart.product');

        if (userWithCart.cart.length === 0) {
            // User has an empty cart
            res.render('./shop/pages/cart', { cartItems: [], subtotal: 0, processingFee: 0, taxAmount: 0, totalAmount: 0 });
        } else {           
            const userCart = userWithCart.cart;

            // Calculate Subtotal
            const subtotal = userCart.reduce((total, item) => {
                return total + item.product.salePrice * item.quantity;
            }, 0);

            const processingFee = 50;
            const taxRate = 0.01;

            // Calculate Total
            let totalAmount = subtotal + processingFee +  Math.ceil(subtotal * taxRate);    
            let taxAmount = Math.ceil(subtotal * taxRate);  

            if (totalAmount < 100000) {
                totalAmount -= subtotal * taxRate;
                taxAmount = null;
            }

            res.render('./shop/pages/cart', { cartItems: userCart, subtotal, processingFee, taxAmount, totalAmount });
        }
    } catch (error) {
        throw new Error(error);
    }
});



// AddToCart---c    
const addtoCart = asyncHandler(async (req, res) => {

    try {
        const productId = req.params.id;  /* values from user */
        const quantity = req.query.quantity || 1;
        const user = req.user
        const added = await user.addToCart(productId, quantity); /* calling function from model */
        if (added) {

            res.redirect('/cart');
        } else {
            console.log('Error in adding product into Cart');
        }

    } catch (error) {
        throw new Error(error)
    }
})

// removeProductfromCart---
const removeProductfromCart = asyncHandler(async (req, res) => {
    try {
        const productId = req.params.id;
        const user = req.user
        const removeProduct = await user.removeFromCart(productId)
        if (removeProduct) {          
           res.redirect('/cart')
        } else {
            console.log('error in removing');
        }
    } catch (error) {
        throw new Error(error)
    }
})

module.exports = {
    loadCartPage,
    addtoCart,
    removeProductfromCart,
}