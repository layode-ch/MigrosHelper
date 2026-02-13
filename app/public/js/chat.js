// === Badge Configuration ===
const BADGE_CONFIG = {
    isBio:        { label: "Bio",          icon: "bi-leaf",         class: "badge-success" },
    isVegan:      { label: "Vegan",        icon: "bi-flower1",      class: "badge-success" },
    isVegetarian: { label: "Végétarien",   icon: "bi-flower2",      class: "badge-success" },
    isGlutenFree: { label: "Sans gluten",  icon: "bi-slash-circle", class: "badge-warning" },
    isFairtrade:  { label: "Fairtrade",    icon: "bi-globe2",       class: "badge-info" },
    isHalal:      { label: "Halal",        icon: "bi-check-circle", class: "badge-info" },
    isKosher:     { label: "Kasher",       icon: "bi-star",         class: "badge-info" },
    isRegional:   { label: "Régional",     icon: "bi-geo-alt",      class: "badge-accent" },
};

const HEALTH_BADGES = {
    healthy:   { label: "Sain",     icon: "bi-heart-pulse", class: "badge-success" },
    unhealthy: { label: "Pas sain", icon: "bi-exclamation-triangle", class: "badge-error" },
};

function renderBadges(product, compact = true) {
    let html = "";

    // Flag badges
    for (const [key, cfg] of Object.entries(BADGE_CONFIG)) {
        if (product[key]) {
            if (compact) {
                html += `<span class="badge ${cfg.class} badge-sm gap-0.5" title="${cfg.label}"><i class="bi ${cfg.icon}"></i></span>`;
            } else {
                html += `<span class="badge ${cfg.class} badge-sm gap-1"><i class="bi ${cfg.icon}"></i> ${cfg.label}</span>`;
            }
        }
    }

    // Health score badge
    if (product.healthScore && HEALTH_BADGES[product.healthScore]) {
        const hb = HEALTH_BADGES[product.healthScore];
        if (compact) {
            html += `<span class="badge ${hb.class} badge-sm gap-0.5" title="${hb.label}"><i class="bi ${hb.icon}"></i></span>`;
        } else {
            html += `<span class="badge ${hb.class} badge-sm gap-1"><i class="bi ${hb.icon}"></i> ${hb.label}</span>`;
        }
    }

    // Food type badge
    if (product.foodType) {
        if (compact) {
            html += `<span class="badge badge-outline badge-sm" title="${escapeHtml(product.foodType)}"><i class="bi bi-tag"></i></span>`;
        } else {
            html += `<span class="badge badge-outline badge-sm gap-1"><i class="bi bi-tag"></i> ${escapeHtml(product.foodType)}</span>`;
        }
    }

    return html;
}

// === Shopping List (localStorage) ===
const STORAGE_KEY = "migros-shopping-list";

function getShoppingList() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveShoppingList(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function addToShoppingList(product, triggerBtn) {
    const list = getShoppingList();
    const existing = list.find((p) => p.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        const { quantity, ...productData } = { quantity: 1, ...product };
        list.push({ ...productData, quantity: 1 });
    }
    saveShoppingList(list);
    renderShoppingList();
    animateAddToCart(triggerBtn);
    showToast("Ajouté !");
}

function animateAddToCart(triggerBtn) {
    if (triggerBtn) {
        triggerBtn.classList.remove("add-flash");
        void triggerBtn.offsetWidth;
        triggerBtn.classList.add("add-flash");
        triggerBtn.addEventListener("animationend", () => triggerBtn.classList.remove("add-flash"), { once: true });
    }
    const badges = [
        document.getElementById("cart-badge"),
        document.getElementById("cart-badge-desktop"),
    ].filter(Boolean);
    badges.forEach((badge) => {
        badge.classList.remove("badge-bounce");
        void badge.offsetWidth;
        badge.classList.add("badge-bounce");
        badge.addEventListener("animationend", () => badge.classList.remove("badge-bounce"), { once: true });
    });
}

function showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const alert = document.createElement("div");
    alert.className = "alert alert-success shadow-lg text-sm py-2 px-4";
    alert.innerHTML = `<i class="bi bi-check-circle"></i> ${escapeHtml(message)}`;
    container.appendChild(alert);
    setTimeout(() => {
        alert.style.transition = "opacity 0.3s";
        alert.style.opacity = "0";
        setTimeout(() => alert.remove(), 300);
    }, 1500);
}

