// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore, doc, collection, query, where, onSnapshot, getDocs, getDoc, updateDoc, addDoc, increment, serverTimestamp  } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAW7qL7U-Vxp5O5sweZwN8HtbhE0eFJXls",
  authDomain: "teste-60800.firebaseapp.com",
  projectId: "teste-60800",
  storageBucket: "teste-60800.firebasestorage.app",
  messagingSenderId: "166775684487",
  appId: "1:166775684487:web:4e1ca049517bc0c5632722",
  measurementId: "G-HJVJ6ZTFGB"
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

    if (logData.action === "lock") {
      row.classList.add("row-occupied");
    } else if (logData.action === "unlock") {
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

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const lockerId = urlParams.get("lockerId");
  const lockerBoxId = urlParams.get("lockerBoxId");

  if (!lockerId || !lockerBoxId) {
    alert("Locker ID or LockerBox ID not provided in the URL.");
    return;
  }

  const lockerRef = doc(db, "LockerBoxes", lockerBoxId, "Lockers", lockerId);
  const lockerBoxRef = doc(db, "LockerBoxes", lockerBoxId);
  const credentialsRef = doc(db, "LockerBoxes", lockerBoxId, "Lockers", lockerId, "Credentials", "DEFAULT");
  const logsRef = collection(db, "LockerBoxes", lockerBoxId, "Lockers", lockerId, "Logs");
  const button = document.getElementById("statusToggleButton");

  try {
    // Fetch current locker status
    const lockerSnap = await getDoc(lockerRef);
    if (!lockerSnap.exists()) {
      alert("Locker not found.");
      return;
    }

    const lockerData = lockerSnap.data();
    updateButtonLabel(lockerData.status);

    // Button click handler
    button.addEventListener("click", async () => {
      try {
        const currentStatus = lockerData.status;
        let newStatus = "";
        let action = "";
        let lockerBoxUpdate = {};
        let resetAccessCode = false;

        if (currentStatus === "occupied" || currentStatus === "available") {
          newStatus = "maintenance";
          action = "Set to Maintenance";
          lockerBoxUpdate = { availableLockers: increment(-1) };
          resetAccessCode = true;
        } else if (currentStatus === "maintenance") {
          newStatus = "available";
          action = "Set Available";
          lockerBoxUpdate = { availableLockers: increment(1) };
        }

        // Update the locker status and userId
        const lockerUpdates = { status: newStatus };
        if (resetAccessCode) {
          lockerUpdates.userId = ""; // Set userId to an empty string
          lockerUpdates.name = ""; // Set name to an empty string
        }

        await updateDoc(lockerRef, lockerUpdates);

        // Update LockerBox available lockers
        await updateDoc(lockerBoxRef, lockerBoxUpdate);

        // If setting to maintenance, reset the accessCode to null
        if (resetAccessCode) {
          await updateDoc(credentialsRef, { accessCode: "MAINTENANCE" });
        }
        else {
          await updateDoc(credentialsRef, { accessCode: "" });
        }

        // Add a log entry
        await addDoc(logsRef, {
          action: newStatus === "maintenance" ? "maintenance" : "unlock",
          userId: "Admin",
          timestamp: serverTimestamp(),
        });

        // Update UI
        lockerData.status = newStatus; // Update local status
        updateButtonLabel(newStatus);
        alert(`${action} successfully performed!`);
      } catch (error) {
        console.error("Error updating locker status:", error);
        alert("Failed to update locker status. Please try again.");
      }
    });
  } catch (error) {
    console.error("Error fetching locker details:", error);
    alert("Failed to fetch locker details. Please try again.");
  }

  function updateButtonLabel(status) {
    if (status === "occupied" || status === "available") {
      button.textContent = "Set to Maintenance";
      button.classList.remove("btn-success");
      button.classList.add("btn-warning");
    } else if (status === "maintenance") {
      button.textContent = "Set Available";
      button.classList.remove("btn-warning");
      button.classList.add("btn-success");
    }
  }
});



