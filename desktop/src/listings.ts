// Firestore listings live read + lazy user fetch + write helpers.
// Mirrors iOS FirestoreService — we keep iOS Listing semantics so existing
// components only swap their data source, not their props.

import {
  collection, doc, getDoc, setDoc, updateDoc,
  limit, onSnapshot, orderBy, where, query,
  serverTimestamp, addDoc, type Timestamp,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import type { Item, User, Conversation, Message } from './types'

/** Best-effort relative age, e.g. "5h" / "2d". */
function relativeAge(ts?: Timestamp | null): string {
  if (!ts) return 'just now'
  const sec = (Date.now() - ts.toMillis()) / 1000
  if (sec < 3600)   return `${Math.max(1, Math.floor(sec / 60))}m`
  if (sec < 86_400) return `${Math.floor(sec / 3600)}h`
  return `${Math.floor(sec / 86_400)}d`
}

interface FirestoreListing {
  title?: string
  category?: string
  condition?: string
  estValue?: number
  age?: string
  pickup?: string
  desc?: string
  location?: string
  sellerUid?: string
  savedCount?: number
  photoLabel?: string
  photoColors?: string[]
  imageUrl?: string
  createdAt?: Timestamp
}

function decodeListing(id: string, d: FirestoreListing): Item {
  const colors = (d.photoColors && d.photoColors.length >= 2 ? d.photoColors : ['#F4EFE6', '#A89876']) as [string, string]
  return {
    id,
    title:       d.title || 'Untitled',
    titleCn:     d.title || 'Untitled',
    cat:         d.category || 'household',
    condition:   d.condition || 'good',
    est:         d.estValue ?? 0,
    age:         d.age || '',
    pickup:      d.pickup || 'Flexible',
    desc:        d.desc || '',
    descCn:      d.desc || '',
    seller:      d.sellerUid || '',
    location:    d.location || '',
    photoColors: colors,
    photoLabel:  d.photoLabel || '',
    saved:       d.savedCount ?? 0,
    posted:      relativeAge(d.createdAt ?? null),
    imageUrl:    d.imageUrl || '',
    status:      (d as any).status || 'available',
  }
}

interface FirestoreUser {
  name?: string
  handle?: string
  school?: string
  bio?: string
  eduVerified?: boolean
  localVerified?: boolean
  rating?: number
  deals?: number
  avatarColor?: string
  avatarInitials?: string
}

function decodeUser(d: FirestoreUser): User {
  return {
    name:           d.name || 'Member',
    handle:         d.handle || '@user',
    school:         d.school || '',
    schoolCn:       d.school || '',
    eduVerified:    d.eduVerified === true,
    localVerified:  d.localVerified === true,
    rating:         d.rating ?? 5.0,
    deals:          d.deals ?? 0,
    bio:            d.bio || '',
    bioCn:          d.bio || '',
    avatarColor:    d.avatarColor || '#C8553D',
    avatarInitials: d.avatarInitials || 'U',
  }
}

/** Subscribe to the latest 50 listings sorted by createdAt desc.
 *  Returns the unsubscribe function (call on app teardown). */
export function subscribeToListings(onChange: (items: Item[]) => void): () => void {
  const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(50))
  return onSnapshot(q, snap => {
    onChange(
      snap.docs
        .map(d => decodeListing(d.id, d.data() as FirestoreListing))
        .filter(it => it.status !== 'completed')
    )
  }, err => {
    console.error('[listings] snapshot error:', err)
  })
}

/** In-memory user cache; populated lazily on first lookup. */
const userCache = new Map<string, User>()
const inflight  = new Map<string, Promise<User | null>>()

export async function fetchUser(uid: string): Promise<User | null> {
  if (!uid) return null
  if (userCache.has(uid)) return userCache.get(uid)!
  if (inflight.has(uid))  return inflight.get(uid)!
  const p = (async () => {
    try {
      const snap = await getDoc(doc(db, 'users', uid))
      if (!snap.exists()) return null
      const u = decodeUser(snap.data() as FirestoreUser)
      userCache.set(uid, u)
      return u
    } finally {
      inflight.delete(uid)
    }
  })()
  inflight.set(uid, p)
  return p
}

/** Synchronous cache lookup (returns undefined if not loaded yet). */
export function getCachedUser(uid: string): User | undefined {
  return userCache.get(uid)
}

/** Prime the cache with a known SellerProfile (e.g. mock fallback). */
export function primeUser(uid: string, user: User) {
  if (!userCache.has(uid)) userCache.set(uid, user)
}

export interface NewListingInput {
  title: string
  category: string
  condition: string
  estValue: number
  age: string
  pickup: string
  desc: string
  location: string
}

/** Create a listing with the current Firebase user as seller. */
export async function createListing(input: NewListingInput): Promise<string> {
  const u = auth.currentUser
  if (!u) throw new Error('Not signed in.')
  const ref = await addDoc(collection(db, 'listings'), {
    title:        input.title,
    category:     input.category,
    condition:    input.condition,
    estValue:     input.estValue,
    age:          input.age,
    pickup:       input.pickup,
    desc:         input.desc,
    location:     input.location,
    sellerUid:    u.uid,
    savedCount:   0,
    photoLabel:   input.title.split(' ')[0]?.toLowerCase() || 'item',
    photoColors:  ['#F4EFE6', '#A89876'],
    createdAt:    serverTimestamp(),
  })
  return ref.id
}

