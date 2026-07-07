/**
 * SessionTracker.js — DopaMind App-Level Session Time Tracking
 * 
 * Tracks how long a user spends in the app per visit.
 * Writes to user_sessions table on start; flushes duration on close/blur.
 * 
 * Usage:
 *   import SessionTracker from '@/app/core/engagement/SessionTracker';
 *   // In AppShell useEffect on mount:
 *   SessionTracker.start(userId);
 *   return () => SessionTracker.end();
 */

import { supabase } from '@/supabaseClient';

let _sessionRowId  = null;
let _startTime     = null;
let _userId        = null;
let _gamesPlayed   = 0;
let _gamesList     = [];
let _xpEarned      = 0;
let _isFlushed     = false;

const SessionTracker = {
  /**
   * Start a new app session. Call once on AppShell mount after auth is confirmed.
   * @param {string} userId
   * @param {object} options - { deviceType, entryPoint, coachPlanId, workoutSessionId }
   */
  async start(userId, options = {}) {
    if (!userId) return;
    _userId      = userId;
    _startTime   = Date.now();
    _gamesPlayed = 0;
    _gamesList   = [];
    _xpEarned    = 0;
    _isFlushed   = false;

    // Detect device
    const deviceType = options.deviceType
      || (typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__ ? 'desktop' : 'web');

    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id:            userId,
          device_type:        deviceType,
          entry_point:        options.entryPoint || 'direct',
          coach_plan_id:      options.coachPlanId || null,
          workout_session_id: options.workoutSessionId || null,
        })
        .select('id')
        .single();

      if (!error && data) {
        _sessionRowId = data.id;
      }
    } catch (e) {
      console.warn('[SessionTracker] Failed to start session:', e);
    }

    // Attach flush listeners
    window.addEventListener('beforeunload', SessionTracker._flush);
    document.addEventListener('visibilitychange', SessionTracker._handleVisibility);
  },

  /**
   * Record a game being played this session.
   * Call from AppShell handleGameComplete.
   * @param {string} gameId
   * @param {number} xpEarned
   */
  recordGamePlay(gameId, xpEarned = 0) {
    _gamesPlayed++;
    if (!_gamesList.includes(gameId)) _gamesList.push(gameId);
    _xpEarned += xpEarned;

    // Update session row games_played (best-effort, non-blocking)
    if (_sessionRowId) {
      supabase
        .from('user_sessions')
        .update({ games_played: _gamesPlayed, games_list: _gamesList, xp_earned: _xpEarned })
        .eq('id', _sessionRowId)
        .then(() => {})
        .catch(() => {});
    }
  },

  /**
   * Get the current session duration in seconds.
   */
  getDurationSeconds() {
    if (!_startTime) return 0;
    return Math.round((Date.now() - _startTime) / 1000);
  },

  /**
   * Manually end the session (call on unmount / sign-out).
   */
  async end() {
    await SessionTracker._flush();
    window.removeEventListener('beforeunload', SessionTracker._flush);
    document.removeEventListener('visibilitychange', SessionTracker._handleVisibility);
  },

  /** Internal: flush session end to DB */
  async _flush() {
    if (!_sessionRowId || _isFlushed) return;
    _isFlushed = true;
    const duration = SessionTracker.getDurationSeconds();

    try {
      await supabase
        .from('user_sessions')
        .update({
          ended_at:      new Date().toISOString(),
          duration_secs: duration,
          games_played:  _gamesPlayed,
          games_list:    _gamesList,
          xp_earned:     _xpEarned,
        })
        .eq('id', _sessionRowId);
    } catch (e) {
      console.warn('[SessionTracker] Failed to flush session:', e);
    }
  },

  /** Internal: handle tab visibility changes */
  _handleVisibility() {
    if (document.visibilityState === 'hidden') {
      SessionTracker._flush();
    }
  },
};

export default SessionTracker;
