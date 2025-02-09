import { doc } from "firebase/firestore";
import { checkSignedIn, logout } from "./auth";
import { getUserData, getListingsByIds } from "./services";

let productcontainer = document.querySelector(".product-container"); // Ensure correct selection

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const result = await checkSignedIn();
    if (result !== null) {
      // Fetch user data
      const userData = await getUserData(result[0]);

      // Fetch product listings
      const products = await getListingsByIds(userData.listings);

      // Iterate and display products
      products.forEach((product) => {
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
      });
    } else {
      // Redirect to login page if not signed in
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
function productDetail(id) {
  console.log(`"Product Clicked ${id}"`);
  window.location.href = `product-detail.html?id=${id}`;
}

function toggleMobileMenu(menu) {
  menu.classList.toggle("open");
}
const hamburger = document.querySelector(".hamburger-button");
hamburger.onclick = () => {
  console.log("clicked");
  toggleMobileMenu(hamburger.nextElementSibling);
};
