let cart = [];
let sideAddons = {
  'Fried Tofu': 0,
  'Mushroom': 0,
  'Gyoza': 0,
  'Siomai': 0,
  'Kimchi': 0
};

const EXTRA_TOPPING_PRICE = 15; // ₱15 per extra portion of a selected topping
const ADDON_PRICE = 20;         // ₱20 per side add-on

function loadCart() {
  try {
    cart = JSON.parse(localStorage.getItem('myRamenCart')) || [];
    const savedAddons = JSON.parse(localStorage.getItem('myRamenSideAddons'));
    if (savedAddons && typeof savedAddons === 'object') {
      sideAddons = {
        'Fried Tofu': 0,
        'Mushroom': 0,
        'Gyoza': 0,
        'Siomai': 0,
        'Kimchi': 0,
        ...savedAddons
      };
    }
  } catch (e) {
    cart = [];
    sideAddons = {
      'Fried Tofu': 0,
      'Mushroom': 0,
      'Gyoza': 0,
      'Siomai': 0,
      'Kimchi': 0
    };
  }

  // Ensure every cart item has a toppingQuantities map initialized
  cart.forEach(item => {
    if (!item.toppingQuantities) {
      item.toppingQuantities = {};
      (item.toppings || []).forEach(top => {
        item.toppingQuantities[top] = 1; // 1 base portion included
      });
    }
  });

  renderCartUI();
}

function saveCartState() {
  localStorage.setItem('myRamenCart', JSON.stringify(cart));
  localStorage.setItem('myRamenSideAddons', JSON.stringify(sideAddons));
  renderCartUI();
}

