import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Trophy } from 'lucide-react';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    // Supabase foreign key join
    const { data, error } = await supabase
      .from('reactiontap_history')
      .select(`
        avg_speed_seconds,
        profiles ( username )
      `)
      .order('avg_speed_seconds', { ascending: true })
      .limit(20);

    if (error) {
      console.error("Error fetching leaderboard:", error);
    } else if (data) {
      // Remove duplicates so one user doesn't take all top 10 spots
      const uniqueLeaders = [];
      const seenUsers = new Set();
      
      for (const entry of data) {
        // Fallback name if profile or username is missing
        const username = entry.profiles?.username || "Anonymous Gymnast";
        
        if (!seenUsers.has(username)) {
          seenUsers.add(username);
          uniqueLeaders.push({
            username: username,
            latency: parseFloat(entry.avg_speed_seconds).toFixed(3)
          });
          if (uniqueLeaders.length === 10) break; // Stop at top 10 unique users
        }
      }
      setLeaders(uniqueLeaders);
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel" style={{ marginTop: '24px', flex: 1 }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, marginBottom: '20px' }}>
        <Trophy size={24} style={{ color: 'var(--color-accent-gold)' }} />
        Global Top 10 (ReactionTap)
      </h2>
      
      {loading ? (
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-pulse" style={{ color: 'var(--color-accent-gold)' }}>Loading global rankings...</div>
        </div>
      ) : leaders.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>
          No scores logged yet! Be the first to set a record.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {leaders.map((leader, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '12px 16px', 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '12px',
              borderLeft: idx === 0 ? '4px solid var(--color-accent-gold)' : 
                          idx === 1 ? '4px solid #E2E8F0' : // Silver
                          idx === 2 ? '4px solid #B45309' : // Bronze
                          '4px solid transparent'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  color: idx === 0 ? 'var(--color-accent-gold)' : 
                         idx === 1 ? '#E2E8F0' : 
                         idx === 2 ? '#B45309' : 'var(--text-muted)' 
                }}>
                  #{idx + 1}
                </span>
                <span style={{ fontWeight: '500' }}>{leader.username}</span>
              </div>
              <strong style={{ color: 'var(--color-emerald-base)' }}>{leader.latency}s</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
