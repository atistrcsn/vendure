# Git Workflow – Vendure Magyar Fordítás

## Repo-struktúra áttekintése

```
upstream (vendurehq/vendure)                ← az official Vendure repo
    │
    └── fork (atistrcsn/vendure)            ← a te fork-od
         ├── main                           ← szinkronban upstream/main-nel
         ├── feat/add-hungarian-translations ← PR branch (csak fordítás)
         └── hmdia-work                     ← ahol te dolgozol, minden belefér
```

---

## Ágak (branches) szerepe

| Branch | Mire való |
|---|---|
| `main` | upstream tükre, soha ne commitolj ide közvetlenül |
| `feat/add-hungarian-translations` | **csak** a fordítással kapcsolatos fájlok – ez megy PR-be |
| `hmdia-work` | napi munka: fordítói szkriptek, patches/, saját feature-ök, kísérletek |

### Mi kerülhet a PR branch-re (`feat/add-hungarian-translations`)

✅ `packages/dashboard/src/i18n/locales/hu.po`
✅ `packages/dashboard/lingui.config.js` (csak a `'hu'` locale hozzáadása)

❌ `translate-tools/` – a te privát eszközeid, upstream-et nem érdekli
❌ `patches/` – a saját projekted belügye
❌ bármilyen saját feature, bugfix, konfig

### Mi élhet szabadon a `hmdia-work` branch-en

✅ minden – a `hmdia-work` soha nem kerül upstream PR-be, a te privát játszótered

---

## Egyszeri beállítás

### Fork klónozása és upstream remote hozzáadása

```bash
git clone https://github.com/atistrcsn/vendure
cd vendure

# Upstream remote hozzáadása:
git remote add upstream https://github.com/vendurehq/vendure.git

# Ellenőrzés:
git remote -v
# origin    https://github.com/atistrcsn/vendure (fetch)
# origin    https://github.com/atistrcsn/vendure (push)
# upstream  https://github.com/vendurehq/vendure.git (fetch)
# upstream  https://github.com/vendurehq/vendure.git (push)
```

### Branches létrehozása

```bash
# PR branch:
git checkout main
git checkout -b feat/add-hungarian-translations
git push -u origin feat/add-hungarian-translations

# Napi munka branch:
git checkout main
git checkout -b hmdia-work
git push -u origin hmdia-work
```

### patches/ elrejtése (opcionális)

Ha a `hmdia-work` branch-en a `patches/` könyvtár is él, érdemes `.gitignore`-ba venni,
hogy ne kerüljön fel véletlenül az upstream PR-be:

```bash
git checkout hmdia-work
echo "/patches/" >> .gitignore
git add .gitignore
git commit -m "chore: ignore local patches directory"
```

---

## Napi workflow

### 1. Fordítás frissítése

```bash
git checkout hmdia-work
cd translate-tools

# Ha változott az en.po (upstream frissítés után):
npx tsx generate-glossary.ts   # csak ha változtak az explicit ID-k

# Hiányzó stringek fordítása:
cd ../packages/dashboard && npm run i18n:extract
cd ../../translate-tools && npx tsx translate-vendure.ts
cd ../packages/dashboard && npm run i18n:apply translations.txt
```

### 2. Commitolás a hmdia-work branch-re

```bash
git checkout hmdia-work
git add packages/dashboard/src/i18n/locales/hu.po
git add translate-tools/   # szkriptek, glossary.ts, stb. – minden belefér
git commit -m "feat(i18n): update Hungarian translations"
```

### 3. PR branch frissítése (csak a fordítással kapcsolatos fájlok)

```bash
git checkout feat/add-hungarian-translations

# Csak a fordítással kapcsolatos fájlokat hozod át hmdia-work-ről:
git checkout hmdia-work -- packages/dashboard/src/i18n/locales/hu.po
git checkout hmdia-work -- packages/dashboard/lingui.config.js

git commit -m "feat(i18n): update Hungarian translations"
git push origin feat/add-hungarian-translations
```

> **Ellenőrzés PR előtt** – csak ez a két fájl szerepeljen:
> ```bash
> git diff main --name-only
> # packages/dashboard/lingui.config.js
> # packages/dashboard/src/i18n/locales/hu.po
> ```

---

## Upstream szinkronizálás

### Ha az upstream előrement (rendszeresen futtasd, pl. hetente)

```bash
# 1. Friss változások letöltése:
git fetch upstream

# 2. Fork main szinkronizálása:
git checkout main
git merge upstream/main
git push origin main

# 3. hmdia-work rebase-elése:
git checkout hmdia-work
git rebase main
# Ha conflict: megoldod, majd:
# git add <fájl> && git rebase --continue

# 4. PR branch rebase-elése:
git checkout feat/add-hungarian-translations
git rebase main
git push origin feat/add-hungarian-translations --force-with-lease
```