function removeFromShoppingList(id) {
    let list = getShoppingList();
    list = list.filter((p) => p.id !== id);
    saveShoppingList(list);
    renderShoppingList();
}

function updateQuantity(id, delta) {
    const list = getShoppingList();
    const item = list.find((p) => p.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromShoppingList(id);
        return;
    }
    saveShoppingList(list);
    renderShoppingList();
}

function clearShoppingList() {
    saveShoppingList([]);
    renderShoppingList();
}

function renderShoppingList() {
    const container = document.getElementById("shopping-list");
    const totalDiv = document.getElementById("shopping-total");
    const totalPrice = document.getElementById("total-price");
    const btnClear = document.getElementById("btn-clear-list");
    const list = getShoppingList();

    updateCartBadge(list.length);

    if (!container) return;
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML =
            '<p class="text-base-content/50 text-sm text-center py-4">Votre liste est vide. Ajoutez des produits depuis le chat !</p>';
    } else {
        list.forEach((item) => {
            const el = document.createElement("div");
            el.className =
                "flex items-center justify-between bg-base-300 rounded-box p-2 gap-2";
            el.innerHTML = `
                <div class="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity cart-item-info">
                    <p class="font-medium text-sm truncate">${escapeHtml(item.name)}</p>
                    <p class="text-xs text-base-content/60">${escapeHtml(item.priceFormatted)}</p>
                </div>
                <div class="flex items-center gap-1">
                    <button class="btn btn-xs btn-ghost" onclick="updateQuantity('${escapeAttr(item.id)}', -1)">
                        <i class="bi bi-dash"></i>
                    </button>
                    <span class="text-sm font-bold w-6 text-center">${item.quantity}</span>
                    <button class="btn btn-xs btn-ghost" onclick="updateQuantity('${escapeAttr(item.id)}', 1)">
                        <i class="bi bi-plus"></i>
                    </button>
                    <button class="btn btn-xs btn-ghost text-error" onclick="removeFromShoppingList('${escapeAttr(item.id)}')">
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            `;
            el.querySelector(".cart-item-info").addEventListener("click", () => {
                if (item.image !== undefined) {
                    showProductDetail(item);
                }
            });
            container.appendChild(el);
        });
    }

    let total = 0;
    list.forEach((item) => {
        total += item.price * item.quantity;
    });
    const totalText = "CHF " + total.toFixed(2);

    if (totalDiv) totalDiv.classList.toggle("hidden", list.length === 0);
    if (btnClear) btnClear.classList.toggle("hidden", list.length === 0);
    if (totalPrice) totalPrice.textContent = totalText;
}

function updateCartBadge(count) {
    const badges = [
        document.getElementById("cart-badge"),
        document.getElementById("cart-badge-desktop"),
    ].filter(Boolean);
    badges.forEach((badge) => {
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    });
}

// === Conversation History ===
let conversationHistory = [];

function resetConversation() {
    conversationHistory = [];
    hideChoices();
    const container = document.getElementById("chat-messages");
    container.innerHTML = "";
    // Re-add welcome message with avatar
    const welcome = document.createElement("div");
    welcome.className = "chat chat-start";
    welcome.innerHTML = `
        <div class="chat-image avatar">
            <div class="w-8 rounded-full bg-primary flex items-center justify-center">
                <i class="bi bi-robot text-primary-content text-sm"></i>
            </div>
        </div>
        <div class="chat-bubble chat-bubble-primary">
            Bonjour ! Je suis votre assistant Migros. Dites-moi ce que vous cherchez et je vous trouverai les meilleurs produits.
        </div>
    `;
    container.appendChild(welcome);
}

// === Chat ===
function getFilters() {
    const priceSort = document.getElementById("filter-price").value;
    const bio = document.getElementById("filter-bio").checked;
    const healthy = document.getElementById("filter-healthy").checked;
    return { priceSort: priceSort || null, bio, healthy };
}

