'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const fcfa = (n) => new Intl.NumberFormat('fr-SN').format(Math.abs(n)) + ' FCFA';
const PIE_COLORS = ['#C9A84C','#E8C97D','#8B6914','#F5DFA0','#6B4F10','#D4B86A','#A07820'];

const SVGUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
  </svg>
);
const SVGDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
  </svg>
);
const SVGMoney = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const SVGRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

function ScoreCard({ label, value, accent, icon, isNet }) {
  return (
    <div style={{
      background:'#122019', borderRadius:12,
      border:'1px solid #1E3328', borderTop:`3px solid ${accent}`,
      padding:'16px 18px', display:'flex', gap:12, alignItems:'flex-start',
    }}>
      <div style={{
        width:38, height:38, borderRadius:9, flexShrink:0,
        background:`${accent}18`, border:`1px solid ${accent}28`,
        display:'flex', alignItems:'center', justifyContent:'center', color:accent,
      }}>
        {icon}
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:'0.67rem', textTransform:'uppercase', letterSpacing:1, color:'#8A9E8F', marginBottom:4}}>
          {label}
        </div>
        <div style={{
          fontFamily:"'DM Mono',monospace",
          fontSize:'clamp(0.95rem, 2.5vw, 1.25rem)',
          color: isNet ? (value >= 0 ? '#4CAF7D' : '#E07B54') : '#EDE8DC',
          lineHeight:1.2,
        }}>
          {isNet && (value >= 0 ? '+' : '-')}{fcfa(isNet ? Math.abs(value) : value)}
        </div>
      </div>
    </div>
  );
}

function CustomAreaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'#1A2E20', border:'1px solid #1E3328', borderRadius:8, padding:'10px 14px', fontSize:'0.78rem'}}>
      <p style={{color:'#8A9E8F', marginBottom:4}}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{color:p.color}}>
          {p.name === 'recettes' ? 'Recettes' : 'Dépenses'} : {fcfa(p.value)}
        </p>
      ))}
    </div>
  );
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'#1A2E20', border:'1px solid #1E3328', borderRadius:8, padding:'10px 14px', fontSize:'0.78rem'}}>
      <p style={{color:payload[0].payload.fill}}>{payload[0].name}</p>
      <p>{fcfa(payload[0].value)} — {payload[0].payload.percent}%</p>
    </div>
  );
}

