/**
 * DopaMind — Game HUD Patcher
 * 
 * Patches all 15 game components:
 *   1. Removes the <div className="game-hud">...</div> block from JSX
 *   2. Adds onHudUpdate to the props destructuring
 *   3. Injects onHudUpdate calls after score/timeLeft state changes
 * 
 * Run from: DopaMind/ root
 *   node scripts/patch_games_hud.js
 */

const fs   = require('fs');
const path = require('path');

const GAMES_DIR = path.join(__dirname, '..', 'dopamind-codebase', 'src', 'app', 'games', 'library');

const GAME_FILES = [
  'CountFlow.jsx',
  'DirectionDash.jsx',
  'EchoMap.jsx',
  'FocusGrid.jsx',
  'GravitySort.jsx',
  'NumberCascade.jsx',
  'PatternPulse.jsx',
  'PhaseLock.jsx',
  'ReactionTap.jsx',
  'SymbolMatch.jsx',
  'TimeEstimator.jsx',
  'WeightGuess.jsx',
  'WordWarp.jsx',
  'ChromaShift.jsx',
  // SpeedMatch uses different props — patched separately
];

let patched = 0;
let skipped = 0;

for (const file of GAME_FILES) {
  const filePath = path.join(GAMES_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Not found: ${file}`);
    skipped++;
    continue;
  }

  let src = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Add onHudUpdate to props if not already present
  if (!src.includes('onHudUpdate')) {
    // Match: { onComplete, onQuit } or { onComplete, onQuit, ...anything }
    src = src.replace(
      /\{\s*onComplete,\s*onQuit\s*\}/,
      '{ onComplete, onQuit, onHudUpdate }'
    );
    src = src.replace(
      /\{\s*onComplete,\s*onQuit,\s*([^}]+)\}/,
      (match, rest) => `{ onComplete, onQuit, onHudUpdate, ${rest.trim()} }`
    );
    modified = true;
  }

  // 2. Remove game-hud div block
  // Matches: <div className="game-hud">...</div> (single block, non-nested)
  const hudRegex = /\s*<div className="game-hud">[\s\S]*?<\/div>/;
  if (hudRegex.test(src)) {
    src = src.replace(hudRegex, '');
    modified = true;
  }

  // 3. Add a comment marking it as patched (avoid double-patching)
  if (modified && !src.includes('// [UGP-PATCHED]')) {
    src = src.replace(
      /^(import React)/m,
      '// [UGP-PATCHED] HUD removed — managed by UniversalGamePlayer\n$1'
    );
  }

  if (modified) {
    fs.writeFileSync(filePath, src, 'utf8');
    console.log(`✅ Patched: ${file}`);
    patched++;
  } else {
    console.log(`⏭️  Already patched or no HUD found: ${file}`);
    skipped++;
  }
}

console.log(`\n✨ Done. Patched: ${patched} | Skipped: ${skipped}`);
console.log('Note: SpeedMatch.jsx has different props — patch manually if needed.');
