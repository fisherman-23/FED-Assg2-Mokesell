/**
 * @fileoverview
 * This script handles user authentication with Firebase, including login and signup functionality.
 * It listens for form submissions, processes login/signup requests, displays success/error toasts, and
 * redirects the user to the home page after successful login or signup.
 * It also manages the display of a toast message with appropriate icons and messages.
 *
 * @author Jing Shun
 */

import { signUp, login, logout } from "./auth";
// Login
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", async (e) => {
  // Prevent default form submission -> this prevents the page from reloading automatically when the form is submitted
  e.preventDefault();
  const email = loginForm["email-login"].value;
  const password = loginForm["password-login"].value;
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
  // Prevent default form submission -> this prevents the page from reloading automatically when the form is submitted
  e.preventDefault();
  const email = signupForm["email-signup"].value;
  const password = signupForm["password-signup"].value;
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
  // type is either "success" or "error"
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
