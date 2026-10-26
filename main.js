// ================= GLOBAL STATE & LOCALSTORAGE =================
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
        details: "High quality pure breed rabbit with active health and friendly nature.",
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

// ================= CUSTOM MODAL SYSTEM (REPLACING ALL BROWSER ALERTS & CONFIRMS) =================
function showCustomAlert(title, message, callback) {
    let oldOverlay = document.getElementById('customModalOverlay');
    if(oldOverlay) oldOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'customModalOverlay';
    overlay.className = 'custom-modal-overlay';
    overlay.innerHTML = `
        <div class="custom-modal-box">
            <div class="icon-wrap info"><i class="fa-solid fa-circle-info"></i></div>
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="custom-modal-buttons">
                <button class="custom-modal-btn primary" id="customAlertOkBtn">ঠিক আছে</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('customAlertOkBtn').onclick = () => {
        overlay.remove();
        if(callback) callback();
    };
}

function showCustomConfirm(title, message, onConfirm) {
    let oldOverlay = document.getElementById('customModalOverlay');
    if(oldOverlay) oldOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'customModalOverlay';
    overlay.className = 'custom-modal-overlay';
    overlay.innerHTML = `
        <div class="custom-modal-box">
            <div class="icon-wrap danger"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="custom-modal-buttons">
                <button class="custom-modal-btn secondary" id="customConfirmCancel">না</button>
                <button class="custom-modal-btn danger-btn" id="customConfirmOk">হ্যাঁ, ডিলিট করুন</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('customConfirmOk').onclick = () => {
        overlay.remove();
        if(onConfirm) onConfirm();
    };

    document.getElementById('customConfirmCancel').onclick = () => {
        overlay.remove();
    };
}

function showCustomPasswordPrompt(callback) {
    let oldOverlay = document.getElementById('customModalOverlay');
    if(oldOverlay) oldOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'customModalOverlay';
    overlay.className = 'custom-modal-overlay';
    overlay.innerHTML = `
        <div class="custom-modal-box">
            <div class="icon-wrap info"><i class="fa-solid fa-lock"></i></div>
            <h3>অ্যাডমিন লগইন</h3>
            <p>অ্যাডমিন পাসওয়ার্ড দিন (ডিফল্ট: 1234):</p>
            <input type="password" id="customPassInput" placeholder="পাসওয়ার্ড লিখুন" autofocus>
            <div class="custom-modal-buttons">
                <button class="custom-modal-btn secondary" id="customPromptCancel">বাতিল</button>
                <button class="custom-modal-btn primary" id="customPromptOk">প্রবেশ করুন</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById('customPassInput');
    input.focus();

    document.getElementById('customPromptOk').onclick = () => {
        const val = input.value;
        overlay.remove();
        callback(val);
    };

    document.getElementById('customPromptCancel').onclick = () => {
        overlay.remove();
    };

    input.onkeydown = (e) => {
        if(e.key === 'Enter') {
            const val = input.value;
            overlay.remove();
            callback(val);
        }
    };
}

// Success Toast Notification
function showSuccessToast(message) {
    let toast = document.getElementById('successToastBox');
    if(!toast) {
        toast = document.createElement('div');
        toast.id = 'successToastBox';
        toast.className = 'success-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="font-size: 18px;"></i> ${message}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ================= DOM LOAD INITIALIZER =================
document.addEventListener("DOMContentLoaded", () => {
    updateCartUI();
    if(document.getElementById('productGrid')) {
        displayProducts(products);
        checkHomeSettings();
    }
    if(document.getElementById('adminManageProductList')) {
        loadAdminData();
    }
    if(document.getElementById('checkoutCartItems')) {
        loadCheckoutPage();
    }
});

// Live Site 3-Click Admin Access
function handleLiveSiteClick() {
    liveClickCount++;
    if(liveClickCount >= 3) {
        liveClickCount = 0;
        showCustomPasswordPrompt((pass) => {
            if(pass === adminSettings.adminPass) {
                window.location.href = 'admin.html';
            } else {
                showCustomAlert('ভুল পাসওয়ার্ড', 'সঠিক পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।');
            }
        });
    } else {
        setTimeout(() => { liveClickCount = 0; }, 1500);
    }
}

function adminLogout() {
    showSuccessToast('লগআউট সফল হয়েছে!');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
}

// ================= SHOP & HOME PAGE FUNCTIONS =================
function displayProducts(list) {
    const grid = document.getElementById('productGrid');
    if(!grid) return;
    grid.innerHTML = '';

    if(list.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 20px;">কোনো প্রোডাক্ট পাওয়া যায়নি!</p>';
        return;
    }

    list.forEach(p => {
        let productImg = p.img1 || p.image || 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=500&q=80';
        grid.innerHTML += `
            <div class="product-card">
                <span class="badge-offer">OFFER</span>
                <span class="badge-rating"><i class="fa-solid fa-star"></i> ${p.rating || '4.8'}</span>
                <div class="product-img-wrapper">
                    <img src="${productImg}" class="product-img" alt="${p.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${p.name}</h3>
                    <div style="font-size:11px; color:#777; margin-bottom:4px;">Stock: ${p.stock || '10'} | Age: ${p.ageVal||'1'} ${p.ageUnit||'Year'}</div>
                    <div class="product-price">
                        ৳ ${p.discountPrice || p.price} 
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
    if(adminSettings.vacationMode) {
        const vBar = document.getElementById('vacationNoticeBar');
        if(vBar) vBar.style.display = 'block';
    }
    if(adminSettings.noticeText) {
        const nBar = document.getElementById('announcementNoticeBar');
        if(nBar) {
            nBar.innerText = adminSettings.noticeText;
            nBar.style.display = 'block';
        }
    }
    if(adminSettings.popupImg) {
        const popImg = document.getElementById('welcomePopupImg');
        const popLink = document.getElementById('welcomePopupLink');
        const popModal = document.getElementById('welcomePopupModal');
        const popOverlay = document.getElementById('welcomePopupOverlay');
        if(popImg) popImg.src = adminSettings.popupImg;
        if(popLink) popLink.href = adminSettings.popupLink || '#';
        if(popModal) popModal.classList.add('open');
        if(popOverlay) popOverlay.style.display = 'block';
    }
}

