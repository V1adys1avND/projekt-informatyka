let cart = JSON.parse(localStorage.getItem('eko_koszyk')) || []

// POWIADOMIENIA
function pokazKomunikat(tresc, czyBlad = false) {
  const starePowiadomienie = document.getElementById('eko-powiadomienie')
  if (starePowiadomienie) starePowiadomienie.remove()

  const powiadomienie = document.createElement('div')
  powiadomienie.id = 'eko-powiadomienie'

  powiadomienie.style.position = 'fixed'
  powiadomienie.style.bottom = '20px'
  powiadomienie.style.right = '20px'
  powiadomienie.style.backgroundColor = czyBlad ? '#ff4d4d' : '#2e6f40'
  powiadomienie.style.color = '#ffffff'
  powiadomienie.style.padding = '16px 24px'
  powiadomienie.style.borderRadius = '6px'
  powiadomienie.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
  powiadomienie.style.zIndex = '9999'
  powiadomienie.style.display = 'flex'
  powiadomienie.style.alignItems = 'center'
  powiadomienie.style.gap = '15px'
  powiadomienie.style.fontWeight = '600'
  powiadomienie.style.fontSize = '15px'

  powiadomienie.innerHTML = `
    <span>${tresc}</span>
    <button id="zamknij-powiadomienie" style="background: none; border: none; color: #fff; font-size: 20px; cursor: pointer; font-weight: bold; line-height: 1;">&times;</button>
  `

  document.body.appendChild(powiadomienie)

  document
    .getElementById('zamknij-powiadomienie')
    .addEventListener('click', () => {
      powiadomienie.remove()
    })

  setTimeout(() => {
    if (document.body.contains(powiadomienie)) {
      powiadomienie.remove()
    }
  }, 5000)
}

function updateCartCounter() {
  const counter = document.getElementById('licznik-koszyka')
  if (counter) {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)
    counter.textContent = totalItems
  }
}

function saveAndRefreshCart() {
  localStorage.setItem('eko_koszyk', JSON.stringify(cart))
  updateCartCounter()
  renderCart()
}

function renderCart() {
  const cartListHTML = document.getElementById('lista-koszyka')
  if (!cartListHTML) return

  cartListHTML.innerHTML = ''

  if (cart.length === 0) {
    cartListHTML.innerHTML =
      '<p class="brak-wynikow">Twój koszyk jest pusty. Wróć do sklepu i wybierz pyszne produkty EKO!</p>'
    updatePriceSummary(0)
    return
  }

  let productsTotalSum = 0

  cart.forEach((product) => {
    const positionCost = product.price * product.qty
    productsTotalSum += positionCost

    const cartItem = document.createElement('div')
    cartItem.className = 'element-koszyka'

    cartItem.innerHTML = `
        <div class="dane-produktu-koszyk">
            <h4>${product.name}</h4>
            <small>${product.price.toFixed(2)} zł / szt.</small>
        </div>
        
        <div class="prawa-strona-koszyk">
            <div class="kontrola-ilosci">
                <button class="btn-qty" data-id="${product.id}" data-action="decrease">-</button>
                <input type="number" class="input-qty" data-id="${product.id}" value="${product.qty}" min="1" max="99">
                <button class="btn-qty" data-id="${product.id}" data-action="increase">+</button>
            </div>
            <span class="cena-pozycji">${positionCost.toFixed(2)} zł</span>
            <button class="btn-delete" data-id="${product.id}">Usuń</button>
        </div>
    `
    cartListHTML.appendChild(cartItem)
  })

  updatePriceSummary(productsTotalSum)
  setupCartControlsEvents()
}

function updatePriceSummary(productsTotalSum) {
  const deliveryCost =
    productsTotalSum >= 100 || productsTotalSum === 0 ? 0 : 15
  const finalTotalSum = productsTotalSum + deliveryCost

  document.getElementById('suma-produktow').textContent =
    productsTotalSum.toFixed(2)
  document.getElementById('koszt-dostawy').textContent = deliveryCost.toFixed(2)
  document.getElementById('suma-calkowita').textContent =
    finalTotalSum.toFixed(2)
}

function setupCartControlsEvents() {
  const qtyButtons = document.querySelectorAll('.btn-qty')
  qtyButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const productId = parseInt(e.target.getAttribute('data-id'))
      const action = e.target.getAttribute('data-action')
      const product = cart.find((p) => p.id === productId)

      if (action === 'increase') {
        if (product.qty < 99) {
          product.qty++
        } else {
          pokazKomunikat('Osiągnięto maksymalną ilość (99 sztuk).', true)
        }
      } else if (action === 'decrease') {
        product.qty--
        if (product.qty <= 0) {
          cart = cart.filter((p) => p.id !== productId)
        }
      }
      saveAndRefreshCart()
    })
  })

  const qtyInputs = document.querySelectorAll('.input-qty')
  qtyInputs.forEach((input) => {
    input.addEventListener('change', (e) => {
      const productId = parseInt(e.target.getAttribute('data-id'))
      let newQty = parseInt(e.target.value)
      const product = cart.find((p) => p.id === productId)

      if (isNaN(newQty) || newQty <= 0) {
        cart = cart.filter((p) => p.id !== productId)
      } else {
        if (newQty > 99) {
          product.qty = 99
          pokazKomunikat('Maksymalna ilość to 99 sztuk.', true)
        } else {
          product.qty = Math.floor(newQty)
        }
      }
      saveAndRefreshCart()
    })
  })

  const deleteButtons = document.querySelectorAll('.btn-delete')
  deleteButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const productId = parseInt(e.target.getAttribute('data-id'))
      cart = cart.filter((p) => p.id !== productId)
      saveAndRefreshCart()
    })
  })
}

function generateOrderNumber() {
  return (
    'EKO-' +
    Date.now() +
    '-' +
    Math.random().toString(36).substr(2, 9).toUpperCase()
  )
}

function setupCheckoutForm() {
  const form = document.getElementById('formularz-zamowienia')
  if (!form) return

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    if (cart.length === 0) {
      pokazKomunikat('Twój koszyk jest pusty!', true)
      return
    }

    const customerName = document.getElementById('imie').value.trim()
    const customerEmail = document.getElementById('email').value.trim()
    const customerAddress = document.getElementById('adres').value.trim()
    const deliveryMethod = document.getElementById('dostawa').value

    if (!customerName || !customerEmail || !customerAddress) {
      pokazKomunikat('Wypełnij wszystkie pola formularza!', true)
      return
    }

    const productsTotalSum = cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    )
    const deliveryCost =
      productsTotalSum >= 100 || productsTotalSum === 0 ? 0 : 15
    const finalTotal = productsTotalSum + deliveryCost

    const order = {
      orderNumber: generateOrderNumber(),
      date: new Date().toLocaleDateString('pl-PL'),
      customer: {
        name: customerName,
        email: customerEmail,
        address: customerAddress,
        deliveryMethod: deliveryMethod,
      },
      items: JSON.parse(JSON.stringify(cart)),
      total: finalTotal,
    }

    let orders = JSON.parse(localStorage.getItem('eko_orders')) || []
    orders.push(order)
    localStorage.setItem('eko_orders', JSON.stringify(orders))

    cart = []
    localStorage.removeItem('eko_koszyk')

    pokazKomunikat('Zamówienie złożone! Numer: ' + order.orderNumber)

    setTimeout(() => {
      window.location.href = './orders.html'
    }, 2000)
  })
}

// INICJALIZACJA
renderCart()
updateCartCounter()
setupCheckoutForm()
