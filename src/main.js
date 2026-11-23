import './sass/styles.scss'
import { loadPage } from "./model/model.js"
import { auth } from "./firebase/config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    signOut
} from "firebase/auth";

function changeRoute() {
  let hashTag = window.location.hash;
  let pageID = hashTag.replace("#", "");

  console.log(pageID);
  loadPage(pageID)
}

function initApp() {
  loadPage("home");
  window.addEventListener("hashchange", changeRoute)
}

initApp();








let currentUser = null;

// Listen for login/logout changes
onAuthStateChanged(auth, (user) => {
  currentUser = user;

  // Update desktop and mobile Login buttons
  document.querySelectorAll("[data-auth-link]").forEach(link => {
    link.textContent = user ? "Logout" : "Login";
    link.href = user ? "#logout" : "#login";
  });

  // Show or hide Your Recipes
  document.querySelectorAll(".auth-only").forEach(link => {
    link.hidden = !user;
  });
});

// Handle Login and Logout clicks
document.addEventListener("click", async (event) => {
  const authLink = event.target.closest("[data-auth-link]");

  if (!authLink) return;

  event.preventDefault();

  if (currentUser) {
    try {
        await signOut(auth);
        window.location.hash = "home";
    } catch (error) {
        alert(error.message);
    }
  } else {
    window.location.hash = "login";
  }
});









const menuToggle = document.querySelector("#menuToggle");
const mobileMenu = document.querySelector("#mobileMenu");
const currentPage = document.querySelector("#currentPage");

const mobileLinks = mobileMenu.querySelectorAll("a");

function updateNavigation() {
  const currentHash = window.location.hash || "#home";

  mobileLinks.forEach(link => {
    if (link.getAttribute("href") === currentHash) {
      link.classList.add("active");
      currentPage.textContent = link.textContent;
    } else {
      link.classList.remove("active");
    }
  });
}


menuToggle.addEventListener("click", () => {
  mobileMenu.classList.toggle("active");
});


mobileLinks.forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
  });
});

window.addEventListener("hashchange", updateNavigation);

updateNavigation();








document.addEventListener("submit", async (event) => {

  // SIGN UP
  if (event.target.id === "signupForm") {
    event.preventDefault();

    const firstName = document.querySelector("#firstName").value.trim();
    const lastName = document.querySelector("#lastName").value.trim();
    const email = document.querySelector("#signupEmail").value;
    const password = document.querySelector("#signupPassword").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      });

      alert("Account created successfully!");

    } catch (error) {
      alert(error.message);
    }
  }

  // LOGIN
  if (event.target.id === "loginForm") {
    event.preventDefault();

    const email = document.querySelector("#loginEmail").value;
    const password = document.querySelector("#loginPassword").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);

      window.location.hash = "home";

    } catch (error) {
      alert(error.message);
    }
  }
});

// Check 
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Logged in:", user.displayName, user.email);
  } else {
    console.log("No user is logged in.");
  }
});

