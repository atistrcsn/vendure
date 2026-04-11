# Vendure Dashboard – Magyar fordítás projekt

## Könyvtárstruktúra

```
vendure/                                         ← fork gyökere
├── packages/
│   └── dashboard/
│       ├── src/i18n/locales/
│       │   ├── en.po                            ← forrás, ne módosítsd
│       │   ├── de.po                            ← meglévő referencia
│       │   └── hu.po                            ← ezt hozzuk létre
│       ├── lingui.config.js                     ← ide kell felvenni: 'hu'
│       ├── missing-translations.txt             ← i18n:extract kimenete
│       └── scripts/translate/
│           └── README.md                        ← official workflow
└── translate-tools/                             ← fordítói eszközök (hmdia-work branch-en él)
    ├── CLAUDE.md                                ← ez a fájl
    ├── generate-glossary.ts                     ← egyszer futtatandó
    ├── translate-vendure.ts                     ← minden extract után
    ├── context-check.ts                         ← terminus-ellenőrzés
    ├── glossary.ts                              ← auto-generált, ne szerkeszd
    ├── GIT_WORKFLOW.md                          ← git folyamatok leírása
    └── package.json
```

> **Fontos:** A `translate-tools/` könyvtár a `hmdia-work` branch-en él a fork-ban.
> A PR branch (`feat/add-hungarian-translations`) soha nem tartalmazza –
> oda csak `hu.po` és `lingui.config.js` kerül.
> A `packages/` mindig `../packages` relatív útvonalon érhető el innen.

## Branch stratégia

| Branch | Tartalom |
|---|---|
| `main` | upstream tükre |
| `feat/add-hungarian-translations` | **csak** `hu.po` + `lingui.config.js` → PR-be ez megy |
| `hmdia-work` | minden más: translate-tools/, patches/, kísérletek |

## Projekt célja

A Vendure e-commerce React Dashboard (`../packages/dashboard`) angol szövegeinek
lefordítása magyarra, az official Vendure i18n workflow alapján, közösségi PR hozzájárulásként.

## Technológiai kontextus

- **i18n lib:** LinguiJS (`@lingui/react`)
- **Fordítható fájl:** `../packages/dashboard/src/i18n/locales/en.po` (forrás)
- **Cél fájl:** `../packages/dashboard/src/i18n/locales/hu.po` (létrehozandó)
- **Locale regisztráció:** `../packages/dashboard/lingui.config.js`
- **Official workflow doc:** `../packages/dashboard/scripts/translate/README.md`

## Fordítási workflow (translate-tools/ könyvtárból futtatva)

```bash
# 1. Locale regisztrálása (egyszer):
#    ../packages/dashboard/lingui.config.js → locales: [..., 'hu']

# 2. Hiányzó stringek kinyerése:
cd ../packages/dashboard && npm run i18n:extract
cd ../../translate-tools

# 3. Szótár generálása (egyszer, vagy ha változik az en.po):
npx tsx generate-glossary.ts

# 4. Fordítás:
npx tsx translate-vendure.ts

# 5. Fordítás alkalmazása:
cd ../packages/dashboard && npm run i18n:apply translations.txt

# 6. Vizuális ellenőrzés:
npm run dev
```

## Saját szkriptek

| Fájl | Mire való |
|---|---|
| `generate-glossary.ts` | Kinyeri az explicit Lingui ID-kat az `en.po`-ból, Claude API-val lefordítja, `glossary.ts`-t generál |
| `translate-vendure.ts` | A `../packages/dashboard/missing-translations.txt`-t fordítja; kimenete `../packages/dashboard/translations.txt` |
| `context-check.ts` | Adott terminus összes előfordulását listázza az en.po-ból, döntés-előkészítéshez |
| `glossary.ts` | **Auto-generált** – ne szerkeszd kézzel |

## Kritikus Lingui szabályok

