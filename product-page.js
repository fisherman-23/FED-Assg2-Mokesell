import { doc } from "firebase/firestore";
import { createListing, uploadImage } from "./services";
import { initializeApp } from "firebase/app";
import { getListings } from "./services";
import lottie from "lottie-web";
import { checkSignedIn } from "./auth";
var productcontainer = document.querySelector(".product-card-container");
let numberOfCards = 0;
let increment = 8;
let products = [];
let filterCategory = [];

// When page loads first, it calls the API for the database of listings

document.addEventListener("DOMContentLoaded", async function () {
  products = await getListings(); //Then it stores the listings in a list to prevent excessive API calling
  loadProducts(products);
});

// Then it will load in the first 8 products, for everytime this function is called 8 more products is loaded in
function loadProducts(data) {
  products = data;
  document.querySelector(".end").style.display = "none";
  if (numberOfCards + increment <= data.length) {
    for (let i = numberOfCards; i < numberOfCards + increment; i++) {
      const product = data[i];
      const productdiv = document.createElement("div");
      productdiv.className = "product-card";
      productdiv.onclick = () => productDetail(product.id);
      productdiv.innerHTML = `
                    <div class="gradient-blur">
                        <section class="product-info-section">
                            <h2>${product.name}</h2>
                            <p>SGD ${product.price}</p>
                        </section>
                        <img src="${product.thumbnail}" alt="Product Image">
                        <div></div>
                        <div></div>

                    </div>
                `;
      productcontainer.appendChild(productdiv);
    }
  } else {
    //This is when the number of products left is not 8 it will switch the for loop range to the max to prevent indexOutofRange error
    for (let i = numberOfCards; i < data.length; i++) {
      const product = data[i];
      const productdiv = document.createElement("div");
      productdiv.className = "product-card";
      productdiv.onclick = () => productDetail(product.id);
      productdiv.innerHTML = `
                    <div class="gradient-blur">
                        <section class="product-info-section">
                            <h2>${product.name}</h2>
                            <p>SGD ${product.price}</p>
                        </section>
                        <img src="${product.thumbnail}" alt="Product Image">
                        <div></div>
                        <div></div>

                    </div>
                `;
      productcontainer.appendChild(productdiv);
    }
    document.querySelector(".load-more").style.display = "none";
    document.querySelector(".end").style.display = "block";
    document.querySelector(".end").innerHTML = "End of products";
  }
  numberOfCards = numberOfCards + increment;
}

// Event listener for load more button which calls the above function when clicked
document.querySelector(".load-more").addEventListener("click", function () {
  loadProducts(products);
});

// Event listener for products card when click it redirects the user to the product details page
function productDetail(id) {
  console.log(`"Product Clicked ${id}"`);
  window.location.href = `product-detail.html?id=${id}`;
}

