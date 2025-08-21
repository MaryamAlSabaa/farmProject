(async function() {
    try {
      // Fetch the entire farmerDashboard.html
      const response = await fetch('farmerDashboard.html');
      const html = await response.text();
      
      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
  
      // Extract the sidebar
      const sidebar = tempDiv.querySelector('.sidebar');
      if (sidebar) {
        const sidebarContainer = document.querySelector('.sidebar-container');
        if (sidebarContainer) {
          sidebarContainer.appendChild(sidebar);
          let btn = document.querySelector('#btn');
          let sidebarElement = document.querySelector('.sidebar');
          if (btn && sidebarElement) {
            btn.onclick = function() {
              sidebarElement.classList.toggle('active');
              document.body.classList.toggle('sidebar-container-active');
              if (sidebarElement.classList.contains('active')) {
                btn.classList.remove('fa-bars');
                btn.classList.add('fa-xmark');
              } else {
                btn.classList.remove('fa-xmark');
                btn.classList.add('fa-bars');
              }
            };
          }
        } else {
          console.error('Sidebar container not found');
        }
      } else {
        console.error('Sidebar not found in farmerDashboard.html');
      }
  
      // Extract and insert the .container header
      const headerContainer = tempDiv.querySelector('.container');
      if (headerContainer) {
        const headerClone = headerContainer.cloneNode(true);
        const pageWrapper = document.querySelector('.page-wrapper');
        if (pageWrapper) {
          pageWrapper.insertBefore(headerClone, pageWrapper.firstChild);
        }
      }
    } catch (error) {
      console.error('Error loading sidebar or header:', error);
    }
  })();

(async function(){
  const responseHeader = await fetch('farmerDashboard.html');
  const htmlHeader = await responseHeader.text(); 
  const tempDivHeader = document.createElement('div');
  tempDivHeader.innerHTML = htmlHeader;

  const header = tempDivHeader.querySelector('.header');
  // if (header) {
  //   document.getElementById('header-container').appendChild(header);
  // }
})();


(function() {
  // Apply saved theme on load
  function applyThemeFromStorage() {
    const savedTheme = localStorage.getItem('modes');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      setIcon('sun');
    } else {
      document.body.classList.remove('dark-theme');
      setIcon('moon');
    }
  }

  function setIcon(mode) {
    const icon = document.getElementById('icon');
    if (icon) {
      icon.className = mode === 'sun' ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
  }

  // Set up toggle if icon exists
  function setupToggle() {
    const icon = document.getElementById("icon");
    if (icon) {
      icon.onclick = function() {
        document.body.classList.toggle("dark-theme");
        if (document.body.classList.contains("dark-theme")) {
          setIcon('sun');
          localStorage.setItem('modes', 'dark');
        } else {
          setIcon('moon');
          localStorage.setItem('modes', 'light');
        }
      };
    }
  }

  // Run on DOMContentLoaded to ensure icon exists (especially if dynamically inserted)
  document.addEventListener('DOMContentLoaded', function() {
    applyThemeFromStorage();
    setupToggle();
  });

  // Also run immediately in case DOM is already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    applyThemeFromStorage();
    setupToggle();
  }
})();

async function loadUserAndFarms() {
  const { data: { user }, error: authError } = await supa.auth.getUser();
  if (authError) {
    console.error("Error fetching user:", authError);
    return;
  }
  const userId = user.id;

  const { data: FarmsData, error: FarmError } = await supa
    .from('Farms')
    .select(`farm_id, Farm_name, area, shape_geojson`)
    .eq('User_id', userId);
    
    if (FarmError) {
      console.error("Error fetching farm:", FarmError);
      return;
    }

    const { data: UserData, error: UserError } = await supa
    .from('users')
    .select('*')
    .eq('user_id', userId)
    
    if (UserError) {
      console.error("Error fetching user data:", UserError);
      return;
    }
    document.getElementById('username').textContent = UserData[0].Username; 
}
document.addEventListener('DOMContentLoaded', loadUserAndFarms);
