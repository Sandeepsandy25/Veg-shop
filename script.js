// script.js - Tabbed Interface, Cart, Global Search, Order Modal
// Added Telugu translations for categories

let vegetables = [];
let cart = []; // each item: { id, name, telugu, quantity, unit, price, total }
let activeTab = '';
let currentSearchQuery = '';

const WHATSAPP_NUMBER = '918367645999';

// Category names in English + Telugu mapping
const categoryNames = {
  'Leafy Vegetables': { te: 'ఆకు కూరలు', emoji: '🥬' },
  'Root Vegetables': { te: 'మూల కూరలు', emoji: '🥕' },
  'Flower Vegetables': { te: 'పుష్ప కూరలు', emoji: '🥦' },
  'Fruit Vegetables': { te: 'ఫల కూరలు', emoji: '🍆' },
  'Stem Vegetables': { te: 'కాండ కూరలు', emoji: '🌿' },
  'Bulb Vegetables': { te: 'గడ్డ కూరలు', emoji: '🧅' },
  'Seed / Pod Vegetables': { te: 'గింజల కూరలు', emoji: '🌶️' },
  'Exotic / International': { te: 'అంతర్జాతీయ కూరలు', emoji: '🌍' }
};

// Load vegetables from JSON
async function loadVegetables() {
  try {
    const response = await fetch('vegetables.json');
    if (!response.ok) throw new Error();
    const data = await response.json();
    vegetables = data.vegetables;
  } catch (error) {
    console.warn('Using fallback data');
    vegetables = getFallbackVegetables();
  }
  buildTabsAndPanels();
  attachSearch();
}

function getFallbackVegetables() {
  return [
    { id: 'tomato', name: 'Tomato', telugu: 'టమోటా', price: 40, emoji: '🍅', unit: 'kg', category: 'Fruit Vegetables' },
    { id: 'onion', name: 'Onion', telugu: 'ఉల్లిపాయ', price: 30, emoji: '🧅', unit: 'kg', category: 'Bulb Vegetables' },
    { id: 'potato', name: 'Potato', telugu: 'ఆలుగడ్డ', price: 35, emoji: '🥔', unit: 'kg', category: 'Root Vegetables' }
  ];
}

// Group vegetables by category
function getCategories() {
  const cats = {};
  vegetables.forEach(veg => {
    if (!cats[veg.category]) cats[veg.category] = [];
    cats[veg.category].push(veg);
  });
  return cats;
}

// Build tabs and content panels
function buildTabsAndPanels() {
  const categories = getCategories();
  const tabNav = document.getElementById('tabsNav');
  const tabsContent = document.getElementById('tabsContent');
  if (!tabNav || !tabsContent) return;

  tabNav.innerHTML = '';
  tabsContent.innerHTML = '';

  const categoryKeys = Object.keys(categories);
  if (categoryKeys.length === 0) return;

  // Build tabs (English + Telugu)
  categoryKeys.forEach((cat, idx) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    if (idx === 0) btn.classList.add('active');
    btn.setAttribute('data-category', cat);
    const catInfo = categoryNames[cat] || { te: cat, emoji: '🥗' };
    btn.innerHTML = `${catInfo.emoji} ${cat} (${catInfo.te})`;
    btn.onclick = () => switchTab(cat);
    tabNav.appendChild(btn);
  });

  // Build panels
  categoryKeys.forEach(cat => {
    const panel = document.createElement('div');
    panel.className = 'tab-panel';
    panel.id = `panel-${cat.replace(/[^a-zA-Z0-9]/g, '')}`;
    panel.setAttribute('data-category', cat);
    panel.innerHTML = renderCategoryPanel(cat, categories[cat]);
    tabsContent.appendChild(panel);
  });

  // Activate first tab
  if (categoryKeys.length > 0) {
    activeTab = categoryKeys[0];
    document.querySelector(`.tab-panel[data-category="${activeTab}"]`).classList.add('active-panel');
  }
}

