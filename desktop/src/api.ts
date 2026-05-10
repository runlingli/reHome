import { ITEMS, USERS, CONVERSATIONS } from './data'

const BASE = 'https://api.rehome.app/v1'

// Set VITE_API_MOCK=true in .env.local to bypass the real backend
const MOCK = import.meta.env.VITE_API_MOCK === 'true'

// ─── Token management ────────────────────────────────────────────────────────

let _access: string | null = localStorage.getItem('rh_access')
let _refresh: string | null = localStorage.getItem('rh_refresh')

export function setTokens(access: string, refresh: string) {
  _access = access
  _refresh = refresh
  localStorage.setItem('rh_access', access)
  localStorage.setItem('rh_refresh', refresh)
}

export function clearTokens() {
  _access = null
  _refresh = null
  localStorage.removeItem('rh_access')
  localStorage.removeItem('rh_refresh')
}

export function hasToken(): boolean {
  return !!_access
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

const TIMEOUT_MS = 10_000

export class ApiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = 'ApiError'
  }
}

async function _doRefresh(): Promise<boolean> {
  if (!_refresh) return false
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: _refresh }),
    })
    const json = await res.json()
    if (!json.ok) return false
    setTokens(json.data.access_token, json.data.refresh_token)
    return true
  } catch {
    return false
  }
}

