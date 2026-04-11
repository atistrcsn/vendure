/**
 * glossary.ts — Automatikusan generált Vendure Dashboard szótár
 * Generálva: 2026-02-25T11:24:24.530Z
 * Forrás: en.po explicit Lingui ID-k (146 bejegyzés)
 *
 * Ezt a fájlt a translate-vendure.ts importálja.
 * Újragenerálás: npx tsx generate-glossary.ts
 */

// ── Explicit Lingui ID fordítások ────────────────────────────────────────────
// Ezek az orderState.xxx, paymentState.xxx stb. ID-k fordításai.
// SZABÁLY: csak a human-readable értéket tartalmazza, a namespace-t NEM.
// pl. "orderState.PartiallyDelivered" → "Részben teljesítve"
export const EXPLICIT_ID_TRANSLATIONS: Record<string, string> = {
  // ── Navigáció és főcímek ─────────────────────────────────────────────
  "Failed to extend query document": "A lekérdezési dokumentum kiterjesztése sikertelen", // Failed to extend query document
  "Query extension is invalid: must have at least one top-level field": "A lekérdezés-kiterjesztés érvénytelen: legalább egy felső szintű mezőt kell tartalmaznia",
  "Query extension mismatch: ": "Lekérdezés-kiterjesztési eltérés: ",
  "Query extension contains invalid GraphQL syntax": "A lekérdezés-kiterjesztés érvénytelen GraphQL szintaxist tartalmaz",
  "Query extension error: ": "Lekérdezés-kiterjesztési hiba: ", // "Query extension error: "
  "Query extension error": "Lekérdezés-kiterjesztési hiba", // Query extension error
  "Insights": "Elemzések", // Insights
  "Catalog": "Katalógus", // Catalog
  "Products": "Termékek", // Products
  "Product Variants": "Termékváltozatok", // Product Variants
  "Facets": "Tulajdonságok", // Facets
  "Collections": "Gyűjtemények", // Collections
  "Assets": "Média", // Assets
  "Sales": "Értékesítés", // Sales
  "Orders": "Megrendelések", // Orders
  "Customers": "Vásárlók", // Customers
  "Customer Groups": "Vásárlói csoportok", // Customer Groups
  "Marketing": "Marketing", // Marketing
  "Promotions": "Akciók", // Promotions
  "System": "Rendszer", // System
  "Job Queue": "Feladatsor", // Job Queue
  "Healthchecks": "Állapotfigyelés", // Healthchecks
  "Scheduled Tasks": "Ütemezett feladatok", // Scheduled Tasks
  "Settings": "Beállítások", // Settings
  "Sellers": "Eladók", // Sellers
  "Channels": "Csatornák", // Channels
  "Stock Locations": "Raktárhelyek", // Stock Locations
  "Administrators": "Adminisztrátorok", // Administrators
  "Roles": "Szerepkörök", // Roles
  "Shipping Methods": "Szállítási módok", // Shipping Methods
  "Payment Methods": "Fizetési módok", // Payment Methods
  "Tax Categories": "Adókategóriák", // Tax Categories
  "Tax Rates": "Adókulcsok", // Tax Rates
  "Countries": "Országok", // Countries
  "Zones": "Zónák", // Zones
  "Global Settings": "Globális beállítások", // Global Settings
  "Metrics Widget": "Statisztikák widget", // Metrics Widget
  "Latest Orders Widget": "Legújabb megrendelések widget", // Latest Orders Widget
  "Orders Summary Widget": "Megrendelések összesítő widget", // Orders Summary Widget
  "Running pending search index updates": "Függő keresési index frissítések futtatása", // Running pending search index updates
  "Note added successfully": "Megjegyzés sikeresen hozzáadva", // Note added successfully
  "Failed to add note": "Megjegyzés hozzáadása sikertelen", // Failed to add note
  "Note updated successfully": "Megjegyzés sikeresen frissítve", // Note updated successfully
  "Failed to update note": "Megjegyzés frissítése sikertelen", // Failed to update note
  "Note deleted successfully": "Megjegyzés sikeresen törölve", // Note deleted successfully
  "Failed to delete note": "Megjegyzés törlése sikertelen", // Failed to delete note

  // ── The page will continue with the default query ─────────────────────────────────────────────────────────────
  "The page will continue with the default query.": "Az oldal az alapértelmezett lekérdezéssel folytatódik.", // The page will continue with the default query.

  // ── Type and press Enter or comma to add ─────────────────────────────────────────────────────────────
  "Type and press Enter or comma to add...": "Írjon, majd nyomjon Entert vagy vesszőt a hozzáadáshoz...", // Type and press Enter or comma to add...

  // ── fulfillmentState ─────────────────────────────────────────────────────────────
  "fulfillmentState.Created": "Létrehozva", // Created
  "fulfillmentState.Pending": "Függőben", // Pending
  "fulfillmentState.Cancelled": "Lemondva", // Cancelled
  "fulfillmentState.Shipped": "Feladva", // Shipped
  "fulfillmentState.Delivered": "Kézbesítve", // Delivered

  // ── paymentState ─────────────────────────────────────────────────────────────
  "paymentState.Created": "Létrehozva", // Created
  "paymentState.Authorized": "Engedélyezve", // Authorized
  "paymentState.Settled": "Teljesítve", // Settled
  "paymentState.Declined": "Elutasítva", // Declined
  "paymentState.Error": "Hiba", // Error
  "paymentState.Cancelled": "Lemondva", // Cancelled
  "paymentState.Pending": "Függőben", // Pending
  "paymentState.Failed": "Sikertelen", // Failed

  // ── orderState ─────────────────────────────────────────────────────────────
  "orderState.Created": "Létrehozva", // Created
  "orderState.Draft": "Piszkozat", // Draft
  "orderState.AddingItems": "Tételek hozzáadása", // Adding items
  "orderState.Cancelled": "Lemondva", // Cancelled
  "orderState.ArrangingPayment": "Fizetés előkészítése", // Arranging payment
  "orderState.PaymentAuthorized": "Fizetés jóváhagyva", // Payment authorized
  "orderState.PaymentSettled": "Fizetés teljesítve", // Payment settled
  "orderState.PartiallyShipped": "Részben kiszállítva", // Partially shipped
  "orderState.Shipped": "Kiszállítva", // Shipped
  "orderState.PartiallyDelivered": "Részben kézbesítve", // Partially delivered
  "orderState.Delivered": "Kézbesítve", // Delivered
  "orderState.Modifying": "Módosítás alatt", // Modifying
  "orderState.ArrangingAdditionalPayment": "Pótfizetés intézése", // Arranging additional payment

  // ── refundReason ─────────────────────────────────────────────────────────────
  "refundReason.CustomerRequest": "Vásárlói kérés", // Customer request
  "refundReason.NotAvailable": "Termék nem elérhető", // Item not available
  "refundReason.DamagedInShipping": "Szállítás közben megsérült", // Damaged in shipping
  "refundReason.WrongItem": "Téves termék lett elküldve", // Wrong item shipped
  "refundReason.Other": "Egyéb", // Other

  // ── fieldName ─────────────────────────────────────────────────────────────
  "fieldName.attempts": "Kísérletek", // Attempts
  "fieldName.availableCurrencyCodes": "Elérhető pénznemkódok", // Available currency codes
  "fieldName.availableLanguageCodes": "Elérhető nyelvkódok", // Available language codes
  "fieldName.breadcrumbs": "Útvonal", // Breadcrumbs
  "fieldName.category": "Kategória", // Category
  "fieldName.channels": "Csatornák", // Channels
  "fieldName.children": "Aloldalak", // Children
  "fieldName.code": "Kód", // Code
  "fieldName.couponCode": "Kuponkód", // Coupon code
  "fieldName.createdAt": "Létrehozva", // Created at
  "fieldName.currencyCode": "Pénznemkód", // Currency code
  "fieldName.customer": "Vásárló", // Customer
  "fieldName.customerGroup": "Vásárlócsoport", // Customer group
  "fieldName.customers": "Vásárlók", // Customers
  "fieldName.customFields": "Egyéni mezők", // Custom fields
  "fieldName.data": "Adatok", // Data
  "fieldName.defaultCurrencyCode": "Alapértelmezett pénznemkód", // Default currency code
  "fieldName.defaultLanguageCode": "Alapértelmezett nyelvi kód", // Default language code
  "fieldName.defaultShippingZone": "Alapértelmezett szállítási zóna", // Default shipping zone
  "fieldName.defaultTaxZone": "Alapértelmezett adózóna", // Default tax zone
  "fieldName.description": "Leírás", // Description
  "fieldName.duration": "Időtartam", // Duration
  "fieldName.emailAddress": "E-mail cím", // Email address
  "fieldName.enabled": "Engedélyezve", // Enabled
  "fieldName.endsAt": "Vége", // Ends at
  "fieldName.error": "Hiba", // Error
  "fieldName.featuredAsset": "Kiemelt média", // Featured asset
  "fieldName.firstName": "Keresztnév", // First name
  "fieldName.fulfillmentHandlerCode": "Teljesítési kezelő kód", // Fulfillment handler code
  "fieldName.id": "ID", // ID
  "fieldName.isDefault": "Alapértelmezett", // Is default
  "fieldName.isPrivate": "Privát", // Is private
  "fieldName.isSettled": "Rendezett", // Is settled
  "fieldName.lastName": "Vezetéknév", // Last name
  "fieldName.name": "Név", // Name
  "fieldName.orderPlacedAt": "Megrendelés időpontja", // Order placed at
  "fieldName.parentId": "Szülő ID", // Parent ID
  "fieldName.perCustomerUsageLimit": "Vásárlónkénti felhasználási korlát", // Per customer usage limit
  "fieldName.permissions": "Jogosultságok", // Permissions
  "fieldName.position": "Pozíció", // Position
  "fieldName.price": "Ár", // Price
  "fieldName.priceWithTax": "Ár adóval", // Price with tax
  "fieldName.pricesIncludeTax": "Árak tartalmazzák az adót", // Prices include tax
  "fieldName.productVariants": "Termékváltozatok", // Product variants
  "fieldName.progress": "Folyamatban", // Progress
  "fieldName.queueName": "Sor neve", // Queue name
  "fieldName.result": "Eredmény", // Result
  "fieldName.retries": "Újrapróbálkozások", // Retries
  "fieldName.seller": "Eladó", // Seller
  "fieldName.settledAt": "Teljesítve", // Settled at
  "fieldName.shippingLines": "Szállítási sorok", // Shipping lines
  "fieldName.sku": "SKU", // SKU
  "fieldName.slug": "slug", // Slug
  "fieldName.startedAt": "Elkezdve", // Started at
  "fieldName.startsAt": "Kezdés időpontja", // Starts at
  "fieldName.state": "Állapot", // State
  "fieldName.stockLevels": "Készletszintek", // Stock levels
  "fieldName.token": "Token", // Token
  "fieldName.total": "Összesen", // Total
  "fieldName.totalWithTax": "Összesen adóval", // Total with tax
  "fieldName.type": "Típus", // Type
  "fieldName.updatedAt": "Módosítva", // Updated at
  "fieldName.usageLimit": "Felhasználási korlát", // Usage limit
  "fieldName.user": "Felhasználó", // User
  "fieldName.value": "Érték", // Value
  "fieldName.valueList": "Értéklista", // Value list
  "fieldName.zone": "Zóna", // Zone
};

