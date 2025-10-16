// dashboard.js (module)
// Ensures the index page shows the current user and protects the dashboard if needed.
// This file relies on firebaseConfig.js having run first.

document.addEventListener('DOMContentLoaded', () => {
  // wait for firebase to load
  const ensure = () => {
    if(window.auth && window.onAuthStateChanged){
      window.onAuthStateChanged(window.auth, (user) => {
        const userBadge = document.getElementById('userBadge');
        const logoutBtn = document.getElementById('logoutBtn');
        if(user){
          if(userBadge) userBadge.textContent = user.displayName || user.email;
          // optionally show logout button
          if(logoutBtn) logoutBtn.style.display = '';
        } else {
          // not logged in -> redirect to login page
          // Keep demo behaviour: redirect to login
          window.location.href = 'login.html';
        }
      });
    } else {
      setTimeout(ensure, 100);
    }
  };
  ensure();
});
