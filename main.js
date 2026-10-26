// Database State
let products = JSON.parse(localStorage.getItem('adore_products')) || [
    {
        id: "PET-101",
        name: "HOLLIN LOP MALE",
        regularPrice: 4000,
        discountPrice: 3500,
        stock: 100,
        ageVal: "4",
        ageUnit: "Year",
        color: "White",
        category: "Rabbit",
        rating: "4.8",
        details: "High quality pure breed rabbit.",
        img1: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=500&q=80",
        videoUrl: "https://youtu.be/f0Xmh4MH15o"
    }
];

let cart = JSON.parse(localStorage.getItem('adore_cart')) || [];
let orders = JSON.parse(localStorage.getItem('adore_orders')) || [];
let adminSettings = JSON.parse(localStorage.getItem('adore_admin_settings')) || {
    popupImg: "",
    popupLink: "",
    noticeText: "",
    noticeYt: "",
    vacationMode: false,
    adminPass: "1234"
};

let liveClickCount = 0;
let currentOrderTab = 'Pending';

document.addEventListener("DOMContentLoaded", () => {
    updateCartUI();
    if(document.getElementById('productGrid')) {
        displayProducts(products);
        checkHomeSettings();
    }
    if(document.getElementById('adminManageProductList')) {
        loadAdminData();
    }
});

// Live Site 3-Click Admin Access
function handleLiveSiteClick() {
    liveClickCount++;
    if(liveClickCount >= 3) {
        liveClickCount = 0;
        const pass = prompt('অ্যাডমিন পাসওয়ার্ড দিন:');
        if(pass === adminSettings.adminPass) {
            window.location.href = 'admin.html';
        } else {
            alert('ভুল পাসওয়ার্ড!');
        }
    } else {
        setTimeout(() => { liveClickCount = 0; }, 1500);
    }
}

function adminLogout() {
    alert('লগআউট সফল হয়েছে!');
    window.location.href = 'index.html';
}

