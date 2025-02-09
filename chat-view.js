/**
 * @fileoverview
 * This script handles real-time chat functionality, including message rendering, sending messages,
 * listening for updates via Firestore, and user authentication.
 *
 * @author Jing Shun
 */

import {
  getMessagesById,
  getUserData,
  getChatById,
  getUsernameById,
  sendMessageToFirestore,
} from "./services.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  getFirestore,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { checkSignedIn } from "./auth.js";
import { logout } from "./auth.js";

const db = getFirestore();

// Sample JSON data for messages (not to be used in production) (assuming timeSent is a Firebase Timestamp)
let messages = [
  {
    senderId: "user1",
    text: "Hello! How are you?",
    timeSent: { seconds: 1696161600, nanoseconds: 0 }, // Example Firebase Timestamp
  },
  {
    senderId: "user2",
    text: "I'm good, thanks! How about you?",
    timeSent: { seconds: 1696161720, nanoseconds: 0 }, // Example Firebase Timestamp
  },
  {
    senderId: "user1",
    text: "I'm doing great, thanks for asking!",
    timeSent: { seconds: 1696161900, nanoseconds: 0 }, // Example Firebase Timestamp
  },
];

let id;
let msg;
let userId;

// Function to render messages
function renderMessages(messages, userId) {
  console.log(userId);
  const chatMessages = document.getElementById("chat-messages");
  chatMessages.innerHTML = ""; // Clear existing messages

  // Sort messages by timeSent (Firebase Timestamp)
  messages.sort((a, b) => a.timeSent.seconds - b.timeSent.seconds);

  messages.forEach((message) => {
    // Convert Firebase Timestamp to JavaScript Date
    const messageTime = new Date(message.timeSent.seconds * 1000);
    const formattedTime = messageTime.toLocaleString(); // Customize the format as needed

    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    // Align messages to the right if the sender is the current user
    if (message.senderId === userId) {
      messageElement.classList.add("right");
    }

    messageElement.innerHTML = `
        <div class="text">${message.text}</div>
        <div class="time">${formattedTime}</div>
      `;

    chatMessages.appendChild(messageElement);
  });

  // Scroll to the bottom of the chat
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send a new message
function sendMessage(id, msg, userId) {
  console.log(id, msg);

  const messageInput = document.getElementById("chat-input");
  const text = messageInput.value.trim();

  if (text === "") return; // Don't send empty messages

  // Create a new message object with Firebase Timestamp
  const newMessage = {
    senderId: userId,
    text: text,
    timeSent: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }, // Current time as Firebase Timestamp
  };

  sendMessageToFirestore(id, newMessage, userId);
  msg.push(newMessage);

  // also update the chat object with the last message and time
  const chatRef = doc(db, "chats", id);
  const chatSnap = getDoc(chatRef);
  chatSnap.then((doc) => {
    const chatData = doc.data();
    chatData.lastMessage = text;
    chatData.lastMessageTime = newMessage.timeSent;
    setDoc(chatRef, chatData);
  });

  // Render the updated messages
  renderMessages(msg, userId);

  // Clear the input field
  messageInput.value = "";
}

// Event listener for the send button
document.getElementById("send-btn").addEventListener("click", function () {
  sendMessage(id, msg, userId);
});

// Event listener for the Enter key
document.getElementById("chat-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage(id, msg, userId);
  }
});

// Render messages on page load
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  id = params.get("id");
  msg = await getMessagesById([id]);
  const signedInPromise = checkSignedIn() || Promise.resolve(null);

  userId = await signedInPromise.then((result) => {
    if (result !== null) {
      return result[0];
    }
  });
  console.log(userId);
  renderMessages(msg, userId);

  // Get the username of the other user in the chat
  const chat = await getChatById(id);
  const otherUserId = chat.participants.find((user) => user !== userId);
  console.log(otherUserId);

  const username = await getUsernameById(otherUserId);
  document.getElementById("chat-header").textContent = `Chat with ${username}`;

  setupFirestoreListener(`chats/${id}/messages`, userId);
});
// create listen snapshot to update messages in real time
// Function to set up Firestore real-time listener
function setupFirestoreListener(collectionPath, userId) {
  const messagesRef = collection(db, collectionPath); // Reference to the Firestore collection

  // Set up the onSnapshot listener
  onSnapshot(messagesRef, (snapshot) => {
    const updatedMessages = [];
    snapshot.forEach((doc) => {
      const messageData = doc.data();
      updatedMessages.push({
        id: doc.id, // Optional: Include the document ID if needed
        senderId: messageData.senderId,
        text: messageData.text,
        timeSent: messageData.timeSent, // Assuming timeSent is a Firebase Timestamp
      });
    });

    // Update the messages array and re-render
    msg = updatedMessages;
    renderMessages(msg, userId);
  });
}
function toggleMobileMenu(menu) {
  menu.classList.toggle("open");
}
const hamburger = document.querySelector(".hamburger-button");
hamburger.onclick = () => {
  console.log("clicked");
  toggleMobileMenu(hamburger.nextElementSibling);
};

// Define the logOut function
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
