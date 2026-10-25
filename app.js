/* =====================================================
   ADORE'S PET - APP.JS
===================================================== */
let cart = JSON.parse(localStorage.getItem("adore_cart") || "[]");
let currentCategory = 'All';

document.addEventListener("DOMContentLoaded", () => {
    renderShopProducts();
    updateCartCount();
    setupAdminTrigger();
});

function renderShopProducts(filterCat = 'All', searchQuery = ''){
    currentCategory = filterCat;
    const container = document.getElementById("shopProductsContainer");
    if(!container) return;
    container.innerHTML = "";

    let filtered = products;
    if(filterCat !== 'All') filtered = filtered.filter(p => (p.category || '').toLowerCase() === filterCat.toLowerCase());
    if(searchQuery.trim() !== '') filtered = filtered.filter(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

    if(filtered.length === 0){
        container.innerHTML = `<p style="text-align:center; color:#64748b; padding:30px; grid-column: 1 / -1;">কোনো প্রোডাক্ট পাওয়া যায়নি।</p>`;
        return;
    }

    filtered.forEach(p => {
        const price = (p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price) ? p.discountPrice : p.price;
        const hasDiscount = p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price;

        const card = document.createElement("div");
        card.style.cssText = "background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:10px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 2px 8px rgba(0,0,0,0.02);";
        card.innerHTML = `
            <div>
                <div style="position:relative; width:100%; height:130px; border-radius:8px; overflow:hidden; background:#f1f5f9; margin-bottom:8px;">
                    <img src="${p.image || ''}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://via.placeholder.com/300'">
                    ${hasDiscount ? `<span style="position:absolute; top:6px; left:6px; background:#ef4444; color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">ছাড়</span>` : ''}
                </div>
                <h4 style="font-size:13px; font-weight:800; color:#1e293b; margin-bottom:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${p.name}</h4>
                <div style="font-size:11.5px; color:#64748b; margin-bottom:8px;">স্টক: <b>${p.stock} টি</b></div>
            </div>
            <div>
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px;">
                    <span style="font-size:14px; font-weight:900; color:#00897b;">৳${price}</span>
                    ${hasDiscount ? `<span style="font-size:11px; color:#94a3b8; text-decoration:line-through;">৳${p.price}</span>` : ''}
                </div>
                <button onclick="addToCart('${p.id}')" style="width:100%; background:#00897b; color:#fff; border:none; padding:8px; border-radius:8px; font-size:12px; font-weight:800; cursor:pointer;"><i class="fa-solid fa-cart-plus"></i> কার্টে যোগ করুন</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterCategory(cat){ renderShopProducts(cat); }
function searchProducts(input){ renderShopProducts(currentCategory, input.value); }

function addToCart(productId){
    const p = products.find(x => String(x.id) === String(productId));
    if(!p || p.stock <= 0) { alert("স্টকআউট!"); return; }
    let existing = cart.find(x => String(x.id) === String(productId));
    if(existing) { if(existing.qty < p.stock) existing.qty++; else { alert("স্টক শেষ!"); return; } }
    else { cart.push({ id: p.id, qty: 1 }); }
    localStorage.setItem("adore_cart", JSON.stringify(cart));
    updateCartCount();
    alert("কার্টে যোগ করা হয়েছে! ✅");
}

function updateCartCount(){
    const badge = document.getElementById("cartCountBadge");
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if(badge){ badge.innerText = totalQty; badge.style.display = totalQty > 0 ? "inline-block" : "none"; }
}

function openCartModal(){ renderCartItems(); document.getElementById("cartModal").classList.add("show"); }
function closeCartModal(){ document.getElementById("cartModal").classList.remove("show"); }

function renderCartItems(){
    const container = document.getElementById("cartItemsList");
    const subtotalElem = document.getElementById("cartSubtotalText");
    if(!container) return;
    container.innerHTML = "";
    let subtotal = 0;

    if(cart.length === 0){ container.innerHTML = `<p style="text-align:center; color:#64748b; padding:20px;">কার্ট খালি।</p>`; if(subtotalElem) subtotalElem.innerText = "0"; return; }

    cart.forEach(item => {
        const p = products.find(x => String(x.id) === String(item.id));
        if(p){
            const price = (p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price) ? p.discountPrice : p.price;
            subtotal += price * item.qty;
            const div = document.createElement("div");
            div.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:10px; margin-bottom:8px;";
            div.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="${p.image || ''}" style="width:40px; height:40px; object-fit:cover; border-radius:6px;">
                    <div><h4 style="font-size:12px; font-weight:800; color:#1e293b; margin:0;">${p.name}</h4><span style="font-size:11px; color:#00897b; font-weight:700;">৳${price} x ${item.qty}</span></div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <button onclick="changeQty('${p.id}', 1)" style="width:24px; height:24px; font-weight:bold; cursor:pointer;">+</button>
                    <button onclick="changeQty('${p.id}', -1)" style="width:24px; height:24px; font-weight:bold; cursor:pointer;">-</button>
                    <button onclick="removeFromCart('${p.id}')" style="background:#fee2e2; color:#dc2626; border:none; width:24px; height:24px; border-radius:4px; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                </div>`;
            container.appendChild(div);
        }
    });
    if(subtotalElem) subtotalElem.innerText = subtotal;
}

