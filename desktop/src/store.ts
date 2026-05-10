import { create } from 'zustand'
import type { OverlayState } from './types'
import { users as apiUsers, clearTokens, hasToken } from './api'

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

export const useStore = create<AppState>((set) => ({
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
    // Sync saved IDs from API if available
    set((s) => ({
      currentUser: user,
      authOpen: false,
      // API returns saved_listing_ids on the user object after login
      savedIds: (user as { savedIds?: Set<string> }).savedIds ?? s.savedIds,
    }))
  },

  signOut: async () => {
    clearTokens()
    set({ currentUser: null, overlay: { kind: null } })
  },

  // Called once on app mount — restores session from stored token
  initSession: async () => {
    if (!hasToken()) return
    set({ sessionLoading: true })
    try {
      const me = await apiUsers.me()
      set({
        currentUser: {
          id: me.id,
          email: me.email,
          name: me.name,
          school: me.school,
          handle: me.handle,
          eduVerified: me.edu_verified,
          localVerified: me.local_verified,
          avatarInitials: me.avatar_initials,
          avatarColor: me.avatar_color,
        },
        savedIds: me.saved_listing_ids ? new Set(me.saved_listing_ids) : new Set(['i3', 'i12']),
      })
    } catch {
      // Token invalid or expired — clear silently
      clearTokens()
    } finally {
      set({ sessionLoading: false })
    }
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