// ── Domain szótár (általános terminusok) ─────────────────────────────────────
// Ezt használja a translate-vendure.ts a prompt-ban.
export const DOMAIN_GLOSSARY = `
| English              | Magyar                    |
|----------------------|---------------------------|
| order                | megrendelés               |
| product              | termék                    |
| custom field         | egyéni mező               |
| customer             | vásárló                   |
| guest customer       | vendég vásárló            |
| customer group       | vásárlói csoport          |
| refund               | visszatérítés             |
| cancellation         | törlés                    |
| shipping             | szállítás                 |
| shipping method      | szállítási mód            |
| payment              | fizetés                   |
| payment method       | fizetési mód              |
| channel              | csatorna                  |
| facet                | tulajdonság               |
| facet value          | tulajdonságérték          |
| variant              | termékváltozat            |
| product variant      | termékváltozat            |
| collection           | gyűjtemény                |
| stock                | készlet                   |
| stock on hand        | aktuális készlet          |
| out of stock         | nincs készleten           |
| inventory            | készlet                   |
| filter               | szűrő                     |
| zone                 | zóna                      |
| seller               | eladó                     |
| fulfillment          | teljesítés                |
| draft                | piszkozat                 |
| role                 | szerepkör                 |
| permission           | jogosultság               |
| asset                | média                     |
| promotion            | promóció                  |
| price                | ár                        |
| administrator        | rendszergazda             |
| coupon               | kupon                     |
| coupon code          | kuponkód                  |
| surcharge            | felár                     |
| currency             | pénznem                   |
| tax rate             | adókulcs                  |
| tax category         | adókategória              |
| discount             | kedvezmény                |
| adjustment           | módosítás                 |
| bulk action          | tömeges művelet           |
| catalog              | katalógus                 |
| global settings      | általános beállítások     |
`;