async function req<T>(method: string, path: string, body?: unknown, _retry = true): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (_access) headers['Authorization'] = `Bearer ${_access}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method, headers, signal: controller.signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    clearTimeout(timer)
    if (e instanceof DOMException && e.name === 'AbortError')
      throw new ApiError('TIMEOUT', 'Request timed out — the backend may not be running yet.')
    throw e
  }
  clearTimeout(timer)

  if (res.status === 204) return undefined as T

  if (res.status === 401 && _retry) {
    const ok = await _doRefresh()
    if (ok) return req(method, path, body, false)
    clearTokens()
    throw new ApiError('TOKEN_EXPIRED', 'Session expired. Please log in again.')
  }

  const json = await res.json()
  if (!json.ok) throw new ApiError(json.error.code, json.error.message)
  return json.data as T
}

const get   = <T>(p: string)              => req<T>('GET',    p)
const post  = <T>(p: string, b?: unknown) => req<T>('POST',   p, b)
const patch = <T>(p: string, b: unknown)  => req<T>('PATCH',  p, b)
const del   = <T>(p: string)              => req<T>('DELETE', p)

function qs(params?: Record<string, unknown>): string {
  if (!params) return ''
  const entries = Object.entries(params)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => [k, String(v)] as [string, string])
  return entries.length ? '?' + new URLSearchParams(entries).toString() : ''
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string; name: string; handle: string; email: string; school: string
  edu_verified: boolean; local_verified: boolean
  rating: number | null; deals: number; bio: string
  avatar_initials: string; avatar_color: string
  saved_listing_ids?: string[]; created_at: string
}

export interface ApiPhoto { id: string; url: string; order: number }

export interface ApiListing {
  id: string; title: string; category: string; condition: string
  est_value: number; age: string; pickup: string; description: string
  seller_id?: string
  seller?: Pick<ApiUser, 'id' | 'name' | 'handle' | 'school' | 'edu_verified' | 'rating' | 'deals'>
  location: string; saved_count: number
  status: 'active' | 'claimed' | 'draft' | 'deleted'
  photos: ApiPhoto[]; created_at: string; updated_at: string
}

export interface AuthResponse {
  access_token: string; refresh_token: string; user: ApiUser
}

export interface ListingParams {
  q?: string; category?: string; condition?: string; location?: string
  sort?: 'recent' | 'saved' | 'value_desc'; page?: number; per_page?: number
}

export interface CreateListingBody {
  title: string; category: string; condition: string; age: string
  description?: string; description_lang?: string
  pickup_window: string; pickup_date?: string
  pickup_time_slot?: string; pickup_spot?: string
  location: string; est_value: number
}

export interface ApiConversation {
  id: string
  listing: { id: string; title: string; photo_url: string }
  other_user: { id: string; name: string; edu_verified: boolean; avatar_color: string; avatar_initials: string }
  last_message: string; last_message_at: string; unread_count: number
}

export interface ApiMessage {
  id: string; sender_id: string; body: string; sent_at: string; read: boolean
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const auth = {
  register: (body: { name: string; email: string; password: string; school: string }) =>
    MOCK ? _mockRegister(body) : post<AuthResponse>('/auth/register', body),

  login: (body: { email: string; password: string }) =>
    MOCK ? _mockLogin(body) : post<AuthResponse>('/auth/login', body),

  logout: () =>
    MOCK ? Promise.resolve() : post('/auth/logout'),

  verifyEdu: () =>
    MOCK ? Promise.resolve() : post('/auth/verify-edu', {}),

  confirmEdu: (code: string) =>
    MOCK ? Promise.resolve({ edu_verified: true }) : post<{ edu_verified: boolean }>('/auth/verify-edu/confirm', { code }),
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = {
  me: () =>
    MOCK ? _mockMe() : get<ApiUser>('/users/me'),

  update: (body: Partial<Pick<ApiUser, 'name' | 'bio' | 'avatar_color'>>) =>
    patch<ApiUser>('/users/me', body),

  get: (id: string) => get<ApiUser>(`/users/${id}`),

  verifyLocal: (address: string) =>
    post<{ status: string; message: string }>('/users/me/verify-local', { address }),
}

// ─── Listings ────────────────────────────────────────────────────────────────

export const listings = {
  list: (params?: ListingParams) =>
    MOCK ? _mockList(params) : get<ApiListing[]>(`/listings${qs(params as Record<string, unknown>)}`),

  feed: () =>
    MOCK ? _mockFeed() : get<{ featured: ApiListing; showcase: unknown[]; grid: ApiListing[] }>('/listings/feed'),

  get: (id: string) =>
    MOCK ? _mockGet(id) : get<ApiListing>(`/listings/${id}`),

  create: (body: CreateListingBody) =>
    MOCK ? _mockCreate(body) : post<ApiListing>('/listings', body),

  update: (id: string, body: Partial<CreateListingBody & { status: string }>) =>
    patch<ApiListing>(`/listings/${id}`, body),

  delete: (id: string) => del(`/listings/${id}`),

  save: (id: string) =>
    MOCK ? _mockSave(id) : post<{ saved: boolean; saved_count: number }>(`/listings/${id}/save`),

  uploadPhoto: async (listingId: string, file: File, order: number) => {
    if (MOCK) {
      await _delay(400)
      return { id: `ph_mock_${Date.now()}`, url: URL.createObjectURL(file), order }
    }
    const form = new FormData()
    form.append('file', file)
    form.append('order', String(order))
    const headers: Record<string, string> = {}
    if (_access) headers['Authorization'] = `Bearer ${_access}`
    const res = await fetch(`${BASE}/listings/${listingId}/photos`, { method: 'POST', headers, body: form })
    const json = await res.json()
    if (!json.ok) throw new ApiError(json.error.code, json.error.message)
    return json.data as ApiPhoto
  },

  deletePhoto: (listingId: string, photoId: string) =>
    del(`/listings/${listingId}/photos/${photoId}`),
}

// ─── Conversations ───────────────────────────────────────────────────────────

export const conversations = {
  list: () =>
    MOCK ? _mockConvList() : get<ApiConversation[]>('/conversations'),

  start: (listing_id: string, first_message: string) =>
    post<{ id: string; listing_id: string; other_user_id: string }>(
      '/conversations', { listing_id, first_message }
    ),

  get: (id: string, params?: { before?: string; limit?: number }) =>
    get<{ id: string; listing: ApiListing; other_user: ApiUser; messages: ApiMessage[]; has_more: boolean }>(
      `/conversations/${id}${qs(params as Record<string, unknown>)}`
    ),

  send: (id: string, body: string) =>
    MOCK ? _mockSend(id, body) : post<ApiMessage>(`/conversations/${id}/messages`, { body }),

  markRead: (id: string) =>
    patch<{ unread_count: number }>(`/conversations/${id}/read`, {}),
}

// ─── AI ──────────────────────────────────────────────────────────────────────

export const ai = {
  generateDescription: (body: { title: string; category: string; condition: string; age: string; pickup_window: string; location: string }) =>
    post<{ description: string }>('/ai/generate-description', body),

  translate: (text: string, source_language: string) =>
    post<{ translated_text: string; source_language: string; target_language: string }>(
      '/ai/translate', { text, source_language, target_language: 'en' }
    ),

  estimateValue: (body: { category: string; condition: string; age: string }) =>
    post<{ est_value: number; breakdown: Record<string, number> }>('/ai/estimate-value', body),
}

export const categories = {
  list: () => get<Array<{ id: string; label: string; glyph: string }>>('/categories'),
}

// ════════════════════════════════════════════════════════════════════════════
// MOCK IMPLEMENTATIONS  (active only when VITE_API_MOCK=true in .env.local)
// ════════════════════════════════════════════════════════════════════════════

const _delay = (ms = 350) => new Promise<void>(r => setTimeout(r, ms))

// Test accounts — matches the 5 accounts the backend team created
const _ACCOUNTS: Record<string, { userId: string; eduVerified: boolean }> = {
  'emma@bu.edu':              { userId: 'u_emma',   eduVerified: true  },
  'jin@harvard.edu':          { userId: 'u_jin',    eduVerified: true  },
  'dani@mit.edu':             { userId: 'u_dani',   eduVerified: true  },
  'lucas@northeastern.edu':   { userId: 'u_lucas',  eduVerified: true  },
  'local@example.com':        { userId: 'me_local', eduVerified: false },
}
const _MOCK_PASSWORD = 'rehome2026'

let _mockUserId: string | null = null
const _mockSaved = new Set<string>(['i3', 'i12'])

function _makeToken(uid: string) { return btoa(`mock:${uid}:${Date.now()}`) }

function _toApiUser(userId: string, email: string): ApiUser {
  const u = USERS[userId]
  return {
    id: userId, name: u.name, handle: u.handle, email,
    school: u.school,
    edu_verified: u.eduVerified ?? false,
    local_verified: u.localVerified ?? false,
    rating: u.rating, deals: u.deals, bio: u.bio,
    avatar_initials: u.avatarInitials, avatar_color: u.avatarColor,
    saved_listing_ids: Array.from(_mockSaved),
    created_at: '2026-04-01T09:00:00Z',
  }
}

function _toApiListing(item: typeof ITEMS[0]): ApiListing {
  const seller = USERS[item.seller]
  return {
    id: item.id, title: item.title, category: item.cat,
    condition: item.condition, est_value: item.est,
    age: item.age, pickup: item.pickup, description: item.desc,
    seller_id: item.seller,
    seller: {
      id: item.seller, name: seller.name, handle: seller.handle,
      school: seller.school, edu_verified: seller.eduVerified,
      rating: seller.rating, deals: seller.deals,
    },
    location: item.location, saved_count: item.saved,
    status: 'active',
    photos: item.imageUrl ? [{ id: `ph_${item.id}`, url: item.imageUrl, order: 0 }] : [],
    created_at: '2026-05-07T10:00:00Z', updated_at: '2026-05-07T10:00:00Z',
  }
}

async function _mockLogin(body: { email: string; password: string }): Promise<AuthResponse> {
  await _delay()
  const acct = _ACCOUNTS[body.email.toLowerCase()]
  if (!acct) throw new ApiError('WRONG_PASSWORD', 'No account found with that email.')
  if (body.password !== _MOCK_PASSWORD) throw new ApiError('WRONG_PASSWORD', 'Incorrect password.')
  _mockUserId = acct.userId
  const user = _toApiUser(acct.userId, body.email.toLowerCase())
  const tok = _makeToken(acct.userId)
  setTokens(tok, tok)
  return { access_token: tok, refresh_token: tok, user }
}

async function _mockRegister(body: { name: string; email: string; password: string; school: string }): Promise<AuthResponse> {
  await _delay()
  if (!body.email.toLowerCase().endsWith('.edu'))
    throw new ApiError('INVALID_EDU_EMAIL', 'Must be a .edu email address.')
  if (_ACCOUNTS[body.email.toLowerCase()])
    throw new ApiError('EMAIL_TAKEN', 'An account with this email already exists.')
  _mockUserId = 'new_user'
  const initials = body.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const user: ApiUser = {
    id: 'new_user', name: body.name,
    handle: '@' + body.name.toLowerCase().replace(/\s+/g, '.'),
    email: body.email.toLowerCase(), school: body.school,
    edu_verified: false, local_verified: false,
    rating: null, deals: 0, bio: '',
    avatar_initials: initials, avatar_color: '#4F46E5',
    saved_listing_ids: [], created_at: new Date().toISOString(),
  }
  const tok = _makeToken('new_user')
  setTokens(tok, tok)
  return { access_token: tok, refresh_token: tok, user }
}

async function _mockMe(): Promise<ApiUser> {
  await _delay(200)
  if (!_mockUserId) throw new ApiError('TOKEN_EXPIRED', 'Not authenticated.')
  const email = Object.entries(_ACCOUNTS).find(([, a]) => a.userId === _mockUserId)?.[0] ?? 'user@test.edu'
  return _toApiUser(_mockUserId, email)
}

async function _mockList(params?: ListingParams): Promise<ApiListing[]> {
  await _delay()
  let items = ITEMS.filter(it => {
    if (params?.category && it.cat !== params.category) return false
    if (params?.location && !it.location.toLowerCase().includes(params.location.split(',')[0].toLowerCase())) return false
    if (params?.q) {
      const q = params.q.toLowerCase()
      if (!(it.title + ' ' + it.desc + ' ' + it.location).toLowerCase().includes(q)) return false
    }
    return true
  })
  const page = params?.page ?? 1
  const perPage = params?.per_page ?? 20
  return items.slice((page - 1) * perPage, page * perPage).map(_toApiListing)
}

async function _mockFeed(): Promise<{ featured: ApiListing; showcase: unknown[]; grid: ApiListing[] }> {
  await _delay()
  const all = ITEMS.map(_toApiListing)
  return { featured: all[0], showcase: [], grid: all.slice(1) }
}

async function _mockGet(id: string): Promise<ApiListing> {
  await _delay(200)
  const item = ITEMS.find(i => i.id === id)
  if (!item) throw new ApiError('LISTING_NOT_FOUND', 'Item not found.')
  return _toApiListing(item)
}

async function _mockCreate(body: CreateListingBody): Promise<ApiListing> {
  await _delay(600)
  const seller = _mockUserId ?? 'u_emma'
  const u = USERS[seller] ?? USERS['u_emma']
  return {
    id: `i_${Date.now()}`, ...body,
    est_value: body.est_value, pickup: body.pickup_window,
    description: body.description ?? '', seller_id: seller,
    seller: { id: seller, name: u.name, handle: u.handle, school: u.school, edu_verified: u.eduVerified, rating: u.rating, deals: u.deals },
    saved_count: 0, status: 'active', photos: [],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }
}

async function _mockSave(id: string): Promise<{ saved: boolean; saved_count: number }> {
  await _delay(200)
  const item = ITEMS.find(i => i.id === id)
  if (!item) throw new ApiError('LISTING_NOT_FOUND', 'Item not found.')
  const wasSaved = _mockSaved.has(id)
  wasSaved ? _mockSaved.delete(id) : _mockSaved.add(id)
  return { saved: !wasSaved, saved_count: item.saved + (_mockSaved.has(id) ? 1 : 0) }
}

async function _mockConvList(): Promise<ApiConversation[]> {
  await _delay()
  return CONVERSATIONS.map(c => {
    const other = USERS[c.with]
    const item = ITEMS.find(i => i.id === c.item)!
    return {
      id: c.id,
      listing: { id: c.item, title: item.title, photo_url: item.imageUrl },
      other_user: { id: c.with, name: other.name, edu_verified: other.eduVerified, avatar_color: other.avatarColor, avatar_initials: other.avatarInitials },
      last_message: c.last,
      last_message_at: new Date().toISOString(),
      unread_count: c.unread,
    }
  })
}

async function _mockSend(_id: string, body: string): Promise<ApiMessage> {
  await _delay(250)
  return {
    id: `m_${Date.now()}`,
    sender_id: _mockUserId ?? 'me_student',
    body, sent_at: new Date().toISOString(), read: false,
  }
}
