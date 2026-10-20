
const fallback = (name) => `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 650'><rect width='900' height='650' fill='%23eef1e8'/><circle cx='705' cy='145' r='120' fill='%23d7caa5' opacity='.65'/><path d='M150 455c135-215 285-245 450-85 45 45 95 72 150 82' fill='none' stroke='%234f6f52' stroke-width='28' stroke-linecap='round'/><text x='72' y='125' font-family='Arial, sans-serif' font-size='52' fill='%232f4634'>${encodeURIComponent(name)}</text></svg>`;
const qs = (key) => document.querySelector(`[data-${key}]`);
const assetVersion = document.querySelector('meta[name="asset-version"]')?.content || "";
function versionedAsset(value) {
  const source = String(value || "");
  if (!source || !assetVersion || source.startsWith("data:") || source.startsWith("blob:")) return source;
  try {
    const url = new URL(source, window.location.href);
    if (url.origin !== window.location.origin) return source;
    url.searchParams.set("v", assetVersion);
    return url.href;
  } catch (_error) {
    return source;
  }
}
let products = [];
let activeCategory = "";
let isProductsPage = false;
let activeProduct = null;
let shareResetTimer = null;
let lightboxImages = [];
let lightboxIndex = 0;

const embeddedDataNode = document.getElementById("site-data");
const initialData = embeddedDataNode ? Promise.resolve(JSON.parse(embeddedDataNode.textContent)) : fetch(`data.json?v=${encodeURIComponent(assetVersion)}`, { cache: "no-store" }).then((res) => res.json());

initialData
  .then((data) => {
    const site = data.site || {};
    isProductsPage = Boolean(qs("products"));
    if (qs("brand")) qs("brand").textContent = site.brand || "";
    if (qs("tagline")) qs("tagline").textContent = site.tagline || "";
    if (qs("hero-title")) qs("hero-title").textContent = site.hero_title || "";
    if (qs("hero-text")) qs("hero-text").textContent = site.hero_text || "";
    if (qs("phone")) {
      qs("phone").textContent = site.phone ? `電話：${site.phone}` : "";
      qs("phone").href = site.phone ? `tel:${site.phone.split(/[｜|]/)[0].replace(/[^+\d]/g, "")}` : "#";
      qs("phone").hidden = !site.phone;
    }
    if (qs("address")) {
      qs("address").textContent = site.address ? `地址：${site.address}` : "";
      qs("address").hidden = !site.address;
    }
    if (qs("email")) {
      qs("email").textContent = site.email ? `Email：${site.email}` : "";
      qs("email").href = site.email ? `mailto:${site.email}` : "#";
      qs("email").hidden = !site.email;
    }
    if (qs("line-id")) {
      qs("line-id").textContent = site.line_id ? `LINE 官方 ID：${site.line_id}` : "";
      qs("line-id").hidden = !site.line_id;
    }
    if (qs("business-hours")) {
      qs("business-hours").textContent = site.business_hours ? `營業時間：${site.business_hours}` : "";
      qs("business-hours").hidden = !site.business_hours;
    }
    if (qs("footer")) qs("footer").textContent = site.footer || "";
    if (qs("facebook")) {
      const hasFacebook = Boolean(site.facebook && site.facebook.replace(/\/$/, "") !== "https://www.facebook.com");
      qs("facebook").href = hasFacebook ? site.facebook : "#";
      qs("facebook").textContent = site.facebook_text || "Facebook";
      qs("facebook").hidden = !hasFacebook;
    }
    products = data.products || [];
    const heroArtImage = document.querySelector("[data-hero-art-image]");
    const heroArtProduct = products.find((product) => product.featured && product.main_image)
      || products.find((product) => product.main_image);
    if (heroArtImage && heroArtProduct) {
      heroArtImage.src = versionedAsset(heroArtProduct.main_image);
      heroArtImage.alt = `${heroArtProduct.name || "圓霖精選茶"}茶品照片`;
    }
    renderCategoryMenu(data.categories || []);
    renderHomeCategories(data.categories || [], data.category_images || {});
    setupNavSearch();
    setupDialogActions();
    renderFeaturedProducts();

    if (isProductsPage) {
      const params = new URLSearchParams(window.location.search);
      activeCategory = params.get("category") || "";
      if (qs("product-search")) {
        qs("product-search").value = params.get("q") || "";
        qs("product-search").addEventListener("input", renderProducts);
      }
      if (qs("show-all")) {
        qs("show-all").addEventListener("click", (event) => {
          event.preventDefault();
          activeCategory = "";
          if (qs("product-search")) qs("product-search").value = "";
          window.history.replaceState({}, "", "products.html");
          renderProducts();
        });
      }
      renderProducts();
    }
    if (qs("category-toggle") && qs("category-menu")) {
      qs("category-toggle").addEventListener("click", () => {
        qs("category-menu").classList.toggle("open");
      });
    }
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".nav-menu") && qs("category-menu")) qs("category-menu").classList.remove("open");
    });
    openProductFromUrl();
  });

