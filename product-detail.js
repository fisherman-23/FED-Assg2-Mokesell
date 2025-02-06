import { getListingsByIds, getUserData, getUsernameById } from "./services";
import { getAuth } from "firebase/auth";
import {
  doc,
  collection,
  setDoc,
  getFirestore,
  getDoc,
} from "firebase/firestore";
const db = getFirestore();
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
let product = [];
product = await getListingsByIds([id]);
console.log(product);
function loadContent(product) {
  document.querySelector(".product-img").src = product.thumbnail;
  document.querySelector(".product-name").textContent = product.name;
  document.querySelector(
    ".product-price"
  ).textContent = `SGD $${product.price}`;
  document.querySelector(
    ".product-condition"
  ).textContent = `Condition: ${product.condition}`;
  document.querySelector(".product-description").textContent =
    product.description;
}
loadContent(product[0]);
const seller = product[0].seller;
const userData = await getUserData(seller);
const username = userData.username;
const dateJoined = userData.createdAt;
console.log(dateJoined);
document.querySelector(".user-datejoin").textContent = `Created on ${new Date(
  dateJoined.seconds * 1000
).toLocaleDateString()}`;
document.querySelector(".user-name").textContent = username;
setTimeout(() => {
  document.querySelector(".loading").style.display = "none";
}, 1000);

const popup = document.getElementById("popup");
const closeButton = document.getElementById("close-btn");
document.getElementById("make-offer").addEventListener("click", function () {
  // testUploadBatchListing();
  popup.style.opacity = 1;
  popup.style.visibility = "visible";
});
closeButton.addEventListener("click", () => {
  popup.style.opacity = 0;
  popup.style.visibility = "hidden";
});
popup.addEventListener("click", (e) => {
  if (e.target === popup) {
    popup.style.opacity = 0;
    popup.style.visibility = "hidden";
  }
});

document
  .querySelector(".chat-btn")
  .addEventListener("click", async function () {
    const user = getAuth().currentUser;
    const messageCollection = collection(db, "messages");
    // create chat object
    let chat = {
      lastMessage: "",
      lastMessageTime: new Date(),
      participants: [seller, user.uid],
    };
    const docRef = doc(collection(db, "chats"));
    chat.id = docRef.id;

    await setDoc(docRef, chat);
    // update the chat field for both users

    const userRef = doc(db, "users", user.uid);
    const sellerRef = doc(db, "users", seller);
    const userSnap = await getDoc(userRef);
    const sellerSnap = await getDoc(sellerRef);
    let userChats = userSnap.data().chats;
    let sellerChats = sellerSnap.data().chats;
    userChats.push(chat.id);
    sellerChats.push(chat.id);
    await setDoc(userRef, { chats: userChats }, { merge: true });
    await setDoc(sellerRef, { chats: sellerChats }, { merge: true });

    window.location.href = `chat-view.html?id=${chat.id}`;
  });
