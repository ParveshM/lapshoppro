const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const Wallet = require('../models/walletModel')
const Transaction = require('../models/transactionModel')

// function for decreasing the quantity when admin change status to cancelled or refunded----
async function decreaseQuantity(orderId, productId) {

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
    return productItem.price;
}


// increasing the wallet amount when user cancels the product that is paid by online payment--
async function updateWalletAmount(userId,productPrice,description,type) {
console.log('price in function',productPrice);
    //if user has wallet add amount to it else create a wallet and credit the amount.
    let userWallet = await Wallet.findOne({ user: userId });
    if (!userWallet) {
        userWallet = await Wallet.create({ user: userId });
        // insert the wallet reference to user model
        await User.findByIdAndUpdate(userId, { wallet: userWallet._id })
    }
    const walletId = userWallet._id;

    const updateWallet = await Wallet.findByIdAndUpdate(walletId,
        {
            $inc: { balance: productPrice }
        })

    const transaction = new Transaction({
        wallet: updateWallet._id,
        amount: productPrice,
        type: `${type}`,
        description: `${description}`,
    });

    const transactionId = await transaction.save();

    await Wallet.findByIdAndUpdate(walletId, {
        $push: { transactions: transactionId },
    });
    console.log('Refund completed successfully.');
}

// Decrease the users wallet amount
async function decreaseWalletAmount(userId,orderTotal,description,type) {
console.log('price in function',orderTotal);
    //if user has wallet reduce amount 
    const userWallet = await Wallet.findOne({ user: userId });
 
    const walletId = userWallet._id;

    const updateWallet = await Wallet.findByIdAndUpdate(walletId,
        {
            $inc: { balance: -orderTotal }
        })

    const transaction = new Transaction({
        wallet: updateWallet._id,
        amount: orderTotal,
        type: `${type}`,
        description: `${description}`,
    });

    const transactionId = await transaction.save();

    await Wallet.findByIdAndUpdate(walletId, {
        $push: { transactions: transactionId },
    });
    console.log('Refund completed successfully.');
}


module.exports = { decreaseQuantity, updateWalletAmount , decreaseWalletAmount}