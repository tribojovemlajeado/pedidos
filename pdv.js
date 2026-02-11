import { supabase } from "./supabase-config.js";

let cart = [];
let products = [];

const productSelect = document.getElementById("pdv-product");
const cartList = document.getElementById("cart-list");
const totalSpan = document.getElementById("pdv-total");
const clientSelect = document.getElementById("pdv-client");

async function loadProducts() {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("active", true);

  products = data || [];
  productSelect.innerHTML = "";

  products.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.name} - R$ ${p.price}`;
    productSelect.appendChild(opt);
  });
}

async function loadClients() {
  const { data } = await supabase.from("clients").select("*");
  data.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    clientSelect.appendChild(opt);
  });
}

window.addToCart = function () {
  const productId = productSelect.value;
  const qty = Number(document.getElementById("pdv-qty").value);

  const product = products.find(p => p.id === productId);
  if (!product || qty <= 0) return;

  cart.push({
    product_id: product.id,
    name: product.name,
    quantity: qty,
    price: product.price
  });

  renderCart();
};

function renderCart() {
  cartList.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    const itemTotal = item.quantity * item.price;
    total += itemTotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>R$ ${item.price.toFixed(2)}</td>
      <td>R$ ${itemTotal.toFixed(2)}</td>
      <td><button onclick="removeItem(${i})">X</button></td>
    `;
    cartList.appendChild(tr);
  });

  totalSpan.textContent = total.toFixed(2);
}

window.removeItem = function (index) {
  cart.splice(index, 1);
  renderCart();
};

window.finalizeSale = async function () {
  if (cart.length === 0) {
    alert("Carrinho vazio");
    return;
  }

  const payment = document.getElementById("pdv-payment").value;
  if (!payment) {
    alert("Selecione forma de pagamento");
    return;
  }

  const total = Number(totalSpan.textContent);
  const clientId = clientSelect.value || null;

  const { data: sale } = await supabase.from("sales").insert([{
    total,
    payment_method: payment,
    client_id: clientId
  }]).select().single();

  for (const item of cart) {
    await supabase.from("sale_items").insert([{
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }]);

    await supabase.rpc("decrement_stock", {
      pid: item.product_id,
      q: item.quantity
    });
  }

  alert("Venda concluída com sucesso!");
  cart = [];
  renderCart();
};

loadProducts();
loadClients();
