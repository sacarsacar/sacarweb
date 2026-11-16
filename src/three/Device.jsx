import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, useTexture } from '@react-three/drei'
import { MathUtils } from 'three'

const W = 1, H = 2.05, D = 0.085, BEZEL = 0.042

/** Rail slot pitch. Shared with Scene so the mesh links land on the devices. */
export const SPACING = 1.32

/**
 * A phone rendering a real app screenshot.
 * Procedural geometry on purpose — a photoreal GLB is 2-5MB and indistinguishable at this scale.
 * ponytail: swap in a GLB only if a close-up hero shot needs a camera bump and speaker grille.
 */
export function Device({
  src, offset, isDark, reduced, isActive, onSelect, title,
}) {
  const group = useRef()
  const vel = useRef(0) // x velocity: phones ride a spring, not a lerp, so a swipe can pull them
  const [hovered, setHovered] = useState(false)
  const tex = useTexture(src)
  tex.anisotropy = 8
  // Cover-fit, top-aligned. Play Store shots are 9:16 and the screen is ~9:19.5,
  // so stretching would visibly distort the UI; crop instead.
  const a = tex.image.width / tex.image.height
  const A = (W - BEZEL * 2) / (H - BEZEL * 2)
  if (a > A) { tex.repeat.set(A / a, 1); tex.offset.set((1 - A / a) / 2, 0) }
  else { tex.repeat.set(1, a / A); tex.offset.set(0, 1 - a / A) }

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const k = reduced ? 1 : 1 - Math.pow(0.0015, dt) // frame-rate independent easing

    // offset: signed distance from the centred device, in rail slots.
    const d = offset
    const far = Math.min(Math.abs(d), 4)

    const targetX = d * SPACING
    const targetZ = -far * 0.55 + (isActive ? 0.3 : 0)
    const targetRotY = MathUtils.clamp(-d * 0.42, -1.1, 1.1)
    const targetScale = isActive ? 1.12 : Math.max(0.62, 0.92 - far * 0.07)
    const lift = hovered && !reduced ? 0.09 : 0

    if (reduced) {
      g.position.x = targetX
      vel.current = 0
    } else {
      // Pulled-chain feel: phones farther from centre sit on softer springs, so
      // they trail the one being dragged and land with a little overshoot (ζ≈0.7).
      const h = Math.min(dt, 1 / 30)
      const stiff = 95 - far * 15
      vel.current += ((targetX - g.position.x) * stiff - vel.current * 1.4 * Math.sqrt(stiff)) * h
      g.position.x += vel.current * h
    }
    const v = vel.current
    // Lean into the pull: the top leads and the base trails, then it swings upright.
    g.rotation.z = MathUtils.lerp(g.rotation.z, reduced ? 0 : MathUtils.clamp(-v * 0.06, -0.32, 0.32), k)
    g.position.z = MathUtils.lerp(g.position.z, targetZ, k)
    g.position.y = MathUtils.lerp(
      g.position.y,
      lift + (reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.55 + d) * 0.035),
      k
    )
    g.rotation.y = MathUtils.lerp(
      g.rotation.y,
      targetRotY + (hovered ? 0.12 : 0) - (reduced ? 0 : MathUtils.clamp(v * 0.05, -0.35, 0.35)),
      k
    )
    g.scale.setScalar(MathUtils.lerp(g.scale.x, targetScale, k))
  })

  // Devices more than 4 slots away are never legible — skip their draw calls.
  if (Math.abs(offset) > 4.5) return null

  const dim = isActive ? 1 : 0.55
  const boost = (isDark ? 1 : 0.94) * (hovered ? 1.15 : 1)

  return (
    <group
      ref={group}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
        document.body.dataset.cursor = 'Open' // read by the custom cursor (Pointer.jsx)
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = ''
        delete document.body.dataset.cursor
      }}
      onClick={(e) => { e.stopPropagation(); onSelect?.() }}
    >
      <RoundedBox args={[W, H, D]} radius={0.07} smoothness={5} castShadow receiveShadow>
        <meshStandardMaterial
          color={isDark ? '#171F22' : '#AAB2B4'}
          roughness={0.34}
          metalness={0.82}
        />
      </RoundedBox>
      <mesh position={[0, 0, D / 2 + 0.001]}>
        <planeGeometry args={[W - BEZEL * 2, H - BEZEL * 2]} />
        <meshBasicMaterial
          map={tex}
          toneMapped={false}
          transparent
          opacity={dim}
          color={[boost, boost, boost]}
        />
      </mesh>
      {/* Accessible proxy: the canvas is inert, so the real control lives in the DOM. */}
      <mesh visible={false} name={title} />
    </group>
  )
}

