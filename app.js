/* ============================================
   NoeAtelier — top-up interactions
   ============================================ */

const PACKAGES = {
  diamonds: [
    { id: "d86",   title: "86",    sub: "Diamonds", price: 22000,  label: "86 Diamonds" },
    { id: "d172",  title: "172",   sub: "Diamonds", price: 44000,  label: "172 Diamonds", tag: "Popular" },
    { id: "d257",  title: "257",   sub: "Diamonds", price: 66000,  label: "257 Diamonds" },
    { id: "d344",  title: "344",   sub: "Diamonds", price: 88000,  label: "344 Diamonds" },
    { id: "d429",  title: "429",   sub: "Diamonds", price: 110000, label: "429 Diamonds" },
    { id: "d514",  title: "514",   sub: "Diamonds", price: 132000, label: "514 Diamonds" },
    { id: "d706",  title: "706",   sub: "Diamonds", price: 176000, label: "706 Diamonds", tag: "Best value" },
    { id: "d878",  title: "878",   sub: "Diamonds", price: 220000, label: "878 Diamonds" },
    { id: "d1412", title: "1,412", sub: "Diamonds", price: 352000, label: "1,412 Diamonds" },
    { id: "d2195", title: "2,195", sub: "Diamonds", price: 544000, label: "2,195 Diamonds" },
    { id: "d3688", title: "3,688", sub: "Diamonds", price: 880000, label: "3,688 Diamonds" },
    { id: "d5532", title: "5,532", sub: "Diamonds", price: 1320000, label: "5,532 Diamonds" },
  ],
  passes: [
    { id: "weekly",   title: "Weekly Diamond Pass", sub: "80 + 20/day · 7 days", price: 27000,  label: "Weekly Diamond Pass", tag: "Best seller" },
    { id: "twilight", title: "Twilight Pass",        sub: "Season rewards bundle", price: 145000, label: "Twilight Pass" },
    { id: "epic",     title: "Monthly Epic Bundle",  sub: "Epic skin + 200 diamonds", price: 98000, label: "Monthly Epic Bundle" },
  ],
};

const PROMO = { code: "MLBB10", rate: 0.1 };

const state = {
  category: "diamonds",
  packageId: null,
  payment: null,
  promoApplied: false,
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const $ = (id) => document.getElementById(id);

const els = {
  userId: $("userId"),
  zoneId: $("zoneId"),
  userIdError: $("userIdError"),
  zoneIdError: $("zoneIdError"),
  packGrid: $("packGrid"),
  packageError: $("packageError"),
  paymentError: $("paymentError"),
  tabs: document.querySelectorAll(".tab"),
  payGrid: $("payGrid"),
  sumAccount: $("sumAccount"),
  sumPackage: $("sumPackage"),
  sumPayment: $("sumPayment"),
  sumSubtotal: $("sumSubtotal"),
  sumDiscount: $("sumDiscount"),
  discountRow: $("discountRow"),
  sumTotal: $("sumTotal"),
  mobileTotal: $("mobileTotal"),
  promoInput: $("promoInput"),
  promoMsg: $("promoMsg"),
  promoHint: $("promoHint"),
  applyPromo: $("applyPromo"),
  checkout: $("checkout"),
  mobileCheckout: $("mobileCheckout"),
  formError: $("formError"),
  modal: $("successModal"),
  modalClose: $("modalClose"),
  modalAgain: $("modalAgain"),
  header: $("siteHeader"),
};

/* ---------- Derived values ---------- */

function allPackages() {
  return [...PACKAGES.diamonds, ...PACKAGES.passes];
}

function selectedPackage() {
  return allPackages().find((p) => p.id === state.packageId) || null;
}

function getIdValues() {
  return { id: els.userId.value.trim(), zone: els.zoneId.value.trim() };
}

function totals() {
  const pkg = selectedPackage();
  const subtotal = pkg ? pkg.price : 0;
  const discount = state.promoApplied ? Math.round(subtotal * PROMO.rate) : 0;
  return { subtotal, discount, total: subtotal - discount };
}

/* ---------- Render ---------- */

function renderPackages() {
  const items = PACKAGES[state.category];
  els.packGrid.innerHTML = "";

  items.forEach((pkg) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pack";
    btn.dataset.id = pkg.id;
    btn.setAttribute("aria-pressed", String(state.packageId === pkg.id));
    btn.innerHTML = `
      ${pkg.tag ? `<span class="pack-tag">${pkg.tag}</span>` : ""}
      <span class="pack-icon"><svg class="icon" aria-hidden="true"><use href="#i-gem"></use></svg></span>
      <span class="pack-title"><strong>${pkg.title}</strong><span>${pkg.sub}</span></span>
      <span class="pack-price">${rupiah.format(pkg.price)}</span>
    `;
    btn.addEventListener("click", () => {
      state.packageId = pkg.id;
      els.packageError.textContent = "";
      els.packGrid.querySelectorAll(".pack").forEach((el) => {
        el.setAttribute("aria-pressed", String(el.dataset.id === pkg.id));
      });
      clearFormError();
      renderSummary();
    });
    els.packGrid.appendChild(btn);
  });
}

