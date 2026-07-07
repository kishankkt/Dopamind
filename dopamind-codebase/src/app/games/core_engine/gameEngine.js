/**
 * gameEngine.js — DopaMind Game Session Logger
 * 
 * Called by AppShell after every game completion.
 * Handles: per-game table insert, global game_history insert,
 *          streak update, XP award (via EngagementEngine),
 *          session tracking notification.
 */

import { supabase } from '@/supabaseClient';
import { processGameCompletion } from '@/app/core/engagement/EngagementEngine';
import { getGame } from '@/app/games/core_engine/gameRegistry';
import SessionTracker from '@/app/core/engagement/SessionTracker';
import NotificationEngine from '@/app/core/engagement/NotificationEngine';
import ImprovementEngine from '@/app/core/engagement/ImprovementEngine';
import { computeNextLevel } from '@/app/core/engagement/AdaptiveEngine';

/**
 * Log a completed game session.
 * 
 * @param {string} gameId - Registry game ID e.g. 'speedmatch'
 * @param {object} stats  - { score, attempts, accuracy_percent, avg_speed_seconds,
 *                            level_reached, duration_seconds, streak_in_game, perfect_rounds }
 * @param {object} session - Supabase auth session
 * @param {object} profile - Current profile { streak_count, last_played_at, xp_total, level, total_games_played }
 * @param {function} onProfileUpdate - Callback: (updatedProfile, engagementResult) => void
 */
