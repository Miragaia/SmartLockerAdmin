// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore, doc, collection, query, where, onSnapshot, getDocs, updateDoc, addDoc, increment, serverTimestamp  } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

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


function fetchLockerLogs(lockerBoxId, lockerId) {
  const logsTable = document.getElementById("lockerLogsTable");
  const logsRef = collection(db, "LockerBoxes", lockerBoxId, "Lockers", lockerId, "Logs");
  const logs = []; // Array to hold the logs data

  logsTable.innerHTML = ""; // Clear previous rows

  // Real-time listener for logs
  onSnapshot(logsRef, (snapshot) => {
    // Clear logs array
    logs.length = 0;

    // Populate logs array with current snapshot
    snapshot.docs.forEach((logDoc) => {
      const logData = logDoc.data();
      logs.push({
        id: logDoc.id,
        action: logData.action || "N/A",
        timestamp: logData.timestamp?.toDate() || new Date(0), // Use a default date if timestamp is missing
        userId: logData.userId || "N/A",
      });
    });

    // Sort logs by timestamp in descending order
    logs.sort((a, b) => b.timestamp - a.timestamp);

    // Display logs in the table
    displayLogs(logs);

    // Reapply filters (if any)
    setupFilters(logs);
  });
}


// Display logs in the table
function displayLogs(logs) {
  const logsTable = document.getElementById("lockerLogsTable");
  logsTable.innerHTML = ""; // Clear previous rows

  logs.forEach((logData) => {
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
      <td>${logData.timestamp.toLocaleString()}</td>
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

document.getElementById("setMaintenance").addEventListener("click", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const lockerId = urlParams.get("lockerId");
  const lockerBoxId = urlParams.get("lockerBoxId");

  if (!lockerId || !lockerBoxId) {
    alert("Locker ID or LockerBox ID not provided in the URL.");
    return;
  }

  const lockerRef = doc(db, "LockerBoxes", lockerBoxId, "Lockers", lockerId);
  const lockerBoxRef = doc(db, "LockerBoxes", lockerBoxId);
  const logsRef = collection(db, "LockerBoxes", lockerBoxId, "Lockers", lockerId, "Logs");

  try {
    // Update the locker status to "maintenance"
    await updateDoc(lockerRef, { status: "maintenance" });

    // Decrement the availableLockers count in LockerBox
    await updateDoc(lockerBoxRef, {
      availableLockers: increment(-1),
    });

    // Add a log entry for this action
    await addDoc(logsRef, {
      action: "maintenance",
      userId: "Admin",
      timestamp: serverTimestamp(),
    });

    alert("Locker set to maintenance successfully!");
  } catch (error) {
    console.error("Error setting locker to maintenance:", error);
    alert("Failed to set locker to maintenance. Please try again.");
  }
});

