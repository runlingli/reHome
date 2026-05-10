import { useMemo, useState, type ReactElement } from 'react'
import type { Item, User } from '../types'

export const ACCENT = '#C8553D'
export const ACCENT_SOFT = '#F2DED7'
export const EDU = { color: '#1F8A5B', bg: '#E0F1E7', label: '.edu Verified' }
export const LOCAL = { color: '#2A6FDB', bg: '#E0EAFA', label: 'Local Verified' }

export const T = {
  bg: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F6F2E9',
  border: '#EAE4D7',
  borderSubtle: '#F0EBDF',
  text: '#1A1A1A',
  textMuted: '#6B6863',
  textFaint: '#9C968D',
  mono: '"JetBrains Mono", ui-monospace, monospace',
}

// ── Photo placeholder ─────────────────────────────────────────────────────────
interface PhotoProps {
  colors: [string, string]
  label: string
  aspect?: string
  radius?: number
  height?: string
  className?: string
}
export function Photo({ colors, label, aspect = '1', radius = 12, height, className = '' }: PhotoProps) {
  const [c1, c2] = colors
  const id = useMemo(() => 'p' + Math.random().toString(36).slice(2, 8), [])
  return (
    <div
      className={className}
      style={{
        position: 'relative', width: '100%',
        aspectRatio: height ? undefined : aspect,
        height: height || undefined,
        borderRadius: radius, overflow: 'hidden',
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
        flexShrink: 0,
      }}
    >
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
        <defs>
          <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="14" stroke={c2} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
      <div style={{
        position: 'absolute', left: 12, bottom: 10,
        fontFamily: T.mono, fontSize: 10, letterSpacing: 0.4,
        textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)',
      }}>{label}</div>
    </div>
  )
}

// ── Item image (real photo with gradient fallback) ────────────────────────────
interface ItemImageProps {
  item: Item
  aspect?: string
  height?: string
  radius?: number
}
export function ItemImage({ item, aspect = '1', height, radius = 16 }: ItemImageProps) {
  const [failed, setFailed] = useState(false)
  const style: React.CSSProperties = {
    position: 'relative', width: '100%',
    aspectRatio: height ? undefined : aspect,
    height: height ?? undefined,
    borderRadius: radius, overflow: 'hidden', flexShrink: 0,
  }
  if (!item.imageUrl || failed) {
    return (
      <Photo colors={item.photoColors} label={item.photoLabel}
        aspect={aspect} height={height} radius={radius} />
    )
  }
  return (
    <div style={style}>
      <img
        src={item.imageUrl}
        alt={item.title}
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────
// Animal pool mirrors iOS AvatarView.animalPool — same 8 slots, same palette.
const ANIMAL_POOL = [
  { emoji: '🐰', bg: '#E8E0D4' },
  { emoji: '🐢', bg: '#D4E8D8' },
  { emoji: '🐦', bg: '#D4E0F0' },
  { emoji: '🐟', bg: '#D4EEF0' },
  { emoji: '🐈', bg: '#EEE0F0' },
  { emoji: '🐕', bg: '#F0E8D0' },
  { emoji: '🦎', bg: '#DCF0D4' },
  { emoji: '🐞', bg: '#F0D4D4' },
]

function hashHandle(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function Avatar({ user, size = 36 }: { user: User; size?: number }) {
  const animal = ANIMAL_POOL[hashHandle(user.handle) % ANIMAL_POOL.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: size,
      background: animal.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.54, lineHeight: 1, flexShrink: 0,
      boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.07)',
    }}>
      {animal.emoji}
    </div>
  )
}

// ── Verified badge ────────────────────────────────────────────────────────────
export function VerifiedBadge({ kind = 'edu', size = 'sm' }: { kind?: 'edu' | 'local'; size?: 'sm' | 'md' }) {
  const v = kind === 'edu' ? EDU : LOCAL
  const small = size === 'sm'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: small ? '2px 7px 2px 5px' : '4px 9px 4px 6px',
      borderRadius: 999, background: v.bg, color: v.color,
      fontSize: small ? 10.5 : 12, fontWeight: 600,
      letterSpacing: 0.1, lineHeight: 1, whiteSpace: 'nowrap',
    }}>
      <svg width={small ? 9 : 11} height={small ? 9 : 11} viewBox="0 0 12 12">
        <path d="M6 0.6l1.6 1.1 1.9-.4.6 1.8 1.7.9-.5 1.9.9 1.7-1.5 1.2.1 2-1.9.4-1.1 1.6L6 11.4l-1.7.4-1.1-1.6-1.9-.4.1-2L0 6.6l.9-1.7-.5-1.9 1.7-.9.6-1.8L4.6.7 6 .6z" fill={v.color} opacity="0.18" />
        <path d="M3.4 6.2l1.7 1.7L8.6 4.3" stroke={v.color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {v.label}
    </span>
  )
}

