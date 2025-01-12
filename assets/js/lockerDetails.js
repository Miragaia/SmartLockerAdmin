// lockerDetails.js
window.onload = () => {
    // Example: Populate locker details dynamically
    const lockerDetails = {
      lockerName: "LockerBox 1", // This could be dynamically fetched
      lockerType: "Standard",
      availableLockers: 15,
      maintenanceStatus: "Not in Maintenance",
      lockerLocation: "Location A"
    };
  
    // Set Locker Details in the DOM
    document.getElementById("lockerName").innerText = lockerDetails.lockerName;
    document.getElementById("lockerType").innerText = lockerDetails.lockerType;
    document.getElementById("availableLockers").innerText = lockerDetails.availableLockers;
    document.getElementById("maintenanceStatus").innerText = lockerDetails.maintenanceStatus;
    document.getElementById("lockerLocation").innerText = lockerDetails.lockerLocation;
  
    // Example: Populate locker logs dynamically
    const lockerLogs = [
      { id: 1, action: "Maintenance Check", date: "2025-01-01", details: "Checked the functionality of available lockers." },
      { id: 2, action: "Repair", date: "2025-01-05", details: "Repaired malfunctioning locker." },
      { id: 3, action: "Re-stock", date: "2025-01-10", details: "Added more available lockers to LockerBox 1." }
    ];
  
    const tableBody = document.getElementById("lockerLogsTable");
    
    // Insert log rows dynamically into the table
    lockerLogs.forEach(log => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${log.id}</td>
        <td>${log.action}</td>
        <td>${log.date}</td>
        <td>${log.details}</td>
      `;
      tableBody.appendChild(row);
    });
  };
  