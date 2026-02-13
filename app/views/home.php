<style>
    #chat-choices:not(.hidden) {
        animation: choices-slide-in 0.25s ease-out;
    }
    @keyframes choices-slide-in {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    /* Markdown inside chat bubbles */
    .chat-bubble h2 { font-size: 1.1rem; font-weight: 700; margin: 0.4rem 0 0.2rem; }
    .chat-bubble h3 { font-size: 1rem; font-weight: 600; margin: 0.3rem 0 0.15rem; }
    .chat-bubble p  { margin: 0.2rem 0; }
    .chat-bubble ul, .chat-bubble ol { margin: 0.2rem 0 0.2rem 1.2rem; }
    .chat-bubble ul { list-style: disc; }
    .chat-bubble ol { list-style: decimal; }
    .chat-bubble li { margin: 0.1rem 0; }
    .chat-bubble strong { font-weight: 700; }
    .chat-bubble em { font-style: italic; }
    .chat-bubble code { background: oklch(var(--b3)); padding: 0.1rem 0.3rem; border-radius: 0.25rem; font-size: 0.85em; }

    /* Add-to-cart flash animation */
    @keyframes add-flash {
        0%   { background: oklch(var(--su)); transform: scale(1.15); }
        100% { background: revert-layer; transform: scale(1); }
    }
    .add-flash { animation: add-flash 0.4s ease-out; }

    /* Badge bounce animation */
    @keyframes badge-bounce {
        0%, 100% { scale: 1; }
        50%      { scale: 1.4; }
    }
    .badge-bounce { animation: badge-bounce 0.4s ease-in-out; }

    /* Thin scrollbar for horizontal product rows */
    .scrollbar-thin { scrollbar-width: thin; }
    .scrollbar-thin::-webkit-scrollbar { height: 4px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: oklch(var(--bc) / 0.15); border-radius: 4px; }
</style>

<!-- DaisyUI Drawer: cart slides from the right -->
<div class="drawer drawer-end">
    <input id="cart-drawer" type="checkbox" class="drawer-toggle" />

    <!-- Main content -->
    <div class="drawer-content flex flex-col flex-1 w-full max-w-screen p-4 min-h-0">

        <!-- Chat Zone — full width -->
        <div class="flex flex-col flex-1 bg-base-200 rounded-box p-4 min-h-0">

            <!-- Filters Bar (sticky) -->
            <div class="flex flex-wrap gap-3 items-center mb-3 p-2 bg-base-300 rounded-box sticky top-0 z-10 shrink-0">
                <label class="form-control w-auto">
                    <select id="filter-price" class="select select-sm select-bordered">
                        <option value="">Prix: Tous</option>
                        <option value="asc">Prix: Budget (moins cher)</option>
                        <option value="desc">Prix: Premium (plus cher)</option>
                    </select>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <span class="label-text text-sm">Bio</span>
                    <input type="checkbox" id="filter-bio" class="toggle toggle-sm toggle-success" />
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <span class="label-text text-sm">Sain</span>
                    <input type="checkbox" id="filter-healthy" class="toggle toggle-sm toggle-info" />
                </label>
                <div class="flex-1"></div>
                <!-- Cart button (all screens) -->
                <label for="cart-drawer" class="btn btn-sm btn-ghost gap-1 cursor-pointer" title="Liste de courses">
                    <i class="bi bi-cart3"></i>
                    <span id="cart-badge-desktop" class="badge badge-error badge-sm hidden">0</span>
                </label>
                <button onclick="resetConversation()" class="btn btn-sm btn-ghost gap-1" title="Nouvelle conversation">
                    <i class="bi bi-arrow-clockwise"></i>
                    <span class="hidden sm:inline">Nouvelle conversation</span>
                </button>
            </div>

            <!-- Chat Messages -->
            <div id="chat-messages" class="flex-1 overflow-y-auto mb-3 space-y-3 scroll-smooth min-h-0">
                <!-- Welcome message -->
                <div class="chat chat-start">
                    <div class="chat-image avatar">
                        <div class="w-8 rounded-full bg-primary flex items-center justify-center">
                            <i class="bi bi-robot text-primary-content text-sm"></i>
                        </div>
                    </div>
                    <div class="chat-bubble chat-bubble-primary">
                        Bonjour ! Je suis votre assistant Migros. Dites-moi ce que vous cherchez et je vous trouverai les meilleurs produits.
                    </div>
                </div>
            </div>

            <!-- Input Bar (normal mode) -->
            <div id="chat-input-bar" class="flex gap-2 transition-all duration-300">
                <input
                    type="text"
                    id="chat-input"
                    placeholder="Ex: Je veux faire un gâteau au chocolat..."
                    class="input input-lg input-bordered flex-1"
                    onkeydown="if(event.key==='Enter') sendMessage()"
                />
                <button id="chat-send-btn" onclick="sendMessage()" class="btn btn-primary btn-lg">
                    <i class="bi bi-send-fill text-lg"></i>
                </button>
            </div>

            <!-- Choice Picker (clarify mode — hidden by default) -->
            <div id="chat-choices" class="hidden flex flex-col gap-2 animate-in">
                <div id="choices-buttons" class="flex flex-wrap gap-2"></div>
                <div class="flex gap-2">
                    <input
                        type="text"
                        id="choices-custom-input"
                        placeholder="Autre..."
                        class="input input-bordered flex-1"
                        onkeydown="if(event.key==='Enter') submitCustomChoice()"
                    />
                    <button onclick="submitCustomChoice()" class="btn btn-primary" id="choices-custom-send">
                        <i class="bi bi-send-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Drawer side: Shopping List -->
    <div class="drawer-side z-50">
        <label for="cart-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <div class="bg-base-200 min-h-full w-80 p-4 flex flex-col">
            <h2 class="text-lg font-bold mb-3 flex items-center gap-2">
                <i class="bi bi-cart3"></i> Liste de courses
            </h2>

            <div id="shopping-list" class="flex-1 overflow-y-auto space-y-2 mb-3">
                <p class="text-base-content/50 text-sm text-center py-4">
                    Votre liste est vide. Ajoutez des produits depuis le chat !
                </p>
            </div>

            <div id="shopping-total" class="border-t border-base-300 pt-3 mb-2 hidden">
                <div class="flex justify-between font-bold text-lg">
                    <span>Total :</span>
                    <span id="total-price">CHF 0.00</span>
                </div>
            </div>

            <button onclick="clearShoppingList()" id="btn-clear-list" class="btn btn-outline btn-error btn-sm hidden">
                <i class="bi bi-trash3"></i> Vider la liste
            </button>
        </div>
    </div>
</div>

<!-- Mobile Floating Cart Button -->
<label
    for="cart-drawer"
    class="fixed bottom-20 right-4 z-40 btn btn-primary btn-circle btn-lg shadow-lg lg:hidden cursor-pointer"
>
    <i class="bi bi-cart3 text-xl"></i>
    <span id="cart-badge" class="badge badge-error badge-sm absolute -top-1 -right-1 hidden">0</span>
</label>

<!-- Product Detail Modal -->
<dialog id="product-modal" class="modal">
    <div class="modal-box max-w-lg">
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10">✕</button>
        </form>
        <div class="flex flex-col items-center gap-3">
            <!-- Image with discount overlay -->
            <div class="bg-base-200 rounded-box p-4 flex items-center justify-center relative">
                <span id="modal-discount" class="absolute top-2 left-2 badge badge-error font-bold hidden"></span>
                <img id="modal-image" src="" alt="" class="w-64 h-64 object-contain" />
            </div>

            <!-- Name & brand -->
            <h3 id="modal-name" class="font-bold text-xl text-center"></h3>
            <p id="modal-brand" class="text-sm text-base-content/60"></p>

            <!-- Badges -->
            <div id="modal-badges" class="flex flex-wrap justify-center gap-1"></div>

            <!-- Description -->
            <p id="modal-description" class="text-sm text-center text-base-content/70"></p>

            <!-- Price -->
            <div class="flex flex-col items-center gap-1">
                <div class="flex items-center gap-2">
                    <span id="modal-original-price" class="line-through text-base-content/40 text-lg hidden"></span>
                    <span id="modal-price" class="text-3xl font-bold text-primary"></span>
                </div>
                <span id="modal-unit-price" class="text-sm text-base-content/50"></span>
            </div>

            <!-- Meta: origin & categories -->
            <p id="modal-meta" class="text-xs text-base-content/50 text-center hidden"></p>

            <!-- Action buttons -->
            <div class="flex gap-2 w-full mt-2">
                <button id="modal-add-btn" class="btn btn-primary btn-lg flex-1">
                    <i class="bi bi-cart-plus"></i> Ajouter à la liste
                </button>
                <a id="modal-migros-link" href="#" target="_blank" rel="noopener noreferrer"
                   class="btn btn-outline btn-lg hidden" title="Voir sur migros.ch">
                    <i class="bi bi-box-arrow-up-right"></i>
                </a>
            </div>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
    </form>
</dialog>

<!-- Toast container -->
<div id="toast-container" class="toast toast-end toast-bottom z-[100]"></div>
