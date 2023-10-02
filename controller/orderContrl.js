const User = require('../models/userModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const Address = require('../models/addressModel')
const asyncHandler = require('express-async-handler');
const { calculateSubtotal } = require('../utility/ordercalculation')


/******** User Side *******/
//checkout page loading
const checkoutPage = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const userWithCart = await User.findById(user).populate('cart.product'); //finding users cart

        const userWithAddresses = await User.findById(user).populate('addresses'); // finding user address
        const addresses = userWithAddresses.addresses
        console.log('adsdd', addresses);

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

// orderPlacing---
const placeOrder = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const { coupon, address, paymentMethod } = req.body
        const userWithCart = await User.findById(user).populate('cart.product'); //finding products in the cart

        if (userWithCart.cart && userWithCart.cart.length > 0) {
            const totalArray = calculateSubtotal(userWithCart);
            const [cartItems, cartSubtotal, processingFee, orderTotal] = [...totalArray]; //calculating 


            const orderItems = cartItems.map(item => ({ //get the productId and quantity in the cart
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.salePrice
            }))

            const newOrder = new Order({
                items: orderItems,
                user: user,
                orderDate: Date.now(),
                billingAddress: address,
                paymentMethod: paymentMethod,
                subtotal: cartSubtotal,
                processingFee: processingFee,
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

//Cancel Order--- and also increase the quantity once cancelled 
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

                await Product.findByIdAndUpdate(productId, { $inc: { quantity: incQuantity } });
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
        }).populate('billingAddress').sort({ orderDate: -1 });


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

        // Update the status of a specific product within the order
        const update = await Order.findOneAndUpdate(
            { _id: orderId, 'items.product': productId }, // Match the order and the product
            { $set: { 'items.$.status': status } } // Update the status of the matched product
        );

        if (update) { //if update is success            
            if (status == 'cancelled') { //if the admin updates the status to cancelled ,increase the quantity.

                const order = await Order.findOne({ _id: orderId })
                    .populate({
                        path: 'items.product',
                        model: 'Product'
                    })

                const productIdString = String(productId); //finding matching productId from orderDb
                const productItem = order.items.find(item => String(item.product._id) === productIdString);

                const incQuantity = productItem.quantity
                const pro = await Product.findByIdAndUpdate(productId, { $inc: { quantity: incQuantity } });
                res.json(pro)
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
    placeOrder,
    orders,
    viewOrder,
    cancelOrder,
    ordersPage,
    editOrderPage,
    updateOrder
}