import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'
import { CONVERSATIONS } from '../data'
import { subscribeToMessages, sendMessage, getOrCreateConversation, confirmHandoff, proposeDeal, acceptDeal } from '../listings'
import { auth } from '../firebase'
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
  const { overlay, closeOverlay, openItem, conversations, currentUser } = useStore()
  if (overlay.kind !== 'messages') return null

  const myUid = currentUser?.id ?? null
  const isLive = conversations.length > 0
  const allConvs = isLive ? conversations : CONVERSATIONS

  // If opened from an item, find or surface that conversation
  let initialConv: Conversation
  if (overlay.withUser) {
    // Try to find existing conv with that user about that specific listing
    const found = allConvs.find(c =>
      c.with === overlay.withUser &&
      (!overlay.listingId || c.item === overlay.listingId)
    ) ?? allConvs.find(c => c.with === overlay.withUser) ?? allConvs[0]
    initialConv = found
  } else {
    initialConv = allConvs[0]
  }

  // If opened from an item + no existing conversation, we'll create one in ChatPane
  const pendingListingId = overlay.listingId ?? null

  return (
    <MessagesInner
      initialConv={initialConv}
      allConvs={allConvs}
      isLive={isLive}
      myUid={myUid}
      pendingListingId={pendingListingId}
      onClose={closeOverlay}
      onOpenItem={openItem}
    />
  )
}