function appendMessage(role, content) {
    const container = document.getElementById("chat-messages");
    const wrapper = document.createElement("div");

    if (role === "user") {
        wrapper.className = "chat chat-end";
        wrapper.innerHTML = `<div class="chat-bubble chat-bubble-secondary">${escapeHtml(content)}</div>`;
    } else {
        wrapper.className = "chat chat-start";
        wrapper.innerHTML = `
            <div class="chat-image avatar">
                <div class="w-8 rounded-full bg-primary flex items-center justify-center">
                    <i class="bi bi-robot text-primary-content text-sm"></i>
                </div>
            </div>
            <div class="chat-bubble chat-bubble-primary">${content}</div>
        `;
    }

    container.appendChild(wrapper);
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
}

function showLoading() {
    const container = document.getElementById("chat-messages");
    const loader = document.createElement("div");
    loader.id = "chat-loading";
    loader.className = "chat chat-start";
    loader.innerHTML = `
        <div class="chat-image avatar">
            <div class="w-8 rounded-full bg-primary flex items-center justify-center">
                <i class="bi bi-robot text-primary-content text-sm"></i>
            </div>
        </div>
        <div class="chat-bubble chat-bubble-primary"><span class="loading loading-dots loading-md"></span></div>
    `;
    container.appendChild(loader);
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
}

function hideLoading() {
    const loader = document.getElementById("chat-loading");
    if (loader) loader.remove();
}

function setInputEnabled(enabled) {
    const input = document.getElementById("chat-input");
    const btn = document.getElementById("chat-send-btn");
    if (input) input.disabled = !enabled;
    if (btn) btn.disabled = !enabled;
}

async function sendMessage() {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();
    if (!message) return;

    input.value = "";
    appendMessage("user", message);
    conversationHistory.push({ role: "user", content: message });

    showLoading();
    setInputEnabled(false);

    try {
        const filters = getFilters();
        const resp = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message,
                filters,
                conversationHistory: conversationHistory.slice(-20),
            }),
        });

        hideLoading();

        if (!resp.ok) {
            appendMessage(
                "assistant",
                "Désolé, une erreur est survenue. Veuillez réessayer."
            );
            return;
        }

        const data = await resp.json();

        if (data.message) {
            appendMessage("assistant", renderMarkdown(data.message));
            conversationHistory.push({
                role: "assistant",
                content: data.message,
            });
        }

        const action = data.action || (data.products?.length > 0 ? "search" : null);

        if (action === "search" && data.products?.length > 0) {
            renderProductCards(data.products, data.groups);
        } else if (action === "search" && (data.noResults || data.products?.length === 0)) {
            renderNoResults();
        } else if (action === "clarify" && data.options?.length > 0) {
            showChoices(data.options);
        }
    } catch (err) {
        hideLoading();
        appendMessage(
            "assistant",
            "Impossible de contacter le serveur. Vérifiez votre connexion."
        );
    } finally {
        setInputEnabled(true);
        // Only focus input if choices aren't showing
        if (!document.getElementById("chat-choices").classList.contains("hidden")) return;
        input.focus();
    }
}

function renderNoResults() {
    const container = document.getElementById("chat-messages");
    const block = document.createElement("div");
    block.className =
        "flex flex-col items-center gap-2 py-6 px-4 my-2 bg-base-300 rounded-box text-base-content/60";
    block.innerHTML = `
        <i class="bi bi-search text-3xl"></i>
        <p class="font-semibold">Aucun produit trouvé</p>
        <p class="text-sm text-center">Essayez de reformuler votre demande ou d'utiliser des termes plus précis.</p>
    `;
    container.appendChild(block);
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
}

function renderProductCards(products, groups) {
    const container = document.getElementById("chat-messages");
    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col gap-3 my-3 px-1";

    const sections = (groups && groups.length > 0)
        ? groups
        : [{ label: null, products }];

    sections.forEach((section) => {
        renderSingleGroup(wrapper, section);
    });

    container.appendChild(wrapper);
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
}

