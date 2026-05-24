'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

const FEATURES = [
  { title: 'Saisie WhatsApp', desc: 'Envoyez vos transactions en français ou wolof. "Vendu tissus 25 000" suffit — l\'IA classe et enregistre automatiquement.', icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' },
  { title: 'Conseils IA personnalisés', desc: 'Analyse de vos données réelles. Tendances, alertes trésorerie, recommandations actionnables — chaque semaine.', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { title: 'Dashboard temps réel', desc: 'CA, charges, net, créances. Graphiques clairs sur mobile. Export PDF d\'un tap.', icon: 'M18 20V10M12 20V4M6 20v-6' },
  { title: 'Factures conformes DGI', desc: 'Générez des factures NINEA/TVA valides. Export PDF professionnel. Conformité loi 2026 incluse.', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
  { title: 'Suivi des créances', desc: 'Qui vous doit combien, depuis quand. Alertes automatiques avant les échéances sur WhatsApp.', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  { title: 'Messages vocaux', desc: 'Parlez, SenCompta transcrit et enregistre. Même mains occupées, même en mouvement.', icon: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8' },
];

const STEPS = [
  { n: '01', title: 'Choisissez votre plan', desc: 'Gratuit pour démarrer. Standard à 10 000 FCFA pour le dashboard complet. Paiement Wave ou Orange Money.' },
  { n: '02', title: 'Recevez votre accès', desc: 'Un lien de connexion sécurisé est envoyé sur votre WhatsApp dans les secondes qui suivent.' },
  { n: '03', title: 'Gérez comme un pro', desc: 'Envoyez vos transactions, consultez votre bilan, émettez des factures — tout depuis votre téléphone.' },
];

const MSGS = [
  { from: 'user', text: 'vendu tissus wax 45 000' },
  { from: 'bot',  text: '✓ Recette enregistrée\n45 000 FCFA · Vente marchandises\n\nCA ce mois : 380 000 FCFA (+12%)' },
  { from: 'user', text: 'mon solde' },
  { from: 'bot',  text: 'Bilan — ce mois\n\nRecettes : 380 000 FCFA\nDépenses : 142 000 FCFA\nNet : +238 000 FCFA' },
];

export default function LandingPage() {
  const heroRef    = useRef(null);
  const orbRef1    = useRef(null);
  const orbRef2    = useRef(null);
  const orbRef3    = useRef(null);
  const featRef    = useRef(null);
  const stepsRef   = useRef(null);
  const statsRef   = useRef(null);
  const navRef     = useRef(null);
  const counterRefs = useRef([]);

  useEffect(() => {
    let ctx;
    (async () => {
      const { gsap }          = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {

        // ── NAV scroll effect
        ScrollTrigger.create({
          start: 'top -60',
          onUpdate: (self) => {
            if (navRef.current) {
              navRef.current.style.background = self.progress > 0
                ? 'rgba(7,16,10,0.96)'
                : 'transparent';
              navRef.current.style.borderBottomColor = self.progress > 0
                ? '#1A2E20'
                : 'transparent';
            }
          },
        });

        // ── HERO entrance
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('.hero-eyebrow',  { y: 20, opacity: 0, duration: 0.7 })
          .from('.hero-h1 .line', { y: 60, opacity: 0, duration: 0.8, stagger: 0.12 }, '-=0.3')
          .from('.hero-sub',      { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
          .from('.hero-ctas',     { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
          .from('.hero-trust',    { y: 10, opacity: 0, duration: 0.5 }, '-=0.2')
          .from('.mockup-wrap',   { x: 60, opacity: 0, duration: 0.9, ease: 'power2.out' }, '-=0.9');

        // ── ORB floating
        gsap.to(orbRef1.current, { y: -28, x: 12, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to(orbRef2.current, { y: 22, x: -18, duration: 6.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 });
        gsap.to(orbRef3.current, { y: -16, x: 8, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 });

        // ── Mouse parallax on hero orbs
        const hero = heroRef.current;
        if (hero) {
          hero.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
            const dx = (clientX - cx) / cx, dy = (clientY - cy) / cy;
            gsap.to(orbRef1.current, { x: dx * 30, y: dy * 20, duration: 1.5, ease: 'power2.out' });
            gsap.to(orbRef2.current, { x: dx * -20, y: dy * 15, duration: 2, ease: 'power2.out' });
          });
        }

        // ── STATS counter
        if (statsRef.current) {
          ScrollTrigger.create({
            trigger: statsRef.current,
            start: 'top 80%',
            once: true,
            onEnter: () => {
              counterRefs.current.forEach((el) => {
                if (!el) return;
                const target = parseInt(el.dataset.target, 10);
                const suffix = el.dataset.suffix || '';
                gsap.fromTo({ val: 0 }, { val: target },
                  {
                    duration: 1.8, ease: 'power2.out',
                    onUpdate: function () { el.textContent = Math.round(this.targets()[0].val).toLocaleString('fr-SN') + suffix; },
                  }
                );
              });
            },
          });
        }

        // ── FEATURE cards
        if (featRef.current) {
          gsap.from('.feat-card', {
            scrollTrigger: { trigger: featRef.current, start: 'top 75%' },
            y: 50, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          });
        }

        // ── STEPS
        if (stepsRef.current) {
          gsap.from('.step-item', {
            scrollTrigger: { trigger: stepsRef.current, start: 'top 75%' },
            x: -40, opacity: 0, duration: 0.7, stagger: 0.2, ease: 'power2.out',
          });
        }

        // ── CTA section
        gsap.from('.cta-content', {
          scrollTrigger: { trigger: '.cta-section', start: 'top 75%' },
          y: 40, opacity: 0, duration: 0.8, ease: 'power2.out',
        });

      });
    })();
    return () => ctx?.revert();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap');
        :root {
          --bg: #07100A; --s1: #0B1710; --s2: #0F1E13; --brd: #182A1C;
          --gold: #C9A84C; --gold2: #E8C97D; --gold-dim: rgba(201,168,76,0.10);
          --green: #1D9E75; --green2: #3ED98A; --red: #F06543;
          --txt: #EDE5CC; --txt2: #7A9A82; --txt3: #3A5040; --r: 16px;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--txt); font-family: 'Outfit', sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

        /* NAV */
        .lp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 18px 40px; display: flex; align-items: center; justify-content: space-between; transition: background 0.3s, border-bottom-color 0.3s; border-bottom: 1px solid transparent; backdrop-filter: blur(0px); }
        .lp-nav[data-scroll="true"] { backdrop-filter: blur(12px); }
        .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 600; color: var(--gold); text-decoration: none; letter-spacing: -0.01em; }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link { font-size: 0.85rem; color: var(--txt2); text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: var(--txt); }
        .nav-cta { padding: 9px 20px; background: var(--gold-dim); border: 1px solid rgba(201,168,76,0.35); color: var(--gold); border-radius: 10px; font-size: 0.85rem; font-weight: 600; text-decoration: none; transition: all 0.2s; }
        .nav-cta:hover { background: rgba(201,168,76,0.18); }

        /* HERO */
        .hero { min-height: 100vh; display: flex; align-items: center; position: relative; overflow: hidden; padding: 120px 40px 80px; }
        .hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 60% 40%, rgba(29,158,117,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 20% 70%, rgba(201,168,76,0.05) 0%, transparent 60%); pointer-events: none; }
        .hero-grid { position: absolute; inset: 0; background-image: repeating-linear-gradient(0deg, transparent, transparent 47px, var(--brd) 48px), repeating-linear-gradient(90deg, transparent, transparent 47px, var(--brd) 48px); opacity: 0.2; pointer-events: none; }
        .orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(60px); will-change: transform; }
        .hero-inner { max-width: 1200px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 1fr 420px; gap: 64px; align-items: center; position: relative; z-index: 1; }
        .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--green2); background: rgba(62,217,138,0.08); border: 1px solid rgba(62,217,138,0.25); padding: 5px 14px 5px 10px; border-radius: 30px; margin-bottom: 24px; }
        .eyebrow-dot { width: 6px; height: 6px; background: var(--green2); border-radius: 50%; animation: pulse-dot 2s infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
        .hero-h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(3rem, 6vw, 5.2rem); font-weight: 600; line-height: 1.08; letter-spacing: -0.02em; margin-bottom: 24px; overflow: hidden; }
        .hero-h1 .line { display: block; }
        .hero-h1 em { font-style: italic; color: var(--gold); }
        .hero-sub { font-size: clamp(1rem, 1.5vw, 1.1rem); color: var(--txt2); line-height: 1.75; max-width: 480px; margin-bottom: 36px; font-weight: 300; }
        .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 44px; }
        .btn-primary { padding: 14px 28px; background: linear-gradient(135deg, var(--gold), #A07820); color: #0D1B14; border-radius: 12px; font-weight: 700; font-size: 0.95rem; text-decoration: none; transition: all 0.2s; white-space: nowrap; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,0.25); }
        .btn-secondary { padding: 14px 28px; background: transparent; border: 1px solid var(--brd); color: var(--txt); border-radius: 12px; font-size: 0.95rem; text-decoration: none; transition: all 0.2s; white-space: nowrap; }
        .btn-secondary:hover { border-color: var(--green); color: var(--green2); }
        .hero-trust { display: flex; align-items: center; gap: 10px; font-size: 0.78rem; color: var(--txt3); }
        .trust-dot { width: 4px; height: 4px; background: var(--txt3); border-radius: 50%; }

        /* MOCKUP */
        .mockup-wrap { position: relative; }
        .phone-frame { background: #0D1A0F; border: 1.5px solid #243B2A; border-radius: 28px; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(62,217,138,0.08); }
        .phone-top { background: #0A1510; padding: 16px 20px 12px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #1A2E1E; }
        .phone-avatar { width: 36px; height: 36px; background: var(--green); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .phone-info { flex: 1; }
        .phone-name { font-size: 0.85rem; font-weight: 600; color: var(--txt); }
        .phone-status { font-size: 0.7rem; color: var(--green2); }
        .phone-body { padding: 16px 14px; display: flex; flex-direction: column; gap: 10px; min-height: 280px; }
        .msg { max-width: 78%; padding: 10px 14px; border-radius: 14px; font-size: 0.82rem; line-height: 1.55; white-space: pre-line; }
        .msg.user { align-self: flex-end; background: rgba(29,158,117,0.18); border: 1px solid rgba(29,158,117,0.25); color: var(--txt); border-bottom-right-radius: 4px; }
        .msg.bot { align-self: flex-start; background: #122019; border: 1px solid #1A3025; color: var(--txt2); border-bottom-left-radius: 4px; }
        .phone-input { background: #0A1510; border-top: 1px solid #1A2E1E; padding: 12px 16px; display: flex; align-items: center; gap: 10px; }
        .phone-inp-fake { flex: 1; background: #122019; border-radius: 20px; padding: 8px 14px; font-size: 0.75rem; color: #3A5040; font-family: inherit; }
        .mockup-glow { position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%); width: 200px; height: 100px; background: var(--green); opacity: 0.06; border-radius: 50%; filter: blur(40px); pointer-events: none; }

        /* STATS */
        .stats-bar { padding: 40px 40px; border-top: 1px solid var(--brd); border-bottom: 1px solid var(--brd); background: var(--s1); }
        .stats-inner { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
        .stat-item { text-align: center; }
        .stat-num { font-family: 'Syne', sans-serif; font-size: 2.2rem; font-weight: 700; color: var(--txt); }
        .stat-label { font-size: 0.78rem; color: var(--txt2); margin-top: 4px; }

        /* FEATURES */
        .section { padding: 100px 40px; }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-eyebrow { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gold); margin-bottom: 12px; }
        .section-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 600; line-height: 1.15; margin-bottom: 16px; }
        .section-sub { color: var(--txt2); font-size: 1rem; font-weight: 300; max-width: 520px; line-height: 1.7; margin-bottom: 56px; }
        .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .feat-card { background: var(--s1); border: 1px solid var(--brd); border-radius: 20px; padding: 28px 24px; transition: border-color 0.25s, transform 0.25s; cursor: default; }
        .feat-card:hover { border-color: rgba(29,158,117,0.4); transform: translateY(-4px); }
        .feat-icon { width: 44px; height: 44px; background: rgba(29,158,117,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--green2); margin-bottom: 18px; }
        .feat-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 600; margin-bottom: 8px; }
        .feat-desc { font-size: 0.85rem; color: var(--txt2); line-height: 1.7; font-weight: 300; }

        /* HOW IT WORKS */
        .how-section { padding: 100px 40px; background: var(--s1); }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-top: 56px; }
        .step-item { position: relative; }
        .step-num { font-family: 'Syne', sans-serif; font-size: 3.5rem; font-weight: 800; color: var(--brd); line-height: 1; margin-bottom: 16px; }
        .step-title { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 600; margin-bottom: 10px; }
        .step-desc { font-size: 0.875rem; color: var(--txt2); line-height: 1.7; font-weight: 300; }
        .step-line { position: absolute; top: 28px; right: -20px; width: 40px; height: 1px; background: var(--brd); }

        /* PRICING TEASER */
        .pricing-teaser { padding: 100px 40px; }
        .plans-row { display: grid; grid-template-columns: 0.8fr 1fr 1.1fr; gap: 16px; margin-top: 48px; }
        .plan-mini { background: var(--s1); border: 1px solid var(--brd); border-radius: 20px; padding: 28px 24px; position: relative; overflow: hidden; transition: transform 0.2s; }
        .plan-mini:hover { transform: translateY(-3px); }
        .plan-mini.featured { border-color: rgba(201,168,76,0.4); background: linear-gradient(160deg, #1A2E20, #122019); }
        .plan-mini::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
        .plan-mini.free-plan::before { background: var(--txt3); }
        .plan-mini.standard::before { background: var(--green); }
        .plan-mini.featured::before { background: linear-gradient(90deg, var(--gold), var(--gold2)); }
        .plan-badge { position: absolute; top: 16px; right: 16px; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em; padding: 3px 9px; border-radius: 20px; font-weight: 600; }
        .plan-name { font-family: 'Cormorant Garamond', serif; font-size: 1.35rem; font-weight: 600; margin-bottom: 4px; }
        .plan-price-mini { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; margin: 12px 0 4px; }
        .plan-price-sub { font-size: 0.75rem; color: var(--txt2); margin-bottom: 20px; }
        .plan-mini-feat { font-size: 0.82rem; color: var(--txt2); line-height: 1.7; margin-bottom: 20px; font-weight: 300; }
        .plan-link { display: block; text-align: center; padding: 11px; border-radius: 10px; font-size: 0.875rem; font-weight: 600; text-decoration: none; transition: all 0.2s; }
        .plan-link.free { background: transparent; border: 1px solid var(--brd); color: var(--txt2); }
        .plan-link.std { background: rgba(29,158,117,0.12); border: 1px solid rgba(29,158,117,0.3); color: var(--green2); }
        .plan-link.prem { background: linear-gradient(135deg, var(--gold), #A07820); color: #0D1B14; }

        /* CTA */
        .cta-section { padding: 120px 40px; text-align: center; position: relative; overflow: hidden; }
        .cta-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(29,158,117,0.08) 0%, transparent 70%); pointer-events: none; }
        .cta-content { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
        .cta-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 600; line-height: 1.1; margin-bottom: 20px; }
        .cta-sub { color: var(--txt2); font-size: 1.05rem; font-weight: 300; line-height: 1.7; margin-bottom: 36px; }
        .cta-ctas { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

        /* FOOTER */
        .lp-footer { background: var(--s1); border-top: 1px solid var(--brd); padding: 40px 40px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 600; color: var(--gold); }
        .footer-links { display: flex; gap: 24px; }
        .footer-link { font-size: 0.8rem; color: var(--txt3); text-decoration: none; }
        .footer-link:hover { color: var(--txt2); }
        .footer-copy { font-size: 0.75rem; color: var(--txt3); }

        @media (max-width: 900px) {
          .lp-nav { padding: 16px 20px; }
          .nav-links .nav-link { display: none; }
          .hero { padding: 100px 20px 60px; }
          .hero-inner { grid-template-columns: 1fr; gap: 40px; }
          .mockup-wrap { max-width: 340px; margin: 0 auto; }
          .stats-bar { padding: 32px 20px; }
          .stats-inner { grid-template-columns: repeat(2,1fr); gap: 24px; }
          .section, .how-section, .pricing-teaser, .cta-section { padding: 60px 20px; }
          .feat-grid { grid-template-columns: 1fr; gap: 14px; }
          .steps-grid { grid-template-columns: 1fr; gap: 28px; }
          .step-line { display: none; }
          .plans-row { grid-template-columns: 1fr; }
          .plan-mini.free-plan { order: 3; }
          .lp-footer { padding: 28px 20px; }
          .footer-inner { flex-direction: column; gap: 12px; text-align: center; }
          .footer-links { justify-content: center; }
        }
      `}</style>

      {/* NAV */}
      <nav className="lp-nav" ref={navRef} style={{ background: 'transparent', borderBottomColor: 'transparent' }}>
        <a href="/" className="nav-logo">SenCompta IA</a>
        <div className="nav-links">
          <a href="#features"  className="nav-link">Fonctionnalités</a>
          <a href="#how"       className="nav-link">Comment ça marche</a>
          <a href="/pricing"   className="nav-link">Tarifs</a>
          <a href="/auth/login" className="nav-cta">Connexion</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" ref={heroRef} id="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div ref={orbRef1} className="orb" style={{ width:500, height:500, top:'-10%', right:'5%', background:'rgba(29,158,117,0.12)' }} />
        <div ref={orbRef2} className="orb" style={{ width:350, height:350, bottom:'5%', left:'-5%', background:'rgba(201,168,76,0.08)' }} />
        <div ref={orbRef3} className="orb" style={{ width:200, height:200, top:'40%', right:'30%', background:'rgba(62,217,138,0.06)' }} />

        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">
              <div className="eyebrow-dot" />
              Comptabilité intelligente · Dakar
            </div>
            <h1 className="hero-h1">
              <span className="line">Gérez vos finances</span>
              <span className="line">depuis <em>WhatsApp.</em></span>
              <span className="line">En wolof.</span>
            </h1>
            <p className="hero-sub">
              SenCompta IA enregistre vos transactions, génère vos bilans et crée vos factures DGI — directement depuis WhatsApp, en français ou en wolof.
            </p>
            <div className="hero-ctas">
              <a href="/pricing"   className="btn-primary">Commencer gratuitement</a>
              <a href="#features" className="btn-secondary">Découvrir</a>
            </div>
            <div className="hero-trust">
              <span>Sans engagement</span>
              <div className="trust-dot" />
              <span>Paiement Wave & Orange Money</span>
              <div className="trust-dot" />
              <span>Conforme DGI 2026</span>
            </div>
          </div>

          {/* MOCKUP */}
          <div className="mockup-wrap">
            <div className="phone-frame">
              <div className="phone-top">
                <div className="phone-avatar">S</div>
                <div className="phone-info">
                  <div className="phone-name">SenCompta IA</div>
                  <div className="phone-status">En ligne</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3ED98A" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>
              </div>
              <div className="phone-body">
                {MSGS.map((m, i) => (
                  <div key={i} className={`msg ${m.from}`}>{m.text}</div>
                ))}
              </div>
              <div className="phone-input">
                <div className="phone-inp-fake">Écrivez un message...</div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </div>
            </div>
            <div className="mockup-glow" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar" ref={statsRef}>
        <div className="stats-inner">
          {[
            { n: 400, s: 'k+', label: 'Marchands sénégalais' },
            { n: 76, s: '%', label: 'Entreprises individuelles' },
            { n: 10, s: ' 000', label: 'FCFA/mois — plan Standard' },
            { n: 2026, s: '', label: 'Conformité DGI obligatoire' },
          ].map((s, i) => (
            <div key={i} className="stat-item">
              <div className="stat-num" ref={el => counterRefs.current[i] = el} data-target={s.n} data-suffix={s.s}>{s.n}{s.s}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="section" id="features" ref={featRef}>
        <div className="section-inner">
          <div className="section-eyebrow">Fonctionnalités</div>
          <h2 className="section-title">Tout ce dont votre boutique a besoin</h2>
          <p className="section-sub">Conçu pour les commerçants sénégalais. Simple comme envoyer un message.</p>
          <div className="feat-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feat-card">
                <div className="feat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon}/></svg>
                </div>
                <div className="feat-title">{f.title}</div>
                <p className="feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how" ref={stepsRef}>
        <div className="section-inner">
          <div className="section-eyebrow">Comment ça marche</div>
          <h2 className="section-title">Opérationnel en 5 minutes</h2>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} className="step-item">
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <p className="step-desc">{s.desc}</p>
                {i < STEPS.length - 1 && <div className="step-line" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="pricing-teaser" id="pricing">
        <div className="section-inner">
          <div className="section-eyebrow">Abonnements</div>
          <h2 className="section-title">Commencez gratuitement, évoluez à votre rythme</h2>
          <div className="plans-row">
            <div className="plan-mini free-plan">
              <div className="plan-name">Gratuit</div>
              <div className="plan-price-mini" style={{ color:'#3A5040' }}>0 FCFA</div>
              <div className="plan-price-sub">pour toujours</div>
              <div className="plan-mini-feat">Bot WhatsApp · 20 transactions/mois · Balance simple</div>
              <a href="/auth/login" className="plan-link free">Commencer</a>
            </div>
            <div className="plan-mini standard">
              <div className="plan-name">Standard</div>
              <div className="plan-price-mini" style={{ color:'var(--green2)' }}>10 000 FCFA</div>
              <div className="plan-price-sub">par mois · sans engagement</div>
              <div className="plan-mini-feat">Dashboard complet · Factures DGI · Créances · Conseils IA · Export PDF</div>
              <a href="/pricing" className="plan-link std">Choisir Standard</a>
            </div>
            <div className="plan-mini featured">
              <div className="plan-badge" style={{ background:'rgba(201,168,76,0.12)', color:'var(--gold)', border:'1px solid rgba(201,168,76,0.3)' }}>Recommandé</div>
              <div className="plan-name">Premium</div>
              <div className="plan-price-mini" style={{ color:'var(--gold)' }}>20 000 FCFA</div>
              <div className="plan-price-sub">par mois · sans engagement</div>
              <div className="plan-mini-feat">Tout Standard + multi-boutique · Intégration Wave · Scoring crédit · Support prioritaire</div>
              <a href="/pricing" className="plan-link prem">Choisir Premium</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-bg" />
        <div className="cta-content">
          <h2 className="cta-title">Votre boutique mérite mieux qu'un cahier.</h2>
          <p className="cta-sub">Rejoignez les commerçants sénégalais qui gèrent leurs finances comme des professionnels — depuis WhatsApp.</p>
          <div className="cta-ctas">
            <a href="/pricing"    className="btn-primary">Voir les offres</a>
            <a href="/auth/login" className="btn-secondary">Connexion</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="footer-inner">
          <div className="footer-logo">SenCompta IA</div>
          <div className="footer-links">
            <a href="/mentions-legales"  className="footer-link">Mentions légales</a>
            <a href="/confidentialite"   className="footer-link">Confidentialité</a>
            <a href="/pricing"           className="footer-link">Tarifs</a>
            <a href="/auth/login"        className="footer-link">Connexion</a>
          </div>
          <div className="footer-copy">© {new Date().getFullYear()} SenCompta IA · Dakar, Sénégal</div>
        </div>
      </footer>
    </>
  );
}
