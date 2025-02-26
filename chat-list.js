/**
 * @fileoverview
 * This script manages the chat interface and user authentication.
 * It handles fetching user data, retrieving chat details, rendering the chat list,
 * toggling the mobile menu, and logging out the user.
 *
 * @author Jing Shun
 */

import { getChats, getUserData, getUsernameById } from "./services.js";
import { checkSignedIn } from "./auth.js";
import { logout } from "./auth.js";

// When page is loaded, check if user is signed in then fetch user data and chats
document.addEventListener("DOMContentLoaded", function () {
  const signedInPromise = checkSignedIn() || Promise.resolve(null);

  signedInPromise
    .then(async (result) => {
      if (result !== null) {
        // Handle the case where the user is signed in
        try {
          const userData = await getUserData(result[0]); // Fetch user data
          const chatIds = userData.chats; // Extract chat IDs
          const chatList = await getChats(chatIds); // Fetch chats

          const chatListElement = document.querySelector(".chat-list");
          for (let chat of chatList) {
            let data = chat.data();
            console.log(data);
            const lastMessageTime = new Date(
              data.lastMessageTime.seconds * 1000
            );
            const formattedTime = lastMessageTime.toLocaleString(); // You can customize the format as needed

            let chatItemElement = document.createElement("div");
            chatItemElement.classList.add("chat-item");
            chatItemElement.onclick = () => {
              window.location.href = `chat-view.html?id=${data.id}`;
            };
            let oppId = data.participants.find((id) => id !== result[0]);
            let oppUsername = await getUsernameById(oppId);
            chatItemElement.innerHTML = `
              <div class="chat-info">
                <h2>Chat with ${oppUsername}</h2>
                <p>Last message: ${data.lastMessage}</p>
                <p>${formattedTime}</p>
              </div>
            `;
            chatListElement.appendChild(chatItemElement);
          }
        } catch (error) {
          console.error("Error fetching user data or chats:", error);
        }
      } else {
        console.log("No user signed in.");
      }
    })
    .catch((error) => {
      console.error("Error checking sign-in status:", error);
    });
});
// Toggle mobile menu
function toggleMobileMenu(menu) {
  menu.classList.toggle("open");
}
const hamburger = document.querySelector(".hamburger-button");
hamburger.onclick = () => {
  console.log("clicked");
  toggleMobileMenu(hamburger.nextElementSibling);
};

// Define logout function
function logOut() {
  logout()
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Error logging out:", error);
    });
}
let logout_button = document.querySelectorAll(".logout-btn");
logout_button.forEach((button) => {
  button.addEventListener("click", logOut);
});
