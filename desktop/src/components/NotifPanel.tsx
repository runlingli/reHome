import { useStore } from '../store'
import { CATEGORIES } from '../data'
import { Icon, T, ACCENT } from './ui'

interface Notif {
  id: string
  icon: string
  title: string
  sub: string
  time: string
  read: boolean
}

const NOTIFS: Notif[] = [
  { id: 'n1', icon: 'furniture', title: 'New listing: Flexispot E2 standing desk', sub: 'Cambridge, MA · Furniture · est. $360', time: '2h ago', read: false },
  { id: 'n2', icon: 'appliance', title: 'New listing: Zojirushi rice cooker 5.5 cup', sub: 'Allston, MA · Appliances · est. $160', time: '4h ago', read: false },
  { id: 'n3', icon: 'chat',      title: 'Emma L. replied to your message', sub: 'Re: IKEA Malm desk · "Saturday at 2 works!"', time: '1d ago', read: true },
  { id: 'n4', icon: 'furniture', title: 'New listing: Steelcase Series 1 chair', sub: 'Brookline, MA · Furniture · est. $380', time: '2d ago', read: true },
  { id: 'n5', icon: 'bell',      title: 'May move-out wave is opening', sub: 'Allston & Cambridge · May 18 – 22 pickup window', time: '3d ago', read: true },
]

const CAT_GLYPHS: Record<string, string> = {
  furniture: '▦', kitchen: '◍', appliance: '◉', bike: '◷', clothing: '◇', household: '○',
}

export function NotifPanel() {
  const { notifOpen, closeNotif, notifPrefs, toggleNotifPref } = useStore()
  if (!notifOpen) return null

  const unread = NOTIFS.filter(n => !n.read).length

  return (
    <>
      <div
        onClick={closeNotif}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 110, backdropFilter: 'blur(2px)' }}
      />
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 400,
        background: T.bg, zIndex: 111,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-12px 0 40px rgba(0,0,0,0.1)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '0.5px solid ' + T.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Notifications</div>
            {unread > 0 && (
              <div style={{ fontSize: 11, color: ACCENT, fontWeight: 600, marginTop: 2 }}>{unread} new</div>
            )}
          </div>
          <button
            onClick={closeNotif}
            style={{ width: 32, height: 32, borderRadius: 999, border: '0.75px solid ' + T.border, background: T.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="close" size={14} color={T.textMuted} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 32px' }}>

          {/* Notification list */}
          <div style={{ paddingTop: 16 }}>
            {NOTIFS.map(n => (
              <div
                key={n.id}
                style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '0.5px solid ' + T.borderSubtle, cursor: 'pointer', position: 'relative' }}
              >
                {!n.read && (
                  <div style={{ position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: 999, background: ACCENT }} />
                )}
                <div style={{ width: 36, height: 36, borderRadius: 10, background: n.read ? T.surfaceAlt : ACCENT + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
                  {CAT_GLYPHS[n.icon] ?? <Icon name={n.icon === 'chat' ? 'chat' : 'bell'} size={16} color={n.read ? T.textMuted : ACCENT} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: T.text, lineHeight: 1.4 }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2, lineHeight: 1.4 }}>{n.sub}</div>
                  <div style={{ fontSize: 11, color: T.textFaint, marginTop: 4, fontFamily: '"JetBrains Mono", monospace' }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 0.5, background: T.border, margin: '28px 0 24px' }} />

          {/* Email preferences */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Email preferences</div>
            <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, marginBottom: 20 }}>
              Get an email when new items in these categories are posted near you.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                const on = notifPrefs.has(cat.id)
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleNotifPref(cat.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 12, border: '0.75px solid ' + (on ? ACCENT + '40' : T.border), background: on ? ACCENT + '08' : T.surface, cursor: 'pointer', transition: 'all 0.15s' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16, opacity: 0.8 }}>{cat.glyph}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{cat.en}</span>
                    </div>
                    <Toggle on={on} />
                  </button>
                )
              })}
            </div>

            <div style={{ marginTop: 20, padding: '14px 16px', background: T.surfaceAlt, borderRadius: 12, fontSize: 12, color: T.textMuted, lineHeight: 1.6 }}>
              <Icon name="shield" size={12} color={T.textFaint} />
              {' '}Emails are sent to your registered address. You can unsubscribe any time.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Toggle({ on }: { on: boolean }) {
  return (
    <div style={{ width: 36, height: 20, borderRadius: 999, background: on ? ACCENT : T.border, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 19 : 3, width: 14, height: 14, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
    </div>
  )
}
