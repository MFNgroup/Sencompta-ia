// app/pricing/page.jsx
'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const PLANS = [
  {
    id:       'STANDARD',
    label:    'Standard',
    price:    3000,
    period:   'mois',
    tagline:  'Pour commencer à organiser vos finances',
    color:    '#4CAF7D',
    features: [
      { ok: true,  text: 'Saisie texte via WhatsApp (FR & Wolof)' },
      { ok: true,  text: 'Dashboard de base (CA, Charges, Net)' },
      { ok: true,  text: 'Historique 30 jours' },
      { ok: true,  text: 'Export CSV mensuel' },
      { ok: false, text: 'Saisie vocale WhatsApp' },
      { ok: false, text: 'Validation IA des transactions' },
      { ok: false, text: 'Conseils financiers personnalisés' },
      { ok: false, text: 'Graphiques avancés (AreaChart, PieChart)' },
      { ok: false, text: 'Suivi des créances clients' },
    ],
  },
  {
    id:       'PREMIUM',
    label:    'Premium',
    price:    7500,
    period:   'mois',
    tagline:  'Pour piloter votre business comme un pro',
    color:    '#C9A84C',
    popular:  true,
    features: [
      { ok: true, text: 'Tout Standard, plus :' },
      { ok: true, text: 'Saisie vocale WhatsApp 🎙️' },
      { ok: true, text: 'Validation IA avant enregistrement' },
      { ok: true, text: '3 conseils stratégiques IA / semaine' },
      { ok: true, text: 'Graphiques avancés interactifs' },
      { ok: true, text: 'Score de santé financière' },
      { ok: true, text: 'Suivi des créances + relances' },
      { ok: true, text: 'Historique illimité' },
      { ok: true, text: 'Support prioritaire WhatsApp' },
    ],
  },
];

