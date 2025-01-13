import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Firebase configuration
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

// Get lockerBoxId from URL
function getLockerBoxIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("lockerBoxId");
}

// Fetch logs for all lockers in a LockerBox
async function fetchLockerLogs(lockerBoxId) {
    const logsTable = document.getElementById("logsTable");
    logsTable.innerHTML = ""; // Clear previous rows
  
    try {
      const lockersCollectionRef = collection(db, "LockerBoxes", lockerBoxId, "Lockers");
      const lockerLogsPromises = [];
  
      // Fetch all lockers in the LockerBox
      const lockersSnapshot = await getDocs(lockersCollectionRef);
      lockersSnapshot.forEach(lockerDoc => {
        const lockerId = lockerDoc.id;
        const logsRef = collection(db, "LockerBoxes", lockerBoxId, "Lockers", lockerId, "Logs");
        lockerLogsPromises.push(getDocs(logsRef).then(snapshot => ({ lockerId, snapshot })));
      });
  
      // Fetch logs for all lockers concurrently
      const lockerLogs = await Promise.all(lockerLogsPromises);
  
      lockerLogs.forEach(({ lockerId, snapshot }) => {
        snapshot.forEach(logDoc => {
          const logData = logDoc.data();
          const action = logData.action || "N/A";
          const timestamp = logData.timestamp?.toDate()?.toLocaleString() || "N/A";
          const userId = logData.userId || "N/A";
  
          const row = document.createElement("tr");
  
          // Add class based on action
          if (action === "occupied") {
            row.classList.add("row-occupied");
          } else if (action === "available") {
            row.classList.add("row-available");
          } else if (action === "maintenance") {
            row.classList.add("row-maintenance");
          }
  
          row.innerHTML = `
            <td>${lockerId}</td>
            <td>${action}</td>
            <td>${timestamp}</td>
            <td>${userId}</td>
          `;
          logsTable.appendChild(row);
        });
      });
    } catch (error) {
      console.error("Error fetching locker logs:", error);
    }
  }
  

// Add filter functionality
function setupFilters() {
  const lockerIdInput = document.getElementById("lockerIdInput");
  const actionFilter = document.getElementById("actionFilter");
  const timestampFilter = document.getElementById("timestampFilter");
  const logsTable = document.getElementById("logsTable");

  function filterLogs() {
    const lockerId = lockerIdInput.value.toLowerCase();
    const action = actionFilter.value;
    const timestamp = timestampFilter.value;

    Array.from(logsTable.rows).forEach(row => {
      const [idCell, actionCell, timestampCell] = row.cells;
      const matchesLockerId = idCell.textContent.toLowerCase().includes(lockerId);
      const matchesAction = action === "" || actionCell.textContent === action;
      const matchesTimestamp = timestamp === "" || timestampCell.textContent.startsWith(timestamp);

      row.style.display = matchesLockerId && matchesAction && matchesTimestamp ? "" : "none";
    });
  }

  lockerIdInput.addEventListener("input", filterLogs);
  actionFilter.addEventListener("change", filterLogs);
  timestampFilter.addEventListener("input", filterLogs);
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  const lockerBoxId = getLockerBoxIdFromURL();
  if (lockerBoxId) {
    fetchLockerLogs(lockerBoxId);
    setupFilters();
  } else {
    console.error("No lockerBoxId found in URL.");
  }
});