function closeWelcomePopup() {
    const popModal = document.getElementById('welcomePopupModal');
    const popOverlay = document.getElementById('welcomePopupOverlay');
    if(popModal) popModal.classList.remove('open');
    if(popOverlay) popOverlay.style.display = 'none';
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

    let productImg = p.img1 || p.image || 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=500&q=80';
    const modalBody = document.getElementById('modalBodyContent');
    modalBody.innerHTML = `
        <h3 style="color:var(--primary); font-size:18px; text-transform:uppercase; margin-bottom:10px;">${p.name}</h3>
        <img src="${productImg}" class="modal-product-img" alt="${p.name}">
        <div class="modal-price-box">
            ${p.regularPrice ? `<span class="modal-old-price">৳ ${p.regularPrice}</span>` : ''}
            <span class="modal-current-price">৳ ${p.discountPrice || p.price}</span>
        </div>
        <div class="modal-badges">
            <span class="badge-stock">Stock: ${p.stock || 10} Pcs</span>
            <span class="badge-age">Age: ${p.ageVal || 1} ${p.ageUnit || 'Year'}</span>
        </div>
        <p class="modal-desc">${p.details || 'High quality pet product.'}</p>
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

// ================= CART & CHECKOUT FUNCTIONS =================
function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if(drawer) drawer.classList.toggle('open');
    if(overlay) overlay.classList.toggle('active');
    updateCartUI();
}

function addToCart(id) {
    if(adminSettings.vacationMode) {
        showCustomAlert('অবগত করুন', 'শপ বর্তমানে ভ্যাকেশন মোডে থাকায় অর্ডার নেয়া বন্ধ আছে!');
        return;
    }
    const p = products.find(item => item.id == id);
    const existing = cart.find(c => c.id == id);

    let productImg = p.img1 || p.image || '';
    let itemPrice = p.discountPrice || p.price || 0;

    if(existing) existing.qty += 1;
    else cart.push({ ...p, img1: productImg, discountPrice: itemPrice, qty: 1 });

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
        let pImg = item.img1 || item.image || '';
        let pPrice = item.discountPrice || item.price || 0;
        total += pPrice * item.qty;
        container.innerHTML += `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border);">
                <img src="${pImg}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" alt="${item.name}">
                <div style="flex: 1;">
                    <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 3px;">${item.name}</h4>
                    <p style="font-size: 12px; color: #d32f2f; font-weight: 700;">৳ ${pPrice * item.qty}</p>
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
        showCustomAlert('কার্ট খালি', 'আপনার কার্টে কোনো প্রোডাক্ট নেই!');
        return;
    }
    window.location.href = 'checkout.html';
}

