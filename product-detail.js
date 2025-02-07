import {
  getAllOffers,
  getListingsByIds,
  getUserData,
  getUsernameById,
  uploadOffer,
} from "./services";
import { getAuth } from "firebase/auth";
import {
  doc,
  collection,
  setDoc,
  getFirestore,
  getDoc,
} from "firebase/firestore";

const db = getFirestore();

document.addEventListener("DOMContentLoaded", async function () {
  console.log("Document loaded");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  // Fetch and display the product details
  let product = [];
  try {
    product = await getListingsByIds([id]);
    console.log(product);

    if (product.length > 0) {
      loadContent(product[0]);
    }
  } catch (error) {
    console.error("Error fetching product:", error);
  }

  // Fetch and display the seller details
  try {
    const seller = product[0]?.seller;
    const userData = await getUserData(seller);
    const username = userData.username;
    const dateJoined = userData.createdAt;

    document.querySelector(
      ".user-datejoin"
    ).textContent = `Created on ${new Date(
      dateJoined.seconds * 1000
    ).toLocaleDateString()}`;
    document.querySelector(".user-name").textContent = username;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  // Hide the loading indicator
  setTimeout(() => {
    document.querySelector(".loading").style.display = "none";
  }, 1300);
  try {
    const offerCount = document.getElementById("offer-count");
    const offers = await getAllOffers(id);
    offerCount.textContent = `${offers.length} offer(s) made`;
    console.log(offers);
    if (getAuth().currentUser.uid === product[0].seller) {
      loadOffers(offers);
      document.getElementById("make-offer").style.display = "none";
      document.getElementById("view-offer").style.display = "block";
    }
  } catch (error) {
    console.error("Error fetching offers:", error);
  }

  if (getAuth().currentUser.uid === product[0].seller) {
    document.getElementById("make-offer").style.display = "none";
    document.getElementById("view-offer").style.display = "block";
  } else {
    document.getElementById("make-offer").style.display = "block";
    document.getElementById("view-offer").style.display = "none";
  }
  // Fetch and display offer count

  // Set up popups and events
  setupPopupAndEvents();
  setupPopupAndEventsSeller();
});

// Function to populate product content
function loadContent(product) {
  document.querySelector(".product-img").src = product.image;
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

// Function to set up the popup and related events
function setupPopupAndEvents() {
  const popup = document.getElementById("popup");
  const closeButton = document.getElementById("close-btn");

  document.getElementById("make-offer").addEventListener("click", function () {
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

  // Handle offer form submission
  document.getElementById("offer-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const user = getAuth().currentUser;
    const offer = document.getElementById("offer-price").value;
    const offerData = {
      offerPrice: offer,
      buyerId: user.uid,
      sellerId: product[0].seller,
      status: "pending",
    };
    uploadOffer(id, offerData);
    document.getElementById("offer-price").value = "";

    showToast("Success", "Offer sent successfully", "success");
  });
}
function setupPopupAndEventsSeller() {
  const popup = document.getElementById("popup-seller");
  const closeButton = document.getElementById("close-btn-seller");

  document.getElementById("view-offer").addEventListener("click", function () {
    console.log("clicked");
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
}

// Function to toggle mobile menu
function toggleMobileMenu(menu) {
  menu.classList.toggle("open");
}

// Hamburger menu setup
const hamburger = document.querySelector(".hamburger-button");
hamburger.onclick = () => {
  console.log("clicked");
  toggleMobileMenu(hamburger.nextElementSibling);
};

// Toast notification
const toast = document.querySelector(".toast");
const toastHeader = document.querySelector(".toast-content h2");
const toastMessage = document.querySelector(".toast-content p");
const toastIcon = document.querySelector(".toast-icon img");

function showToast(header, message, type) {
  if (type === "error") {
    toastIcon.src = "cross.svg";
  } else {
    toastIcon.src = "tick.svg";
  }
  toastHeader.textContent = header;
  toastMessage.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

function loadOffers(offers) {
  const offerList = document.getElementById("offer-list");
  offerList.innerHTML = ""; // Clear any existing offers
  offers.forEach(async (offer) => {
    const offerItem = document.createElement("div");
    offerItem.classList.add("offer-item");

    const priceElement = document.createElement("p");
    priceElement.classList.add("offer-price");
    priceElement.textContent = `Offer: $${offer.offerPrice}`;

    const usernameElement = document.createElement("p");
    usernameElement.classList.add("offer-username");
    let username = await getUsernameById(offer.buyerId);
    usernameElement.textContent = `Username: ${username || "N/A"}`;

    const statusElement = document.createElement("p");
    statusElement.classList.add("offer-status");
    statusElement.textContent = `Status: ${offer.status}`;

    // Append elements to the offer item
    offerItem.appendChild(priceElement);
    offerItem.appendChild(usernameElement);
    offerItem.appendChild(statusElement);

    // Append the offer item to the list
    offerList.appendChild(offerItem);
  });
}
