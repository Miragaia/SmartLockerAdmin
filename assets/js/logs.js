import { db } from "../firebase/firebase.js";

export const fetchLogs = async () => {
  const logsTable = document.getElementById("logsTable");
  logsTable.innerHTML = "";

  try {
    const lockerBoxesSnapshot = await db.collection("LockerBoxes").get();
    lockerBoxesSnapshot.forEach(async (lockerBoxDoc) => {
      const lockersSnapshot = await lockerBoxDoc.ref.collection("Lockers").get();
      lockersSnapshot.forEach(async (lockerDoc) => {
        const logsSnapshot = await lockerDoc.ref.collection("Logs").get();
        logsSnapshot.forEach((logDoc) => {
          const logData = logDoc.data();
          const row = `
            <tr>
              <td>${logData.lockerId}</td>
              <td>${logData.userId}</td>
              <td>${logData.action}</td>
              <td>${new Date(logData.timestamp.seconds * 1000).toLocaleString()}</td>
            </tr>
          `;
          logsTable.innerHTML += row;
        });
      });
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
  }
};
