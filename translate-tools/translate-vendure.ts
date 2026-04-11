#!/usr/bin/env npx tsx
/* eslint-disable no-console */
/**
 * translate-vendure.ts
 *
 * Lefordítja a Vendure Dashboard missing-translations.txt fájlját magyarra.
 * A glossary.ts-t előbb generáld le:  npx tsx generate-glossary.ts
 *
 * Teljes workflow (translate-tools/ könyvtárból futtatva):
 *   1. cd ../packages/dashboard && npm run i18n:extract && cd ../../translate-tools
 *   2. npx tsx generate-glossary.ts   → glossary.ts  (első alkalommal, vagy frissítéskor)
 *   3. npx tsx translate-vendure.ts   → ../packages/dashboard/translations.txt
 *   4. cd ../packages/dashboard && npm run i18n:apply translations.txt
 *   5. npm run dev  → ellenőrzés a dashboardban
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

// A generate-glossary.ts által létrehozott fájl
// Ha még nem létezik, futtasd: npx tsx generate-glossary.ts
import { DOMAIN_GLOSSARY, EXPLICIT_ID_TRANSLATIONS } from "./glossary";

const client = new Anthropic();

// ── Prompt összeállítása ───────────────────────────────────────────────────

function buildSystemPrompt(): string {
  const explicitIdSection = Object.entries(EXPLICIT_ID_TRANSLATIONS)
    .slice(0, 50)
    .map(([id, hu]) => `  "${id}" → "${hu}"`)
    .join("\n");

  return `You are a professional Hungarian software localization engineer specializing in e-commerce admin interfaces.

You are translating a Vendure e-commerce React Dashboard from English to Hungarian.

== INPUT FORMAT ==
A list of English UI strings, one per line.

== OUTPUT FORMAT ==
Return ONLY pipe-separated pairs, one per line, in the same order as input:
  original_english_text|hungarian_translation

No headers, no explanations, no markdown, no extra blank lines.

== STRICT RULES ==
1. Keep these UNTRANSLATED: API, GraphQL, JSON, SKU, Vendure, slug, ID, URL
2. NEVER modify placeholders — keep them in position within the sentence:
   {0}, {1}, {2}, {maxRefundable}, {formattedDiff}, {entityName}, {entityType},
   {collectionName}, {customerGroupName}, {facetName}, {groupName}, {name},
   {count}, {buttonText}, {label}, {operator}, {title}, {viewName}, {columnId},
   {duplicatorCode}, {strategy}, {taxRate}, {remaining}, {successCount},
   {selectionLength}, {createCount}, {totalQuantity}, {leftOver},
   {successfulRefundCount}, {failed}, {allErrors}, {message}, {suggestedState},
   {newOptionInput}
3. For explicit Lingui IDs (namespace.Key format), the original is the KEY — keep it as-is on the left of the pipe:
   ✅ orderState.PartiallyDelivered|Részben teljesítve
   ❌ orderState.PartiallyDelivered|rendelésÁllapot.Részben teljesítve
4. Use formal Hungarian ("Ön" not "te")
5. Assume e-commerce admin back-office context throughout
6. Never use the pipe character | inside the translated text

== KNOWN EXPLICIT ID TRANSLATIONS (use these exactly) ==
${explicitIdSection}
  ... (and follow the same pattern for others)

== MANDATORY DOMAIN GLOSSARY ==
${DOMAIN_GLOSSARY}`;
}

// ── Chunk-olás ────────────────────────────────────────────────────────────

/**
 * A missing-translations.txt soronként egy msgid-t tartalmaz.
 * Ezeket 50-es csoportokban küldjük az API-nak.
 */
function splitIntoChunks(lines: string[], chunkSize = 50): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < lines.length; i += chunkSize) {
    chunks.push(lines.slice(i, i + chunkSize));
  }
  return chunks;
}

// ── Fordítás ──────────────────────────────────────────────────────────────

