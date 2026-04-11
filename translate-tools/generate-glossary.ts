#!/usr/bin/env npx tsx
/* eslint-disable no-console */
/**
 * generate-glossary.ts
 *
 * Kinyeri az összes explicit Lingui ID-t az en.po fájlból,
 * lefordítja Claude API-val, és glossary.ts fájlt generál,
 * amit a translate-vendure.ts importálhat.
 *
 * Használat:
 *   npx tsx generate-glossary.ts [en.po útvonala] [kimeneti fájl]
 *
 * Alapértelmezett (translate-tools/ könyvtárból futtatva):
 *   npx tsx generate-glossary.ts \
 *     ../packages/dashboard/src/i18n/locales/en.po \
 *     ./glossary.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

const client = new Anthropic();

// ── Típusok ────────────────────────────────────────────────────────────────

interface ExplicitEntry {
  /** Az explicit Lingui ID, pl. "orderState.PartiallyDelivered" */
  id: string;
  /** Az angol szöveg (msgstr az en.po-ban, ami egyenlő a human-readable résszel) */
  englishValue: string;
  /** A namespace prefix, pl. "orderState" (ha van) */
  namespace: string | null;
  /** A lefordítandó rész, pl. "PartiallyDelivered" vagy a teljes szöveg */
  humanReadable: string;
}

interface GlossaryEntry {
  id: string;
  english: string;
  hungarian: string;
  namespace: string | null;
}

// ── PO fájl parse-olása ────────────────────────────────────────────────────

function parseExplicitIds(poContent: string): ExplicitEntry[] {
  const entries: ExplicitEntry[] = [];
  const blocks = poContent.split(/\n(?=\s*\n)/).flatMap(b => b.split("\n\n"));

  for (const block of blocks) {
    if (!block.includes("js-lingui-explicit-id")) continue;

    const lines = block.split("\n");
    let msgid = "";
    let msgstr = "";

    for (const line of lines) {
      if (line.startsWith('msgid "') && line !== 'msgid ""') {
        msgid = line.replace(/^msgid "/, "").replace(/"$/, "");
      }
      if (line.startsWith('msgstr "')) {
        msgstr = line.replace(/^msgstr "/, "").replace(/"$/, "");
      }
      // Többsoros msgstr összefűzése
      if (line.startsWith('"') && msgstr !== "") {
        msgstr += line.replace(/^"/, "").replace(/"$/, "");
      }
    }

    if (!msgid) continue;

    // Namespace detektálása: "orderState.PartiallyDelivered" → namespace="orderState"
    const dotIndex = msgid.indexOf(".");
    const namespace = dotIndex > -1 ? msgid.substring(0, dotIndex) : null;

    // A lefordítandó human-readable rész:
    // - ha van namespace: a pont utáni rész (pl. "PartiallyDelivered")
    // - ha nincs namespace: maga a teljes msgid (pl. "Insights", "Catalog")
    // - ha van msgstr (az en.po-ban néha kitöltött): azt használjuk
    const humanReadable =
      msgstr ||
      (namespace ? msgid.substring(dotIndex + 1) : msgid);

    entries.push({
      id: msgid,
      englishValue: humanReadable,
      namespace,
      humanReadable,
    });
  }

  return entries;
}

// ── Claude API hívás ───────────────────────────────────────────────────────

const TRANSLATION_SYSTEM_PROMPT = `You are a professional Hungarian software localization engineer.
You are translating explicit Lingui IDs from a Vendure e-commerce admin dashboard.

CONTEXT: These are navigation items, status labels, error messages, and UI section titles
in an e-commerce back-office system used by shop administrators.

STRICT RULES:
1. Translate ONLY the human-readable part — the namespace prefix (before the dot) stays untouched in the ID
2. Use formal Hungarian ("Ön"-style tone)
3. Keep e-commerce domain context:
   - order = megrendelés
   - customer = vásárló
   - product = termék
   - variant = termékváltozat
   - collection = gyűjtemény
   - facet = tulajdonság
   - fulfillment = teljesítés
   - channel = csatorna
   - shipping = szállítás
   - payment = fizetés
   - refund = visszatérítés
   - draft = piszkozat
   - zone = zóna
   - role = szerepkör
   - asset = média
4. State/status labels should be concise (1-3 words max)
5. Error messages should be clear and professional
6. Navigation labels should be short and familiar from Hungarian webshop admin interfaces
7. Do NOT translate: API, GraphQL, JSON, SKU, Vendure, ID, URL, slug

Return ONLY a JSON array, no markdown, no explanation:
[
  { "id": "original.Id", "hungarian": "Magyar fordítás" },
  ...
]`;

