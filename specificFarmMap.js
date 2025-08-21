// document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map', {drawControl: true}).setView([23.526349, 55.056809],9);

    //basemaps
    var aerial = L.tileLayer('https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=1t5oDUJ2R2L0CtfceejE', {
      attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    }).addTo(map);

    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    var OpenStreetMap_DE = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });  

    //OSM Building Data
    var osmb = new OSMBuildings(map).load('https://{s}.data.osmbuildings.org/0.2/59fcc2e8/tile/{z}/{x}/{y}.json');

    //leaflet layer control
    var basemaps ={
      'Aerial': aerial, 
      'OSM': OpenStreetMap_DE
    }

    var overlayMaps = {
      'OSM Bldgs': osmb
    }

// let drawnItems = new L.FeatureGroup().addTo(map);
let farmLayer = null;
let farmBounds = null;
let currentMode = 'farm'; 
let selectedStructure = '';
let structureColors = {
  "Animal Enclosure": "#8B4513",   // Brown
              // Orchid"Bed": "#DA70D6",    
  "Building": "#4682B4",           // SteelBlue
  "Field": "#32CD32",              // LimeGreen
  "Greenhouse": "#2E8B57",         // SeaGreen
  "Irrigation": "#1E90FF",         // DodgerBlue
  //"Other": "#A9A9A9",              // DarkGray
  "Solar Panel": "#FFD700"         // Gold 
};

// map.on(L.Draw.Event.CREATED, function (e) {
//   const layer = e.layer;
//   drawnItems.addLayer(layer); 
// });

const drawControl = new L.Control.Draw({
  edit: { 
    featureGroup: drawnItems,
    remove: true,
    edit: true },
  draw: {
    polygon: false,
    rectangle: false,
    polyline: false,
    circle: false,
    circlemarker: false,
    marker: false,
  }
});
map.addControl(drawControl);
L.control.layers(basemaps, overlayMaps).addTo(map);

// START OVER
function startOver() {
  drawnItems.clearLayers();
  currentMode = 'farm';
  farmLayer = null;
  farmBounds = null;
  alert("Map reset. Start by drawing a new farm.");
}

// ON DRAW
map.on('draw:created', function (e) {
  let layer = e.layer;
  map.addLayer(layer);

  if (currentMode === 'farm') {
    if (farmLayer) {
      alert("Farm already created. Click 'Start Over' to reset.");
      return;
    }

    farmLayer = layer;
    farmBounds = layer.getBounds();
    layer.setStyle({ color: '#ffa000' });
    drawnItems.addLayer(layer);

    let center = farmBounds.getCenter();
    

    const namePopup = `
      <div class="luxury-popup">
        <h4>Name your ${selectedStructure}</h4>
        <input type="text" id="structureName" placeholder="Enter name" 
               style="margin-top: 9px; letter-spacing: 2px; outline: none; background: transparent; border:none; border-bottom: 1px solid black;">
        <input type="text" id="structureDescription" placeholder="Enter description" 
               style="margin-top: 9px; letter-spacing: 2px; outline: none; background: transparent; border:none; border-bottom: 1px solid black;">
       
        ${
          selectedStructure === "Field" ?
          `
              <select id="fieldType" style="margin-top: 9px; border: none; border-bottom: 1px solid black; background: transparent;">
          <option value="" disabled selected>Select Field Type</option>
          <option value="Open Field">Open Field</option>
          <option value="Net Field">Net Field</option>
          <option value="Greenhouse">Greenhouse</option>
        </select>
          `
          : selectedStructure === "Building"
        ? `
        <select id="buildingType" style="margin-top: 9px; border: none; border-bottom: 1px solid black; background: transparent;">
          <option value="" disabled selected>Select Building Type</option>
          <option value="Hostel">Hostel</option>
          <option value="Water Tank">Water Tank</option>
          <option value="Inventory">Inventory</option>
        </select>
        `
        : selectedStructure === "Irrigation"
        ? `
        <select id="buildingType" style="margin-top: 9px; border: none; border-bottom: 1px solid black; background: transparent;">
          <option value="" disabled selected>Select Irrigation Type</option>
          <option value="Drip Irrigation">Drip Irrigation</option>
          <option value="Tank">Tank</option>
          <option value="Channel">Channel</option>
        </select>
        `
        : ""
        }
        <button id="saveStructureName" disabled style="margin-top: 10px; border: none; border-radius: 6px; cursor: not-allowed;">Save</button>
      </div>
    `;
  
    L.popup()
      .setLatLng(center)
      .setContent(namePopup)
      .openOn(map);
  
    setTimeout(() => {
      const input = document.getElementById("structureName");
      const btn = document.getElementById("saveStructureName");
      input.addEventListener("input", () => {
        if (input.value.trim() !== '') {
          btn.disabled = false;
          btn.style.cursor = "pointer";
          btn.style.opacity = "1";
        } else {
          btn.disabled = true;
          btn.style.cursor = "not-allowed";
          btn.style.opacity = "0.7";
        }
      });
      btn.addEventListener("click", () => {
        const structureName = input.value.trim();
        layer.bindTooltip(structureName, { permanent: true }).openTooltip();
        map.closePopup();
  
        // Ask what's next
        const nextPopup = `
          <div class="luxury-popup">
            <p style="color: rgb(205, 205, 205);">"${structureName}" has been added.</p>
            <p style="color: rgb(205, 205, 205);">What would you like to do?</p>
            <button onclick="promptStructureChoice([${center.lat}, ${center.lng}], '${currentFarmName}')" >Add different structure</button>
            <button id="finishBtn" >Finish & Submit</button>
          </div>
        `;
        L.popup()
        .setLatLng(center)
        .setContent(nextPopup)
        .openOn(map);

        setTimeout(() => {
          const isFirstSetup = new URLSearchParams(window.location.search).get("setup") === "true";
        
          const finishBtn = document.getElementById("finishBtn");
          const skipBtn = document.getElementById("skipBtn");
        
          if (finishBtn) {
            finishBtn.innerText = isFirstSetup ? "Finish Setup" : "Save Changes";
            finishBtn.addEventListener("click", function () {
              if (isFirstSetup) {
                window.location.href = "farmerDashboard.html";
              } else {
                // alert("Changes saved!");
                map.closePopup();
                // window.location.href = "farmerDashboard.html";
              }
            });
          }
        
          if (skipBtn) {
            skipBtn.style.display = isFirstSetup ? "inline-block" : "none";
            skipBtn.addEventListener("click", function () {
              window.location.href = "farmerDashboard.html";
            });
          }
        }, 100); 
    });
    }, 300);
  }
});

