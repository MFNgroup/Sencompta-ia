'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import './pricing.css';

const PLANS = [
  {
    id: 'STANDARD', label: 'Standard', price: 10000, period: 'mois',
    tagline: 'Pour commencer à organiser vos finances', color: '#4CAF7D',
    features: [
      { ok: true,  text: 'Saisie texte WhatsApp (FR & Wolof)' },
      { ok: true,  text: 'Dashboard (CA, Charges, Net)' },
      { ok: true,  text: 'Bilan du jour, semaine, mois' },
      { ok: true,  text: 'Historique 30 jours' },
      { ok: true,  text: 'Export CSV mensuel' },
      { ok: false, text: 'Saisie vocale WhatsApp' },
      { ok: false, text: 'Conseils IA personnalisés' },
      { ok: false, text: 'Graphiques avancés' },
      { ok: false, text: 'Suivi créances clients' },
      { ok: false, text: 'Bilan annuel' },
    ],
  },
  {
    id: 'PREMIUM', label: 'Premium', price: 15000, period: 'mois',
    tagline: 'Pour piloter votre business comme un pro', color: '#C9A84C', popular: true,
    features: [
      { ok: true, text: 'Tout Standard, plus :' },
      { ok: true, text: 'Saisie vocale WhatsApp' },
      { ok: true, text: 'Validation IA avant enregistrement' },
      { ok: true, text: 'Conseils stratégiques IA / semaine' },
      { ok: true, text: 'Graphiques avancés interactifs' },
      { ok: true, text: 'Score de santé financière' },
      { ok: true, text: 'Suivi créances + relances' },
      { ok: true, text: 'Historique illimité + bilan annuel' },
      { ok: true, text: 'Rappels renouvellement WhatsApp' },
      { ok: true, text: 'Support prioritaire WhatsApp' },
    ],
  },
];

const FAQ = [
  { q: 'Comment fonctionne la saisie WhatsApp ?', a: "Enregistrez notre numéro, envoyez vos opérations en texte. Ex : \"vendu tissus 25000\" ou \"jënd légumes 8500\"." },
  { q: 'Comment se passe le renouvellement ?', a: "Vous recevrez un rappel WhatsApp 3 jours avant expiration. Cliquez le lien, payez — l'abonnement est prolongé immédiatement." },
  { q: 'Mes données sont-elles conservées après expiration ?', a: "Oui. Toutes vos transactions et votre historique restent intacts." },
  { q: "Y a-t-il un engagement ?", a: "Aucun. Abonnement mensuel sans engagement." },
];

