import { useEffect, useMemo, useRef, useState } from 'react'
import { scrollStore } from '../hooks/scrollStore'
import { smoothstep } from '../utils/math'
import { offsetRangeForTag } from '../world/Paths'
import { initSfx, resumeSfx, setSfxLevel, ambientCue, finale } from '../audio/synth'

const BASE_VOL = 0.28

// holistic-scene chime patterns — fire on crossing into each
const CUE_PATTERNS = {
  mountain: [0, 2, 4],
  river: [2, 4, 7],
  ocean: [0, 4, 7, 9],
}

// Ambient soundtrack: loops; starts on the first CLICK/keypress (scroll is not a
// valid autoplay gesture). The eq-bars button reveals a vertical volume slider.
// The "click to enable sound" hint trails the cursor at the sun stage.
export function Audio() {
  const audioRef = useRef()
  const hintRef = useRef()
  const fillRef = useRef()
  const trackRef = useRef()
  const cursor = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const [vol, setVol] = useState(BASE_VOL)
  const [started, setStarted] = useState(false)
  const [open, setOpen] = useState(false)
  const armed = useRef({ mountain: true, river: true, ocean: true, finale: true })
  const prevOff = useRef(0)

  const cuePoints = useMemo(() => {
    const [oceanStart, oceanEnd] = offsetRangeForTag('oceanShowcase')
    return [
      { id: 'mountain', at: 0.09 },
      { id: 'river', at: 0.4 },
      { id: 'ocean', at: oceanStart },
      // the final holistic-holistic view (just after the showcase ends)
      { id: 'finale', at: Math.min(0.985, oceanEnd + 0.012) },
    ]
  }, [])

  // enable both BGM and the synth SFX (must be from a user gesture)
  const enable = () => {
    const el = audioRef.current
    if (el && el.paused) el.play().then(() => setStarted(true)).catch(() => {})
    else setStarted(true)
    initSfx()
    setSfxLevel(audioRef.current ? audioRef.current.volume : BASE_VOL)
  }

  // start on first click / key
  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.volume = BASE_VOL
    const start = () => {
      enable()
      cleanup()
    }
    const cleanup = () => {
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
    }
    window.addEventListener('pointerdown', start)
    window.addEventListener('keydown', start)
    return cleanup
  }, [])

  // cursor-following hint, fading with scroll, hidden once sound is on
  useEffect(() => {
    const onMove = (e) => {
      cursor.current.x = e.clientX
      cursor.current.y = e.clientY
    }
    window.addEventListener('pointermove', onMove)
    let raf
    const loop = () => {
      const h = hintRef.current
      if (h) {
        const o = started ? 0 : 1 - smoothstep(0, 0.06, scrollStore.offset)
        h.style.opacity = o.toFixed(3)
        if (o > 0.001) h.style.transform = `translate(${cursor.current.x + 22}px, ${cursor.current.y - 9}px)`
      }
      // holistic-scene cues: fire once when crossing each point (either
      // direction), re-arm once we've moved well away
      if (started) {
        const off = scrollStore.offset
        const prev = prevOff.current
        for (const c of cuePoints) {
          const crossed = (prev < c.at && off >= c.at) || (prev > c.at && off <= c.at)
          if (armed.current[c.id] && crossed) {
            if (c.id === 'finale') finale()
            else ambientCue(CUE_PATTERNS[c.id])
            armed.current[c.id] = false
          } else if (!armed.current[c.id] && Math.abs(off - c.at) > 0.04) {
            armed.current[c.id] = true
          }
        }
        prevOff.current = off
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [started])

  const apply = (clientY) => {
    const t = trackRef.current
    if (!t) return
    const r = t.getBoundingClientRect()
    const v = Math.max(0, Math.min(1, 1 - (clientY - r.top) / r.height))
    setVol(v)
    if (audioRef.current) audioRef.current.volume = v
    if (fillRef.current) fillRef.current.style.height = v * 100 + '%'
    setSfxLevel(v) // SFX follow the slider (0 = silent)
  }
  const onMove = (e) => dragging.current && apply(e.clientY)
  const onUp = () => {
    dragging.current = false
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }
  const onDown = (e) => {
    e.stopPropagation()
    enable() // dragging the slider is a valid gesture too
    dragging.current = true
    apply(e.clientY)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const toggleOpen = () => {
    setOpen((o) => !o)
    enable()
    resumeSfx()
  }

  return (
    <>
      <audio ref={audioRef} src="/audio/bgm.mp3" loop preload="auto" />

      <div className="sound">
        <div className={`sound__panel ${open ? 'is-open' : ''}`}>
          <div className="sound__track" ref={trackRef} onPointerDown={onDown}>
            <div className="sound__fill" ref={fillRef} style={{ height: vol * 100 + '%' }} />
          </div>
        </div>
        <button
          className={`sound__btn ${started ? 'is-on' : ''} ${vol <= 0.001 ? 'is-muted' : ''}`}
          onClick={toggleOpen}
          aria-label="Sound"
        >
          <span className="sound__bars">
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>

      <div className="sound-hint" ref={hintRef}>click to enable sound</div>
    </>
  )
}
