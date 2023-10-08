function checkCartItemsMatch(cartItemsUser, cartItemsServer) {
    if (cartItemsUser.length !== cartItemsServer.length) {
        console.log('inseidde length check');
        return false; // If the lengths are different, they don't match.
    }

    for (let i = 0; i < cartItemsUser.length; i++) {
        const clientItem = cartItemsUser[i];
        const serverItem = cartItemsServer[i];
        const quantity = Number(clientItem.quantity)

        if (quantity !== serverItem.quantity) {
            return false; // If the quantities don't match for any item, they don't match.
        }
    }

    return true; // All items have matching quantities.
}

module.exports = { checkCartItemsMatch }