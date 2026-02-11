import { supabase } from "./supabase-config.js";
import { currentRole } from "./app.js";

/* =========================
   UI PRINCIPAL
========================= */
window.loadProductsUI = async function () {
  const section = document.getElementById("products");

  section.innerHTML = `
    <h2>Produtos & Categorias</h2>

    <div class="card">
      <h3>Categorias</h3>

      ${
        currentRole === "admin"
          ? `
        <input id="cat-name" placeholder="Nova categoria">
        <button onclick="addCategory()">Cadastrar</button>
        `
          : `<small>Apenas administradores gerenciam categorias</small>`
      }

      <ul id="category-list"></ul>
    </div>

    <div class="card">
      <h3>Novo Produto</h3>

      <input id="p-name" placeholder="Nome do produto">
      <input id="p-price" type="number" placeholder="Preço">
      <input id="p-stock" type="number" placeholder="Estoque inicial">

      <select id="p-category">
        <option value="">Selecione a categoria</option>
      </select>

      ${
        currentRole === "admin"
          ? `<button onclick="saveProduct()">Salvar Produto</button>`
          : `<small>Apenas admin cadastra produtos</small>`
      }
    </div>

    <h3>Lista de Produtos</h3>
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

    <div class="card">
      <h3>Relatório: Vendas por Categoria</h3>
      <button onclick="loadSalesByCategory()">Gerar Relatório</button>
      <ul id="category-report"></ul>
    </div>
  `;

  await loadCategories();
  await loadProducts();
};

/* =========================
   CATEGORIAS
========================= */
async function loadCategories() {
  const list = document.getElementById("category-list");
  const select = document.getElementById("p-category");

  list.innerHTML = "";
  select.innerHTML = `<option value="">Selecione a categoria</option>`;

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("name");

  data.forEach(cat => {
    // lista
    const li = document.createElement("li");
    li.innerHTML = `
      ${cat.name}
      ${
        currentRole === "admin"
          ? `
        <button onclick="editCategory('${cat.id}','${cat.name}')">✏️</button>
        <button onclick="disableCategory('${cat.id}')">❌</button>
        `
          : ""
      }
    `;
    list.appendChild(li);

    // select produto
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.name;
    select.appendChild(opt);
  });
}

window.addCategory = async function () {
  if (currentRole !== "admin") return;

  const name = document.getElementById("cat-name").value.trim();
  if (!name) return alert("Informe o nome");

  const { error } = await supabase.from("categories").insert({ name });
  if (error) return alert("Categoria já existe");

  document.getElementById("cat-name").value = "";
  loadCategories();
};

window.editCategory = async function (id, oldName) {
  if (currentRole !== "admin") return;

  const newName = prompt("Editar categoria", oldName);
  if (!newName) return;

  await supabase
    .from("categories")
    .update({ name: newName, updated_at: new Date() })
    .eq("id", id);

  loadCategories();
};

window.disableCategory = async function (id) {
  if (currentRole !== "admin") return;

  if (!confirm("Desativar categoria?")) return;

  await supabase
    .from("categories")
    .update({ active: false, updated_at: new Date() })
    .eq("id", id);

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
  if (currentRole !== "admin") return;

  await supabase.from("products").insert({
    name: document.getElementById("p-name").value,
    price: document.getElementById("p-price").value,
    stock_available: document.getElementById("p-stock").value,
    category_id: document.getElementById("p-category").value || null
  });

  loadProducts();
};

/* =========================
   RELATÓRIO VENDAS POR CATEGORIA
========================= */
window.loadSalesByCategory = async function () {
  const report = document.getElementById("category-report");
  report.innerHTML = "";

  const { data } = await supabase
    .from("sale_items")
    .select(`
      quantity,
      products (
        categories ( name ),
        price
      )
    `);

  const resumo = {};

  data.forEach(i => {
    const cat = i.products?.categories?.name || "Sem categoria";
    const total = i.quantity * i.products.price;

    resumo[cat] = (resumo[cat] || 0) + total;
  });

  Object.entries(resumo).forEach(([cat, total]) => {
    report.innerHTML += `<li>${cat}: R$ ${total.toFixed(2)}</li>`;
  });
};
