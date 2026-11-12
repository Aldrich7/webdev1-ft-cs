const steps = [
  {
    name: "soup",
    label: "Step 1 of 5 • Soup Broth",
    title: "CHOOSE YOUR SOUP VARIATION",
    layout: "vertical",
    options: ["Tsukemen", "Shio", "Miso", "Tonkotsu"]
  },
  {
    name: "richness",
    label: "Step 2 of 5 • Broth Richness",
    title: "CHOOSE<br>YOUR<br>SOUP<br>RICHNESS",
    layout: "horizontal",
    options: ["Mild", "Normal", "Rich"]
  },
  {
    name: "noodleVar",
    label: "Step 3 of 5 • Noodle Variation",
    title: "CHOOSE<br>YOUR<br>NOODLE<br>VARIATION",
    layout: "horizontal",
    options: ["Ramen", "Udon", "Soba"]
  },
  {
    name: "noodleType",
    label: "Step 4 of 5 • Noodle Type",
    title: "CHOOSE<br>YOUR<br>NOODLE<br>TYPE",
    layout: "horizontal",
    options: ["Stringy", "Firm", "Chewy"]
  },
  {
    name: "toppings",
    label: "Step 5 of 5 • Toppings & Add-ons",
    title: "CHOOSE YOUR TOPPINGS",
    layout: "mixed",
    sideOptions: ["Egg", "Naruto"],
    bottomOptions: ["Menma", "Nori", "Nira", "Cabbage", "Chashu"]
  }
];

let currentStep = 0;

let order = {
  isPreset: false,
  soup: "Tsukemen",
  richness: "Normal",
  noodleVar: "Ramen",
  noodleType: "Firm",
  toppings: ["Egg", "Naruto", "Nori", "Chashu"],
  price: 150
};

const soupThemes = {
  Tsukemen: { bg: "radial-gradient(circle at 45% 45%, #D47A22 0%, #A84E11 65%, #6B2E05 100%)" },
  Shio: { bg: "radial-gradient(circle at 45% 45%, #F0D48B 0%, #D4B259 65%, #947525 100%)" },
  Miso: { bg: "radial-gradient(circle at 45% 45%, #C26321 0%, #94400E 65%, #5E2605 100%)" },
  Tonkotsu: { bg: "radial-gradient(circle at 45% 45%, #F7EFE1 0%, #E8D5BC 60%, #BFA785 100%)" }
};

const toppingMeta = {
  Egg: { icon: "🥚", class: "topping-egg" },
  Chashu: { icon: "🥓", class: "topping-chasu" },
  Naruto: { icon: "🍥", class: "topping-naruto" },
  Nori: { icon: "🌿", class: "topping-nori" },
  Menma: { icon: "🎋", class: "topping-menma" },
  Nira: { icon: "🌱", class: "topping-greens" },
  Cabbage: { icon: "🥬", class: "topping-greens" }
};

const plateCoordinates = [
  { top: "18%", left: "18%" },
  { top: "18%", left: "54%" },
  { top: "45%", left: "14%" },
  { top: "48%", left: "56%" },
  { top: "66%", left: "34%" }
];

function getSoldOutItems() {
  try {
    return JSON.parse(localStorage.getItem("myRamenSoldOut")) || [];
  } catch (e) {
    return [];
  }
}

