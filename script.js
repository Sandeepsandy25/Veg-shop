// script.js

let vegetables = []; // Will be populated from JSON

const WHATSAPP_NUMBER = '918367645999';

// Fallback data in case JSON fails to load (complete list)
const fallbackVegetables = [
  { id: 'tomato', name: 'Tomato', telugu: 'టమోటా', price: 40, emoji: '🍅', unit: 'kg' },
  { id: 'potato', name: 'Potato', telugu: 'ఆలుగడ్డ', price: 35, emoji: '🥔', unit: 'kg' },
  { id: 'onion', name: 'Onion', telugu: 'ఉల్లిపాయ', price: 30, emoji: '🧅', unit: 'kg' },
  { id: 'okra', name: 'Ladies Finger', telugu: 'బెండకాయ', price: 50, emoji: '🌱', unit: 'kg' },
  { id: 'carrot', name: 'Carrot', telugu: 'క్యారెట్', price: 45, emoji: '🥕', unit: 'kg' },
  { id: 'cucumber', name: 'Cucumber', telugu: 'దోసకాయ', price: 30, emoji: '🥒', unit: 'kg' },
  { id: 'bell_pepper', name: 'Bell Pepper', telugu: 'క్యాప్సికమ్', price: 70, emoji: '🫑', unit: 'kg' },
  { id: 'broccoli', name: 'Broccoli', telugu: 'బ్రోకలీ', price: 90, emoji: '🥦', unit: 'kg' },
  { id: 'cauliflower', name: 'Cauliflower', telugu: 'గోబీ', price: 40, emoji: '🥦', unit: 'kg' },
  { id: 'spinach', name: 'Spinach', telugu: 'పాలకూర', price: 25, emoji: '🥬', unit: 'bunch' },
  { id: 'cabbage', name: 'Cabbage', telugu: 'క్యాబేజీ', price: 25, emoji: '🥬', unit: 'kg' },
  { id: 'eggplant', name: 'Brinjal', telugu: 'వంకాయ', price: 35, emoji: '🍆', unit: 'kg' },
  { id: 'radish', name: 'Radish', telugu: 'ముల్లంగి', price: 28, emoji: '🥕', unit: 'kg' },
  { id: 'pumpkin', name: 'Pumpkin', telugu: 'గుమ్మడికాయ', price: 30, emoji: '🎃', unit: 'kg' },
  { id: 'zucchini', name: 'Zucchini', telugu: 'జుచ్చిని', price: 65, emoji: '🥒', unit: 'kg' },
  { id: 'green_beans', name: 'Green Beans', telugu: 'బీన్స్', price: 55, emoji: '🫘', unit: 'kg' },
  { id: 'corn', name: 'Sweet Corn', telugu: 'మొక్కజొన్న', price: 40, emoji: '🌽', unit: 'kg' },
  { id: 'garlic', name: 'Garlic', telugu: 'వెల్లుల్లి', price: 120, emoji: '🧄', unit: 'kg' },
  { id: 'ginger', name: 'Ginger', telugu: 'అల్లం', price: 110, emoji: '🫚', unit: 'kg' },
  { id: 'asparagus', name: 'Asparagus', telugu: 'ఆస్పరాగస్', price: 150, emoji: '🌿', unit: 'bundle' },
  { id: 'leek', name: 'Leek', telugu: 'లీక్', price: 80, emoji: '🧅', unit: 'kg' },
  { id: 'celery', name: 'Celery', telugu: 'సెలరీ', price: 70, emoji: '🥬', unit: 'kg' },
  { id: 'kale', name: 'Kale', telugu: 'కాలే', price: 95, emoji: '🥬', unit: 'kg' },
  { id: 'beetroot', name: 'Beetroot', telugu: 'బీట్రూట్', price: 45, emoji: '🟣', unit: 'kg' },
  { id: 'turnip', name: 'Turnip', telugu: 'టర్నిప్', price: 38, emoji: '🥕', unit: 'kg' }
];

