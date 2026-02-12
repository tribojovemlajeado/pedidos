import { supabase } from './supabase-config.js'

let cart = []

/* =========================
   CARREGAR PRODUTOS
========================= */
async function loadPDVProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, stock_qty')
    .order('name')

  if (error) {
    console.error('Erro ao carregar produtos PDV:', error)
    return
  }

  const select = document.getElementById('pdv-product')
  if (!select) return

  select.innerHTML = '<option value="">Selecione</option>'

  data.forEach(p => {
    if (p.stock_qty > 0) {
      const opt = document.createElement('option')
      opt.value = p.id
      opt.textContent = `${p.name} (Estoque: ${p.stock_qty})`
      opt.dataset.price = p.price
      opt.dataset.stock = p.stock_qty
      select.appendChild(opt)
    }
  })
}

/* =========================
   ADICIONAR AO CARRINHO
========================= */
window.addToCart = function () {
  const select = document.getElementById('pdv-product')
  const qty = Number(document.getElementById('pdv-qty').value)

  if (!select.value || qty <= 0) {
    alert('Selecione produto e quantidade')
    return
  }

  const price = Number(select.selectedOptions[0].dataset.price)
  const stock = Number(select.selectedOptions[0].dataset.stock)

  if (qty > stock) {
    alert('Estoque insuficiente')
    return
  }

  const existing = cart.find(i => i.product_id === select.value)
  if (existing) {
    existing.qty += qty
  } else {
    cart.push({
      product_id: select.value,
      name: select.selectedOptions[0].text,
      price,
      qty
    })
  }

  renderCart()
}

/* =========================
   RENDERIZAR CARRINHO
========================= */
function renderCart() {
  const tbody = document.getElementById('pdv-cart')
  const totalSpan = document.getElementById('pdv-total')

  tbody.innerHTML = ''
  let total = 0

  cart.forEach((item, index) => {
    const subtotal = item.price * item.qty
    total += subtotal

    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>R$ ${item.price.toFixed(2)}</td>
      <td>R$ ${subtotal.toFixed(2)}</td>
      <td><button onclick="removeFromCart(${index})">X</button></td>
    `
    tbody.appendChild(tr)
  })

  totalSpan.textContent = total.toFixed(2)
}

/* =========================
   REMOVER ITEM
========================= */
window.removeFromCart = function (index) {
  cart.splice(index, 1)
  renderCart()
}

/* =========================
   FINALIZAR VENDA
========================= */
window.finishSale = async function () {
  if (cart.length === 0) {
    alert('Carrinho vazio')
    return
  }

  const clientId = document.getElementById('pdv-client').value || null
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)

  // Criar venda
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      client_id: clientId,
      total,
      status: 'PAID'
    })
    .select()
    .single()

  if (saleError) {
    alert('Erro ao salvar venda')
    console.error(saleError)
    return
  }

  // Itens da venda + baixa de estoque
  for (const item of cart) {
    await supabase.from('sale_items').insert({
      sale_id: sale.id,
      product_id: item.product_id,
      qty: item.qty,
      price: item.price
    })

    await supabase
      .from('products')
      .update({ stock_qty: supabase.raw(`stock_qty - ${item.qty}`) })
      .eq('id', item.product_id)
  }

  alert('Venda concluída com sucesso')
  cart = []
  renderCart()
  loadPDVProducts()
}

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', () => {
  loadPDVProducts()
})
