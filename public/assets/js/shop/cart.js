

// Send an AJAX request to the server to check product availability
function checkProductAvailability() {
    $.ajax({
        type: "GET",
        url: "/checkProductAvailability",
        success: function (response) {
            let allProductsAvailable = true;
            response.cartItems.forEach(item => {
                const productId = item.product._id;
                const quantityInput = $(`#quantity-${productId}`);
                const href = $('#checkout-link');
                const checkoutButton = $('.checkout-tag');

                // Check if the product is out of stock
                if (item.quantity > item.product.quantity) {
                    // Disable the quantity input and display a message
                    quantityInput.remove("disabled", true);
                    quantityInput.val('0');
                    allProductsAvailable = false; // Set the flag to false
                    $(`#AvailableStock-${productId}`).text(`Available stock ${item.product.quantity}`);
                    $(`#subtotal-${productId}`).text(`OUT OF STOCK!`);
                    $(`#subtotal-${productId}`).css('color', 'red')
                } else {
                    // Enable the quantity input
                    quantityInput.removeAttr("disabled");
                    // Update the subtotal based on the updated quantity and price
                    const subtotal = item.product.salePrice * item.quantity;
                    $(`#subtotal-${productId}`).text(`₹${subtotal.toLocaleString()}`);
                }

                if (allProductsAvailable) {
                    $(`#outOfStock-${productId}`).text("");
                    $(`#AvailableStock-${productId}`).text('')
                    $(`#subtotal-${productId}`).css('color', '')
                    checkoutButton.prop("disabled", false);
                    href.attr('href', '/checkout');
                } else {
                    checkoutButton.prop("disabled", true);
                    href.removeAttr('href');
                }
            });
        },
        error: function (textStatus, errorThrown) {
            console.error("Error checking product availability:", textStatus, errorThrown);
        }
    });
}
checkProductAvailability();


/***********************************************/

/**** Sending an AJAX request to the backend to update the quantity ****/
function updateCartItemQuantity(productId, newQuantity) {
    $.ajax({
        type: "POST",
        url: `/updateCartItem/${productId}`,
        data: { quantity: newQuantity },
        success: function (response) {
            $(`#quantity-${productId}`).val(newQuantity);

            // Update the subtotal for the individual product
            const productPrice = parseFloat($(`#price-${productId}`).text().replace(/[^0-9.-]+/g, ""));
            const subtotal = productPrice * newQuantity;
            $(`#subtotal-${productId}`).text(`₹${subtotal.toLocaleString()}`);

            // Update the HTML element that displays the total amount
            $('#total-amount').text(`₹${response.totalPrice.toLocaleString()}`);

        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 400) {
                // Handle out of stock or other errors
                console.error("Request rejected:", jqXHR.responseJSON.message);
            } else {
                // Handle other error cases
                console.error("Error:", textStatus, errorThrown);
            }
        }
    });
}

//button increment and decrement
function incrementQuantity(button, productId) {
    const currentQuantity = parseInt($(`#quantity-${productId}`).val());
    const newQuantity = currentQuantity + 1;
    updateCartItemQuantity(productId, newQuantity);
    checkProductAvailability();
}

function decrementQuantity(button, productId) {
    const currentQuantity = parseInt($(`#quantity-${productId}`).val());
    if (currentQuantity > 1) {
        const newQuantity = currentQuantity - 1;
        updateCartItemQuantity(productId, newQuantity);
        checkProductAvailability();
    }
}
/********************************************************************/

// sweet Alert when deleting a product from the cart
function showConfirmation(productId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to remove this item from your cart.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
        if (result.isConfirmed) {
            // If the user clicks "Yes," redirect to the removeProduct endpoint
            window.location.href = "/removeProduct/" + productId;
        }
    });
}
