import { supabase } from './supabase-config.js'

/* =========================
   CATEGORIAS
========================= */
export async function loadCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Erro ao carregar categorias:', error.message)
    return
  }

  const select = document.getElementById('product-category')
  const list = document.getElementById('categories-list')

  if (!select || !list) return

  select.innerHTML = '<option value="">Selecione</option>'
  list.innerHTML = ''

  data.forEach(cat => {
    const opt = document.createElement('option')
    opt.value = cat.id
    opt.textContent = cat.name
    select.appendChild(opt)

    const li = document.createElement('li')
    li.textContent = cat.name
    list.appendChild(li)
  })
}

window.saveCategory = async function () {
  const name = document.getElementById('category-name').value.trim()
  if (!name) return alert('Informe o nome da categoria')

  const { error } = await supabase
    .from('categories')
    .insert({ name })

  if (error) {
    alert('Erro ao salvar categoria')
    console.error(error)
    return
  }

  document.getElementById('category-name').value = ''
  loadCategories()
}

/* =========================
   PRODUTOS
========================= */
export async function loadProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      price,
      stock_qty,
      categories ( name )
    `)
    .order('name')

  if (error) {
    console.error('Erro ao carregar produtos:', error.message)
    return
  }

  const list = document.getElementById('products-list')
  if (!list) return

  list.innerHTML = ''

  data.forEach(p => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>R$ ${Number(p.price).toFixed(2)}</td>
      <td>${p.stock_qty}</td>
      <td>${p.categories?.name || '-'}</td>
    `
    list.appendChild(tr)
  })
}

window.saveProduct = async function () {
  const name = document.getElementById('product-name').value.trim()
  const price = Number(document.getElementById('product-price').value)
  const stock_qty = Number(document.getElementById('product-stock').value)
  const category_id = document.getElementById('product-category').value

  if (!name || !price) {
    alert('Informe nome e preço')
    return
  }

  const { error } = await supabase
    .from('products')
    .insert({
      name,
      price,
      stock_qty,
      category_id: category_id || null
    })

  if (error) {
    alert('Erro ao salvar produto')
    console.error(error)
    return
  }

  document.getElementById('product-name').value = ''
  document.getElementById('product-price').value = ''
  document.getElementById('product-stock').value = ''

  loadProducts()
}

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', () => {
  loadCategories()
  loadProducts()
})
