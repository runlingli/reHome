import { useStore } from '../store'
import { ITEMS, USERS, CONDITIONS } from '../data'
import { Overlay, ItemImage, Photo, Avatar, VerifiedBadge, FreeTag, Icon, T, ACCENT } from './ui'

export function ItemDetail() {
  const { overlay, closeOverlay, savedIds, toggleSave, openMessages } = useStore()
  if (overlay.kind !== 'item' || !overlay.itemId) return null
  const item = ITEMS.find(i => i.id === overlay.itemId)
  if (!item) return null

  const seller = USERS[item.seller]
  const cond = CONDITIONS[item.condition]
  const isSaved = savedIds.has(item.id)

  return (
    <Overlay onClose={closeOverlay}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 32px 80px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <button onClick={closeOverlay} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 999, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: T.textMuted }}>
            <Icon name="back" size={14} color={T.textMuted} />
            Back to browse
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <IconBtn icon="share" label="Share" />
            <IconBtn
              icon={isSaved ? 'heartFill' : 'heart'}
              color={isSaved ? ACCENT : T.text}
              label={isSaved ? 'Saved' : 'Save'}
              onClick={() => toggleSave(item.id)}
            />
          </div>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.4, margin: '0 0 8px' }}>{item.title}</h1>
        <div style={{ fontSize: 13, color: T.textMuted, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <VerifiedBadge kind="edu" />
          <span>·</span>
          <Icon name="pin" size={14} color={T.textMuted} />
          <span>{item.location}</span>
          <span>·</span>
          <span>Pickup {item.pickup}</span>
          <span>·</span>
          <span>Posted {item.posted}</span>
        </div>

        {/* Photo gallery */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8, marginTop: 24, height: 460 }}>
          <div style={{ gridRow: 'span 2', overflow: 'hidden', borderRadius: 16 }}>
            <ItemImage item={item} height="100%" radius={0} />
          </div>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ overflow: 'hidden', borderRadius: 16 }}>
              <Photo colors={[item.photoColors[1], item.photoColors[0]]} label={`view ${i + 2}`} height="100%" radius={0} />
            </div>
          ))}
        </div>

        {/* Two-col body */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 56, marginTop: 36 }}>
          {/* Left */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 22, borderBottom: '0.5px solid ' + T.border }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>From {seller.name} · {seller.school}</div>
                <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="star" size={11} color={ACCENT} /> {seller.rating} · {seller.deals} hand-offs
                </div>
              </div>
              <Avatar user={seller} size={52} />
            </div>

            {/* Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, padding: '24px 0', borderBottom: '0.5px solid ' + T.border }}>
              {[
                { l: 'Condition', v: cond.en },
                { l: 'Used',      v: item.age },
                { l: 'Pickup',    v: item.pickup },
                { l: 'Saved by',  v: item.saved + ' people' },
              ].map(r => (
                <div key={r.l}>
                  <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: T.textFaint, letterSpacing: 0.4, textTransform: 'uppercase' }}>{r.l}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{r.v}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '0.5px solid ' + T.border, paddingTop: 24, marginTop: 0 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>About this item</h3>
              <p style={{ fontSize: 14, color: T.text, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
            </div>

            <div style={{ borderTop: '0.5px solid ' + T.border, paddingTop: 24, marginTop: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px' }}>Pickup</h3>
              <PickupMap location={item.location.split(',')[0]} />
              <div style={{ fontSize: 12, color: T.textFaint, fontFamily: '"JetBrains Mono", monospace', marginTop: 8 }}>
                Exact address shared once pickup is confirmed in chat.
              </div>
            </div>
          </div>

          {/* Right sticky sidebar */}
          <aside>
            <div style={{ position: 'sticky', top: 200, padding: 24, background: T.surface, borderRadius: 18, border: '0.75px solid ' + T.border, boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <FreeTag est={item.est} big />
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 8, lineHeight: 1.5 }}>
                Estimated retail value shown so receivers see what's being passed on. No money changes hands.
              </div>
              <button
                onClick={() => { closeOverlay(); openMessages(item.seller) }}
                style={{ width: '100%', marginTop: 18, padding: '14px 16px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Icon name="chat" size={16} color="#fff" />
                Request pickup
              </button>
              <button style={{ width: '100%', marginTop: 8, padding: '13px 16px', background: 'transparent', color: T.text, border: '1px solid ' + T.border, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Ask a question
              </button>

              <div style={{ height: 0.5, background: T.border, margin: '20px 0' }} />
              <SidebarLine label="Seller verified" value=".edu · " tone="ok" />
              <SidebarLine label="Saved" value={String(item.saved + (isSaved ? 1 : 0)) + ' people'} />
              <SidebarLine label="Pickup window" value={item.pickup} />
              <SidebarLine label="Item used" value={item.age} />
            </div>
          </aside>
        </div>
      </div>
    </Overlay>
  )
}

function SidebarLine({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
      <span style={{ color: T.textMuted }}>{label}</span>
      <span style={{ fontWeight: 600, color: tone === 'ok' ? '#1F8A5B' : T.text }}>{value}</span>
    </div>
  )
}

function PickupMap({ location }: { location: string }) {
  return (
    <div style={{ height: 200, borderRadius: 14, overflow: 'hidden', background: 'linear-gradient(135deg, #E8EFE3 0%, #D4DECB 100%)', position: 'relative', border: '0.75px solid #F0EBDF' }}>
      <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        <line x1="60"  y1="0" x2="60"  y2="200" stroke="#C2CFB8" strokeWidth="0.5" />
        <line x1="240" y1="0" x2="240" y2="200" stroke="#C2CFB8" strokeWidth="0.5" />
        <line x1="480" y1="0" x2="480" y2="200" stroke="#C2CFB8" strokeWidth="0.5" />
        <line x1="0" y1="56"  x2="600" y2="56"  stroke="#C2CFB8" strokeWidth="0.5" />
        <line x1="0" y1="142" x2="600" y2="142" stroke="#C2CFB8" strokeWidth="0.5" />
        <path d="M40,80 L 200,76 L 340,160 L 540,40" stroke="#A7B89A" strokeWidth="2" fill="none" />
      </svg>
      <div style={{ position: 'absolute', left: '52%', top: '52%', transform: 'translate(-50%, -100%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: ACCENT, color: '#fff', padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{location}</div>
        <div style={{ width: 2, height: 18, background: ACCENT }} />
        <div style={{ width: 16, height: 16, borderRadius: 999, background: ACCENT, border: '3px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
      </div>
    </div>
  )
}

function IconBtn({ icon, label, color, onClick }: { icon: string; label: string; color?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 999, background: 'transparent', border: '0.75px solid ' + T.border, cursor: 'pointer', fontSize: 13, color: T.text, fontWeight: 500 }}>
      <Icon name={icon} size={14} color={color || T.text} />
      {label}
    </button>
  )
}
