// Navegación SPA simple
document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  document.querySelectorAll('nav a').forEach(x => x.classList.remove('active'));
  a.classList.add('active');
  const target = a.dataset.target;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(target).classList.add('active');
}));

// Carrito simple en memoria
const cart = { items: {}, count: 0, total: 0 };
const cartCount = document.getElementById('cartCount');
const cartPanel = document.getElementById('cartPanel');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartBtn = document.getElementById('cartBtn');

cartBtn.addEventListener('click', () => {
  cartPanel.classList.toggle('show');
});

function formatCLP(n) { return '$' + n.toLocaleString('es-CL'); }

function recalcCartTotals() {
  let totalQty = 0; let totalPrice = 0;
  for (const id in cart.items) { totalQty += cart.items[id].qty; totalPrice += cart.items[id].qty * cart.items[id].price; }
  cart.count = totalQty; cart.total = totalPrice;
}

function updateCartUI() {
  recalcCartTotals();
  cartCount.textContent = cart.count;
  cartItems.innerHTML = '';
  for (const id in cart.items) {
    const it = cart.items[id];
    const row = document.createElement('div'); row.className = 'cart-row';
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

  // Añadir listeners a botones creados
  cartItems.querySelectorAll('.qty-plus').forEach(b => b.addEventListener('click', e => {
    const id = e.currentTarget.dataset.id; cart.items[id].qty += 1; updateCartUI();
    cartBtn.classList.add('bounce'); setTimeout(() => cartBtn.classList.remove('bounce'), 460);
  }));
  cartItems.querySelectorAll('.qty-minus').forEach(b => b.addEventListener('click', e => {
    const id = e.currentTarget.dataset.id; if (cart.items[id].qty > 1) { cart.items[id].qty -= 1; } else { delete cart.items[id]; }
    updateCartUI();
  }));
  cartItems.querySelectorAll('.remove-btn').forEach(b => b.addEventListener('click', e => {
    const id = e.currentTarget.dataset.id; if (cart.items[id]) delete cart.items[id]; updateCartUI();
  }));
}

// Agregar al carrito con animación de "volar" imagen
document.querySelectorAll('.card .add').forEach(btn => {
  btn.addEventListener('click', async e => {
    const card = e.target.closest('.card');
    const imgContainer = card.querySelector('.card-img'); // Selecciona el div de la imagen
    const id = card.dataset.id; 
    const name = card.dataset.name; 
    const price = Number(card.dataset.price);
    const imgSrc = card.dataset.imgSrc; // Obtiene la ruta de la imagen

    // Crear una imagen para la animación de vuelo
    const flyingImg = document.createElement('img');
    flyingImg.src = imgSrc;
    flyingImg.className = 'flying-img';
    document.body.appendChild(flyingImg);
    
    const imgRect = imgContainer.getBoundingClientRect();
    flyingImg.style.width = imgRect.width + 'px';
    flyingImg.style.height = imgRect.height + 'px';
    flyingImg.style.left = imgRect.left + 'px';
    flyingImg.style.top = imgRect.top + 'px';

    const cartRect = cartBtn.getBoundingClientRect();
    const dx = cartRect.left + cartRect.width / 2 - (imgRect.left + imgRect.width / 2);
    const dy = cartRect.top + cartRect.height / 2 - (imgRect.top + imgRect.height / 2);

    // Forzar reflow
    flyingImg.getBoundingClientRect();
    flyingImg.style.transition = 'transform .7s cubic-bezier(.2,.8,.2,1), opacity .7s ease';
    flyingImg.style.transform = `translate(${dx}px, ${dy}px) scale(.15)`;
    flyingImg.style.opacity = '0.9';

    // Esperar la transición
    flyingImg.addEventListener('transitionend', () => {
      flyingImg.remove();
      cartBtn.classList.add('bounce');
      setTimeout(() => cartBtn.classList.remove('bounce'), 460);
    }, { once: true });

    // Actualizar datos del carrito (inmediato para UX)
    if (!cart.items[id]) cart.items[id] = { id, name, price, qty: 0, img: imgSrc };
    cart.items[id].qty += 1;
    updateCartUI();
  });
});