/* js/script.js
   SPA, carrito con localStorage, animaciones, newsletter/contacto + encuesta (front-end)
*/

/* ---------- Datos (array de productos) ---------- */
const productsList = [
  { id: 'p1', name: 'Galleta chispas', price: 900, img: 'img/choco-chip.jpeg' },
  { id: 'p2', name: 'Galleta Oreo', price: 1100, img: 'img/oreo.jpeg' },
  { id: 'p3', name: 'Galleta Red Velvet', price: 1300, img: 'img/red-velvet.jpeg' }
];

const CART_KEY = 'kukis_cart_v1';
let cart = { items: {} };

/* ---------- Selectores ---------- */
const cartCount = document.getElementById('cartCount');
const cartPanel = document.getElementById('cartPanel');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartBtn = document.getElementById('cartBtn');
const playBtn = document.getElementById('playMusicBtn');
const bgAudio = document.getElementById('bg-audio');
const newsletterForm = document.getElementById('newsletterForm');
const newsletterMsg = document.getElementById('newsletterMsg');
const contactForm = document.getElementById('contactForm');
const contactMsgBox = document.getElementById('contactMsgBox');
const surveyForm = document.getElementById('surveyForm');
const surveyMsg = document.getElementById('surveyMsg');

const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');

/* ---------- NAV toggle ---------- */
menuBtn.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navMenu.setAttribute('aria-hidden', !open);
});

/* ---------- SPA Navigation ---------- */
document.querySelectorAll('#navMenu a').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  document.querySelectorAll('#navMenu a').forEach(x => x.classList.remove('active'));
  a.classList.add('active');
  const target = a.dataset.target;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(target).classList.add('active');
  // cerrar menu cuando se selecciona
  navMenu.classList.remove('open');
  navMenu.setAttribute('aria-hidden', 'true');
}));

/* ---------- LocalStorage ---------- */
function loadCart(){
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    if (saved && typeof saved === 'object') cart.items = saved;
  } catch(e){ console.warn('Error al leer localStorage', e); }
}
function saveCart(){
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart.items)); }
  catch(e){ console.warn('No se pudo guardar carrito', e); }
}

/* ---------- Utils ---------- */
function formatCLP(n){ return '$' + n.toLocaleString('es-CL'); }
function recalcCartTotals(){
  let totalQty = 0, totalPrice = 0;
  for (const id in cart.items){
    totalQty += cart.items[id].qty;
    totalPrice += cart.items[id].qty * cart.items[id].price;
  }
  return { totalQty, totalPrice };
}

