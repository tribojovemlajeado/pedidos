import { supabase } from './supabase-config.js'

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', () => {
  loadCategories()
  loadProducts()
})

/* =========================
   CATEGORIES
========================= */
async function loadCategories() {
  const categorySelect = document.getElementById('product-category')
  const categoryList = document.getElementById('categories-list')

  if (!categorySelect || !categoryList) {
    console.warn('Elementos de categoria não encontrados')
    return
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Erro ao carregar categorias:', error.message)
    return
  }

  categorySelect.innerHTML = `<option value="">Selecione</option>`
  categoryList.innerHTML = ''

  if (!data || data.length === 0) return

  data.forEach(cat => {
    const option = document.createElement('option')
    option.value = cat.id
    option.textContent = cat.name
    categorySelect.appendChild(option)

    const li = document.createElement('li')
    li.textContent = cat.name
    categoryList.appendChild(li)
  })
}

async function saveCategory() {
  const input = document.getElementById('category-name')
  if (!input || !input.value.trim()) return

  const { error } = await supabase
    .from('categories')
    .insert([{ name: input.value.trim() }])

  if (error) {
    alert('Erro ao salvar categoria')
    console.error(error)
    return
  }

  input.value = ''
  loadCategories()
}

/* =========================
   PRODUCTS
========================= */
async function loadProducts() {
  const list = document.getElementById('products-list')
  if (!list) return

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      price,
      stock,
      categories ( name )
    `)
    .order('name')

  if (error) {
    console.error('Erro ao carregar produtos:', error.message)
    return
  }

  list.innerHTML = ''

  if (!data || data.length === 0) return

  data.forEach(prod => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${prod.name}</td>
      <td>R$ ${Number(prod.price).toFixed(2)}</td>
      <td>${prod.stock}</td>
      <td>${prod.categories?.name || '-'}</td>
    `
    list.appendChild(tr)
  })
}

async function saveProduct() {
  const name = document.getElementById('product-name')?.value
  const price = document.getElementById('product-price')?.value
  const stock = document.getElementById('product-stock')?.value
  const category = document.getElementById('product-category')?.value

  if (!name || !price || !stock || !category) {
    alert('Preencha todos os campos')
    return
  }

  const { error } = await supabase
    .from('products')
    .insert([{
      name,
      price: Number(price),
      stock: Number(stock),
      category_id: category
    }])

  if (error) {
    alert('Erro ao salvar produto')
    console.error(error)
    return
  }

  document.getElementById('product-name').value = ''
  document.getElementById('product-price').value = ''
  document.getElementById('product-stock').value = ''
  document.getElementById('product-category').value = ''

  loadProducts()
}

/* =========================
   EXPORTS (HTML)
========================= */
window.saveCategory = saveCategory
window.saveProduct = saveProduct
