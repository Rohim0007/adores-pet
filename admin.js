import {
  createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


/* =========================================
   SUPABASE
========================================= */

const db = createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);


/* =========================================
   HELPERS
========================================= */

const $ = id =>
  document.getElementById(id);


let editing = null;

let oldImage = null;



/* =========================================
   INIT
========================================= */

async function init(){

  const {
    data:{
      session
    }
  } =
    await db.auth.getSession();


  show(session);

}



/* =========================================
   SHOW LOGIN / DASHBOARD
========================================= */

function show(session){

  $("loginBox")
    .classList
    .toggle(
      "hidden",
      !!session
    );


  $("dashboard")
    .classList
    .toggle(
      "hidden",
      !session
    );


  if(session){

    load();

    loadOrders();

  }

}



/* =========================================
   LOGIN
========================================= */

$("loginForm").onsubmit =
async function(e){

  e.preventDefault();


  $("loginMsg").textContent =
    "Login হচ্ছে...";


  const {
    error
  } =
    await db.auth.signInWithPassword({

      email:
        $("email").value.trim(),

      password:
        $("password").value

    });


  if(error){

    $("loginMsg").textContent =
      "❌ " + error.message;

    return;
  }


  $("loginMsg").textContent = "";

  init();

};



/* =========================================
   LOGOUT
========================================= */

$("logout").onclick =
async function(){

  await db.auth.signOut();

  init();

};



/* =========================================
   IMAGE PREVIEW
========================================= */

$("image").onchange =
function(){

  const file =
    $("image").files[0];


  if(!file){

    return;
  }


  $("preview").src =
    URL.createObjectURL(file);


  $("preview")
    .classList
    .remove("hidden");

};



/* =========================================
   CANCEL EDIT
========================================= */

$("cancel").onclick =
reset;



/* =========================================
   SEARCH
========================================= */

$("search").oninput =
load;



/* =========================================
   SAVE PRODUCT
========================================= */

$("productForm").onsubmit =
async function(e){

  e.preventDefault();


  $("msg").textContent =
    "Saving...";


  let image_url =
    oldImage;


  const file =
    $("image").files[0];


  /* ===============================
     IMAGE UPLOAD
  =============================== */

  if(file){

    const ext =
      file.name
        .split(".")
        .pop()
        .toLowerCase();


    const path =
      `${crypto.randomUUID()}.${ext}`;


    const upload =
      await db
        .storage
        .from("product-images")
        .upload(
          path,
          file,
          {
            upsert:false
          }
        );


    if(upload.error){

      $("msg").textContent =
        "❌ " +
        upload.error.message;

      return;
    }


    image_url =
      db
        .storage
        .from("product-images")
        .getPublicUrl(path)
        .data
        .publicUrl;

  }



  /* ===============================
     PRODUCT DATA
  =============================== */

  const row = {

    title:
      $("title")
        .value
        .trim(),

    category:
      $("category").value,

    price:
      Number(
        $("price").value
      ),

    stock:
      Number(
        $("stock").value
      ),

    description:
      $("description")
        .value
        .trim(),

    image_url:
      image_url

  };



  let result;


  /* ===============================
     UPDATE
  =============================== */

  if(editing){

    result =
      await db
        .from("products")
        .update(row)
        .eq(
          "id",
          editing
        );

  }


  /* ===============================
     INSERT
  =============================== */

  else{

    result =
      await db
        .from("products")
        .insert(row);

  }



  if(result.error){

    $("msg").textContent =
      "❌ " +
      result.error.message;

    return;
  }



  $("msg").textContent =
    "✅ Saved";


  reset();

  await load();

};



/* =========================================
   LOAD PRODUCTS
========================================= */

async function load(){

  const query =
    $("search")
      .value
      .toLowerCase();


  const {
    data,
    error
  } =
    await db
      .from("products")
      .select("*")
      .order(
        "created_at",
        {
          ascending:false
        }
      );


  if(error){

    $("list").textContent =
      error.message;

    return;
  }


  const filtered =
    (data || []).filter(
      function(p){

        return (
          String(p.title || "") +
          " " +
          String(p.category || "")
        )
        .toLowerCase()
        .includes(query);

      }
    );



  $("list").innerHTML =
    filtered.length

      ? filtered
          .map(productHTML)
          .join("")

      : "<p>কোনো পণ্য নেই।</p>";

}



