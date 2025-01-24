import { signUp, login, logout } from "./auth";
// Login
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = loginForm["email"].value;
  const password = loginForm["password"].value;
  try {
    await login(email, password);
    loginForm.reset();
    // go home screen
    window.location.href = "index.html";
  } catch (error) {
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
    signupForm.reset();
    // go home screen
    window.location.href = "index.html";
  } catch (error) {
    console.error(error.message);
  }
});

console.log("Signup function called");
