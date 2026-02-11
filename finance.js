import { supabase } from "./supabase-config.js";
import { currentRole } from "./app.js";

const list = document.getElementById("sales-list");
const totalDaySpan = document.getElementById("total-day");
const totalMonthSpan = document.getElementById("total-month");

async function loadFinance() {
  const { data: sales, error } = await supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  list.innerHTML = "";

  let totalDay = 0;
  let totalMonth = 0;

  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  sales.forEach(sale => {
    if (sale.status === "paga") {
      const saleDate = sale.created_at.slice(0, 10);
      const saleMonth = sale.created_at.slice(0, 7);

      if (saleDate === today) totalDay += Number(sale.total);
      if (saleMonth === month) totalMonth += Number(sale.total);
    }

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${new Date(sale.created_at).toLocaleString()}</td>
      <td>R$ ${Number(sale.total).toFixed(2)}</td>
      <td>${sale.payment_method}</td>
      <td>${sale.status}</td>
      <td class="admin-only">
        ${sale.status === "paga"
          ? `<button onclick="cancelSale('${sale.id}')">Cancelar</button>`
          : ""}
      </td>
    `;

    list.appendChild(tr);
  });

  totalDaySpan.textContent = totalDay.toFixed(2);
  totalMonthSpan.textContent = totalMonth.toFixed(2);

  if (currentRole !== "admin") {
    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
  }
}

window.cancelSale = async function (saleId) {
  if (currentRole !== "admin") return;

  if (!confirm("Deseja cancelar esta venda?")) return;

  const { data: items } = await supabase
    .from("sale_items")
    .select("*")
    .eq("sale_id", saleId);

  for (const item of items) {
    await supabase.rpc("restore_stock", {
      pid: item.product_id,
      q: item.quantity
    });
  }

  await supabase
    .from("sales")
    .update({ status: "cancelada" })
    .eq("id", saleId);

  alert("Venda cancelada e estoque devolvido.");
  loadFinance();
};

loadFinance();
