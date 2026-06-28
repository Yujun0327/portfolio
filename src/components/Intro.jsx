import { useEffect, useMemo, useRef, useState } from 'react'
import { COLORS } from '../data/journey'
import { logoFor } from '../data/logos'
import { scrollStore } from '../hooks/scrollStore'
import { smoothstep } from '../utils/math'
import { prefersReducedMotion } from '../utils/reducedMotion'

// The intro flashes these logos in order: 'yujun' (the name mark) first, then
// the 12 projects + NCHS — 14 total. Any without a logo file are skipped.
const INTRO_IDS = ['yujun', 'mtn-0', 'mtn-1', 'mtn-2', 'mtn-3', 'twr-0', 'twr-1', 'twr-2', 'twr-3', 'isl-0', 'isl-1', 'isl-2', 'isl-3', 'shp-0']

// The opening "빠빠빠빠" burst: 10 random project outlines flash in fast
// succession, then the 11th beat lands — your name appears over the (3D) sun
// with an impact pop. The name's opacity then TRACKS scroll: it fades out as you
// scroll down and recovers when you scroll back to the top. Real project
// outlines drop in later.
function makeOutline(seed) {
  let s = (seed * 2654435761) % 2147483647 || 1
  const rnd = () => ((s = (s * 16807) % 2147483647), s / 2147483647)
  const n = 6 + Math.floor(rnd() * 5)
  const pts = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const r = 48 + rnd() * 42
    pts.push([100 + Math.cos(a) * r, 100 + Math.sin(a) * r])
  }
  return 'M' + pts.map((p) => p.map((x) => x.toFixed(1)).join(',')).join(' L') + ' Z'
}

export function Intro() {
  // real project logos (12 projects + NCHS); fall back to random outlines if
  // none are present yet
  const logos = useMemo(() => INTRO_IDS.map(logoFor).filter(Boolean), [])
  const outlines = useMemo(() => Array.from({ length: 10 }, (_, i) => makeOutline(i + 1)), [])
  const useLogos = logos.length > 0
  const flashes = useLogos ? logos : outlines
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState('flash') // flash | name
  const timer = useRef()
  const nameRef = useRef()
  const cvRef = useRef()

  // rapid-fire the 10 outlines, then reveal the name (skip the burst entirely
  // for reduced-motion users — go straight to the name)
  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase('name')
      return
    }
    let i = 0
    timer.current = setInterval(() => {
      i++
      if (i >= flashes.length) {
        clearInterval(timer.current)
        setPhase('name')
      } else {
        setIdx(i)
      }
    }, 80)
    return () => clearInterval(timer.current)
  }, [flashes.length])

  // once the name is up, drive its opacity from live scroll (fades out by ~6%,
  // returns to full at the very top)
  useEffect(() => {
    if (phase !== 'name') return
    let raf
    const tick = () => {
      const op = 1 - smoothstep(0.0, 0.06, scrollStore.offset)
      if (nameRef.current) nameRef.current.style.opacity = String(op)
      // don't let the (invisible) centre CV button catch clicks once scrolled past
      if (cvRef.current) cvRef.current.style.pointerEvents = op > 0.5 ? 'auto' : 'none'
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  const covering = phase === 'flash'

  return (
    <div className="intro" style={{ background: covering ? COLORS.bg : 'transparent' }}>
      {covering ? (
        useLogos ? (
          <img className="intro__logo" src={flashes[idx]} alt="" decoding="async" />
        ) : (
          <svg className="intro__card" viewBox="0 0 200 200" style={{ stroke: COLORS.line }}>
            <path d={flashes[idx]} />
          </svg>
        )
      ) : (
        <div className="intro__name" ref={nameRef} style={{ color: COLORS.line }}>
          <span className="intro__ring" style={{ borderColor: COLORS.line }} />
          <h1>Yujun Piao</h1>
          <p>env. engineer / advocate / educator</p>
          <p className="intro__hook">
            Studying the failure point of expertise in systems, and engineering it to empower common
            agency that creates participation.
          </p>
          <a className="intro__cv" ref={cvRef} href="/Yujun-Piao-CV.pdf" download="Yujun-Piao-CV.pdf">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 V15" />
              <path d="M7 10.5 L12 15.5 L17 10.5" />
              <path d="M5 20 H19" />
            </svg>
            Download CV
          </a>
        </div>
      )}
    </div>
  )
}
