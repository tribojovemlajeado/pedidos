import { supabase } from "./supabase-config.js";
import { currentRole } from "./app.js";

/* =========================
   UI
========================= */
window.loadProductsUI = async function () {
  const s = document.getElementById("products");

  s.innerHTML = `
    <h2>Produtos & Estoque</h2>

    <div class="card">
      <h3>Produto</h3>
      <input type="hidden" id="p-id">
      <input id="p-name" placeholder="Nome">
      <input id="p-price" type="number" placeholder="Preço">
      <input id="p-stock" type="number" placeholder="Estoque inicial">
      <select id="p-category"></select>
      <button onclick="saveProduct()">Salvar</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th>Categoria</th>
          <th>Disponível</th>
          <th>Reservado</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="products-list"></tbody>
    </table>

    <button onclick="exportCSV()">Exportar CSV</button>
    <button onclick="exportExcel()">Exportar Excel</button>
  `;

  await loadCategories();
  await loadProducts();
};

/* =========================
   CATEGORIAS
========================= */
async function loadCategories() {
  const select = document.getElementById("p-category");
  select.innerHTML = "";

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true);

  data.forEach(c => {
    select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
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
      id,
      name,
      stock_available,
      stock_reserved,
      categories(name)
    `)
    .eq("active", true);

  data.forEach(p => {
    list.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.categories?.name || "-"}</td>
        <td>${p.stock_available}</td>
        <td>${p.stock_reserved}</td>
        <td>
          <button onclick="editProduct('${p.id}')">✏️</button>
          <button onclick="disableProduct('${p.id}')">❌</button>
        </td>
      </tr>
    `;
  });
}

window.saveProduct = async function () {
  if (currentRole !== "admin") return;

  const id = document.getElementById("p-id").value;

  const payload = {
    name: p-name.value,
    price: p-price.value,
    stock_available: p-stock.value,
    category_id: p-category.value
  };

  if (id) {
    await supabase.from("products").update(payload).eq("id", id);
  } else {
    await supabase.from("products").insert(payload);
  }

  p-id.value = "";
  p-name.value = "";
  p-price.value = "";
  p-stock.value = "";

  loadProducts();
};

window.editProduct = async function (id) {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  p-id.value = data.id;
  p-name.value = data.name;
  p-price.value = data.price;
  p-stock.value = data.stock_available;
};

window.disableProduct = async function (id) {
  if (!confirm("Desativar produto?")) return;

  await supabase
    .from("products")
    .update({ active: false })
    .eq("id", id);

  loadProducts();
};

/* =========================
   EXPORTAÇÕES
========================= */
window.exportCSV = async function () {
  const { data } = await supabase.from("products").select("*");

  let csv = "Nome,Preço,Disponível,Reservado\n";
  data.forEach(p => {
    csv += `${p.name},${p.price},${p.stock_available},${p.stock_reserved}\n`;
  });

  download(csv, "produtos.csv", "text/csv");
};

window.exportExcel = async function () {
  const { data } = await supabase.from("products").select("*");

  let xml = `
  <table>
    <tr><th>Nome</th><th>Preço</th><th>Disponível</th><th>Reservado</th></tr>
    ${data.map(p =>
      `<tr>
        <td>${p.name}</td>
        <td>${p.price}</td>
        <td>${p.stock_available}</td>
        <td>${p.stock_reserved}</td>
      </tr>`
    ).join("")}
  </table>
  `;

  download(xml, "produtos.xls", "application/vnd.ms-excel");
};

function download(content, file, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = file;
  a.click();
}
