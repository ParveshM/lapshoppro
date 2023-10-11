


function walletAmount(userData, orderTotal) {

    const wallet = userData.wallet
    const walletBalance = wallet.balance
    const total = orderTotal - walletBalance;
    return total
}



module.exports = {
    walletAmount
}