// Display Products on Home
function displayProducts(list) {
    const grid = document.getElementById('productGrid');
    if(!grid) return;
    grid.innerHTML = '';

    list.forEach(p => {
        grid.innerHTML += `
            <div class="product-card">
                <span class="badge-offer">OFFER</span>
                <span class="badge-rating"><i class="fa-solid fa-star"></i> ${p.rating || '4.8'}</span>
                <div class="product-img-wrapper">
                    <img src="${p.img1}" class="product-img">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${p.name}</h3>
                    <div style="font-size:11px; color:#777; margin-bottom:4px;">Stock: ${p.stock || '10'} | Age: ${p.ageVal||'1'} ${p.ageUnit||'Year'}</div>
                    <div class="product-price">
                        ৳ ${p.discountPrice} 
                        ${p.regularPrice ? `<span style="font-size:12px; color:#aaa; text-decoration:line-through; margin-left:5px;">৳ ${p.regularPrice}</span>` : ''}
                    </div>
                    <div class="card-action-row">
                        <button class="btn-details" onclick="openProductModal('${p.id}')">View Details</button>
                        <button class="btn-add-quick" onclick="addToCart('${p.id}')">কার্টে নিন</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function checkHomeSettings() {
    // Check Vacation Mode
    if(adminSettings.vacationMode) {
        const vBar = document.getElementById('vacationNoticeBar');
        if(vBar) vBar.style.display = 'block';
    }
    // Check Announcement Text
    if(adminSettings.noticeText) {
        const nBar = document.getElementById('announcementNoticeBar');
        if(nBar) {
            nBar.innerText = adminSettings.noticeText;
            nBar.style.display = 'block';
        }
    }
    // Welcome Popup
    if(adminSettings.popupImg) {
        document.getElementById('welcomePopupImg').src = adminSettings.popupImg;
        document.getElementById('welcomePopupLink').href = adminSettings.popupLink || '#';
        document.getElementById('welcomePopupModal').classList.add('open');
        document.getElementById('welcomePopupOverlay').style.display = 'block';
    }
}

function closeWelcomePopup() {
    document.getElementById('welcomePopupModal').classList.remove('open');
    document.getElementById('welcomePopupOverlay').style.display = 'none';
}

function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    if(event && event.target) event.target.classList.add('active');

    if(cat === 'all') displayProducts(products);
    else displayProducts(products.filter(p => p.category.toLowerCase() === cat.toLowerCase()));
}

function filterProducts() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    displayProducts(products.filter(p => p.name.toLowerCase().includes(q)));
}

// Product Modal Popup
function openProductModal(id) {
    const p = products.find(item => item.id == id);
    if(!p) return;

    const modalBody = document.getElementById('modalBodyContent');
    modalBody.innerHTML = `
        <h3 style="color:var(--primary); font-size:18px; text-transform:uppercase; margin-bottom:10px;">${p.name}</h3>
        <img src="${p.img1}" class="modal-product-img">
        <div class="modal-price-box">
            ${p.regularPrice ? `<span class="modal-old-price">৳ ${p.regularPrice}</span>` : ''}
            <span class="modal-current-price">৳ ${p.discountPrice}</span>
        </div>
        <div class="modal-badges">
            <span class="badge-stock">Stock: ${p.stock || 10} Pcs</span>
            <span class="badge-age">Age: ${p.ageVal || 1} ${p.ageUnit || 'Year'}</span>
        </div>
        <p class="modal-desc">${p.details || 'High quality product.'}</p>
        ${p.videoUrl ? `
            <a href="${p.videoUrl}" target="_blank" class="youtube-btn">
                <i class="fa-brands fa-youtube"></i> Watch Product Video on YouTube
            </a>
        ` : ''}
        <div class="modal-action-buttons">
            <button class="modal-add-cart" onclick="addToCart('${p.id}'); closeProductModal();">কার্টে যোগ করুন</button>
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

// Cart Drawer Functions
function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if(drawer) drawer.classList.toggle('open');
    if(overlay) overlay.classList.toggle('active');
    updateCartUI();
}

function addToCart(id) {
    if(adminSettings.vacationMode) {
        alert('শপ বর্তমানে ভ্যাকেশন মোডে থাকায় অর্ডার নেয়া বন্ধ আছে!');
        return;
    }
    const p = products.find(item => item.id == id);
    const existing = cart.find(c => c.id == id);

    if(existing) existing.qty += 1;
    else cart.push({ ...p, qty: 1 });

    localStorage.setItem('adore_cart', JSON.stringify(cart));
    updateCartUI();
    toggleCart();
}

function changeQty(id, change) {
    const item = cart.find(i => i.id == id);
    if(item) {
        item.qty += change;
        if(item.qty <= 0) cart = cart.filter(i => i.id != id);
    }
    localStorage.setItem('adore_cart', JSON.stringify(cart));
    updateCartUI();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id != id);
    localStorage.setItem('adore_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cartItemsContainer');
    const badge = document.getElementById('bottomCartCount');
    const totalPriceEl = document.getElementById('cartTotalPrice');

    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    if(badge) badge.innerText = totalCount;

    if(!container) return;

    if(cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray); margin-top: 40px;">আপনার কার্ট খালি আছে!</p>';
        if(totalPriceEl) totalPriceEl.innerText = '৳ ০';
        return;
    }

    container.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.discountPrice * item.qty;
        container.innerHTML += `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border);">
                <img src="${item.img1}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 3px;">${item.name}</h4>
                    <p style="font-size: 12px; color: #d32f2f; font-weight: 700;">৳ ${item.discountPrice * item.qty}</p>
                    <div style="display: flex; align-items: center; gap: 6px; margin-top: 5px;">
                        <button onclick="changeQty('${item.id}', -1)" style="background: #eee; border: none; width: 22px; height: 22px; border-radius: 4px; cursor: pointer; font-weight: 700;">-</button>
                        <span style="font-size: 13px; font-weight: 600;">${item.qty}</span>
                        <button onclick="changeQty('${item.id}', 1)" style="background: #eee; border: none; width: 22px; height: 22px; border-radius: 4px; cursor: pointer; font-weight: 700;">+</button>
                    </div>
                </div>
                <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: #e53935; font-size: 15px; cursor: pointer; padding: 5px;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    });

    if(totalPriceEl) totalPriceEl.innerText = `৳ ${total}`;
}

function goToCheckout() {
    if(cart.length === 0) {
        alert('আপনার কার্ট খালি!');
        return;
    }
    window.location.href = 'checkout.html';
}

// ================= ADMIN FUNCTIONS =================

function loadAdminData() {
    // Fill Settings
    document.getElementById('popupImgUrl').value = adminSettings.popupImg || '';
    document.getElementById('popupTargetUrl').value = adminSettings.popupLink || '';
    document.getElementById('noticeText').value = adminSettings.noticeText || '';
    document.getElementById('noticeYtUrl').value = adminSettings.noticeYt || '';
    document.getElementById('vacationModeToggle').checked = adminSettings.vacationMode || false;

    // Load Orders Tab
    filterOrderTab(currentOrderTab);

    // Load Manage Products
    const manageList = document.getElementById('adminManageProductList');
    manageList.innerHTML = '';
    products.forEach(p => {
        manageList.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:10px 0;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${p.img1}" style="width:45px; height:45px; object-fit:cover; border-radius:6px;">
                    <div>
                        <strong style="font-size:13px;">${p.name}</strong><br>
                        <span style="font-size:12px; color:#d32f2f;">৳ ${p.discountPrice}</span>
                    </div>
                </div>
                <div style="display:flex; gap:6px;">
                    <button onclick="openEditProductModal('${p.id}')" style="background:var(--primary); color:#fff; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-weight:600;">Edit</button>
                    <button onclick="deleteProduct('${p.id}')" style="background:#e53935; color:#fff; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-weight:600;">Delete</button>
                </div>
            </div>
        `;
    });
}

