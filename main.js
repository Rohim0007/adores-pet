// LocalStorage based Product & Cart management
let products = JSON.parse(localStorage.getItem('adore_products')) || [
    { id: 1, name: "Hollin Lop Male Rabbit", price: 3500, image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=500&q=80" },
    { id: 2, name: "Nipple Feeder 1 pcs", price: 220, image: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=500&q=80" },
    { id: 3, name: "Hamster Grain Mix (500g)", price: 280, image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=500&q=80" }
];

let cart = JSON.parse(localStorage.getItem('adore_cart')) || [];

// Save state
function saveState() {
    localStorage.setItem('adore_products', JSON.stringify(products));
    localStorage.setItem('adore_cart', JSON.stringify(cart));
}

// Initial Load Handler
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    if(document.getElementById('productGrid')) displayProducts(products);
    if(document.getElementById('checkoutCartItems')) loadCheckoutPage();
    if(document.getElementById('adminProductList')) loadAdminProducts();
});

// Display Products on Index
function displayProducts(list) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    list.forEach(p => {
        grid.innerHTML += `
            <div class="product-card">
                <span class="product-badge-offer">NEW</span>
                <div class="product-img-wrapper">
                    <img src="${p.image}" class="product-img">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${p.name}</h3>
                    <div class="product-price">৳ ${p.price}</div>
                    <div class="card-action-row">
                        <button class="btn-details" onclick="window.location.href='checkout.html'">অর্ডার</button>
                        <button class="btn-add-quick" onclick="addToCart(${p.id})">কার্টে নিন</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// Add to Cart
function addToCart(id) {
    const prod = products.find(p => p.id === id);
    const exist = cart.find(c => c.id === id);
    if(exist) {
        exist.qty += 1;
    } else {
        cart.push({ ...prod, qty: 1 });
    }
    saveState();
    updateCartCount();
    alert('প্রোডাক্টটি কার্টেম যোগ করা হয়েছে!');
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('#bottomCartCount').forEach(el => el.innerText = total);
}

// Load Checkout Page Data
function loadCheckoutPage() {
    const container = document.getElementById('checkoutCartItems');
    const totalEl = document.getElementById('checkoutTotal');
    if(cart.length === 0) {
        container.innerHTML = '<p style="color:var(--gray); text-align:center;">আপনার কার্ট খালি!</p>';
        totalEl.innerText = '৳ ০';
        return;
    }
    container.innerHTML = '';
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.qty;
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:8px;">
                <span>${item.name} (x${item.qty})</span>
                <span>৳ ${item.price * item.qty}</span>
            </div>
        `;
    });
    totalEl.innerText = `৳ ${subtotal + 80} (ডেলিভারিসহ)`;
}

// Submit Order via WhatsApp
function submitOrder(e) {
    e.preventDefault();
    if(cart.length === 0) {
        alert('কার্ট খালি!');
        return;
    }
    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    const address = document.getElementById('custAddress').value;
    const trxId = document.getElementById('custTrxId').value || 'নেই';

    let subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    let msg = `🛒 *Adore's Pet Order*%0A👤 নাম: ${name}%0A📞 ফোন: ${phone}%0A📍 ঠিকানা: ${address}%0A%0A`;
    cart.forEach(i => { msg += `- ${i.name} (${i.qty} pcs) = ৳ ${i.price * i.qty}%0A`; });
    msg += `%0A💰 মোট: ৳ ${subtotal + 80} (ডেলিভারি চার্জ ৮০ সহ)%0A💳 TrxID: ${trxId}`;

    window.open(`https://wa.me/8801681578599?text=${msg}`, '_blank');
}

// Admin Add Product
function addNewProduct(e) {
    e.preventDefault();
    const name = document.getElementById('newTitle').value;
    const price = Number(document.getElementById('newPrice').value);
    const image = document.getElementById('newImage').value;

    products.push({ id: Date.now(), name, price, image });
    saveState();
    alert('নতুন প্রোডাক্ট সফলভাবে যুক্ত হয়েছে!');
    window.location.href = 'index.html';
}

function loadAdminProducts() {
    const list = document.getElementById('adminProductList');
    list.innerHTML = '';
    products.forEach(p => {
        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:8px 0; font-size:13px;">
                <span>${p.name} - ৳ ${p.price}</span>
                <button onclick="deleteProduct(${p.id})" style="background:#e53935; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">ডিলিট</button>
            </div>
        `;
    });
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    saveState();
    loadAdminProducts();
}
