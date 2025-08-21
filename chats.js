(async function() {
  // Fetch the entire farmerDashboard.html
  const response = await fetch('farmerDashboard.html');
  const html = await response.text();
  
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Extract the sidebar
  const sidebar = tempDiv.querySelector('.sidebar');
  
  if (sidebar) {
    document.getElementById('sidebar-container').appendChild(sidebar);
    
    // Initialize functionality
    let btn = document.querySelector('#btn');
    let sidebarElement = document.querySelector('.sidebar');
    
    if (btn && sidebarElement) {
      btn.onclick = function() {
        sidebarElement.classList.toggle('active');
      };
    }
  }
})();
