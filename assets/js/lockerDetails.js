// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore, doc, collection, query, where, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBvtimcrmdl7RuIKzLJDoZMnwZctlZgXig",
  authDomain: "smartlocker-b8ec3.firebaseapp.com",
  projectId: "smartlocker-b8ec3",
  storageBucket: "smartlocker-b8ec3.firebasestorage.app",
  messagingSenderId: "782740657417",
  appId: "1:782740657417:web:39a4c953422b53dc05efd8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.onload = () => {
  // Get lockerId and lockerBoxId from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const lockerId = urlParams.get("lockerId");
  const lockerBoxId = urlParams.get("lockerBoxId");

  if (!lockerId || !lockerBoxId) {
    alert("Locker ID or LockerBox ID not provided in the URL.");
    return;
  }

  // Fetch Locker details and logs
  fetchLockerDetails(lockerBoxId, lockerId);
  fetchLockerLogs(lockerBoxId, lockerId);
};

// Fetch Locker details
function fetchLockerDetails(lockerBoxId, lockerId) {
  const lockerRef = doc(db, "LockerBoxes", lockerBoxId, "Lockers", lockerId);

  // Real-time listener for Locker details
  onSnapshot(lockerRef, (docSnap) => {
    if (docSnap.exists()) {
      const lockerData = docSnap.data();
      document.querySelector("#lockerName").textContent = lockerData.name || "N/A";
      document.querySelector("#status").textContent = lockerData.status || "N/A";
      document.querySelector("#lastAccessTime").textContent = lockerData.lastAccessTimestamp?.toDate()?.toLocaleString() || "N/A";

      const userIdElement = document.querySelector("#userIdRow");
      if (lockerData.userId && lockerData.userId !== "N/A") {
        document.querySelector("#userId").textContent = lockerData.userId || "N/A";
        userIdElement.style.display = "block"; // Show the row
      } else {
        userIdElement.style.display = "none"; // Hide the row
      }
    } else {
      console.log(`No document found for lockerId: ${lockerId} in LockerBox: ${lockerBoxId}`);
    }
  });
}

// Fetch Locker logs and filter based on user input
async function fetchLockerLogs(lockerBoxId, lockerId) {
  const logsTable = document.getElementById("lockerLogsTable");
  logsTable.innerHTML = ""; // Clear previous rows

  try {
    const logsRef = collection(db, "LockerBoxes", lockerBoxId, "Lockers", lockerId, "Logs");
    const snapshot = await getDocs(logsRef);

    const logs = snapshot.docs.map((logDoc) => {
      const logData = logDoc.data();
      return {
        id: logData.id,
        action: logData.action || "N/A",
        timestamp: logData.timestamp?.toDate()?.toLocaleString() || "N/A",
        userId: logData.userId || "N/A",
      };
    });

    // Display logs initially
    displayLogs(logs);

    // Setup filters and listen for changes
    setupFilters(logs);
  } catch (error) {
    console.error("Error fetching locker logs:", error);
  }
}

// Display logs in the table
function displayLogs(logs) {
  const logsTable = document.getElementById("lockerLogsTable");
  logsTable.innerHTML = ""; // Clear previous rows

  logs.forEach((logData) => {
    console.log(logData);
    const row = document.createElement("tr");

    if (logData.action === "occupied") {
      row.classList.add("row-occupied");
    } else if (logData.action === "available") {
      row.classList.add("row-available");
    } else if (logData.action === "maintenance") {
      row.classList.add("row-maintenance");
    }

    row.innerHTML = `
      <td>${logData.action}</td>
      <td>${logData.timestamp}</td>
      <td>${logData.userId}</td>
    `;
    logsTable.appendChild(row);
  });
}

// Setup filter functionality
function setupFilters(logs) {
  const actionFilter = document.getElementById("actionFilter");
  const timestampFilter = document.getElementById("timestampFilter");

  function filterLogs() {
    const action = actionFilter.value;
    const timestamp = timestampFilter.value;

    const filteredLogs = logs.filter((log) => {
      const matchesAction = action === "" || log.action === action;
      const matchesTimestamp = timestamp === "" || log.timestamp.startsWith(timestamp);

      return matchesAction && matchesTimestamp;
    });

    displayLogs(filteredLogs);
  }

  // Add event listeners for filtering
  actionFilter.addEventListener("change", filterLogs);
  timestampFilter.addEventListener("change", filterLogs);
}
