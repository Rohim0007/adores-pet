import {
  createClient
}
from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


const ready =
window.SUPABASE_URL &&
window.SUPABASE_URL.startsWith("http") &&
window.SUPABASE_ANON_KEY &&
window.SUPABASE_ANON_KEY.length > 20;


const db =
ready
? createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
  )
: null;


let products = [];

let cart =
JSON.parse(
  localStorage.getItem("adore_pet_cart") || "[]"
);


const grid =
document.getElementById("grid");


/* ================= ESCAPE ================= */

function escapeHtml(value){

  return String(value ?? "").replace(
    /[&<>"']/g,

    m => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[m])
  );

}


/* ================= PRODUCT CARD ================= */

function productCard(p){

  const image =
    p.image_url ||
    "https://images.unsplash.com/photo-1583301286816-f4f05e1f8b2d?auto=format&fit=crop&w=800&q=80";


  const stock =
    Number(p.stock || 0);


  return `

  <article class="card">

    <img
      src="${escapeHtml(image)}"
      alt="${escapeHtml(p.title)}"
    >


    <div class="body">

      <small>
        ${escapeHtml(p.category || "")}
      </small>


      <h3>
        ${escapeHtml(p.title)}
      </h3>


      <p>
        ${escapeHtml(p.description || "")}
      </p>


      <b>
        ৳${Number(p.price || 0).toLocaleString("en-BD")}
      </b>


      <div
        class="${stock > 0 ? "in" : "out"}"
      >

        ${
          stock > 0
          ? "স্টকে আছে: " + stock
          : "স্টক শেষ"
        }

      </div>


      <div class="product-actions">

        <button
          class="add-cart"
          ${stock <= 0 ? "disabled" : ""}
          onclick="addToCart('${p.id}')"
        >

          ${
            stock > 0
            ? "🛒 Cart-এ যোগ করুন"
            : "স্টক শেষ"
          }

        </button>

      </div>

    </div>

  </article>

  `;

}


/* ================= LOAD PRODUCTS ================= */

async function loadProducts(){

  if(!db){

    if(grid)
    grid.innerHTML =
    "<p>Supabase config.js ঠিক করুন।</p>";

    return;
  }


  const result =
  await db
  .from("products")
  .select("*")
  .order(
    "created_at",
    {
      ascending:false
    }
  );


  if(result.error){

    console.error(result.error);

    if(grid)
    grid.innerHTML =
    "<p>পণ্য লোড করা যায়নি।</p>";

    return;
  }


  products =
  result.data || [];


  /*
    category.html হলে
    শুধু নির্বাচিত category দেখাবে।
  */

  const params =
  new URLSearchParams(
    location.search
  );


  const selectedCategory =
  params.get("cat");


  if(selectedCategory){

    products =
    products.filter(
      p =>
      String(p.category || "")
      .trim()
      .toLowerCase()
      ===
      String(selectedCategory)
      .trim()
      .toLowerCase()
    );

  }


  if(grid){

    grid.innerHTML =
    products.length

    ? products
      .map(productCard)
      .join("")

    : "<p>এই ক্যাটাগরিতে এখন কোনো পণ্য নেই।</p>";

  }

}


/* ================= CART SAVE ================= */

function saveCart(){

  localStorage.setItem(
    "adore_pet_cart",
    JSON.stringify(cart)
  );

  updateCartCount();

}


function updateCartCount(){

  const element =
  document.getElementById(
    "cartCount"
  );


  if(!element)
  return;


  const count =
  cart.reduce(
    (total,item) =>
    total + Number(item.qty || 0),
    0
  );


  element.textContent =
  count;

}


/* ================= ADD CART ================= */

window.addToCart =
function(id){

  const product =
  products.find(
    p =>
    String(p.id)
    ===
    String(id)
  );


  if(!product){

    alert("পণ্য পাওয়া যায়নি।");

    return;
  }


  const stock =
  Number(product.stock || 0);


  const existing =
  cart.find(
    item =>
    String(item.id)
    ===
    String(id)
  );


  if(existing){

    if(existing.qty >= stock){

      alert(
        "স্টকের চেয়ে বেশি নেওয়া যাবে না।"
      );

      return;
    }


    existing.qty++;

  }

  else{

    cart.push({

      id:product.id,

      title:product.title,

      price:Number(
        product.price || 0
      ),

      image_url:
      product.image_url || "",

      stock:stock,

      qty:1

    });

  }


  saveCart();

  renderCart();

};


/* ================= REMOVE ================= */

window.removeFromCart =
function(id){

  cart =
  cart.filter(
    item =>
    String(item.id)
    !==
    String(id)
  );


  saveCart();

  renderCart();

};


/* ================= QUANTITY ================= */

window.changeQty =
function(id,change){

  const item =
  cart.find(
    x =>
    String(x.id)
    ===
    String(id)
  );


  if(!item)
  return;


  const newQty =
  item.qty + change;


  if(newQty <= 0){

    removeFromCart(id);

    return;

  }


  if(newQty > item.stock){

    alert(
      "স্টকের চেয়ে বেশি নেওয়া যাবে না।"
    );

    return;

  }


  item.qty =
  newQty;


  saveCart();

  renderCart();

};


/* ================= SUBTOTAL ================= */

function getSubtotal(){

  return cart.reduce(
    (total,item) =>
    total +
    Number(item.price) *
    Number(item.qty),
    0
  );

}


/* ================= DELIVERY ================= */

