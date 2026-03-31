// app/dashboard/page.jsx
// Dashboard Premium SenCompta IA
// Aesthetic: West African luxury fintech — deep forest green + gold + warm cream

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ── Utilitaires ───────────────────────────────────────────────
const fcfa = (n) => new Intl.NumberFormat('fr-SN').format(Math.abs(n)) + ' FCFA';
const sign = (n) => (n >= 0 ? '+' : '-');

const PIE_COLORS = ['#C9A84C', '#E8C97D', '#8B6914', '#F5DFA0', '#6B4F10', '#D4B86A', '#A07820'];

// ── Composants atomiques ──────────────────────────────────────

function ScoreCard({ label, value, delta, icon, accent }) {
  const isPositive = delta >= 0;
  return (
    <div className="score-card" style={{ '--accent': accent }}>
      <div className="score-icon">{icon}</div>
      <div className="score-body">
        <span className="score-label">{label}</span>
        <span className="score-value">{fcfa(value)}</span>
        {delta !== undefined && (
          <span className={`score-delta ${isPositive ? 'pos' : 'neg'}`}>
            {sign(delta)} {fcfa(Math.abs(delta))} vs mois préc.
          </span>
        )}
      </div>
      <div className="score-bar" />
    </div>
  );
}

function CustomAreaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-date">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'recettes' ? '↑ Recettes' : '↓ Dépenses'} : {fcfa(p.value)}
        </p>
      ))}
    </div>
  );
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p style={{ color: payload[0].payload.fill }}>{payload[0].name}</p>
      <p>{fcfa(payload[0].value)} — {payload[0].payload.percent}%</p>
    </div>
  );
}

