// document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map', {drawControl:false}).setView([23.526349, 55.056809],9);
    
    var aerial = L.tileLayer('https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=1t5oDUJ2R2L0CtfceejE', {
      attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    }).addTo(map);

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
   
let drawnItems = new L.FeatureGroup().addTo(map);
let farmLayer = null;
let farmBounds = null;
let currentMode = 'farm'; 
let selectedStructure = '';
let structureLayer = null;
let structureBounds = null;
let farmId; 
let currentFarmName = '';

let structureColors = {
  "Animal Enclosure": "#8B4513",
   // Orchid"Bed": "#DA70D6",    
  "Building": "#4682B4",         
  "Field": "#32CD32",            
  "Greenhouse": "#2E8B57",         
  "Irrigation": "#1E90FF",        
  //"Other": "#A9A9A9",        
  "Solar Panel": "#FFD700"
};

map.on(L.Draw.Event.CREATED, function (e) {
  const layer = e.layer;
  drawnItems.addLayer(layer); 
});

const drawControl = new L.Control.Draw({
  edit: { 
    featureGroup: drawnItems,
    remove: true,
    edit: true },
  draw: {
    polygon: {allowIntersection: false, showArea: true},
    rectangle: false,
    polyline: false,
    circle: false,
    circlemarker: false,
    marker: false,
  }
});

L.control.locate().addTo(map);
map.addControl(drawControl); // THIS IS FOR THE LEAFLET DRAW TOOLBAR 
L.control.layers(basemaps, overlayMaps).addTo(map);
new L.Control.Geocoder().addTo(map);  // for the search 
// var weatherControl = L.Control.Weather();
// map.addControl(weatherControl);
let currentDrawer = null;
// const apiKey =  "4a3c116d2fa56338e6aa52b83240c51a";
// L.control.weather({
//   apiKey
// }).addTo(map);


window.chooseStructure = function (type) {
  selectedStructure = type;
  currentMode = 'structure';
  map.closePopup();
  
  if (currentDrawer) currentDrawer.disable();

  currentDrawer = new L.Draw.Polygon(map, drawControl.options.draw.polygon);
  currentDrawer.enable();
};
// const userID = '68ddc8e2-6572-4de8-bc3f-f347c491234a';