function loadCheckoutPage() {
    const container = document.getElementById('checkoutCartItems');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const totalEl = document.getElementById('checkoutTotal');

    if(cart.length === 0) {
        if(container) container.innerHTML = '<p style="color:var(--gray); text-align:center;">আপনার কার্ট খালি!</p>';
        if(subtotalEl) subtotalEl.innerText = '৳ ০';
        if(totalEl) totalEl.innerText = '৳ ৮০';
        return;
    }

    if(container) container.innerHTML = '';
    let subtotal = 0;
    cart.forEach(item => {
        let pPrice = item.discountPrice || item.price || 0;
        subtotal += pPrice * item.qty;
        if(container) {
            container.innerHTML += `
                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:8px;">
                    <span>${item.name} (x${item.qty})</span>
                    <span>৳ ${pPrice * item.qty}</span>
                </div>
            `;
        }
    });
    if(subtotalEl) subtotalEl.innerText = `৳ ${subtotal}`;
    if(totalEl) totalEl.innerText = `৳ ${subtotal + 80}`;
}

function submitOrder(e) {
    e.preventDefault();
    if(cart.length === 0) {
        showCustomAlert('কার্ট খালি', 'কার্ট খালি আছে!');
        return;
    }

    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    const address = document.getElementById('custAddress').value;
    const trxId = document.getElementById('custTrxId') ? document.getElementById('custTrxId').value || 'প্রযোজ্য নয়' : 'প্রযোজ্য নয়';

    let subtotal = cart.reduce((sum, i) => sum + ((i.discountPrice || i.price) * i.qty), 0);
    let grandTotal = subtotal + 80;

    const newOrder = {
        id: Date.now(),
        name,
        phone,
        address,
        trxId,
        items: [...cart],
        total: grandTotal,
        status: 'Pending',
        date: new Date().toLocaleString()
    };

    orders.unshift(newOrder);
    localStorage.setItem('adore_orders', JSON.stringify(orders));

    cart = [];
    localStorage.setItem('adore_cart', JSON.stringify(cart));

    let msg = `🛒 *Adore's Pet - নতুন অর্ডার*%0A👤 নাম: ${name}%0A📞 ফোন: ${phone}%0A📍 ঠিকানা: ${address}%0A%0A`;
    newOrder.items.forEach(i => { msg += `- ${i.name} (${i.qty} pcs) = ৳ ${(i.discountPrice || i.price) * i.qty}%0A`; });
    msg += `%0A💰 মোট: ৳ ${grandTotal} (ডেলিভারি চার্জ ৮০ সহ)%0A💳 TrxID: ${trxId}`;

    window.open(`https://wa.me/8801681578599?text=${msg}`, '_blank');
    showCustomAlert('অর্ডার সফল', 'আপনার অর্ডারটি সফলভাবে প্লেস হয়েছে!', () => {
        window.location.href = 'index.html';
    });
}