function updateCartBadge() {
  const badge = document.getElementById("customizerCartBadge");
  if (!badge) return;
  try {
    const cart = JSON.parse(localStorage.getItem("myRamenCart")) || [];
    const totalQty = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    if (totalQty > 0) {
      badge.innerText = totalQty;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  } catch (e) {
    badge.style.display = "none";
  }
}

function renderStep() {
  const step = steps[currentStep];
  const sidebar = document.getElementById("sidebarContainer");
  const sideTitle = document.getElementById("sidebarTitle");
  const sideOptions = document.getElementById("sidebarOptions");
  const bottomBar = document.getElementById("bottomBarContainer");
  const stepLabel = document.getElementById("stepProgressLabel");
  const nextBtn = document.getElementById("builderNextBtn");
  const addMoreBtn = document.getElementById("builderAddMoreBtn");
  const soldOut = getSoldOutItems();

  // Remove any sold-out default toppings/broths automatically
  order.toppings = order.toppings.filter(t => !soldOut.includes(t));
  if (soldOut.includes(order.soup)) {
    const availableSoup = steps[0].options.find(s => !soldOut.includes(s));
    if (availableSoup) order.soup = availableSoup;
  }

  sideTitle.innerHTML = step.title;
  if (stepLabel) stepLabel.innerText = step.label;
  sideOptions.innerHTML = "";
  bottomBar.innerHTML = "";

  if (currentStep === steps.length - 1) {
    nextBtn.innerText = "CHECKOUT";
    addMoreBtn.style.display = "inline-block";
  } else {
    nextBtn.innerText = "NEXT";
    addMoreBtn.style.display = "none";
  }

  // Step 1: Broth
  if (step.layout === "vertical") {
    sidebar.classList.remove("centered-mode");
    sideOptions.style.display = "flex";
    bottomBar.style.display = "none";
    
    step.options.forEach(opt => {
      const isOut = soldOut.includes(opt);
      const btn = document.createElement("div");
      btn.className = `side-option-tile ${order.soup === opt && !isOut ? "selected" : ""}`;
      btn.innerHTML = isOut ? `<span style="text-decoration:line-through;opacity:0.5;">${opt}</span> <small style="color:#b91c1c;margin-left:6px;font-size:0.7rem;">(OUT)</small>` : opt;

      if (isOut) {
        btn.style.cursor = "not-allowed";
        btn.style.background = "#e9e4dc";
      } else {
        btn.onclick = () => {
          order.soup = opt;
          sideOptions.querySelectorAll(".side-option-tile").forEach(el => el.classList.remove("selected"));
          btn.classList.add("selected");
          updateVisualBowls();
        };
      }
      sideOptions.appendChild(btn);
    });
  } 
  // Steps 2-4: Horizontal Bottom Options
  else if (step.layout === "horizontal") {
    sidebar.classList.add("centered-mode");
    sideOptions.style.display = "none";
    bottomBar.style.display = "flex";

    step.options.forEach(opt => {
      const card = document.createElement("div");
      card.className = `bottom-option-card ${order[step.name] === opt ? "selected" : ""}`;
      card.innerText = opt;
      card.onclick = () => {
        order[step.name] = opt;
        bottomBar.querySelectorAll(".bottom-option-card").forEach(el => el.classList.remove("selected"));
        card.classList.add("selected");
        updateVisualBowls();
      };
      bottomBar.appendChild(card);
    });

    const arrow = document.createElement("button");
    arrow.className = "circle-arrow-btn";
    arrow.title = "Next Step";
    arrow.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    arrow.onclick = nextStep;
    bottomBar.appendChild(arrow);
  } 
  // Step 5: Toppings
  else if (step.layout === "mixed") {
    sidebar.classList.remove("centered-mode");
    sideOptions.style.display = "flex";
    bottomBar.style.display = "flex";

    step.sideOptions.forEach(opt => {
      const isOut = soldOut.includes(opt);
      const btn = document.createElement("div");
      btn.className = `side-option-tile ${order.toppings.includes(opt) && !isOut ? "selected" : ""}`;
      btn.innerHTML = isOut ? `<span style="text-decoration:line-through;opacity:0.5;">${opt}</span>` : opt;
      if (isOut) {
        btn.style.cursor = "not-allowed";
        btn.style.background = "#e9e4dc";
      } else {
        btn.onclick = () => { toggleTopping(opt); };
      }
      sideOptions.appendChild(btn);
    });

    step.bottomOptions.forEach(opt => {
      const isOut = soldOut.includes(opt);
      const card = document.createElement("div");
      card.className = `bottom-option-card ${order.toppings.includes(opt) && !isOut ? "selected" : ""}`;
      card.innerHTML = isOut ? `<span style="text-decoration:line-through;opacity:0.5;">${opt}</span>` : opt;
      if (isOut) {
        card.style.cursor = "not-allowed";
        card.style.background = "#e9e4dc";
      } else {
        card.onclick = () => { toggleTopping(opt); };
      }
      bottomBar.appendChild(card);
    });

    const arrow = document.createElement("button");
    arrow.className = "circle-arrow-btn";
    arrow.title = "Finish";
    arrow.innerHTML = '<i class="fa-solid fa-check"></i>';
    arrow.onclick = nextStep;
    bottomBar.appendChild(arrow);
  }

  updateVisualBowls();
  updateCartBadge();
}

function updateVisualBowls() {
  const liquid = document.getElementById("liquidGraphic");
  if (liquid) {
    const theme = soupThemes[order.soup] || soupThemes.Tsukemen;
    liquid.style.background = theme.bg;
  }

  const topLayer = document.getElementById("toppingLayer");
  if (topLayer) {
    topLayer.innerHTML = "";
    order.toppings.forEach((top, idx) => {
      const meta = toppingMeta[top] || { icon: "🥢", class: "topping-egg" };
      const coord = plateCoordinates[idx % plateCoordinates.length];

      const pill = document.createElement("div");
      pill.className = `topping-pill ${meta.class}`;
      pill.innerHTML = `<span>${meta.icon}</span> <span>${top}</span>`;
      pill.style.top = coord.top;
      pill.style.left = coord.left;
      topLayer.appendChild(pill);
    });
  }
}

function toggleTopping(item) {
  const idx = order.toppings.indexOf(item);
  if (idx > -1) {
    order.toppings.splice(idx, 1);
  } else {
    order.toppings.push(item);
  }
  renderStep();
}

function saveCurrentCustomToCart() {
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("myRamenCart")) || [];
  } catch (e) {
    cart = [];
  }

  cart.push({
    id: "custom_" + Date.now(),
    isPreset: false,
    name: "Custom Ramen",
    soup: order.soup,
    richness: order.richness,
    noodleVar: order.noodleVar,
    noodleType: order.noodleType,
    toppings: [...order.toppings],
    price: 150,
    quantity: 1
  });

  localStorage.setItem("myRamenCart", JSON.stringify(cart));
}

function nextStep() {
  if (currentStep < steps.length - 1) {
    currentStep++;
    renderStep();
  } else {
    saveCurrentCustomToCart();
    document.body.classList.add('page-exit');
    setTimeout(() => {
      window.location.href = "summary.html";
    }, 240);
  }
}

function addMoreCustom() {
  saveCurrentCustomToCart();
  document.body.classList.add('page-exit');
  setTimeout(() => {
    window.location.href = "home.html";
  }, 240);
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    renderStep();
  } else {
    document.body.classList.add('page-exit');
    setTimeout(() => {
      window.location.href = "home.html";
    }, 240);
  }
}

document.getElementById("builderNextBtn").addEventListener("click", nextStep);
document.getElementById("builderBackBtn").addEventListener("click", prevStep);
document.getElementById("builderAddMoreBtn").addEventListener("click", addMoreCustom);

document.addEventListener("DOMContentLoaded", () => {
  renderStep();
});