function changeQty(id, delta){
    let item = cart.find(x => String(x.id) === String(id));
    let p = products.find(x => String(x.id) === String(id));
    if(item && p){
        item.qty += delta;
        if(item.qty <= 0) cart = cart.filter(x => String(x.id) !== String(id));
        else if(item.qty > p.stock) item.qty = p.stock;
        localStorage.setItem("adore_cart", JSON.stringify(cart));
        updateCartCount(); renderCartItems();
    }
}

function removeFromCart(id){
    cart = cart.filter(x => String(x.id) !== String(id));
    localStorage.setItem("adore_cart", JSON.stringify(cart));
    updateCartCount(); renderCartItems();
}

function proceedToCheckout(){
    if(!cart || cart.length === 0){ alert("কার্ট খালি!"); return; }
    window.location.href = "checkout.html";
}

// Orders & Voucher Functions
function openOrdersModal(){ renderUserOrders(); document.getElementById("ordersModal").classList.add("show"); }
function closeOrdersModal(){ document.getElementById("ordersModal").classList.remove("show"); }

function renderUserOrders(){
    const list = document.getElementById("userOrdersList");
    if(!list) return;
    const orders = JSON.parse(localStorage.getItem("adore_orders") || "[]");
    list.innerHTML = "";
    if(orders.length === 0){ list.innerHTML = `<p style="text-align:center; color:#64748b; padding:20px;">কোনো অর্ডার নেই।</p>`; return; }

    orders.forEach(ord => {
        const div = document.createElement("div");
        div.style.cssText = "background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px; margin-bottom:12px; font-size:12px;";
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-weight:900; color:#00897b; margin-bottom:6px;">
                <span>${ord.orderId}</span><span>${ord.status || 'Pending'}</span>
            </div>
            <div style="color:#475569; margin-bottom:6px;">তারিখ: ${ord.date}<br>গ্রাহক: ${ord.customerName} (${ord.customerPhone})</div>
            <div style="font-weight:800; border-top:1px dashed #cbd5e1; padding-top:6px; display:flex; justify-content:space-between; align-items:center;">
                <span>সর্বমোট: ৳${ord.total}</span>
                <button onclick="viewVoucher('${ord.orderId}')" style="background:#00897b; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:11.5px; font-weight:800;">ভাউচার দেখুন</button>
            </div>`;
        list.appendChild(div);
    });
}

function viewVoucher(orderId){
    const orders = JSON.parse(localStorage.getItem("adore_orders") || "[]");
    const ord = orders.find(x => x.orderId === orderId);
    if(!ord) return;

    document.getElementById("voucherCustomerInfo").innerHTML = `
        <b>Order ID:</b> ${ord.orderId}<br>
        <b>Date:</b> ${ord.date}<br>
        <b>Name:</b> ${ord.customerName}<br>
        <b>Phone:</b> ${ord.customerPhone}<br>
        <b>Address:</b> ${ord.address}<br>
        <b>TrxID:</b> ${ord.trxId}
    `;
    
    const tbody = document.getElementById("voucherTableBody");
    tbody.innerHTML = "";
    ord.items.forEach(it => {
        const p = products.find(x => String(x.id) === String(it.id));
        const price = p ? ((p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price) ? p.discountPrice : p.price) : 0;
        tbody.innerHTML += `
            <tr>
                <td style="padding:8px; border-bottom:1px solid #f1f5f9; font-size:12px;">${p ? p.name : 'Product'}</td>
                <td style="padding:8px; text-align:center; border-bottom:1px solid #f1f5f9; font-size:12px;">${it.qty}</td>
                <td style="padding:8px; text-align:right; border-bottom:1px solid #f1f5f9; font-size:12px;">৳${price * it.qty}</td>
            </tr>`;
    });

    document.getElementById("voucherTotalsBox").innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Subtotal:</span> <b>৳${ord.subtotal}</b></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Delivery Charge:</span> <b>৳${ord.delivery}</b></div>
        <div style="display:flex; justify-content:space-between; border-top:1px dashed #cbd5e1; padding-top:6px; font-weight:900; color:#00897b; font-size:14px;"><span>Total:</span> <span>৳${ord.total}</span></div>
        ${ord.advancePaid ? `<div style="display:flex; justify-content:space-between; color:#b45309; font-weight:800; margin-top:4px;"><span>50% Advance Paid:</span> <span>৳${ord.advancePaid}</span></div>` : ''}
    `;

    closeOrdersModal();
    document.getElementById("voucherModal").classList.add("show");
}

function closeVoucherModal(){ document.getElementById("voucherModal").classList.remove("show"); }

// Admin Panel Trigger
function setupAdminTrigger(){
    let clickCount = 0;
    const brand = document.querySelector(".brand-box");
    if(brand){
        brand.addEventListener("click", () => {
            clickCount++;
            if(clickCount >= 5){ clickCount = 0; openAdminModal(); }
        });
    }
}

function openAdminModal(){
    document.getElementById("adminModal").classList.add("show");
    renderAdminProducts();
    renderAdminOrders();
}
function closeAdminModal(){ document.getElementById("adminModal").classList.remove("show"); }

function renderAdminProducts(){
    const container = document.getElementById("adminProductsList");
    if(!container) return;
    container.innerHTML = "";
    products.forEach(p => {
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #e2e8f0; padding:8px; border-radius:8px; margin-bottom:6px; font-size:12px;">
                <span><b>${p.name}</b> (৳${p.price})</span>
                <button onclick="deleteProduct('${p.id}')" style="background:#fee2e2; color:#dc2626; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
            </div>`;
    });
}

function saveAdminProduct(e){
    e.preventDefault();
    const name = document.getElementById("editProductName").value;
    const price = Number(document.getElementById("editProductPrice").value);
    const discountPrice = Number(document.getElementById("editProductDiscount").value) || 0;
    const stock = Number(document.getElementById("editProductStock").value);
    const category = document.getElementById("editProductCategory").value;
    const image = document.getElementById("editProductImage").value;

    const newP = { id: Date.now().toString(), name, price, discountPrice, stock, category, image: image || "https://via.placeholder.com/300" };
    products.unshift(newP);
    localStorage.setItem("adore_products", JSON.stringify(products));
    renderAdminProducts(); renderShopProducts();
    document.getElementById("adminProductForm").reset();
    alert("প্রোডাক্ট সফলভাবে সেভ হয়েছে! ✅");
}

function deleteProduct(id){
    if(!confirm("ডিলিট করতে চান?")) return;
    products = products.filter(x => String(x.id) !== String(id));
    localStorage.setItem("adore_products", JSON.stringify(products));
    renderAdminProducts(); renderShopProducts();
}

function renderAdminOrders(){
    const container = document.getElementById("adminOrdersList");
    if(!container) return;
    const orders = JSON.parse(localStorage.getItem("adore_orders") || "[]");
    container.innerHTML = "";
    if(orders.length === 0){ container.innerHTML = `<p style="text-align:center; color:#64748b; padding:10px;">কোনো অর্ডার নেই।</p>`; return; }

    orders.forEach(ord => {
        container.innerHTML += `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:8px; border-radius:8px; margin-bottom:8px; font-size:11.5px;">
                <div style="font-weight:900; color:#00897b;">${ord.orderId} (${ord.status || 'Pending'}) - ৳${ord.total}</div>
                <div>গ্রাহক: ${ord.customerName} | TrxID: <b>${ord.trxId}</b></div>
                <button onclick="deleteOrder('${ord.orderId}')" style="background:#64748b; color:#fff; border:none; padding:3px 6px; border-radius:4px; margin-top:4px; cursor:pointer;">ডিলিট</button>
            </div>`;
    });
}

function deleteOrder(orderId){
    if(!confirm("অর্ডার মুছতে চান?")) return;
    let orders = JSON.parse(localStorage.getItem("adore_orders") || "[]");
    orders = orders.filter(x => x.orderId !== orderId);
    localStorage.setItem("adore_orders", JSON.stringify(orders));
    renderAdminOrders();
}
