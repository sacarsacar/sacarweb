import { Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Line } from '@react-three/drei'
import { MathUtils } from 'three'
import { Device, SPACING } from './Device'

/** The rail slides so that `railPos` sits at the origin. */
/**
 * Keeps the rail out of the copy's way: pushed right on wide screens, lifted
 * above the text on narrow ones. Without this the headline sits on top of a
 * lit phone screen and neither is readable.
 */
function useRailTransform() {
  const { size } = useThree()
  if (size.width >= 1024) return { position: [1.45, 0, 0], scale: 1 }
  if (size.width >= 768) return { position: [0.9, 0.35, 0], scale: 0.9 }
  return { position: [0, 1.15, 0], scale: 0.78 }
}

function Rail({ items, railPos, isDark, reduced, onSelect }) {
  const t = useRailTransform()
  const RAIL_Y = -1.32 // just under the devices
  const links = useMemo(
    () =>
      items.slice(0, -1).map((_, i) => [
        [(i - railPos) * SPACING, RAIL_Y, 0],
        [(i + 1 - railPos) * SPACING, RAIL_Y, 0],
      ]),
    [items, railPos]
  )

  return (
    <group position={t.position} scale={t.scale}>
      {/* Signature: a local mesh. The devices are linked, not floating in a void —
          which is the actual through-line of the work (offline-first, local network). */}
      {links.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color={isDark ? '#35D08A' : '#128A56'}
          lineWidth={1}
          transparent
          opacity={Math.max(0, 0.5 - Math.abs(i + 0.5 - railPos) * 0.12)}
        />
      ))}
      {/* Nodes: one per project, brightest at the centred device. */}
      {items.map((p, i) => {
        const d = Math.abs(i - railPos)
        if (d > 4.5) return null
        const on = d < 0.5
        return (
          <mesh key={`n-${p.id}`} position={[(i - railPos) * SPACING, RAIL_Y, 0]}>
            <circleGeometry args={[on ? 0.045 : 0.022, 16]} />
            <meshBasicMaterial
              color={p.shipped ? (isDark ? '#35D08A' : '#128A56') : (isDark ? '#FFB454' : '#9A5B00')}
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

/** Eases the camera in as the visitor leaves the hero. */
function CameraRig({ engage, reduced }) {
  const { camera, size } = useThree()
  useFrame((_, dt) => {
    const k = reduced ? 1 : 1 - Math.pow(0.005, dt)
    const base = size.width < 768 ? 7.6 : 5.4 // narrow screens need more room
    camera.position.z = MathUtils.lerp(camera.position.z, base - engage * 1.1, k)
    camera.position.y = MathUtils.lerp(camera.position.y, 0.25 - engage * 0.25, k)
    camera.lookAt(0, 0, 0)
  })
  return null
}

/**
 * ONE canvas for the whole page, fixed behind the DOM.
 * Browsers cap WebGL contexts (~8-16, Safari strictest) so per-section canvases break outright.
 */
export function Scene({ items, railPos, engage, isDark, reduced, onSelect }) {
  return (
    <Canvas
      camera={{ position: [0, 0.25, 5.4], fov: 40 }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
    >
      <ambientLight intensity={isDark ? 0.55 : 1.6} />
      <directionalLight position={[4, 6, 6]} intensity={isDark ? 1.5 : 2.2} />
      <directionalLight
        position={[-5, -1, 3]}
        intensity={isDark ? 0.8 : 0.9}
        color={isDark ? '#35D08A' : '#ffffff'}
      />
      <CameraRig engage={engage} reduced={reduced} />
      <Suspense fallback={null}>
        <Environment preset={isDark ? 'night' : 'city'} />
        <Rail
          items={items}
          railPos={railPos}
          isDark={isDark}
          reduced={reduced}
          onSelect={onSelect}
        />
      </Suspense>
    </Canvas>
  )
}
