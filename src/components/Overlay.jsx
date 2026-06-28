import { useEffect, useRef, useState } from 'react'
import { scrollStore } from '../hooks/scrollStore'
import { smoothstep } from '../utils/math'
import { offsetRangeForTag } from '../world/Paths'

const [SHOW_START, SHOW_END] = offsetRangeForTag('oceanShowcase')
const lerp = (a, b, t) => a + (b - a) * t

// Three phases. `at` = when the label highlights; `go` = where clicking flies you
// (a point a little INTO the scene, where that view's tags are actually visible).
// The pre-ocean targets are expressed as fractions of SHOW_START (the live ocean
// offset) so they stay put when later segments' weights change — e.g. adding the
// finale keyframe grew the total weight, which would otherwise slide them late.
const PHASES = [
  { label: 'Spring', at: 0, go: SHOW_START * 0.167 }, // mountain projects
  { label: 'Stream', at: SHOW_START * 0.43, go: SHOW_START * 0.61 }, // river towns / statues
  { label: 'Sea', at: SHOW_START, go: lerp(SHOW_START, SHOW_END, 0.2) }, // ocean islands
]
// the chevron submenu — also navigation
const SUBMENU = [
  { label: 'Miscellaneous', go: lerp(SHOW_START, SHOW_END, 0.5) }, // the ships (activities)
  { label: 'Award', go: lerp(SHOW_START, SHOW_END, 0.82) }, // the whale
  { label: 'Contact', go: 1 }, // the very end
]

// state-of-matter mark next to the name: ice (mountain) → water (river) → vapor (sea)
const Ice = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
    <path d="M12 3 L20 7.5 L20 16.5 L12 21 L4 16.5 L4 7.5 Z" />
    <path d="M4 7.5 L12 12 L20 7.5" />
    <path d="M12 12 L12 21" />
  </svg>
)
const Water = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
    <path d="M12 3 C12 3 5 11 5 15.5 A7 7 0 0 0 19 15.5 C19 11 12 3 12 3 Z" />
  </svg>
)
const Vapor = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M8 20 C6 16 10 14 8 10 C7 8 9 7 8.5 4" />
    <path d="M15.5 20 C13.5 16 17.5 14 15.5 10 C14.5 8 16.5 7 16 4" />
  </svg>
)
const ICONS = [Ice, Water, Vapor]

// Top-left name (back-to-hero) + state-of-matter mark, and the right-bar phase
// menu. The whole overlay fades IN as the centred intro name fades out.
export function Overlay() {
  const overlayRef = useRef()
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    let raf
    const tick = () => {
      const o = scrollStore.offset
      if (overlayRef.current) overlayRef.current.style.opacity = smoothstep(0, 0.06, o).toFixed(3)
      let idx = 0
      for (let i = 0; i < PHASES.length; i++) if (o >= PHASES[i].at) idx = i
      setPhase((p) => (p === idx ? p : idx))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // fly to a scroll offset (0..1) — the navbar behaviour
  const goTo = (target) => {
    const el = scrollStore.el
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    el.scrollTo({ top: target * max, behavior: 'smooth' })
  }
  const goHome = () => goTo(0)
  const Icon = ICONS[phase] || Ice

  return (
    <div className="overlay" ref={overlayRef} style={{ opacity: 0 }}>
      <header className="overlay__top">
        <button className="overlay__home" onClick={goHome} aria-label="Back to top">
          <span className="overlay__mark">
            <Icon />
          </span>
          <span className="overlay__title">Yujun Piao</span>
        </button>
      </header>

      <a className="overlay__cv" href="/Yujun-Piao-CV.pdf" download="Yujun-Piao-CV.pdf" aria-label="Download CV">
        <span>CV</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 V15" />
          <path d="M7 10.5 L12 15.5 L17 10.5" />
          <path d="M5 20 H19" />
        </svg>
      </a>

      <nav className="overlay__beats">
        {PHASES.map((b, i) => (
          <button
            key={b.label}
            className={`overlay__beat ${i === phase ? 'is-active' : ''}`}
            onClick={() => goTo(b.go)}
          >
            {b.label}
          </button>
        ))}
        <div className="overlay__more">
          <span className="overlay__chev" aria-hidden>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 6 L8 10.5 L12.5 6" />
            </svg>
          </span>
          <div className="overlay__submenu">
            {SUBMENU.map((s) => (
              <button key={s.label} className="overlay__subitem" onClick={() => goTo(s.go)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
