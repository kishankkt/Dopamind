import { supabase } from '@/supabaseClient';

/**
 * Syncs the game score to the respective game's history table
 * and waters the global streak plant if it's the first play of the day.
 * 
 * @param {string} gameId - The ID of the game (e.g., 'speedmatch', 'focusgrid')
 * @param {object} stats - { score, attempts, accuracy_percent, avg_speed_seconds }
 * @param {object} session - The active user session from Supabase
 * @param {number} currentStreak - The user's current streak count
 * @param {string} lastPlayed - The date string of the last played time
 * @param {function} updateStateCallback - Callback to update the React state (newStreak, todayDate)
 */
export const logGameSession = async (
  gameId, 
  stats, 
  session, 
  currentStreak, 
  lastPlayed, 
  updateStateCallback
) => {
  if (!session?.user) return; 

  const today = new Date().toDateString();
  const historyTableName = `${gameId}_history`;

  // 1. Sync game record in DB
  try {
    await supabase
      .from(historyTableName)
      .insert({
        user_id: session.user.id,
        score: stats.score,
        attempts: stats.attempts,
        accuracy_percent: stats.accuracy_percent,
        avg_speed_seconds: parseFloat(stats.avg_speed_seconds)
      });
  } catch (err) {
    console.warn(`Failed to log ${gameId} score to database:`, err);
  }

  // 2. Water / Update Streak plant
  if (lastPlayed !== today) {
    try {
      const newStreak = currentStreak + 1;
      const { error } = await supabase
        .from('profiles')
        .update({
          streak_count: newStreak,
          last_played_at: new Date().toISOString(),
          plant_stage: newStreak >= 30 ? 3 : newStreak >= 7 ? 2 : newStreak >= 3 ? 1 : 0
        })
        .eq('id', session.user.id);
      
      if (!error) {
        updateStateCallback(newStreak, today);
      }
    } catch (err) {
      console.warn("Failed to water plant:", err);
    }
  }
};
