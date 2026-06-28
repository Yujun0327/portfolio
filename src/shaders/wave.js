// Ocean wave lines displaced entirely on the GPU (vertex shader) — replaces the
// per-frame CPU loop. Only `uTime` is updated per frame; the GPU does the rest.
export const waveVertex = /* glsl */ `
  uniform float uTime;
  attribute float aFade;
  varying float vFade;
  void main() {
    vFade = aFade;
    vec3 p = position;
    p.y += sin(p.x * 0.05 + uTime * 0.9 + p.z * 0.04) * (0.55 + aFade * 0.7);
    p.y += sin(p.x * 0.013 - uTime * 0.4) * 0.45;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

export const waveFragment = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    gl_FragColor = vec4(uColor, uOpacity * vFade);
  }
`