function renderSingleGroup(container, section) {
    const sectionEl = document.createElement("div");
    sectionEl.className = "flex flex-col gap-1.5 transition-all duration-300";

    // Compute price level within this group
    const prices = section.products.map(p => p.price).filter(p => p > 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const hasPriceSpread = prices.length >= 2 && maxPrice > minPrice * 1.05;

    function getPriceLevel(price) {
        if (!hasPriceSpread || price <= 0) return null;
        if (price <= minPrice * 1.05) return "budget";
        if (price >= maxPrice * 0.95) return "cher";
        return null;
    }

    // Group header with action buttons
    if (section.label) {
        const header = document.createElement("div");
        header.className = "flex items-center gap-2 px-1 group-header";
        header.innerHTML = `
            <span class="font-semibold text-sm text-base-content/80">${escapeHtml(section.label)}</span>
            <span class="flex-1 border-b border-base-300"></span>
            <button class="btn btn-xs btn-ghost btn-circle replace-group-btn" title="Remplacer">
                <i class="bi bi-arrow-repeat"></i>
            </button>
            <button class="btn btn-xs btn-ghost btn-circle text-error remove-group-btn" title="Supprimer">
                <i class="bi bi-x-lg"></i>
            </button>
        `;
        header.querySelector(".remove-group-btn").addEventListener("click", () => removeGroup(sectionEl));
        header.querySelector(".replace-group-btn").addEventListener("click", () => showReplaceInput(sectionEl, section.label));
        sectionEl.appendChild(header);
    }

    // Horizontal scroll row of compact cards
    const row = document.createElement("div");
    row.className = "flex gap-2 overflow-x-auto pb-2 scrollbar-thin";

    section.products.forEach((product) => {
        const card = document.createElement("div");
        card.className =
            "flex items-center gap-3 bg-base-100 rounded-box p-2 pr-3 shadow-sm cursor-pointer hover:shadow-md hover:bg-base-200 transition-all duration-150 flex-shrink-0 min-w-[260px] max-w-[320px]";

        const priceLevel = getPriceLevel(product.price);
        const priceLevelBadge = priceLevel === "budget"
            ? '<span class="badge badge-success badge-xs gap-0.5" title="Moins cher du groupe"><i class="bi bi-arrow-down"></i> Budget</span>'
            : priceLevel === "cher"
            ? '<span class="badge badge-warning badge-xs gap-0.5" title="Plus cher du groupe"><i class="bi bi-arrow-up"></i> Cher</span>'
            : "";

        const badges = renderBadges(product, true) + priceLevelBadge;

        const priceHtml = product.isPromoted && product.originalPriceFormatted
            ? `<span class="line-through text-base-content/40 text-xs">${escapeHtml(product.originalPriceFormatted)}</span>
               <span class="font-bold text-error text-sm">${escapeHtml(product.priceFormatted || "")}</span>`
            : `<span class="font-bold text-primary text-sm">${escapeHtml(product.priceFormatted || "")}</span>`;

        const discountBadge = product.isPromoted && product.discountPercent > 0
            ? `<span class="badge badge-error badge-xs font-bold absolute -top-1 -left-1">-${product.discountPercent}%</span>`
            : "";

        card.innerHTML = `
            <div class="relative flex-shrink-0">
                ${discountBadge}
                <div class="bg-base-200 rounded-lg p-1.5 flex items-center justify-center">
                    <img src="${escapeAttr(product.image || "")}" alt="${escapeAttr(product.name)}"
                         class="w-14 h-14 object-contain"
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><text y=%2230%22 font-size=%2228%22>🛒</text></svg>'" />
                </div>
            </div>
            <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                <p class="font-medium text-sm leading-tight line-clamp-2">${escapeHtml(product.name)}</p>
                ${badges ? `<div class="flex flex-wrap gap-0.5">${badges}</div>` : ""}
                <div class="flex items-center gap-1.5">
                    ${priceHtml}
                </div>
            </div>
            <button class="btn btn-primary btn-sm btn-square flex-shrink-0 add-to-list-btn" title="Ajouter">
                <i class="bi bi-plus-lg"></i>
            </button>
        `;

        card.addEventListener("click", (e) => {
            if (!e.target.closest(".add-to-list-btn")) {
                showProductDetail(product);
            }
        });

        card.querySelector(".add-to-list-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            addToShoppingList(product, e.currentTarget);
        });

        row.appendChild(card);
    });

    sectionEl.appendChild(row);
    container.appendChild(sectionEl);
    return sectionEl;
}

