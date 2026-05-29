// ─── CHECKOUT PAGE ────────────────────────────────────────────────────────────

async function loadSummary() {
  const el = document.getElementById('summaryItems');
  try {
    const res  = await fetch(`/api/cart/${getSessionId()}`);
    const json = await res.json();
    const items = json.data, total = json.total;

    if (!items || items.length === 0) {
      document.getElementById('emptyModal').style.display = 'flex';
      return;
    }

    const delivery   = total >= 40 ? 0 : 4.99;
    const grandTotal = (total + delivery).toFixed(2);

    el.innerHTML = `
      ${items.map(i=>`
        <div class="summary-row">
          <span style="color:var(--dark);font-weight:600;">${i.name}
            <span style="color:var(--grey);font-weight:400;">×${i.quantity}</span>
          </span>
          <span style="font-weight:700;">€${parseFloat(i.subtotal).toFixed(2)}</span>
        </div>`).join('')}
      <div class="summary-row" style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--border);">
        <span>Subtotal</span><span style="font-weight:700;">€${total.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Delivery</span>
        <span>${delivery===0?'<span class="free-badge">FREE</span>':'<span style="font-weight:700;">€'+delivery.toFixed(2)+'</span>'}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span><span class="amount">€${grandTotal}</span>
      </div>`;
  } catch(_) {
    el.innerHTML = '<p style="color:#EF4444;font-size:.85rem;">Could not load cart.</p>';
  }
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────

function showErr(id, msg) {
  document.getElementById(id)?.classList.add('err');
  const e = document.getElementById(id+'Err');
  if (e) e.textContent = msg;
}
function clearErr(id) {
  document.getElementById(id)?.classList.remove('err');
  const e = document.getElementById(id+'Err');
  if (e) e.textContent = '';
}
function clearAll() {
  ['firstName','lastName','email','phone','address','city','cardName','cardNumber','expiry','cvv'].forEach(clearErr);
}
function val(id) { return document.getElementById(id)?.value.trim() || ''; }

function validate() {
  clearAll();
  let ok = true;

  // Letters only fields
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;

  const fn = val('firstName');
  if (!fn) { showErr('firstName','First name is required'); ok=false; }
  else if (!nameRegex.test(fn)) { showErr('firstName','First name must contain letters only'); ok=false; }

  const ln = val('lastName');
  if (!ln) { showErr('lastName','Last name is required'); ok=false; }
  else if (!nameRegex.test(ln)) { showErr('lastName','Last name must contain letters only'); ok=false; }

  const em = val('email');
  if (!em) { showErr('email','Email is required'); ok=false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { showErr('email','Enter a valid email'); ok=false; }

  const ph = val('phone');
  if (!ph) { showErr('phone','Phone is required'); ok=false; }
  else if (!/^[\d\s\+\-\(\)]{7,}$/.test(ph)) { showErr('phone','Enter a valid phone number'); ok=false; }

  if (!val('address'))  { showErr('address','Address is required'); ok=false; }

  const ci = val('city');
  if (!ci) { showErr('city','City is required'); ok=false; }
  else if (!nameRegex.test(ci)) { showErr('city','City must contain letters only'); ok=false; }

  const cn_name = val('cardName');
  if (!cn_name) { showErr('cardName','Cardholder name is required'); ok=false; }
  else if (!nameRegex.test(cn_name)) { showErr('cardName','Name must contain letters only'); ok=false; }

  const cn = val('cardNumber').replace(/\s/g,'');
  if (!cn) { showErr('cardNumber','Card number is required'); ok=false; }
  else if (!/^\d{16}$/.test(cn)) { showErr('cardNumber','Enter a valid 16-digit card number'); ok=false; }

  const ex = val('expiry');
  if (!ex) { showErr('expiry','Expiry date is required'); ok=false; }
  else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(ex)) { showErr('expiry','Format: MM/YY'); ok=false; }

  const cv = val('cvv');
  if (!cv) { showErr('cvv','CVV is required'); ok=false; }
  else if (!/^\d{3,4}$/.test(cv)) { showErr('cvv','3 or 4 digits'); ok=false; }

  return ok;
}

// ─── REAL-TIME INPUT FILTERS ──────────────────────────────────────────────────

// Letters only — show error message if user types a number
['firstName','lastName','city','cardName'].forEach(function(id) {
  document.getElementById(id)?.addEventListener('input', function () {
    if (/[0-9]/.test(this.value)) {
      showErr(id, 'Only letters and spaces allowed here');
    } else {
      clearErr(id);
    }
  });
});

// Phone — show error message if user types a letter
document.getElementById('phone')?.addEventListener('input', function () {
  if (/[a-zA-Z]/.test(this.value)) {
    showErr('phone', 'Only numbers allowed here');
  } else {
    clearErr('phone');
  }
});

// CVV — show error message if user types a letter
document.getElementById('cvv')?.addEventListener('input', function () {
  this.value = this.value.slice(0, 4);
  if (/[a-zA-Z]/.test(this.value)) {
    showErr('cvv', 'Only numbers allowed here');
  } else {
    clearErr('cvv');
  }
});

// Auto-format card number — numbers only + spaces every 4 digits
document.getElementById('cardNumber')?.addEventListener('input', function () {
  this.value = this.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19);
});

// Auto-format expiry — numbers only + slash after 2 digits
document.getElementById('expiry')?.addEventListener('input', function () {
  let v = this.value.replace(/\D/g,'');
  if (v.length >= 3) v = v.slice(0,2)+'/'+v.slice(2,4);
  this.value = v;
});

// ─── PLACE ORDER ──────────────────────────────────────────────────────────────

async function placeOrder() {
  if (!validate()) { window.scrollTo({top:0,behavior:'smooth'}); return; }

  try {
    const res  = await fetch('/api/checkout', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        session_id: getSessionId(),
        customer: { name: `${val('firstName')} ${val('lastName')}`, email: val('email') }
      })
    });
    const json = await res.json();
    if (json.success) {
      document.getElementById('orderDetails').innerHTML = `
        <p>
          <strong>Customer:</strong> ${json.order.customer}<br>
          <strong>Email:</strong> ${val('email')}<br>
          <strong>Items:</strong> ${json.order.items} product(s)<br>
          <strong>Total paid:</strong> €${json.order.total}<br>
          <strong>Estimated delivery:</strong> ${json.order.estimatedDelivery}
        </p>`;
      document.getElementById('successModal').style.display = 'flex';
      updateCartBadge();
    } else {
      if (json.message === 'Cart is empty') document.getElementById('emptyModal').style.display = 'flex';
      else showToast(json.message || 'Order failed', 'error');
    }
  } catch(_) { showToast('Server error. Is the server running?','error'); }
}

loadSummary();
