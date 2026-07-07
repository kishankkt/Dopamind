import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Flame, Trophy, Brain, Clock, Target, Star, ChevronDown, ChevronRight, TrendingUp, Zap, Activity } from 'lucide-react';
import { getXPProgress } from '@/app/core/engagement/EngagementEngine';
import { GAME_REGISTRY, getGame } from '@/app/games/core_engine/gameRegistry';

// ── Category accent colours ──────────────────────────────────────
const CAT_COLOR = {
  'Quick Reflexes':    '#f97316',
  'Stay Sharp':        '#3b82f6',
  'Remember & Recall': '#8b5cf6',
  'Think & Solve':     '#10b981',
  'Word Power':        '#ec4899',
  'Sort & Prioritize': '#eab308',
};

// ── Small stat pill ──────────────────────────────────────────────
function Pill({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72 }}>
      <span style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-header)', color: color || 'var(--text-main)' }}>{value ?? '—'}</span>
      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
  );
}

// ── Single metric card ────────────────────────────────────────────
function MetricCard({ icon, label, value, sub, children }) {
  return (
    <div className="glass-panel" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-header)', color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.76rem', marginTop: '4px', opacity: 0.55 }}>{sub}</div>}
      {children}
    </div>
  );
}

export default function DashboardView({ streak, onEnterGym, session, profileUsername }) {
  const [profile,        setProfile]        = useState(null);
  const [todayMins,      setTodayMins]      = useState(0);
  const [weekGames,      setWeekGames]      = useState(0);
  const [avgAccuracy,    setAvgAccuracy]    = useState(null);
  const [topGame,        setTopGame]        = useState(null);
  const [signals,        setSignals]        = useState([]);
  const [gameStats,      setGameStats]      = useState({});  // keyed by game_id
  const [platformStats,  setPlatformStats]  = useState(null); // overall aggregates
  const [openGame,       setOpenGame]       = useState(null); // accordion open game
  const [loading,        setLoading]        = useState(true);

  // ── Fetch everything ──────────────────────────────────────────
  useEffect(() => {
    if (session?.user && !session.user.isTrial) fetchAll();
    else setLoading(false);
  }, [session]);

  const fetchAll = async () => {
    const uid   = session.user.id;
    const today = new Date().toISOString().split('T')[0];
    const w7    = new Date(Date.now() - 7  * 864e5).toISOString().split('T')[0];
    const w30   = new Date(Date.now() - 30 * 864e5).toISOString().split('T')[0];

    try {
      // Profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('xp_total,level,total_games_played,total_focus_minutes,streak_count,plant_stage')
        .eq('id', uid).single();
      setProfile(prof);

      // Today's session time
      const { data: sess } = await supabase
        .from('user_sessions').select('duration_secs')
        .eq('user_id', uid).eq('session_date', today);
      setTodayMins(Math.round((sess || []).reduce((s, r) => s + (r.duration_secs || 0), 0) / 60));

      // 7-day game history (all columns for per-game breakdown)
      const { data: hist7 } = await supabase
        .from('game_history')
        .select('game_id,game_category,score,accuracy_percent,avg_speed_seconds,duration_seconds,level_reached,streak_in_game,perfect_rounds,is_personal_best,played_at')
        .eq('user_id', uid)
        .gte('played_at', w7 + 'T00:00:00Z');

      // 30-day for per-game personal bests
      const { data: hist30 } = await supabase
        .from('game_history')
        .select('game_id,score,accuracy_percent,avg_speed_seconds,duration_seconds,level_reached')
        .eq('user_id', uid)
        .gte('played_at', w30 + 'T00:00:00Z');

      if (hist7?.length) {
        setWeekGames(hist7.length);
        const withAcc = hist7.filter(h => h.accuracy_percent != null);
        if (withAcc.length) setAvgAccuracy(Math.round(withAcc.reduce((s, h) => s + h.accuracy_percent, 0) / withAcc.length));
        const counts = {};
        hist7.forEach(h => { counts[h.game_id] = (counts[h.game_id] || 0) + 1; });
        setTopGame(Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]);
      }

      // ── Platform-wide aggregates (all 30-day data) ────────────
      const allRows = hist30 || [];
      const totalPlays  = allRows.length;
      const totalSecs   = allRows.reduce((s, h) => s + (h.duration_seconds || 0), 0);
      const allAcc      = allRows.filter(h => h.accuracy_percent != null);
      const overallAcc  = allAcc.length ? Math.round(allAcc.reduce((s, h) => s + h.accuracy_percent, 0) / allAcc.length) : null;
      const allSpeed    = allRows.filter(h => h.avg_speed_seconds != null);
      const overallSpd  = allSpeed.length ? (allSpeed.reduce((s, h) => s + parseFloat(h.avg_speed_seconds), 0) / allSpeed.length).toFixed(2) : null;
      const personalBests = (hist30 || []).filter(h => h.score != null);
      setPlatformStats({ totalPlays, totalMins: Math.round(totalSecs / 60), overallAcc, overallSpd });

      // ── Per-game aggregates ───────────────────────────────────
      const byGame = {};
      allRows.forEach(h => {
        if (!byGame[h.game_id]) byGame[h.game_id] = { plays: 0, scores: [], accuracies: [], speeds: [], durations: [], levels: [] };
        const g = byGame[h.game_id];
        g.plays++;
        if (h.score          != null) g.scores.push(h.score);
        if (h.accuracy_percent != null) g.accuracies.push(h.accuracy_percent);
        if (h.avg_speed_seconds != null) g.speeds.push(parseFloat(h.avg_speed_seconds));
        if (h.duration_seconds  != null) g.durations.push(h.duration_seconds);
        if (h.level_reached     != null) g.levels.push(h.level_reached);
      });
      const computed = {};
      Object.entries(byGame).forEach(([gid, g]) => {
        computed[gid] = {
          plays:    g.plays,
          bestScore: g.scores.length ? Math.max(...g.scores) : null,
          avgAcc:    g.accuracies.length ? Math.round(g.accuracies.reduce((a,b)=>a+b,0)/g.accuracies.length) : null,
          avgSpeed:  g.speeds.length ? (g.speeds.reduce((a,b)=>a+b,0)/g.speeds.length).toFixed(2) : null,
          totalMins: g.durations.length ? Math.round(g.durations.reduce((a,b)=>a+b,0)/60) : 0,
          maxLevel:  g.levels.length ? Math.max(...g.levels) : null,
        };
      });
      setGameStats(computed);

      // Signals
      const { data: sigs } = await supabase
        .from('improvement_signals').select('*')
        .eq('user_id', uid).eq('shown_to_user', false).eq('dismissed', false)
        .order('detected_at', { ascending: false }).limit(3);
      setSignals(sigs || []);
    } catch (e) {
      console.warn('[Dashboard]', e);
    } finally {
      setLoading(false);
    }
  };

  const dismissSignal = async (id) => {
    setSignals(p => p.filter(s => s.id !== id));
    await supabase.from('improvement_signals').update({ shown_to_user: true }).eq('id', id);
  };

  const xpProg  = profile ? getXPProgress(profile.xp_total || 0) : null;
  const plantMap = [
    { icon: '🪴', label: 'Empty Pot' }, { icon: '🌱', label: 'Seedling' },
    { icon: '🪴', label: 'Sturdy Sprout' }, { icon: '🌿', label: 'Sage Branch' },
    { icon: '🌳', label: 'Full Tree' }, { icon: '⭐', label: 'Golden Bloom' },
  ];
  const plant = plantMap[Math.min(profile?.plant_stage ?? (streak > 14 ? 3 : streak > 7 ? 2 : streak > 3 ? 1 : 0), 5)];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--color-emerald-light)', borderTopColor: 'var(--color-emerald-base)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Welcome ── */}
      <header className="tab-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>
            Welcome back, <span style={{ color: 'var(--color-emerald-base)' }}>{profileUsername || 'Gymnast'}</span>
          </h1>
          <p style={{ margin: '4px 0 0', opacity: 0.6, fontSize: '0.88rem' }}>
            {streak > 0 ? `🔥 ${streak}-day streak — keep watering your plant.` : 'Play a game to start your streak.'}
          </p>
        </div>
        <button className="btn-primary" onClick={onEnterGym} style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
          <Zap size={16} /> Enter Gym
        </button>
      </header>

      {/* ── Improvement Signals ── */}
      {signals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {signals.map(sig => (
            <div key={sig.id} style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-emerald-base)', marginBottom: 3 }}>
                  {sig.signal_type === 'breakthrough' ? '⚡ Breakthrough' : sig.signal_type === 'plateau' ? '⚠️ Plateau' : sig.signal_type === 'category_weak' ? '🎯 Weak Spot' : '📊 Insight'}
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>{sig.recommendation}</p>
              </div>
              <button onClick={() => dismissSignal(sig.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* ── Top Metric Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        <MetricCard icon={<Flame size={14} color="#f97316" />} label="Daily Streak" value={streak} sub={streak === 1 ? 'day' : 'days'} />
        <div className="glass-panel" style={{ padding: '20px 22px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Streak Plant</div>
          <div style={{ fontSize: '2.6rem', lineHeight: 1, marginBottom: 6 }}>{plant.icon}</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-emerald-base)' }}>{plant.label}</div>
          <div style={{ fontSize: '0.68rem', opacity: 0.45, marginTop: 4 }}>{streak < 3 ? `${3 - streak} days to next` : `Stage ${Math.min(profile?.plant_stage ?? 0, 5)}/5`}</div>
        </div>
        <MetricCard icon={<Clock size={14} color="var(--color-emerald-base)" />} label="Today's Focus" value={todayMins} sub="minutes">
          <div style={{ marginTop: 10, height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min((todayMins / 30) * 100, 100)}%`, background: 'var(--color-emerald-base)', borderRadius: 4, transition: 'width 0.6s ease' }} />
          </div>
          <div style={{ fontSize: '0.65rem', opacity: 0.45, marginTop: 4 }}>Goal: 30 min</div>
        </MetricCard>
        {xpProg && (
          <div className="glass-panel" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={14} color="var(--color-accent-gold)" /> Level & XP
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-header)', color: xpProg.current.color, lineHeight: 1 }}>{xpProg.current.level}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>{xpProg.current.title}</span>
            </div>
            <div style={{ marginTop: 10, height: 6, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${xpProg.percent}%`, background: `linear-gradient(90deg,${xpProg.current.color},${xpProg.next?.color || xpProg.current.color})`, borderRadius: 4, transition: 'width 0.8s ease' }} />
            </div>
            {xpProg.next && <div style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: 5 }}>{xpProg.xpInLevel}/{xpProg.xpNeeded} XP → {xpProg.next.title}</div>}
          </div>
        )}
        <MetricCard icon={<Brain size={14} color="#8b5cf6" />} label="This Week" value={weekGames} sub="games played">
          {topGame && <div style={{ marginTop: 8, fontSize: '0.72rem', opacity: 0.6 }}>Top: <strong style={{ color: 'var(--color-emerald-base)' }}>{getGame(topGame)?.name || topGame}</strong></div>}
        </MetricCard>
        <MetricCard icon={<Target size={14} color="#3b82f6" />} label="7-Day Accuracy" value={avgAccuracy != null ? `${avgAccuracy}%` : '—'} sub="rolling avg">
          {avgAccuracy && <div style={{ marginTop: 8, fontSize: '0.72rem', opacity: 0.6 }}>{avgAccuracy >= 85 ? '🎯 Sharp' : avgAccuracy >= 70 ? '📈 Growing' : '💪 Work on it'}</div>}
        </MetricCard>
      </div>

      {/* ══════════════════════════════════════════════════════════
          ── Platform + Per-Game Metrics Accordion ──
          Outer card = overall 30-day platform numbers
          Each game row = expandable → game-specific 30-day data
      ══════════════════════════════════════════════════════════ */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>

        {/* ── Overall Platform Header ── */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                <Activity size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />Platform Overview · Last 30 Days
              </div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-header)' }}>Your Brain Gym Stats</h2>
            </div>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              <Pill label="Total Plays"   value={platformStats?.totalPlays ?? (profile?.total_games_played ?? '—')} color="var(--color-emerald-base)" />
              <Pill label="Focus Mins"    value={platformStats?.totalMins  ?? '—'} />
              <Pill label="Avg Accuracy"  value={platformStats?.overallAcc  != null ? `${platformStats.overallAcc}%` : '—'} />
              <Pill label="Avg Speed"     value={platformStats?.overallSpd  != null ? `${platformStats.overallSpd}s` : '—'} />
              <Pill label="XP Total"      value={profile?.xp_total ?? '—'} color="var(--color-accent-gold)" />
            </div>
          </div>
        </div>

        {/* ── Per-Game Rows ── */}
        <div>
          {GAME_REGISTRY.map((game, idx) => {
            const gs     = gameStats[game.id];
            const played = gs?.plays || 0;
            const catCol = CAT_COLOR[game.category] || '#10b981';
            const isOpen = openGame === game.id;

            return (
              <div key={game.id} style={{ borderBottom: idx < GAME_REGISTRY.length - 1 ? '1px solid var(--border)' : 'none' }}>

                {/* Row header — always visible */}
                <div
                  onClick={() => setOpenGame(isOpen ? null : game.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px',
                    cursor: 'pointer', transition: 'background 0.15s',
                    background: isOpen ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = isOpen ? 'rgba(255,255,255,0.02)' : 'transparent'}
                >
                  {/* Colour dot */}
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: catCol, flexShrink: 0 }} />

                  {/* Name + category */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{game.name}</div>
                    <div style={{ fontSize: '0.7rem', color: catCol, fontWeight: 600, marginTop: 1 }}>{game.category}</div>
                  </div>

                  {/* Quick stats always visible */}
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexShrink: 0 }}>
                    <Pill label="Plays"    value={played || '—'} />
                    <Pill label="Best"     value={gs?.bestScore ?? '—'} />
                    <Pill label="Accuracy" value={gs?.avgAcc != null ? `${gs.avgAcc}%` : '—'} />
                  </div>

                  {/* Never played badge */}
                  {!played && (
                    <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600 }}>Not played</span>
                  )}

                  {/* Chevron */}
                  <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </div>

                {/* ── Expanded game detail panel ── */}
                {isOpen && (
                  <div style={{ padding: '0 24px 20px 24px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.12)' }}>
                    <div style={{ paddingTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>

                      {/* Game info */}
                      <div style={{ minWidth: 200, flex: '1 1 200px' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: catCol, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{game.cognitiveTarget}</div>
                        <p style={{ margin: 0, fontSize: '0.82rem', opacity: 0.65, lineHeight: 1.45 }}>{game.description}</p>
                        <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 6, background: `${catCol}18`, color: catCol, fontSize: '0.68rem', fontWeight: 700 }}>{game.gameType}</span>
                          {game.durationSeconds && <span style={{ padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)' }}>{game.durationSeconds}s</span>}
                          {game.rounds && <span style={{ padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)' }}>{game.rounds} rounds</span>}
                          {game.hasAudio && <span style={{ padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)' }}>🔊 Audio</span>}
                        </div>
                      </div>

                      {/* Stats grid — only if played */}
                      {played > 0 ? (
                        <div style={{ display: 'flex', gap: 12, flex: '2 1 320px', flexWrap: 'wrap' }}>
                          {[
                            { label: 'Total Plays',   value: gs.plays },
                            { label: 'Best Score',    value: gs.bestScore ?? '—' },
                            { label: 'Avg Accuracy',  value: gs.avgAcc != null ? `${gs.avgAcc}%` : '—' },
                            { label: 'Avg Speed',     value: gs.avgSpeed ? `${gs.avgSpeed}s` : '—' },
                            { label: 'Focus Mins',    value: gs.totalMins ?? '—' },
                            { label: 'Max Level',     value: gs.maxLevel ?? '—' },
                          ].map(s => (
                            <div key={s.label} style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', minWidth: 100, flex: '1 1 100px' }}>
                              <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-header)', color: 'var(--text-main)' }}>{s.value}</div>
                              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{s.label}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ flex: '2 1 320px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '20px', borderRadius: 14, border: '1px dashed var(--border)', opacity: 0.5 }}>
                          <span style={{ fontSize: '0.88rem' }}>No data yet — </span>
                          <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={onEnterGym}>Play now</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
