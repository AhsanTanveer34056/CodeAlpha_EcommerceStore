/* ============================================================
   ShopEasy — shared utilities
   ============================================================ */

const API_BASE = '/api';

// --- Auth helpers ---
function getToken() { return localStorage.getItem('token'); }
function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}
function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
function logout() {
  clearAuth();
  window.location.href = '/login.html';
}
function requireAuth() {
  if (!getUser()) {
    window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
  }
}

// --- API fetch ---
async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// --- Cart helpers ---
function getCart() {
  const c = localStorage.getItem('cart');
  return c ? JSON.parse(c) : [];
}
function _saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  _updateCartBadge();
}
function addToCart(product, quantity) {
  quantity = quantity || 1;
  const cart = getCart();
  const idx = cart.findIndex(i => i.productId === product.id);
  if (idx > -1) {
    cart[idx].quantity += quantity;
  } else {
    cart.push({ productId: product.id, name: product.name, price: parseFloat(product.price), image: product.image, quantity });
  }
  _saveCart(cart);
  showToast(product.name + ' added to cart!', 'success');
  renderCartDrawer();
}
function removeFromCart(productId) {
  _saveCart(getCart().filter(i => i.productId !== productId));
  renderCartDrawer();
}
function updateCartQty(productId, qty) {
  if (qty < 1) { removeFromCart(productId); return; }
  const cart = getCart();
  const item = cart.find(i => i.productId === productId);
  if (item) { item.quantity = qty; _saveCart(cart); }
  renderCartDrawer();
}
function clearCart() { _saveCart([]); renderCartDrawer(); }
function cartCount() { return getCart().reduce((s, i) => s + i.quantity, 0); }
function cartTotal() { return getCart().reduce((s, i) => s + i.price * i.quantity, 0); }

function _updateCartBadge() {
  document.querySelectorAll('#cart-count').forEach(el => el.textContent = cartCount());
}

// --- Formatting ---
function fmt(price) { return '$' + parseFloat(price).toFixed(2); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }

