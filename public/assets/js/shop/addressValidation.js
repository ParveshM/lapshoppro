function displayError(inputField, message) {
    const errorMessage = inputField.nextElementSibling;
    if (errorMessage && errorMessage.classList.contains('error-message')) {
        errorMessage.textContent = message;
        errorMessage.style.color = 'red';
        setTimeout(function () {
            hideError(inputField);
        }, 3000);
    }
}

// Function to hide the error message
function hideError(inputField) {
    const errorMessage = inputField.nextElementSibling;
    errorMessage.textContent = "";
}
function validateForm() {
    const nameInput = document.querySelector('input[name="name"]');
    const address = document.querySelector('input[name="address"]');
    const town = document.querySelector('input[name="town"]');
    const state = document.querySelector('input[name="state"]');
    const postCode = document.querySelector('input[name="postCode"]');
    const phone = document.querySelector('input[name="phone"]');
    const nameRegex = /^[A-Z][a-zA-Z]{3,}$/;
    const phoneRegex = /^[0]?[789]\d{9}$/;

    if (nameInput.value.trim() === '') {
        const message = 'Name is required.'
        displayError(nameInput, message)
        return false
    } else if (nameInput.value.length < 4) {
        const message = 'Name should be 4 atleast characters.'
        displayError(nameInput, message)
        return false
    } else if (!nameRegex.test(nameInput.value)) {
        const message = 'First letter of the name should be capital.'
        displayError(nameInput, message)
        return false
    }

    if (address.value.trim() === '') {
        const message = 'Address is required.';
        displayError(address, message)
        return false
    }

    if (town.value.trim() === '') {
        const message = 'Town is required.';
        displayError(town, message)
        return false
    }

    if (state.value.trim() === '') {
        const message = 'State is required.';
        displayError(state, message)
        return false
    }
    if (postCode.value.trim() === '') {
        const message = 'PostCode is required.';
        displayError(nameInput, message)
        return false
    }
    else if (!/^\d{5}$/.test(postCode.value.trim())) {
        const message = 'Invalid PostCode format. It should be a 5-digit number.';
        displayError(postCode, message);
        return false;
    }

    if (phone.value.trim() === '') {
        const message = 'Phone number is required.';
        displayError(phone, message)
        return false
    } else if (!phoneRegex.test(phone.value.trim())) {
        const message = 'Invalid phone format';
        displayError(phone, message);
        return false;
    }

    return true;

}