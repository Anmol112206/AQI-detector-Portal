const urlParams = new URLSearchParams(window.location.search);
const cityData = JSON.parse(decodeURIComponent(urlParams.get("city") || "{}"));
const lat = Number(cityData.lat) || 0;
const lon = Number(cityData.lon) || 0;

const boundaryBounds = L.latLngBounds(
  [lat - 1.5, lon - 1.5],
  [lat + 1.5, lon + 1.5]
);

const map = L.map("map", {
  center: [lat, lon],
  zoom: 10,
  maxBounds: boundaryBounds,
  maxBoundsViscosity: 0.8,
  minZoom: 4,
  maxZoom: 18,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  noWrap: true,
}).addTo(map);

const popupHtml = `  
  AQI: ${cityData.aqi || "N/A"}<br>
  PM2.5: ${cityData.pm25 || "N/A"}<br>
  PM10: ${cityData.pm10 || "N/A"}<br>
  NO2: ${cityData.no2 || "N/A"}<br>
  O3: ${cityData.o3 || "N/A"}<br>
  SO2: ${cityData.so2 || "N/A"}<br>
  CO: ${cityData.co || "N/A"}
`;
let color;
if (cityData.aqi <= 50) color = "green";
else if (cityData.aqi <= 100) color = "yellow";
else if (cityData.aqi <= 200) color = "orange";
else if (cityData.aqi <= 300) color = "red";
else if (cityData.aqi <= 400) color = "violet";
else color = "black";

const customIcon = L.icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const marker = L.marker([lat, lon], { icon: customIcon })
  .addTo(map)
  .bindPopup(popupHtml, { closeButton: false });

marker.on("mouseover", function () {
  this.openPopup();
});

marker.on("mouseout", function () {
  this.closePopup();
});

function enforceBoundaries() {
  if (!boundaryBounds.contains(map.getCenter())) {
    map.panInsideBounds(boundaryBounds, {
      animate: true,
      duration: 0.8,
      easeLinearity: 0.25,
      noMoveStart: true,
    });
  }
}

let debounceTimer;
map.on("moveend", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(enforceBoundaries, 100);
});

const style = document.createElement("style");
style.innerHTML = `
  .leaflet-container { background-color: #fff !important; transition: background-color 0.3s ease; }
  .leaflet-tile { transition: opacity 0.3s ease; }
  .leaflet-zoom-animated { transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); }
`;
document.head.appendChild(style);

document.getElementById("backBtn").addEventListener("click", function () {
  window.history.back(); 
});
