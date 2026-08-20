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
  const [hovered, setHovered] = useState(false)
  const tex = useTexture(src)
  tex.anisotropy = 8

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

    g.position.x = MathUtils.lerp(g.position.x, targetX, k)
    g.position.z = MathUtils.lerp(g.position.z, targetZ, k)
    g.position.y = MathUtils.lerp(
      g.position.y,
      lift + (reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.55 + d) * 0.035),
      k
    )
    g.rotation.y = MathUtils.lerp(g.rotation.y, targetRotY + (hovered ? 0.12 : 0), k)
    g.scale.setScalar(MathUtils.lerp(g.scale.x, targetScale, k))
  })

  // Devices more than 4 slots away are never legible — skip their draw calls.
  if (Math.abs(offset) > 4.5) return null

  const dim = isActive ? 1 : 0.55
  const boost = (isDark ? 1 : 1.08) * (hovered ? 1.15 : 1)

  return (
    <group
      ref={group}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = '' }}
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

useTexture.preload
