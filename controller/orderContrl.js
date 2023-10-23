const User = require('../models/userModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const asyncHandler = require('express-async-handler');
const { calculateSubtotal } = require('../utility/ordercalculation')
const { generateRazorPay, verifyingPayment } = require('../config/razorpay')
const { checkCartItemsMatch } = require('../helpers/checkCartHelper');
const { generateReferralCode } = require('../helpers/referralHelper');
const { decreaseQuantity, updateWalletAmount, decreaseWalletAmount } = require('../helpers/productReturnHelper')
const { walletAmount, calculateCouponDiscount,
    isValidCoupon, changePaymentStatus,
    generateInvoice } = require('../helpers/placeOrderHelper')


/*********** User Side **************/
/************************************/
//checkout page loading
const checkoutPage = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const userWithCart = await User.findById(user).populate('cart.product'); //finding users cart

        if (!userWithCart.cart.length) { //if cart has no products
            return res.redirect('/cart')
        }
        const userWithAddresses = await User.findById(user).populate('addresses'); // finding user address
        const addresses = userWithAddresses.addresses;

        const totalArray = calculateSubtotal(userWithCart);
        console.log('check totalarrayt', totalArray);
        // if the product quantity is less than cart quantity
        if (!totalArray) {
            console.log('inside not ');
            req.flash('warning', 'OOPS! , insufficient stock')
            return res.redirect('/cart')
        }
        const [cartItems, cartSubtotal, processingFee, orderTotal] = [...totalArray];


        let amount = false;
        let minBalance = false;
        let walletBalance = 0;
        const findWallet = await User.findById(user).populate('wallet')
        if (findWallet.wallet) {
            walletBalance = findWallet.wallet.balance;
            //check if wallet amount can be used or not         
            if (walletBalance > orderTotal) {
                amount = true
            }
            // if wallet has min balance can be used with razorpay
            if (walletBalance > 0 && walletBalance < orderTotal) {
                minBalance = true;
            }
        }

        res.render('./shop/pages/checkout', {
            cartItems,
            cartSubtotal,
            processingFee,
            orderTotal,
            addresses,
            walletBalance,
            amount,
            minBalance

        })
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

        const userWithCart = await User.findById(user).populate('cart.product');

        const cartProduct = userWithCart.cart.map(cartItem => ({
            product: cartItem.product,
            quantity: cartItem.quantity,
        }));
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

// updateWallet in checkout--
const updateWalletInCheckout = asyncHandler(async (req, res) => {
    try {
        console.log('req recieved in update checkout', req.query);
        const { total, couponCode } = req.query
        const user = req.user.id;

        const findWallet = await User.findById({ _id: user }).populate('wallet')
        const walletBalance = findWallet.wallet.balance

        if (walletBalance < total) {
            let amountTopay = total - walletBalance;

            if (couponCode) {
                const findCoupon = await isValidCoupon(couponCode, user, total)
                if (findCoupon.coupon) {
                    const orderTotal = calculateCouponDiscount(findCoupon.coupon, total)
                    const [discountTotal, discountAmount] = [...orderTotal]
                    amountTopay = discountTotal - walletBalance;
                }
            }

            res.json({ success: true, amountTopay, walletBalance })
        } else {
            console.log('error: wallet Amount is greater than Total  ');
            res.json({ error: 404 })
        }

    } catch (error) {
        throw new Error(error);
    }
});

// apply coupon--
const applyCoupon = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const { couponCode, total, walAmount } = req.body;
        console.log();

        const findCoupon = await isValidCoupon(couponCode, user, total);

        if (findCoupon.coupon) {
            const orderTotal = calculateCouponDiscount(findCoupon.coupon, total);
            const [totalAfterDiscount, discountAmount] = [...orderTotal];
            let amountToPay = totalAfterDiscount;

            if (walAmount !== '') {
                amountToPay = totalAfterDiscount - Number(walAmount);
            }
            //if order total is greater than coupon min and max , apply coupon
            if (total > findCoupon.coupon.minimumPurchase && total < findCoupon.coupon.maximumPurchase) {

                res.json({ success: true, amountToPay, discountAmount, message: findCoupon.message });
            }
        } else {
            res.json({ success: false, message: findCoupon.message });
        }
    } catch (error) {
        throw new Error(error);
    }
});





