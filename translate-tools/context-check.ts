#!/usr/bin/env npx tsx
/**
 * context-check.ts
 *
 * Megmutatja egy adott terminus összes előfordulását az en.po-ban,
 * hogy fordítási döntéseket kontextus alapján lehessen meghozni.
 *
 * Használat (translate-tools/ könyvtárból):
 *   npx tsx context-check.ts collection
 *   npx tsx context-check.ts collection asset "custom field" facet
 */

import * as fs from "fs";

const EN_PO_PATH = "../packages/dashboard/src/i18n/locales/en.po";

interface PoEntry {
  msgid: string;
  isExplicitId: boolean;
}

function parsePo(content: string): PoEntry[] {
  const entries: PoEntry[] = [];
  const blocks = content.split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split("\n");
    let msgid = "";
    let isExplicitId = false;

    for (const line of lines) {
      if (line.includes("js-lingui-explicit-id")) isExplicitId = true;
      if (line.startsWith('msgid "') && line !== 'msgid ""') {
        msgid = line.replace(/^msgid "/, "").replace(/"$/, "");
      }
    }

    if (msgid) entries.push({ msgid, isExplicitId });
  }

  return entries;
}

function main() {
  const terms = process.argv.slice(2);

  if (terms.length === 0) {
    console.error("Használat: npx tsx context-check.ts <term1> [term2] ...");
    console.error("Példa:     npx tsx context-check.ts collection asset facet");
    process.exit(1);
  }

  if (!fs.existsSync(EN_PO_PATH)) {
    console.error(`❌ Nem található: ${EN_PO_PATH}`);
    console.error(`   Ellenőrizd, hogy a translate-tools/ könyvtárból futtatod.`);
    process.exit(1);
  }

  const poContent = fs.readFileSync(EN_PO_PATH, "utf-8");
  const entries = parsePo(poContent);

  for (const term of terms) {
    const matches = entries.filter(e =>
      e.msgid.toLowerCase().includes(term.toLowerCase())
    );

    console.log(`\n${"═".repeat(60)}`);
    console.log(`  "${term}"  –  ${matches.length} előfordulás`);
    console.log("═".repeat(60));

    if (matches.length === 0) {
      console.log("  (nincs találat)");
      continue;
    }

    // Explicit ID-k külön csoportban
    const explicitMatches = matches.filter(e => e.isExplicitId);
    const normalMatches = matches.filter(e => !e.isExplicitId);

    if (normalMatches.length > 0) {
      console.log(`\n  Normál szövegek (${normalMatches.length} db):`);
      normalMatches.forEach(e => console.log(`    "${e.msgid}"`));
    }

    if (explicitMatches.length > 0) {
      console.log(`\n  Explicit Lingui ID-k (${explicitMatches.length} db):`);
      explicitMatches.forEach(e => console.log(`    [EXPLICIT] "${e.msgid}"`));
    }
  }

  console.log();
}

main();
