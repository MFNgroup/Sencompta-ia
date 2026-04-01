'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import './pricing.css';

const PLANS = [
  {
    id: 'STANDARD', label: 'Standard', price: 3000, period: 'mois',
    tagline: 'Pour commencer à organiser vos finances', color: '#4CAF7D',
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
    id: 'PREMIUM', label: 'Premium', price: 7500, period: 'mois',
    tagline: 'Pour piloter votre business comme un pro', color: '#C9A84C', popular: true,
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

const FAQ = [
  { q: 'Comment fonctionne la saisie WhatsApp ?', a: "Enregistrez notre numéro WhatsApp, puis envoyez vos opérations en texte ou vocal. L'IA comprend le français et le wolof." },
  { q: "Puis-je changer de plan en cours d'abonnement ?", a: "Oui. Passer au Premium prolonge votre accès Premium immédiatement." },
  { q: 'Mes données sont-elles sécurisées ?', a: "Vos données sont hébergées en Europe sur des serveurs sécurisés. La connexion est chiffrée (HTTPS)." },
  { q: 'Y a-t-il un engagement minimum ?', a: "Aucun. Chaque abonnement est mensuel et sans engagement." },
];

function PricingContent() {
  const searchParams  = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (planId) => {
    setLoading(planId);
    try {
      const res  = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: planId }) });
      const data = await res.json();
      if (data.redirect_url)            window.location.href = data.redirect_url;
      else if (data.error === 'Non authentifié') window.location.href = '/auth/login';
      else alert('Erreur lors de la redirection. Veuillez réessayer.');
    } catch { alert('Erreur réseau.'); }
    finally  { setLoading(null); }
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
        <h1 className="pricing-title">Gérez votre boutique<br /><em>comme un expert-comptable</em></h1>
        <p className="pricing-sub">Saisie WhatsApp en français et wolof, analyse IA Gemini. Paiement Wave ou Orange Money.</p>
      </div>

      {paymentStatus === 'cancelled' && (
        <div className="alert error">✕ Le paiement a été annulé. Vous pouvez réessayer quand vous voulez.</div>
      )}

      <div className="plans-grid">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`plan-card ${plan.popular ? 'popular' : ''}`} style={{ '--plan-color': plan.color }}>
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
            <button className={`btn-plan ${plan.popular ? 'primary' : 'secondary'}`} onClick={() => handleCheckout(plan.id)} disabled={loading === plan.id}>
              {loading === plan.id ? '⌛ Redirection…' : `Choisir ${plan.label} — ${plan.price.toLocaleString('fr-SN')} FCFA`}
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
        {FAQ.map((item, i) => (
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
    <Suspense fallback={<div style={{ background: '#0D1B14', minHeight: '100vh' }} />}>
      <PricingContent />
    </Suspense>
  );
}
