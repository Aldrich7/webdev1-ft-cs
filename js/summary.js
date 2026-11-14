let cart = [];
let sideAddons = {
  'Fried Tofu': 0,
  'Mushroom': 0,
  'Gyoza': 0,
  'Siomai': 0,
  'Kimchi': 0
};
let customInstructions = '';
let pendingRemovalIndex = null;

const EXTRA_TOPPING_PRICE = 15;
const ADDON_PRICE = 20;
const MAX_TOPPING_QTY = 5;

function getSoldOutItems() {
  try {
    return JSON.parse(localStorage.getItem('myRamenSoldOut')) || [];
  } catch (e) {
    return [];
  }
}

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
    customInstructions = localStorage.getItem('myRamenInstructions') || '';
  } catch (e) {
    cart = [];
    customInstructions = '';
  }

  cart.forEach(item => {
    if (!item.toppingQuantities) {
      item.toppingQuantities = {};
      (item.toppings || []).forEach(top => {
        item.toppingQuantities[top] = 1;
      });
    } else {
      Object.keys(item.toppingQuantities).forEach(top => {
        if (item.toppingQuantities[top] > MAX_TOPPING_QTY) {
          item.toppingQuantities[top] = MAX_TOPPING_QTY;
        }
      });
    }
  });

  const instrInput = document.getElementById('customInstructionsInput');
  if (instrInput) instrInput.value = customInstructions;

  renderCartUI();
}

function saveInstructions(val) {
  customInstructions = val;
  localStorage.setItem('myRamenInstructions', customInstructions);
}

function saveCartState() {
  localStorage.setItem('myRamenCart', JSON.stringify(cart));
  localStorage.setItem('myRamenSideAddons', JSON.stringify(sideAddons));
  renderCartUI();
}

