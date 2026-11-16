import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MathUtils, PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { Device, SPACING } from './Device'

/**
 * Reflections for the metal phone bodies, built in code: a PMREM of three's
 * procedural RoomEnvironment. It replaced drei's <Environment preset>, which
 * downloaded a 1.7MB HDR from GitHub on every visit and pulled in HDR loaders.
 */
function StudioEnv({ isDark }) {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const env = pmrem.fromScene(room, 0.04).texture
    scene.environment = env
    return () => {
      scene.environment = null
      env.dispose()
      room.dispose?.()
      pmrem.dispose()
    }
  }, [gl, scene])
  useEffect(() => { scene.environmentIntensity = isDark ? 0.35 : 0.8 }, [scene, isDark])
  return null
}

/** The rail slides so that `railPos` sits at the origin. */
/**
 * Keeps the rail out of the copy's way: pushed right on wide screens, lifted
 * above the text on narrow ones. Without this the headline sits on top of a
 * lit phone screen and neither is readable.
 */
function useRailTransform() {
  const { size } = useThree()
  if (size.width >= 1024) return { position: [1.15, 0, 0], scale: 1 }
  if (size.width >= 768) return { position: [0.9, 0.35, 0], scale: 0.9 }
  if (size.height < 720) return { position: [0, 1.5, 0], scale: 0.62 }
  return { position: [0, 1.15, 0], scale: 0.78 }
}

function Rail({ items, railPos, isDark, reduced, onSelect }) {
  const t = useRailTransform()
  const RAIL_Y = -1.32 // just under the devices
  // Link geometry is fixed in rail space; the group below slides instead, so
  // scrolling never rebuilds a buffer — only each link's opacity changes.
  const links = useMemo(
    () => items.slice(0, -1).map((_, i) => new Float32Array([i * SPACING, RAIL_Y, 0, (i + 1) * SPACING, RAIL_Y, 0])),
    [items]
  )

  return (
    <group position={t.position} scale={t.scale}>
      {/* Signature: a local mesh. The devices are linked, not floating in a void —
          which is the actual through-line of the work (offline-first, local network). */}
      <group position={[-railPos * SPACING, 0, 0]}>
        {links.map((pts, i) => (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[pts, 3]} />
            </bufferGeometry>
            <lineBasicMaterial
              color={isDark ? '#35D08A' : '#0D6D45'}
              transparent
              opacity={Math.max(0, 0.5 - Math.abs(i + 0.5 - railPos) * 0.12)}
            />
          </line>
        ))}
      </group>
      {/* Nodes: one per project, brightest at the centred device. */}
      {items.map((p, i) => {
        const d = Math.abs(i - railPos)
        if (d > 4.5) return null
        const on = d < 0.5
        return (
          <mesh key={`n-${p.id}`} position={[(i - railPos) * SPACING, RAIL_Y, 0]}>
            <circleGeometry args={[on ? 0.045 : 0.022, 16]} />
            <meshBasicMaterial
              color={p.shipped ? (isDark ? '#35D08A' : '#0D6D45') : (isDark ? '#FFB454' : '#8A5100')}
              transparent
              opacity={Math.max(0.15, 1 - d * 0.22)}
              toneMapped={false}
            />
          </mesh>
        )
      })}
      {items.map((p, i) => (
        <Device
          key={p.id}
          src={p.texture}
          title={p.title}
          offset={i - railPos}
          isActive={Math.abs(i - railPos) < 0.5}
          isDark={isDark}
          reduced={reduced}
          onSelect={() => onSelect(i)}
        />
      ))}
    </group>
  )
}

/**
 * Keeps the canvas alive. Un-pausing kicks the render loop (it doesn't always
 * restart on its own), and a lost WebGL context — too many contexts, a GPU
 * reset, a long hot-reload session — is reported so the canvas can be rebuilt.
 */
