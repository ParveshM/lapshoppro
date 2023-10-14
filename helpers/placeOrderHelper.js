const Coupon = require('../models/couponModel')
const Order = require('../models/orderModel')
const User = require('../models/userModel')
const { decreaseQuantity, updateWalletAmount, decreaseWalletAmount } = require('../helpers/productReturnHelper')


// calculating total by decreasing the wallet amount 
function walletAmount(userData, orderTotal) {
    const wallet = userData.wallet
    const walletBalance = wallet.balance
    const total = orderTotal - walletBalance;
    return total
}

// checking for valid Coupon
async function isValidCoupon(couponCode, user) {
    const currentDate = new Date();
    const findCoupon = await Coupon.findOne({ code: couponCode });

    if (findCoupon) {
        if (findCoupon.expirationDate && currentDate > findCoupon.expirationDate) {
            return { coupon: null, message: 'Coupon is expired' };

        } else if (findCoupon.maximumUses > 0) {
            console.log('user.in', user.coupons);
            if (user.coupons) {
                const couponId = String(findCoupon._id); //finding matching productId from orderDb
                const isCouponused = user.coupons.find(coupon => String(coupon._id) === couponId);
                if (isCouponused) {
                    return { coupon: null, message: 'Coupon is invalid.' };
                }
            }
        }

        return { coupon: findCoupon, message: findCoupon.description };
    } else {
        return { coupon: null, message: 'Coupon is not valid! , try another one.' };
    }
}



// calculate amount after coupon discount
function calculateCouponDiscount(findCoupon, total) {
    const orderTotal = []
    const finalTotal = Math.ceil(total * ((100 - findCoupon.discountAmount) / 100))
    const discountAmount = total - finalTotal;

    orderTotal.push(finalTotal, discountAmount)
    return orderTotal
}



// changing the payment status and updating walletBalance--
const changePaymentStatus = async (orderId, user, amount) => {

    const orderUpdated = await Order.findByIdAndUpdate(
        { _id: orderId },
        { paymentStatus: 'Paid', amountPaid: amount });

    if (orderUpdated.paymentMethod == 'WalletWithRazorpay') {
        const findWallet = await User.findById({ _id: user._id }).populate('wallet')
        const walletBalance = findWallet.wallet.balance

        const description = 'Wallet with Razorpay';
        const type = 'debit'
        decreaseWalletAmount(user, walletBalance, description, type)
        await Order.findByIdAndUpdate(
            { _id: orderId },
            { walletPayment: walletBalance, amountPaid: amount }
        );
    }
    return orderUpdated;
};


module.exports = {
    walletAmount,
    calculateCouponDiscount,
    isValidCoupon,
    changePaymentStatus
}