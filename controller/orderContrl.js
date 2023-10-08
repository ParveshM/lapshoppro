const User = require('../models/userModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const Address = require('../models/addressModel')
const asyncHandler = require('express-async-handler');
const { calculateSubtotal } = require('../utility/ordercalculation')
const { generateRazorPay, verifyingPayment } = require('../config/razorpay')
const { checkCartItemsMatch } = require('../helpers/checkCartHelper');
const { raw } = require('express');




/******** User Side *******/
//checkout page loading
const checkoutPage = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const userWithCart = await User.findById(user).populate('cart.product'); //finding users cart

        const userWithAddresses = await User.findById(user).populate('addresses'); // finding user address
        const addresses = userWithAddresses.addresses;

        const totalArray = calculateSubtotal(userWithCart);
        const [cartItems, cartSubtotal, processingFee, orderTotal] = [...totalArray];
        res.render('./shop/pages/checkout', {
            cartItems,
            cartSubtotal,
            processingFee,
            orderTotal,
            addresses
        });
    } catch (error) {
        throw new Error(error);
    }
});

// checking Cart for any changes before placing the order---
const checkCart = asyncHandler(async (req, res) => {
    try {
        console.log('req recieved in checkcart');
        const user = req.user;
        const cartItems = req.query.originalCartInput;
        console.log('cart items from ajax', cartItems);

        const userWithCart = await User.findById(user).populate('cart.product');

        const cartProduct = userWithCart.cart.map(cartItem => ({
            product: cartItem.product,
            quantity: cartItem.quantity,
        }));
        console.log('cart products in server', cartProduct);

        // Compare the arrays
        const cartItemsMatch = checkCartItemsMatch(cartItems, cartProduct);

        if (cartItemsMatch) {
            res.json({ success: true, message: 'Cart items match' });
        } else {
            res.json({ success: false, message: 'Cart items do not match' });
        }


    } catch (error) {
        throw new Error(error);
    }
});


// orderPlacing---
const placeOrder = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const { coupon, address, paymentMethod } = req.body

        console.log('body of user', req.body);

        const userWithCart = await User.findById(user).populate('cart.product'); //finding products in the cart

        if (userWithCart.cart && userWithCart.cart.length > 0) {
            const totalArray = calculateSubtotal(userWithCart);
            const [cartItems, cartSubtotal, processingFee, orderTotal] = [...totalArray]; //calculating 


            const orderItems = cartItems.map(item => ({ //get the productId and quantity in the cart
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.salePrice
            }))

            const newOrder = {
                items: orderItems,
                user: user,
                orderDate: new Date(),
                billingAddress: address,
                paymentMethod: paymentMethod,
                subtotal: cartSubtotal,
                processingFee: processingFee,
                total: orderTotal
            }

            if (paymentMethod === 'COD' || paymentMethod === 'wallet') {

                const createOrder = await Order.create(newOrder);

                if (createOrder) { //if order is created

                    for (const item of orderItems) {
                        const orderQuantity = item.quantity

                        await Product.findByIdAndUpdate(item.product,
                            { $inc: { quantity: -orderQuantity, sold: orderQuantity } }
                        );
                    }
                    await user.clearCart()
                    res.json({ codSuccess: true, orderID: createOrder._id, payment: 'COD' });
                }

            } else if (paymentMethod == 'RazorPay') {  // if payment is done using razorPay

                const createOrder = await Order.create(newOrder);
                if (createOrder) { //if order is created

                    for (const item of orderItems) {
                        const orderQuantity = item.quantity;

                        await Product.findByIdAndUpdate(item.product,
                            { $inc: { quantity: -orderQuantity, sold: orderQuantity } }
                        );
                    }

                    const userData = await User.findOne({ _id: user });

                    generateRazorPay(orderTotal, createOrder._id) //genereting razorpay order--
                        .then((response) => {
                            return res.json({ status: 'success', response, userData });
                        })
                        .catch((err) => { console.log(err) })
                }


            } else {
                res.render('./shop/pages/404') // in the case of cart not found
            }
        } else {
            res.redirect('/shop')
        }
    } catch (error) {
        throw new Error(error);
    }
})

const changePaymentStatus = (orderId) => {
    return Order.findByIdAndUpdate({ _id: orderId }, { paymentStatus: 'Paid' });
};

// verifyPayment
const verifyPayment = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        verifyingPayment(req.body) // Verifying the payment--
            .then(() => {
                const details = req.body;
                const orderId = details.order.response.receipt;

                // Clear the user's cart once the promise is resolved
                return user.clearCart()
                    .then(() => changePaymentStatus(orderId)); // Chain this with the next then block
            })
            .then((changeStatus) => { // payment success and payment status changed to paid
                console.log('status updated', changeStatus);
                console.log('Payment success');
                return res.json({ status: true, orderID: `${changeStatus._id}` });
            })
            .catch((err) => { // payment verification failed 
                console.log('Error in payment verification', err);
                res.json({ status: false, errMsg: 'Payment verification failed' });
            });
    } catch (error) {
        throw new Error(error);
    }
});