function renderSummary() {
  const { id, zone } = getIdValues();
  const pkg = selectedPackage();
  const { subtotal, discount, total } = totals();

  els.sumAccount.textContent = id ? (zone ? `${id} (${zone})` : id) : "Not set";
  els.sumAccount.classList.toggle("empty", !id);

  els.sumPackage.textContent = pkg ? pkg.label : "Not selected";
  els.sumPackage.classList.toggle("empty", !pkg);

  els.sumPayment.textContent = state.payment || "Not selected";
  els.sumPayment.classList.toggle("empty", !state.payment);

  els.sumSubtotal.textContent = rupiah.format(subtotal);
  els.sumDiscount.textContent = `−${rupiah.format(discount)}`;
  els.discountRow.hidden = discount === 0;
  els.sumTotal.textContent = rupiah.format(total);
  els.mobileTotal.textContent = rupiah.format(total);

  // Step completion indicators
  setStepDone(1, /^\d{4,12}$/.test(id) && /^\d{3,5}$/.test(zone));
  setStepDone(2, Boolean(pkg));
  setStepDone(3, Boolean(state.payment));
}

function setStepDone(step, done) {
  const section = document.querySelector(`.step[data-step="${step}"]`);
  if (!section) return;
  const num = section.querySelector(".step-num");
  if (!num) return;
  section.classList.toggle("is-done", done);
  if (!num.dataset.number) num.dataset.number = num.textContent;
  num.textContent = done ? "✓" : num.dataset.number;
}

/* ---------- Validation ---------- */

function clearFormError() {
  els.formError.textContent = "";
}

function setFieldError(input, errorEl, message) {
  errorEl.textContent = message;
  input.classList.toggle("is-invalid", Boolean(message));
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
}

function validateForm() {
  const { id, zone } = getIdValues();
  let firstInvalid = null;
  let message = "";

  if (!/^\d{4,12}$/.test(id)) {
    setFieldError(els.userId, els.userIdError, "Enter your numeric User ID (4–12 digits).");
    firstInvalid = firstInvalid || els.userId;
  } else {
    setFieldError(els.userId, els.userIdError, "");
  }

  if (!/^\d{3,5}$/.test(zone)) {
    setFieldError(els.zoneId, els.zoneIdError, "Enter your Zone ID (3–5 digits).");
    firstInvalid = firstInvalid || els.zoneId;
  } else {
    setFieldError(els.zoneId, els.zoneIdError, "");
  }

  if (!selectedPackage()) {
    message = "Choose a diamond package to continue.";
    els.packageError.textContent = message;
    firstInvalid = firstInvalid || els.packGrid.querySelector(".pack");
  } else {
    els.packageError.textContent = "";
  }

  if (!state.payment) {
    message = message || "Select a payment method to continue.";
    els.paymentError.textContent = "Select a payment method to continue.";
  } else {
    els.paymentError.textContent = "";
  }

  els.formError.textContent = message;

  if (firstInvalid) {
    firstInvalid.focus({ preventScroll: true });
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }
  return true;
}

/* ---------- Promo ---------- */

function applyPromoCode(rawCode) {
  const code = (rawCode || "").trim().toUpperCase();
  els.promoInput.value = code;

  if (!code) {
    state.promoApplied = false;
    els.promoMsg.className = "promo-msg err";
    els.promoMsg.textContent = "Enter a promo code first.";
  } else if (code === PROMO.code) {
    state.promoApplied = true;
    els.promoMsg.className = "promo-msg ok";
    els.promoMsg.textContent = `${PROMO.code} applied — 10% off your order.`;
  } else {
    state.promoApplied = false;
    els.promoMsg.className = "promo-msg err";
    els.promoMsg.textContent = "That code isn't valid. Try MLBB10.";
  }
  renderSummary();
}

