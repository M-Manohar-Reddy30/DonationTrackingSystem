// auth.js (module)
// Wires login/signup forms and logout behavior.
// Relies on window.auth, window.provider and global auth functions provided by firebaseConfig.js

function setupAuthUI() {
  const loginBtn = document.getElementById('loginBtn');
  const googleLogin = document.getElementById('googleLogin');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');

  if(loginBtn){
    loginBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passInput ? passInput.value : '';
      if(!email || !password){ alert('Please enter email and password'); return; }
      try {
        // on signup page, attempt create; otherwise sign in
        const isSignup = location.pathname.endsWith('signup.html');
        if(isSignup){
          await window.createUserWithEmailAndPassword(window.auth, email, password);
          alert('Account created — logged in');
        } else {
          await window.signInWithEmailAndPassword(window.auth, email, password);
          alert('Logged in');
        }
        window.location.href = 'index.html';
      } catch (err) {
        alert(err.message || err);
      }
    });
  }

  if(googleLogin){
    googleLogin.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await window.signInWithPopup(window.auth, window.provider);
        window.location.href = 'index.html';
      } catch (err) {
        alert(err.message || err);
      }
    });
  }

  // Logout on pages that have logoutBtn
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn){
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await window.signOut(window.auth);
        // clear UI or redirect to login
        window.location.href = 'login.html';
      } catch (err) {
        alert(err.message || err);
      }
    });
  }

  // Keep userBadge updated
  const userBadge = document.getElementById('userBadge');
  if(window.onAuthStateChanged){
    window.onAuthStateChanged(window.auth, (user) => {
      if(user){
        if(userBadge) userBadge.textContent = user.displayName || user.email;
      } else {
        if(userBadge) userBadge.textContent = 'Not signed in';
      }
    });
  } else {
    if(userBadge) userBadge.textContent = window.getCurrentUser ? (window.getCurrentUser()?.email || 'Not signed in') : 'Not signed in';
  }
}

// Wait for firebase to be ready
document.addEventListener('DOMContentLoaded', () => {
  if(window.auth){
    setupAuthUI();
  } else {
    let attempts = 0;
    const t = setInterval(() => {
      attempts++;
      if(window.auth){
        clearInterval(t);
        setupAuthUI();
      } else if(attempts>50){
        clearInterval(t);
        console.warn('Firebase auth not available after waiting');
      }
    }, 100);
  }
});
