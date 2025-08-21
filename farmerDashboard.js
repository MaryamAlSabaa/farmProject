const lang = getCurrentLanguage();
function getCurrentLanguage() {
  // console.log(localStorage.getItem("language") || "en");
  return localStorage.getItem("language") || "en";
}

let btn = document.querySelector('#btn')
let sidebar = document.querySelector('.sidebar')
tySection = document.querySelector('.search-city')

function setupSidebarToggle() {
  const btn = document.querySelector('#btn');
  const sidebar = document.querySelector('.sidebar');
  if (btn && sidebar) {
    btn.onclick = function() {
      sidebar.classList.toggle('active');
      document.body.classList.toggle('sidebar-active');
      if (sidebar.classList.contains('active')) {
        btn.classList.remove('fa-bars');
        btn.classList.add('fa-xmark');
      } else {
        btn.classList.remove('fa-xmark');
        btn.classList.add('fa-bars');
      }
    };
  }
}

// Call this after sidebar is inserted, or on DOMContentLoaded
document.addEventListener('DOMContentLoaded', setupSidebarToggle);

// DARK MODE LOGIC (shared across all pages)
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

document.getElementById("greetingMessage").innerText = getGreeting(lang) +', ';

// Greeting based on time
function getGreeting(lang) {
  const now = new Date();
  const hour = now.getHours();
  let period;
  if (hour >= 5 && hour < 12) {
    period = "morning";
  } else if (hour >= 12 && hour < 17) {
    period = "afternoon";
  } else if (hour >= 17 && hour < 21) {
    period = "evening";
  } else {
    period = "night";
  }
  return translations.greetings[lang][period];
}

})();

const driver = window.driver.js.driver;
const helpBtn = document.getElementById('help');
helpBtn.addEventListener('click', function(){

const driverObj = driver({
  animate: false,
  showProgress: true,
  showButtons: ['next', 'previous', 'close'],
  steps: [
    { element: '#icon1', popover: { title: 'My Farms', description: 'View all your farms, including linked greenhouses, associated technicians, and detailed farm data in one place.', side: "left", align: 'start' }},
    { element: '#icon2', popover: { title: 'Schedule', description: 'Plan and organize your own activities, meetings, and routines.', side: "left", align: 'start' }},
    { element: '#icon3', popover: { title: 'Tasks', description: 'Track and manage tasks assigned to your team across different farms and greenhouses.', side: "left", align: 'start' }},
    { element: '#icon4', popover: { title: 'Chats', description: 'Communicate directly with your technicians and team members.', side: "left", align: 'start' }},
    { element: '#icon5', popover: { title: 'Crops', description: 'Add and manage the crops and plants in your farms. Track planting, growth, and harvest progress.', side: "left", align: 'start' }},
    { element: '#icon6', popover: { title: 'Invite Technicians', description: 'Add new technicians to your farm by sending them a tailored invite.', side: "left", align: 'start' }},
    { element: '#icon7', popover: { title: 'Add Farm Location', description: 'Add a new farm by placing it on the map. You can mark areas as greenhouses, irrigation zones, or farm fields.', side: "left", align: 'start' }}
    ]
});
driverObj.drive();
  
})

async function loadUserAndFarms() {
  const { data: { user }, error: authError } = await supa.auth.getUser();
  if (authError) {
    console.error("Error fetching user:", authError);
    return;
  }
  console.log(user);

  const userId = user.id;
  console.log(userId);

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
    console.log(UserData);

    document.getElementById('username').textContent = UserData[0].Username; 
    localStorage.setItem("username", UserData[0].Username);

    const fullName =  UserData[0].Username; 
    const firstName = fullName.split(' ')[0];
    document.getElementById('greetingUsername').textContent = firstName; 

    const container = document.getElementById('farms-container');
    container.innerHTML = '';
    const template = document.getElementById('farm-card-template');

    for (const farm of FarmsData) {
        const clone = template.content.cloneNode(true);            
        const areaSpan = clone.querySelector('.areaSpan');
        areaSpan.textContent = lang === "en" ? `${farm.area.toFixed(2)} ` : `${farm.area.toFixed(2)} `;
        clone.querySelector('.farm-name').textContent = farm.Farm_name ; 
        
        const farmCard = clone.querySelector('.farm-card');
        if (farmCard) {
            farmCard.addEventListener("click", () => {
                const url = `specific_Farm.html?id=${farm.farm_id}`;
                console.log("Redirecting to:", url);
                window.location.href = url;  // redirects when the card is clicked
            });
        }
        try{ 
          const coords = farm.shape_geojson.coordinates[0][0]; // getting the lng, lat
          const [lng, lat] = coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${lang}`);
          const data = await res.json() ;// from this, we get the data javascript object
          const location = data.address?.city || data.address?.town || data.address?.state || "Unknown";
          const region = data.address?.state || "";
          clone.querySelector('.farm-location').textContent = `${location}, ${region}`;
        } catch (err) {
          console.error("Error fetching location:", err);
          clone.querySelector('.farm-location').textContent = "Unknown location";
        }
        container.appendChild(clone);
      }; 
  console.log(FarmsData);
  
  // Translate the newly created farm cards after loading
  if (window.translationUtils) {
    window.translationUtils.translateDynamicContent(getCurrentLanguage());
  }
}
document.addEventListener('DOMContentLoaded', async () => {
  await loadUserAndFarms();
  
  // Ensure translations are applied after everything is loaded
  if (window.translationUtils) {
    window.translationUtils.translateDynamicContent(getCurrentLanguage());
  }
});

// Handle page visibility changes (when navigating back from other pages)
document.addEventListener('visibilitychange', function() {
  if (!document.hidden && window.translationUtils) {
    // Page became visible, ensure translations are applied
    window.translationUtils.translateDynamicContent(getCurrentLanguage());
  }
});

// Also handle when the page is shown (for back/forward navigation)
window.addEventListener('pageshow', function(event) {
  if (event.persisted && window.translationUtils) {
    // Page restored from back/forward cache, reapply translations
    window.translationUtils.translateDynamicContent(getCurrentLanguage());
  }
});

// Function to manually trigger translation (can be called from other scripts)
window.refreshTranslations = function() {
  if (window.translationUtils) {
    window.translationUtils.translateDynamicContent(getCurrentLanguage());
  }
};

// Listen for language changes and refresh translations
window.addEventListener('storage', function(e) {
  if (e.key === 'language') {
    // Language changed in another tab/window, refresh translations
    setTimeout(() => {
      if (window.translationUtils) {
        window.translationUtils.translateDynamicContent(e.newValue || getCurrentLanguage());
      }
    }, 100);
  }
});
