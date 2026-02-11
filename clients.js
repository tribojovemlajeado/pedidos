import { supabase } from "./supabase-config.js";

window.loadClientsUI = async function () {
  const section = document.getElementById("clients");

  section.innerHTML = `
    <h2>Clientes</h2>

    <div class="card">
      <input id="c-name" placeholder="Nome">
      <input id="c-phone" placeholder="Telefone">
      <input id="c-email" placeholder="E-mail">
      <input id="c-doc" placeholder="CPF/CNPJ">
      <button onclick="saveClient()">Salvar Cliente</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Telefone</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody id="clients-list"></tbody>
    </table>
  `;

  loadClients();
};

async function loadClients() {
  const list = document.getElementById("clients-list");
  list.innerHTML = "";

  const { data } = await supabase.from("clients").select("*");

  data.forEach(c => {
    list.innerHTML += `
      <tr>
        <td>${c.name}</td>
        <td>${c.phone}</td>
        <td>${c.email || ""}</td>
      </tr>
    `;
  });
}

window.saveClient = async function () {
  await supabase.from("clients").insert({
    name: document.getElementById("c-name").value,
    phone: document.getElementById("c-phone").value,
    email: document.getElementById("c-email").value,
    document: document.getElementById("c-doc").value
  });

  loadClients();
};