async function translateBatch(
  entries: ExplicitEntry[],
  batchIndex: number,
  totalBatches: number
): Promise<Array<{ id: string; hungarian: string }>> {
  console.log(`  🔄 Batch ${batchIndex + 1}/${totalBatches} (${entries.length} bejegyzés)...`);

  const input = entries.map(e => ({
    id: e.id,
    english: e.humanReadable,
    namespace: e.namespace,
    hint: e.namespace
      ? `This is a "${e.namespace}" status/type label`
      : "This is a UI navigation or section label",
  }));

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: TRANSLATION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Translate these ${entries.length} Vendure dashboard explicit IDs to Hungarian:\n\n${JSON.stringify(input, null, 2)}`,
      },
    ],
  });

  const text = response.content[0];
  if (text.type !== "text") throw new Error("Váratlan API válasz típus");

  // JSON tisztítása (néha backtick blokkba csomagolja)
  const clean = text.text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(clean);
}

// ── Glossary fájl generálása ───────────────────────────────────────────────

function generateGlossaryFile(entries: GlossaryEntry[]): string {
  const timestamp = new Date().toISOString();

  // Namespace-ek szerinti csoportosítás a jobb olvashatóságért
  const grouped = new Map<string, GlossaryEntry[]>();
  for (const entry of entries) {
    const key = entry.namespace ?? "__top_level__";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)?.push(entry);
  }

  const sections: string[] = [];

  // Top-level bejegyzések először (navigáció, section titleök)
  const topLevel = grouped.get("__top_level__") ?? [];
  if (topLevel.length > 0) {
    sections.push(
      `  // ── Navigáció és főcímek ─────────────────────────────────────────────`,
      ...topLevel.map(
        e =>
          `  "${e.id}": "${e.hungarian}", // ${e.english}`
      )
    );
  }

  // Namespace-enként
  for (const [ns, nsEntries] of grouped) {
    if (ns === "__top_level__") continue;
    sections.push(
      ``,
      `  // ── ${ns} ─────────────────────────────────────────────────────────────`,
      ...nsEntries.map(
        e =>
          `  "${e.id}": "${e.hungarian}", // ${e.english}`
      )
    );
  }

  return `/**
 * glossary.ts — Automatikusan generált Vendure Dashboard szótár
 * Generálva: ${timestamp}
 * Forrás: en.po explicit Lingui ID-k (${entries.length} bejegyzés)
 *
 * Ezt a fájlt a translate-vendure.ts importálja.
 * Újragenerálás: npx tsx generate-glossary.ts
 */

// ── Explicit Lingui ID fordítások ────────────────────────────────────────────
// Ezek az orderState.xxx, paymentState.xxx stb. ID-k fordításai.
// SZABÁLY: csak a human-readable értéket tartalmazza, a namespace-t NEM.
// pl. "orderState.PartiallyDelivered" → "Részben teljesítve"
export const EXPLICIT_ID_TRANSLATIONS: Record<string, string> = {
${sections.join("\n")}
};

// ── Domain szótár (általános terminusok) ─────────────────────────────────────
// Ezt használja a translate-vendure.ts a prompt-ban.
export const DOMAIN_GLOSSARY = \`
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
| asset                | fájl                      |
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
\`;
`;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const poFilePath = process.argv[2] ?? "../packages/dashboard/src/i18n/locales/en.po";
  const outputPath = process.argv[3] ?? "./glossary.ts";

  // 1. PO fájl beolvasása
  if (!fs.existsSync(poFilePath)) {
    console.error(`❌ PO fájl nem található: ${poFilePath}`);
    console.error(`   Ellenőrizd az útvonalat, vagy add meg paraméterként.`);
    process.exit(1);
  }

  console.log(`📖 PO fájl beolvasása: ${poFilePath}`);
  const poContent = fs.readFileSync(poFilePath, "utf-8");

  // 2. Explicit ID-k kinyerése
  const explicitEntries = parseExplicitIds(poContent);
  console.log(`🔍 ${explicitEntries.length} explicit Lingui ID találva`);

  if (explicitEntries.length === 0) {
    console.error("❌ Nem találtam explicit ID-ket. Ellenőrizd a PO fájlt.");
    process.exit(1);
  }

  // 3. Fordítás batch-ekben (30 egyszerre – explicit ID-k rövidek)
  const BATCH_SIZE = 30;
  const batches: ExplicitEntry[][] = [];
  for (let i = 0; i < explicitEntries.length; i += BATCH_SIZE) {
    batches.push(explicitEntries.slice(i, i + BATCH_SIZE));
  }

  console.log(`\n🤖 Claude fordítja a ${explicitEntries.length} bejegyzést ${batches.length} batch-ben...\n`);

  const allTranslations: Array<{ id: string; hungarian: string }> = [];
  for (let i = 0; i < batches.length; i++) {
    const batchResult = await translateBatch(batches[i], i, batches.length);
    allTranslations.push(...batchResult);
    if (i < batches.length - 1) {
      await new Promise(r => setTimeout(r, 800));
    }
  }

  // 4. Összepárosítás az eredeti adatokkal
  const translationMap = new Map(allTranslations.map(t => [t.id, t.hungarian]));
  const glossaryEntries: GlossaryEntry[] = explicitEntries.map(e => ({
    id: e.id,
    english: e.humanReadable,
    hungarian: translationMap.get(e.id) ?? `[TODO: ${e.humanReadable}]`,
    namespace: e.namespace,
  }));

  // 5. Hiányzó fordítások jelzése
  const missing = glossaryEntries.filter(e => e.hungarian.startsWith("[TODO:"));
  if (missing.length > 0) {
    console.warn(`\n⚠️  ${missing.length} fordítás hiányzik (TODO jelöléssel kerül be):`);
    missing.forEach(e => console.warn(`   - ${e.id}`));
  }

  // 6. Glossary fájl írása
  const glossaryContent = generateGlossaryFile(glossaryEntries);
  fs.writeFileSync(outputPath, glossaryContent, "utf-8");

  console.log(`\n✅ Glossary mentve: ${path.resolve(outputPath)}`);
  console.log(`   ${glossaryEntries.length} explicit ID + domain szótár`);
  console.log(`\n📋 Következő lépés:`);
  console.log(`   A translate-vendure.ts-ben importáld:`);
  console.log(`   import { EXPLICIT_ID_TRANSLATIONS, DOMAIN_GLOSSARY } from './glossary';`);
}

main().catch(err => {
  console.error("❌ Hiba:", err.message);
  process.exit(1);
});
