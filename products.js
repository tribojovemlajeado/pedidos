import { supabase } from "./supabase-config.js";
import { currentRole } from "./app.js";

const list = document.getElementById("product-list");

async function loadProducts() {
  const { data } = await supabase.from("products").select("*").order("name");
  list.innerHTML = "";

  data.forEach(p => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.name}</td>
      <td>R$ ${p.price.toFixed(2)}</td>
      <td>${p.stock_available}</td>
      <td>${p.active ? "Ativo" : "Inativo"}</td>
      <td class="admin-only">
        <button onclick="toggleProduct('${p.id}', ${p.active})">Ativar/Desativar</button>
      </td>
    `;

    list.appendChild(tr);
  });

  if (currentRole !== "admin") {
    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
  }
}

window.addProduct = async function () {
  if (currentRole !== "admin") return;

  const name = document.getElementById("p-name").value;
  const price = Number(document.getElementById("p-price").value);
  const stock = Number(document.getElementById("p-stock").value);

  if (!name || price <= 0) {
    alert("Dados inválidos");
    return;
  }

  await supabase.from("products").insert([{
    name,
    price,
    stock_available: stock,
    stock_reserved: 0,
    active: true
  }]);

  loadProducts();
};

window.toggleProduct = async function (id, active) {
  if (currentRole !== "admin") return;

  await supabase.from("products")
    .update({ active: !active })
    .eq("id", id);

  loadProducts();
};

loadProducts();
