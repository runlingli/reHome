import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { CONVERSATIONS } from '../data'
import { Overlay, Photo, Avatar, VerifiedBadge, FreeTag, Icon, T, ACCENT } from './ui'
import type { Conversation, Message, User, Item } from '../types'

const PLACEHOLDER_USER: User = {
  name: 'Member', handle: '@user', school: '', schoolCn: '',
  eduVerified: true, localVerified: false, rating: 5, deals: 0,
  bio: '', bioCn: '', avatarColor: '#C8553D', avatarInitials: 'U',
}
const PLACEHOLDER_ITEM: Item = {
  id: '', title: '(item removed)', titleCn: '', cat: '', condition: 'good',
  est: 0, age: '', pickup: '', desc: '', descCn: '', seller: '', location: '',
  photoColors: ['#EFE9DC', '#A89876'], photoLabel: '', saved: 0, posted: '',
  imageUrl: '',
}

export function Messages() {
  const { overlay, closeOverlay, openItem } = useStore()
  if (overlay.kind !== 'messages') return null

  const initialConv = overlay.withUser
    ? CONVERSATIONS.find(c => c.with === overlay.withUser) ?? CONVERSATIONS[0]
    : CONVERSATIONS[0]

  return <MessagesInner initialConv={initialConv} onClose={closeOverlay} onOpenItem={openItem} />
}

function MessagesInner({ initialConv, onClose, onOpenItem }: {
  initialConv: Conversation; onClose: () => void; onOpenItem: (id: string) => void
}) {
  const usersByUid = useStore(s => s.usersByUid)
  const listings = useStore(s => s.listings)
  const [active, setActive] = useState(initialConv)

  return (
    <Overlay onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: 700 }}>
        {/* Sidebar */}
        <div style={{ background: T.surfaceAlt, borderRight: '0.5px solid ' + T.border }}>
          <div style={{ padding: '24px 20px 12px' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3, margin: 0 }}>Messages</h2>
            <div style={{ marginTop: 12, padding: '9px 12px', background: T.surface, borderRadius: 999, border: '0.75px solid ' + T.border, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="search" size={14} color={T.textMuted} />
              <input placeholder="Search messages" style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 13 }} />
            </div>
          </div>
          <div style={{ padding: '4px 8px 24px' }}>
            {CONVERSATIONS.map(c => {
              const u = usersByUid[c.with] ?? PLACEHOLDER_USER
              const it = listings.find(i => i.id === c.item) ?? PLACEHOLDER_ITEM
              const sel = active.id === c.id
              return (
                <button key={c.id} onClick={() => setActive(c)} style={{
                  display: 'flex', gap: 10, width: '100%', padding: '10px 12px',
                  borderRadius: 12, background: sel ? T.surface : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left', alignItems: 'flex-start',
                }}>
                  <Avatar user={u} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                      <span style={{ fontSize: 10, color: T.textFaint, fontFamily: '"JetBrains Mono", monospace', flexShrink: 0 }}>{c.time}</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>re: {it.title}</div>
                    <div style={{ fontSize: 12, color: c.unread ? T.text : T.textMuted, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last}</div>
                  </div>
                  {c.unread > 0 && (
                    <span style={{ minWidth: 18, height: 18, borderRadius: 999, padding: '0 6px', background: ACCENT, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.unread}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <ChatPane conv={active} onOpenItem={onOpenItem} />
      </div>
    </Overlay>
  )
}

function ChatPane({ conv, onOpenItem }: { conv: Conversation; onOpenItem: (id: string) => void }) {
  const usersByUid = useStore(s => s.usersByUid)
  const listings = useStore(s => s.listings)
  const u = usersByUid[conv.with] ?? PLACEHOLDER_USER
  const it = listings.find(i => i.id === conv.item) ?? PLACEHOLDER_ITEM
  const [msgs, setMsgs] = useState<Message[]>(conv.messages)
  const [draft, setDraft] = useState('')

  useEffect(() => { setMsgs(conv.messages) }, [conv.id])

  const send = () => {
    if (!draft.trim()) return
    setMsgs(m => [...m, { from: 'me', text: draft, cn: draft, time: 'now' }])
    setDraft('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 700 }}>
      <div style={{ padding: '20px 24px', borderBottom: '0.5px solid ' + T.border, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar user={u} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{u.name}</span>
            <VerifiedBadge kind="edu" />
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{u.school}</div>
        </div>
      </div>

      {/* Item context card */}
      <button onClick={() => onOpenItem(it.id)} style={{ margin: '12px 24px 0', padding: '10px 14px', background: T.surface, borderRadius: 12, border: '0.75px solid ' + T.border, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 8, overflow: 'hidden' }}>
          <Photo colors={it.photoColors} label={it.photoLabel} radius={8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: T.textFaint, letterSpacing: 0.4, textTransform: 'uppercase' }}>Discussing</div>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</div>
        </div>
        <FreeTag est={it.est} />
      </button>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ alignSelf: 'center', fontSize: 11, color: T.textFaint, background: T.surfaceAlt, padding: '5px 11px', borderRadius: 999, fontFamily: '"JetBrains Mono", monospace' }}>
          Both parties verified · chat opened
        </div>
        {msgs.map((m, i) => <Bubble key={i} mine={m.from === 'me'} text={m.text} time={m.time} />)}
      </div>

      {/* Composer */}
      <div style={{ padding: '14px 20px 20px', borderTop: '0.5px solid ' + T.border, display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: T.surface, borderRadius: 999, border: '0.75px solid ' + T.border, padding: '10px 16px' }}>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            placeholder="Message"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14 }}
          />
        </div>
        <button onClick={send} style={{ padding: '0 20px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Send
        </button>
      </div>
    </div>
  )
}

function Bubble({ mine, text, time }: { mine: boolean; text: string; time: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '64%', padding: '9px 14px', borderRadius: 18,
        background: mine ? ACCENT : T.surface, color: mine ? '#fff' : T.text,
        border: mine ? 'none' : '0.5px solid ' + T.border,
        fontSize: 14, lineHeight: 1.4,
        borderBottomRightRadius: mine ? 6 : 18,
        borderBottomLeftRadius: mine ? 18 : 6,
      }}>{text}</div>
      <div style={{ fontSize: 10, color: T.textFaint, marginTop: 3, fontFamily: '"JetBrains Mono", monospace' }}>{time}</div>
    </div>
  )
}