function ConvSection({ label, convs, active, setActive, usersByUid, listings, completed, claimed }: {
  label: string
  convs: Conversation[]
  active: Conversation
  setActive: (c: Conversation) => void
  usersByUid: Record<string, import('../types').User>
  listings: import('../types').Item[]
  completed?: boolean
  claimed?: boolean
}) {
  if (convs.length === 0) return null
  return (
    <>
      <div style={{ padding: '10px 12px 4px', fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: completed ? '#1F8A5B' : claimed ? '#9A6500' : T.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>
        {label}
      </div>
      {convs.map(c => {
        const u = usersByUid[c.with] ?? PLACEHOLDER_USER
        const it = listings.find(i => i.id === c.item) ?? PLACEHOLDER_ITEM
        const sel = active.id === c.id
        return (
          <button key={c.id} onClick={() => setActive(c)} style={{
            display: 'flex', gap: 10, width: '100%', padding: '10px 12px',
            borderRadius: 12, background: sel ? T.surface : 'transparent',
            border: 'none', cursor: 'pointer', textAlign: 'left', alignItems: 'flex-start',
            opacity: completed ? 0.75 : 1,
          }}>
            <Avatar user={u} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                <span style={{ fontSize: 10, color: T.textFaint, fontFamily: '"JetBrains Mono", monospace', flexShrink: 0 }}>{c.time}</span>
              </div>
              {it.title && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>re: {it.title}</div>}
              <div style={{ fontSize: 12, color: c.unread ? T.text : T.textMuted, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {completed ? '✓ Handoff complete' : claimed ? '🤝 已成交 · 等待交接' : c.last}
              </div>
            </div>
            {!completed && !claimed && c.unread > 0 && (
              <span style={{ minWidth: 18, height: 18, borderRadius: 999, padding: '0 6px', background: ACCENT, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.unread}</span>
            )}
            {completed && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#1F8A5B', background: '#E0F1E7', padding: '2px 7px', borderRadius: 999, flexShrink: 0, alignSelf: 'center' }}>Done</span>
            )}
            {claimed && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#9A6500', background: '#FFF0CC', padding: '2px 7px', borderRadius: 999, flexShrink: 0, alignSelf: 'center' }}>已成交</span>
            )}
          </button>
        )
      })}
    </>
  )
}

function MessagesInner({ initialConv, allConvs, isLive, myUid, pendingListingId, onClose, onOpenItem }: {
  initialConv: Conversation
  allConvs: Conversation[]
  isLive: boolean
  myUid: string | null
  pendingListingId: string | null
  onClose: () => void
  onOpenItem: (id: string) => void
}) {
  const usersByUid = useStore(s => s.usersByUid)
  const listings = useStore(s => s.listings)
  const [active, setActive] = useState(initialConv)

  useEffect(() => { setActive(initialConv) }, [initialConv.id])

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
            <ConvSection label="Active" convs={allConvs.filter(c => !c.dealAccepted && !c.completed)} active={active} setActive={setActive} usersByUid={usersByUid} listings={listings} />
            <ConvSection label="已成交" convs={allConvs.filter(c => c.dealAccepted && !c.completed)} active={active} setActive={setActive} usersByUid={usersByUid} listings={listings} claimed />
            <ConvSection label="Completed" convs={allConvs.filter(c => c.completed)} active={active} setActive={setActive} usersByUid={usersByUid} listings={listings} completed />
          </div>
        </div>

        <ChatPane
          conv={active}
          isLive={isLive}
          myUid={myUid}
          pendingListingId={pendingListingId}
          onOpenItem={onOpenItem}
        />
      </div>
    </Overlay>
  )
}

function ChatPane({ conv, isLive, myUid, pendingListingId, onOpenItem }: {
  conv: Conversation
  isLive: boolean
  myUid: string | null
  pendingListingId: string | null
  onOpenItem: (id: string) => void
}) {
  const usersByUid = useStore(s => s.usersByUid)
  const listings = useStore(s => s.listings)
  const u = usersByUid[conv.with] ?? PLACEHOLDER_USER
  const it = listings.find(i => i.id === (conv.item || pendingListingId || '')) ?? PLACEHOLDER_ITEM

  const [msgs, setMsgs] = useState<Message[]>(conv.messages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  // resolvedConvId may differ from conv.id when a new conversation is created on first send
  const [resolvedConvId, setResolvedConvId] = useState(conv.id)
  const [sellerConfirmed, setSellerConfirmed] = useState(false)
  const [receiverConfirmed, setReceiverConfirmed] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [dealProposed, setDealProposed] = useState(conv.dealProposed ?? false)
  const [dealAccepted, setDealAccepted] = useState(conv.dealAccepted ?? false)
  const [proposing, setProposing] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const isSeller = myUid !== null && it.seller === myUid
  const myConfirmed = isSeller ? sellerConfirmed : receiverConfirmed
  const bothConfirmed = sellerConfirmed && receiverConfirmed

  useEffect(() => {
    setResolvedConvId(conv.id)
    setSellerConfirmed(false)
    setReceiverConfirmed(false)
    setDealProposed(conv.dealProposed ?? false)
    setDealAccepted(conv.dealAccepted ?? false)
    if (!isLive || !myUid) {
      setMsgs(conv.messages)
      return
    }
    const unsub = subscribeToMessages(conv.id, myUid, (live) => setMsgs(live))
    return unsub
  }, [conv.id, isLive, myUid])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const getConvId = async (): Promise<string> => {
    if (resolvedConvId && resolvedConvId !== 'c1' && resolvedConvId !== 'c2'
        && resolvedConvId !== 'c3' && resolvedConvId !== 'c4') {
      return resolvedConvId
    }
    // New conversation: create it
    const fbUser = auth.currentUser
    if (!fbUser || !myUid) throw new Error('Not signed in.')
    const listingId = conv.item || pendingListingId || ''
    const id = await getOrCreateConversation(myUid, conv.with, listingId)
    setResolvedConvId(id)
    return id
  }

  const send = async () => {
    const text = draft.trim()
    if (!text) return
    setDraft('')
    if (isLive && myUid) {
      setSending(true)
      try {
        const convId = await getConvId()
        await sendMessage(convId, text)
      } catch (e) {
        console.error('[send]', e)
        setMsgs(m => [...m, { from: 'me', text, cn: text, time: 'now' }])
      } finally {
        setSending(false)
      }
    } else {
      setMsgs(m => [...m, { from: 'me', text, cn: text, time: 'now' }])
    }
  }

  const confirm = async () => {
    if (!isLive || !myUid || !it.id) return
    setConfirming(true)
    try {
      const convId = await getConvId()
      await confirmHandoff(convId, it.id, isSeller)
      if (isSeller) setSellerConfirmed(true)
      else setReceiverConfirmed(true)
    } catch (e) {
      console.error('[confirm]', e)
    } finally {
      setConfirming(false)
    }
  }

  const propose = async () => {
    if (!isLive || !myUid || !it.id) return
    setProposing(true)
    try {
      const convId = await getConvId()
      await proposeDeal(convId, it.id)
      setDealProposed(true)
    } catch (e) {
      console.error('[propose]', e)
    } finally {
      setProposing(false)
    }
  }

  const accept = async () => {
    if (!isLive || !myUid) return
    setAccepting(true)
    try {
      const convId = await getConvId()
      await acceptDeal(convId)
      setDealAccepted(true)
    } catch (e) {
      console.error('[accept]', e)
    } finally {
      setAccepting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 700 }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '0.5px solid ' + T.border, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar user={u} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{u.name}</span>
            {u.eduVerified && <VerifiedBadge kind="edu" />}
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{u.school}</div>
        </div>
      </div>

      {/* Item context card */}
      {it.id && (
        <button onClick={() => onOpenItem(it.id)} style={{ margin: '12px 24px 0', padding: '10px 14px', background: T.surface, borderRadius: 12, border: '0.75px solid ' + T.border, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 8, overflow: 'hidden' }}>
            <Photo colors={it.photoColors} label={it.photoLabel} radius={8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: T.textFaint, letterSpacing: 0.4, textTransform: 'uppercase' }}>Discussing</div>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</div>
          </div>
          <FreeTag est={it.est} />
          {bothConfirmed && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1F8A5B', background: '#E0F1E7', padding: '3px 8px', borderRadius: 999 }}>Complete</span>
          )}
        </button>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ alignSelf: 'center', fontSize: 11, color: T.textFaint, background: T.surfaceAlt, padding: '5px 11px', borderRadius: 999, fontFamily: '"JetBrains Mono", monospace' }}>
          Both parties verified · chat opened
        </div>
        {msgs.map((m, i) => <Bubble key={i} mine={m.from === 'me'} text={m.text} time={m.time} />)}
        <div ref={bottomRef} />
      </div>

      {/* 拍板成交 — deal-lock flow (shown before deal is accepted) */}
      {isLive && it.id && !dealAccepted && !bothConfirmed && (
        <div style={{ borderTop: '0.5px solid ' + T.border }}>
          {isSeller ? (
            !dealProposed ? (
              <button
                onClick={propose}
                disabled={proposing}
                style={{ width: '100%', padding: '13px', background: '#FFF8EC', border: 'none', cursor: proposing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: proposing ? 0.6 : 1 }}
              >
                <span style={{ fontSize: 16 }}>🤝</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#9A6500' }}>
                  {proposing ? '正在提交…' : '拍板成交'}
                </span>
              </button>
            ) : (
              <div style={{ padding: '11px 24px', background: '#FFF8EC', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: 999, background: '#E1A82A' }} />
                <span style={{ fontSize: 12, color: '#9A6500' }}>已提出成交，等待对方确认…</span>
              </div>
            )
          ) : (
            dealProposed && (
              <div style={{ padding: '12px 20px', background: '#FFF8EC', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16 }}>🤝</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#9A6500', flex: 1 }}>对方提出成交，是否同意？</span>
                <button
                  onClick={accept}
                  disabled={accepting}
                  style={{ padding: '7px 16px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 999, cursor: accepting ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, opacity: accepting ? 0.6 : 1 }}
                >
                  {accepting ? '…' : '✓ 同意'}
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* 已成交 banner (deal locked, waiting for physical handoff) */}
      {dealAccepted && !bothConfirmed && (
        <div style={{ padding: '13px 24px', background: '#FFF8EC', borderTop: '0.5px solid #E1A82A44', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>🤝</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#9A6500' }}>已成交 · 物品已锁定</div>
            <div style={{ fontSize: 11, color: '#B8892A', marginTop: 2 }}>请双方安排交接，完成后点击下方确认</div>
          </div>
        </div>
      )}

      {/* Confirm handoff (only visible after deal is locked) */}
      {isLive && it.id && dealAccepted && !bothConfirmed && (
        <div style={{ borderTop: '0.5px solid ' + T.border }}>
          {!myConfirmed ? (
            <button
              onClick={confirm}
              disabled={confirming}
              style={{ width: '100%', padding: '12px', background: '#E0F1E7', border: 'none', cursor: confirming ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: confirming ? 0.6 : 1 }}
            >
              <Icon name="check" size={14} color="#1F8A5B" stroke={2.5} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1F8A5B' }}>
                {isSeller ? 'Confirm handed off' : 'Confirm picked up'}
              </span>
            </button>
          ) : (
            <div style={{ padding: '10px 24px', background: T.surfaceAlt, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 999, background: '#E1A82A' }} />
              <span style={{ fontSize: 12, color: T.textMuted }}>
                {isSeller ? 'Waiting for receiver to confirm pickup…' : 'Waiting for seller to confirm handoff…'}
              </span>
            </div>
          )}
        </div>
      )}

      {bothConfirmed && (
        <div style={{ padding: '14px 24px', background: '#E0F1E7', display: 'flex', alignItems: 'center', gap: 10, borderTop: '0.5px solid #1F8A5B33' }}>
          <Icon name="check" size={16} color="#1F8A5B" stroke={2.5} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1F8A5B' }}>Handoff complete! This item has been passed on.</span>
        </div>
      )}

      {/* Composer */}
      {!bothConfirmed && (
        <div style={{ padding: '14px 20px 20px', borderTop: '0.5px solid ' + T.border, display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: T.surface, borderRadius: 999, border: '0.75px solid ' + T.border, padding: '10px 16px' }}>
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Message"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14 }}
            />
          </div>
          <button
            onClick={send}
            disabled={sending || !draft.trim()}
            style={{ padding: '0 20px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 999, cursor: sending ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, opacity: sending ? 0.6 : 1 }}
          >
            Send
          </button>
        </div>
      )}
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
