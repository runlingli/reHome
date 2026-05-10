import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store'
import { CATEGORIES, USERS, LOCATIONS, WHEN_OPTIONS } from '../data'
import { Logo, Icon, Avatar, VerifiedBadge, T, ACCENT, pillBtn } from './ui'

export function Header() {
  const { q, setQ, cat, setCat, loc, setLoc, when, setWhen, role, switchRole, openPost, openMessages, openProfile } = useStore()
  const [activeDropdown, setActiveDropdown] = useState<'where' | 'when' | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const pillRef = useRef<HTMLDivElement>(null)
  const totalUnread = 3

  const pillFocused = activeDropdown !== null

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(250,248,245,0.88)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '0.5px solid ' + T.border,
    }}>
      {/* Top row */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 24 }}>
        <a href="#"><Logo size={24} /></a>

        {/* Search pill */}
        <div ref={pillRef} style={{ position: 'relative', display: 'flex', flex: 1, maxWidth: 660 }}>
          <div style={{
            display: 'flex', alignItems: 'stretch', width: '100%',
            background: T.surface, borderRadius: 999,
            border: '0.75px solid ' + T.border,
            boxShadow: pillFocused ? '0 6px 20px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.03)',
            transition: 'box-shadow 0.18s',
          }}>
            {/* Search */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: '1 1 200px', padding: '8px 18px' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.text, letterSpacing: 0.1 }}>Search</span>
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                onFocus={() => setActiveDropdown(null)}
                placeholder="Desk, Trek, kitchen…"
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: T.text, padding: 0, marginTop: 1 }}
              />
            </div>

            <SegDivider />

            {/* Where */}
            <button
              onClick={() => setActiveDropdown(d => d === 'where' ? null : 'where')}
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                flex: '0 1 160px', padding: '8px 18px', textAlign: 'left',
                background: activeDropdown === 'where' ? '#F6F2E9' : 'transparent',
                border: 'none', borderRadius: 0, cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: T.text, letterSpacing: 0.1 }}>Where</span>
              <span style={{ fontSize: 13, color: loc ? T.text : T.textMuted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: loc ? 500 : 400 }}>
                {loc || 'All areas'}
              </span>
            </button>

            <SegDivider />

            {/* When */}
            <button
              onClick={() => setActiveDropdown(d => d === 'when' ? null : 'when')}
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                flex: '0 1 160px', padding: '8px 18px', textAlign: 'left',
                background: activeDropdown === 'when' ? '#F6F2E9' : 'transparent',
                border: 'none', borderRadius: 0, cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: T.text, letterSpacing: 0.1 }}>When</span>
              <span style={{ fontSize: 13, color: when ? T.text : T.textMuted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: when ? 500 : 400 }}>
                {when || 'Any time'}
              </span>
            </button>

            {/* Search button */}
            <button
              onClick={() => setActiveDropdown(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 5, padding: '0 18px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 600, flexShrink: 0 }}
            >
              <Icon name="search" size={15} color="#fff" stroke={2.2} />
              Search
            </button>
          </div>

          {/* Where dropdown */}
          {activeDropdown === 'where' && (
            <div style={{ position: 'absolute', top: 'calc(100% + 12px)', left: '33%', width: 280, background: T.surface, borderRadius: 20, border: '0.75px solid ' + T.border, boxShadow: '0 16px 40px rgba(0,0,0,0.12)', padding: 20, zIndex: 60 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textFaint, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12, fontFamily: '"JetBrains Mono", monospace' }}>
                Neighborhood
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <DropdownOption
                  label="All areas"
                  active={loc === ''}
                  onClick={() => { setLoc(''); setActiveDropdown(null) }}
                />
                {LOCATIONS.map(l => (
                  <DropdownOption key={l} label={l} active={loc === l} onClick={() => { setLoc(l); setActiveDropdown(null) }} />
                ))}
              </div>
            </div>
          )}

          {/* When dropdown */}
          {activeDropdown === 'when' && (
            <div style={{ position: 'absolute', top: 'calc(100% + 12px)', left: '55%', width: 260, background: T.surface, borderRadius: 20, border: '0.75px solid ' + T.border, boxShadow: '0 16px 40px rgba(0,0,0,0.12)', padding: 20, zIndex: 60 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textFaint, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12, fontFamily: '"JetBrains Mono", monospace' }}>
                Pickup window
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <DropdownOption label="Any time" active={when === ''} onClick={() => { setWhen(''); setActiveDropdown(null) }} />
                {WHEN_OPTIONS.map(w => (
                  <DropdownOption key={w} label={w} active={when === w} onClick={() => { setWhen(w); setActiveDropdown(null) }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', position: 'relative' }}>
          <button onClick={openPost} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 999, background: T.text, color: T.bg, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            <Icon name="plus" size={14} color={T.bg} stroke={2.4} />
            Post item
          </button>
          <NavIconBtn onClick={openMessages} icon="chat" badge={totalUnread} />
          <NavIconBtn icon="bell" />
          <button onClick={() => setAccountOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px 4px 12px', borderRadius: 999, background: T.surface, border: '0.75px solid ' + T.border, cursor: 'pointer' }}>
            <Icon name="filter" size={14} color={T.text} />
            <Avatar user={USERS[role === 'student' ? 'me_student' : 'me_local']} size={28} />
          </button>
          {accountOpen && (
            <AccountMenu role={role} switchRole={switchRole} openProfile={openProfile} onClose={() => setAccountOpen(false)} />
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {(loc || when) && (
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 32px 10px', display: 'flex', gap: 8 }}>
          {loc && (
            <FilterChip label={loc} onRemove={() => setLoc('')} />
          )}
          {when && (
            <FilterChip label={when} onRemove={() => setWhen('')} />
          )}
        </div>
      )}

      {/* Category strip */}
      <div style={{ borderTop: '0.5px solid ' + T.borderSubtle, background: 'rgba(255,255,255,0.4)' }}>
        <div className="scroll-x" style={{ maxWidth: 1320, margin: '0 auto', padding: '12px 32px', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 999,
              background: cat === c.id ? T.text : 'transparent',
              color: cat === c.id ? T.bg : T.textMuted,
              border: '0.75px solid ' + (cat === c.id ? T.text : T.border),
              cursor: 'pointer', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              <span style={{ opacity: 0.85 }}>{c.glyph}</span>
              {c.en}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button style={pillBtn()}>
            <Icon name="filter" size={14} color={T.text} />
            More filters
          </button>
        </div>
      </div>
    </header>
  )
}

function DropdownOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', borderRadius: 12,
      background: active ? T.surfaceAlt : 'transparent',
      border: 'none', cursor: 'pointer', fontSize: 14,
      color: active ? T.text : T.textMuted, fontWeight: active ? 600 : 400,
      textAlign: 'left', width: '100%',
      transition: 'background 0.12s',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F6F2E9' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {label}
      {active && <Icon name="check" size={14} color={ACCENT} stroke={2.4} />}
    </button>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 12px', borderRadius: 999, background: T.text, color: T.bg, fontSize: 12, fontWeight: 500 }}>
      {label}
      <button onClick={onRemove} style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 0 }}>
        <Icon name="close" size={12} color="rgba(255,255,255,0.8)" stroke={2} />
      </button>
    </span>
  )
}

function SegDivider() {
  return <div style={{ width: 0.5, background: T.border, margin: '10px 0', flexShrink: 0 }} />
}

function NavIconBtn({ icon, onClick, badge }: { icon: string; onClick?: () => void; badge?: number }) {
  return (
    <button onClick={onClick} style={{ width: 40, height: 40, borderRadius: 999, position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={18} color={T.text} />
      {badge != null && badge > 0 && (
        <span style={{ position: 'absolute', top: 6, right: 4, minWidth: 16, height: 16, padding: '0 4px', background: ACCENT, color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>
      )}
    </button>
  )
}

function AccountMenu({ role, switchRole, openProfile, onClose }: { role: string; switchRole: () => void; openProfile: () => void; onClose: () => void }) {
  const me = USERS[role === 'student' ? 'me_student' : 'me_local']
  return (
    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 260, background: T.surface, borderRadius: 14, border: '0.75px solid ' + T.border, boxShadow: '0 16px 40px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 60 }}>
      <div style={{ padding: '14px 16px', borderBottom: '0.5px solid ' + T.border, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar user={me} size={36} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{me.name}</div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{me.handle}</div>
        </div>
      </div>
      <div style={{ padding: '6px 8px' }}>
        {role === 'student' ? (
          <div style={{ padding: '8px 8px 4px' }}><VerifiedBadge kind="edu" /></div>
        ) : (
          <div style={{ padding: '8px 8px 4px' }}><VerifiedBadge kind="local" /></div>
        )}
        <MenuRow icon="filter" label="My listings" onClick={() => { openProfile(); onClose() }} />
        <MenuRow icon="heart"  label="Saved" />
        <MenuRow icon="chat"   label="Messages" />
        <MenuRow icon="shield" label="Verifications" />
        <div style={{ height: 0.5, background: T.border, margin: '4px 0' }} />
        <MenuRow icon="globe" label={`Switch role · ${role === 'student' ? 'Local' : 'Student'}`} onClick={() => { switchRole(); onClose() }} />
        <MenuRow icon="globe" label="Help & guidelines" />
        <MenuRow icon="back"  label="Sign out" />
      </div>
    </div>
  )
}

function MenuRow({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 8px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: T.text, textAlign: 'left', borderRadius: 8 }}>
      <Icon name={icon} size={15} color={T.textMuted} />
      {label}
    </button>
  )
}
