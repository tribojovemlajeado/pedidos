import { supabase } from './supabase-config.js'

let editingClientId = null

/* =========================
   CARREGAR CLIENTES
========================= */
export async function loadClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('client_code', { ascending: true })

  if (error) {
    console.error('Erro ao carregar clientes:', error.message)
    return
  }

  const list = document.getElementById('clients-list')
  if (!list) return

  list.innerHTML = ''

  data.forEach(client => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${client.client_code}</td>
      <td>${client.name}</td>
      <td>${client.phone}</td>
      <td>${client.email || '-'}</td>
      <td>
        <button onclick="editClient('${client.id}')">Editar</button>
        <button onclick="deleteClient('${client.id}')">Excluir</button>
      </td>
    `
    list.appendChild(tr)
  })
}

/* =========================
   SALVAR CLIENTE
========================= */
window.saveClient = async function () {
  const name = document.getElementById('client-name').value.trim()
  const phone = document.getElementById('client-phone').value.trim()
  const email = document.getElementById('client-email').value.trim()
  const documentValue = document.getElementById('client-document').value.trim()

  if (!name || !phone) {
    alert('Nome e telefone são obrigatórios')
    return
  }

  if (editingClientId) {
    // UPDATE
    const { error } = await supabase
      .from('clients')
      .update({
        name,
        phone,
        email: email || null,
        document: documentValue || null
      })
      .eq('id', editingClientId)

    if (error) {
      alert('Erro ao atualizar cliente')
      console.error(error)
      return
    }

    editingClientId = null
  } else {
    // INSERT
    const { error } = await supabase
      .from('clients')
      .insert({
        name,
        phone,
        email: email || null,
        document: documentValue || null
      })

    if (error) {
      alert('Erro ao salvar cliente')
      console.error(error)
      return
    }
  }

  clearClientForm()
  loadClients()
}

/* =========================
   EDITAR CLIENTE
========================= */
window.editClient = async function (id) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    alert('Erro ao carregar cliente')
    console.error(error)
    return
  }

  document.getElementById('client-name').value = data.name
  document.getElementById('client-phone').value = data.phone
  document.getElementById('client-email').value = data.email || ''
  document.getElementById('client-document').value = data.document || ''

  editingClientId = id
}

/* =========================
   EXCLUIR CLIENTE
========================= */
window.deleteClient = async function (id) {
  if (!confirm('Deseja realmente excluir este cliente?')) return

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) {
    alert('Erro ao excluir cliente')
    console.error(error)
    return
  }

  loadClients()
}

/* =========================
   LIMPAR FORMULÁRIO
========================= */
function clearClientForm() {
  document.getElementById('client-name').value = ''
  document.getElementById('client-phone').value = ''
  document.getElementById('client-email').value = ''
  document.getElementById('client-document').value = ''
}

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', () => {
  loadClients()
})
