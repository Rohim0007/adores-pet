// =====================================================
// ADORE'S PET — ADMIN.JS
// COMPLETE ADMIN PANEL
// Login + Upload + Image + Edit + Delete + Orders
// =====================================================

import {
  createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


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

const loginBox = document.getElementById("loginBox");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");
const logoutBtn = document.getElementById("logout");

const productForm = document.getElementById("productForm");

const idInput = document.getElementById("id");
const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const stockInput = document.getElementById("stock");
const imageInput = document.getElementById("image");
const descriptionInput = document.getElementById("description");

const preview = document.getElementById("preview");
const formTitle = document.getElementById("formTitle");
const cancelBtn = document.getElementById("cancel");

const msg = document.getElementById("msg");

const list = document.getElementById("list");
const searchInput = document.getElementById("search");

const ordersList = document.getElementById("ordersList");
const refreshOrders = document.getElementById("refreshOrders");


// =====================================================
// VARIABLES
// =====================================================

let products = [];
let editingId = null;
let selectedImageFile = null;


// =====================================================
// LOGIN
// =====================================================

loginForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  loginMsg.textContent = "⏳ Login হচ্ছে...";

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;


  if (!email || !password) {

    loginMsg.textContent =
      "❌ Email এবং Password দিন।";

    return;
  }


  try {

    const {
      data,
      error
    } = await supabase.auth.signInWithPassword({

      email: email,

      password: password

    });


    if (error) {

      console.error("LOGIN ERROR:", error);

      loginMsg.textContent =
        "❌ " + getErrorMessage(error);

      return;
    }


    if (!data || !data.session) {

      loginMsg.textContent =
        "❌ Login session পাওয়া যায়নি।";

      return;
    }


    loginMsg.textContent =
      "✅ Login সফল হয়েছে।";


    showDashboard();

  }

  catch (error) {

    console.error(error);

    loginMsg.textContent =
      "❌ " + getErrorMessage(error);

  }

});


// =====================================================
// CHECK LOGIN
// =====================================================

async function checkLogin() {

  try {

    const {
      data,
      error
    } = await supabase.auth.getSession();


    if (error) {

      console.error(error);

      showLogin();

      return;
    }


    if (data.session) {

      showDashboard();

    } else {

      showLogin();

    }

  }

  catch (error) {

    console.error(error);

    showLogin();

  }

}


// =====================================================
// AUTH STATE
// =====================================================

supabase.auth.onAuthStateChange(
  (event, session) => {

    if (event === "SIGNED_IN" && session) {

      showDashboard();

    }

    if (event === "SIGNED_OUT") {

      showLogin();

    }

  }
);


// =====================================================
// SHOW LOGIN
// =====================================================

function showLogin() {

  loginBox.classList.remove("hidden");

  dashboard.classList.add("hidden");

}


// =====================================================
// SHOW DASHBOARD
// =====================================================

function showDashboard() {

  loginBox.classList.add("hidden");

  dashboard.classList.remove("hidden");


  loadProducts();

  loadOrders();

}


// =====================================================
// LOGOUT
// =====================================================

logoutBtn.addEventListener("click", async () => {

  const {
    error
  } = await supabase.auth.signOut();


  if (error) {

    alert(
      "❌ Logout Error: " +
      getErrorMessage(error)
    );

    return;
  }


  showLogin();

});


// =====================================================
// IMAGE SELECT
// =====================================================

imageInput.addEventListener("change", () => {

  const file =
    imageInput.files?.[0] || null;


  selectedImageFile = file;


  if (!file) {

    return;
  }


  if (!file.type.startsWith("image/")) {

    alert("❌ শুধু Image File নির্বাচন করুন।");

    imageInput.value = "";

    selectedImageFile = null;

    return;
  }


  const maxSize =
    8 * 1024 * 1024;


  if (file.size > maxSize) {

    alert(
      "❌ ছবির Size সর্বোচ্চ 8MB হতে হবে।"
    );

    imageInput.value = "";

    selectedImageFile = null;

    return;
  }


  const imageURL =
    URL.createObjectURL(file);


  preview.src = imageURL;

  preview.classList.remove("hidden");

});


