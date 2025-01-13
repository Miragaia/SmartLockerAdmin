import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
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

// Function to get LockerBox details from Firestore based on lockerBoxId
async function fetchLockerBoxDetails(lockerBoxId) {
  console.log(`Fetching LockerBox details for lockerBoxId: ${lockerBoxId}`);
  const lockerRef = doc(db, "LockerBoxes", lockerBoxId); // Get the document reference for the locker
  const docSnap = await getDoc(lockerRef); // Get the document snapshot

  if (docSnap.exists()) {
    console.log(`LockerBox details found for lockerBoxId: ${lockerBoxId}`);
    const lockerData = docSnap.data();
    // Fill in the locker details in the HTML
    document.querySelector("#locker-name").textContent = lockerData.name;
    document.querySelector("#locker-type").textContent = lockerData.type;
    document.querySelector("#locker-location").textContent = lockerData.location;
    document.querySelector("#available-lockers").textContent = lockerData.availableLockers;
    document.querySelector("#maintenance-status").textContent = lockerData.maintenance ? "Yes" : "No";
  } else {
    console.log(`No document found for lockerBoxId: ${lockerBoxId}`);
  }
}

// Function to fetch lockers and populate the table
async function fetchLockers() {
  console.log("Fetching all locker boxes from Firestore...");
  const lockersRef = collection(db, "LockerBoxes"); // Collection name is now "LockerBoxes"
  const querySnapshot = await getDocs(lockersRef); // Fetch all lockers

  const lockersTable = document.getElementById("lockersTable");
  querySnapshot.forEach((doc) => {
    const locker = doc.data();
    const lockerBoxId = doc.id; // Renamed to lockerBoxId
    const status = locker.status;
    const lastDeposit = locker.lastDeposit || "N/A";
    const userId = locker.userId || "-";
    const accessCode = locker.accessCode || "-";

    const row = document.createElement("tr");
    row.classList.add("locker-row");
    row.dataset.id = lockerBoxId; // Renamed to lockerBoxId
    row.dataset.status = status;

    row.innerHTML = `
      <td>${lockerBoxId}</td> <!-- Updated to lockerBoxId -->
      <td>${lastDeposit}</td>
      <td>${status}</td>
      <td>${userId}</td>
      <td>${accessCode}</td>
    `;

    // Handle row click
    row.addEventListener("click", () => {
      console.log(`LockerBox row clicked with lockerBoxId: ${lockerBoxId}`);
      window.location.href = `LockerBoxDetails.html?lockerBoxId=${lockerBoxId}`; // Pass lockerBoxId to the URL
    });

    lockersTable.appendChild(row);
  });
}

// Initialize Map
function initMap() {
  const lockerLocation = { lat: 37.7749, lng: -122.4194 }; // Default location for the map
  console.log("Initializing map with location:", lockerLocation);

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

// Load LockerBox details based on lockerBoxId from URL
document.addEventListener("DOMContentLoaded", () => {
  const lockerBoxId = getLockerBoxIdFromURL(); // Get lockerBoxId from URL

  if (lockerBoxId) {
    console.log(`lockerBoxId found in URL: ${lockerBoxId}`);
    fetchLockerBoxDetails(lockerBoxId); // Fetch LockerBox details
    initMap(); // Initialize map
  } else {
    console.log("No lockerBoxId found in URL.");
  }

  fetchLockers(); // Fetch and display list of lockers
});
