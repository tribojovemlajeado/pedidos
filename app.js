import "./products.js";

window.currentRole = "admin"; // temporário

window.showSection = function (id) {
  document.querySelectorAll(".section").forEach(s => {
    s.style.display = "none";
  });

  const section = document.getElementById(id);
  if (!section) return;

  section.style.display = "block";

  if (id === "products" && window.loadProductsUI) {
    window.loadProductsUI();
  }
};

// inicia em produtos para teste
window.showSection("products");
