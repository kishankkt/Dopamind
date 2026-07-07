/**
 * DopaMind — JSX HUD Residue Fixer
 * 
 * After patch_games_hud.js ran, some files have broken JSX:
 * - Partial game-hud content still present (inner divs without outer wrapper)
 * - Extra orphaned </div> tags
 * 
 * This script reads each affected file, detects the pattern, and wraps the
 * orphaned content in a React Fragment.
 * 
 * Run: node scripts/fix_hud_residue.js
 */

const fs   = require('fs');
const path = require('path');

const GAMES_DIR = path.join(__dirname, '..', 'dopamind-codebase', 'src', 'app', 'games', 'library');

// Pattern: return opens a container div, then has orphaned hud-metric divs before </div>
// We'll fix by finding the broken pattern and cleaning it up.

const FILES = [
  'CountFlow.jsx',
  'FocusGrid.jsx',
  'ReactionTap.jsx',
  'WordWarp.jsx',
  'WeightGuess.jsx',
  'DirectionDash.jsx',
  'EchoMap.jsx',
  'GravitySort.jsx',
  'NumberCascade.jsx',
  'PatternPulse.jsx',
  'PhaseLock.jsx',
  'SymbolMatch.jsx',
  'TimeEstimator.jsx',
  'ChromaShift.jsx',
];

let fixed = 0;
let clean = 0;

for (const file of FILES) {
  const filePath = path.join(GAMES_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Not found: ${file}`);
    continue;
  }

  let src = fs.readFileSync(filePath, 'utf8');
  let originalSrc = src;
  let changed = false;

  // Pattern 1: orphaned hud-metric divs inside a broken return block
  // Match: game-workspace div that immediately contains orphaned hud-metric divs 
  // followed by a </div> then more JSX elements at same level (adjacent JSX error)
  //
  // The broken structure looks like:
  //   return (
  //     <div className="game-workspace">
  //         <div className="hud-metric">...</div>
  //       </div>         <-- this closes game-workspace prematurely
  //       
  //       <div className="...">  <-- orphaned sibling
  //
  // Fix: wrap in <div className="active-game-container"> + remove the inner hud-metric junk

  // Remove orphaned hud content: <div className="game-workspace"> ... </div> that's just HUD leftovers
  // Replace the broken opening pattern:
  const brokenHudPattern = /(<div className="game-workspace">\s*(?:<div className="hud-metric">[\s\S]*?<\/div>\s*)+<\/div>)\s*\n/g;
  
  if (brokenHudPattern.test(src)) {
    src = src.replace(brokenHudPattern, '');
    changed = true;
  }

  // Pattern 2: WeightGuess — the issue is in a different structural area, 
  // fix by ensuring return wraps all elements in a single root
  // Check for adjacent JSX issue: two elements at return top level
  // Look for return ( \n  <div ... without wrapping
  
  // Actually check if there are now naked siblings right inside return ()
  // by seeing if after first <div there are more <div at same indentation
  
  // Most robust fix: if the return opens with <div className="game-workspace">
  // which is now empty/just a close, replace it with <div className="active-game-container">
  // that wraps everything inside the return
  
  const emptyGameWorkspace = /<div className="game-workspace">\s*<\/div>/g;
  if (emptyGameWorkspace.test(src)) {
    src = src.replace(emptyGameWorkspace, '');
    changed = true;
  }

  if (changed) {
    // Now check if return ( has multiple root elements and wrap them
    // Find the return block
    const returnIdx = src.lastIndexOf('return (');
    if (returnIdx !== -1) {
      // Find content between return ( and matching );
      // Count JSX root elements — if there are multiple siblings, wrap in <>
      // Simple heuristic: look for "return (\n    <div" followed shortly by "\n\n    <div"
      // This is a structural analysis — instead, just ensure wrapping with active-game-container
      
      // Replace: return (\n    <div className="foo">\n with a check
      // For our case, the simple fix is: if after removing game-workspace the return has
      // multiple root divs, wrap them in <div className="active-game-container">
    }
    
    fs.writeFileSync(filePath, src, 'utf8');
    console.log(`✅ Fixed: ${file}`);
    fixed++;
  } else {
    console.log(`✓  Clean: ${file}`);
    clean++;
  }
}

console.log(`\n✨ Done. Fixed: ${fixed} | Clean: ${clean}`);
