// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDCPv7xbqk2G57KcWNZH-RtlMc7Dcl_oAw",
  authDomain: "auth-app-ed077.firebaseapp.com",
  projectId: "auth-app-ed077",
  storageBucket: "auth-app-ed077.firebasestorage.app",
  messagingSenderId: "996052589935",
  appId: "1:996052589935:web:4cc4a67b64cc99d8389c9a",
  measurementId: "G-NHCNTQVMJ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut };
