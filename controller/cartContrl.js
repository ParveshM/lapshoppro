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
            res.render('./shop/pages/cart', { cartItems: [],totalAmount: 0 });
        } else {
            const userCart = userWithCart.cart;

            // Calculate Subtotal
            const subtotal = userCart.reduce((total, item) => {
                return total + item.product.salePrice * item.quantity;
            }, 0);

            res.render('./shop/pages/cart', { cartItems: userCart,subtotal });
        }
    } catch (error) {
        throw new Error(error);
    }
});



// AddToCart---
const addtoCart = asyncHandler(async (req, res) => {
    try {
        const productId = req.params.id;  /* values from user */
        const quantity = req.query.quantity || 1;

        const user = req.user
      
        const added = await user.addToCart(productId, quantity); /* calling function from model */
        if (added) {
            res.redirect('/cart')
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

// Update cart item quantity increasing , decreasing
const updateCartItemQuantity = asyncHandler(async (req, res) => {
    try {
        const productId = req.params.id;
        const newQuantity = parseInt(req.body.quantity);

        const user = req.user;
        const cartItem = user.cart.find(item => item.product.equals(productId));

        if (!cartItem) {
            throw new Error('Cart item not found');
        }

        const product = await Product.findById(productId);

        if (newQuantity > product.quantity) {
            const message = 'Out of Stock';
            return res.status(400).json({ success: false, message });
        }

        // Update the quantity of the cart item
        cartItem.quantity = newQuantity;
        await user.save();

        // Fetch the updated cart items (you may want to customize this part)
        const updatedCartItems = user.cart;

        res.json({ success: true, cartItems: updatedCartItems });
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({ success: false, error: 'Error updating cart item quantity' });
    }
});

// checkProductAvailability---
const checkProductAvailability = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('cart.product').exec(); // Populate the product details
        const cartItems = user.cart;

        res.json({ cartItems });
    } catch (error) {
        throw new Error(error);
    }
});


// counting cart items--
const getCartCount = asyncHandler(async (req, res) => {
    try {
        if (req.user) {
            // Get the user's cart items count from your user model
            const userId = req.user.id;
            const user = await User.findById(userId).exec();
            const cartItemCount = user.cart.length;
            res.json({ cartItemCount }); // Use the correct property name
        } else {
            // User is not authenticated
            res.json({ cartItemCount: 0 }); // Return 0 if the user is not logged in
        }
    } catch (error) {
        throw new Error(error);
    }
});


module.exports = {
    loadCartPage,
    addtoCart,
    removeProductfromCart,
    updateCartItemQuantity,
    getCartCount,
    checkProductAvailability

}