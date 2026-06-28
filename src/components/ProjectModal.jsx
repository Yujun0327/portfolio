import { useEffect, useState } from 'react'
import { ANCHORS } from '../data/anchors'
import { projectFor } from '../data/projects'
import { useOpenId, closeTag } from '../hooks/uiStore'
import { prefersReducedMotion } from '../utils/reducedMotion'

// The expanded project panel: text left, carousel right. Stays mounted briefly on
// close so it can animate out. Camera zoom + scroll lock are handled elsewhere.
export function ProjectModal() {
  const openId = useOpenId()
  const [shown, setShown] = useState(null) // lingers through the close transition
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (openId) {
      setShown(ANCHORS.find((a) => a.id === openId) || null)
      setFrame(0)
    } else if (shown) {
      const t = setTimeout(() => setShown(null), 480)
      return () => clearTimeout(t)
    }
  }, [openId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!openId) return
    const onKey = (e) => e.key === 'Escape' && closeTag()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId])

  const proj = shown ? projectFor(shown) : null
  const frames = proj ? proj.frames : 0

  // auto-advance the carousel while open
  useEffect(() => {
    if (!openId || prefersReducedMotion || frames < 2) return
    const id = setInterval(() => setFrame((f) => (f + 1) % frames), 3200)
    return () => clearInterval(id)
  }, [openId, frames])

  return (
    <div className={`modal-root ${openId ? 'is-open' : ''}`} aria-hidden={!openId}>
      <div className="modal-backdrop" onClick={closeTag} />
      {proj && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={proj.title}>
          <div className="modal__text">
            {proj.category && <span className="modal__cat">{proj.category}</span>}
            <h2 className="modal__title">{proj.title}</h2>
            <p className="modal__blurb">{proj.blurb}</p>
          </div>
          <div className="modal__media">
            {Array.from({ length: frames }).map((_, f) =>
              proj.images && proj.images[f] ? (
                <img
                  key={f}
                  className={`modal__frame ${f === frame ? 'is-on' : ''}`}
                  src={proj.images[f].full}
                  style={{ objectFit: proj.images[f].fit }}
                  alt={`${proj.title} — ${f + 1}`}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div key={f} className={`modal__frame frame-${(f % 6) + 1} ${f === frame ? 'is-on' : ''}`} />
              ),
            )}
            <div className="modal__nav">
              {Array.from({ length: frames }).map((_, f) => (
                <button key={f} className={f === frame ? 'on' : ''} onClick={() => setFrame(f)} aria-label={`Image ${f + 1}`} />
              ))}
            </div>
          </div>
          <button className="modal__close" onClick={closeTag} aria-label="Close">
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
