import { T, ACCENT, ACCENT_SOFT, VerifiedBadge } from './ui'
import { useStore } from '../store'

export function HeroBand() {
  const { openPost } = useStore()
  return (
    <section style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 32px 8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, borderRadius: 22, overflow: 'hidden' }}>
        {/* Banner */}
        <div style={{
          position: 'relative', padding: '40px 44px', minHeight: 240,
          background: `linear-gradient(135deg, ${ACCENT_SOFT} 0%, #F6E5DD 50%, #EFE9DC 100%)`,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: '#8A4A38', letterSpacing: 1.4, textTransform: 'uppercase' }}>
              Grad season · class of '26
            </div>
            <h1 style={{ margin: '14px 0 10px', fontSize: 48, fontWeight: 800, lineHeight: 1.04, letterSpacing: -1.2, maxWidth: 540, color: T.text }}>
              Pass it on,<br />not on the curb.
            </h1>
            <p style={{ fontSize: 15, color: '#5A4A3A', lineHeight: 1.55, maxWidth: 480, margin: 0 }}>
              International students hand over apartments — locals furnish theirs. Free items, both sides verified.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button style={{ padding: '12px 18px', borderRadius: 12, background: T.text, color: T.bg, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              Browse 428 items
            </button>
            <button onClick={openPost} style={{ padding: '12px 18px', borderRadius: 12, background: 'transparent', color: T.text, border: '1px solid ' + T.text, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              Post an item
            </button>
          </div>
          <div style={{ position: 'absolute', right: 36, top: 36, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#8A4A38', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span style={{ letterSpacing: 0.6 }}>05 / 31</span>
            <span style={{ width: 40, height: 0.5, background: '#8A4A38', opacity: 0.4 }} />
            <span style={{ letterSpacing: 0.4, opacity: 0.7 }}>last move-out</span>
          </div>
        </div>

        {/* Stat tiles */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 16 }}>
          <StatTile big="428" label="Items posted in the last 7 days" sub="across Davis area" tint="#EFE9DC" />
          <StatTile big="980+" label="Local pickups" tint="#E0EAFA" badgeKind="local" />
        </div>
      </div>
    </section>
  )
}

function StatTile({ big, label, sub, tint, badgeKind }: { big: string; label: string; sub?: string; tint: string; badgeKind?: 'edu' | 'local' }) {
  return (
    <div style={{ background: tint, borderRadius: 22, padding: '24px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 112 }}>
      <div>{badgeKind && <VerifiedBadge kind={badgeKind} />}</div>
      <div>
        <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -0.8, marginTop: 8 }}>{big}</div>
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4, lineHeight: 1.4 }}>
          {label}{sub && <><br />{sub}</>}
        </div>
      </div>
    </div>
  )
}

export function TrustBand() {
  return (
    <section style={{ marginTop: 80, padding: '40px 44px', borderRadius: 22, background: T.surface, border: '0.75px solid ' + T.border, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32 }}>
      <TrustCol kind="edu"   title="Posters: .edu verified"   body="Listings only open to addresses ending in .edu. The green badge stays on every card so receivers know who they're talking to." />
      <TrustCol kind="local" title="Receivers: locally rooted" body="Local residents upload a state ID — we OCR the address and discard the image. Fellow students with .edu can also pick up." />
      <TrustCol kind="free"  title="Free, on purpose"          body="No payments processed in-app. Estimated retail value sits beside Free so you can see what's being passed on." />
    </section>
  )
}

function TrustCol({ kind, title, body }: { kind: string; title: string; body: string }) {
  const ic = kind === 'free' ? 'check' : 'shield'
  const v = kind === 'edu'
    ? { color: '#1F8A5B', bg: '#E0F1E7' }
    : kind === 'local'
    ? { color: '#2A6FDB', bg: '#E0EAFA' }
    : { color: ACCENT, bg: '#F2DED7' }
  return (
    <div>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: v.bg, color: v.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={v.color} strokeWidth={1.6} strokeLinejoin="round">
          {ic === 'check'
            ? <path d="M5 12.5L10 17l9-10" strokeLinecap="round" strokeLinejoin="round"/>
            : <><path d="M12 3l8 3v7c0 4.5-3.4 7.6-8 8-4.6-.4-8-3.5-8-8V6l8-3z"/><path d="M9 12l2 2 4-4" strokeLinecap="round"/></>
          }
        </svg>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.55, margin: 0 }}>{body}</p>
    </div>
  )
}
