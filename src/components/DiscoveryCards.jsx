import { useEffect, useRef, useState } from 'react'
import { scrollStore } from '../hooks/scrollStore'
import { clamp } from '../utils/math'

// One cinematic title card per scene — a "you have discovered a new land" moment.
// Each fires once when the camera arrives at its scroll zone (re-arming after you
// leave), plays a dramatic reveal, holds a few seconds, then fades. It ALSO fades
// out the instant you scroll out of its zone (e.g. back up to the hero), so it
// never lingers over the centred name.
const CARDS = [
  {
    id: 'spring',
    eyebrow: 'Spring · Science',
    quote: '“Science, like the Mississippi, begins in a tiny rivulet in the distant forest.”',
    author: 'Abraham Flexner',
    zone: [0.06, 0.2],
  },
  {
    id: 'stream',
    eyebrow: 'Stream · Policy',
    quote: '“The stream will not permanently rise higher than the main source.”',
    author: 'Theodore Roosevelt',
    zone: [0.26, 0.46],
  },
  {
    id: 'sea',
    eyebrow: 'Sea · Education',
    quote: '“The aim of education should be to convert the mind into a living fountain, and not a reservoir.”',
    author: 'John M. Mason',
    zone: [0.5, 0.82],
  },
]

const REVEAL = 1500 // ms — the inner reveal (matches the CSS)
const HOLD = 2000 // ms it stays up before the timed auto-fade
const FADE = 1500 // ms timed fade-out

export function DiscoveryCards() {
  const [active, setActive] = useState(null) // { card, nonce }
  const el = useRef(null)
  const fired = useRef({})
  const nonce = useRef(0)
  const cur = useRef({ card: null, t0: 0, gate: 0 }) // gate = eased scroll presence

  useEffect(() => {
    let raf
    const tick = (ts) => {
      const o = scrollStore.offset

      // fire on zone-entry; re-arm on exit
      for (const c of CARDS) {
        const inZone = o >= c.zone[0] && o <= c.zone[1]
        if (inZone && !fired.current[c.id]) {
          fired.current[c.id] = true
          nonce.current += 1
          cur.current = { card: c, t0: ts, gate: 0 }
          setActive({ card: c, nonce: nonce.current })
        } else if (!inZone && fired.current[c.id]) {
          fired.current[c.id] = false
        }
      }

      // drive the active card's opacity: reveal-in × timed-fade × scroll-gate
      const s = cur.current
      if (s.card && el.current) {
        const inZone = o >= s.card.zone[0] && o <= s.card.zone[1]
        s.gate += ((inZone ? 1 : 0) - s.gate) * 0.26 // quick ease (~0.18s) on exit
        const age = ts - s.t0
        const fadeIn = clamp(age / 320, 0, 1)
        const timeOut = age > REVEAL + HOLD ? clamp(1 - (age - REVEAL - HOLD) / FADE, 0, 1) : 1
        el.current.style.opacity = (fadeIn * timeOut * s.gate).toFixed(3)
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (!active) return null
  const { card } = active
  // keying on the nonce remounts the node, restarting the CSS reveal each arrival
  return (
    <div className="discovery" key={active.nonce} ref={el} style={{ opacity: 0 }} aria-hidden>
      <div className="discovery__inner">
        <div className="discovery__eyebrow">{card.eyebrow}</div>
        <div className="discovery__rule" />
        <blockquote className="discovery__quote">{card.quote}</blockquote>
        <div className="discovery__author">— {card.author}</div>
      </div>
    </div>
  )
}
