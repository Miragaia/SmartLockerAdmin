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

function fetchLockerDetails(lockerBoxId, lockerId) {
  console.log(`Fetching Locker details for lockerId: ${lockerId} in LockerBox: ${lockerBoxId}`);
  
  const lockerRef = doc(db, "LockerBoxes", lockerBoxId, "Lockers", lockerId);

  // Real-time listener for Locker details
  onSnapshot(lockerRef, (docSnap) => {
    if (docSnap.exists()) {
      const lockerData = docSnap.data();

      // Fill in Locker details in the HTML
      document.querySelector("#lockerName").textContent = lockerData.name || "N/A";
      document.querySelector("#status").textContent = lockerData.status || "N/A";
      document.querySelector("#lastAccessTime").textContent = lockerData.lastAccessTimestamp?.toDate()?.toLocaleString() || "N/A";

      // Conditionally display User ID section
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


// Fetch Locker logs using Firestore
async function fetchLockerLogs(lockerBoxId, lockerId) {
  console.log(`Fetching Locker logs for lockerId: ${lockerId} in LockerBox: ${lockerBoxId}`);

  const logsTable = document.getElementById("lockerLogsTable");
  logsTable.innerHTML = ""; // Clear previous rows

  try {
    const logsRef = collection(db, "LockerBoxes", lockerBoxId, "Lockers", lockerId, "Logs");
    const snapshot = await getDocs(logsRef);

    // Iterate over logs and create table rows
    snapshot.forEach((logDoc) => {
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
        <td>${logData.id}</td>
        <td>${action}</td>
        <td>${timestamp}</td>
        <td>${userId}</td>
      `;
      logsTable.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching locker logs:", error);
  }
}