// Load vegetable data from JSON
async function loadVegetables() {
  try {
    const response = await fetch('vegetables.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    vegetables = data.vegetables;
    console.log('✅ Loaded vegetable prices from JSON');
  } catch (error) {
    console.warn('⚠️ Could not load vegetables.json, using fallback data', error);
    vegetables = fallbackVegetables;
  }
  renderProductGrid(); // render once, never re-render for search
  setupQuantityValidations();
  updateBillSummary(getSelectedItems());
  setupSearchAndFilter();
}

// Render all cards once (no re-rendering on search)
function renderProductGrid() {
  const gridContainer = document.getElementById('productGrid');
  if (!gridContainer) return;

  let cardsHTML = '';
  vegetables.forEach(veg => {
    cardsHTML += `
      <div class="product-card" data-veg-id="${veg.id}" data-veg-name="${veg.name.toLowerCase()}" data-veg-telugu="${veg.telugu.toLowerCase()}">
        <div class="veg-emoji">${veg.emoji}</div>
        <div class="product-name">${veg.name}</div>
        <div class="product-name-telugu">${veg.telugu}</div>
        <div class="product-price">₹${veg.price} <span class="price-unit">/ ${veg.unit}</span></div>
        <div class="quantity-control">
          <label for="qty-${veg.id}">Quantity (${veg.unit})</label>
          <input type="number" id="qty-${veg.id}" class="quantity-input" min="0" step="0.5" value="0" placeholder="0">
        </div>
      </div>
    `;
  });
  gridContainer.innerHTML = cardsHTML;
}

// Search/filter by toggling card visibility (no re-render)
function setupSearchAndFilter() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  const noResultsDiv = document.getElementById('noResultsMessage');
  const resultCountSpan = document.getElementById('searchResultCount');

  if (!searchInput) return;

  const filterVegetables = () => {
    const query = searchInput.value.trim().toLowerCase();
    const cards = document.querySelectorAll('.product-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const name = card.getAttribute('data-veg-name');
      const telugu = card.getAttribute('data-veg-telugu');
      if (query === '' || name.includes(query) || telugu.includes(query)) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (clearBtn) {
      clearBtn.style.display = query === '' ? 'none' : 'block';
    }

    if (noResultsDiv) {
      noResultsDiv.style.display = visibleCount === 0 && query !== '' ? 'block' : 'none';
    }
    if (resultCountSpan) {
      if (query === '') {
        resultCountSpan.textContent = '';
      } else {
        resultCountSpan.textContent = `Found ${visibleCount} vegetable${visibleCount !== 1 ? 's' : ''}`;
      }
    }
  };

  searchInput.addEventListener('input', filterVegetables);

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      filterVegetables();
      searchInput.focus();
    });
  }
}

// Get selected items from ALL vegetables (unfiltered)
function getSelectedItems() {
  const selected = [];
  for (let veg of vegetables) {
    const inputEl = document.getElementById(`qty-${veg.id}`);
    if (inputEl) {
      let qty = parseFloat(inputEl.value);
      if (isNaN(qty) || qty <= 0) continue;
      qty = Math.round(qty * 10) / 10;
      const itemTotal = qty * veg.price;
      selected.push({
        id: veg.id,
        name: veg.name,
        telugu: veg.telugu,
        quantity: qty,
        unit: veg.unit,
        pricePerKg: veg.price,
        total: itemTotal
      });
    }
  }
  return selected;
}

