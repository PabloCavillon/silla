'use client'

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type Ref,
  type RefObject,
} from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, ContactShadows, CameraControls, CameraControlsImpl } from '@react-three/drei'
import { WebGLRenderer, SRGBColorSpace } from 'three'
import Chair from './Chair'
import ViewControls, { VIEW_PRESETS, type ViewKey } from './ViewControls'

// ─── Auto-rotation ────────────────────────────────────────────────────────────
// camera-controls has no built-in autoRotate; we drive it with useFrame.
function AutoRotate({
  enabled,
  controlsRef,
}: {
  enabled: boolean
  controlsRef: RefObject<CameraControlsImpl | null>
}) {
  useFrame((_state, delta) => {
    if (!enabled) return
    controlsRef.current?.rotate(0.25 * delta, 0, false) // ~14°/s
  })
  return null
}

// ─── Main viewer ──────────────────────────────────────────────────────────────

export default function ChairViewer() {
  const controlsRef = useRef<CameraControlsImpl | null>(null)

  // We store the renderer and its event handlers so the useEffect cleanup
  // can remove the listeners and force-release the GPU context on unmount.
  const glRef = useRef<WebGLRenderer | null>(null)
  const handlersRef = useRef<{
    lost: (e: Event) => void
    restored: () => void
  } | null>(null)

  const [activeView, setActiveView] = useState<ViewKey>('3/4')
  const [autoRotate, setAutoRotate] = useState(false)
  const [darkBg, setDarkBg] = useState(false)
  const [contextLost, setContextLost] = useState(false)

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  // This is the primary fix for HMR-induced context exhaustion:
  // every hot reload unmounts the component; without this cleanup the old
  // WebGL context is never released and Chrome's per-page limit (~16) is hit.
  useEffect(() => {
    return () => {
      const gl = glRef.current
      const handlers = handlersRef.current

      if (!gl) return

      // Remove our listeners first so forceContextLoss() doesn't call setContextLost
      if (handlers) {
        gl.domElement.removeEventListener('webglcontextlost', handlers.lost, false)
        gl.domElement.removeEventListener('webglcontextrestored', handlers.restored, false)
      }

      try {
        gl.forceContextLoss() // tells the GPU driver to release this context slot
        gl.dispose()          // frees Three.js internal allocations
      } catch {
        // Non-fatal: context might already be gone
      }

      glRef.current = null
      handlersRef.current = null
    }
  }, [])

  const bg = darkBg ? '#1c1c1e' : '#eceae6'

  function goToView(key: ViewKey) {
    const { position, target } = VIEW_PRESETS[key]
    const [px, py, pz] = position
    const [tx, ty, tz] = target
    controlsRef.current?.setLookAt(px, py, pz, tx, ty, tz, true) // true = animate
    setActiveView(key)
  }

  return (
    <div className="relative w-screen h-screen" style={{ background: bg }}>

      {/* ── Three.js canvas ──────────────────────────────────────────────── */}
      <Canvas
        shadows="soft"
        camera={{ fov: 40, position: [1.0, 0.8, 1.2] }}

        // Use a factory function so we can pass WebGLRendererParameters
        // (antialias, powerPreference, failIfMajorPerformanceCaveat) that are
        // constructor-only and not settable as renderer properties.
        gl={(params) =>
          new WebGLRenderer({
            ...params,
            antialias: true,
            powerPreference: 'high-performance',
            // Don't fail if the driver reports a non-ideal GPU config —
            // still attempt hardware rendering
            failIfMajorPerformanceCaveat: false,
          })
        }

        // Clamp pixel ratio to 2; retina screens at 3–4× push 4× fill-rate
        dpr={[1, 2]}

        onCreated={({ gl, setFrameloop }) => {
          // ── Store renderer ref for cleanup ──────────────────────────────
          glRef.current = gl

          // Explicit sRGB output — ensures GLB textures (base color, etc.)
          // are gamma-corrected correctly; without this wood can look too dark.
          gl.outputColorSpace = SRGBColorSpace

          // R3F v9 defaults to ACESFilmic tone mapping; just tune the exposure
          gl.toneMappingExposure = 1.05

          // ── Context-loss listeners ──────────────────────────────────────
          // Registered synchronously here (not in a useEffect) so there is
          // zero window between canvas creation and protection.
          const canvas = gl.domElement

          const handlers = {
            lost: (event: Event) => {
              // CRITICAL — without preventDefault() the browser finalises the
              // loss and the context can never be restored
              event.preventDefault()
              setFrameloop('never')   // stop R3F's rAF loop
              setContextLost(true)
            },
            restored: () => {
              // Three.js resets its internal state automatically;
              // we just need to resume the render loop
              setFrameloop('always')
              setContextLost(false)
            },
          }

          handlersRef.current = handlers
          canvas.addEventListener('webglcontextlost', handlers.lost, false)
          canvas.addEventListener('webglcontextrestored', handlers.restored, false)
        }}

        style={{ width: '100%', height: '100%' }}
      >
        {/* Reactive background colour */}
        <color attach="background" args={[bg]} />

        {/* ── Lighting ─────────────────────────────────────────────────── */}
        <ambientLight intensity={0.35} />

        <directionalLight
          position={[3, 5, 4]}
          intensity={1.0}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={0.1}
          shadow-camera-far={20}
          shadow-camera-left={-2}
          shadow-camera-right={2}
          shadow-camera-top={3}
          shadow-camera-bottom={-1}
        />

        {/* Studio IBL for PBR — intensity reduced so matte black metal
            doesn't turn mirror-chrome; wood base color dominates correctly */}
        <Environment preset="studio" environmentIntensity={0.45} />

        {/* ── Model ────────────────────────────────────────────────────── */}
        <Suspense fallback={null}>
          <Chair />
        </Suspense>

        {/* ── Floor shadow ─────────────────────────────────────────────── */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.5}
          scale={2.5}
          blur={2.2}
          far={1.5}
        />

        {/* ── Controls ─────────────────────────────────────────────────── */}
        {/* Cast: React 19 produces RefObject<T|null>; drei expects RefObject<T> */}
        <CameraControls ref={controlsRef as Ref<CameraControlsImpl>} makeDefault />
        <AutoRotate enabled={autoRotate} controlsRef={controlsRef} />
      </Canvas>

      {/* ── WebGL context-lost overlay ───────────────────────────────────── */}
      {contextLost && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <p className="mb-6 text-xs uppercase tracking-[4px] text-white">
            Se perdió el contexto gráfico
          </p>
          <button
            onClick={() => window.location.reload()}
            className="cursor-pointer bg-white px-6 py-2.5 text-[10px] uppercase tracking-[3px] text-stone-900 transition-colors hover:bg-stone-100"
          >
            Recargar página
          </button>
        </div>
      )}

      {/* ── View controls ────────────────────────────────────────────────── */}
      <ViewControls
        activeView={activeView}
        onViewChange={goToView}
        autoRotate={autoRotate}
        onAutoRotateToggle={() => setAutoRotate((v) => !v)}
        darkBg={darkBg}
        onDarkBgToggle={() => setDarkBg((v) => !v)}
      />
    </div>
  )
}