### 1. Explicit ID-k
Az `orderState.PartiallyDelivered` stílusú ID-knél **csak a human-readable értéket**
kell fordítani, a namespace-prefixet sosem:
```
✅ "orderState.PartiallyDelivered" → "Részben teljesítve"
❌ "orderState.PartiallyDelivered" → "rendelésÁllapot.Részben teljesítve"
```

### 2. Placeholder-ek
Sosem szabad módosítani, de a mondatban a helyükön kell hagyni:
```
{0}, {1}, {count}, {entityName}, {formattedDiff}, {maxRefundable},
{collectionName}, {customerGroupName}, {facetName}, {name}, {title},
{buttonText}, {label}, {operator}, {viewName}, {columnId}, {taxRate},
{remaining}, {successCount}, {selectionLength}, {totalQuantity},
{duplicatorCode}, {strategy}, {failed}, {allErrors}, {message}
```

### 3. Soha ne fordítsd
`API`, `GraphQL`, `JSON`, `SKU`, `Vendure`, `slug`, `ID`, `URL`

## Kötelező terminológia (glossary)

| English | Magyar | Megjegyzés |
|---|---|---|
| order | megrendelés | |
| product | termék | |
| custom field | egyéni mező | |
| customer | vásárló | nem "ügyfél" |
| guest customer | vendég vásárló | |
| customer group | vásárlói csoport | |
| refund | visszatérítés | |
| cancellation | törlés | |
| shipping | szállítás | |
| shipping method | szállítási mód | |
| payment | fizetés | |
| payment method | fizetési mód | |
| channel | csatorna | |
| facet | tulajdonság | nem "szűrő" – adatmodell-szintű fogalom |
| facet value | tulajdonságérték | |
| variant / product variant | termékváltozat | |
| collection | gyűjtemény | nem "kategória" – architektúrális fogalom |
| stock / inventory | készlet | |
| stock on hand | aktuális készlet | |
| out of stock | nincs készleten | |
| filter | szűrő | csak UI-szintű szűrésre |
| zone | zóna | |
| seller | eladó | |
| fulfillment | teljesítés | |
| draft | piszkozat | |
| role | szerepkör | |
| permission | jogosultság | |
| asset | fájl | lehet kép, PDF, bármilyen feltöltött fájl |
| promotion | promóció | |
| price | ár | |
| administrator | rendszergazda | |
| coupon / coupon code | kupon / kuponkód | |
| surcharge | felár | |
| currency | pénznem | |
| tax rate | adókulcs | |
| tax category | adókategória | |
| discount | kedvezmény | |
| adjustment | módosítás | |
| bulk action | tömeges művelet | |
| catalog | katalógus | |
| global settings | általános beállítások | |

## Stílus

- **Formális** megszólítás: "Ön", nem "te"
- **Rövid** gombfeliratok – ha az angol 1-2 szó, a magyar is legyen az
- **Természetes** mondattan – kerüld a szó szerinti fordítást
- Az admin UI-t **rendszergazdák** használják, nem végfelhasználók

## Manuális review körei (fordítás után)

1. **Terminológia** – a glossary szavai mindenhol konzisztensek-e?
2. **Mondattan** – természetesen hangzik-e magyarul?
3. **UI-kontextus** – `npm run dev` után vizuálisan: nem vágja-e le a szöveget?

## en.po statisztika (2025-02-25)

```
Összes bejegyzés:          1138
Explicit Lingui ID-k:       146  (navigáció, státuszok, hibák)
Normál szövegek:            992
Placeholder-t tartalmazó:    94
```

## Git – gyors referencia

A részletes leírás: `GIT_WORKFLOW.md`

```bash
# PR branch frissítése (csak a fordítással kapcsolatos fájlok):
git checkout feat/add-hungarian-translations
git checkout hmdia-work -- ../packages/dashboard/src/i18n/locales/hu.po
git checkout hmdia-work -- ../packages/dashboard/lingui.config.js
git push origin feat/add-hungarian-translations

# Ellenőrzés PR előtt:
git diff main --name-only
# → csak hu.po és lingui.config.js szerepelhet
```