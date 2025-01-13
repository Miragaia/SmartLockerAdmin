// Import required Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAW7qL7U-Vxp5O5sweZwN8HtbhE0eFJXls",
  authDomain: "teste-60800.firebaseapp.com",
  projectId: "teste-60800",
  storageBucket: "teste-60800.firebasestorage.app",
  messagingSenderId: "166775684487",
  appId: "1:166775684487:web:4e1ca049517bc0c5632722",
  measurementId: "G-HJVJ6ZTFGB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export Firebase Firestore instance
export { db, collection, getDocs };
