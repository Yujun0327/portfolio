import { useSyncExternalStore } from 'react'

// Cross-boundary UI store. The mouse position and the tag screen-position buffer
// are read IMPERATIVELY (in useFrame / rAF) to avoid per-frame React renders;
// `openId` drives React via useSyncExternalStore.
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

export const ui = {
  mouse: { nx: 0, ny: 0 }, // normalized -1..1, from screen centre
  sun: { x: 0, y: -400 }, // sun's projected screen position (for glass reflections)
  openId: null,
  buffer: null, // Float32Array, 4 floats per tag: [screenX, screenY, opacity, scale]
  count: 0,
  contactBuffer: null, // 4 floats per contact star: [screenX, screenY, opacity, _]
  contactOpen: false, // the contact form modal
}

export function initTagBuffer(count) {
  ui.count = count
  ui.buffer = new Float32Array(count * 4)
}
export function initContactBuffer(count) {
  ui.contactBuffer = new Float32Array(count * 4)
}
export function openContact() {
  if (!ui.contactOpen) {
    ui.contactOpen = true
    emit()
  }
}
export function closeContact() {
  if (ui.contactOpen) {
    ui.contactOpen = false
    emit()
  }
}
export const setMouse = (nx, ny) => {
  ui.mouse.nx = nx
  ui.mouse.ny = ny
}
export function openTag(id) {
  if (ui.openId !== id) {
    ui.openId = id
    emit()
  }
}
export function closeTag() {
  if (ui.openId !== null) {
    ui.openId = null
    emit()
  }
}
const subscribe = (l) => (listeners.add(l), () => listeners.delete(l))
const getOpenId = () => ui.openId

// React hooks for components that need to re-render on open/close.
export const useOpenId = () => useSyncExternalStore(subscribe, getOpenId, getOpenId)
const getContactOpen = () => ui.contactOpen
export const useContactOpen = () => useSyncExternalStore(subscribe, getContactOpen, getContactOpen)
