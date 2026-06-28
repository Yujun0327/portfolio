// The contact form target. Drop in your Formspree (https://formspree.io/f/xxxx)
// or other POST endpoint here; until then it's empty and the form falls back to a
// pre-filled mailto: to 0327ypiao@gmail.com so it stays usable.
export const FORM_ENDPOINT = ''
export const FORM_TO = '0327ypiao@gmail.com'

// The 5 contact "stars" anchored in the night sky. `world` positions are tunable;
// they're spread across BOTH sides of the end-view sky (the moon rises to the old
// sun spot, upper-centre) and twinkle in as night falls.
export const CONTACTS = [
  { id: 'email', type: 'email', world: [105, 136, 30], text: '0327ypiao@gmail.com', href: 'mailto:0327ypiao@gmail.com' },
  { id: 'linkedin', type: 'linkedin', world: [-115, 120, 250], text: 'LinkedIn', href: 'https://www.linkedin.com/in/yujun-piao/' },
  { id: 'phone', type: 'phone', world: [120, 110, 40], text: '+82-10-8860-6683', href: 'tel:+821088606683' },
  { id: 'form', type: 'form', world: [-78, 112, 250], text: 'interested in working with me?' },
  { id: 'copyright', type: 'copyright', world: [-180, 62, -100], text: 'VerdantWeb · Yujun Piao · 2026' },
]