// =====================================================
// UPLOAD IMAGE
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


  const safeExtension =
    ["jpg", "jpeg", "png", "webp"]
      .includes(extension)
      ? extension
      : "jpg";


  const fileName =
    "product-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 10) +
    "." +
    safeExtension;


  const {
    data,
    error
  } =
    await supabase.storage
      .from("product-images")
      .upload(
        fileName,
        file,
        {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type
        }
      );


  if (error) {

    console.error(
      "IMAGE UPLOAD ERROR:",
      error
    );

    throw new Error(
      "Image Upload হয়নি: " +
      getErrorMessage(error)
    );
  }


  const publicURL =
    supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);


  if (
    !publicURL ||
    !publicURL.data ||
    !publicURL.data.publicUrl
  ) {

    throw new Error(
      "Image Public URL পাওয়া যায়নি।"
    );
  }


  return publicURL.data.publicUrl;

}


// =====================================================
// SAVE PRODUCT
// =====================================================

productForm.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();


    msg.textContent =
      "⏳ Product Save হচ্ছে...";


    const saveButton =
      document.getElementById("saveProduct");


    if (saveButton) {

      saveButton.disabled = true;

      saveButton.textContent =
        "⏳ Saving...";

    }


    try {

      const title =
        titleInput.value.trim();

      const category =
        categoryInput.value;

      const price =
        Number(priceInput.value);

      const stock =
        Number(stockInput.value);

      const description =
        descriptionInput.value.trim();


      if (!title) {

        throw new Error(
          "Product Name দিন।"
        );
      }


      if (!category) {

        throw new Error(
          "Category নির্বাচন করুন।"
        );
      }


      if (
        Number.isNaN(price) ||
        price < 0
      ) {

        throw new Error(
          "সঠিক Price দিন।"
        );
      }


      if (
        Number.isNaN(stock) ||
        stock < 0
      ) {

        throw new Error(
          "সঠিক Stock দিন।"
        );
      }


      // =================================================
      // PRODUCT DATA
      // =================================================

      const productData = {

        title: title,

        category: category,

        price: price,

        stock: stock,

        description: description

      };


      // =================================================
      // IMAGE
      // =================================================

      if (selectedImageFile) {

        msg.textContent =
          "⏳ ছবি Upload হচ্ছে...";


        const imageURL =
          await uploadImage(
            selectedImageFile
          );


        /*
          IMPORTANT:
          Database column = image_url
        */

        productData.image_url =
          imageURL;

      }


      // =================================================
      // EDIT
      // =================================================

      if (editingId !== null) {

        msg.textContent =
          "⏳ Product Update হচ্ছে...";


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
          "✅ Product সফলভাবে Update হয়েছে।";

      }


      // =================================================
      // NEW PRODUCT
      // =================================================

      else {

        msg.textContent =
          "⏳ Product Add হচ্ছে...";


        const {
          error
        } =
          await supabase
            .from("products")
            .insert(
              productData
            );


        if (error) {

          throw error;
        }


        msg.textContent =
          "✅ Product সফলভাবে Add হয়েছে।";

      }


      resetForm();

      await loadProducts();

    }

    catch (error) {

      console.error(
        "SAVE PRODUCT ERROR:",
        error
      );


      msg.textContent =
        "❌ Error: " +
        getErrorMessage(error);

    }

    finally {

      if (saveButton) {

        saveButton.disabled = false;

        saveButton.textContent =
          "✅ Save Product";

      }

    }

  }
);


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {

  list.innerHTML =
    "⏳ পণ্য লোড হচ্ছে...";


  try {

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

      throw error;
    }


    products =
      Array.isArray(data)
        ? data
        : [];


    renderProducts(products);

  }

  catch (error) {

    console.error(
      "LOAD PRODUCTS ERROR:",
      error
    );


    list.innerHTML =
      `
      <div class="empty">
        ❌ Product Load Error<br><br>
        ${escapeHTML(
          getErrorMessage(error)
        )}
      </div>
      `;

  }

}


// =====================================================
// RENDER PRODUCTS
// =====================================================

