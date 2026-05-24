'use client';
import { useEffect, useRef, useState } from 'react';

/* ─── DATA ─────────────────────────────────────────────────────── */
const FEATURES = [
  { num:'01', title:'Saisie WhatsApp', desc:'Tapez ou dictez en français ou wolof. "Vendu tissus wax 45 000" — l\'IA classe, catégorise et enregistre en moins d\'une seconde.', tag:'Reconnaissance naturelle' },
  { num:'02', title:'Bilan instantané', desc:'Votre chiffre d\'affaires, charges et bénéfice net du jour, de la semaine ou du mois — en réponse à un simple message.', tag:'Données en temps réel' },
  { num:'03', title:'Factures DGI', desc:'Générez des factures NINEA/TVA valides conformes à la loi 2025-02. PDF professionnel, numérotation automatique.', tag:'Conformité 2026' },
  { num:'04', title:'Créances actives', desc:'Qui vous doit combien, depuis quand. Alertes automatiques sur WhatsApp avant les échéances.', tag:'Gestion du risque' },
  { num:'05', title:'Conseils IA', desc:'Analyse de vos tendances réelles. Alertes trésorerie, optimisations, recommandations actionnables chaque semaine.', tag:'Intelligence prédictive' },
  { num:'06', title:'Messages vocaux', desc:'Parlez, SenCompta transcrit et enregistre. Mains libres, même en déplacement, même au marché.', tag:'Accessibilité totale' },
];

const STATS = [
  { val:400, suffix:'k+', label:'Commerçants sénégalais' },
  { val:76,  suffix:'%',  label:'Entreprises individuelles' },
  { val:20,  suffix:'s',  label:'Pour enregistrer une transaction' },
  { val:10,  suffix:'k',  label:'FCFA/mois plan Standard' },
];

const MARQUEE = ['WhatsApp','Wolof','Français','DGI 2026','IA Gemini','Sénégal','SYSCOHADA','Facturation','Trésorerie','Créances','Dashboard','Export PDF'];

const MSGS_SEQUENCE = [
  { from:'user', text:'Vendu tissus wax 45 000' },
  { from:'bot',  text:'✓ Recette enregistrée\n45 000 FCFA · Vente marchandises\n\nCA ce mois : 380 000 FCFA', delay:900 },
  { from:'user', text:'waaw, et mes dettes?', delay:1800 },
  { from:'bot',  text:'Créances actives — 3 clients\n\nAminata · 25 000 FCFA\nIbrahima · 18 500 FCFA\nMoussa · 12 000 FCFA\n\nTotal : 55 500 FCFA', delay:2800 },
  { from:'user', text:'mon bilan du mois', delay:4200 },
  { from:'bot',  text:'Bilan — ce mois\n\nRecettes  380 000 FCFA\nDépenses  142 000 FCFA\n━━━━━━━━━━━━━━\nNet       +238 000 FCFA', delay:5300 },
];

