const filterButtons = document.querySelectorAll(".filter");
const productCards = document.querySelectorAll(".card[data-category]");
const providerButtons = document.querySelectorAll(".provider-btn");
const reserveButtons = document.querySelectorAll(".reserve-btn");
const providerLabel = document.querySelector("[data-provider-label]");
const previewModal = document.getElementById("productPreview");
const previewImage = document.getElementById("previewImage");
const previewTitle = document.getElementById("previewTitle");
const tshirtShell = document.querySelector(".tshirt-shell");
const mugShell = document.querySelector(".mug-shell");
const tshirtPrint = document.querySelector(".mockup-tshirt-print");
const mugPrint = document.querySelector(".mockup-mug-print");
const shirtVariantButtons = document.querySelectorAll("[data-shirt-variant]");
const mugTypeButtons = document.querySelectorAll("[data-mug-type]");
const previewCloseTargets = document.querySelectorAll("[data-close-preview]");
const previewTargets = document.querySelectorAll(".card .media > img:not(.badge)");

const checkoutConfig = window.CHECKOUT_CONFIG || {};
const providerDisplayNames = {
  wix: "Wix",
  stripe: "Stripe",
  shopify: "Shopify",
};

const validProviders = Array.isArray(checkoutConfig.providers)
  ? checkoutConfig.providers
  : ["wix", "stripe", "shopify"];

let activeProvider =
  localStorage.getItem("abov_checkout_provider") ||
  checkoutConfig.defaultProvider ||
  "wix";

if (!validProviders.includes(activeProvider)) {
  activeProvider = checkoutConfig.defaultProvider || "wix";
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter || "all";

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    productCards.forEach((card) => {
      const category = card.dataset.category;
      const show = selected === "all" || selected === category;
      card.classList.toggle("is-hidden", !show);
    });
  });
});

function setProvider(provider) {
  if (!validProviders.includes(provider)) return;
  activeProvider = provider;
  localStorage.setItem("abov_checkout_provider", provider);

  providerButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.provider === provider);
  });

  if (providerLabel) {
    providerLabel.textContent = providerDisplayNames[provider] || provider;
  }

  reserveButtons.forEach((button) => {
    button.textContent = `Reserve via ${providerDisplayNames[provider] || provider}`;
  });
}

function getCheckoutUrl(product) {
  const linksByProvider = checkoutConfig.links || {};
  const providerLinks = linksByProvider[activeProvider] || {};
  const fallback = (checkoutConfig.fallback || {})[activeProvider] || "";
  return providerLinks[product] || fallback;
}

providerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setProvider(button.dataset.provider || "wix");
  });
});

reserveButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.dataset.product || "";
    const checkoutUrl = getCheckoutUrl(product);

    if (!checkoutUrl) {
      alert(`No ${providerDisplayNames[activeProvider]} checkout link set for "${product}" yet.`);
      return;
    }

    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
  });
});

setProvider(activeProvider);

function setShirtVariant(variant) {
  if (!tshirtShell) return;
  const classMap = {
    crew: "tshirt-crew",
    vneck: "tshirt-vneck",
    oversized: "tshirt-oversized",
    hoodie: "tshirt-hoodie",
  };
  tshirtShell.classList.remove("tshirt-crew", "tshirt-vneck", "tshirt-oversized", "tshirt-hoodie");
  tshirtShell.classList.add(classMap[variant] || "tshirt-crew");
  shirtVariantButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.shirtVariant === variant);
  });
}

function setMugType(type) {
  if (!mugShell) return;
  const classMap = {
    ceramic: "mug-ceramic",
    tumbler: "mug-tumbler",
  };
  mugShell.classList.remove("mug-ceramic", "mug-tumbler");
  mugShell.classList.add(classMap[type] || "mug-ceramic");
  mugTypeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mugType === type);
  });
}

function suggestedShirtVariant(productId) {
  if (!productId) return "crew";
  if (productId.includes("hoodie")) return "hoodie";
  if (productId.includes("tee")) return "crew";
  return "oversized";
}

function suggestedMugType(productId) {
  if (!productId) return "ceramic";
  if (productId.includes("travel-mug")) return "tumbler";
  return "ceramic";
}

function closePreview() {
  if (!previewModal) return;
  previewModal.hidden = true;
  if (previewImage) {
    previewImage.src = "";
    previewImage.alt = "";
  }
  if (previewTitle) {
    previewTitle.textContent = "";
  }
  if (tshirtPrint) {
    tshirtPrint.style.backgroundImage = "";
  }
  if (mugPrint) {
    mugPrint.style.backgroundImage = "";
  }
}

function openPreview(src, altText) {
  if (!previewModal || !previewImage || !previewTitle) return;
  previewImage.src = src;
  previewImage.alt = altText || "Product image preview";
  previewTitle.textContent = altText || "Product image preview";
  if (tshirtPrint) {
    tshirtPrint.style.backgroundImage = `url("${src}")`;
  }
  if (mugPrint) {
    mugPrint.style.backgroundImage = `url("${src}")`;
  }
  previewModal.hidden = false;
}

shirtVariantButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setShirtVariant(button.dataset.shirtVariant || "crew");
  });
});

mugTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setMugType(button.dataset.mugType || "ceramic");
  });
});

previewTargets.forEach((img) => {
  img.tabIndex = 0;
  img.setAttribute("role", "button");
  img.setAttribute("aria-label", `Preview ${img.alt || "product image"}`);

  img.addEventListener("click", () => {
    const card = img.closest(".card");
    const reserveBtn = card ? card.querySelector(".reserve-btn") : null;
    const productId = reserveBtn ? reserveBtn.dataset.product || "" : "";
    setShirtVariant(suggestedShirtVariant(productId));
    setMugType(suggestedMugType(productId));
    openPreview(img.currentSrc || img.src, img.alt);
  });

  img.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const card = img.closest(".card");
      const reserveBtn = card ? card.querySelector(".reserve-btn") : null;
      const productId = reserveBtn ? reserveBtn.dataset.product || "" : "";
      setShirtVariant(suggestedShirtVariant(productId));
      setMugType(suggestedMugType(productId));
      openPreview(img.currentSrc || img.src, img.alt);
    }
  });
});

previewCloseTargets.forEach((target) => {
  target.addEventListener("click", closePreview);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePreview();
  }
});

setShirtVariant("crew");
setMugType("ceramic");
