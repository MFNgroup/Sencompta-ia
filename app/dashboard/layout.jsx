'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  {
    href: '/dashboard',
    label: 'Tableau de bord',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/transactions',
    label: 'Transactions',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/invoices',
    label: 'Factures',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/debts',
    label: 'Créances',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/advice',
    label: 'Conseils IA',
    premium: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Paramètres',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [user, setUser]       = useState(null);
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    fetch('/api/user/me').then(r => r.json()).then(d => { if (!d.error) setUser(d); });
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

  const isPremium = user?.plan === 'PREMIUM';
  const isFree    = user?.plan === 'FREE' || (!user?.plan);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=IBM+Plex+Sans:wght@400;500;600&family=DM+Mono:wght@500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0D1B14; color: #EDE8DC; font-family: 'IBM Plex Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        button { font-family: inherit; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        a { text-decoration: none; color: inherit; }

        .layout { display: flex; min-height: 100vh; min-height: 100dvh; }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 240px; flex-shrink: 0;
          background: #122019;
          border-right: 1px solid #1E3328;
          display: flex; flex-direction: column;
          padding: 24px 16px;
          position: fixed; top: 0; left: 0; height: 100vh;
          z-index: 50; overflow-y: auto;
          transition: transform 0.25s ease;
        }
        .sidebar-logo { font-family: 'Playfair Display', serif; font-size: 1.3rem; color: #C9A84C; margin-bottom: 4px; padding: 0 8px; }
        .sidebar-tagline { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 1px; color: #8A9E8F; padding: 0 8px; margin-bottom: 28px; }

        .sidebar-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 8px;
          cursor: pointer; border: none; background: none;
          width: 100%; text-align: left; color: #8A9E8F;
          font-size: 0.86rem; transition: all 0.15s;
        }
        .nav-item:hover { background: rgba(201,168,76,0.07); color: #EDE8DC; }
        .nav-item.active { background: rgba(201,168,76,0.13); color: #C9A84C; }
        .nav-icon { display: flex; align-items: center; justify-content: center; width: 18px; flex-shrink: 0; }
        .nav-premium-tag {
          font-size: 0.55rem; background: rgba(201,168,76,0.15); color: #C9A84C;
          border-radius: 4px; padding: 2px 5px; margin-left: auto; white-space: nowrap;
        }

        .nav-divider { height: 1px; background: #1E3328; margin: 8px 0; }

        .nav-upgrade {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 8px;
          color: #C9A84C; font-size: 0.86rem;
          background: rgba(201,168,76,0.06);
          border: 1px solid rgba(201,168,76,0.2);
          cursor: pointer; text-decoration: none;
          transition: all 0.15s;
        }
        .nav-upgrade:hover { background: rgba(201,168,76,0.12); }

        /* ── Sidebar bottom ── */
        .sidebar-bottom { margin-top: 24px; padding-top: 16px; border-top: 1px solid #1E3328; }
        .user-card {
          padding: 10px 12px; border-radius: 8px;
          background: rgba(0,0,0,0.2); margin-bottom: 8px;
        }
        .user-name { font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-plan { font-size: 0.62rem; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px; }
        .user-plan.premium  { color: #C9A84C; }
        .user-plan.standard { color: #4CAF7D; }
        .user-plan.free     { color: #8A9E8F; }

        .sub-expiry { font-size: 0.65rem; color: #8A9E8F; margin-top: 2px; }

        .btn-logout {
          width: 100%; padding: 8px 12px;
          background: rgba(224,123,84,0.06); border: 1px solid rgba(224,123,84,0.18);
          color: #E07B54; border-radius: 8px; font-size: 0.8rem;
          cursor: pointer; transition: background 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-logout:hover { background: rgba(224,123,84,0.13); }

        /* ── MAIN ── */
        .main-content {
          flex: 1;
          margin-left: 240px;
          display: flex; flex-direction: column;
          min-height: 100vh;
          min-width: 0;
        }

        /* ── MOBILE TOPBAR ── */
        .mobile-topbar {
          display: none;
          align-items: center; justify-content: space-between;
          padding: 14px 20px;
          background: rgba(13,27,20,0.97); backdrop-filter: blur(10px);
          border-bottom: 1px solid #1E3328;
          position: sticky; top: 0; z-index: 40;
        }
        .mobile-logo { font-family: 'Playfair Display', serif; color: #C9A84C; font-size: 1.1rem; }
        .btn-menu {
          background: none; border: 1px solid #1E3328; color: #EDE8DC;
          border-radius: 8px; padding: 8px 10px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── OVERLAY ── */
        .overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.55); z-index: 45;
          backdrop-filter: blur(2px);
        }

        /* ── MOBILE ── */
        @media (max-width: 900px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.5); }
          .main-content { margin-left: 0; }
          .mobile-topbar { display: flex; }
          .overlay.visible { display: block; }
        }

        @media (max-width: 480px) {
          .sidebar { width: 220px; }
        }
      `}</style>

      <div className="layout">
        {/* ── Sidebar ── */}
        <aside className={`sidebar ${sideOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">SenCompta IA</div>
          <div className="sidebar-tagline">Votre comptable intelligent</div>

          <nav className="sidebar-nav">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setSideOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.premium && !isPremium && (
                  <span className="nav-premium-tag">PREMIUM</span>
                )}
              </a>
            ))}

            <div className="nav-divider" />

            <a
              href="/pricing"
              className="nav-upgrade"
              onClick={() => setSideOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {isPremium ? 'Mon abonnement' : isFree ? 'Passer Standard' : 'Mon abonnement'}
            </a>
          </nav>

          <div className="sidebar-bottom">
            {user && (
              <div className="user-card">
                <div className="user-name">{user.boutique_name || user.phone}</div>
                <div className={`user-plan ${user.plan?.toLowerCase() || 'free'}`}>
                  {user.plan || 'STANDARD'}
                </div>
                {user.subscription_expiry && (
                  <div className="sub-expiry">
                    Expire le {new Date(user.subscription_expiry).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>
            )}
            <button className="btn-logout" onClick={logout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Déconnexion
            </button>
          </div>
        </aside>

        {/* ── Overlay mobile ── */}
        <div
          className={`overlay ${sideOpen ? 'visible' : ''}`}
          onClick={() => setSideOpen(false)}
        />

        {/* ── Contenu principal ── */}
        <main className="main-content">
          <div className="mobile-topbar">
            <span className="mobile-logo">SenCompta IA</span>
            <button className="btn-menu" onClick={() => setSideOpen(!sideOpen)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
          {children}
        </main>
      </div>
    </>
  );
}
