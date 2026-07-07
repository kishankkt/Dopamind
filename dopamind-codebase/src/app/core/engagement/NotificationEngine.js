/**
 * NotificationEngine.js — DopaMind Browser Notification System
 * 
 * Uses native browser Notification API. No external service.
 * Permission is requested from the Settings page only.
 * Streak reminders, badge alerts, weekly summaries, cold-start re-engagement.
 */

import { supabase } from '@/supabaseClient';

const NotificationEngine = {
  // ─────────────────────────────────────────────────────────────
  // Permission
  // ─────────────────────────────────────────────────────────────

  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  isGranted() {
    return this.isSupported() && Notification.permission === 'granted';
  },

  isDenied() {
    return this.isSupported() && Notification.permission === 'denied';
  },

  async requestPermission() {
    if (!this.isSupported()) return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  },

  // ─────────────────────────────────────────────────────────────
  // Core Send
  // ─────────────────────────────────────────────────────────────

  send(title, body, options = {}) {
    if (!this.isGranted()) return null;
    try {
      const notification = new Notification(title, {
        body,
        icon: '/logo.svg',
        badge: '/logo.svg',
        silent: false,
        ...options,
      });
      return notification;
    } catch (e) {
      console.warn('[NotificationEngine] Failed to send:', e);
      return null;
    }
  },

  // ─────────────────────────────────────────────────────────────
  // Notification Types
  // ─────────────────────────────────────────────────────────────

  sendStreakAlert(streakDays) {
    return this.send(
      '🔥 Your streak is in danger!',
      `You haven't played today. ${streakDays} day streak at risk — come water your plant.`,
    );
  },

  sendStreakSaved(streakDays) {
    return this.send(
      '✅ Streak saved!',
      `Day ${streakDays} is locked in. See you tomorrow!`,
    );
  },

  sendLevelUp(levelTitle, newLevel) {
    return this.send(
      `🎉 Level Up! You're now Level ${newLevel}`,
      `You reached: ${levelTitle}. Keep training.`,
    );
  },

  sendBadgeEarned(badge) {
    return this.send(
      `${badge.icon} Badge Unlocked: ${badge.name}`,
      `+${badge.xp} XP awarded. Check your profile.`,
    );
  },

  sendPersonalBest(gameName, score) {
    return this.send(
      `⚡ New Personal Best in ${gameName}!`,
      `Score: ${score}. Your brain is leveling up.`,
    );
  },

  sendWeeklySummary({ gamesPlayed, focusMinutes, xpEarned }) {
    return this.send(
      '📊 Your Week in Review',
      `${gamesPlayed} games | ${focusMinutes} focus minutes | ${xpEarned} XP earned`,
    );
  },

  sendColdStart(daysSinceLastPlay) {
    return this.send(
      '🌱 Your plant is missing you',
      `${daysSinceLastPlay} days without training. Come back and keep growing.`,
    );
  },

  // ─────────────────────────────────────────────────────────────
  // Streak Reminder Scheduler (in-tab timer)
  // ─────────────────────────────────────────────────────────────

  _streakTimerId: null,

  /**
   * Schedule a streak reminder for today if the user hasn't played yet.
   * Uses a setTimeout targeting the user's configured reminder time.
   * @param {string} lastPlayedDate - 'YYYY-MM-DD' or null
   * @param {string} reminderTime - 'HH:MM:SS' (from notification_preferences)
   */
  scheduleStreakReminder(lastPlayedDate, reminderTime = '20:00:00', streakDays = 0) {
    if (this._streakTimerId) clearTimeout(this._streakTimerId);
    if (!this.isGranted()) return;

    const today = new Date().toISOString().split('T')[0];
    if (lastPlayedDate === today) return; // Already played today

    const [h, m] = (reminderTime || '20:00:00').split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);

    const msUntil = target - now;
    if (msUntil <= 0) return; // Already past reminder time

    this._streakTimerId = setTimeout(() => {
      // Re-check they haven't played since scheduling
      this.sendStreakAlert(streakDays);
    }, msUntil);
  },

  cancelStreakReminder() {
    if (this._streakTimerId) {
      clearTimeout(this._streakTimerId);
      this._streakTimerId = null;
    }
  },

  // ─────────────────────────────────────────────────────────────
  // DB Preferences Sync
  // ─────────────────────────────────────────────────────────────

  async loadPreferences(userId) {
    if (!userId) return null;
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    return data;
  },

  async savePreferences(userId, prefs) {
    await supabase
      .from('notification_preferences')
      .upsert({ user_id: userId, ...prefs, updated_at: new Date().toISOString() });
  },
};

export default NotificationEngine;
