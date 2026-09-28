<!DOCTYPE html>
<html lang="bn">

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width,initial-scale=1.0"
>

<title>ADORE'S PET - Admin</title>

<style>

*{
    box-sizing:border-box;
}

body{
    margin:0;
    font-family:Arial,"Noto Sans Bengali",sans-serif;
    background:#f3f7f5;
    color:#092d22;
}

.header{
    background:#177b45;
    color:#fff;
    padding:20px;
    text-align:center;
}

.container{
    max-width:900px;
    margin:30px auto;
    padding:0 15px;
}

.login{
    max-width:400px;
    margin:100px auto;
    background:#fff;
    padding:25px;
    border-radius:18px;
}

.panel{
    background:#fff;
    padding:20px;
    border-radius:18px;
    margin-bottom:20px;

    box-shadow:
    0 5px 20px rgba(0,0,0,.07);
}

input,
select{
    width:100%;
    padding:12px;
    margin:6px 0;

    border:1px solid #ccc;
    border-radius:8px;

    font-size:15px;
}

button{
    border:0;
    padding:11px 15px;
    border-radius:8px;
    cursor:pointer;
    font-weight:bold;
}

.add{
    width:100%;
    background:#177b45;
    color:#fff;
    font-size:16px;
}

.upload{
    border:2px dashed #177b45;
    padding:15px;
    text-align:center;
    border-radius:10px;
    margin-top:8px;
}

.preview{
    width:130px;
    height:130px;
    object-fit:contain;
    display:none;
    margin:10px auto;
}

.home{
    display:block;
    background:#092d22;
    color:#fff;
    text-align:center;
    text-decoration:none;
    padding:12px;
    border-radius:8px;
    margin-bottom:15px;
}

.product{
    display:flex;
    gap:12px;
    align-items:center;

    background:#f4f7f5;

    padding:12px;

    border-radius:12px;

    margin-top:10px;
}

.product img{
    width:80px;
    height:80px;

    object-fit:contain;

    background:#fff;

    border-radius:10px;
}

.info{
    flex:1;
}

.name{
    font-size:17px;
    font-weight:bold;
}

.price{
    color:#177b45;
    font-weight:bold;
    margin-top:5px;
}

.stock{
    margin-top:5px;
}

.actions{
    display:flex;
    gap:5px;
    margin-top:8px;
}

.edit{
    background:#1976d2;
    color:#fff;
}

.save{
    background:#177b45;
    color:#fff;
    display:none;
}

.delete{
    background:#e53935;
    color:#fff;
}

@media(max-width:600px){

    .product{
        align-items:flex-start;
    }

    .product img{
        width:65px;
        height:65px;
    }

    .actions{
        flex-wrap:wrap;
    }

}

</style>

</head>


<body>


<div class="header">

<h1>
ADORE'S PET
</h1>

<div>
Admin Panel
</div>

</div>


<!-- LOGIN -->

<div
class="login"
id="login"
>

<h2>
🔐 Admin Login
</h2>

<input
type="password"
id="password"
placeholder="Admin Password"
>

<button
class="add"
onclick="login()"
>
Login
</button>

</div>


<!-- ADMIN -->

<div
class="container"
id="admin"
style="display:none"
>


<a
href="index.html"
class="home"
>
← Home Page
</a>


<!-- ADD PRODUCT -->

<div class="panel">

<h2>
➕ Add Product
</h2>


<input
id="name"
placeholder="Product Name"
>


<input
id="price"
type="number"
min="0"
placeholder="Price"
>


<input
id="stock"
type="number"
min="0"
placeholder="Stock Quantity"
>


<select
id="category"
>

<option value="">
Category নির্বাচন করুন
</option>

<option value="Rabbit">
🐰 Rabbit
</option>

<option value="Hamster">
🐹 Hamster
</option>

<option value="Pet Food">
🌿 Pet Food
</option>

<option value="Accessories">
🧺 Accessories
</option>

</select>


<div class="upload">

<b>
📷 Product Image Upload
</b>

<input
type="file"
id="image"
accept="image/*"
onchange="previewImage()"
>

<img
id="preview"
class="preview"
>

</div>


<button
class="add"
onclick="addProduct()"
>
➕ Add Product
</button>

</div>


<!-- PRODUCT MANAGEMENT -->

<div class="panel">

<h2>
📦 Product Management
</h2>

<div
id="products"
>
</div>

</div>

</div>


<script>

const PRODUCT_KEY=
"adores_pet_products_v5";


let products=
JSON.parse(
localStorage.getItem(PRODUCT_KEY)||"[]"
);


let imageData="";


/* LOGIN */

function login(){

const password=
document
.getElementById("password")
.value;


if(
password==="DJ778899"
){

document
.getElementById("login")
.style.display="none";


document
.getElementById("admin")
.style.display="block";


renderProducts();

}else{

alert(
"❌ Wrong Password"
);

}

}


/* IMAGE */

