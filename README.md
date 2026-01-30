Reely


Liste des methodes pour appeler l'API :

  Produits

  MigrosAPI.products.productSearch.searchProduct(body, options?, token)

  Recherche de produits par texte.
  - query - terme de recherche (requis)
  - language - EN, DE, FR, IT
  - regionId - national ou gmos
  - sortFields - tri par normalizedUnit ou effectiveUnitPrice
  - sortOrder - asc / desc
  - filters - filtres additionnels
  - productIds - filtrer par IDs spécifiques

  MigrosAPI.products.productSearch.categoryList(body, options?, token)

  Liste les produits par catégorie avec pagination.
  - categoryId - ID de la catégorie (requis)
  - from - offset de pagination (requis)
  - language, regionId, sortFields, sortOrder
  - requestSponsoredProducts - inclure les produits sponsorisés

  MigrosAPI.products.productDisplay.getProductCards(options, token)

  Récupère les fiches produit (résumé).
  - productFilter.uids - tableau d'UIDs produit (requis)
  - offerFilter.storeType, offerFilter.region

  MigrosAPI.products.productDisplay.getProductDetails(options, token)

  Détails complets d'un ou plusieurs produits.
  - uids - UID(s) produit
  - migrosIds - IDs Migros
  - storeType, region, warehouseId

  MigrosAPI.products.marketableStock.getProductSupply(options, token)

  Disponibilité/stock d'un produit en magasin.
  - pids - IDs produit (requis)
  - costCenterIds - IDs de centre de coûts

  ---
  Magasins

  MigrosAPI.stores.storeSearch.searchStores(options, token)

  Recherche de magasins.
  - query - nom ou localisation

  ---
  Recettes (Migusto) - pas besoin d'auth

  MigrosAPI.migusto.recipeSearch(options)

  Recherche de recettes.
  - searchTerm, ingredients, language, limit, offset, order

  MigrosAPI.migusto.recipeProducts(options)

  Produits nécessaires pour une recette.
  - id - ID de la recette (requis)

  MigrosAPI.migusto.recipeDetails(options)

  Détails d'une recette (ingrédients, instructions, etc.).
  - slug - slug de la recette (requis)

  ---
  Authentification

  MigrosAPI.account.oauth2.getGuestToken()

  Token invité (nécessaire pour tous les appels produits). Aucun paramètre.

  MigrosAPI.account.oauth2.getUserInfo(token?)

  Infos utilisateur connecté.

  ---
  Cumulus (nécessite des cookies de login)
  ┌─────────────────────────────┬───────────────────────────────────────┐
  │           Méthode           │              Description              │
  ├─────────────────────────────┼───────────────────────────────────────┤
  │ getCumulusStats()           │ Points Cumulus                        │
  ├─────────────────────────────┼───────────────────────────────────────┤
  │ getCumulusReceipt(options)  │ Un ticket de caisse (parsé)           │
  ├─────────────────────────────┼───────────────────────────────────────┤
  │ getCumulusReceipts(options) │ Liste de tickets (par plage de dates) │
  ├─────────────────────────────┼───────────────────────────────────────┤
  │ getCumulusPrincipal()       │ Profil utilisateur                    │
  ├─────────────────────────────┼───────────────────────────────────────┤
  │ getCumulusHousehold()       │ Infos ménage                          │
  ├─────────────────────────────┼───────────────────────────────────────┤
  │ getCumulusInvoice()         │ Factures                              │
  ├─────────────────────────────┼───────────────────────────────────────┤
  │ getCumulusCreditCard()      │ Carte de crédit                       │
  ├─────────────────────────────┼───────────────────────────────────────┤
  │ getCumulusPaymentSites()    │ Sites de paiement                     │
  └─────────────────────────────┴───────────────────────────────────────┘
  ---
  Sécurité (nécessite des cookies de login)

  - getOptions() - Options de sécurité du compte
  - getPaymentDevices() - Appareils de paiement

  ---
  Pour les produits, le flux typique est :
  1. Obtenir un token avec getGuestToken()
  2. Utiliser searchProduct() ou categoryList() pour trouver des produits
  3. Utiliser getProductDetails() ou getProductCards() pour les détails
  4. Optionnellement getProductSupply() pour le stock en magasin