// STRUCTURE SELECTION POPUP
let currentFarmName = '';
function promptStructureChoice(center, farmNameParam  = '') {
  currentMode = 'structure';

  if (farmNameParam) currentFarmName = farmNameParam; 

  let structurePopup = `
    <div class="luxury-popup" style="text-align:center; display: block;">
      ${currentFarmName  ? `<h3 >${currentFarmName }</h3>` : ''}
      <p style="color:white">What would you like to add?</p>
      <button onclick="chooseStructure('Animal Enclosure')" style=" margin-top: 10px; border: none; border-radius: 3px;  padding: 4px; ">Animal Enclosure</button>
      <button onclick="chooseStructure('Building')" style=" margin-top: 10px; border: none; border-radius: 3px;padding: 4px; ">Building</button>
      <button onclick="chooseStructure('Field')" style=" margin-top: 10px; border: none; border-radius: 3px;  padding: 4px; ">Field</button>
      <button onclick="chooseStructure('Irrigation')" style=" margin-top: 10px; border: none; border-radius: 3px;  padding: 4px; ">Irrigation</button>
      <button onclick="chooseStructure('Solar Panel')" style=" margin-top: 10px; border: none; border-radius: 3px;  padding: 4px; ">Solar Panel</button>
      <button id="skipBtn" style=" margin-top: 10px; border: none; border-radius: 3px;  padding: 4px; ">Skip</button>

      </div>
  `;

  L.popup()
    .setLatLng(center || farmBounds.getCenter())
    .setContent(structurePopup)
    .openOn(map);
}

// SET STRUCTURE TYPE
window.chooseStructure = function (type) {
  selectedStructure = type;
  currentMode = 'structure';
  map.closePopup();
  alert(`Now draw the area for: ${type}`);
}

window.startOver = startOver;


function skipStep() {
  alert("You can add elements later from your farm dashboard.");
  // Optional: redirect or close popup
}


// map.on('click', onMapClick);

function confirm(type) {
    // Example: open a modal to name the selected type
    openModal('Name your ' + type, function(name) {
        if (window.lastDrawnLayer && name) {
            window.lastDrawnLayer.bindTooltip(name + ' (' + type + ')', {permanent: true, direction: 'center'}).openTooltip();
            map.closePopup();
        }
    });
}
function openModal(title, callback) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalInput').value = '';
  document.getElementById('modalOverlay').style.display = 'flex';
  window._modalCallback = callback; 
}

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
  window._modalCallback = null;
}

function submitModal() {
  const value = document.getElementById('modalInput').value;
  if (window._modalCallback) {
      window._modalCallback(value);
  }
  closeModal();
}
