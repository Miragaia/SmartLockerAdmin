// Import required Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvtimcrmdl7RuIKzLJDoZMnwZctlZgXig",
  authDomain: "smartlocker-b8ec3.firebaseapp.com",
  projectId: "smartlocker-b8ec3",
  storageBucket: "smartlocker-b8ec3.firebasestorage.app",
  messagingSenderId: "782740657417",
  appId: "1:782740657417:web:39a4c953422b53dc05efd8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to fetch and populate the table
function populateTable(snapshot) {
  const lockerBoxesTable = document.getElementById("lockerBoxesTable");
  lockerBoxesTable.innerHTML = ""; // Clear existing rows

  snapshot.forEach((doc) => {
    const data = doc.data();
    const { name, availableLockers, lockerBoxType, location } = data;

    // Calculate maintenance status based on available lockers
    const inMaintenance = availableLockers === 0 ? "True" : "False";

    // Add a row to the table
    const row = `
      <tr data-lockerbox="${name}">
        <td>${name}</td>
        <td>${availableLockers}</td>
        <td>${inMaintenance}</td>
        <td>${lockerBoxType}</td>
        <td>(${location.latitude}, ${location.longitude})</td>
      </tr>
    `;

    lockerBoxesTable.innerHTML += row;
  });

  // Make rows clickable
  makeRowsClickable();
}

// Function to make rows clickable
function makeRowsClickable() {
  const rows = document.querySelectorAll("#lockerBoxesTable tr");
  rows.forEach((row) => {
    row.addEventListener("click", () => {
      const lockerBoxName = row.getAttribute("data-lockerbox");
      if (lockerBoxName) {
        window.location.href = `LockerBoxDetails.html?name=${encodeURIComponent(lockerBoxName)}`;
      }
    });
  });
}

// Listen for real-time updates in LockerBoxes collection
onSnapshot(collection(db, "LockerBoxes"), (snapshot) => {
  populateTable(snapshot.docs); // Pass the updated snapshot
});
