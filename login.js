import { signUp, login, logout } from "./auth";
// Login
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = loginForm["email"].value;
  const password = loginForm["password"].value;
  try {
    await login(email, password);
    showToast("Success", "Logged in successfully", "success");
    loginForm.reset();
    // go home screen
    window.location.href = "index.html";
  } catch (error) {
    showToast("Error", error.message, "error");
    console.error(error.message);
  }
});

// Signup
const signupForm = document.getElementById("signup-form");
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = signupForm["email"].value;
  const password = signupForm["password"].value;
  const username = signupForm["username"].value;
  try {
    await signUp(email, password, username);
    showToast("Success", "Account created successfully", "success");
    signupForm.reset();
    // go home screen
    window.location.href = "index.html";
  } catch (error) {
    showToast("Error", error.message, "error");
    console.error(error.message);
  }
});

console.log("Signup function called");

// Call toast

const toast = document.querySelector(".toast");
const toastHeader = document.querySelector(".toast-content h2");
const toastMessage = document.querySelector(".toast-content p");
const toastIcon = document.querySelector(".toast-icon img");

function showToast(header, message, type) {
  if (type === "error") {
    toastIcon.src = "cross.svg";
  } else {
    toastIcon.src = "tick.svg";
  }
  toastHeader.textContent = header;
  toastMessage.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}
