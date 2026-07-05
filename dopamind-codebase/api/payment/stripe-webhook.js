// /api/stripe-webhook.js
// Vercel Serverless Function to process payments from Stripe / Razorpay Checkouts.
// Integrates with Supabase to update user subscription status.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const signature = req.headers['stripe-signature'];
  
  if (!signature) {
    return res.status(400).json({ error: 'Missing payment signature header' });
  }

  try {
    // 1. Verify webhook signature (Stripe sdk would verify signature here)
    const event = req.body; // In production: stripe.webhooks.constructEvent(req.body, signature, secret)

    console.log(`🔔 Webhook received. Event Type: ${event.type || 'unknown'}`);

    // 2. Handle relevant event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = session.client_reference_id; // Supabase user ID passed during checkout initiation
        const subscriptionId = session.subscription;

        console.log(`✅ Payment Successful for User: ${userId}. Sub ID: ${subscriptionId}`);

        // Updated user premium status in Supabase database
        await supabaseAdmin.from('profiles').update({ is_premium: true, stripe_customer_id: session.customer }).eq('id', userId);
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object;
        console.log(`❌ Subscription cancelled: ${deletedSub.id}`);
        
        // Revoked premium access in Supabase database
        await supabaseAdmin.from('profiles').update({ is_premium: false }).eq('stripe_customer_id', deletedSub.customer);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
}
