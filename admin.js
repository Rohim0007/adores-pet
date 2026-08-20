import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const db=createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
const $=id=>document.getElementById(id); let editing=null,oldImage=null;
async function init(){const {data:{session}}=await db.auth.getSession(); show(session)}
function show(session){$("loginBox").classList.toggle("hidden",!!session);$("dashboard").classList.toggle("hidden",!session);if(session)load()}
$("loginForm").onsubmit=async e=>{e.preventDefault();const {error}=await db.auth.signInWithPassword({email:$("email").value,password:$("password").value});$("loginMsg").textContent=error?error.message:"";if(!error)init()}
$("logout").onclick=async()=>{await db.auth.signOut();init()}
$("image").onchange=()=>{const f=$("image").files[0];if(f){$("preview").src=URL.createObjectURL(f);$("preview").classList.remove("hidden")}}
$("cancel").onclick=reset;
$("search").oninput=load;
$("productForm").onsubmit=async e=>{e.preventDefault();$("msg").textContent="Saving...";let image_url=oldImage;const f=$("image").files[0];
if(f){const ext=f.name.split(".").pop().toLowerCase();const path=`${crypto.randomUUID()}.${ext}`;const up=await db.storage.from("product-images").upload(path,f,{upsert:false});if(up.error){$("msg").textContent=up.error.message;return}image_url=db.storage.from("product-images").getPublicUrl(path).data.publicUrl}
const row={title:$("title").value.trim(),category:$("category").value,price:Number($("price").value),stock:Number($("stock").value),description:$("description").value.trim(),image_url};
let result=editing?await db.from("products").update(row).eq("id",editing):await db.from("products").insert(row);
if(result.error)$("msg").textContent=result.error.message;else{reset();$("msg").textContent="Saved";load()}}
async function load(){const q=$("search").value.toLowerCase();let {data,error}=await db.from("products").select("*").order("created_at",{ascending:false});if(error){$("list").textContent=error.message;return}data=data.filter(p=>(p.title+" "+p.category).toLowerCase().includes(q));$("list").innerHTML=data.map(p=>`<div class="admin-item"><img src="${p.image_url||''}"><div><h3>${esc(p.title)}</h3><small>${esc(p.category)} • ৳${p.price} • Stock: ${p.stock}</small><p>${esc(p.description||"")}</p></div><div><button class="edit" onclick='editProduct(${JSON.stringify(p)})'>Edit</button> <button class="delete" onclick="deleteProduct('${p.id}')">Delete</button></div></div>`).join("")||"<p>কোনো পণ্য নেই।</p>"}
window.editProduct=p=>{editing=p.id;oldImage=p.image_url||null;$("id").value=p.id;$("title").value=p.title;$("category").value=p.category;$("price").value=p.price;$("stock").value=p.stock;$("description").value=p.description||"";$("formTitle").textContent="পণ্য Edit";$("cancel").classList.remove("hidden");if(oldImage){$("preview").src=oldImage;$("preview").classList.remove("hidden")}scrollTo({top:0,behavior:"smooth"})}
window.deleteProduct=async id=>{if(!confirm("এই পণ্যটি Delete করবেন?"))return;const {error}=await db.from("products").delete().eq("id",id);if(error)alert(error.message);else load()}
function reset(){editing=null;oldImage=null;$("productForm").reset();$("preview").classList.add("hidden");$("cancel").classList.add("hidden");$("formTitle").textContent="নতুন পণ্য"}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
init();