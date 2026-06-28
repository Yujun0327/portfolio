import { useScrollProgress } from '../hooks/useScrollProgress'
import { CameraRig } from './CameraRig'
import { Sun } from '../scenes/Sun'
import { Mountain } from '../scenes/Mountain'
import { Spring } from '../scenes/Spring'
import { River } from '../scenes/River'
import { Towns } from '../scenes/Towns'
import { WildTerrain } from '../scenes/WildTerrain'
import { Ocean } from '../scenes/Ocean'
import { OceanShowcase } from '../scenes/OceanShowcase'
import { NightFinale } from '../scenes/NightFinale'
import { Scenery } from '../scenes/Scenery'
import { Birds } from '../scenes/Birds'
import { TagProjector } from './TagProjector'
import { ContactProjector } from './ContactProjector'

// The single persistent world. Every element is mounted at once and always
// present (small/far or out of frame when you're elsewhere) — the camera, driven
// by the shared scroll offset, is what reveals each beat. Nothing pops in or
// hard-fades; continuity comes from the camera move alone.
export function World() {
  const offsetRef = useScrollProgress()
  return (
    <>
      <CameraRig offsetRef={offsetRef} />
      <Sun />
      <Scenery />
      <Mountain />
      <Spring />
      <River />
      <Towns />
      <WildTerrain />
      <Ocean />
      <OceanShowcase />
      <NightFinale />
      <Birds />
      <TagProjector />
      <ContactProjector />
    </>
  )
}
