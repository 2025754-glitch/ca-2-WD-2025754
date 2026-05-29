// ─── CART PAGE ────────────────────────────────────────────────────────────────

const CAT_GRADS = {
  dogs:'linear-gradient(135deg,#FEF3C7,#FDE68A)',
  cats:'linear-gradient(135deg,#FCE7F3,#FBCFE8)',
  toys:'linear-gradient(135deg,#DBEAFE,#BFDBFE)',
  accessories:'linear-gradient(135deg,#D1FAE5,#A7F3D0)',
  grooming:'linear-gradient(135deg,#EDE9FE,#DDD6FE)',
  health:'linear-gradient(135deg,#DCFCE7,#BBF7D0)',
  fish:'linear-gradient(135deg,#CFFAFE,#A5F3FC)'
};
const CAT_EMOJIS = {
  dogs:'🐕', cats:'🐈', toys:'🎾',
  accessories:'🛏️', grooming:'✂️', health:'💊', fish:'🐠'
};

let cartTotal = 0; // store total for promo calculation

async function loadCart() {
  const main = document.getElementById('cartMain');
  try {
    const res  = await fetch(`/api/cart/${getSessionId()}`);
    const json = await res.json();
    const items = json.data, total = json.total;
    cartTotal = total; // save for promo use

    if (!items || items.length === 0) {
      main.innerHTML = `
        <div style="padding:48px 6%;">
          <div class="empty">
            <div class="empty-img">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet.<br>Browse our products and treat your pet!</p>
            <a href="/products" class="btn btn-primary">Shop Now →</a>
          </div>
        </div>`;
      return;
    }

    const delivery   = total >= 40 ? 0 : 4.99;
    const grandTotal = (total + delivery).toFixed(2);

    main.innerHTML = `
      <div class="cart-layout">
        <!-- LEFT: Items -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
            <h2 style="font-size:1rem;font-weight:800;color:var(--dark);">
              ${items.length} item${items.length !== 1 ? 's' : ''} in your cart
            </h2>
            <button onclick="clearCart()"
              style="background:#FEE2E2;color:#EF4444;border:none;border-radius:50px;font-size:.78rem;font-weight:700;cursor:pointer;padding:8px 18px;">
              🗑️ Clear All
            </button>
          </div>
          <div class="cart-items" id="cartItemsList">
            ${items.map(buildCartCard).join('')}
          </div>
        </div>

        <!-- RIGHT: Summary -->
        <div>
          <div class="summary-card">
            <h3>🧾 Order Summary</h3>

            ${items.map(i => `
              <div class="summary-row">
                <span style="color:var(--dark);font-weight:600;">${i.name}
                  <span style="color:var(--grey);font-weight:400;">×${i.quantity}</span>
                </span>
                <span style="font-weight:700;">€${parseFloat(i.subtotal).toFixed(2)}</span>
              </div>`).join('')}

            <div class="summary-row" style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--border);">
              <span>Subtotal</span><span style="font-weight:700;">€${total.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Delivery</span>
              <span>${delivery === 0
                ? '<span class="free-badge">FREE</span>'
                : `<span style="font-weight:700;">€${delivery.toFixed(2)}</span>`}</span>
            </div>
            ${delivery > 0
              ? `<p style="font-size:.77rem;background:#FFF7ED;color:#C2410C;padding:10px 14px;border-radius:10px;margin:8px 0;border:1px solid #FED7AA;">
                  🚚 Add €${(40 - total).toFixed(2)} more for <strong>free delivery!</strong>
                 </p>`
              : `<p style="font-size:.77rem;background:#F0FDF4;color:#15803D;padding:10px 14px;border-radius:10px;margin:8px 0;border:1px solid #BBF7D0;">
                  🎉 You qualify for <strong>free delivery!</strong>
                 </p>`}

            <div class="summary-row total">
              <span>Total</span><span class="amount">€${grandTotal}</span>
            </div>

            <div class="promo-box" style="margin-top:8px;">
              <input type="text" placeholder="Promo code (e.g. PAWSHOP10)" id="promoInput" />
              <button onclick="applyPromo()">Apply</button>
            </div>
            <p id="promoMsg" style="font-size:.76rem;margin-top:4px;font-weight:600;"></p>

            <a href="/checkout" class="btn btn-primary" style="width:100%;margin-top:18px;font-size:.95rem;padding:15px;">
              Proceed to Checkout →
            </a>
            <a href="/products" class="btn btn-ghost btn-sm" style="width:100%;margin-top:10px;">
              ← Continue Shopping
            </a>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;">
            <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;font-size:.76rem;color:var(--grey);">
              🔒 <strong style="color:var(--dark);display:block;margin-top:4px;">Secure Checkout</strong>
            </div>
            <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;font-size:.76rem;color:var(--grey);">
              🔄 <strong style="color:var(--dark);display:block;margin-top:4px;">30-Day Returns</strong>
            </div>
          </div>
        </div>
      </div>`;
  } catch (_) {
    main.innerHTML = `<div style="padding:60px;text-align:center;"><p style="color:#EF4444;">⚠️ Could not load cart. Is the server running?</p></div>`;
  }
}

