import { useMemo } from 'react'
import * as THREE from 'three'
import { COLORS, MODE } from '../data/journey'
import { getRiverFrame, sampleRiver } from '../utils/curveSampler'
import { instanceEdges } from '../utils/mergeWire'
import { statueGeometry } from '../utils/statues'
import { getStatues } from '../utils/places'

const BLENDING = MODE === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending

// big villages downstream-of-mountain; small settlements further toward the sea
// (hasStatue controls house count + which towns get a monument — actual statue
// positions live in utils/places.js so the terrain can avoid them)
const TOWN_CONFIG = [
  { u: 0.3, scale: 1, hasStatue: true },
  { u: 0.42, scale: 1, hasStatue: true },
  { u: 0.54, scale: 1, hasStatue: true },
  { u: 0.68, scale: 0.62, hasStatue: false },
  { u: 0.8, scale: 0.6, hasStatue: false },
]

// one house = box body + pyramid roof, base at y=0
function buildHouseUnit() {
  const body = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.4, 2, 2.4))
  const roof = new THREE.EdgesGeometry(new THREE.ConeGeometry(1.9, 1.4, 4))
  const mBody = new THREE.Matrix4().makeTranslation(0, 1, 0)
  const mRoof = new THREE.Matrix4().compose(
    new THREE.Vector3(0, 2.7, 0),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 4, 0)),
    new THREE.Vector3(1, 1, 1)
  )
  // merge the two parts into a single unit, then expose as one geometry
  const merged = instanceEdges(body, [mBody])
  const roofG = instanceEdges(roof, [mRoof])
  const a = merged.attributes.position.array
  const b = roofG.attributes.position.array
  const out = new Float32Array(a.length + b.length)
  out.set(a, 0)
  out.set(b, a.length)
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(out, 3))
  return g
}

export function Towns() {
  const { houses, statues } = useMemo(() => {
    const frame = getRiverFrame(320)
    const houseUnit = buildHouseUnit()
    const p = new THREE.Vector3()
    const n = new THREE.Vector3()
    let s = 91
    const rand = () => ((s = (s * 16807) % 2147483647), s / 2147483647)

    const matrices = []
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const scl = new THREE.Vector3()

    const placeHouses = (u, scale, count) => {
      const w = sampleRiver(frame, u, p, n)
      const center = p.clone()
      const nor = n.clone()
      // tangent ≈ perpendicular to normal in XZ
      const tan = new THREE.Vector3(-nor.z, 0, nor.x)
      for (let i = 0; i < count; i++) {
        const side = i % 2 === 0 ? 1 : -1
        // clearance scales with the town, but the bank half-width `w` does NOT —
        // otherwise small towns get pulled inside the (wider) river
        const d = w + (5 + (i % 4) * 3) * scale
        const along = (i - count / 2) * 3.6 * scale
        const pos = center
          .clone()
          .addScaledVector(nor, side * d)
          .addScaledVector(tan, along)
        e.set(0, rand() * Math.PI, 0)
        q.setFromEuler(e)
        scl.setScalar(scale)
        matrices.push(new THREE.Matrix4().compose(new THREE.Vector3(pos.x, pos.y, pos.z), q, scl))
      }
    }

    TOWN_CONFIG.forEach((cfg) => {
      placeHouses(cfg.u, cfg.scale, cfg.hasStatue ? 8 : 4)
    })

    const houses = instanceEdges(houseUnit, matrices)
    return { houses, statues: getStatues() }
  }, [])

  return (
    <group>
      <lineSegments geometry={houses}>
        <lineBasicMaterial color={COLORS.line} transparent opacity={0.9} depthWrite={false} blending={BLENDING} />
      </lineSegments>
      {statues.map((st, i) => (
        <lineSegments key={i} geometry={statueGeometry(st.design)} position={st.pos} scale={st.scale}>
          <lineBasicMaterial color={COLORS.line} transparent opacity={1} depthWrite={false} blending={BLENDING} />
        </lineSegments>
      ))}
    </group>
  )
}
