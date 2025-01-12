// Function to filter the LockerBoxes based on the search and filter criteria
function filterLockerBoxes() {
    const searchQuery = document.getElementById('searchBox').value.toLowerCase();
    const availabilityFilter = document.getElementById('filterAvailability').value;
    const maintenanceFilter = document.getElementById('filterMaintenance').value;
    
    // Get all the table rows
    const rows = document.querySelectorAll('#lockerBoxesTable tr');
  
    rows.forEach(row => {
      const name = row.cells[0].innerText.toLowerCase();
      const availableLockers = row.cells[1].innerText;
      const inMaintenance = row.cells[2].innerText.toLowerCase();
      const lockerBoxType = row.cells[3].innerText.toLowerCase();
      const location = row.cells[4].innerText.toLowerCase();
  
      // Check if the row matches the search query
      const matchesSearch = name.includes(searchQuery);
  
      // Check if the row matches the filters
      const matchesAvailability = availabilityFilter ? availableLockers === availabilityFilter : true;
      const matchesMaintenance = maintenanceFilter ? inMaintenance === maintenanceFilter : true;
  
      // If the row matches search and filter conditions, show it; otherwise, hide it
      if (matchesSearch && matchesAvailability && matchesMaintenance) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }
  
  // Add event listeners for the search box and filter dropdowns
  document.getElementById('searchBox').addEventListener('input', filterLockerBoxes);
  document.getElementById('filterAvailability').addEventListener('change', filterLockerBoxes);
  document.getElementById('filterMaintenance').addEventListener('change', filterLockerBoxes);
  
  // Initial filtering on page load (if needed)
  window.onload = () => {
    filterLockerBoxes();
  };
  