function previewImage(){

const file=
document
.getElementById("image")
.files[0];


if(!file)
return;


if(
!file.type.startsWith("image/")
){

alert(
"❌ শুধু Image নির্বাচন করুন"
);

return;

}


const reader=
new FileReader();


reader.onload=
function(e){

const img=
new Image();


img.onload=
function(){

const max=1000;

let width=
img.width;

let height=
img.height;


if(width>max){

height=
height*(max/width);

width=max;

}


if(height>max){

width=
width*(max/height);

height=max;

}


const canvas=
document.createElement("canvas");


canvas.width=width;
canvas.height=height;


const ctx=
canvas.getContext("2d");


ctx.drawImage(
img,
0,
0,
width,
height
);


imageData=
canvas.toDataURL(
"image/jpeg",
0.82
);


const preview=
document
.getElementById("preview");


preview.src=
imageData;


preview.style.display=
"block";

};


img.src=
e.target.result;

};


reader.readAsDataURL(file);

}


/* ADD PRODUCT */

function addProduct(){

const name=
document
.getElementById("name")
.value.trim();


const price=
Number(
document
.getElementById("price")
.value
);


const stock=
Number(
document
.getElementById("stock")
.value
);


const category=
document
.getElementById("category")
.value;


if(
!name ||
!Number.isFinite(price) ||
price<0 ||
!Number.isInteger(stock) ||
stock<0 ||
!category ||
!imageData
){

alert(
"❌ সব তথ্য পূরণ করুন"
);

return;

}


products.push({

id:
"product_"+
Date.now()+
"_"+
Math.random()
.toString(36)
.substring(2,7),

name:name,

price:price,

stock:stock,

category:category,

image:imageData

});


saveProducts();


resetForm();

renderProducts();


alert(
"✅ Product Added Successfully"
);

}


/* SAVE */

function saveProducts(){

localStorage.setItem(
PRODUCT_KEY,
JSON.stringify(products)
);

}


/* RESET */

function resetForm(){

document
.getElementById("name")
.value="";


document
.getElementById("price")
.value="";


document
.getElementById("stock")
.value="";


document
.getElementById("category")
.value="";


document
.getElementById("image")
.value="";


imageData="";


document
.getElementById("preview")
.style.display="none";

}


/* RENDER ADMIN */

function renderProducts(){

const box=
document
.getElementById("products");


box.innerHTML="";


if(!products.length){

box.innerHTML=
`
<p>
📦 এখনো কোনো Product যোগ করা হয়নি।
</p>
`;

return;

}


products.forEach(
p=>{

const div=
document.createElement("div");


div.className=
"product";


div.innerHTML=`

<img
src="${escapeHTML(p.image)}"
>


<div class="info">

<div class="name">
${escapeHTML(p.name)}
</div>

<div class="price">
${Number(p.price)}৳
</div>

<div>
Category:
${escapeHTML(p.category)}
</div>

<div class="stock">

📦 Stock:

<span id="stock-${p.id}">
${p.stock}
</span>

</div>


<div class="actions">

<button
class="edit"
onclick="editStock('${p.id}')"
>
✏️ Edit Stock
</button>


<button
class="save"
id="save-${p.id}"
onclick="saveStock('${p.id}')"
>
💾 Save
</button>


<button
class="delete"
onclick="deleteProduct('${p.id}')"
>
🗑️ Delete
</button>

</div>

</div>

`;


box.appendChild(div);

});

}


/* EDIT STOCK */

function editStock(id){

const p=
products.find(
x=>x.id===id
);


if(!p)
return;


document
.getElementById(
"stock-"+id
)
.innerHTML=
`

<input
id="stockInput-${id}"
type="number"
min="0"
value="${p.stock}"
style="width:100px"
>

`;


document
.getElementById(
"save-"+id
)
.style.display=
"inline-block";

}


/* SAVE STOCK */

function saveStock(id){

const input=
document
.getElementById(
"stockInput-"+id
);


const value=
Number(input.value);


if(
!Number.isInteger(value) ||
value<0
){

alert(
"❌ সঠিক Stock দিন"
);

return;

}


const p=
products.find(
x=>x.id===id
);


if(!p)
return;


p.stock=value;


saveProducts();

renderProducts();


alert(
"✅ Stock Updated"
);

}


/* DELETE */

function deleteProduct(id){

const p=
products.find(
x=>x.id===id
);


if(!p)
return;


if(
!confirm(
`"${p.name}" Delete করবেন?`
)
){

return;

}


products=
products.filter(
x=>x.id!==id
);


saveProducts();


renderProducts();


alert(
"✅ Product Deleted"
);

}


/* ESCAPE */

function escapeHTML(value){

return String(value)

.replace(/&/g,"&amp;")

.replace(/</g,"&lt;")

.replace(/>/g,"&gt;")

.replace(/"/g,"&quot;")

.replace(/'/g,"&#039;");

}


/* ENTER LOGIN */

document
.getElementById("password")
.addEventListener(
"keydown",
function(e){

if(e.key==="Enter"){

login();

}

});

</script>

</body>
</html>
