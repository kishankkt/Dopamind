import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

export default function PerformanceChart({ session }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState('reactiontap_history');

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, activeGame]);

  const fetchData = async () => {
    setLoading(true);
    const { data: history, error } = await supabase
      .from(activeGame)
      .select('created_at, avg_speed_seconds, accuracy_percent')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })
      .limit(15);

    if (error) {
      console.error("Error fetching performance data:", error);
    } else if (history) {
      const formattedData = history.map((item, index) => ({
        attempt: `T-${history.length - index}`,
        latency: parseFloat(item.avg_speed_seconds),
        accuracy: item.accuracy_percent
      }));
      setData(formattedData);
    }
    setLoading(false);
  };

  const gameOptions = [
    { value: 'reactiontap_history', label: 'ReactionTap' },
    { value: 'speedmatch_history', label: 'SpeedMatch' },
    { value: 'numbercascade_history', label: 'NumberCascade' }
  ];

  return (
    <div className="glass-panel" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Activity size={24} style={{ color: 'var(--color-emerald-base)' }} />
          Performance Analytics
        </h2>
        
        <select 
          value={activeGame} 
          onChange={(e) => setActiveGame(e.target.value)}
          style={{ 
            padding: '10px 36px 10px 16px', 
            borderRadius: '12px', 
            background: 'var(--brand-surface)', 
            border: '1px solid var(--brand-primary)', 
            color: 'var(--text-main)',
            fontWeight: '600',
            appearance: 'none',
            backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="%2334d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6"/></svg>')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center',
            backgroundSize: '16px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {gameOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-pulse" style={{ color: 'var(--color-emerald-base)' }}>Loading secure telemetry...</div>
        </div>
      ) : data.length === 0 ? (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
          Play a few rounds in the Games Gym to generate your baseline charts.
        </div>
      ) : (
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="attempt" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)' }}
                itemStyle={{ color: 'var(--color-emerald-base)' }}
              />
              <Line 
                type="monotone" 
                dataKey="latency" 
                name="Latency (s)"
                stroke="var(--color-emerald-base)" 
                strokeWidth={3}
                dot={{ r: 4, fill: 'var(--bg)', stroke: 'var(--color-emerald-base)', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: 'var(--color-emerald-base)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
