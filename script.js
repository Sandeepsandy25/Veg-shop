// script.js - FIXED search & bill accumulation, with better quantity placeholders

let vegetables = [];
let allProductCards = [];
const WHATSAPP_NUMBER = '918367645999';

async function loadVegetables() {
  try {
    const response = await fetch('vegetables.json');
    if (!response.ok) throw new Error();
    const data = await response.json();
    vegetables = data.vegetables;
    console.log('✅ Loaded vegetables.json');
  } catch (error) {
    console.warn('⚠️ Using fallback data');
    vegetables = getFallbackVegetables();
  }
  renderCategories();
  setupQuantityValidations();
  updateBillSummary();
  setupSearchAndFilter();
}

function renderCategories() {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;

  const grouped = {};
  vegetables.forEach(veg => {
    if (!grouped[veg.category]) grouped[veg.category] = [];
    grouped[veg.category].push(veg);
  });

  let html = '';
  for (const [catName, items] of Object.entries(grouped)) {
    html += `
      <div class="category-section" data-category="${catName}">
        <div class="category-header">
          <span class="category-emoji">${getCategoryEmoji(catName)}</span>
          <h3 class="category-title">${catName}</h3>
          <span class="category-sub">${items.length} items</span>
        </div>
        <div class="product-grid">
          ${items.map(veg => `
            <div class="product-card" data-veg-id="${veg.id}" data-veg-name="${veg.name.toLowerCase()}" data-veg-telugu="${veg.telugu.toLowerCase()}" data-category="${catName}">
              <div class="veg-emoji">${veg.emoji}</div>
              <div class="product-name">${veg.name}</div>
              <div class="product-name-telugu">${veg.telugu}</div>
              <div class="product-price">₹${veg.price} <span class="price-unit">/ ${veg.unit}</span></div>
              <div class="quantity-control">
                <label for="qty-${veg.id}">Quantity (${veg.unit})</label>
                <input type="number" id="qty-${veg.id}" class="quantity-input" min="0" step="0.5" placeholder="e.g., 1 ${veg.unit}" value="">
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
  allProductCards = Array.from(document.querySelectorAll('.product-card'));
}

function getCategoryEmoji(cat) {
  const map = {
    'Leafy Vegetables': '🥬', 'Root Vegetables': '🥕', 'Flower Vegetables': '🥦',
    'Fruit Vegetables': '🍆', 'Stem Vegetables': '🌿', 'Bulb Vegetables': '🧅',
    'Seed / Pod Vegetables': '🌶️', 'Exotic / International': '🌍'
  };
  return map[cat] || '🥗';
}

function setupSearchAndFilter() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  const noResultsDiv = document.getElementById('noResultsMessage');
  const resultCountSpan = document.getElementById('searchResultCount');

  const filter = () => {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;
    allProductCards.forEach(card => {
      const name = card.getAttribute('data-veg-name');
      const telugu = card.getAttribute('data-veg-telugu');
      const match = query === '' || name.includes(query) || telugu.includes(query);
      card.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    document.querySelectorAll('.category-section').forEach(section => {
      const visibleCards = Array.from(section.querySelectorAll('.product-card')).filter(
        card => card.style.display !== 'none'
      );
      section.style.display = visibleCards.length === 0 && query !== '' ? 'none' : '';
    });
    clearBtn.style.display = query === '' ? 'none' : 'block';
    noResultsDiv.style.display = visibleCount === 0 && query !== '' ? 'block' : 'none';
    resultCountSpan.textContent = query === '' ? '' : `Found ${visibleCount} vegetable${visibleCount !== 1 ? 's' : ''}`;
  };
  searchInput.addEventListener('input', filter);
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    filter();
    searchInput.focus();
  });
}

function getSelectedItems() {
  const selected = [];
  for (let veg of vegetables) {
    const input = document.getElementById(`qty-${veg.id}`);
    if (input) {
      let qty = parseFloat(input.value);
      // If input is empty or not a number, treat as 0
      if (isNaN(qty)) qty = 0;
      if (qty <= 0) continue;
      qty = Math.round(qty * 10) / 10;
      selected.push({
        id: veg.id,
        name: veg.name,
        telugu: veg.telugu,
        quantity: qty,
        unit: veg.unit,
        total: qty * veg.price
      });
    }
  }
  return selected;
}

