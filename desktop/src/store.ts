import { create } from 'zustand'
import { onAuthStateChanged } from 'firebase/auth'
import { auth as fbAuth } from './firebase'
import { subscribeToListings, subscribeToConversations, fetchUser, primeUser } from './listings'
import { promoteEduIfReady } from './auth'
import { ITEMS as MOCK_ITEMS, USERS as MOCK_USERS } from './data'
import { users as apiUsers, clearTokens } from './api'
import type { OverlayState, Item, User, Conversation } from './types'

export type ProfileTab = 'listings' | 'saved' | 'drafts' | 'history' | 'verifications'

export interface PostDraft {
  photos: number
  title: string
  cat: string
  condition: string
  age: string
  pickup: string
  notes: string
  savedAt: string
}

export interface AuthUser {
  id?: string
  email: string
  name: string
  school: string
  handle?: string
  eduVerified?: boolean
  localVerified?: boolean
  avatarInitials?: string
  avatarColor?: string
}

interface AppState {
  q: string
  cat: string
  loc: string
  when: string
  role: 'student' | 'local'
  savedIds: Set<string>
  savedItemCache: Record<string, Item>
  drafts: PostDraft[]
  overlay: OverlayState
  profileInitialTab: ProfileTab

  // Auth
  authOpen: boolean
  authMode: 'login' | 'signup'
  currentUser: AuthUser | null
  sessionLoading: boolean

  // Live data from Firestore
  listings: Item[]
  usersByUid: Record<string, User>
  conversations: Conversation[]

  // Notifications
  notifOpen: boolean
  notifPrefs: Set<string>

  setQ: (q: string) => void
  setCat: (cat: string) => void
  setLoc: (loc: string) => void
  setWhen: (when: string) => void
  switchRole: () => void
  toggleSave: (id: string) => void

  openItem: (id: string) => void
  openMessages: (withUser?: string, listingId?: string) => void
  openProfile: () => void
  openProfileTab: (tab: ProfileTab) => void
  openPost: () => void
  openPostFromDraft: (draftIdx: number) => void
  closeOverlay: () => void

  openAuth: (mode?: 'login' | 'signup') => void
  closeAuth: () => void
  signIn: (user: AuthUser) => void
  signOut: () => void
  initSession: () => Promise<void>

  saveDraft: (draft: Omit<PostDraft, 'savedAt'>) => void
  updateDraft: (idx: number, draft: Omit<PostDraft, 'savedAt'>) => void
  deleteDraft: (idx: number) => void
  clearInvalidSaved: () => void

  openNotif: () => void
  closeNotif: () => void
  toggleNotifPref: (catId: string) => void
}

