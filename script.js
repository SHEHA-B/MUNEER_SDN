/* ============================================================
   SDN — Premium Streetwear
   Main JavaScript
   ============================================================ */

// ============================================================
// CONFIGURATION
// ============================================================
const WHATSAPP_NUMBER   = "201515271901";
const INSTAGRAM_USERNAME = "sdn.240";

// ============================================================
// JSONBIN — قاعدة البيانات المشتركة لكل الزوار
// ============================================================
const JSONBIN_ID  = "6a09fa45adc21f119ab4482a";
const JSONBIN_KEY = "$2a$10$aPp1nWEeN5ZeodnWHwhJIOvt0Kyc6W4A/8W3mOvLXxPd.TpPobkrm";
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_ID}`;

// In-memory cache
let _cachedProducts = [];

function getProducts() {
  return _cachedProducts;
}

// جلب المنتجات من JSONBin
async function fetchProducts() {
  try {
    const res = await fetch(JSONBIN_URL + "/latest", {
      headers: { "X-Access-Key": JSONBIN_KEY }
    });
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    // البيانات ممكن تكون { products: [...] } أو مصفوفة مباشرة
    const raw = data.record;
    _cachedProducts = Array.isArray(raw) ? raw
                    : Array.isArray(raw?.products) ? raw.products
                    : [];
    renderProducts();
    populateDesignSelect(_cachedProducts);
  } catch (err) {
    console.warn("JSONBin error:", err.message);
    _cachedProducts = [];
    renderProducts();
    populateDesignSelect([]);
  }
}

// ============================================================
// STATE
// ============================================================
let cart = [];
let designImage = null;
let selectedProduct = null;

// ============================================================
// TRANSLATIONS
// ============================================================
const i18n = {
  en: {
    tagline:         "Premium Streetwear",
    enter:           "Enter",
    nav_home:        "Home",
    nav_shop:        "Shop",
    nav_design:      "Design Your Order",
    nav_design_short:"Design",
    nav_contact:     "Contact",
    cart:            "Cart",
    cart_title:      "Your Cart",
    cart_empty:      "Your cart is empty.",
    total:           "Total",
    checkout:        "Checkout via WhatsApp",
    hero_eyebrow:    "Est. 2024 — Limited Drops",
    hero_subtitle:   "NEW ERA OF FASHION — Style Defines Now",
    shop_now:        "Shop Now",
    scroll:          "Scroll",
    shop_eyebrow:    "Latest Drops",
    shop_title:      "Our Collection",
    design_eyebrow:  "Custom Orders",
    design_title:    "Design Your Order",
    step1_num:       "Step 01",
    step1_title:     "Choose a Product",
    select_shirt:    "Select T-Shirt",
    select_placeholder: "— Select a product —",
    step2_num:       "Step 02",
    step2_title:     "Upload Your Design",
    upload_text:     "Click to upload your design",
    step3_num:       "Step 03",
    step3_title:     "Your Details",
    label_name:      "Full Name",
    ph_name:         "Your name",
    label_phone:     "Phone Number",
    label_size:      "Size",
    size_placeholder:"— Select size —",
    label_notes:     "Notes (optional)",
    ph_notes:        "Any special instructions...",
    send_order:      "Send Order via WhatsApp",
    preview_label:   "Live Preview",
    color_label:     "T-Shirt Color",
    canvas_hint:     "Select a color, upload your design, then drag it to position",
    contact_eyebrow: "Get in Touch",
    contact_title:   "Contact Us",
    chat_us:         "Chat with us",
    footer_copy:     "SDN © 2025 — Premium Streetwear. All rights reserved.",
    add_to_cart:     "Add to Cart",
    no_products:     "No products yet. Check back soon for new drops!",
  },
  ar: {
    tagline:         "ملابس بريميوم",
    enter:           "دخول",
    nav_home:        "الرئيسية",
    nav_shop:        "المتجر",
    nav_design:      "صمم طلبك",
    nav_design_short:"التصميم",
    nav_contact:     "تواصل معنا",
    cart:            "السلة",
    cart_title:      "سلة المشتريات",
    cart_empty:      "سلتك فارغة.",
    total:           "الإجمالي",
    checkout:        "إتمام الطلب عبر واتساب",
    hero_eyebrow:    "تأسست 2024 — إصدارات محدودة",
    hero_subtitle:   "عصر جديد من الموضة — الستايل يعرّف نفسه",
    shop_now:        "تسوق الآن",
    scroll:          "اسحب",
    shop_eyebrow:    "أحدث الإصدارات",
    shop_title:      "مجموعتنا",
    design_eyebrow:  "طلبات مخصصة",
    design_title:    "صمم طلبك",
    step1_num:       "الخطوة ١",
    step1_title:     "اختر المنتج",
    select_shirt:    "اختر التيشيرت",
    select_placeholder: "— اختر منتجاً —",
    step2_num:       "الخطوة ٢",
    step2_title:     "ارفع تصميمك",
    upload_text:     "اضغط لرفع تصميمك",
    step3_num:       "الخطوة ٣",
    step3_title:     "بياناتك",
    label_name:      "الاسم الكامل",
    ph_name:         "اسمك",
    label_phone:     "رقم الهاتف",
    label_size:      "المقاس",
    size_placeholder:"— اختر المقاس —",
    label_notes:     "ملاحظات (اختياري)",
    ph_notes:        "أي تعليمات خاصة...",
    send_order:      "إرسال الطلب عبر واتساب",
    preview_label:   "معاينة مباشرة",
    color_label:     "لون التيشيرت",
    canvas_hint:     "اختر لوناً، ارفع تصميمك، ثم اسحبه لتحديد موضعه",
    contact_eyebrow: "تواصل معنا",
    contact_title:   "اتصل بنا",
    chat_us:         "تحدث معنا",
    footer_copy:     "SDN © 2025 — ملابس بريميوم. جميع الحقوق محفوظة.",
    add_to_cart:     "أضف للسلة",
    no_products:     "لا توجد منتجات بعد. تابعنا لمعرفة أحدث الإصدارات!",
  }
};

let currentLang = localStorage.getItem("sdn_lang") || "en";

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem("sdn_lang", lang);
  const html = document.documentElement;
  html.lang = lang;
  // RTL on body only — keeps splash & navbar always LTR
  document.body.dir       = lang === "ar" ? "rtl" : "ltr";
  document.body.style.textAlign = lang === "ar" ? "right" : "";

  // Translate all data-i18n elements
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (i18n[lang][key]) el.textContent = i18n[lang][key];
  });

  // Translate placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (i18n[lang][key]) el.placeholder = i18n[lang][key];
  });

  // Update lang toggle button
  const btn = document.getElementById("lang-toggle");
  if (btn) {
    btn.textContent = lang === "ar" ? "EN" : "AR";
    btn.classList.toggle("active", lang === "ar");
  }

  // Update color name display
  const activeSwatchEl = document.querySelector(".swatch.active");
  if (activeSwatchEl) {
    const nameEl = document.getElementById("color-name-display");
    if (nameEl) nameEl.textContent = lang === "ar"
      ? activeSwatchEl.dataset.nameAr
      : activeSwatchEl.dataset.name;
  }

  // Re-render products so "Add to Cart" button text updates
  renderProducts();
}

// ============================================================
// UTILITY
// ============================================================
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
  // 1200  — words fade + slide in (S→tyle, D→efined, N→ow)
  // 1700  — underline expands
  // 2000  — tagline fades in (CSS animation already handles this at 1.4s)
  // 2400  — enter button fades in (CSS animation at 1.8s)
  // 5000  — auto-hide

  const letters = ["s", "d", "n"];
  const words   = ["style", "defined", "now"];

  // Phase 1 — spread letters apart (less spacing on mobile)
  setTimeout(() => {
    const isMobile = window.innerWidth <= 768;
    const spacing  = isMobile ? "0.08em" : "0.18em";
    letters.forEach(id => {
      const el = document.getElementById("letter-" + id);
      el.style.transition    = "letter-spacing 0.9s cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.letterSpacing = spacing;
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
    // Start music when user enters (respects browser autoplay policy)
    initMusic();
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
// MUSIC
// ============================================================
function initMusic() {
  const audio      = document.getElementById("bg-music");
  const musicBtn   = document.getElementById("music-toggle");
  if (!audio || !musicBtn) return;

  audio.volume = 0.35;

  // Try to play
  audio.play().then(() => {
    musicBtn.classList.add("playing");
    musicBtn.classList.remove("muted");
  }).catch(() => {
    // Autoplay blocked — stay muted, user can click to play
    musicBtn.classList.add("muted");
  });

  musicBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      musicBtn.classList.add("playing");
      musicBtn.classList.remove("muted");
    } else {
      audio.pause();
      musicBtn.classList.remove("playing");
      musicBtn.classList.add("muted");
    }
  });
}

// ============================================================
// LANGUAGE TOGGLE
// ============================================================
(function initLang() {
  // Apply saved language on load
  applyLang(currentLang);

  const btn = document.getElementById("lang-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    applyLang(currentLang === "en" ? "ar" : "en");
  });
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
  const cartBtn       = document.getElementById("cart-btn");
  const cartBtnMobile = document.getElementById("cart-btn-mobile");
  const cartOverlay   = document.getElementById("cart-overlay");
  const cartClose     = document.getElementById("cart-close");
  const checkoutBtn   = document.getElementById("checkout-btn");

  cartBtn.addEventListener("click", openCart);
  if (cartBtnMobile) cartBtnMobile.addEventListener("click", () => {
    // Close the nav drawer first, then open cart
    document.getElementById("hamburger").classList.remove("open");
    document.getElementById("nav-links").classList.remove("open");
    openCart();
  });
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
  const badge       = document.getElementById("cart-badge");
  const badgeMobile = document.getElementById("cart-badge-menu");
  if (cart.length > 0) {
    badge.textContent = cart.length;
    badge.classList.add("visible");
    if (badgeMobile) {
      badgeMobile.textContent = cart.length;
      badgeMobile.classList.add("visible");
    }
  } else {
    badge.classList.remove("visible");
    if (badgeMobile) badgeMobile.classList.remove("visible");
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
        <p>${i18n[currentLang].no_products}</p>
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
          ${i18n[currentLang].add_to_cart}
        </button>
      </div>
    </div>
  `).join("");
}