// orderPlacing---
const placeOrder = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const { couponCode, address, paymentMethod } = req.body
        // console.log('bosiuhf', req.body);

        console.log('body of user', req.body, couponCode);

        const userWithCart = await User.findById(user).populate('cart.product'); //finding products in the cart

        if (userWithCart.cart && userWithCart.cart.length > 0) {
            const totalArray = calculateSubtotal(userWithCart);
            const [cartItems, cartSubtotal, processingFee, orderTotal] = [...totalArray]; //calculating 
            console.log('order total', orderTotal);

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


            if (paymentMethod === 'COD' || paymentMethod === 'Wallet') {
                const createOrder = await Order.create(newOrder);

                if (couponCode) {
                    var findCoupon = await isValidCoupon(couponCode, user, orderTotal)
                    if (findCoupon.coupon) {
                        console.log('orderto', createOrder.total, findCoupon.coupon);
                        const orderTotal = calculateCouponDiscount(findCoupon.coupon, createOrder.total)
                        var [amountToPay, discountAmount] = [...orderTotal]
                        createOrder.discount = discountAmount;
                        createOrder.save()
                        await User.findByIdAndUpdate(user._id, { coupons: findCoupon.coupon._id });
                    }
                }
                if (createOrder) { //if order is created

                    for (const item of orderItems) {
                        const orderQuantity = item.quantity

                        await Product.findByIdAndUpdate(item.product,
                            { $inc: { quantity: -orderQuantity, sold: orderQuantity } }
                        );
                    }
                    await user.clearCart()
                    if (paymentMethod == 'Wallet') {
                        if (findCoupon.coupon) {
                            await Order.findByIdAndUpdate(
                                { _id: createOrder._id },
                                { paymentStatus: 'Paid', amountPaid: amountToPay, walletPayment: amountToPay });

                            const description = 'Product purchase';
                            const type = 'debit'
                            await decreaseWalletAmount(user._id, amountToPay, description, type)
                        } else {
                            await Order.findByIdAndUpdate(
                                { _id: createOrder._id },
                                { paymentStatus: 'Paid', amountPaid: orderTotal, walletPayment: orderTotal });

                            const description = 'Product purchase';
                            const type = 'debit'
                            await decreaseWalletAmount(user._id, orderTotal, description, type)
                        }

                        res.json({ walletSuccess: true, orderID: createOrder._id, payment: 'Wallet' });
                    } else {
                        res.json({ codSuccess: true, orderID: createOrder._id, payment: 'COD' });
                    }
                }
            } else if (paymentMethod == 'WalletWithRazorpay') {

                const createOrder = await Order.create(newOrder);
                if (couponCode) {
                    const findCoupon = await isValidCoupon(couponCode, user, orderTotal)
                    if (findCoupon.coupon) {
                        const orderTotal = calculateCouponDiscount(findCoupon.coupon, createOrder.total)
                        var [amountToPay, discountAmount] = [...orderTotal]
                        createOrder.discount = discountAmount;
                        createOrder.save()
                        await User.findByIdAndUpdate(user._id, { coupons: findCoupon.coupon._id });
                    }
                }
                const userData = await User.findById({ _id: user._id }).populate('wallet')
                let totalAmountToPay = walletAmount(userData, orderTotal)
                if (findCoupon) {
                    totalAmountToPay = amountToPay;
                }
                if (createOrder) { //if order is created
                    for (const item of orderItems) {
                        const orderQuantity = item.quantity;

                        await Product.findByIdAndUpdate(item.product,
                            { $inc: { quantity: -orderQuantity, sold: orderQuantity } }
                        );
                    }

                    generateRazorPay(totalAmountToPay, createOrder._id) //genereting razorpay order--
                        .then((response) => {
                            return res.json({ status: 'success', response, userData });
                        })
                        .catch((err) => { console.log(err) })
                }


            } else if (paymentMethod == 'RazorPay') {  // if payment is done using razorPay

                const createOrder = await Order.create(newOrder);

                let totalAmountToPay = orderTotal
                if (couponCode) {
                    const findCoupon = await isValidCoupon(couponCode, user, orderTotal)
                    if (findCoupon.coupon) {
                        const orderTotal = calculateCouponDiscount(findCoupon.coupon, createOrder.total)
                        var [amountToPay, discountAmount] = [...orderTotal]
                        createOrder.discount = discountAmount;
                        createOrder.save()
                        totalAmountToPay = amountToPay;
                        await User.findByIdAndUpdate(user._id, { coupons: findCoupon.coupon._id });

                    }
                }

                if (createOrder) { //if order is created

                    for (const item of orderItems) {
                        const orderQuantity = item.quantity;

                        await Product.findByIdAndUpdate(item.product,
                            { $inc: { quantity: -orderQuantity, sold: orderQuantity } }
                        );
                    }

                    const userData = await User.findOne({ _id: user });

                    generateRazorPay(totalAmountToPay, createOrder._id) //genereting razorpay order--
                        .then((response) => {
                            return res.json({ status: 'success', response, userData });
                        })
                        .catch((err) => { console.log(err) })
                }

            } else {
                res.render('./shop/pages/404')
            }
        } else {
            res.redirect('/shop')// in the case of cart not found
        }
    } catch (error) {
        throw new Error(error);
    }
})



