
function updateCartItemCount() {
    $.ajax({
        type: "GET",
        url: "/getCartItemCount",
        success: function (response) {
            // Update the cart items count in the navbar
            const cartItemCount = response.cartItemCount; // Use the correct property name
            $("#cartItemCount").text(cartItemCount); // Assuming you have an element with id "cartItemCount" in your navbar
        },
        error: function (error) {
            console.error("Error fetching cart items count: ", error);
        }
    });
}
// Call this function initially to display the cart items count
updateCartItemCount();
/***********************************************/


// // sending req for addtoCart
// function updateButton(productId) {
//     $(`.addToCartButton[data-productid="${productId}"]`).text('Added to Cart');
// }
// // Handle the button click event
// $(document).on('click', '.addToCartButton', function() {
//     const productId = $(this).data('productid');
//     addToCart(productId);
// });

// function addToCart(productId) {
//     $.ajax({
//         type: "GET",
//         url: `/addToCart/${productId}`,
//         success: function (response) {
//             // Update the buttons with the class "addToCartButton"
//             updateButton(productId);
//             console.log('Successfully added');
//             console.log('Response is', response);
//             updateCartItemCount();
//         },
//         error: function (error) {
//             console.error("Error in addToCart: ", error);
//         }
//     });
// }
/**************************************************/


/**** Sending an AJAX request to the backend to update the quantity ****/
    function updateCartItemQuantity(productId, newQuantity) {
    $.ajax({
        type: "POST",
        url: `/updateCartItem/${productId}`,
        data: { quantity: newQuantity },
        success: function (response) {
            // Update the quantity input field with the new quantity
            $(`#quantity-${productId}`).val(newQuantity);
        },
        error: function (error) {
            console.error("Error updating quantity: ", error);
        }
    });
}

function incrementQuantity(button, productId) {
    const currentQuantity = parseInt($(`#quantity-${productId}`).val());
    const newQuantity = currentQuantity + 1;
    updateCartItemQuantity(productId, newQuantity);
}

function decrementQuantity(button, productId) {
    const currentQuantity = parseInt($(`#quantity-${productId}`).val());
    if (currentQuantity > 1) {
        const newQuantity = currentQuantity - 1;
        updateCartItemQuantity(productId, newQuantity);
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