// ─── Conversations ────────────────────────────────────────────────────────────

interface FSConversation {
  participants?: string[]
  listingId?: string
  lastMessage?: string
  lastMessageAt?: Timestamp | null
  unread?: Record<string, number>
  createdAt?: Timestamp | null
  sellerConfirmed?: boolean
  receiverConfirmed?: boolean
  dealProposed?: boolean
  dealAccepted?: boolean
}

interface FSMessage {
  from?: string
  text?: string
  createdAt?: Timestamp | null
}

function decodeConv(id: string, d: FSConversation, myUid: string): Conversation {
  const otherUid = (d.participants ?? []).find(p => p !== myUid) ?? ''
  return {
    id,
    with: otherUid,
    item: d.listingId ?? '',
    unread: d.unread?.[myUid] ?? 0,
    last: d.lastMessage ?? '',
    lastCn: d.lastMessage ?? '',
    time: relativeAge(d.lastMessageAt ?? null),
    messages: [],
    completed:     d.sellerConfirmed === true && d.receiverConfirmed === true,
    dealProposed:  d.dealProposed === true,
    dealAccepted:  d.dealAccepted === true,
  }
}

function decodeMsg(d: FSMessage, myUid: string): Message {
  const ts = d.createdAt
  const time = ts
    ? new Date(ts.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'now'
  return {
    from: d.from === myUid ? 'me' : 'them',
    text: d.text ?? '',
    cn:   d.text ?? '',
    time,
  }
}

/** Subscribe to all conversations the current user participates in. */
export function subscribeToConversations(
  myUid: string,
  onChange: (convs: Conversation[]) => void,
): () => void {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', myUid),
    orderBy('lastMessageAt', 'desc'),
    limit(30),
  )
  return onSnapshot(
    q,
    snap => onChange(snap.docs.map(d => decodeConv(d.id, d.data() as FSConversation, myUid))),
    err => console.error('[conversations] snapshot error:', err),
  )
}

/** Subscribe to messages inside a conversation. */
export function subscribeToMessages(
  convId: string,
  myUid: string,
  onChange: (msgs: Message[]) => void,
): () => void {
  const q = query(
    collection(db, 'conversations', convId, 'messages'),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(
    q,
    snap => onChange(snap.docs.map(d => decodeMsg(d.data() as FSMessage, myUid))),
    err => console.error('[messages] snapshot error:', err),
  )
}

/** Send a message and update the conversation's lastMessage. */
export async function sendMessage(convId: string, text: string): Promise<void> {
  const u = auth.currentUser
  if (!u) throw new Error('Not signed in.')
  await addDoc(collection(db, 'conversations', convId, 'messages'), {
    from: u.uid,
    text,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'conversations', convId), {
    lastMessage:    text,
    lastMessageAt:  serverTimestamp(),
  })
}

/**
 * Seller proposes a deal — sets dealProposed on the conversation and marks
 * the listing as "claimed" so no new conversations can be started.
 */
export async function proposeDeal(convId: string, listingId: string): Promise<void> {
  const u = auth.currentUser
  if (!u) throw new Error('Not signed in.')
  await updateDoc(doc(db, 'conversations', convId), { dealProposed: true })
  await updateDoc(doc(db, 'listings', listingId), { status: 'claimed' })
}

/**
 * Receiver accepts the deal — sets dealAccepted on the conversation.
 * Item remains "claimed"; physical handoff confirmed separately.
 */
export async function acceptDeal(convId: string): Promise<void> {
  const u = auth.currentUser
  if (!u) throw new Error('Not signed in.')
  await updateDoc(doc(db, 'conversations', convId), { dealAccepted: true })
}

/** Confirm handoff from one side. When both confirm, listing status → "completed". */
export async function confirmHandoff(convId: string, listingId: string, isSeller: boolean): Promise<void> {
  const u = auth.currentUser
  if (!u) throw new Error('Not signed in.')
  const field = isSeller ? 'sellerConfirmed' : 'receiverConfirmed'
  const convRef = doc(db, 'conversations', convId)
  await updateDoc(convRef, { [field]: true })

  const snap = await getDoc(convRef)
  const d = snap.data() ?? {}
  if (d['sellerConfirmed'] === true && d['receiverConfirmed'] === true) {
    await updateDoc(doc(db, 'listings', listingId), { status: 'completed' })
  }
}

/**
 * Return the conversation ID for two users about a listing, creating the doc
 * if it doesn't exist yet. ID format: sortedUids.join("__") + "__" + listingId
 */
export async function getOrCreateConversation(
  myUid: string,
  otherUid: string,
  listingId: string,
): Promise<string> {
  const convId = [myUid, otherUid].sort().join('__') + '__' + listingId
  const ref = doc(db, 'conversations', convId)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      participants:   [myUid, otherUid],
      listingId,
      lastMessage:    '',
      lastMessageAt:  serverTimestamp(),
      unread:         { [myUid]: 0, [otherUid]: 0 },
      createdAt:      serverTimestamp(),
    })
  }
  return convId
}