export const useStore = create<AppState>((set, get) => ({
  q: '',
  cat: 'all',
  loc: '',
  when: '',
  role: 'student',
  savedIds: new Set(['i3', 'i12']),
  savedItemCache: Object.fromEntries(
    MOCK_ITEMS.filter(i => i.id === 'i3' || i.id === 'i12').map(i => [i.id, i])
  ) as Record<string, Item>,
  drafts: [],
  overlay: { kind: null },
  profileInitialTab: 'listings',

  authOpen: false,
  authMode: 'signup',
  currentUser: null,
  sessionLoading: false,

  listings: [...MOCK_ITEMS],
  usersByUid: { ...MOCK_USERS },
  conversations: [],

  notifOpen: false,
  notifPrefs: new Set(['furniture', 'appliance']),

  setQ: (q) => set({ q }),
  setCat: (cat) => set({ cat }),
  setLoc: (loc) => set({ loc }),
  setWhen: (when) => set({ when }),
  switchRole: () => set((s) => ({ role: s.role === 'student' ? 'local' : 'student' })),
  toggleSave: (id) =>
    set((s) => {
      const next = new Set(s.savedIds)
      const cacheNext = { ...s.savedItemCache }
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        const item = s.listings.find(i => i.id === id)
        if (item) cacheNext[id] = item
      }
      return { savedIds: next, savedItemCache: cacheNext }
    }),

  openItem: (itemId) => set({ overlay: { kind: 'item', itemId } }),
  openMessages: (withUser, listingId) => set({ overlay: { kind: 'messages', withUser, listingId } }),
  openProfile: () => set({ profileInitialTab: 'listings', overlay: { kind: 'profile' } }),
  openProfileTab: (tab) => set({ profileInitialTab: tab, overlay: { kind: 'profile' } }),
  openPost: () => set({ overlay: { kind: 'post' } }),
  openPostFromDraft: (draftIdx) => set({ overlay: { kind: 'post', draftIdx } }),
  closeOverlay: () => set({ overlay: { kind: null } }),

  openAuth: (mode = 'signup') => set({ authOpen: true, authMode: mode }),
  closeAuth: () => set({ authOpen: false }),

  signIn: (user) => {
    set((s) => ({
      currentUser: user,
      authOpen: false,
      savedIds: (user as { savedIds?: Set<string> }).savedIds ?? s.savedIds,
    }))
  },

  signOut: () => {
    clearTokens()
    set({ currentUser: null, overlay: { kind: null } })
  },

  /**
   * Bootstrap Firebase auth subscription + Firestore listings stream.
   * Called once from App.tsx on mount.
   *
   * IMPORTANT: Firestore rules require `signedIn()` to read /listings, so the
   * listings subscription is started only AFTER the user signs in (and torn
   * down on sign out). Otherwise the very first snapshot read fails with
   * PERMISSION_DENIED and the listener stays in an error state forever.
   */
  initSession: async () => {
    set({ sessionLoading: true })

    // Seed user cache with mock fallbacks (covers seeded sellers u_emma etc.).
    Object.entries(MOCK_USERS).forEach(([uid, u]) => primeUser(uid, u))

    let unsubListings: (() => void) | null = null
    let unsubConversations: (() => void) | null = null

    const startListings = () => {
      if (unsubListings) return
      unsubListings = subscribeToListings(async (items) => {
        set({ listings: items })
        const known = get().usersByUid
        const missing = Array.from(new Set(items.map(i => i.seller)))
          .filter(uid => uid && !known[uid])
        if (missing.length === 0) return
        const fetched = await Promise.all(
          missing.map(uid => fetchUser(uid).then(u => [uid, u] as const))
        )
        const updates: Record<string, User> = { ...get().usersByUid }
        for (const [uid, u] of fetched) if (u) updates[uid] = u
        set({ usersByUid: updates })
      })
    }
    const startConversations = (uid: string) => {
      if (unsubConversations) return
      unsubConversations = subscribeToConversations(uid, (convs) => {
        set({ conversations: convs })
      })
    }
    const stopListings = () => {
      if (unsubListings) { unsubListings(); unsubListings = null }
      if (unsubConversations) { unsubConversations(); unsubConversations = null }
      set({ listings: [...MOCK_ITEMS], conversations: [] })
    }

    // Auth state — Firebase persists session in IndexedDB; this fires
    // immediately with current user (or null) and on any future change.
    onAuthStateChanged(fbAuth, async (fbUser) => {
      if (!fbUser) {
        stopListings()
        set({ currentUser: null, sessionLoading: false })
        return
      }
      try {
        const me = await apiUsers.me()
        set({
          currentUser: {
            id:             me.id,
            email:          me.email,
            name:           me.name,
            school:         me.school,
            handle:         me.handle,
            eduVerified:    me.edu_verified,
            localVerified:  me.local_verified,
            avatarInitials: me.avatar_initials,
            avatarColor:    me.avatar_color,
          },
          sessionLoading: false,
        })
        promoteEduIfReady().catch(() => {})
        startListings()
        startConversations(fbUser.uid)
      } catch (err) {
        console.error('[store] failed to load /me:', err)
        set({ sessionLoading: false })
      }
    })
  },

  saveDraft: (draft) =>
    set((s) => ({ drafts: [...s.drafts, { ...draft, savedAt: new Date().toISOString() }] })),
  updateDraft: (idx, draft) =>
    set((s) => {
      const next = [...s.drafts]
      next[idx] = { ...draft, savedAt: new Date().toISOString() }
      return { drafts: next }
    }),
  deleteDraft: (idx) =>
    set((s) => ({ drafts: s.drafts.filter((_, i) => i !== idx) })),
  clearInvalidSaved: () =>
    set((s) => {
      const liveIds = new Set(s.listings.map(i => i.id))
      const validIds = new Set([...s.savedIds].filter(id => liveIds.has(id)))
      const validCache: Record<string, Item> = {}
      validIds.forEach(id => { if (s.savedItemCache[id]) validCache[id] = s.savedItemCache[id] })
      return { savedIds: validIds, savedItemCache: validCache }
    }),

  openNotif: () => set({ notifOpen: true }),
  closeNotif: () => set({ notifOpen: false }),
  toggleNotifPref: (catId) =>
    set((s) => {
      const next = new Set(s.notifPrefs)
      next.has(catId) ? next.delete(catId) : next.add(catId)
      return { notifPrefs: next }
    }),
}))
