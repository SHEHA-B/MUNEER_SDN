/* ============================================================
   SDN — Premium Streetwear
   Main JavaScript
   ============================================================ */

// ============================================================
// CONFIGURATION — Update these two lines before going live
// ============================================================

// TODO: Replace with your WhatsApp number (with country code, e.g., 201234567890)
const WHATSAPP_NUMBER = "201515271901";

// TODO: Replace with your Instagram username (without @)
const INSTAGRAM_USERNAME = "sdn.240";

// ============================================================
// STATE
// ============================================================
let cart = [];
let designImage = null;
let selectedProduct = null;

// ============================================================
// UTILITY
// ============================================================
function getProducts() {
  try {
    return JSON.parse(localStorage.getItem("sdn_products") || "[]");
  } catch {
    return [];
  }
}

function showToast(message, type = "default") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function formatCurrency(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num % 1 === 0 ? `${num} EGP` : `${num.toFixed(2)} EGP`;
}

// ============================================================
// SPLASH SCREEN — Cinematic SDN intro
// ============================================================
(function initSplash() {
  const splash     = document.getElementById("splash");
  const enterBtn   = document.getElementById("splash-enter");
  const particles  = document.getElementById("particles");
  const underline  = document.getElementById("splash-underline");

  // ---- Floating particles ----
  for (let i = 0; i < 25; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left              = Math.random() * 100 + "%";
    p.style.animationDuration = (4 + Math.random() * 8) + "s";
    p.style.animationDelay    = (Math.random() * 6) + "s";
    p.style.width = p.style.height = (1 + Math.random() * 3) + "px";
    p.style.opacity = (0.2 + Math.random() * 0.6).toString();
    particles.appendChild(p);
  }

  // ---- Cinematic sequence ----
  // Timeline (ms from page load):
  //  300  — wrapper fades/scales in (CSS animation)
  //  700  — letters spread apart (letter-spacing expands)
  // 1200  — words fade + slide in (S→tyle, D→efines, N→ow)
  // 1700  — underline expands
  // 2000  — tagline fades in (CSS animation already handles this at 1.4s)
  // 2400  — enter button fades in (CSS animation at 1.8s)
  // 5000  — auto-hide

  const letters = ["s", "d", "n"];
  const words   = ["style", "defines", "now"];

  // Phase 1 — spread letters apart
  setTimeout(() => {
    letters.forEach(id => {
      const el = document.getElementById("letter-" + id);
      el.style.transition   = "letter-spacing 0.9s cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.letterSpacing = "0.18em";
    });
  }, 700);

  // Phase 2 — reveal words with staggered fade-in
  words.forEach((id, i) => {
    setTimeout(() => {
      const el = document.getElementById("word-" + id);
      el.style.transition = "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.opacity    = "1";
      el.style.transform  = "translateX(0)";
    }, 1200 + i * 120);   // S first, then D, then N — 120ms apart
  });

  // Phase 3 — underline expands
  setTimeout(() => {
    underline.classList.add("expand");
  }, 1700);

  // ---- Hide splash ----
  document.body.style.overflow = "hidden";

  function hideSplash() {
    splash.classList.add("hidden");
    document.body.style.overflow = "";
  }

  const autoTimer = setTimeout(hideSplash, 5000);

  enterBtn.addEventListener("click", () => {
    clearTimeout(autoTimer);
    hideSplash();
  });
})();

// ============================================================
// NAVBAR
// ============================================================
(function initNavbar() {
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  });

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
    });
  });

  // Highlight active nav link on scroll
  const sections = document.querySelectorAll("section[id]");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.querySelectorAll("a").forEach(a => {
          a.style.color = a.getAttribute("href") === `#${entry.target.id}`
            ? "var(--gold)"
            : "";
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
})();

// ============================================================
// CONTACT LINKS — inject dynamic values
// ============================================================
(function initContactLinks() {
  const igLink = document.getElementById("instagram-link");
  const waLink = document.getElementById("whatsapp-link");

  if (igLink && INSTAGRAM_USERNAME !== "YOUR_INSTAGRAM_USERNAME") {
    igLink.href = `https://instagram.com/${INSTAGRAM_USERNAME}`;
    igLink.textContent = `@${INSTAGRAM_USERNAME}`;
  }
  if (waLink && WHATSAPP_NUMBER !== "YOUR_WHATSAPP_NUMBER") {
    waLink.href = `https://wa.me/${WHATSAPP_NUMBER}`;
  }
})();

// ============================================================
// CART
// ============================================================
(function initCart() {
  const cartBtn     = document.getElementById("cart-btn");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartClose   = document.getElementById("cart-close");
  const checkoutBtn = document.getElementById("checkout-btn");

  cartBtn.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", e => {
    if (e.target === cartOverlay) closeCart();
  });
  checkoutBtn.addEventListener("click", checkoutViaWhatsApp);

  function openCart() {
    cartOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
    renderCart();
  }
  function closeCart() {
    cartOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }
})();