map.on('draw:created', async function (e) {
  let layer = e.layer;
  map.addLayer(layer);

  const { data: userData } = await supa.auth.getUser();
  const userID = userData.user.id;

  if (currentMode === 'farm') {
    
    if (farmLayer) {
      alert("Farm already created.");
      return;
    }

    // inserting a NEW FARM 
    if (layer instanceof L.Polygon) {
      var latlngs = layer.getLatLngs()[0]; 
      var area = L.GeometryUtil.geodesicArea(latlngs); // m², to store in DB
      var readableArea = (area >= 1000000) // to display
        ? (area / 1000000).toFixed(2) + ' km²'
        : area.toFixed(2) + ' m²';
    }

    farmLayer = layer;
    farmBounds = layer.getBounds();
    layer.setStyle({ color: '#ffa000' });
    drawnItems.addLayer(layer);
    let center = farmBounds.getCenter();
    const geojson = farmLayer.toGeoJSON().geometry; // geometry of the drawn polygon

    let popupContent = `
    <div class="luxury-popup">
      <h4>Name your farm</h4>
      <p>Measured Area: ${readableArea}</p>
      <input type="text" style="width: 100%; border: none; background-color: transparent; border-bottom: 1px solid rgba(23, 32, 34, 0.9);" id="farmName" placeholder="Farm Name" />
      <button id="nextBtn" disabled style="margin-top: 15px !important; cursor: not-allowed;">Next</button>
    </div>`;
    
    L.popup()
      .setLatLng(center)
      .setContent(popupContent)
      .openOn(map);

      setTimeout(() => {
        const input = document.getElementById("farmName");
        const next = document.getElementById("nextBtn");
  
        input.addEventListener("input", () => {
          if (input.value.trim() !== '') {
            next.disabled = false;
            next.style.cursor = "pointer";
            next.style.opacity = "1";
          } else {
            next.disabled = true;
            next.style.cursor = "not-allowed";
            next.style.opacity = "0.7";
          }
        });
  
        next.addEventListener("click", async () => {
          const farmName = input.value.trim();
          if (!farmName) return;
          farmLayer.bindTooltip(farmName, { permanent: true });
          farmLayer.setStyle({ color: "#2E8B57", fillOpacity: 0.3 });
          map.fitBounds(farmBounds);
          map.closePopup();
          const { data, error } = await supa.from('Farms').insert([
            {
              User_id: userID,
              Farm_name: farmName,
              shape_geojson: geojson,
              area: area,
              Setup_complete : true
            }
          ])
          .select(); // select is to get the returned id
          // .single(); // returns newely inserted object, not array
          farmId = data.id;
          console.log(farmId);

          promptStructureChoice(center, farmName);
        });
      }, 200);
    
  } else if (currentMode === 'structure') {
    if (!farmBounds || !farmBounds.contains(layer.getBounds())) {
      alert("Structure must be within the farm boundary.");
      return;
    }

    structureLayer = layer;
    structureBounds = layer.getBounds(); 
   

    layer.setStyle({ color: structureColors[selectedStructure] || 'gray' });
    drawnItems.addLayer(layer);
 
    const center = layer.getBounds().getCenter();
    const geojsonStructure = structureLayer.toGeoJSON().geometry; // get geometry

    const namePopup = `
      <div class="luxury-popup">
        <h4>Name your ${selectedStructure}</h4>
        <input type="text" id="structureName" placeholder="Enter name" 
               style="width: 100% !important; margin-top: 9px; letter-spacing: 2px; outline: none; background: transparent; border:none; border-bottom: 1px solid black;">
        <input type="text" id="structureDescription" placeholder="Enter description" 
               style="width: 100% !important; margin-top: 9px; letter-spacing: 2px; outline: none; background: transparent; border:none; border-bottom: 1px solid black;">
       
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
        <button id="saveStructureName" disabled style="width: 100%; margin-top: 10px; border: none; border-radius: 6px; cursor: not-allowed;">Save</button>
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
      btn.addEventListener("click", async () => {
        const subtype = document.getElementById("buildingType")?.value || 
                        document.getElementById("fieldType")?.value || "";
        const structureName = input.value.trim();
        const latlngsStructure = structureLayer.getLatLngs()[0];
        var areaStructure = L.GeometryUtil.geodesicArea(latlngsStructure); // m²

        var readableAreaStr = (areaStructure >= 1000000)
          ? (areaStructure / 1000000).toFixed(2) + ' km²'
          : areaStructure.toFixed(2) + ' m²';
        
        structureLayer.bindTooltip(structureName, { permanent: true }).openTooltip();
        map.closePopup();
        
        const { error: structureError } = await supa.from('FarmStructures').insert([
          {
            farm_id: farmId ,
            structure_type: selectedStructure,
            structure_name: structureName ,
            subtype: subtype,
            structure_location: geojsonStructure,
            structure_area: areaStructure,
            color: structureColors[selectedStructure] ,
          }
        ]);

        // Ask what's next
        const nextPopup = `
          <div class="luxury-popup">
            <p style="color: rgb(205, 205, 205);">"${structureName}" has been added.</p>
            <p style="color: rgb(205, 205, 205);">What would you like to do?</p>
            <button onclick="promptStructureChoice([${center.lat}, ${center.lng}], '${currentFarmName}')" >Add different structure</button>
            <button id="finishBtn" >Finish</button>
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
            finishBtn.innerText = isFirstSetup ? "Skip" : "Finish Setup";
            finishBtn.addEventListener("click", function () {
              if (isFirstSetup) {
                window.location.href = "farmerDashboard.html";
              } else {
                // alert("Changes saved!");
                map.closePopup();
                window.location.href = "farmerDashboard.html";
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
async function promptStructureChoice(center, farmNameParam  = '') {
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
    </div>
  `;

  L.popup()
    .setLatLng(center || farmBounds.getCenter())
    .setContent(structurePopup)
    .openOn(map);
}