function savePopupBanner() {
    adminSettings.popupImg = document.getElementById('popupImgUrl').value;
    adminSettings.popupLink = document.getElementById('popupTargetUrl').value;
    localStorage.setItem('adore_admin_settings', JSON.stringify(adminSettings));
    alert('পপআপ ব্যানার সেভ করা হয়েছে!');
}

function saveAnnouncementNotice() {
    adminSettings.noticeText = document.getElementById('noticeText').value;
    adminSettings.noticeYt = document.getElementById('noticeYtUrl').value;
    localStorage.setItem('adore_admin_settings', JSON.stringify(adminSettings));
    alert('নোটিশ আপডেট করা হয়েছে!');
}

function toggleVacationMode() {
    adminSettings.vacationMode = document.getElementById('vacationModeToggle').checked;
    localStorage.setItem('adore_admin_settings', JSON.stringify(adminSettings));
    alert(`ভ্যাকেশন মোড ${adminSettings.vacationMode ? 'চালু' : 'বন্ধ'} করা হয়েছে!`);
}

function changeAdminPassword() {
    const np = document.getElementById('newPass').value;
    const cp = document.getElementById('confirmPass').value;
    if(np && np === cp) {
        adminSettings.adminPass = np;
        localStorage.setItem('adore_admin_settings', JSON.stringify(adminSettings));
        alert('অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
    } else {
        alert('পাসওয়ার্ড মেলেনি!');
    }
}

function filterOrderTab(tab) {
    currentOrderTab = tab;
    document.getElementById('tabPending').classList.remove('active');
    document.getElementById('tabCompleted').classList.remove('active');
    document.getElementById('tabCanceled').classList.remove('active');
    document.getElementById(`tab${tab}`).classList.add('active');

    const list = document.getElementById('adminOrdersList');
    const filtered = orders.filter(o => o.status === tab);
    list.innerHTML = '';

    if(filtered.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:var(--gray); padding:15px;">কোনো ${tab} অর্ডার নেই।</p>`;
        return;
    }

    filtered.forEach(o => {
        list.innerHTML += `
            <div onclick="openAdminOrderModal(${o.id})" style="background:#f9f9f9; padding:12px; border-radius:8px; margin-bottom:8px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; border:1px solid var(--border);">
                <div>
                    <strong>${o.name}</strong> (${o.phone})<br>
                    <span style="font-size:12px; color:var(--gray);">তারিখ: ${o.date}</span>
                </div>
                <div style="font-weight:700; color:#d32f2f;">৳ ${o.total}</div>
            </div>
        `;
    });
}

// Add New Product Handler
function handleAddNewProduct(e) {
    e.preventDefault();
    const newP = {
        id: "PET-" + Date.now().toString().slice(-4),
        name: document.getElementById('pName').value,
        regularPrice: Number(document.getElementById('pRegularPrice').value) || 0,
        discountPrice: Number(document.getElementById('pDiscountPrice').value),
        stock: Number(document.getElementById('pStock').value) || 10,
        ageVal: document.getElementById('pAgeVal').value || "1",
        ageUnit: document.getElementById('pAgeUnit').value,
        color: document.getElementById('pColor').value || "White",
        category: document.getElementById('pCategory').value,
        rating: document.getElementById('pRating').value || "4.8",
        details: document.getElementById('pDetails').value,
        img1: document.getElementById('pImg1').value,
        videoUrl: document.getElementById('pVideoUrl').value
    };

    products.push(newP);
    localStorage.setItem('adore_products', JSON.stringify(products));
    alert('প্রোডাক্ট সফলভাবে যুক্ত করা হয়েছে!');
    e.target.reset();
    loadAdminData();
}

// Open & Save Edit Modal
function openEditProductModal(id) {
    const p = products.find(item => item.id == id);
    if(!p) return;

    document.getElementById('editId').value = p.id;
    document.getElementById('editDisplayId').value = p.id;
    document.getElementById('editName').value = p.name;
    document.getElementById('editRegularPrice').value = p.regularPrice || '';
    document.getElementById('editDiscountPrice').value = p.discountPrice;
    document.getElementById('editStock').value = p.stock || 10;
    document.getElementById('editAgeVal').value = p.ageVal || '1';
    document.getElementById('editAgeUnit').value = p.ageUnit || 'Year';
    document.getElementById('editImg1').value = p.img1;
    document.getElementById('editVideoUrl').value = p.videoUrl || '';
    document.getElementById('editPreviewImg').src = p.img1;

    document.getElementById('editProductModal').classList.add('open');
    document.getElementById('editProductModalOverlay').style.display = 'block';
}

function closeEditProductModal() {
    document.getElementById('editProductModal').classList.remove('open');
    document.getElementById('editProductModalOverlay').style.display = 'none';
}

function handleSaveEditProduct(e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const p = products.find(item => item.id == id);

    if(p) {
        p.name = document.getElementById('editName').value;
        p.regularPrice = Number(document.getElementById('editRegularPrice').value);
        p.discountPrice = Number(document.getElementById('editDiscountPrice').value);
        p.stock = Number(document.getElementById('editStock').value);
        p.ageVal = document.getElementById('editAgeVal').value;
        p.ageUnit = document.getElementById('editAgeUnit').value;
        p.img1 = document.getElementById('editImg1').value;
        p.videoUrl = document.getElementById('editVideoUrl').value;

        localStorage.setItem('adore_products', JSON.stringify(products));
        alert('প্রোডাক্ট আপডেট সফল হয়েছে!');
        closeEditProductModal();
        loadAdminData();
    }
}

function deleteProduct(id) {
    if(confirm('আপনি কি এই প্রোডাক্টটি মুছে ফেলতে চান?')) {
        products = products.filter(p => p.id != id);
        localStorage.setItem('adore_products', JSON.stringify(products));
        loadAdminData();
    }
}