function renderProducts(items) {

  if (!items.length) {

    list.innerHTML =
      `
      <div class="empty">
        📦 এখনো কোনো Product নেই।
      </div>
      `;

    return;
  }


  list.innerHTML = "";


  items.forEach((product) => {

    const item =
      document.createElement("div");


    /*
      HTML class names kept compatible
      with your admin.html CSS
    */

    item.className =
      "product-item";


    const image =
      product.image_url
        ? `
          <img
            class="product-image"
            src="${escapeAttribute(
              product.image_url
            )}"
            alt="${escapeAttribute(
              product.title || "Product"
            )}"
          >
        `
        : `
          <div
            class="product-image"
            style="
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:30px;
            "
          >
            🐰
          </div>
        `;


    item.innerHTML = `

      ${image}


      <div class="product-info">

        <h3>
          ${escapeHTML(
            product.title || "Unnamed Product"
          )}
        </h3>


        <p>
          Category:
          <b>
            ${escapeHTML(
              product.category || "-"
            )}
          </b>
        </p>


        <p>
          Price:
          <b>
            ৳${formatNumber(
              product.price
            )}
          </b>
        </p>


        <p>
          Stock:
          <b>
            ${formatNumber(
              product.stock
            )}
          </b>
        </p>

      </div>


      <div class="product-actions">

        <button
          type="button"
          class="edit-btn"
          data-id="${escapeAttribute(
            String(product.id)
          )}"
        >
          ✏️ Edit
        </button>


        <button
          type="button"
          class="delete-btn"
          data-id="${escapeAttribute(
            String(product.id)
          )}"
        >
          🗑️ Delete
        </button>

      </div>

    `;


    list.appendChild(item);

  });


  // ===================================================
  // EDIT
  // ===================================================

  list
    .querySelectorAll(".edit-btn")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          editProduct(
            button.dataset.id
          );

        }
      );

    });


  // ===================================================
  // DELETE
  // ===================================================

  list
    .querySelectorAll(".delete-btn")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          deleteProduct(
            button.dataset.id
          );

        }
      );

    });

}


// =====================================================
// SEARCH
// =====================================================

searchInput.addEventListener(
  "input",
  () => {

    const search =
      searchInput.value
        .trim()
        .toLowerCase();


    if (!search) {

      renderProducts(products);

      return;
    }


    const filtered =
      products.filter((product) => {

        const title =
          String(
            product.title || ""
          ).toLowerCase();


        const category =
          String(
            product.category || ""
          ).toLowerCase();


        const description =
          String(
            product.description || ""
          ).toLowerCase();


        return (
          title.includes(search) ||
          category.includes(search) ||
          description.includes(search)
        );

      });


    renderProducts(filtered);

  }
);


// =====================================================
// EDIT PRODUCT
// =====================================================

function editProduct(id) {

  const product =
    products.find(
      (item) =>
        String(item.id) === String(id)
    );


  if (!product) {

    alert(
      "❌ Product পাওয়া যায়নি।"
    );

    return;
  }


  editingId =
    product.id;


  idInput.value =
    product.id;


  titleInput.value =
    product.title || "";


  categoryInput.value =
    product.category || "";


  priceInput.value =
    product.price ?? "";


  stockInput.value =
    product.stock ?? "";


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

  }

  else {

    preview.src =
      "";

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

  const product =
    products.find(
      (item) =>
        String(item.id) === String(id)
    );


  const productName =
    product?.title ||
    "এই Product";


  const ok =
    confirm(
      `"${productName}" Delete করবেন?`
    );


  if (!ok) {

    return;
  }


  try {

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

      throw error;
    }


    alert(
      "✅ Product Delete হয়েছে।"
    );


    await loadProducts();

  }

  catch (error) {

    console.error(error);

    alert(
      "❌ Delete Error: " +
      getErrorMessage(error)
    );

  }

}


// =====================================================
// CANCEL
// =====================================================

