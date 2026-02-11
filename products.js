import { supabase } from "./supabase-config.js";

window.loadProductsUI = async function () {
  const section = document.getElementById("products");

  section.innerHTML = `
    <h2>Produtos</h2>

    <div class="card">
      <h3>Novo Produto</h3>
      <input id="p-name" placeholder="Nome">
      <input id="p-price" type="number" placeholder="Preço">
      <input id="p-stock" type="number" placeholder="Estoque">
      <select id="p-category"></select>
      <button onclick="saveProduct()">Salvar</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th>Categoria</th>
          <th>Disponível</th>
        </tr>
      </thead>
      <tbody id="products-list"></tbody>
    </table>
  `;

  await loadCategories();
  await loadProducts();
};

/* =========================
   CATEGORIAS
========================= */
async function loadCategories() {
  const select = document.getElementById("p-category");
  select.innerHTML = `<option value="">Selecione</option>`;

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("name");

  data.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
}

/* =========================
   PRODUTOS
========================= */
async function loadProducts() {
  const list = document.getElementById("products-list");
  list.innerHTML = "";

  const { data } = await supabase
    .from("products")
    .select(`
      name,
      stock_available,
      categories ( name )
    `)
    .eq("active", true)
    .order("name");

  data.forEach(p => {
    list.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.categories?.name || "-"}</td>
        <td>${p.stock_available}</td>
      </tr>
    `;
  });
}

window.saveProduct = async function () {
  const name = document.getElementById("p-name").value.trim();
  const price = Number(document.getElementById("p-price").value);
  const stock = Number(document.getElementById("p-stock").value);
  const category = document.getElementById("p-category").value || null;

  if (!name || price <= 0) {
    alert("Dados inválidos");
    return;
  }

  await supabase.from("products").insert({
    name,
    price,
    stock_available: stock,
    category_id: category
  });

  document.getElementById("p-name").value = "";
  document.getElementById("p-price").value = "";
  document.getElementById("p-stock").value = "";

  loadProducts();
};
