import { create } from 'zustand'
import type { OverlayState } from './types'

export type ProfileTab = 'listings' | 'saved' | 'history' | 'verifications'

interface AppState {
  q: string
  cat: string
  loc: string
  when: string
  role: 'student' | 'local'
  savedIds: Set<string>
  overlay: OverlayState
  profileInitialTab: ProfileTab

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
}))