// Upload listing popup
const popup = document.getElementById("popup");
const closeButton = document.getElementById("close-btn");
document.querySelector(".upload").addEventListener("click", function () {
  // check if user is signed in

  const signedInPromise = checkSignedIn() || Promise.resolve(null);

  signedInPromise
    .then((result) => {
      if (result !== null) {
        // Handle the case where the user is signed in
        popup.style.opacity = 1;
        popup.style.visibility = "visible";
      } else {
        // redirect to login
        window.location.href = "login.html";
      }
    })
    .catch((error) => {
      console.error("Error checking sign-in status:", error);
    });
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
const uploadLeft = document.querySelector(".uploadLeft");
const fileInput = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");

// Triggers the input file prompt when the box for upload image has been click
uploadLeft.addEventListener("click", function () {
  fileInput.click();
});

// When a file has been entered it reads the file and show a preview of that image
fileInput.addEventListener("change", function () {
  const file = fileInput.files[0];
  const reader = new FileReader();
  if (file) {
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      imagePreview.src = e.target.result;
    };
    document.querySelector(".uploadLeft h2").style.display = "none";
  }
});

// Object for the new listed product
function product(name, price, desc, condition, category, img) {
  this.name = name;
  this.price = price;
  this.desc = desc;
  this.condition = condition;
  this.category = category;
  this.img = img;
}

// When the form has been succesfully submitted the data is put into the product obj
const form = document.querySelector(".uploadForm");
form.addEventListener("submit", function (event) {
  event.preventDefault();
  let newListing = new product(
    document.getElementById("productName").value,
    document.getElementById("productPrice").value,
    document.getElementById("description").value,
    document.getElementById("condition").value,
    document.getElementById("category").value,
    fileInput.files[0]
  );
  console.log(newListing);
  if (fileInput.files[0]) {
    // check for file size or not image
    if (fileInput.files[0].size > 1000000) {
      alert("File size too large. Please upload an image less than 1MB.");
    } else if (
      fileInput.files[0].type !== "image/jpeg" &&
      fileInput.files[0].type !== "image/png"
    ) {
      alert("Please upload a valid image file. (JPG or PNG)");
    } else {
      let uploadCanvas = document.getElementById("dotlottie-canvas");
      let uploadAnimation = document.getElementById("dotlottie-animation");

      uploadCanvas.style.display = "block";
      uploadAnimation.style.display = "block";
      dotLottie.playSegments([0, 70], true);

      async function handleListingCreation() {
        try {
          await createListing(newListing); // Wait for the listing to be created

          setTimeout(() => {
            dotLottie.loop = false; // Stop looping
            dotLottie.playSegments([70, 117], true); // Play tick animation

            // Event listener to detect when the tick animation completes
            dotLottie.addEventListener("complete", function onComplete() {
              location.reload(); // Refresh page
              dotLottie.removeEventListener("complete", onComplete); // Remove listener after first trigger
            });
          }, 3000);
        } catch (error) {
          console.error("Error creating listing:", error);
        }
      }

      // Call the async function
      handleListingCreation();
    }
  }
});

const dotLottie = lottie.loadAnimation({
  autoplay: false,
  loop: true,
  container: document.getElementById("dotlottie-animation"),
  renderer: "svg",
  path: "test.json",
});

// Separate Display function for filtering and searching
function displayProducts(products) {
  //Takes in a the list of search results and displays them
  productcontainer.innerHTML = "";
  document.querySelector(".load-more").style.display = "none";
  document.querySelector(".end").style.display = "none";
  if (products.length > 0) {
    products.forEach((product, i) => {
      const productdiv = document.createElement("div");
      productdiv.className = "product-card";
      productdiv.onclick = () => productDetail(product.id);
      productdiv.innerHTML = `
      <div class="gradient-blur">
          <section class="product-info-section">
              <h2>${product.name}</h2>
              <p>SGD ${product.price}</p>
          </section>
          <img src="${product.thumbnail}" alt="Product Image"> <!--The image source is hardcoded based on index so it will be fixed when using thumbnails-->
          <div></div>
          <div></div>
      
      </div>
      `;
      productcontainer.appendChild(productdiv);
    });
    document.querySelector(".end").style.display = "block";
    document.querySelector(".end").innerHTML = "End of products";
  } else {
    document.querySelector(".end").style.display = "block";
    document.querySelector(".end").innerHTML =
      "There are no avaliable products for your search";
  }
}

//Search Function
document.querySelector(".search").addEventListener("input", function () {
  //Listen for search input
  const searchQuery = this.value.toLowerCase();
  const filteredProducts = products.filter(
    (
      product //Filter products based on input, then return an array of products that match
    ) => product.name.toLowerCase().includes(searchQuery)
  );
  displayProducts(filteredProducts); //Display the filtered products
});

//Filter sidepanel
document.querySelector(".filter").addEventListener("click", () => {
  if (document.querySelector(".sidepanel").classList.contains("open")) {
    document.querySelector(".sidepanel").classList.remove("open");
  } else {
    document.querySelector(".sidepanel").classList.add("open");
  }
});
document.querySelector(".sidepanel-close").addEventListener("click", () => {
  document.querySelector(".sidepanel").classList.remove("open");
});
let filtered = [];
const priceRange = document.querySelector(".price-range");
const priceDisplay = document.querySelector(".price-display");

//Filter for pricing
priceRange.addEventListener("input", () => {
  let priceValue = priceRange.value;
  priceDisplay.textContent = `$0 - $${priceValue}`;
  if (filterCategory.length != 0) {
    //Checks if a filter by category has been selected
    filtered = products.filter((item) => {
      //if yes then it filters the product by item category and check if its under the price range
      return (
        filterCategory.includes(item.category) && item.price <= priceRange.value
      );
    });
  } else {
    //if no then it filters just by price
    filtered = products.filter((item) => {
      return item.price <= priceRange.value;
    });
  }
  if (filterCategory.length != 0 || priceValue < 1000) {
    //Only call the separate display function when a filter is applied
    displayProducts(filtered);
  } else {
    //if it has been removed then it will load back the original display
    productcontainer.innerHTML = "";
    numberOfCards = 0;
    loadProducts(products);
    document.querySelector(".load-more").style.display = "block";
  }
});

//Filter for categories
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    //Check whether the product has been check or unchecked
    if (checkbox.checked) {
      filterCategory.push(checkbox.value); //if so then its added to the list of filter by
    } else {
      filterCategory = filterCategory.filter(
        (value) => value !== checkbox.value //if not it is removed from the filter list
      );
    }
    const filtered = products.filter((item) => {
      //Filter by category and price range
      return (
        filterCategory.includes(item.category) && item.price <= priceRange.value
      );
    });
    console.log(filtered);
    if (filterCategory.length != 0) {
      //Only call the separate display function when a filter is applied
      displayProducts(filtered);
    } else {
      //if it has been removed then it will load back the original display
      productcontainer.innerHTML = "";
      numberOfCards = 0;
      loadProducts(products);
      document.querySelector(".load-more").style.display = "block";
    }
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
