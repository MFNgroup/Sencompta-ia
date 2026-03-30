// app/dashboard/layout.jsx
// Layout partagé — sidebar + topbar pour toutes les pages /dashboard/*

'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { id: 'dashboard',    href: '/dashboard',              icon: '◈', label: 'Tableau de bord' },
  { id: 'transactions', href: '/dashboard/transactions', icon: '⇅', label: 'Transactions' },
  { id: 'debts',        href: '/dashboard/debts',        icon: '◎', label: 'Créances' },
  { id: 'settings',     href: '/dashboard/settings',     icon: '⚙', label: 'Paramètres' },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser]     = useState(null);
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    fetch('/api/user/me').then(r => r.json()).then(d => { if (!d.error) setUser(d); });
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

  const isPremium = user?.plan === 'PREMIUM';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=IBM+Plex+Sans:wght@400;500;600&family=DM+Mono:wght@500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D1B14; color: #EDE8DC; font-family: 'IBM Plex Sans', sans-serif; }

        .layout { display: flex; min-height: 100vh; }

        /* ── Sidebar ── */
        .sidebar {
          width: 240px; flex-shrink: 0;
          background: #122019;
          border-right: 1px solid #1E3328;
          display: flex; flex-direction: column;
          padding: 24px 16px;
          position: fixed; top: 0; left: 0; height: 100vh;
          z-index: 50; overflow-y: auto;
          transition: transform 0.25s;
        }
        .sidebar.closed { transform: translateX(-100%); }
        .sidebar-logo { font-family: 'Playfair Display', serif; font-size: 1.3rem; color: #C9A84C; margin-bottom: 4px; padding: 0 8px; }
        .sidebar-tagline { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px; color: #8A9E8F; padding: 0 8px; margin-bottom: 28px; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 8px;
          cursor: pointer; border: none; background: none;
          width: 100%; text-align: left;
          font-size: 0.86rem; color: #8A9E8F;
          transition: all 0.15s; text-decoration: none;
        }
        .nav-item:hover { background: rgba(201,168,76,0.07); color: #EDE8DC; }
        .nav-item.active { background: rgba(201,168,76,0.13); color: #C9A84C; }
        .nav-icon { width: 18px; text-align: center; font-size: 1rem; }
        .nav-premium-tag {
          font-size: 0.55rem; background: rgba(201,168,76,0.15); color: #C9A84C;
          border-radius: 4px; padding: 1px 4px; margin-left: auto;
        }

        /* ── Sidebar bottom ── */
        .sidebar-bottom { margin-top: auto; padding-top: 16px; border-top: 1px solid #1E3328; }
        .user-card { padding: 10px 12px; border-radius: 8px; background: rgba(0,0,0,0.2); margin-bottom: 8px; }
        .user-name { font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-plan {
          font-size: 0.65rem; margin-top: 2px;
          color: #C9A84C; text-transform: uppercase; letter-spacing: 1px;
        }
        .user-plan.standard { color: #4CAF7D; }
        .btn-logout {
          width: 100%; padding: 8px 12px;
          background: rgba(224,123,84,0.08); border: 1px solid rgba(224,123,84,0.2);
          color: #E07B54; border-radius: 8px; font-size: 0.8rem;
          cursor: pointer; transition: background 0.15s; font-family: inherit;
        }
        .btn-logout:hover { background: rgba(224,123,84,0.15); }

        /* ── Main ── */
        .main-content { flex: 1; margin-left: 240px; display: flex; flex-direction: column; min-height: 100vh; }

        /* ── Topbar mobile ── */
        .mobile-topbar {
          display: none; align-items: center; justify-content: space-between;
          padding: 14px 20px;
          background: rgba(13,27,20,0.95); backdrop-filter: blur(10px);
          border-bottom: 1px solid #1E3328;
          position: sticky; top: 0; z-index: 40;
        }
        .mobile-logo { font-family: 'Playfair Display', serif; color: #C9A84C; font-size: 1.1rem; }
        .btn-menu {
          background: none; border: 1px solid #1E3328; color: #EDE8DC;
          border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 1rem;
        }
        .overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.5); z-index: 45;
        }

        @media (max-width: 900px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0; }
          .mobile-topbar { display: flex; }
          .overlay.visible { display: block; }
        }
      `}</style>

      <div className="layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sideOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">SenCompta IA</div>
          <div className="sidebar-tagline">Votre comptable intelligent</div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setSideOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </a>
            ))}
            {/* Lien Conseils IA — Premium seulement */}
            <a
              href="/dashboard/advice"
              className={`nav-item ${pathname === '/dashboard/advice' ? 'active' : ''}`}
              onClick={() => setSideOpen(false)}
            >
              <span className="nav-icon">✦</span>
              Conseils IA
              {!isPremium && <span className="nav-premium-tag">PREMIUM</span>}
            </a>
            <a
              href="/pricing"
              className="nav-item"
              style={{ marginTop: '8px', borderTop: '1px solid #1E3328', paddingTop: '14px' }}
            >
              <span className="nav-icon">⭐</span>
              {isPremium ? 'Mon abonnement' : 'Passer Premium'}
            </a>
          </nav>

          <div className="sidebar-bottom">
            {user && (
              <div className="user-card">
                <div className="user-name">{user.boutique_name || user.phone}</div>
                <div className={`user-plan ${user.plan?.toLowerCase()}`}>{user.plan}</div>
              </div>
            )}
            <button className="btn-logout" onClick={logout}>↩ Déconnexion</button>
          </div>
        </aside>

        {/* Overlay mobile */}
        <div className={`overlay ${sideOpen ? 'visible' : ''}`} onClick={() => setSideOpen(false)} />

        {/* Contenu principal */}
        <main className="main-content">
          <div className="mobile-topbar">
            <span className="mobile-logo">SenCompta</span>
            <button className="btn-menu" onClick={() => setSideOpen(!sideOpen)}>☰</button>
          </div>
          {children}
        </main>
      </div>
    </>
  );
}
