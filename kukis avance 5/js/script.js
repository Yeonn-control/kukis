/* ---------- Datos (array de productos) ---------- */
const productsList = [
  { id: 'p1', name: 'Galleta chispas', price: 1000, img: 'img/choco-chip.jpeg', description: 'Suave por dentro, crujiente por fuera.' },
  { id: 'p2', name: 'Galleta Oreo', price: 1500, img: 'img/oreo.jpeg', description: 'Clásica y deliciosa.' },
  { id: 'p3', name: 'Galleta Red Velvet', price: 1300, img: 'img/red-velvet.jpeg', description: 'Textura suave y color intenso.' },
  { id: 'p4', name: 'Galletas Navideñas', price: 1400, img: 'img/GalletasNavidenias.jpeg', description: 'Edición especial con especias y glaseado festivo.' }
];

const CART_KEY = 'kukis_cart_v1';
let cart = { items: {} };

/* ---------- Selectores ---------- */
const cartCount = document.getElementById('cartCount');
const cartPanel = document.getElementById('cartPanel');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartBtn = document.getElementById('cartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const orderMsg = document.getElementById('orderMsg');

const contactForm = document.getElementById('contactForm');
const contactMsgBox = document.getElementById('contactMsgBox');
const surveyForm = document.getElementById('surveyForm');
const surveyMsg = document.getElementById('surveyMsg');

const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');

/* ---------- Utils ---------- */
function formatCLP(n){ return '$' + Number(n).toLocaleString('es-CL'); }

function recalcCartTotals(){
  let totalQty = 0, totalPrice = 0;
  for (const id in cart.items){
    const it = cart.items[id];
    if (!it) continue;
    totalQty += Number(it.qty || 0);
    totalPrice += Number(it.qty || 0) * Number(it.price || 0);
  }
  return { totalQty, totalPrice };
}

/* ---------- LocalStorage (robusto) ---------- */
let _saveTimer = null;

function saveCartImmediate(){
  try {
    const payload = { version: 1, items: cart.items, updatedAt: Date.now() };
    localStorage.setItem(CART_KEY, JSON.stringify(payload));
  } catch(e){ console.warn('No se pudo guardar carrito', e); }
}

function saveCart(){
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(saveCartImmediate, 200);
}

function loadCart(){
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      if (parsed.items && typeof parsed.items === 'object') {
        cart.items = parsed.items;
      } else {
        cart.items = parsed;
      }
    }
  } catch(e){ console.warn('Error al leer localStorage', e); cart.items = {}; }
}

/* ---------- Renderizar Carrito ---------- */
function updateCartUI(){
  if (!cartCount || !cartItems || !cartTotal) return;
  const totals = recalcCartTotals();
  cartCount.textContent = totals.totalQty;
  cartCount.style.display = totals.totalQty === 0 ? 'none' : '';

  cartItems.innerHTML = '';
  if (Object.keys(cart.items).length === 0) {
    cartItems.innerHTML = '<div class="empty">Tu carrito está vacío</div>';
  } else {
    for (const id in cart.items){
      const it = cart.items[id];
      if (!it) continue;
      const row = document.createElement('div'); row.className = 'cart-row';
      row.innerHTML = `
        <img src="${it.img}" alt="${it.name}">
        <div class="meta" style="flex:1">
          <strong>${it.name}</strong>
          <div style="font-size:12px;color:#666">Precio unitario: ${formatCLP(it.price)}</div>
        </div>
        <div class="controls" style="display:flex;align-items:center;gap:8px">
          <button class="qty-btn qty-minus" data-id="${id}" aria-label="Disminuir cantidad">-</button>
          <div class="qty" data-id="${id}">${it.qty}</div>
          <button class="qty-btn qty-plus" data-id="${id}" aria-label="Aumentar cantidad">+</button>
          <div style="min-width:70px;text-align:right;"><strong>${formatCLP(it.price * it.qty)}</strong></div>
          <button class="remove-btn" data-id="${id}" title="Eliminar" aria-label="Eliminar producto">🗑️</button>
        </div>
      `;
      cartItems.appendChild(row);
    }
  }

  cartTotal.textContent = formatCLP(totals.totalPrice);
  saveCart();

  // eventos dinamicos
  cartItems.querySelectorAll('.qty-plus').forEach(b => {
    b.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id; if (!cart.items[id]) return;
      cart.items[id].qty = Number(cart.items[id].qty || 0) + 1; updateCartUI();
    });
  });
  cartItems.querySelectorAll('.qty-minus').forEach(b => {
    b.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id; if (!cart.items[id]) return;
      if (cart.items[id].qty > 1) cart.items[id].qty = Number(cart.items[id].qty) - 1;
      else delete cart.items[id];
      updateCartUI();
    });
  });
  cartItems.querySelectorAll('.remove-btn').forEach(b => {
    b.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id; delete cart.items[id]; updateCartUI();
    });
  });
}