function KeepAlive({ paused, onLost }) {
  const { gl, invalidate } = useThree()
  useEffect(() => { if (!paused) invalidate() }, [paused, invalidate])
  useEffect(() => {
    const el = gl.domElement
    const lost = (e) => { e.preventDefault(); onLost() }
    el.addEventListener('webglcontextlost', lost)
    return () => el.removeEventListener('webglcontextlost', lost)
  }, [gl, onLost])
  return null
}

/**
 * Mounted inside the same Suspense as the phones, so it only exists once every
 * texture has loaded; its first frame is the first frame with real content.
 * App keeps the static still on screen until this fires — if WebGL silently
 * never draws (it happens), the visitor still sees the projects.
 */
function FirstFrame({ onReady }) {
  const fired = useRef(false)
  useFrame(() => {
    if (fired.current) return
    fired.current = true
    onReady?.(true)
  })
  return null
}

/** Eases the camera in as the visitor leaves the hero. */
function CameraRig({ engage, reduced }) {
  const { camera, size } = useThree()
  useFrame((state, dt) => {
    const k = reduced ? 1 : 1 - Math.pow(0.005, dt)
    const base = size.width < 768 ? 7.6 : 5.4 // narrow screens need more room
    // Pointer parallax: the camera drifts a little toward the cursor, so the
    // rail reads as objects in space rather than a flat strip. Off for reduced motion.
    const px = reduced ? 0 : state.pointer.x * 0.35
    const py = reduced ? 0 : state.pointer.y * 0.18
    camera.position.x = MathUtils.lerp(camera.position.x, px, k)
    camera.position.z = MathUtils.lerp(camera.position.z, base - engage * 1.1, k)
    camera.position.y = MathUtils.lerp(camera.position.y, 0.25 - engage * 0.25 + py, k)
    camera.lookAt(0, 0, 0)
  })
  return null
}

/**
 * ONE canvas for the whole page, fixed behind the DOM.
 * Browsers cap WebGL contexts (~8-16, Safari strictest) so per-section canvases break outright.
 */
export function Scene({ items, railPos, engage, isDark, reduced, onSelect, paused, onReady }) {
  // Rebuild the canvas (fresh context) after a context loss; give up after a few
  // and let the error boundary in App show the still instead.
  const [gen, setGen] = useState(0)
  if (gen > 3) throw new Error('WebGL context keeps getting lost')
  const onLost = useMemo(() => () => {
    onReady?.(false) // blank until rebuilt — bring the still back meanwhile
    setTimeout(() => setGen((g) => g + 1), 250)
  }, [onReady])
  return (
    <Canvas
      key={gen}
      // Hidden behind the sections below, or behind a dialog: stop drawing.
      frameloop={paused ? 'never' : 'always'}
      camera={{ position: [0, 0.25, 5.4], fov: 40 }}
      dpr={[1, 1.75]}
      // 'default', not R3F's built-in 'high-performance': Safari 27 loses a
      // high-performance context the instant it's created, so the rail never draws.
      gl={{ antialias: true, powerPreference: 'default' }}
      style={{ position: 'fixed', inset: 0, zIndex: 0, animation: 'fade-in .8s var(--ease) both' }}
    >
      <ambientLight intensity={isDark ? 0.55 : 1.25} />
      <directionalLight position={[4, 6, 6]} intensity={isDark ? 1.5 : 1.8} />
      <directionalLight
        position={[-5, -1, 3]}
        intensity={isDark ? 0.8 : 0.9}
        color={isDark ? '#35D08A' : '#ffffff'}
      />
      <KeepAlive paused={paused} onLost={onLost} />
      <CameraRig engage={engage} reduced={reduced} />
      <Suspense fallback={null}>
        <StudioEnv isDark={isDark} />
        <Rail
          items={items}
          railPos={railPos}
          isDark={isDark}
          reduced={reduced}
          onSelect={onSelect}
        />
        <FirstFrame onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