function addToCart(product) {
  cart.push({ ...product, cartId: Date.now() + Math.random() });
  updateCartBadge();
  showToast(`"${product.name}" added to cart`, "success");
}

function removeFromCart(cartId) {
  cart = cart.filter(item => item.cartId !== cartId);
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (cart.length > 0) {
    badge.textContent = cart.length;
    badge.classList.add("visible");
  } else {
    badge.classList.remove("visible");
  }
}

function renderCart() {
  const itemsEl  = document.getElementById("cart-items");
  const footerEl = document.getElementById("cart-footer");
  const totalEl  = document.getElementById("cart-total-price");

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty-msg">Your cart is empty.</p>';
    footerEl.style.display = "none";
    return;
  }

  footerEl.style.display = "block";
  let total = 0;
  itemsEl.innerHTML = cart.map(item => {
    const price = parseFloat(item.price) || 0;
    total += price;
    const fallback = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='70' height='90'><rect width='70' height='90' fill='%231a1a1a'/><text x='35' y='50' text-anchor='middle' fill='%23c9a84c' font-size='12' font-weight='bold'>SDN</text></svg>`;
    return `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.image || fallback}" alt="${item.name}"
          onerror="this.src='${fallback}'" />
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">${formatCurrency(item.price)}</p>
          ${item.category ? `<p style="font-size:0.7rem;color:var(--gray);margin-top:2px;">${item.category}</p>` : ""}
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.cartId})">×</button>
      </div>
    `;
  }).join("");
  totalEl.textContent = formatCurrency(total);
}

function checkoutViaWhatsApp() {
  if (cart.length === 0) return;
  const items = cart.map(i => `• ${i.name} — ${formatCurrency(i.price)}`).join("\n");
  const total = cart.reduce((s, i) => s + (parseFloat(i.price) || 0), 0);
  const msg = encodeURIComponent(
    `🛍️ *New Order — SDN*\n\n` +
    `*Items:*\n${items}\n\n` +
    `*Total:* ${formatCurrency(total)}\n\n` +
    `Please confirm my order. Thank you!`
  );
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}

// ============================================================
// SHOP — Render Products
// ============================================================
function renderProducts() {
  const grid = document.getElementById("product-grid");
  const products = getProducts();

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👕</div>
        <p>No products yet. Check back soon for new drops!</p>
      </div>
    `;
    return;
  }

  const fallback = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400'><rect width='300' height='400' fill='%231a1a1a'/><text x='150' y='200' text-anchor='middle' fill='%23c9a84c' font-size='48' font-weight='bold'>SDN</text></svg>`;

  grid.innerHTML = products.map((p, i) => `
    <div class="product-card" style="animation-delay:${i * 0.1}s">
      <div class="product-img-wrap">
        <img src="${p.image || fallback}" alt="${p.name}" loading="lazy"
          onerror="this.src='${fallback}'" />
        ${p.category ? `<span class="product-badge">${p.category}</span>` : ""}
      </div>
      <div class="product-info">
        ${p.category ? `<p class="product-category">${p.category}</p>` : ""}
        <h3 class="product-name">${p.name}</h3>
        <p class="product-price">${formatCurrency(p.price)}</p>
        <button class="btn-add-cart" onclick='addToCart(${JSON.stringify(p)})'>
          Add to Cart
        </button>
      </div>
    </div>
  `).join("");
}