// payment failed---
const paymentFailed = asyncHandler(async (req, res) => {
    try {
        const order = req.body.order.response;
        const orderId = order.receipt;

        const findOrder = await Order.findById({ _id: orderId }).populate('items.product');

        if (findOrder) {
            const orderItems = findOrder.items;

            for (const item of orderItems) {
                const orderQuantity = item.quantity;

                const product = await Product.findById(item.product);
                if (item.status !== 'Cancelled') {
                    if (product) {
                        item.status = 'Cancelled'; // Update the status of the item
                        // const newQuantity = product.quantity + orderQuantity;
                        const proId = item.product._id
                        // await Product.findByIdAndUpdate(
                        //     { _id: proId },
                        //      { $set: { quantity: newQuantity } },
                        //       { $inc: {sold: -orderQuantity } })

                        await Product.findByIdAndUpdate(proId,
                            { $inc: { quantity: orderQuantity, sold: -orderQuantity } }
                        );
                    }
                }
            }
            await findOrder.save();
        }

        res.json({ status: true });
    } catch (error) {
        throw new Error(error);
    }
});

// orderPlaced successPage--
const orderPlacedPage = asyncHandler(async (req, res) => {
    try {

        const orderId = req.query.id
        const findOrder = await Order.findOne({ _id: orderId }).populate('billingAddress')
        console.log(findOrder);

        res.render('./shop/pages/orderPlaced', { order: findOrder, billAddress: findOrder.billingAddress });

    } catch (error) {
        throw new Error(error);
    }
});

// orders list in user profile--    
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

        if (productItem) { // if there is product 
            const matchedProduct = productItem.product;
            const quantity = productItem.quantity
            const price = productItem.price
            const status = productItem.status
            res.render('./shop/pages/viewOrder', { order, product: matchedProduct, quantity, price, status })
        } else {
            res.render('./shop/pages/404')
        }
    } catch (error) {
        throw new Error(error);
    }
});

//Cancel Order--- ,increase the quantity , decrease sold - once cancelled 
const cancelOrder = asyncHandler(async (req, res) => {
    try {

        const orderId = req.params.id;
        const productId = req.body.productId
        const newStatus = req.body.newStatus
        const order = await Order.findOne({ _id: orderId })
            .populate({
                path: 'items.product',
                model: 'Product'
            })
            .populate('billingAddress');

        const productIdString = String(productId); //finding matching productId from orderDb
        const productItem = order.items.find(item => String(item.product._id) === productIdString);

        if (!productItem) {
            return res.status(404).render('./shop/pages/404');
        } else {
            if (productItem.status !== 'cancelled') {
                productItem.status = newStatus
                const incQuantity = productItem.quantity

                await Product.findByIdAndUpdate(productId,
                    { $inc: { quantity: incQuantity, sold: -incQuantity } });
                    
                const saved = await order.save();
                console.log('after update', saved);
                return res.redirect(`/orders`);
            } else {
                res.render('./shop/pages/404')
            }
        }

    } catch (error) {
        throw new Error(error);
    }
});
/******************************************************/


/************************************/
/********* adiminSide *************/

// ordersPage---
const ordersPage = asyncHandler(async (req, res) => {
    try {
        const listOrder = await Order.find().populate({
            path: 'items.product',
            model: 'Product'
        }).populate('billingAddress')
            .sort({ orderDate: -1 });

        res.render('./admin/pages/orders', { title: 'Orders', orders: listOrder })
    } catch (error) {
        throw new Error(error)
    }
})

// editOrder---
const editOrderPage = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id
        console.log('orderid', orderId);
        const findOrder = await Order.findOne({ _id: orderId })
            .populate('items.product')
            .populate('billingAddress')
            .populate('user')

        res.render('./admin/pages/editOrder', { title: 'editOrder', viewOrder: findOrder })
    } catch (error) {
        throw new Error(error)
    }
})
// update Order status--
const updateOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;
        const status = req.body.status;
        const productId = req.body.productId;

        const update = await Order.findOneAndUpdate(
            { _id: orderId, 'items.product': productId }, // Match the order and the product
            { $set: { 'items.$.status': status } } // Update the status of the matched product
        );
        if (status == 'Shipped') { // Update shippedDate date
            await Order.findOneAndUpdate(
                { _id: orderId },
                { $set: { shippedDate: new Date() } }
            );
        } else if (status == 'Delivered') { // Update delivered date
            if (update.paymentStatus == '') { }
            await Order.findOneAndUpdate(
                { _id: orderId },
                { $set: { deliveredDate: new Date(), paymentStatus: 'Paid' } }
            );
        }
        if (update) { //if update is success            
            if (status == 'Cancelled') { //if the admin updates the status to cancelled ,increase the quantity.

                const order = await Order.findOne({ _id: orderId })
                    .populate({
                        path: 'items.product',
                        model: 'Product'
                    })

                const productIdString = String(productId); //finding matching productId from orderDb
                const productItem = order.items.find(item => String(item.product._id) === productIdString);

                const incQuantity = productItem.quantity
                await Product.findByIdAndUpdate(productId,
                    { $inc: { quantity: incQuantity, sold: -incQuantity } });

            }

            res.redirect('/admin/orders')
        } else {
            res.status(404).render('./admin/404');
        }

    } catch (error) {
        throw new Error(error)
    }
})


module.exports = {
    checkoutPage,
    checkCart,
    placeOrder,
    orderPlacedPage,
    verifyPayment,
    paymentFailed,
    orders,
    viewOrder,
    cancelOrder,
    ordersPage,
    editOrderPage,
    updateOrder
}