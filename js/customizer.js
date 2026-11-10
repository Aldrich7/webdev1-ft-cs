const steps = [
  {
    name: "soup",
    title: "CHOOSE YOUR SOUP VARIATION",
    layout: "vertical",
    options: ["Tsukemen", "Shio", "Miso", "Tonkotsu"],
    hint: "Select your broth, then click NEXT"
  },
  {
    name: "richness",
    title: "CHOOSE<br>YOUR<br>SOUP<br>RICHNESS",
    layout: "horizontal",
    options: ["Mild", "Normal", "Rich"],
    hint: "Select broth richness, then click NEXT"
  },
  {
    name: "noodleVar",
    title: "CHOOSE<br>YOUR<br>NOODLE<br>VARIATION",
    layout: "horizontal",
    options: ["Ramen", "Udon", "Soba"],
    hint: "Select noodle variety, then click NEXT"
  },
  {
    name: "noodleType",
    title: "CHOOSE<br>YOUR<br>NOODLE<br>TYPE",
    layout: "horizontal",
    options: ["Stringy", "Firm", "Chewy"],
    hint: "Select noodle texture, then click NEXT"
  },
  {
    name: "toppings",
    title: "CHOOSE YOUR TOPPINGS & ADD-ONS",
    layout: "mixed",
    sideOptions: ["Egg", "Naruto"],
    bottomOptions: ["Menma", "Nori", "Nira", "Cabbage", "Chashu"],
    hint: "Select toppings and add-ons, then click NEXT"
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
  addons: ["Fried Tofu"],
  qty: { noodles: 1, soup: 1, toppings: 1 }
};

const soupThemes = {
  Tsukemen: {
    bg: "radial-gradient(circle at 45% 45%, #D47A22 0%, #A84E11 65%, #6B2E05 100%)",
  },
  Shio: {
    bg: "radial-gradient(circle at 45% 45%, #F0D48B 0%, #D4B259 65%, #947525 100%)",
  },
  Miso: {
    bg: "radial-gradient(circle at 45% 45%, #C26321 0%, #94400E 65%, #5E2605 100%)",
  },
  Tonkotsu: {
    bg: "radial-gradient(circle at 45% 45%, #F7EFE1 0%, #E8D5BC 60%, #BFA785 100%)",
  }
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

function renderStep() {
  const step = steps[currentStep];
  const sidebar = document.getElementById("sidebarContainer");
  const sideTitle = document.getElementById("sidebarTitle");
  const sideOptions = document.getElementById("sidebarOptions");
  const bottomBar = document.getElementById("bottomBarContainer");
  const promptHint = document.getElementById("promptHint");

  sideTitle.innerHTML = step.title;
  if (promptHint) promptHint.innerText = step.hint;
  sideOptions.innerHTML = "";
  bottomBar.innerHTML = "";

  // Update Tracker Pills
  const trackerPills = document.querySelectorAll(".tracker-pill");
  trackerPills.forEach((pill, idx) => {
    pill.classList.remove("active", "completed");
    if (idx === currentStep) pill.classList.add("active");
    else if (idx < currentStep) pill.classList.add("completed");
  });

  // Step 1: Vertical Selection (Options in sidebar, hide bottom bar)
  if (step.layout === "vertical") {
    sidebar.classList.remove("center-title");
    bottomBar.style.display = "none";
    
    step.options.forEach(opt => {
      const btn = document.createElement("div");
      btn.className = `tile-btn serif ${order.soup === opt ? "selected" : ""}`;
      btn.innerText = opt;
      btn.onclick = () => {
        order.soup = opt;
        sideOptions.querySelectorAll(".tile-btn").forEach(el => el.classList.remove("selected"));
        btn.classList.add("selected");
        updateVisualBowls();
      };
      sideOptions.appendChild(btn);
    });
  } 
  // Steps 2-4: Horizontal Selection (Sidebar becomes centered title, full-width bottom bar)
  else if (step.layout === "horizontal") {
    sidebar.classList.add("center-title");
    bottomBar.style.display = "flex";

    step.options.forEach(opt => {
      const tile = document.createElement("div");
      tile.className = `bottom-tile serif ${order[step.name] === opt ? "selected" : ""}`;
      tile.innerText = opt;
      tile.onclick = () => {
        order[step.name] = opt;
        bottomBar.querySelectorAll(".bottom-tile").forEach(el => el.classList.remove("selected"));
        tile.classList.add("selected");
        updateVisualBowls();
      };
      bottomBar.appendChild(tile);
    });

    const arrow = document.createElement("div");
    arrow.className = "nav-arrow-tile";
    arrow.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    arrow.onclick = nextStep;
    bottomBar.appendChild(arrow);
  } 
  // Step 5: Mixed Layout (Toppings in both sidebar and bottom bar)
  else if (step.layout === "mixed") {
    sidebar.classList.remove("center-title");
    bottomBar.style.display = "flex";

    step.sideOptions.forEach(opt => {
      const btn = document.createElement("div");
      btn.className = `tile-btn serif ${order.toppings.includes(opt) ? "selected" : ""}`;
      btn.innerText = opt;
      btn.onclick = () => { toggleTopping(opt); };
      sideOptions.appendChild(btn);
    });

    step.bottomOptions.forEach(opt => {
      const tile = document.createElement("div");
      tile.className = `bottom-tile serif ${order.toppings.includes(opt) ? "selected" : ""}`;
      tile.innerText = opt;
      tile.onclick = () => { toggleTopping(opt); };
      bottomBar.appendChild(tile);
    });

    const arrow = document.createElement("div");
    arrow.className = "nav-arrow-tile";
    arrow.innerHTML = '<i class="fa-solid fa-check"></i>';
    arrow.onclick = nextStep;
    bottomBar.appendChild(arrow);
  }

  updateVisualBowls();
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

function nextStep() {
  if (currentStep < steps.length - 1) {
    currentStep++;
    renderStep();
  } else {
    localStorage.setItem("myRamenOrder", JSON.stringify(order));
    document.body.classList.add('page-exit');
    setTimeout(() => {
      window.location.href = "summary.html";
    }, 240);
  }
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

function jumpToStep(targetIndex) {
  if (targetIndex >= 0 && targetIndex < steps.length) {
    currentStep = targetIndex;
    renderStep();
  }
}

document.getElementById("builderNextBtn").addEventListener("click", nextStep);
document.getElementById("builderBackBtn").addEventListener("click", prevStep);

document.addEventListener("DOMContentLoaded", () => {
  renderStep();
});