// verifyPayment
const verifyPayment = asyncHandler(async (req, res) => {
    try {
        const user = req.user;

        verifyingPayment(req.body) // Verifying the payment--
            .then(() => {
                const details = req.body;
                const orderId = details.order.response.receipt;
                let amount = details.order.response.amount;
                amount = amount / 100;
                // Clear the user's cart once the promise is resolved
                return user.clearCart()
                    .then(() => changePaymentStatus(orderId, user, amount));
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
                        const proId = item.product._id

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
                model: 'Product',
                populate: {
                    path: 'images',
                },
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
                model: 'Product',
                populate: {
                    path: 'images',
                },
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
        console.log('request recieve');
        const userId = req.user
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
                if (order.paymentMethod == 'RazorPay' && order.paymentStatus == 'Paid'
                    || (order.paymentMethod == 'WalletWithRazorpay' && order.paymentStatus == 'Paid' ||
                        order.paymentMethod == 'Wallet'
                    )) {

                    let price = productItem.price
                    console.log('outside  discount price', price);
                    if (order.discount > 0) {
                        if (order.items.length > 1) {
                            price = productItem.price - (order.discount / order.items.length)
                            console.log('inside  discount price', price);
                        } else {
                            price = productItem.price - order.discount;
                        }
                    }
                    const user = req.user.id
                    const description = 'Order Cancelled';
                    const type = 'credit'
                    await updateWalletAmount(user, price, description, type)
                } else {
                    console.log("wallet not updated")
                }

                productItem.status = newStatus
                const incQuantity = productItem.quantity

                await Product.findByIdAndUpdate(productId,
                    { $inc: { quantity: incQuantity, sold: -incQuantity } });

                await order.save();
                return res.redirect(`/orders`);
            } else {
                res.render('./shop/pages/404')
            }
        }

    } catch (error) {
        throw new Error(error);
    }
});

// return request from user--
const returnProduct = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;
        const productId = req.body.productId;
        const findOrder = await Order.findOne({ _id: orderId })
        console.log(findOrder)

        const productIdString = String(productId); //finding matching productId from orderDb
        const productItem = findOrder.items.find(item => String(item.product._id) === productIdString);

        if (productItem) {
            productItem.status = 'Return requested';
            productItem.returnDate = Date.now()
            await findOrder.save();
            res.redirect('/orders')
        } else {
            res.render('./shop/pages/404')
        }
    } catch (error) {
        throw new Error(error);
    }
});

// download invoice
const downloadInvoice = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;

        const docDefinition = await generateInvoice(orderId)
        const pdfMake = require('pdfmake/build/pdfmake');
        const vfsFonts = require('pdfmake/build/vfs_fonts');
        pdfMake.vfs = vfsFonts.pdfMake.vfs;

        // Create a PDF document
        const pdfDoc = pdfMake.createPdf(docDefinition);
        // Generate the PDF and send it as a response
        pdfDoc.getBuffer((buffer) => {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);

            res.end(buffer);
        });



    } catch (error) {
        throw new Error(error);
    }
});



/******************* User side End *********************/
/******************************************************/


/*******************************************************/
/******************* Admin Section *********************/
/*******************************************************/

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
            .populate({
                path: 'items.product',
                model: 'Product',
                populate: {
                    path: 'images',
                },
            })
            .populate('billingAddress')
            .populate('user')
        res.render('./admin/pages/editOrder', { title: 'editOrder', viewOrder: findOrder })
    } catch (error) {
        throw new Error(error)
    }
})

// update Order status  , return product , refund and credit amount to wallet--
const updateOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;
        const status = req.body.status;
        const productId = req.body.productId;
        console.log('status when admin update order', status);

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
        } else { }

        if (update) { //if update is success            
            console.log('inside if updated ');
            if (status == 'Cancelled' && update.paymentMethod == 'COD') { //if the admin updates the status to cancelled ,increase the quantity.
                decreaseQuantity(orderId, productId)

            } else if (status == 'Cancelled' && (update.paymentMethod == 'RazorPay'
                || update.paymentMethod == 'Wallet' || update.paymentMethod == 'WalletWithRazorpay')) {

                let productPrice = await decreaseQuantity(orderId, productId);
                const userId = update.user;
                const description = 'Order Cancelled';
                const type = 'credit'

                if (update.discount > 0) {
                    if (update.items.length > 1) {
                        productPrice -= (update.discount / update.items.length)
                    } else {
                        productPrice -= update.discount;
                    }
                }
                updateWalletAmount(userId, productPrice, description, type)

            } else if (status == 'Refunded') {
                // increase the quantity and decrease sold , returns the product price
                let productPrice = await decreaseQuantity(orderId, productId);
                const userId = update.user;
                const description = 'Refund';
                const type = 'credit'

                if (update.discount > 0) {
                    if (update.items.length > 1) {
                        productPrice -= (update.discount / update.items.length)
                    } else {
                        productPrice -= update.discount;
                    }
                }

                updateWalletAmount(userId, productPrice, description, type)
            } else {
                console.log('erro in updating');
            }

            res.redirect('/admin/orders')
        } else {
            res.status(404).render('./admin/404');
        }

    } catch (error) {
        throw new Error(error)
    }
})
/****************************************************************/
/************************ Admind end ****************************/

module.exports = {
    checkoutPage,
    checkCart,
    updateWalletInCheckout,
    applyCoupon,
    placeOrder,
    orderPlacedPage,
    verifyPayment,
    paymentFailed,
    orders,
    viewOrder,
    cancelOrder,
    returnProduct,
    downloadInvoice,
    ordersPage,
    editOrderPage,
    updateOrder
}