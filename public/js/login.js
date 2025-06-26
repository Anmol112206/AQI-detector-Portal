import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
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

function checkValidity() {
  const email = document.getElementById("email").value;
  const searchBtn = document.getElementById("login-btn");
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill in all fields");
    searchBtn.classList.remove("search-loading");
    searchBtn.disabled = false;
    searchBtn.querySelector(".sign-in").innerText = "Sign In";
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      window.location.href = "/home";
    })
    .catch((error) => {
      let message = "";
      switch (error.code) {
        case "auth/invalid-login-credentials":
          message = "No user found with this email and password.";
          break;
        case "auth/invalid-email":
          message = "Please enter valid Email ID.";
          break;
        case "auth/network-request-failed":
            message = "Network Error! Please try after some time..";
            break;
        default:
          message = error.message;
      }
      alert(message);
    })
    .finally(() => {
      searchBtn.classList.remove("search-loading");
      searchBtn.disabled = false;
      searchBtn.querySelector("span").innerText = "Sign In";
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const searchBtn = document.getElementById("login-btn");
  searchBtn.addEventListener("click", () => {
    searchBtn.querySelector(".sign-in").innerText = "";
    searchBtn.classList.add("search-loading");
    searchBtn.disabled = true;
    checkValidity();
  });
  document
    .getElementById("password")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchBtn.querySelector(".sign-in").innerText = "";
        searchBtn.classList.add("search-loading");
        searchBtn.disabled = true;
        checkValidity();
      }
    });

  const container = document.getElementById("air-visualization");
  const particleCount = 500;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");

    const airQuality = Math.random();
    if (airQuality < 0.5) {
      particle.classList.add("excellent-air");
    } else if (airQuality < 0.75) {
      particle.classList.add("good-air");
    } else if (airQuality < 0.9) {
      particle.classList.add("moderate-air");
    } else if (airQuality < 0.98) {
      particle.classList.add("poor-air");
    } else {
      particle.classList.add("hazardous-air");
    }

    const size = Math.random() * 4 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;

    particle.style.opacity = Math.random() * 0.4 + 0.1;

    container.appendChild(particle);
    particles.push({
      element: particle,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speedX: Math.random() * 0.3 - 0.15,
      speedY: Math.random() * 0.3 - 0.15,
      size: size,
      originalSize: size,
      pulseSpeed: Math.random() * 0.002 + 0.001,
    });
  }

  function animateParticles() {
    for (const particle of particles) {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      if (particle.x > 99 || particle.x < 1) {
        particle.speedX *= -1;
        particle.speedX += Math.random() * 0.04 - 0.02;
      }
      if (particle.y > 99 || particle.y < 1) {
        particle.speedY *= -1;
        particle.speedY += Math.random() * 0.04 - 0.02;
      }

      const pulseFactor = Math.sin(Date.now() * particle.pulseSpeed) * 0.1 + 1;
      particle.element.style.width = `${particle.originalSize * pulseFactor}px`;
      particle.element.style.height = `${
        particle.originalSize * pulseFactor
      }px`;

      particle.element.style.left = `${particle.x}%`;
      particle.element.style.top = `${particle.y}%`;

      if (Math.random() < 0.003) {
        particle.speedX = Math.random() * 0.3 - 0.15;
        particle.speedY = Math.random() * 0.3 - 0.15;
      }
    }

    requestAnimationFrame(animateParticles);
  }

  animateParticles();

  const togglePassword = document.querySelector(".toggle-password");
  const passwordInput = document.querySelector("#password");

  togglePassword.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.innerHTML =
      type === "password"
        ? '<i class="far fa-eye-slash"></i>'
        : '<i class="far fa-eye"></i>';
  });
});