function removeGroup(sectionEl) {
    sectionEl.style.opacity = "0";
    sectionEl.style.maxHeight = sectionEl.scrollHeight + "px";
    requestAnimationFrame(() => {
        sectionEl.style.maxHeight = "0";
        sectionEl.style.overflow = "hidden";
    });
    setTimeout(() => sectionEl.remove(), 300);
}

function showReplaceInput(sectionEl, currentLabel) {
    const header = sectionEl.querySelector(".group-header");
    if (!header) return;
    // Prevent double input
    if (sectionEl.querySelector(".replace-input-bar")) return;

    const bar = document.createElement("div");
    bar.className = "replace-input-bar flex items-center gap-1 px-1 mt-1";
    bar.innerHTML = `
        <input type="text" placeholder="Remplacer « ${escapeAttr(currentLabel)} » par..." class="input input-sm input-bordered flex-1 replace-term-input" />
        <button class="btn btn-xs btn-success replace-confirm-btn" title="Confirmer"><i class="bi bi-check-lg"></i></button>
        <button class="btn btn-xs btn-ghost replace-cancel-btn" title="Annuler"><i class="bi bi-x-lg"></i></button>
    `;

    const input = bar.querySelector(".replace-term-input");
    bar.querySelector(".replace-confirm-btn").addEventListener("click", () => {
        const newTerm = input.value.trim();
        if (newTerm) replaceGroup(sectionEl, newTerm);
    });
    bar.querySelector(".replace-cancel-btn").addEventListener("click", () => bar.remove());
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const newTerm = input.value.trim();
            if (newTerm) replaceGroup(sectionEl, newTerm);
        }
    });

    header.after(bar);
    input.focus();
}

async function replaceGroup(sectionEl, newTerm) {
    // Show loading state
    const replaceBar = sectionEl.querySelector(".replace-input-bar");
    if (replaceBar) {
        replaceBar.innerHTML = '<span class="loading loading-spinner loading-sm"></span> <span class="text-sm">Recherche...</span>';
    }

    try {
        const filters = getFilters();
        const resp = await fetch("/api/search-group", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ term: newTerm, priceSort: filters.priceSort || null }),
        });

        if (!resp.ok) throw new Error("Search failed");

        const data = await resp.json();

        if (!data.products || data.products.length === 0) {
            if (replaceBar) {
                replaceBar.innerHTML = '<span class="text-sm text-error">Aucun produit trouvé.</span>';
                setTimeout(() => replaceBar.remove(), 2000);
            }
            return;
        }

        // Replace the section content
        const parent = sectionEl.parentNode;
        const newSection = document.createElement("div");
        newSection.style.opacity = "0";
        parent.insertBefore(newSection, sectionEl);
        sectionEl.remove();
        renderSingleGroup(parent, data);
        // The new section is the last child appended by renderSingleGroup
        const inserted = parent.lastElementChild;
        if (inserted) {
            inserted.style.opacity = "0";
            requestAnimationFrame(() => {
                inserted.style.transition = "opacity 0.3s";
                inserted.style.opacity = "1";
            });
        }
        newSection.remove();
    } catch (err) {
        if (replaceBar) {
            replaceBar.innerHTML = '<span class="text-sm text-error">Erreur. Réessayez.</span>';
            setTimeout(() => replaceBar.remove(), 2000);
        }
    }
}

