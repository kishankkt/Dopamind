/**
 * AdaptiveEngine.js — DopaMind Adaptive Difficulty System
 *
 * Pure algorithmic module — no side effects, no DB calls.
 * Called by gameEngine.js after every game completion.
 *
 * Algorithm:
 *   - Look at last 1-3 plays for this game
 *   - If avg accuracy ≥ 85% across ≥2 plays → level UP
 *   - If any single play accuracy ≤ 55%        → level DOWN
 *   - Otherwise                                 → HOLD
 *   - Level is always clamped 1–10
 */

const THRESHOLDS = {
  upAccuracy:    85,   // % — must average this or higher to advance
  downAccuracy:  55,   // % — single play at or below this → step back
  upMinPlays:    2,    // need at least 2 plays before leveling up
  max:           10,
  min:           1,
};

/**
 * computeNextLevel
 * @param {number}   currentLevel   - current 1-10 level for this user+game
 * @param {Array}    recentPlays    - last 3 play objects [{accuracy_percent, score, duration_seconds}]
 * @returns {{ nextLevel: number, direction: 'up'|'hold'|'down', reason: string }}
 */
export function computeNextLevel(currentLevel, recentPlays = []) {
  if (!recentPlays.length) {
    return { nextLevel: currentLevel, direction: 'hold', reason: 'No play history' };
  }

  const validAcc = recentPlays.filter(p => p.accuracy_percent != null);
  if (!validAcc.length) {
    // Game doesn't track accuracy (e.g. pure-speed games) — use score trend instead
    return computeByScore(currentLevel, recentPlays);
  }

  const avgAcc = validAcc.reduce((s, p) => s + p.accuracy_percent, 0) / validAcc.length;
  const lastAcc = validAcc[0]?.accuracy_percent ?? avgAcc;

  // Hard floor — any play below 55% → immediately step back
  if (lastAcc <= THRESHOLDS.downAccuracy && currentLevel > THRESHOLDS.min) {
    return {
      nextLevel: currentLevel - 1,
      direction: 'down',
      reason: `${Math.round(lastAcc)}% last play → easing back`,
    };
  }

  // Advance — need ≥2 plays all averaging ≥85%
  if (
    recentPlays.length >= THRESHOLDS.upMinPlays &&
    avgAcc >= THRESHOLDS.upAccuracy &&
    currentLevel < THRESHOLDS.max
  ) {
    return {
      nextLevel: currentLevel + 1,
      direction: 'up',
      reason: `${Math.round(avgAcc)}% avg → advancing`,
    };
  }

  return {
    nextLevel: currentLevel,
    direction: 'hold',
    reason: `${Math.round(avgAcc)}% avg → holding`,
  };
}

/**
 * computeByScore — fallback for games with no accuracy (e.g. pure speed)
 * Uses score trend across last 3 plays.
 */
function computeByScore(currentLevel, recentPlays) {
  if (recentPlays.length < 2) return { nextLevel: currentLevel, direction: 'hold', reason: 'Insufficient data' };

  const scores = recentPlays.map(p => p.score || 0);
  const trend = scores[0] - scores[scores.length - 1]; // positive = improving

  if (trend > 0 && recentPlays.length >= 2 && currentLevel < THRESHOLDS.max) {
    return { nextLevel: currentLevel + 1, direction: 'up', reason: 'Score trending up' };
  }
  if (trend < -2 && currentLevel > THRESHOLDS.min) {
    return { nextLevel: currentLevel - 1, direction: 'down', reason: 'Score dropping' };
  }
  return { nextLevel: currentLevel, direction: 'hold', reason: 'Score stable' };
}

/**
 * getLevelLabel — human-readable level name
 */
export function getLevelLabel(level) {
  if (level <= 2)  return 'Beginner';
  if (level <= 4)  return 'Warm Up';
  if (level <= 6)  return 'Active';
  if (level <= 8)  return 'Sharp';
  if (level <= 9)  return 'Elite';
  return 'Master';
}

/**
 * getDifficultyValue — get the raw difficulty param for a given game level
 * @param {object} game        - game object from registry (must have levelConfig)
 * @param {number} level       - 1-10
 * @returns {any}              - value to pass as difficulty prop to game component
 */
export function getDifficultyValue(game, level) {
  if (!game?.levelConfig?.values?.length) return null;
  const idx = Math.min(Math.max(level - 1, 0), game.levelConfig.values.length - 1);
  return game.levelConfig.values[idx];
}

export default { computeNextLevel, getLevelLabel, getDifficultyValue };
