// app/not-found.jsx
export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0D1B14', color: '#EDE8DC',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'IBM Plex Sans', sans-serif", textAlign: 'center', padding: '24px'
    }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '5rem', color: '#1E3328', marginBottom: '16px' }}>404</div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: '8px' }}>Page introuvable</h1>
      <p style={{ color: '#8A9E8F', marginBottom: '28px' }}>Cette page n'existe pas ou a été déplacée.</p>
      <a href="/dashboard" style={{
        background: 'linear-gradient(135deg, #C9A84C, #A07820)', color: '#0D1B14',
        padding: '12px 28px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700
      }}>← Retour au dashboard</a>
    </div>
  );
}
