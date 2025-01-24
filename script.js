import { checkSignedIn } from "./auth";

// In app.js or your script tag
document.addEventListener("DOMContentLoaded", function () {
  const profileButton = document.getElementById("profile-btn");
  profileButton.addEventListener("click", function () {
    let token = checkSignedIn();
    console.log("Token:", token);
    if (token) {
      // go to profile screen
      window.location.href = "dashboard.html";
    } else {
      // go to login screen
      window.location.href = "login.html";
    }
  });
});
