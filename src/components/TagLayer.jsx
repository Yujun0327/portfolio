import { useEffect, useRef, useState } from 'react'
import { ANCHORS } from '../data/anchors'
import { projectFor } from '../data/projects'
import { logoFor } from '../data/logos'
import { ui, openTag } from '../hooks/uiStore'
import { prefersReducedMotion } from '../utils/reducedMotion'
import { hoverTone } from '../audio/synth'

const TILT = prefersReducedMotion ? 0 : 9 // degrees the tags lean toward the cursor

// placeholder logo (a little peak + sun, on theme) — swap for real logos later
function Logo() {
  return (
    <svg className="tag__logo" viewBox="0 0 64 44" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
      <path d="M4 39 L22 13 L33 28 L43 15 L60 39 Z" />
      <circle cx="46" cy="11" r="5" />
    </svg>
  )
}

// DOM overlay of liquid-glass tags. Positions/opacity/tilt are updated
// imperatively each frame from the projector buffer (no React re-render); only
// the carousel tick re-renders (cheap).
export function TagLayer() {
  const refs = useRef([])
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1900)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let raf
    const loop = () => {
      const buf = ui.buffer
      if (buf) {
        const { nx, ny } = ui.mouse
        const sunX = ui.sun.x
        const sunY = ui.sun.y
        for (let i = 0; i < ANCHORS.length; i++) {
          const el = refs.current[i]
          if (!el) continue
          const j = i * 4
          const op = buf[j + 2]
          el.style.opacity = op.toFixed(3)
          el.style.visibility = op > 0.01 ? 'visible' : 'hidden'
          el.style.pointerEvents = op > 0.6 ? 'auto' : 'none'
          // anchor the pin's TIP at the projected point; `below` tags dangle
          // downward (tip at top) instead of floating up (tip at bottom)
          const selfY = ANCHORS[i].below ? '0' : '-100%'
          el.style.transform =
            `translate(${buf[j].toFixed(1)}px, ${buf[j + 1].toFixed(1)}px) translate(-50%, ${selfY})` +
            ` rotateY(${nx * TILT}deg) rotateX(${-ny * TILT}deg)`
          // put the specular highlight on the side facing the (projected) sun
          const dx = sunX - buf[j]
          const dy = sunY - buf[j + 1]
          const len = Math.hypot(dx, dy) || 1
          el.style.setProperty('--gx', (50 + (dx / len) * 42).toFixed(0) + '%')
          el.style.setProperty('--gy', (50 + (dy / len) * 42).toFixed(0) + '%')
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="tag-layer">
      {ANCHORS.map((a, i) => {
        const proj = projectFor(a)
        const logo = logoFor(a.id)
        const frame = tick % proj.frames
        return (
          <div key={a.id} className={`tag ${a.below ? 'tag--below' : ''}`} ref={(el) => (refs.current[i] = el)}>
            <span className="tag__thick" />
            <button
              className={`tag__glass tag__glass--${a.group}`}
              onClick={() => openTag(a.id)}
              onPointerEnter={() => hoverTone(i)}
            >
              <span className="tag__tail" />
              <div className="tag__pic">
                {Array.from({ length: proj.frames }).map((_, f) =>
                  proj.images && proj.images[f] ? (
                    <img
                      key={f}
                      className={`tag__frame ${f === frame ? 'is-on' : ''}`}
                      src={proj.images[f].thumb}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div key={f} className={`tag__frame frame-${(f % 6) + 1} ${f === frame ? 'is-on' : ''}`} />
                  ),
                )}
                <span className="tag__scrim" />
                <div className="tag__overlay">
                  {logo ? <img className="tag__logo tag__logo--img" src={logo} alt="" decoding="async" /> : <Logo />}
                  <span className="tag__title">{proj.title}</span>
                </div>
                <span className="tag__dots">
                  {Array.from({ length: proj.frames }).map((_, f) => (
                    <i key={f} className={f === frame ? 'on' : ''} />
                  ))}
                </span>
              </div>
              <span className="tag__irid" />
              <span className="tag__gloss" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
