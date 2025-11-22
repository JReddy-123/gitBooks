// Tab switching logic
const tabSignup = document.getElementById('tabSignup');
const tabLogin = document.getElementById('tabLogin');
const signupPanel = document.getElementById('signupPanel');
const loginPanel = document.getElementById('loginPanel');

tabSignup.onclick = () => {
  signupPanel.style.display = 'block';
  loginPanel.style.display = 'none';
  tabSignup.classList.add('active');
  tabLogin.classList.remove('active');
};

tabLogin.onclick = () => {
  signupPanel.style.display = 'none';
  loginPanel.style.display = 'block';
  tabLogin.classList.add('active');
  tabSignup.classList.remove('active');
};

// Email validation regex
const emailRx = /@(uncc\.edu|charlotte\.edu|student\.edu)$/i;

// Signup form handler
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('suEmail').value.trim();
  const password = document.getElementById('suPass').value;
  const password2 = document.getElementById('suPass2').value;
  const msg = document.getElementById('signupMsg');

  // Client-side validation
  if (!emailRx.test(email)) {
    msg.textContent = 'Use your UNCC, Charlotte, or student email address.';
    msg.className = 'msg error';
    return;
  }

  if (password.length < 8) {
    msg.textContent = 'Password must be at least 8 characters.';
    msg.className = 'msg error';
    return;
  }

  if (password !== password2) {
    msg.textContent = 'Passwords must match.';
    msg.className = 'msg error';
    return;
  }

  try {
    // Show loading state
    msg.textContent = 'Creating account...';
    msg.className = 'msg';
    
    // Extract name from email (fallback)
    const emailParts = email.split('@')[0].split('.');
    const firstName = emailParts[0] || 'Student';
    const lastName = emailParts[1] || 'User';

    // Call API
    const result = await API.signup(
      email, 
      password, 
      firstName.charAt(0).toUpperCase() + firstName.slice(1),
      lastName.charAt(0).toUpperCase() + lastName.slice(1)
    );

    msg.textContent = 'Account created successfully! Redirecting...';
    msg.className = 'msg ok';
    
    setTimeout(() => {
      window.location.href = 'marketplace.html';
    }, 1000);

  } catch (error) {
    msg.textContent = error.message || 'Failed to create account. Please try again.';
    msg.className = 'msg error';
  }
});

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('liEmail').value.trim();
  const password = document.getElementById('liPass').value;
  const msg = document.getElementById('loginMsg');

  // Client-side validation
  if (!email || !password) {
    msg.textContent = 'Enter your email and password.';
    msg.className = 'msg error';
    return;
  }

  if (!emailRx.test(email)) {
    msg.textContent = 'Use your UNCC, Charlotte, or student email address.';
    msg.className = 'msg error';
    return;
  }

  try {
    // Show loading state
    msg.textContent = 'Logging in...';
    msg.className = 'msg';

    // Call API
    const result = await API.login(email, password);

    msg.textContent = 'Logged in successfully! Redirecting...';
    msg.className = 'msg ok';
    
    setTimeout(() => {
      window.location.href = 'marketplace.html';
    }, 1000);

  } catch (error) {
    if (error.message.includes('429')) {
      msg.textContent = 'Too many login attempts. Please wait a minute and try again.';
    } else if (error.message.includes('401') || error.message.includes('Invalid')) {
      msg.textContent = 'Invalid email or password.';
    } else {
      msg.textContent = error.message || 'Failed to login. Please try again.';
    }
    msg.className = 'msg error';
  }
});