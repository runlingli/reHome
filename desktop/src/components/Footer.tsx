import { T, Logo } from './ui'

export function Footer() {
  return (
    <footer style={{ borderTop: '0.5px solid ' + T.border, marginTop: 40, padding: '40px 32px 60px', background: T.surfaceAlt }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40 }}>
        <div>
          <Logo size={22} />
          <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, margin: '14px 0 0', maxWidth: 320 }}>
            A free hand-off network for graduating international students and the locals who furnish their next homes.
          </p>
        </div>
        {[
          { h: 'For students', items: ['Post an item', 'Verification (.edu)', 'Pickup safety', 'Local only — no shipping'] },
          { h: 'For locals',   items: ['Browse', 'Verification (ID)', 'Saved items', 'Trust & guidelines'] },
          { h: 'About',        items: ['Why free?', 'Schools onboard', 'Press', 'Contact'] },
        ].map(col => (
          <div key={col.h}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: '"JetBrains Mono", monospace', color: T.text, marginBottom: 12 }}>{col.h}</div>
            {col.items.map(i => <div key={i} style={{ fontSize: 13, color: T.textMuted, padding: '5px 0', cursor: 'pointer' }}>{i}</div>)}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1320, margin: '36px auto 0', paddingTop: 20, borderTop: '0.5px solid ' + T.border, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>
        <span>© 2026 reHome · Boston · NYC · Bay</span>
        <span>Built by students, for hand-me-downs.</span>
      </div>
    </footer>
  )
}
