// Product Database (খরগোশ, হ্যামস্টার খাবার ও খেলনা)
const products = [
    {
        id: 1,
        name: "প্রিমিয়াম খরগোশ ও গিনিপিগের খাবার (১ কেজি)",
        category: "rabbit-food",
        price: 350,
        image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 2,
        name: "হ্যামস্টার স্পেশাল সিড ও গ্রেইন মিক্স (৫০০ গ্রাম)",
        category: "hamster-food",
        price: 280,
        image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 3,
        name: "খরগোশের প্রাকৃতিক কাঠের চিবানোর খেলনা (Wooden Chew Toy)",
        category: "toys",
        price: 180,
        image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 4,
        name: "হ্যামস্টার রানিং হুইল (সাইলেন্ট এক্সারসাইজ হুইল)",
        category: "toys",
        price: 450,
        image: "https://images.unsplash.com/photo-1425082661705-1834bfd49dca?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 5,
        name: "পেট ওয়াটার ড্রিংকিং বোতল (নিপল ফিডার - ২৫০ মিলি)",
        category: "accessories",
        price: 220,
        image: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 6,
        name: "টিমোথি হে (Timothy Hay) খরগোশের ফাইবার ফুড",
        category: "rabbit-food",
        price: 400,
        image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=500&q=80"
    }
];

let cart = [];
let currentCategory = 'all';

// Display Products on Page
function displayProducts(productsToDisplay) {
    const grid = document.getElementById('productGrid');
    if(!grid) return;
    
    grid.innerHTML = '';

    if(productsToDisplay.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--gray);">কোনো প্রোডাক্ট পাওয়া যায়নি!</p>';
        return;
    }

    productsToDisplay.forEach(product => {
        grid.innerHTML += `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-img">
                <div class="product-info">
                    <span class="product-tag">${getCategoryName(product.category)}</span>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">৳ ${product.price}</div>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        <i class="fa-solid fa-cart-plus"></i> কার্টে যোগ করুন
                    </button>
                </div>
            </div>
        `;
    });
}

function getCategoryName(cat) {
    switch(cat) {
        case 'rabbit-food': return 'খরগোশের খাবার';
        case 'hamster-food': return 'হ্যামস্টারের খাবার';
        case 'toys': return 'খেলনা';
        case 'accessories': return 'অ্যাক্সেসরিজ';
        default: return 'পেট আইটেম';
    }
}

// Filter Category
function filterCategory(category) {
    currentCategory = category;
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

// Cart Drawer Toggle
function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('overlay');
    if(drawer) drawer.classList.toggle('open');
    if(overlay) overlay.classList.toggle('active');
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

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

// Update Cart UI
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');

    if(!cartItemsContainer) return;

    cartCount.innerText = cart.reduce((sum, item) => sum + item.qty, 0);

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
            <div class="cart-item">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>৳ ${item.price} × ${item.qty}</p>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    });

    cartTotal.innerText = `৳ ${total}`;
}

// WhatsApp Checkout
function checkoutWhatsApp() {
    if(cart.length === 0) {
        alert('আপনার কার্ট খালি! অনুগ্রহ করে কিছু প্রোডাক্ট যোগ করুন।');
        return;
    }

    let message = "আসসালামু আলাইকুম, আমি Adore's Pet থেকে নিচের প্রোডাক্টগুলো অর্ডার করতে চাই:%0A%0A";
    let total = 0;

    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} - ${item.qty} pcs - ৳ ${item.price * item.qty}%0A`;
        total += item.price * item.qty;
    });

    message += `%0A*মোট মূল্য: ৳ ${total}*%0A%0Aআমার নাম এবং ঠিকানা নিচে দিলাম:%0Aনাম:%0Aঠিকানা:%0Aমোবাইল নাম্বার:`;

    // আপনার WhatsApp নাম্বার এখানে বসিয়ে দিন (যেমন: 8801XXXXXXXXX)
    const whatsappNumber = "8801XXXXXXXXX"; 
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
}

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
    displayProducts(products);
});
