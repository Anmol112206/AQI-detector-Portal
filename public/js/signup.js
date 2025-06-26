import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";


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
const db = getFirestore();

async function checkValidity() {
  const previousURL = document.referrer;
  const searchBtn = document.getElementById("signup-btn");
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const city = document.getElementById("city").value;
  const country = document.getElementById("country").value;
  const password = document.getElementById("password").value;
  const emailNotifications = document.getElementById("email-notifications").checked;
  if (!email || !password || !username || !city || !country) {
    alert("Please fill in all fields");
    searchBtn.classList.remove("search-loading");
    searchBtn.disabled = false;
    searchBtn.querySelector(".register").innerText = "Register";
    return;
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await updateProfile(user, { displayName: username });

    await setDoc(doc(db, "users", user.uid), {
      email:email,
      username: username,
      city: city,
      country: country,
      getEmails: emailNotifications,
      createdAt: new Date(),
    });
    if (!previousURL.includes("/search_aqi")) {
      window.location.href = "/home";
    } else {
      window.history.back();
    }
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("This email is already registered. Please log in instead.");
    } else if (error.code === "auth/network-request-failed") {
      alert("Network Error...Please try again later");
    } else if (error.code === "auth/invalid-email") {
      alert("Please enter valid Email ID.");
    } else if (error.code === "auth/weak-password") {
      alert("Password length should be atleast 6 characters");
    } else {
      alert(`Signup failed: ${error.message}`);
    }
  } finally {
    searchBtn.classList.remove("search-loading");
    searchBtn.disabled = false;
    searchBtn.querySelector(".register").innerText = "Register";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const searchBtn = document.getElementById("signup-btn");
  searchBtn.addEventListener("click", async () => {
    searchBtn.querySelector(".register").innerText = "";
    searchBtn.classList.add("search-loading");
    searchBtn.disabled = true;
    await checkValidity();
  });
  document
    .getElementById("password")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchBtn.querySelector(".register").innerText = "";
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
