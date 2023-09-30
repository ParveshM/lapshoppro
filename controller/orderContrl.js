const User = require('../models/userModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const Address = require('../models/addressModel')
const Orders = require('../models/orderModel')
const mongoose = require('mongoose')
const asyncHandler = require('express-async-handler');
const { calculateSubtotal } = require('../utility/orderFunctions')
const { v4: uuidv4 } = require('uuid');

//checkout page loading
const checkoutPage = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const userWithCart = await User.findById(user).populate('cart.product'); //finding users cart

        const userWithAddresses = await User.findById(user).populate('addresses'); // finding user address
        const addresses = userWithAddresses.addresses
        console.log('adsdd', addresses);

        const totalArray = calculateSubtotal(userWithCart);
        const [cartItems, cartSubtotal, taxAmount, orderTotal] = [...totalArray];
        res.render('./shop/pages/checkout', {
            cartItems,
            cartSubtotal,
            taxAmount,
            orderTotal,
            addresses
        });
    } catch (error) {
        throw new Error(error);
    }
});

// orderPlacing---
const placeOrder = asyncHandler(async (req, res) => {
    try {
        const uuid = uuidv4();
        const user = req.user;
        const { coupon, address, paymentMethod } = req.body
        const userWithCart = await User.findById(user).populate('cart.product'); //finding products in the cart

        if (userWithCart.cart && userWithCart.cart.length > 0) {
            const totalArray = calculateSubtotal(userWithCart);
            const [cartItems, cartSubtotal, taxAmount, orderTotal] = [...totalArray]; //calculating 


            const orderItems = cartItems.map(item => ({ //get the productId and quantity in the cart
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.salePrice
            }))

            const newOrder = new Order({
                items: orderItems,
                user: user,
                billingAddress: address,
                paymentMethod: paymentMethod,
                orderId: uuid,
                subtotal: cartSubtotal,
                taxAmount: taxAmount,
                total: orderTotal
            });

            // Save the order to the database
            const orderDetails = await newOrder.save();
            const billAddress = await Address.findById(address); //find address
            if (orderDetails) { //if order is created

                for (const item of orderItems) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        product.quantity -= item.quantity; //decrease the product quantity
                        await product.save();
                    }
                }
                await user.clearCart()
                res.render('./shop/pages/orderPlaced', { order: orderDetails, billAddress })
            }
        } else {
            res.render('./shop/pages/404')
        }


    } catch (error) {
        throw new Error(error);
    }
})

// order list in user profile--
const orders = asyncHandler(async (req, res) => {
    try {
        const userId = req.user
        const orderItems = await Order.find({ user: userId })
            .populate({
                path: 'items.product',
                model: 'Product'
            })
            .populate('billingAddress')
            .sort({ orderDate: -1 });
        res.render('./shop/pages/orders', { orders: orderItems });

    } catch (error) {
        throw new Error(error);
    }
});

//view order
const viewOrder = asyncHandler(async (req, res) => {
    try {
        const userId = req.user;
        const orderId = req.params.id;
        const productId = req.body.productId

        const order = await Order.findOne({ _id: orderId })
            .populate({
                path: 'items.product',
                model: 'Product'
            })
            .populate('billingAddress');

        const productIdString = String(productId); //finding matching productId from orderDb
        const productItem = order.items.find(item => String(item.product._id) === productIdString);
        console.log('orders', order);
        // console.log('orders.items',order.items);
        console.log('item', productItem);
        if (productItem) { // if there is product 
            const matchedProduct = productItem.product;
            const quantity = productItem.quantity
            const price = productItem.price
            res.render('./shop/pages/viewOrder', { order, product: matchedProduct, quantity, price })
        } else {
            res.render('./shop/pages/404')
        }
    } catch (error) {
        throw new Error(error);
    }
});

//Cancle Order--- and also increase the quantity once cancelled 
const cancelOrder = asyncHandler(async (req, res) => {
    try {
        const userId = req.user;
        const orderId = req.params.id;
        const productId = req.body.productId
        const incQuantity = req.body.quantity
        const newStatus = req.body.newStatus
        console.log('orderid', orderId);
        console.log('produId', productId);
        console.log('incquan', incQuantity);
        console.log('newSta', newStatus);
        const order = await Order.findOne({ user: userId, _id: orderId });

        if (!order) {
            return res.status(404).render('./shop/pages/404');
        }
        if (order.status !== 'cancelled') {
            order.status = newStatus
            console.log('order', order);

            await Product.findByIdAndUpdate(productId, { $inc: { quantity: incQuantity } });
            await order.save();
            return res.redirect(`/orders`);
        }
    } catch (error) {
        throw new Error(error);
    }
});


module.exports = {
    checkoutPage,
    placeOrder,
    orders,
    viewOrder,
    cancelOrder
}