function renderCartUI() {
  const container = document.getElementById('cartItemsList');
  const checkoutBtn = document.getElementById('orderSubmitBtn');
  const soldOut = getSoldOutItems();

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

      let extraToppingsCostPerBowl = 0;
      const toppingKeys = Object.keys(item.toppingQuantities || {});
      
      toppingKeys.forEach(top => {
        const qty = item.toppingQuantities[top] ?? 1;
        if (qty > 1) {
          extraToppingsCostPerBowl += (qty - 1) * EXTRA_TOPPING_PRICE;
        }
      });

      const bowlQty = item.quantity || 1;
      const singleBowlTotal = (item.price || 150) + extraToppingsCostPerBowl;
      const itemTotal = singleBowlTotal * bowlQty;

      let toppingsHTML = '';
      if (toppingKeys.length > 0) {
        toppingsHTML = `
          <div class="toppings-adjust-box">
            <div class="toppings-adjust-label">Included Toppings (Max of ${MAX_TOPPING_QTY} per toppings • Extra +₱${EXTRA_TOPPING_PRICE} each)</div>
            ${toppingKeys.map(top => {
              const tQty = item.toppingQuantities[top] ?? 1;
              const isMax = tQty >= MAX_TOPPING_QTY;
              let statusBadge = '';
              let labelStyle = '';

              if (tQty === 0) {
                statusBadge = `<span style="color: #b91c1c; font-size: 0.78rem; margin-left: 6px; font-weight: 700;">(Removed)</span>`;
                labelStyle = 'text-decoration: line-through; color: #999;';
              } else if (tQty > 1) {
                const maxText = isMax ? ' • Max' : '';
                statusBadge = `<span style="color: var(--maroon); font-size: 0.78rem; margin-left: 6px;">(+₱${(tQty - 1) * EXTRA_TOPPING_PRICE}${maxText})</span>`;
              }

              const plusBtnStyle = isMax ? 'opacity: 0.4; cursor: not-allowed;' : '';

              return `
                <div class="topping-row-item">
                  <span><span style="${labelStyle}">${top}</span> ${statusBadge}</span>
                  <div class="mini-qty-controls">
                    <button class="mini-qty-btn" onclick="changeToppingQty(${idx}, '${top}', -1)">-</button>
                    <span style="min-width: 18px; text-align: center; ${tQty === 0 ? 'color: #b91c1c;' : ''}">${tQty}</span>
                    <button class="mini-qty-btn" style="${plusBtnStyle}" ${isMax ? 'disabled' : ''} onclick="changeToppingQty(${idx}, '${top}', 1)">+</button>
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
            <button class="remove-btn" onclick="promptRemoveBowl(${idx})">
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

  // Sync Side Add-ons & Respect Sold Out Status
  const addonConfig = [
    { name: 'Fried Tofu', chipId: 'addonTofu', qtyId: 'qtyAddonTofu' },
    { name: 'Mushroom', chipId: 'addonMushroom', qtyId: 'qtyAddonMushroom' },
    { name: 'Gyoza', chipId: 'addonGyoza', qtyId: 'qtyAddonGyoza' },
    { name: 'Siomai', chipId: 'addonSiomai', qtyId: 'qtyAddonSiomai' },
    { name: 'Kimchi', chipId: 'addonKimchi', qtyId: 'qtyAddonKimchi' }
  ];

  let totalAddonsQty = 0;

  addonConfig.forEach(addon => {
    const isSoldOut = soldOut.includes(addon.name);
    if (isSoldOut) sideAddons[addon.name] = 0;

    const qty = sideAddons[addon.name] || 0;
    totalAddonsQty += qty;

    const chipEl = document.getElementById(addon.chipId);
    const qtyEl = document.getElementById(addon.qtyId);

    if (chipEl) {
      chipEl.classList.toggle('selected', qty > 0);
      if (isSoldOut) {
        chipEl.style.opacity = '0.45';
        chipEl.style.pointerEvents = 'none';
      } else {
        chipEl.style.opacity = '1';
        chipEl.style.pointerEvents = 'auto';
      }
    }
    if (qtyEl) qtyEl.innerText = isSoldOut ? 'OUT' : qty;
  });

  // Calculate Totals
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

// Allow reducing a topping or increasing
function changeToppingQty(cartIndex, toppingName, delta) {
  const item = cart[cartIndex];
  if (!item || !item.toppingQuantities) return;
  const current = item.toppingQuantities[toppingName] ?? 1;
  const updated = current + delta;
  if (updated >= 0 && updated <= MAX_TOPPING_QTY) {
    item.toppingQuantities[toppingName] = updated;
    saveCartState();
  }
}

function modifyQty(index, delta) {
  if (cart[index]) {
    const newQty = (cart[index].quantity || 1) + delta;
    if (newQty <= 0) {
      promptRemoveBowl(index);
    } else {
      cart[index].quantity = newQty;
      saveCartState();
    }
  }
}

function promptRemoveBowl(index) {
  const item = cart[index];
  if (!item) return;

  pendingRemovalIndex = index;
  const title = item.isPreset ? `${item.name} Ramen` : `Custom ${item.soup} Ramen`;
  document.getElementById('confirmBowlName').innerText = title;
  document.getElementById('removeConfirmModal').classList.add('active');
}

function closeRemoveModal() {
  pendingRemovalIndex = null;
  document.getElementById('removeConfirmModal').classList.remove('active');
}

function confirmRemoveBowl() {
  if (pendingRemovalIndex !== null) {
    cart.splice(pendingRemovalIndex, 1);
    pendingRemovalIndex = null;
    saveCartState();
  }
  closeRemoveModal();
}

function toggleAddon(name) {
  if (getSoldOutItems().includes(name)) return;
  sideAddons[name] = (sideAddons[name] || 0) > 0 ? 0 : 1;
  saveCartState();
}

function changeAddonQty(name, delta) {
  if (getSoldOutItems().includes(name)) return;
  sideAddons[name] = Math.max(0, (sideAddons[name] || 0) + delta);
  saveCartState();
}

function checkoutOrder() {
  if (cart.length === 0) return;

  let queue = [];
  try {
    queue = JSON.parse(localStorage.getItem('myRamenOrdersQueue')) || [];
  } catch (e) {
    queue = [];
  }

  const grandTotal = parseInt(document.getElementById('billTotal').innerText, 10) || 0;
  const orderNumber = 101 + queue.length;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  queue.push({
    id: 'ord_' + Date.now(),
    orderNumber: orderNumber,
    time: timeStr,
    status: 'Preparing',
    items: [...cart],
    sideAddons: { ...sideAddons },
    instructions: customInstructions.trim(),
    totalBill: grandTotal
  });

  localStorage.setItem('myRamenOrdersQueue', JSON.stringify(queue));

  localStorage.removeItem('myRamenCart');
  localStorage.removeItem('myRamenSideAddons');
  localStorage.removeItem('myRamenInstructions');

  document.body.classList.add('page-exit');
  setTimeout(() => {
    window.location.href = 'status.html';
  }, 240);
}

document.addEventListener('DOMContentLoaded', loadCart);