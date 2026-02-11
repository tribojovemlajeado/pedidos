import { supabase } from "./supabase-config.js";

window.loadProductsUI = async function () {
  const section = document.getElementById("products");

  section.innerHTML = `
    <h2>Produtos</h2>

    <div class="card">
      <input id="p-name" placeholder="Nome">
      <input id="p-price" type="number" placeholder="Preço">
      <input id="p-stock" type="number" placeholder="Estoque inicial">
      <button onclick="saveProduct()">Salvar Produto</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Preço</th>
          <th>Estoque</th>
        </tr>
      </thead>
      <tbody id="products-list"></tbody>
    </table>
  `;

  loadProducts();
};

async function loadProducts() {
  const list = document.getElementById("products-list");
  list.innerHTML = "";

  const { data } = await supabase.from("products").select("*");

  data.forEach(p => {
    list.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>R$ ${Number(p.price).toFixed(2)}</td>
        <td>${p.stock_available}</td>
      </tr>
    `;
  });
}

window.saveProduct = async function () {
  const name = document.getElementById("p-name").value;
  const price = document.getElementById("p-price").value;
  const stock = document.getElementById("p-stock").value;

  await supabase.from("products").insert({
    name,
    price,
    stock_available: stock
  });

  loadProducts();
};
