(() => {
  const embeddedSiteData = document.getElementById("site-data");
  let previewData = {};
  if (embeddedSiteData) {
    try {
      previewData = JSON.parse(embeddedSiteData.textContent);
    } catch (_error) {
      previewData = {};
    }
  }

  const storyCopy = document.querySelector("[data-story-text]");
  if (storyCopy) storyCopy.textContent = previewData.site?.hero_text || "";

  const storyList = document.querySelector("[data-journey-stories]");
  const products = Array.isArray(previewData.products) ? previewData.products.slice(0, 3) : [];
  const fallbackImage = "assets/optimized/1e135c08610ebe9d13af.jpg";
  const imageFor = (product) => product.main_image || product.featured_image || product.gallery?.[0] || fallbackImage;
  const textFor = (value, fallback) => typeof value === "string" && value.trim() ? value.trim() : fallback;

  const collectionIntro = document.querySelector(".collection-intro");
  const categoryFilter = new URLSearchParams(window.location.search).get("category")?.trim();
  if (collectionIntro && categoryFilter) {
    collectionIntro.classList.add("is-filtered");
    const kicker = collectionIntro.querySelector(".section-kicker");
    const heading = collectionIntro.querySelector("h1");
    const description = collectionIntro.querySelector("p:last-child");
    const matchingProduct = previewData.products?.find((product) => product.category === categoryFilter);
    if (kicker) kicker.textContent = `TEA COLLECTION / ${categoryFilter}`;
    if (heading) {
      heading.replaceChildren(document.createTextNode(categoryFilter), document.createElement("br"), document.createTextNode("風味誌。"));
    }
    if (description) description.textContent = textFor(matchingProduct?.summary, "從香氣、茶感與尾韻，慢慢認識這一款茶。");
  }

  const enhanceProductCard = (card, index = 0) => {
    if (!card.matches?.(".product-card")) return;
    card.style.setProperty("--card-index", String(index));
    const image = card.querySelector(":scope > img");
    if (image && !image.parentElement.classList.contains("product-card-visual")) {
      const visual = document.createElement("div");
      visual.className = "product-card-visual";
      card.insertBefore(visual, image);
      visual.append(image);
    }
    const details = card.querySelector(":scope > div:not(.product-card-visual)");
    if (details && !details.querySelector(":scope > .badge")) {
      const placeholder = document.createElement("p");
      placeholder.className = "badge badge-placeholder";
      placeholder.textContent = "精選";
      placeholder.setAttribute("aria-hidden", "true");
      details.prepend(placeholder);
    }
    if (details && !details.querySelector(".product-card-explore")) {
      const hint = document.createElement("span");
      hint.className = "product-card-explore";
      hint.textContent = "展開茶品風味 ↗\uFE0E";
      details.append(hint);
    }
  };

  const syncProductGrid = (grid) => {
    if (!grid?.matches?.("[data-products], [data-featured-products]")) return;
    const cards = [...grid.querySelectorAll(":scope > .product-card")];
    grid.classList.toggle("has-single-product", cards.length === 1);
    cards.forEach((card, index) => enhanceProductCard(card, index));
  };

  const productCardIndex = (card) => Array.from(card.parentElement?.querySelectorAll(":scope > .product-card") || []).indexOf(card);

  if (storyList) {
    products.forEach((product, index) => {
      const article = document.createElement("article");
      article.className = `journey-story${index % 2 ? " is-reversed" : ""}`;
      article.dataset.storyIndex = String(index + 1);

      const visual = document.createElement("div");
      visual.className = "journey-story-visual";
      const imageFrame = document.createElement("div");
      imageFrame.className = "journey-story-image";
      const image = document.createElement("img");
      image.src = imageFor(product);
      image.alt = `${textFor(product.name, "圓霖精選茶")}商品照片`;
      image.loading = "lazy";
      image.decoding = "async";
      const parallax = document.createElement("div");
      parallax.className = "journey-story-parallax";
      parallax.append(image);
      imageFrame.append(parallax);
      const imageCaption = document.createElement("span");
      imageCaption.textContent = `FORMOSA TEA · ${String(index + 1).padStart(2, "0")}`;
      visual.append(imageFrame, imageCaption);

      const copy = document.createElement("div");
      copy.className = "journey-story-copy";
      const number = document.createElement("p");
      number.className = "journey-story-number";
      number.textContent = String(index + 1).padStart(2, "0");
      const kicker = document.createElement("p");
      kicker.className = "journey-story-kicker";
      kicker.textContent = `TASTE NOTES / 0${index + 1} · ${textFor(product.category, "季節茶")}`;
      const heading = document.createElement("h3");
      heading.textContent = textFor(product.name, "圓霖精選茶");
      const summary = document.createElement("p");
      summary.className = "journey-story-summary";
      summary.textContent = textFor(product.summary, "細細品味茶葉的自然風味。");
      const rule = document.createElement("span");
      rule.className = "journey-story-rule";
      copy.append(number, kicker, heading, summary, rule);
      article.append(visual, copy);
      storyList.append(article);
    });
  }

  let scrollFrame = 0;
  const updateScrollEffects = () => {
    scrollFrame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
    const progressBar = document.querySelector("[data-scroll-progress]");
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heroArt = document.querySelector(".hero-art");
    if (heroArt && !reducedMotion && window.matchMedia("(min-width: 701px)").matches) {
      const offset = Math.max(-22, Math.min(22, window.scrollY * 0.035));
      heroArt.style.setProperty("--scroll-parallax", `${offset}px`);
    }

    if (reducedMotion) return;
    document.querySelectorAll(".journey-story-parallax").forEach((layer) => {
      const bounds = layer.getBoundingClientRect();
      if (bounds.bottom < -80 || bounds.top > window.innerHeight + 80) return;
      const distance = bounds.top + bounds.height / 2 - window.innerHeight / 2;
      const offset = Math.max(-42, Math.min(42, distance * -0.065));
      layer.style.setProperty("--story-parallax", `${offset}px`);
    });
    document.querySelectorAll(".product-grid.has-single-product .product-card-visual").forEach((layer) => {
      const bounds = layer.getBoundingClientRect();
      if (bounds.bottom < -80 || bounds.top > window.innerHeight + 80) return;
      const distance = bounds.top + bounds.height / 2 - window.innerHeight / 2;
      const offset = Math.max(-28, Math.min(28, distance * -0.045));
      layer.style.setProperty("--card-scroll", `${offset}px`);
    });
  };

  const requestScrollUpdate = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollEffects);
  };
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate, { passive: true });

  const heroArt = document.querySelector(".hero-art");
  const pointerTiltEnabled = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
  ).matches;
  if (heroArt && pointerTiltEnabled) {
    let pointerFrame = 0;
    let pointerPosition = null;
    const resetPointerTilt = () => {
      pointerPosition = null;
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      heroArt.style.removeProperty("--hero-tilt-x");
      heroArt.style.removeProperty("--hero-tilt-y");
      heroArt.style.removeProperty("--hero-image-x");
      heroArt.style.removeProperty("--hero-image-y");
    };
    heroArt.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      pointerPosition = { x: event.clientX, y: event.clientY };
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        if (!pointerPosition) return;
        const bounds = heroArt.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (pointerPosition.x - bounds.left) / bounds.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (pointerPosition.y - bounds.top) / bounds.height * 2 - 1));
        heroArt.style.setProperty("--hero-tilt-x", `${x * 2.2}deg`);
        heroArt.style.setProperty("--hero-tilt-y", `${y * -1.5}deg`);
        heroArt.style.setProperty("--hero-image-x", `${x * -5}px`);
        heroArt.style.setProperty("--hero-image-y", `${y * -5}px`);
      });
    });
    heroArt.addEventListener("pointerleave", resetPointerTilt);
  }

  const revealSelector = ".story-section, .section-head, .contact h2, .product-card, .category-links a, .journey-overview, .journey-story, .journey-return";
  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -4% 0px" })
    : null;

  const observeReveals = (root = document) => {
    if (root.matches?.(".product-card")) enhanceProductCard(root, productCardIndex(root));
    root.querySelectorAll?.(".product-card").forEach((card) => enhanceProductCard(card, productCardIndex(card)));
    if (root.matches?.(revealSelector) && !root.classList.contains("reveal-on-scroll")) {
      root.classList.add("reveal-on-scroll");
      if (revealObserver) revealObserver.observe(root);
      else root.classList.add("is-visible");
    }
    root.querySelectorAll?.(revealSelector).forEach((element) => {
      if (element.classList.contains("reveal-on-scroll")) return;
      element.classList.add("reveal-on-scroll");
      if (revealObserver) revealObserver.observe(element);
      else element.classList.add("is-visible");
    });
  };

  observeReveals();
  document.querySelectorAll("[data-products], [data-featured-products]").forEach(syncProductGrid);
  if ("MutationObserver" in window) {
    const contentObserver = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) observeReveals(node);
      }));
    });
    document.querySelectorAll("[data-featured-products], [data-home-categories], [data-product-grid]").forEach((container) => {
      contentObserver.observe(container, { childList: true, subtree: true });
    });
    document.querySelectorAll("[data-products]").forEach((container) => {
      contentObserver.observe(container, { childList: true, subtree: true });
    });
    const productObserver = new MutationObserver((records) => {
      records.forEach((record) => syncProductGrid(record.target));
    });
    document.querySelectorAll("[data-products], [data-featured-products]").forEach((container) => {
      productObserver.observe(container, { childList: true });
    });
  }

  updateScrollEffects();
})();
