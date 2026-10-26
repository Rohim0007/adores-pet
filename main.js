// Product Database with detailed attributes
const products = [
    {
        id: 1,
        name: "Hollin Lop Male",
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
        name: "Nipple Feeder 1 pcs",
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
        name: "Hamster Special Grain Mix (500g)",
        category: "pet-food",
        price: 280,
        oldPrice: 350,
        stock: "250 Pcs",
        age: "Fresh",
        rating: "4.6",
        image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=500&q=80",
        description: "Nutritious seed and grain mix formulated for Syrian and Campbell hamsters."
    },
    {
        id: 4,
        name: "Wooden Chew Toy for Rabbits",
        category: "accessories",
        price: 180,
        oldPrice: 250,
        stock: "150 Pcs",
        age: "New",
        rating: "4.2",
        image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80",
        description: "Natural organic wood chew toy to keep teeth healthy and relieve stress."
    },
    {
        id: 5,
        name: "Hamster Silent Exercise Wheel",
        category: "accessories",
        price: 450,
        oldPrice: 550,
        stock: "80 Pcs",
        age: "New",
        rating: "4.9",
        image: "https://images.unsplash.com/photo-1425082661705-1834bfd49dca?auto=format&fit=crop&w=500&q=80",
        description: "Smooth and completely silent running wheel for hamster nightly workouts."
    },
    {
        id: 6,
        name: "Timothy Hay Fiber Food (1kg)",
        category: "pet-food",
        price: 400,
        oldPrice: 480,
        stock: "300 Pcs",
        age: "Fresh",
        rating: "4.7",
        image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=500&q=80",
        description: "Essential long-strand fiber Timothy Hay for proper rabbit digestion."
    }
];

let cart = [];

// Display Products
function displayProducts(productsToDisplay) {
    const grid = document.getElementById('productGrid');
    if(!grid) return;
    
    grid.innerHTML = '';

    if(productsToDisplay.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 30px;">কোনো প্রোডাক্ট পাওয়া যায়নি!</p>';
        return;
    }

    productsToDisplay.forEach(product => {
        grid.innerHTML += `
            <div class="product-card">
                <span class="product-badge-offer">OFFER</span>
                <span class="product-badge-rating"><i class="fa-solid fa-star"></i> ${product.rating}</span>
                <div class="product-img-wrapper">
                    <img src="${product.image}" alt="${product.name}" class="product-img">
                </div>
                <div class="product-info">
                    <span class="product-tag-label">${product.category.toUpperCase()}</span>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-meta-row">
                        <span>Stock: ${product.stock}</span>
                        <span>Age: ${product.age}</span>
                    </div>
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

// Category Filtering
function filterCategory(category) {
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    if(event && event.target) {
        event.target.classList.add('active');
    }

    if(category === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        displayProducts(filtered);
    }
}

// Search Products
function filterProducts() {
    const searchInput = document.getElementById('searchInput');
    if(!searchInput) return;
    
    const query = searchInput.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query));
    displayProducts(filtered);
}

// Product Details Modal
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if(!product) return;

    const modalBody = document.getElementById('modalBodyContent');
    modalBody.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="modal-product-img">
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

// Cart Drawer Toggle
function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('overlay');
    drawer.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if(existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    updateCartUI();
    toggleCart();
}

// Update Quantity
function changeQty(productId, change) {
    const item = cart.find(i => i.id === productId);
    if(item) {
        item.qty += change;
        if(item.qty <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
    }
    updateCartUI();
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

// Update Cart UI
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cartItems');
    const bottomCartCount = document.getElementById('bottomCartCount');
    const cartTotal = document.getElementById('cartTotal');

    if(!cartItemsContainer) return;

    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    bottomCartCount.innerText = totalCount;

    if(cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--gray); margin-top: 40px;">আপনার কার্ট খালি আছে!</p>';
        cartTotal.innerText = '৳ ০';
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.qty;
        cartItemsContainer.innerHTML += `
            <div class="cart-item-card">
                <img src="${item.image}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>৳ ${item.price * item.qty}</p>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    });

    cartTotal.innerText = `৳ ${total}`;
}

// Checkout Modal Open/Close
function openCheckoutModal() {
    if(cart.length === 0) {
        alert('আপনার কার্ট খালি! অনুগ্রহ করে কিছু প্রোডাক্ট যোগ করুন।');
        return;
    }
    toggleCart(); // Close cart drawer
    
    // Calculate totals in summary
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    document.getElementById('summarySubtotal').innerText = `৳ ${subtotal}`;
    document.getElementById('summaryTotal').innerText = `৳ ${subtotal + 80}`;

    document.getElementById('checkoutDrawer').classList.add('open');
    document.getElementById('checkoutOverlay').style.display = 'block';
}

function closeCheckoutModal() {
    document.getElementById('checkoutDrawer').classList.remove('open');
    document.getElementById('checkoutOverlay').style.display = 'none';
}

// Submit Order via WhatsApp & Form
function submitOrder(event) {
    event.preventDefault();
    
    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    const address = document.getElementById('custAddress').value;
    const district = document.getElementById('custDistrict').value;
    const area = document.getElementById('custArea').value;
    const trxId = document.getElementById('custTrxId').value || 'প্রযোজ্য নয়';

    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let grandTotal = subtotal + 80;

    let message = `🛒 *Adore's Pet - নতুন অর্ডার*%0A%0A`;
    message += `👤 নাম: ${name}%0A`;
    message += `📞 মোবাইল: ${phone}%0A`;
    message += `📍 ঠিকানা: ${address}, ${area}, ${district}%0A%0A`;
    message += `📦 *প্রোডাক্ট তালিকা:*%0A`;

    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (${item.qty} pcs) - ৳ ${item.price * item.qty}%0A`;
    });

    message += `%0A💰 পণ্যের মূল্য: ৳ ${subtotal}%0A`;
    message += `🚚 ডেলিভারি চার্জ: ৳ ৮০%0A`;
    message += `📌 *সর্বমোট প্রদেয়: ৳ ${grandTotal}*%0A`;
    message += `💳 TrxID: ${trxId}`;

    const whatsappNumber = "8801681578599";
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
}

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
    displayProducts(products);
});
