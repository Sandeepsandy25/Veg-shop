// script.js

// ---------- EXTENSIVE VEGETABLE LIST (worldwide) ----------
const vegetables = [
  { id: 'tomato', name: 'Tomato', price: 40, emoji: '🍅', unit: 'kg' },
  { id: 'potato', name: 'Potato', price: 35, emoji: '🥔', unit: 'kg' },
  { id: 'onion', name: 'Onion', price: 30, emoji: '🧅', unit: 'kg' },
  { id: 'okra', name: 'Ladies Finger (Okra)', price: 50, emoji: '🌱', unit: 'kg' },
  { id: 'carrot', name: 'Carrot', price: 45, emoji: '🥕', unit: 'kg' },
  { id: 'cucumber', name: 'Cucumber', price: 30, emoji: '🥒', unit: 'kg' },
  { id: 'bell_pepper', name: 'Bell Pepper (Capsicum)', price: 70, emoji: '🫑', unit: 'kg' },
  { id: 'broccoli', name: 'Broccoli', price: 90, emoji: '🥦', unit: 'kg' },
  { id: 'cauliflower', name: 'Cauliflower', price: 40, emoji: '🥦', unit: 'kg' },
  { id: 'spinach', name: 'Spinach (Palak)', price: 25, emoji: '🥬', unit: 'bunch' },
  { id: 'cabbage', name: 'Cabbage', price: 25, emoji: '🥬', unit: 'kg' },
  { id: 'eggplant', name: 'Eggplant (Brinjal)', price: 35, emoji: '🍆', unit: 'kg' },
  { id: 'radish', name: 'Radish (Mooli)', price: 28, emoji: '🥕', unit: 'kg' },
  { id: 'pumpkin', name: 'Pumpkin', price: 30, emoji: '🎃', unit: 'kg' },
  { id: 'zucchini', name: 'Zucchini', price: 65, emoji: '🥒', unit: 'kg' },
  { id: 'green_beans', name: 'Green Beans', price: 55, emoji: '🫘', unit: 'kg' },
  { id: 'corn', name: 'Sweet Corn', price: 40, emoji: '🌽', unit: 'kg' },
  { id: 'garlic', name: 'Garlic', price: 120, emoji: '🧄', unit: 'kg' },
  { id: 'ginger', name: 'Ginger', price: 110, emoji: '🫚', unit: 'kg' },
  { id: 'asparagus', name: 'Asparagus', price: 150, emoji: '🌿', unit: 'bundle' },
  { id: 'leek', name: 'Leek', price: 80, emoji: '🧅', unit: 'kg' },
  { id: 'celery', name: 'Celery', price: 70, emoji: '🥬', unit: 'kg' },
  { id: 'kale', name: 'Kale', price: 95, emoji: '🥬', unit: 'kg' },
  { id: 'beetroot', name: 'Beetroot', price: 45, emoji: '🟣', unit: 'kg' },
  { id: 'turnip', name: 'Turnip', price: 38, emoji: '🥕', unit: 'kg' }
];

// WhatsApp destination number (as provided)
const WHATSAPP_NUMBER = '918367645999';

// Render all vegetable cards dynamically
function renderProductGrid() {
  const gridContainer = document.getElementById('productGrid');
  if (!gridContainer) return;

  let cardsHTML = '';
  vegetables.forEach(veg => {
    cardsHTML += `
      <div class="product-card" data-veg-id="${veg.id}">
        <div class="veg-emoji">${veg.emoji}</div>
        <div class="product-name">${veg.name}</div>
        <div class="product-price">
          ₹${veg.price} <span class="price-unit">/ ${veg.unit}</span>
        </div>
        <div class="quantity-control">
          <label for="qty-${veg.id}">Quantity (${veg.unit})</label>
          <input type="number" id="qty-${veg.id}" class="quantity-input" 
                 min="0" step="0.5" value="0" placeholder="0">
        </div>
      </div>
    `;
  });
  gridContainer.innerHTML = cardsHTML;
}

// Collect items with quantity > 0
function getSelectedItems() {
  const selected = [];
  for (let veg of vegetables) {
    const inputEl = document.getElementById(`qty-${veg.id}`);
    if (inputEl) {
      let qty = parseFloat(inputEl.value);
      if (isNaN(qty) || qty <= 0) continue;
      qty = Math.round(qty * 10) / 10; // round to 1 decimal
      selected.push({
        name: veg.name,
        quantity: qty,
        unit: veg.unit,
        emoji: veg.emoji
      });
    }
  }
  return selected;
}

// Build WhatsApp message including customer name, mobile, address
function buildWhatsAppMessage(customerName, customerMobile, customerAddress, selectedItems) {
  let orderLines = selectedItems.map(item => {
    let qtyDisplay = item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1);
    return `${item.name}: ${qtyDisplay} ${item.unit}`;
  }).join('\n');

  let message = `🛒 New Vegetable Order\n${orderLines}\n\nName: ${customerName}\nMobile: ${customerMobile}\nAddress: ${customerAddress}`;
  return message;
}

// Validate inputs and send to WhatsApp
function handleOrder() {
  const customerName = document.getElementById('customerName')?.value.trim();
  const customerMobile = document.getElementById('customerMobile')?.value.trim();
  const customerAddress = document.getElementById('deliveryAddress')?.value.trim();
  const selectedItems = getSelectedItems();

  // Validation
  if (!customerName) {
    alert('❌ Please enter your full name.');
    return;
  }
  if (!customerMobile) {
    alert('📱 Please enter your mobile number (for WhatsApp confirmation).');
    return;
  }
  // Basic mobile number validation (10 digits, but flexible)
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(customerMobile)) {
    alert('⚠️ Please enter a valid 10-digit mobile number.');
    return;
  }
  if (!customerAddress) {
    alert('📍 Please enter your delivery address.');
    return;
  }
  if (selectedItems.length === 0) {
    alert('🛒 Add at least one vegetable with quantity > 0 before ordering.');
    return;
  }

  const messageText = buildWhatsAppMessage(customerName, customerMobile, customerAddress, selectedItems);
  const encodedMessage = encodeURIComponent(messageText);
  const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(whatsappURL, '_blank');
}

// Quantity input validation (non-negative, max 20)
function setupQuantityValidations() {
  vegetables.forEach(veg => {
    const input = document.getElementById(`qty-${veg.id}`);
    if (input) {
      input.addEventListener('change', function() {
        let val = parseFloat(this.value);
        if (isNaN(val)) this.value = 0;
        else if (val < 0) this.value = 0;
        else if (val > 20) this.value = 20;
      });
      input.addEventListener('input', function() {
        if (this.value === '') this.value = 0;
        let v = parseFloat(this.value);
        if (v < 0) this.value = 0;
      });
    }
  });
}

// Initialize the page
function init() {
  renderProductGrid();
  setupQuantityValidations();

  const orderBtn = document.getElementById('orderWhatsAppBtn');
  if (orderBtn) {
    orderBtn.addEventListener('click', handleOrder);
  }
}

document.addEventListener('DOMContentLoaded', init);