/* ---------- Habilitar botones agregar (según pestaña activa) ---------- */
function updateAddButtons(){
  const activePage = document.querySelector('.page.active');
  const inProductsPage = activePage && activePage.id === 'productos';
  document.querySelectorAll('.card .add').forEach(btn => {
    // El botón de "Galletas Navideñas" ya viene con disabled en HTML; mantenemos esa prioridad.
    const card = btn.closest('.card');
    const isSpecial = card && card.dataset.id === 'p4';
    if (isSpecial) {
      btn.disabled = true;
      btn.textContent = 'Próximamente';
      btn.title = 'Producto próximamente';
      btn.style.cursor = 'not-allowed';
      return;
    }
    btn.disabled = !inProductsPage;
    btn.title = inProductsPage ? '' : 'Disponible en la pestaña "Productos"';
    btn.style.cursor = inProductsPage ? 'pointer' : 'not-allowed';
  });
}

/* ---------- SPA Navigation ---------- */
function handleNavLinkClick(e){
  e.preventDefault();
  const a = e.currentTarget;
  document.querySelectorAll('#navMenu a').forEach(x => x.classList.remove('active'));
  a.classList.add('active');
  const target = a.dataset.target;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(target);
  if (el) el.classList.add('active');

  // cerrar menu cuando se selecciona
  navMenu.classList.remove('open');
  navMenu.setAttribute('aria-hidden', 'true');
  menuBtn.setAttribute('aria-expanded', 'false');

  // actualizar botones de "Agregar"
  updateAddButtons();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('#navMenu a').forEach(a => a.addEventListener('click', handleNavLinkClick));

/* ---------- Toggle menu y carrito con aria/Focus management ---------- */
if (menuBtn && navMenu) {
  menuBtn.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navMenu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      const firstLink = navMenu.querySelector('a');
      if (firstLink) firstLink.focus();
    } else {
      menuBtn.focus();
    }
  });
}

/* ---------- Panel carrito toggle ---------- */
if (cartBtn && cartPanel) {
  cartBtn.addEventListener('click', ()=>{
    const showing = cartPanel.classList.toggle('show');
    cartPanel.setAttribute('aria-hidden', String(!showing));
    if (showing) {
      const firstControl = cartPanel.querySelector('.qty-plus, .remove-btn, .cart-items');
      if (firstControl) firstControl.focus();
    } else {
      cartBtn.focus();
    }
  });
}

/* ---------- Click global para manejar botones 'Agregar' y animación ---------- */
document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('.add');
  if (addBtn) {
    if (addBtn.disabled) return;
    const card = addBtn.closest('.card');
    if (!card) return;
    const id = card.dataset.id; const name = card.dataset.name; const price = Number(card.dataset.price || 0); const imgSrc = card.dataset.imgSrc;
    if (!cart.items[id]) cart.items[id] = { id, name, price, qty: 0, img: imgSrc };
    cart.items[id].qty = Number(cart.items[id].qty || 0) + 1;
    updateCartUI();

    // animacion fly
    try {
      const img = document.createElement('img'); img.src = imgSrc; img.className = 'fly-img'; document.body.appendChild(img);
      const cardRect = card.getBoundingClientRect(); const cartRect = cartBtn.getBoundingClientRect();
      img.style.left = cardRect.left + 'px'; img.style.top = cardRect.top + 'px';
      requestAnimationFrame(()=>{ img.style.transform = `translate(${cartRect.left - cardRect.left}px, ${cartRect.top - cardRect.top}px) scale(0.2)`; img.style.opacity = '0'; });
      setTimeout(()=>img.remove(), 1000);
    } catch(err){ /* no bloquear si imagen falta */ }
  }
});

/* ---------- Checkout: finalizar compra ---------- */
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    const totals = recalcCartTotals();
    if (totals.totalQty === 0) {
      orderMsg.textContent = 'Tu carrito está vacío.';
      return;
    }
    // Guardar pedido localmente (simulado)
    const ordersKey = 'kukis_orders';
    try {
      const existing = JSON.parse(localStorage.getItem(ordersKey)) || [];
      existing.push({ items: cart.items, total: totals.totalPrice, timestamp: Date.now() });
      localStorage.setItem(ordersKey, JSON.stringify(existing));
    } catch(e){ console.warn('No se pudo guardar orden', e); }

    // Mensaje exacto solicitado por el usuario
    const successText = 'su compra se ha realizado con exito y le hemos notificaco a nuestro equipo para que se ponga manos a la obra con su pedido lo antes posible';
    orderMsg.textContent = successText;

    // Limpiar carrito
    cart.items = {};
    updateCartUI();

    // Mantener mensaje unos segundos
    setTimeout(()=> { orderMsg.textContent = ''; }, 8000);
  });
}

