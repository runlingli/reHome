import { create } from 'zustand'
import { onAuthStateChanged } from 'firebase/auth'
import { auth as fbAuth } from './firebase'
import { subscribeToListings, fetchUser, primeUser } from './listings'
import { promoteEduIfReady } from './auth'
import { USERS as MOCK_USERS } from './data'
import { users as apiUsers, clearTokens } from './api'
import type { OverlayState, Item, User } from './types'

export type ProfileTab = 'listings' | 'saved' | 'history' | 'verifications'

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
  openMessages: (withUser?: string) => void
  openProfile: () => void
  openProfileTab: (tab: ProfileTab) => void
  openPost: () => void
  closeOverlay: () => void

  openAuth: (mode?: 'login' | 'signup') => void
  closeAuth: () => void
  signIn: (user: AuthUser) => void
  signOut: () => void
  initSession: () => Promise<void>

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
  overlay: { kind: null },
  profileInitialTab: 'listings',

  authOpen: false,
  authMode: 'signup',
  currentUser: null,
  sessionLoading: false,

  listings: [],
  usersByUid: { ...MOCK_USERS },

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
      next.has(id) ? next.delete(id) : next.add(id)
      return { savedIds: next }
    }),

  openItem: (itemId) => set({ overlay: { kind: 'item', itemId } }),
  openMessages: (withUser) => set({ overlay: { kind: 'messages', withUser } }),
  openProfile: () => set({ profileInitialTab: 'listings', overlay: { kind: 'profile' } }),
  openProfileTab: (tab) => set({ profileInitialTab: tab, overlay: { kind: 'profile' } }),
  openPost: () => set({ overlay: { kind: 'post' } }),
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
   * Called once from App.tsx on mount; safe to call multiple times because
   * onAuthStateChanged returns a fresh listener each time, but we don't
   * unsubscribe (lifetime = whole session).
   */
  initSession: async () => {
    set({ sessionLoading: true })

    // Seed user cache with mock fallbacks (covers seeded sellers u_emma etc.).
    Object.entries(MOCK_USERS).forEach(([uid, u]) => primeUser(uid, u))

    // 1. Auth state — Firebase persists session in IndexedDB; this fires
    //    immediately with current user (or null) and on any future change.
    onAuthStateChanged(fbAuth, async (fbUser) => {
      if (!fbUser) {
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
      } catch (err) {
        console.error('[store] failed to load /me:', err)
        set({ sessionLoading: false })
      }
    })

    // 2. Listings stream — populate the feed in real time.
    subscribeToListings(async (items) => {
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
  },

  openNotif: () => set({ notifOpen: true }),
  closeNotif: () => set({ notifOpen: false }),
  toggleNotifPref: (catId) =>
    set((s) => {
      const next = new Set(s.notifPrefs)
      next.has(catId) ? next.delete(catId) : next.add(catId)
      return { notifPrefs: next }
    }),
}))