function renderCategoryPanel(category, vegs) {
  const catInfo = categoryNames[category] || { te: category, emoji: '🥗' };
  return `
    <div class="category-header">
      <span class="category-emoji">${catInfo.emoji}</span>
      <h3 class="category-title">${category} <span style="font-size:0.9rem; font-weight:normal;">(${catInfo.te})</span></h3>
      <span class="category-sub">${vegs.length} items</span>
    </div>
    <div class="product-grid">
      ${vegs.map(veg => `
        <div class="product-card" data-veg-id="${veg.id}" data-veg-name="${veg.name.toLowerCase()}" data-veg-telugu="${veg.telugu.toLowerCase()}">
          <div class="veg-emoji">${veg.emoji}</div>
          <div class="product-name">${veg.name}</div>
          <div class="product-name-telugu">${veg.telugu}</div>
          <div class="product-price">₹${veg.price} <span style="font-size:0.7rem;">/ ${veg.unit}</span></div>
          <div class="quantity-control">
            <input type="number" class="quantity-input" id="qty-${veg.id}" min="0" step="0.5" placeholder="Qty" value="">
            <button class="add-to-cart-btn" data-id="${veg.id}" data-name="${veg.name}" data-telugu="${veg.telugu}" data-price="${veg.price}" data-unit="${veg.unit}">+ Add</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function getCategoryEmoji(cat) {
  const info = categoryNames[cat];
  return info ? info.emoji : '🥗';
}

function switchTab(category) {
  activeTab = category;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-category') === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    if (panel.getAttribute('data-category') === category) {
      panel.classList.add('active-panel');
    } else {
      panel.classList.remove('active-panel');
    }
  });
  // Reapply search filter if any
  if (currentSearchQuery) {
    filterVegetables(currentSearchQuery);
  }
}

// Global Search
function attachSearch() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  if (!searchInput) return;

  const handleSearch = () => {
    const query = searchInput.value.trim().toLowerCase();
    currentSearchQuery = query;
    filterVegetables(query);
    clearBtn.style.display = query ? 'block' : 'none';
  };

  searchInput.addEventListener('input', handleSearch);
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    handleSearch();
    searchInput.focus();
  });
}

function filterVegetables(query) {
  const noResultsDiv = document.getElementById('noResultsMessage');
  let anyVisible = false;

  document.querySelectorAll('.tab-panel').forEach(panel => {
    const cards = panel.querySelectorAll('.product-card');
    let panelHasVisible = false;
    cards.forEach(card => {
      const name = card.getAttribute('data-veg-name');
      const telugu = card.getAttribute('data-veg-telugu');
      const match = query === '' || name.includes(query) || telugu.includes(query);
      card.style.display = match ? '' : 'none';
      if (match) panelHasVisible = true;
    });
    if (query !== '' && !panelHasVisible) {
      panel.style.display = 'none';
    } else if (query === '') {
      panel.style.display = '';
    } else {
      panel.style.display = '';
    }
    if (panelHasVisible || query === '') anyVisible = true;
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    const cat = btn.getAttribute('data-category');
    const panel = document.querySelector(`.tab-panel[data-category="${cat}"]`);
    if (panel && query !== '') {
      const hasVisible = panel.querySelector('.product-card[style=""]:not([style="display: none;"])');
      btn.style.display = hasVisible ? '' : 'none';
    } else {
      btn.style.display = '';
    }
  });

  noResultsDiv.style.display = (!anyVisible && query !== '') ? 'block' : 'none';
}

// Cart Logic
function updateCartUI() {
  const cartContainer = document.getElementById('cartItems');
  const cartCountSpan = document.getElementById('cartCount');
  const cartTotalSpan = document.getElementById('cartTotal');
  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">Cart is empty</div>';
    cartCountSpan.innerText = '0';
    cartTotalSpan.innerText = '₹0';
    return;
  }

  let html = '';
  let total = 0;
  cart.forEach((item, idx) => {
    total += item.total;
    html += `
      <div class="cart-item" data-cart-idx="${idx}">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name} (${item.telugu})</div>
          <div class="cart-item-unit">${item.quantity} ${item.unit} @ ₹${item.price}/${item.unit}</div>
        </div>
        <div class="cart-item-price">₹${item.total.toFixed(2)}</div>
        <button class="cart-item-remove" data-id="${item.id}">🗑️</button>
      </div>
    `;
  });
  cartContainer.innerHTML = html;
  cartCountSpan.innerText = cart.length;
  cartTotalSpan.innerText = `₹${total.toFixed(2)}`;

  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      removeFromCart(id);
    });
  });
}

