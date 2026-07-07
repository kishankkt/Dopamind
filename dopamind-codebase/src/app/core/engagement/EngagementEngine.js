/**
 * EngagementEngine.js — DopaMind XP + Level + Badge System
 * 
 * Computes XP for a completed game session and checks badge conditions.
 * Calls Supabase server-side `award_xp` function (atomic, no race conditions).
 * 
 * NEVER call supabase.from('profiles').update({ xp_total }) directly.
 * Always go through this engine.
 */

import { supabase } from '@/supabaseClient';

// ─────────────────────────────────────────────────────────────────
// XP Formula
// ─────────────────────────────────────────────────────────────────

const XP_BASE        = 10;
const XP_FIRST_TODAY = 15;
const XP_MAX_ACCURACY_BONUS = 20;
const XP_MAX_STREAK_BONUS   = 30;

/**
 * Compute XP earned for a single game session.
 * @param {object} stats - { score, attempts, accuracy_percent, avg_speed_seconds, level_reached, duration_seconds, streak_in_game, perfect_rounds }
 * @param {number} streakDays - current user streak in days
 * @param {boolean} isFirstGameToday - first game played today?
 * @returns {number} xp earned
 */
export function computeXP(stats, streakDays = 0, isFirstGameToday = false) {
  let xp = XP_BASE;

  // Accuracy bonus: 0-20 XP for 0-100% accuracy
  const accuracyBonus = Math.floor((stats.accuracy_percent || 0) / 10) * 2;
  xp += Math.min(accuracyBonus, XP_MAX_ACCURACY_BONUS);

  // Speed bonus: faster = more XP (0-10 XP)
  const speed = parseFloat(stats.avg_speed_seconds) || 1;
  const speedBonus = Math.max(0, 10 - Math.floor(speed * 2));
  xp += speedBonus;

  // Streak bonus: 1 XP per streak day, max 30
  const streakBonus = Math.min(streakDays, XP_MAX_STREAK_BONUS);
  xp += streakBonus;

  // First game of day bonus
  if (isFirstGameToday) xp += XP_FIRST_TODAY;

  return xp;
}

// ─────────────────────────────────────────────────────────────────
// Level Config (must match server-side get_level_for_xp function)
// ─────────────────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1,  minXP: 0,      title: 'Seed',           color: '#94a3b8' },
  { level: 2,  minXP: 150,    title: 'Sprout',          color: '#86efac' },
  { level: 3,  minXP: 400,    title: 'Sapling',         color: '#4ade80' },
  { level: 4,  minXP: 800,    title: 'Branch',          color: '#22c55e' },
  { level: 5,  minXP: 1500,   title: 'Tree',            color: '#16a34a' },
  { level: 6,  minXP: 2500,   title: 'Ancient Grove',   color: '#15803d' },
  { level: 7,  minXP: 4000,   title: 'Mindful Master',  color: '#eab308' },
  { level: 8,  minXP: 6000,   title: 'Cognitive Sage',  color: '#f59e0b' },
  { level: 9,  minXP: 9000,   title: 'Neural Architect',color: '#e879f9' },
  { level: 10, minXP: 15000,  title: 'DopaMind Elite',  color: '#38bdf8' },
];

