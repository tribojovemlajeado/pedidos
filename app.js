import { supabase } from "./supabase-config.js";

export let currentRole = null;

async function init() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentRole = user.user_metadata.role;

  if (currentRole !== "admin") {
    document.querySelectorAll(".admin-only").forEach(el => {
      el.style.display = "none";
    });
  }

  // 🔥 abre PDV por padrão
  showSection("pdv");
}

window.showSection = function (id) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.style.display = "none";
  });

  const section = document.getElementById(id);
  if (section) {
    section.style.display = "block";
  }
};

init();
