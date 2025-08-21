document.addEventListener("DOMContentLoaded", async () => {
    
    const { data: displayFarms, error: displayFarmsError } = await supa
        .from('Farms')
        .select(`*`);
        addFarmMap(displayFarms);
       
        async function addFarmMap(farms) {
            farms.forEach(farm => {
              const shape = typeof farm.shape_geojson === "string" 
                ? JSON.parse(farm.shape_geojson) 
                : farm.shape_geojson;
          
              const farmCoords = shape.coordinates[0].map(coord => [coord[1], coord[0]]);
          
              // compute farm centroid
              const latSum = farmCoords.reduce((sum, coord) => sum + coord[0], 0);
              const lngSum = farmCoords.reduce((sum, coord) => sum + coord[1], 0);
              const center = [latSum / farmCoords.length, lngSum / farmCoords.length];
           
              // draw the polygon
              const farmLayer = L.polygon(farmCoords, {
                color: "green",
                fillColor: "#4CAF50",
                fillOpacity: 0.5
              }).addTo(map);
          
              farmLayer.bindPopup(farm.Farm_name);
          
              // optionally center map on first farm
              // map.setView(center, 17);
            });
          }
        });