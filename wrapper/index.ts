import express from "express";
import { MigrosAPI } from "migros-api-wrapper";

const app = express();
app.use(express.json());

const PORT = 3000;

// === Structured logging ===
function logError(context: string, error: any): void {
    const entry = {
        timestamp: new Date().toISOString(),
        context,
        message: error?.message || String(error),
        stack: error?.stack || null,
    };
    console.error(JSON.stringify(entry));
}

// === Product classification ===
function classifyProduct(name: string, categories: string[]): { healthScore: string; foodType: string | null } {
    const text = [name, ...categories].join(" ").toLowerCase();

    // Health score
    const unhealthyKeywords = ["chips", "bonbon", "candy", "chocolat", "biscuit", "cookie", "gâteau", "cake", "glace", "ice cream", "soda", "coca", "fanta", "sprite", "energy drink", "red bull", "sucette", "caramel", "praline", "guimauve", "marshmallow", "nutella", "snickers", "mars", "twix", "haribo", "chewing"];
    const healthyKeywords = ["salade", "salad", "bio", "complet", "vollkorn", "quinoa", "légume", "gemüse", "fruit", "tomate", "concombre", "brocoli", "épinard", "carotte", "pomme", "banane", "orange", "kiwi", "avocat", "noix", "amande", "graine", "chia", "lin", "soja", "tofu", "nature", "sans sucre", "zuckerfrei", "light", "fitness"];

    let healthScore = "neutral";
    if (unhealthyKeywords.some(kw => text.includes(kw))) healthScore = "unhealthy";
    else if (healthyKeywords.some(kw => text.includes(kw))) healthScore = "healthy";

    // Food type
    const typeRules: Array<{ type: string; keywords: string[] }> = [
        { type: "boisson", keywords: ["jus", "saft", "eau", "wasser", "lait", "milch", "café", "kaffee", "thé", "tee", "soda", "bière", "bier", "vin", "wein", "sirop", "smoothie", "drink", "boisson", "coca", "fanta", "sprite", "ice tea"] },
        { type: "fruit", keywords: ["pomme", "banane", "orange", "kiwi", "fraise", "framboise", "cerise", "raisin", "poire", "mangue", "ananas", "citron", "pêche", "abricot", "melon", "myrtille", "fruit"] },
        { type: "produit laitier", keywords: ["yogourt", "joghurt", "fromage", "käse", "beurre", "butter", "crème", "rahm", "mozzarella", "gruyère", "emmental", "lait", "milch", "séré", "cottage", "mascarpone"] },
        { type: "boulangerie", keywords: ["pain", "brot", "croissant", "brioche", "baguette", "toast", "zopf", "tresse", "muffin", "donut"] },
        { type: "dessert", keywords: ["gâteau", "kuchen", "tarte", "torte", "mousse", "crème dessert", "flan", "panna cotta", "tiramisu", "glace", "ice cream", "sorbet", "pudding", "brownie", "cookie", "biscuit"] },
        { type: "snack", keywords: ["chips", "crackers", "bretzel", "pop-corn", "noix", "nüsse", "amande", "barre", "riegel", "snack", "apéro", "bonbon", "candy", "chocolat", "praline"] },
        { type: "féculent", keywords: ["pâte", "pasta", "riz", "reis", "spaghetti", "penne", "fusilli", "nouille", "couscous", "polenta", "gnocchi", "lasagne", "tagliatelle"] },
        { type: "plat principal", keywords: ["pizza", "poulet", "hähnchen", "bœuf", "rind", "porc", "schwein", "poisson", "fisch", "saumon", "lachs", "steak", "escalope", "saucisse", "wurst", "burger", "plat", "gericht", "ravioli", "rösti"] },
        { type: "accompagnement", keywords: ["salade", "salat", "légume", "gemüse", "soupe", "suppe", "sauce", "bouillon", "purée"] },
        { type: "ingrédient", keywords: ["farine", "mehl", "sucre", "zucker", "sel", "salz", "huile", "öl", "vinaigre", "essig", "levure", "hefe", "épice", "gewürz", "herbe", "kräuter", "oeuf", "ei", "maïzena"] },
    ];

    let foodType: string | null = null;
    for (const rule of typeRules) {
        if (rule.keywords.some(kw => text.includes(kw))) {
            foodType = rule.type;
            break;
        }
    }

    return { healthScore, foodType };
}

