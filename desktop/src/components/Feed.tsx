import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { CONDITIONS } from '../data'
import { ItemImage, Avatar, VerifiedBadge, FreeTag, Icon, SectionHeader, T, ACCENT, pillBtn } from './ui'
import { TrustBand } from './HeroBand'
import type { Item, User } from '../types'

const PLACEHOLDER_USER: User = {
  name: 'Member', handle: '@user', school: '', schoolCn: '',
  eduVerified: true, localVerified: false, rating: 5, deals: 0,
  bio: '', bioCn: '', avatarColor: '#C8553D', avatarInitials: 'U',
}

const PAGE_SIZE = 8

export function Feed() {
  const { q, cat, loc, when, openItem, savedIds, toggleSave, listings } = useStore()
  const [page, setPage] = useState(1)

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1) }, [q, cat, loc, when])

  const filtered = listings.filter(it => {
    if (cat !== 'all' && it.cat !== cat) return false
    if (loc && !it.location.toLowerCase().includes(loc.split(',')[0].toLowerCase())) return false
    if (when && !it.pickup.toLowerCase().includes(when.toLowerCase()) && when !== 'Flexible') return false
    if (when === 'Flexible' && it.pickup !== 'Flexible') return false
    if (q && !(it.title + ' ' + it.location + ' ' + it.desc).toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  const featured = filtered.slice(0, 3)
  const rest = filtered.slice(3)
  const totalPages = Math.ceil(rest.length / PAGE_SIZE)
  const pageItems = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const locationLabel = loc || 'Allston, MA'

  return (
    <main style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 32px 80px' }}>
      {featured.length > 0 && (
        <>
          <SectionHeader eyebrow="Apartments closing · May 18 – 22" title="Picked for you" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 18 }}>
            {featured.map(it => (
              <ItemCard key={it.id} item={it} onOpen={() => openItem(it.id)} savedIds={savedIds} onSave={toggleSave} big />
            ))}
          </div>
        </>
      )}

      {rest.length > 0 && (
        <div style={{ marginTop: 56 }}>
          <SectionHeader
            eyebrow="All listings"
            title={`${filtered.length} items near ${locationLabel}`}
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={pillBtn()}>Sort · Newest</button>
                <button style={pillBtn()}>
                  <Icon name="pin" size={14} color={T.text} />
                  Map view
                </button>
              </div>
            }
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 18 }}>
            {pageItems.map(it => (
              <ItemCard key={it.id} item={it} onOpen={() => openItem(it.id)} savedIds={savedIds} onSave={toggleSave} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          )}
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: T.textMuted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No items found</div>
          <div style={{ fontSize: 14 }}>Try adjusting your search or filters</div>
        </div>
      )}

      <TrustBand />
    </main>
  )
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const pages: (number | '…')[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('…')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('…')
    pages.push(totalPages)
  }

  const btn = (label: string | number, active: boolean, disabled: boolean, onClick: () => void) => (
    <button
      key={String(label) + (active ? '-a' : '')}
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 36, height: 36, padding: '0 10px',
        borderRadius: 10,
        border: active ? 'none' : '0.75px solid ' + T.border,
        background: active ? T.text : disabled ? 'transparent' : T.surface,
        color: active ? T.bg : disabled ? T.textFaint : T.text,
        fontSize: 13, fontWeight: active ? 700 : 500,
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 40 }}>
      {btn('←', false, page === 1, () => onChange(page - 1))}
      {pages.map((p, i) =>
        p === '…'
          ? <span key={'ellipsis-' + i} style={{ padding: '0 4px', color: T.textFaint, fontSize: 13 }}>…</span>
          : btn(p, p === page, false, () => onChange(p as number))
      )}
      {btn('→', false, page === totalPages, () => onChange(page + 1))}
    </div>
  )
}

export function ItemCard({ item, onOpen, savedIds, onSave, big }: {
  item: Item; onOpen: () => void; savedIds: Set<string>; onSave: (id: string) => void; big?: boolean
}) {
  const usersByUid = useStore(s => s.usersByUid)
  const seller = usersByUid[item.seller] ?? PLACEHOLDER_USER
  const cond = CONDITIONS[item.condition]
  const isSaved = savedIds.has(item.id)

  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen()}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 16, transition: 'transform 0.18s' }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div style={{ position: 'relative' }}>
        <ItemImage item={item} aspect={big ? '1.4' : '1'} radius={16} />
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <VerifiedBadge kind="edu" />
        </div>
        <button
          onClick={e => { e.stopPropagation(); onSave(item.id) }}
          style={{ position: 'absolute', top: 8, right: 8, width: 34, height: 34, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Icon name={isSaved ? 'heartFill' : 'heart'} size={16} color={isSaved ? ACCENT : '#1A1A1A'} stroke={1.5} />
        </button>
        <div style={{ position: 'absolute', bottom: 8, right: 8, padding: '3px 8px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', borderRadius: 999, color: '#fff', fontSize: 10, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 0.4 }}>
          posted {item.posted}
        </div>
      </div>
      <div style={{ padding: '0 2px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: T.text }}>{item.title}</div>
          <FreeTag est={item.est} />
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, display: 'flex', gap: 6, alignItems: 'center' }}>
          <Avatar user={seller} size={16} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {seller.name} · {seller.school}
          </span>
        </div>
        <div style={{ fontSize: 11, color: T.textFaint, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 0.3 }}>
          {cond.en} · {item.location} · pickup {item.pickup}
        </div>
      </div>
    </div>
  )
}