/* ---------- Checkout ---------- */

function openModal() {
  const { id, zone } = getIdValues();
  const pkg = selectedPackage();
  const { total } = totals();
  const orderCode = "ML" + Math.random().toString(36).slice(2, 8).toUpperCase();

  $("mOrder").textContent = orderCode;
  $("mAccount").textContent = `${id} (${zone})`;
  $("mPackage").textContent = pkg.label;
  $("mPayment").textContent = state.payment;
  $("mTotal").textContent = rupiah.format(total);

  lastFocused = document.activeElement;
  els.modal.hidden = false;
  document.body.style.overflow = "hidden";
  els.modalClose.focus();
}

let lastFocused = null;

function closeModal() {
  if (els.modal.hidden) return;
  els.modal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocused && typeof lastFocused.focus === "function") {
    lastFocused.focus({ preventScroll: true });
  }
}

function resetOrder() {
  els.userId.value = "";
  els.zoneId.value = "";
  state.packageId = null;
  state.payment = null;
  state.promoApplied = false;
  els.promoInput.value = "";
  els.promoMsg.className = "promo-msg";
  els.promoMsg.innerHTML = `New here? Try <button class="link" id="promoHint" type="button">MLBB10</button> for 10% off.`;
  els.payGrid.querySelectorAll('input[name="payment"]').forEach((input) => {
    input.checked = false;
  });
  setFieldError(els.userId, els.userIdError, "");
  setFieldError(els.zoneId, els.zoneIdError, "");
  els.packageError.textContent = "";
  els.paymentError.textContent = "";
  clearFormError();
  renderPackages();
  renderSummary();
  bindPromoHint();
}

/* ---------- Events ---------- */

function bindPromoHint() {
  const hint = $("promoHint");
  if (hint) {
    hint.addEventListener("click", () => applyPromoCode(PROMO.code));
  }
}

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.classList.contains("is-active")) return;
    state.category = tab.dataset.category;
    state.packageId = null;
    els.packageError.textContent = "";
    clearFormError();
    els.tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-pressed", String(active));
    });
    renderPackages();
    renderSummary();
  });
});

els.payGrid.addEventListener("change", (event) => {
  if (event.target.name !== "payment") return;
  state.payment = event.target.value;
  els.paymentError.textContent = "";
  clearFormError();
  renderSummary();
});

[els.userId, els.zoneId].forEach((input) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "");
    setFieldError(input, input === els.userId ? els.userIdError : els.zoneIdError, "");
    clearFormError();
    renderSummary();
  });
  input.addEventListener("blur", () => {
    if (!input.value) return;
    const valid = input === els.userId ? /^\d{4,12}$/.test(input.value) : /^\d{3,5}$/.test(input.value);
    if (!valid) {
      setFieldError(
        input,
        input === els.userId ? els.userIdError : els.zoneIdError,
        input === els.userId ? "User ID should be 4–12 digits." : "Zone ID should be 3–5 digits."
      );
    }
  });
});

[els.checkout, els.mobileCheckout].forEach((btn) => {
  btn.addEventListener("click", () => {
    clearFormError();
    if (!validateForm()) return;
    openModal();
  });
});

els.applyPromo.addEventListener("click", () => applyPromoCode(els.promoInput.value));
els.promoInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    applyPromoCode(els.promoInput.value);
  }
});

els.modal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close]")) closeModal();
});
els.modalClose.addEventListener("click", closeModal);
els.modalAgain.addEventListener("click", () => {
  closeModal();
  resetOrder();
  document.getElementById("topup").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

window.addEventListener("scroll", () => {
  els.header.classList.toggle("is-scrolled", window.scrollY > 8);
}, { passive: true });

/* ---------- Init ---------- */

renderPackages();
renderSummary();
bindPromoHint();
$("year").textContent = new Date().getFullYear();

// Subtle reveal on scroll
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
  const targets = document.querySelectorAll(".stats, .section-head, .step, .summary, .how-card, .feature, .faq-item, .site-footer .footer-grid");
  targets.forEach((el) => el.classList.add("reveal"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  targets.forEach((el) => observer.observe(el));
}
