import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BrandConfig } from '@/config/brand';
import { supabase } from '@/supabaseClient';
import LogoIcon from './LogoIcon';

export default function PublicHeader({ onAuthClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleScroll = (id) => {
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#' + id);
    }
  };

  return (
    <header className="site-header glass-panel" style={{ zIndex: 100, position: 'relative' }}>
      <div className="logo-area">
        <Link to="/" className="logo-text" style={{display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit'}}>
          <LogoIcon width={24} height={24} />
          {BrandConfig.name}
        </Link>
      </div>
      <nav className="header-nav">
        <Link to="/brain-gym" className="text-btn" style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', textDecoration: 'none' }}>Brain Gym</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/downloads">Downloads</Link>
        {session ? (
          <Link to="/dashboard" className="btn-primary nav-cta" style={{ textDecoration: 'none', background: 'var(--color-emerald-base)', color: 'white', border: 'none' }}>
            Dashboard
          </Link>
        ) : (
          <button className="btn-primary nav-cta" style={{ background: 'var(--color-emerald-base)', color: 'white', border: 'none', padding: '10px 24px', fontWeight: 'bold' }} onClick={() => onAuthClick ? onAuthClick() : navigate('/?auth=true')}>
            Get Started
          </button>
        )}
      </nav>
    </header>
  );
}