function PricingContent() {
  const searchParams  = useSearchParams();
  const paymentStatus = searchParams.get('payment');

  const [loading, setLoading]   = useState(null);
  const [showForm, setShowForm] = useState(null); // plan sélectionné
  const [phone, setPhone]       = useState('+221');
  const [error, setError]       = useState('');

  const handleSelectPlan = (planId) => {
    // Si déjà connecté → payer directement
    // Sinon → demander le numéro
    setShowForm(planId);
    setError('');
  };

  const handleCheckout = async () => {
    if (!/^\+221[0-9]{9}$/.test(phone)) {
      setError('Format invalide. Ex : +221771234567');
      return;
    }
    setLoading(showForm);
    setError('');
    try {
      const res  = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: showForm, phone }),
      });
      const data = await res.json();
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        setError(data.error || 'Erreur. Veuillez réessayer.');
      }
    } catch {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(null);
    }
  };

  const selectedPlan = PLANS.find(p => p.id === showForm);

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
          Saisie WhatsApp en français et wolof.<br />
          Paiement Wave ou Orange Money. Sans engagement.
        </p>
      </div>

      {paymentStatus === 'cancelled' && (
        <div className="alert error">Paiement annulé. Vous pouvez réessayer.</div>
      )}
      {paymentStatus === 'success' && (
        <div className="alert success">Paiement confirmé ! Vérifiez votre WhatsApp pour votre lien de connexion.</div>
      )}

      <div className="plans-grid">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`plan-card ${plan.popular ? 'popular' : ''}`} style={{ '--plan-color': plan.color }}>
            {plan.popular && <div className="popular-tag">Recommandé</div>}
            <div className="plan-label">{plan.label}</div>
            <div className="plan-tagline">{plan.tagline}</div>
            <div className="plan-price">
              <span className="price-amount">{plan.price.toLocaleString('fr-SN')}</span>
              <span className="price-currency"> FCFA</span>
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
              onClick={() => handleSelectPlan(plan.id)}
              disabled={loading === plan.id}
            >
              {loading === plan.id ? 'Redirection…' : `Choisir ${plan.label} — ${plan.price.toLocaleString('fr-SN')} FCFA`}
            </button>
          </div>
        ))}
      </div>

      {/* Modal numéro de téléphone */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)', zIndex: 200,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={e => e.target === e.currentTarget && setShowForm(null)}>
          <div style={{
            background: '#122019', border: '1px solid #1E3328',
            borderRadius: '20px 20px 0 0', padding: '28px 24px',
            width: '100%', maxWidth: 480,
          }}>
            <div style={{ width: 40, height: 4, background: '#1E3328', borderRadius: 2, margin: '0 auto 20px' }} />
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.15rem', marginBottom: 6 }}>
              Abonnement {selectedPlan?.label}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#8A9E8F', marginBottom: 20, lineHeight: 1.6 }}>
              Entrez votre numéro WhatsApp. Votre lien de connexion sera envoyé après le paiement.
            </p>

            {error && (
              <div style={{ background: 'rgba(224,123,84,0.1)', border: '1px solid rgba(224,123,84,0.3)', borderRadius: 8, padding: '10px 14px', color: '#E07B54', fontSize: '0.82rem', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, color: '#8A9E8F', marginBottom: 7 }}>
                Numéro WhatsApp
              </label>
              <input
                type="tel" value={phone} inputMode="tel"
                onChange={e => setPhone(e.target.value)}
                placeholder="+221 77 000 00 00"
                style={{ width: '100%', background: '#0D1B14', border: '1px solid #1E3328', borderRadius: 10, padding: '12px 16px', color: '#EDE8DC', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowForm(null)} style={{ padding: '14px 20px', background: 'transparent', border: '1px solid #1E3328', color: '#8A9E8F', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
                Annuler
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading === showForm}
                style={{ flex: 1, background: 'linear-gradient(135deg, #C9A84C, #A07820)', color: '#0D1B14', border: 'none', borderRadius: 10, padding: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem' }}
              >
                {loading === showForm ? 'Redirection…' : `Payer ${selectedPlan?.price.toLocaleString('fr-SN')} FCFA`}
              </button>
            </div>

            <p style={{ fontSize: '0.72rem', color: '#4A5E50', marginTop: 14, textAlign: 'center' }}>
              Paiement sécurisé via PayTech.sn · Wave · Orange Money
            </p>
          </div>
        </div>
      )}

      <div className="payment-methods">
        <p className="pm-title">Paiement sécurisé via PayTech.sn</p>
        <div className="pm-logos">
          <div className="pm-logo">Wave</div>
          <div className="pm-logo">Orange Money</div>
          <div className="pm-logo">Free Money</div>
        </div>
      </div>

      <div className="continuity-banner">
        <div className="continuity-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <div className="continuity-title">Continuité garantie</div>
          <div className="continuity-text">Rappel WhatsApp 3 jours avant expiration. Données conservées indéfiniment. Renouvellement sans coupure.</div>
        </div>
      </div>

      <div className="pwa-banner">
        <div className="pwa-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
        </div>
        <div>
          <div className="pwa-title">Accès rapide depuis votre téléphone</div>
          <div className="pwa-steps">
            <strong>iPhone :</strong> Safari → Partager → "Sur l'écran d'accueil"<br />
            <strong>Android :</strong> Chrome → menu → "Ajouter à l'écran d'accueil"
          </div>
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
