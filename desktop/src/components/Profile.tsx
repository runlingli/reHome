import { useState } from 'react'
import { useStore } from '../store'
import type { ProfileTab } from '../store'
import { USERS } from '../data'
import { Overlay, ItemImage, Avatar, VerifiedBadge, Icon, T, ACCENT, ACCENT_SOFT, EDU, LOCAL } from './ui'
import { ItemCard } from './Feed'

export function Profile() {
  const { overlay, closeOverlay, role, openItem, openMessages, savedIds, toggleSave, profileInitialTab,
          listings, currentUser } = useStore()
  if (overlay.kind !== 'profile') return null

  // Use the live Firebase profile when signed in, otherwise the mock fallback
  // (lets us show *something* on the unauthenticated demo path).
  const fallbackMe = USERS[role === 'student' ? 'me_student' : 'me_local']
  const me = currentUser
    ? {
        ...fallbackMe,
        name:           currentUser.name,
        handle:         currentUser.handle ?? fallbackMe.handle,
        school:         currentUser.school || fallbackMe.school,
        eduVerified:    currentUser.eduVerified ?? fallbackMe.eduVerified,
        localVerified:  currentUser.localVerified ?? fallbackMe.localVerified,
        avatarInitials: currentUser.avatarInitials ?? fallbackMe.avatarInitials,
        avatarColor:    currentUser.avatarColor    ?? fallbackMe.avatarColor,
      }
    : fallbackMe

  // "Posted by you" — filter live listings by the signed-in user's UID.
  // When unauthenticated, fall back to demo seller u_emma so the UI isn't empty.
  const sellerUid = currentUser?.id ?? 'u_emma'
  const myItems = listings.filter(i => i.seller === sellerUid).slice(0, 4)
  const savedItems = listings.filter(i => savedIds.has(i.id))

  const [tab, setTab] = useState<ProfileTab>(profileInitialTab)
  const [verifyModal, setVerifyModal] = useState<'edu' | 'local' | null>(null)
  const [eduManageOpen, setEduManageOpen] = useState(false)

  const TABS: { key: ProfileTab; label: string }[] = [
    { key: 'listings',      label: 'My listings' },
    { key: 'saved',         label: 'Saved' },
    { key: 'history',       label: 'History' },
    { key: 'verifications', label: 'Verifications' },
  ]

  // History entries linked to actual items
  const historyRows = [
    { date: 'May 02', action: 'Picked up', itemId: 'i9',  title: 'IKEA bookshelf · oak' },
    { date: 'Apr 28', action: 'Picked up', itemId: 'i10', title: 'Ceramic dinner set · 4 pcs' },
    { date: 'Apr 14', action: 'Handed off', itemId: 'i11', title: 'Standing lamp · brass' },
  ]

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
      <div style={{ padding: '0 56px', borderBottom: '0.5px solid ' + T.border, display: 'flex', gap: 28 }}>
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '14px 0', background: 'transparent', border: 'none',
            borderBottom: '2px solid ' + (tab === key ? T.text : 'transparent'),
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            color: tab === key ? T.text : T.textMuted,
          }}>
            {label}
            {key === 'saved' && savedItems.length > 0 && (
              <span style={{ marginLeft: 6, fontSize: 11, background: T.surfaceAlt, color: T.textMuted, padding: '1px 6px', borderRadius: 999 }}>
                {savedItems.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '32px 56px 80px' }}>

        {/* ── My listings ── */}
        {tab === 'listings' && (
          myItems.length > 0
            ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                {myItems.map(it => <ItemCard key={it.id} item={it} onOpen={() => openItem(it.id)} savedIds={savedIds} onSave={toggleSave} />)}
              </div>
            : <EmptyState icon="📦" title="No listings yet" sub="Post your first item to get started." action={{ label: 'Post an item', onClick: () => {} }} />
        )}

        {/* ── Saved ── */}
        {tab === 'saved' && (
          savedItems.length > 0
            ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                {savedItems.map(it => <ItemCard key={it.id} item={it} onOpen={() => openItem(it.id)} savedIds={savedIds} onSave={toggleSave} />)}
              </div>
            : <EmptyState icon="🤍" title="Nothing saved yet" sub="Tap the heart on any item to save it here." />
        )}

        {/* ── History ── */}
        {tab === 'history' && (
          <div style={{ maxWidth: 780 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {historyRows.map(h => {
                const item = listings.find(i => i.id === h.itemId)
                return (
                  <button
                    key={h.date}
                    onClick={() => item && openItem(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      background: T.surface, borderRadius: 14,
                      border: '0.75px solid ' + T.border, padding: '14px 18px',
                      cursor: item ? 'pointer' : 'default', textAlign: 'left', width: '100%',
                      transition: 'box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { if (item) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
                  >
                    {item && (
                      <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                        <ItemImage item={item} radius={10} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{h.title}</div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{
                          padding: '2px 7px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                          background: h.action === 'Picked up' ? '#E0F1E7' : '#E0EAFA',
                          color: h.action === 'Picked up' ? '#1F8A5B' : '#2A6FDB',
                        }}>{h.action}</span>
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10 }}>{h.date}</span>
                      </div>
                    </div>
                    {item && <Icon name="arrow" size={14} color={T.textFaint} />}
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: 32, padding: '20px 24px', background: T.surfaceAlt, borderRadius: 14, border: '0.75px solid ' + T.border }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Looking for something?</div>
              <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>
                Contact the other party through{' '}
                <button onClick={() => { closeOverlay(); openMessages() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT, fontWeight: 600, fontSize: 12, padding: 0 }}>
                  Messages
                </button>
                {' '}if you need to follow up on a past hand-off.
              </div>
            </div>
          </div>
        )}

        {/* ── Verifications ── */}
        {tab === 'verifications' && (
          <div style={{ maxWidth: 780 }}>
            <p style={{ fontSize: 14, color: T.textMuted, margin: '0 0 24px', lineHeight: 1.6 }}>
              Verified badges appear on your listings and profile so both sides of a hand-off know who they're dealing with.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* .edu card */}
              <VerifyCard
                kind="edu"
                status={me.eduVerified ? 'active' : 'add'}
                detail={me.eduVerified
                  ? `${me.handle} · ${me.school || 'University'}`
                  : 'Verify your .edu email to post items and unlock the green badge.'}
                onManage={() => setEduManageOpen(o => !o)}
                onStart={() => setVerifyModal('edu')}
              />
              {/* Local card */}
              <VerifyCard
                kind="local"
                status="add"
                detail="Upload a state-issued ID to also receive items as a local resident."
                onStart={() => setVerifyModal('local')}
              />
            </div>

            {/* .edu manage panel */}
            {eduManageOpen && me.eduVerified && (
              <div style={{ marginTop: 16, padding: '20px 24px', background: EDU.bg, borderRadius: 16, border: '1px solid ' + EDU.color + '33' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: EDU.color, marginBottom: 12 }}>Managing .edu verification</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <ManageRow label="Verified email" value={currentUser?.email ?? me.handle} />
                  <ManageRow label="Institution" value={me.school || 'University'} />
                  <ManageRow label="Status" value="Active" tone="ok" />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button style={{ padding: '8px 14px', borderRadius: 999, background: T.surface, border: '0.75px solid ' + T.border, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Change email</button>
                  <button style={{ padding: '8px 14px', borderRadius: 999, background: 'transparent', border: '0.75px solid #e87070', color: '#c0392b', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Remove verification</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Verify flow modal */}
      {verifyModal && (
        <VerifyFlowModal kind={verifyModal} onClose={() => setVerifyModal(null)} />
      )}
    </Overlay>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function VerifyCard({ kind, status, detail, onManage, onStart }: {
  kind: 'edu' | 'local'; status: 'active' | 'add'; detail: string
  onManage?: () => void; onStart?: () => void
}) {
  const v = kind === 'edu' ? EDU : LOCAL
  const active = status === 'active'
  return (
    <div style={{ padding: 22, borderRadius: 16, background: active ? v.bg : T.surface, border: '0.75px solid ' + (active ? v.color + '44' : T.border) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Icon name="shield" size={18} color={v.color} />
        <span style={{ fontSize: 13, fontWeight: 700, color: v.color }}>{v.label}</span>
        {active && (
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: v.color, background: v.color + '22', padding: '2px 8px', borderRadius: 999 }}>ACTIVE</span>
        )}
      </div>
      <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5, marginBottom: 16 }}>{detail}</div>
      {active
        ? <button onClick={onManage} style={{ padding: '8px 14px', borderRadius: 999, background: T.surface, color: T.text, border: '0.75px solid ' + T.border, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Manage</button>
        : (
          <button onClick={onStart} style={{ padding: '8px 16px', borderRadius: 999, background: T.text, color: T.bg, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="shield" size={12} color={T.bg} />
            Start verification
          </button>
        )
      }
    </div>
  )
}

function ManageRow({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
      <span style={{ color: T.textMuted }}>{label}</span>
      <span style={{ fontWeight: 600, color: tone === 'ok' ? EDU.color : T.text }}>{value}</span>
    </div>
  )
}

function VerifyFlowModal({ kind, onClose }: { kind: 'edu' | 'local'; onClose: () => void }) {
  const [step, setStep] = useState<'intro' | 'input' | 'sent'>('intro')
  const [email, setEmail] = useState('')
  const v = kind === 'edu' ? EDU : LOCAL
  const isEdu = kind === 'edu'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,14,12,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: T.surface, borderRadius: 20, width: 460, maxWidth: '90vw', padding: 32, boxShadow: '0 30px 80px rgba(0,0,0,0.25)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: 999, background: T.surfaceAlt, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={14} color={T.textMuted} />
        </button>

        <div style={{ width: 44, height: 44, borderRadius: 12, background: v.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon name="shield" size={22} color={v.color} />
        </div>

        {step === 'intro' && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>
              {isEdu ? 'Verify your .edu email' : 'Verify local residency'}
            </h2>
            <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6, margin: '0 0 24px' }}>
              {isEdu
                ? "We'll send a one-time link to your university email. Once confirmed, your listings will carry the .edu Verified badge."
                : "Upload a state-issued ID (driver's license, state ID card). We verify the address and immediately discard the image — nothing is stored."}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {(isEdu
                ? ['Your .edu email address', 'One-click confirmation link', 'Badge appears instantly']
                : ["State ID or driver's license", 'Address extracted by OCR', 'Image deleted after verification']
              ).map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 999, background: v.bg, color: v.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="check" size={11} color={v.color} stroke={2.4} />
                  </div>
                  {s}
                </div>
              ))}
            </div>
            <button onClick={() => setStep('input')} style={{ width: '100%', padding: '13px', background: T.text, color: T.bg, border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Continue
            </button>
          </>
        )}

        {step === 'input' && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 20px' }}>
              {isEdu ? 'Enter your .edu email' : 'Upload your ID'}
            </h2>
            {isEdu ? (
              <>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: '"JetBrains Mono", monospace' }}>
                  University email
                </label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  style={{ display: 'block', width: '100%', marginTop: 8, marginBottom: 20, padding: '13px 16px', borderRadius: 12, border: '1px solid ' + T.border, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
                <button
                  onClick={() => { if (email.includes('.edu')) setStep('sent') }}
                  disabled={!email.includes('.edu')}
                  style={{ width: '100%', padding: '13px', background: email.includes('.edu') ? T.text : T.border, color: T.bg, border: 'none', borderRadius: 12, cursor: email.includes('.edu') ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600 }}
                >
                  Send confirmation link
                </button>
              </>
            ) : (
              <>
                <div style={{ border: '2px dashed ' + T.border, borderRadius: 14, padding: '40px 24px', textAlign: 'center', marginBottom: 20, cursor: 'pointer', background: T.surfaceAlt }}>
                  <Icon name="camera" size={28} color={T.textMuted} />
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>Click to upload or drag & drop</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>JPG, PNG — max 10 MB</div>
                </div>
                <button onClick={() => setStep('sent')} style={{ width: '100%', padding: '13px', background: T.text, color: T.bg, border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  Submit for review
                </button>
              </>
            )}
          </>
        )}

        {step === 'sent' && (
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>{isEdu ? '📬' : '✅'}</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>
              {isEdu ? 'Check your inbox' : 'Submitted!'}
            </h2>
            <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6, margin: '0 0 24px' }}>
              {isEdu
                ? `We sent a confirmation link to ${email}. Click it to activate your .edu badge — usually takes less than a minute.`
                : "Your ID is being reviewed. We'll notify you within a few hours once your Local Verified badge is active."}
            </p>
            <button onClick={onClose} style={{ padding: '11px 28px', background: T.text, color: T.bg, border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon, title, sub, action }: { icon: string; title: string; sub: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: T.textMuted }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, marginBottom: action ? 20 : 0 }}>{sub}</div>
      {action && (
        <button onClick={action.onClick} style={{ padding: '10px 20px', background: T.text, color: T.bg, border: 'none', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          {action.label}
        </button>
      )}
    </div>
  )
}
