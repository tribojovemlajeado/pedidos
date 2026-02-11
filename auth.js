import { supabase } from "./supabase-config.js";

function normalizeEmail(user) {
  return user.includes("@") ? user : `${user}@tribo.sistema`;
}

async function login() {
  const user = document.getElementById("user").value.trim();
  const password = document.getElementById("password").value;

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

document.getElementById("loginBtn")
  .addEventListener("click", login);
