// ─── PRODUCTS PAGE ────────────────────────────────────────────────────────────

let currentCat = 'all';

async function loadProducts(cat='all', search='') {
  const grid  = document.getElementById('productsGrid');
  const count = document.getElementById('resultsCount');
  grid.innerHTML = '<div class="loading"><div class="spinner"></div><p>Fetching from database…</p></div>';

  try {
    let url = '/api/products';
    const p = new URLSearchParams();
    if (cat !== 'all') p.set('category', cat);
    if (search) p.set('search', search);
    if ([...p].length) url += '?' + p;

    const res  = await fetch(url);
    const json = await res.json();
    const products = json.data;

    if (!products.length) {
      grid.innerHTML = `
        <div class="empty" style="grid-column:1/-1;">
          <div class="empty-img">🔍</div>
          <h3>No products found</h3>
          <p>Try a different category or search term.</p>
          <button class="btn btn-primary btn-sm" onclick="resetFilters()">Show All Products</button>
        </div>`;
      count.textContent = '';
      return;
    }

    count.textContent = `Showing ${products.length} product${products.length!==1?'s':''}`;
    grid.innerHTML = products.map((p,i) => buildCard(p, i * 0.05)).join('');
  } catch(_) {
    grid.innerHTML = `
      <div class="empty" style="grid-column:1/-1;">
        <div class="empty-img">⚠️</div>
        <h3>Cannot connect to server</h3>
        <p>Make sure the Node.js server is running:<br><code style="background:#f3f4f6;padding:4px 8px;border-radius:6px;font-size:.85rem;">node server.js</code></p>
      </div>`;
  }
}

function filterCat(btn, cat) {
  currentCat = cat;
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadProducts(cat, document.getElementById('searchInput').value.trim());
}

function resetFilters() {
  currentCat = 'all';
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-chip[data-cat="all"]').classList.add('active');
  loadProducts();
}

// Debounced search
let searchTimer;
document.getElementById('searchInput').addEventListener('input', function () {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadProducts(currentCat, this.value.trim()), 350);
});

// Admin: update price to simulate market rate
async function updatePrice() {
  const id    = document.getElementById('priceProductId').value.trim();
  const price = document.getElementById('newPrice').value.trim();
  const msg   = document.getElementById('priceUpdateMsg');
  if (!id || !price) { msg.style.color='#EF4444'; msg.textContent='Please enter Product ID and new price.'; return; }
  try {
    const res  = await fetch(`/api/products/${id}/price`, {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({price:parseFloat(price)})
    });
    const json = await res.json();
    if (json.success) {
      msg.style.color='#16A34A';
      msg.textContent=`✅ ${json.data.name} updated to €${parseFloat(json.data.price).toFixed(2)}`;
      const el = document.getElementById(`price-${id}`);
      if (el) el.textContent = `€${parseFloat(json.data.price).toFixed(2)}`;
    } else { msg.style.color='#EF4444'; msg.textContent='❌ '+json.message; }
  } catch(_) { msg.style.color='#EF4444'; msg.textContent='❌ Server error.'; }
}

// Init: read URL param
const initCat = new URLSearchParams(window.location.search).get('category') || 'all';
if (initCat !== 'all') {
  const btn = document.querySelector(`.filter-chip[data-cat="${initCat}"]`);
  if (btn) { document.querySelectorAll('.filter-chip').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); }
}
loadProducts(initCat);
