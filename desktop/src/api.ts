// Firebase-backed compat layer for components that were written against a
// hypothetical REST API. Same surface (auth.register, auth.login, ...) so
// existing call sites (AuthModal, Header) don't have to change.
//
// All real work lives in ./auth.ts (Firebase Auth) and ./listings.ts (Firestore).
// The token plumbing is kept as a thin shell — Firebase manages session state
// itself via auth.currentUser; we still expose set/clear/has so the old code
// paths stay valid.

import { auth as fbAuth } from './firebase'
import {
  signUpWithEmail, signInWithEmail, signInWithGoogle, signOutUser,
  resendVerification, promoteEduIfReady,
} from './auth'

// ─── Token shim (Firebase manages real session; this is just for old API) ───
let _access: string | null = null

export function setTokens(access: string, _refresh: string) { _access = access }
export function clearTokens() { _access = null }
export function hasToken(): boolean { return !!_access || !!fbAuth.currentUser }

export class ApiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message); this.code = code; this.name = 'ApiError'
  }
}

function wrap(e: unknown): ApiError {
  const err = e as { code?: string; message?: string }
  return new ApiError(err.code || 'auth/unknown', err.message || 'Authentication failed.')
}

// ─── Old types kept for callers that still reference them ───────────────────
export interface ApiUser {
  id: string; name: string; handle: string; email: string; school: string
  edu_verified: boolean; local_verified: boolean
  rating: number | null; deals: number; bio: string
  avatar_initials: string; avatar_color: string
  saved_listing_ids?: string[]; created_at: string
}

export interface AuthResponse {
  access_token: string; refresh_token: string; user: ApiUser
}

async function asAuthResponse(): Promise<AuthResponse> {
  const u = fbAuth.currentUser
  if (!u) throw new ApiError('auth/no-user', 'No active Firebase user.')
  const token = await u.getIdToken()
  const email = u.email || ''
  const isEdu = email.toLowerCase().endsWith('.edu')
  const baseUser: ApiUser = {
    id:               u.uid,
    name:             u.displayName || email.split('@')[0] || 'Member',
    handle:           '@' + (email.split('@')[0] || 'user'),
    email,
    school:           '',
    edu_verified:     isEdu && u.emailVerified,
    local_verified:   false,
    rating:           5.0,
    deals:            0,
    bio:              '',
    avatar_initials:  (u.displayName || email).slice(0, 2).toUpperCase(),
    avatar_color:     '#C8553D',
    created_at:       new Date().toISOString(),
  }
  return {
    access_token:  token,
    refresh_token: u.refreshToken || '',
    user:          baseUser,
  }
}

// ─── Auth ───────────────────────────────────────────────────────────────────
export const auth = {
  async register(body: { name: string; email: string; password: string; school: string }) {
    try {
      await signUpWithEmail(body.email.toLowerCase(), body.password, body.name)
      const res = await asAuthResponse()
      setTokens(res.access_token, res.refresh_token)
      return res
    } catch (e) { throw wrap(e) }
  },

  async login(body: { email: string; password: string }) {
    try {
      await signInWithEmail(body.email.toLowerCase(), body.password)
      const res = await asAuthResponse()
      setTokens(res.access_token, res.refresh_token)
      return res
    } catch (e) { throw wrap(e) }
  },

  async google() {
    try {
      await signInWithGoogle()
      const res = await asAuthResponse()
      setTokens(res.access_token, res.refresh_token)
      return res
    } catch (e) { throw wrap(e) }
  },

  async logout() {
    try { await signOutUser(); clearTokens() } catch (e) { throw wrap(e) }
  },

  async resendVerifyEmail() {
    try { await resendVerification() } catch (e) { throw wrap(e) }
  },

  async promoteEduIfReady() {
    try { await promoteEduIfReady() } catch (e) { throw wrap(e) }
  },
}

// ─── Users (just /me) ───────────────────────────────────────────────────────
import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

export const users = {
  async me(): Promise<ApiUser> {
    const u = fbAuth.currentUser
    if (!u) throw new ApiError('auth/no-user', 'Not signed in.')
    const snap = await getDoc(doc(db, 'users', u.uid))
    const d = snap.exists() ? snap.data() as Record<string, unknown> : {}
    const email = u.email || (d.email as string) || ''
    return {
      id:               u.uid,
      name:             (d.name as string) || u.displayName || email.split('@')[0] || 'Member',
      handle:           (d.handle as string) || '@user',
      email,
      school:           (d.school as string) || '',
      edu_verified:     (d.eduVerified as boolean) === true,
      local_verified:   (d.localVerified as boolean) === true,
      rating:           (d.rating as number) ?? 5.0,
      deals:            (d.deals as number) ?? 0,
      bio:              (d.bio as string) || '',
      avatar_initials:  (d.avatarInitials as string) || 'U',
      avatar_color:     (d.avatarColor as string) || '#C8553D',
      created_at:       new Date().toISOString(),
    }
  },
}
