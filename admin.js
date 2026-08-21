// =====================================================
// ADORE'S PET — ADMIN.JS
// Login + Product Upload + Image Upload + Edit + Delete
// =====================================================

import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


// =====================================================
// SUPABASE
// =====================================================

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// =====================================================
// ELEMENTS
// =====================================================

const loginBox =
  document.getElementById("loginBox");

const dashboard =
  document.getElementById("dashboard");

const loginForm =
  document.getElementById("loginForm");

const loginMsg =
  document.getElementById("loginMsg");

const logoutBtn =
  document.getElementById("logout");

const productForm =
  document.getElementById("productForm");

const idInput =
  document.getElementById("id");

const titleInput =
  document.getElementById("title");

const categoryInput =
  document.getElementById("category");

const priceInput =
  document.getElementById("price");

const stockInput =
  document.getElementById("stock");

const imageInput =
  document.getElementById("image");

const descriptionInput =
  document.getElementById("description");

const preview =
  document.getElementById("preview");

const formTitle =
  document.getElementById("formTitle");

const msg =
  document.getElementById("msg");

const cancelBtn =
  document.getElementById("cancel");

const list =
  document.getElementById("list");

const searchInput =
  document.getElementById("search");

const ordersList =
  document.getElementById("ordersList");

const refreshOrders =
  document.getElementById("refreshOrders");


// =====================================================
// VARIABLES
// =====================================================

let products = [];

let editingId = null;

let selectedImageFile = null;


// =====================================================
// LOGIN
// =====================================================

loginForm.addEventListener(
  "submit",
  async function (e) {

    e.preventDefault();

    loginMsg.textContent =
      "⏳ Login হচ্ছে...";


    const email =
      document
        .getElementById("email")
        .value
        .trim();

    const password =
      document
        .getElementById("password")
        .value;


    const {
      data,
      error
    } =
      await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });


    if (error) {

      loginMsg.textContent =
        "❌ " + error.message;

      return;
    }


    if (!data.user) {

      loginMsg.textContent =
        "❌ Login করা যায়নি।";

      return;
    }


    loginMsg.textContent =
      "✅ Login সফল হয়েছে।";

    showDashboard();

  }
);


// =====================================================
// CHECK LOGIN
// =====================================================

async function checkLogin() {

  const {
    data: {
      session
    }
  } =
    await supabase.auth.getSession();


  if (session) {

    showDashboard();

  } else {

    showLogin();

  }

}


// =====================================================
// SHOW LOGIN
// =====================================================

function showLogin() {

  loginBox.classList.remove(
    "hidden"
  );

  dashboard.classList.add(
    "hidden"
  );

}


// =====================================================
// SHOW DASHBOARD
// =====================================================

function showDashboard() {

  loginBox.classList.add(
    "hidden"
  );

  dashboard.classList.remove(
    "hidden"
  );


  loadProducts();

  loadOrders();

}


// =====================================================
// LOGOUT
// =====================================================

logoutBtn.addEventListener(
  "click",
  async function () {

    await supabase.auth.signOut();

    showLogin();

  }
);


// =====================================================
// IMAGE SELECT
// =====================================================

imageInput.addEventListener(
  "change",
  function () {

    selectedImageFile =
      imageInput.files[0] || null;


    if (!selectedImageFile) {

      return;

    }


    const imageURL =
      URL.createObjectURL(
        selectedImageFile
      );


    preview.src =
      imageURL;

    preview.classList.remove(
      "hidden"
    );

  }
);


// =====================================================
// IMAGE UPLOAD
// =====================================================

async function uploadImage(file) {

  if (!file) {

    return null;

  }


  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase();


  const fileName =
    "product-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .substring(2) +
    "." +
    extension;


  const {
    error
  } =
    await supabase.storage
      .from("product-images")
      .upload(
        fileName,
        file,
        {
          cacheControl: "3600",
          upsert: false
        }
      );


  if (error) {

    throw error;

  }


  const {
    data
  } =
    supabase.storage
      .from("product-images")
      .getPublicUrl(
        fileName
      );


  return data.publicUrl;

}


// =====================================================
// SAVE PRODUCT
// =====================================================

