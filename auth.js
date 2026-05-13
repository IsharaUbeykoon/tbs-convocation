/* =========================================================
   AUTHENTICATION UTILITIES
========================================================= */

function saveLoggedInUser(user) {
  sessionStorage.setItem('loggedInUser', JSON.stringify(user));
}

function getLoggedInUser() {
  const data = sessionStorage.getItem('loggedInUser');
  return data ? JSON.parse(data) : null;
}

function isLoggedIn() {
  return getLoggedInUser() !== null;
}

function protectDashboard() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

function logout() {
  sessionStorage.removeItem('loggedInUser');
  window.location.href = 'login.html';
}