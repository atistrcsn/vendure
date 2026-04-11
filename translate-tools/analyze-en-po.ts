// analyze-en-po.ts
// Futtatás: npx tsx analyze-en-po.ts
/* eslint-disable no-console */
import * as fs from 'fs';


interface PoEntry {
    msgid: string;
    msgstr: string;
    isExplicitId: boolean;
    placeholders: string[];
}

function parsePo(content: string): PoEntry[] {
    const result: PoEntry[] = [];
    const blocks = content.split('\n\n');

    for (const block of blocks) {
        const lines = block.split('\n');
        let msgid = '';
        let msgstr = '';
        let isExplicitId = false;

        for (const line of lines) {
            if (line.includes('js-lingui-explicit-id')) isExplicitId = true;
            if (line.startsWith('msgid "') && line !== 'msgid ""') {
                msgid = line.replace(/^msgid "/, '').replace(/"$/, '');
            }
            if (line.startsWith('msgstr "')) {
                msgstr = line.replace(/^msgstr "/, '').replace(/"$/, '');
            }
        }

        if (msgid) {
            // Placeholder-ek kinyerése
            const placeholders = [...msgid.matchAll(/\{[\w.]+\}/g)].map(m => m[0]);
            result.push({ msgid, msgstr, isExplicitId, placeholders });
        }
    }
    return result;
}

function analyzeVocabulary(poEntries: PoEntry[]) {
    // Szófrekvencia számolás (csak a nem-explicit-ID bejegyzésekből)
    const wordFreq: Record<string, number> = {};
    const vendureTerms = [
        'collection',
        'facet',
        'variant',
        'asset',
        'fulfillment',
        'channel',
        'promotion',
        'surcharge',
        'customer',
        'order',
        'product',
        'inventory',
        'stock',
        'refund',
        'cancellation',
        'administrator',
        'permission',
        'role',
        'zone',
        'tax',
        'shipping',
        'payment',
        'coupon',
        'draft',
        'seller',
        'catalog',
        'filter',
        'sort',
        'bulk',
        'custom field',
        'price',
        'currency',
        'discount',
        'adjustment',
    ];

    for (const entry of poEntries) {
        if (entry.isExplicitId) continue;
        const words = entry.msgid.toLowerCase().split(/\s+/);
        for (const word of words) {
            const clean = word.replace(/[^a-z]/g, '');
            if (clean.length > 3) wordFreq[clean] = (wordFreq[clean] || 0) + 1;
        }
    }

    // Top vendure-specifikus szavak
    console.log('\n=== VENDURE DOMAIN TERMS FREQUENCY ===');
    for (const term of vendureTerms) {
        const count = Object.entries(wordFreq)
            .filter(([w]) => w.includes(term.split(' ')[0]))
            .reduce((sum, [, c]) => sum + c, 0);
        if (count > 0) console.log(`  ${term}: ${count}x`);
    }

    // Explicit ID-k listája (ezeknek különleges kezelés kell)
    const explicitIds = poEntries.filter(e => e.isExplicitId);
    console.log(`\n=== EXPLICIT LINGUI IDs (${explicitIds.length} db) ===`);
    explicitIds.slice(0, 20).forEach(e => console.log(`  ${e.msgid}`));

    // Placeholder típusok
    const allPlaceholders = new Set(poEntries.flatMap(e => e.placeholders));
    console.log(`\n=== PLACEHOLDER TÍPUSOK ===`);
    allPlaceholders.forEach(p => console.log(`  ${p}`));

    // Összefoglaló
    console.log(`\n=== ÖSSZEFOGLALÓ ===`);
    console.log(`Összes bejegyzés: ${poEntries.length}`);
    console.log(`Explicit ID-k: ${explicitIds.length}`);
    console.log(`Normál szövegek: ${poEntries.length - explicitIds.length}`);
    console.log(`Placeholder-t tartalmazók: ${poEntries.filter(e => e.placeholders.length > 0).length}`);
}

const poContent = fs.readFileSync('./packages/dashboard/src/i18n/locales/en.po', 'utf-8');
const entries = parsePo(poContent);
analyzeVocabulary(entries);