// --- Toast ---
let _toastTimer;
function showToast(msg, type) {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(_toastTimer);
  el.textContent = msg;
  el.className = 'toast toast-' + (type || 'success') + ' show';
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

// --- Navbar auth state ---
function updateNavAuth() {
  const user = getUser();
  const authLinks = document.getElementById('auth-links');
  const userLinks = document.getElementById('user-links');
  const userName = document.getElementById('user-name');

  if (user) {
    if (authLinks) authLinks.style.display = 'none';
    if (userLinks) userLinks.style.display = 'flex';
    if (userName) userName.textContent = user.name;
  } else {
    if (authLinks) authLinks.style.display = 'flex';
    if (userLinks) userLinks.style.display = 'none';
  }
}

// --- Mobile hamburger ---
function toggleMobileNav() {
  const nav = document.getElementById('nav-links');
  const btn = document.getElementById('hamburger');
  if (nav) nav.classList.toggle('mobile-open');
  if (btn) btn.classList.toggle('open');
}

// --- Cart Drawer ---
function _injectCartDrawer() {
  if (document.getElementById('cart-drawer')) return;
  const html = `
    <div class="drawer-overlay" id="drawer-overlay" onclick="closeCartDrawer()"></div>
    <div class="cart-drawer" id="cart-drawer">
      <div class="drawer-header">
        <h3>&#x1F6D2; Cart (<span id="drawer-count">0</span> items)</h3>
        <button class="drawer-close" onclick="closeCartDrawer()" aria-label="Close">&#x2715;</button>
      </div>
      <div class="drawer-body" id="drawer-body"></div>
      <div class="drawer-footer" id="drawer-footer" style="display:none;"></div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function openCartDrawer() {
  renderCartDrawer();
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('drawer-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  // close mobile nav if open
  const nav = document.getElementById('nav-links');
  const btn = document.getElementById('hamburger');
  if (nav) nav.classList.remove('mobile-open');
  if (btn) btn.classList.remove('open');
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartDrawer() {
  const body = document.getElementById('drawer-body');
  const footer = document.getElementById('drawer-footer');
  const countEl = document.getElementById('drawer-count');
  if (!body) return;

  const cart = getCart();
  if (countEl) countEl.textContent = cart.reduce((s, i) => s + i.quantity, 0);

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="drawer-empty">
        <div class="di">&#x1F6D2;</div>
        <p style="font-weight:600;margin-bottom:0.5rem;">Your cart is empty</p>
        <p style="font-size:0.85rem;margin-bottom:1.25rem;">Add some items to get started.</p>
        <a href="/products.html" class="btn btn-primary btn-sm" onclick="closeCartDrawer()">Browse Products</a>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  body.innerHTML = cart.map(item => `
    <div class="drawer-item">
      <img class="drawer-item-img" src="${item.image || 'https://placehold.co/60x46/e5e7eb/6b7280?text=?'}" alt="${escHtml(item.name)}" loading="lazy">
      <div class="drawer-item-info">
        <div class="drawer-item-name">${escHtml(item.name)}</div>
        <div class="drawer-item-price">${fmt(item.price * item.quantity)}</div>
      </div>
      <div class="drawer-item-controls">
        <button class="qty-btn" onclick="_dQty(${item.productId},-1)">&#x2212;</button>
        <span class="qty-val">${item.quantity}</span>
        <button class="qty-btn" onclick="_dQty(${item.productId},1)">&#x2B;</button>
        <button class="remove-btn" onclick="_dRemove(${item.productId})" title="Remove">&#x2715;</button>
      </div>
    </div>`).join('');

  const sub = cartTotal();
  if (footer) {
    footer.style.display = 'block';
    footer.innerHTML = `
      <div class="drawer-total"><span>Total</span><span>${fmt(sub)}</span></div>
      <div class="drawer-actions">
        <a href="/checkout.html" class="btn btn-success btn-full" onclick="closeCartDrawer()">&#x1F512; Checkout</a>
        <a href="/cart.html" class="btn btn-ghost btn-full" onclick="closeCartDrawer()">View Full Cart</a>
      </div>`;
  }
}

function _dQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.productId === productId);
  if (item) updateCartQty(productId, item.quantity + delta);
}

function _dRemove(productId) {
  removeFromCart(productId);
  showToast('Item removed', 'warning');
}

// --- Skeleton grid ---
function renderSkeletonGrid(count) {
  return Array(count || 8).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line w-40"></div>
        <div class="skeleton skeleton-line w-70"></div>
        <div class="skeleton skeleton-line w-full"></div>
        <div class="skeleton skeleton-btn"></div>
      </div>
    </div>`).join('');
}

// --- Product card renderer ---
function renderProductCard(p) {
  const safeP = JSON.stringify(p).replace(/"/g, '&quot;');
  return `
    <div class="product-card">
      <a href="/product.html?id=${p.id}">
        <img class="product-image" src="${p.image || 'https://placehold.co/400x300/e5e7eb/6b7280?text=No+Image'}" alt="${escHtml(p.name)}" loading="lazy">
      </a>
      <div class="product-info">
        <div class="product-category">${escHtml(p.category)}</div>
        <a href="/product.html?id=${p.id}"><div class="product-name">${escHtml(p.name)}</div></a>
        <div class="product-price">${fmt(p.price)}</div>
        <div class="product-actions">
          <a href="/product.html?id=${p.id}" class="btn btn-ghost btn-sm">Details</a>
          <button class="btn btn-primary btn-sm" onclick='addToCart(${JSON.stringify(p)})'>Add to Cart</button>
        </div>
      </div>
    </div>`;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// --- Init on every page ---
document.addEventListener('DOMContentLoaded', () => {
  _injectCartDrawer();
  _updateCartBadge();
  updateNavAuth();

  // Close mobile nav on outside click
  document.addEventListener('click', e => {
    const nav = document.getElementById('nav-links');
    const btn = document.getElementById('hamburger');
    if (nav && btn && nav.classList.contains('mobile-open')) {
      if (!nav.contains(e.target) && !btn.contains(e.target)) {
        nav.classList.remove('mobile-open');
        btn.classList.remove('open');
      }
    }
  });

  // Close drawer on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCartDrawer();
  });
});