// ============================================================
// DESIGN YOUR ORDER — Canvas Preview with drag, colors, WhatsApp image
// ============================================================
(function initDesign() {
  const canvas        = document.getElementById("design-canvas");
  const ctx           = canvas.getContext("2d");
  const productSelect = document.getElementById("product-select");
  const uploadInput   = document.getElementById("design-upload");
  const filenameEl    = document.getElementById("upload-filename");
  const submitBtn     = document.getElementById("submit-order");
  const swatches      = document.querySelectorAll(".swatch");
  const colorNameEl   = document.getElementById("color-name-display");
  const canvasHint    = document.getElementById("canvas-hint");

  // ---- State ----
  let shirtColor   = "#ffffff";   // current t-shirt color
  let shirtImg     = null;        // loaded product image (if any)

  // Sticker position & drag state
  let sticker = {
    x: canvas.width / 2,
    y: canvas.height * 0.38,
    w: 0, h: 0,           // set when image loads
    dragging: false,
    offX: 0, offY: 0
  };

  // ---- Populate product dropdown (called externally by Firebase listener) ----
  function populateSelect() {
    populateDesignSelect(getProducts());
  }
  // Initial populate (may be empty until Firebase responds)
  populateSelect();

  // ---- Draw everything ----
  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, W, H);

    if (shirtImg) {
      // Draw the actual product image tinted with chosen color
      // 1. Draw image normally
      const ratio = Math.min(W / shirtImg.width, H / shirtImg.height) * 0.92;
      const dw = shirtImg.width  * ratio;
      const dh = shirtImg.height * ratio;
      const dx = (W - dw) / 2;
      const dy = (H - dh) / 2;
      ctx.drawImage(shirtImg, dx, dy, dw, dh);

      // 2. Tint overlay using multiply-like blend
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = shirtColor;
      ctx.fillRect(dx, dy, dw, dh);
      ctx.globalCompositeOperation = "source-over";
    } else {
      // Draw SVG-style placeholder shirt in chosen color
      drawPlaceholderShirt(W, H);
    }

    // Draw sticker (draggable design)
    if (designImage && sticker.w > 0) {
      ctx.save();
      // Subtle shadow so sticker pops off shirt
      ctx.shadowColor   = "rgba(0,0,0,0.45)";
      ctx.shadowBlur    = 8;
      ctx.shadowOffsetY = 3;
      ctx.drawImage(
        designImage,
        sticker.x - sticker.w / 2,
        sticker.y - sticker.h / 2,
        sticker.w,
        sticker.h
      );
      ctx.restore();

      // Dashed border when dragging
      if (sticker.dragging) {
        ctx.strokeStyle = "#c9a84c";
        ctx.lineWidth   = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(
          sticker.x - sticker.w / 2 - 2,
          sticker.y - sticker.h / 2 - 2,
          sticker.w + 4,
          sticker.h + 4
        );
        ctx.setLineDash([]);
      }
    }

    // Bottom label
    drawLabel(W, H);
  }

  function drawPlaceholderShirt(W, H) {
    const cx = W / 2, cy = H / 2;
    const w = W * 0.62, h = H * 0.62;
    const x = cx - w / 2, y = cy - h / 2;

    // Shirt fill
    ctx.fillStyle = shirtColor;
    ctx.strokeStyle = "rgba(201,168,76,0.5)";
    ctx.lineWidth = 1.5;

    const sl = w * 0.22;   // sleeve length
    const sw = w * 0.28;   // sleeve width
    const nw = w * 0.22;   // neck width

    ctx.beginPath();
    ctx.moveTo(x + sl, y);
    ctx.lineTo(x, y + sw);
    ctx.lineTo(x + sl, y + sw * 0.8);
    ctx.lineTo(x + sl, y + h);
    ctx.lineTo(x + w - sl, y + h);
    ctx.lineTo(x + w - sl, y + sw * 0.8);
    ctx.lineTo(x + w, y + sw);
    ctx.lineTo(x + w - sl, y);
    ctx.quadraticCurveTo(cx + nw, y + h * 0.12, cx, y + h * 0.1);
    ctx.quadraticCurveTo(cx - nw, y + h * 0.12, x + sl, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Subtle SDN watermark
    ctx.fillStyle   = shirtColor === "#ffffff" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
    ctx.font        = `bold ${w * 0.22}px Montserrat, sans-serif`;
    ctx.textAlign   = "center";
    ctx.textBaseline= "middle";
    ctx.fillText("SDN", cx, cy + h * 0.08);
  }

  function drawLabel(W, H) {
    if (selectedProduct) {
      ctx.fillStyle    = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, H - 36, W, 36);
      ctx.fillStyle    = "#c9a84c";
      ctx.font         = `600 10px Montserrat, sans-serif`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        selectedProduct.name + "  ·  " + formatCurrency(selectedProduct.price),
        W / 2, H - 18
      );
    }
  }

  draw();

  // ---- Color swatches ----
  swatches.forEach(btn => {
    btn.addEventListener("click", () => {
      swatches.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      shirtColor = btn.dataset.color;
      colorNameEl.textContent = btn.dataset.name;
      draw();
    });
  });

  // ---- Product selection ----
  productSelect.addEventListener("change", () => {
    const opt = productSelect.options[productSelect.selectedIndex];
    if (opt.value) {
      selectedProduct = {
        id:    opt.value,
        name:  opt.dataset.name,
        price: opt.dataset.price,
        image: opt.dataset.image
      };
      if (opt.dataset.image) {
        const img = new Image();
        img.onload  = () => { shirtImg = img; draw(); };
        img.onerror = () => { shirtImg = null; draw(); };
        img.src = opt.dataset.image;
      } else {
        shirtImg = null; draw();
      }
    } else {
      selectedProduct = null;
      shirtImg = null;
      draw();
    }
  });

  // ---- Design upload ----
  uploadInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    filenameEl.textContent = `✓ ${file.name}`;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        designImage = img;
        // Default sticker size: max 40% of canvas width, keep aspect ratio
        const maxW = canvas.width  * 0.40;
        const maxH = canvas.height * 0.35;
        const ratio = Math.min(maxW / img.width, maxH / img.height);
        sticker.w = img.width  * ratio;
        sticker.h = img.height * ratio;
        sticker.x = canvas.width  / 2;
        sticker.y = canvas.height * 0.38;
        canvasHint.textContent = "Drag the design to reposition it";
        draw();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  // ---- Drag logic (mouse + touch) ----
  function getCanvasPos(e) {
    const rect  = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left)  * scaleX,
      y: (src.clientY - rect.top)   * scaleY
    };
  }

  function hitSticker(pos) {
    if (!designImage || sticker.w === 0) return false;
    return (
      pos.x >= sticker.x - sticker.w / 2 - 8 &&
      pos.x <= sticker.x + sticker.w / 2 + 8 &&
      pos.y >= sticker.y - sticker.h / 2 - 8 &&
      pos.y <= sticker.y + sticker.h / 2 + 8
    );
  }

  function onDragStart(e) {
    const pos = getCanvasPos(e);
    if (hitSticker(pos)) {
      sticker.dragging = true;
      sticker.offX = pos.x - sticker.x;
      sticker.offY = pos.y - sticker.y;
      canvas.style.cursor = "grabbing";
      e.preventDefault();
    }
  }

  function onDragMove(e) {
    if (!sticker.dragging) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    // Clamp so sticker stays inside canvas
    const hw = sticker.w / 2, hh = sticker.h / 2;
    sticker.x = Math.max(hw, Math.min(canvas.width  - hw, pos.x - sticker.offX));
    sticker.y = Math.max(hh, Math.min(canvas.height - hh, pos.y - sticker.offY));
    draw();
  }

  function onDragEnd() {
    sticker.dragging = false;
    canvas.style.cursor = "grab";
    draw();
  }

  // Mouse
  canvas.addEventListener("mousedown",  onDragStart);
  canvas.addEventListener("mousemove",  onDragMove);
  canvas.addEventListener("mouseup",    onDragEnd);
  canvas.addEventListener("mouseleave", onDragEnd);

  // Touch
  canvas.addEventListener("touchstart", onDragStart, { passive: false });
  canvas.addEventListener("touchmove",  onDragMove,  { passive: false });
  canvas.addEventListener("touchend",   onDragEnd);

  // ---- Submit order via WhatsApp (with canvas image) ----
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

    // Get the chosen color name
    const activeSwatchEl = document.querySelector(".swatch.active");
    const chosenColor    = activeSwatchEl ? activeSwatchEl.dataset.name : shirtColor;

    // Export canvas as image and upload to a data URL
    // We send the image via a separate link using a blob URL
    const hasDesign = designImage !== null;

    // Build the canvas snapshot as a data URL
    const imageDataUrl = canvas.toDataURL("image/png");

    // Open image in new tab so owner can see it, then open WhatsApp
    const previewWin = window.open("", "_blank");
    if (previewWin) {
      previewWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>SDN Order Preview</title>
          <style>
            body { margin:0; background:#0a0a0a; display:flex; flex-direction:column;
                   align-items:center; justify-content:center; min-height:100vh;
                   font-family:sans-serif; color:#c9a84c; }
            img  { max-width:360px; width:90vw; border:1px solid #2a2a2a; border-radius:8px; }
            p    { margin-top:1rem; font-size:0.8rem; letter-spacing:0.2em; color:#888; }
          </style>
        </head>
        <body>
          <img src="${imageDataUrl}" alt="Order Preview" />
          <p>SDN — Order Preview</p>
        </body>
        </html>
      `);
      previewWin.document.close();
    }

    const msg = encodeURIComponent(
      `🛍️ *Custom Order — SDN*\n\n` +
      `*Product:* ${product.name}\n` +
      `*T-Shirt Color:* ${chosenColor}\n` +
      `*Price:* ${formatCurrency(product.price)}\n` +
      `*Size:* ${size}\n\n` +
      `*Customer Name:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*Custom Design:* ${hasDesign ? "Yes ✅" : "No"}\n` +
      `*Notes:* ${notes || "—"}\n\n` +
      `📎 *Design Preview:* A preview window was opened — please screenshot and send it here.\n\n` +
      `Please confirm my order. Thank you! 🙏`
    );

    setTimeout(() => {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    }, 400);
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
  fetchProducts();
});

// Helper: populate the design section dropdown
function populateDesignSelect(products) {
  const productSelect = document.getElementById("product-select");
  if (!productSelect) return;
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