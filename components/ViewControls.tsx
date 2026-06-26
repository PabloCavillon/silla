'use client'

// ─── View presets ─────────────────────────────────────────────────────────────
// Target: aproximadamente el centro del asiento (y ≈ 0.42 m)
// Positions calibrated for a chair ~0.47 m wide × 0.84 m tall

export type ViewKey = 'FRONTAL' | 'LATERAL' | 'POSTERIOR' | 'SUPERIOR' | '3/4'

export const VIEW_PRESETS: Record<
  ViewKey,
  { label: string; position: [number, number, number]; target: [number, number, number] }
> = {
  FRONTAL:   { label: 'Frontal',   position: [0,    0.45, 1.6],  target: [0, 0.42, 0] },
  LATERAL:   { label: 'Lateral',   position: [1.6,  0.45, 0],    target: [0, 0.42, 0] },
  POSTERIOR: { label: 'Posterior', position: [0,    0.5, -1.6],  target: [0, 0.42, 0] },
  SUPERIOR:  { label: 'Superior',  position: [0,    1.8,  0.01], target: [0, 0.42, 0] },
  '3/4':     { label: '3/4',       position: [1.0,  0.8,  1.2],  target: [0, 0.42, 0] },
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ViewControlsProps {
  activeView: ViewKey
  onViewChange: (key: ViewKey) => void
  autoRotate: boolean
  onAutoRotateToggle: () => void
  darkBg: boolean
  onDarkBgToggle: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ViewControls({
  activeView,
  onViewChange,
  autoRotate,
  onAutoRotateToggle,
  darkBg,
  onDarkBgToggle,
}: ViewControlsProps) {
  const textMuted = darkBg ? 'text-stone-400' : 'text-stone-500'
  const btnBase =
    'px-4 py-2 text-[10px] tracking-[2px] uppercase border transition-colors duration-150 cursor-pointer'
  const btnActive = 'bg-stone-800 text-white border-stone-800'
  const btnIdle = darkBg
    ? 'bg-stone-900/70 text-stone-300 border-stone-600 hover:bg-stone-700'
    : 'bg-white/70 text-stone-700 border-stone-300 hover:bg-white'
  const toggleBtn = darkBg
    ? 'bg-stone-900/70 text-stone-300 border-stone-600 hover:bg-stone-700'
    : 'bg-white/70 text-stone-700 border-stone-300 hover:bg-white'

  return (
    // Full-bleed overlay; only interactive children capture pointer events
    <div className="absolute inset-0 pointer-events-none">

      {/* ── Active-view label (top-center) ─────────────────────────────────── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <span className={`text-[10px] tracking-[5px] uppercase ${textMuted}`}>
          Vista · {VIEW_PRESETS[activeView].label}
        </span>
      </div>

      {/* ── Utility toggles (top-right) ────────────────────────────────────── */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={onAutoRotateToggle}
          className={`${btnBase} ${toggleBtn} backdrop-blur-sm`}
        >
          {autoRotate ? '⏸ Pausar' : '▶ Auto'}
        </button>
        <button
          onClick={onDarkBgToggle}
          className={`${btnBase} ${toggleBtn} backdrop-blur-sm`}
        >
          {darkBg ? '☀ Claro' : '☾ Oscuro'}
        </button>
      </div>

      {/* ── View buttons (bottom-center) ────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
        {(Object.keys(VIEW_PRESETS) as ViewKey[]).map((key) => (
          <button
            key={key}
            onClick={() => onViewChange(key)}
            className={`${btnBase} backdrop-blur-sm ${
              activeView === key ? btnActive : btnIdle
            }`}
          >
            {VIEW_PRESETS[key].label}
          </button>
        ))}
      </div>

    </div>
  )
}