async function translateChunk(
  lines: string[],
  systemPrompt: string,
  chunkIndex: number,
  total: number,
): Promise<string[]> {
  const maxRetries = 5;
  const baseDelayMs = 10_000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    if (attempt === 1) {
      process.stdout.write(`  [${chunkIndex + 1}/${total}] fordítás (${lines.length} sor)...`);
    } else {
      process.stdout.write(`  [${chunkIndex + 1}/${total}] újrapróbálás (${attempt}/${maxRetries})...`);
    }

    let response;
    try {
      response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: "user", content: lines.join("\n") }],
      });
    } catch (err: any) {
      const isOverloaded =
        err?.status === 529 || err?.message?.includes("overloaded");
      if (isOverloaded && attempt < maxRetries) {
        const delayMs = baseDelayMs * attempt;
        process.stdout.write(` túlterhelt, várakozás ${delayMs / 1000}mp...\n`);
        await new Promise(r => setTimeout(r, delayMs));
        continue;
      }
      throw err;
    }

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Váratlan API válasz típus");

    if (response.stop_reason === "max_tokens") {
      throw new Error(
        `A chunk [${chunkIndex + 1}/${total}] csonkítva lett (max_tokens elérve). ` +
          `Csökkentsd a chunk méretet (jelenleg 50).`,
      );
    }

    const resultLines = content.text.split("\n").filter(l => l.trim().length > 0);
    process.stdout.write(` ✓\n`);
    return resultLines;
  }

  throw new Error(`A chunk [${chunkIndex + 1}/${total}] ${maxRetries} próbálkozás után is sikertelen.`);
}

// ── Validáció ─────────────────────────────────────────────────────────────

function validateChunk(inputLines: string[], outputLines: string[]): void {
  if (outputLines.length !== inputLines.length) {
    console.warn(
      `\n  ⚠️  Sor-eltérés: bemenet=${inputLines.length}, kimenet=${outputLines.length}`,
    );
  }

  for (const line of outputLines) {
    if (!line.includes("|")) {
      console.warn(`\n  ⚠️  Hiányzó pipe separator: "${line.substring(0, 60)}"`);
      continue;
    }
    const pipeIdx = line.indexOf("|");
    const original = line.substring(0, pipeIdx);
    const placeholders = [...original.matchAll(/\{[\w.]+\}/g)].map(m => m[0]);
    const translated = line.substring(pipeIdx + 1);
    const missing = placeholders.filter(p => !translated.includes(p));
    if (missing.length > 0) {
      console.warn(
        `\n  ⚠️  Elveszett placeholder(ek): ${missing.join(", ")} — "${line.substring(0, 80)}"`,
      );
    }
  }
}

// ── Progress mentés / betöltés ────────────────────────────────────────────

interface ProgressFile {
  langCode: string;
  msgids: string[];
  chunkSize: number;
  /** Kulcs: chunk index (string), érték: lefordított sorok */
  results: Record<string, string[]>;
}

function loadProgress(progressPath: string): ProgressFile | null {
  if (!fs.existsSync(progressPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(progressPath, "utf-8")) as ProgressFile;
  } catch {
    return null;
  }
}

function saveProgress(progressPath: string, data: ProgressFile): void {
  fs.writeFileSync(progressPath, JSON.stringify(data, null, 2), "utf-8");
}

// ── Statisztika ───────────────────────────────────────────────────────────