/* ---------- Renderizar Carrito ---------- */
function updateCartUI(){
  const totals = recalcCartTotals();
  cartCount.textContent = totals.totalQty;
  cartItems.innerHTML = '';
  for (const id in cart.items){
    const it = cart.items[id];
    const row = document.createElement('div'); row.className = 'cart-row';
    row.innerHTML = `
      <img src="${it.img}" alt="${it.name}">
      <div class="meta"><strong>${it.name}</strong><small>Precio unitario: ${formatCLP(it.price)}</small></div>
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
  cartTotal.textContent = formatCLP(totals.totalPrice);
  saveCart();

  // eventos dinamicos
  cartItems.querySelectorAll('.qty-plus').forEach(b => b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id; cart.items[id].qty++; updateCartUI();
  }));
  cartItems.querySelectorAll('.qty-minus').forEach(b => b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id; if (cart.items[id].qty>1) cart.items[id].qty--; else delete cart.items[id]; updateCartUI();
  }));
  cartItems.querySelectorAll('.remove-btn').forEach(b => b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id; delete cart.items[id]; updateCartUI();
  }));
}

/* ---------- Habilitar botones agregar (solo en sección Productos) ---------- */
function updateAddButtons(){
  document.querySelectorAll('.card .add').forEach(btn => {
    const inProductsPage = btn.closest('.page') && btn.closest('.page').id === 'productos';
    btn.disabled = !inProductsPage;
    btn.title = inProductsPage ? '' : 'Disponible en la pestaña "Productos"';
    btn.style.cursor = inProductsPage ? 'pointer' : 'not-allowed';
  });
}

/* ---------- Agregar producto + animación ---------- */
document.querySelectorAll('.card .add').forEach(btn => {
  btn.addEventListener('click', function(e){
    if (this.disabled) return;
    const card = e.target.closest('.card');
    const id = card.dataset.id; const name = card.dataset.name; const price = Number(card.dataset.price); const imgSrc = card.dataset.imgSrc;
    if (!cart.items[id]) cart.items[id] = { id, name, price, qty: 0, img: imgSrc };
    cart.items[id].qty++;
    updateCartUI();

    // animacion fly
    const img = document.createElement('img'); img.src = imgSrc; img.className = 'fly-img'; document.body.appendChild(img);
    const cardRect = card.getBoundingClientRect(); const cartRect = cartBtn.getBoundingClientRect();
    img.style.left = cardRect.left + 'px'; img.style.top = cardRect.top + 'px';
    requestAnimationFrame(()=>{ img.style.transform = `translate(${cartRect.left - cardRect.left}px, ${cartRect.top - cardRect.top}px) scale(0.2)`; img.style.opacity = '0'; });
    setTimeout(()=>img.remove(), 1000);
  });
});

/* ---------- Audio ---------- */
function tryPlayAudio(){ if (!bgAudio) return; bgAudio.play().catch(()=>{}); }
if (playBtn){
  playBtn.addEventListener('click', ()=>{
    if (bgAudio.paused){ bgAudio.play().then(()=> playBtn.textContent = '🔇 Pausar música').catch(()=> playBtn.textContent = '🔊 Reproducir música'); }
    else { bgAudio.pause(); playBtn.textContent = '🔊 Reproducir música'; }
  });
}
document.addEventListener('click', function once(){ tryPlayAudio(); document.removeEventListener('click', once); });

/* ---------- Newsletter (front-end demo) ---------- */
if (newsletterForm){
  newsletterForm.addEventListener('submit', e=>{
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    localStorage.setItem('newsletter_' + Date.now(), email);
    newsletterMsg.textContent = 'Gracias — te hemos agregado a la lista (demo).';
    newsletterForm.reset();
    setTimeout(()=> newsletterMsg.textContent = '', 3000);
  });
}

/* ---------- Contacto (front-end demo) ---------- */
if (contactForm){
  contactForm.addEventListener('submit', e=>{
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const msg = document.getElementById('contactMsg').value;
    localStorage.setItem('contact_' + Date.now(), JSON.stringify({ name, email, msg }));
    contactMsgBox.textContent = 'Mensaje recibido. Gracias, ' + (name || 'amigo') + '.';
    contactForm.reset();
    setTimeout(()=> contactMsgBox.textContent = '', 4000);
  });
}

/* ---------- Survey (guarda en localStorage) ---------- */
if (surveyForm){
  surveyForm.addEventListener('submit', e=>{
    e.preventDefault();
    const form = new FormData(surveyForm);
    const ocasion = form.get('ocasion');
    const mas = form.get('mas');
    const sabores = form.getAll('sabores');
    const record = { timestamp: Date.now(), ocasion, mas, sabores };
    // Guardar arreglo de respuestas
    const key = 'survey_responses';
    const existing = JSON.parse(localStorage.getItem(key)) || [];
    existing.push(record);
    localStorage.setItem(key, JSON.stringify(existing));
    surveyMsg.textContent = 'Gracias por responder la encuesta (guardado localmente).';
    surveyForm.reset();
    setTimeout(()=> surveyMsg.textContent = '', 3500);
  });
}

/* ---------- Panel carrito toggle ---------- */
cartBtn.addEventListener('click', ()=> cartPanel.classList.toggle('show'));

/* ---------- Init ---------- */
loadCart();
updateCartUI();
updateAddButtons();