function addToCart(vegId, name, telugu, price, unit) {
  const qtyInput = document.getElementById(`qty-${vegId}`);
  let quantity = parseFloat(qtyInput.value);
  if (isNaN(quantity) || quantity <= 0) {
    alert('Please enter a valid quantity');
    return;
  }
  quantity = Math.round(quantity * 10) / 10;
  const total = quantity * price;
  const existing = cart.find(item => item.id === vegId);
  if (existing) {
    existing.quantity += quantity;
    existing.total = existing.quantity * existing.price;
  } else {
    cart.push({
      id: vegId,
      name: name,
      telugu: telugu,
      quantity: quantity,
      unit: unit,
      price: price,
      total: total
    });
  }
  updateCartUI();
  qtyInput.value = '';
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

function attachAddToCartListeners() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
      const btn = e.target;
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const telugu = btn.getAttribute('data-telugu');
      const price = parseFloat(btn.getAttribute('data-price'));
      const unit = btn.getAttribute('data-unit');
      addToCart(id, name, telugu, price, unit);
    }
  });
}

// Order flow
function proceedToOrder() {
  if (cart.length === 0) {
    alert('Your cart is empty. Add some vegetables first.');
    return;
  }
  const modal = document.getElementById('orderModal');
  modal.style.display = 'flex';
}

function confirmOrder() {
  const name = document.getElementById('modalName').value.trim();
  const mobile = document.getElementById('modalMobile').value.trim();
  const address = document.getElementById('modalAddress').value.trim();

  if (!name) { alert('Please enter your name'); return; }
  if (!mobile || !/^[0-9]{10}$/.test(mobile)) { alert('Please enter a valid 10-digit mobile number'); return; }
  if (!address) { alert('Please enter your delivery address'); return; }

  let orderLines = cart.map(item => `${item.name} (${item.telugu}): ${item.quantity} ${item.unit}  ₹${item.total.toFixed(2)}`).join('\n');
  const totalBill = cart.reduce((sum, i) => sum + i.total, 0).toFixed(2);
  const message = `🛒 *SREE VEG MART - New Order*\n\n${orderLines}\n\n💰 *Total Amount: ₹${totalBill}* (Cash on Delivery)\n\n👤 Name: ${name}\n📱 Mobile: ${mobile}\n🏠 Address: ${address}\n\n✅ Order will be confirmed on WhatsApp. Only COD.`;

  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');

  document.getElementById('orderModal').style.display = 'none';
  showSuccessPopup();
  cart = [];
  updateCartUI();
}

function showSuccessPopup() {
  const popup = document.getElementById('orderSuccessPopup');
  popup.style.display = 'flex';
  const closeBtn = document.getElementById('closePopupBtn');
  closeBtn.onclick = () => popup.style.display = 'none';
  popup.onclick = (e) => { if (e.target === popup) popup.style.display = 'none'; };
}

async function init() {
  await loadVegetables();
  attachAddToCartListeners();
  updateCartUI();
  const proceedBtn = document.getElementById('proceedToOrderBtn');
  if (proceedBtn) proceedBtn.addEventListener('click', proceedToOrder);
  const confirmBtn = document.getElementById('confirmOrderBtn');
  if (confirmBtn) confirmBtn.addEventListener('click', confirmOrder);
  const modal = document.getElementById('orderModal');
  const closeModal = document.querySelector('.close-modal');
  if (closeModal) closeModal.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

document.addEventListener('DOMContentLoaded', init);