> **Miért `--force-with-lease` és nem `--force`?**
> Csak akkor enged push-olni, ha senki más nem módosított a branch-en közben.
> Megakadályozza, hogy véletlenül felülírj egy maintainer-kommentet vagy módosítást.

### Ha conflict van a rebase során

```bash
git status                          # megnézed mi ütközik
# megoldod a fájlban, majd:
git add packages/dashboard/src/i18n/locales/hu.po
git rebase --continue

# Ha inkább megszakítanád:
git rebase --abort
```

---

## patch-package workflow (saját projekt)

### Egyszeri beállítás a saját projektben

```bash
# A saját projekted gyökerében (nem a fork):
npm install patch-package --save-dev

# package.json scripts-be:
# "postinstall": "patch-package"
```

### Patch generálása

```bash
# 1. Fork-ban build (hmdia-work branch-en):
cd vendure/packages/dashboard
npx lingui compile
npm run build

# 2. Lefordított fájl másolása a saját projekt node_modules-ába:
cp dist/i18n/hu.js SAJAT_PROJEKT/node_modules/@vendure/dashboard/dist/i18n/hu.js

# 3. Patch generálása a saját projektben:
cd SAJAT_PROJEKT
npx patch-package @vendure/dashboard

# 4. Commitolás a saját projekt repójába:
git add patches/
git commit -m "chore: add Hungarian translations patch for @vendure/dashboard"
```

### Ha frissítettél a fordításon

```bash
# Ugyanaz mint fent – a patch felülírja az előzőt:
npx patch-package @vendure/dashboard
git add patches/
git commit -m "chore: update Hungarian translations patch"
```

### Ha az upstream kiad egy új @vendure/dashboard verziót

```bash
npm install @vendure/dashboard@<uj_verzio>
# → postinstall automatikusan futtatja: patch-package
# → ha a patch tisztán alkalmazható: minden rendben
# → ha ütközés van: patch-package figyelmeztet, manuálisan kell frissíteni
```

### Ha az upstream merge-eli a fordítást

```bash
npm install @vendure/dashboard@<uj_verzio>

# Patch törlése – már nem kell:
git rm patches/@vendure+dashboard+*.patch
git commit -m "chore: remove hu translation patch, now in upstream"
```

---

## PR beadása az upstream-nek

```bash
# Ellenőrzés: csak a fordítással kapcsolatos fájlok vannak-e a branch-en:
git checkout feat/add-hungarian-translations
git diff main --name-only
# Elvárt kimenet:
# packages/dashboard/lingui.config.js
# packages/dashboard/src/i18n/locales/hu.po

# PR létrehozása (GitHub CLI):
gh pr create \
  --repo vendurehq/vendure \
  --head atistrcsn:feat/add-hungarian-translations \
  --title "feat(i18n): add Hungarian (hu) translations for dashboard" \
  --body "$(cat translate-tools/PR_DESCRIPTION.md)"
```

### PR leírásban érdemes megemlíteni

- Fordítási döntések indoklása (Collection → Gyűjtemény, Facet → Tulajdonság, stb.)
- Gépi fordítás (Claude API) + manuális review kombinációja
- Tesztelve: `npm run dev` alatt vizuálisan ellenőrizve
- Referencia: a japán fordítás PR-je mint előzmény

---

## Több nyitott PR kezelése egyszerre

Ha egyszerre több feature-t is beadtál upstream PR-ként és mindegyikre várod a merge-et:

### Integration branch létrehozása

```bash
git checkout main
git checkout -b my-integration

# Minden várakozó branch bemerge-lése:
git merge feat/add-hungarian-translations
git merge feat/custom-payment-ui
git merge feat/seller-dashboard-fix

git push origin my-integration
```

A saját projektedben (`package.json`):

```json
"@vendure/dashboard": "github:atistrcsn/vendure#my-integration"
```

### Ha az upstream merge-el egyet

```bash
# main szinkronizálása:
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# Integration branch újraépítése a friss main-ről:
git checkout my-integration
git rebase main
# (az már merge-elt branch kimarad automatikusan a rebase során)

git push origin my-integration --force-with-lease
```

---

## Gyorslista – mi van hol

| Fájl / könyvtár | Branch | Repo |
|---|---|---|
| `hu.po`, `lingui.config.js` | `feat/add-hungarian-translations` + `hmdia-work` | fork |
| `translate-tools/` (szkriptek, CLAUDE.md) | `hmdia-work` | fork |
| `patches/@vendure+dashboard+*.patch` | – | saját projekt repo |

---

## Hasznos parancsok

```bash
# Aktuális branch állapota:
git status

# Mi változott a main-hez képest a PR branch-en:
git diff main --name-only

# Upstream legújabb változásai (letöltés, de merge nélkül):
git fetch upstream && git log HEAD..upstream/main --oneline

# Összes branch vizuálisan:
git log --oneline --graph --all

# Egy fájl teljes history-ja:
git log --follow -p packages/dashboard/src/i18n/locales/hu.po

# Melyik branch-en van egy adott commit:
git branch --contains <commit-hash>
```