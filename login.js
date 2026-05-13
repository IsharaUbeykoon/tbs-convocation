const API_URL =
  'https://script.google.com/macros/s/AKfycbww9Itv9SDH_7CGy99v1S9K7tMq43Jac6tqEhbM0xZyG8Q93fPQtvmnqT-9aa3sPTfpsg/exec';

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const toast = document.getElementById('toast');

/* =========================================
   Redirect if already logged in
========================================= */
if (isLoggedIn()) {
  window.location.href = 'index.html';
}

/* =========================================
   Toast
========================================= */
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* =========================================
   Toggle Password
========================================= */
togglePassword.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';

  passwordInput.type = isPassword ? 'text' : 'password';

  togglePassword.innerHTML = isPassword
    ? '<i class="fas fa-eye-slash"></i>'
    : '<i class="fas fa-eye"></i>';
});

/* =========================================
   Login Submit
========================================= */
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    showToast('Please enter username and password', 'error');
    return;
  }

  loginBtn.classList.add('loading');
  loginBtn.disabled = true;

  try {
    const formData = new FormData();
    formData.append('action', 'login');
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      // Save session using auth.js
      saveLoggedInUser({
        username: result.username,
        role: result.role
      });

      showToast(`Welcome ${result.username}`, 'success');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    } else {
      showToast(
        result.message || 'Invalid username or password',
        'error'
      );
    }

  } catch (error) {
    console.error(error);
    showToast('Connection error', 'error');
  } finally {
    loginBtn.classList.remove('loading');
    loginBtn.disabled = false;
  }
});