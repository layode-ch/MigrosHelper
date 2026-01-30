# Documentation API Migros

Ce document répertorie les méthodes disponibles pour interagir avec les services Migros (Produits, Magasins, Recettes, Cumulus).

## 📋 Flux de travail typique (Produits)

Pour récupérer des informations sur les produits, suivez généralement cet ordre d'appels :

1.  **Authentification** : Obtenir un token invité via `getGuestToken()`.
2.  **Recherche** : Utiliser `searchProduct()` ou `categoryList()` pour trouver des articles.
3.  **Détails** : Utiliser les IDs récupérés pour obtenir les fiches complètes via `getProductDetails()`.
4.  **Stock** : (Optionnel) Vérifier la disponibilité en magasin avec `getProductSupply()`.

---

## 🔐 Authentification

Gestion des tokens d'accès.

### `MigrosAPI.account.oauth2`

* **`getGuestToken()`**
    * *Description :* Génère un token invité. Nécessaire pour tous les appels liés aux produits.
    * *Paramètres :* Aucun.

* **`getUserInfo(token?)`**
    * *Description :* Récupère les informations de l'utilisateur actuellement connecté.

---

## 🛒 Produits

Espace de noms : `MigrosAPI.products`

### Recherche (`productSearch`)

* **`searchProduct(body, options?, token)`**
    * *Description :* Recherche de produits par texte.
    * **query** (requis) : Terme de recherche.
    * `language` : Langue de réponse (`EN`, `DE`, `FR`, `IT`).
    * `regionId` : `national` ou `gmos`.
    * `sortFields` : Tri par `normalizedUnit` ou `effectiveUnitPrice`.
    * `sortOrder` : Ordre de tri (`asc` / `desc`).
    * `filters` : Filtres additionnels.
    * `productIds` : Filtrer par une liste d'IDs spécifiques.

* **`categoryList(body, options?, token)`**
    * *Description :* Liste les produits par catégorie avec pagination.
    * **categoryId** (requis) : ID de la catégorie.
    * **from** (requis) : Offset de pagination (point de départ).
    * `language`, `regionId`, `sortFields`, `sortOrder`.
    * `requestSponsoredProducts` : Booléen pour inclure les produits sponsorisés.

### Affichage (`productDisplay`)

* **`getProductCards(options, token)`**
    * *Description :* Récupère les fiches produit résumées (format carte).
    * **productFilter.uids** (requis) : Tableau d'UIDs produit.
    * `offerFilter.storeType`
    * `offerFilter.region`

* **`getProductDetails(options, token)`**
    * *Description :* Récupère les détails complets d'un ou plusieurs produits.
    * `uids` : UID(s) du produit.
    * `migrosIds` : IDs Migros alternatifs.
    * `storeType`, `region`, `warehouseId`.

### Stocks (`marketableStock`)

* **`getProductSupply(options, token)`**
    * *Description :* Vérifie la disponibilité et le stock d'un produit en magasin.
    * **pids** (requis) : IDs des produits.
    * `costCenterIds` : IDs de centre de coûts (magasins).

---

## 🏪 Magasins

Espace de noms : `MigrosAPI.stores`

### `storeSearch`

* **`searchStores(options, token)`**
    * *Description :* Recherche de magasins physiques.
    * `query` : Nom du magasin ou localisation.

---

## 👨‍🍳 Recettes (Migusto)

> **Note :** Cette section ne nécessite pas d'authentification préalable.

Espace de noms : `MigrosAPI.migusto`

* **`recipeSearch(options)`**
    * *Description :* Moteur de recherche de recettes.
    * Paramètres : `searchTerm`, `ingredients`, `language`, `limit`, `offset`, `order`.

* **`recipeProducts(options)`**
    * *Description :* Liste les produits nécessaires pour réaliser une recette.
    * **id** (requis) : ID de la recette.

* **`recipeDetails(options)`**
    * *Description :* Détails complets (ingrédients, instructions, temps, etc.).
    * **slug** (requis) : Slug URL de la recette.

---

## 💳 Cumulus

> **Important :** Toutes les méthodes de cette section nécessitent des **cookies de login** valides.

| Méthode | Description |
| :--- | :--- |
| `getCumulusStats()` | Solde et statut des points Cumulus. |
| `getCumulusReceipt(options)` | Récupère un ticket de caisse spécifique (parsé). |
| `getCumulusReceipts(options)` | Liste l'historique des tickets (par plage de dates). |
| `getCumulusPrincipal()` | Récupère le profil utilisateur lié au compte. |
| `getCumulusHousehold()` | Informations sur le ménage Cumulus. |
| `getCumulusInvoice()` | Récupère les factures liées au compte. |
| `getCumulusCreditCard()` | Informations sur la carte de crédit Cumulus. |
| `getCumulusPaymentSites()` | Liste des sites de paiement associés. |

---

## 🛡️ Sécurité

> **Important :** Nécessite des **cookies de login** valides.

* **`getOptions()`** : Récupère les options de sécurité du compte.
* **`getPaymentDevices()`** : Liste les appareils de paiement enregistrés.
