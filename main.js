const products = [
    {
        id: 1,
        name: "Asian Flemish Giant Rabbit (বিশুদ্ধ ফ্লেমিশ জায়ান্ট খরগোশ)",
        category: "rabbit",
        price: 3500,
        oldPrice: 4000,
        stock: "100 Pcs",
        age: "4 Years",
        rating: "3.5",
        image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=500&q=80",
        description: "High quality pure breed rabbit with active health and friendly nature."
    },
    {
        id: 2,
        name: "Nipple Feeder 1 pcs (খরগোশের ড্রিংকার)",
        category: "accessories",
        price: 220,
        oldPrice: 300,
        stock: "400 Pcs",
        age: "New",
        rating: "4.8",
        image: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=500&q=80",
        description: "Stainless steel durable water nipple feeder for rabbits and small pets."
    },
    {
        id: 3,
        name: "Pure Breed French Lop Rabbit (ফ্রেঞ্চ লপ খরগোশ)",
        category: "rabbit",
        price: 4500,
        oldPrice: 5000,
        stock: "50 Pcs",
        age: "1 Year",
        rating: "4.9",
        image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=500&q=80",
        description: "Beautiful fluffy French Lop rabbit raised in healthy home environment."
    },
    {
        id: 4,
        name: "Hamster Special Grain Mix (500g)",
        category: "pet-food",
        price: 280,
        oldPrice: 350,
        stock: "250 Pcs",
        age: "Fresh",
        rating: "4.6",
        image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=500&q=80",
        description: "Nutritious seed and grain mix formulated for Syrian and Campbell hamsters."
    }
];

let cart = JSON.parse(localStorage.getItem('adore_cart')) || [];

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    if(document.getElementById('productGrid')) displayProducts(products);
});

function displayProducts(productsToDisplay) {
    const grid = document.getElementById('productGrid');
    if(!grid) return;
    grid.innerHTML = '';

    productsToDisplay.forEach(product => {
        grid.innerHTML += `
            <div class="product-card">
                <span class="badge-offer">OFFER</span>
                <span class="badge-rating"><i class="fa-solid fa-star"></i> ${product.rating}</span>
                <div class="product-img-wrapper">
                    <img src="${product.image}" alt="${product.name}" class="product-img">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">৳ ${product.price}</div>
                    <div class="card-action-row">
                        <button class="btn-details" onclick="openProductModal(${product.id})">View Details</button>
                        <button class="btn-add-quick" onclick="addToCart(${product.id})">কার্টে নিন</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function filterCategory(category) {
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    if(event && event.target) event.target.classList.add('active');

    if(category === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        displayProducts(filtered);
    }
}

function filterProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query));
    displayProducts(filtered);
}

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if(!product) return;

    const modalBody = document.getElementById('modalBodyContent');
    modalBody.innerHTML = `
        <img src="${product.image}" class="modal-product-img">
        <h3 class="modal-title">${product.name}</h3>
        <div class="modal-price-box">
            <span class="modal-current-price">৳ ${product.price}</span>
            <span class="modal-old-price">৳ ${product.oldPrice}</span>
        </div>
        <div class="modal-badges">
            <span class="badge-stock">Stock: ${product.stock}</span>
            <span class="badge-age">Age: ${product.age}</span>
        </div>
        <p class="modal-desc">${product.description}</p>
        <a href="https://youtube.com" target="_blank" class="youtube-btn">
            <i class="fa-brands fa-youtube"></i> Watch Product Video on YouTube
        </a>
        <div class="modal-action-buttons">
            <button class="modal-add-cart" onclick="addToCart(${product.id}); closeProductModal();">কার্টে যোগ করুন</button>
            <button class="modal-close-action" onclick="closeProductModal()">বন্ধ করুন</button>
        </div>
    `;

    document.getElementById('productModal').classList.add('open');
    document.getElementById('productModalOverlay').style.display = 'block';
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('open');
    document.getElementById('productModalOverlay').style.display = 'none';
}

// Support Modal Functions
function openSupportModal() {
    document.getElementById('supportModal').classList.add('open');
    document.getElementById('supportModalOverlay').style.display = 'block';
}

function closeSupportModal() {
    document.getElementById('supportModal').classList.remove('open');
    document.getElementById('supportModalOverlay').style.display = 'none';
}

// Orders Modal Functions
function openOrdersModal() {
    document.getElementById('ordersModal').classList.add('open');
    document.getElementById('ordersModalOverlay').style.display = 'block';
}

function closeOrdersModal() {
    document.getElementById('ordersModal').classList.remove('open');
    document.getElementById('ordersModalOverlay').style.display = 'none';
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if(existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    localStorage.setItem('adore_cart', JSON.stringify(cart));
    updateCartCount();
    alert('কার্টে প্রোডাক্ট যোগ করা হয়েছে!');
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('bottomCartCount');
    if(badge) badge.innerText = total;
}