export async function logGameSession(gameId, stats, session, profile, onProfileUpdate) {
  if (!session?.user || session.user.isTrial) return;

  const userId  = session.user.id;
  const gameInfo = getGame(gameId);
  const today   = new Date().toISOString().split('T')[0];
  const isFirstGameToday = profile.last_played_at !== today;

  // ── 1. Compute personal best flag ─────────────────────────
  let isPersonalBest = false;
  try {
    const { data: pb } = await supabase
      .from('game_history')
      .select('score')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .limit(1)
      .single();
    isPersonalBest = !pb || stats.score > pb.score;
  } catch (_) {}

  // ── 2. Insert into global game_history ────────────────────
  let historyRowId = null;
  try {
    const { data } = await supabase
      .from('game_history')
      .insert({
        user_id:           userId,
        game_id:           gameId,
        game_category:     gameInfo?.category || 'Unknown',
        game_version:      gameInfo ? '1.0.0' : '1.0.0',
        score:             stats.score || 0,
        attempts:          stats.attempts || 0,
        accuracy_percent:  stats.accuracy_percent ?? null,
        avg_speed_seconds: stats.avg_speed_seconds ? parseFloat(stats.avg_speed_seconds) : null,
        level_reached:     stats.level_reached || 1,
        duration_seconds:  stats.duration_seconds || null,
        streak_in_game:    stats.streak_in_game || 0,
        perfect_rounds:    stats.perfect_rounds || 0,
        is_personal_best:  isPersonalBest,
        user_session_id:   null, // SessionTracker can provide this in future
      })
      .select('id')
      .single();
    historyRowId = data?.id;
  } catch (err) {
    console.warn(`[gameEngine] Failed to insert game_history for ${gameId}:`, err);
  }

  // ── 3. Insert into per-game isolated table ────────────────
  if (gameInfo?.historyTable) {
    try {
      const perGamePayload = {
        user_id:           userId,
        score:             stats.score || 0,
        attempts:          stats.attempts || 0,
        accuracy_percent:  stats.accuracy_percent ?? null,
        avg_speed_seconds: stats.avg_speed_seconds ? parseFloat(stats.avg_speed_seconds) : null,
        level_reached:     stats.level_reached || 1,
        duration_seconds:  stats.duration_seconds || null,
        streak_in_game:    stats.streak_in_game || 0,
        perfect_rounds:    stats.perfect_rounds || 0,
      };

      // Add game-specific columns if present in stats
      if (stats.game_specific) {
        Object.assign(perGamePayload, stats.game_specific);
      }

      await supabase.from(gameInfo.historyTable).insert(perGamePayload);
    } catch (err) {
      console.warn(`[gameEngine] Failed to insert per-game table for ${gameId}:`, err);
    }
  }

  // ── 4. Update streak ──────────────────────────────────────
  let newStreak = profile.streak_count || 0;
  let newPlantStage = profile.plant_stage || 0;

  if (isFirstGameToday) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    newStreak = (profile.last_played_at === yesterdayStr) ? newStreak + 1 : 1;
    newPlantStage = newStreak >= 30 ? 4 : newStreak >= 14 ? 3 : newStreak >= 7 ? 2 : newStreak >= 3 ? 1 : 0;

    try {
      await supabase.from('profiles').update({
        streak_count:    newStreak,
        last_played_at:  today,
        plant_stage:     newPlantStage,
        total_games_played: (profile.total_games_played || 0) + 1,
        updated_at:      new Date().toISOString(),
      }).eq('id', userId);
    } catch (err) {
      console.warn('[gameEngine] Failed to update streak:', err);
    }
  } else {
    // Not first game today — still increment total_games_played
    try {
      await supabase.from('profiles')
        .update({ total_games_played: (profile.total_games_played || 0) + 1, updated_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (_) {}
  }

  // ── 5. Process XP + Badges via EngagementEngine ──────────
  const updatedProfile = {
    ...profile,
    streak_count: newStreak,
    last_played_at: today,
    plant_stage: newPlantStage,
    total_games_played: (profile.total_games_played || 0) + 1,
  };

  let engagementResult = { xpEarned: 0, newXP: profile.xp_total || 0, newLevel: profile.level || 1, leveledUp: false, newBadges: [] };
  try {
    engagementResult = await processGameCompletion(
      gameId, stats, updatedProfile, userId, historyRowId, isFirstGameToday
    );
  } catch (err) {
    console.warn('[gameEngine] EngagementEngine failed:', err);
  }

  // ── 6. Session tracking ───────────────────────────────────────
  SessionTracker.recordGamePlay(gameId, engagementResult.xpEarned);

  // ── 6b. Improvement Engine (fire-and-forget) ──────────────────
  ImprovementEngine.analyze(userId, gameId).catch(() => {});

  // ── 6c. Adaptive Difficulty ───────────────────────────────────
  let adaptiveResult = { nextLevel: stats.level_reached || 1, direction: 'hold', reason: 'default' };
  try {
    // Read current level
    const { data: levelRow } = await supabase
      .from('user_game_levels')
      .select('level')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .maybeSingle();
    const currentLevel = levelRow?.level || 1;

    // Read last 3 plays for this game
    const { data: recentPlays } = await supabase
      .from('game_history')
      .select('accuracy_percent,score,duration_seconds')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .order('played_at', { ascending: false })
      .limit(3);

    adaptiveResult = computeNextLevel(currentLevel, recentPlays || []);

    // Upsert new level
    await supabase.from('user_game_levels').upsert({
      user_id:       userId,
      game_id:       gameId,
      level:         adaptiveResult.nextLevel,
      plays_at_level: (adaptiveResult.direction === 'hold' ? (levelRow?.plays_at_level || 0) + 1 : 0),
      updated_at:    new Date().toISOString(),
    }, { onConflict: 'user_id,game_id' });
  } catch (err) {
    console.warn('[gameEngine] AdaptiveEngine failed:', err);
  }

  // ── 7. Notifications ──────────────────────────────────────
  if (isPersonalBest && gameInfo) {
    NotificationEngine.sendPersonalBest(gameInfo.name, stats.score);
  }
  if (engagementResult.leveledUp) {
    const { getLevelForXP } = await import('@/app/core/engagement/EngagementEngine');
    const levelInfo = getLevelForXP(engagementResult.newXP);
    NotificationEngine.sendLevelUp(levelInfo.title, engagementResult.newLevel);
  }
  engagementResult.newBadges.forEach(badge => NotificationEngine.sendBadgeEarned(badge));

  // ── 8. Fire callback ──────────────────────────────────────
  if (onProfileUpdate) {
    onProfileUpdate(
      {
        ...updatedProfile,
        xp_total: engagementResult.newXP,
        level: engagementResult.newLevel,
      },
      {
        ...engagementResult,
        isPersonalBest,
        isFirstGameToday,
        adaptive: adaptiveResult,   // { nextLevel, direction, reason }
      }
    );
  }
}