// Update bill summary
function updateBillSummary(selectedItems) {
  const billSection = document.getElementById('billSummary');
  const billDetailsDiv = document.getElementById('billDetails');
  const totalAmountSpan = document.getElementById('totalAmount');

  if (selectedItems.length === 0) {
    billSection.style.display = 'none';
    return;
  }

  let billHTML = '';
  let grandTotal = 0;
  selectedItems.forEach(item => {
    const itemTotal = item.total;
    grandTotal += itemTotal;
    const qtyDisplay = item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1);
    billHTML += `
      <div class="bill-item">
        <span>${item.name} (${item.telugu}) - ${qtyDisplay} ${item.unit}</span>
        <span>₹${itemTotal.toFixed(2)}</span>
      </div>
    `;
  });
  billDetailsDiv.innerHTML = billHTML;
  totalAmountSpan.innerHTML = `Total: ₹${grandTotal.toFixed(2)}`;
  billSection.style.display = 'block';
}

// Build WhatsApp message
function buildWhatsAppMessage(customerName, customerMobile, customerAddress, selectedItems) {
  let orderLines = selectedItems.map(item => {
    let qtyDisplay = item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1);
    return `${item.name} (${item.telugu}): ${qtyDisplay} ${item.unit}  ₹${item.total.toFixed(2)}`;
  }).join('\n');
  const totalBill = selectedItems.reduce((sum, i) => sum + i.total, 0).toFixed(2);
  const message = `🛒 *SREE VEG MART - New Order*\n\n${orderLines}\n\n💰 *Total Amount: ₹${totalBill}* (Cash on Delivery)\n\n👤 Name: ${customerName}\n📱 Mobile: ${customerMobile}\n🏠 Address: ${customerAddress}\n\n✅ Order will be confirmed on WhatsApp. Only COD.`;
  return message;
}

// Show success popup
function showSuccessPopup() {
  const popup = document.getElementById('orderSuccessPopup');
  if (popup) {
    popup.style.display = 'flex';
    const closeBtn = document.getElementById('closePopupBtn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        popup.style.display = 'none';
      };
    }
    popup.addEventListener('click', (e) => {
      if (e.target === popup) popup.style.display = 'none';
    });
  }
}

// Handle order
function handleOrder() {
  const customerName = document.getElementById('customerName')?.value.trim();
  const customerMobile = document.getElementById('customerMobile')?.value.trim();
  const customerAddress = document.getElementById('deliveryAddress')?.value.trim();
  const selectedItems = getSelectedItems();

  if (!customerName) { alert('❌ Please enter your full name.'); return; }
  if (!customerMobile) { alert('📱 Please enter your mobile number.'); return; }
  if (!/^[0-9]{10}$/.test(customerMobile)) { alert('⚠️ Please enter a valid 10-digit mobile number.'); return; }
  if (!customerAddress) { alert('📍 Please enter your delivery address.'); return; }
  if (selectedItems.length === 0) { alert('🛒 Add at least one vegetable with quantity > 0 before ordering.'); return; }

  const messageText = buildWhatsAppMessage(customerName, customerMobile, customerAddress, selectedItems);
  const encodedMessage = encodeURIComponent(messageText);
  const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(whatsappURL, '_blank');
  showSuccessPopup();
}

// Quantity validation + realtime bill
function setupQuantityValidations() {
  vegetables.forEach(veg => {
    const input = document.getElementById(`qty-${veg.id}`);
    if (input) {
      const updateEvent = () => {
        let val = parseFloat(input.value);
        if (isNaN(val)) input.value = 0;
        else if (val < 0) input.value = 0;
        else if (val > 20) input.value = 20;
        const newSelected = getSelectedItems();
        updateBillSummary(newSelected);
      };
      // Remove any previous listener to avoid duplicates
      input.removeEventListener('change', updateEvent);
      input.removeEventListener('input', updateEvent);
      input.addEventListener('change', updateEvent);
      input.addEventListener('input', updateEvent);
    }
  });
}

// Initialization
async function init() {
  await loadVegetables();
  const orderBtn = document.getElementById('orderWhatsAppBtn');
  if (orderBtn) orderBtn.addEventListener('click', handleOrder);
}

document.addEventListener('DOMContentLoaded', init);
