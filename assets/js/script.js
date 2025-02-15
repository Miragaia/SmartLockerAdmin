import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

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

// Function to fetch and populate the table
function populateTable(snapshot) {
  const lockerBoxesTable = document.getElementById("lockerBoxesTable");
  lockerBoxesTable.innerHTML = ""; // Clear existing rows

  snapshot.forEach((doc) => {
    const data = doc.data();
    const { name, availableLockers, lockerBoxType, location } = data;

    // Calculate maintenance status based on available lockers
    const inMaintenance = availableLockers === 0 ? "true" : "false";

    // Add a row to the table
    const row = `
      <tr data-lockerbox-id="${doc.id}">
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
  // Apply filters after populating the table
  filterLockerBoxes();
}

// Function to make rows clickable
function makeRowsClickable() {
  const rows = document.querySelectorAll("#lockerBoxesTable tr");
  rows.forEach((row) => {
    row.addEventListener("click", () => {
      const lockerBoxId = row.getAttribute("data-lockerbox-id");
      if (lockerBoxId) {
        window.location.href = `LockerBoxDetails.html?id=${encodeURIComponent(lockerBoxId)}`;
      }
    });
  });
}

// Function to filter the LockerBoxes based on the search and filter criteria
function filterLockerBoxes() {
  const searchQuery = document.getElementById("searchBox").value.toLowerCase();
  const lockerBoxTypeFilter = document.getElementById("filterLockerBoxType").value.toLowerCase();
  const maintenanceFilter = document.getElementById("filterMaintenance").value;

  // Get all the table rows
  const rows = document.querySelectorAll("#lockerBoxesTable tr");
  rows.forEach((row) => {
    const name = row.cells[0].innerText.toLowerCase();
    const availableLockers = row.cells[1].innerText;
    const inMaintenance = row.cells[2].innerText.toLowerCase();
    const lockerBoxType = row.cells[3].innerText.toLowerCase();

    // Check if the row matches the search query
    const matchesSearch = name.includes(searchQuery);
    // Check if the row matches the LockerBox Type filter
    const matchesLockerBoxType = lockerBoxTypeFilter
      ? lockerBoxType.includes(lockerBoxTypeFilter)
      : true;
    // Check if the row matches the maintenance filter
    const matchesMaintenance = maintenanceFilter
      ? inMaintenance === maintenanceFilter
      : true;

    // If the row matches search and filter conditions, show it; otherwise, hide it
    if (matchesSearch && matchesLockerBoxType && matchesMaintenance) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// Attach event listeners to search and filter inputs
document.getElementById("searchBox").addEventListener("input", filterLockerBoxes);
document.getElementById("filterLockerBoxType").addEventListener("change", filterLockerBoxes);
document.getElementById("filterMaintenance").addEventListener("change", filterLockerBoxes);

// Listen for real-time updates in LockerBoxes collection
onSnapshot(collection(db, "LockerBoxes"), (snapshot) => {
  populateTable(snapshot.docs); // Pass the updated snapshot
});