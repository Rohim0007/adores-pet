<!doctype html>
<html lang="bn">

<head>

<meta charset="utf-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1"
>

<title>ADORE'S PET</title>

<link rel="stylesheet" href="style.css">

</head>

<body>

<!-- ================= HEADER ================= -->

<header class="header">

  <a href="index.html" class="logo">
    🐰 <span>ADORE'S PET</span>
  </a>

  <button
    class="cart-btn"
    onclick="openCart()"
  >
    🛒 Cart
    <span id="cartCount">0</span>
  </button>

</header>


<!-- ================= CATEGORY ================= -->

<main>

<section class="category-page">

  <a
    href="index.html"
    class="back-btn"
  >
    ← হোমে ফিরে যান
  </a>


  <div
    id="categoryTitle"
    class="category-title"
  >
    🐰 Rabbit
  </div>


  <div
    id="grid"
    class="grid"
  >

    <p>পণ্য লোড হচ্ছে...</p>

  </div>

</section>

</main>


<!-- ================= FOOTER ================= -->

<footer class="footer">

  <div class="footer-logo">
    🐰 ADORE'S PET
  </div>

  <p>
    আপনার বিশ্বস্ত Pet Shop
  </p>

  <div class="footer-line"></div>

  <small>
    © <span id="year"></span>
    ADORE'S PET — All Rights Reserved
  </small>

</footer>


<!-- ================= CART ================= -->

<div
  id="cartPanel"
  class="cart-panel"
>

  <div class="cart-box">

    <div class="cart-head">

      <h2>
        🛒 আপনার Cart
      </h2>

      <button onclick="closeCart()">
        ✕
      </button>

    </div>


    <div id="cartItems"></div>

    <div id="cartSummary"></div>


    <div class="checkout-form">

      <h3>
        📦 অর্ডারের তথ্য
      </h3>


      <label>
        আপনার নাম
      </label>

      <input
        id="customerName"
        placeholder="আপনার নাম"
      >


      <label>
        মোবাইল নম্বর
      </label>

      <input
        id="customerPhone"
        type="tel"
        placeholder="01XXXXXXXXX"
      >


      <label>
        জেলা
      </label>

      <select id="customerDistrict">

        <option value="">
          জেলা নির্বাচন করুন
        </option>

        <option>ঢাকা</option>
        <option>চট্টগ্রাম</option>
        <option>সিলেট</option>
        <option>রাজশাহী</option>
        <option>খুলনা</option>
        <option>বরিশাল</option>
        <option>রংপুর</option>
        <option>ময়মনসিংহ</option>

        <option>কুমিল্লা</option>
        <option>ফেনী</option>
        <option>ব্রাহ্মণবাড়িয়া</option>
        <option>চাঁদপুর</option>
        <option>লক্ষ্মীপুর</option>
        <option>নোয়াখালী</option>

        <option>নারায়ণগঞ্জ</option>
        <option>গাজীপুর</option>
        <option>নরসিংদী</option>
        <option>টাঙ্গাইল</option>
        <option>কিশোরগঞ্জ</option>
        <option>মানিকগঞ্জ</option>
        <option>মুন্সিগঞ্জ</option>
        <option>ফরিদপুর</option>

        <option>যশোর</option>
        <option>ঝিনাইদহ</option>
        <option>মাগুরা</option>
        <option>নড়াইল</option>
        <option>কুষ্টিয়া</option>
        <option>চুয়াডাঙ্গা</option>
        <option>মেহেরপুর</option>
        <option>সাতক্ষীরা</option>
        <option>বাগেরহাট</option>

        <option>বগুড়া</option>
        <option>জয়পুরহাট</option>
        <option>নওগাঁ</option>
        <option>নাটোর</option>
        <option>চাঁপাইনবাবগঞ্জ</option>
        <option>পাবনা</option>
        <option>সিরাজগঞ্জ</option>

        <option>দিনাজপুর</option>
        <option>ঠাকুরগাঁও</option>
        <option>পঞ্চগড়</option>
        <option>নীলফামারী</option>
        <option>লালমনিরহাট</option>
        <option>কুড়িগ্রাম</option>
        <option>গাইবান্ধা</option>

        <option>সুনামগঞ্জ</option>
        <option>মৌলভীবাজার</option>
        <option>হবিগঞ্জ</option>

        <option>ঝালকাঠি</option>
        <option>পটুয়াখালী</option>
        <option>পিরোজপুর</option>
        <option>ভোলা</option>
        <option>বরগুনা</option>

      </select>


      <label>
        সম্পূর্ণ ঠিকানা
      </label>

      <textarea
        id="customerAddress"
        placeholder="বাড়ি / রোড / এলাকা / থানা..."
      ></textarea>


      <label>
        Delivery Charge
      </label>

      <select id="deliveryCharge">

        <option value="100">
          ঢাকার ভিতরে — ৳100
        </option>

        <option value="150">
          ঢাকার বাইরে — ৳150
        </option>

      </select>


      <div
        id="checkoutTotal"
        class="checkout-total"
      >
        মোট: ৳0
      </div>


      <button
        class="place-order"
        onclick="placeOrder()"
      >
        ✅ অর্ডার করুন
      </button>


      <div id="orderMsg"></div>

    </div>

  </div>

</div>


<!-- ================= SCRIPT ================= -->

<script src="config.js"></script>

<script
  type="module"
  src="shop.js"
></script>


<script>

document.getElementById("year").textContent =
  new Date().getFullYear();


const params =
  new URLSearchParams(location.search);


const cat =
  params.get("cat") || "Rabbit";


const titles = {

  "Rabbit": "🐰 Rabbit",

  "Hamster": "🐹 Hamster",

  "Pet Food": "🌾 Pet Food",

  "Accessories": "🧺 Accessories"

};


document.getElementById(
  "categoryTitle"
).textContent =
  titles[cat] || cat;

</script>

</body>
</html>
