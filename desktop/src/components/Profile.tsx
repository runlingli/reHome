import { useState } from 'react'
import { useStore } from '../store'
import { ITEMS, USERS } from '../data'
import { Overlay, Avatar, VerifiedBadge, Icon, T, ACCENT, ACCENT_SOFT } from './ui'
import { ItemCard } from './Feed'

export function Profile() {
  const { overlay, closeOverlay, role, openItem, savedIds, toggleSave } = useStore()
  if (overlay.kind !== 'profile') return null

  const me = USERS[role === 'student' ? 'me_student' : 'me_local']
  const myItems = ITEMS.filter(i => i.seller === 'u_emma').slice(0, 4)
  const [tab, setTab] = useState<'listings' | 'saved' | 'history' | 'verifications'>('listings')

  return (
    <Overlay onClose={closeOverlay}>
      {/* Hero */}
      <div style={{ padding: '60px 56px 36px', background: `linear-gradient(180deg, ${ACCENT_SOFT} 0%, ${T.bg} 100%)` }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24 }}>
          <Avatar user={me} size={96} />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.4, margin: 0 }}>{me.name}</h1>
            <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>{me.handle} · {me.school}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {role === 'student' ? <VerifiedBadge kind="edu" size="md" /> : <VerifiedBadge kind="local" size="md" />}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, background: '#fff', border: '0.75px solid ' + T.border, fontSize: 11, fontWeight: 600 }}>
                <Icon name="star" size={11} color={ACCENT} /> {me.rating} · {me.deals} hand-offs
              </span>
            </div>
          </div>
          <button style={{ padding: '10px 16px', borderRadius: 999, background: T.surface, border: '0.75px solid ' + T.border, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Edit profile
          </button>
        </div>
        <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.6, margin: '20px 0 0', maxWidth: 720 }}>{me.bio}</p>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 56px', borderBottom: '0.5px solid ' + T.border, display: 'flex', gap: 24 }}>
        {(['listings', 'saved', 'history', 'verifications'] as const).map(k => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '14px 0', background: 'transparent', border: 'none', borderBottom: '2px solid ' + (tab === k ? T.text : 'transparent'), cursor: 'pointer', fontSize: 13, fontWeight: 600, color: tab === k ? T.text : T.textMuted, textTransform: 'capitalize' }}>
            {k}
          </button>
        ))}
      </div>

      <div style={{ padding: '32px 56px 80px' }}>
        {tab === 'listings' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {myItems.map(it => <ItemCard key={it.id} item={it} onOpen={() => openItem(it.id)} savedIds={savedIds} onSave={toggleSave} />)}
          </div>
        )}
        {tab === 'saved' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {ITEMS.slice(2, 6).map(it => <ItemCard key={it.id} item={it} onOpen={() => openItem(it.id)} savedIds={savedIds} onSave={toggleSave} />)}
          </div>
        )}
        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 720 }}>
            {[
              { date: 'May 02', title: 'Picked up · IKEA bookshelf' },
              { date: 'Apr 28', title: 'Picked up · ceramic mug set' },
              { date: 'Apr 14', title: 'Handed off · floor lamp' },
            ].map(h => (
              <div key={h.date} style={{ display: 'flex', alignItems: 'center', gap: 16, background: T.surface, borderRadius: 12, border: '0.75px solid ' + T.border, padding: '14px 18px' }}>
                <div style={{ fontSize: 11, color: T.textFaint, fontFamily: '"JetBrains Mono", monospace', width: 60 }}>{h.date}</div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{h.title}</div>
                <Icon name="arrow" size={14} color={T.textFaint} />
              </div>
            ))}
          </div>
        )}
        {tab === 'verifications' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 720 }}>
            <VerifyCard kind="edu"   status="active" detail="@you.bu.edu · Boston University" />
            <VerifyCard kind="local" status="add"    detail="Upload state ID to also receive items" />
          </div>
        )}
      </div>
    </Overlay>
  )
}

function VerifyCard({ kind, status, detail }: { kind: 'edu' | 'local'; status: 'active' | 'add'; detail: string }) {
  const v = kind === 'edu' ? { color: '#1F8A5B', bg: '#E0F1E7', label: '.edu Verified' } : { color: '#2A6FDB', bg: '#E0EAFA', label: 'Local Verified' }
  const active = status === 'active'
  return (
    <div style={{ padding: 22, borderRadius: 16, background: active ? v.bg : T.surface, border: '0.75px solid ' + (active ? v.color + '33' : T.border) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Icon name="shield" size={18} color={v.color} />
        <span style={{ fontSize: 13, fontWeight: 700, color: v.color }}>{v.label}</span>
      </div>
      <div style={{ fontSize: 14, color: T.text, marginBottom: 14 }}>{detail}</div>
      <button style={{ padding: '8px 14px', borderRadius: 999, background: active ? T.surface : T.text, color: active ? T.text : T.bg, border: active ? '0.75px solid ' + T.border : 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
        {active ? 'Active · manage' : 'Start verification'}
      </button>
    </div>
  )
}
