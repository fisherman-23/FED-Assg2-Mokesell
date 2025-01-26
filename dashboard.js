import { checkSignedIn } from "./auth";
import { getUserData } from "./services";
let welcome_string = document.getElementById("dashboard-welcome");
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
          })
          .catch((error) => {
            // Handle error
          });
      } else {
      }
    })
    .catch((error) => {
      console.error("Error checking sign-in status:", error);
    });
});