// === Product card mapping ===
function mapProductCards(rawCards: any[]): Map<number, any> {
    const productById = new Map<number, any>();
    for (const p of rawCards) {
        const imageUrl = p.images?.[0]?.url?.replace("{stack}", "original") || "";
        const pictos: any[] = p.offer?.pictos || [];
        const hasPicto = (type: string) => pictos.some((pic: any) => pic.type === type);

        const effectivePrice = p.offer?.price?.effectiveValue ?? 0;
        const originalPrice = p.offer?.price?.value ?? null;
        const isPromoted = originalPrice !== null && originalPrice > effectivePrice;
        const discountPercent = isPromoted
            ? Math.round((1 - effectivePrice / originalPrice) * 100)
            : 0;

        const migrosId = p.migrosId || p.uid || "";
        const origin = p.origin?.producing?.country || p.origins?.producing?.country || "";
        const categories: string[] = (p.categories || []).map((c: any) => c.name || "").filter(Boolean);
        const { healthScore, foodType } = classifyProduct(p.name || "", categories);

        const mapped = {
            id: String(migrosId),
            name: p.name || "",
            brand: p.versioning || "",
            price: effectivePrice,
            priceFormatted:
                p.offer?.price?.advertisedDisplayValue
                    ? `CHF ${p.offer.price.advertisedDisplayValue}`
                    : "",
            originalPrice: isPromoted ? originalPrice : null,
            originalPriceFormatted: isPromoted ? `CHF ${originalPrice.toFixed(2)}` : null,
            isPromoted,
            discountPercent,
            unitPrice: p.offer?.quantityPrice || "",
            image: imageUrl,
            description: p.description || "",
            isBio: hasPicto("BIO"),
            isVegan: hasPicto("VEGAN"),
            isVegetarian: hasPicto("VEGETARIAN"),
            isGlutenFree: hasPicto("GLUTEN_FREE"),
            isFairtrade: hasPicto("FAIRTRADE"),
            isHalal: hasPicto("HALAL"),
            isKosher: hasPicto("KOSHER"),
            isRegional: hasPicto("REGIONAL"),
            migrosUrl: migrosId ? `https://www.migros.ch/fr/product/${migrosId}` : "",
            origin,
            categories,
            healthScore,
            foodType,
        };

        productById.set(p.migrosId, mapped);
        if (p.uid) productById.set(p.uid, mapped);
    }
    return productById;
}

// Cache guest token (refreshed when expired)
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getToken(): Promise<string> {
    const now = Date.now();
    if (cachedToken && now < tokenExpiry) {
        return cachedToken;
    }
    const guestInfo = await MigrosAPI.account.oauth2.getGuestToken();
    cachedToken = guestInfo.token;
    // Refresh 5 minutes before expiry, default to 30 min lifetime
    tokenExpiry = now + 25 * 60 * 1000;
    return cachedToken;
}

// GET /api/token - Return a guest token
app.get("/api/token", async (_req, res) => {
    try {
        const token = await getToken();
        res.json({ token });
    } catch (error: any) {
        logError("getToken", error);
        res.status(500).json({ error: "Failed to get guest token" });
    }
});

// POST /api/search - Search products
app.post("/api/search", async (req, res) => {
    try {
        const { query, language, sortFields, sortOrder } = req.body;

        if (!query) {
            res.status(400).json({ error: "query is required" });
            return;
        }

        const token = await getToken();
        const results = await MigrosAPI.products.productSearch.searchProduct(
            {
                query,
                language: language || "fr",
                sortFields: sortFields || undefined,
                sortOrder: sortOrder || undefined,
            },
            { leshopch: token }
        );

        res.json(results);
    } catch (error: any) {
        logError("searchProducts", error);
        res.status(500).json({ error: "Failed to search products" });
    }
});

// GET /api/product/:uid - Get product details
app.get("/api/product/:uid", async (req, res) => {
    try {
        const token = await getToken();
        const result = await MigrosAPI.products.productSearch.searchProduct(
            {
                query: req.params.uid,
                language: "fr",
            },
            { leshopch: token }
        );

        res.json(result);
    } catch (error: any) {
        logError("getProduct", error);
        res.status(500).json({ error: "Failed to get product details" });
    }
});

