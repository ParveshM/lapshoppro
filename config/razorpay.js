const Razorpay = require('razorpay');
const crypto = require('crypto')

var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});

// creating a newOrder--
const generateRazorPay = (total, orderId) => {
    return new Promise((resolve, reject) => {
        
        var options = {
            amount: total * 100,
            currency: "INR",
            receipt: "" + orderId
        };

        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log('error in creating order', err);
                reject(err);
            } else {
               resolve(order)
            }
        });

    })
}

// verifyingPayment--
const verifyingPayment = (details) => {
    return new Promise((resolve, reject) => {
        let hmac = crypto.createHmac('sha256', 'RbOcBnNtwY9o1x8Zp6lf98lt')
        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)
        hmac = hmac.digest('hex')
        if(hmac==details.payment.razorpay_signature){
            resolve()
        }else{
            reject(err)
        }

    })
}


module.exports = { generateRazorPay, verifyingPayment }