/* ─── COMPONENT ─────────────────────────────────────────────────── */
export default function LandingPage() {
  const [preloaded, setPreloaded]     = useState(false);
  const [msgs, setMsgs]               = useState([]);
  const [typing, setTyping]           = useState(false);
  const preloaderRef  = useRef(null);
  const heroRef       = useRef(null);
  const featPinRef    = useRef(null);
  const featTrackRef  = useRef(null);
  const statsRef      = useRef(null);
  const counterRefs   = useRef([]);
  const canvasRef     = useRef(null);
  const navRef        = useRef(null);
  const ctxRef        = useRef(null);

  /* Grain canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;
    let frame;
    const draw = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const img = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 20;
        img.data[i] = img.data[i+1] = img.data[i+2] = v;
        img.data[i+3] = 18;
      }
      ctx.putImageData(img, 0, 0);
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  /* WhatsApp messages sequence */
  useEffect(() => {
    const timers = [];
    MSGS_SEQUENCE.forEach((m, i) => {
      if (i === 0) { setMsgs([m]); return; }
      const t1 = setTimeout(() => setTyping(true), (m.delay || 0) - 300);
      const t2 = setTimeout(() => { setTyping(false); setMsgs(p => [...p, m]); }, m.delay || 0);
      timers.push(t1, t2);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  /* GSAP */
  useEffect(() => {
    let ctx;
    (async () => {
      const { gsap }          = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {

        /* ── PRELOADER ──────────────────────────────────────────── */
        const preloadTL = gsap.timeline({
          onComplete: () => setPreloaded(true),
        });
        preloadTL
          .from('.pl-logo',  { opacity:0, y:20, duration:0.6, ease:'power3.out' })
          .from('.pl-line',  { scaleX:0, duration:0.5, ease:'power3.inOut' }, '-=0.1')
          .to(preloaderRef.current, {
            opacity:0, pointerEvents:'none', duration:0.6, delay:0.4, ease:'power2.in',
            onComplete: () => { if (preloaderRef.current) preloaderRef.current.style.display='none'; },
          });

        /* ── NAV scroll ─────────────────────────────────────────── */
        ScrollTrigger.create({
          start: 'top -80',
          onUpdate: self => {
            if (!navRef.current) return;
            navRef.current.style.background = self.progress > 0
              ? 'rgba(5,12,7,0.92)' : 'transparent';
            navRef.current.style.borderBottomColor = self.progress > 0
              ? '#182A1C' : 'transparent';
          },
        });

        /* ── HERO text reveal (clip-path) ───────────────────────── */
        gsap.set('.hero-word', { clipPath:'inset(0 0 100% 0)', y:40 });
        gsap.to('.hero-word', {
          clipPath:'inset(0 0 0% 0)', y:0,
          duration:1, stagger:0.1, ease:'power4.out', delay:0.9,
        });
        gsap.from('.hero-sub-text', {
          opacity:0, y:20, duration:0.8, delay:1.5, ease:'power3.out',
        });
        gsap.from('.hero-cta-row', {
          opacity:0, y:20, duration:0.7, delay:1.8, ease:'power3.out',
        });

        /* ── ORB floating ───────────────────────────────────────── */
        gsap.to('#orb1', { y:-40, x:20, duration:6, repeat:-1, yoyo:true, ease:'sine.inOut' });
        gsap.to('#orb2', { y:30, x:-25, duration:8, repeat:-1, yoyo:true, ease:'sine.inOut', delay:1 });
        gsap.to('#orb3', { y:-20, duration:4.5, repeat:-1, yoyo:true, ease:'sine.inOut', delay:2 });

        /* ── HERO scroll parallax ───────────────────────────────── */
        gsap.to('.hero-bg-layer', {
          y:'-20%',
          ease:'none',
          scrollTrigger: { trigger:'#hero', start:'top top', end:'bottom top', scrub:true },
        });
        gsap.to('.hero-text-layer', {
          y:'8%', opacity:0.3,
          ease:'none',
          scrollTrigger: { trigger:'#hero', start:'top top', end:'bottom top', scrub:true },
        });

        /* ── MARQUEE ────────────────────────────────────────────── */
        const mq = document.querySelector('.mq-track');
        if (mq) gsap.to(mq, { x:'-50%', duration:28, ease:'none', repeat:-1 });

        /* ── PROBLEM section ────────────────────────────────────── */
        gsap.from('.prob-left',  {
          scrollTrigger:{ trigger:'.problem-section', start:'top 70%' },
          x:-60, opacity:0, duration:0.9, ease:'power3.out',
        });
        gsap.from('.prob-right', {
          scrollTrigger:{ trigger:'.problem-section', start:'top 70%' },
          x:60, opacity:0, duration:0.9, delay:0.15, ease:'power3.out',
        });

        /* ── FEATURES horizontal pin ────────────────────────────── */
        const pin    = featPinRef.current;
        const track  = featTrackRef.current;
        if (pin && track) {
          const cards      = track.querySelectorAll('.feat-card-h');
          const cardWidth  = cards[0]?.offsetWidth || 400;
          const gap        = 24;
          const totalScroll = (cardWidth + gap) * (cards.length - 1.5);

          gsap.to(track, {
            x: () => -totalScroll,
            ease:'none',
            scrollTrigger:{
              trigger: pin,
              pin: true,
              scrub: 1,
              end: () => `+=${totalScroll}`,
              anticipatePin: 1,
            },
          });

          cards.forEach((card, i) => {
            gsap.from(card, {
              opacity:0, scale:0.9,
              scrollTrigger:{
                trigger: pin,
                start: `top+=${i * 80} 80%`,
                toggleActions:'play none none reverse',
              },
              duration:0.5,
            });
          });
        }

        /* ── STATS counter ──────────────────────────────────────── */
        gsap.from('.stat-block', {
          scrollTrigger:{ trigger:'.stats-section', start:'top 70%' },
          y:50, opacity:0, stagger:0.12, duration:0.7, ease:'power3.out',
        });
        ScrollTrigger.create({
          trigger:'.stats-section', start:'top 65%', once:true,
          onEnter:() => {
            counterRefs.current.forEach(el => {
              if (!el) return;
              const target = parseInt(el.dataset.target);
              const suffix = el.dataset.suffix || '';
              const obj    = { val:0 };
              gsap.to(obj, {
                val:target, duration:2, ease:'power2.out',
                onUpdate(){ el.textContent = Math.round(obj.val).toLocaleString('fr-SN') + suffix; },
              });
            });
          },
        });

        /* ── MOCKUP section ─────────────────────────────────────── */
        gsap.from('.phone-mockup', {
          scrollTrigger:{ trigger:'.demo-section', start:'top 70%' },
          y:80, opacity:0, duration:1, ease:'power3.out',
        });
        gsap.from('.demo-text-block', {
          scrollTrigger:{ trigger:'.demo-section', start:'top 65%' },
          x:-50, opacity:0, duration:0.9, ease:'power3.out',
        });

        /* ── STEPS ──────────────────────────────────────────────── */
        gsap.from('.step-block', {
          scrollTrigger:{ trigger:'.steps-section', start:'top 70%' },
          y:40, opacity:0, stagger:0.18, duration:0.7, ease:'power3.out',
        });

        /* ── PRICING teaser ─────────────────────────────────────── */
        gsap.from('.plan-teaser', {
          scrollTrigger:{ trigger:'.pricing-section', start:'top 70%' },
          y:50, opacity:0, stagger:0.12, duration:0.7, ease:'power3.out',
        });

        /* ── CTA section ────────────────────────────────────────── */
        gsap.from('.cta-inner', {
          scrollTrigger:{ trigger:'.cta-section', start:'top 70%' },
          scale:0.95, opacity:0, duration:1, ease:'power3.out',
        });

        /* ── Mouse parallax on hero ─────────────────────────────── */
        const hero = heroRef.current;
        if (hero) {
          hero.addEventListener('mousemove', e => {
            const cx = window.innerWidth/2, cy = window.innerHeight/2;
            const dx = (e.clientX-cx)/cx, dy = (e.clientY-cy)/cy;
            gsap.to('#orb1', { x:dx*50, y:dy*30, duration:2, ease:'power2.out' });
            gsap.to('#orb2', { x:dx*-35, y:dy*-25, duration:2.5, ease:'power2.out' });
          });
        }

      }); /* end gsap.context */
    })();
    return () => ctx?.revert();
  }, []);

  return (
    <>
    <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:999, opacity:1 }} />

    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,600&family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');
      :root{
        --bg:#05120A; --s1:#08160C; --s2:#0D1E11;
        --brd:rgba(30,50,30,0.6); --brd2:#1A2E1C;
        --gold:#C9A84C; --gold2:#E8C97D; --gdim:rgba(201,168,76,0.1);
        --grn:#1D9E75; --grn2:#3ED98A;
        --txt:#EDE5CC; --txt2:#6A8C72; --txt3:#2E4035; --txt4:#A8C4AE;
      }
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html{scroll-behavior:smooth;background:var(--bg)}
      body{background:var(--bg);color:var(--txt);font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
      a{color:inherit;text-decoration:none}
      button{font-family:inherit;-webkit-tap-highlight-color:transparent;touch-action:manipulation}

      /* PRELOADER */
      .preloader{position:fixed;inset:0;z-index:9999;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px}
      .pl-logo{font-family:'Cormorant Garamond',serif;font-size:2.8rem;font-weight:600;color:var(--gold);letter-spacing:-0.02em}
      .pl-line{width:80px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);transform-origin:left;transform:scaleX(0)}

      /* NAV */
      .lp-nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:20px 48px;display:flex;align-items:center;justify-content:space-between;transition:background 0.4s,border-bottom-color 0.4s;border-bottom:1px solid transparent;backdrop-filter:blur(0px)}
      .nav-logo{font-family:'Cormorant Garamond',serif;font-size:1.55rem;font-weight:600;color:var(--gold);letter-spacing:-0.01em}
      .nav-links{display:flex;align-items:center;gap:32px}
      .nav-link{font-size:0.83rem;color:var(--txt2);font-weight:300;letter-spacing:0.02em;transition:color 0.2s}
      .nav-link:hover{color:var(--txt)}
      .nav-cta{padding:9px 22px;border:1px solid rgba(201,168,76,0.35);color:var(--gold);border-radius:30px;font-size:0.82rem;font-weight:600;transition:all 0.2s;background:var(--gdim)}
      .nav-cta:hover{background:rgba(201,168,76,0.18);border-color:var(--gold)}

      /* HERO */
      #hero{min-height:100vh;display:flex;align-items:center;position:relative;overflow:hidden;padding:0 48px}
      .hero-bg-layer{position:absolute;inset:-10%;will-change:transform}
      .hero-grid{position:absolute;inset:0;background-image:repeating-linear-gradient(0deg,transparent,transparent 79px,var(--brd) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,var(--brd) 80px);pointer-events:none;opacity:0.35}
      .hero-radial{position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 65% 45%,rgba(29,158,117,0.09) 0%,transparent 65%),radial-gradient(ellipse 40% 35% at 15% 75%,rgba(201,168,76,0.06) 0%,transparent 60%);pointer-events:none}
      .orb{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;will-change:transform}
      .hero-text-layer{position:relative;z-index:1;max-width:1300px;width:100%;margin:0 auto;display:grid;grid-template-columns:1fr 440px;gap:80px;align-items:center;padding:120px 0 80px}

      .h1-wrap{overflow:hidden}
      .hero-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(3.5rem,7vw,6.5rem);font-weight:300;line-height:1.05;letter-spacing:-0.03em;margin-bottom:28px}
      .hero-h1 em{font-style:italic;font-weight:300;color:var(--gold)}
      .hero-h1 strong{font-weight:600}
      .hero-word{display:inline-block;will-change:transform}
      .hero-word.sp{display:inline-block;width:.35em}
      .hero-sub-text{font-size:clamp(0.95rem,1.4vw,1.1rem);color:var(--txt2);line-height:1.8;max-width:500px;margin-bottom:40px;font-weight:300}
      .hero-cta-row{display:flex;gap:14px;flex-wrap:wrap}
      .btn-gold{padding:15px 32px;background:linear-gradient(135deg,var(--gold),#96720E);color:#050F07;border-radius:40px;font-weight:700;font-size:0.92rem;transition:all 0.2s;white-space:nowrap;letter-spacing:0.02em}
      .btn-gold:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(201,168,76,0.3)}
      .btn-ghost{padding:15px 32px;border:1px solid var(--brd2);color:var(--txt4);border-radius:40px;font-size:0.92rem;font-weight:300;transition:all 0.2s;white-space:nowrap}
      .btn-ghost:hover{border-color:var(--grn);color:var(--grn2)}

      /* PHONE MOCKUP */
      .phone-float{position:relative}
      .phone-shell{background:#081510;border:1.5px solid #1E3020;border-radius:32px;overflow:hidden;box-shadow:0 50px 100px rgba(0,0,0,0.6),0 0 0 1px rgba(62,217,138,0.07),inset 0 1px 0 rgba(255,255,255,0.04);max-width:320px}
      .phone-top-bar{background:#060F09;padding:14px 18px 12px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #1A2E1A}
      .pa{width:34px;height:34px;background:var(--grn);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0}
      .pi{flex:1}.pn{font-size:0.82rem;font-weight:600;color:var(--txt)}.ps{font-size:0.68rem;color:var(--grn2)}
      .phone-body{padding:14px 12px;display:flex;flex-direction:column;gap:8px;min-height:300px;max-height:300px;overflow:hidden}
      .pm{max-width:80%;padding:9px 13px;border-radius:14px;font-size:0.78rem;line-height:1.55;white-space:pre-line;animation:msgIn 0.3s ease both}
      @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      .pm.u{align-self:flex-end;background:rgba(29,158,117,0.16);border:1px solid rgba(29,158,117,0.22);color:var(--txt);border-bottom-right-radius:4px}
      .pm.b{align-self:flex-start;background:#0F1E12;border:1px solid #1A3020;color:var(--txt2);border-bottom-left-radius:4px}
      .typing-ind{align-self:flex-start;background:#0F1E12;border:1px solid #1A3020;border-radius:14px;border-bottom-left-radius:4px;padding:10px 16px;display:flex;gap:4px}
      .td{width:6px;height:6px;border-radius:50%;background:var(--txt3);animation:td 1.2s infinite}
      .td:nth-child(2){animation-delay:.2s}.td:nth-child(3){animation-delay:.4s}
      @keyframes td{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
      .phone-bottom{background:#060F09;border-top:1px solid #1A2E1A;padding:10px 14px;display:flex;align-items:center;gap:8px}
      .pinp{flex:1;background:#0F1E12;border-radius:18px;padding:7px 13px;font-size:0.73rem;color:var(--txt3)}
      .phone-glow{position:absolute;bottom:-50px;left:50%;transform:translateX(-50%);width:180px;height:90px;background:var(--grn);opacity:0.07;border-radius:50%;filter:blur(40px);pointer-events:none}

      /* MARQUEE */
      .marquee-wrap{padding:22px 0;border-top:1px solid var(--brd2);border-bottom:1px solid var(--brd2);overflow:hidden;background:var(--s1)}
      .mq-track{display:flex;gap:0;white-space:nowrap;will-change:transform}
      .mq-item{display:inline-flex;align-items:center;gap:32px;padding:0 32px;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.15em;color:var(--txt2);font-family:'Syne',sans-serif;font-weight:600}
      .mq-dot{width:4px;height:4px;border-radius:50%;background:var(--gold);flex-shrink:0}

      /* PROBLEM SECTION */
      .problem-section{padding:120px 48px;max-width:1300px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
      .prob-left .sec-label{font-size:0.7rem;text-transform:uppercase;letter-spacing:0.14em;color:var(--gold);margin-bottom:16px;font-family:'Syne',sans-serif}
      .prob-h2{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,3.5vw,3rem);font-weight:300;line-height:1.2;margin-bottom:20px}
      .prob-h2 em{font-style:italic;color:var(--gold)}
      .prob-p{color:var(--txt2);line-height:1.8;font-weight:300;font-size:0.95rem;margin-bottom:16px}
      .prob-right{display:flex;flex-direction:column;gap:16px}
      .prob-card{padding:22px 24px;border-radius:18px;border:1px solid var(--brd2)}
      .prob-card.before{background:#0D100A;border-color:#1A2010}
      .prob-card.after{background:linear-gradient(135deg,#0E1E12,#0B1A0D);border-color:rgba(29,158,117,0.25)}
      .pc-label{font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;margin-bottom:10px}
      .pc-label.b{color:#4A5A40}.pc-label.a{color:var(--grn2)}
      .pc-text{font-size:0.88rem;color:var(--txt2);line-height:1.65;font-weight:300}

      /* FEATURES HORIZONTAL SCROLL */
      .feat-pin-wrap{padding:80px 0;overflow:hidden}
      .feat-pin-header{padding:0 48px 48px;max-width:1300px;margin:0 auto;display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:20px}
      .feat-pin-header .sec-label{font-size:0.7rem;text-transform:uppercase;letter-spacing:0.14em;color:var(--gold);margin-bottom:10px;font-family:'Syne',sans-serif}
      .feat-pin-header h2{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,3.5vw,3rem);font-weight:300;line-height:1.15}
      .feat-pin-header h2 em{font-style:italic;color:var(--gold)}
      .feat-hint{font-size:0.78rem;color:var(--txt2);font-weight:300;display:flex;align-items:center;gap:8px}
      .feat-pin-track-wrap{padding-left:48px;overflow:visible}
      .feat-pin-track{display:flex;gap:24px;width:max-content}
      .feat-card-h{width:340px;flex-shrink:0;background:var(--s1);border:1px solid var(--brd2);border-radius:22px;padding:36px 30px;position:relative;overflow:hidden}
      .feat-card-h::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--grn),transparent);opacity:0.4}
      .feat-card-h:hover{border-color:rgba(62,217,138,0.25)}
      .fch-num{font-family:'Syne',sans-serif;font-size:3.5rem;font-weight:800;color:var(--brd2);line-height:1;margin-bottom:24px;transition:color 0.3s}
      .feat-card-h:hover .fch-num{color:var(--txt3)}
      .fch-tag{display:inline-block;font-size:0.66rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--grn2);background:rgba(62,217,138,0.08);border:1px solid rgba(62,217,138,0.18);padding:3px 10px;border-radius:20px;margin-bottom:14px;font-family:'Syne',sans-serif;font-weight:600}
      .fch-title{font-family:'Cormorant Garamond',serif;font-size:1.55rem;font-weight:600;margin-bottom:10px}
      .fch-desc{font-size:0.85rem;color:var(--txt2);line-height:1.75;font-weight:300}

      /* STATS */
      .stats-section{padding:100px 48px;background:var(--s1);border-top:1px solid var(--brd2);border-bottom:1px solid var(--brd2)}
      .stats-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:40px}
      .stat-block{text-align:center}
      .stat-num{font-family:'Syne',sans-serif;font-size:clamp(2.5rem,5vw,4rem);font-weight:800;color:var(--txt);line-height:1}
      .stat-label{font-size:0.8rem;color:var(--txt2);margin-top:10px;font-weight:300;line-height:1.5}

      /* DEMO SECTION */
      .demo-section{padding:120px 48px;max-width:1300px;margin:0 auto;display:grid;grid-template-columns:1fr 380px;gap:80px;align-items:center}
      .demo-text-block .sec-label{font-size:0.7rem;text-transform:uppercase;letter-spacing:0.14em;color:var(--gold);margin-bottom:16px;font-family:'Syne',sans-serif}
      .demo-h2{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,3.5vw,3rem);font-weight:300;line-height:1.2;margin-bottom:20px}
      .demo-h2 em{font-style:italic;color:var(--grn2)}
      .demo-p{color:var(--txt2);font-weight:300;font-size:0.95rem;line-height:1.8;margin-bottom:16px}
      .demo-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px}
      .chip{padding:6px 16px;border:1px solid var(--brd2);border-radius:30px;font-size:0.78rem;color:var(--txt2);font-weight:300}

      /* STEPS */
      .steps-section{padding:100px 48px;background:var(--s1)}
      .steps-inner{max-width:1100px;margin:0 auto}
      .steps-header{text-align:center;margin-bottom:64px}
      .steps-header h2{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,3.5vw,3rem);font-weight:300;line-height:1.15}
      .steps-header h2 em{font-style:italic;color:var(--gold)}
      .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:var(--brd2);border-radius:20px;overflow:hidden}
      .step-block{background:var(--s2);padding:40px 32px;position:relative}
      .step-n{font-family:'Syne',sans-serif;font-size:4rem;font-weight:800;color:var(--txt3);line-height:1;margin-bottom:20px}
      .step-t{font-family:'Cormorant Garamond',serif;font-size:1.35rem;font-weight:600;margin-bottom:10px}
      .step-d{font-size:0.85rem;color:var(--txt2);line-height:1.75;font-weight:300}

      /* PRICING TEASER */
      .pricing-section{padding:120px 48px}
      .pricing-inner{max-width:1100px;margin:0 auto}
      .pricing-header{margin-bottom:56px}
      .pricing-header h2{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,3.5vw,3rem);font-weight:300;line-height:1.15}
      .pricing-header h2 em{font-style:italic;color:var(--gold)}
      .pricing-header p{color:var(--txt2);font-weight:300;margin-top:12px;font-size:0.95rem}
      .plans-tease{display:grid;grid-template-columns:0.75fr 1fr 1fr;gap:16px}
      .plan-teaser{border:1px solid var(--brd2);border-radius:20px;padding:28px 24px;position:relative;overflow:hidden;transition:transform 0.25s}
      .plan-teaser:hover{transform:translateY(-4px)}
      .plan-teaser.feat{border-color:rgba(201,168,76,0.4);background:linear-gradient(160deg,#131F14,#0B1710)}
      .plan-teaser::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
      .pt-free::before{background:var(--txt3)}
      .pt-std::before{background:var(--grn)}
      .pt-prem::before{background:linear-gradient(90deg,var(--gold),var(--gold2))}
      .pt-badge{position:absolute;top:14px;right:14px;font-size:0.6rem;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;padding:3px 9px;border-radius:20px;background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.28);color:var(--gold)}
      .pt-name{font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:600;margin-bottom:4px}
      .pt-price{font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:700;margin:12px 0 4px}
      .pt-period{font-size:0.72rem;color:var(--txt2);margin-bottom:18px}
      .pt-feats{list-style:none;display:flex;flex-direction:column;gap:7px;margin-bottom:22px}
      .pt-feats li{font-size:0.8rem;color:var(--txt2);font-weight:300;display:flex;align-items:flex-start;gap:8px;line-height:1.5}
      .pt-check{flex-shrink:0;color:currentColor;margin-top:2px}
      .pt-btn{display:block;text-align:center;padding:11px;border-radius:10px;font-size:0.85rem;font-weight:600;transition:all 0.2s}
      .pt-btn.ghost{border:1px solid var(--brd2);color:var(--txt2)}
      .pt-btn.green{background:rgba(29,158,117,0.12);border:1px solid rgba(29,158,117,0.3);color:var(--grn2)}
      .pt-btn.gold{background:linear-gradient(135deg,var(--gold),#96720E);color:#050F07}

      /* CTA */
      .cta-section{padding:0 48px 120px}
      .cta-inner{max-width:1100px;margin:0 auto;background:linear-gradient(135deg,#0D1E11,#0B1710);border:1px solid var(--brd2);border-radius:28px;padding:80px 60px;text-align:center;position:relative;overflow:hidden}
      .cta-inner::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);opacity:0.5}
      .cta-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}
      .cta-h2{font-family:'Cormorant Garamond',serif;font-size:clamp(2.2rem,4vw,3.8rem);font-weight:300;line-height:1.1;margin-bottom:18px}
      .cta-h2 em{font-style:italic;color:var(--gold)}
      .cta-sub{color:var(--txt2);font-weight:300;font-size:1rem;line-height:1.75;margin-bottom:36px;max-width:500px;margin-left:auto;margin-right:auto}
      .cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}

      /* FOOTER */
      .lp-footer{background:var(--s1);border-top:1px solid var(--brd2);padding:40px 48px}
      .footer-inner{max-width:1300px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
      .fl{font-family:'Cormorant Garamond',serif;font-size:1.35rem;font-weight:600;color:var(--gold)}
      .flinks{display:flex;gap:24px}
      .flink{font-size:0.78rem;color:var(--txt3);transition:color 0.2s}
      .flink:hover{color:var(--txt2)}
      .fcopy{font-size:0.72rem;color:var(--txt3)}

      @media(max-width:1000px){
        .lp-nav{padding:16px 20px}
        .nav-links .nav-link{display:none}
        #hero{padding:0 20px}
        .hero-text-layer{grid-template-columns:1fr;padding:100px 0 60px;gap:48px}
        .phone-shell{max-width:280px;margin:0 auto}
        .problem-section{grid-template-columns:1fr;padding:60px 20px;gap:40px}
        .feat-pin-header{padding:0 20px 32px}
        .feat-pin-track-wrap{padding-left:20px}
        .feat-card-h{width:280px}
        .stats-section{padding:60px 20px}
        .stats-inner{grid-template-columns:repeat(2,1fr);gap:28px}
        .demo-section{grid-template-columns:1fr;padding:60px 20px;gap:48px}
        .phone-mockup{order:-1}
        .steps-section{padding:60px 20px}
        .steps-grid{grid-template-columns:1fr;gap:2px}
        .pricing-section{padding:60px 20px}
        .plans-tease{grid-template-columns:1fr}
        .plan-teaser:nth-child(1){order:3}
        .cta-section{padding:0 20px 60px}
        .cta-inner{padding:40px 24px;border-radius:20px}
        .lp-footer{padding:28px 20px}
        .footer-inner{flex-direction:column;gap:10px;text-align:center}
        .flinks{justify-content:center}
      }
    `}</style>

    {/* PRELOADER */}
    <div ref={preloaderRef} className="preloader">
      <div className="pl-logo">SenCompta IA</div>
      <div className="pl-line" />
    </div>

    {/* NAV */}
    <nav className="lp-nav" ref={navRef}>
      <span className="nav-logo">SenCompta IA</span>
      <div className="nav-links">
        <a href="#features" className="nav-link">Fonctionnalités</a>
        <a href="#demo"     className="nav-link">Démo</a>
        <a href="/pricing"  className="nav-link">Tarifs</a>
        <a href="/auth/login" className="nav-cta">Connexion</a>
      </div>
    </nav>

    {/* HERO */}
    <section id="hero" ref={heroRef}>
      <div className="hero-bg-layer">
        <div className="hero-grid" />
        <div className="hero-radial" />
        <div id="orb1" className="orb" style={{width:600,height:600,top:'-10%',right:'-5%',background:'rgba(29,158,117,0.1)'}} />
        <div id="orb2" className="orb" style={{width:400,height:400,bottom:'0%',left:'-8%',background:'rgba(201,168,76,0.07)'}} />
        <div id="orb3" className="orb" style={{width:250,height:250,top:'30%',right:'28%',background:'rgba(62,217,138,0.05)'}} />
      </div>

      <div className="hero-text-layer">
        <div>
          <div className="h1-wrap">
            <h1 className="hero-h1">
              {'Gérez'.split('').map((c,i)=><span key={i} className="hero-word">{c}</span>)}
              <span className="hero-word sp"> </span>
              {'vos'.split('').map((c,i)=><span key={i} className="hero-word">{c}</span>)}
              <span className="hero-word sp"> </span>
              {'finances'.split('').map((c,i)=><span key={i} className="hero-word">{c}</span>)}
              <br/>
              {'en'.split('').map((c,i)=><span key={i} className="hero-word">{c}</span>)}
              <span className="hero-word sp"> </span>
              <em>{'un message.'.split('').map((c,i)=><span key={i} className="hero-word" style={{fontStyle:'inherit'}}>{c}</span>)}</em>
            </h1>
          </div>
          <p className="hero-sub-text">
            SenCompta IA écoute vos transactions en français ou en wolof, analyse vos données en temps réel, génère vos factures DGI et vous conseille — le tout depuis WhatsApp.
          </p>
          <div className="hero-cta-row">
            <a href="/pricing"    className="btn-gold">Commencer gratuitement</a>
            <a href="#demo"       className="btn-ghost">Voir la démo</a>
          </div>
        </div>

        <div className="phone-float">
          <div className="phone-shell">
            <div className="phone-top-bar">
              <div className="pa">S</div>
              <div className="pi"><div className="pn">SenCompta IA</div><div className="ps">En ligne</div></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3ED98A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>
            </div>
            <div className="phone-body">
              {msgs.map((m,i)=><div key={i} className={`pm ${m.from==='user'?'u':'b'}`}>{m.text}</div>)}
              {typing && <div className="typing-ind"><div className="td"/><div className="td"/><div className="td"/></div>}
            </div>
            <div className="phone-bottom">
              <div className="pinp">Écrivez en français ou wolof…</div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </div>
          </div>
          <div className="phone-glow"/>
        </div>
      </div>
    </section>

    {/* MARQUEE */}
    <div className="marquee-wrap">
      <div className="mq-track">
        {[...MARQUEE,...MARQUEE,...MARQUEE,...MARQUEE].map((t,i)=>(
          <span key={i} className="mq-item">{t}{i % MARQUEE.length !== MARQUEE.length-1 && <span className="mq-dot"/>}</span>
        ))}
      </div>
    </div>

    {/* PROBLEM */}
    <div className="problem-section">
      <div className="prob-left">
        <div className="sec-label">Pourquoi SenCompta</div>
        <h2 className="prob-h2">Le cahier de caisse coûte <em>plus cher qu'on ne le croit.</em></h2>
        <p className="prob-p">Erreurs de calcul, données perdues, aucune vision sur vos créances, impossible de produire une facture DGI-valide. Le commerce informel coûte aux marchands en opportunités perdues.</p>
        <p className="prob-p">SenCompta transforme WhatsApp — l'outil que vous utilisez déjà — en système comptable intelligent.</p>
      </div>
      <div className="prob-right">
        <div className="prob-card before">
          <div className="pc-label b">Avant</div>
          <div className="pc-text">Cahier de caisse perdu, chiffres approximatifs, aucun bilan possible, pas de facture valide pour vos clients professionnels, créances oubliées.</div>
        </div>
        <div className="prob-card after">
          <div className="pc-label a">Avec SenCompta IA</div>
          <div className="pc-text">Chaque transaction en temps réel, bilan mensuel automatique, factures DGI générées en un message, créances trackées, conseils IA personnalisés.</div>
        </div>
      </div>
    </div>

    {/* FEATURES HORIZONTAL PIN */}
    <div className="feat-pin-wrap" id="features" ref={featPinRef}>
      <div className="feat-pin-header">
        <div>
          <div className="sec-label">Fonctionnalités</div>
          <h2>Tout ce que votre boutique <em>mérite enfin.</em></h2>
        </div>
        <div className="feat-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          Scrollez pour explorer
        </div>
      </div>
      <div className="feat-pin-track-wrap">
        <div className="feat-pin-track" ref={featTrackRef}>
          {FEATURES.map((f,i)=>(
            <div key={i} className="feat-card-h">
              <div className="fch-num">{f.num}</div>
              <div className="fch-tag">{f.tag}</div>
              <div className="fch-title">{f.title}</div>
              <p className="fch-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* STATS */}
    <div className="stats-section" ref={statsRef}>
      <div className="stats-inner">
        {STATS.map((s,i)=>(
          <div key={i} className="stat-block">
            <div className="stat-num" ref={el=>counterRefs.current[i]=el} data-target={s.val} data-suffix={s.suffix}>{s.val}{s.suffix}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* DEMO */}
    <div className="demo-section" id="demo">
      <div className="demo-text-block">
        <div className="sec-label">En pratique</div>
        <h2 className="demo-h2">Une conversation, <em>des données précises.</em></h2>
        <p className="demo-p">Vous tapez comme vous parlez. L'IA comprend, classe et enregistre. Résultat : un historique comptable complet construit naturellement, sans effort.</p>
        <p className="demo-p">Fonctionne en français, en wolof, ou en mélange des deux. Même les messages vocaux sont transcrits et analysés.</p>
        <div className="demo-chips">
          {['Wolof natif','Vocal → texte','Contexte compris','Catégorisation auto'].map((c,i)=><span key={i} className="chip">{c}</span>)}
        </div>
      </div>
      <div className="phone-mockup">
        <div className="phone-shell" style={{maxWidth:'100%'}}>
          <div className="phone-top-bar">
            <div className="pa">S</div>
            <div className="pi"><div className="pn">SenCompta IA</div><div className="ps">En ligne</div></div>
          </div>
          <div className="phone-body" style={{maxHeight:'340px'}}>
            {msgs.map((m,i)=><div key={i} className={`pm ${m.from==='user'?'u':'b'}`}>{m.text}</div>)}
            {typing&&<div className="typing-ind"><div className="td"/><div className="td"/><div className="td"/></div>}
          </div>
          <div className="phone-bottom">
            <div className="pinp">Écrivez en français ou wolof…</div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </div>
        </div>
      </div>
    </div>

    {/* STEPS */}
    <div className="steps-section">
      <div className="steps-inner">
        <div className="steps-header">
          <div className="sec-label" style={{color:'var(--gold)',fontSize:'0.7rem',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:12,fontFamily:"'Syne',sans-serif"}}>Comment ça marche</div>
          <h2>Opérationnel en <em>cinq minutes.</em></h2>
        </div>
        <div className="steps-grid">
          {[
            {n:'01',t:'Choisissez votre plan',d:'Gratuit pour démarrer. Standard à 10 000 FCFA pour le dashboard complet. Paiement Wave ou Orange Money.'},
            {n:'02',t:'Recevez votre accès',d:'Un lien de connexion sécurisé est envoyé sur votre WhatsApp dans les secondes qui suivent.'},
            {n:'03',t:'Gérez comme un pro',d:'Envoyez vos transactions, consultez votre bilan, émettez des factures DGI — tout depuis votre téléphone.'},
          ].map((s,i)=>(
            <div key={i} className="step-block">
              <div className="step-n">{s.n}</div>
              <div className="step-t">{s.t}</div>
              <p className="step-d">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* PRICING TEASER */}
    <div className="pricing-section">
      <div className="pricing-inner">
        <div className="pricing-header">
          <div className="sec-label" style={{color:'var(--gold)',fontSize:'0.7rem',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:12,fontFamily:"'Syne',sans-serif"}}>Abonnements</div>
          <h2>Commencez gratuitement, <em>évoluez à votre rythme.</em></h2>
          <p>Sans engagement · Paiement Wave & Orange Money · Résiliation à tout moment</p>
        </div>
        <div className="plans-tease">
          {[
            {cls:'pt-free',name:'Gratuit',price:'0',period:'pour toujours',color:'var(--txt3)',feats:['Bot WhatsApp — 20 tx/mois','Balance simple','Accès limité'],btn:'ghost',btnTxt:'Commencer',href:'/auth/login'},
            {cls:'pt-std', name:'Standard',price:'10 000',period:'FCFA / mois',color:'var(--grn2)',feats:['WhatsApp illimité (FR & Wolof)','Dashboard & graphiques','Factures DGI · Export PDF','Créances · Conseils IA'],btn:'green',btnTxt:'Choisir Standard',href:'/pricing'},
            {cls:'pt-prem feat',name:'Premium',price:'20 000',period:'FCFA / mois',color:'var(--gold)',badge:'Recommandé',feats:['Tout Standard inclus','Multi-boutique (×3)','Intégration Wave / OM','Scoring crédit · API'],btn:'gold',btnTxt:'Choisir Premium',href:'/pricing'},
          ].map((p,i)=>(
            <div key={i} className={`plan-teaser ${p.cls}`}>
              {p.badge&&<div className="pt-badge">{p.badge}</div>}
              <div className="pt-name">{p.name}</div>
              <div className="pt-price" style={{color:p.color}}>{p.price}</div>
              <div className="pt-period">{p.period}</div>
              <ul className="pt-feats">
                {p.feats.map((f,j)=>(
                  <li key={j}>
                    <svg className="pt-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href={p.href} className={`pt-btn ${p.btn}`}>{p.btnTxt}</a>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* CTA */}
    <div className="cta-section">
      <div className="cta-inner">
        <div className="cta-orb" style={{width:400,height:400,top:'-30%',left:'-10%',background:'rgba(29,158,117,0.08)'}}/>
        <div className="cta-orb" style={{width:300,height:300,bottom:'-20%',right:'-5%',background:'rgba(201,168,76,0.06)'}}/>
        <h2 className="cta-h2">Votre boutique mérite<br/><em>mieux qu'un cahier.</em></h2>
        <p className="cta-sub">Rejoignez les commerçants sénégalais qui gèrent leurs finances comme des professionnels — depuis leur téléphone, en wolof.</p>
        <div className="cta-btns">
          <a href="/pricing"    className="btn-gold">Voir les abonnements</a>
          <a href="/auth/login" className="btn-ghost">Me connecter</a>
        </div>
      </div>
    </div>

    {/* FOOTER */}
    <footer className="lp-footer">
      <div className="footer-inner">
        <span className="fl">SenCompta IA</span>
        <div className="flinks">
          <a href="/mentions-legales" className="flink">Mentions légales</a>
          <a href="/confidentialite"  className="flink">Confidentialité</a>
          <a href="/pricing"          className="flink">Tarifs</a>
          <a href="/auth/login"       className="flink">Connexion</a>
        </div>
        <span className="fcopy">© {new Date().getFullYear()} SenCompta IA · Dakar, Sénégal</span>
      </div>
    </footer>
    </>
  );
}