productForm.addEventListener(
  "submit",
  async function (e) {

    e.preventDefault();


    msg.textContent =
      "⏳ Product save হচ্ছে...";


    try {

      let imageURL = null;


      // নতুন ছবি থাকলে Upload
      if (selectedImageFile) {

        imageURL =
          await uploadImage(
            selectedImageFile
          );

      }


      const productData = {

        title:
          titleInput.value.trim(),

        category:
          categoryInput.value,

        price:
          Number(
            priceInput.value
          ),

        stock:
          Number(
            stockInput.value
          ),

        description:
          descriptionInput.value.trim()

      };


      // নতুন ছবি থাকলে
      // image_url column-এ save হবে
      if (imageURL) {

        productData.image_url =
          imageURL;

      }


      // =================================================
      // EDIT PRODUCT
      // =================================================

      if (editingId) {

        const {
          error
        } =
          await supabase
            .from("products")
            .update(productData)
            .eq(
              "id",
              editingId
            );


        if (error) {

          throw error;

        }


        msg.textContent =
          "✅ Product সফলভাবে আপডেট হয়েছে.";

      }


      // =================================================
      // NEW PRODUCT
      // =================================================

      else {

        const {
          error
        } =
          await supabase
            .from("products")
            .insert([
              productData
            ]);


        if (error) {

          throw error;

        }


        msg.textContent =
          "✅ Product সফলভাবে যোগ হয়েছে.";

      }


      resetForm();

      await loadProducts();

    }

    catch (error) {

      console.error(error);

      msg.textContent =
        "❌ Error: " +
        error.message;

    }

  }
);


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {

  list.innerHTML =
    "⏳ পণ্য লোড হচ্ছে...";


  const {
    data,
    error
  } =
    await supabase
      .from("products")
      .select("*")
      .order(
        "id",
        {
          ascending: false
        }
      );


  if (error) {

    list.innerHTML =
      "❌ Product load error: " +
      error.message;

    return;

  }


  products =
    data || [];


  renderProducts(
    products
  );

}


// =====================================================
// RENDER PRODUCTS
// =====================================================

function renderProducts(items) {

  if (!items.length) {

    list.innerHTML =
      "<p>এখনো কোনো Product নেই।</p>";

    return;

  }


  list.innerHTML = "";


  items.forEach(
    function (product) {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "admin-item";


      item.innerHTML = `

        ${
          product.image_url

            ? `

              <img
                src="${product.image_url}"
                alt="${escapeHTML(
                  product.title || ""
                )}"
              >

            `

            : `

              <div
                style="
                  width:90px;
                  height:90px;
                  background:#eee;
                  border-radius:10px;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  font-size:30px;
                "
              >
                🐰
              </div>

            `
        }


        <div class="admin-item-info">

          <h3>
            ${escapeHTML(
              product.title || ""
            )}
          </h3>

          <div>
            Category:
            <b>
              ${escapeHTML(
                product.category || ""
              )}
            </b>
          </div>

          <div>
            Price:
            <b>
              ৳${Number(
                product.price || 0
              )}
            </b>
          </div>

          <div>
            Stock:
            <b>
              ${Number(
                product.stock || 0
              )}
            </b>
          </div>

        </div>


        <button
          class="edit"
          data-id="${product.id}"
        >
          ✏️ Edit
        </button>


        <button
          class="delete"
          data-id="${product.id}"
        >
          🗑️ Delete
        </button>

      `;


      list.appendChild(
        item
      );

    }
  );


  // ===================================================
  // EDIT BUTTON
  // ===================================================

  list
    .querySelectorAll(
      ".edit"
    )
    .forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            editProduct(
              button.dataset.id
            );

          }
        );

      }
    );


  // ===================================================
  // DELETE BUTTON
  // ===================================================

  list
    .querySelectorAll(
      ".delete"
    )
    .forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            deleteProduct(
              button.dataset.id
            );

          }
        );

      }
    );

}


// =====================================================
// SEARCH
// =====================================================

searchInput.addEventListener(
  "input",
  function () {

    const search =
      searchInput.value
        .trim()
        .toLowerCase();


    if (!search) {

      renderProducts(
        products
      );

      return;

    }


    const filtered =
      products.filter(
        function (product) {

          return (

            String(
              product.title || ""
            )
              .toLowerCase()
              .includes(search)

            ||

            String(
              product.category || ""
            )
              .toLowerCase()
              .includes(search)

          );

        }
      );


    renderProducts(
      filtered
    );

  }
);


// =====================================================
// EDIT PRODUCT
// =====================================================