export function getLevelForXP(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(currentLevel) {
  return LEVELS.find(l => l.level === currentLevel + 1) || null;
}

export function getXPProgress(xpTotal) {
  const current = getLevelForXP(xpTotal);
  const next = getNextLevel(current.level);
  if (!next) return { current, next: null, percent: 100, xpInLevel: 0, xpNeeded: 0 };
  const xpInLevel = xpTotal - current.minXP;
  const xpNeeded  = next.minXP - current.minXP;
  const percent   = Math.round((xpInLevel / xpNeeded) * 100);
  return { current, next, percent, xpInLevel, xpNeeded };
}

// ─────────────────────────────────────────────────────────────────
// Badge Definitions
// ─────────────────────────────────────────────────────────────────

export const BADGES = [
  { id: 'first_seed',    name: 'First Seed',      icon: '🌱', xp: 25,  check: (s, p) => p.total_games_played >= 1 },
  { id: 'on_fire',       name: 'On Fire',          icon: '🔥', xp: 50,  check: (s, p) => p.streak_count >= 7 },
  { id: 'speed_demon',   name: 'Speed Demon',      icon: '⚡', xp: 30,  check: (s, p) => parseFloat(s.avg_speed_seconds) < 0.4 },
  { id: 'sharpshooter',  name: 'Sharpshooter',     icon: '🎯', xp: 40,  check: (s, p) => s.accuracy_percent >= 100 },
  { id: 'centurion',     name: 'Centurion',         icon: '💎', xp: 100, check: (s, p) => p.total_games_played >= 100 },
  { id: 'deep_roots',    name: 'Deep Roots',        icon: '🌳', xp: 200, check: (s, p) => p.streak_count >= 30 },
  { id: 'gym_rat',       name: 'Gym Rat',           icon: '🏆', xp: 500, check: (s, p) => p.total_games_played >= 500 },
];

// ─────────────────────────────────────────────────────────────────
// Main Engine Function
// ─────────────────────────────────────────────────────────────────

/**
 * Process a completed game session:
 *   1. Compute XP
 *   2. Call server-side award_xp (atomic: ledger + profile + level-up)
 *   3. Check + award new badges
 *   4. Trigger weekly snapshot computation
 *   5. Return { xpEarned, newLevel, leveledUp, newBadges }
 * 
 * @param {string} gameId
 * @param {object} stats - full stats from game onComplete
 * @param {object} profile - current profile data { streak_count, total_games_played, xp_total, level }
 * @param {string} userId
 * @param {string|null} historyRowId - UUID of the game_history row just inserted
 * @param {boolean} isFirstGameToday
 */
export async function processGameCompletion(gameId, stats, profile, userId, historyRowId, isFirstGameToday) {
  const xpEarned = computeXP(stats, profile.streak_count || 0, isFirstGameToday);

  let newXP = profile.xp_total || 0;
  let newLevel = profile.level || 1;
  let leveledUp = false;

  // Call server-side atomic award_xp function
  try {
    const { data, error } = await supabase.rpc('award_xp', {
      p_user_id: userId,
      p_amount: xpEarned,
      p_reason: 'game_complete',
      p_source_game_id: gameId,
      p_source_history_id: historyRowId || null,
    });
    if (!error && data?.[0]) {
      newXP     = data[0].new_xp;
      newLevel  = data[0].new_level;
      leveledUp = data[0].leveled_up;
    }
  } catch (e) {
    console.warn('[EngagementEngine] award_xp failed:', e);
  }

  // Check badges (only if user profile has some games played)
  const updatedProfile = { ...profile, xp_total: newXP, level: newLevel, total_games_played: (profile.total_games_played || 0) + 1 };
  const newBadges = await checkAndAwardBadges(stats, updatedProfile, userId);

  // Trigger weekly snapshot (fire-and-forget)
  supabase.rpc('compute_weekly_snapshot', { p_user_id: userId, p_game_id: gameId }).catch(() => {});

  return { xpEarned, newXP, newLevel, leveledUp, newBadges };
}

// ─────────────────────────────────────────────────────────────────
// Badge Checking
// ─────────────────────────────────────────────────────────────────

async function checkAndAwardBadges(stats, profile, userId) {
  const newBadges = [];

  // Fetch already-earned badge IDs
  const { data: earned } = await supabase
    .from('achievements')
    .select('badge_id')
    .eq('user_id', userId);
  const earnedIds = new Set((earned || []).map(e => e.badge_id));

  for (const badge of BADGES) {
    if (earnedIds.has(badge.id)) continue;
    if (!badge.check(stats, profile)) continue;

    // Award badge
    try {
      await supabase.from('achievements').insert({
        user_id:     userId,
        badge_id:    badge.id,
        badge_name:  badge.name,
        badge_icon:  badge.icon,
        xp_rewarded: badge.xp,
      });

      // Award badge XP via server function
      await supabase.rpc('award_xp', {
        p_user_id: userId,
        p_amount: badge.xp,
        p_reason: 'badge_earned',
        p_source_game_id: null,
        p_source_history_id: null,
      });

      newBadges.push(badge);
    } catch (e) {
      console.warn(`[EngagementEngine] Failed to award badge ${badge.id}:`, e);
    }
  }

  return newBadges;
}