// ─── CART ITEM CARD ───────────────────────────────────────────────────────────
function buildCartCard(item) {
  const grad  = CAT_GRADS[item.category]  || 'linear-gradient(135deg,#F3F4F6,#E5E7EB)';
  const emoji = CAT_EMOJIS[item.category] || '🐾';

  // Image: use real photo if available, otherwise gradient+emoji fallback
  const imgHtml = item.image
    ? `<img src="${item.image}" alt="${item.name}"
           style="width:88px;height:88px;object-fit:cover;border-radius:12px;flex-shrink:0;"
           onerror="this.outerHTML='<div style=\\'width:88px;height:88px;border-radius:12px;background:${grad};display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0;\\'>${emoji}</div>'"
         />`
    : `<div style="width:88px;height:88px;border-radius:12px;background:${grad};display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0;">${emoji}</div>`;

  return `
    <div class="cart-card" id="cart-item-${item.id}">
      ${imgHtml}
      <div class="cart-info">
        <p class="cart-cat">${item.category}</p>
        <p class="cart-name">${item.name}</p>
        <p class="cart-unit">€${parseFloat(item.price).toFixed(2)} each</p>
      </div>
      <div class="qty-box" aria-label="Quantity for ${item.name}">
        <button onclick="changeQty(${item.id},${item.quantity},-1)" aria-label="Decrease">−</button>
        <span id="qty-${item.id}">${item.quantity}</span>
        <button onclick="changeQty(${item.id},${item.quantity},+1)" aria-label="Increase">+</button>
      </div>
      <p class="cart-subtotal" id="sub-${item.id}">€${parseFloat(item.subtotal).toFixed(2)}</p>
      <button class="cart-remove" onclick="removeItem(${item.id})" aria-label="Remove ${item.name}">🗑️</button>
    </div>`;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
async function changeQty(id, current, delta) {
  const newQty = current + delta;
  if (newQty < 1) { removeItem(id); return; }
  try {
    await fetch(`/api/cart/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty })
    });
    loadCart(); updateCartBadge();
  } catch (_) { showToast('Error updating cart', 'error'); }
}

async function removeItem(id) {
  const el = document.getElementById(`cart-item-${id}`);
  if (el) el.style.cssText = 'opacity:0;transform:translateX(30px);transition:all .3s ease';
  setTimeout(async () => {
    try {
      await fetch(`/api/cart/${id}`, { method: 'DELETE' });
      loadCart(); updateCartBadge(); showToast('Item removed');
    } catch (_) { showToast('Error removing item', 'error'); }
  }, 300);
}

async function clearCart() {
  if (!confirm('Remove all items from your cart?')) return;
  try {
    await fetch(`/api/cart/session/${getSessionId()}`, { method: 'DELETE' });
    loadCart(); updateCartBadge(); showToast('Cart cleared');
  } catch (_) { showToast('Error', 'error'); }
}

function applyPromo() {
  const code = document.getElementById('promoInput')?.value.trim().toUpperCase();
  const msg  = document.getElementById('promoMsg');
  if (!msg) return;

  if (code === 'PAWSHOP10') {
    const discount    = cartTotal * 0.10;
    const delivery    = cartTotal >= 40 ? 0 : 4.99;
    const discounted  = cartTotal - discount;
    const grandTotal  = (discounted + delivery).toFixed(2);

    // Update total displayed
    const amountEl = document.querySelector('.summary-row.total .amount');
    if (amountEl) amountEl.textContent = `€${grandTotal}`;

    // Add discount row if not already there
    const totalRow = document.querySelector('.summary-row.total');
    if (totalRow && !document.getElementById('discountRow')) {
      const discRow = document.createElement('div');
      discRow.id = 'discountRow';
      discRow.className = 'summary-row';
      discRow.style.color = '#16A34A';
      discRow.innerHTML = `<span>🎉 Discount (10%)</span><span style="font-weight:700;">-€${discount.toFixed(2)}</span>`;
      totalRow.parentNode.insertBefore(discRow, totalRow);
    }

    msg.style.color = '#16A34A';
    msg.textContent = '✅ Code applied! 10% discount added.';
    document.getElementById('promoInput').disabled = true;
  } else {
    msg.style.color = '#EF4444';
    msg.textContent = '❌ Invalid promo code.';
  }
}

loadCart();