cancelBtn.addEventListener(
  "click",
  () => {

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


  imageInput.value =
    "";


  preview.src =
    "";


  preview.classList.add(
    "hidden"
  );


  formTitle.textContent =
    "➕ নতুন Product Upload";


  cancelBtn.classList.add(
    "hidden"
  );

}


// =====================================================
// LOAD ORDERS
// =====================================================

async function loadOrders() {

  ordersList.innerHTML =
    "⏳ অর্ডার লোড হচ্ছে...";


  try {

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

      throw error;
    }


    if (
      !data ||
      !data.length
    ) {

      ordersList.innerHTML =
        `
        <div class="empty">
          📦 এখনো কোনো Order নেই।
        </div>
        `;

      return;
    }


    ordersList.innerHTML =
      "";


    data.forEach((order) => {

      const card =
        document.createElement("div");


      card.className =
        "order-card";


      const status =
        order.status ||
        "pending";


      card.innerHTML = `

        <div class="order-top">

          <div>

            <h3>
              📦 Customer Order
            </h3>

            <div class="order-id">
              ID:
              ${escapeHTML(
                String(
                  order.id || ""
                )
              )}
            </div>

          </div>


          <span class="status">
            ${escapeHTML(status)}
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
          ৳${formatNumber(
            order.total
          )}

        </div>


        <div class="order-actions">

          <button
            type="button"
            class="complete-btn"
            data-order-id="${escapeAttribute(
              String(order.id)
            )}"
          >
            ✅ Complete
          </button>


          <button
            type="button"
            class="cancel-btn"
            data-order-id="${escapeAttribute(
              String(order.id)
            )}"
          >
            ❌ Cancel
          </button>


          <button
            type="button"
            class="delete-order"
            data-order-id="${escapeAttribute(
              String(order.id)
            )}"
          >
            🗑️ Delete
          </button>

        </div>

      `;


      ordersList.appendChild(card);

    });


    // =================================================
    // COMPLETE
    // =================================================

    ordersList
      .querySelectorAll(".complete-btn")
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            updateOrderStatus(
              button.dataset.orderId,
              "completed"
            );

          }
        );

      });


    // =================================================
    // CANCEL
    // =================================================

    ordersList
      .querySelectorAll(".cancel-btn")
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            updateOrderStatus(
              button.dataset.orderId,
              "cancelled"
            );

          }
        );

      });


    // =================================================
    // DELETE ORDER
    // =================================================

    ordersList
      .querySelectorAll(".delete-order")
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            deleteOrder(
              button.dataset.orderId
            );

          }
        );

      });

  }

  catch (error) {

    console.error(error);

    ordersList.innerHTML =
      `
      <div class="empty">
        ❌ Orders Load Error<br><br>
        ${escapeHTML(
          getErrorMessage(error)
        )}
      </div>
      `;

  }

}


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

async function updateOrderStatus(
  id,
  status
) {

  try {

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

      throw error;
    }


    await loadOrders();

  }

  catch (error) {

    console.error(error);

    alert(
      "❌ Status Update Error: " +
      getErrorMessage(error)
    );

  }

}


// =====================================================
// DELETE ORDER
// =====================================================

async function deleteOrder(id) {

  const ok =
    confirm(
      "এই Order Delete করবেন?"
    );


  if (!ok) {

    return;
  }


  try {

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

      throw error;
    }


    await loadOrders();

  }

  catch (error) {

    console.error(error);

    alert(
      "❌ Order Delete Error: " +
      getErrorMessage(error)
    );

  }

}


// =====================================================
// REFRESH ORDERS
// =====================================================

refreshOrders.addEventListener(
  "click",
  () => {

    loadOrders();

  }
);


// =====================================================
// ERROR MESSAGE
// =====================================================

function getErrorMessage(error) {

  if (!error) {

    return "Unknown error";

  }


  if (
    error.message &&
    typeof error.message === "string"
  ) {

    return error.message;

  }


  return String(error);

}


// =====================================================
// FORMAT NUMBER
// =====================================================

function formatNumber(value) {

  const number =
    Number(value || 0);


  return number.toLocaleString(
    "en-US"
  );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

  return String(value ?? "")

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
// ESCAPE ATTRIBUTE
// =====================================================

function escapeAttribute(value) {

  return escapeHTML(value);

}


// =====================================================
// START
// =====================================================

checkLogin();
