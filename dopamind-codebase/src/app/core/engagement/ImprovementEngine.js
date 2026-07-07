/**
 * ImprovementEngine.js — DopaMind Client-Side Improvement Signal Detector
 * 
 * Runs after every game completion. Reads performance_snapshots and game_history
 * to detect meaningful patterns: breakthroughs, plateaus, category weaknesses.
 * Writes detected signals to improvement_signals table.
 * 
 * Call: ImprovementEngine.analyze(userId, gameId) — fire-and-forget from gameEngine.js
 */

import { supabase } from '@/supabaseClient';

// ─────────────────────────────────────────────────────────────────
// Signal Thresholds
// ─────────────────────────────────────────────────────────────────

const BREAKTHROUGH_PCT      = 15;  // score improvement % to qualify as breakthrough
const PLATEAU_WEEKS         = 2;   // weeks of no improvement = plateau
const CATEGORY_WEAK_GAP     = 20;  // % gap between weakest and strongest category
const MIN_PLAYS_FOR_SIGNAL  = 5;   // minimum plays before any signal fires

const ImprovementEngine = {
  /**
   * Main entry: analyze user performance after a game play.
   * Fire-and-forget — do not await this in critical path.
   */
  async analyze(userId, gameId) {
    if (!userId || !gameId) return;

    try {
      // Run checks in parallel, catch individually so one failure doesn't block others
      await Promise.allSettled([
        this._checkBreakthrough(userId, gameId),
        this._checkPlateau(userId, gameId),
        this._checkCategoryBalance(userId),
        this._checkPersonalBest(userId, gameId),
        this._checkStreak(userId),
      ]);
    } catch (e) {
      console.warn('[ImprovementEngine] analyze failed:', e);
    }
  },

  // ─────────────────────────────────────────────────────────────
  // Check: Breakthrough (score jumped >15% vs last 3 weeks avg)
  // ─────────────────────────────────────────────────────────────
  async _checkBreakthrough(userId, gameId) {
    const { data: snapshots } = await supabase
      .from('performance_snapshots')
      .select('week_number, year, avg_score, best_score, plays_count')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .order('year', { ascending: false })
      .order('week_number', { ascending: false })
      .limit(4);

    if (!snapshots || snapshots.length < 2) return;

    const [thisWeek, ...prevWeeks] = snapshots;
    if ((thisWeek.plays_count || 0) < 2) return; // not enough plays this week

    const prevAvg = prevWeeks.reduce((s, w) => s + (w.avg_score || 0), 0) / prevWeeks.length;
    if (prevAvg === 0) return;

    const pctChange = ((thisWeek.avg_score - prevAvg) / prevAvg) * 100;
    if (pctChange >= BREAKTHROUGH_PCT) {
      await this._writeSignal(userId, {
        signal_type: 'breakthrough',
        game_id: gameId,
        signal_data: {
          before_avg: Math.round(prevAvg),
          after_avg:  Math.round(thisWeek.avg_score),
          pct_change: Math.round(pctChange),
        },
        recommendation: `You're improving fast in this game! Push for a new personal best today.`,
      });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // Check: Plateau (no score improvement for N weeks despite playing)
  // ─────────────────────────────────────────────────────────────
  async _checkPlateau(userId, gameId) {
    const { data: snapshots } = await supabase
      .from('performance_snapshots')
      .select('week_number, year, avg_score, plays_count, trend')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .order('year', { ascending: false })
      .order('week_number', { ascending: false })
      .limit(PLATEAU_WEEKS + 1);

    if (!snapshots || snapshots.length < PLATEAU_WEEKS + 1) return;

    const allPlateaued = snapshots.slice(0, PLATEAU_WEEKS).every(s =>
      s.trend === 'plateau' && (s.plays_count || 0) >= 2
    );

    if (allPlateaued) {
      const avgScore = Math.round(snapshots[0].avg_score || 0);
      // Check we haven't already fired this signal recently
      const { data: existing } = await supabase
        .from('improvement_signals')
        .select('id')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .eq('signal_type', 'plateau')
        .eq('dismissed', false)
        .limit(1);

      if (existing?.length) return; // already active

      await this._writeSignal(userId, {
        signal_type: 'plateau',
        game_id: gameId,
        signal_data: { weeks_stagnant: PLATEAU_WEEKS, avg_score: avgScore },
        recommendation: `You've been stuck at ${avgScore} for ${PLATEAU_WEEKS} weeks. Try slowing down and focusing on accuracy first.`,
      });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // Check: Category Imbalance (one category significantly weaker)
  // ─────────────────────────────────────────────────────────────
  async _checkCategoryBalance(userId) {
    const { data: history } = await supabase
      .from('game_history')
      .select('game_category, accuracy_percent')
      .eq('user_id', userId)
      .gte('session_date', new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (!history || history.length < MIN_PLAYS_FOR_SIGNAL) return;

    // Group by category
    const byCategory = {};
    history.forEach(h => {
      if (!h.accuracy_percent) return;
      if (!byCategory[h.game_category]) byCategory[h.game_category] = [];
      byCategory[h.game_category].push(h.accuracy_percent);
    });

    const catAvgs = Object.entries(byCategory)
      .filter(([, vals]) => vals.length >= 2)
      .map(([cat, vals]) => ({ cat, avg: vals.reduce((s, v) => s + v, 0) / vals.length }));

    if (catAvgs.length < 2) return;

    catAvgs.sort((a, b) => a.avg - b.avg);
    const weakest  = catAvgs[0];
    const strongest = catAvgs[catAvgs.length - 1];

    if (strongest.avg - weakest.avg >= CATEGORY_WEAK_GAP) {
      await this._writeSignal(userId, {
        signal_type:  'category_weak',
        game_category: weakest.cat,
        signal_data: {
          weak_category: weakest.cat,
          user_avg:      Math.round(weakest.avg),
          best_category: strongest.cat,
          best_avg:      Math.round(strongest.avg),
        },
        recommendation: `Your ${weakest.cat} games average ${Math.round(weakest.avg)}% accuracy — try a game in that category today.`,
        recommended_games: [],
      });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // Check: Personal Best just set (flagged from game_history row)
  // ─────────────────────────────────────────────────────────────
  async _checkPersonalBest(userId, gameId) {
    const { data } = await supabase
      .from('game_history')
      .select('score, is_personal_best')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .eq('is_personal_best', true)
      .order('played_at', { ascending: false })
      .limit(1);

    if (!data?.length) return;

    await this._writeSignal(userId, {
      signal_type: 'personal_best',
      game_id: gameId,
      signal_data: { score: data[0].score },
      recommendation: `New all-time best in ${gameId}! Your brain is adapting.`,
    });
  },

  // ─────────────────────────────────────────────────────────────
  // Check: Comeback (returning after >7 days)
  // ─────────────────────────────────────────────────────────────
  async _checkStreak(userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_count, last_played_at')
      .eq('id', userId)
      .single();

    if (!profile) return;

    // Detect comeback
    if (profile.last_played_at) {
      const daysSince = Math.floor(
        (Date.now() - new Date(profile.last_played_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince >= 7) {
        await this._writeSignal(userId, {
          signal_type: 'comeback',
          signal_data: { days_absent: daysSince },
          recommendation: `Welcome back after ${daysSince} days! Start light and rebuild your streak.`,
        });
      }
    }

    // Consistency
    if (profile.streak_count >= 7) {
      // Check if consistency signal already fired this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const { data: existing } = await supabase
        .from('improvement_signals')
        .select('id')
        .eq('user_id', userId)
        .eq('signal_type', 'consistency')
        .gte('detected_at', weekStart.toISOString())
        .limit(1);

      if (!existing?.length) {
        await this._writeSignal(userId, {
          signal_type: 'consistency',
          signal_data: { streak_days: profile.streak_count },
          recommendation: `${profile.streak_count} days straight. Your habit loop is locked in.`,
        });
      }
    }
  },

  // ─────────────────────────────────────────────────────────────
  // Write a signal (deduplication: skip if same type+game+undismissed exists within 7 days)
  // ─────────────────────────────────────────────────────────────
  async _writeSignal(userId, signal) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Deduplication check
    let query = supabase
      .from('improvement_signals')
      .select('id')
      .eq('user_id', userId)
      .eq('signal_type', signal.signal_type)
      .eq('dismissed', false)
      .gte('detected_at', sevenDaysAgo)
      .limit(1);

    if (signal.game_id) query = query.eq('game_id', signal.game_id);

    const { data: existing } = await query;
    if (existing?.length) return; // already active

    await supabase.from('improvement_signals').insert({
      user_id:          userId,
      signal_type:      signal.signal_type,
      game_id:          signal.game_id || null,
      game_category:    signal.game_category || null,
      signal_data:      signal.signal_data || {},
      recommendation:   signal.recommendation || null,
      recommended_games: signal.recommended_games || [],
      shown_to_user:    false,
      dismissed:        false,
    });
  },
};

export default ImprovementEngine;