function printStats(
  inputFile: string,
  outputFile: string,
  chunkCount: number,
  entryCount: number,
): void {
  console.log(`
╔══════════════════════════════════════════════════╗
║  Vendure Dashboard – Magyar fordítás kész        ║
╠══════════════════════════════════════════════════╣
║  Bemenet:   ${path.basename(inputFile).padEnd(36)}║
║  Kimenet:   ${path.basename(outputFile).padEnd(36)}║
║  Batchek:   ${String(chunkCount).padEnd(36)}║
║  Bejegyzés: ${String(entryCount).padEnd(36)}║
╚══════════════════════════════════════════════════╝

📋 Következő lépések:
   cd ../packages/dashboard
   npm run i18n:apply translations.txt
   npm run dev
   → Ellenőrizd a dashboardot magyarul

🔁 Ha frissül az en.po:
   cd ../packages/dashboard && npm run i18n:extract
   cd ../../translate-tools && npx tsx translate-vendure.ts
  `);
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const inputFile = process.argv[2] ?? "../packages/dashboard/missing-translations.txt";
  const outputFile = process.argv[3] ?? "../packages/dashboard/translations.txt";
  const progressFile = outputFile.replace(/(\.[^.]+)?$/, ".progress.json");

  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Nem található: ${inputFile}`);
    console.error(`   Futtasd előbb: cd ../packages/dashboard && npm run i18n:extract`);
    process.exit(1);
  }

  const glossaryPath = path.join(__dirname, "glossary.ts");
  if (!fs.existsSync(glossaryPath)) {
    console.error(`❌ Hiányzik a glossary.ts`);
    console.error(`   Futtasd előbb: npx tsx generate-glossary.ts`);
    process.exit(1);
  }

  // ── Bemenet parsálása ──
  const content = fs.readFileSync(inputFile, "utf-8");
  const lines = content.split("\n");

  const missingIdx = lines.findIndex(l => l.trim() === "## Missing Translations:");
  if (missingIdx === -1) {
    console.error(`❌ Nem található '## Missing Translations:' sor a bemenetben`);
    process.exit(1);
  }

  let langCodeIdx = missingIdx + 1;
  while (langCodeIdx < lines.length && !lines[langCodeIdx].trim()) langCodeIdx++;
  const langCode = lines[langCodeIdx].trim();

  const msgids = lines
    .slice(langCodeIdx + 1)
    .map(l => l.trimEnd())
    .filter(l => l.trim() && l.trim() !== "---");

  const CHUNK_SIZE = 50;
  const chunks = splitIntoChunks(msgids, CHUNK_SIZE);

  // ── Progress betöltése ──
  const progress = loadProgress(progressFile);
  const isResume =
    progress !== null &&
    progress.langCode === langCode &&
    progress.msgids.length === msgids.length &&
    progress.chunkSize === CHUNK_SIZE;

  let state: ProgressFile;
  if (isResume) {
    state = progress;
    const done = Object.keys(state.results).length;
    console.log(`\n🔄 Folytatás korábbi mentésből (${done}/${chunks.length} batch kész)...`);
  } else {
    state = { langCode, msgids, chunkSize: CHUNK_SIZE, results: {} };
    console.log(`\n🚀 Vendure Dashboard fordítás indul...`);
  }

  console.log(`   Forrás:  ${inputFile}`);
  console.log(`   Szótár:  ${Object.keys(EXPLICIT_ID_TRANSLATIONS).length} explicit ID betöltve`);
  console.log(`   Nyelv:   ${langCode}`);
  console.log(`   Progress: ${progressFile}\n`);
  console.log(`📊 ${msgids.length} bejegyzés, ${chunks.length} batch\n`);

  const systemPrompt = buildSystemPrompt();

  for (let i = 0; i < chunks.length; i++) {
    // Már kész chunk kihagyása
    if (state.results[String(i)]) {
      console.log(`  [${i + 1}/${chunks.length}] kihagyva (már kész)`);
      continue;
    }

    const translated = await translateChunk(chunks[i], systemPrompt, i, chunks.length);
    validateChunk(chunks[i], translated);

    // Azonnal mentjük a részeredményt
    state.results[String(i)] = translated;
    saveProgress(progressFile, state);

    if (i < chunks.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // ── Összefűzés a helyes sorrendben ──
  const allTranslationLines: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    allTranslationLines.push(...state.results[String(i)]);
  }

  const output = `${langCode}\n${allTranslationLines.join("\n")}\n---\n`;
  fs.writeFileSync(outputFile, output, "utf-8");

  // Progress fájl törlése – fordítás sikeres
  fs.unlinkSync(progressFile);
  console.log(`   Progress fájl törölve: ${path.basename(progressFile)}`);

  printStats(inputFile, outputFile, chunks.length, msgids.length);
}

main().catch(err => {
  console.error("\n❌ Hiba a fordítás során:", err.message);
  if (err.message.includes("Cannot find module './glossary'")) {
    console.error("   Megoldás: npx tsx generate-glossary.ts");
  }
  process.exit(1);
});