// ============================================================
// DESIGN YOUR ORDER — Canvas Preview
// ============================================================
(function initDesign() {
  const canvas        = document.getElementById("design-canvas");
  const ctx           = canvas.getContext("2d");
  const productSelect = document.getElementById("product-select");
  const uploadInput   = document.getElementById("design-upload");
  const filenameEl    = document.getElementById("upload-filename");
  const submitBtn     = document.getElementById("submit-order");

  // Populate product dropdown
  function populateSelect() {
    const products = getProducts();
    productSelect.innerHTML = '<option value="">— Select a product —</option>';
    products.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.name} — ${formatCurrency(p.price)}`;
      opt.dataset.image = p.image || "";
      opt.dataset.name  = p.name;
      opt.dataset.price = p.price;
      productSelect.appendChild(opt);
    });
  }
  populateSelect();

  // Draw canvas
  function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawDesignOverlay = () => {
      if (designImage) {
        const maxW  = canvas.width * 0.55;
        const maxH  = canvas.height * 0.45;
        const ratio = Math.min(maxW / designImage.width, maxH / designImage.height);
        const dw    = designImage.width * ratio;
        const dh    = designImage.height * ratio;
        const dx    = (canvas.width - dw) / 2;
        const dy    = canvas.height * 0.28 - dh / 2;
        ctx.globalAlpha = 0.92;
        ctx.drawImage(designImage, dx, dy, dw, dh);
        ctx.globalAlpha = 1;
      }
    };

    if (selectedProduct && selectedProduct.image) {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
        const dw    = img.width * ratio;
        const dh    = img.height * ratio;
        const dx    = (canvas.width - dw) / 2;
        const dy    = (canvas.height - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);
        drawDesignOverlay();
        drawLabel();
      };
      img.onerror = () => {
        drawPlaceholderShirt();
        drawDesignOverlay();
        drawLabel();
      };
      img.src = selectedProduct.image;
    } else {
      drawPlaceholderShirt();
      drawDesignOverlay();
      drawLabel();
    }
  }

  function drawPlaceholderShirt() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const w  = 180, h = 200;
    const x  = cx - w / 2;
    const y  = cy - h / 2 + 10;

    ctx.fillStyle   = "#2a2a2a";
    ctx.strokeStyle = "#c9a84c";
    ctx.lineWidth   = 1.5;

    ctx.beginPath();
    ctx.moveTo(x + 40, y);
    ctx.lineTo(x, y + 50);
    ctx.lineTo(x + 40, y + 70);
    ctx.lineTo(x + 40, y + h);
    ctx.lineTo(x + w - 40, y + h);
    ctx.lineTo(x + w - 40, y + 70);
    ctx.lineTo(x + w, y + 50);
    ctx.lineTo(x + w - 40, y);
    ctx.quadraticCurveTo(cx + 20, y + 30, cx, y + 25);
    ctx.quadraticCurveTo(cx - 20, y + 30, x + 40, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle    = "#c9a84c";
    ctx.font         = "bold 28px Montserrat, sans-serif";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha  = 0.3;
    ctx.fillText("SDN", cx, cy + 20);
    ctx.globalAlpha  = 1;
  }

  function drawLabel() {
    if (selectedProduct) {
      ctx.fillStyle    = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
      ctx.fillStyle    = "#c9a84c";
      ctx.font         = "600 11px Montserrat, sans-serif";
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        selectedProduct.name + " — " + formatCurrency(selectedProduct.price),
        canvas.width / 2,
        canvas.height - 20
      );
    }
  }

  drawCanvas();

  // Product selection
  productSelect.addEventListener("change", () => {
    const opt = productSelect.options[productSelect.selectedIndex];
    if (opt.value) {
      selectedProduct = {
        id:    opt.value,
        name:  opt.dataset.name,
        price: opt.dataset.price,
        image: opt.dataset.image
      };
    } else {
      selectedProduct = null;
    }
    drawCanvas();
  });

  // Design upload
  uploadInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    filenameEl.textContent = `✓ ${file.name}`;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        designImage = img;
        drawCanvas();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Submit order via WhatsApp
  submitBtn.addEventListener("click", () => {
    const name    = document.getElementById("order-name").value.trim();
    const phone   = document.getElementById("order-phone").value.trim();
    const size    = document.getElementById("order-size").value;
    const notes   = document.getElementById("order-notes").value.trim();
    const product = selectedProduct;

    if (!product) { showToast("Please select a product first.", "error"); return; }
    if (!name)    { showToast("Please enter your name.", "error"); return; }
    if (!phone)   { showToast("Please enter your phone number.", "error"); return; }
    if (!size)    { showToast("Please select a size.", "error"); return; }

    const hasDesign = designImage !== null;
    const msg = encodeURIComponent(
      `🛍️ *Custom Order — SDN*\n\n` +
      `*Product:* ${product.name}\n` +
      `*Price:* ${formatCurrency(product.price)}\n` +
      `*Size:* ${size}\n\n` +
      `*Customer Name:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*Custom Design:* ${hasDesign ? "Yes ✅" : "No"}\n` +
      `*Notes:* ${notes || "—"}\n\n` +
      `Please confirm my order. Thank you! 🙏`
    );

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  });
})();

// ============================================================
// SCROLL REVEAL
// ============================================================
(function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity    = "1";
        entry.target.style.transform  = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".step, .contact-card, .section-header").forEach(el => {
    el.style.opacity    = "0";
    el.style.transform  = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
})();

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
});

// Sync products if admin tab is open simultaneously
window.addEventListener("storage", e => {
  if (e.key === "sdn_products") {
    renderProducts();
    // Re-populate design dropdown
    const productSelect = document.getElementById("product-select");
    const products = getProducts();
    productSelect.innerHTML = '<option value="">— Select a product —</option>';
    products.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.name} — ${formatCurrency(p.price)}`;
      opt.dataset.image = p.image || "";
      opt.dataset.name  = p.name;
      opt.dataset.price = p.price;
      productSelect.appendChild(opt);
    });
  }
});