function showProductDetail(product) {
    // Image
    document.getElementById("modal-image").src = product.image || "";
    document.getElementById("modal-image").alt = product.name;

    // Discount overlay on image
    const discountEl = document.getElementById("modal-discount");
    if (product.isPromoted && product.discountPercent > 0) {
        discountEl.textContent = `-${product.discountPercent}%`;
        discountEl.classList.remove("hidden");
    } else {
        discountEl.classList.add("hidden");
    }

    // Name & brand
    document.getElementById("modal-name").textContent = product.name;
    document.getElementById("modal-brand").textContent = product.brand || "";

    // Badges (full mode)
    document.getElementById("modal-badges").innerHTML = renderBadges(product, false);

    // Description
    document.getElementById("modal-description").textContent =
        product.description || "Aucune description disponible.";

    // Price
    const origPriceEl = document.getElementById("modal-original-price");
    const priceEl = document.getElementById("modal-price");
    if (product.isPromoted && product.originalPriceFormatted) {
        origPriceEl.textContent = product.originalPriceFormatted;
        origPriceEl.classList.remove("hidden");
        priceEl.textContent = product.priceFormatted || "";
        priceEl.className = "text-3xl font-bold text-error";
    } else {
        origPriceEl.classList.add("hidden");
        priceEl.textContent = product.priceFormatted || "";
        priceEl.className = "text-3xl font-bold text-primary";
    }
    document.getElementById("modal-unit-price").textContent =
        product.unitPrice || "";

    // Meta: origin & categories
    const metaEl = document.getElementById("modal-meta");
    let metaParts = [];
    if (product.origin) metaParts.push(`Origine : ${product.origin}`);
    if (product.categories?.length > 0) metaParts.push(product.categories.join(" › "));
    metaEl.textContent = metaParts.join(" · ");
    metaEl.classList.toggle("hidden", metaParts.length === 0);

    // Migros link
    const migrosLink = document.getElementById("modal-migros-link");
    if (product.migrosUrl) {
        migrosLink.href = product.migrosUrl;
        migrosLink.classList.remove("hidden");
    } else {
        migrosLink.classList.add("hidden");
    }

    // Add to list button
    const addBtn = document.getElementById("modal-add-btn");
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);
    newBtn.addEventListener("click", () => {
        addToShoppingList(product, newBtn);
        document.getElementById("product-modal").close();
    });

    document.getElementById("product-modal").showModal();
}

// === Choice Picker (clarify mode) ===
function showChoices(options) {
    const inputBar = document.getElementById("chat-input-bar");
    const choicesPanel = document.getElementById("chat-choices");
    const buttonsContainer = document.getElementById("choices-buttons");
    const customInput = document.getElementById("choices-custom-input");

    // Populate option buttons
    buttonsContainer.innerHTML = "";
    options.forEach((option) => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline btn-sm flex-grow sm:flex-grow-0 transition-all duration-150 hover:scale-[1.03]";
        btn.textContent = option;
        btn.addEventListener("click", () => submitChoice(option));
        buttonsContainer.appendChild(btn);
    });

    // Swap: hide input bar, show choices
    inputBar.classList.add("hidden");
    choicesPanel.classList.remove("hidden");
    customInput.value = "";
    customInput.focus();
}

function hideChoices() {
    const inputBar = document.getElementById("chat-input-bar");
    const choicesPanel = document.getElementById("chat-choices");
    const input = document.getElementById("chat-input");

    choicesPanel.classList.add("hidden");
    inputBar.classList.remove("hidden");
    input.focus();
}

function submitChoice(text) {
    hideChoices();
    // Put the choice in the input and send it
    document.getElementById("chat-input").value = text;
    sendMessage();
}

function submitCustomChoice() {
    const customInput = document.getElementById("choices-custom-input");
    const text = customInput.value.trim();
    if (!text) return;
    hideChoices();
    document.getElementById("chat-input").value = text;
    sendMessage();
}

// === Utilities ===
function renderMarkdown(text) {
    if (!text) return "";
    if (typeof marked !== "undefined" && typeof DOMPurify !== "undefined") {
        const html = marked.parse(text, { breaks: true });
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ["h2", "h3", "h4", "p", "br", "strong", "em", "ul", "ol", "li", "code", "a", "span"],
            ALLOWED_ATTR: ["href", "target", "rel", "class"],
        });
    }
    return escapeHtml(text);
}

function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/'/g, "&#39;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// === Init ===
document.addEventListener("DOMContentLoaded", () => {
    renderShoppingList();
});
