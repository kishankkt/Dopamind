import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Plus, Play, Trash2, CheckCircle, Clock, LayoutGrid, Pencil } from 'lucide-react';
import { GAME_REGISTRY, getGame } from '@/app/games/core_engine/gameRegistry';

const STATUS_COLORS = {
  draft:     { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', label: 'Draft' },
  active:    { bg: 'rgba(16,185,129,0.15)',  text: '#10b981', label: 'Active' },
  completed: { bg: 'rgba(234,179,8,0.15)',   text: '#eab308', label: 'Done' },
  abandoned: { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444', label: 'Abandoned' },
};

export default function WorkoutSessionsView({ session, onStartGame }) {
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  // Builder state
  const [newName, setNewName]         = useState('');
  const [newDesc, setNewDesc]         = useState('');
  const [gameSequence, setGameSequence] = useState([]); // [{game_id, rounds, notes}]
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    if (session?.user?.id) fetchSessions();
  }, [session]);

  const fetchSessions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    setSessions(data || []);
    setLoading(false);
  };

  // ── Builder ──────────────────────────────────────────────────
  const addGameToSequence = (gameId) => {
    if (gameSequence.find(g => g.game_id === gameId)) return; // no dupes
    setGameSequence(prev => [...prev, { game_id: gameId, rounds: 1, notes: '' }]);
  };

  const removeFromSequence = (idx) => {
    setGameSequence(prev => prev.filter((_, i) => i !== idx));
  };

  const estimateDuration = () => {
    return gameSequence.reduce((sum, item) => {
      const game = getGame(item.game_id);
      const secs = game?.durationSeconds || (game?.rounds ? game.rounds * 5 : 30);
      return sum + secs;
    }, 0);
  };

  const saveSession = async () => {
    if (!newName.trim() || gameSequence.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        user_id:                session.user.id,
        name:                   newName.trim(),
        description:            newDesc.trim() || null,
        session_type:           'manual',
        game_sequence:          gameSequence,
        estimated_duration_mins: Math.ceil(estimateDuration() / 60),
        status:                 'draft',
        generated_by:           'user',
      };

      if (editingSession) {
        await supabase.from('workout_sessions').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editingSession.id);
      } else {
        await supabase.from('workout_sessions').insert(payload);
      }

      await fetchSessions();
      resetBuilder();
    } catch (e) {
      console.warn('[WorkoutSessionsView] Save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const deleteSession = async (id) => {
    await supabase.from('workout_sessions').delete().eq('id', id);
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const startSession = async (ws) => {
    // Mark as active
    await supabase.from('workout_sessions')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', ws.id);

    // Launch first game
    const firstGame = ws.game_sequence?.[0];
    if (firstGame && onStartGame) {
      onStartGame(firstGame.game_id);
    }
  };

  const openEditor = (ws) => {
    setEditingSession(ws);
    setNewName(ws.name);
    setNewDesc(ws.description || '');
    setGameSequence(ws.game_sequence || []);
    setShowBuilder(true);
  };

  const resetBuilder = () => {
    setEditingSession(null);
    setNewName('');
    setNewDesc('');
    setGameSequence([]);
    setShowBuilder(false);
  };

  // ── Render Builder ───────────────────────────────────────────
  if (showBuilder) {
    return (
      <div className="animate-pop">
        <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }} onClick={resetBuilder}>
            ← Back
          </button>
          <h1 style={{ margin: 0 }}>{editingSession ? 'Edit Session' : 'New Session'}</h1>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '900px' }}>

          {/* Left: Session Details */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: '0 0 4px' }}>Session Details</h3>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>SESSION NAME *</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Morning Focus Blast"
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--brand-surface)', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>DESCRIPTION</label>
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="What's the goal of this session?"
                rows={3}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--brand-surface)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            {/* Selected Game Sequence */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                GAME SEQUENCE ({gameSequence.length} games · ~{Math.ceil(estimateDuration() / 60)} min)
              </label>
              {gameSequence.length === 0
                ? <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', opacity: 0.5, fontSize: '0.85rem' }}>Add games from the right →</div>
                : gameSequence.map((item, idx) => {
                    const g = getGame(item.game_id);
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', background: 'rgba(0,0,0,0.12)', border: '1px solid var(--border)', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-muted)', width: '20px', textAlign: 'center', flexShrink: 0 }}>{idx + 1}</span>
                        <span style={{ flex: 1, fontWeight: 700, fontSize: '0.9rem' }}>{g?.name || item.game_id}</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{g?.durationSeconds ? `${g.durationSeconds}s` : g?.rounds ? `${g.rounds}R` : '~'}</span>
                        <button onClick={() => removeFromSequence(idx)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-error-coral)', padding: '4px' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
              <button className="btn-secondary" onClick={resetBuilder}>Cancel</button>
              <button className="btn-primary" onClick={saveSession} disabled={saving || !newName.trim() || gameSequence.length === 0} style={{ flex: 1, justifyContent: 'center' }}>
                {saving ? 'Saving...' : editingSession ? 'Update Session' : 'Create Session'}
              </button>
            </div>
          </div>

          {/* Right: Game Picker */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ margin: '0 0 16px' }}>Add Games</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
              {GAME_REGISTRY.map(game => {
                const added = gameSequence.find(g => g.game_id === game.id);
                return (
                  <div
                    key={game.id}
                    onClick={() => !added && addGameToSequence(game.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px', borderRadius: '12px',
                      border: `1px solid ${added ? 'var(--color-emerald-base)' : 'var(--border)'}`,
                      background: added ? 'rgba(16,185,129,0.08)' : 'transparent',
                      cursor: added ? 'default' : 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: added ? 'var(--color-emerald-base)' : 'var(--text-main)' }}>{game.name}</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.6 }}>{game.category}</div>
                    </div>
                    {added ? <CheckCircle size={16} color="var(--color-emerald-base)" /> : <Plus size={16} color="var(--text-muted)" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Sessions List ─────────────────────────────────────
  return (
    <>
      <header className="tab-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Your Sessions</h1>
          <p style={{ margin: '4px 0 0', opacity: 0.6, fontSize: '0.9rem' }}>
            Build structured training plans. Your coaches will also generate sessions here.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowBuilder(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Session
        </button>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', opacity: 0.5 }}>Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px', opacity: 0.6 }}>
          <LayoutGrid size={48} />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px' }}>No sessions yet</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Create your first training session to get started.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowBuilder(true)}>
            <Plus size={16} /> Create First Session
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {sessions.map(ws => {
            const statusStyle = STATUS_COLORS[ws.status] || STATUS_COLORS.draft;
            const games = ws.game_sequence || [];
            return (
              <div key={ws.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontFamily: 'var(--font-header)', fontWeight: 800 }}>{ws.name}</h3>
                    {ws.description && <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6, lineHeight: '1.4' }}>{ws.description}</p>}
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, background: statusStyle.bg, color: statusStyle.text, flexShrink: 0, marginLeft: '10px' }}>
                    {statusStyle.label}
                  </span>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', opacity: 0.7 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <LayoutGrid size={12} /> {games.length} game{games.length !== 1 ? 's' : ''}
                  </span>
                  {ws.estimated_duration_mins && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> ~{ws.estimated_duration_mins} min
                    </span>
                  )}
                </div>

                {/* Game chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {games.slice(0, 4).map((g, i) => (
                    <span key={i} style={{ padding: '3px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border)', fontSize: '0.72rem', fontWeight: 600 }}>
                      {getGame(g.game_id)?.name || g.game_id}
                    </span>
                  ))}
                  {games.length > 4 && <span style={{ padding: '3px 8px', fontSize: '0.72rem', opacity: 0.5 }}>+{games.length - 4} more</span>}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button
                    className="btn-primary"
                    onClick={() => startSession(ws)}
                    disabled={games.length === 0}
                    style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Play size={14} /> Start
                  </button>
                  <button
                    onClick={() => openEditor(ws)}
                    style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteSession(ws.id)}
                    style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', cursor: 'pointer', color: 'var(--color-error-coral)', display: 'flex', alignItems: 'center' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
