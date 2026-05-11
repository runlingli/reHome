import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { CATEGORIES, CONDITIONS } from '../data'
import { createListing, uploadListingPhoto, setListingImageUrl } from '../listings'
import { Overlay, Icon, T, ACCENT, EDU } from './ui'

function estimateValue(cat: string, cond: string, age: string): number {
  const base: Record<string, number> = {
    furniture: 250, kitchen: 60, appliance: 180, bike: 350, clothing: 90, household: 75,
  }
  const cMult: Record<string, number> = { new: 0.78, excellent: 0.62, good: 0.45, fair: 0.28 }
  const aMult: Record<string, number> = {
    '< 6 mo': 1.0, '6-12 mo': 0.9, '1 yr': 0.8, '2 yr': 0.7, '3+ yr': 0.6,
  }
  const b  = base[cat] ?? 100
  const cm = cMult[cond] ?? 0.6
  const am = aMult[age] ?? 0.75
  return Math.max(5, Math.round(b * cm * am))
}

interface PostData {
  photos: number
  title: string
  cat: string
  condition: string
  age: string
  pickup: string
  notes: string
}

const STEPS = ['Photos & title', 'Category & condition', 'Pickup window', 'Estimated value & post']

export function PostFlow() {
  const { overlay, closeOverlay, drafts } = useStore()
  if (overlay.kind !== 'post') return null
  const draftIdx = overlay.draftIdx
  const initialDraft = draftIdx !== undefined ? drafts[draftIdx] : undefined
  return <PostFlowInner onClose={closeOverlay} initialDraft={initialDraft} draftIdx={draftIdx} />
}

