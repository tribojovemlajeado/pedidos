import { supabase } from "./supabase-config.js";

/* =========================
   UI PRINCIPAL
========================= */
window.loadProductsUI = async function () {
  const section = document.getElementById("products");

  section.innerHTML = `
    <h2>Produtos</h2>

    <div class="card">
      <input id="cat-name" placeholder="Nova categoria">
      <button onclick="addCategory()">Cadastrar Categoria</button>
    </div>

    <div class="card">
      <input id="p-name" placeholder="Nome do produto">
      <input id="p-price" type="number" placeholder="Preço">
      <input id="p-stock" type="number" placeholder="Estoque inicial">

      <select id="p-category">
        <option value="">Selecione a categoria</option>
      </select>

      <button onclick="saveProduct()">Salvar Produto</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th>Categoria</th>
          <th>Preço</th>
          <th>Estoque</th>
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
  select.innerHTML = `<option value="">Selecione a categoria</option>`;

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("name");

  data.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.name;
    select.appendChild(opt);
  });
}

window.addCategory = async function () {
  const name = document.getElementById("cat-name").value.trim();

  if (!name) {
    alert("Informe o nome da categoria");
    return;
  }

  const { error } = await supabase.from("categories").insert({ name });

  if (error) {
    alert("Categoria já existe ou erro ao salvar");
    return;
  }

  document.getElementById("cat-name").value = "";
  loadCategories();
};

/* =========================
   PRODUTOS
========================= */
async function loadProducts() {
  const list = document.getElementById("products-list");
  list.innerHTML = "";

  const { data } = await supabase
    .from("products")
    .select(`
      id,
      name,
      price,
      stock_available,
      categories ( name )
    `)
    .order("name");

  data.forEach(p => {
    list.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.categories?.name || "-"}</td>
        <td>R$ ${Number(p.price).toFixed(2)}</td>
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
