// Shared scalar scroll progress (0..1). Written by useScrollProgress every frame
// inside the Canvas, and readable from DOM components OUTSIDE the Canvas (the
// intro overlay) so the name can fade with scroll and recover when you scroll
// back to the top.
export const scrollStore = { offset: 0, el: null }