// ================= ADMIN PANEL FUNCTIONS =================
function loadAdminData() {
    document.getElementById('popupImgUrl').value = adminSettings.popupImg || '';
    document.getElementById('popupTargetUrl').value = adminSettings.popupLink || '';
    document.getElementById('noticeText').value = adminSettings.noticeText || '';
    document.getElementById('noticeYtUrl').value = adminSettings.noticeYt || '';
    document.getElementById('vacationModeToggle').checked = adminSettings.vacationMode || false;

    filterOrderTab(currentOrderTab);

    const manageList = document.getElementById('adminManageProductList');
    if(!manageList) return;
    manageList.innerHTML = '';

    if(products.length === 0) {
        manageList.innerHTML = '<p style="text-align:center; color:var(--gray); padding:15px;">কোনো প্রোডাক্ট নেই।</p>';
        return;
    }

    products.forEach(p => {
        let productImg = p.img1 || p.image || 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=100&q=80';
        let prodPrice = p.discountPrice || p.price || 0;

        manageList.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#fafafa; border:1px solid var(--border); padding:12px; border-radius:12px; margin-bottom:10px; gap:10px;">
                <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:0;">
                    <img src="${productImg}" style="width:55px; height:55px; object-fit:cover; border-radius:8px; flex-shrink:0; border:1px solid #ddd;" alt="${p.name}">
                    <div style="flex:1; min-width:0;">
                        <h4 style="font-size:13px; font-weight:700; color:var(--dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:2px;">${p.name}</h4>
                        <span style="font-size:12px; color:#d32f2f; font-weight:700;">৳ ${prodPrice}</span>
                        <div style="font-size:11px; color:var(--gray);">স্টক: ${p.stock || '10'} pcs</div>
                    </div>
                </div>
                <div style="display:flex; gap:6px; flex-shrink:0;">
                    <button onclick="openEditProductModal('${p.id}')" style="background:var(--primary); color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600;">Edit</button>
                    <button onclick="deleteProduct('${p.id}')" style="background:#e53935; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600;">Delete</button>
                </div>
            </div>
        `;
    });
}

function savePopupBanner() {
    adminSettings.popupImg = document.getElementById('popupImgUrl').value;
    adminSettings.popupLink = document.getElementById('popupTargetUrl').value;
    localStorage.setItem('adore_admin_settings', JSON.stringify(adminSettings));
    showSuccessToast('পপআপ ব্যানার সফলভাবে সেভ করা হয়েছে!');
}

function saveAnnouncementNotice() {
    adminSettings.noticeText = document.getElementById('noticeText').value;
    adminSettings.noticeYt = document.getElementById('noticeYtUrl').value;
    localStorage.setItem('adore_admin_settings', JSON.stringify(adminSettings));
    showSuccessToast('নোটিশ ও ভিডিও সফলভাবে আপডেট করা হয়েছে!');
}

function toggleVacationMode() {
    adminSettings.vacationMode = document.getElementById('vacationModeToggle').checked;
    localStorage.setItem('adore_admin_settings', JSON.stringify(adminSettings));
    showSuccessToast(`ভ্যাকেশন মোড ${adminSettings.vacationMode ? 'চালু' : 'বন্ধ'} করা হয়েছে!`);
}

function changeAdminPassword() {
    const np = document.getElementById('newPass').value;
    const cp = document.getElementById('confirmPass').value;
    if(np && np === cp) {
        adminSettings.adminPass = np;
        localStorage.setItem('adore_admin_settings', JSON.stringify(adminSettings));
        showSuccessToast('অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
    } else {
        showCustomAlert('ত্রুটি', 'পাসওয়ার্ড মেলেনি!');
    }
}

function filterOrderTab(tab) {
    currentOrderTab = tab;
    ['Pending', 'Completed', 'Canceled'].forEach(t => {
        const btn = document.getElementById(`tab${t}`);
        if(btn) {
            if(t === tab) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });

    const list = document.getElementById('adminOrdersList');
    if(!list) return;
    const filtered = orders.filter(o => o.status === tab);
    list.innerHTML = '';

    if(filtered.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:var(--gray); padding:15px;">কোনো ${tab} অর্ডার নেই।</p>`;
        return;
    }

    filtered.forEach(o => {
        list.innerHTML += `
            <div onclick="openAdminOrderModal(${o.id})" style="background:#fafafa; padding:12px; border-radius:10px; margin-bottom:8px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; border:1px solid var(--border);">
                <div>
                    <strong>${o.name}</strong> (${o.phone})<br>
                    <span style="font-size:12px; color:var(--gray);">তারিখ: ${o.date}</span>
                </div>
                <div style="font-weight:700; color:#d32f2f;">৳ ${o.total}</div>
            </div>
        `;
    });
}

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
    showSuccessToast('নতুন প্রোডাক্ট সফলভাবে যোগ করা হয়েছে!');
    e.target.reset();
    loadAdminData();
}

