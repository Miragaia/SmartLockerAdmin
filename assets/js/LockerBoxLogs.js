import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Firebase configuration
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

// Get lockerBoxId from URL
function getLockerBoxIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("lockerBoxId");
}

// Fetch logs for all lockers in a LockerBox
async function fetchLockerLogs(lockerBoxId) {
  const logsTable = document.getElementById("logsTable");
  logsTable.innerHTML = ""; // Clear previous rows
  const allLogs = []; // Global array to store all logs

  try {
    const lockersCollectionRef = collection(db, "LockerBoxes", lockerBoxId, "Lockers");

    // Fetch all lockers in the LockerBox
    const lockersSnapshot = await getDocs(lockersCollectionRef);

    lockersSnapshot.forEach(lockerDoc => {
      const lockerId = lockerDoc.id;
      const logsRef = collection(db, "LockerBoxes", lockerBoxId, "Lockers", lockerId, "Logs");

      // Real-time listener for logs in this locker
      onSnapshot(logsRef, (snapshot) => {
        // Remove existing logs for this locker from the global array
        for (let i = allLogs.length - 1; i >= 0; i--) {
          if (allLogs[i].lockerId === lockerId) {
            allLogs.splice(i, 1);
          }
        }

        // Add new logs for this locker
        snapshot.docs.forEach(logDoc => {
          const logData = logDoc.data();
          allLogs.push({
            lockerId,
            action: logData.action || "N/A",
            timestamp: logData.timestamp?.toDate() || new Date(0), // Default to epoch if no timestamp
            userId: logData.userId || "N/A"
          });
        });

        // Sort logs by descending timestamp
        allLogs.sort((a, b) => b.timestamp - a.timestamp);

        // Re-render the table with sorted logs
        renderLogsTable(allLogs, logsTable);
      });
    });
  } catch (error) {
    console.error("Error fetching locker logs:", error);
  }
}

function renderLogsTable(allLogs, logsTable) {
  logsTable.innerHTML = ""; // Clear existing rows

  allLogs.forEach(log => {
    const row = document.createElement("tr");

    // Add class based on action
    if (log.action === "lock") {
      row.classList.add("row-occupied");
    } else if (log.action === "unlock") {
      row.classList.add("row-available");
    } else if (log.action === "maintenance") {
      row.classList.add("row-maintenance");
    }

    row.innerHTML = `
      <td>${log.lockerId}</td>
      <td>${log.action}</td>
      <td>${log.timestamp.toLocaleString()}</td>
      <td>${log.userId}</td>
    `;
    logsTable.appendChild(row);
  });
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
