import { supabase } from "./supabase-config.js";

/* =========================
   NORMALIZA USUÁRIO → EMAIL
========================= */
function normalizeEmail(user) {
  return user.includes("@") ? user : `${user}@tribo.sistema`;
}

/* =========================
   LOGIN
========================= */
async function login() {
  const user = document.getElementById("user")?.value.trim();
  const password = document.getElementById("password")?.value;

  if (!user || !password) {
    alert("Informe usuário e senha");
    return;
  }

  const email = normalizeEmail(user);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Usuário ou senha inválidos");
    console.error(error);
    return;
  }

  window.location.href = "app.html";
}

/* =========================
   LOGOUT
========================= */
async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

/* =========================
   EXPOR FUNÇÕES PARA HTML
========================= */
window.login = login;
window.logout = logout;

/* =========================
   EVENTO BOTÃO LOGIN
========================= */
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", login);
}