function openEditProductModal(id) {
    const p = products.find(item => item.id == id);
    if(!p) return;

    let pImg = p.img1 || p.image || '';

    document.getElementById('editId').value = p.id;
    document.getElementById('editDisplayId').value = p.id;
    document.getElementById('editName').value = p.name;
    document.getElementById('editRegularPrice').value = p.regularPrice || '';
    document.getElementById('editDiscountPrice').value = p.discountPrice || p.price;
    document.getElementById('editStock').value = p.stock || 10;
    document.getElementById('editAgeVal').value = p.ageVal || '1';
    document.getElementById('editAgeUnit').value = p.ageUnit || 'Year';
    document.getElementById('editImg1').value = pImg;
    document.getElementById('editVideoUrl').value = p.videoUrl || '';
    document.getElementById('editPreviewImg').src = pImg;

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
        p.image = document.getElementById('editImg1').value;
        p.videoUrl = document.getElementById('editVideoUrl').value;

        localStorage.setItem('adore_products', JSON.stringify(products));
        closeEditProductModal();
        showSuccessToast('প্রোডাক্ট সফলভাবে এডিট হয়েছে!');
        loadAdminData();
    }
}

// Custom Delete Confirm Call
function deleteProduct(id) {
    showCustomConfirm(
        'প্রোডাক্ট ডিলিট',
        'আপনি কি নিশ্চিত যে এই প্রোডাক্টটি চিরতরে মুছে ফেলতে চান?',
        () => {
            products = products.filter(p => p.id != id);
            localStorage.setItem('adore_products', JSON.stringify(products));
            showSuccessToast('প্রোডাক্ট ডিলিট করা হয়েছে!');
            loadAdminData();
        }
    );
}

function openAdminOrderModal(orderId) {
    const order = orders.find(o => o.id == orderId);
    if(!order) return;

    const modalContent = document.getElementById('adminOrderModalContent');
    let itemsHtml = '';
    order.items.forEach(item => {
        itemsHtml += `<li>${item.name} - ${item.qty} pcs (৳ ${(item.discountPrice || item.price) * item.qty})</li>`;
    });

    modalContent.innerHTML = `
        <h3 style="margin-bottom: 10px; font-size: 18px; color: var(--primary);">অর্ডার ডিটেইলস</h3>
        <p><strong>নাম:</strong> ${order.name}</p>
        <p><strong>ফোন:</strong> ${order.phone}</p>
        <p><strong>ঠিকানা:</strong> ${order.address}</p>
        <p><strong>TrxID:</strong> ${order.trxId}</p>
        <p><strong>তারিখ:</strong> ${order.date}</p>
        <p style="margin-top: 10px;"><strong>প্রোডাক্টসমূহ:</strong></p>
        <ul style="padding-left: 20px; font-size: 13px; margin-bottom: 15px;">${itemsHtml}</ul>
        <p style="font-weight: 700; margin-bottom: 15px;">সর্বমোট: ৳ ${order.total}</p>
        
        <div style="display: flex; gap: 10px;">
            <button onclick="updateOrderStatus(${order.id}, 'Completed')" style="flex:1; background:#16a34a; color:#fff; border:none; padding:10px; border-radius:8px; font-weight:700; cursor:pointer;">কমপ্লিট করুন</button>
            <button onclick="updateOrderStatus(${order.id}, 'Canceled')" style="flex:1; background:#dc2626; color:#fff; border:none; padding:10px; border-radius:8px; font-weight:700; cursor:pointer;">ক্যানসেল করুন</button>
        </div>
    `;

    document.getElementById('adminOrderModal').classList.add('open');
    document.getElementById('adminOrderModalOverlay').style.display = 'block';
}

function closeAdminOrderModal() {
    document.getElementById('adminOrderModal').classList.remove('open');
    document.getElementById('adminOrderModalOverlay').style.display = 'none';
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id == orderId);
    if(order) {
        order.status = newStatus;
        localStorage.setItem('adore_orders', JSON.stringify(orders));
        showSuccessToast(`অর্ডার স্ট্যাটাস '${newStatus}' করা হয়েছে!`);
        closeAdminOrderModal();
        loadAdminData();
    }
}
