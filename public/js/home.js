import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
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

document.addEventListener("DOMContentLoaded", function () {
  const cta = document.getElementById("cta");
  const navbar = document.getElementById("navbar");
  onAuthStateChanged(auth, (user) => {
    if (user) {
      cta.classList.add("d-none");
      navbar.classList.remove("d-none");
      document.querySelector(".hero-content h1").innerHTML = `AQI Portal`;
      document.querySelector(".hero-content h1").style.fontSize = "3rem";
    } else {
      cta.classList.remove("d-none");
      navbar.classList.add("d-none");
      document.querySelector(".hero-content h1").innerHTML = `AirVista`;
      document.querySelector(".hero-content h1").style.fontSize = "";
    }
  });
});

document
  .querySelectorAll(".logout-btn, .mobile-logout-btn")
  .forEach((element) => {
    element.addEventListener("click", () => {
      signOut(auth)
        .then(() => {
        })
        .catch((error) => {
        });
    });
  });

document.addEventListener("DOMContentLoaded", function () {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  mobileMenuBtn.addEventListener("click", function () {
    mobileMenu.classList.toggle("active");

    const icon = mobileMenuBtn.querySelector("i");
    if (mobileMenu.classList.contains("active")) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-times");
    } else {
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  });

  document
    .querySelectorAll(".mobile-nav-link, .mobile-logout-btn")
    .forEach((item) => {
      item.addEventListener("click", function () {
        mobileMenu.classList.remove("active");
        mobileMenuBtn.querySelector("i").classList.remove("fa-times");
        mobileMenuBtn.querySelector("i").classList.add("fa-bars");
      });
    });
});

document
  .getElementById("citySearchForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const cityInput = document.getElementById("search-input");
    const cityName = cityInput.value.trim();

    if (cityName) {
      window.location.href = `/search_aqi?city=${encodeURIComponent(cityName)}`;
    }

    return false;
  });

document.addEventListener("DOMContentLoaded", function () {
  const animateOnScroll = function () {
    const elements = document.querySelectorAll(
      ".feature-card, .scale-item, .cta h2, .cta p, .cta-btn"
    );

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;

      if (elementPosition < screenPosition) {
        element.classList.add("animate__animated", "animate__fadeInUp");
      }
    });
  };

  window.addEventListener("scroll", animateOnScroll);
  animateOnScroll();
});
