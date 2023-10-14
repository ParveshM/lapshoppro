  const message = document.getElementById('message');
  const errorMessage = document.getElementById('error-message');

  const hide = (element) => { 
    element.style.display = 'none';
  }

  setTimeout(() => hide(message), 3000);
  setTimeout(() => hide(errorMessage), 3000);
  function validateForm() {
    const userName = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const repassword = document.getElementById('user-repassword').value;
   
  
    const nameRegex = /^[A-Z][a-zA-Z]{3,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     
    if (userName.trim() === '' || email.trim() === '' || password.trim() === '' || repassword.trim() === '') {
      errorMessage.textContent = 'All fields are required.';
      errorMessage.style.display = 'block';
      setTimeout(() => hide(errorMessage), 3000);
      return false; // Prevent form submission
    }
  
    if (userName.trim().length < 4) {
      errorMessage.textContent = 'Name should be at least 4 characters.';
      errorMessage.style.display = 'block';
      setTimeout(() => hide(errorMessage), 3000);
      return false;
    }
  
    if (!nameRegex.test(userName)) {
      errorMessage.textContent = 'First letter of the name should be capital.';
      errorMessage.style.display = 'block';
      setTimeout(() => hide(errorMessage), 3000);
      return false;
    }
  
    if (!emailRegex.test(email)) {
      errorMessage.textContent = 'Invalid email format.';
      errorMessage.style.display = 'block';
      setTimeout(() => hide(errorMessage), 3000);
      return false; // Prevent form submission
    }
 
    if (password !== repassword) {
      errorMessage.textContent = 'Passwords do not match.';
      errorMessage.style.display = 'block';
      setTimeout(() => hide(errorMessage), 3000);
      return false; // Prevent form submission
    }
  
    return true; // Allow form submission
  }
  