function setupNavSearch() {
  const form = qs("nav-search");
  const input = qs("product-search");
  if (!form || !input) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (isProductsPage) {
      activeCategory = "";
      window.history.replaceState({}, "", query ? `products.html?q=${encodeURIComponent(query)}` : "products.html");
      renderProducts();
      return;
    }
    window.location.href = query ? `products.html?q=${encodeURIComponent(query)}` : "products.html";
  });
}

function renderCategoryMenu(categories) {
  const menu = qs("category-menu");
  if (!menu) return;
  menu.replaceChildren();
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = category;
    button.addEventListener("click", () => {
      if (qs("category-menu")) qs("category-menu").classList.remove("open");
      if (isProductsPage) {
        activeCategory = category;
        if (qs("product-search")) qs("product-search").value = "";
        window.history.replaceState({}, "", `products.html?category=${encodeURIComponent(category)}`);
        renderProducts();
      } else {
        window.location.href = `products.html?category=${encodeURIComponent(category)}`;
      }
    });
    menu.appendChild(button);
  });
}

function renderHomeCategories(categories, categoryImages) {
  const wrap = qs("home-categories");
  if (!wrap) return;
  wrap.replaceChildren();
  wrap.dataset.count = String(categories.length);
  categories.forEach((category) => {
    const link = document.createElement("a");
    link.href = `products.html?category=${encodeURIComponent(category)}`;
    if (categoryImages[category]) {
      const image = document.createElement("img");
      image.className = "category-card-image";
      image.src = versionedAsset(categoryImages[category]);
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.fetchPriority = "low";
      link.appendChild(image);
    }
    const label = document.createElement("span");
    label.textContent = category;
    link.appendChild(label);
    wrap.appendChild(link);
  });
}

function editDistance(left, right, limit = 2) {
  if (left === right) return 0;
  if (!left) return right.length;
  if (!right) return left.length;
  if (Math.abs(left.length - right.length) > limit) return limit + 1;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      current.push(value);
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > limit) return limit + 1;
    previous = current;
  }
  return previous[right.length];
}

function fuzzyContains(query, text) {
  const q = (query || "").trim().toLowerCase();
  const value = (text || "").trim().toLowerCase();
  if (!q) return true;
  if (value.includes(q)) return true;
  if (q.length < 2) return false;
  if (!value) return false;
  if (!/^[ -]+$/.test(q) && q.length <= 2) return false;
  const threshold = q.length <= 3 ? 1 : 2;
  if (editDistance(q, value, threshold) <= threshold) return true;
  if (value.length >= q.length) {
    for (let start = 0; start <= value.length - q.length; start += 1) {
      if (editDistance(q, value.slice(start, start + q.length), threshold) <= threshold) return true;
    }
  }
  return false;
}

function searchMatches(query, product) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return true;
  if (fuzzyContains(q, product.name) || fuzzyContains(q, product.category)) return true;
  if (/^[\x00-\x7F]+$/.test(q)) return (product.search_keys || "").includes(q);
  return false;
}