function AIAdvicePanel({ advice, loading }) {
  const impactColor = { ÉLEVÉ: '#C9A84C', MOYEN: '#8B9467', FAIBLE: '#6B7280' };
  if (loading) {
    return (
      <div className="ai-panel loading">
        <div className="ai-spinner" />
        <p>Gemini analyse vos 30 dernières transactions…</p>
      </div>
    );
  }
  if (!advice) return null;
  return (
    <div className="ai-panel">
      <div className="ai-header">
        <span className="ai-badge">✦ IA Premium</span>
        <h3>Conseils Stratégiques</h3>
        {advice.resume && <p className="ai-resume">{advice.resume}</p>}
        {advice.score_sante && (
          <div className="health-score">
            <span>Score santé</span>
            <div className="health-bar">
              <div className="health-fill" style={{ width: `${advice.score_sante}%` }} />
            </div>
            <span className="health-num">{advice.score_sante}/100</span>
          </div>
        )}
      </div>
      <div className="ai-conseils">
        {advice.conseils?.map((c, i) => (
          <div key={i} className="conseil-card">
            <div className="conseil-icon">{c.emoji}</div>
            <div className="conseil-body">
              <div className="conseil-head">
                <strong>{c.titre}</strong>
                <span className="conseil-impact" style={{ color: impactColor[c.impact] }}>
                  {c.impact}
                </span>
              </div>
              <p>{c.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionRow({ tx }) {
  const isRecette = tx.type === 'RECETTE';
  return (
    <div className="tx-row">
      <div className="tx-icon-wrap" data-type={tx.type}>
        {isRecette ? '↑' : '↓'}
      </div>
      <div className="tx-details">
        <span className="tx-libelle">{tx.libelle}</span>
        <span className="tx-cat">{tx.categorie}</span>
      </div>
      <div className="tx-right">
        <span className="tx-amount" data-type={tx.type}>
          {isRecette ? '+' : '-'} {fcfa(tx.montant)}
        </span>
        <span className="tx-date">{new Date(tx.date).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short' })}</span>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData]         = useState(null);
  const [advice, setAdvice]     = useState(null);
  const [loadData, setLoadData] = useState(true);
  const [loadAI, setLoadAI]     = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [period, setPeriod]     = useState(30);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchData = useCallback(async () => {
    setLoadData(true);
    try {
      const res = await fetch(`/api/transactions?days=${period}`);
      const json = await res.json();
      setData(json);
      setIsPremium(json.user?.plan === 'PREMIUM');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadData(false);
    }
  }, [period]);

  const fetchAdvice = useCallback(async () => {
    setLoadAI(true);
    try {
      const res = await fetch('/api/ai-advice');
      const json = await res.json();
      setAdvice(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadAI(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Formater les données pour Recharts
  const dailySeries = (data?.dailySeries || []).map((row) => ({
    date:     new Date(row.date).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short' }),
    recettes: Number(row.recettes),
    depenses: Number(row.depenses),
  }));

  const categoryData = (data?.categoryBreakdown || []).map((row) => {
    const total = data.categoryBreakdown.reduce((s, r) => s + Number(r.total), 0);
    return {
      name:    row.categorie,
      value:   Number(row.total),
      percent: total > 0 ? ((Number(row.total) / total) * 100).toFixed(1) : '0',
    };
  });

  const kpis = data?.kpis || { ca: 0, charges: 0, net: 0 };

  return (
    <>
      <style>{`
        /* ── Tokens ──────────────────────────────────────────── */
        :root {
          --bg:        #0D1B14;
          --surface:   #122019;
          --border:    #1E3328;
          --gold:      #C9A84C;
          --gold-light:#E8C97D;
          --text:      #EDE8DC;
          --muted:     #8A9E8F;
          --recette:   #4CAF7D;
          --depense:   #E07B54;
          --font-head: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Mono', 'Courier New', monospace;
          --font-ui:   'IBM Plex Sans', sans-serif;
          --radius:    12px;
          --shadow:    0 4px 24px rgba(0,0,0,0.4);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--text); font-family: var(--font-ui); }

        /* ── Layout ──────────────────────────────────────────── */
        .dash-wrapper { display: flex; min-height: 100vh; }

        /* ── Sidebar ─────────────────────────────────────────── */
        .sidebar {
          width: 240px; flex-shrink: 0;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          padding: 28px 20px;
          position: sticky; top: 0; height: 100vh;
        }
        .sidebar-logo {
          font-family: var(--font-head);
          font-size: 1.4rem;
          color: var(--gold);
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }
        .sidebar-tagline { font-size: 0.7rem; color: var(--muted); margin-bottom: 32px; text-transform: uppercase; letter-spacing: 1px; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 8px;
          cursor: pointer; transition: all 0.15s;
          font-size: 0.88rem; color: var(--muted);
          border: none; background: none; width: 100%; text-align: left;
        }
        .nav-item:hover { background: rgba(201,168,76,0.08); color: var(--text); }
        .nav-item.active { background: rgba(201,168,76,0.14); color: var(--gold); }
        .nav-icon { width: 18px; text-align: center; }
        .premium-badge {
          margin-top: auto;
          background: linear-gradient(135deg, #1A2E1F, #0D1B14);
          border: 1px solid var(--gold);
          border-radius: var(--radius);
          padding: 14px;
          font-size: 0.75rem;
        }
        .premium-badge strong { color: var(--gold); display: block; margin-bottom: 4px; }
        .premium-badge span { color: var(--muted); }

        /* ── Main content ────────────────────────────────────── */
        .main { flex: 1; overflow-y: auto; }
        .topbar {
          padding: 20px 32px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(13,27,20,0.95);
          backdrop-filter: blur(10px);
          position: sticky; top: 0; z-index: 10;
        }
        .topbar-title { font-family: var(--font-head); font-size: 1.25rem; color: var(--text); }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .period-select {
          background: var(--surface); color: var(--text);
          border: 1px solid var(--border); border-radius: 8px;
          padding: 6px 12px; font-size: 0.82rem; cursor: pointer;
          font-family: var(--font-ui);
        }
        .btn-refresh {
          background: var(--gold); color: #0D1B14;
          border: none; border-radius: 8px; padding: 7px 16px;
          font-size: 0.82rem; font-weight: 700; cursor: pointer;
          transition: opacity 0.15s;
        }
        .btn-refresh:hover { opacity: 0.85; }

        /* ── Content area ────────────────────────────────────── */
        .content { padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; }

        /* ── Score cards ─────────────────────────────────────── */
        .score-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .score-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-top: 3px solid var(--accent);
          border-radius: var(--radius);
          padding: 20px;
          display: flex; gap: 16px; align-items: flex-start;
          position: relative; overflow: hidden;
          transition: transform 0.2s;
        }
        .score-card:hover { transform: translateY(-2px); }
        .score-card::after {
          content: '';
          position: absolute; bottom: 0; right: 0;
          width: 80px; height: 80px;
          background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
          opacity: 0.07;
        }
        .score-icon { font-size: 1.5rem; }
        .score-body { display: flex; flex-direction: column; gap: 4px; }
        .score-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); }
        .score-value { font-family: var(--font-body); font-size: 1.35rem; color: var(--text); }
        .score-delta { font-size: 0.72rem; color: var(--muted); }
        .score-delta.pos { color: var(--recette); }
        .score-delta.neg { color: var(--depense); }

        /* ── Charts row ──────────────────────────────────────── */
        .charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
        .chart-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
        }
        .chart-title {
          font-family: var(--font-head);
          font-size: 1rem; color: var(--text);
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .chart-title small { font-family: var(--font-ui); font-size: 0.7rem; color: var(--muted); font-style: italic; }
        .chart-tooltip {
          background: #1A2E20; border: 1px solid var(--border);
          border-radius: 8px; padding: 10px 14px;
          font-family: var(--font-body); font-size: 0.78rem;
        }
        .tooltip-date { color: var(--muted); margin-bottom: 4px; }

        /* ── Bottom row ──────────────────────────────────────── */
        .bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        /* ── Transaction list ────────────────────────────────── */
        .tx-list { display: flex; flex-direction: column; gap: 1px; }
        .tx-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        .tx-row:last-child { border-bottom: none; }
        .tx-icon-wrap {
          width: 36px; height: 36px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1rem; flex-shrink: 0;
        }
        .tx-icon-wrap[data-type="RECETTE"] { background: rgba(76,175,125,0.15); color: var(--recette); }
        .tx-icon-wrap[data-type="DEPENSE"] { background: rgba(224,123,84,0.15); color: var(--depense); }
        .tx-details { flex: 1; min-width: 0; }
        .tx-libelle { display: block; font-size: 0.85rem; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tx-cat { font-size: 0.72rem; color: var(--muted); }
        .tx-right { text-align: right; flex-shrink: 0; }
        .tx-amount { display: block; font-family: var(--font-body); font-size: 0.85rem; }
        .tx-amount[data-type="RECETTE"] { color: var(--recette); }
        .tx-amount[data-type="DEPENSE"] { color: var(--depense); }
        .tx-date { font-size: 0.7rem; color: var(--muted); }

        /* ── AI Panel ────────────────────────────────────────── */
        .ai-panel {
          background: linear-gradient(135deg, #1A2E20, #122019);
          border: 1px solid var(--gold);
          border-radius: var(--radius);
          padding: 22px;
        }
        .ai-panel.loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px; }
        .ai-spinner {
          width: 32px; height: 32px;
          border: 2px solid var(--border);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ai-header { margin-bottom: 18px; }
        .ai-badge {
          font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1.5px;
          color: var(--gold); background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.3);
          padding: 2px 8px; border-radius: 20px;
          display: inline-block; margin-bottom: 8px;
        }
        .ai-header h3 { font-family: var(--font-head); font-size: 1.1rem; margin-bottom: 6px; }
        .ai-resume { font-size: 0.82rem; color: var(--muted); }
        .health-score { display: flex; align-items: center; gap: 10px; margin-top: 12px; font-size: 0.78rem; }
        .health-bar { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
        .health-fill { height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold-light)); border-radius: 3px; transition: width 1s ease; }
        .health-num { color: var(--gold); font-family: var(--font-body); }
        .ai-conseils { display: flex; flex-direction: column; gap: 12px; }
        .conseil-card {
          display: flex; gap: 12px; align-items: flex-start;
          background: rgba(0,0,0,0.2); border-radius: 8px; padding: 14px;
        }
        .conseil-icon { font-size: 1.4rem; flex-shrink: 0; }
        .conseil-body { flex: 1; }
        .conseil-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .conseil-head strong { font-size: 0.9rem; }
        .conseil-impact { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
        .conseil-body p { font-size: 0.8rem; color: var(--muted); line-height: 1.5; }

        /* ── Loading skeleton ────────────────────────────────── */
        .skeleton { background: linear-gradient(90deg, var(--surface), var(--border), var(--surface)); background-size: 200%; animation: shimmer 1.5s infinite; border-radius: 8px; }
        @keyframes shimmer { to { background-position: -200%; } }

        /* ── Section header ──────────────────────────────────── */
        .section-head {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 14px;
        }
        .section-title { font-family: var(--font-head); font-size: 1rem; }
        .btn-secondary {
          background: transparent; color: var(--gold);
          border: 1px solid rgba(201,168,76,0.4); border-radius: 8px;
          padding: 6px 14px; font-size: 0.78rem; cursor: pointer;
          transition: all 0.15s;
        }
        .btn-secondary:hover { background: rgba(201,168,76,0.08); }

        /* ── Empty state ─────────────────────────────────────── */
        .empty-state {
          text-align: center; padding: 32px; color: var(--muted);
          font-size: 0.85rem;
        }
        .empty-state .empty-icon { font-size: 2rem; margin-bottom: 8px; }

        /* ── Responsive ──────────────────────────────────────── */
        @media (max-width: 1024px) {
          .charts-row { grid-template-columns: 1fr; }
          .bottom-row { grid-template-columns: 1fr; }
          .score-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .sidebar { display: none; }
          .content { padding: 16px; }
          .score-grid { grid-template-columns: 1fr; }
          .topbar { padding: 14px 16px; }
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      <div className="dash-wrapper">
        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside className="sidebar">
          <div className="sidebar-logo">SenCompta</div>
          <div className="sidebar-tagline">Votre comptable IA</div>
          <nav className="sidebar-nav">
            {[
              { id: 'dashboard', icon: '◈', label: 'Tableau de bord' },
              { id: 'transactions', icon: '⇅', label: 'Transactions' },
              { id: 'debts', icon: '◎', label: 'Créances' },
              { id: 'advice', icon: '✦', label: 'Conseils IA' },
              { id: 'settings', icon: '⚙', label: 'Paramètres' },
            ].map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'advice' && !advice) fetchAdvice();
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="premium-badge">
            <strong>✦ Premium Actif</strong>
            <span>Expire le 30 avril 2025</span>
          </div>
        </aside>

        {/* ── Main ──────────────────────────────────────────── */}
        <main className="main">
          <div className="topbar">
            <h1 className="topbar-title">Tableau de bord</h1>
            <div className="topbar-right">
              <select
                className="period-select"
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
              >
                <option value={7}>7 derniers jours</option>
                <option value={30}>30 derniers jours</option>
                <option value={90}>90 derniers jours</option>
              </select>
              <button className="btn-refresh" onClick={fetchData}>
                ↺ Actualiser
              </button>
            </div>
          </div>

          <div className="content">
            {/* ── KPI Cards ───────────────────────────────── */}
            <div className="score-grid">
              <ScoreCard
                label="Chiffre d'affaires"
                value={kpis.ca}
                icon="💰"
                accent="#4CAF7D"
              />
              <ScoreCard
                label="Charges totales"
                value={kpis.charges}
                icon="💸"
                accent="#E07B54"
              />
              <ScoreCard
                label="Résultat net"
                value={kpis.net}
                icon={kpis.net >= 0 ? '📈' : '📉'}
                accent={kpis.net >= 0 ? '#C9A84C' : '#E07B54'}
              />
            </div>

            {/* ── Charts ──────────────────────────────────── */}
            <div className="charts-row">
              {/* Area Chart */}
              <div className="chart-card">
                <div className="chart-title">
                  Flux de trésorerie <small>— {period} jours</small>
                </div>
                {dailySeries.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={dailySeries} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                      <defs>
                        <linearGradient id="gradRecette" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4CAF7D" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#4CAF7D" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradDepense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E07B54" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#E07B54" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E3328" />
                      <XAxis dataKey="date" tick={{ fill: '#8A9E8F', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#8A9E8F', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomAreaTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Area type="monotone" dataKey="recettes" stroke="#4CAF7D" strokeWidth={2} fill="url(#gradRecette)" />
                      <Area type="monotone" dataKey="depenses" stroke="#E07B54" strokeWidth={2} fill="url(#gradDepense)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <p>Aucune donnée pour la période sélectionnée</p>
                  </div>
                )}
              </div>

              {/* Pie Chart */}
              <div className="chart-card">
                <div className="chart-title">Répartition dépenses</div>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">🍩</div>
                    <p>Aucune dépense enregistrée</p>
                  </div>
                )}
                {/* Légende */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                  {categoryData.slice(0, 4).map((cat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#8A9E8F' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                      <span style={{ color: '#EDE8DC' }}>{cat.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Bottom Row ─────────────────────────────── */}
            <div className="bottom-row">
              {/* Transactions récentes */}
              <div className="chart-card">
                <div className="section-head">
                  <span className="section-title">Dernières opérations</span>
                  <button className="btn-secondary">Tout voir</button>
                </div>
                {(data?.transactions?.length > 0) ? (
                  <div className="tx-list">
                    {data.transactions.slice(0, 8).map((tx, i) => (
                      <TransactionRow key={tx.id || i} tx={tx} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <p>Envoyez votre première opération sur WhatsApp</p>
                  </div>
                )}
              </div>

              {/* AI Advice */}
              <div>
                <div className="section-head">
                  <span className="section-title">✦ Conseils IA</span>
                  {!advice && !loadAI && (
                    <button className="btn-secondary" onClick={fetchAdvice}>
                      Analyser
                    </button>
                  )}
                </div>
                {(advice || loadAI) ? (
                  <AIAdvicePanel advice={advice} loading={loadAI} />
                ) : (
                  <div className="ai-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✦</div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                      Cliquez sur <strong style={{ color: 'var(--gold)' }}>Analyser</strong> pour obtenir 3 conseils stratégiques personnalisés basés sur vos transactions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
