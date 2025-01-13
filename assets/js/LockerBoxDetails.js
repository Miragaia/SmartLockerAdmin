import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch LockerBox details with real-time listener
async function fetchLockerBoxDetails(lockerBoxId) {
  console.log(`Fetching LockerBox details for lockerBoxId: ${lockerBoxId}`);
  const lockerRef = doc(db, "LockerBoxes", lockerBoxId);
  
  // Use onSnapshot for real-time updates
  onSnapshot(lockerRef, (docSnap) => {
    if (docSnap.exists()) {
      const lockerData = docSnap.data();

      // Extract location data (ensure it's an object with lat and lng)
      const lockerLocation = lockerData.location ? {
        lat: lockerData.location._lat,   // Extract lat from GeoPoint
        lng: lockerData.location._long  // Extract lng from GeoPoint
      } : { lat: 37.7749, lng: -122.4194 }; // Default fallback values if location is missing

      console.log("Using location:", lockerLocation);

      // Check if the extracted values are valid numbers
      if (isNaN(lockerLocation.lat) || isNaN(lockerLocation.lng)) {
        console.error("Invalid location coordinates:", lockerLocation);
      }

      // Fill in the locker details in the HTML
      document.querySelector("#locker-name").textContent = lockerData.name;
      document.querySelector("#locker-type").textContent = lockerData.type;
      document.querySelector("#locker-location").textContent = `${lockerData.location._lat}, ${lockerData.location._long}`;
      document.querySelector("#available-lockers").textContent = lockerData.availableLockers;
      document.querySelector("#maintenance-status").textContent = lockerData.maintenance ? "Yes" : "No";

      // Initialize Map with actual location
      initMap(lockerLocation);
    } else {
      console.log(`No document found for lockerBoxId: ${lockerBoxId}`);
    }
  });
}

async function fetchLockers(lockerBoxId) {
  console.log(`Fetching lockers for LockerBox with lockerBoxId: ${lockerBoxId}`);
  const lockersRef = collection(db, "LockerBoxes", lockerBoxId, "Lockers");

  // Use onSnapshot for real-time updates
  onSnapshot(lockersRef, (querySnapshot) => {
    const lockersTable = document.getElementById("lockersTable");
    lockersTable.innerHTML = ""; // Clear the table before updating with new data

    // Define a color mapping for the status
    const statusColorMap = {
      available: "#bdf4ca", // Green for available lockers
      occupied: "#f4b5bb",   // Red for lockers in use
      maintenance: "#fff3cd" // Yellow for lockers under maintenance
    };

    querySnapshot.forEach((doc) => {
      const locker = doc.data();
      const lockerId = doc.id;
      const status = locker.status;

      let lastDeposit = "N/A";
      if (locker.lastAccessTimestamp) {
        const timestamp = locker.lastAccessTimestamp;
        const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
        lastDeposit = date.toLocaleString();
      }

      const userId = locker.userId || "-";
      const accessCode = locker.accessCode || "-";

      const row = document.createElement("tr");
      row.classList.add("locker-row");
      row.dataset.id = lockerId; // Set lockerId as data attribute
      row.dataset.status = status;

      // Set background color based on status
      const rowColor = statusColorMap[status] || "#ffffff"; // Default to white if status not mapped
      row.style.backgroundColor = rowColor;

      row.innerHTML = `
        <td>${lockerId}</td>
        <td>${lastDeposit}</td>
        <td>${status}</td>
        <td>${userId}</td>
      `;

      // Handle row click
      row.addEventListener("click", () => {
        console.log(`Locker row clicked with lockerId and lockerBoxId: ${lockerId}, ${lockerBoxId}`);
        // Pass both lockerId and lockerBoxId to LockerDetails.html
        window.location.href = `LockerDetails.html?lockerId=${lockerId}&lockerBoxId=${lockerBoxId}`;
      });

      lockersTable.appendChild(row);
    });
  });
}

// Initialize map with the location of the LockerBox
function initMap(lockerLocation) {
  // Ensure the location is valid before proceeding
  if (isNaN(lockerLocation.lat) || isNaN(lockerLocation.lng)) {
    console.error("Invalid locker location:", lockerLocation);
    return;
  }

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: lockerLocation,
  });

  const marker = new google.maps.Marker({
    position: lockerLocation,
    map: map,
    title: "LockerBox Location",
  });
}

// Get lockerBoxId from URL parameters
function getLockerBoxIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const lockerBoxId = urlParams.get("id"); // Updated to lockerBoxId
  console.log(`lockerBoxId from URL: ${lockerBoxId}`);
  return lockerBoxId;
}

// Load LockerBox details and lockers list based on lockerBoxId from URL
document.addEventListener("DOMContentLoaded", () => {
  const lockerBoxId = getLockerBoxIdFromURL(); // Get lockerBoxId from URL

  if (lockerBoxId) {
    console.log(`lockerBoxId found in URL: ${lockerBoxId}`);
    fetchLockerBoxDetails(lockerBoxId); // Fetch LockerBox details with real-time updates
    fetchLockers(lockerBoxId); // Fetch and display list of lockers for the specific LockerBox with real-time updates
  } else {
    console.log("No lockerBoxId found in URL.");
  }
});
