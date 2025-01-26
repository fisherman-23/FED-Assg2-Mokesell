
var productcontainer = document.querySelector('.product-card-container');
let numberOfCards = 0;
let increment = 8;
function loadProducts() {
    fetch("products.json")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if(numberOfCards+increment <= data.length) {
            for (let i = numberOfCards; i < numberOfCards+increment; i++) {
                const product = data[i];
                const productdiv = document.createElement('div');
                productdiv.className = 'product-card';
                productdiv.innerHTML = `
                    <div class="gradient-blur">
                        <section class="product-info-section">
                            <h2>${product.name}</h2>
                            <p>SGD ${product.price}</p>
                        </section>
                        <img src="/productIMG/product${i+1}.png" alt="Product Image">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                `;
                productcontainer.appendChild(productdiv);
            }
        }
        else{
            for (let i = numberOfCards; i < data.length; i++) {
                const product = data[i];
                const productdiv = document.createElement('div');
                productdiv.className = 'product-card';
                productdiv.innerHTML = `
                    <div class="gradient-blur">
                        <section class="product-info-section">
                            <h2>${product.name}</h2>
                            <p>SGD ${product.price}</p>
                        </section>
                        <img src="/productIMG/product${i+1}.png" alt="Product Image">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                `;
                productcontainer.appendChild(productdiv);
            }
            document.querySelector('.load-more').style.display = 'none';
            document.querySelector('.end').style.display = 'block';
        }
        numberOfCards = numberOfCards+increment; 
    }).catch(error => {
        console.error('Error loading products:', error);
    });
}
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});
document.querySelector('.load-more').addEventListener('click', function() {
    loadProducts();
});