function editProduct(id) {

  const product =
    products.find(
      function (item) {

        return String(
          item.id
        ) === String(id);

      }
    );


  if (!product) {

    return;

  }


  editingId =
    product.id;


  idInput.value =
    product.id;


  titleInput.value =
    product.title || "";


  categoryInput.value =
    product.category || "Rabbit";


  priceInput.value =
    product.price || 0;


  stockInput.value =
    product.stock || 0;


  descriptionInput.value =
    product.description || "";


  selectedImageFile =
    null;


  imageInput.value =
    "";


  if (product.image_url) {

    preview.src =
      product.image_url;

    preview.classList.remove(
      "hidden"
    );

  } else {

    preview.classList.add(
      "hidden"
    );

  }


  formTitle.textContent =
    "✏️ Product Edit করুন";


  cancelBtn.classList.remove(
    "hidden"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// =====================================================
// DELETE PRODUCT
// =====================================================

async function deleteProduct(id) {

  const confirmDelete =
    confirm(
      "আপনি কি সত্যিই এই Product Delete করতে চান?"
    );


  if (!confirmDelete) {

    return;

  }


  const {
    error
  } =
    await supabase
      .from("products")
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {

    alert(
      "❌ Delete Error: " +
      error.message
    );

    return;

  }


  alert(
    "✅ Product Delete হয়েছে।"
  );


  loadProducts();

}


// =====================================================
// CANCEL EDIT
// =====================================================

cancelBtn.addEventListener(
  "click",
  function () {

    resetForm();

  }
);


// =====================================================
// RESET FORM
// =====================================================

function resetForm() {

  productForm.reset();


  idInput.value =
    "";


  editingId =
    null;


  selectedImageFile =
    null;


  preview.src =
    "";


  preview.classList.add(
    "hidden"
  );


  formTitle.textContent =
    "নতুন পণ্য";


  cancelBtn.classList.add(
    "hidden"
  );


  msg.textContent =
    "";

}


// =====================================================
// LOAD ORDERS
// =====================================================

async function loadOrders() {

  ordersList.innerHTML =
    "⏳ অর্ডার লোড হচ্ছে...";


  const {
    data,
    error
  } =
    await supabase
      .from("orders")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    ordersList.innerHTML =
      "❌ Orders load error: " +
      error.message;

    return;

  }


  if (!data || !data.length) {

    ordersList.innerHTML =
      "<p>এখনো কোনো Order নেই।</p>";

    return;

  }


  ordersList.innerHTML =
    "";


  data.forEach(
    function (order) {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "order-card";


      card.innerHTML = `

        <div class="order-top">

          <div>

            <strong>
              📦 Order
            </strong>

            <div class="order-id">
              ${escapeHTML(
                String(
                  order.id || ""
                )
              )}
            </div>

          </div>

          <span class="status">
            ${escapeHTML(
              order.status ||
              "pending"
            )}
          </span>

        </div>


        <div class="order-info">

          <b>নাম:</b>
          ${escapeHTML(
            order.customer_name ||
            ""
          )}

          <br>

          <b>মোবাইল:</b>
          ${escapeHTML(
            order.customer_phone ||
            ""
          )}

          <br>

          <b>জেলা:</b>
          ${escapeHTML(
            order.district ||
            ""
          )}

          <br>

          <b>ঠিকানা:</b>
          ${escapeHTML(
            order.address ||
            ""
          )}

          <br>

          <b>Total:</b>
          ৳${Number(
            order.total || 0
          )}

        </div>


        <div class="order-actions">

          <button
            class="complete-btn"
            data-order-id="${order.id}"
          >
            ✅ Complete
          </button>

          <button
            class="cancel-btn"
            data-order-id="${order.id}"
          >
            ❌ Cancel
          </button>

          <button
            class="delete-order"
            data-order-id="${order.id}"
          >
            🗑️ Delete
          </button>

        </div>

      `;


      ordersList.appendChild(
        card
      );

    }
  );


  // Complete

  ordersList
    .querySelectorAll(
      ".complete-btn"
    )
    .forEach(
      function (button) {

        button.onclick =
          function () {

            updateOrderStatus(
              button.dataset.orderId,
              "completed"
            );

          };

      }
    );


  // Cancel

  ordersList
    .querySelectorAll(
      ".cancel-btn"
    )
    .forEach(
      function (button) {

        button.onclick =
          function () {

            updateOrderStatus(
              button.dataset.orderId,
              "cancelled"
            );

          };

      }
    );


  // Delete

  ordersList
    .querySelectorAll(
      ".delete-order"
    )
    .forEach(
      function (button) {

        button.onclick =
          function () {

            deleteOrder(
              button.dataset.orderId
            );

          };

      }
    );

}


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

async function updateOrderStatus(
  id,
  status
) {

  const {
    error
  } =
    await supabase
      .from("orders")
      .update({
        status: status
      })
      .eq(
        "id",
        id
      );


  if (error) {

    alert(
      "❌ " +
      error.message
    );

    return;

  }


  loadOrders();

}


// =====================================================
// DELETE ORDER
// =====================================================

async function deleteOrder(id) {

  const confirmDelete =
    confirm(
      "এই Order Delete করবেন?"
    );


  if (!confirmDelete) {

    return;

  }


  const {
    error
  } =
    await supabase
      .from("orders")
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {

    alert(
      "❌ " +
      error.message
    );

    return;

  }


  loadOrders();

}


// =====================================================
// REFRESH ORDERS
// =====================================================

refreshOrders.addEventListener(
  "click",
  function () {

    loadOrders();

  }
);


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


// =====================================================
// START ADMIN
// =====================================================

checkLogin();
