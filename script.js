/**
 * @fileoverview
 * This script handles user authentication and navigation for the profile section and mobile menu toggling.
 * It checks if the user is signed in when clicking on the profile button. If signed in, the user is redirected
 * to the dashboard page; otherwise, they are redirected to the login page. Additionally, it manages the
 * toggle functionality for the mobile menu on small screens.
 *
 * @author Jing Shun
 */

import { checkSignedIn } from "./auth";

// Wait for the DOM content to be fully loaded before attaching event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Select all profile buttons and attach a click event listener to each
  const profileButtons = document.querySelectorAll(".profile-btn");
  profileButtons.forEach((profileButton) => {
    profileButton.addEventListener("click", function () {
      // Check if the user is signed in
      checkSignedIn()
        .then((result) => {
          if (result) {
            // If signed in, redirect to the profile/dashboard screen
            console.log("User is signed in: ", result[0], result[1]);
            window.location.href = "dashboard.html";
          } else {
            // If not signed in, redirect to the login screen
            window.location.href = "login.html";
          }
        })
        .catch((error) => {
          // Handle any errors while checking sign-in status
          console.error("Error checking sign-in status: ", error);
          window.location.href = "login.html";
        });
    });
  });
});

// Toggle mobile menu open/close state
function toggleMobileMenu(menu) {
  menu.classList.toggle("open");
}

// Handle click on hamburger button to toggle the mobile menu visibility
const hamburger = document.querySelector(".hamburger-button");
hamburger.onclick = () => {
  console.log("clicked");
  toggleMobileMenu(hamburger.nextElementSibling);
};