function PricingContent() {
  const searchParams  = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (planId) => {
    setLoading(planId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else if (data.error === 'Non authentifié') {
        window.location.href = '/auth/login';
      } else {
        alert('Erreur lors de la redirection. Veuillez réessayer.');
      }
    } catch {
      alert('Erreur réseau.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="pricing-page">
      <nav className="top-nav">
        <a href="/" className="nav-logo">SenCompta IA</a>
        <div className="nav-links">
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="/auth/login" className="nav-cta">Connexion</a>
        </div>
      </nav>

      <div className="pricing-header">
        <div className="pricing-eyebrow">Abonnements</div>
        <h1 className="pricing-title">
          Gérez votre boutique<br />
          <em>comme un expert-comptable</em>
        </h1>
        <p className="pricing-sub">
          Saisie WhatsApp en français et wolof, analyse IA Gemini, conseils personnalisés. Paiement Wave ou Orange Money.
        </p>
      </div>

      {paymentStatus === 'cancelled' && (
        <div className="alert error">
          ✕ Le paiement a été annulé. Vous pouvez réessayer quand vous voulez.
        </div>
      )}

      <div className="plans-grid">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.popular ? 'popular' : ''}`}
            style={{ '--plan-color': plan.color }}
          >
            {plan.popular && <div className="popular-tag">⭐ Recommandé</div>}
            <div className="plan-label">{plan.label}</div>
            <div className="plan-tagline">{plan.tagline}</div>
            <div className="plan-price">
              <span className="price-amount">{plan.price.toLocaleString('fr-SN')}</span>
              <span className="price-currency">FCFA</span>
              <span className="price-period">/{plan.period}</span>
            </div>
            <div className="plan-features">
              {plan.features.map((f, i) => (
                <div key={i} className="feature-row">
                  <span className={`feature-check ${f.ok ? 'ok' : 'no'}`}>{f.ok ? '✓' : '–'}</span>
                  <span className={`feature-text ${f.ok ? '' : 'no'}`}>{f.text}</span>
                </div>
              ))}
            </div>
            <button
              className={`btn-plan ${plan.popular ? 'primary' : 'secondary'}`}
              onClick={() => handleCheckout(plan.id)}
              disabled={loading === plan.id}
            >
              {loading === plan.id
                ? '⌛ Redirection…'
                : `Choisir ${plan.label} — ${plan.price.toLocaleString('fr-SN')} FCFA`}
            </button>
          </div>
        ))}
      </div>

      <div className="payment-methods">
        <p className="pm-title">Paiement sécurisé via PayTech.sn</p>
        <div className="pm-logos">
          <div className="pm-logo">🌊 Wave</div>
          <div className="pm-logo">🟠 Orange Money</div>
          <div className="pm-logo">🆓 Free Money</div>
        </div>
      </div>

      <div className="faq">
        <h2 className="faq-title">Questions fréquentes</h2>
        {[
          { q: 'Comment fonctionne la saisie WhatsApp ?', a: "Enregistrez notre numéro WhatsApp, puis envoyez vos opérations en texte ou vocal. L'IA comprend le français et le wolof. Ex : \"vendu tissus 25000\" ou \"bind légumes 8500\"." },
          { q: "Puis-je changer de plan en cours d'abonnement ?", a: "Oui. Passer au Premium prolonge votre accès Premium immédiatement. Le reliquat de votre plan Standard est pris en compte." },
          { q: 'Mes données sont-elles sécurisées ?', a: "Vos données sont hébergées en Europe sur des serveurs sécurisés. La connexion est chiffrée (HTTPS). Nous n'accédons jamais à vos données sans votre accord." },
          { q: 'Y a-t-il un engagement minimum ?', a: "Aucun. Chaque abonnement est mensuel et sans engagement. Vous pouvez arrêter à tout moment." },
        ].map((item, i) => (
          <div key={i} className="faq-item">
            <div className="faq-q">{item.q}</div>
            <div className="faq-a">{item.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=IBM+Plex+Sans:wght@400;500;600&family=DM+Mono:wght@500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D1B14; color: #EDE8DC; font-family: 'IBM Plex Sans', sans-serif; }
        .pricing-page { min-height: 100vh; padding: 60px 24px; }
        .pricing-header { text-align: center; max-width: 600px; margin: 0 auto 56px; }
        .pricing-eyebrow { display: inline-block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: #C9A84C; background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.25); padding: 4px 14px; border-radius: 20px; margin-bottom: 16px; }
        .pricing-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3rem); line-height: 1.15; margin-bottom: 12px; }
        .pricing-title em { font-style: italic; color: #C9A84C; }
        .pricing-sub { font-size: 0.95rem; color: #8A9E8F; line-height: 1.6; }
        .alert { max-width: 480px; margin: 0 auto 32px; padding: 12px 18px; border-radius: 10px; font-size: 0.85rem; text-align: center; }
        .alert.error { background: rgba(224,123,84,0.1); border: 1px solid rgba(224,123,84,0.3); color: #E07B54; }
        .plans-grid { display: flex; gap: 24px; justify-content: center; max-width: 900px; margin: 0 auto; flex-wrap: wrap; }
        .plan-card { flex: 1; min-width: 280px; max-width: 400px; background: #122019; border: 1px solid #1E3328; border-radius: 20px; padding: 36px 32px; position: relative; overflow: hidden; transition: transform 0.25s; }
        .plan-card:hover { transform: translateY(-4px); }
        .plan-card.popular { border-color: rgba(201,168,76,0.5); background: linear-gradient(160deg, #1A2E20, #122019); }
        .plan-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--plan-color); }
        .popular-tag { position: absolute; top: 20px; right: 20px; background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.35); color: #C9A84C; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1.5px; padding: 3px 10px; border-radius: 20px; }
        .plan-label { font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 4px; }
        .plan-tagline { font-size: 0.8rem; color: #8A9E8F; margin-bottom: 24px; }
        .plan-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid #1E3328; }
        .price-amount { font-family: 'DM Mono', monospace; font-size: 2.4rem; color: var(--plan-color); }
        .price-currency { font-size: 1rem; color: #8A9E8F; }
        .price-period { font-size: 0.8rem; color: #8A9E8F; }
        .plan-features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
        .feature-row { display: flex; align-items: flex-start; gap: 10px; font-size: 0.85rem; }
        .feature-check { flex-shrink: 0; margin-top: 2px; }
        .feature-check.ok { color: var(--plan-color); }
        .feature-check.no { color: #1E3328; }
        .feature-text.no { color: #3A5040; }
        .btn-plan { width: 100%; padding: 14px; border-radius: 12px; border: none; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .btn-plan.primary { background: linear-gradient(135deg, #C9A84C, #A07820); color: #0D1B14; }
        .btn-plan.primary:hover:not(:disabled) { opacity: 0.88; }
        .btn-plan.secondary { background: rgba(76,175,125,0.1); border: 1px solid rgba(76,175,125,0.35); color: #4CAF7D; }
        .btn-plan.secondary:hover:not(:disabled) { background: rgba(76,175,125,0.18); }
        .btn-plan:disabled { opacity: 0.5; cursor: not-allowed; }
        .payment-methods { text-align: center; margin-top: 40px; }
        .pm-title { font-size: 0.75rem; color: #8A9E8F; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
        .pm-logos { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
        .pm-logo { background: #122019; border: 1px solid #1E3328; border-radius: 8px; padding: 8px 16px; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 6px; }
        .faq { max-width: 640px; margin: 56px auto 0; }
        .