function productCard(product, prioritizeImage = false) {
  const card = document.createElement("button");
  card.className = "product-card";
  // Featured cards intentionally follow the product's normal main image, so
  // changing that image in the admin is reflected everywhere.
  const image = document.createElement("img");
  image.src = versionedAsset(product.main_image || fallback(product.name || "茶款"));
  image.alt = product.name || "";
  image.loading = prioritizeImage ? "eager" : "lazy";
  image.decoding = "async";
  image.fetchPriority = prioritizeImage ? "high" : "low";
  const details = document.createElement("div");
  if (product.featured) {
    const badge = document.createElement("p");
    badge.className = "badge";
    badge.textContent = "精選";
    details.appendChild(badge);
  }
  const category = document.createElement("p");
  category.className = "eyebrow";
  category.textContent = product.category || "";
  const name = document.createElement("h3");
  name.textContent = product.name || "";
  const summary = document.createElement("p");
  summary.textContent = product.summary || "";
  details.append(category, name, summary);
  card.append(image, details);
  card.addEventListener("click", () => openProduct(product));
  return card;
}

function renderFeaturedProducts() {
  const grid = qs("featured-products");
  if (!grid) return;
  const featured = products.filter((product) => product.featured).slice(0, 10);
  grid.replaceChildren();
  featured.forEach((product, index) => grid.appendChild(productCard(product, index === 0)));
}

function renderProducts() {
  const searchInput = qs("product-search");
  const heading = qs("product-heading");
  const grid = qs("products");
  const emptyState = qs("empty-state");
  if (!searchInput || !heading || !grid) return;
  const query = searchInput.value.trim().toLowerCase();
  heading.textContent = activeCategory || "所有茶品";

  const visibleProducts = products.filter((product) => {
    const matchesCategory = !activeCategory || product.category === activeCategory;
    const matchesSearch = searchMatches(query, product);
    return matchesCategory && matchesSearch;
  });

  grid.replaceChildren();
  visibleProducts.forEach((product, index) => {
    grid.appendChild(productCard(product, index === 0));
  });
  if (emptyState) emptyState.hidden = visibleProducts.length > 0;
}

function productUrl(product) {
  const base = `${window.location.origin}${window.location.pathname.includes("products.html") ? window.location.pathname : `${window.location.pathname.replace(/index\.html$/, "").replace(/\/$/, "")}/products.html`}`;
  return `${base}?product=${encodeURIComponent(product.id || "")}`;
}

function setShareFeedback(message) {
  const feedback = qs("share-feedback");
  if (!feedback) return;
  feedback.textContent = message || "";
  if (shareResetTimer) window.clearTimeout(shareResetTimer);
  if (message) {
    shareResetTimer = window.setTimeout(() => {
      feedback.textContent = "";
    }, 2200);
  }
}

async function copyShareLink() {
  if (!activeProduct) return;
  const url = productUrl(activeProduct);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
    } else {
      const helper = document.createElement("input");
      helper.value = url;
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    setShareFeedback("已複製商品連結");
  } catch (_error) {
    setShareFeedback("複製失敗，請稍後再試");
  }
}

async function shareProduct() {
  if (!activeProduct) return;
  const url = productUrl(activeProduct);
  const payload = {
    title: activeProduct.name || document.title,
    url,
  };
  if (navigator.share) {
    try {
      await navigator.share(payload);
      setShareFeedback("已開啟分享");
      return;
    } catch (_error) {
      return;
    }
  }
  await copyShareLink();
}

function setupDialogActions() {
  if (qs("share-button")) qs("share-button").addEventListener("click", shareProduct);
  if (qs("copy-link")) qs("copy-link").addEventListener("click", copyShareLink);
}

function syncProductUrl(product) {
  const params = new URLSearchParams(window.location.search);
  params.set("product", product.id || "");
  const path = isProductsPage ? "products.html" : "index.html";
  window.history.replaceState({}, "", `${path}?${params.toString()}`);
}

function clearProductUrl() {
  const params = new URLSearchParams(window.location.search);
  params.delete("product");
  const path = isProductsPage ? "products.html" : "index.html";
  const query = params.toString();
  window.history.replaceState({}, "", query ? `${path}?${query}` : path);
}

function openProductFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("product");
  if (!productId) return;
  const product = products.find((item) => item.id === productId);
  if (product) openProduct(product, { syncUrl: false });
}

function openProduct(product, options = {}) {
  const { syncUrl = true } = options;
  const dialog = qs("dialog");
  const main = qs("dialog-main");
  if (!dialog || !main) return;
  const images = [product.main_image, ...(product.gallery || [])].filter(Boolean);
  const firstImage = images[0] || fallback(product.name || "茶款");
  let activeImageIndex = 0;
  activeProduct = product;
  lightboxImages = [];
  lightboxIndex = 0;
  main.src = versionedAsset(firstImage);
  main.alt = product.name || "";
  if (qs("dialog-category")) qs("dialog-category").textContent = product.category || "";
  if (qs("dialog-name")) qs("dialog-name").textContent = product.name || "";
  if (qs("dialog-price")) qs("dialog-price").textContent = product.price || "";
  if (qs("dialog-stock")) {
    const stockCount = Number.parseInt(product.stock, 10);
    const isSoldOut = Number.isFinite(stockCount) && stockCount <= 0;
    qs("dialog-stock").textContent = Number.isFinite(stockCount)
      ? (isSoldOut ? "暫時售完" : "現貨供應")
      : "";
    qs("dialog-stock").classList.toggle("sold-out", isSoldOut);
  }
  if (qs("dialog-summary")) qs("dialog-summary").textContent = product.summary || "";
  if (qs("dialog-description")) qs("dialog-description").textContent = product.description || "";

  const thumbs = qs("thumbs");
  if (!thumbs) return;
  thumbs.replaceChildren();
  const viewerImages = images.length ? images : [firstImage];
  lightboxImages = viewerImages.slice();

  const showImage = (index) => {
    activeImageIndex = (index + viewerImages.length) % viewerImages.length;
    lightboxIndex = activeImageIndex;
    main.src = versionedAsset(viewerImages[activeImageIndex]);
    thumbs.querySelectorAll("button").forEach((item, itemIndex) => {
      item.classList.toggle("active", itemIndex === activeImageIndex);
    });
  };

  viewerImages.forEach((src, index) => {
    const button = document.createElement("button");
    if (index === 0) button.classList.add("active");
    const image = document.createElement("img");
    image.src = versionedAsset(src);
    image.alt = product.name || "";
    image.loading = "lazy";
    image.decoding = "async";
    button.appendChild(image);
    button.addEventListener("click", () => showImage(index));
    thumbs.appendChild(button);
  });
  if (qs("image-prev")) {
    qs("image-prev").hidden = viewerImages.length <= 1;
    qs("image-prev").onclick = () => showImage(activeImageIndex - 1);
  }
  if (qs("image-next")) {
    qs("image-next").hidden = viewerImages.length <= 1;
    qs("image-next").onclick = () => showImage(activeImageIndex + 1);
  }
  main.onclick = () => openLightbox();
  setShareFeedback("");
  if (syncUrl) syncProductUrl(product);
  dialog.showModal();
}

function openLightbox() {
  const lightbox = qs("lightbox");
  const image = qs("lightbox-image");
  if (!lightbox || !image || !lightboxImages.length) return;
  image.src = versionedAsset(lightboxImages[lightboxIndex] || "");
  image.alt = activeProduct ? activeProduct.name || "" : "";
  lightbox.showModal();
}

if (qs("close") && qs("dialog")) {
  qs("close").addEventListener("click", () => qs("dialog").close());
  qs("dialog").addEventListener("click", (event) => {
    if (event.target === qs("dialog")) qs("dialog").close();
  });
  qs("dialog").addEventListener("close", () => {
    activeProduct = null;
    clearProductUrl();
    setShareFeedback("");
  });
}
if (qs("lightbox-close") && qs("lightbox")) {
  qs("lightbox-close").addEventListener("click", () => qs("lightbox").close());
  qs("lightbox").addEventListener("click", (event) => {
    if (event.target === qs("lightbox")) qs("lightbox").close();
  });
}
