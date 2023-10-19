
// const errorMessage = document.getElementById('error-message');

// const hide = (element) => {
//     element.style.display = 'none';
// }
function displayError(inputField, message) {
    const errorMessage = inputField.nextElementSibling;
    if (errorMessage && errorMessage.classList.contains('error-message')) {
        errorMessage.textContent = message;
        errorMessage.style.color = 'red';
        setTimeout(function () {
            hideError(inputField);
        }, 5000);
    }
}

// Function to hide the error message
function hideError(inputField) {
    const errorMessage = inputField.nextElementSibling;
    errorMessage.textContent = "";
}

function validateProductForm() {
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const colorInput = document.getElementById('color');
    const brandInput = document.getElementById('brand');
    const categoryInput = document.getElementById('category');
    const productPriceInput = document.getElementById('productPrice');
    const salePriceInput = document.getElementById('salePrice');
    const quantityInput = document.getElementById('quantity');
    const imageInput = document.getElementById('image');


    if (productPriceInput.value < 1) {
        displayError(productPriceInput, "Product price Cannot be less be 1 rupees");
        return false; // Prevent form submission
    }
    if (salePriceInput.value < 0) {
        displayError(salePriceInput, " Sale price Cannot be less than  1 rupees");
        return false; // Prevent form submission
    }
    if (quantityInput.value < 0) {
        displayError(quantityInput, " Quantity Cannot be less be 1 or negative value");
        return false; // Prevent form submission
    }
    if (titleInput.value.trim() === '') {
        displayError(titleInput, "Field is required");
        return false; // Prevent form submission
    }
    if (descriptionInput.value.trim() === '') {
        displayError(descriptionInput, "Field is required");
        return false; // Prevent form submission
    }
    if (colorInput.value.trim() === '') {
        displayError(colorInput, "Field is required");
        return false; // Prevent form submission
    }
    if (brandInput.value.trim() === '') {
        displayError(brandInput, "Field is required");
        return false; // Prevent form submission
    }
    if (categoryInput.value.trim() === '') {
        displayError(categoryInput, "Field is required");
        return false; // Prevent form submission
    }
    if (productPriceInput.value.trim() === '') {
        displayError(productPriceInput, "Field is required");
        return false; // Prevent form submission
    }
    if (salePriceInput.value.trim() == '') {
        displayError(salePriceInput, "Field is required");
        return false; // Prevent form submission
    }
    if (quantityInput.value.trim() == '') {
        displayError(quantityInput, "Field is required");
        return false; // Prevent form submission
    }
    if (imageInput.value.trim() === '') {
        displayError(imageInput, "Field is required");
        return false; // Prevent form submission
    }
    const selectedFiles = imageInput.files;
    const maxImageCount = 4;
    if (selectedFiles.length > maxImageCount) {
        displayError(imageInput, `You can only upload up to ${maxImageCount} images.`);
        return false; // Prevent form submission
    }



    return true;
}
