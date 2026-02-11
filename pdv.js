import { supabase } from "./supabase-config.js";

window.loadPDVUI = async function () {
  const section = document.getElementById("pdv");

  section.innerHTML = `
    <h2>PDV</h2>

    <select id="product-select"></select>
    <input id="qty" type="number" value="1">
    <button onclick="addToCart()">Adicionar</button>

    <ul id="cart"></ul>
    <button onclick="finishSale()">Finalizar Venda</button>
  `;

  loadProducts();
};

async function loadProducts() {
  const select = document.getElementById("product-select");
  select.innerHTML = "";

  const { data } = await supabase.from("products").select("*");

  data.forEach(p => {
    select.innerHTML += `<option value="${p.id}">${p.name}</option>`;
  });
}

let cart = [];

window.addToCart = function () {
  cart.push({
    product_id: document.getElementById("product-select").value,
    quantity: document.getElementById("qty").value
  });

  document.getElementById("cart").innerHTML =
    cart.map(i => `<li>${i.quantity}</li>`).join("");
};

window.finishSale = async function () {
  alert("Venda finalizada (mock)");
  cart = [];
};
