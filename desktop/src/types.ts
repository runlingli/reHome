export interface Category {
  id: string
  en: string
  cn: string
  glyph: string
}

export interface Condition {
  en: string
  cn: string
  factor: number
}

export interface Item {
  id: string
  title: string
  titleCn: string
  cat: string
  condition: string
  est: number
  age: string
  pickup: string
  desc: string
  descCn: string
  seller: string
  location: string
  photoColors: [string, string]
  photoLabel: string
  saved: number
  posted: string
  imageUrl: string
  status?: string   // "available" | "completed"
}

export interface User {
  name: string
  handle: string
  school: string
  schoolCn: string
  eduVerified: boolean
  localVerified?: boolean
  rating: number
  deals: number
  bio: string
  bioCn: string
  avatarColor: string
  avatarInitials: string
}

export interface Message {
  from: 'me' | 'them'
  text: string
  cn: string
  time: string
}

export interface Conversation {
  id: string
  with: string
  item: string
  unread: number
  last: string
  lastCn: string
  time: string
  messages: Message[]
  completed?: boolean
}

export type OverlayKind = 'item' | 'messages' | 'profile' | 'post' | null

export interface OverlayState {
  kind: OverlayKind
  itemId?: string
  withUser?: string
  listingId?: string
  draftIdx?: number
}