function renderCartUI() {
  const container = document.getElementById('cartItemsList');
  const checkoutBtn = document.getElementById('orderSubmitBtn');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-state">
        <i class="fa-solid fa-bowl-food" style="font-size: 3rem; color: #c4b098; margin-bottom: 12px;"></i>
        <h3 class="serif" style="color: var(--maroon); margin-bottom: 8px;">Your cart is empty</h3>
        <p style="font-size: 0.9rem; color: #665; margin-bottom: 16px;">Pick a signature bowl from our menu or create your own custom ramen.</p>
        <a href="home.html" class="add-more-btn serif" style="display: inline-flex;">Browse Menu Catalog</a>
      </div>
    `;
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = '0.5';
      checkoutBtn.style.cursor = 'not-allowed';
    }
  } else {
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.style.opacity = '1';
      checkoutBtn.style.cursor = 'pointer';
    }

    container.innerHTML = cart.map((item, idx) => {
      const title = item.isPreset ? `${item.name} Ramen` : `Create Your Own - Ramen (${item.soup})`;
      const baseSpecs = item.isPreset 
        ? `Broth: Signature ${item.soup} • Noodles: Standard Ramen`
        : `Broth: ${item.richness} ${item.soup} • Noodles: ${item.noodleType} ${item.noodleVar}`;

      // Calculate extra toppings cost for 1 bowl of this item (anything above 1 base portion is +₱15)
      let extraToppingsCostPerBowl = 0;
      const toppingKeys = Object.keys(item.toppingQuantities || {});
      
      toppingKeys.forEach(top => {
        const qty = item.toppingQuantities[top] || 1;
        if (qty > 1) {
          extraToppingsCostPerBowl += (qty - 1) * EXTRA_TOPPING_PRICE;
        }
      });

      const bowlQty = item.quantity || 1;
      const singleBowlTotal = (item.price || 150) + extraToppingsCostPerBowl;
      const itemTotal = singleBowlTotal * bowlQty;

      // Render individual topping rows with + / - buttons (Soup & Noodles excluded)
      let toppingsHTML = '';
      if (toppingKeys.length > 0) {
        toppingsHTML = `
          <div class="toppings-adjust-box">
            <div class="toppings-adjust-label">Included Toppings (Add extra +₱${EXTRA_TOPPING_PRICE} each)</div>
            ${toppingKeys.map(top => {
              const tQty = item.toppingQuantities[top] || 1;
              const extraTag = tQty > 1 ? `<span style="color: var(--maroon); font-size: 0.78rem; margin-left: 6px;">(+₱${(tQty - 1) * EXTRA_TOPPING_PRICE})</span>` : '';
              return `
                <div class="topping-row-item">
                  <span>${top} ${extraTag}</span>
                  <div class="mini-qty-controls">
                    <button class="mini-qty-btn" onclick="changeToppingQty(${idx}, '${top}', -1)" title="Decrease ${top}">-</button>
                    <span style="min-width: 18px; text-align: center;">${tQty}</span>
                    <button class="mini-qty-btn" onclick="changeToppingQty(${idx}, '${top}', 1)" title="Add extra ${top}">+</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      return `
        <div class="cart-item-card">
          <div class="cart-item-head">
            <div>
              <div class="cart-item-title serif">${title}</div>
              <div class="cart-item-base">${baseSpecs}</div>
            </div>
            <strong style="color: var(--maroon); font-size: 1.15rem;">₱${itemTotal}</strong>
          </div>

          ${toppingsHTML}

          <div class="cart-item-controls">
            <button class="remove-btn" onclick="removeItem(${idx})">
              <i class="fa-solid fa-trash-can"></i> Remove Bowl
            </button>
            <div class="qty-controls">
              <span style="font-size: 0.85rem; color: #665; font-weight: 600;">Bowls:</span>
              <button class="qty-btn" onclick="modifyQty(${idx}, -1)">-</button>
              <span>${bowlQty}</span>
              <button class="qty-btn" onclick="modifyQty(${idx}, 1)">+</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Sync all Side Add-ons UI
  const addonConfig = [
    { name: 'Fried Tofu', chipId: 'addonTofu', qtyId: 'qtyAddonTofu' },
    { name: 'Mushroom', chipId: 'addonMushroom', qtyId: 'qtyAddonMushroom' },
    { name: 'Gyoza', chipId: 'addonGyoza', qtyId: 'qtyAddonGyoza' },
    { name: 'Siomai', chipId: 'addonSiomai', qtyId: 'qtyAddonSiomai' },
    { name: 'Kimchi', chipId: 'addonKimchi', qtyId: 'qtyAddonKimchi' }
  ];

  let totalAddonsQty = 0;

  addonConfig.forEach(addon => {
    const qty = sideAddons[addon.name] || 0;
    totalAddonsQty += qty;

    const chipEl = document.getElementById(addon.chipId);
    const qtyEl = document.getElementById(addon.qtyId);

    if (chipEl) chipEl.classList.toggle('selected', qty > 0);
    if (qtyEl) qtyEl.innerText = qty;
  });

  // Calculate Grand Totals
  let totalBowls = 0;
  let baseBowlsCost = 0;
  let totalExtraToppingsCost = 0;

  cart.forEach(item => {
    const bowlQty = item.quantity || 1;
    totalBowls += bowlQty;
    baseBowlsCost += (item.price || 150) * bowlQty;

    let extraPerBowl = 0;
    Object.values(item.toppingQuantities || {}).forEach(q => {
      if (q > 1) extraPerBowl += (q - 1) * EXTRA_TOPPING_PRICE;
    });
    totalExtraToppingsCost += extraPerBowl * bowlQty;
  });

  const addonsCost = totalAddonsQty * ADDON_PRICE;
  const grandTotal = baseBowlsCost + totalExtraToppingsCost + addonsCost;

  document.getElementById('totalBowlsCount').innerText = totalBowls;
  document.getElementById('billBowls').innerText = baseBowlsCost;
  document.getElementById('billExtraToppings').innerText = totalExtraToppingsCost;
  document.getElementById('billAddons').innerText = addonsCost;
  document.getElementById('billTotal').innerText = grandTotal;
}

// Adjust individual topping quantity (minimum 1 base portion, unlimited extras)
function changeToppingQty(cartIndex, toppingName, delta) {
  const item = cart[cartIndex];
  if (!item || !item.toppingQuantities) return;

  const current = item.toppingQuantities[toppingName] || 1;
  const updated = current + delta;

  if (updated >= 1) {
    item.toppingQuantities[toppingName] = updated;
    saveCartState();
  }
}

// Adjust whole bowl quantity
function modifyQty(index, delta) {
  if (cart[index]) {
    const newQty = (cart[index].quantity || 1) + delta;
    if (newQty <= 0) {
      removeItem(index);
    } else {
      cart[index].quantity = newQty;
      saveCartState();
    }
  }
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCartState();
}

// Toggle Side Add-on when clicking the main chip body
function toggleAddon(name) {
  if ((sideAddons[name] || 0) > 0) {
    sideAddons[name] = 0;
  } else {
    sideAddons[name] = 1;
  }
  saveCartState();
}

// Adjust Side Add-on quantity using +/- buttons
function changeAddonQty(name, delta) {
  const current = sideAddons[name] || 0;
  const updated = Math.max(0, current + delta);
  sideAddons[name] = updated;
  saveCartState();
}

function checkoutOrder() {
  if (cart.length === 0) return;
  localStorage.removeItem('myRamenCart');
  localStorage.removeItem('myRamenSideAddons');
  document.body.classList.add('page-exit');
  setTimeout(() => {
    window.location.href = 'status.html';
  }, 240);
}

document.addEventListener('DOMContentLoaded', loadCart);