/* ---------- Contacto (front-end demo) ---------- */
if (contactForm){
  contactForm.addEventListener('submit', e=>{
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const msg = document.getElementById('contactMsg').value.trim();
    const payload = { version: 1, timestamp: Date.now(), name, email, msg };
    try {
      localStorage.setItem('contact_' + Date.now(), JSON.stringify(payload));
      if (contactMsgBox) contactMsgBox.textContent = 'Mensaje recibido. Gracias, ' + (name || 'amigo') + '.';
    } catch(e) {
      if (contactMsgBox) contactMsgBox.textContent = 'No se pudo guardar el mensaje en tu navegador.';
      console.warn('No se pudo guardar contacto', e);
    }
    contactForm.reset();
    setTimeout(()=> { if (contactMsgBox) contactMsgBox.textContent = ''; }, 4000);
  });
}

/* ---------- Survey (guarda en localStorage, versionado) ---------- */
if (surveyForm){
  surveyForm.addEventListener('submit', e=>{
    e.preventDefault();
    const form = new FormData(surveyForm);
    const ocasion = form.get('ocasion');
    const mas = form.get('mas');
    const sabores = form.getAll('sabores');
    const record = { version: 1, timestamp: Date.now(), ocasion, mas, sabores };
    const key = 'survey_responses';
    try {
      const existing = JSON.parse(localStorage.getItem(key)) || [];
      existing.push(record);
      localStorage.setItem(key, JSON.stringify(existing));
      if (surveyMsg) surveyMsg.textContent = 'Gracias por responder la encuesta (guardado localmente).';
    } catch(e) {
      if (surveyMsg) surveyMsg.textContent = 'No se pudo guardar la encuesta en tu navegador.';
      console.warn('No se pudo guardar encuesta', e);
    }
    surveyForm.reset();
    setTimeout(()=> { if (surveyMsg) surveyMsg.textContent = ''; }, 3500);
  });
}

/* ---------- Cerrar con ESC y click fuera (nav + cart) ---------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (navMenu.classList.contains('open')) {
      navMenu.classList.remove('open'); navMenu.setAttribute('aria-hidden', 'true'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus();
    }
    if (cartPanel.classList.contains('show')) {
      cartPanel.classList.remove('show'); cartPanel.setAttribute('aria-hidden', 'true');
    }
  }
});

document.addEventListener('click', (e) => {
  if (navMenu.classList.contains('open') && !e.composedPath().includes(navMenu) && !e.composedPath().includes(menuBtn)) {
    navMenu.classList.remove('open'); navMenu.setAttribute('aria-hidden', 'true'); menuBtn.setAttribute('aria-expanded', 'false');
  }
  if (cartPanel.classList.contains('show') && !e.composedPath().includes(cartPanel) && !e.composedPath().includes(cartBtn)) {
    cartPanel.classList.remove('show'); cartPanel.setAttribute('aria-hidden', 'true');
  }
});

/* ---------- Cargar imagen de finanzas automáticamente (varias extensiones) ---------- */
(function loadFinanceImage(){
  const loader = document.getElementById('financeLoader');
  const imgEl = document.getElementById('financeImg');
  const linkEl = document.getElementById('financeLink');
  if (!loader || !imgEl || !linkEl) return;

  const base = loader.dataset.base || 'finanzas';
  const folder = 'img/';
  const exts = ['.svg', '.png', '.webp', '.jpg', '.jpeg'];

  function tryNext(i){
    if (i >= exts.length) {
      imgEl.alt = 'Imagen de finanzas no disponible';
      linkEl.removeAttribute('download');
      linkEl.href = '#';
      imgEl.src = '';
      return;
    }
    const url = folder + base + exts[i];
    const testImg = new Image();
    testImg.onload = function(){
      imgEl.src = url;
      imgEl.alt = 'Resumen financiero';
      linkEl.href = url;
      linkEl.setAttribute('download', base + exts[i]);
    };
    testImg.onerror = function(){
      tryNext(i + 1);
    };
    testImg.src = url;
  }

  tryNext(0);
})();

/* ---------- Init ---------- */
loadCart();
updateCartUI();
updateAddButtons();