// POST /api/chat - AI-powered conversational product search via Mistral
app.post("/api/chat", async (req, res) => {
    try {
        const { message, filters, conversationHistory } = req.body;

        if (!message) {
            res.status(400).json({ error: "message is required" });
            return;
        }

        const bio = filters?.bio ?? false;
        const healthy = filters?.healthy ?? false;
        const priceSort = filters?.priceSort ?? null;

        // Sanitize conversation history: keep only user|assistant roles, max 20 messages
        const safeHistory: Array<{ role: string; content: string }> = [];
        if (Array.isArray(conversationHistory)) {
            for (const msg of conversationHistory.slice(-20)) {
                if (
                    msg &&
                    typeof msg.content === "string" &&
                    (msg.role === "user" || msg.role === "assistant")
                ) {
                    safeHistory.push({
                        role: msg.role,
                        content: msg.content.slice(0, 2000),
                    });
                }
            }
        }

        // 1. Call Mistral with conversational system prompt
        const systemPrompt = `Tu es un assistant de courses Migros (Suisse). Réponds TOUJOURS en français.
Réponds TOUJOURS en JSON avec "action" = "clarify" ou "search".

=== PERSONNALITÉ ===
Tu es passionné de cuisine et de bons produits. Tu :
- Expliques le rôle de chaque ingrédient dans la recette (pourquoi on en a besoin)
- Donnes des conseils pratiques (cuisson, conservation, substitution)
- Suggères des idées complémentaires quand c'est pertinent
- Quand la demande est vague, proposes des idées de repas inspirantes

=== PRINCIPE ===
Tu es comme un vendeur en magasin : tu poses des questions étape par étape pour bien comprendre ce que veut le client AVANT de chercher des produits. Tu ne cherches JAMAIS tant que tu n'as pas assez d'infos.

=== QUAND CHERCHER (action = "search") ===
Tu passes en "search" UNIQUEMENT quand tu connais TOUS ces éléments :
1. Le TYPE EXACT de produit (pas juste "tarte" mais "tarte aux pommes", pas juste "pizza" mais "pizza margherita surgelée")
2. Si c'est FAIT MAISON → tu connais la recette/saveur exacte pour lister les ingrédients
3. Si c'est ACHETÉ TOUT FAIT → tu connais le produit précis à chercher

Cas où tu peux chercher IMMÉDIATEMENT (sans clarify) :
- Ingrédient brut simple : "lait", "farine", "beurre", "œufs", "riz" → SEARCH direct
- Demande déjà complète : "je veux faire une tarte aux pommes" → SEARCH ingrédients
- Produit précis : "je veux acheter du Nutella" → SEARCH direct

=== QUAND CLARIFIER (action = "clarify") ===
TOUT LE RESTE → clarify. Pose UNE question à la fois, chaque question affine le besoin.

Enchaînement type pour une demande vague :
- Étape 1 : Acheter tout fait ou faire maison ?
- Étape 2 : Quel type/saveur exactement ?
- Étape 3 : (si maison) Pour combien de personnes ? / Quelle recette ?
- Étape 4 : (si besoin) Des préférences ? (sans gluten, bio, etc.)

Tu ne poses PAS toutes les questions d'un coup. UNE question par message. Tu adaptes la question suivante selon la réponse précédente.

IMPORTANT : Quand l'utilisateur répond à ta question, regarde l'historique. S'il manque encore des infos → CLARIFY ENCORE. Ne saute pas au search trop vite.

=== EXEMPLES D'ENCHAÎNEMENT ===

Exemple 1 — "tarte"
  → clarify: "Vous voulez acheter une tarte ou la faire maison ?" options: ["Acheter une tarte toute faite", "Faire une tarte maison"]
  ← "maison"
  → clarify: "Super ! Une tarte à quoi ?" options: ["Aux pommes", "Au chocolat", "Au citron", "Aux fruits rouges"]
  ← "aux pommes"
  → search: ["pâte brisée", "pomme", "sucre", "beurre", "cannelle"]

Exemple 2 — "pizza"
  → clarify: "Vous cherchez une pizza toute faite ou vous voulez la préparer ?" options: ["Pizza surgelée", "Pizza fraîche", "Faire une pizza maison"]
  ← "surgelée"
  → clarify: "Quel type de pizza ?" options: ["Margherita", "4 fromages", "Prosciutto", "Végétarienne"]
  ← "4 fromages"
  → search: ["pizza 4 fromages surgelée"]

Exemple 3 — "un dessert"
  → clarify: "Quel type de dessert vous ferait plaisir ?" options: ["Gâteau", "Glace", "Mousse / crème", "Fruit"]
  ← "glace"
  → clarify: "Quel parfum ?" options: ["Vanille", "Chocolat", "Fraise", "Caramel"]
  ← "vanille"
  → search: ["glace vanille"]

Exemple 4 — "quelque chose pour ce soir"
  → clarify: "C'est pour quel type de repas ?" options: ["Apéro", "Plat principal", "Repas rapide", "Dessert"]
  ← "plat principal"
  → clarify: "Plutôt quoi ?" options: ["Pâtes", "Viande/poisson", "Pizza", "Salade/léger"]
  ← "pâtes"
  → clarify: "Acheter des pâtes prêtes ou cuisiner un plat ?" options: ["Pâtes fraîches prêtes", "Sauce + pâtes sèches", "Lasagnes", "Ravioli"]

=== FORMAT clarify ===
- responseMessage : UNE question courte et sympathique. Tu peux utiliser **gras** pour les mots-clés. Tu peux ajouter un court conseil ou suggestion avant ta question.
- searchTerms : []
- options : 2 à 4 choix courts et pertinents basés sur le contexte de la conversation

=== FORMAT search ===
- responseMessage : en **markdown** (utilise ##, **, *, -, 1.). Explique POURQUOI ces ingrédients/produits. Ajoute un conseil cuisine ou une variante possible. Reste concis (2-6 lignes, pas de romans).
  Exemple : "## 🌮 Tacos mexicains\nVoici les **ingrédients essentiels** :\n- **Tortillas** — la base indispensable\n- **Bœuf haché** — pour la garniture\n\n*Astuce : ajoutez du citron vert pour plus de fraîcheur !*"
- searchTerms : termes simples, français, singulier, max 6
- options : []

Filtres actifs :
- Bio : ${bio ? "OUI — ajoute \"bio\" à chaque terme de recherche." : "Non."}
- Sain : ${healthy ? "OUI — privilégie des termes santé (complet, sans sucre, etc.)." : "Non."}

Maximum 5 questions par conversation. Après 5 clarify, cherche avec ce que tu as compris.

JSON uniquement :
{"action": "clarify" ou "search", "responseMessage": "...", "searchTerms": [...], "options": [...]}`;


        const mistralKey = process.env.MISTRAL_API_KEY;
        if (!mistralKey) {
            logError("chat", { message: "MISTRAL_API_KEY is not set" });
            res.status(500).json({ error: "AI service not configured" });
            return;
        }

        // Build messages array with history
        const messages: Array<{ role: string; content: string }> = [
            { role: "system", content: systemPrompt },
            ...safeHistory,
            { role: "user", content: message },
        ];

        const mistralResp = await fetch(
            "https://api.mistral.ai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${mistralKey}`,
                },
                body: JSON.stringify({
                    model: "mistral-large-latest",
                    messages,
                    temperature: 0.1,
                    response_format: { type: "json_object" },
                }),
            }
        );

        if (!mistralResp.ok) {
            const errText = await mistralResp.text();
            logError("chat.mistralAPI", { message: `HTTP ${mistralResp.status}: ${errText}` });
            res.status(502).json({ error: "AI service error" });
            return;
        }

        const mistralData = await mistralResp.json();
        const content = mistralData.choices?.[0]?.message?.content;
        if (!content) {
            res.status(502).json({ error: "Empty AI response" });
            return;
        }

        let parsed: {
            action?: string;
            searchTerms?: string[];
            responseMessage?: string;
            options?: string[];
        };
        try {
            parsed = JSON.parse(content);
        } catch {
            logError("chat.parseJSON", { message: "Failed to parse Mistral JSON", stack: content });
            res.status(502).json({ error: "Invalid AI response format" });
            return;
        }

        console.log("Mistral raw response:", JSON.stringify(parsed, null, 2));

        // Determine action: if searchTerms is empty/missing, treat as clarify
        let action = parsed.action || "search";
        if (action === "search" && (!parsed.searchTerms || parsed.searchTerms.length === 0)) {
            action = "clarify";
        }
        const responseMessage =
            parsed.responseMessage || "Voici ce que j'ai trouvé :";

        // If action is "clarify", return immediately without searching
        if (action === "clarify") {
            const options = Array.isArray(parsed.options) ? parsed.options.slice(0, 4) : [];
            res.json({
                message: responseMessage,
                products: [],
                action: "clarify",
                options,
            });
            return;
        }

        // action === "search": search Migros
        const searchTerms = parsed.searchTerms || [];

        // 2. Search Migros for each term, collect product IDs grouped by term
        const token = await getToken();
        const seenIds = new Set<number>();
        const termGroups: Array<{ label: string; ids: number[] }> = [];

        for (const term of searchTerms) {
            const groupIds: number[] = [];
            try {
                const searchOpts: any = {
                    query: term,
                    language: "fr",
                    regionId: "gmos",
                };
                if (priceSort) {
                    searchOpts.sortFields = ["effectiveUnitPrice"];
                    searchOpts.sortOrder = priceSort;
                }

                const results =
                    await MigrosAPI.products.productSearch.searchProduct(
                        searchOpts,
                        { leshopch: token }
                    );

                const ids: number[] = results?.productIds || [];
                for (const id of ids.slice(0, 3)) {
                    if (!seenIds.has(id)) {
                        seenIds.add(id);
                        groupIds.push(id);
                    }
                }
            } catch (err: any) {
                logError(`chat.searchTerm[${term}]`, err);
            }
            if (groupIds.length > 0) {
                termGroups.push({ label: term.charAt(0).toUpperCase() + term.slice(1), ids: groupIds });
            }
        }

        // 3. Fetch all product cards in one batch, then distribute into groups
        const allIds = termGroups.flatMap(g => g.ids);
        let productById = new Map<number, any>();

        if (allIds.length > 0) {
            try {
                const cards =
                    await MigrosAPI.products.productDisplay.getProductCards(
                        { productFilter: { uids: allIds }, offerFilter: { region: "gmos" } },
                        { leshopch: token, "accept-language": "fr" }
                    );

                const productCards: any[] = Array.isArray(cards) ? cards : [];
                productById = mapProductCards(productCards);
            } catch (err: any) {
                logError("chat.fetchProductCards", err);
            }
        }

        // Build grouped response
        const groups = termGroups
            .map(g => ({
                label: g.label,
                products: g.ids.map(id => productById.get(id)).filter(Boolean),
            }))
            .filter(g => g.products.length > 0);

        const allProducts = groups.flatMap(g => g.products);

        // Return with noResults flag if search yielded nothing
        res.json({
            message: responseMessage,
            products: allProducts,
            groups,
            action: "search",
            ...(allProducts.length === 0 && { noResults: true }),
        });
    } catch (error: any) {
        logError("chat", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/search-group - Search a single term and return a product group
app.post("/api/search-group", async (req, res) => {
    try {
        const { term, priceSort } = req.body;

        if (!term) {
            res.status(400).json({ error: "term is required" });
            return;
        }

        const token = await getToken();
        const searchOpts: any = {
            query: term,
            language: "fr",
            regionId: "gmos",
        };
        if (priceSort) {
            searchOpts.sortFields = ["effectiveUnitPrice"];
            searchOpts.sortOrder = priceSort;
        }

        const results = await MigrosAPI.products.productSearch.searchProduct(
            searchOpts,
            { leshopch: token }
        );

        const ids: number[] = (results?.productIds || []).slice(0, 3);

        if (ids.length === 0) {
            res.json({ label: term.charAt(0).toUpperCase() + term.slice(1), products: [] });
            return;
        }

        const cards = await MigrosAPI.products.productDisplay.getProductCards(
            { productFilter: { uids: ids }, offerFilter: { region: "gmos" } },
            { leshopch: token, "accept-language": "fr" }
        );

        const productCards: any[] = Array.isArray(cards) ? cards : [];
        const productById = mapProductCards(productCards);
        const products = ids.map(id => productById.get(id)).filter(Boolean);

        res.json({
            label: term.charAt(0).toUpperCase() + term.slice(1),
            products,
        });
    } catch (error: any) {
        logError("searchGroup", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Migros API wrapper listening on port ${PORT}`);
});
