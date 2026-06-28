import { useEffect, useRef } from 'react'
import { CONTACTS } from '../data/contacts'
import { ui, openContact } from '../hooks/uiStore'
import { prefersReducedMotion } from '../utils/reducedMotion'

const TILT = prefersReducedMotion ? 0 : 10

const svg = (children) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)
const ICONS = {
  email: svg(
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7 L12 13 L20 7" />
    </>
  ),
  phone: svg(<path d="M6.5 3 H9 L10.5 7.5 L8.5 9 a11 11 0 0 0 6 6 L16 13 L20.5 14.5 V17 a2 2 0 0 1-2.2 2 A15.5 15.5 0 0 1 4.5 5.2 A2 2 0 0 1 6.5 3 Z" />),
  linkedin: svg(
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7 10 V16 M7 7 V7.01 M11 16 V12.5 a2 2 0 0 1 4 0 V16" />
    </>
  ),
  form: svg(
    <>
      <rect x="4.5" y="3" width="15" height="18" rx="2.5" />
      <path d="M8 8 H16 M8 12 H16 M8 16 H13" />
    </>
  ),
  copyright: svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9.5 a4 4 0 1 0 0 5" />
    </>
  ),
}

// Contact constellation: shining star-icons projected into the night sky, each
// tilting toward the cursor. Email/phone/LinkedIn are links; form opens the modal.
export function ContactLayer() {
  const refs = useRef([])

  useEffect(() => {
    let raf
    const loop = () => {
      const buf = ui.contactBuffer
      if (buf) {
        const { nx, ny } = ui.mouse
        for (let i = 0; i < CONTACTS.length; i++) {
          const el = refs.current[i]
          if (!el) continue
          const j = i * 4
          const op = buf[j + 2]
          el.style.opacity = op.toFixed(3)
          el.style.visibility = op > 0.01 ? 'visible' : 'hidden'
          el.style.pointerEvents = op > 0.5 ? 'auto' : 'none'
          el.style.transform =
            `translate(${buf[j].toFixed(1)}px, ${buf[j + 1].toFixed(1)}px) translate(-50%,-50%)` +
            ` rotateY(${nx * TILT}deg) rotateX(${-ny * TILT}deg)`
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="cstar-layer">
      {CONTACTS.map((c, i) => {
        const inner = (
          <>
            <span className="cstar__icon">{ICONS[c.type]}</span>
            {c.text && <span className="cstar__text">{c.text}</span>}
          </>
        )
        return (
          <div key={c.id} className="cstar-wrap" ref={(el) => (refs.current[i] = el)}>
            {c.type === 'form' ? (
              <button className={`cstar cstar--${c.type}`} onClick={openContact}>
                {inner}
              </button>
            ) : c.href ? (
              <a className={`cstar cstar--${c.type}`} href={c.href} target={c.type === 'linkedin' ? '_blank' : undefined} rel="noreferrer">
                {inner}
              </a>
            ) : (
              <span className={`cstar cstar--${c.type}`}>{inner}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
