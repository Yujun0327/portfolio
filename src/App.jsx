import { useEffect } from 'react'
import { CanvasRoot } from './components/CanvasRoot'
import { Overlay } from './components/Overlay'
import { Intro } from './components/Intro'
import { TagLayer } from './components/TagLayer'
import { ProjectModal } from './components/ProjectModal'
import { ContactLayer } from './components/ContactLayer'
import { ContactModal } from './components/ContactModal'
import { DiscoveryCards } from './components/DiscoveryCards'
import { PaperTexture } from './components/PaperTexture'
import { Audio } from './components/Audio'
import { setMouse } from './hooks/uiStore'

export function App() {
  // feed normalized mouse position to the store (camera parallax + tag tilt)
  useEffect(() => {
    const onMove = (e) => {
      setMouse((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <>
      <CanvasRoot />
      <TagLayer />
      <ContactLayer />
      <ProjectModal />
      <ContactModal />
      <DiscoveryCards />
      <Overlay />
      <Intro />
      <PaperTexture />
      <Audio />
    </>
  )
}
