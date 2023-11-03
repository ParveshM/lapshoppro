const { checkCartItemsMatch } = require("../helpers/checkCartHelper");

// calculating the total from cart
function calculateSubtotal(userWithCart) {
    const cartItems = userWithCart.cart.map(cartItem => ({ // Access the cart items and their quantities
        product: cartItem.product,
        quantity: cartItem.quantity,

    }));
    console.log('Before check quantity');
    // checking if any of the cart quantity is greater than product quantity it will return true
    const checkingQuantity = cartItems.some(item => parseFloat(item.product.quantity) < item.quantity);
    console.log('checking qunqntiy out',checkingQuantity);
    if (checkingQuantity) {
        return false
    };
    console.log(checkingQuantity);

    const result = [];
    // Calculate Cart Subtotal
    const cartSubtotal = cartItems.reduce((total, item) => {
        return total + item.product.salePrice * item.quantity;
    }, 0);

    const processingFee = 50;
    const orderTotal = cartSubtotal + processingFee;

    result.push(cartItems, cartSubtotal, processingFee, orderTotal);
    return result;
}



module.exports = { calculateSubtotal }