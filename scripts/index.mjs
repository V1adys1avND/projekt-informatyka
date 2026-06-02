let products = []
let cart = JSON.parse(localStorage.getItem('eko_koszyk')) || []

function updateCartCounter() {
  const counter = document.getElementById('licznik-koszyka')
  if (counter) {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)
    counter.textContent = totalItems
  }
}

function saveCart() {
  localStorage.setItem('eko_koszyk', JSON.stringify(cart))
  updateCartCounter()
}

async function loadProducts() {
  try {
    const response = await fetch('./products.json')
    if (!response.ok) throw new Error(`Błąd sieci: ${response.status}`)
    products = await response.json()
    renderProducts(products)
  } catch (error) {
    console.error('Błąd:', error)
    const grid = document.getElementById('grid-produktow')
    if (grid)
      grid.innerHTML = '<p class="brak-wynikow">Błąd ładowania produktów.</p>'
  }
}

function renderProducts(productsList) {
  const grid = document.getElementById('grid-produktow')
  if (!grid) return

  grid.innerHTML = ''

  if (productsList.length === 0) {
    grid.innerHTML = '<p class="brak-wynikow">Brak produktów.</p>'
    return
  }

  const productsHTML = productsList
    .map(
      (product) => `
    <div class="karta-produktu">
        <span class="tag-bio">100% BIO</span>
        <img 
          src="${product.image}" 
          alt="${product.name}" 
          loading="lazy" 
          decoding="async"
          width="300"
          height="300"
        >
        <h3>${product.name}</h3>
        <p class="cena">${product.price.toFixed(2)} zł</p>
        
        <div class="wybor-ilosci-sklep">
          <select class="select-qty" data-id="${product.id}">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `<option value="${n}">${n} szt.</option>`).join('')}
          </select>
        </div>

        <button class="btn-dodaj" data-id="${product.id}">Dodaj do koszyka</button>
    </div>
  `
    )
    .join('')

  grid.innerHTML = productsHTML
  setupAddToCartEvents()
}

function setupAddToCartEvents() {
  const buttons = document.querySelectorAll('.btn-dodaj')
  buttons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const productId = parseInt(e.target.getAttribute('data-id'))
      const karta = e.target.closest('.karta-produktu')
      const selectElement = document.querySelector(
        `.select-qty[data-id="${productId}"]`
      )
      const chosenQty = parseInt(selectElement.value)

      const matchedProduct = products.find((p) => p.id === productId)
      const existingInCart = cart.find((p) => p.id === productId)

      if (existingInCart) {
        existingInCart.qty += chosenQty
      } else {
        cart.push({ ...matchedProduct, qty: chosenQty })
      }

      saveCart()
      selectElement.value = '1'

      let info = karta.querySelector('.info-dodano')
      if (info && info.dataset.timeoutId)
        clearTimeout(parseInt(info.dataset.timeoutId))

      if (!info) {
        info = document.createElement('div')
        info.className = 'info-dodano'
        info.textContent = 'Dodano do koszyka!'
        Object.assign(info.style, {
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(46, 111, 64, 0.9)',
          color: '#ffffff',
          padding: '5px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          zIndex: '10',
          opacity: '0',
          transition: 'opacity 0.3s ease, top 0.3s ease',
          pointerEvents: 'none',
        })
        karta.appendChild(info)
      }

      setTimeout(() => {
        info.style.opacity = '1'
        info.style.top = '15px'
      }, 10)

      const newTimeoutId = setTimeout(() => {
        info.style.opacity = '0'
        info.style.top = '10px'
        setTimeout(() => info.remove(), 300)
      }, 1500)

      info.dataset.timeoutId = newTimeoutId
    })
  })
}

function setupCategoryFilters() {
  const filterButtons = document.querySelectorAll('.btn-filtr')
  filterButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      filterButtons.forEach((btn) => btn.classList.remove('active'))
      e.target.classList.add('active')
      const selectedCategory = e.target.getAttribute('data-kat')
      renderProducts(
        selectedCategory === 'wszystkie'
          ? products
          : products.filter((p) => p.category === selectedCategory)
      )
    })
  })
}

function setupSearchEngine() {
  const searchInput = document.getElementById('wyszukiwarka')
  if (!searchInput) return
  searchInput.addEventListener('input', (e) => {
    const text = e.target.value.toLowerCase()
    renderProducts(products.filter((p) => p.name.toLowerCase().includes(text)))
  })
}

// INICJALIZACJA
if (document.getElementById('grid-produktow')) {
  loadProducts()
  setupCategoryFilters()
  setupSearchEngine()
}

updateCartCounter()
