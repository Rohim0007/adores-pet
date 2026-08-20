import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const ready=window.SUPABASE_URL.startsWith("http") && window.SUPABASE_ANON_KEY.length>20;
const db=ready?createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY):null;
const grid=document.getElementById("grid"); document.getElementById("year").textContent=new Date().getFullYear();
function card(p){return `<article class="card"><img src="${p.image_url||'https://images.unsplash.com/photo-1583301286816-f4f05e1f8b2d?auto=format&fit=crop&w=800&q=80'}"><div class="body"><small>${p.category}</small><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description||"")}</p><b>৳${Number(p.price).toLocaleString("en-BD")}</b><div class="${p.stock>0?'in':'out'}">${p.stock>0?'স্টকে আছে: '+p.stock:'স্টক শেষ'}</div></div></article>`}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
async function load(){if(!db){grid.innerHTML="<p>Supabase config.js সেটআপ করা হয়নি।</p>";return}const {data,error}=await db.from("products").select("*").order("created_at",{ascending:false});if(error){grid.innerHTML="<p>পণ্য লোড করা যায়নি।</p>";console.error(error);return}grid.innerHTML=data?.length?data.map(card).join(""):"<p>এখনো কোনো পণ্য যোগ করা হয়নি।</p>"}
load();