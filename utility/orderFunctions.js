// calculating the total from cart
function calculateSubtotal(userWithCart) {
    const cartItems = userWithCart.cart.map(cartItem => ({ // Access the cart items and their quantities
        product: cartItem.product,
        quantity: cartItem.quantity,
    }));
    const result = [];
    // Calculate Cart Subtotal
    const cartSubtotal = cartItems.reduce((total, item) => {
        return total + item.product.salePrice * item.quantity;
    }, 0);

    // const processingFee = 50;
    let taxAmount = Math.ceil(0.01 * cartSubtotal);
    const orderTotal = cartSubtotal + taxAmount;
    if (cartSubtotal < 100000) {
        taxAmount = 0;
    }
    result.push(cartItems, cartSubtotal, taxAmount, orderTotal);
    return result;
}



module.exports = {calculateSubtotal}