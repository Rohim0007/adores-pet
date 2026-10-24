try{
  const cart=JSON.parse(localStorage.getItem("cart")||"[]");
  const count=Array.isArray(cart)?cart.reduce((s,i)=>s+(Number(i.quantity)||1),0):0;
  document.getElementById("cartCount").textContent=count;
}catch(e){document.getElementById("cartCount").textContent="0";}
