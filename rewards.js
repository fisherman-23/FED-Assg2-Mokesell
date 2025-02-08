import { checkSignedIn } from "./auth.js";
const gridContainer = document.querySelector(".grid-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;
let tries = 16;
document.querySelector(".tries").textContent = tries;
document.querySelector(".score").textContent = score;

fetch("cards.json")
  .then((res) => res.json())
  .then((data) => {
    cards = [...data, ...data];
    shuffleCards();
    generateCards();
  });

function shuffleCards() {
  let currentIndex = cards.length,
    randomIndex,
    temporaryValue;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

function generateCards() {
  for (let card of cards) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);
    cardElement.innerHTML = `
      <div class="front">
        <img class="front-image" src=${card.image} />
      </div>
      <div class="back"></div>
    `;
    gridContainer.appendChild(cardElement);
    cardElement.addEventListener("click", flipCard);
  }
}

function flipCard() {
  if (tries === 0) {
    document.querySelector(".tries").textContent =
      "Game Over! You have no more tries left.";
    return;
  }
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    tries = Math.max(0, tries - 1);
    document.querySelector(".tries").textContent = tries;
    return;
  }

  secondCard = this;
  tries = Math.max(0, tries - 1);
  document.querySelector(".tries").textContent = tries;
  lockBoard = true;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  if (isMatch) {
    score++;
    document.querySelector(".score").textContent = score;
    disableCards();
    if (tries === 0) {
      document.querySelector(".tries").textContent =
        "Game Over! You have no more tries left.";
      return;
    }
  } else {
    unflipCards();
    if (tries === 0) {
      document.querySelector(".tries").textContent =
        "Game Over! You have no more tries left.";
      return;
    }
  }
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  resetBoard();
}

function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 1000);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function restart() {
  resetBoard();
  shuffleCards();
  score = 0;
  tries = 10;
  document.querySelector(".score").textContent = score;
  document.querySelector(".tries").textContent = tries;
  gridContainer.innerHTML = "";
  generateCards();
}
function toggleMobileMenu(menu) {
  menu.classList.toggle("open");
}
const hamburger = document.querySelector(".hamburger-button");
hamburger.onclick = () => {
  console.log("clicked");
  toggleMobileMenu(hamburger.nextElementSibling);
};

const restartButton = document.getElementById("restart");
restartButton.onclick = restart;
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
