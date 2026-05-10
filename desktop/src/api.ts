const BASE = 'https://api.rehome.app/v1'

// ─── Token management (persisted in localStorage) ───────────────────────────

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

export class ApiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = 'ApiError'
  }
}

async function _refresh_once(): Promise<boolean> {
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

const TIMEOUT_MS = 10_000

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
  _retry = true,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (_access) headers['Authorization'] = `Bearer ${_access}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch (e) {
    clearTimeout(timer)
    if (e instanceof DOMException && e.name === 'AbortError')
      throw new ApiError('TIMEOUT', 'Request timed out. Check your connection or try again.')
    throw e
  }
  clearTimeout(timer)

  if (res.status === 204) return undefined as T

  if (res.status === 401 && _retry) {
    const ok = await _refresh_once()
    if (ok) return req(method, path, body, false)
    clearTokens()
    throw new ApiError('TOKEN_EXPIRED', 'Session expired. Please log in again.')
  }

  const json = await res.json()
  if (!json.ok) throw new ApiError(json.error.code, json.error.message)
  return json.data as T
}

const get  = <T>(p: string)              => req<T>('GET',    p)
const post = <T>(p: string, b?: unknown) => req<T>('POST',   p, b)
const patch = <T>(p: string, b: unknown) => req<T>('PATCH',  p, b)
const del  = <T>(p: string)              => req<T>('DELETE', p)

function qs(params?: Record<string, unknown>): string {
  if (!params) return ''
  const entries = Object.entries(params)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => [k, String(v)] as [string, string])
  if (!entries.length) return ''
  return '?' + new URLSearchParams(entries).toString()
}

// ─── Types (API response shapes) ─────────────────────────────────────────────

export interface ApiUser {
  id: string
  name: string
  handle: string
  email: string
  school: string
  edu_verified: boolean
  local_verified: boolean
  rating: number | null
  deals: number
  bio: string
  avatar_initials: string
  avatar_color: string
  saved_listing_ids?: string[]
  created_at: string
}

export interface ApiPhoto {
  id: string
  url: string
  order: number
}

export interface ApiListing {
  id: string
  title: string
  category: string
  condition: string
  est_value: number
  age: string
  pickup: string
  description: string
  seller_id?: string
  seller?: Pick<ApiUser, 'id' | 'name' | 'handle' | 'school' | 'edu_verified' | 'rating' | 'deals'>
  location: string
  saved_count: number
  status: 'active' | 'claimed' | 'draft' | 'deleted'
  photos: ApiPhoto[]
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: ApiUser
}

export interface ListingParams {
  q?: string
  category?: string
  condition?: string
  location?: string
  sort?: 'recent' | 'saved' | 'value_desc'
  page?: number
  per_page?: number
}

export interface CreateListingBody {
  title: string
  category: string
  condition: string
  age: string
  description?: string
  description_lang?: string
  pickup_window: string
  pickup_date?: string
  pickup_time_slot?: string
  pickup_spot?: string
  location: string
  est_value: number
}

export interface ApiConversation {
  id: string
  listing: { id: string; title: string; photo_url: string }
  other_user: {
    id: string; name: string; edu_verified: boolean
    avatar_color: string; avatar_initials: string
  }
  last_message: string
  last_message_at: string
  unread_count: number
}

export interface ApiMessage {
  id: string
  sender_id: string
  body: string
  sent_at: string
  read: boolean
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const auth = {
  register: (body: { name: string; email: string; password: string; school: string }) =>
    post<AuthResponse>('/auth/register', body),

  login: (body: { email: string; password: string }) =>
    post<AuthResponse>('/auth/login', body),

  logout: () => post('/auth/logout'),

  verifyEdu: () => post('/auth/verify-edu', {}),

  confirmEdu: (code: string) =>
    post<{ edu_verified: boolean }>('/auth/verify-edu/confirm', { code }),
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = {
  me: () => get<ApiUser>('/users/me'),

  update: (body: Partial<Pick<ApiUser, 'name' | 'bio' | 'avatar_color'>>) =>
    patch<ApiUser>('/users/me', body),

  get: (id: string) => get<ApiUser>(`/users/${id}`),

  verifyLocal: (address: string) =>
    post<{ status: string; message: string }>('/users/me/verify-local', { address }),
}

// ─── Listings ────────────────────────────────────────────────────────────────

export const listings = {
  list: (params?: ListingParams) =>
    get<ApiListing[]>(`/listings${qs(params as Record<string, unknown>)}`),

  feed: () =>
    get<{ featured: ApiListing; showcase: unknown[]; grid: ApiListing[] }>('/listings/feed'),

  get: (id: string) => get<ApiListing>(`/listings/${id}`),

  create: (body: CreateListingBody) => post<ApiListing>('/listings', body),

  update: (id: string, body: Partial<CreateListingBody & { status: string }>) =>
    patch<ApiListing>(`/listings/${id}`, body),

  delete: (id: string) => del(`/listings/${id}`),

  save: (id: string) =>
    post<{ saved: boolean; saved_count: number }>(`/listings/${id}/save`),

  uploadPhoto: async (listingId: string, file: File, order: number) => {
    const form = new FormData()
    form.append('file', file)
    form.append('order', String(order))
    const headers: Record<string, string> = {}
    if (_access) headers['Authorization'] = `Bearer ${_access}`
    const res = await fetch(`${BASE}/listings/${listingId}/photos`, {
      method: 'POST', headers, body: form,
    })
    const json = await res.json()
    if (!json.ok) throw new ApiError(json.error.code, json.error.message)
    return json.data as ApiPhoto
  },

  deletePhoto: (listingId: string, photoId: string) =>
    del(`/listings/${listingId}/photos/${photoId}`),
}

// ─── Conversations ───────────────────────────────────────────────────────────

export const conversations = {
  list: () => get<ApiConversation[]>('/conversations'),

  start: (listing_id: string, first_message: string) =>
    post<{ id: string; listing_id: string; other_user_id: string }>(
      '/conversations', { listing_id, first_message }
    ),

  get: (id: string, params?: { before?: string; limit?: number }) =>
    get<{
      id: string
      listing: ApiListing
      other_user: ApiUser
      messages: ApiMessage[]
      has_more: boolean
    }>(`/conversations/${id}${qs(params as Record<string, unknown>)}`),

  send: (id: string, body: string) =>
    post<ApiMessage>(`/conversations/${id}/messages`, { body }),

  markRead: (id: string) =>
    patch<{ unread_count: number }>(`/conversations/${id}/read`, {}),
}

// ─── AI Utilities ────────────────────────────────────────────────────────────

export const ai = {
  generateDescription: (body: {
    title: string; category: string; condition: string
    age: string; pickup_window: string; location: string
  }) => post<{ description: string }>('/ai/generate-description', body),

  translate: (text: string, source_language: string) =>
    post<{ translated_text: string; source_language: string; target_language: string }>(
      '/ai/translate', { text, source_language, target_language: 'en' }
    ),

  estimateValue: (body: { category: string; condition: string; age: string }) =>
    post<{ est_value: number; breakdown: Record<string, number> }>(
      '/ai/estimate-value', body
    ),
}

// ─── Categories ──────────────────────────────────────────────────────────────

export const categories = {
  list: () =>
    get<Array<{ id: string; label: string; glyph: string }>>('/categories'),
}
