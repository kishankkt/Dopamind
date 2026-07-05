// FILE: PricingPage.jsx
// PURPOSE: Displays the free and pro tiers. Handles redirection to Stripe Checkout.
// ROUTE: /pricing
// AUTH: NOT REQUIRED to view, but REQUIRED to upgrade (redirect to auth if clicking "Upgrade" while logged out)
// FEATURES:
//   - Free Tier Column: Lists free features (15 games, basic stats, guest play)
//   - Pro Tier Column: Lists pro features (cloud backups, AI guided schedule, full history, premium badge)
//   - Uses Vercel serverless function (or direct Stripe link) to initiate checkout. (Use a hardcoded Stripe payment link if possible, passing client_reference_id=user.id)
// STATE: const { session } = useSupabaseClient (to get user.id for checkout)
// CTA: "Upgrade to Pro" button. 
// READ: src/config/brand.js — to get BrandConfig.name

import React, { useState, useEffect } from 'react';
import { BrandConfig } from '@/config/brand';
import { supabase } from '@/supabaseClient';
import './PricingPage.css';

export default function PricingPage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUpgrade = () => {
    if (!session) {
      alert("Please log in to upgrade.");
      window.location.href = "/";
      return;
    }
    
    // Using a hardcoded Stripe payment link as requested by constraints, 
    // appending client_reference_id for the webhook.
    // Replace with real payment link URL in production.
    const paymentLink = "https://buy.stripe.com/test_payment_link";
    const url = new URL(paymentLink);
    url.searchParams.set("client_reference_id", session.user.id);
    window.location.href = url.toString();
  };

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>Invest in Your Focus</h1>
        <p>Join {BrandConfig.name} and rebuild your attention span.</p>
      </div>

      <div className="pricing-grid">
        {/* Free Tier */}
        <div className="pricing-card glass-panel">
          <h2>Free</h2>
          <div className="pricing-price">
            <span className="currency">$</span>
            <span className="amount">0</span>
            <span className="period">/mo</span>
          </div>
          <p className="pricing-desc">Perfect for testing the waters.</p>
          <ul className="pricing-features">
            <li>✅ Access to 15 cognitive games</li>
            <li>✅ Basic performance stats</li>
            <li>✅ Guest play support</li>
            <li>❌ Cloud streak backups</li>
            <li>❌ AI guided schedules</li>
          </ul>
          <button className="btn-secondary" onClick={() => window.location.href = "/play"}>
            Start Playing
          </button>
        </div>

        {/* Pro Tier */}
        <div className="pricing-card glass-panel pro-card">
          <div className="pro-badge">Most Popular</div>
          <h2>Pro</h2>
          <div className="pricing-price">
            <span className="currency">$</span>
            <span className="amount">5</span>
            <span className="period">/mo</span>
          </div>
          <p className="pricing-desc">For serious brain athletes.</p>
          <ul className="pricing-features">
            <li>✅ Access to 15 cognitive games</li>
            <li>✅ Advanced full history stats</li>
            <li>✅ Cloud streak backups</li>
            <li>✅ AI guided workout schedules</li>
            <li>✅ Premium profile badge</li>
          </ul>
          <button className="btn-primary" onClick={handleUpgrade}>
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}
