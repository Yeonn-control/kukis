// ---- Navegación SPA ----
document.querySelectorAll('nav a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('nav a').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    const target = a.dataset.target;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});

// ---- Carrito + localStorage ----
const CART_KEY = 'kukis_cart_v1';
const cart = { items: {}, count: 0, total: 0 };
const cartCount = document.getElementById('cartCount');
const cartPanel = document.getElementById('cartPanel');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartBtn = document.getElementById('cartBtn');

cartBtn.addEventListener('click', () => {
  cartPanel.classList.toggle('show');
});

function formatCLP(n) {
  return '$' + n.toLocaleString('es-CL');
}

function recalcCartTotals() {
  let totalQty = 0, totalPrice = 0;
  for (const id in cart.items) {
    totalQty += cart.items[id].qty;
    totalPrice += cart.items[id].qty * cart.items[id].price;
  }
  cart.count = totalQty;
  cart.total = totalPrice;
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart.items));
}

function loadCart() {
  const saved = JSON.parse(localStorage.getItem(CART_KEY));
  if (saved && typeof saved === 'object') cart.items = saved;
}

function updateCartUI() {
  recalcCartTotals();
  cartCount.textContent = cart.count;
  cartItems.innerHTML = '';

  for (const id in cart.items) {
    const it = cart.items[id];
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <img src="${it.img}" alt="${it.name}">
      <div class="meta">
        <strong>${it.name}</strong>
        <small>Precio unitario: ${formatCLP(it.price)}</small>
      </div>
      <div class="controls">
        <button class="qty-btn qty-minus" data-id="${id}">-</button>
        <div class="qty" data-id="${id}">${it.qty}</div>
        <button class="qty-btn qty-plus" data-id="${id}">+</button>
        <div style="min-width:70px;text-align:right;"><strong>${formatCLP(it.price * it.qty)}</strong></div>
        <button class="remove-btn" data-id="${id}" title="Eliminar">🗑️</button>
      </div>
    `;
    cartItems.appendChild(row);
  }

  cartTotal.textContent = formatCLP(cart.total);
  saveCart();

  cartItems.querySelectorAll('.qty-plus').forEach(b => {
    b.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      cart.items[id].qty++;
      updateCartUI();
      cartBtn.classList.add('bounce');
      setTimeout(() => cartBtn.classList.remove('bounce'), 460);
    });
  });

  cartItems.querySelectorAll('.qty-minus').forEach(b => {
    b.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      if (cart.items[id].qty > 1) cart.items[id].qty--;
      else delete cart.items[id];
      updateCartUI();
    });
  });

  cartItems.querySelectorAll('.remove-btn').forEach(b => {
    b.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      delete cart.items[id];
      updateCartUI();
    });
  });
}

// ---- Agregar productos ----
document.querySelectorAll('.card .add').forEach(btn => {
  btn.addEventListener('click', e => {
    const card = e.target.closest('.card');
    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = Number(card.dataset.price);
    const imgSrc = card.dataset.imgSrc;

    if (!cart.items[id]) cart.items[id] = { id, name, price, qty: 0, img: imgSrc };
    cart.items[id].qty++;
    updateCartUI();
  });
});

// ---- Audio control ----
const audio = document.getElementById('bg-audio');
const playBtn = document.getElementById('playMusicBtn');

playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playBtn.textContent = '🔇 Pausar música';
  } else {
    audio.pause();
    playBtn.textContent = '🔊 Reproducir música';
  }
});

// ---- Inicialización ----
loadCart();
updateCartUI();