function updateBillSummary() {
  const selected = getSelectedItems();
  const billSection = document.getElementById('billSummary');
  const detailsDiv = document.getElementById('billDetails');
  const totalSpan = document.getElementById('totalAmount');

  if (selected.length === 0) {
    billSection.style.display = 'none';
    return;
  }

  let html = '';
  let grandTotal = 0;
  selected.forEach(item => {
    grandTotal += item.total;
    const qtyDisplay = item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1);
    html += `
      <div class="bill-item">
        <span>${item.name} (${item.telugu}) - ${qtyDisplay} ${item.unit}</span>
        <span>₹${item.total.toFixed(2)}</span>
      </div>
    `;
  });
  detailsDiv.innerHTML = html;
  totalSpan.innerHTML = `Total: ₹${grandTotal.toFixed(2)}`;
  billSection.style.display = 'block';
}

function setupQuantityValidations() {
  vegetables.forEach(veg => {
    const input = document.getElementById(`qty-${veg.id}`);
    if (input) {
      const handler = () => {
        let val = parseFloat(input.value);
        if (isNaN(val)) input.value = '';
        else if (val < 0) input.value = '';
        else if (val > 20) input.value = 20;
        updateBillSummary();
      };
      input.removeEventListener('change', handler);
      input.removeEventListener('input', handler);
      input.addEventListener('change', handler);
      input.addEventListener('input', handler);
    }
  });
}

function buildWhatsAppMessage(name, mobile, address, items) {
  let lines = items.map(i => `${i.name} (${i.telugu}): ${i.quantity} ${i.unit}  ₹${i.total.toFixed(2)}`).join('\n');
  const total = items.reduce((s, i) => s + i.total, 0).toFixed(2);
  return `🛒 *SREE VEG MART - New Order*\n\n${lines}\n\n💰 *Total Amount: ₹${total}* (Cash on Delivery)\n\n👤 Name: ${name}\n📱 Mobile: ${mobile}\n🏠 Address: ${address}\n\n✅ Order will be confirmed on WhatsApp. Only COD.`;
}

function showSuccessPopup() {
  const popup = document.getElementById('orderSuccessPopup');
  popup.style.display = 'flex';
  document.getElementById('closePopupBtn').onclick = () => popup.style.display = 'none';
  popup.onclick = (e) => { if (e.target === popup) popup.style.display = 'none'; };
}

function handleOrder() {
  const name = document.getElementById('customerName')?.value.trim();
  const mobile = document.getElementById('customerMobile')?.value.trim();
  const addr = document.getElementById('deliveryAddress')?.value.trim();
  const items = getSelectedItems();

  if (!name) { alert('❌ Please enter your full name.'); return; }
  if (!mobile || !/^[0-9]{10}$/.test(mobile)) { alert('📱 Please enter a valid 10-digit mobile number.'); return; }
  if (!addr) { alert('📍 Please enter your delivery address.'); return; }
  if (items.length === 0) { alert('🛒 Add at least one vegetable with quantity > 0 before ordering.'); return; }

  const message = buildWhatsAppMessage(name, mobile, addr, items);
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  showSuccessPopup();
}

function getFallbackVegetables() {
  return [
    { id: 'tomato', name: 'Tomato', telugu: 'టమోటా', price: 40, emoji: '🍅', unit: 'kg', category: 'Fruit Vegetables' },
    { id: 'potato', name: 'Potato', telugu: 'ఆలుగడ్డ', price: 35, emoji: '🥔', unit: 'kg', category: 'Root Vegetables' },
    { id: 'onion', name: 'Onion', telugu: 'ఉల్లిపాయ', price: 30, emoji: '🧅', unit: 'kg', category: 'Bulb Vegetables' }
  ];
}

async function init() {
  await loadVegetables();
  document.getElementById('orderWhatsAppBtn').addEventListener('click', handleOrder);
}

document.addEventListener('DOMContentLoaded', init);