/* =========================================
   PRODUCT HTML
========================================= */

function productHTML(p){

  const image =
    p.image_url || "";


  return `

    <div class="admin-item">

      <img
        src="${esc(image)}"
        alt=""
      >


      <div class="admin-item-info">

        <h3>
          ${esc(p.title)}
        </h3>

        <small>

          ${esc(p.category)}

          • ৳${Number(p.price || 0)
            .toLocaleString("en-BD")}

          • Stock:
          ${Number(p.stock || 0)}

        </small>


        <p>
          ${esc(p.description || "")}
        </p>

      </div>


      <div>

        <button
          class="edit"
          type="button"
          onclick="editProduct('${esc(p.id)}')"
        >
          Edit
        </button>


        <button
          class="delete"
          type="button"
          onclick="deleteProduct('${esc(p.id)}')"
        >
          Delete
        </button>

      </div>

    </div>

  `;

}



/* =========================================
   EDIT PRODUCT
========================================= */

window.editProduct =
async function(id){

  const {
    data,
    error
  } =
    await db
      .from("products")
      .select("*")
      .eq("id",id)
      .single();


  if(error){

    alert(error.message);

    return;
  }


  editing =
    data.id;


  oldImage =
    data.image_url || null;


  $("id").value =
    data.id;


  $("title").value =
    data.title || "";


  $("category").value =
    data.category || "Hamster";


  $("price").value =
    data.price || 0;


  $("stock").value =
    data.stock || 0;


  $("description").value =
    data.description || "";


  $("formTitle").textContent =
    "পণ্য Edit";


  $("cancel")
    .classList
    .remove("hidden");


  if(oldImage){

    $("preview").src =
      oldImage;

    $("preview")
      .classList
      .remove("hidden");

  }


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

};



/* =========================================
   DELETE PRODUCT
========================================= */

window.deleteProduct =
async function(id){

  if(
    !confirm(
      "এই পণ্যটি Delete করবেন?"
    )
  ){

    return;
  }


  const {
    error
  } =
    await db
      .from("products")
      .delete()
      .eq(
        "id",
        id
      );


  if(error){

    alert(
      "❌ Delete করা যায়নি: " +
      error.message
    );

    return;
  }


  alert(
    "✅ পণ্য Delete হয়েছে।"
  );


  load();

};



/* =========================================
   RESET PRODUCT FORM
========================================= */

function reset(){

  editing = null;

  oldImage = null;


  $("productForm").reset();


  $("preview")
    .classList
    .add("hidden");


  $("cancel")
    .classList
    .add("hidden");


  $("formTitle").textContent =
    "নতুন পণ্য";

}



/* =========================================
   LOAD ORDERS
========================================= */

async function loadOrders(){

  $("ordersList").innerHTML =
    "⏳ অর্ডার লোড হচ্ছে...";


  const {
    data,
    error
  } =
    await db
      .from("orders")
      .select("*")
      .order(
        "created_at",
        {
          ascending:false
        }
      );


  if(error){

    $("ordersList").innerHTML =
      `
        <p style="color:#c62828">
          ❌ অর্ডার লোড করা যায়নি:
          ${esc(error.message)}
        </p>
      `;

    return;
  }


  if(!data || !data.length){

    $("ordersList").innerHTML =
      "<p>📦 এখনো কোনো অর্ডার নেই।</p>";

    return;
  }


  $("ordersList").innerHTML =
    data
      .map(orderHTML)
      .join("");

}



/* =========================================
   ORDER HTML
========================================= */

