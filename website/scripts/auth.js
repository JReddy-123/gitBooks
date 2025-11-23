/**
 * Authentication page functionality
 */

// Check if already logged in
if (API.isAuthenticated()) {
  window.location.href = 'marketplace.html';
}

// Tab switching
const tabSignup = document.getElementById('tabSignup');
const tabLogin = document.getElementById('tabLogin');
const signupPanel = document.getElementById('signupPanel');
const loginPanel = document.getElementById('loginPanel');

tabSignup.addEventListener('click', () => {
  signupPanel.classList.remove('hidden');
  loginPanel.classList.add('hidden');
  tabSignup.classList.add('active');
  tabLogin.classList.remove('active');
  clearMessages();
});

tabLogin.addEventListener('click', () => {
  signupPanel.classList.add('hidden');
  loginPanel.classList.remove('hidden');
  tabLogin.classList.add('active');
  tabSignup.classList.remove('active');
  clearMessages();
});

// Clear all messages
function clearMessages() {
  document.getElementById('signupMsg').className = 'msg hidden';
  document.getElementById('loginMsg').className = 'msg hidden';
}

// Show message
function showMessage(elementId, message, type = 'error') {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `msg ${type}`;
}

// Hide message
function hideMessage(elementId) {
  document.getElementById(elementId).className = 'msg hidden';
}

// ==================== Sign Up Form ====================

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = document.getElementById('suFirstName').value.trim();
  const lastName = document.getElementById('suLastName').value.trim();
  const email = document.getElementById('suEmail').value.trim();
  const phone = document.getElementById('suPhone').value.trim();
  const password = document.getElementById('suPassword').value;
  const password2 = document.getElementById('suPassword2').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Client-side validation
  if (!firstName) {
    showMessage('signupMsg', 'First name is required', 'error');
    return;
  }

  if (!lastName) {
    showMessage('signupMsg', 'Last name is required', 'error');
    return;
  }

  if (!Utils.isValidEmail(email)) {
    showMessage('signupMsg', 'Please use your UNCC, Charlotte, or student email address', 'error');
    return;
  }

  if (password.length < 8) {
    showMessage('signupMsg', 'Password must be at least 8 characters long', 'error');
    return;
  }

  if (password !== password2) {
    showMessage('signupMsg', 'Passwords do not match', 'error');
    return;
  }

  try {
    showMessage('signupMsg', 'Creating account...', 'info');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    await API.signup(email, password, firstName, lastName, phone || null);

    showMessage('signupMsg', 'Account created successfully! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = 'marketplace.html';
    }, 1000);

  } catch (error) {
    console.error('Signup error:', error);
    showMessage('signupMsg', API.getErrorMessage(error), 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
});

// ==================== Log In Form ====================

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('liEmail').value.trim();
  const password = document.getElementById('liPassword').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Client-side validation
  if (!email) {
    showMessage('loginMsg', 'Email is required', 'error');
    return;
  }

  if (!password) {
    showMessage('loginMsg', 'Password is required', 'error');
    return;
  }

  try {
    showMessage('loginMsg', 'Logging in...', 'info');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    await API.login(email, password);

    showMessage('loginMsg', 'Login successful! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = 'marketplace.html';
    }, 1000);

  } catch (error) {
    console.error('Login error:', error);
    
    let errorMessage = API.getErrorMessage(error);
    
    // Specific error handling
    if (error.status === 429) {
      errorMessage = 'Too many login attempts. Please wait a minute and try again.';
    } else if (error.status === 401) {
      errorMessage = 'Invalid email or password. Please try again.';
    }
    
    showMessage('loginMsg', errorMessage, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Log In';
  }
});