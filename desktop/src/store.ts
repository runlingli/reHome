import { create } from 'zustand'
import type { OverlayState } from './types'

export type ProfileTab = 'listings' | 'saved' | 'history' | 'verifications'

export interface AuthUser {
  email: string
  name: string
  school: string
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
  signIn: (user) => set({ currentUser: user, authOpen: false }),
  signOut: () => set({ currentUser: null, overlay: { kind: null } }),

  openNotif: () => set({ notifOpen: true }),
  closeNotif: () => set({ notifOpen: false }),
  toggleNotifPref: (catId) =>
    set((s) => {
      const next = new Set(s.notifPrefs)
      next.has(catId) ? next.delete(catId) : next.add(catId)
      return { notifPrefs: next }
    }),
}))
