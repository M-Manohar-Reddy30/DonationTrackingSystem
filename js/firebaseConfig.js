// firebaseConfig.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider,
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVKfekfdUaRcaO8GXVkDJ7RSEYCOEzGdo",
  authDomain: "charity-donation-system-8a92f.firebaseapp.com",
  projectId: "charity-donation-system-8a92f",
  storageBucket: "charity-donation-system-8a92f.firebasestorage.app",
  messagingSenderId: "474185233581",
  appId: "1:474185233581:web:3ec10cf9087aaabec48224"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// expose to non-module inline scripts
window.firebaseApp = app;
window.auth = auth;
window.provider = provider;

// expose commonly used auth functions globally so existing inline scripts work
window.signInWithPopup = signInWithPopup;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signOut = signOut;
window.onAuthStateChanged = onAuthStateChanged;
// also expose a small helper to get current user
window.getCurrentUser = () => auth.currentUser;
console.log("Firebase initialized (firebaseConfig.js)");
