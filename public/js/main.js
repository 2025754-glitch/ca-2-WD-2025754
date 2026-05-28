// ─── SESSION ──────────────────────────────────────────────────────────────────
function getSessionId() {
  let id = localStorage.getItem('pawshop_session');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).substr(2, 12) + Date.now();
    localStorage.setItem('pawshop_session', id);
  }
  return id;
}

// ─── CART BADGE ───────────────────────────────────────────────────────────────
async function updateCartBadge() {
  try {
    const res  = await fetch(`/api/cart/${getSessionId()}`);
    const json = await res.json();
    const count = json.data ? json.data.reduce((s, i) => s + i.quantity, 0) : 0;
    const el = document.getElementById('cartCount');
    if (el) el.textContent = count;
  } catch (_) {}
}
updateCartBadge();

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${msg}`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.cssText = 'opacity:0;transform:translateY(16px);transition:all .4s ease';
    setTimeout(() => t.remove(), 400);
  }, 3000);
}

// ─── ADD TO CART ──────────────────────────────────────────────────────────────
async function addToCart(id, name) {
  try {
    const res  = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id, session_id: getSessionId(), quantity: 1 })
    });
    const json = await res.json();
    if (json.success) { showToast(`<strong>${name}</strong> added to cart!`); updateCartBadge(); }
    else showToast(json.message || 'Error', 'error');
  } catch (_) { showToast('Server not running!', 'error'); }
}

// ─── CATEGORY CONFIG (for fallback gradient when image fails) ─────────────────
const CAT_CONFIG = {
  dogs:        { emoji: '🐕', gradient: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', badge: 'badge-new',     label: 'New' },
  cats:        { emoji: '🐈', gradient: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)', badge: 'badge-popular', label: 'Popular' },
  toys:        { emoji: '🎾', gradient: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)', badge: 'badge-sale',    label: 'Sale' },
  accessories: { emoji: '🛏️', gradient: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)', badge: 'badge-popular', label: 'Top Rated' },
  grooming:    { emoji: '✂️', gradient: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)', badge: 'badge-new',     label: 'New' },
  health:      { emoji: '💊', gradient: 'linear-gradient(135deg,#DCFCE7,#BBF7D0)', badge: 'badge-health',  label: 'Vet Pick' },
  fish:        { emoji: '🐠', gradient: 'linear-gradient(135deg,#CFFAFE,#A5F3FC)', badge: 'badge-new',     label: 'New' }
};

// ─── PRODUCT CARD BUILDER ─────────────────────────────────────────────────────
function buildCard(p, delay = 0) {
  const cfg = CAT_CONFIG[p.category] || { emoji: '🐾', gradient: 'linear-gradient(135deg,#F3F4F6,#E5E7EB)', badge: 'badge-new', label: 'New' };

  // Use real image if available, fallback to gradient+emoji on error
  const imgContent = p.image
    ? `<img
          src="${p.image}"
          alt="${p.name}"
          loading="lazy"
          onerror="this.style.display='none';this.parentElement.querySelector('.img-fallback').style.display='flex';"
        />
        <div class="img-fallback" style="display:none;width:100%;height:100%;background:${cfg.gradient};align-items:center;justify-content:center;font-size:5.5rem;position:absolute;inset:0;">${cfg.emoji}</div>`
    : `<div style="width:100%;height:100%;background:${cfg.gradient};display:flex;align-items:center;justify-content:center;font-size:5.5rem;">${cfg.emoji}</div>`;

  return `
  <article class="product-card" style="animation-delay:${delay}s" aria-label="${p.name}">
    <div class="product-img-wrap" style="position:relative;">
      ${imgContent}
      <div class="product-img-overlay"></div>
      <span class="product-badge ${cfg.badge}">${cfg.label}</span>
      <div class="product-wishlist" title="Add to wishlist" aria-label="Wishlist">♡</div>
    </div>
    <div class="product-body">
      <p class="product-cat">${p.category}</p>
      <h3 class="product-name">${p.name}</h3>
      <p class="product-desc">${p.description}</p>
      <div class="product-footer">
        <div>
          <p class="product-price" id="price-${p.id}">€${parseFloat(p.price).toFixed(2)}</p>
          <p style="font-size:.72rem;color:#10B981;font-weight:600;margin-top:2px;">${p.stock > 20 ? '✓ In Stock' : '⚡ Low Stock'}</p>
        </div>
        <button class="add-btn" onclick="addToCart(${p.id},'${p.name.replace(/'/g, "\\'")}')">
          + Add
        </button>
      </div>
    </div>
  </article>`;
}

// ─── HAMBURGER ────────────────────────────────────────────────────────────────
const hb = document.getElementById('hamburger');
const nl = document.getElementById('navLinks');
if (hb && nl) {
  hb.addEventListener('click', () => nl.classList.toggle('open'));
  hb.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') nl.classList.toggle('open'); });
}
