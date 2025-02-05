import { getListingsByIds } from "./services";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
let product = [];
product = await getListingsByIds([id])
console.log(product)
function loadContent(product) {
    document.querySelector(".product-img").src = product.thumbnail
    document.querySelector(".product-name").textContent = product.name
    document.querySelector(".product-price").textContent = `SGD $${product.price}`;
    document.querySelector(".product-condition").textContent = `Condition: ${product.condition}`;
    document.querySelector(".product-description").textContent = product.description;
}
loadContent(product[0])
setTimeout(() => {
    document.querySelector(".loading").style.display = 'none';
}, 2200); 