function PostFlowInner({ onClose, initialDraft, draftIdx }: {
  onClose: () => void
  initialDraft?: PostData
  draftIdx?: number
}) {
  const { saveDraft, updateDraft, deleteDraft } = useStore()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<PostData>(
    initialDraft ?? { photos: 0, title: '', cat: '', condition: 'excellent', age: '1 yr', pickup: 'Mid-May', notes: '' }
  )
  const [files, setFiles] = useState<File[]>([])
  const [askSave, setAskSave] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  // Keep data.photos in sync with the actual selected file count so the
  // draft + review screens see a real number.
  useEffect(() => { setData(d => ({ ...d, photos: files.length })) }, [files.length])

  const set = (k: keyof PostData, v: string | number) => setData(d => ({ ...d, [k]: v }))
  const dirty = files.length > 0 || !!data.title.trim() || !!data.notes.trim()

  const publish = async () => {
    setPublishError(null); setPublishing(true)
    try {
      const listingId = await createListing({
        title:     data.title || 'Untitled',
        category:  data.cat || 'household',
        condition: data.condition,
        estValue:  estimateValue(data.cat, data.condition, data.age),
        age:       data.age,
        pickup:    data.pickup,
        desc:      data.notes,
        location:  '',
      })

      // Upload photos to listings/{id}/{N}.jpg; first one becomes imageUrl.
      if (files.length > 0) {
        const urls = await Promise.all(files.map((f, i) => uploadListingPhoto(listingId, f, i)))
        if (urls[0]) await setListingImageUrl(listingId, urls[0])
      }

      if (draftIdx !== undefined) deleteDraft(draftIdx)
      onClose()
    } catch (e) {
      setPublishError((e as Error).message)
    } finally {
      setPublishing(false)
    }
  }

  const back = () => {
    if (step === 1) { if (dirty) { setAskSave(true); return }; onClose(); return }
    setStep(s => s - 1)
  }

  return (
    <Overlay onClose={() => { if (step === 1 && dirty) setAskSave(true); else onClose() }}>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: 620 }}>
        {/* Left rail */}
        <div style={{ background: T.surfaceAlt, padding: '32px 28px', borderRight: '0.5px solid ' + T.border }}>
          <button onClick={back} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: T.textMuted, marginBottom: 24 }}>
            <Icon name="back" size={13} color={T.textMuted} />
            Back
          </button>
          <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: T.textFaint, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            New listing · {step}/4
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3, margin: '8px 0 24px' }}>
            {STEPS[step - 1]}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {STEPS.map((s, i) => (
              <StepRow key={s} idx={i + 1} active={step === i + 1} done={step > i + 1} label={s} />
            ))}
          </div>
          <div style={{ marginTop: 32, padding: 14, background: T.surface, borderRadius: 12, border: '0.75px solid ' + T.border }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Icon name="shield" size={14} color={EDU.color} />
              <span style={{ fontSize: 11, fontWeight: 600, color: EDU.color }}>{EDU.label}</span>
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>
              Posting as <b style={{ color: T.text }}>@you.edu · BU</b>. Listings carry your verified badge.
            </div>
          </div>
        </div>

        {/* Right body */}
        <div style={{ padding: '32px 44px 100px', position: 'relative' }}>
          {step === 1 && <PostStep1 data={data} set={set} files={files} setFiles={setFiles} />}
          {step === 2 && <PostStep2 data={data} set={set} />}
          {step === 3 && <PostStep3 data={data} set={set} />}
          {step === 4 && <PostStep4 data={data} />}

          {/* Bottom bar */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '16px 44px', borderTop: '0.5px solid ' + T.border, background: T.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={back} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid ' + T.border, borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: T.text }}>
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} style={{ padding: '12px 20px', background: T.text, color: T.bg, border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Continue
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {publishError && (
                  <span style={{ fontSize: 12, color: '#C0392B' }}>{publishError}</span>
                )}
                <button
                  onClick={publish}
                  disabled={publishing}
                  style={{ padding: '12px 22px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 10, cursor: publishing ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, opacity: publishing ? 0.7 : 1 }}
                >
                  {publishing ? 'Publishing…' : 'Publish · free for everyone'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {askSave && (
        <SaveDraftDialog
          onKeep={() => {
            if (draftIdx !== undefined) updateDraft(draftIdx, data)
            else saveDraft(data)
            setAskSave(false)
            onClose()
          }}
          onDiscard={() => { setAskSave(false); onClose() }}
          onCancel={() => setAskSave(false)}
        />
      )}
    </Overlay>
  )
}

function StepRow({ idx, active, done, label }: { idx: number; active: boolean; done: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', fontSize: 13, color: active ? T.text : done ? T.textMuted : T.textFaint, fontWeight: active ? 600 : 500 }}>
      <div style={{ width: 22, height: 22, borderRadius: 999, flexShrink: 0, background: done ? ACCENT : active ? T.text : 'transparent', color: done || active ? '#fff' : T.textFaint, border: done || active ? 'none' : '1.5px solid ' + T.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
        {done ? <Icon name="check" size={11} color="#fff" stroke={2.4} /> : idx}
      </div>
      {label}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: '"JetBrains Mono", monospace' }}>{children}</div>
}

function inputStyle(): React.CSSProperties {
  return { width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid ' + T.border, background: T.surface, color: T.text, fontSize: 15, outline: 'none' }
}

function PostStep1({ data, set, files, setFiles }: {
  data: PostData
  set: (k: keyof PostData, v: string | number) => void
  files: File[]
  setFiles: React.Dispatch<React.SetStateAction<File[]>>
}) {
  // Stable object URLs for previews; revoked when files change/unmount.
  const [previews, setPreviews] = useState<string[]>([])
  useEffect(() => {
    const urls = files.map(f => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach(URL.revokeObjectURL)
  }, [files])

  const onPick: React.ChangeEventHandler<HTMLInputElement> = e => {
    const incoming = Array.from(e.target.files ?? []).filter(f => f.type.startsWith('image/'))
    if (incoming.length === 0) return
    setFiles(prev => [...prev, ...incoming].slice(0, 4))
    e.target.value = ''  // allow re-selecting the same file later
  }
  const removeAt = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 640 }}>
      <FieldLabel>Photos · 1–4</FieldLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[0,1,2,3].map(i => {
          const url = previews[i]
          if (url) {
            return (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', background: T.surfaceAlt, border: '0.75px solid ' + T.border }}>
                <img src={url} alt={`photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <button
                  onClick={() => removeAt(i)}
                  aria-label="Remove"
                  style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 999, border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}
                >
                  ×
                </button>
              </div>
            )
          }
          // Open the picker on the FIRST empty slot only — extras are decorative.
          const isFirstEmpty = i === files.length
          return (
            <label
              key={i}
              style={{
                aspectRatio: '1', borderRadius: 12,
                cursor: isFirstEmpty ? 'pointer' : 'default',
                background: 'transparent',
                border: '1.5px dashed ' + T.border,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isFirstEmpty ? 1 : 0.5,
              }}
            >
              <Icon name={isFirstEmpty ? 'plus' : 'camera'} size={22} color={T.textMuted} />
              {isFirstEmpty && (
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onPick}
                  style={{ display: 'none' }}
                />
              )}
            </label>
          )
        })}
      </div>
      <FieldLabel>Title</FieldLabel>
      <input value={data.title} onChange={e => set('title', e.target.value)} placeholder="e.g. IKEA Malm desk · white" style={inputStyle()} />
      <FieldLabel>Description</FieldLabel>
      <textarea value={data.notes} onChange={e => set('notes', e.target.value)} rows={5} placeholder="Brand, age, any quirks, pickup notes…" style={{ ...inputStyle(), resize: 'vertical', minHeight: 120 }} />
    </div>
  )
}

function PostStep2({ data, set }: { data: PostData; set: (k: keyof PostData, v: string | number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 640 }}>
      <div>
        <FieldLabel>Category</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
          {CATEGORIES.filter(c => c.id !== 'all').map(c => (
            <button key={c.id} onClick={() => set('cat', c.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left', background: data.cat === c.id ? T.surface : 'transparent', border: '1.5px solid ' + (data.cat === c.id ? T.text : T.border) }}>
              <span style={{ fontSize: 18 }}>{c.glyph}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{c.en}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Condition</FieldLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {Object.entries(CONDITIONS).map(([k, v]) => (
            <button key={k} onClick={() => set('condition', k)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 12, cursor: 'pointer', background: data.condition === k ? T.surface : 'transparent', border: '1.5px solid ' + (data.condition === k ? T.text : T.border), textAlign: 'left' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{v.en}</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2, fontFamily: '"JetBrains Mono", monospace' }}>est. {Math.round(v.factor * 100)}% of retail</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: 999, background: data.condition === k ? T.text : 'transparent', border: '1.5px solid ' + (data.condition === k ? T.text : T.border), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {data.condition === k && <Icon name="check" size={11} color="#fff" stroke={2.4} />}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>How long owned</FieldLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {['< 6 mo', '6-12 mo', '1 yr', '2 yr', '3+ yr'].map(opt => (
            <button key={opt} onClick={() => set('age', opt)} style={{ padding: '8px 14px', borderRadius: 999, background: data.age === opt ? T.text : 'transparent', color: data.age === opt ? T.bg : T.textMuted, border: '0.75px solid ' + (data.age === opt ? T.text : T.border), fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

function PostStep3({ data, set }: { data: PostData; set: (k: keyof PostData, v: string | number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 640 }}>
      <div>
        <FieldLabel>Pickup window</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
          {['Mid-May', 'May 18 – 22', 'May 23 – 28', 'May 29 – Jun 2', 'Flexible'].map(opt => (
            <button key={opt} onClick={() => set('pickup', opt)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px', borderRadius: 12, cursor: 'pointer', background: data.pickup === opt ? T.surface : 'transparent', border: '1.5px solid ' + (data.pickup === opt ? T.text : T.border), textAlign: 'left' }}>
              <Icon name="pin" size={15} color={T.textMuted} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{opt}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Pickup spot</FieldLabel>
        <div style={{ ...inputStyle(), display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="pin" size={15} color={T.textMuted} />
          <span style={{ fontSize: 14 }}>104 Brighton Ave, Allston, MA</span>
        </div>
        <div style={{ fontSize: 11, color: T.textFaint, marginTop: 6, fontFamily: '"JetBrains Mono", monospace' }}>
          Exact address only shared after pickup is agreed.
        </div>
      </div>
    </div>
  )
}

function PostStep4({ data }: { data: PostData }) {
  const factor = CONDITIONS[data.condition]?.factor ?? 0.45
  const base = data.title.length > 12 ? 180 : data.title.length > 6 ? 90 : 45
  const est = Math.max(15, Math.round(base * factor / 5) * 5)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 640 }}>
      <div style={{ padding: 22, borderRadius: 18, background: ACCENT, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 0.6, textTransform: 'uppercase', opacity: 0.85 }}>Estimated retail value</div>
        <div style={{ fontSize: 44, fontWeight: 800, marginTop: 6, letterSpacing: -0.6 }}>${est}</div>
        <div style={{ fontSize: 13, marginTop: 6, opacity: 0.9, lineHeight: 1.55, maxWidth: 460 }}>
          Surfaced beside <b>Free</b> on every card so receivers can see the worth of your hand-off.
        </div>
      </div>
      <FieldLabel>Final review</FieldLabel>
      <div style={{ background: T.surface, borderRadius: 14, border: '0.75px solid ' + T.border, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
        <ReviewRow label="Title"     value={data.title || '—'} />
        <ReviewRow label="Category"  value={data.cat || '—'} />
        <ReviewRow label="Condition" value={CONDITIONS[data.condition]?.en ?? '—'} />
        <ReviewRow label="Pickup"    value={data.pickup} />
        <ReviewRow label="Photos"    value={data.photos + ' / 4'} />
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: T.textMuted }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function SaveDraftDialog({ onKeep, onDiscard, onCancel }: { onKeep: () => void; onDiscard: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,14,12,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: T.surface, borderRadius: 18, width: 420, maxWidth: '90vw', padding: 26, boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Save this listing as a draft?</div>
        <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.55 }}>
          You've added photos or details. Keep them in <b>My drafts</b> to finish posting later.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 22, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '10px 14px', background: 'transparent', border: '1px solid ' + T.border, borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Keep editing</button>
          <button onClick={onDiscard} style={{ padding: '10px 14px', background: 'transparent', border: '1px solid ' + T.border, borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: T.textMuted }}>Discard</button>
          <button onClick={onKeep} style={{ padding: '10px 16px', background: T.text, color: T.bg, border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Save draft</button>
        </div>
      </div>
    </div>
  )
}
