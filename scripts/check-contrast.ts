/**
 * Enforces the contrast rule from the design brief.
 *
 * Gold on a dark ground is safe; the SAME gold on a light ground fails badly
 * (2.19:1). That is the one trap in this palette, so it gets a test rather than
 * a comment. Colours are read straight out of _tokens.scss, so drifting a token
 * without re-checking its pairs fails the build.
 *
 *   npm run check:contrast
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS = path.join(ROOT, 'apps/web/src/styles/_tokens.scss');

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

function ratio(a: string, b: string): number {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

interface Check {
  label: string;
  fg: string;
  bg: string;
  /** 4.5 = AA body text, 3 = AA large text / UI. */
  min: number;
  /** Some pairs are asserted to FAIL — that is the whole point of the rule. */
  expectFail?: boolean;
}

const CHECKS: Check[] = [
  // ── Dark mode (the default) ───────────────────────────────────────────────
  { label: 'gold text on obsidian', fg: 'gold', bg: 'obsidian', min: 4.5 },
  { label: 'gold text on onyx card', fg: 'gold', bg: 'onyx', min: 4.5 },
  { label: 'gold text on marble band', fg: 'gold', bg: 'marble', min: 4.5 },
  { label: 'body text on obsidian', fg: 'text-on-dark', bg: 'obsidian', min: 4.5 },
  { label: 'dim text on obsidian', fg: 'text-on-dark-dim', bg: 'obsidian', min: 4.5 },
  { label: 'dim text on onyx card', fg: 'text-on-dark-dim', bg: 'onyx', min: 4.5 },

  // ── The trap: this pair MUST fail, which is why light mode remaps to gold-deep
  {
    label: 'gold text on porcelain (must fail)',
    fg: 'gold',
    bg: 'porcelain',
    min: 4.5,
    expectFail: true,
  },

  // ── Light mode ────────────────────────────────────────────────────────────
  { label: 'gold-deep text on porcelain', fg: 'gold-deep', bg: 'porcelain', min: 4.5 },
  { label: 'gold-deep text on alabaster', fg: 'gold-deep', bg: 'alabaster', min: 4.5 },
  { label: 'body text on porcelain', fg: 'text-on-light', bg: 'porcelain', min: 4.5 },
  { label: 'dim text on porcelain', fg: 'text-on-light-dim', bg: 'porcelain', min: 4.5 },
  { label: 'dim text on alabaster', fg: 'text-on-light-dim', bg: 'alabaster', min: 4.5 },
];

async function main(): Promise<void> {
  const css = await readFile(TOKENS, 'utf8');
  const tokens = new Map<string, string>();
  for (const [, name, hex] of css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    if (name && hex) tokens.set(name, hex);
  }

  let failures = 0;
  console.log(`\n  Contrast audit — ${tokens.size} colour tokens read from _tokens.scss\n`);

  for (const check of CHECKS) {
    const fg = tokens.get(check.fg);
    const bg = tokens.get(check.bg);
    if (!fg || !bg) {
      console.error(`  ✖ ${check.label}: token --${!fg ? check.fg : check.bg} not found`);
      failures += 1;
      continue;
    }

    const r = ratio(fg, bg);
    const passes = r >= check.min;
    const ok = check.expectFail ? !passes : passes;
    if (!ok) failures += 1;

    const verdict = check.expectFail
      ? passes
        ? 'UNEXPECTEDLY PASSES — the light-mode remap may no longer be needed'
        : 'correctly fails'
      : passes
        ? 'ok'
        : `BELOW ${check.min}:1`;

    console.log(
      `  ${ok ? '✔' : '✖'} ${check.label.padEnd(38)} ${r.toFixed(2).padStart(5)}:1  ${verdict}`,
    );
  }

  if (failures > 0) {
    console.error(`\n  ${failures} contrast check(s) failed.\n`);
    process.exit(1);
  }
  console.log(`\n  All ${CHECKS.length} contrast checks passed.\n`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
