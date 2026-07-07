/**
 * DopaMind — Final JSX Cleanup
 * Fixes two issues left by patch_games_hud.js:
 *   1. Duplicate onHudUpdate in props destructure
 *   2. Orphaned game-workspace / hud-metric JSX remnants
 * 
 * Run: node scripts/cleanup_hud_final.js
 */
const fs   = require('fs');
const path = require('path');

const GAMES_DIR = path.join(__dirname, '..', 'dopamind-codebase', 'src', 'app', 'games', 'library');
const FILES = fs.readdirSync(GAMES_DIR).filter(f => f.endsWith('.jsx'));

let fixed = 0;

for (const file of FILES) {
  const filePath = path.join(GAMES_DIR, file);
  let src = fs.readFileSync(filePath, 'utf8');
  const original = src;

  // ── Fix 1: Duplicate onHudUpdate in props ──────────────────
  // Pattern: ", onHudUpdate, onHudUpdate" or "onHudUpdate, onHudUpdate,"
  src = src.replace(/,\s*onHudUpdate,\s*onHudUpdate/g, ', onHudUpdate');
  src = src.replace(/onHudUpdate,\s*onHudUpdate,/g, 'onHudUpdate,');
  src = src.replace(/onHudUpdate\s*onHudUpdate/g, 'onHudUpdate');

  // ── Fix 2: Orphaned game-workspace HUD remnants ────────────
  // Pattern A: <div className="game-workspace">\n  <div className="hud-metric">...</div>\n  </div>
  // These are now either:
  //   (a) the opening of a return that still has the broken structure
  //   (b) a leftover block after the hud was stripped
  
  // Fix (a): return opens with game-workspace that only contains hud-metrics then closes,
  // followed by more sibling elements — replace with active-game-container
  src = src.replace(
    /return\s*\(\s*\n(\s*)<div className="game-workspace">([\s\S]*?)<\/div>\s*\n(\s*\n)?(\s*)<div/g,
    (match, indent1, hudContent, nl, indent2, rest) => {
      // Only replace if the content between game-workspace tags is just hud-metrics
      if (/className="hud-metric"/.test(hudContent) && !/<div className="(?!hud-metric)/.test(hudContent)) {
        return `return (\n${indent1}<div className="active-game-container">\n${indent2}<div`;
      }
      return match;
    }
  );

  // Fix (b): standalone game-workspace that just has hud-metrics (mid-JSX)
  src = src.replace(
    /<div className="game-workspace">\s*(?:<div className="hud-metric">[\s\S]*?<\/div>\s*)+<\/div>/g,
    ''
  );

  if (src !== original) {
    fs.writeFileSync(filePath, src, 'utf8');
    console.log(`✅ Fixed: ${file}`);
    fixed++;
  } else {
    console.log(`✓  Clean: ${file}`);
  }
}

console.log(`\n✨ Done. Fixed ${fixed} files.`);
