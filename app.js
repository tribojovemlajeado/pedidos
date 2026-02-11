import "./products.js";
import "./clients.js";
import "./pdv.js";
import "./finance.js";

export let currentRole = "admin"; // temporário

window.showSection = function (id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");

  const section = document.getElementById(id);
  section.style.display = "block";

  if (id === "products") window.loadProductsUI();
  if (id === "clients") window.loadClientsUI();
  if (id === "pdv") window.loadPDVUI();
  if (id === "finance") window.loadFinance();
};

window.logout = function () {
  window.location.href = "index.html";
};

// inicia no PDV
showSection("pdv");
