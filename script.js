import { checkSignedIn } from "./auth";

// In app.js or your script tag
document.addEventListener("DOMContentLoaded", function () {
  const profileButtons = document.querySelectorAll(".profile-btn");
  profileButtons.forEach((profileButton) => {
    profileButton.addEventListener("click", function () {
      checkSignedIn()
        .then((result) => {
          if (result) {
            // go to profile screen
            console.log("User is signed in: ", result[0], result[1]);
            window.location.href = "dashboard.html";
          } else {
            // go to login screen
            window.location.href = "login.html";
          }
        })
        .catch((error) => {
          console.error("Error checking sign-in status: ", error);
          window.location.href = "login.html";
        });
    });
  });
});
function toggleMobileMenu(menu) {
  menu.classList.toggle("open");
}
const hamburger = document.querySelector(".hamburger-button");
hamburger.onclick = () => {
  console.log("clicked");
  toggleMobileMenu(hamburger.nextElementSibling);
};
