import { doc } from "firebase/firestore";
import { createListing, uploadImage } from "./services";
import { initializeApp } from "firebase/app";
import { getListings } from "./services";
import lottie from "lottie-web";

var productcontainer = document.querySelector(".product-card-container");
let numberOfCards = 0;
let increment = 8;
let products = [];
let filterCategory = [];
function loadProducts() {
  getListings()
    .then((data) => {
      products = data;
      if (numberOfCards + increment <= data.length) {
        for (let i = numberOfCards; i < numberOfCards + increment; i++) {
          const product = data[i];
          const productdiv = document.createElement("div");
          productdiv.className = "product-card";
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
        for (let i = numberOfCards; i < data.length; i++) {
          const product = data[i];
          const productdiv = document.createElement("div");
          productdiv.className = "product-card";
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
      }
      numberOfCards = numberOfCards + increment;
    })
    .catch((error) => {
      console.error("Error loading products:", error);
    });
}
loadProducts();
document.querySelector(".load-more").addEventListener("click", function () {
  loadProducts();
});

function testUploadBatchListing() {
  fetch("products.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        const product = data[i];
        const listing = {
          name: product.name,
          price: product.price,
          image: `productIMG/product${i + 1}.jpg`,
          description: product.description,
          category: product.category,
          condition: product.condition,
          seller: product.seller_id,
          likes: 0,
          createdAt: new Date(),
        };
        createListing(listing);
      }
    })
    .catch((error) => {
      console.error("Error uploading batch:", error);
    });
}

const popup = document.getElementById("popup");
const closeButton = document.getElementById("close-btn");
document.querySelector(".upload").addEventListener("click", function () {
  // testUploadBatchListing();
  popup.style.opacity = 1;
  popup.style.visibility = "visible";
});
closeButton.addEventListener("click", () => {
  popup.style.opacity = 0;
  popup.style.visibility = "hidden";
});
popup.addEventListener('click' ,(e) => {
  if(e.target === popup){
    popup.style.opacity = 0;
    popup.style.visibility = "hidden";
  }
});
const uploadLeft = document.querySelector(".uploadLeft");
const fileInput = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");

uploadLeft.addEventListener("click", function () {
  fileInput.click();
});

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

function product(name, price, desc, condition, category, img) {
  this.name = name;
  this.price = price;
  this.desc = desc;
  this.condition = condition;
  this.category = category;
  this.img = img;
}

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
  //Do your thingy here
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
          await createListing(newListing); // ✅ Wait for the listing to be created

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

      // ✅ Call the async function
      handleListingCreation();
    }
  }
});

const dotLottie = lottie.loadAnimation({
  autoplay: true,
  loop: true,
  container: document.getElementById("dotlottie-animation"),
  renderer: "svg",
  path: "test.json",
});


function displayProducts(products) { //Takes in a the list of search results and displays them
  productcontainer.innerHTML = "";
  document.querySelector(".load-more").style.display = "none";
  products.forEach((product, i) => {
    console.log(product);
    const productdiv = document.createElement("div");
    productdiv.className = "product-card";
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
}


//Search Function
document.querySelector(".search").addEventListener("input", function () { //Listen for search input
  const searchQuery = this.value.toLowerCase();
  const filteredProducts = products.filter(product => //Filter products based on input, then return an array of products that match
    product.name.toLowerCase().includes(searchQuery)
  );
  displayProducts(filteredProducts); //Display the filtered products
});



//Filter sidepanel
document.querySelector(".filter").addEventListener("click", ()=>{
  document.querySelector(".sidepanel").classList.add('open');
})
document.querySelector(".sidepanel-close").addEventListener("click", ()=>{
  document.querySelector(".sidepanel").classList.remove('open');
})
let filtered = [];
const priceRange = document.querySelector(".price-range");
const priceDisplay = document.querySelector(".price-display");

//Filter for pricing
priceRange.addEventListener("input", ()=>{
  let priceValue = priceRange.value; 
  priceDisplay.textContent = `$0 - $${priceValue}`;
  if(filterCategory.length != 0){
      filtered = products.filter(item =>  {
      return filterCategory.includes(item.category) && item.price <= priceRange.value
    })
  }else{
      filtered = products.filter(item =>  {
      return item.price <= priceRange.value
    })
  }
  if(filterCategory.length != 0){
    displayProducts(filtered)
  }else{
    productcontainer.innerHTML = ""; 
    numberOfCards = 0
    loadProducts()
    document.querySelector(".load-more").style.display = "block";
  }
});


//Filter for categories
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', ()=>{
    if(checkbox.checked){
      filterCategory.push(checkbox.value)
    }
    else{
      filterCategory = filterCategory.filter(value => value !== checkbox.value);
    }
    const filtered = products.filter(item =>  {
      return filterCategory.includes(item.category) && item.price <= priceRange.value
    })
    console.log(filtered)
    if(filterCategory.length != 0){
      displayProducts(filtered)
    }else{
      productcontainer.innerHTML = ""; 
      numberOfCards = 0
      loadProducts()
      document.querySelector(".load-more").style.display = "block";
    }
    
  });
});