import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing'
import { COLORS } from '../data/journey'

// Bloom only makes sense in dark mode (it amplifies bright pixels — white lines
// on black glow; black lines on paper can't bloom). In light mode we just keep
// anti-aliasing.
export function Effects() {
  return (
    <EffectComposer disableNormalPass>
      {COLORS.bloom && (
        <Bloom
          intensity={0.85}
          luminanceThreshold={0}
          luminanceSmoothing={0.25}
          mipmapBlur
        />
      )}
      <SMAA />
    </EffectComposer>
  )
}
