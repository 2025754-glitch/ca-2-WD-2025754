const express = require('express');
const path    = require('path');
const { load, save } = require('./database');

const app  = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── PRODUCTS API ─────────────────────────────────────────────────────────────

// GET all products (optional ?category= and ?search= filters)
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  const db = load();
  let products = db.products;

  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }
  if (search) {
    const term = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
  }

  res.json({ success: true, data: products });
});

// GET single product
app.get('/api/products/:id', (req, res) => {
  const db = load();
  const product = db.products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
});

// PUT update product price (simulate market rate update)
app.put('/api/products/:id/price', (req, res) => {
  const { price } = req.body;
  if (!price || isNaN(price) || price <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid price value' });
  }
  const db = load();
  const product = db.products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  product.price = parseFloat(parseFloat(price).toFixed(2));
  save(db);
  res.json({ success: true, message: 'Price updated successfully', data: product });
});

// ─── CART API ─────────────────────────────────────────────────────────────────

// GET cart for session
app.get('/api/cart/:sessionId', (req, res) => {
  const db = load();
  const cartItems = db.cart
    .filter(c => c.session_id === req.params.sessionId)
    .map(c => {
      const product = db.products.find(p => p.id === c.product_id);
      if (!product) return null;
      return {
        id: c.id,
        quantity: c.quantity,
        session_id: c.session_id,
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '',
        category: product.category,
        subtotal: parseFloat((product.price * c.quantity).toFixed(2))
      };
    })
    .filter(Boolean);

  const total = parseFloat(cartItems.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));
  res.json({ success: true, data: cartItems, total });
});

// POST add item to cart
app.post('/api/cart', (req, res) => {
  const { product_id, session_id, quantity = 1 } = req.body;
  if (!product_id || !session_id) {
    return res.status(400).json({ success: false, message: 'product_id and session_id are required' });
  }

  const db = load();
  const product = db.products.find(p => p.id === parseInt(product_id));
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const existing = db.cart.find(c => c.product_id === parseInt(product_id) && c.session_id === session_id);
  if (existing) {
    existing.quantity += parseInt(quantity);
  } else {
    db.cart.push({ id: db.nextCartId++, product_id: parseInt(product_id), session_id, quantity: parseInt(quantity) });
  }
  save(db);
  res.json({ success: true, message: `${product.name} added to cart` });
});

// PUT update cart item quantity
app.put('/api/cart/:id', (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
  }
  const db = load();
  const item = db.cart.find(c => c.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });

  item.quantity = parseInt(quantity);
  save(db);
  res.json({ success: true, message: 'Cart updated' });
});

// DELETE remove item from cart
app.delete('/api/cart/:id', (req, res) => {
  const db = load();
  const index = db.cart.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: 'Cart item not found' });

  db.cart.splice(index, 1);
  save(db);
  res.json({ success: true, message: 'Item removed from cart' });
});

// DELETE clear cart for session
app.delete('/api/cart/session/:sessionId', (req, res) => {
  const db = load();
  db.cart = db.cart.filter(c => c.session_id !== req.params.sessionId);
  save(db);
  res.json({ success: true, message: 'Cart cleared' });
});

// POST checkout
app.post('/api/checkout', (req, res) => {
  const { session_id, customer } = req.body;
  if (!session_id || !customer) {
    return res.status(400).json({ success: false, message: 'session_id and customer info required' });
  }

  const db = load();
  const cartItems = db.cart
    .filter(c => c.session_id === session_id)
    .map(c => {
      const p = db.products.find(prod => prod.id === c.product_id);
      return p ? { name: p.name, price: p.price, quantity: c.quantity } : null;
    })
    .filter(Boolean);

  if (cartItems.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  const total = parseFloat(cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2));

  db.cart = db.cart.filter(c => c.session_id !== session_id);
  save(db);

  res.json({
    success: true,
    message: 'Order placed successfully!',
    order: {
      customer: customer.name,
      items: cartItems.length,
      total,
      estimatedDelivery: '3-5 business days'
    }
  });
});

// ─── PAGE ROUTES ──────────────────────────────────────────────────────────────

app.get('/',          (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/products',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'products.html')));
app.get('/cart',      (req, res) => res.sendFile(path.join(__dirname, 'public', 'cart.html')));
app.get('/checkout',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'checkout.html')));

app.listen(PORT, () => {
  console.log(`\n  ✅ PawShop server running at http://localhost:${PORT}\n`);
});
