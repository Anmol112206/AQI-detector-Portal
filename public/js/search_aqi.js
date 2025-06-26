const BASE_URL = "https://airvista-backend-7p5t.onrender.com"; 

let map;
let currentMarker = null;

function initMap() {
  if (map) return;
  map = L.map("map", {
    zoomControl: false,
    dragging: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    touchZoom: false,
    boxZoom: false,
    trackResize: false,
  }).setView([0, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 11,
  }).addTo(map);

  const resizeObserver = new ResizeObserver(() => {
    if (map) map.invalidateSize({ pan: false });
  });
  resizeObserver.observe(document.querySelector(".map-container"));
}

function updateMapLocation(data) {
  const lat = Number(data.lat);
  const lon = Number(data.lon);
  const coords = [lat, lon];

  let color;
  if (data.aqi <= 50) color = "green";
  else if (data.aqi <= 100) color = "yellow";
  else if (data.aqi <= 200) color = "orange";
  else if (data.aqi <= 300) color = "red";
  else if (data.aqi <= 400) color = "violet";
  else color = "black";

  const customIcon = L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  if (currentMarker) {
    map.removeLayer(currentMarker);
    currentMarker = null;
  }
  currentMarker = L.marker(coords, { icon: customIcon }).addTo(map);
  currentMarker.bindPopup(
    `<div class="popup-content"><b>${data.city}</b></div>`,
    { closeButton: false }
  );
  currentMarker.on("mouseover", function () {
    this.openPopup();
  });

  currentMarker.on("mouseout", function () {
    this.closePopup();
  });

  setTimeout(() => {
    map.invalidateSize();
    map.setView(coords, 11, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }, 100);
}

document.addEventListener("DOMContentLoaded", function () {
  initMap();
  document.querySelector(".nav-arrow").addEventListener("click", function () {
    const overlay = document.createElement("div");
    overlay.className = "map-expand-animation";

    const newMapDiv = document.createElement("div");
    newMapDiv.id = "expandedMap";
    overlay.appendChild(newMapDiv);

    document.body.appendChild(overlay);

    let coords = [0, 0];
    if (currentMarker) {
      coords = currentMarker.getLatLng();
    }

    const values = {
      lat: coords.lat,
      lon: coords.lng,
      aqi: document.querySelector(".aqi-value").innerText,
      pm25: document.getElementById("PM2.5").querySelector(".value").innerText,
      pm10: document.getElementById("PM10").querySelector(".value").innerText,
      o3: document.getElementById("OZONE").querySelector(".value").innerText,
      co: document.getElementById("CO").querySelector(".value").innerText,
      so2: document.getElementById("SO2").querySelector(".value").innerText,
      no2: document.getElementById("NO2").querySelector(".value").innerText,
    };
    let color;
    if (values.aqi <= 50) color = "green";
    else if (values.aqi <= 100) color = "yellow";
    else if (values.aqi <= 200) color = "orange";
    else if (values.aqi <= 300) color = "red";
    else if (values.aqi <= 400) color = "violet";
    else color = "black";

    const customIcon = L.icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const expandedMap = L.map("expandedMap").setView(coords, 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 11,
    }).addTo(expandedMap);

    L.marker(coords, { icon: customIcon }).addTo(expandedMap);

    const encoded = encodeURIComponent(JSON.stringify(values));

    setTimeout(() => {
      window.location.href = `/map?city=${encoded}`;
    }, 1000);
  });

  window.addEventListener("pageshow", (event) => {
    const overlay = document.querySelector(".map-expand-animation");
    if (overlay) {
      overlay.remove();
    }
  });

  function capitalizeFirstLetter(word) {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.querySelector(".search-input");
  document.querySelector(".error-close").addEventListener("click", hideError);
  document.querySelector(".search-btn").addEventListener("click", function () {
    const city = searchInput.value.trim();
    if (city) {
      fetchAirQualityData();
    }
  });

  searchInput.addEventListener("keypress", function (e) {
    const city = searchInput.value.trim();
    if (city && e.key === "Enter") {
      fetchAirQualityData();
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  let street = urlParams.get("city");
  if (street) {
    const searchInput = document.querySelector(".search-input");
    searchInput.value = decodeURIComponent(street);
    street = capitalizeFirstLetter(searchInput.value);
    fetchAirQualityData(street);
  }

  async function fetchAirQualityData() {
    hideError();
    let aqi;
    let city = searchInput.value.trim();
    city = capitalizeFirstLetter(city);
    searchBtn.classList.add("search-loading");
    searchBtn.disabled = true;

    const Next_Url = `${BASE_URL}/aqi?city=${city}`;
    const response = await axios.get(Next_Url);
    if (response.data.status != "ok") {
      showError("Data not found");
      searchBtn.classList.remove("search-loading");
      searchBtn.disabled = false;
      return;
    }
    
    let results = response.data.data.iaqi;

    aqi = response.data.data.aqi;
    const record = {
      aqi: aqi,
      parameters: [
        { name: "PM2.5", value: results.pm25?.v ?? -1 },
        { name: "PM10", value: results.pm10?.v ?? -1 },
        { name: "NO2", value: results.no2?.v ?? -1 },
        { name: "OZONE", value: results.o3?.v ?? -1 },
        { name: "SO2", value: results.so2?.v ?? -1 },
        { name: "CO", value: results.co?.v ?? -1 },
      ],
    };
    let time =
      response.data.data.time.s ?? new Date().toISOString().toLocaleString();
    document.querySelector(
      ".aqi-description"
    ).textContent = `Last updated: ${time}`;
    particleFlow.updateAQI(record.aqi);
    document.getElementById("alertBell").value = city;
    displayBell();
    displayWaqiData(record);

    try {
      const apiUrl = `${BASE_URL}/weather?city=${city}`;
      let weather = await fetch(apiUrl);
      let jsonResponse = await weather.json();
      if (
        !jsonResponse.name ||
        !jsonResponse.main?.temp ||
        !jsonResponse.main?.humidity === undefined ||
        !jsonResponse.wind?.speed === undefined ||
        !jsonResponse.weather?.[0]?.description ||
        !jsonResponse.weather?.[0]?.id ||
        !jsonResponse.coord?.lat ||
        !jsonResponse.coord?.lon
      ) {
        showError("Data not Found");
        return;
      }
      const data = {
        aqi: aqi,
        city: jsonResponse.name,
        temp: jsonResponse.main.temp,
        humidity: jsonResponse.main.humidity,
        windSpeed: jsonResponse.wind.speed,
        weather: jsonResponse.weather[0].description,
        id: jsonResponse.weather[0].id,
        lat: jsonResponse.coord.lat,
        lon: jsonResponse.coord.lon,
      };

      displayAirQualityData(data);
    } catch (error) {
      showError("Data not Found");
      return;
    } finally {
      searchBtn.classList.remove("search-loading");
      searchBtn.disabled = false;
    }
  }

  function displayWaqiData(data) {
    const value = document.querySelector(".aqi-value");
    const type = document.querySelector(".type");
    const marker = document.querySelector(".slider-marker");
    value.innerText = String(data.aqi);
    let percent;
    if (data.aqi <= 50) {
      percent = (data.aqi / 300) * 100;
      marker.style.borderColor = "#4CAF50";
      value.style.color = "#4CAF50";
      type.innerText = "Safe";
      type.style.color = "#4CAF50";
      type.style.backgroundColor = "#A5D1A6";
    } else if (data.aqi <= 100) {
      percent = (data.aqi / 300) * 100;
      marker.style.borderColor = "#FFC107";
      value.style.color = "#FFC107";
      type.innerText = "Moderate";
      type.style.backgroundColor = "#F8E7B9";
      type.style.color = "#FFC107";
    } else if (data.aqi <= 200) {
      percent = 33.33 + (16.6675 * (data.aqi - 100)) / 100;
      marker.style.borderColor = "#FF9800";
      value.style.color = "#FF9800";
      type.innerText = "Poor";
      type.style.backgroundColor = "#F9CA85";
      type.style.color = "#FF9800";
    } else if (data.aqi <= 300) {
      percent = 33.33 + (16.6675 * (data.aqi - 100)) / 100;
      marker.style.borderColor = "#F44336";
      value.style.color = "#F44336";
      type.innerText = "Unhealthy";
      type.style.backgroundColor = "#FA9891";
      type.style.color = "#F44336";
    } else if (data.aqi <= 400) {
      percent = 33.33 + (16.6675 * (data.aqi - 100)) / 100;
      marker.style.borderColor = "#9C27B0";
      value.style.color = "#9C27B0";
      type.innerText = "Severe";
      type.style.backgroundColor = "#BF8AC8";
      type.style.color = "#9C27B0";
    } else {
      percent = 33.33 + (16.6675 * (data.aqi - 100)) / 100;
      marker.style.borderColor = "#9C191A";
      value.style.color = "#9C191A";
      type.innerText = "Hazardous";
      type.style.backgroundColor = "#A96A6A";
      type.style.color = "#9C191A";
    }
    marker.style.left = `${percent}%`;

    let unit = "µg/m³";
    for (let i = 0; i < 6; i++) {
      const element = document.getElementById(data.parameters[i].name);
      const alertIcon = element.querySelector(".alert-icon");
      if (data.parameters[i].value == -1) {
        element.style.opacity = 0.3;
        alertIcon.style.opacity = 0;
      } else {
        element.style.opacity = 1;

        const fill = element.querySelector(".range-fill");
        const range = element.querySelector(".value");
        const percent = (data.parameters[i].value / data.aqi) * 100;

        fill.style.width = `${percent}%`;

        range.innerHTML = `${data.parameters[i].value} <span class="unit">${unit}</span>`;

        if (data.parameters[i].value <= 50) {
          fill.className = "range-fill safe";
        } else if (data.parameters[i].value <= 100) {
          fill.className = "range-fill moderate";
        } else if (data.parameters[i].value <= 200) {
          fill.className = "range-fill poor";
        } else if (data.parameters[i].value <= 300) {
          fill.className = "range-fill unhealthy";
        } else if (data.parameters[i].value <= 40) {
          fill.className = "range-fill severe";
        } else {
          fill.className = "range-fill hazardous";
        }

        if (data.parameters[i].value == data.aqi) {
          alertIcon.style.opacity = 1;
        } else {
          alertIcon.style.opacity = 0;
        }
      }
    }
  }

  function displayAirQualityData(data) {
    updateMapLocation(data);
    document.querySelector(".humidity").style.display = "inline-block";
    document.querySelector(".location").textContent = `${data.city}`;
    document.querySelector(".temperature").textContent = `${data.temp}°C`;
    document.querySelector(
      ".feels-like"
    ).textContent = `Wind Speed: ${data.windSpeed} km/h`;
    document.querySelector(".conditions").textContent = `${data.weather}`;
    document.querySelector(
      ".humidity"
    ).textContent = `Humidity: ${data.humidity}%`;

    let id = data.id;

    const iconMap = {
      clear: "☀️",
      cloudy: "☁️",
      rain: "🌧️",
      snow: "❄️",
      thunderstorm: "🌩️",
      drizzle: "🌦️",
      mist: "🌫️",
      rainbow: "🌈",
    };

    let weather;
    if (id < 300) weather = "thunderstorm";
    else if (id < 400) weather = "drizzle";
    else if (id < 600) weather = "rain";
    else if (id < 700) weather = "snow";
    else if (id < 800) weather = "mist";
    else if (id == 800) weather = "clear";
    else if (id < 900) weather = "cloudy";
    else weather = "rainbow";

    document.querySelector(".weather-icon").textContent = iconMap[weather];
    const videoElement = document.getElementById("weather-video");
    videoElement.src = `/media/${weather}.mp4`;
    videoElement.load();

    document.querySelector(".aqi-panel").style.opacity = 1;
    document.getElementById("pollutant-dashboard").classList.remove("d-none");
    document.querySelector(".main-container").classList.remove("d-none");

    resultsSection.scrollIntoView({ behavior: "smooth" });
  }
});

function showError(message) {
  const errorAlert = document.getElementById("errorAlert");
  const searchInput = document.querySelector(".search-input");
  document.querySelector(".error-message").textContent = message;
  errorAlert.style.display = "block";
  errorAlert.style.animation = "fadeIn 0.3s ease forwards";
  searchInput.classList.add("search-error");
  setTimeout(() => {
    searchInput.classList.remove("search-error");
  }, 400);
  setTimeout(() => {
    hideError();
  }, 5000);
}

function hideError() {
  const errorAlert = document.getElementById("errorAlert");
  errorAlert.style.animation = "fadeOut 0.3s ease forwards";
  setTimeout(() => {
    errorAlert.style.display = "none";
  }, 300);
}

class ParticleFlow {
  constructor() {
    this.container = document.getElementById("particleFlow");
    this.particles = [];
    this.currentColor = "#cccccc";
    this.createParticles(1500); 
  }

  createParticles(count) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");
      this.updateParticleStyle(particle);
      this.container.appendChild(particle);
      this.particles.push(particle);

      particle.style.left = `${Math.random() * 100}%`;
      particle.style.bottom = `${Math.random() * 10}%`;
    }
  }

  updateParticleStyle(particle) {
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 10;
    const size = Math.random() * 2 + 2;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.backgroundColor = this.currentColor;
  }

  updateAQI(aqi) {
    this.currentColor =
      aqi <= 50
        ? "#4CAF50" 
        : aqi <= 100
        ? "#FFC107" 
        : aqi <= 200
        ? "#FF9800"
        : aqi <= 300
        ? "#F44336" 
        : aqi <= 400
        ? "#9C27B0" 
        : "#9C191A"; 

    this.particles.forEach((particle) => {
      particle.style.backgroundColor = this.currentColor;

      const duration =
        aqi > 100
          ? Math.random() * 8 + 5 
          : Math.random() * 15 + 10;
      particle.style.animationDuration = `${duration}s`;

      particle.style.opacity = aqi > 100 ? "0.9" : "0.6";
      particle.style.animationIterationCount = "infinite";
    });
  }
}


const particleFlow = new ParticleFlow();

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOFQVyBKa1jXtxbZuZ3zw-CkveNIBgGQI",
  authDomain: "airvista-ee3a6.firebaseapp.com",
  projectId: "airvista-ee3a6",
  storageBucket: "airvista-ee3a6.firebasestorage.app",
  messagingSenderId: "338759098685",
  appId: "1:338759098685:web:359922767add5f37de2554",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function displayBell() {
  const user = auth.currentUser;
  const alertBell = document.getElementById("alertBell");
  const icon = alertBell.querySelector("i");
  const cityName = document.getElementById("alertBell").value;
  if (!user) {
    return;
  }
  const userDocRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userDocRef);
  let currentCities = [];
  if (docSnap.exists()) {
    currentCities = docSnap.data().cities || [];
  }
  if (currentCities.includes(cityName)) {
    icon.classList.remove("far");
    icon.classList.add("fas");
  } else {
    icon.classList.remove("fas");
    icon.classList.add("far");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const alertBell = document.getElementById("alertBell");
  const icon = alertBell.querySelector("i");
  const alertContainer = document.getElementById("alertContainer");

  let currentUser = null;

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
      document.getElementById("manageListBtn").classList.remove("d-none");
      alertContainer.classList.add("hidden");
      displayBell();
    } else {
      document.getElementById("manageListBtn").classList.add("d-none");
      icon.classList.add("far");
      icon.classList.remove("fas");
    }
  });
  alertBell.addEventListener("click", function () {
    const cityName = document.getElementById("alertBell").value;
    if (currentUser) {
      if (icon.classList.contains("far")) {
        playAlertSound();
      }
      icon.classList.toggle("far");
      icon.classList.toggle("fas");
      toggleCityForUser(cityName);
    } else {
      alertContainer.classList.toggle("hidden");
    }
  });

  function playAlertSound() {
    const audio = new Audio("/media/alert.wav");
    audio.volume = 1;
    audio.play().catch((e) => console.log("Audio play failed:", e));
  }
});

async function toggleCityForUser(cityName) {
  const user = auth.currentUser;

  const userDocRef = doc(db, "users", user.uid);

  const docSnap = await getDoc(userDocRef);
  let currentCities = [];
  if (docSnap.exists()) {
    currentCities = docSnap.data().cities || [];
  }

  if (currentCities.includes(cityName)) {
    await setDoc(
      userDocRef,
      {
        cities: currentCities.filter((c) => c !== cityName),
      },
      { merge: true }
    );
  } else {
    await setDoc(
      userDocRef,
      {
        cities: [...currentCities, cityName],
      },
      { merge: true }
    );
  }
}
