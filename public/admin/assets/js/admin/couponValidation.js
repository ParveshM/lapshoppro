const errorMessage = document.getElementById('error-message');

const hide = (element) => {
    element.style.display = 'none';
}

function validateForm() {
    const code = document.getElementById('couponCode').value;
    const discountAmount = document.getElementById('discountAmount').value;
    const expirationDate = document.getElementById('expirationDate').value;
    const minimumPurchase = document.getElementById('minimumPurchase').value
    const maximumPurchase = document.getElementById('maximumPurchase').value
    const maximumUses = document.getElementById('maximumUses').value
    const description = document.getElementById('description').value;

    if (code.trim() === '' || discountAmount.trim() === '' ||
        discountAmount.trim() === '' || minimumPurchase.trim() === '' ||
        maximumPurchase.trim() === '' || description.trim() === '' ||
        expirationDate.trim() == '') {
        errorMessage.textContent = 'All fields are required.';
        errorMessage.style.display = 'block';
        setTimeout(() => hide(errorMessage), 3000);
        return false; // Prevent form submission
    }

    if (isNaN(minimumPurchase) || minimumPurchase < 0) {
        errorMessage.textContent = 'Minimum Purchase limit must be a non-negative number.';
        errorMessage.style.display = 'block';
        setTimeout(() => hide(errorMessage), 3000);
        return false;
    }

    if (isNaN(maximumPurchase) || maximumPurchase < 0) {
        errorMessage.textContent = 'Maximum Purchase limit must be a non-negative number.';
        errorMessage.style.display = 'block';
        setTimeout(() => hide(errorMessage), 3000);
        return false;
    }

    if (isNaN(discountAmount) || discountAmount < 0 || discountAmount > 50) {
        errorMessage.textContent = 'Discount limit must be a number between 0 and 50%.';
        errorMessage.style.display = 'block';
        setTimeout(() => hide(errorMessage), 3000);
        return false;
    }

    if (isNaN(maximumUses) || maximumUses < 0) {
        errorMessage.textContent = 'Maximum Uses must be a non-negative integer.';
        errorMessage.style.display = 'block';
        setTimeout(() => hide(errorMessage), 3000);
        return false;
    }

    if (description.trim().length < 6) {
        errorMessage.textContent = 'Description should be at least 6 characters.';
        errorMessage.style.display = 'block';
        setTimeout(() => hide(errorMessage), 3000);
        return false;
    }
    if (parseFloat(minimumPurchase) >= parseFloat(maximumPurchase)) {
        errorMessage.textContent = 'Minimum Purchase limit must less than maximimum limit.';
        errorMessage.style.display = 'block';
        setTimeout(() => hide(errorMessage), 3000);
        return false;
    }

    return true;
}