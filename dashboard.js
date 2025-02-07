import { checkSignedIn, logout } from "./auth";
import { getUserData } from "./services";

function logOut() {
  logout()
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Error logging out:", error);
    });
}
let logout_button = document.querySelector(".logout-btn");
logout_button.addEventListener("click", logOut);

let welcome_string = document.getElementById("dashboard-welcome");
let listing_count = document.getElementById("listing-count");
let purchase_count = document.getElementById("purchase-count");
let like_count = document.getElementById("like-count");
document.addEventListener("DOMContentLoaded", function () {
  // Ensure checkSignedIn returns a resolved promise, even if it's null
  const signedInPromise = checkSignedIn() || Promise.resolve(null);

  signedInPromise
    .then((result) => {
      if (result !== null) {
        // Handle the case where the user is signed in

        getUserData(result[0])
          .then((userData) => {
            // Handle user data
            console.log("User data:", userData.username);
            welcome_string.innerHTML = `Welcome, ${userData.username}!`;
            listing_count.innerHTML = `${userData.listings.length}`;
            purchase_count.innerHTML = `${userData.purchases.length}`;
            like_count.innerHTML = `${userData.likes.length}`;
          })
          .catch((error) => {
            // Handle error
          });
      } else {
        // redirect to login
        window.location.href = "login.html";
      }
    })
    .catch((error) => {
      console.error("Error checking sign-in status:", error);
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
