import { checkSignedIn } from "./auth.js";
const gridContainer = document.querySelector(".grid-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;
let tries = 16;
let totalScore = 0; // Declare totalScore outside the if block

// Fetch total score from local storage
if (localStorage.getItem("totalScore")) {
  totalScore = parseInt(localStorage.getItem("totalScore"));
} else {
  localStorage.setItem("totalScore", score);
  totalScore = score;
}

document.querySelector(".tries").textContent = tries;
document.querySelector(".score").textContent = score;
document.querySelector(".total-score").textContent = `User Total Score: ${totalScore}`;

fetch("cards.json")
  .then((res) => res.json())
  .then((data) => {
    cards = [...data, ...data];
    shuffleCards();
    generateCards();
  });

// Reward buttons logic
const reward20Button = document.getElementById("reward-20");
const reward50Button = document.getElementById("reward-50");
const reward100Button = document.getElementById("reward-100");

reward20Button.addEventListener("click", () => {
  if (totalScore >= 20) {
    alert("Congrats! Use promo code PROMO20 for your reward.");
  } else {
    alert("You need at least 20 points to claim this reward.");
  }
});

reward50Button.addEventListener("click", () => {
  if (totalScore >= 50) {
    alert("Congrats! Use promo code PROMO50 for your reward.");
  } else {
    alert("You need at least 50 points to claim this reward.");
  }
});

reward100Button.addEventListener("click", () => {
  if (totalScore >= 100) {
    alert("Congrats! Use promo code PROMO100 for your reward.");
  } else {
    alert("You need at least 100 points to claim this reward.");
  }
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
    totalScore++;
    document.querySelector(".score").textContent = score;
    document.querySelector(".total-score").textContent = `User Total Score: ${totalScore}`;

    disableCards();
    if (tries === 0) {
      document.querySelector(".tries").textContent =
        "Game Over! You have no more tries left.";
      localStorage.setItem("totalScore", totalScore);
      return;
    }
  } else {
    unflipCards();
    if (tries === 0) {
      document.querySelector(".tries").textContent =
        "Game Over! You have no more tries left.";
      localStorage.setItem("totalScore", totalScore);
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
  // Save total score to local storage
  localStorage.setItem("totalScore", totalScore);

  resetBoard();
  shuffleCards();
  score = 0;
  tries = 16;
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
            // Go to profile screen
            console.log("User is signed in: ", result[0], result[1]);
            window.location.href = "dashboard.html";
          } else {
            // Go to login screen
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
