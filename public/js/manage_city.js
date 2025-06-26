const BASE_URL = "https://airvista-backend-7p5t.onrender.com";

const firebaseConfig = {
  apiKey: "AIzaSyCOFQVyBKa1jXtxbZuZ3zw-CkveNIBgGQI",
  authDomain: "airvista-ee3a6.firebaseapp.com",
  projectId: "airvista-ee3a6",
  storageBucket: "airvista-ee3a6.firebasestorage.app",
  messagingSenderId: "338759098685",
  appId: "1:338759098685:web:359922767add5f37de2554",
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const messaging = firebase.messaging();

let cities = [];

window.goBack = function () {
  if (document.referrer) {
    window.location.href = document.referrer;
  } else {
    window.location.href = "/";
  }
};

async function getUserCities() {
  try {
    const user = auth.currentUser;
    if (!user) {
      return [];
    }
    const userDocRef = db.collection("users").doc(user.uid);
    const docSnap = await userDocRef.get();

    if (docSnap.exists) {
      const userData = docSnap.data();
      cities = userData.cities || [];
      return cities;
    }
    return [];
  } catch (error) {
    console.error("Error getting cities:", error);
    return [];
  }
}

async function updateCitiesInFirestore(newCities) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userDocRef = db.collection("users").doc(user.uid);
    await userDocRef.set({ cities: newCities }, { merge: true });
    cities = newCities;
  } catch (error) {
    console.error("Error updating cities:", error);
  }
}

function capitalizeFirstLetter(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

document.addEventListener("DOMContentLoaded", function () {
  const cityList = document.getElementById("cityList");
  const emptyState = document.getElementById("emptyState");
  const addCityBtn = document.getElementById("addCityBtn");
  const newCityInput = document.getElementById("newCity");
  const Checkbox = document.getElementById("getEmails");
  const deleteAllBtn = document.getElementById("deleteAllBtn");

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      await getUserCities();
      renderCities();
      const userDocRef = db.collection("users").doc(user.uid);
      const docSnap = await userDocRef.get();

      if (docSnap.exists && docSnap.data().getEmails) {
        Checkbox.checked = true;
      }
      Checkbox.addEventListener("change", async () => {
        await userDocRef.set({ getEmails: Checkbox.checked }, { merge: true });
      });
      deleteAllBtn.addEventListener("click", async () => {
        const notiRef = db
          .collection("users")
          .doc(user.uid)
          .collection("notifications");
        const snapshot = await notiRef.get();
        if (snapshot.empty) {
          alert("No notifications to delete.");
          return;
        }
        const confirmed = confirm(
          "Are you sure you want to delete all notifications?"
        );
        if (!confirmed) return;
        const batch = db.batch();
        snapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        try {
          await batch.commit();

          const notificationSection = Array.from(
            document.querySelectorAll(".section")
          ).find((section) =>
            section
              .querySelector(".section-title")
              ?.textContent.includes("Recent Notifications")
          );

          const notifications =
            notificationSection.querySelectorAll(".notification");
          notifications.forEach((el) => el.remove());

          document.getElementById("noNotifications").style.display = "block";

          alert("All notifications deleted.");
        } catch (error) {
          alert("Failed to delete notifications. Try again later.");
          console.error(error);
        }
      });
    } else {
      Checkbox.checked = false;
      emptyState.style.display = "block";
    }
  });

  async function fetchAirQualityData(city) {
    const searchBtn = document.getElementById("addCityBtn");
    searchBtn.querySelector(".add").innerText = "";
    searchBtn.classList.add("search-loading");
    searchBtn.disabled = true;

    try {
      const Next_Url = `${BASE_URL}/aqi?city=${city}`;
      const response = await axios.get(Next_Url);

      if (response.data.status != "ok") {
        alert("Sorry, Data of this city is not available");
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        return;
      }

      let newCities;
      if (cities.includes(city)) {
        alert("City already exists in the list");
        return;
      } else {
        newCities = [...cities, city];
      }
      await updateCitiesInFirestore(newCities);
      renderCities();
    } catch (error) {
      console.error("Error fetching air quality:", error);
      alert("Error processing city data");
    } finally {
      searchBtn.querySelector(
        ".add"
      ).innerHTML = `<i class="fas fa-plus"></i>Add City`;
      searchBtn.classList.remove("search-loading");
      searchBtn.disabled = false;
    }
  }

  addCityBtn.addEventListener("click", function () {
    let cityName = newCityInput.value.trim();
    cityName = capitalizeFirstLetter(cityName);
    if (!cityName) {
      alert("Please enter the city name..");
    } else {
      fetchAirQualityData(cityName);
    }
  });
  newCityInput.addEventListener("keypress", function (e) {
    let cityName = newCityInput.value.trim();
    cityName = capitalizeFirstLetter(cityName);
    if (!cityName && e.key === "Enter") {
      alert("Please enter the city name..");
    } else if (e.key === "Enter") {
      fetchAirQualityData(cityName);
    }
  });
  function renderCities() {
    cityList.innerHTML = "";
    if (cities.length === 0) {
      emptyState.style.display = "block";
    } else {
      emptyState.style.display = "none";
      cities.forEach((city) => {
        const cityItem = document.createElement("li");
        cityItem.className = "city-item";
        cityItem.innerHTML = `
          <div class="city-info">
            <span class="city-name">${city}</span>
          </div>
          <button class="delete-btn" onclick="deleteCity('${city}')">
            <i class="fas fa-trash"></i> Remove
          </button>
        `;
        cityList.appendChild(cityItem);
      });
    }
  }
  async function deleteCity(cityName) {
    if (
      confirm(`Are you sure you want to stop notifications for ${cityName}?`)
    ) {
      const newCities = cities.filter((city) => city !== cityName);
      await updateCitiesInFirestore(newCities);
      renderCities();
    }
  }

  window.deleteCity = deleteCity;
});

