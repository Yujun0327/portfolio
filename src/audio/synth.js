import { prefersReducedMotion } from '../utils/reducedMotion'

// ---------------------------------------------------------------------------
// Tiny Web Audio synth for the SFX: a chime/bell voice (holistic-scene cues) and
// a singing-bowl/handpan voice (tag hovers), all from a pentatonic scale in the
// soundtrack's key. No audio files. Gated by the volume slider via setSfxLevel.
// ---------------------------------------------------------------------------

// ▶ SET THIS to the soundtrack's key (root note + major/minor).
const KEY = { root: 'D', mode: 'minor' }

const NOTE = {
  C: 261.63, 'C#': 277.18, D: 293.66, 'D#': 311.13, E: 329.63, F: 349.23,
  'F#': 369.99, G: 392.0, 'G#': 415.3, A: 440.0, 'A#': 466.16, B: 493.88,
}
const SCALES = { major: [0, 2, 4, 7, 9], minor: [0, 3, 5, 7, 10] }
const ROOT = NOTE[KEY.root] || NOTE.D
const SCALE = SCALES[KEY.mode] || SCALES.minor

// pentatonic note frequency; `degree` wraps across octaves automatically
export function note(degree, octave = 0) {
  const n = SCALE.length
  const d = ((degree % n) + n) % n
  const oct = octave + Math.floor(degree / n)
  return ROOT * Math.pow(2, (SCALE[d] + oct * 12) / 12)
}

let ctx = null
let master = null
let reverb = null

function makeImpulse(seconds, decay) {
  const rate = ctx.sampleRate
  const len = Math.floor(rate * seconds)
  const buf = ctx.createBuffer(2, len, rate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
  }
  return buf
}

// create the audio graph — call from a user gesture (autoplay policy)
export function initSfx() {
  if (ctx) return resumeSfx()
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 0 // set by setSfxLevel
  // a compressor on the way out keeps the louder, overlapping ambient notes from clipping
  const comp = ctx.createDynamicsCompressor()
  master.connect(comp)
  comp.connect(ctx.destination)
  reverb = ctx.createConvolver()
  reverb.buffer = makeImpulse(3.6, 2.6) // long tail = ambient wash
  reverb.connect(master)
  resumeSfx()
}
export function resumeSfx() {
  if (ctx && ctx.state === 'suspended') ctx.resume()
}
// tie SFX level to the volume slider (a touch under the BGM)
export function setSfxLevel(v) {
  if (master) master.gain.value = Math.max(0, v) * 0.85
}

function voice(freq, { type = 'sine', attack = 0.005, decay = 1, gain = 0.18, detune = 0, when = 0, wet = 0.5 }) {
  if (!ctx) return
  const t = ctx.currentTime + when
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.value = freq
  if (detune) osc.detune.value = detune
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(gain, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
  osc.connect(g)
  g.connect(master)
  const send = ctx.createGain()
  send.gain.value = wet
  g.connect(send)
  send.connect(reverb)
  osc.start(t)
  osc.stop(t + attack + decay + 0.05)
}

// bell/chime — attack/decay/wet are tunable so the same voice covers a sharp
// ding and a soft ambient bloom
export function playBell(freq, { when = 0, gain = 0.17, attack = 0.005, decay = 1.2, wet = 0.55 } = {}) {
  voice(freq, { attack, decay, gain, when, wet })
  voice(freq * 2, { attack, decay: decay * 0.7, gain: gain * 0.5, when, wet })
  voice(freq * 3, { attack, decay: decay * 0.45, gain: gain * 0.28, when, wet })
  voice(freq * 4.2, { attack, decay: decay * 0.33, gain: gain * 0.16, when, wet })
}

// singing-bowl / handpan (inharmonic partials, soft attack, long ring, beating)
export function playBowl(freq, { gain = 0.15 } = {}) {
  const partials = [
    [1, 1],
    [2.0, 0.5],
    [2.76, 0.3],
    [5.4, 0.12],
  ]
  for (const [mult, amp] of partials) {
    const dec = 3.4 / Math.sqrt(mult)
    voice(freq * mult, { attack: 0.05, decay: dec, gain: gain * amp, detune: -4, wet: 0.75 })
    voice(freq * mult, { attack: 0.05, decay: dec, gain: gain * amp, detune: 4, wet: 0.75 })
  }
}

// ascending chime sequence (holistic cues)
export function arpeggio(degrees, { stepMs = 140, octave = 1, gain = 0.16, attack = 0.005, decay = 1.2, wet = 0.55 } = {}) {
  if (!ctx) return
  degrees.forEach((d, i) => playBell(note(d, octave), { when: (i * stepMs) / 1000, gain, attack, decay, wet }))
}

// soft, slow, lush version for the holistic-scene cues: a low drone bed under a
// slowly-blooming ascending chime
export function ambientCue(degrees) {
  if (!ctx) return
  playBowl(note(0, -2), { gain: 0.07 }) // quiet root drone for body
  arpeggio(degrees, { stepMs: 360, octave: 1, gain: 0.3, attack: 0.06, decay: 2.8, wet: 0.85 })
}

// the FINALE — a long ascending scale run (~2 octaves) over a sustained drone
// for a goosebumps build at the final holistic-holistic view
export function finale() {
  if (!ctx) return
  playBowl(note(0, -2), { gain: 0.18 }) // deep drone
  playBowl(note(2, -1), { gain: 0.1 })
  const run = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  run.forEach((d, i) =>
    playBell(note(d, 0), { when: i * 0.17, gain: 0.18 + i * 0.013, attack: 0.05, decay: 2.6, wet: 0.88 })
  )
  // shimmering peak note to top it off
  playBell(note(12, 0), { when: run.length * 0.17 + 0.12, gain: 0.34, attack: 0.07, decay: 4, wet: 0.92 })
}

// throttled hover tone (different scale degree per tag)
let lastHover = 0
export function hoverTone(index) {
  if (!ctx || prefersReducedMotion) return
  const now = ctx.currentTime
  if (now - lastHover < 0.07) return
  lastHover = now
  playBowl(note(index, -1), { gain: 0.13 })
}