function getDeliveryCharge(){

  const element =
  document.getElementById(
    "deliveryCharge"
  );


  return element
  ? Number(element.value || 0)
  : 0;

}


/* ================= TOTAL ================= */

function updateCheckoutTotal(){

  const element =
  document.getElementById(
    "checkoutTotal"
  );


  if(!element)
  return;


  const total =
  getSubtotal()
  +
  getDeliveryCharge();


  element.textContent =
  `মোট: ৳${total.toLocaleString("en-BD")}`;

}


/* ================= CART UI ================= */

function renderCart(){

  const items =
  document.getElementById(
    "cartItems"
  );


  const summary =
  document.getElementById(
    "cartSummary"
  );


  if(!items)
  return;


  if(!cart.length){

    items.innerHTML = `

      <div
        style="
        text-align:center;
        padding:30px;
        color:#777;
        "
      >

        🛒 Cart এখন খালি।

      </div>

    `;

    if(summary)
    summary.innerHTML = "";

    updateCheckoutTotal();

    return;

  }


  items.innerHTML =
  cart.map(
    item => `

    <div class="cart-item">

      <img
        src="${escapeHtml(
          item.image_url ||
          "https://images.unsplash.com/photo-1583301286816-f4f05e1f8b2d?auto=format&fit=crop&w=300&q=80"
        )}"
      >


      <div class="cart-info">

        <h4>
          ${escapeHtml(item.title)}
        </h4>

        <div>
          ৳${Number(item.price).toLocaleString("en-BD")}
        </div>


        <div class="qty">

          <button
            onclick="changeQty('${item.id}',-1)"
          >
            −
          </button>

          <strong>
            ${item.qty}
          </strong>

          <button
            onclick="changeQty('${item.id}',1)"
          >
            +
          </button>

        </div>

      </div>


      <button
        class="remove-item"
        onclick="removeFromCart('${item.id}')"
      >
        Delete
      </button>

    </div>

    `
  ).join("");


  if(summary){

    summary.innerHTML = `

      <div class="checkout-total">

        পণ্যের মূল্য:
        ৳${getSubtotal().toLocaleString("en-BD")}

      </div>

    `;

  }


  updateCheckoutTotal();

}


/* ================= OPEN / CLOSE ================= */

window.openCart =
function(){

  const panel =
  document.getElementById(
    "cartPanel"
  );


  if(panel){

    panel.style.display =
    "block";

    renderCart();

  }

};


window.closeCart =
function(){

  const panel =
  document.getElementById(
    "cartPanel"
  );


  if(panel){

    panel.style.display =
    "none";

  }

};


/* ================= ORDER ================= */

window.placeOrder =
async function(){

  const msg =
  document.getElementById(
    "orderMsg"
  );


  if(msg)
  msg.textContent = "";


  if(!cart.length){

    if(msg)
    msg.textContent =
    "❌ Cart খালি।";

    return;
  }


  const name =
  document.getElementById(
    "customerName"
  ).value.trim();


  const phone =
  document.getElementById(
    "customerPhone"
  ).value.trim();


  const district =
  document.getElementById(
    "customerDistrict"
  ).value;


  const address =
  document.getElementById(
    "customerAddress"
  ).value.trim();


  if(!name){

    msg.textContent =
    "❌ আপনার নাম লিখুন।";

    return;
  }


  if(!phone){

    msg.textContent =
    "❌ মোবাইল নম্বর দিন।";

    return;
  }


  if(!district){

    msg.textContent =
    "❌ জেলা নির্বাচন করুন।";

    return;
  }


  if(!address){

    msg.textContent =
    "❌ সম্পূর্ণ ঠিকানা লিখুন।";

    return;
  }


  if(!db){

    msg.textContent =
    "❌ Supabase সংযোগ পাওয়া যায়নি।";

    return;
  }


  const subtotal =
  getSubtotal();


  const delivery =
  getDeliveryCharge();


  const total =
  subtotal + delivery;


  const orderItems =
  cart.map(
    item => ({

      product_id:item.id,

      title:item.title,

      price:item.price,

      quantity:item.qty

    })
  );


  msg.textContent =
  "⏳ অর্ডার পাঠানো হচ্ছে...";


  const result =
  await db
  .from("orders")
  .insert({

    customer_name:name,

    phone:phone,

    district:district,

    address:address,

    delivery_charge:delivery,

    subtotal:subtotal,

    total_amount:total,

    items:orderItems,

    status:"pending"

  })
  .select()
  .single();


  if(result.error){

    console.error(result.error);

    msg.textContent =
    "❌ অর্ডার করা যায়নি: "
    +
    result.error.message;

    return;

  }


  msg.innerHTML = `

    <span style="color:#176b3a">

      ✅ অর্ডার সফল হয়েছে!

      <br>

      Order ID:
      ${escapeHtml(result.data.id)}

    </span>

  `;


  cart = [];

  saveCart();

  renderCart();


  document.getElementById(
    "customerName"
  ).value = "";

  document.getElementById(
    "customerPhone"
  ).value = "";

  document.getElementById(
    "customerDistrict"
  ).value = "";

  document.getElementById(
    "customerAddress"
  ).value = "";


  alert(
    "আপনার অর্ডার সফলভাবে নেওয়া হয়েছে।"
  );

};


/* ================= DELIVERY CHANGE ================= */

const deliveryElement =
document.getElementById(
  "deliveryCharge"
);


if(deliveryElement){

  deliveryElement.addEventListener(
    "change",
    updateCheckoutTotal
  );

}


/* ================= START ================= */

updateCartCount();

renderCart();

loadProducts();
