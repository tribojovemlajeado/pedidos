import { supabase } from "./supabase-config.js";
import { currentRole } from "./app.js";

const list = document.getElementById("client-list");

async function loadClients() {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("client_code", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  list.innerHTML = "";

  data.forEach(c => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${c.client_code}</td>
      <td>${c.name}</td>
      <td>${c.phone}</td>
      <td>${c.email || ""}</td>
      <td class="admin-only">
        <button onclick="deleteClient('${c.id}')">Excluir</button>
      </td>
    `;

    list.appendChild(tr);
  });

  if (currentRole !== "admin") {
    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
  }
}

window.addClient = async function () {
  if (currentRole !== "admin") return;

  const name = document.getElementById("c-name").value.trim();
  const phone = document.getElementById("c-phone").value.trim();
  const email = document.getElementById("c-email").value.trim();
  const document = document.getElementById("c-doc").value.trim();

  if (!name || !phone) {
    alert("Nome e telefone são obrigatórios");
    return;
  }

  const { error } = await supabase.from("clients").insert([{
    name,
    phone,
    email: email || null,
    document: document || null
  }]);

  if (error) {
    alert("Erro ao salvar cliente");
    console.error(error);
    return;
  }

  document.getElementById("c-name").value = "";
  document.getElementById("c-phone").value = "";
  document.getElementById("c-email").value = "";
  document.getElementById("c-doc").value = "";

  loadClients();
};

window.deleteClient = async function (id) {
  if (currentRole !== "admin") return;

  if (!confirm("Deseja excluir este cliente?")) return;

  await supabase.from("clients").delete().eq("id", id);
  loadClients();
};

loadClients();
