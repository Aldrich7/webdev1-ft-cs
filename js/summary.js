let currentOrder = {
  isPreset: false,
  presetName: '',
  name: 'Custom Ramen',
  soup: 'Tsukemen',
  richness: 'Normal',
  noodleVar: 'Ramen',
  noodleType: 'Firm',
  toppings: ['Egg', 'Naruto', 'Nori', 'Chashu'],
  addons: ['Fried Tofu'],
  qty: { noodles: 1, soup: 1, toppings: 1 }
};

function loadOrder() {
  const saved = localStorage.getItem('myRamenOrder');
  if (saved) {
    try {
      currentOrder = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  updateUI();
}

function updateUI() {
  if (currentOrder.isPreset) {
    document.getElementById('summaryHeader').innerText = `${currentOrder.name.toUpperCase()} RAMEN`;
    document.getElementById('sumNoodleText').innerText = `NOODLES - Signature Set`;
    document.getElementById('sumSoupText').innerText = `SOUP - Signature ${currentOrder.soup}`;
  } else {
    document.getElementById('summaryHeader').innerText = `CREATE YOUR OWN - RAMEN`;
    document.getElementById('sumNoodleText').innerText = `NOODLES - ${currentOrder.noodleType} ${currentOrder.noodleVar}`;
    document.getElementById('sumSoupText').innerText = `SOUP - ${currentOrder.richness} ${currentOrder.soup}`;
  }

  document.getElementById('sumToppingText').innerText = `TOPPING - ${currentOrder.toppings.join(', ') || 'None'}`;

  document.getElementById('qtyNoodles').innerText = currentOrder.qty.noodles;
  document.getElementById('qtySoup').innerText = currentOrder.qty.soup;
  document.getElementById('qtyToppings').innerText = currentOrder.qty.toppings;

  const nCost = 30 * currentOrder.qty.noodles;
  const tCost = 100 * currentOrder.qty.toppings;
  const aCost = currentOrder.addons.length * 20;

  document.getElementById('billNoodles').innerText = nCost;
  document.getElementById('billToppings').innerText = tCost;
  document.getElementById('billAddons').innerText = aCost;
  document.getElementById('billTotal').innerText = nCost + tCost + aCost;

  // Sync Add-on chips active state
  document.getElementById('addonTofu').classList.toggle('selected', currentOrder.addons.includes('Fried Tofu'));
  document.getElementById('addonMushroom').classList.toggle('selected', currentOrder.addons.includes('Mushroom'));
}

function changeQty(key, delta) {
  if (currentOrder.qty[key] + delta >= 1) {
    currentOrder.qty[key] += delta;
    updateUI();
  }
}

function toggleAddon(name, el) {
  const idx = currentOrder.addons.indexOf(name);
  if (idx > -1) {
    currentOrder.addons.splice(idx, 1);
  } else {
    currentOrder.addons.push(name);
  }
  updateUI();
}

document.addEventListener('DOMContentLoaded', loadOrder);