function EmptyChart({ text }) {
  return (
    <div style={{textAlign:'center', padding:'32px 16px', color:'#8A9E8F', fontSize:'0.83rem'}}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E3328" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{margin:'0 auto 10px', display:'block'}}>
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
      {text}
    </div>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 769);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function DashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState(30);
  const isMobile              = useIsMobile();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/transactions?days=${period}`);
      const json = await res.json();
      setData(json);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const kpis = data?.kpis || { ca:0, charges:0, net:0 };

  // ── Fix graph : trier par date et formater correctement ──
  const dailySeries = (data?.dailySeries || [])
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(row => ({
      date:     new Date(row.date).toLocaleDateString('fr-SN', { day:'2-digit', month:'short' }),
      recettes: Number(row.recettes),
      depenses: Number(row.depenses),
    }));

  const categoryData = (data?.categoryBreakdown || []).map(row => {
    const total = (data?.categoryBreakdown || []).reduce((s,r) => s + Number(r.total), 0);
    return {
      name:    row.categorie,
      value:   Number(row.total),
      percent: total > 0 ? ((Number(row.total)/total)*100).toFixed(1) : '0',
    };
  });

  const recentTx = data?.transactions?.slice(0, 7) || [];

  return (
    <>
      <style>{`
        .dash-topbar {
          padding: 18px 28px; border-bottom: 1px solid #1E3328;
          background: rgba(13,27,20,0.97); backdrop-filter: blur(10px);
          position: sticky; top: 0; z-index: 10;
          display: flex; align-items: center; justify-content: space-between; gap:12px; flex-wrap:wrap;
        }
        .dash-topbar-title { font-family:'Playfair Display',serif; font-size:1.2rem; }
        .dash-topbar-right  { display:flex; align-items:center; gap:10px; }
        .period-sel {
          background:#122019; color:#EDE8DC; border:1px solid #1E3328;
          border-radius:8px; padding:7px 12px; font-size:0.82rem;
          font-family:'IBM Plex Sans',sans-serif; outline:none;
        }
        .btn-refresh {
          background:#C9A84C; color:#0D1B14; border:none; border-radius:8px;
          padding:7px 14px; font-size:0.82rem; font-weight:700; cursor:pointer;
          display:flex; align-items:center; gap:6px;
          -webkit-tap-highlight-color:transparent;
        }
        .dash-content { padding:20px 28px; display:flex; flex-direction:column; gap:18px; }
        .score-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        .charts-row { display:grid; grid-template-columns:2fr 1fr; gap:14px; }
        .bottom-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .chart-card { background:#122019; border:1px solid #1E3328; border-radius:12px; padding:18px 20px; }
        .chart-title { font-family:'Playfair Display',serif; font-size:0.95rem; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
        .chart-title small { font-size:0.7rem; color:#8A9E8F; font-family:'IBM Plex Sans',sans-serif; }
        .section-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
        .section-title { font-family:'Playfair Display',serif; font-size:0.95rem; }
        .btn-see-all {
          color:#C9A84C; border:1px solid rgba(201,168,76,0.35); background:transparent;
          border-radius:8px; padding:5px 12px; font-size:0.75rem; cursor:pointer;
          text-decoration:none;
        }
        .tx-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #1E3328; }
        .tx-row:last-child { border-bottom:none; }
        .tx-icon { width:32px; height:32px; border-radius:7px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
        .tx-body { flex:1; min-width:0; }
        .tx-libelle { font-size:0.83rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .tx-cat { font-size:0.7rem; color:#8A9E8F; }
        .tx-right { text-align:right; flex-shrink:0; }
        .tx-amount { font-family:'DM Mono',monospace; font-size:0.82rem; }
        .tx-date { font-size:0.68rem; color:#8A9E8F; }
        .ai-cta {
          background:linear-gradient(135deg,#1A2E20,#122019);
          border:1px solid #C9A84C; border-radius:12px; padding:24px 20px; text-align:center;
        }
        .ai-badge {
          font-size:0.62rem; text-transform:uppercase; letter-spacing:1.5px;
          color:#C9A84C; background:rgba(201,168,76,0.1); border:1px solid rgba(201,168,76,0.3);
          padding:2px 8px; border-radius:20px; display:inline-block; margin-bottom:10px;
        }
        .btn-analyse {
          display:inline-flex; align-items:center; gap:8px;
          background:linear-gradient(135deg,#C9A84C,#A07820); color:#0D1B14;
          border:none; border-radius:8px; padding:10px 20px;
          font-size:0.85rem; font-weight:700; cursor:pointer; text-decoration:none;
          margin-top:12px;
        }

        @media (max-width:1100px) {
          .charts-row { grid-template-columns:1fr; }
          .bottom-row  { grid-template-columns:1fr; }
        }
        @media (max-width:768px) {
          .dash-topbar  { padding:12px 16px; }
          .dash-content { padding:14px; gap:14px; }
          .score-grid   { grid-template-columns:1fr; }
        }
        @media (max-width:480px) {
          .dash-topbar-title { font-size:1rem; }
          .period-sel { font-size:0.75rem; padding:6px 8px; }
        }
      `}</style>

      {/* Topbar */}
      <div className="dash-topbar">
        <h1 className="dash-topbar-title">Tableau de bord</h1>
        <div className="dash-topbar-right">
          <select className="period-sel" value={period} onChange={e => setPeriod(Number(e.target.value))}>
            <option value={7}>7 jours</option>
            <option value={30}>30 jours</option>
            <option value={90}>90 jours</option>
          </select>
          <button className="btn-refresh" onClick={fetchData}>
            <SVGRefresh /> <span style={{display: isMobile ? 'none' : 'inline'}}>Actualiser</span>
          </button>
        </div>
      </div>

      <div className="dash-content">

        {/* KPIs */}
        <div className="score-grid">
          <ScoreCard label="Chiffre d'affaires" value={kpis.ca}      accent="#4CAF7D" icon={<SVGMoney />} />
          <ScoreCard label="Charges totales"    value={kpis.charges} accent="#E07B54" icon={<SVGDown />} />
          <ScoreCard label="Résultat net" value={kpis.net} accent={kpis.net>=0?'#C9A84C':'#E07B54'} icon={kpis.net>=0?<SVGUp/>:<SVGDown/>} isNet />
        </div>

        {/* Charts */}
        <div className="charts-row">
          {/* Area chart — fix dates */}
          <div className="chart-card">
            <div className="chart-title">
              Flux de trésorerie <small>— {period} jours</small>
            </div>
            {dailySeries.length >= 2 ? (
              <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
                <AreaChart data={dailySeries} margin={{top:5, right:5, bottom:5, left:0}}>
                  <defs>
                    <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#4CAF7D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4CAF7D" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#E07B54" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E07B54" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3328" vertical={false}/>
                  <XAxis
                    dataKey="date"
                    tick={{fill:'#8A9E8F', fontSize:isMobile?8:10}}
                    interval={isMobile ? Math.ceil(dailySeries.length/4) : Math.ceil(dailySeries.length/7)}
                    tickLine={false}
                    axisLine={{stroke:'#1E3328'}}
                  />
                  <YAxis
                    tick={{fill:'#8A9E8F', fontSize:isMobile?8:10}}
                    tickFormatter={v => v>=1000 ? `${(v/1000).toFixed(0)}k` : v}
                    width={isMobile?32:40}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomAreaTooltip />}/>
                  <Legend wrapperStyle={{fontSize:11, paddingTop:8}}/>
                  <Area type="monotone" dataKey="recettes" name="recettes" stroke="#4CAF7D" strokeWidth={2} fill="url(#gR)" dot={false}/>
                  <Area type="monotone" dataKey="depenses" name="depenses" stroke="#E07B54" strokeWidth={2} fill="url(#gD)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            ) : dailySeries.length === 1 ? (
              <EmptyChart text="Ajoutez des transactions sur plusieurs jours pour voir l'évolution" />
            ) : (
              <EmptyChart text="Aucune donnée pour la période sélectionnée" />
            )}
          </div>

          {/* Pie */}
          <div className="chart-card">
            <div className="chart-title">Répartition dépenses</div>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value">
                      {categoryData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{display:'flex', flexDirection:'column', gap:4, marginTop:8}}>
                  {categoryData.slice(0,4).map((cat,i) => (
                    <div key={i} style={{display:'flex', alignItems:'center', gap:6, fontSize:'0.7rem', color:'#8A9E8F'}}>
                      <div style={{width:7, height:7, borderRadius:'50%', background:PIE_COLORS[i%PIE_COLORS.length], flexShrink:0}}/>
                      <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{cat.name}</span>
                      <span style={{color:'#EDE8DC'}}>{cat.percent}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyChart text="Aucune dépense enregistrée" />
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="bottom-row">
          {/* Transactions récentes */}
          <div className="chart-card">
            <div className="section-head">
              <span className="section-title">Dernières opérations</span>
              <a href="/dashboard/transactions" className="btn-see-all">Tout voir</a>
            </div>
            {recentTx.length > 0 ? recentTx.map((tx,i) => (
              <div key={tx.id||i} className="tx-row">
                <div className="tx-icon" style={{
                  background: tx.type==='RECETTE' ? 'rgba(76,175,125,0.15)' : 'rgba(224,123,84,0.15)',
                  color: tx.type==='RECETTE' ? '#4CAF7D' : '#E07B54',
                }}>
                  {tx.type==='RECETTE' ? <SVGUp/> : <SVGDown/>}
                </div>
                <div className="tx-body">
                  <div className="tx-libelle">{tx.libelle}</div>
                  <div className="tx-cat">{tx.categorie}</div>
                </div>
                <div className="tx-right">
                  <div className="tx-amount" style={{color:tx.type==='RECETTE'?'#4CAF7D':'#E07B54'}}>
                    {tx.type==='RECETTE'?'+':'-'}{fcfa(tx.montant)}
                  </div>
                  <div className="tx-date">
                    {new Date(tx.date).toLocaleDateString('fr-SN',{day:'2-digit',month:'short'})}
                  </div>
                </div>
              </div>
            )) : (
              <EmptyChart text="Envoyez votre première opération sur WhatsApp" />
            )}
          </div>

          {/* Conseils IA */}
          <div>
            <div className="section-head">
              <span className="section-title">Conseils IA</span>
            </div>
            <div className="ai-cta">
              <div className="ai-badge">IA Premium — Gemini</div>
              <div style={{fontFamily:"'Playfair Display',serif", fontSize:'1rem', marginBottom:6}}>
                Conseils Stratégiques
              </div>
              <p style={{fontSize:'0.8rem', color:'#8A9E8F', lineHeight:1.6}}>
                3 conseils personnalisés basés sur vos transactions réelles.
              </p>
              <a href="/dashboard/advice" className="btn-analyse">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Analyser mes finances
              </a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
