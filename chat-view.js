import { getMessagesById } from "./services.js";

// Sample JSON data for messages
let messages = [
  {
    senderId: "user1",
    text: "Hello! How are you?",
    timeSent: "10:00 AM",
  },
  {
    senderId: "user2",
    text: "I'm good, thanks! How about you?",
    timeSent: "10:02 AM",
  },
  {
    senderId: "user1",
    text: "I'm doing great, thanks for asking!",
    timeSent: "10:05 AM",
  },
];

// Function to render messages
function renderMessages(messages) {
  const chatMessages = document.getElementById("chat-messages");
  chatMessages.innerHTML = ""; // Clear existing messages

  messages.forEach((message) => {
    const lastMessageTime = new Date(message.timeSent.seconds * 1000);
    const formattedTime = lastMessageTime.toLocaleString(); // You can customize the format as needed

    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    // Align messages to the right if the sender is the current user
    if (message.senderId === "user1") {
      messageElement.classList.add("right");
    }

    messageElement.innerHTML = `
        <div class="sender">${message.senderId}</div>
        <div class="text">${message.text}</div>
        <div class="time">${formattedTime}</div>
      `;

    chatMessages.appendChild(messageElement);
  });

  // Scroll to the bottom of the chat
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send a new message
function sendMessage() {
  const messageInput = document.getElementById("chat-input");
  const text = messageInput.value.trim();

  if (text === "") return; // Don't send empty messages

  // Create a new message object
  const newMessage = {
    senderId: "user1", // Assume the current user is "user1"
    text: text,
    timeSent: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  // Add the new message to the messages array
  messages.push(newMessage);

  // Render the updated messages
  renderMessages(messages);

  // Clear the input field
  messageInput.value = "";
}

// Event listener for the send button
document.getElementById("send-btn").addEventListener("click", sendMessage);

// Event listener for the Enter key
document.getElementById("chat-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Render messages on page load
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const msg = await getMessagesById([id]);
  console.log(msg);
  renderMessages(msg);
});