const shownNotificationIds = new Set();

function showNotification(notif) {
  const notificationSection = document.querySelector(
    ".section:nth-last-child(2)"
  );
  const dateObj = new Date(notif.timestamp.seconds * 1000);
  const timeString = dateObj.toLocaleString();

  const opacity = notif.read ? 0.5 : 1;

  const notificationDiv = document.createElement("div");
  notificationDiv.classList.add("notification");
  notificationDiv.innerHTML = `   
  <div class="notification-content" style="display: flex; flex-wrap: wrap; align-items: center;opacity: ${opacity};">
    <div style="color: #d43d2c; font-weight: bold; margin-right: 6px;font-size:1.1rem;">${notif.title}:&nbsp;</div>
    <div style="font-weight:600;">${notif.body}</div>
  </div>
  <div class="notification-time" style="font-size: 0.9rem; color: gray; margin-top: 4px;">${timeString}</div>
  `;
  notificationSection.insertBefore(
    notificationDiv,
    notificationSection.children[1]
  );
}

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    const uid = user.uid;

    db.collection("users")
      .doc(uid)
      .collection("notifications")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        const noNotifElem = document.getElementById("noNotifications");
        if (snapshot.empty) {
          noNotifElem.style.display = "block";
          return;
        }

        noNotifElem.style.display = "none";

        const batch = db.batch();
        snapshot.docChanges().forEach((change) => {
          const notif = change.doc.data();
          const notifId = change.doc.id;
          if (change.type === "added" && !shownNotificationIds.has(notifId)) {
            showNotification(notif);
            shownNotificationIds.add(notifId);
          }
          if (!notif.read) {
            const notifRef = db
              .collection("users")
              .doc(uid)
              .collection("notifications")
              .doc(notifId);
            batch.update(notifRef, { read: true });
          }
        });
        return batch.commit();
      });
  } else {
    document.getElementById("noNotifications").style.display = "block";
  }
});
