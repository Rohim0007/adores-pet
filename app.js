import {
  createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


const ready =
  window.SUPABASE_URL &&
  window.SUPABASE_URL.startsWith("http") &&
  window.SUPABASE_ANON_KEY &&
  window.SUPABASE_ANON_KEY.length > 20;


const db = ready
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


document.getElementById("year").textContent =
  new Date().getFullYear();


function esc(value){

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


/* PRODUCTS */

function productCard(p){

  const stock =
    Number(p.stock || 0);

  const image =
    p.image_url ||
    "https://images.unsplash.com/photo-1583301286816-f4f05e1f8b2d?auto=format&fit=crop&w=800&q=80";


  return `

  <article class="card">

    <img
      src="${esc(image)}"
      alt="${esc(p.title)}"
    >

    <div class="body">

      <small>
        ${esc(p.category)}
      </small>

      <h3>
        ${esc(p.title)}
      </h3>

      <p>
        ${esc(p.description || "")}
      </p>

      <b>
        ৳${Number(p.price || 0).toLocaleString("en-BD")}
      </b>

      <div class="${stock > 0 ? "in" : "out"}">
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


async function loadProducts(){

  if(!db){

    grid.innerHTML =
      "<p>Supabase config.js সেটআপ করা হয়নি।</p>";

    return;
  }


  const {
    data,
    error
  } =
    await db
      .from("products")
      .select("*")
      .order(
        "created_at",
        {ascending:false}
      );


  if(error){

    console.error(error);

    grid.innerHTML =
      "<p>পণ্য লোড করা যায়নি।</p>";

    return;
  }


  products = data || [];


  renderProducts(products);

}


function renderProducts(list){

  grid.innerHTML =
    list.length
    ? list.map(productCard).join("")
    : "<p>এই ক্যাটাগরিতে কোনো পণ্য নেই।</p>";

}


window.filterCategory =
function(category){

  const filtered =
    products.filter(
      p =>
        String(p.category)
          .toLowerCase()
          === category.toLowerCase()
    );

  renderProducts(filtered);

  document
    .getElementById("products")
    .scrollIntoView({
      behavior:"smooth"
    });

};


window.showAllProducts =
function(){

  renderProducts(products);

};


/* CART */

function saveCart(){

  localStorage.setItem(
    "adore_pet_cart",
    JSON.stringify(cart)
  );

  updateCartCount();

}


function updateCartCount(){

  const count =
    cart.reduce(
      (sum,item) =>
        sum + Number(item.qty || 0),
      0
    );


  document.getElementById(
    "cartCount"
  ).textContent = count;

}


window.addToCart =
function(id){

  const product =
    products.find(
      p => String(p.id) === String(id)
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
        String(item.id) === String(id)
    );


  if(existing){

    if(existing.qty >= stock){

      alert(
        "স্টকের চেয়ে বেশি নেওয়া যাবে না।"
      );

      return;
    }

    existing.qty++;

  }else{

    cart.push({

      id:product.id,

      title:product.title,

      price:Number(product.price || 0),

      image_url:product.image_url || "",

      stock:stock,

      qty:1

    });

  }


  saveCart();

  renderCart();

  alert("পণ্য Cart-এ যোগ হয়েছে।");

};


window.removeFromCart =
function(id){

  cart =
    cart.filter(
      item =>
        String(item.id) !== String(id)
    );

  saveCart();

  renderCart();

};


window.changeQty =
function(id,change){

  const item =
    cart.find(
      x =>
        String(x.id) === String(id)
    );


  if(!item) return;


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


  item.qty = newQty;

  saveCart();

  renderCart();

};


function getSubtotal(){

  return cart.reduce(
    (sum,item) =>
      sum +
      Number(item.price) *
      Number(item.qty),
    0
  );

}


function getDeliveryCharge(){

  return Number(
    document.getElementById(
      "deliveryCharge"
    ).value || 0
  );

}


function updateCheckoutTotal(){

  const total =
    getSubtotal() +
    getDeliveryCharge();


  document.getElementById(
    "checkoutTotal"
  ).textContent =
    "মোট: ৳" +
    total.toLocaleString("en-BD");

}


function renderCart(){

  const box =
    document.getElementById("cartItems");

  const summary =
    document.getElementById("cartSummary");


  if(!cart.length){

    box.innerHTML = `
      <div class="empty-cart">
        🛒 Cart এখন খালি।
      </div>
    `;

    summary.innerHTML = "";

    updateCheckoutTotal();

    return;

  }


  box.innerHTML =
    cart.map(item => `

      <div class="cart-item">

        <img
          src="${esc(item.image_url)}"
        >

        <div class="cart-info">

          <h4>
            ${esc(item.title)}
          </h4>

          <div>
            ৳${Number(item.price)
              .toLocaleString("en-BD")}
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

    `).join("");


  summary.innerHTML = `
    <div class="cart-total">
      পণ্যের মূল্য:
      ৳${getSubtotal().toLocaleString("en-BD")}
    </div>
  `;


  updateCheckoutTotal();

}


window.openCart =
function(){

  document.getElementById(
    "cartPanel"
  ).style.display = "block";

  renderCart();

};


window.closeCart =
function(){

  document.getElementById(
    "cartPanel"
  ).style.display = "none";

};


document.getElementById(
  "deliveryCharge"
).addEventListener(
  "change",
  updateCheckoutTotal
);


/* ORDER */

window.placeOrder =
async function(){

  const msg =
    document.getElementById("orderMsg");


  msg.textContent = "";


  if(!cart.length){

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


  if(!name ||
     !phone ||
     !district ||
     !address){

    msg.textContent =
      "❌ সব তথ্য পূরণ করুন।";

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


  const items =
    cart.map(item => ({

      product_id:item.id,

      title:item.title,

      price:item.price,

      quantity:item.qty

    }));


  msg.textContent =
    "⏳ অর্ডার পাঠানো হচ্ছে...";


  const {
    data,
    error
  } =
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

        items:items,

        status:"pending"

      })
      .select()
      .single();


  if(error){

    console.error(error);

    msg.textContent =
      "❌ অর্ডার করা যায়নি: " +
      error.message;

    return;
  }


  msg.innerHTML = `
    <span style="color:#176b3a">
      ✅ অর্ডার সফল হয়েছে!
      <br><br>
      Order ID: ${esc(data.id)}
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


updateCartCount();

loadProducts();
