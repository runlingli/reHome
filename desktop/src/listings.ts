// Firestore listings live read + lazy user fetch + write helpers.
// Mirrors iOS FirestoreService — we keep iOS Listing semantics so existing
// components only swap their data source, not their props.

import {
  collection, doc, getDoc, limit, onSnapshot, orderBy, query,
  serverTimestamp, addDoc, type Timestamp,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import type { Item, User } from './types'

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
    onChange(snap.docs.map(d => decodeListing(d.id, d.data() as FirestoreListing)))
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