function orderHTML(order){

  let items = [];


  try{

    if(
      Array.isArray(order.items)
    ){

      items =
        order.items;

    }

    else if(
      typeof order.items === "string"
    ){

      items =
        JSON.parse(order.items);

    }

  }

  catch(e){

    items = [];

  }



  const status =
    String(
      order.status || "pending"
    )
    .toLowerCase();


  let statusClass = "";


  if(status === "completed"){

    statusClass =
      "completed";

  }

  else if(status === "cancelled"){

    statusClass =
      "cancelled";

  }



  const itemsHTML =
    items.length

      ? items.map(
          function(item){

            return `

              <div>

                🐰
                ${esc(item.title || "Product")}

                ×
                ${Number(item.quantity || 0)}

                =
                ৳${(
                  Number(item.price || 0) *
                  Number(item.quantity || 0)
                ).toLocaleString("en-BD")}

              </div>

            `;

          }
        ).join("")

      : "পণ্যের তথ্য নেই";



  const created =
    order.created_at
      ? new Date(
          order.created_at
        ).toLocaleString(
          "bn-BD"
        )
      : "";



  return `

    <div class="order-card">


      <div class="order-top">

        <div>

          <h3>
            📦 Order
          </h3>

          <div class="order-id">

            ID:
            ${esc(order.id)}

          </div>

          <small>
            ${esc(created)}
          </small>

        </div>


        <span
          class="status ${statusClass}"
        >

          ${
            status === "completed"
              ? "Completed"
              : status === "cancelled"
                ? "Cancelled"
                : "Pending"
          }

        </span>

      </div>



      <div class="order-info">

        <strong>
          👤 ${esc(order.customer_name || "")}
        </strong>

        <br>

        📞 ${esc(order.phone || "")}

        <br>

        📍 ${esc(order.district || "")}

        <br>

        🏠 ${esc(order.address || "")}

      </div>



      <div class="order-items">

        <strong>
          🛒 পণ্য:
        </strong>

        <br><br>

        ${itemsHTML}

      </div>



      <div class="order-info">

        পণ্যের মূল্য:
        <strong>
          ৳${Number(order.subtotal || 0)
            .toLocaleString("en-BD")}
        </strong>

        <br>

        Delivery:
        <strong>
          ৳${Number(order.delivery_charge || 0)
            .toLocaleString("en-BD")}
        </strong>

        <br>

        <strong
          style="font-size:20px"
        >
          মোট:
          ৳${Number(
            order.total_amount || 0
          ).toLocaleString("en-BD")}
        </strong>

      </div>



      <div class="order-actions">


        ${
          status !== "completed"
            ? `
              <button
                class="complete-btn"
                type="button"
                onclick="updateOrderStatus('${esc(order.id)}','completed')"
              >
                ✅ Completed
              </button>
            `
            : ""
        }



        ${
          status !== "cancelled"
            ? `
              <button
                class="cancel-btn"
                type="button"
                onclick="updateOrderStatus('${esc(order.id)}','cancelled')"
              >
                ❌ Cancel
              </button>
            `
            : ""
        }



        <button
          class="delete-order"
          type="button"
          onclick="deleteOrder('${esc(order.id)}')"
        >
          🗑 Delete Order
        </button>


      </div>


    </div>

  `;

}



/* =========================================
   UPDATE ORDER STATUS
========================================= */

window.updateOrderStatus =
async function(id,status){

  const {
    error
  } =
    await db
      .from("orders")
      .update({
        status:status
      })
      .eq(
        "id",
        id
      );


  if(error){

    alert(
      "❌ Status পরিবর্তন করা যায়নি: " +
      error.message
    );

    return;
  }


  loadOrders();

};



/* =========================================
   DELETE ORDER
========================================= */

window.deleteOrder =
async function(id){

  if(
    !confirm(
      "এই Order Delete করবেন?"
    )
  ){

    return;
  }


  const {
    error
  } =
    await db
      .from("orders")
      .delete()
      .eq(
        "id",
        id
      );


  if(error){

    alert(
      "❌ Order Delete করা যায়নি: " +
      error.message
    );

    return;
  }


  alert(
    "✅ Order Delete হয়েছে।"
  );


  loadOrders();

};



/* =========================================
   REFRESH ORDERS
========================================= */

$("refreshOrders").onclick =
function(){

  loadOrders();

};



/* =========================================
   ESCAPE HTML
========================================= */

function esc(value){

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,

    function(m){

      return {
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#039;"
      }[m];

    }
  );

}



/* =========================================
   START
========================================= */

init();
