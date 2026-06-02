let ordersHistory = JSON.parse(localStorage.getItem('eko_orders')) || []
const cart = JSON.parse(localStorage.getItem('eko_koszyk')) || []

function updateCartCounter() {
  const counter = document.getElementById('licznik-koszyka')
  if (counter) {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)
    counter.textContent = totalItems
  }
}

function highlightActiveMenu() {
  const currentUrl = window.location.pathname
  const navLinks = document.querySelectorAll('nav a')

  navLinks.forEach((link) => {
    link.classList.remove('active')
    const hrefValue = link.getAttribute('href')

    if (
      currentUrl.endsWith(hrefValue.replace('./', '')) ||
      (currentUrl.endsWith('/') && hrefValue.includes('index.html'))
    ) {
      link.classList.add('active')
    }
  })
}

// MODALNE POTWIERDZENIA
function pokazPotwierdzenieAnulowania(orderNumber, naZatwierdzenie) {
  const stareOkno = document.getElementById('eko-modal-potwierdzenie')
  if (stareOkno) stareOkno.remove()

  const tloModal = document.createElement('div')
  tloModal.id = 'eko-modal-potwierdzenie'
  tloModal.style.position = 'fixed'
  tloModal.style.top = '0'
  tloModal.style.left = '0'
  tloModal.style.width = '100vw'
  tloModal.style.height = '100vh'
  tloModal.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'
  tloModal.style.display = 'flex'
  tloModal.style.justifyContent = 'center'
  tloModal.style.alignItems = 'center'
  tloModal.style.zIndex = '10000'

  const okienko = document.createElement('div')
  okienko.style.backgroundColor = '#ffffff'
  okienko.style.padding = '30px'
  okienko.style.borderRadius = '8px'
  okienko.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'
  okienko.style.maxWidth = '450px'
  okienko.style.width = '90%'
  okienko.style.textAlign = 'center'

  okienko.innerHTML = `
    <h3 style="color: #333d35; margin-bottom: 15px; font-size: 20px;">Anulowanie zamówienia</h3>
    <p style="color: #666; margin-bottom: 25px; line-height: 1.5;">Czy na pewno chcesz anulować zamówienie <strong style="color: #ff4d4d;">${orderNumber}</strong>? Ta operacja jest nieodwracalna.</p>
    <div style="display: flex; justify-content: center; gap: 15px;">
      <button id="modal-anuluj" class="btn-usun-mini" style="background-color: #777; padding: 10px 20px; font-size: 14px; font-weight: bold;">Anuluj</button>
      <button id="modal-zatwierdz" class="btn-dodaj" style="background-color: #ff4d4d; padding: 10px 20px; font-size: 14px; font-weight: bold; width: auto;">Zatwierdź</button>
    </div>
  `

  tloModal.appendChild(okienko)
  document.body.appendChild(tloModal)

  document.getElementById('modal-anuluj').addEventListener('click', () => {
    tloModal.remove()
  })

  document.getElementById('modal-zatwierdz').addEventListener('click', () => {
    naZatwierdzenie()
    tloModal.remove()
  })
}

function renderOrders() {
  const ordersListHTML = document.getElementById('lista-zamowien')
  if (!ordersListHTML) return

  ordersListHTML.innerHTML = ''

  if (ordersHistory.length === 0) {
    ordersListHTML.innerHTML =
      '<p class="brak-wynikow" style="text-align: center; margin-top: 20px;">Nie złożyłeś jeszcze żadnych zamówień w naszym sklepie.</p>'
    return
  }

  ;[...ordersHistory].reverse().forEach((order) => {
    const orderCard = document.createElement('div')
    orderCard.className = 'karta-zamowienia'

    const itemsListHTML = order.items
      .map(
        (item) => `
            <li>${item.name} - <strong>${item.qty} szt.</strong> (${(item.price * item.qty).toFixed(2)} zł)</li>
        `
      )
      .join('')

    orderCard.innerHTML = `
            <div class="naglowek-zamowienia">
                <span>Numer zamówienia: ${order.orderNumber}</span>
                <span>Data zakupu: ${order.date}</span>
            </div>
            <div class="szczegoly-zamowienia" style="padding: 10px 0;">
                <p style="margin-bottom: 6px;"><strong>Status:</strong> W trakcie kompletowania (Pakowanie zero-waste)</p>
                <p style="margin-bottom: 6px;"><strong>Odbiorca i adres dostawy:</strong> ${order.customer.name}, ${order.customer.address}</p>
                <p style="margin-bottom: 6px;"><strong>Wybrana dostawa:</strong> ${order.customer.deliveryMethod}</p>
                
                <p style="margin-top: 15px; margin-bottom: 5px; font-weight: 600;">Zakupione produkty:</p>
                <ul style="margin-left: 20px; margin-bottom: 15px; color: #555; line-height: 1.6;">
                    ${itemsListHTML}
                </ul>
                
                <hr style="border: 0; border-top: 1px dashed #e1ebd5; margin-bottom: 10px;">
                
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <button class="btn-anuluj-zamowienie" data-number="${order.orderNumber}" style="background-color: #ff4d4d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;">Anuluj zamówienie</button>
                    <p style="font-weight: bold; color: #2e6f40; font-size: 16px; text-align: right; margin: 0;">
                        Razem zapłacono: ${order.total.toFixed(2)} zł
                    </p>
                </div>
            </div>
        `
    ordersListHTML.appendChild(orderCard)
  })

  setupCancelOrderEvents()
}

function setupCancelOrderEvents() {
  const cancelButtons = document.querySelectorAll('.btn-anuluj-zamowienie')

  cancelButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const orderNumber = e.target.getAttribute('data-number')

      pokazPotwierdzenieAnulowania(orderNumber, () => {
        ordersHistory = ordersHistory.filter(
          (order) => order.orderNumber !== orderNumber
        )
        localStorage.setItem('eko_orders', JSON.stringify(ordersHistory))

        renderOrders()
      })
    })
  })
}

// INICJALIZACJA
if (document.getElementById('lista-zamowien')) {
  renderOrders()
}

highlightActiveMenu()
updateCartCounter()