// ── Free tag ──────────────────────────────────────────────────────────────────
export function FreeTag({ est, big }: { est: number; big?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, flexShrink: 0 }}>
      <span style={{ fontSize: big ? 22 : 14, fontWeight: 700, color: ACCENT, letterSpacing: 0.1 }}>Free</span>
      <span style={{ fontSize: big ? 12 : 10.5, color: T.textFaint, fontFamily: T.mono }}>est. ${est}</span>
    </span>
  )
}

// ── Logo ──────────────────────────────────────────────────────────────────────
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800, letterSpacing: -0.6, fontSize: size, color: T.text }}>
      <span style={{ position: 'relative', width: size, height: size, borderRadius: size * 0.3, background: ACCENT, flexShrink: 0, display: 'inline-block' }}>
        <span style={{ position: 'absolute', inset: '22%', borderRadius: size * 0.18, background: T.bg }} />
      </span>
      reHome
    </div>
  )
}

// ── Icon ──────────────────────────────────────────────────────────────────────
const PATHS: Record<string, ReactElement | 'heartfill' | 'starfill'> = {
  search:    <><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4" strokeLinecap="round"/></>,
  pin:       <><path d="M12 21s-6-6-6-11a6 6 0 0112 0c0 5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/></>,
  heart:     <path d="M12 20s-7-4.4-7-10a4.5 4.5 0 018-2.8A4.5 4.5 0 0119 10c0 5.6-7 10-7 10z"/>,
  heartFill: 'heartfill',
  share:     <><path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5"/></>,
  arrow:     <path d="M5 12h14M13 6l6 6-6 6"/>,
  back:      <path d="M19 12H5M11 6l-6 6 6 6"/>,
  bell:      <><path d="M6 16l-1 2h14l-1-2V11a6 6 0 10-12 0v5z"/><path d="M10 20a2 2 0 004 0"/></>,
  chat:      <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H9l-4 4v-4a1 1 0 010-13z"/>,
  shield:    <><path d="M12 3l8 3v7c0 4.5-3.4 7.6-8 8-4.6-.4-8-3.5-8-8V6l8-3z"/><path d="M9 12l2 2 4-4" strokeLinecap="round"/></>,
  check:     <path d="M5 12.5L10 17l9-10" strokeLinecap="round" strokeLinejoin="round"/>,
  plus:      <path d="M12 5v14M5 12h14" strokeLinecap="round"/>,
  close:     <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round"/>,
  filter:    <path d="M3 6h18M6 12h12M10 18h4" strokeLinecap="round"/>,
  star:      'starfill',
  camera:    <><path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/><circle cx="12" cy="13" r="3.6"/></>,
  globe:     <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 010 18M12 3a13 13 0 000 18"/></>,
}

export function Icon({ name, size = 18, color = 'currentColor', stroke = 1.6 }: {
  name: string; size?: number; color?: string; stroke?: number
}) {
  const p = PATHS[name]
  if (p === 'heartfill') return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 20s-7-4.4-7-10a4.5 4.5 0 018-2.8A4.5 4.5 0 0119 10c0 5.6-7 10-7 10z"/></svg>
  if (p === 'starfill') return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2.5l3 6 6.5.9-4.7 4.5 1.1 6.5L12 17.4 6.1 20.4l1.1-6.5L2.5 9.4 9 8.5z"/></svg>
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round">
      {p}
    </svg>
  )
}

// ── Overlay wrapper ───────────────────────────────────────────────────────────
export function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,14,12,0.4)',
        backdropFilter: 'blur(6px)', overflow: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: T.bg, minHeight: '100vh', margin: '40px auto', maxWidth: 1280,
        borderRadius: 24, boxShadow: '0 30px 80px rgba(0,0,0,0.25)', overflow: 'hidden',
        position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20, zIndex: 5,
          width: 36, height: 36, borderRadius: 999,
          background: T.surface, border: '0.75px solid ' + T.border, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="close" size={16} color={T.text} />
        </button>
        {children}
      </div>
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
      <div>
        {eyebrow && (
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: T.textFaint, fontFamily: T.mono, marginBottom: 6 }}>
            {eyebrow}
          </div>
        )}
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4, margin: 0 }}>{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function pillBtn(active?: boolean) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 999,
    background: active ? T.text : T.surface, color: active ? T.bg : T.text,
    border: '0.75px solid ' + (active ? T.text : T.border), cursor: 'pointer',
    fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' as const, flexShrink: 0,
  }
}
